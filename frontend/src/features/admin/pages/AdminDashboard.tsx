import { useEffect } from 'react';
import {
  Users, Building2, UsersRound, FolderKanban, CheckSquare,
  UserPlus, PlusCircle, FileText, ListTodo, Loader2, TrendingUp,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import type { AdminActivityItem } from '../types/admin';

const activityIcons: Record<AdminActivityItem['type'], typeof UserPlus> = {
  user_created: UserPlus,
  org_created: PlusCircle,
  project_created: FileText,
  task_created: ListTodo,
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const AdminDashboardPage = () => {
  const { stats, statsLoading, fetchStats } = useAdminStore();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (statsLoading && !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }
  if (!stats) return <p className="text-sm text-neutral-500">No stats available.</p>;
 
  const cards = [
    {
      label: 'Active Users',
      value: stats.users.active,
      total: stats.users.total,
      sub: `+${stats.users.new_this_week} this week`,
      icon: Users,
      accent: 'emerald',
    },
    {
      label: 'Organizations',
      value: stats.organizations.active,
      total: stats.organizations.total,
      sub: `${stats.organizations.total - stats.organizations.active} inactive`,
      icon: Building2,
      accent: 'blue',
    },
    {
      label: 'Teams',
      value: stats.teams.total,
      total: undefined,
      sub: 'across all orgs',
      icon: UsersRound,
      accent: 'amber',
    },
    {
      label: 'Projects',
      value: stats.projects.total,
      total: undefined,
      sub: 'all projects',
      icon: FolderKanban,
      accent: 'violet',
    },
    {
      label: 'Tasks',
      value: stats.tasks.completed,
      total: stats.tasks.total,
      sub: `${stats.tasks.in_progress} in progress`,
      icon: CheckSquare,
      accent: 'emerald',
    },
  ];

  const accentMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="space-y-8"> 
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Infrastructure Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">Real-time stats across DevSync.</p>
      </div>
 
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-neutral-500">{c.label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${accentMap[c.accent]}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold text-neutral-900">
                {c.value}
                {c.total !== undefined && (
                  <span className="text-lg text-neutral-400">/{c.total}</span>
                )}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
                <TrendingUp className="h-3 w-3" />
                {c.sub}
              </p>
            </div>
          );
        })}
      </div>
 
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"> 
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-neutral-900">Recent Activity</h2>
              <p className="mt-0.5 text-xs text-neutral-500">Latest events across the platform.</p>
            </div>
            <span className="text-xs text-neutral-400">{stats.recent_activity.length} events</span>
          </div>

          <div className="mt-5 space-y-2">
            {stats.recent_activity.length === 0 && (
              <p className="text-sm text-neutral-400">No activity yet.</p>
            )}
            {stats.recent_activity.map((item, i) => {
              const Icon = activityIcons[item.type] || PlusCircle;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200">
                      <Icon className="h-3.5 w-3.5 text-neutral-500" />
                    </div>
                    <p className="text-sm text-neutral-800">{item.description}</p>
                  </div>
                  <span className="text-xs text-neutral-400">{timeAgo(item.timestamp)}</span>
                </div>
              );
            })}
          </div>
        </div>
 
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-medium text-neutral-900">Platform Health</h2>
          <p className="mt-0.5 text-xs text-neutral-500">Overview across all entities.</p>

          <div className="mt-6 space-y-4">
            {[
              { label: 'Users active', value: stats.users.total ? Math.round((stats.users.active / stats.users.total) * 100) : 0, color: 'bg-emerald-500' },
              { label: 'Orgs active', value: stats.organizations.total ? Math.round((stats.organizations.active / stats.organizations.total) * 100) : 0, color: 'bg-blue-500' },
              { label: 'Tasks completed', value: stats.tasks.total ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0, color: 'bg-amber-500' },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-neutral-600">{row.label}</span>
                  <span className="font-medium text-neutral-900">{row.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{ width: `${row.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};