import { ShieldCheck, KeyRound, CheckCircle2, Circle } from 'lucide-react';
import type { Profile } from '../types/profile';

interface ProfileSecurityProps {
  profile: Profile;
  onChangePasswordClick: () => void;
}

export const ProfileSecurity = ({ profile, onChangePasswordClick }: ProfileSecurityProps) => {
  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-white/60">Account & Security</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <KeyRound className="h-4 w-4 text-white/50" />
            <div>
              <p className="text-sm text-white">Password</p>
              <p className="text-xs text-white/30">••••••••</p>
            </div>
          </div>
          <button
            onClick={onChangePasswordClick}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            Change
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-white/50" />
            <p className="text-sm text-white">Account status</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-white/50">
              {profile.is_verified ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-white/20" />
              )}
              Verified
            </span>
            <span className="flex items-center gap-1 text-white/50">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              Active
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
