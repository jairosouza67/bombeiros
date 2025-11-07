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
import { ArrowLeft, Save, Trash2, Video, FileText, Image } from 'lucide-react';

interface Aula {
  id: string;
  title: string;
  module: string;
  description: string;
  video_url: string;
  mindful_video_url: string;
  duration: number;
  release_timestamp: string;
  pdf_url?: string;
  image_url?: string;
}

export default function AulasEditor() {
  const { user, loading, isKeyUser } = useAuth();
  const navigate = useNavigate();
  const { aulaId } = useParams<{ aulaId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [aulaData, setAulaData] = useState<Partial<Aula>>({
    title: '',
    module: '',
    description: '',
    video_url: '',
    mindful_video_url: '',
    duration: 10,
    release_timestamp: new Date().toISOString().slice(0, 16),
    pdf_url: '',
    image_url: '',
  });

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isKeyUser)) {
      navigate('/aulas');
    }
  }, [user, loading, isKeyUser, navigate]);

  // Fetch existing aula data if editing
  const { data: existingAula, isLoading: isAulaLoading } = useQuery<Aula>({
    queryKey: ['aula', aulaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('id', aulaId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!aulaId,
  });

  useEffect(() => {
    if (existingAula) {
      setAulaData({
        ...existingAula,
        release_timestamp: new Date(existingAula.release_timestamp).toISOString().slice(0, 16),
      });
    }
  }, [existingAula]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setAulaData(prev => ({
      ...prev,
      [id]: id === 'duration' ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileUpload = async (file: File, type: 'pdf' | 'image') => {
    if (!file) return;

    const setUploading = type === 'pdf' ? setUploadingPdf : setUploadingImage;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `aulas/${type}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

      setAulaData(prev => ({
        ...prev,
        [`${type}_url`]: publicUrl,
      }));

      toast({
        title: "Upload realizado!",
        description: `${type === 'pdf' ? 'PDF' : 'Imagem'} enviado com sucesso.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro no upload",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveAula = useMutation({
    mutationFn: async (data: Partial<Aula>) => {
      const releaseDate = new Date(data.release_timestamp!);
      const payload = {
        title: data.title!,
        module: data.module || '',
        description: data.description || '',
        video_url: data.video_url || '',
        mindful_video_url: data.mindful_video_url || '',
        duration: data.duration || 10,
        pdf_url: data.pdf_url || null,
        image_url: data.image_url || null,
        release_timestamp: releaseDate.toISOString(),
        release_time: releaseDate.toTimeString().slice(0, 8),
      };

      if (aulaId) {
        const { data: updatedData, error } = await supabase
          .from('aulas')
          .update(payload)
          .eq('id', aulaId)
          .select()
          .single();
        if (error) throw error;
        return updatedData;
      } else {
        const { data: newData, error } = await supabase
          .from('aulas')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return newData;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
      queryClient.invalidateQueries({ queryKey: ['aula', aulaId] });
      toast({
        title: "Sucesso!",
        description: `Aula ${aulaId ? 'atualizada' : 'criada'} com sucesso.`,
      });
      if (!aulaId) {
        navigate(`/editor/aulas/${data.id}`);
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

  const deleteAula = useMutation({
    mutationFn: async () => {
      if (!aulaId) return;
      const { error } = await supabase
        .from('aulas')
        .delete()
        .eq('id', aulaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas'] });
      toast({
        title: "Sucesso!",
        description: "Aula excluída com sucesso.",
      });
      navigate('/aulas');
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
    if (!aulaData.title || !aulaData.module || !aulaData.release_timestamp) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Título, Módulo e Data de Lançamento.",
        variant: "destructive",
      });
      return;
    }
    saveAula.mutate(aulaData);
  };

  if (loading || isAulaLoading) {
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
          <Button variant="ghost" onClick={() => navigate('/aulas')}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {aulaId ? 'Editar Aula' : 'Criar Nova Aula'}
          </h1>
          <div className="flex gap-2">
            {aulaId && (
              <Button variant="destructive" onClick={() => deleteAula.mutate()} disabled={deleteAula.isPending}>
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
            <Button onClick={handleSave} disabled={saveAula.isPending}>
              <Save className="h-5 w-5 mr-2" />
              {saveAula.isPending ? 'Salvando...' : 'Salvar Aula'}
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
              <Input id="title" value={aulaData.title || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module">Módulo</Label>
              <Input id="module" value={aulaData.module || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={aulaData.description || ''} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min)</Label>
                <Input id="duration" type="number" value={aulaData.duration || 0} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_timestamp">Data/Hora de Lançamento</Label>
                <Input id="release_timestamp" type="datetime-local" value={aulaData.release_timestamp || ''} onChange={handleChange} required />
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
              <Label htmlFor="video_url">URL do Vídeo Principal (YouTube, Vimeo, etc.)</Label>
              <Input
                id="video_url"
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                value={aulaData.video_url || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mindful_video_url">URL do Vídeo Mindful (opcional)</Label>
              <Input
                id="mindful_video_url"
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                value={aulaData.mindful_video_url || ''}
                onChange={handleChange}
              />
            </div>
            {aulaData.video_url && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Pré-visualização (Embed)</h3>
                <p className="text-sm text-muted-foreground break-all">{aulaData.video_url}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Conteúdo de PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf_url">URL do PDF</Label>
              <Input
                id="pdf_url"
                placeholder="Ex: https://example.com/document.pdf"
                value={aulaData.pdf_url || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Ou faça upload de um arquivo PDF</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'pdf');
                }}
                disabled={uploadingPdf}
              />
              {uploadingPdf && <p className="text-sm text-muted-foreground">Enviando PDF...</p>}
            </div>
            {aulaData.pdf_url && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Pré-visualização</h3>
                <a href={aulaData.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Visualizar PDF
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Conteúdo de Imagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                placeholder="Ex: https://example.com/image.jpg"
                value={aulaData.image_url || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Ou faça upload de uma imagem</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'image');
                }}
                disabled={uploadingImage}
              />
              {uploadingImage && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
            </div>
            {aulaData.image_url && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Pré-visualização</h3>
                <img src={aulaData.image_url} alt="Preview" className="max-w-full h-auto rounded" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}