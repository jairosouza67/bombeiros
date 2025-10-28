import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Video, Loader2, Wind } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PictureInPictureButton } from '@/components/PictureInPictureButton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

type Lesson = Tables<'lessons'>;
type Progress = Tables<'progress'>;

// Helper function to convert YouTube/Vimeo URL to embed URL
const getEmbedUrl = (url: string) => {
  if (!url) return null;
  
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&enablejsapi=1`;
  }

  return url;
};

export default function DailyContactDetail() {
  const { lessonId } = useParams<{ lessonId: string }>();
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

  // 1. Fetch CURRENT Lesson Details
  const { data: lesson, isLoading: lessonLoading } = useQuery<Lesson>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error("Lesson ID is missing.");
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

  // 2. Fetch ALL Lessons for the sidebar
  const { data: allLessons, isLoading: allLessonsLoading } = useQuery<Lesson[]>({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('module', { ascending: true })
        .order('release_timestamp', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // 3. Fetch ALL User Progress
  const { data: allProgress, isLoading: progressLoading } = useQuery<Progress[]>({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const completedLessonIds = useMemo(() => {
    if (!allProgress) return new Set();
    return new Set(allProgress.filter(p => p.is_completed).map(p => p.lesson_id));
  }, [allProgress]);

  const currentProgress = useMemo(() => allProgress?.find(p => p.lesson_id === lessonId), [allProgress, lessonId]);
  const isCompleted = currentProgress?.is_completed ?? false;
  const isMindfulCompleted = currentProgress?.mindful_completed ?? false;

  // Group lessons by module for the accordion
  const lessonsByModule = useMemo(() => {
    if (!allLessons) return {};
    return allLessons.reduce((acc, lesson) => {
      const moduleName = lesson.module || 'Outros';
      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }
      acc[moduleName].push(lesson);
      return acc;
    }, {} as Record<string, Lesson[]>);
  }, [allLessons]);

  // Mutation to Mark Lesson as Completed
  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      if (!user || !lessonId) throw new Error("User or Lesson ID missing.");
      const payload = { is_completed: true, completed_at: new Date().toISOString() };
      if (currentProgress) {
        const { error } = await supabase.from('progress').update(payload).eq('id', currentProgress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('progress').insert({ user_id: user.id, lesson_id: lessonId, ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', user?.id] });
      toast({ title: "Daily Contact Concluído!", description: "Parabéns, você completou o Daily Contact principal." });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar progresso", description: error.message, variant: "destructive" });
    }
  });

  if (authLoading || lessonLoading || progressLoading || allLessonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <div className="animate-pulse">Carregando Daily Contact...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-3xl font-bold mb-4">Daily Contact Não Encontrado</h1>
        <Button onClick={() => navigate('/daily-contact')}>Voltar para o Catálogo</Button>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(lesson.video_url);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/daily-contact')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Daily Contact
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Video Player and Details */}
          <div className="w-full lg:w-2/3 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-primary">{lesson.title}</h1>
              <p className="text-lg text-muted-foreground">{lesson.module} | Duração: {lesson.duration} min</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-primary" />Vídeo Principal</CardTitle>
                  <PictureInPictureButton videoElement={null} />
                </div>
              </CardHeader>
              <CardContent>
                {embedUrl ? (
                  <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
                    <iframe ref={videoRef} className="absolute top-0 left-0 w-full h-full" src={embedUrl} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen frameBorder="0"></iframe>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-muted rounded-lg"><p className="text-muted-foreground">URL de vídeo inválida.</p></div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Descrição do Daily Contact</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{lesson.description}</p>
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className={cn("flex items-center gap-2 font-semibold", isCompleted ? "text-green-600" : "text-primary")}><CheckCircle className="h-5 w-5" />Status: {isCompleted ? 'Concluído' : 'Pendente'}</div>
                  <Button onClick={() => completeLessonMutation.mutate()} disabled={isCompleted || completeLessonMutation.isPending} className={cn("w-full sm:w-auto", isCompleted ? "bg-green-600 hover:bg-green-700" : "")}>
                    {completeLessonMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : isCompleted ? <><CheckCircle className="h-4 w-4 mr-2" />Concluído</> : 'Marcar como Concluído'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={cn("border-accent/50", isMindfulCompleted ? "bg-accent/10" : "bg-card")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5 text-accent" />Mindful Flow Relacionado</CardTitle>
                <CardDescription>Sessão de foco e respiração para consolidar o aprendizado.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className={cn("font-medium", isMindfulCompleted ? "text-accent" : "text-muted-foreground")}>Status: {isMindfulCompleted ? 'Concluído' : 'Pendente'}</span>
                <Button variant="secondary" onClick={() => navigate('/mindful')}>Ir para o Flow</Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Lesson List Sidebar */}
          <div className="w-full lg:w-1/3">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Daily Contacts</CardTitle>
                <CardDescription>Navegue por todos os Daily Contacts.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  <Accordion type="single" collapsible defaultValue={lesson.module || 'Outros'}>
                    {Object.entries(lessonsByModule).map(([moduleName, lessonsInModule]) => (
                      <AccordionItem value={moduleName} key={moduleName}>
                        <AccordionTrigger>{moduleName}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {lessonsInModule.map(item => (
                              <Button key={item.id} variant={item.id === lessonId ? 'secondary' : 'ghost'} className="w-full justify-between h-auto py-2" onClick={() => navigate(`/daily-contact/${item.id}`)}>
                                <span className="text-left whitespace-normal">{item.title}</span>
                                {completedLessonIds.has(item.id) ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" /> : <div className="w-4 h-4 flex-shrink-0 ml-2" />}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}