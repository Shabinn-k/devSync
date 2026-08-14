import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

import { useProfileStore } from '../store/profileStore';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { ProfileInfo } from '../components/ProfileInfo';
import { ProfileActivity } from '../components/ProfileActivity';
import { ProfileWorkspace } from '../components/ProfileWorkspace';
import { ProfileIntegrations } from '../components/ProfileIntegrations';
import { ProfileSecurity } from '../components/ProfileSecurity';
import { ProfileModal } from '../components/ProfileModal';
import { EditProfileForm } from '../components/EditProfileForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { GitHubContributions } from '../components/GitHubContributions'; 

const IS_OWN_PROFILE = true;

const ProfilePage = () => {
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { profile, isLoading, error, fetchProfile } = useProfileStore();

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

  return (
    <div className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="group mb-6 flex items-center gap-2 text-sm text-white/40 transition-all hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 sm:p-8">
          <ProfileHeader
            profile={profile}
            isOwnProfile={IS_OWN_PROFILE}
            onEditClick={() => setShowEdit(true)}
          />
        </div>

        {/* Stats */}
        <div className="mt-6">
          <ProfileStats />
        </div>

        {/* ✅ GitHub Contributions - Full width */}
        <div className="mt-6">
          <GitHubContributions githubUsername={profile.github_username || undefined} />
        </div>

        {/* Main two-column layout on desktop, stacked on mobile/tablet */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <ProfileInfo profile={profile} />
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <ProfileWorkspace />
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <ProfileActivity />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <ProfileIntegrations
                profile={profile}
                isOwnProfile={IS_OWN_PROFILE}
                onEditClick={() => setShowEdit(true)}
              />
            </div>
            {IS_OWN_PROFILE && (
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
                <ProfileSecurity
                  profile={profile}
                  onChangePasswordClick={() => setShowPassword(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <ProfileModal onClose={() => setShowEdit(false)}>
          <EditProfileForm onClose={() => setShowEdit(false)} />
        </ProfileModal>
      )}

      {showPassword && (
        <ProfileModal onClose={() => setShowPassword(false)}>
          <ChangePasswordForm onClose={() => setShowPassword(false)} />
        </ProfileModal>
      )}
    </div>
  );
};

export default ProfilePage;