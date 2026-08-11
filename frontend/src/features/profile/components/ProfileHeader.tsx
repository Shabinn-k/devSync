import { Mail, MapPin, Calendar, CheckCircle2, Edit3, Key, Globe } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './SocialIcons';
import { ProfileAvatar } from './ProfileAvatar';
import type { Profile } from '../types/profile';

interface ProfileHeaderProps {
  profile: Profile;
  onEdit: () => void;
  onPassword: () => void;
}

export const ProfileHeader = ({ profile, onEdit, onPassword }: ProfileHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-white/10 p-6 backdrop-blur-xl sm:p-8">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative">
          <ProfileAvatar size="xl" editable={true} />
          <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1.5 ring-2 ring-black">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{profile.name}</h1>
            {profile.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-white/40 sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              {profile.email}
            </span>
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>

          {profile.bio && (
            <p className="mt-3 text-sm text-white/60 max-w-2xl">{profile.bio}</p>
          )}

          {/* Social Links - Compact */}
          {profile.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {Object.entries(profile.social_links).map(([platform, url]) => {
                const IconMap: Record<string, any> = { github: GithubIcon, linkedin: LinkedinIcon, twitter: TwitterIcon };
                const Icon = IconMap[platform.toLowerCase()] || Globe;
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/40 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white">
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <button onClick={onEdit} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-1.5 text-sm font-medium text-black transition-all hover:bg-white/90 hover:scale-[1.02]">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
            <button onClick={onPassword} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-1.5 text-sm font-medium text-white/60 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white">
              <Key className="h-4 w-4" />
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};