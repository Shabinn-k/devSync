import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  path: string;
}

export const QuickAction = ({ icon, label, path }: QuickActionProps) => {
  return (
    <Link
      to={path}
      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10"
    >
      {icon}
      <span className="text-sm text-white">{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-white/20" />
    </Link>
  );
};  