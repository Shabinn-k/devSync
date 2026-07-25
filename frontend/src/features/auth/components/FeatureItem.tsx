// src/features/auth/components/FeatureItem.tsx
import type { LucideIcon } from 'lucide-react';

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
}

export const FeatureItem = ({ icon: Icon, title }: FeatureItemProps) => {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/70" strokeWidth={1.75} />
      <span className="text-[11px] font-medium uppercase leading-snug tracking-wide text-white/70">
        {title}
      </span>
    </div>
  );
};