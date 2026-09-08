import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Trash2, Crown } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../../../stores/authStore';
import { TeamMembers, AddTeamMemberModal } from '../components';

export const TeamDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { currentTeam, isLoading, error, fetchTeamById, deleteTeam } = useTeamStore();
    const [showAddMember, setShowAddMember] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTeamById(Number(id));
        }
    }, [id]);

    const handleDelete = async () => {
        if (!id || !confirm('Are you sure you want to delete this team?')) return;
        await deleteTeam(Number(id));
        navigate(-1);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
        );
    }

    if (error || !currentTeam) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-red-400">{error || 'Team not found'}</p>
                <button
                    onClick={() => id && fetchTeamById(Number(id))}
                    className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const isAdmin = currentTeam.members.some(
        (m) => m.user_id === user?.id && m.role === 'admin'
    ) || currentTeam.lead_id === user?.id;

    return (
        <div className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="group mb-6 flex items-center gap-2 text-sm text-white/40 transition-all hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back
                </button>

                {/* Header */}
                <div className="rounded-2xl border border-white/5 bg-white/5 p-6 sm:p-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{currentTeam.name}</h1>
                            {currentTeam.lead && (
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-yellow-400">
                                    <Crown className="h-3.5 w-3.5" />
                                    Lead: {currentTeam.lead.name} ({currentTeam.lead.email})
                                </p>
                            )}
                            {currentTeam.description && (
                                <p className="mt-3 text-sm text-white/50">{currentTeam.description}</p>
                            )}
                        </div>

                        {isAdmin && (
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 rounded-full border border-red-500/20 px-3.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Team
                            </button>
                        )}
                    </div>
                </div>

                {/* Members Section */}
                <div className="mt-6">
                    <TeamMembers
                        team={currentTeam}
                        onAddMember={() => setShowAddMember(true)}
                    />
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMember && id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6">
                        <AddTeamMemberModal
                            teamId={Number(id)}
                            onClose={() => setShowAddMember(false)}
                            onSuccess={() => id && fetchTeamById(Number(id))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
