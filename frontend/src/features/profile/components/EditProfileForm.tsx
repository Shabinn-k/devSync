import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Save, Loader2 } from 'lucide-react';
import { useProfileStore } from '../store/profileStore';

interface EditProfileFormProps {
  onClose: () => void;
}

export const EditProfileForm = ({ onClose }: EditProfileFormProps) => {
  const { profile, updateProfile, isSaving, error, clearError } = useProfileStore();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    github_username: '',
    portfolio_url: '',
    location: '',
    social_links: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      let socialLinksDisplay = '';
      if (profile.social_links) {
        if (typeof profile.social_links === 'string') {
          try {
            const parsed = JSON.parse(profile.social_links);
            socialLinksDisplay = Object.entries(parsed)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n');
          } catch {
            socialLinksDisplay = profile.social_links;
          }
        } else if (typeof profile.social_links === 'object') {
          socialLinksDisplay = Object.entries(profile.social_links)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n');
        }
      }

      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        skills: profile.skills?.join(', ') || '',
        github_username: profile.github_username || '',
        portfolio_url: profile.portfolio_url || '',
        location: profile.location || '',
        social_links: socialLinksDisplay,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const detectPlatformFromUrl = (urlStr: string): string => {
      const lower = urlStr.toLowerCase();
      if (lower.includes('linkedin.com')) return 'linkedin';
      if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
      if (lower.includes('github.com')) return 'github';
      if (lower.includes('youtube.com')) return 'youtube';
      if (lower.includes('facebook.com')) return 'facebook';
      if (lower.includes('instagram.com')) return 'instagram';
      return 'website';
    };

    const socialLinks: Record<string, string> = {};
    if (formData.social_links.trim()) {
      formData.social_links.split('\n').forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        let platform = '';
        let url = '';

        if (trimmedLine.includes(':')) {
          const colonIndex = trimmedLine.indexOf(':');
          const possiblePlatform = trimmedLine.slice(0, colonIndex).trim();
          const possibleUrl = trimmedLine.slice(colonIndex + 1).trim();

          if (possiblePlatform.toLowerCase() === 'http' || possiblePlatform.toLowerCase() === 'https') {
            url = trimmedLine;
            platform = detectPlatformFromUrl(url);
          } else {
            platform = possiblePlatform.toLowerCase();
            url = possibleUrl;
          }
        } else {
          url = trimmedLine;
          platform = detectPlatformFromUrl(url);
        }

        if (platform && url) {
          const formattedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;
          socialLinks[platform] = formattedUrl;
        }
      });
    }

    const payload: Record<string, any> = {};

    if (formData.name !== profile?.name) payload.name = formData.name;
    if (formData.bio !== profile?.bio) payload.bio = formData.bio;
    if (formData.location !== profile?.location) payload.location = formData.location;
    const cleanUsername = formData.github_username
      .trim()
      .replace(/^(https?:\/\/)?(www\.)?github\.com\//, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0];
    if (cleanUsername !== profile?.github_username) payload.github_username = cleanUsername;
    if (formData.portfolio_url !== profile?.portfolio_url) payload.portfolio_url = formData.portfolio_url;

    const currentSkills = profile?.skills?.join(', ') || '';
    if (formData.skills !== currentSkills) {
      payload.skills = JSON.stringify(skillsArray);
    }

    const currentSocialLinks = profile?.social_links || {};
    const currentSocialStr = JSON.stringify(currentSocialLinks);
    const newSocialStr = JSON.stringify(socialLinks);
    if (currentSocialStr !== newSocialStr) {
      payload.social_links = newSocialStr;
    }

    if (Object.keys(payload).length === 0) {
      setLocalError('No changes to save');
      return;
    }

    console.log('Sending payload:', payload);

    try {
      await updateProfile(payload);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to update profile');
    }
  };

  const displayError = error || localError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-medium text-white">Edit Profile</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {displayError && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Manu Ram"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            Bio
          </label>
          <textarea
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={2}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            Skills (comma separated)
          </label>
          <input
            type="text"
            placeholder="React, TypeScript, Go"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
              GitHub Username
            </label>
            <input
              type="text"
              placeholder="manuram"
              value={formData.github_username}
              onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
              Location
            </label>
            <input
              type="text"
              placeholder="San Francisco, CA"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            Portfolio URL
          </label>
          <input
            type="text"
            placeholder="https://manu.dev"
            value={formData.portfolio_url}
            onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            Social Links
          </label>
          <textarea
            placeholder="github: https://github.com/manu"
            value={formData.social_links}
            onChange={(e) => setFormData({ ...formData, social_links: e.target.value })}
            rows={2}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
          <p className="text-[9px] text-white/20">Format: platform: url (one per line)</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded bg-white py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};