import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Video, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PictureInPictureButton } from '@/components/PictureInPictureButton';

type MindfulMusic = Tables<'mindful_music'>;
type MusicProgress = Tables<'music_progress'>;

// Helper function to convert YouTube/Vimeo URL to embed URL
const getEmbedUrl = (url: string) => {
  if (!url) return null;
  
  // Basic YouTube conversion
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&enablejsapi=1`;
  }

  // Add more services (Vimeo, etc.) if needed later
  return url;
};

export default function MusicDetail() {
  const { musicId } = useParams<{ musicId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // 1. Fetch Music Details
  const { data: music, isLoading: musicLoading } = useQuery<MindfulMusic>({
    queryKey: ['mindful_music', musicId],
    queryFn: async () => {
      if (!musicId) throw new Error("Music ID is missing.");
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

  // 2. Fetch User Progress for this Music
  const { data: progress, isLoading: progressLoading } = useQuery<MusicProgress[]>({
    queryKey: ['music_progress', user?.id, musicId],
    queryFn: async () => {
      if (!user || !musicId) return [];
      const { data, error } = await supabase
        .from('music_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('music_id', musicId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!musicId,
  });

  const currentProgress = useMemo(() => progress?.[0], [progress]);
  const isCompleted = currentProgress?.is_completed ?? false;

  // 3. Mutation to Mark Music as Completed
  const completeMusicMutation = useMutation({
    mutationFn: async () => {
      if (!user || !musicId) throw new Error("User or Music ID missing.");

      const payload = {
        is_completed: true,
        completed_at: new Date().toISOString(),
      };

      if (currentProgress) {
        // Update existing progress record
        const { error } = await supabase
          .from('music_progress')
          .update(payload)
          .eq('id', currentProgress.id);
        if (error) throw error;
      } else {
        // Insert new progress record
        const { error } = await supabase
          .from('music_progress')
          .insert({
            user_id: user.id,
            music_id: musicId,
            ...payload
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['music_progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['mindful_music'] });
      toast({
        title: "Música Concluída!",
        description: "Parabéns, você concluiu esta sessão musical.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar progresso",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (authLoading || musicLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <div className="animate-pulse">Carregando música...</div>
      </div>
    );
  }

  if (!music) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-3xl font-bold mb-4">Música Não Encontrada</h1>
        <Button onClick={() => navigate('/music')}>Voltar para Músicas</Button>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(music.video_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-0">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/music')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Músicas
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-primary">{music.title}</h1>
          <p className="text-lg text-muted-foreground">Duração: {music.duration} min</p>
        </div>

        {/* Video Player Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Player
              </CardTitle>
              <PictureInPictureButton videoElement={null} />
            </div>
          </CardHeader>
          <CardContent>
            {embedUrl ? (
              <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
                <iframe
                  ref={videoRef}
                  className="absolute top-0 left-0 w-full h-full"
                  src={embedUrl}
                  title={music.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                ></iframe>
              </div>
            ) : (
              <div className="p-8 text-center bg-muted rounded-lg">
                <p className="text-muted-foreground">URL de vídeo inválida ou não fornecida.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description and Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{music.description}</p>
            
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className={cn("flex items-center gap-2 font-semibold", isCompleted ? "text-green-600" : "text-primary")}>
                <CheckCircle className="h-5 w-5" />
                Status: {isCompleted ? 'Concluído' : 'Pendente'}
              </div>
              
              <Button 
                onClick={() => completeMusicMutation.mutate()}
                disabled={isCompleted || completeMusicMutation.isPending}
                className={cn("w-full sm:w-auto", isCompleted ? "bg-green-600 hover:bg-green-700" : "")}
              >
                {completeMusicMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Música Concluída
                  </>
                ) : (
                  'Marcar como Concluído'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}