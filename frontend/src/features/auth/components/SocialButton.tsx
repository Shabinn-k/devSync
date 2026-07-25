// src/features/auth/components/SocialButton.tsx
import type { ReactNode } from 'react';

interface SocialButtonProps {
  provider: string;
  icon: ReactNode;
  onClick?: () => void;
}

export const SocialButton = ({ provider, icon, onClick }: SocialButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] py-3 text-xs font-semibold uppercase tracking-wider text-white/80 transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
    >
      {icon}
      {provider}
    </button>
  );
};