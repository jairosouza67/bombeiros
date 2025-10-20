import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MindfulMusic {
  id?: string;
  title: string;
  description: string;
  duration: number | null;
  video_url: string;
  release_timestamp: string;
  release_time: string | null;
}

export default function MusicEditor() {
  const { musicId } = useParams<{ musicId?: string }>();
  const { user, loading: authLoading, isKeyUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [music, setMusic] = useState<MindfulMusic>({
    title: '',
    description: '',
    duration: null,
    video_url: '',
    release_timestamp: new Date().toISOString().split('T')[0],
    release_time: null,
  });

  useEffect(() => {
    if (!authLoading && (!user || !isKeyUser)) {
      navigate('/music');
    }
  }, [user, authLoading, isKeyUser, navigate]);

  // Fetch existing music if editing
  const { data: existingMusic, isLoading: musicLoading } = useQuery({
    queryKey: ['mindful_music', musicId],
    queryFn: async () => {
      if (!musicId) return null;
      const { data, error } = await supabase
        .from('mindful_music')
        .select('*')
        .eq('id', musicId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!musicId,
  });

  useEffect(() => {
    if (existingMusic) {
      setMusic({
        id: existingMusic.id,
        title: existingMusic.title,
        description: existingMusic.description || '',
        duration: existingMusic.duration,
        video_url: existingMusic.video_url,
        release_timestamp: existingMusic.release_timestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
        release_time: existingMusic.release_time || null,
      });
    }
  }, [existingMusic]);

  const handleChange = (field: keyof MindfulMusic, value: string | number | null) => {
    setMusic(prev => ({ ...prev, [field]: value }));
  };

  // Save mutation
  const saveMusic = useMutation({
    mutationFn: async () => {
      const payload = {
        title: music.title,
        description: music.description,
        duration: music.duration,
        video_url: music.video_url,
        release_timestamp: music.release_timestamp,
        release_time: music.release_time,
      };

      if (musicId) {
        const { error } = await supabase
          .from('mindful_music')
          .update(payload)
          .eq('id', musicId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mindful_music')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindful_music'] });
      toast({
        title: "Sucesso!",
        description: `Música ${musicId ? 'atualizada' : 'criada'} com sucesso.`,
      });
      navigate('/music');
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMusic = useMutation({
    mutationFn: async () => {
      if (!musicId) throw new Error("ID da música não encontrado.");
      const { error } = await supabase
        .from('mindful_music')
        .delete()
        .eq('id', musicId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindful_music'] });
      toast({
        title: "Música Excluída",
        description: "A música foi removida com sucesso.",
      });
      navigate('/music');
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!music.title.trim() || !music.video_url.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o título e a URL do vídeo.",
        variant: "destructive"
      });
      return;
    }
    saveMusic.mutate();
  };

  if (authLoading || musicLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-0">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/music')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">{musicId ? 'Editar Música' : 'Nova Música'}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Música</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={music.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Relaxamento Profundo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={music.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrição da música..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={music.duration || ''}
                onChange={(e) => handleChange('duration', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Ex: 15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">URL do Vídeo/Áudio *</Label>
              <Input
                id="video_url"
                value={music.video_url}
                onChange={(e) => handleChange('video_url', e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="release_timestamp">Data de Lançamento</Label>
              <Input
                id="release_timestamp"
                type="date"
                value={music.release_timestamp}
                onChange={(e) => handleChange('release_timestamp', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="release_time">Horário de Lançamento (opcional)</Label>
              <Input
                id="release_time"
                type="time"
                value={music.release_time || ''}
                onChange={(e) => handleChange('release_time', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saveMusic.isPending} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {saveMusic.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          {musicId && (
            <Button variant="destructive" onClick={() => deleteMusic.mutate()} disabled={deleteMusic.isPending}>
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMusic.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          )}
        </div>

        {music.video_url && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={music.video_url}
                  title="Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
