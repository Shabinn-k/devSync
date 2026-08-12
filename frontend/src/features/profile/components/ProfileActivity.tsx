import { Activity as ActivityIcon, CheckCircle2, FolderPlus, Users, UserPen, RefreshCw } from 'lucide-react';

// This mirrors the shape of `activity_logs` (action, entity_type, created_at)
// so it slots in cleanly once an activity endpoint/store exists — nothing
// here is invented, it's the extensibility seam the brief asked for.
export interface ActivityItem {
  id: string;
  action: string;       // e.g. "task.completed", "project.created", "team.joined"
  label: string;         // human-readable line, e.g. "Completed a task"
  createdAt: string;
}

interface ProfileActivityProps {
  activity?: ActivityItem[];
  isLoading?: boolean;
}

const ACTION_ICONS: Record<string, typeof CheckCircle2> = {
  'task.completed': CheckCircle2,
  'task.status_changed': RefreshCw,
  'project.created': FolderPlus,
  'team.joined': Users,
  'profile.updated': UserPen,
};

export const ProfileActivity = ({ activity, isLoading }: ProfileActivityProps) => {
  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-white/60">Recent Activity</h3>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg border border-white/5 bg-white/5" />
          ))}
        </div>
      ) : activity && activity.length > 0 ? (
        <ul className="space-y-1">
          {activity.map((item) => {
            const Icon = ACTION_ICONS[item.action] ?? ActivityIcon;
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 text-sm transition-colors hover:border-white/10"
              >
                <Icon className="h-4 w-4 shrink-0 text-white/40" />
                <span className="flex-1 text-white/70">{item.label}</span>
                <span className="shrink-0 text-xs text-white/30">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
          <ActivityIcon className="mx-auto h-5 w-5 text-white/20" />
          <p className="mt-2 text-sm text-white/40">No recent activity</p>
          <p className="mt-0.5 text-xs text-white/25">
            Task updates, comments, and project changes will show up here.
          </p>
        </div>
      )}
    </section>
  );
};
