import { type LucideIcon } from 'lucide-react';

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
}

export const FeatureItem = ({ icon: Icon, title }: FeatureItemProps) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-white/5 p-1.5">
        <Icon className="h-3.5 w-3.5 text-white/60" />
      </div>
      <span className="text-xs font-medium leading-tight text-white/60">
        {title}
      </span>
    </div>
  );
};