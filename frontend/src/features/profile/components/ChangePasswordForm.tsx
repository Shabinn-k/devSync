import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { AuthInput } from '../../auth/components/AuthInput';
import { useProfileStore } from '../store/profileStore';

interface ChangePasswordFormProps {
  onClose: () => void;
}

export const ChangePasswordForm = ({ onClose }: ChangePasswordFormProps) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { changePassword, isSaving } = useProfileStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      await changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
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
        <h2 className="text-xl font-bold text-white">Change Password</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {success && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
          Password changed successfully!
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Current Password"
          type="password"
          placeholder="••••••••"
          value={formData.current_password}
          onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
        />

        <AuthInput
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={formData.new_password}
          onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
        />

        <AuthInput
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={formData.confirm_password}
          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
        />

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50"
        >
          {isSaving ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </motion.div>
  );
};