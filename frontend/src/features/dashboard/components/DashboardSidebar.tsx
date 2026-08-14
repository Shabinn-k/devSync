import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  LogOut,
  X
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useProfileStore } from '../../profile/store/profileStore';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Projects', icon: FolderKanban, href: '/projects' },
  { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { name: 'Organization', icon: Users, href: '/organizations' },
  
];

export const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const { user, logout } = useAuthStore();
  const { profile } = useProfileStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/5 bg-black/95 transition-transform duration-200 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      <div className="flex h-16 items-center border-b border-white/5 px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-[4px] border-2 border-white" />
          <span className="text-sm font-bold tracking-[0.08em] text-white">DEVSYNC</span>
        </Link>
        <button
          onClick={onClose}
          className="ml-auto lg:hidden text-white/40 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = window.location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-4">
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};