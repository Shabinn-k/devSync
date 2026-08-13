import { GithubIcon, LinkedinIcon, GlobeIcon, X } from './SocialIcons';

interface SocialLinkProps {
  platform: string;
  url: string;
}

const socialIcons: Record<string, React.ReactNode> = {
  github: <GithubIcon size={16} />,
  linkedin: <LinkedinIcon size={16} />,
  website: <GlobeIcon size={16} />,
  twitter: <X size={16} />,
};

const socialColors: Record<string, string> = {
  github: 'hover:text-white',
  linkedin: 'hover:text-[#0A66C2]',
  website: 'hover:text-blue-400',
  twitter: 'hover:text-[#1DA1F2]',
};

export const SocialLink = ({ platform, url }: SocialLinkProps) => {
  const normalizedPlatform = platform.toLowerCase();

  const icon = socialIcons[normalizedPlatform] || <GlobeIcon size={16} />;
  const color = socialColors[normalizedPlatform] || 'hover:text-white';
  const label = platform.charAt(0).toUpperCase() + platform.slice(1);

  const formattedUrl = url ? (url.match(/^https?:\/\//i) ? url : `https://${url}`) : '#';

  return (
    <a
      href={formattedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 text-sm text-white/40 transition-colors ${color}`}
    >
      {icon}
      {label}
    </a>
  );
};
