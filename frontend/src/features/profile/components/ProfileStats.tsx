import { FolderKanban, CheckSquare, Users, Star } from 'lucide-react';
import type { ProfileStats as ProfileStatsType } from '../types/profile';

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

export const ProfileStats = ({ stats }: ProfileStatsProps) => {
  const items = [
    { icon: FolderKanban, label: 'Projects', value: stats.projects },
    { icon: CheckSquare, label: 'Tasks', value: stats.tasks },
    { icon: Users, label: 'Teams', value: stats.teams },
    { icon: Star, label: 'Completed', value: stats.completed_tasks },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-xl border border-white/5 bg-white/5 px-4 py-5 text-center transition-all hover:border-white/10"
        >
          <item.icon className="mx-auto h-5 w-5 text-white/40" />
          <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
          <p className="text-xs text-white/40">{item.label}</p>
        </div>
      ))}
    </div>
  );
};