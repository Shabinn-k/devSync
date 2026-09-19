import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Users, Trash2, ArrowRight } from 'lucide-react';
import { useTeamStore } from '../store/teamStore';
import { useAuthStore } from '../../../stores/authStore';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { CreateTeamModal } from './CreateTeamModal';
import toast from 'react-hot-toast';

interface TeamsTabProps {
  organizationId: number;
  canEdit: boolean;
}

export const TeamsTab = ({ organizationId, canEdit }: TeamsTabProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { teams, isLoading, error, fetchByOrganization, deleteTeam } = useTeamStore();
  const [showCreate, setShowCreate] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchByOrganization(organizationId);
  }, [organizationId, fetchByOrganization]);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteTeam(pendingDelete.id);
      toast.success(`Team "${pendingDelete.name}" deleted`);
      setPendingDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/60">Teams ({teams.length})</h3>
        {canEdit && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white/70 hover:bg-green-600 hover:border-green-500 hover:text-white transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5" />
            New Team
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {teams.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center">
          <Users className="h-8 w-8 text-white/20 mb-3" />
          <p className="text-sm text-white/60">No teams yet</p>
          <p className="mt-1 text-xs text-white/30">
            {canEdit ? 'Create a team to organize your members' : 'Ask an admin to create a team'}
          </p>
        </div>
      )}

      {teams.length > 0 && (
        <div className="space-y-2">
          {teams.map((team) => {
            const isLead = team.lead_id === user?.id;
            return (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-black px-4 py-3 hover:border-white/20 transition-all duration-200"
              >
                <button
                  onClick={() =>
                    navigate(`/organizations/${organizationId}/teams/${team.id}`)
                  }
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium">{team.name}</p>
                    {isLead && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                        Lead
                      </span>
                    )}
                  </div>
                  
                  <p className="mt-1 text-[11px] font-mono text-white/30">
                    {team.member_count ?? team.members?.length ?? 0} members
                  </p>
                </button>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() =>
                      navigate(`/organizations/${organizationId}/teams/${team.id}`)
                    }
                    className="p-1 text-white/40 hover:text-white transition-colors"
                    title="Open team"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => setPendingDelete({ id: team.id, name: team.name })}
                      className="p-1 text-white/30 hover:text-red-400 transition-colors"
                      title="Delete team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateTeamModal
          organizationId={organizationId}
          onClose={() => setShowCreate(false)}
          onSuccess={() => fetchByOrganization(organizationId)}
        />
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete Team?"
        message={`This will permanently delete "${pendingDelete?.name}" and remove all its members. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};