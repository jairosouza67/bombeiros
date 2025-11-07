import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Trash2, Video, FileText, Image as ImageIcon, Loader2, XCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  module: string;
  duration: number;
  release_timestamp: string;
  video_url: string;
  pdf_url: string | null;
  image_url: string | null;
}

const getStoragePath = (url: string | null): string => {
  if (!url) return '';
  try {
    const urlObject = new URL(url);
    // Pathname is like /storage/v1/object/public/lesson_content/file_path
    const pathParts = urlObject.pathname.split('/lesson_content/');
    return pathParts[1] || '';
  } catch (e) {
    return '';
  }
};

export default function DailyContactEditor() {
  const { user, loading, isKeyUser } = useAuth();
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [lessonData, setLessonData] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    module: '',
    duration: 30,
    release_timestamp: new Date().toISOString().slice(0, 16),
    video_url: '',
    pdf_url: null,
    image_url: null,
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isKeyUser)) {
      navigate('/dashboard');
    }
  }, [user, loading, isKeyUser, navigate]);

  const { data: existingLesson, isLoading: isLessonLoading } = useQuery<Lesson>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  useEffect(() => {
    if (existingLesson) {
      setLessonData({
        ...existingLesson,
        release_timestamp: new Date(existingLesson.release_timestamp).toISOString().slice(0, 16),
      });
    }
  }, [existingLesson]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setLessonData(prev => ({ ...prev, [id]: id === 'duration' ? parseInt(value) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'pdf') setPdfFile(file);
    else setImageFile(file);
  };

  const saveLesson = useMutation({
    mutationFn: async (data: Partial<Lesson>) => {
      const releaseDate = new Date(data.release_timestamp!);
      const basePayload = {
        title: data.title!,
        description: data.description || '',
        module: data.module!,
        duration: data.duration || 30,
        video_url: data.video_url || '',
        release_timestamp: releaseDate.toISOString(),
        release_time: releaseDate.toTimeString().slice(0, 8),
        mindful_video_url: data.video_url || '',
      };

      let lessonRecord;
      if (lessonId) {
        const { data: updatedData, error } = await supabase.from('lessons').update(basePayload).eq('id', lessonId).select().single();
        if (error) throw error;
        lessonRecord = updatedData;
      } else {
        const { data: newData, error } = await supabase.from('lessons').insert([basePayload]).select().single();
        if (error) throw error;
        lessonRecord = newData;
      }

      const fileUpdatePayload: { pdf_url?: string; image_url?: string } = {};
      if (pdfFile) {
        const filePath = `${lessonRecord.id}/${pdfFile.name}`;
        const { error } = await supabase.storage.from('lesson_content').upload(filePath, pdfFile, { upsert: true });
        if (error) throw error;
        fileUpdatePayload.pdf_url = supabase.storage.from('lesson_content').getPublicUrl(filePath).data.publicUrl;
      }
      if (imageFile) {
        const filePath = `${lessonRecord.id}/${imageFile.name}`;
        const { error } = await supabase.storage.from('lesson_content').upload(filePath, imageFile, { upsert: true });
        if (error) throw error;
        fileUpdatePayload.image_url = supabase.storage.from('lesson_content').getPublicUrl(filePath).data.publicUrl;
      }

      if (Object.keys(fileUpdatePayload).length > 0) {
        const { data: finalData, error } = await supabase.from('lessons').update(fileUpdatePayload).eq('id', lessonRecord.id).select().single();
        if (error) throw error;
        return finalData;
      }
      return lessonRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', data.id] });
      toast({ title: "Sucesso!", description: `Daily Contact ${lessonId ? 'atualizado' : 'criado'}.` });
      if (!lessonId) navigate(`/editor/daily-contact/${data.id}`);
      setPdfFile(null);
      setImageFile(null);
    },
    onError: (error: Error) => toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }),
  });

  const deleteLesson = useMutation({
    mutationFn: async () => {
      if (!lessonId) return;
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast({ title: "Sucesso!", description: "Daily Contact excluído." });
      navigate('/dashboard');
    },
    onError: (error: Error) => toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" }),
  });

  const removeFile = useMutation({
    mutationFn: async ({ type, url }: { type: 'pdf' | 'image', url: string }) => {
      if (!lessonId) return;
      const path = getStoragePath(url);
      if (!path) throw new Error("Caminho do arquivo inválido.");
      
      const { error: removeError } = await supabase.storage.from('lesson_content').remove([path]);
      if (removeError) throw removeError;

      const payload = type === 'pdf' ? { pdf_url: null } : { image_url: null };
      const { error: updateError } = await supabase.from('lessons').update(payload).eq('id', lessonId);
      if (updateError) throw updateError;
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      toast({ title: "Sucesso!", description: `${type === 'pdf' ? 'PDF' : 'Imagem'} removido(a).` });
    },
    onError: (error: Error) => toast({ title: "Erro ao remover", description: error.message, variant: "destructive" }),
  });

  const handleSave = () => {
    if (!lessonData.title || !lessonData.module || !lessonData.release_timestamp) {
      toast({ title: "Campos obrigatórios", description: "Preencha Título, Módulo e Data.", variant: "destructive" });
      return;
    }
    saveLesson.mutate(lessonData);
  };

  if (loading || isLessonLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 overflow-y-auto pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5 mr-2" />Voltar</Button>
          <h1 className="text-2xl font-bold">{lessonId ? 'Editar' : 'Criar'} Daily Contact</h1>
          <div className="flex gap-2">
            {lessonId && <Button variant="destructive" onClick={() => deleteLesson.mutate()} disabled={deleteLesson.isPending}><Trash2 className="h-5 w-5" /></Button>}
            <Button onClick={handleSave} disabled={saveLesson.isPending}>
              {saveLesson.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Detalhes do Daily Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="title">Título</Label><Input id="title" value={lessonData.title || ''} onChange={handleChange} required /></div>
            <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" value={lessonData.description || ''} onChange={handleChange} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label htmlFor="module">Módulo</Label><Input id="module" value={lessonData.module || ''} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="duration">Duração (min)</Label><Input id="duration" type="number" value={lessonData.duration || 0} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="release_timestamp">Data/Hora</Label><Input id="release_timestamp" type="datetime-local" value={lessonData.release_timestamp || ''} onChange={handleChange} required /></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Video />Conteúdo de Vídeo</CardTitle></CardHeader><CardContent><Label htmlFor="video_url">URL do Vídeo</Label><Input id="video_url" placeholder="https://youtube.com/..." value={lessonData.video_url || ''} onChange={handleChange} /></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText />Conteúdo PDF</CardTitle></CardHeader><CardContent className="space-y-4">
            <Label htmlFor="pdf_upload">Upload de PDF</Label><Input id="pdf_upload" type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'pdf')} />
            {lessonData.pdf_url && <div className="p-2 border rounded-md flex items-center justify-between"><a href={lessonData.pdf_url} target="_blank" rel="noreferrer" className="text-sm truncate hover:underline">{lessonData.pdf_url.split('/').pop()}</a><Button variant="ghost" size="icon" onClick={() => removeFile.mutate({ type: 'pdf', url: lessonData.pdf_url! })} disabled={removeFile.isPending}><XCircle className="h-4 w-4" /></Button></div>}
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon />Conteúdo de Imagem</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="image_upload">Upload de Imagem</Label><Input id="image_upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
            {lessonData.image_url && <div className="relative group"><img src={lessonData.image_url} alt="Preview" className="rounded-md max-h-60 w-auto" /><Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFile.mutate({ type: 'image', url: lessonData.image_url! })} disabled={removeFile.isPending}><Trash2 className="h-4 w-4" /></Button></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}