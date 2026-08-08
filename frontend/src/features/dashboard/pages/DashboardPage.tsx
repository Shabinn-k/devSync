import { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  CheckSquare, 
  Users, 
  TrendingUp,
  Plus,
  User,
  Loader2
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
  const { stats, activities, tasks, isLoading, error, fetchDashboard } = useDashboardStore(); // ✅ Changed fetchAll to fetchDashboard
  const { user, isAuthenticated } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User is authenticated, fetching dashboard data');
      fetchProfile();
      fetchDashboard(); // ✅ Single API call
    }
  }, [isAuthenticated, fetchProfile, fetchDashboard]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="lg:pl-64">
          <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/40" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="lg:pl-64">
          <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => fetchDashboard()}
              className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mock data fallback if API returns empty
  const displayStats = stats || {
    projects: 0,
    tasks: 0,
    teams: 0,
    completed_tasks: 0,
    active_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    completion_rate: 0,
  };

  const displayActivities = activities?.length > 0 ? activities : [];
  const displayTasks = tasks?.length > 0 ? tasks : [];
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
              subtext={`${displayStats.active_tasks || 0} active`}
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
              value={`${displayStats.completion_rate || 0}%`}
              subtext={`${displayStats.completed_tasks || 0} tasks done`}
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
                {displayActivities.length > 0 ? (
                  displayActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <p className="text-sm text-white/30 text-center py-8">No recent activity</p>
                )}
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
                {displayTasks.length > 0 ? (
                  displayTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-sm text-white/30 text-center py-8">No upcoming tasks</p>
                )}
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