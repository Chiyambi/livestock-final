import { NavLink, useLocation } from 'react-router-dom';
import { Home, PawPrint, Calendar, Syringe, BarChart3, Settings } from 'lucide-react'; 
import { cn } from '@/lib/utils';

const navigationItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/animals', icon: PawPrint, label: 'Animals' }, 
  { path: '/feeding', icon: Calendar, label: 'Feeding' },
  { path: '/vaccination', icon: Syringe, label: 'Vaccination' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-6 h-16">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
