import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { AuthInput } from '../../auth/components/AuthInput';
import { useProfileStore } from '../store/profileStore';

interface EditProfileFormProps {
  onClose: () => void;
}

export const EditProfileForm = ({ onClose }: EditProfileFormProps) => {
  const { profile, updateProfile, isSaving } = useProfileStore();

  const [formData, setFormData] = useState({
    Name: '',
    bio: '',
    skills: '',
    github_username: '',
    portfolio_url: '',
    location: '',
    social_links: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        Name: profile.Name|| '',
        bio: profile.bio || '',
        skills: profile.skills?.join(', ') || '',
        github_username: profile.github_username || '',
        portfolio_url: profile.portfolio_url || '',
        location: profile.location || '',
        social_links: profile.social_links
          ? Object.entries(profile.social_links)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')
          : '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const socialLinks: Record<string, string> = {};
    formData.social_links.split('\n').forEach((line) => {
      const [key, ...value] = line.split(':');
      if (key && value.length) {
        socialLinks[key.trim()] = value.join(':').trim();
      }
    });

    try {
      await updateProfile({
        full_name: formData.Name, 
        bio: formData.bio,
        skills: skillsArray,
        github_username: formData.github_username,
        portfolio_url: formData.portfolio_url,
        location: formData.location,
        social_links: socialLinks,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={formData.Name}
          onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
        />

        <AuthInput
          label="Bio"
          type="text"
          placeholder="Tell us about yourself..."
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />

        <AuthInput
          label="Skills (comma separated)"
          type="text"
          placeholder="React, TypeScript, Go"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
        />

        <AuthInput
          label="GitHub Username"
          type="text"
          placeholder="johndoe"
          value={formData.github_username}
          onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
        />

        <AuthInput
          label="Portfolio URL"
          type="text"
          placeholder="https://johndoe.dev"
          value={formData.portfolio_url}
          onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
        />

        <AuthInput
          label="Location"
          type="text"
          placeholder="San Francisco, CA"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />

        <AuthInput
          label="Social Links (one per line: platform: url)"
          type="text"
          placeholder="github: https://github.com/johndoe"
          value={formData.social_links}
          onChange={(e) => setFormData({ ...formData, social_links: e.target.value })}
        />

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </motion.div>
  );
};