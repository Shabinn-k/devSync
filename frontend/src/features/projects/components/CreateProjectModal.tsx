import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FolderPlus, Loader2, Check } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import type { CreateProjectRequest } from '../types/project';

interface CreateProjectModalProps {
    organizationId: number;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateProjectModal = ({ organizationId, onClose, onSuccess }: CreateProjectModalProps) => {
    const [formData, setFormData] = useState<CreateProjectRequest>({
        organization_id: organizationId,
        name: '',
        description: '',
        priority: 'medium',
    });
    const [error, setError] = useState<string | null>(null);
    const { createProject, isSaving } = useProjectStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('Project name is required');
            return;
        }

        try {
            await createProject(formData);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create project');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FolderPlus className="h-5 w-5 text-white/40" />
                    <h2 className="text-lg font-semibold text-white">Create Project</h2>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/60">
                        Project Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Website Redesign"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
                        autoFocus
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60">
                        Description
                    </label>
                    <textarea
                        placeholder="Describe what this project is about..."
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60">
                        Priority
                    </label>
                    <select
                        value={formData.priority || 'medium'}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/30"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Create Project
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};