import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../components/AuthInput';
import { useAuthStore } from '../../../stores/authStore';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();
  const { resetPasswordWithOTP, resetOTP, resetEmail, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!newPassword || !confirmPassword) {
      setValidationError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }

    if (!resetOTP) {
      setValidationError('OTP not verified. Please go back and verify.');
      return;
    }

    if (!resetEmail) {
      setValidationError('No email found. Please try again.');
      return;
    }

    try {
      await resetPasswordWithOTP(resetOTP, newPassword);
      setIsSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      // Error handled by store
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <div className="p-6 lg:p-10">
          <div className="flex items-center gap-2.5">
            <span className="h-6 w-6 rounded-[4px] border-2 border-white" />
            <span className="text-sm font-bold tracking-[0.08em] text-white">DEVSYNC</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 -mt-20">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Password Reset Successful</h2>
            <p className="mt-2 text-sm text-white/60">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="p-6 lg:p-10">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-[4px] border-2 border-white" />
          <span className="text-sm font-bold tracking-[0.08em] text-white">DEVSYNC</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Set New Password</h2>
            <p className="mt-1 text-sm text-white/40">
              Create a new password for your account.
            </p>
            {resetEmail && (
              <p className="mt-1 text-xs text-white/30">
                Resetting password for: {resetEmail}
              </p>
            )}
          </div>

          {(error || validationError) && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {validationError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <AuthInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </motion.button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-white/40 hover:text-white transition-colors">
                ← Back to login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;