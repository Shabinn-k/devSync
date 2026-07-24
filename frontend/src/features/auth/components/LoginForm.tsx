import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import { AuthInput } from './AuthInput';
import { SocialButton } from './SocialButton';
import { AuthDivider } from './AuthDivider';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-white">Welcome back</h2>
      <p className="mt-1 text-sm text-white/40">Please enter your details.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="mt-1 w-full rounded-full bg-white py-3.5 text-sm font-semibold text-black transition-colors duration-200 hover:bg-white/90"
        >
          Sign In
        </motion.button>

        <AuthDivider label="Or continue with" />

        <div className="grid grid-cols-2 gap-3">
          <SocialButton
            provider="Google"
            icon={<FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />}
            onClick={() => console.log('Google login')}
          />
          <SocialButton
            provider="GitHub"
            icon={<FontAwesomeIcon icon={faGithub} className="h-4 w-4" />}
            onClick={() => console.log('GitHub login')}
          />
        </div>

        <div className="mt-2 text-center">
          <a
            href="#"
            className="text-xs font-medium uppercase tracking-wider text-white/50 transition-colors hover:text-white"
          >
            Forgot password?
          </a>
        </div>

        <p className="text-center text-sm text-white/40">
          Don&apos;t have an account?{' '}
          <a href="#" className="font-semibold text-white transition-colors hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </motion.div>
  );
};

export default LoginForm;   