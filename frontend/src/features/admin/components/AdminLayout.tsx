import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/organizations', label: 'Organizations', icon: Building2, end: false },
];

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout?.();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="flex w-64 flex-col bg-[#0a0a0a] text-white">
       
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black font-bold text-sm">
            D
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">DevSync</p>
            <p className="text-[11px] text-white/40">Admin Console</p>
          </div>
        </div>

     
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-white/30">
            Manage
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}

        </nav>

        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-black text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || 'Admin'}
              </p>
              <p className="truncate text-xs text-white/40">
                {user?.email || 'admin@devsync.local'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-neutral-50 p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};