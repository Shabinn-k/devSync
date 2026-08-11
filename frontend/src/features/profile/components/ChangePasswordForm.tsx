import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Shield, CheckCircle2 } from 'lucide-react';
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center justify-between sticky top-0 bg-[#0a0a0a] py-2 z-10">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/10 p-1.5"><Shield className="h-4 w-4 text-white" /></div>
          <h2 className="text-lg font-bold text-white">Change Password</h2>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-xs text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Password changed successfully!
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput
          label="Current Password"
          type="password"
          placeholder="••••••••"
          value={formData.current_password}
          onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
          className="py-2 text-sm"
        />
        <AuthInput
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={formData.new_password}
          onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
          className="py-2 text-sm"
        />
        <AuthInput
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={formData.confirm_password}
          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
          className="py-2 text-sm"
        />

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-full bg-white py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-50"
        >
          {isSaving ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </motion.div>
  );
};