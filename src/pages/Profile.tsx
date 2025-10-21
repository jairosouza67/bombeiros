import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogOut, Home, BookOpen, Wind, Music2, Settings, BarChart, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Início', icon: Home, path: '/dashboard' },
  { name: 'Aulas', icon: BookOpen, path: '/lessons' },
  { name: 'Flow', icon: Wind, path: '/mindful' },
  { name: 'Músicas', icon: Music2, path: '/music' },
  { name: 'Perfil', icon: User, path: '/profile' },
];

export default function Profile() {
  const { user, loading, signOut } = useAuth();
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

  const completedLessons = progress?.filter(p => p.is_completed).length || 0;

  if (loading || !user) {
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
                <span className="font-medium">Aulas Concluídas:</span>
                <span className="text-lg font-bold text-primary">{completedLessons}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Tempo de Estudo:</span>
                <span className="text-lg font-bold">N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Streak Atual:</span>
                <span className="text-lg font-bold">N/A</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}