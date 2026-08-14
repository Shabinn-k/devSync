import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Save, Loader2 } from 'lucide-react';
import { useOrganizationStore } from '../store/organizationStore';
import type { OrganizationDetail } from '../types/organization';

interface EditOrganizationModalProps {
  organization: OrganizationDetail;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditOrganizationModal = ({ organization, onClose, onSuccess }: EditOrganizationModalProps) => {
  const [formData, setFormData] = useState({
    name: organization.name || '',
    description: organization.description || '',
    website: organization.website || '',
    location: organization.location || '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const { updateOrganization, isSaving, error, clearError } = useOrganizationStore();

  useEffect(() => {
    setFormData({
      name: organization.name || '',
      description: organization.description || '',
      website: organization.website || '',
      location: organization.location || '',
    });
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!formData.name.trim()) {
      setLocalError('Organization name is required');
      return;
    }

    try {
      await updateOrganization(organization.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        location: formData.location.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to update organization');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-white/40" />
          <h2 className="text-sm font-medium text-white">Edit Organization</h2>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            Organization Name
          </label>
          <input
            type="text"
            placeholder="Acme Corp"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
            Description
          </label>
          <textarea
            placeholder="Describe your organization..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-medium uppercase tracking-wider text-white/40">
              Website
            </label>
            <input
              type="text"
              placeholder="https://acme.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
