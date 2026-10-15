import { create } from 'zustand';
import { profileApi } from '../api/profileApi';
import type { Profile, UpdateProfileRequest, ChangePasswordRequest, ProfileStats } from '../types/profile';
import { useAuthStore } from '../../../stores/authStore';
import axios from 'axios';
import { getUserFriendlyError } from '../../../lib/apiErrors';

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

export const useProfileStore = create<ProfileState>((set) => ({
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

      set({ profile, isLoading: false });
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        useAuthStore.getState().logout();
        return;
      }
      set({ error: err.message || 'Failed to fetch profile', isLoading: false });
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isSaving: true, error: null });
    try {
      const updatedProfile = await profileApi.updateMe(data);
      set({ profile: updatedProfile, isSaving: false });
    } catch (err: any) {
      const message = getUserFriendlyError(err, 'Unable to update your profile. Please try again.');
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  changePassword: async (data: ChangePasswordRequest) => {
    set({ isSaving: true, error: null });
    try {
      await profileApi.changePassword(data);
      set({ isSaving: false });
    } catch (err: any) {
      const message = getUserFriendlyError(err, 'Unable to change your password. Please try again.');
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  uploadAvatar: async (file: File) => {
    set({ isSaving: true, error: null });
    try {
      const avatarUrl = await profileApi.uploadAvatar(file);

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
      const message = getUserFriendlyError(err, 'Unable to upload your photo. Please try again.');
      set({ error: message, isSaving: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
