import { FolderKanban, CheckSquare, Users, Award} from 'lucide-react';
import type { ProfileStats as ProfileStatsType } from '../types/profile';

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

export const ProfileStats = ({ stats }: ProfileStatsProps) => {
  const items = [
    { icon: FolderKanban, label: 'Projects', value: stats.projects },
    { icon: CheckSquare, label: 'Tasks', value: stats.tasks },
    { icon: Users, label: 'Teams', value: stats.teams },
    { icon: Award, label: 'Completed', value: stats.completed_tasks },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border border-white/5 bg-white/5 px-4 py-4 text-center hover:border-white/10 transition-all">
          <item.icon className="mx-auto h-4 w-4 text-white/30" />
          <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
          <p className="text-xs text-white/40">{item.label}</p>
        </div>
      ))}
    </div>
  );
};