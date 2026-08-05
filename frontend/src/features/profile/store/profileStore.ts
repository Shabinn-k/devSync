import { create } from 'zustand';
import { profileApi } from '../api/ProfileApi';
import type { Profile, UpdateProfilePayload, ChangePasswordPayload, ProfileStats } from '../types/profile';

interface ProfileState {
  profile: Profile | null;
  stats: ProfileStats | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  fetchProfileByUsername: (username: string) => Promise<Profile | null>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  changePassword: (data: ChangePasswordPayload) => Promise<void>;
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
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        set({ profile: response.data, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profile', isLoading: false });
    }
  },

  fetchProfileByUsername: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getProfileByUsername(username);
      if (response.success && response.data) {
        set({ isLoading: false });
        return response.data;
      }
      return null;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profile', isLoading: false });
      return null;
    }
  },

  updateProfile: async (data: UpdateProfilePayload) => {
    set({ isSaving: true, error: null });
    try {
      const response = await profileApi.updateProfile(data);
      if (response.success && response.data) {
        set({ profile: response.data, isSaving: false });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to update profile', isSaving: false });
      throw err;
    }
  },

  changePassword: async (data: ChangePasswordPayload) => {
    set({ isSaving: true, error: null });
    try {
      const response = await profileApi.changePassword(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
      set({ isSaving: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to change password', isSaving: false });
      throw err;
    }
  },

  uploadAvatar: async (file: File) => {
    set({ isSaving: true, error: null });
    try {
      const response = await profileApi.uploadAvatar(file);
      if (response.success && response.data) {
        const avatarUrl = response.data.avatar_url;
        set((state) => ({
          profile: state.profile ? { ...state.profile, avatar_url: avatarUrl } : null,
          isSaving: false,
        }));
        return avatarUrl;
      }
      throw new Error(response.message || 'Failed to upload avatar');
    } catch (err: any) {
      set({ error: err.message || 'Failed to upload avatar', isSaving: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));