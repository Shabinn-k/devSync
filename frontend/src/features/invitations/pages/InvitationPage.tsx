import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Loader2, Building2, Mail, User, Calendar, AlertCircle } from 'lucide-react';
import { useInvitationStore } from '../store/invitationStore';
import { useAuthStore } from '../../../stores/authStore';
import toast from 'react-hot-toast';

export const InvitationPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { currentInvitation, getInfo, accept, decline } = useInvitationStore();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('invitation') || searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'ready' | 'accepted' | 'declined' | 'error'>('loading');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await getInfo(token);
        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, getInfo]);

  const handleAccept = async () => {
    if (!token) return;

    if (!isAuthenticated || !user) {
      const redirectUrl = `/invite?token=${token}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    const organizeId = currentInvitation?.organization_id;
    setProcessing(true);
    try {
      await accept(token);
      setStatus('accepted');
      toast.success('Welcome to the organization!');
      setTimeout(() => {
        if (organizeId) {
          navigate(`/organizations/${organizeId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept');
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;

    const organizeId = currentInvitation?.organization_id;
    setProcessing(true);
    try {
      await decline(token);
      setStatus('declined');
      toast.success('Invitation declined');
      setTimeout(() => {
        if (organizeId) {
          navigate(`/organizations/${organizeId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline');
      setProcessing(false);
    }
  };

  const isEmailMismatch = Boolean(
    isAuthenticated && user && currentInvitation && user.email !== currentInvitation.email
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-black shadow-2xl overflow-hidden"
      >
        {/* LOADING */}
        {status === 'loading' && (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-white/40" />
          </div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Invalid Invitation</h3>
            <p className="mt-2 text-sm text-white/40">
              This invitation is invalid, expired, or already used.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 rounded-lg border border-white/10 px-6 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ACCEPTED */}
        {status === 'accepted' && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
              <Check className="h-7 w-7 text-green-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Welcome!</h3>
            <p className="mt-2 text-sm text-white/40">Redirecting you to the organization...</p>
          </div>
        )}

        {/* DECLINED */}
        {status === 'declined' && (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <X className="h-7 w-7 text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Invitation Declined</h3>
            <p className="mt-2 text-sm text-white/40">Redirecting...</p>
          </div>
        )}

        {/* READY */}
        {status === 'ready' && currentInvitation && (
          <>
            <div className="border-b border-white/10 px-6 py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-black">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">
                Organization Invitation
              </h2>
              <p className="mt-1 text-xs font-mono uppercase tracking-widest text-white/40">
                You've been invited
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-lg border border-white/10 bg-black divide-y divide-white/5">
                {[
                  {
                    icon: Building2,
                    label: 'Organization',
                    value: currentInvitation.organization_name || `Org #${currentInvitation.organization_id}`,
                  },
                  { icon: Mail, label: 'Email', value: currentInvitation.email },
                  { icon: User, label: 'Role', value: currentInvitation.role },
                  {
                    icon: Calendar,
                    label: 'Expires',
                    value: new Date(currentInvitation.expires_at).toLocaleDateString(),
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/40">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </span>
                    <span className="text-sm text-white truncate max-w-[200px]">{value}</span>
                  </div>
                ))}
              </div>

              {isEmailMismatch && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Email mismatch</p>
                    <p className="mt-0.5 text-yellow-400/70">
                      Sent to <strong>{currentInvitation.email}</strong>. You're logged in as{' '}
                      <strong>{user?.email}</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDecline}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-black px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-red-600 hover:border-red-500 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  disabled={processing || isEmailMismatch}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-black px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-green-600 hover:border-green-500 disabled:opacity-50"
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

              {!isAuthenticated && (
                <p className="text-center text-xs font-mono text-white/30">
                  You'll be asked to login
                </p>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default InvitationPage;