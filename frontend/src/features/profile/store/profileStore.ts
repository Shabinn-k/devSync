import { create } from 'zustand';
import { profileApi } from '../api/profileApi';
import type { Profile, UpdateProfileRequest, ChangePasswordRequest, ProfileStats } from '../types/profile';
import { useAuthStore } from '../../../stores/authStore';

interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  clearError: () => void;  
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  stats: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchProfile: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping profile fetch');
      return;
    }

    set({ isLoading: true, error: null });
    try {
      console.log('Fetching profile...');
      const profile = await profileApi.getMe();
      console.log('Profile fetched:', profile);
      
      set({ profile, isLoading: false });
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      if (err.response?.status === 401) {
        console.log('401 on profile fetch, logging out');
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return;
      }
      set({ error: err.message || 'Failed to fetch profile', isLoading: false });
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isSaving: true, error: null });
    try {
      console.log('Updating profile:', data);
      const updatedProfile = await profileApi.updateMe(data);
      console.log('Profile updated:', updatedProfile);
      set({ profile: updatedProfile, isSaving: false });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update profile';
      console.error('Update profile error:', message);
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  changePassword: async (data: ChangePasswordRequest) => {
    set({ isSaving: true, error: null });
    try {
      await profileApi.changePassword(data);
      console.log('Password changed successfully');
      set({ isSaving: false });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to change password';
      console.error('Change password error:', message);
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  uploadAvatar: async (file: File) => {
    set({ isSaving: true, error: null });
    try {
      console.log('Uploading avatar:', file.name);
      const avatarUrl = await profileApi.uploadAvatar(file);
      console.log('Avatar uploaded:', avatarUrl);
      
      set((state) => ({
        profile: state.profile ? { ...state.profile, avatar_url: avatarUrl } : null,
        isSaving: false,
      }));

      const { user } = useAuthStore.getState();
      if (user) {
        const updatedUser = { ...user, avatar_url: avatarUrl };
        localStorage.setItem('devsync_user', JSON.stringify(updatedUser));
        useAuthStore.setState({ user: updatedUser });
      }

      return avatarUrl;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to upload avatar';
      console.error('Upload avatar error:', message);
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));