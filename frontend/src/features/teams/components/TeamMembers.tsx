import { useState } from 'react';
import { Users, UserPlus, Trash2, Crown, Shield } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../../../stores/authStore';
import type { TeamDetail, TeamRole } from '../types/team';

interface TeamMembersProps {
    team: TeamDetail;
    onAddMember: () => void;
}

export const TeamMembers = ({ team, onAddMember }: TeamMembersProps) => {
    const { user } = useAuthStore();
    const { updateMemberRole, removeMember } = useTeamStore();
    const [actionError, setActionError] = useState<string | null>(null);

    const isAdmin = team.members.some(
        (m) => m.user_id === user?.id && m.role === 'admin'
    ) || team.lead_id === user?.id;

    const handleRoleChange = async (memberId: number, newRole: TeamRole) => {
        setActionError(null);
        try {
            await updateMemberRole(team.id, memberId, newRole);
        } catch (err: any) {
            setActionError(err.message || 'Failed to update role');
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        setActionError(null);
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            await removeMember(team.id, memberId);
        } catch (err: any) {
            setActionError(err.message || 'Failed to remove member');
        }
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/40" />
                    <h3 className="text-sm font-medium text-white">Team Members</h3>
                    <span className="text-xs text-white/30">({team.members.length})</span>
                </div>
                {isAdmin && (
                    <button
                        onClick={onAddMember}
                        className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Member
                    </button>
                )}
            </div>

            {actionError && (
                <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
                    {actionError}
                </div>
            )}

            <div className="space-y-2">
                {team.members.map((member) => {
                    const isSelf = member.user_id === user?.id;
                    const isLead = member.user_id === team.lead_id;

                    return (
                        <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                                    {member.user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-white">{member.user?.name || `User #${member.user_id}`}</p>
                                        {isLead && (
                                            <span className="inline-flex items-center gap-1 rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] text-yellow-400">
                                                <Crown className="h-2.5 w-2.5" />
                                                Lead
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/30">{member.user?.email || `ID: ${member.user_id}`}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isAdmin && !isSelf && !isLead ? (
                                    <>
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                                            className="rounded border border-white/10 bg-black px-2 py-1 text-xs text-white outline-none focus:border-white/30"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="member">Member</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="text-white/30 hover:text-red-400 transition-colors p-1"
                                            title="Remove Member"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400 capitalize">
                                        <Shield className="h-3 w-3" />
                                        {member.role}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
