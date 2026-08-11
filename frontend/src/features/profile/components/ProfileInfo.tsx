import {  MapPin, Globe } from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from './SocialIcons';
import type { Profile } from '../types/profile';

interface ProfileInformationProps {
  profile: Profile;
}

export const ProfileInformation = ({ profile }: ProfileInformationProps) => {
  return (
    <div className="space-y-6">
      {/* About Section */}
      {profile.bio && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/40 mb-2">About</h3>
          <p className="text-sm text-white/70 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profile.location && (
          <div className="flex items-center gap-3 text-sm text-white/60">
            <MapPin className="h-4 w-4 text-white/30" />
            <span>{profile.location}</span>
          </div>
        )}
        {profile.github_username && (
          <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
            <GithubIcon size={16} />
            <span>{profile.github_username}</span>
          </a>
        )}
        {profile.portfolio_url && (
          <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
            <Globe className="h-4 w-4 text-white/30" />
            <span>Portfolio</span>
          </a>
        )}
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/40 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span key={index} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {profile.social_links && Object.keys(profile.social_links).length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/40 mb-2">Connect</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(profile.social_links).map(([platform, url]) => {
              const IconMap: Record<string, any> = { github: GithubIcon, linkedin: LinkedinIcon, twitter: TwitterIcon };
              const Icon = IconMap[platform.toLowerCase()] || Globe;
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all">
                  <Icon size={14} />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};