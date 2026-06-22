import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  HeartHandshake,
  Calendar,
  Scissors,
  Building2,
  User,
  Bell,
  Store,
  PawPrint,
  Stethoscope,
  FileText,
  X,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  type: 'admin' | 'user';
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Store },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
  { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { label: 'Adoption Requests', href: '/admin/adoption-requests', icon: HeartHandshake },
  { label: 'Grooming', href: '/admin/grooming', icon: Scissors },
  { label: 'Boarding', href: '/admin/boarding', icon: Building2 },
];

const userNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { label: 'My Appointments', href: '/dashboard/appointments', icon: Calendar },
  { label: 'Adoption Requests', href: '/dashboard/adoption-requests', icon: HeartHandshake },
  { label: 'My Pets', href: '/dashboard/pets', icon: PawPrint },
  { label: 'Wishlist', href: '/dashboard/wishlist', icon: FileText },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
];

export default function Sidebar({ open, onClose, type }: SidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();
  const navItems = type === 'admin' ? adminNavItems : userNavItems;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r bg-card transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <PawPrint className="h-7 w-7 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-extrabold text-transparent">
            {type === 'admin' ? 'Admin Panel' : 'My Dashboard'}
          </span>
        </div>

        <div className="flex items-center justify-between border-b px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-3">
            {navItems.map((item) => {
              const isActive = item.href === (type === 'admin' ? '/admin' : '/dashboard')
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === (type === 'admin' ? '/admin' : '/dashboard')}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-4">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              location.pathname === '/profile'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <User className="h-4 w-4 flex-shrink-0" />
            My Profile
          </NavLink>
          <NavLink
            to="/"
            onClick={onClose}
            className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
          >
            <Store className="h-4 w-4 flex-shrink-0" />
            Back to Store
          </NavLink>
        </div>
      </aside>
    </>
  );
}
