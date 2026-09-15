import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Loader2, ArrowLeft, ListTodo } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { TaskBoard } from '../components/TaskBoard';
import { TaskCard } from '../components/TaskCard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { useAuthStore } from '../../../stores/authStore';

export const TasksPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'created'>('all');

  const {
    tasks,
    isLoading,
    error,
    fetchTasksByProject,
    fetchMyTasks,
    updateTaskStatus,
  } = useTaskStore();

  useEffect(() => {
    if (projectId) {
      fetchTasksByProject(Number(projectId));
    } else {
      fetchMyTasks();
    }
  }, [projectId, fetchTasksByProject, fetchMyTasks]);

  const isLead = user?.role === 'team_lead' || user?.role === 'admin';
  const isGlobalView = !projectId;
 
  const visibleTasks = isGlobalView
    ? tasks.filter((t) => {
        if (filter === 'assigned') return t.assignee_id === user?.id;
        if (filter === 'created') return t.created_by === user?.id;
        return t.assignee_id === user?.id || t.created_by === user?.id;
      })
    : tasks;

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    await updateTaskStatus(taskId, newStatus as any);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {projectId && (
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="rounded-lg border border-white/10 p-2 text-white/40 transition-all duration-200 hover:bg-white/10 hover:text-white"
                aria-label="Back to project"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isGlobalView ? 'My Tasks' : 'Tasks'}
              </h1>
              <p className="text-sm text-white/40">
                {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>

          {/* Filter tabs (only in global view) */}
          {isGlobalView && (
            <div className="flex gap-2 rounded-lg border border-white/10 bg-black p-1">
              {(['all', 'assigned', 'created'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all duration-200 ${
                    filter === f
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'assigned' ? 'Assigned to me' : 'Created by me'}
                </button>
              ))}
            </div>
          )}

          {isLead && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-green-600 hover:border-green-500"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
            <p>{error}</p>
            <button
              onClick={() =>
                projectId ? fetchTasksByProject(Number(projectId)) : fetchMyTasks()
              }
              className="mt-2 rounded-lg border border-red-500/20 px-4 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!error && visibleTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black p-12 text-center">
            <ListTodo className="h-12 w-12 text-white/20 mb-4" />
            <h3 className="text-lg font-medium text-white">No tasks yet</h3>
            <p className="mt-1 text-sm text-white/40">
              {isGlobalView
                ? filter === 'assigned'
                  ? 'Nothing is assigned to you right now'
                  : filter === 'created'
                  ? "You haven't created any tasks"
                  : 'Tasks assigned to you or created by you appear here'
                : 'Create your first task to start tracking work'}
            </p>
            {isLead && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 rounded-lg border border-white/10 bg-black px-6 py-2.5 text-sm text-white hover:bg-green-600 hover:border-green-500 transition-all duration-200"
              >
                Create Task
              </button>
            )}
          </div>
        )}

        {/* Global view → flat list. Project view → Kanban board */}
        {!error && visibleTasks.length > 0 && (
          isGlobalView ? (
            <div className="space-y-3">
              {visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <TaskBoard tasks={visibleTasks} onStatusChange={handleStatusChange} />
            </div>
          )
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6 shadow-2xl">
            <CreateTaskModal
              projectId={projectId ? Number(projectId) : undefined}
              onClose={() => setShowCreateModal(false)}
              onSuccess={() =>
                projectId ? fetchTasksByProject(Number(projectId)) : fetchMyTasks()
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;