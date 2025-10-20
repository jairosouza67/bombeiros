import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Trash2, Video } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  module: string;
  duration: number;
  release_timestamp: string;
  video_url: string; // Added video_url field
}

export default function LessonEditor() {
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
  });

  useEffect(() => {
    if (!loading && (!user || !isKeyUser)) {
      navigate('/dashboard');
    }
  }, [user, loading, isKeyUser, navigate]);

  // Fetch existing lesson data if editing
  const { data: existingLesson, isLoading: isLessonLoading } = useQuery<Lesson>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
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
    setLessonData(prev => ({
      ...prev,
      [id]: id === 'duration' ? parseInt(value) || 0 : value,
    }));
  };

  const saveLesson = useMutation({
    mutationFn: async (data: Partial<Lesson>) => {
      const releaseDate = new Date(data.release_timestamp!);
      const payload = {
        title: data.title!,
        description: data.description || '',
        module: data.module!,
        duration: data.duration || 30,
        video_url: data.video_url || '',
        release_timestamp: releaseDate.toISOString(),
        release_time: releaseDate.toTimeString().slice(0, 8),
        mindful_video_url: data.video_url || '',
      };

      if (lessonId) {
        const { data: updatedData, error } = await supabase
          .from('lessons')
          .update(payload)
          .eq('id', lessonId)
          .select()
          .single();
        if (error) throw error;
        return updatedData;
      } else {
        const { data: newData, error } = await supabase
          .from('lessons')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return newData;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      toast({
        title: "Sucesso!",
        description: `Aula ${lessonId ? 'atualizada' : 'criada'} com sucesso.`,
      });
      if (!lessonId) {
        navigate(`/editor/lesson/${data.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async () => {
      if (!lessonId) return;
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast({
        title: "Sucesso!",
        description: "Aula excluída com sucesso.",
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!lessonData.title || !lessonData.description || !lessonData.module || !lessonData.release_timestamp) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Título, Descrição, Módulo e Data de Lançamento.",
        variant: "destructive",
      });
      return;
    }
    saveLesson.mutate(lessonData);
  };

  if (loading || isLessonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 overflow-y-auto pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {lessonId ? 'Editar Aula' : 'Criar Nova Aula'}
          </h1>
          <div className="flex gap-2">
            {lessonId && (
              <Button variant="destructive" onClick={() => deleteLesson.mutate()} disabled={deleteLesson.isPending}>
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
            <Button onClick={handleSave} disabled={saveLesson.isPending}>
              <Save className="h-5 w-5 mr-2" />
              {saveLesson.isPending ? 'Salvando...' : 'Salvar Aula'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={lessonData.title || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={lessonData.description || ''} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module">Módulo</Label>
                <Input id="module" value={lessonData.module || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min)</Label>
                <Input id="duration" type="number" value={lessonData.duration || 0} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_timestamp">Data/Hora de Lançamento</Label>
                <Input id="release_timestamp" type="datetime-local" value={lessonData.release_timestamp || ''} onChange={handleChange} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Conteúdo de Vídeo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video_url">URL do Vídeo (YouTube, Vimeo, etc.)</Label>
              <Input 
                id="video_url" 
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                value={lessonData.video_url || ''} 
                onChange={handleChange} 
              />
            </div>
            {lessonData.video_url && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Pré-visualização (Embed)</h3>
                {/* 
                  NOTA: Para uma pré-visualização funcional, seria necessário um componente que 
                  converte a URL bruta (YouTube, Vimeo) em um iframe embeddable. 
                  Por enquanto, apenas exibimos a URL.
                */}
                <p className="text-sm text-muted-foreground break-all">{lessonData.video_url}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}