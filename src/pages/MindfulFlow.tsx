import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Wind, User, LogOut, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/navItems';

export default function MindfulFlow() {
  const { user, loading, signOut, isKeyUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const { data: flows, isLoading: flowsLoading } = useQuery({
    queryKey: ['mindful_flows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mindful_flows')
        .select('*')
        .order('release_timestamp', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['mindful_progress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mindful_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (loading || !user || flowsLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  const getProgress = (flowId: string) => {
    return progress?.find((p) => p.flow_id === flowId);
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

            {/* Desktop Navigation Links - igual Aulas */}
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Mindful Flow</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Práticas guiadas para foco, calma e performance. Visual consistente com as Aulas para uma jornada fluida.
            </p>
          </div>
          {isKeyUser && (
            <Button
              onClick={() => navigate('/editor/flow')}
              className="self-start md:self-auto rounded-full px-5"
            >
              Adicionar Flow
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flows && flows.length > 0 ? (
            flows.map((flow) => {
              const flowProgress = getProgress(flow.id);
              const isCompleted = flowProgress?.is_completed;

              return (
                <Card
                  key={flow.id}
                  className={cn(
                    'group relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 rounded-2xl',
                    isCompleted && 'border-green-500/60 bg-green-500/5'
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-accent/60 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between gap-2 text-base md:text-lg">
                      <span className="flex items-center gap-2 line-clamp-1">
                        <Wind className="h-4 w-4 text-accent flex-shrink-0" />
                        {flow.title}
                      </span>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                      {flow.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                      <span>Duração: {flow.duration} min</span>
                      <span>
                        Lançamento:{' '}
                        {new Date(flow.release_timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 rounded-full text-xs"
                        onClick={() => navigate(`/mindful/${flow.id}`)}
                      >
                        Assistir
                      </Button>
                      {isKeyUser && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/editor/flow/${flow.id}`);
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
              Nenhum flow disponível no momento.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
