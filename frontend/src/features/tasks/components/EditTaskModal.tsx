import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Edit, Save, Loader2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import type { TaskDetail, TaskPriority, TaskStatus } from '../types/task';

interface EditTaskModalProps {
    task: TaskDetail;
    onClose: () => void;
    onSuccess?: () => void;
}

export const EditTaskModal = ({ task, onClose, onSuccess }: EditTaskModalProps) => {
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || '',
        assignee_id: task.assignee_id || '',
    });
    const [error, setError] = useState<string | null>(null);
    const { updateTask, isSaving } = useTaskStore();

    useEffect(() => {
        setFormData({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            due_date: task.due_date || '',
            assignee_id: task.assignee_id || '',
        });
    }, [task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title.trim()) {
            setError('Task title is required');
            return;
        }

        try {
            await updateTask(task.id, {
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority as TaskPriority,
                status: formData.status as TaskStatus,
                due_date: formData.due_date || null,
                assignee_id: formData.assignee_id ? Number(formData.assignee_id) : null,
            });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update task');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-5"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-white/40" />
                    <h2 className="text-sm font-medium text-white">Edit Task</h2>
                </div>
                <button
                    onClick={onClose}
                    className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <X size={16} />
                </button>
            </div>

            {error && (
                <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Description
                    </label>
                    <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                            className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
                        >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Priority
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                            className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Assignee ID
                        </label>
                        <input
                            type="number"
                            placeholder="User ID"
                            value={formData.assignee_id}
                            onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                            className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex w-full items-center justify-center gap-2 rounded bg-white py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Update Task
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};