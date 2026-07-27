import { CheckSquare, MessageSquare, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { FeatureItem } from './FeatureItem';
import { Mascot } from './Mascot';

export const LeftHero = () => {
  return (
    <div className="flex h-full w-full flex-col justify-between px-6 py-6 lg:px-10 lg:py-10">
      <Logo />

      <div className="flex flex-1 flex-col items-center justify-center">
        <Mascot />
        <p className="mt-4 text-xs text-white/50 lg:text-sm">
          The unified developer workspace.
        </p>
      </div>

      <div>
        <div className="mb-4 h-px w-full bg-white/10" />
        <div className="grid grid-cols-3 gap-2">
          <FeatureItem icon={CheckSquare} title="Real-time task boards" />
          <FeatureItem icon={MessageSquare} title="Built-in team chat" />
          <FeatureItem icon={Lock} title="Enterprise-grade permissions" />
        </div>
      </div>
    </div>
  );
};