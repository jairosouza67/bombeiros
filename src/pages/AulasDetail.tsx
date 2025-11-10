import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Video, Loader2, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PictureInPictureButton } from '@/components/PictureInPictureButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrientation } from '@/hooks/useOrientation';

type Aula = Tables<'aulas'>;
type AulasProgress = Tables<'aulas_progress'>;

const getEmbedUrl = (url: string) => {
  if (!url) return null;

  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&enablejsapi=1`;
  }

  return url;
};

export default function AulasDetail() {
  const { aulaId } = useParams<{ aulaId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLIFrameElement>(null);
  const orientation = useOrientation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const { data: aula, isLoading: aulaLoading } = useQuery<Aula>({
    queryKey: ['aula', aulaId],
    queryFn: async () => {
      if (!aulaId) throw new Error("Aula ID is missing.");
      const { data, error } = await supabase.from('aulas').select('*').eq('id', aulaId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!aulaId,
  });

  const { data: allAulas, isLoading: allAulasLoading } = useQuery<Aula[]>({
    queryKey: ['aulas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('aulas').select('*').order('release_timestamp', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: allProgress, isLoading: progressLoading } = useQuery<AulasProgress[]>({
    queryKey: ['aulas_progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('aulas_progress').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const completedAulasIds = useMemo(() => {
    if (!allProgress) return new Set();
    return new Set(allProgress.filter(p => p.is_completed).map(p => p.aula_id));
  }, [allProgress]);

  const currentProgress = useMemo(() => allProgress?.find(p => p.aula_id === aulaId), [allProgress, aulaId]);
  const isCompleted = currentProgress?.is_completed ?? false;

  const completeAulaMutation = useMutation({
    mutationFn: async () => {
      if (!user || !aulaId) throw new Error("User or Aula ID missing.");
      const payload = { is_completed: true, completed_at: new Date().toISOString() };
      if (currentProgress) {
        const { error } = await supabase.from('aulas_progress').update(payload).eq('id', currentProgress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('aulas_progress').insert({ user_id: user.id, aula_id: aulaId, ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aulas_progress', user?.id] });
      toast({ title: "Aula Concluída!", description: "Parabéns, você completou esta aula." });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar progresso", description: error.message, variant: "destructive" });
    }
  });

  if (authLoading || aulaLoading || progressLoading || allAulasLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <div className="animate-pulse">Carregando aula...</div>
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-3xl font-bold mb-4">Aula Não Encontrada</h1>
        <Button onClick={() => navigate('/aulas')}>Voltar para Aulas</Button>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(aula.video_url);

  return (
    <div className={cn(
      "min-h-screen bg-background",
      orientation === 'landscape' ? 'orientation-landscape' : 'orientation-portrait'
    )}>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 page-header">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/aulas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Aulas
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className={cn(
          "flex flex-col lg:flex-row gap-8 detail-layout",
          orientation === 'landscape' ? 'lg:flex-row' : ''
        )}>
          <div className={cn(
            "w-full lg:w-2/3 space-y-8 detail-main",
            orientation === 'landscape' ? 'lg:w-2/3' : ''
          )}>
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-primary page-title">{aula.title}</h1>
              <p className="text-lg text-muted-foreground">Duração: {aula.duration} min</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-primary" />Vídeo da Aula</CardTitle>
                  <PictureInPictureButton videoElement={null} />
                </div>
              </CardHeader>
              <CardContent>
                {embedUrl ? (
                  <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden video-container">
                    <iframe ref={videoRef} className="absolute top-0 left-0 w-full h-full" src={embedUrl} title={aula.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen frameBorder="0"></iframe>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-muted rounded-lg"><p className="text-muted-foreground">URL de vídeo inválida.</p></div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Descrição</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{aula.description}</p>
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className={cn("flex items-center gap-2 font-semibold", isCompleted ? "text-green-600" : "text-primary")}><CheckCircle className="h-5 w-5" />Status: {isCompleted ? 'Concluído' : 'Pendente'}</div>
                  <Button onClick={() => completeAulaMutation.mutate()} disabled={isCompleted || completeAulaMutation.isPending} className={cn("w-full sm:w-auto", isCompleted ? "bg-green-600 hover:bg-green-700" : "")}>
                    {completeAulaMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : isCompleted ? <><CheckCircle className="h-4 w-4 mr-2" />Concluído</> : 'Marcar como Concluído'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {aula.pdf_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Material de Apoio (PDF)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={aula.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Abrir PDF
                  </a>
                </CardContent>
              </Card>
            )}

            {aula.image_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    Imagem de Apoio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={aula.image_url} 
                    alt="Material de apoio" 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className={cn(
            "w-full lg:w-1/3 detail-sidebar",
            orientation === 'landscape' ? 'lg:w-1/3' : ''
          )}>
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Aulas</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-2">
                    {allAulas?.map(item => (
                      <Button key={item.id} variant={item.id === aulaId ? 'secondary' : 'ghost'} className="w-full justify-between h-auto py-2" onClick={() => navigate(`/aulas/${item.id}`)}>
                        <span className="text-left whitespace-normal">{item.title}</span>
                        {completedAulasIds.has(item.id) ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" /> : <div className="w-4 h-4 flex-shrink-0 ml-2" />}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
