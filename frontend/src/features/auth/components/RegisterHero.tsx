import { CheckSquare, MessageSquare, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { FeatureItem } from './FeatureItem';

export const RegisterHero = () => {
  return (
    <div className="flex w-full flex-col justify-between px-12 py-12 xl:px-16 xl:py-16">
      <Logo />

      <div className="flex flex-1 flex-col justify-center -mt-8">
        <h1 className="text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight text-white xl:text-[80px] 2xl:text-[96px]">
          Build.
          <br />
          Ship.
          <br />
          Sync.
        </h1>
        <p className="mt-4 text-sm text-white/50">
          The unified developer workspace.
        </p>
      </div>

      <div>
        <div className="mb-6 h-px w-full bg-white/10" />
        <div className="grid grid-cols-3 gap-4">
          <FeatureItem icon={CheckSquare} title="Real-time task boards" />
          <FeatureItem icon={MessageSquare} title="Built-in team chat" />
          <FeatureItem icon={Lock} title="Enterprise-grade permissions" />
        </div>
      </div>
    </div>
  );
};