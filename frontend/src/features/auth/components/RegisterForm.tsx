import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import { AuthInput } from './AuthInput';
import { SocialButton } from './SocialButton';
import { AuthDivider } from './AuthDivider';
import { useAuthStore } from '../../../stores/authStore';
import toast from 'react-hot-toast';

export const RegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { 
    register: registerUser, 
    isLoading, 
    error, 
    clearError, 
    selectedRole,
    setSelectedRole 
  } = useAuthStore();

  // ✅ Redirect if no role selected
  useEffect(() => {
    if (!selectedRole) {
      navigate('/role');
    }
  }, [selectedRole, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    // ✅ Pass the selected role during registration
    registerUser({
      name: fullName,
      email,
      password,
      role: selectedRole!, // ✅ Role from store
    })
      .then(() => {
        toast.success('Account created! Please verify your email.');
        navigate('/verify-email');
      })
      .catch((err) => {
        toast.error(err.message || 'Registration failed');
      });
  };

  const getRoleDisplay = (role: string) => {
    return role.replace('_', ' ').toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {/* ✅ Header with Role Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Create your account</h2>
          <p className="mt-1 text-sm text-white/40">
            Start building with the industry standard for sync.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <span className="text-xs text-white/40">Role:</span>
          <span className="text-xs font-medium text-white capitalize">
            {getRoleDisplay(selectedRole || 'developer')}
          </span>
          <button
            onClick={() => {
              setSelectedRole(null);
              navigate('/role');
            }}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      {(error || validationError) && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5" noValidate>
        <AuthInput
          label="Full name"
          type="text"
          placeholder="Manu Ram"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <AuthInput
          label="Email address"
          type="email"
          placeholder="name@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <AuthInput
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border border-white/30 bg-transparent accent-white"
            required
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

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 sm:py-3.5 disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

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