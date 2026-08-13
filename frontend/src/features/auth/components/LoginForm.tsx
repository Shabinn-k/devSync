import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthInput } from './AuthInput';
import { SocialButton } from './SocialButton';
import { AuthDivider } from './AuthDivider';
import { useAuthStore } from '../../../stores/authStore';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4">
    <path
      fill="#EA4335"
      d="M12 10.2v3.96h5.52c-.24 1.44-1.68 4.2-5.52 4.2-3.32 0-6.02-2.75-6.02-6.14s2.7-6.14 6.02-6.14c1.89 0 3.16.8 3.88 1.5l2.64-2.55C16.86 3.35 14.64 2.4 12 2.4c-5.34 0-9.66 4.3-9.66 9.66S6.66 21.72 12 21.72c5.58 0 9.28-3.92 9.28-9.44 0-.63-.07-1.12-.16-1.6H12z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
  </svg>
);

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('Form submitted - Preventing refresh');
    console.log('Email:', email);

    setValidationError(null);
    clearError();

    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (isSubmitting || isLoading) {
      console.log('⏳ Already submitting, skipping...');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Calling login API...');
      await login({ email, password });
      console.log('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-[4px] border-2 border-white" />
          <span className="text-base font-bold tracking-[0.08em] text-white">DEVSYNC</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white">Welcome back</h2>
      <p className="mt-1 text-sm text-white/40">Please enter your details.</p>

      {(error || validationError) && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        <AuthInput
          label="Email address"
          type="email"
          placeholder="name@gmail.com"
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

        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="mt-1 w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>

        <AuthDivider label="Or continue with" />

        <div className="grid grid-cols-2 gap-3">
          <SocialButton provider="Google" icon={<GoogleIcon />} onClick={() => {}} />
          <SocialButton provider="GitHub" icon={<GitHubIcon />} onClick={() => {}} />
        </div>

        <div className="mt-2 text-center">
          <Link to="/forgot-password" className="text-xs font-medium uppercase tracking-wider text-white/50 hover:text-white">
            Forgot password?
          </Link>
        </div>

        <p className="text-center text-sm text-white/40">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-white hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default LoginForm;