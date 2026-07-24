import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SocialButtonProps {
  provider: string;
  icon: ReactNode;
  onClick: () => void;
}

export const SocialButton = ({ provider, icon, onClick }: SocialButtonProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
    >
      {icon}
      <span>{provider}</span>
    </motion.button>
  );
};