import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, User, Lock } from 'lucide-react';

interface ProfileSettingsModalProps {
  profile: {
    name: string;
    avatar_url: string | null;
  };
  children: React.ReactNode;
}

export function ProfileSettingsModal({ profile, children }: ProfileSettingsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // State for Personal Info
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');

  // State for Password Change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setAvatarUrl(profile.avatar_url || '');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [open, profile.name, profile.avatar_url]);

  // Mutation for updating profile (name/avatar)
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const { error } = await supabase
        .from('profiles')
        .update({ name, avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Sucesso!",
        description: "Informações pessoais atualizadas.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    if (!name) {
      toast({ title: "Erro", description: "O nome não pode ser vazio.", variant: "destructive" });
      return;
    }
    updateProfileMutation.mutate();
  };

  // Mutation for changing password
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error("As senhas não coincidem.");
      }
      if (newPassword.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }

      // Supabase uses the `updateUser` method for password changes
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = () => {
    changePasswordMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações de Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais ou altere sua senha.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="h-4 w-4 mr-2" />
              Senha
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Personal Info */}
          <TabsContent value="personal" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL do Avatar (Opcional)</Label>
              <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={updateProfileMutation.isPending} 
              className="w-full"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Informações
            </Button>
          </TabsContent>

          {/* Tab 2: Password Change */}
          <TabsContent value="password" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={changePasswordMutation.isPending} 
              className="w-full"
            >
              {changePasswordMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              Alterar Senha
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}