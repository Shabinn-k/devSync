import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Loader2, ArrowLeft, ListTodo } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { TaskBoard } from '../components/TaskBoard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { useAuthStore } from '../../../stores/authStore';

export const TasksPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { tasks, isLoading, error, fetchTasksByProject, updateTaskStatus } = useTaskStore();

    const isLead = user?.role === 'team_lead' || user?.role === 'admin';

    useEffect(() => {
        if (projectId) {
            fetchTasksByProject(Number(projectId));
        }
    }, [projectId]);

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
                        <button
                            onClick={() => navigate(`/projects/${projectId}`)}
                            className="rounded-lg border border-white/10 p-2 text-white/40 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Tasks</h1>
                            <p className="text-sm text-white/40">
                                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                            </p>
                        </div>
                    </div>
                    {isLead && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-white/90"
                        >
                            <Plus className="h-4 w-4" />
                            New Task
                        </button>
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
                        <p>{error}</p>
                        <button
                            onClick={() => projectId && fetchTasksByProject(Number(projectId))}
                            className="mt-2 rounded-lg border border-red-500/20 px-4 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!error && tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
                        <ListTodo className="h-12 w-12 text-white/20 mb-4" />
                        <h3 className="text-lg font-medium text-white">No tasks yet</h3>
                        <p className="mt-1 text-sm text-white/40">
                            Create your first task to start tracking work
                        </p>
                        {isLead && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-6 rounded-lg border border-white/10 px-6 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                            >
                                Create Task
                            </button>
                        )}
                    </div>
                )}

                {/* Task Board */}
                {!error && tasks.length > 0 && (
                    <div className="mt-6">
                        <TaskBoard 
                            tasks={tasks} 
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && projectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6 shadow-2xl">
                        <CreateTaskModal
                            projectId={Number(projectId)}
                            onClose={() => setShowCreateModal(false)}
                            onSuccess={() => fetchTasksByProject(Number(projectId))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ✅ Add default export for compatibility
export default TasksPage;