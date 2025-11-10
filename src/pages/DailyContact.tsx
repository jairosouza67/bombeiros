import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, User, LogOut, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/navItems';

export default function DailyContact() {
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
        <div className="animate-pulse">Carregando Daily Contacts...</div>
      </div>
    );
  }

  const getProgress = (lessonId: string) => {
    return progress?.find((p) => p.lesson_id === lessonId);
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

            {/* Desktop Navigation Links - igual Flow */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'rounded-full px-4',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/30 shadow-sm'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    )}
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="hidden md:inline-flex text-muted-foreground hover:text-primary"
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Catálogo de Daily Contact
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Contatos diários em inglês para manter o ritmo. Layout alinhado com Flow para uma experiência coesa.
            </p>
          </div>
          {isKeyUser && (
            <Button
              onClick={() => navigate('/editor/daily-contact')}
              className="self-start md:self-auto rounded-full px-5"
            >
              Adicionar Daily Contact
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
                    'group relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 rounded-2xl',
                    isCompleted && 'border-green-500/60 bg-green-500/5'
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-accent/60 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between gap-2 text-base md:text-lg">
                      <span className="line-clamp-1">{lesson.title}</span>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-3">
                      {lesson.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>Duração: {lesson.duration} min</span>
                      <span>
                        Lançamento:{' '}
                        {new Date(lesson.release_timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span
                        className={cn(
                          'text-[10px] px-2 py-1 rounded-full border',
                          isMindfulCompleted
                            ? 'bg-accent/10 text-accent border-accent/40'
                            : 'bg-muted text-muted-foreground border-transparent'
                        )}
                      >
                        Flow: {isMindfulCompleted ? 'Concluído' : 'Pendente'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 rounded-full text-xs"
                        onClick={() => navigate(`/daily-contact/${lesson.id}`)}
                      >
                        Ver detalhes
                      </Button>
                      {isKeyUser && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/editor/daily-contact/${lesson.id}`);
                          }}
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-12 text-sm">
              Nenhum Daily Contact disponível no momento.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
