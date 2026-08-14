import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  ArrowLeft, 
  Users, 
  Globe, 
  MapPin, 
  Calendar, 
  UserPlus,
  Trash2,
  Settings,
  X
} from 'lucide-react';
import { useOrganizationStore } from '../store/organizationStore';
import { useAuthStore } from '../../../stores/authStore';
import { AddMemberModal } from '../components/AddMemberModal';
import { EditOrganizationModal } from '../components/EditOrganizationModal';
import type { OrganizationRole } from '../types/organization';

const OrganizationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentOrganization, 
    isLoading, 
    error, 
    fetchOrganizationById, 
    deleteOrganization,
    updateMemberRole,
    removeMember
  } = useOrganizationStore();
  
  const { user } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrganizationById(id);
    }
  }, [id]);

  const handleDelete = async () => {
    if (id) {
      await deleteOrganization(id);
      navigate('/organizations');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: OrganizationRole) => {
    if (!id) return;
    setActionError(null);
    try {
      await updateMemberRole(id, memberId, newRole);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;
    setActionError(null);
    try {
      await removeMember(id, memberId);
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove member');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (error || !currentOrganization) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <p className="text-red-400">{error || 'Organization not found'}</p>
        <button
          onClick={() => id && fetchOrganizationById(id)}
          className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isAdmin = currentOrganization.members.some(
    (m) => m.user_id === user?.id && m.role === 'admin'
  );

  return (
    <div className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/organizations')}
          className="group mb-6 flex items-center gap-2 text-sm text-white/40 transition-all hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Organizations
        </button>

        {actionError && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{currentOrganization.name}</h1>
              <p className="text-sm text-white/40">@{currentOrganization.slug}</p>
              {currentOrganization.description && (
                <p className="mt-2 text-sm text-white/50">{currentOrganization.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/30">
                {currentOrganization.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {currentOrganization.location}
                  </span>
                )}
                {currentOrganization.website && (
                  <a
                    href={currentOrganization.website.match(/^https?:\/\//i) ? currentOrganization.website : `https://${currentOrganization.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white/50"
                  >
                    <Globe className="h-3 w-3" />
                    Website
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {currentOrganization.member_count || currentOrganization.members.length} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {new Date(currentOrganization.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10"
                >
                  <Settings className="h-3 w-3 inline mr-1" />
                  Settings
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-full border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3 inline mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white/60">Members</h3>
            {isAdmin && (
              <button 
                onClick={() => setShowAddMember(true)}
                className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </button>
            )}
          </div>
          <div className="space-y-2">
            {currentOrganization.members.map((member) => {
              const isSelf = member.user_id === user?.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-white">{member.user_name || member.user_email || 'Member'}</p>
                    <p className="text-xs text-white/30">{member.user_email}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isAdmin && !isSelf ? (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as OrganizationRole)}
                          className="rounded border border-white/10 bg-black px-2 py-1 text-xs text-white outline-none focus:border-white/30"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          <option value="viewer">Viewer</option>
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
                      <span className="text-xs text-white/40 capitalize bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6">
            <AddMemberModal
              organizationId={id}
              onClose={() => setShowAddMember(false)}
              onSuccess={() => fetchOrganizationById(id)}
            />
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditModal && currentOrganization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6">
            <EditOrganizationModal
              organization={currentOrganization}
              onClose={() => setShowEditModal(false)}
              onSuccess={() => id && fetchOrganizationById(id)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/95 p-6">
            <h3 className="text-lg font-semibold text-white">Delete Organization?</h3>
            <p className="mt-2 text-sm text-white/40">
              This action cannot be undone. All teams and projects will be deleted.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetailPage;