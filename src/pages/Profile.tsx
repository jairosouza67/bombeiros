import { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flame, User, LogOut, Home, BookOpen, Wind, Trophy, Mail, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileSettingsModal } from '@/components/ProfileSettingsModal'; // Import the new modal

const navItems = [
  { name: 'Início', icon: Home, path: '/dashboard' },
  { name: 'Aulas', icon: BookOpen, path: '/lessons' },
  { name: 'Flow', icon: Wind, path: '/mindful' },
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

  if (loading || !user || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando perfil...</div>
      </div>
    );
  }

  const userEmail = user.email || 'N/A';
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

  // Data passed to the modal
  const profileData = {
    name: profile?.name || '',
    avatar_url: profile?.avatar_url || null,
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

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <Card className="text-center p-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 border-4 border-primary/50">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name || 'User'} />
              <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                {profile?.name ? profile.name[0] : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold">{profile?.name || 'Usuário'}</h2>
              <p className="text-lg text-muted-foreground capitalize">{profile?.role || 'Cadete'}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">{userEmail}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">Membro desde: {memberSince}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conquistas</CardTitle>
              <CardDescription>Seu histórico de sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile?.achievements && profile.achievements.length > 0 ? (
                  profile.achievements.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                      <Trophy className="h-4 w-4" />
                      {achievement}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma conquista ainda.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Configurações
              <ProfileSettingsModal profile={profileData}>
                <Button variant="ghost" size="sm">
                  <Settings className="h-5 w-5" />
                </Button>
              </ProfileSettingsModal>
            </CardTitle>
            <CardDescription>Gerencie suas informações e segurança.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Replaced static buttons with a single modal trigger */}
            <ProfileSettingsModal profile={profileData}>
              <Button variant="outline" className="w-full justify-start">
                Editar Informações Pessoais e Senha
              </Button>
            </ProfileSettingsModal>
            
            <Button variant="destructive" className="w-full justify-start" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}