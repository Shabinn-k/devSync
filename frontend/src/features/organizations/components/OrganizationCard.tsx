import { Link } from 'react-router-dom';
import { Users, Globe, MapPin, Calendar } from 'lucide-react';
import type { Organization } from '../types/organization';

interface OrganizationCardProps {
  organization: Organization;
}

const getWebsiteHostname = (urlStr: string): string => {
  if (!urlStr) return '';
  try {
    const formatted = urlStr.match(/^https?:\/\//i) ? urlStr : `https://${urlStr}`;
    return new URL(formatted).hostname;
  } catch {
    return urlStr;
  }
};

export const OrganizationCard = ({ organization }: OrganizationCardProps) => {
  return (
    <Link
      to={`/organizations/${organization.id}`}
      className="group block rounded-2xl border border-white/5 bg-white/5 p-6 transition-all hover:border-white/10 hover:bg-white/10"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-white/90">
            {organization.name}
          </h3>
          <p className="text-sm text-white/40">@{organization.slug}</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-white/30">
          <Users className="h-4 w-4" />
          <span>{organization.member_count}</span>
        </div>
      </div>

      {organization.description && (
        <p className="mt-2 text-sm text-white/50 line-clamp-2">{organization.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/30">
        {organization.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {organization.location}
          </span>
        )}
        {organization.website && (
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {getWebsiteHostname(organization.website)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Created {new Date(organization.created_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
};