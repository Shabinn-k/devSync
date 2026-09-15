import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Loader2, ArrowLeft, Users, Globe, MapPin, Calendar,
  UserPlus, Trash2,  X,
} from 'lucide-react';
import { useOrganizationStore } from '../store/organizationStore';
import { useAuthStore } from '../../../stores/authStore';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { OrganizationSettings } from '../components/OrganizationSettings';
import { TeamsTab } from '../../teams/components/TeamsTab';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { OrgChatButton } from '../../chat/components/OrgChatButton';
import toast from 'react-hot-toast';
import type { OrganizationRole } from '../types/organization';

export const OrganizationDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invitation') || searchParams.get('token');
  const initialTab = (searchParams.get('tab') as 'members' | 'teams' | 'settings') || 'members';

  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    currentOrganization,
    isLoading,
    error,
    fetchOrganizationById,
    deleteOrganization,
    updateMemberRole,
    removeMember,
  } = useOrganizationStore();

  const [activeTab, setActiveTab] = useState<'members' | 'teams' | 'settings'>(initialTab);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingDeleteOrg, setPendingDeleteOrg] = useState(false);
  const [isDeletingOrg, setIsDeletingOrg] = useState(false);
  const [pendingRemoveMember, setPendingRemoveMember] = useState<{ id: number; name: string } | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  useEffect(() => {
    if (inviteToken) {
      navigate(`/invite?token=${inviteToken}`, { replace: true });
    }
  }, [inviteToken, navigate]);

  useEffect(() => {
    if (id && !inviteToken) {
      fetchOrganizationById(Number(id));
    }
  }, [id, inviteToken, fetchOrganizationById]);
 
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (inviteToken) return null;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (error || !currentOrganization) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center bg-black p-6">
        <p className="text-red-400 text-sm">{error || 'Organization not found'}</p>
        <button
          onClick={() => id && fetchOrganizationById(Number(id))}
          className="mt-4 rounded-lg border border-white/10 bg-black px-4 py-2 text-sm text-white hover:bg-white/10 transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  const handleDeleteOrg = async () => {
    if (!id) return;
    setIsDeletingOrg(true);
    try {
      await deleteOrganization(Number(id));
      toast.success('Organization deleted');
      setPendingDeleteOrg(false);
      navigate('/organizations');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete organization');
    } finally {
      setIsDeletingOrg(false);
    }
  };

  const handleRoleChange = async (memberId: number, newRole: OrganizationRole) => {
    if (!id) return;
    setActionError(null);
    try {
      await updateMemberRole(Number(id), memberId, newRole);
      toast.success('Member role updated');
    } catch (err: any) {
      setActionError(err.message || 'Failed to update member role');
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!id || !pendingRemoveMember) return;
    setIsRemovingMember(true);
    setActionError(null);
    try {
      await removeMember(Number(id), pendingRemoveMember.id);
      toast.success(`Removed ${pendingRemoveMember.name}`);
      setPendingRemoveMember(null);
      await fetchOrganizationById(Number(id));
    } catch (err: any) {
      setActionError(err.message || 'Failed to remove member');
      toast.error(err.message || 'Failed to remove member');
    } finally {
      setIsRemovingMember(false);
    }
  };

  const currentMember = currentOrganization.members.find((m) => m.user_id === user?.id);
  const isAdmin =
    currentMember?.role === 'admin' ||
    user?.role === 'admin' ||
    user?.role === 'team_lead';
  const canEdit = Boolean(isAdmin);

  return (
    <div className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate('/organizations')}
          className="group mb-6 flex items-center gap-2 text-sm text-white/40 transition-all duration-200 hover:text-white"
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
        <div className="rounded-2xl border border-white/10 bg-black p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{currentOrganization.name}</h1>
              <p className="text-sm text-white/40 font-mono">@{currentOrganization.slug}</p>
              {currentOrganization.description && (
                <p className="mt-2 text-sm text-white/60">{currentOrganization.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/40 font-mono">
                {currentOrganization.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {currentOrganization.location}
                  </span>
                )}
                {currentOrganization.website && (
                  <a
                    href={
                      currentOrganization.website.match(/^https?:\/\//i)
                        ? currentOrganization.website
                        : `https://${currentOrganization.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-all duration-200"
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
            <div className="flex gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <UserPlus className="h-3.5 w-3.5 inline mr-1" />
                  Invite
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setPendingDeleteOrg(true)}
                  className="rounded-lg border border-red-500/30 bg-black px-3 py-1.5 text-xs text-red-400 hover:bg-red-600 hover:border-red-500 hover:text-white transition-all duration-200"
                >
                  <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex border-b border-white/10 gap-6">
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-3 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'members' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Members ({currentOrganization.members.length})
              {activeTab === 'members' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`pb-3 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'teams' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Teams
              {activeTab === 'teams' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'settings' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'members' && (
            <div className="rounded-2xl border border-white/10 bg-black p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/60">Members</h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white transition-all duration-200"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {currentOrganization.members.map((member) => {
                  const isSelf = member.user_id === user?.id;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-black px-4 py-3"
                    >
                      <div>
                        <p className="text-sm text-white">
                          {member.user_name || member.user_email || 'Member'}
                        </p>
                        <p className="text-xs text-white/40 font-mono">{member.user_email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAdmin && !isSelf ? (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleRoleChange(member.id, e.target.value as OrganizationRole)
                              }
                              className="rounded border border-white/10 bg-black px-2 py-1 text-xs text-white outline-none focus:border-white/30 transition-all duration-200"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() =>
                                setPendingRemoveMember({
                                  id: member.id,
                                  name: member.user_name || member.user_email,
                                })
                              }
                              className="text-white/30 hover:text-red-400 p-1 transition-all duration-200"
                              title="Remove Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-white/40 capitalize bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-mono">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <TeamsTab organizationId={Number(id)} canEdit={canEdit} />
          )}

          {activeTab === 'settings' && (
            <OrganizationSettings
              organization={currentOrganization}
              canEdit={canEdit}
              onUpdated={() => id && fetchOrganizationById(Number(id))}
            />
          )}
        </div>
      </div>

      <InviteMemberModal
        organizationId={Number(id)}
        organizationName={currentOrganization.name}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => fetchOrganizationById(Number(id))}
      />

      <ConfirmDialog
        isOpen={pendingDeleteOrg}
        title="Delete Organization?"
        message="This action cannot be undone. All teams, projects, and tasks in this organization will be permanently deleted."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeletingOrg}
        onConfirm={handleDeleteOrg}
        onCancel={() => setPendingDeleteOrg(false)}
      />

      <ConfirmDialog
        isOpen={!!pendingRemoveMember}
        title="Remove Member?"
        message={`Are you sure you want to remove ${pendingRemoveMember?.name || 'this member'} from the organization?`}
        confirmLabel="Remove"
        variant="danger"
        isLoading={isRemovingMember}
        onConfirm={handleConfirmRemoveMember}
        onCancel={() => setPendingRemoveMember(null)}
      />

      <OrgChatButton organizeId={Number(id)} orgName={currentOrganization.name} />
    </div>
  );
};

export default OrganizationDetailPage;