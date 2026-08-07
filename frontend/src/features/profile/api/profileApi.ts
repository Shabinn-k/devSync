import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type { Profile, UpdateProfilePayload, ChangePasswordPayload } from '../types/profile';

export const profileApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<Profile>>('/profile/me').then((res) => res.data),

  getProfileByUsername: (username: string) =>
    apiClient.get<ApiResponse<Profile>>(`/profile/${username}`).then((res) => res.data),  // ✅ Changed 'Name' to 'username'

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.put<ApiResponse<Profile>>('/profile/me', data).then((res) => res.data),

  changePassword: (data: ChangePasswordPayload) =>
    apiClient.put<ApiResponse<{ message: string }>>('/profile/change-password', data).then((res) => res.data),

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