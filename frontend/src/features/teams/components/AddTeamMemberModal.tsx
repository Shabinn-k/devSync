import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Save, Loader2 } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { teamApi } from '../api/teamApi';
import { organizationApi } from '../../organizations/api/organizationApi';
import type { OrganizationMember } from '../../organizations/types/organization';
import type { TeamMember } from '../types/team';
import type { TeamRole } from '../types/team';

interface AddTeamMemberModalProps {
    teamId: number;
    orgId: number;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddTeamMemberModal = ({ teamId, orgId, onClose, onSuccess }: AddTeamMemberModalProps) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [role, setRole] = useState<TeamRole>('member');
    const [error, setError] = useState<string | null>(null);
    const { addMember, isSaving } = useTeamStore();

    useEffect(() => {
        let cancelled = false;
        setIsLoadingMembers(true);
        Promise.all([organizationApi.getMembers(orgId), teamApi.getMembers(teamId)])
            .then(([organizationMembers, currentTeamMembers]) => {
                if (cancelled) return;
                setOrgMembers(organizationMembers ?? []);
                setTeamMembers(currentTeamMembers ?? []);
            })
            .catch((err: any) => {
                if (!cancelled) {
                    setError(err?.response?.data?.message || err.message || 'Failed to load members');
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingMembers(false);
            });
        return () => { cancelled = true; };
    }, [orgId, teamId]);

    const eligibleMembers = orgMembers.filter(
        (member) => member.is_active !== false && !teamMembers.some((teamMember) => teamMember.user_id === member.user_id)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const parsedId = Number(selectedUserId);
        if (!parsedId || isNaN(parsedId)) {
            setError('Select a member');
            return;
        }

        try {
            await addMember(teamId, parsedId, role);
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err.message ||
                'Failed to add member to team'
            );
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
                    <UserPlus className="h-4 w-4 text-white/40" />
                    <h2 className="text-sm font-medium text-white">Add Team Member</h2>
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
                        Member *
                    </label>
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        disabled={isLoadingMembers || eligibleMembers.length === 0}
                        className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30 disabled:opacity-50"
                        required
                    >
                        <option value="">
                            {isLoadingMembers ? 'Loading members...' : eligibleMembers.length === 0 ? 'No members available to add' : 'Select a member...'}
                        </option>
                        {eligibleMembers.map((member) => (
                            <option key={member.user_id} value={member.user_id}>
                                {member.user_name || member.user_email} ({member.user_email})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                        Role
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as TeamRole)}
                        className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
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
                        disabled={isSaving || isLoadingMembers || !selectedUserId || eligibleMembers.length === 0}
                        className="flex items-center gap-1.5 rounded bg-white px-4 py-2 text-xs font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Save className="h-3.5 w-3.5" />
                                Add Member
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};
