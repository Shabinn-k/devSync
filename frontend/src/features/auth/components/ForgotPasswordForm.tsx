import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthInput } from './AuthInput';
import { useAuthStore } from '../../../stores/authStore';

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { forgotPassword, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);
        clearError();

        if (!email) {
            setValidationError('Email is required.');
            return;
        }

        try {
            await forgotPassword(email);
            setIsSubmitted(true);
        } catch { 
        }
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="mb-4">
                    <div className="flex items-center gap-2.5">
                        <span className="h-5 w-5 rounded-[4px] border-2 border-white" />
                        <span className="text-sm font-bold tracking-[0.08em] text-white">DEVSYNC</span>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Check your email</h2>
                    <p className="mt-2 text-sm text-white/60">
                        We've sent a password reset link to:
                        <br />
                        <span className="font-semibold text-white">{email}</span>
                    </p>
                    <p className="mt-4 text-xs text-white/40">
                        Didn't receive the email?{' '}
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="font-semibold text-white hover:underline"
                        >
                            Try again
                        </button>
                    </p>
                </div>

                <div className="mt-8">
                    <Link to="/login" className="text-center text-xs text-white/40 block hover:text-white">
                        ← Back to login
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-h-[90vh] overflow-y-auto"
        >
            <div className="mb-4">
                <div className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-[4px] border-2 border-white" />
                    <span className="text-sm font-bold tracking-[0.08em] text-white">DEVSYNC</span>
                </div>
            </div>

            <h2 className="text-lg font-bold text-white sm:text-xl">Forgot password?</h2>
            <p className="mt-0.5 text-xs text-white/40">
                Enter your email and we'll send you a reset link.
            </p>

            {(error || validationError) && (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
                    {validationError || error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <AuthInput
                    label="Email address"
                    type="email"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-2 text-sm"
                />

                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-full bg-white py-2.5 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 disabled:opacity-50"
                >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>

                <div className="mt-2 text-center">
                    <Link to="/login" className="text-xs text-white/40 hover:text-white">
                        ← Back to login
                    </Link>
                </div>
            </form>
        </motion.div>
    );
};

export default ForgotPasswordForm;