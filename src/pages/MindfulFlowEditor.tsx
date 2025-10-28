import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Trash2, Video } from 'lucide-react';

interface MindfulFlow {
  id: string;
  title: string;
  description: string;
  duration: number;
  release_timestamp: string;
  video_url: string;
}

export default function MindfulFlowEditor() {
  const { user, loading, isKeyUser } = useAuth();
  const navigate = useNavigate();
  const { flowId } = useParams<{ flowId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [flowData, setFlowData] = useState<Partial<MindfulFlow>>({
    title: '',
    description: '',
    duration: 10,
    release_timestamp: new Date().toISOString().slice(0, 16),
    video_url: '',
  });

  useEffect(() => {
    if (!loading && (!user || !isKeyUser)) {
      navigate('/mindful');
    }
  }, [user, loading, isKeyUser, navigate]);

  // Fetch existing flow data if editing
  const { data: existingFlow, isLoading: isFlowLoading } = useQuery<MindfulFlow>({
    queryKey: ['mindful_flow', flowId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mindful_flows')
        .select('*')
        .eq('id', flowId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!flowId,
  });

  useEffect(() => {
    if (existingFlow) {
      setFlowData({
        ...existingFlow,
        release_timestamp: new Date(existingFlow.release_timestamp).toISOString().slice(0, 16),
      });
    }
  }, [existingFlow]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFlowData(prev => ({
      ...prev,
      [id]: id === 'duration' ? parseInt(value) || 0 : value,
    }));
  };

  const saveFlow = useMutation({
    mutationFn: async (data: Partial<MindfulFlow>) => {
      const releaseDate = new Date(data.release_timestamp!);
      const payload = {
        title: data.title!,
        description: data.description || '',
        duration: data.duration || 10,
        video_url: data.video_url || '',
        release_timestamp: releaseDate.toISOString(),
        release_time: releaseDate.toTimeString().slice(0, 8),
      };

      if (flowId) {
        const { data: updatedData, error } = await supabase
          .from('mindful_flows')
          .update(payload)
          .eq('id', flowId)
          .select()
          .single();
        if (error) throw error;
        return updatedData;
      } else {
        const { data: newData, error } = await supabase
          .from('mindful_flows')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return newData;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mindful_flows'] });
      queryClient.invalidateQueries({ queryKey: ['mindful_flow', flowId] });
      toast({
        title: "Sucesso!",
        description: `Flow ${flowId ? 'atualizado' : 'criado'} com sucesso.`,
      });
      if (!flowId) {
        navigate(`/editor/flow/${data.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFlow = useMutation({
    mutationFn: async () => {
      if (!flowId) return;
      const { error } = await supabase
        .from('mindful_flows')
        .delete()
        .eq('id', flowId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindful_flows'] });
      toast({
        title: "Sucesso!",
        description: "Flow excluído com sucesso.",
      });
      navigate('/mindful');
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!flowData.title || !flowData.description || !flowData.release_timestamp) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Título, Descrição e Data de Lançamento.",
        variant: "destructive",
      });
      return;
    }
    saveFlow.mutate(flowData);
  };

  if (loading || isFlowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 overflow-y-auto pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/mindful')}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {flowId ? 'Editar Flow' : 'Criar Novo Flow'}
          </h1>
          <div className="flex gap-2">
            {flowId && (
              <Button variant="destructive" onClick={() => deleteFlow.mutate()} disabled={deleteFlow.isPending}>
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
            <Button onClick={handleSave} disabled={saveFlow.isPending}>
              <Save className="h-5 w-5 mr-2" />
              {saveFlow.isPending ? 'Salvando...' : 'Salvar Flow'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={flowData.title || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={flowData.description || ''} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min)</Label>
                <Input id="duration" type="number" value={flowData.duration || 0} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_timestamp">Data/Hora de Lançamento</Label>
                <Input id="release_timestamp" type="datetime-local" value={flowData.release_timestamp || ''} onChange={handleChange} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Conteúdo de Vídeo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video_url">URL do Vídeo (YouTube, Vimeo, etc.)</Label>
              <Input 
                id="video_url" 
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                value={flowData.video_url || ''} 
                onChange={handleChange} 
              />
            </div>
            {flowData.video_url && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Pré-visualização (Embed)</h3>
                <p className="text-sm text-muted-foreground break-all">{flowData.video_url}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}