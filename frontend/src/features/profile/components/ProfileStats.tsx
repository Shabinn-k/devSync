import { FolderKanban, CheckSquare, Users, Star } from 'lucide-react';
import type { ProfileStats as ProfileStatsType } from '../types/profile';

interface ProfileStatsProps {
  stats?: ProfileStatsType;
}

const STAT_ITEMS = [
  { key: 'projects' as const, icon: FolderKanban, label: 'Projects' },
  { key: 'tasks' as const, icon: CheckSquare, label: 'Tasks' },
  { key: 'teams' as const, icon: Users, label: 'Teams' },
  { key: 'completed_tasks' as const, icon: Star, label: 'Completed' },
];

export const ProfileStats = ({ stats }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STAT_ITEMS.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-white/5 bg-white/5 px-4 py-5 text-center transition-all hover:border-white/10"
        >
          <item.icon className="mx-auto h-5 w-5 text-white/40" />
          <p className="mt-1 text-xl font-semibold text-white">
            {stats ? stats[item.key] : <span className="text-white/20">—</span>}
          </p>
          <p className="text-xs text-white/40">{item.label}</p>
        </div>
      ))}
    </div>
  );
};
