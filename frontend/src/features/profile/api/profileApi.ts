import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type { Profile, UpdateProfilePayload, ChangePasswordPayload } from '../types/profile';

export const profileApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<Profile>>('/profile/me').then((res) => res.data),

  updateProfile: (data: UpdateProfilePayload) => {
    // ✅ Properly format payload for backend
    const payload: Record<string, any> = {};
    
    if (data.name !== undefined) payload.name = data.name;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.location !== undefined) payload.location = data.location;
    if (data.github_username !== undefined) payload.github_username = data.github_username;
    if (data.portfolio_url !== undefined) payload.portfolio_url = data.portfolio_url;
    
    // ✅ Skills: send as comma-separated string
    if (data.skills !== undefined) {
      if (Array.isArray(data.skills)) {
        payload.skills = data.skills.join(',');
      } else {
        payload.skills = data.skills;
      }
    }
    
    // ✅ Social Links: send as JSON string
    if (data.social_links !== undefined) {
      if (typeof data.social_links === 'object') {
        payload.social_links = JSON.stringify(data.social_links);
      } else {
        payload.social_links = data.social_links;
      }
    }

    console.log('🔵 Sending update profile payload:', payload);
    
    return apiClient.put<ApiResponse<Profile>>('/profile/me', payload)
      .then((res) => {
        console.log('🟢 Update profile response:', res.data);
        return res.data;
      })
      .catch((err) => {
        console.error('🔴 Update profile error:', err.response?.data || err.message);
        throw err;
      });
  },

  changePassword: (data: ChangePasswordPayload) =>
    apiClient.put<ApiResponse<{ message: string }>>('/profile/password', data).then((res) => res.data),

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