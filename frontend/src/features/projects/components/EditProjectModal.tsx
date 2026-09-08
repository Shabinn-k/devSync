import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, Save, Loader2 } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import type { ProjectDetail, UpdateProjectRequest, ProjectStatus, ProjectPriority } from '../types/project';

interface EditProjectModalProps {
    project: ProjectDetail;
    onClose: () => void;
    onSuccess?: () => void;
}

export const EditProjectModal = ({ project, onClose, onSuccess }: EditProjectModalProps) => {
    const [formData, setFormData] = useState<UpdateProjectRequest>({
        name: project.name,
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        start_date: project.start_date,
        end_date: project.end_date,
    });
    const [error, setError] = useState<string | null>(null);
    const { updateProject, isSaving } = useProjectStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name?.trim()) {
            setError('Project name is required');
            return;
        }

        try {
            await updateProject(project.id, formData);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update project');
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
                    <Settings className="h-4 w-4 text-white/40" />
                    <h2 className="text-sm font-medium text-white">Edit Project</h2>
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
                        Project Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Description
                    </label>
                    <textarea
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Status
                        </label>
                        <select
                            value={formData.status || 'active'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                            className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Priority
                        </label>
                        <select
                            value={formData.priority || 'medium'}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProjectPriority })}
                            className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30"
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
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                            className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={formData.end_date ? formData.end_date.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                            className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded px-4 py-2 text-xs font-medium text-white/40 transition-colors hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-1.5 rounded bg-white px-4 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-3.5 w-3.5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};
