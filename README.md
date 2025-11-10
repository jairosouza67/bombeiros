# 🔥 Bombeiro Bilíngue

> Plataforma de treinamento profissional de inglês para bombeiros

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Sobre o Projeto

**Bombeiro Bilíngue** é uma plataforma educacional completa desenvolvida especificamente para bombeiros que precisam dominar o inglês profissional em situações de emergência e missões internacionais.

### 🎯 Funcionalidades Principais

- 📚 **Aulas** - Conteúdo educacional estruturado com vídeos, PDFs e imagens
- 📖 **Daily Contact** - Lições diárias para prática contínua
- 🧘 **Mindful Flow** - Sessões de mindfulness para foco e respiração
- 🎵 **Músicas** - Conteúdo musical para fixação do conhecimento
- 📊 **Dashboard** - Acompanhamento de progresso em tempo real
- 👤 **Perfil** - Gestão de informações pessoais e estatísticas
- 🔐 **Autenticação** - Sistema seguro com Supabase Auth

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **React Router** - Navegação entre páginas
- **TanStack Query** - Gerenciamento de estado assíncrono

### Backend
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL Database
  - Authentication
  - Storage
  - Row Level Security (RLS)

### Deployment
- **Netlify** - Hospedagem e CI/CD

## 🏗️ Estrutura do Projeto

```
bombeiros/
├── public/              # Arquivos estáticos
│   ├── icons/          # Ícones do PWA
│   ├── manifest.json   # Manifest do PWA
│   └── service-worker.js
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   │   ├── ui/        # Componentes shadcn/ui
│   │   ├── FixedNavBar.tsx
│   │   ├── PictureInPictureButton.tsx
│   │   └── ProfileSettingsModal.tsx
│   ├── hooks/         # Custom React Hooks
│   │   ├── useAuth.tsx
│   │   ├── useOrientation.tsx
│   │   └── use-toast.ts
│   ├── integrations/  # Integrações externas
│   │   └── supabase/
│   ├── lib/           # Utilitários e configurações
│   │   ├── navItems.ts
│   │   └── utils.ts
│   ├── pages/         # Páginas da aplicação
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── Profile.tsx
│   │   ├── Aulas.tsx
│   │   ├── AulasDetail.tsx
│   │   ├── AulasEditor.tsx
│   │   ├── DailyContact.tsx
│   │   ├── DailyContactDetail.tsx
│   │   ├── DailyContactEditor.tsx
│   │   ├── MindfulFlow.tsx
│   │   ├── Music.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx        # Componente raiz
│   └── main.tsx       # Entry point
├── supabase/
│   ├── config.toml    # Configuração do Supabase
│   └── migrations/    # Migrations SQL
└── package.json

```

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase
- Conta no Netlify (para deploy)

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/jairosouza67/bombeiros.git
cd bombeiros
```

### Passo 2: Instale as Dependências

```bash
npm install
```

### Passo 3: Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Passo 4: Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🗄️ Configuração do Banco de Dados

### Execute as Migrations SQL

**IMPORTANTE**: Execute o arquivo SQL no Supabase Dashboard para criar todas as tabelas e buckets necessários.

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute o arquivo: `EXECUTAR_NO_SUPABASE_DASHBOARD.sql`

Este arquivo cria:

#### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários |
| `aulas` | Catálogo de aulas |
| `aulas_progress` | Progresso das aulas por usuário |
| `lessons` | Daily Contacts |
| `progress` | Progresso dos Daily Contacts |
| `mindful_flow` | Sessões de Mindful Flow |
| `mindful_music` | Músicas |
| `music_progress` | Progresso das músicas |

#### Storage Buckets

- **`content`** - Para PDFs e imagens das Aulas
- **`lesson_content`** - Para PDFs e imagens do Daily Contact

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS configuradas:

- ✅ Leitura pública para conteúdos
- ✅ Apenas usuários autenticados podem criar/editar
- ✅ Usuários só podem ver seu próprio progresso

## 👥 Sistema de Usuários

### Tipos de Usuário

1. **Usuário Normal** - Acesso ao conteúdo e progresso pessoal
2. **Key User** - Acesso adicional para criar e editar conteúdos

### Autenticação

- Login com email/senha via Supabase Auth
- Senha mínima de 6 caracteres
- Sessão persistente

## 📱 Features Especiais

### Progressive Web App (PWA)
- Instalável em dispositivos móveis e desktop
- Service Worker para cache offline
- Manifest configurado

### Picture-in-Picture
- Vídeos podem ser assistidos em modo PiP
- Continua reproduzindo enquanto navega

### Responsividade
- Layout adaptativo para mobile, tablet e desktop
- Navegação otimizada por tamanho de tela
- Suporte a orientação landscape/portrait

## 🎨 Design System

### Cores Principais
- **Primary**: Vermelho (#ef4444) - Tema bombeiros
- **Accent**: Laranja (#f97316)
- **Background**: Cinza escuro (#1a1a1a)
- **Foreground**: Branco (#ffffff)

### Componentes UI
Baseados em **shadcn/ui** com customizações:
- Buttons, Cards, Inputs, Dialogs
- Progress bars, Toasts, Modals
- Navigation, Accordions, Tabs

## 📊 Monitoramento de Progresso

O sistema rastreia automaticamente:
- Aulas completadas vs total de aulas
- Daily Contacts completados
- Sessões de Mindful Flow realizadas
- Músicas ouvidas
- Tempo total de estudo

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

## 🚀 Deploy

### Netlify (Recomendado)

1. Conecte o repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

O projeto já possui `netlify.toml` configurado.

## 📝 Estrutura de Rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Index | Landing page |
| `/auth` | Auth | Login/Registro |
| `/dashboard` | Dashboard | Painel principal |
| `/profile` | Profile | Perfil do usuário |
| `/aulas` | Aulas | Lista de aulas |
| `/aulas/:id` | AulasDetail | Detalhes da aula |
| `/editor/aulas/:id?` | AulasEditor | Editor de aulas |
| `/daily-contact` | DailyContact | Lista de Daily Contacts |
| `/daily-contact/:id` | DailyContactDetail | Detalhes do Daily Contact |
| `/editor/daily-contact/:id?` | DailyContactEditor | Editor de Daily Contact |
| `/mindful` | MindfulFlow | Mindful Flow |
| `/music` | Music | Músicas |

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Desenvolvedor

**Jairo Souza**
- GitHub: [@jairosouza67](https://github.com/jairosouza67)

## 🐛 Problemas Conhecidos e Soluções

Para soluções de problemas comuns, consulte:
- `FIX_BUCKET_ERROR_README.md` - Erros de Storage/Bucket
- `EXECUTAR_NO_SUPABASE_DASHBOARD.sql` - Script SQL completo

## 📞 Suporte

Para questões e suporte, entre em contato através das issues do GitHub.

---

**Desenvolvido com ❤️ para bombeiros que salvam vidas** 🔥
