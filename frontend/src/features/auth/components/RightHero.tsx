import { ShieldCheck, Rocket, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { FeatureItem } from './FeatureItem';

export const RightHero = () => {
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <Logo />

      <div className="flex-1 flex flex-col justify-center -mt-4">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl xl:text-6xl">
          Welcome to the future
          <br />
          of developer collaboration.
        </h2>
        <p className="mt-3 text-sm text-white/40">
          Create your account and experience a workspace designed for modern software teams.
        </p>
      </div>

      <div>
        <div className="mb-4 h-px w-full bg-white/10 lg:mb-6" />
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <FeatureItem icon={ShieldCheck} title="Trusted identity" />
          <FeatureItem icon={Rocket} title="Performance" />
          <FeatureItem icon={Lock} title="Security" />
        </div>
      </div>
    </div>
  );
};