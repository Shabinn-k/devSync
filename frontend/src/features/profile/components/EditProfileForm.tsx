import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Save, Loader2 } from 'lucide-react';
import { AuthInput } from '../../auth/components/AuthInput';
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
      // ✅ Parse social_links if it's a string
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

    // ✅ Parse skills
    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // ✅ Parse social links from "key: value" format
    const socialLinks: Record<string, string> = {};
    if (formData.social_links.trim()) {
      formData.social_links.split('\n').forEach((line) => {
        const [key, ...value] = line.split(':');
        if (key && value.length) {
          const trimmedKey = key.trim();
          const trimmedValue = value.join(':').trim();
          if (trimmedKey && trimmedValue) {
            socialLinks[trimmedKey] = trimmedValue;
          }
        }
      });
    }

    // ✅ Build payload - ONLY send fields that have changed
    const payload: Record<string, any> = {};
    
    if (formData.name !== profile?.name) payload.name = formData.name;
    if (formData.bio !== profile?.bio) payload.bio = formData.bio;
    if (formData.location !== profile?.location) payload.location = formData.location;
    if (formData.github_username !== profile?.github_username) payload.github_username = formData.github_username;
    if (formData.portfolio_url !== profile?.portfolio_url) payload.portfolio_url = formData.portfolio_url;
    
    // ✅ Skills as comma-separated string
    const currentSkills = profile?.skills?.join(', ') || '';
    if (formData.skills !== currentSkills) {
      payload.skills = skillsArray.join(',');
    }
    
    // ✅ Social links as JSON string
    const currentSocialLinks = profile?.social_links || {};
    const currentSocialStr = JSON.stringify(currentSocialLinks);
    const newSocialStr = JSON.stringify(socialLinks);
    if (currentSocialStr !== newSocialStr) {
      payload.social_links = newSocialStr;
    }

    // ✅ Only update if there are changes
    if (Object.keys(payload).length === 0) {
      setLocalError('No changes to save');
      return;
    }

    console.log('🔵 Sending payload:', payload);

    try {
      await updateProfile(payload);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to update profile');
    }
  };

  const displayError = error || localError;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center justify-between sticky top-0 bg-[#0a0a0a] py-2 z-10">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/10 p-1.5"><User className="h-4 w-4 text-white" /></div>
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"><X size={18} /></button>
      </div>

      {displayError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="py-2 text-sm"
        />
        
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60">Bio</label>
          <textarea
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors duration-200 focus:border-white/40"
          />
        </div>

        <AuthInput
          label="Skills (comma separated)"
          type="text"
          placeholder="React, TypeScript, Go"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          className="py-2 text-sm"
        />

        <AuthInput
          label="GitHub Username"
          type="text"
          placeholder="johndoe"
          value={formData.github_username}
          onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
          className="py-2 text-sm"
        />

        <AuthInput
          label="Portfolio URL"
          type="text"
          placeholder="https://johndoe.dev"
          value={formData.portfolio_url}
          onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
          className="py-2 text-sm"
        />

        <AuthInput
          label="Location"
          type="text"
          placeholder="San Francisco, CA"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="py-2 text-sm"
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-white/60">Social Links</label>
          <textarea
            placeholder="github: https://github.com/johndoe&#10;linkedin: https://linkedin.com/in/johndoe"
            value={formData.social_links}
            onChange={(e) => setFormData({ ...formData, social_links: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors duration-200 focus:border-white/40"
          />
          <p className="text-[10px] text-white/20">Format: platform: url (one per line)</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
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