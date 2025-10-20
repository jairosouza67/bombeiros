import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flame, BookOpen, Wind, CheckCircle, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-background border-b-2 border-primary shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2 shadow-md">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Bombeiro Bilíngue</h1>
          </div>
          <nav>
            <Button 
              variant="default" 
              onClick={handleCtaClick} 
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-2 shadow-md hover:shadow-lg"
            >
              {loading ? 'Carregando...' : (user ? 'Ir para o Dashboard' : 'Entrar')}
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-40 overflow-hidden bg-gradient-to-br from-primary via-primary to-accent">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <div className="text-center space-y-8">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                  <Zap className="h-4 w-4" />
                  Treinamento Profissional para Bombeiros
                </span>
              </div>

              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white drop-shadow-lg leading-tight">
                Domine o Inglês para Salvar Vidas
              </h2>

              <p className="text-lg md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                O treinamento essencial para bombeiros que precisam de fluência em inglês em situações de emergência e missões internacionais.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button 
                  size="lg" 
                  onClick={handleCtaClick} 
                  disabled={loading}
                  className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
                >
                  {loading ? 'Preparando...' : 'Começar o Treinamento'}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6"
                >
                  Saiba Mais
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16 bg-card border-b border-primary/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-primary">500+</p>
                <p className="text-muted-foreground text-lg">Bombeiros Treinados</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-accent">95%</p>
                <p className="text-muted-foreground text-lg">Taxa de Sucesso</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-4xl md:text-5xl font-bold text-primary">24/7</p>
                <p className="text-muted-foreground text-lg">Suporte Disponível</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold mb-4">Treinamento Completo</h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Desenvolvido especificamente para bombeiros que precisam se comunicar em emergências internacionais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Feature 1: Metodologia */}
              <div className="group relative p-8 border-2 border-primary/30 rounded-xl bg-card hover:border-primary transition-all duration-300 shadow-card hover:shadow-intense">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="bg-gradient-to-br from-primary to-primary/70 rounded-lg w-14 h-14 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  
                  <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Metodologia Profissional
                  </h4>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Aprenda inglês com foco em situações reais de emergência e comunicação profissional para bombeiros.
                  </p>
                </div>
              </div>

              {/* Feature 2: Acompanhamento */}
              <div className="group relative p-8 border-2 border-accent/30 rounded-xl bg-card hover:border-accent transition-all duration-300 shadow-card hover:shadow-intense">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="bg-gradient-to-br from-accent to-accent/70 rounded-lg w-14 h-14 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                    <CheckCircle className="h-7 w-7 text-accent-foreground" />
                  </div>
                  
                  <h4 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                    Progresso Monitorado
                  </h4>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    Acompanhe seu desenvolvimento com métricas detalhadas e conquiste seus objetivos de fluência.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-accent relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
            <h3 className="text-4xl md:text-5xl font-bold text-white">
              Pronto para começar seu treinamento?
            </h3>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Junte-se a centenas de bombeiros que já dominam o inglês profissional
            </p>
            <Button 
              size="lg" 
              onClick={handleCtaClick} 
              disabled={loading}
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
            >
              {loading ? 'Preparando...' : 'Acessar Plataforma'}
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-primary py-8 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-lg mb-4 text-primary">Bombeiro Bilíngue</h4>
                <p className="text-muted-foreground">Treinamento profissional de inglês para bombeiros.</p>
              </div>
              <div>
                <h5 className="font-semibold mb-4 text-foreground">Produto</h5>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Aulas</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Meditação</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Música</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-4 text-foreground">Empresa</h5>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-4 text-foreground">Legal</h5>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Bombeiro Bilíngue. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

