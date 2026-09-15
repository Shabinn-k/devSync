import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users, Loader2, ArrowLeft } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { TeamCard, CreateTeamModal } from '../components';

export const TeamsPage = () => {
    const { organizeId } = useParams<{ organizeId: string }>();
    const navigate = useNavigate();
    const { teams, isLoading, error, fetchByOrganization, fetchMyTeams } = useTeamStore();
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (organizeId) {
            fetchByOrganization(Number(organizeId));
        } else {
            fetchMyTeams();
        }
    }, [organizeId, fetchByOrganization, fetchMyTeams]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => organizeId ? navigate(`/organizations/${organizeId}`) : navigate('/dashboard')}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Teams</h1>
                            <p className="text-sm text-white/40">Manage cross-functional organization teams</p>
                        </div>
                    </div>
                    {organizeId && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-black px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600 hover:border-green-500"
                        >
                            <Plus className="h-4 w-4" />
                            Create Team
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {teams.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
                        <Users className="h-10 w-10 text-white/20 mb-3" />
                        <h3 className="text-sm font-medium text-white">No teams yet</h3>
                        <p className="mt-1 text-xs text-white/40">Create a team to organize collaborators</p>
                        {organizeId && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-1.5 text-xs text-white hover:bg-white/10"
                            >
                                <Plus className="h-3 w-3" />
                                Add Team
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {teams.map((team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && organizeId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6">
                        <CreateTeamModal
                            organizationId={Number(organizeId)}
                            onClose={() => setShowCreateModal(false)}
                            onSuccess={() => fetchByOrganization(Number(organizeId))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;