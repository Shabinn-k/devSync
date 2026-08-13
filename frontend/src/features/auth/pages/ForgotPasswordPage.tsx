import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from '../components/AuthInput';
import { useAuthStore } from '../../../stores/authStore';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { forgotPassword, isLoading, error, clearError, setResetEmail } = useAuthStore();

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
      setResetEmail(email);
      navigate('/verify-otp');
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
            <h2 className="text-2xl font-bold text-white">Forgot password?</h2>
            <p className="mt-1 text-sm text-white/40">
              Enter your email and we'll send you an OTP.
            </p>
          </div>

          {(error || validationError) && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {validationError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email address"
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
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

export default ForgotPasswordPage;