import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, User, LogOut, PlusCircle, Home, BookOpen, Wind, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Início', icon: Home, path: '/dashboard' },
  { name: 'Aulas', icon: BookOpen, path: '/lessons' },
  { name: 'Flow', icon: Wind, path: '/mindful' },
  { name: 'Músicas', icon: Music2, path: '/music' },
  { name: 'Perfil', icon: User, path: '/profile' },
];

export default function Dashboard() {
  const { user, loading, signOut, isKeyUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
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

  // --- Data Fetching for Lessons Progress ---
  const { data: progress } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: lessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('release_timestamp', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // --- Data Fetching for Music Progress ---
  const { data: musicProgress } = useQuery({
    queryKey: ['music_progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('music_progress')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: mindfulMusic } = useQuery({
    queryKey: ['mindful_music'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mindful_music')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  const completedLessons = progress?.filter(p => p.is_completed).length || 0;
  const totalLessons = lessons?.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const completedMusic = musicProgress?.filter(p => p.is_completed).length || 0;
  const totalMusic = mindfulMusic?.length || 0;
  const musicProgressPercentage = totalMusic > 0 ? (completedMusic / totalMusic) * 100 : 0;


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
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(isActive ? "text-primary" : "text-muted-foreground")}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {isKeyUser && (
              <Button variant="secondary" size="sm" onClick={() => navigate('/editor/lesson')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar Aula
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="hidden md:inline-flex">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Bem-vindo, {profile?.name || 'Cadete'}!</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Aulas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Aulas</CardTitle>
              </div>
              <CardDescription>Continue suas missões de aprendizado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{completedLessons}/{totalLessons}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <Button className="w-full" onClick={() => navigate('/lessons')}>
                  Ir para Aulas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Mindful Flow */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-accent" />
                <CardTitle>Mindful Flow</CardTitle>
              </div>
              <CardDescription>Respire e mantenha o foco</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Pratique mindfulness para manter a calma em situações de emergência.
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/mindful')}>
                  Iniciar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Músicas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Music2 className="h-5 w-5 text-primary" />
                <CardTitle>Músicas</CardTitle>
              </div>
              <CardDescription>Sons para fixar o conhecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{completedMusic}/{totalMusic}</span>
                  </div>
                  <Progress value={musicProgressPercentage} className="h-2 bg-primary/20" indicatorClassName="bg-primary" />
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/music')}>
                  Ouvir Músicas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Missões</CardTitle>
            <CardDescription>Aulas agendadas para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {lessons && lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.slice(0, 3).map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-semibold">{lesson.title}</h4>
                      <p className="text-sm text-muted-foreground">{lesson.module}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lesson.release_time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma aula disponível ainda
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}