import { ArrowUpRight } from 'lucide-react';
import { GithubIcon, LinkedinIcon, GlobeIcon } from './SocialIcons';
import type { Profile } from '../types/profile';

interface ProfileIntegrationsProps {
  profile: Profile;
  isOwnProfile: boolean;
  onEditClick?: () => void;
}

interface IntegrationRow {
  key: string;
  label: string;
  icon: typeof GithubIcon;
  connectedUrl: string | null;
  connectedLabel: string | null;
}

const formatExternalUrl = (url?: string | null): string | null => {
  if (!url) return null;
  return url.match(/^https?:\/\//i) ? url : `https://${url}`;
};

export const ProfileIntegrations = ({ profile, isOwnProfile, onEditClick }: ProfileIntegrationsProps) => {
  const findSocialLink = (platformKey: string): string | null => {
    if (!profile.social_links) return null;
    const target = platformKey.toLowerCase();
    let links: Record<string, string> = {};
    if (typeof profile.social_links === 'string') {
      try {
        links = JSON.parse(profile.social_links);
      } catch {
        return null;
      }
    } else if (typeof profile.social_links === 'object') {
      links = profile.social_links;
    }
    for (const [key, val] of Object.entries(links)) {
      if (key.toLowerCase() === target && val) {
        return val;
      }
    }
    return null;
  };

  const rawLinkedinUrl = findSocialLink('linkedin');
  const linkedinUrl = formatExternalUrl(rawLinkedinUrl);
  const websiteUrl = formatExternalUrl(profile.portfolio_url || findSocialLink('website'));

  const rows: IntegrationRow[] = [
    {
      key: 'github',
      label: 'GitHub',
      icon: GithubIcon,
      connectedUrl: profile.github_username ? `https://github.com/${profile.github_username}` : null,
      connectedLabel: profile.github_username ? `@${profile.github_username}` : null,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: LinkedinIcon,
      connectedUrl: linkedinUrl,
      connectedLabel: linkedinUrl ? 'Connected' : null,
    },
    {
      key: 'website',
      label: 'Personal Website',
      icon: GlobeIcon,
      connectedUrl: websiteUrl,
      connectedLabel: profile.portfolio_url ?? null,
    },
  ];

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-white/60">Integrations</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <row.icon size={18} className="text-white/50" />
              <div>
                <p className="text-sm text-white">{row.label}</p>
                {row.connectedUrl ? (
                  <a
                    href={row.connectedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70"
                  >
                    {row.connectedLabel}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-xs text-white/30">Not connected</p>
                )}
              </div>
            </div>

            {!row.connectedUrl && isOwnProfile && (
              <button
                onClick={onEditClick}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                Connect
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
