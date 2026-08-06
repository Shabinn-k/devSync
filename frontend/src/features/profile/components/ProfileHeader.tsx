import { MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import { ProfileAvatar } from './ProfileAvatar';
import type { Profile } from '../types/profile';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEditClick?: () => void;
}

export const ProfileHeader = ({ profile, isOwnProfile, onEditClick }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <ProfileAvatar size="lg" editable={isOwnProfile} />

      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
          <h1 className="text-2xl font-bold text-white">{profile.Name}</h1>
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
              className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
            >
              <GithubIcon size={14} />
              {profile.github_username}
            </a>
          )}
          {profile.portfolio_url && (
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
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
            className="mt-4 rounded-full border border-white/10 px-6 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};