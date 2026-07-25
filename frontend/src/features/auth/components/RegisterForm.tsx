import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import { AuthInput } from './AuthInput';
import { SocialButton } from './SocialButton';
import { AuthDivider } from './AuthDivider';
import { useAuthStore } from '../../../stores/authStore';

export const RegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!agreeTerms) {
      setValidationError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }

    try {
      await registerUser({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      });
      navigate('/verify-email');
    } catch {
      // Error handled by store
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      <h2 className="text-xl font-bold text-white sm:text-2xl">Create your account</h2>
      <p className="mt-1 text-sm text-white/40">
        Start building with the industry standard for sync.
      </p>

      {(error || validationError) && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5">
        <AuthInput
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <AuthInput
          label="Email address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <AuthInput
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/5 text-white focus:ring-white/40"
          />
          <label htmlFor="terms" className="text-xs text-white/60">
            I agree to the{' '}
            <a href="#" className="text-white hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-white hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="mt-1 w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 sm:py-3.5 disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </motion.button>

        <AuthDivider label="Or continue with" />

        <div className="grid grid-cols-2 gap-3">
          <SocialButton
            provider="Google"
            icon={<FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />}
            onClick={() => console.log('Google register')}
          />
          <SocialButton
            provider="GitHub"
            icon={<FontAwesomeIcon icon={faGithub} className="h-4 w-4" />}
            onClick={() => console.log('GitHub register')}
          />
        </div>

        <p className="text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-white transition-colors hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default RegisterForm;