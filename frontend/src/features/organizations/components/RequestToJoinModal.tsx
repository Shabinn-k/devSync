import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useJoinRequestStore } from '../store/joinRequestStore';

interface Props {
  orgId: number;
  orgName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestToJoinModal = ({ orgId, orgName, onClose, onSuccess }: Props) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { create } = useJoinRequestStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await create(orgId, message.trim());
      toast.success('Request sent');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6 text-white"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold">Request to join</h2>
          <p className="text-xs text-white/40 mt-0.5">{orgName}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Tell the admins why you'd like to join..."
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30"
          />
          <p className="mt-1 text-xs text-white/30">{message.length}/500</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send Request
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};