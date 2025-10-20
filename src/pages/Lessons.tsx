import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, BookOpen, User, LogOut, Home, Wind, Music2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Início', icon: Home, path: '/dashboard' },
  { name: 'Aulas', icon: BookOpen, path: '/lessons' },
  { name: 'Flow', icon: Wind, path: '/mindful' },
  { name: 'Músicas', icon: Music2, path: '/music' },
  { name: 'Perfil', icon: User, path: '/profile' },
];

export default function Lessons() {
  const { user, loading, signOut, isKeyUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
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

  const { data: progress, isLoading: progressLoading } = useQuery({
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

  if (loading || !user || lessonsLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando aulas...</div>
      </div>
    );
  }

  const getProgress = (lessonId: string) => {
    return progress?.find(p => p.lesson_id === lessonId);
  };

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

            {/* Desktop Navigation Links (New) */}
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Catálogo de Missões (Aulas)</h2>
          {isKeyUser && (
            <Button onClick={() => navigate('/editor/lesson')}>
              Adicionar Aula
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson) => {
              const lessonProgress = getProgress(lesson.id);
              const isCompleted = lessonProgress?.is_completed;
              const isMindfulCompleted = lessonProgress?.mindful_completed;

              return (
                <Card 
                  key={lesson.id} 
                  className={cn(
                    "hover:shadow-lg transition-shadow",
                    isCompleted ? "border-green-500/50 bg-green-500/5" : "border-border"
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {lesson.title}
                      {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>{lesson.module}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Duração: {lesson.duration} min</span>
                      <span>Lançamento: {new Date(lesson.release_timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={cn("text-xs px-2 py-1 rounded-full", isMindfulCompleted ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground")}>
                        Flow: {isMindfulCompleted ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1" onClick={() => navigate(`/lessons/${lesson.id}`)}>
                        Ver Detalhes
                      </Button>
                      {isKeyUser && (
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/editor/lesson/${lesson.id}`);
                        }}>
                          Editar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-12">
              Nenhuma aula disponível no momento.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}