import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Settings, Key, ArrowLeft } from 'lucide-react';
import { useProfileStore } from '../store/profileStore';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { ProfileInfo } from '../components/ProfileInfo';
import { EditProfileForm } from '../components/EditProfileForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { useAuthStore } from '../../../stores/authStore';

const ProfilePage = () => {
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { profile, isLoading, error, fetchProfile } = useProfileStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <p className="text-red-400">{error || 'Failed to load profile'}</p>
        <button
          onClick={() => fetchProfile()}
          className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Dummy stats - replace with real data
  const stats = {
    projects: 12,
    tasks: 48,
    teams: 4,
    completed_tasks: 32,
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Header with Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPassword(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Key size={16} />
              Change Password
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Settings size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={true}
          onEditClick={() => setShowEdit(true)}
        />

        <ProfileStats stats={stats} />
        <ProfileInfo profile={profile} />

        {/* Modals */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6">
              <EditProfileForm onClose={() => setShowEdit(false)} />
            </div>
          </div>
        )}

        {showPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6">
              <ChangePasswordForm onClose={() => setShowPassword(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;