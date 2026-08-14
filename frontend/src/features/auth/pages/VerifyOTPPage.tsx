import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../components/AuthInput';
import { useAuthStore } from '../../../stores/authStore';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { verifyOTP, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!otp || otp.length !== 6) {
      setValidationError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      await verifyOTP(otp);
      navigate('/reset-password');
    } catch {
    }
  };

  const handleResendOTP = async () => {
    try {
      const { forgotPassword, resetEmail } = useAuthStore.getState();
      if (resetEmail) {
        await forgotPassword(resetEmail);
        setValidationError(null);
      }
    } catch {
    }
  };

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
            <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
            <p className="mt-1 text-sm text-white/40">
              Enter the 6-digit code sent to your email.
            </p>
            {(() => {
              const { resetEmail } = useAuthStore.getState();
              return resetEmail && (
                <p className="mt-1 text-xs text-white/30">
                  Sent to: {resetEmail}
                </p>
              );
            })()}
          </div>

          {(error || validationError) && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {validationError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="OTP Code"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-sm font-semibold text-white/60 hover:text-white transition-colors disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
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

export default VerifyOTPPage;