import { Home, BookOpen, Wind, Music2, User, MessageCircle } from 'lucide-react';

export const navItems = [
  { name: 'Início', icon: Home, path: '/dashboard' },
  { name: 'Aulas', icon: BookOpen, path: '/aulas' },
  { name: 'Daily Contact', icon: MessageCircle, path: '/daily-contact' },
  { name: 'Flow', icon: Wind, path: '/mindful' },
  { name: 'Músicas', icon: Music2, path: '/music' },
  { name: 'Perfil', icon: User, path: '/profile' },
];