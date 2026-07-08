import { CheckSquare, MessageSquare, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { FeatureItem } from './FeatureItem';

export const RegisterHero = () => {
  return (
    <div className="flex h-full w-full flex-col justify-between px-4 py-4 lg:px-6 lg:py-6">
      <Logo />

      <div className="flex flex-1 flex-col justify-center -mt-4">
        <h1 className="text-[56px] font-extrabold uppercase leading-[.95] tracking-tight text-white sm:text-[72px] lg:text-[88px] xl:text-[140px] 2xl:text-[130px] text-center">
  Build.
  <br />
  Ship.
  <br />
  Sync.
</h1>
<p className="mt-3 text-xs text-white/50 sm:text-sm lg:text-base text-center">
  The unified developer workspace.
</p>
      </div>

      <div>
        <div className="mb-3 h-px w-full bg-white/10" />
        <div className="grid grid-cols-3 gap-1.5">
          <FeatureItem icon={CheckSquare} title="Real-time task boards" />
          <FeatureItem icon={MessageSquare} title="Built-in team chat" />
          <FeatureItem icon={Lock} title="Enterprise-grade permissions" />
        </div>
      </div>
    </div>
  );
};