import { Github, Globe, Linkedin, Twitter } from 'lucide-react';
import type { Profile } from '../types/profile';

interface ProfileInfoProps {
  profile: Profile;
}

const socialIcons: Record<string, React.ReactNode> = {
  github: <Github size={16} />,
  linkedin: <Linkedin size={16} />,
  twitter: <Twitter size={16} />,
  website: <Globe size={16} />,
};

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <div className="space-y-6">
      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {profile.social_links && Object.keys(profile.social_links).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60">Social Links</h3>
          <div className="mt-2 flex flex-wrap gap-4">
            {Object.entries(profile.social_links).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
              >
                {socialIcons[platform.toLowerCase()] || <Globe size={16} />}
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};