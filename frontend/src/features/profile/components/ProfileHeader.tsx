import { MapPin, Link as LinkIcon, Calendar, Edit3 } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import { ProfileAvatar } from './ProfileAvatar';
import type { Profile } from '../types/profile';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEditClick?: () => void;
  isOnline?: boolean; // no presence store shown yet — defaults to hidden, not fabricated
}

const formatExternalUrl = (url?: string | null): string => {
  if (!url) return '#';
  return url.match(/^https?:\/\//i) ? url : `https://${url}`;
};

export const ProfileHeader = ({ profile, isOwnProfile, onEditClick, isOnline }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div className="relative">
        <ProfileAvatar size="lg" editable={isOwnProfile} />
        {isOnline !== undefined && (
          <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1.5 ring-2 ring-black">
            <div className={`h-2 w-2 rounded-full bg-green-400 ${isOnline ? 'animate-pulse' : ''}`} />
          </div>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
          {/* NOTE: no `username` field exists on Profile today — omitted
              rather than invented, per the "don't fabricate fields" rule.
              Add it here once the backend/type supports it. */}
          {profile.is_verified && (
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
              Verified
            </span>
          )}
        </div>

        {profile.bio && <p className="mt-1 text-sm text-white/60">{profile.bio}</p>}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-white/40 sm:justify-start">
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {profile.location}
            </span>
          )}
          {profile.github_username && (
            <a
              href={`https://github.com/${profile.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/40 transition-colors hover:text-white"
            >
              <GithubIcon size={14} />
              {profile.github_username}
            </a>
          )}
          {profile.portfolio_url && (
            <a
              href={formatExternalUrl(profile.portfolio_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/40 transition-colors hover:text-white"
            >
              <LinkIcon size={14} />
              Portfolio
            </a>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </span>
        </div>

        {isOwnProfile && onEditClick && (
          <button
            onClick={onEditClick}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-1.5 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};
