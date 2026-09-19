import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Save, Loader2 } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../../../stores/authStore';
import type { CreateTeamRequest } from '../types/team';

interface CreateTeamModalProps {
    organizationId: number;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateTeamModal = ({ organizationId, onClose, onSuccess }: CreateTeamModalProps) => {
    const { user } = useAuthStore();
    const [formData, setFormData] = useState<CreateTeamRequest>({
        organization_id: organizationId,
        name: '', 
        lead_id: user?.id || 1,
    });
    const [error, setError] = useState<string | null>(null);
    const { createTeam, isSaving } = useTeamStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError('Team name is required');
            return;
        }

        try {
            await createTeam(formData);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create team');
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
                    <Users className="h-4 w-4 text-white/40" />
                    <h2 className="text-sm font-medium text-white">Create Team</h2>
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
                        Team Name *
                    </label>
                    <input
                        type="text"
                        placeholder="Frontend Engineers"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
                        required
                    />
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
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-3.5 w-3.5" />
                                Create Team
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};
