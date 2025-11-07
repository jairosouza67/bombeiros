import { useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Settings, BarChart, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/navItems';

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, role')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch all content types to get their durations
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => (await supabase.from('lessons').select('id, duration')).data,
  });
  const { data: mindfulFlows, isLoading: flowsLoading } = useQuery({
    queryKey: ['mindful_flows'],
    queryFn: async () => (await supabase.from('mindful_flows').select('id, duration')).data,
  });
  const { data: mindfulMusic, isLoading: musicLoading } = useQuery({
    queryKey: ['mindful_music'],
    queryFn: async () => (await supabase.from('mindful_music').select('id, duration')).data,
  });

  // Fetch all progress types
  const { data: lessonProgress, isLoading: lessonProgressLoading } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => (await supabase.from('progress').select('lesson_id, is_completed').eq('user_id', user!.id)).data,
    enabled: !!user,
  });
  const { data: mindfulProgress, isLoading: mindfulProgressLoading } = useQuery({
    queryKey: ['mindful_progress', user?.id],
    queryFn: async () => (await supabase.from('mindful_progress').select('flow_id, is_completed').eq('user_id', user!.id)).data,
    enabled: !!user,
  });
  const { data: musicProgress, isLoading: musicProgressLoading } = useQuery({
    queryKey: ['music_progress', user?.id],
    queryFn: async () => (await supabase.from('music_progress').select('music_id, is_completed').eq('user_id', user!.id)).data,
    enabled: !!user,
  });

  const completedLessons = lessonProgress?.filter(p => p.is_completed).length || 0;

  const totalStudyTime = useMemo(() => {
    if (!lessons || !lessonProgress || !mindfulFlows || !mindfulProgress || !mindfulMusic || !musicProgress) {
      return 0;
    }

    const completedLessonIds = new Set(lessonProgress.filter(p => p.is_completed).map(p => p.lesson_id));
    const lessonTime = lessons
      .filter(l => completedLessonIds.has(l.id))
      .reduce((sum, l) => sum + (l.duration || 0), 0);

    const completedFlowIds = new Set(mindfulProgress.filter(p => p.is_completed).map(p => p.flow_id));
    const flowTime = mindfulFlows
      .filter(f => completedFlowIds.has(f.id))
      .reduce((sum, f) => sum + (f.duration || 0), 0);

    const completedMusicIds = new Set(musicProgress.filter(p => p.is_completed).map(p => p.music_id));
    const musicTime = mindfulMusic
      .filter(m => completedMusicIds.has(m.id))
      .reduce((sum, m) => sum + (m.duration || 0), 0);

    return lessonTime + flowTime + musicTime;
  }, [lessons, lessonProgress, mindfulFlows, mindfulProgress, mindfulMusic, musicProgress]);

  const isDataLoading = loading || profileLoading || lessonsLoading || flowsLoading || musicLoading || lessonProgressLoading || mindfulProgressLoading || musicProgressLoading;

  if (isDataLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-0">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Bombeiro Bilíngue</h1>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(isActive ? "text-primary" : "text-muted-foreground")}
                  >
                    <Link to={item.path}>
                      {typeof Icon === 'string' ? (
                        <span className="h-4 w-4 mr-2 text-base">{Icon}</span>
                      ) : (
                        <Icon className="h-4 w-4 mr-2" />
                      )}
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Seu Perfil</h2>
          <p className="text-muted-foreground">Gerencie suas informações e veja seu progresso.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1: Informações Pessoais */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações Pessoais</CardTitle>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
              <CardDescription>Detalhes da sua conta e contato.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Nome:</span>
                <span>{profile?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Função:</span>
                <span>{profile?.role === 'key_user' ? 'Instrutor/Admin' : 'Aluno'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Membro Desde:</span>
                <span>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Estatísticas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                <CardTitle>Estatísticas</CardTitle>
              </div>
              <CardDescription>Seu desempenho no aprendizado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Daily Contacts Concluídos:</span>
                <span className="text-lg font-bold text-primary">{completedLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tempo de Estudo:</span>
                <span className="text-lg font-bold">{totalStudyTime} min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}