import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, Loader2, Building2, Mail, User, Calendar, 
  AlertCircle
} from 'lucide-react';
import { useInvitationStore } from '../../invitations/store/invitationStore';
import { useAuthStore } from '../../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface InvitationModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onAccepted?: () => void;
}

export const InvitationModal = ({ token, isOpen, onClose, onAccepted }: InvitationModalProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { currentInvitation, getInfo, accept, decline } = useInvitationStore();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'accepted' | 'declined' | 'error'>('loading');

  useEffect(() => {
    if (isOpen && token) {
      const loadInvitation = async () => {
        try {
          await getInfo(token);
          setStatus('ready');
        } catch (err) {
          setStatus('error');
        }
      };
      loadInvitation();
    }
  }, [isOpen, token]);

  const handleAccept = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please login first to accept the invitation');
      navigate(`/login?redirect=/organizations/${currentInvitation?.organization_id}?invitation=${token}`);
      return;
    }

    setProcessing(true);
    try {
      await accept(token);
      setStatus('accepted');
      toast.success('🎉 Welcome to the organization!');
      setTimeout(() => {
        onAccepted?.();
        onClose();
        navigate(`/organizations/${currentInvitation?.organization_id}`);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invitation');
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      await decline(token);
      setStatus('declined');
      toast.success('Invitation declined');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline invitation');
      setProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            onClick={status === 'ready' ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Loading State */}
              {status === 'loading' && (
                <div className="flex items-center justify-center p-16">
                  <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                </div>
              )}

              {/* Error State */}
              {status === 'error' && (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">Invalid Invitation</h3>
                  <p className="mt-2 text-sm text-white/40">
                    This invitation is invalid or has expired.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 rounded-lg border border-white/10 px-6 py-2 text-sm text-white/60 hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Accepted State */}
              {status === 'accepted' && (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
                  >
                    <Check className="h-8 w-8 text-green-400" />
                  </motion.div>
                  <h3 className="mt-4 text-lg font-bold text-white">Welcome! 🎉</h3>
                  <p className="mt-2 text-sm text-white/40">
                    You've joined the organization successfully!
                  </p>
                </div>
              )}

              {/* Declined State */}
              {status === 'declined' && (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20"
                  >
                    <X className="h-8 w-8 text-yellow-400" />
                  </motion.div>
                  <h3 className="mt-4 text-lg font-bold text-white">Invitation Declined</h3>
                  <p className="mt-2 text-sm text-white/40">
                    You've declined the invitation.
                  </p>
                </div>
              )}

              {/* Ready State - Main Modal */}
              {status === 'ready' && currentInvitation && (
                <>
                  {/* Header */}
                  <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 px-6 pt-8 pb-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-white">
                      Organization Invitation
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                      You've been invited to join a team
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Organization Info */}
                    <div className="space-y-3 rounded-xl border border-white/5 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                          <Building2 className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/40">Organization</p>
                          <p className="text-sm font-medium text-white truncate">
                            {currentInvitation.organization_name || `Organization #${currentInvitation.organization_id}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                          <Mail className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/40">Invited Email</p>
                          <p className="text-sm font-medium text-white truncate">
                            {currentInvitation.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                          <User className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/40">Your Role</p>
                          <p className="text-sm font-medium text-white capitalize">
                            {currentInvitation.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                          <Calendar className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/40">Expires</p>
                          <p className="text-sm font-medium text-white">
                            {new Date(currentInvitation.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email Mismatch Warning */}
                    {isAuthenticated && user && user.email !== currentInvitation.email && (
                      <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-400">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Email Mismatch</p>
                          <p className="mt-0.5 text-yellow-400/70">
                            This invitation was sent to <strong>{currentInvitation.email}</strong>,
                            but you're logged in as <strong>{user.email}</strong>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleDecline}
                        disabled={processing}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                      <button
                        onClick={handleAccept}
                       disabled={processing || Boolean(isAuthenticated && user && user.email !== currentInvitation.email)}
                        className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Accept
                          </>
                        )}
                      </button>
                    </div>

                    {/* Login prompt for unauthenticated */}
                    {!isAuthenticated && (
                      <p className="text-center text-xs text-white/30">
                        You'll need to login first to accept the invitation
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};