import { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  CheckSquare, 
  Users, 
  TrendingUp,
  Plus,
  User
} from 'lucide-react';
import { 
  DashboardSidebar, 
  DashboardHeader, 
  StatsCard, 
  ActivityItem, 
  TaskItem,
  QuickAction 
} from '../components';
import { useDashboardStore } from '../store/dashboardStore';
import { useAuthStore } from '../../../stores/authStore';
import { useProfileStore } from '../../profile/store/profileStore';

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { stats, activities, tasks, fetchAll } = useDashboardStore(); // ✅ Removed 'isLoading' and 'error'
  const { user, isAuthenticated } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User is authenticated, fetching dashboard data');
      fetchProfile();
      fetchAll();
    }
  }, [isAuthenticated, fetchProfile, fetchAll]);

  // Mock data fallback if API fails
  const mockStats = {
    projects: 12,
    tasks: 48,
    teams: 4,
    completed_tasks: 32,
    active_tasks: 16,
    pending_tasks: 8,
    overdue_tasks: 3,
    completion_rate: 67,
  };

  const mockActivities = [
    { id: '1', type: 'task' as const, action: 'completed', title: 'Design system updates', time: '2 hours ago', user: 'You' },
    { id: '2', type: 'project' as const, action: 'created', title: 'Mobile App Redesign', time: '4 hours ago', user: 'Sarah Chen' },
    { id: '3', type: 'task' as const, action: 'assigned', title: 'API Integration', time: '6 hours ago', user: 'Mike Johnson' },
  ];

  const mockTasks = [
    { id: '1', title: 'Complete user profile design', due_date: 'Today', priority: 'High' as const, status: 'todo' as const },
    { id: '2', title: 'Fix login page bug', due_date: 'Tomorrow', priority: 'Medium' as const, status: 'in_progress' as const },
    { id: '3', title: 'Update documentation', due_date: 'Aug 10', priority: 'Low' as const, status: 'todo' as const },
  ];

  const displayStats = stats || mockStats;
  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const displayTasks = tasks.length > 0 ? tasks : mockTasks;
  const displayName = user?.name || profile?.name || 'User';

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Welcome back, {displayName}! 👋
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Here's what's happening with your workspace today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard 
              icon={<FolderKanban className="h-5 w-5 text-white/30" />}
              label="Projects"
              value={displayStats.projects}
              subtext="+2 this month"
            />
            <StatsCard 
              icon={<CheckSquare className="h-5 w-5 text-white/30" />}
              label="Tasks"
              value={displayStats.tasks}
              subtext={`${displayStats.active_tasks} active`}
            />
            <StatsCard 
              icon={<Users className="h-5 w-5 text-white/30" />}
              label="Teams"
              value={displayStats.teams}
              subtext="3 active members"
            />
            <StatsCard 
              icon={<TrendingUp className="h-5 w-5 text-white/30" />}
              label="Completion Rate"
              value={`${displayStats.completion_rate}%`}
              subtext={`${displayStats.completed_tasks} tasks done`}
            />
          </div>

          {/* Two Column Layout */}
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button className="text-sm text-white/40 hover:text-white transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {displayActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Upcoming Tasks</h3>
                <button className="text-sm text-white/40 hover:text-white transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {displayTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <QuickAction 
                icon={<Plus className="h-5 w-5 text-white/40" />}
                label="Create Project"
                path="/projects/create"
              />
              <QuickAction 
                icon={<Plus className="h-5 w-5 text-white/40" />}
                label="Create Task"
                path="/tasks/create"
              />
              <QuickAction 
                icon={<User className="h-5 w-5 text-white/40" />}
                label="View Profile"
                path="/profile"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;