import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type { Profile, UpdateProfilePayload, ChangePasswordPayload } from '../types/profile';

export const profileApi = {
  // Get current user profile
  getProfile: () =>
    apiClient.get<ApiResponse<Profile>>('/profile/me').then((res) => res.data),

  // Get profile by username
  getProfileByUsername: (username: string) =>
    apiClient.get<ApiResponse<Profile>>(`/profile/${username}`).then((res) => res.data),

  // Update profile
  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.put<ApiResponse<Profile>>('/profile/me', data).then((res) => res.data),

  // Change password
  changePassword: (data: ChangePasswordPayload) =>
    apiClient.put<ApiResponse<{ message: string }>>('/profile/change-password', data).then((res) => res.data),

  // Upload avatar
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient
      .post<ApiResponse<{ message: string; avatar_url: string }>>('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};