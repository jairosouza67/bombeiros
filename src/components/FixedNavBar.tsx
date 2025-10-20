import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Wind, User, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Início', icon: Home, path: '/dashboard' },
  { name: 'Aulas', icon: BookOpen, path: '/lessons' },
  { name: 'Flow', icon: Wind, path: '/mindful' },
  { name: 'Músicas', icon: Music2, path: '/music' },
  { name: 'Perfil', icon: User, path: '/profile' },
];

export function FixedNavBar() {
  const location = useLocation();

  // Only show the fixed bar on authenticated routes
  const isAuthRoute = ['/dashboard', '/lessons', '/mindful', '/music', '/profile', '/editor'].some(path => 
    location.pathname.startsWith(path)
  );

  if (!isAuthRoute) {
    return null;
  }

  return (
    // md:hidden ensures it only shows on mobile, as desktop navigation is now in the header
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl md:hidden">
      <nav className="flex justify-around items-center h-16 max-w-full mx-auto">
        {navItems.map((item) => {
          // Check if the current path starts with the item path (e.g., /lessons/123 is active for /lessons)
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link key={item.name} to={item.path} className="flex-1 h-full">
              <div
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center p-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}