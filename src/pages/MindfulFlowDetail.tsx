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

type MindfulFlow = Tables<'mindful_flows'>;
type MindfulProgress = Tables<'mindful_progress'>;

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

export default function MindfulFlowDetail() {
  const { flowId } = useParams<{ flowId: string }>();
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

  // 1. Fetch Flow Details
  const { data: flow, isLoading: flowLoading } = useQuery<MindfulFlow>({
    queryKey: ['mindful_flow', flowId],
    queryFn: async () => {
      if (!flowId) throw new Error("Flow ID is missing.");
      const { data, error } = await supabase
        .from('mindful_flows')
        .select('*')
        .eq('id', flowId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!flowId,
  });

  // 2. Fetch User Progress for this Flow
  const { data: progress, isLoading: progressLoading } = useQuery<MindfulProgress[]>({
    queryKey: ['mindful_progress', user?.id, flowId],
    queryFn: async () => {
      if (!user || !flowId) return [];
      const { data, error } = await supabase
        .from('mindful_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flow_id', flowId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!flowId,
  });

  const currentProgress = useMemo(() => progress?.[0], [progress]);
  const isCompleted = currentProgress?.is_completed ?? false;

  // 3. Mutation to Mark Flow as Completed
  const completeFlowMutation = useMutation({
    mutationFn: async () => {
      if (!user || !flowId) throw new Error("User or Flow ID missing.");

      const payload = {
        is_completed: true,
        completed_at: new Date().toISOString(),
      };

      if (currentProgress) {
        // Update existing progress record
        const { error } = await supabase
          .from('mindful_progress')
          .update(payload)
          .eq('id', currentProgress.id);
        if (error) throw error;
      } else {
        // Insert new progress record
        const { error } = await supabase
          .from('mindful_progress')
          .insert({
            user_id: user.id,
            flow_id: flowId,
            ...payload
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindful_progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['mindful_flows'] });
      toast({
        title: "Flow Concluído!",
        description: "Parabéns, você completou esta sessão de mindful flow.",
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

  if (authLoading || flowLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <div className="animate-pulse">Carregando flow...</div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-3xl font-bold mb-4">Flow Não Encontrado</h1>
        <Button onClick={() => navigate('/mindful')}>Voltar para Flows</Button>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(flow.video_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-0">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/mindful')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Flows
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-primary">{flow.title}</h1>
          <p className="text-lg text-muted-foreground">Duração: {flow.duration} min</p>
        </div>

        {/* Video Player Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Vídeo do Flow
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
                  title={flow.title}
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
            <p className="text-muted-foreground">{flow.description}</p>
            
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className={cn("flex items-center gap-2 font-semibold", isCompleted ? "text-green-600" : "text-primary")}>
                <CheckCircle className="h-5 w-5" />
                Status: {isCompleted ? 'Concluído' : 'Pendente'}
              </div>
              
              <Button 
                onClick={() => completeFlowMutation.mutate()}
                disabled={isCompleted || completeFlowMutation.isPending}
                className={cn("w-full sm:w-auto", isCompleted ? "bg-green-600 hover:bg-green-700" : "")}
              >
                {completeFlowMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Flow Concluído
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