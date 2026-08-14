import { Mail, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import { SocialLink } from './SocialLink';
import type { Profile } from '../types/profile';

interface ProfileInfoProps {
  profile: Profile;
}

// Shared shape both lucide-react icons and our custom SVG icons satisfy —
// avoids the `as unknown as typeof Mail` cast that would otherwise be
// needed to mix the two icon sources in one array. `React.ElementType` is
// the standard way to type "any component/tag" polymorphically — lucide's
// forwardRef-wrapped icons and our plain function components both qualify.
type IconComponent = React.ElementType;

interface InfoRow {
  icon: IconComponent;
  label: string;
  value: string | null | undefined;
  href?: string;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const rows: InfoRow[] = [
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: MapPin, label: 'Location', value: profile.location },
    {
      icon: GithubIcon,
      label: 'GitHub',
      value: profile.github_username ? `@${profile.github_username}` : null,
      href: profile.github_username ? `https://github.com/${profile.github_username}` : undefined,
    },
    {
      icon: LinkIcon,
      label: 'Website',
      value: profile.portfolio_url,
      href: profile.portfolio_url ? (profile.portfolio_url.match(/^https?:\/\//i) ? profile.portfolio_url : `https://${profile.portfolio_url}`) : undefined,
    },
    { icon: Calendar, label: 'Joined', value: new Date(profile.created_at).toLocaleDateString() },
  ].filter((row) => row.value);

  return (
    <div className="space-y-6">
      {/* About / Profile Information */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-white/60">Profile Information</h3>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-2.5">
              <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
              <div>
                <dt className="text-xs text-white/30">{row.label}</dt>
                {row.href ? (
                  <dd>
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/80 hover:text-white"
                    >
                      {row.value}
                    </a>
                  </dd>
                ) : (
                  <dd className="text-sm text-white/80">{row.value}</dd>
                )}
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-white/60">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Additional social links beyond GitHub/Website (e.g. Twitter, LinkedIn if present) */}
      {profile.social_links && Object.keys(profile.social_links).length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-white/60">Social Links</h3>
          <div className="mt-2 flex flex-wrap gap-4">
            {Object.entries(profile.social_links)
              .filter(([platform]) => {
                if (platform.toLowerCase() === 'github' && profile.github_username) {
                  return false;
                }
                return true;
              })
              .map(([platform, url]) => (
                <SocialLink key={platform} platform={platform} url={url} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};
