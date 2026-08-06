import type { Profile } from '../types/profile';
import { SocialLink } from './SocialLink';

interface ProfileInfoProps {
  profile: Profile;
}

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
              <SocialLink key={platform} platform={platform} url={url} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};