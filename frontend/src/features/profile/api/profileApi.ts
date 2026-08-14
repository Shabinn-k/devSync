import { apiClient } from '../../../lib/axios';
import type { Profile, ChangePasswordRequest, GitHubContributionsResponse, UpdateProfileRequest } from '../types/profile';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const profileApi = {
  getMe: async (): Promise<Profile> => {
    const res = await apiClient.get<ApiEnvelope<Profile>>('/profile/me');
    return res.data.data;
  },

  updateMe: async (payload: UpdateProfileRequest | Record<string, any>): Promise<Profile> => {
    const cleanPayload: Record<string, any> = {};

    if (payload.name !== undefined) cleanPayload.name = payload.name;
    if (payload.bio !== undefined) cleanPayload.bio = payload.bio;
    if (payload.location !== undefined) cleanPayload.location = payload.location;
    if (payload.github_username !== undefined) cleanPayload.github_username = payload.github_username;
    if (payload.portfolio_url !== undefined) cleanPayload.portfolio_url = payload.portfolio_url;
    if (payload.skills !== undefined) cleanPayload.skills = payload.skills;
    if (payload.social_links !== undefined) cleanPayload.social_links = payload.social_links;

    console.log('Sending to backend:', cleanPayload);

    const res = await apiClient.put<ApiEnvelope<Profile>>('/profile/me', cleanPayload);
    return res.data.data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/profile/password', payload);
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiClient.post<ApiEnvelope<{ avatar_url: string }>>(
      '/profile/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data.avatar_url;
  },

  getGitHubContributions: async (): Promise<GitHubContributionsResponse> => {
    const res = await apiClient.get<ApiEnvelope<GitHubContributionsResponse>>('/profile/github/contributions');
    return res.data.data;
  },
};