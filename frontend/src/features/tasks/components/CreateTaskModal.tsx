import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, PlusCircle, Save, Loader2, User } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../../projects/store/projectStore';
import api from '../../../lib/axios'; 
import type { CreateTaskRequest, TaskPriority } from '../types/task';

interface CreateTaskModalProps {
    projectId?: number;
    initialStatus?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

interface ProjectMember {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    role: string;
}

export const CreateTaskModal = ({ projectId, onClose, onSuccess }: CreateTaskModalProps) => {
    const { projects, fetchMyProjects } = useProjectStore();
    const [selectedProjectId, setSelectedProjectId] = useState<number>(projectId || 0);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const [formData, setFormData] = useState<CreateTaskRequest>({
        project_id: projectId || 0,
        title: '',
        description: '',
        priority: 'medium',
        assignee_id: null,
        due_date: null,
    });
    const [error, setError] = useState<string | null>(null);
    const { createTask, isSaving } = useTaskStore();

    // Load user's projects if no project was passed in
    useEffect(() => {
        if (!projectId) {
            fetchMyProjects();
        }
    }, [projectId, fetchMyProjects]);

    useEffect(() => {
        if (!projectId && projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
            setFormData((prev) => ({ ...prev, project_id: projects[0].id }));
        }
    }, [projectId, projects, selectedProjectId]);

    // Load members whenever the target project changes
    useEffect(() => {
        const targetProjId = projectId || selectedProjectId || formData.project_id;
        if (!targetProjId) {
            setMembers([]);
            return;
        }
        let cancelled = false;
        setLoadingMembers(true);
        api.get<ProjectMember[]>(`/projects/${targetProjId}/members`)
            .then((res) => {
                if (!cancelled) setMembers(res.data || []);
            })
            .catch(() => {
                if (!cancelled) setMembers([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingMembers(false);
            });
        return () => { cancelled = true; };
    }, [projectId, selectedProjectId, formData.project_id]);

    // If the selected assignee isn't in this project anymore, clear it
    useEffect(() => {
        if (formData.assignee_id && members.length > 0) {
            const stillMember = members.some((m) => m.user_id === formData.assignee_id);
            if (!stillMember) {
                setFormData((prev) => ({ ...prev, assignee_id: null }));
            }
        }
    }, [members]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const targetProjId = projectId || selectedProjectId || formData.project_id;
        if (!targetProjId) {
            setError('Please select a project');
            return;
        }
        if (!formData.title.trim()) {
            setError('Task title is required');
            return;
        }

        try {
            await createTask({ ...formData, project_id: targetProjId });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create task');
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
                    <PlusCircle className="h-4 w-4 text-white/40" />
                    <h2 className="text-sm font-medium text-white">Create Task</h2>
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
                {!projectId && (
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Project *
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                setSelectedProjectId(id);
                                setFormData((prev) => ({ ...prev, project_id: id, assignee_id: null }));
                            }}
                            className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
                            required
                        >
                            <option value={0} disabled>Select a project...</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        placeholder="Enter task title..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Description
                    </label>
                    <textarea
                        placeholder="Describe the task..."
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Priority
                        </label>
                        <select
                            value={formData.priority || 'medium'}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                            className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.due_date || ''}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value || null })}
                            className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Assign To
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 pointer-events-none" />
                        <select
                            value={formData.assignee_id ?? ''}
                            onChange={(e) => {
                                const v = e.target.value;
                                setFormData({ ...formData, assignee_id: v ? Number(v) : null });
                            }}
                            disabled={loadingMembers}
                            className="mt-1 w-full appearance-none rounded border border-white/10 bg-black pl-10 pr-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30 disabled:opacity-50"
                        >
                            <option value="">
                                {loadingMembers ? 'Loading members...' : 'Unassigned'}
                            </option>
                            {members.map((m) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.user_name} ({m.user_email})
                                </option>
                            ))}
                        </select>
                    </div>
                    {!loadingMembers && members.length === 0 && (projectId || selectedProjectId) && (
                        <p className="mt-1 text-xs text-white/30">No members in this project yet.</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex w-full items-center justify-center gap-2 rounded bg-white py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating Task...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Create Task
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
};