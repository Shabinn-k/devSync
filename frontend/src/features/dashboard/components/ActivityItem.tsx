import { Activity } from 'lucide-react';
import type { ActivityItem as ActivityItemType } from '../types/dashboard';

interface ActivityItemProps {
  activity: ActivityItemType;
}

export const ActivityItem = ({ activity }: ActivityItemProps) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5">
        <Activity className="h-4 w-4 text-white/40" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-white">
          <span className="font-medium">{activity.user}</span>
          {' '}{activity.action}{' '}
          <span className="font-medium">{activity.title}</span>
        </p>
        <p className="mt-0.5 text-xs text-white/30">{activity.time}</p>
      </div>
    </div>
  );
};