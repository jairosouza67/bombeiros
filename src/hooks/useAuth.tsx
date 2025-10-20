import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'> & { role: 'standard' | 'key_user' | 'admin' };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, role')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile;
  };

  useEffect(() => {
    const handleAuthStateChange = (event: string, session: Session | null) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Defer Supabase calls with setTimeout to prevent deadlock
        setTimeout(() => {
          fetchProfile(currentUser.id).then(userProfile => {
            setProfile(userProfile);
            setLoading(false);
          });
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);
      
      if (currentUser) {
        // Defer Supabase calls with setTimeout to prevent deadlock
        setTimeout(() => {
          fetchProfile(currentUser.id).then(userProfile => {
            setProfile(userProfile);
            setLoading(false);
          });
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message
      });
      return { error };
    }

    toast({
      title: "Conta criada!",
      description: "Bem-vindo ao Bombeiro Bilíngue, Cadete!"
    });

    return { data, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: error.message
      });
      return { error };
    }

    toast({
      title: "Bem-vindo de volta!",
      description: "Pronto para a próxima missão?"
    });

    return { data, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message
      });
    }

    return { error };
  };

  const isKeyUser = profile?.role === 'key_user' || profile?.role === 'admin';

  return {
    user,
    session,
    profile,
    loading,
    isKeyUser,
    signUp,
    signIn,
    signOut
  };
}