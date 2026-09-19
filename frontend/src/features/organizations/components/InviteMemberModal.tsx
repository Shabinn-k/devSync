import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Loader2, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useInvitationStore } from '../../invitations/store/invitationStore';
import type { InvitationRole } from '../../invitations/types/invitation';
import toast from 'react-hot-toast';

interface InviteMemberModalProps {
    organizationId: number;
    organizationName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const InviteMemberModal = ({
    organizationId,
    organizationName,
    isOpen,
    onClose,
    onSuccess,
}: InviteMemberModalProps) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<InvitationRole>('member');
    const [localError, setLocalError] = useState<string | null>(null);
    const [invitationSent, setInvitationSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');
    const { invite, isSaving, error, clearError } = useInvitationStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        clearError();
        setInvitationSent(false);

        if (!email.trim()) {
            setLocalError('Please enter an email address');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        try {
            await invite(organizationId, { email: email.trim(), role });
            setInvitationSent(true);
            setSentEmail(email);
            toast.success(`Invitation sent to ${email}`);
            onSuccess?.();
            setEmail('');
        } catch (err: any) {
            setLocalError(err.message || 'Failed to send invitation');
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            setEmail('');
            setRole('member');
            setLocalError(null);
            setInvitationSent(false);
            clearError();
            onClose();
        }
    };

    const displayError = error || localError;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2.5">
                                        <Mail className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Invite Member</h2>
                                        <p className="text-xs text-white/40">to {organizationName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                                    disabled={isSaving}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Success State */}
                            {invitationSent ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-6 text-center"
                                >
                                    <div className="rounded-full bg-green-500/20 p-3">
                                        <CheckCircle className="h-8 w-8 text-green-400" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-medium text-white">Invitation Sent!</h3>
                                    <p className="mt-1 text-sm text-white/40">
                                        An invitation email has been sent to
                                        <br />
                                        <span className="text-white/60 font-medium">{sentEmail}</span>
                                    </p>
                                    <p className="mt-4 text-xs text-white/30">
                                        The user will receive an email with accept/decline options
                                    </p>
                                    <button
                                        onClick={handleClose}
                                        className="mt-6 rounded-lg border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                                    >
                                        Done
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Error */}
                                    {displayError && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400"
                                        >
                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            <span>{displayError}</span>
                                        </motion.div>
                                    )}

                                    {/* Email Input */}
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                                            Email Address <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative mt-1.5">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="colleague@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-white/30">
                                            They'll receive an email with accept/decline options
                                        </p>
                                    </div>

                                    {/* Role Selection */}
                                    <div>
                                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                                            Role
                                        </label>
                                        <div className="relative mt-1.5">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <select
                                                value={role}
                                                onChange={(e) => setRole(e.target.value as InvitationRole)}
                                                className="w-full rounded-lg border border-white/10 bg-black pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/30"
                                                disabled={isSaving}
                                            >
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 transition-colors"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving || !email.trim()}
                                            className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Send Invite
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};