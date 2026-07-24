import { LayoutGrid, MessageSquare, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { FeatureItem } from '../components/FeatureItem';

export const LeftHero = () => {
  return (
    <div className="flex h-full w-full flex-col justify-between">
      {/* Logo */}
      <Logo />

      {/* Heading Section */}
      <div className="-mt-8">
        <h1 className="text-[64px] font-extrabold uppercase leading-[0.95] tracking-tight text-white xl:text-[76px]">
          Build.
          <br />
          Ship.
          <br />
          Sync.
        </h1>
        <p className="mt-6 text-sm text-white/50">
          The unified developer workspace.
        </p>
      </div>

      {/* Features Section */}
      <div>
        <div className="mb-6 h-px w-full bg-white/10" />
        <div className="grid grid-cols-3 gap-4">
          <FeatureItem icon={LayoutGrid} title="Real-time task boards" />
          <FeatureItem icon={MessageSquare} title="Built-in team chat" />
          <FeatureItem icon={ShieldCheck} title="Enterprise-grade permissions" />
        </div>
      </div>
    </div>
  );
};