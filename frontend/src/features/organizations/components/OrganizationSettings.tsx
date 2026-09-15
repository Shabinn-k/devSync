import React, { useState, useEffect } from 'react';
import { Building2, Save, Loader2, Globe, MapPin, AlignLeft, Tag } from 'lucide-react';
import { useOrganizationStore } from '../store/organizationStore';
import type { OrganizationDetail } from '../types/organization';
import toast from 'react-hot-toast';

export interface OrganizationSettingsProps {
  organization: OrganizationDetail;
  canEdit: boolean;
  onUpdated?: () => void;
}

export const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({
  organization,
  canEdit,
  onUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: organization.name || '',
    slug: organization.slug || '',
    description: organization.description || '',
    website: organization.website || '',
    location: organization.location || '',
  });

  const { updateOrganization, isSaving } = useOrganizationStore();

  useEffect(() => {
    setFormData({
      name: organization.name || '',
      slug: organization.slug || '',
      description: organization.description || '',
      website: organization.website || '',
      location: organization.location || '',
    });
  }, [organization]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!formData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      await updateOrganization(organization.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        location: formData.location.trim(),
      });
      toast.success('Organization settings updated');
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update organization settings');
    }
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Organization Settings</h3>
          <p className="text-xs text-white/40 mt-1">
            {canEdit
              ? 'Update your organization profile and public information.'
              : 'You have read-only permissions for this organization.'}
          </p>
        </div>
        {!canEdit && (
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
            Read-only
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Organization Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60">
              <Building2 className="h-3.5 w-3.5 text-white/40" />
              Organization Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!canEdit || isSaving}
              required
              className="w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g. Acme Corp"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60">
              <Tag className="h-3.5 w-3.5 text-white/40" />
              Slug / Handle
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              disabled={!canEdit || isSaving}
              className="w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g. acme-corp"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60">
            <AlignLeft className="h-3.5 w-3.5 text-white/40" />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={!canEdit || isSaving}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            placeholder="Tell us about your organization..."
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Website */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60">
              <Globe className="h-3.5 w-3.5 text-white/40" />
              Website URL
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              disabled={!canEdit || isSaving}
              className="w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="https://example.com"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/60">
              <MapPin className="h-3.5 w-3.5 text-white/40" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={!canEdit || isSaving}
              className="w-full rounded-lg border border-white/10 bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g. San Francisco, CA"
            />
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        )}
      </form>
    </div>
  );
};

export default OrganizationSettings;
