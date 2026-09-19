import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Trash2, Crown } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../../../stores/authStore';
import { TeamMembers, AddTeamMemberModal } from '../components';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import toast from 'react-hot-toast';

export const TeamDetailPage = () => {
  const { organizeId, teamId } = useParams<{ organizeId: string; teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTeam, isLoading, error, fetchById, deleteTeam } = useTeamStore();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchById(Number(teamId));
    }
  }, [teamId, fetchById]);

  const handleDelete = async () => {
    if (!teamId) return;
    setIsDeleting(true);
    try {
      await deleteTeam(Number(teamId));
      toast.success('Team deleted');
      navigate(`/organizations/${organizeId}?tab=teams`, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (error || !currentTeam) {
    return (
      <div className="flex h-64 flex-col items-center justify-center bg-black text-center">
        <p className="text-red-400">{error || 'Team not found'}</p>
        <button
          onClick={() => teamId && fetchById(Number(teamId))}
          className="mt-4 rounded-lg border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
        >
          Try Again
        </button>
      </div>
    );
  }

  const members = currentTeam.members ?? [];
  const isAdmin =
    members.some((m) => m.user_id === user?.id && m.role === 'admin') ||
    currentTeam.lead_id === user?.id ||
    user?.role === 'admin' ||
    user?.role === 'team_lead';

  return (
    <div className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(`/organizations/${organizeId}?tab=teams`)}
          className="group mb-6 flex items-center gap-2 text-sm text-white/40 transition-all hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Teams
        </button>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{currentTeam.name}</h1>
              {currentTeam.lead_name && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-yellow-400">
                  <Crown className="h-3.5 w-3.5" />
                  Lead: {currentTeam.lead_name}
                </p>
              )}
             
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Team
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <TeamMembers team={currentTeam} onAddMember={() => setShowAddMember(true)} />
        </div>
      </div>

      {showAddMember && teamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6">
            <AddTeamMemberModal
              teamId={Number(teamId)}
              onClose={() => setShowAddMember(false)}
              onSuccess={() => teamId && fetchById(Number(teamId))}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Team?"
        message={`This will permanently delete "${currentTeam.name}" and remove all its members.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default TeamDetailPage;