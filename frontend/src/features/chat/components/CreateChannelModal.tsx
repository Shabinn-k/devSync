import React, { useState, useEffect } from 'react';
import { X, Loader2, Building2, Users, User } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useOrganizationStore } from '../../organizations/store/organizationStore';
import { useTeamStore } from '../../teams/store/teamStore'; 

interface CreateChannelModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalType = 'org' | 'team' | 'direct';

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ModalType>('org');
  const [orgId, setOrgId] = useState<number>(0);
  const [teamId, setTeamId] = useState<number>(0);
  const [recipientId, setRecipientId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createChannel, openDirectChat } = useChatStore();
  const { organizations, fetchMyOrganizations } = useOrganizationStore();
  const { teams, fetchMyTeams } = useTeamStore();
 
  useEffect(() => {
    fetchMyOrganizations();
    fetchMyTeams().catch(() => {});
  }, [fetchMyOrganizations, fetchMyTeams]);
 
  useEffect(() => {
    if (type === 'org' && !orgId && organizations.length > 0) {
      setOrgId(organizations[0].id);
    }
  }, [type, orgId, organizations]);
 
  useEffect(() => {
    if (type === 'team' && !teamId && teams.length > 0) {
      setTeamId(teams[0].id);
    }
  }, [type, teamId, teams]);
 
  const allMembers = React.useMemo(() => {
    const map = new Map<number, { id: number; name: string; email: string }>();
    organizations.forEach((org: any) => {
      (org.members || []).forEach((m: any) => {
        const uid = m.user_id ?? m.id;
        if (!map.has(uid)) {
          map.set(uid, {
            id: uid,
            name: m.user_name || m.name || `User #${uid}`,
            email: m.email || '',
          });
        }
      });
    });
    return Array.from(map.values());
  }, [organizations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (type === 'direct') {
        if (!recipientId) {
          setError('Please select a user');
          return;
        }
        setIsSubmitting(true);
        await openDirectChat(recipientId);
      } else {
        if (!name.trim()) {
          setError('Channel name is required');
          return;
        }
        if (type === 'org' && !orgId) {
          setError('Please select an organization');
          return;
        }
        if (type === 'team' && !teamId) {
          setError('Please select a team');
          return;
        }

        setIsSubmitting(true);
        await createChannel({
          name: name.trim(),
          type: type === 'team' ? 'project' : type,  
          organization_id: type === 'org' ? orgId : undefined,
          team_id: type === 'team' ? teamId : undefined, 
        });
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || 'Failed to create channel'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectClass =
    'w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30';
  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <h3 className="text-base font-semibold text-white">New Channel</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'org', label: 'General' },
                { key: 'team', label: 'Team' },
                { key: 'direct', label: 'Individual' },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    type === t.key
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Organization picker (General only) */}
          {type === 'org' && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5">
                <Building2 className="h-3 w-3" /> Organization
              </label>
              <select
                value={orgId}
                onChange={(e) => setOrgId(Number(e.target.value))}
                className={selectClass}
                required
              >
                <option value={0} disabled>
                  Select organization
                </option>
                {organizations.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Team picker (Team only) */}
          {type === 'team' && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5">
                <Users className="h-3 w-3" /> Team
              </label>
              {teams.length === 0 ? (
                <p className="text-xs text-white/40">
                  No teams yet. Create a team first from the Teams page.
                </p>
              ) : (
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(Number(e.target.value))}
                  className={selectClass}
                  required
                >
                  <option value={0} disabled>
                    Select team
                  </option>
                  {teams.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Channel name (General + Team) */}
          {type !== 'direct' && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5">
                Channel Name
              </label>
              <input
                type="text"
                placeholder="e.g. general, frontend"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          )}

          {/* Recipient picker (Individual) */}
          {type === 'direct' && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5">
                <User className="h-3 w-3" /> Select User
              </label>
              {allMembers.length === 0 ? (
                <p className="text-xs text-white/40">
                  No other members in your organizations.
                </p>
              ) : (
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(Number(e.target.value))}
                  className={selectClass}
                  required
                >
                  <option value={0} disabled>
                    Choose a user
                  </option>
                  {allMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                      {m.email ? ` (${m.email})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-white/60 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-white/10 bg-black py-2.5 text-sm font-medium text-white transition-all hover:bg-green-600 hover:border-green-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};