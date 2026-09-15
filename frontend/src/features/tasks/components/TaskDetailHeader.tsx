import { useState } from 'react';
import { User, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../../../stores/authStore';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { EditTaskModal } from './EditTaskModal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import type { TaskWithComments } from '../types/task';
import toast from 'react-hot-toast';

interface TaskDetailHeaderProps {
    task: TaskWithComments;
}

export const TaskDetailHeader = ({ task }: TaskDetailHeaderProps) => {
    const { user } = useAuthStore();
    const { updateTaskStatus, deleteTask } = useTaskStore();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isAdmin = user?.role === 'team_lead' || user?.role === 'admin' || task.creator?.id === user?.id;
    const canChangeStatus = isAdmin || task.assignee_id === user?.id;

    const handleStatusChange = async (status: string) => {
        try {
            await updateTaskStatus(task.id, status as any);
            toast.success('Task status updated');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteTask(task.id);
            toast.success('Task deleted');
            setShowDeleteConfirm(false);
            window.history.back();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete task');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="rounded-2xl border border-white/10 bg-black p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <TaskStatusBadge status={task.status} />
                            <TaskPriorityBadge priority={task.priority} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canChangeStatus && (
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30 transition-all duration-200"
                            >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                            </select>
                        )}
                        {isAdmin && (
                            <>
                                <button 
                                    onClick={() => setShowEditModal(true)}
                                    className="rounded-lg border border-white/10 bg-black p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
                                    aria-label="Edit Task"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="rounded-lg border border-red-500/20 bg-black p-2 text-red-400 hover:bg-red-600 hover:border-red-500 hover:text-white transition-all duration-200"
                                    aria-label="Delete Task"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {task.description && (
                    <p className="mt-4 text-sm text-white/60">{task.description}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/40 font-mono">
                    {task.assignee && (
                        <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {task.assignee.name}
                        </span>
                    )}
                    {task.due_date && (
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(task.due_date).toLocaleDateString()}
                        </span>
                    )}
                    <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Created {new Date(task.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditTaskModal
                    task={task as any}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Task?"
                message="This action cannot be undone. The task will be marked as inactive."
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </>
    );
};

export default TaskDetailHeader;