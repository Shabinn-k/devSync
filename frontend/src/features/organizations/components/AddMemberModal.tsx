import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Save, Loader2 } from 'lucide-react';
import { useOrganizationStore } from '../store/organizationStore';
import type { OrganizationRole } from '../types/organization';

interface AddMemberModalProps {
  organizationId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddMemberModal = ({ organizationId, onClose, onSuccess }: AddMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<OrganizationRole>('member');
  const [localError, setLocalError] = useState<string | null>(null);

  const { addMember, isSaving, error, clearError } = useOrganizationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() && !userId.trim()) {
      setLocalError('Please provide an email or User ID');
      return;
    }

    try {
      await addMember(organizationId, {
        ...(userId.trim() && { user_id: userId.trim() }),
        ...(email.trim() && { email: email.trim() }),
        role,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to add member');
    }
  };

  const displayError = error || localError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-medium text-white">Add Organization Member</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {displayError && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            User Email
          </label>
          <input
            type="email"
            placeholder="member@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            User ID (Optional fallback)
          </label>
          <input
            type="text"
            placeholder="UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as OrganizationRole)}
            className="w-full rounded border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded bg-white py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding Member...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Add Member
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};