import { useState } from 'react';
import { Users, UserPlus, Trash2, Crown, Shield, Eye } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../../../stores/authStore';
import type { ProjectRole, ProjectDetail } from '../types/project';

interface ProjectMembersProps {
    project: ProjectDetail;
    onAddMember: () => void;
}

const getRoleIcon = (role: ProjectRole) => {
    switch (role) {
        case 'admin': return <Crown className="h-3.5 w-3.5 text-yellow-400" />;
        case 'member': return <Shield className="h-3.5 w-3.5 text-blue-400" />;
        default: return <Eye className="h-3.5 w-3.5 text-gray-400" />;
    }
};

const getRoleColor = (role: ProjectRole) => {
    switch (role) {
        case 'admin': return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
        case 'member': return 'border-blue-500/20 bg-blue-500/10 text-blue-400';
        default: return 'border-gray-500/20 bg-gray-500/10 text-gray-400';
    }
};

export const ProjectMembers = ({ project, onAddMember }: ProjectMembersProps) => {
    const { user } = useAuthStore();
    const { updateMemberRole, removeMember } = useProjectStore();
    const [actionError, setActionError] = useState<string | null>(null);

    const isAdmin = project.members.some(
        (m) => m.user_id === user?.id && m.role === 'admin'
    );

    const handleRoleChange = async (memberId: number, newRole: ProjectRole) => {
        setActionError(null);
        try {
            await updateMemberRole(project.id, memberId, newRole);
        } catch (err: any) {
            setActionError(err.message || 'Failed to update role');
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        setActionError(null);
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await removeMember(project.id, memberId);
        } catch (err: any) {
            setActionError(err.message || 'Failed to remove member');
        }
    };

    return (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-white/40" />
                    <h3 className="text-sm font-medium text-white">Members</h3>
                    <span className="text-xs text-white/30">({project.members.length})</span>
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
                {project.members.map((member) => {
                    const isSelf = member.user_id === user?.id;

                    return (
                        <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                                    {member.user_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm text-white">{member.user_name}</p>
                                    <p className="text-xs text-white/30">{member.user_email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {isAdmin && !isSelf ? (
                                    <>
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value as ProjectRole)}
                                            className={`rounded border px-2 py-1 text-xs outline-none ${getRoleColor(member.role)}`}
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
                                    <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${getRoleColor(member.role)}`}>
                                        {getRoleIcon(member.role)}
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