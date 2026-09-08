import { useState } from 'react';
import { User, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../../../stores/authStore';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { EditTaskModal } from './EditTaskModal';
import type { TaskDetail } from '../types/task';

interface TaskDetailHeaderProps {
    task: TaskDetail;
}

export const TaskDetailHeader = ({ task }: TaskDetailHeaderProps) => {
    const { user } = useAuthStore();
    const { updateTaskStatus, deleteTask } = useTaskStore();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isAdmin = task.creator?.id === user?.id;

    const handleStatusChange = async (status: string) => {
        await updateTaskStatus(task.id, status as any);
    };

    const handleDelete = async () => {
        await deleteTask(task.id);
        // Navigate back via parent component
        window.history.back();
    };

    return (
        <>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <TaskStatusBadge status={task.status} />
                            <TaskPriorityBadge priority={task.priority} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none"
                        >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                        </select>
                        {isAdmin && (
                            <>
                                <button 
                                    onClick={() => setShowEditModal(true)}
                                    className="rounded-lg border border-white/10 p-2 text-white/40 hover:text-white"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="rounded-lg border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10"
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

                <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/40">
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
                    task={task}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => window.location.reload()}
                />
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/95 p-6">
                        <h3 className="text-lg font-semibold text-white">Delete Task?</h3>
                        <p className="mt-2 text-sm text-white/40">This action cannot be undone.</p>
                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};