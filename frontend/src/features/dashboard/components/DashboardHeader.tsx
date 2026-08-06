// import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { useProfileStore } from '../../profile/store/profileStore';
import { useAuthStore } from '../../../stores/authStore';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { profile } = useProfileStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-white/40 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white">
            <Search size={18} />
          </button>
          <button className="relative rounded-full p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white">
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <Link
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            {profile?.Name?.[0]?.toUpperCase() || user?.Name?.[0]?.toUpperCase() || 'U'}
          </Link>
        </div>
      </div>
    </header>
  );
};