import axios from 'axios';
import api from '../../../lib/axios';
import type {
  AdminUser,
  AdminUserDetail,
  AdminOrganization,
  AdminStats,
  PaginatedResponse,
  AdminUsersFilters,
  AdminOrgsFilters,
} from '../types/admin';

export const extractApiError = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },

  listUsers: async (f: AdminUsersFilters): Promise<PaginatedResponse<AdminUser>> => {
    const params: Record<string, unknown> = { page: f.page, limit: f.limit };
    if (f.search?.trim()) params.search = f.search.trim();
    if (f.role_id) params.role_id = f.role_id;
    if (f.is_active !== undefined) params.is_active = f.is_active;

    const res = await api.get('/admin/users', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  getUser: async (id: number): Promise<AdminUserDetail> => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data.data;
  },

  updateUserRole: async (id: number, roleId: number): Promise<void> => {
    await api.put(`/admin/users/${id}/role`, { role_id: roleId });
  },

  updateUserStatus: async (id: number, isActive: boolean): Promise<void> => {
    await api.put(`/admin/users/${id}/status`, { is_active: isActive });
  },

  forcePasswordReset: async (id: number): Promise<string> => {
    const res = await api.post(`/admin/users/${id}/force-password-reset`);
    return res.data.data.reset_token;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  listOrgs: async (f: AdminOrgsFilters): Promise<PaginatedResponse<AdminOrganization>> => {
    const params: Record<string, unknown> = { page: f.page, limit: f.limit };
    if (f.search?.trim()) params.search = f.search.trim();
    if (f.is_active !== undefined) params.is_active = f.is_active;

    const res = await api.get('/admin/organizations', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  getOrg: async (id: number): Promise<AdminOrganization> => {
    const res = await api.get(`/admin/organizations/${id}`);
    return res.data.data;
  },

  updateOrgStatus: async (id: number, isActive: boolean): Promise<void> => {
    await api.put(`/admin/organizations/${id}/status`, { is_active: isActive });
  },

  transferOwnership: async (id: number, newOwnerId: number): Promise<void> => {
    await api.put(`/admin/organizations/${id}/owner`, { new_owner_id: newOwnerId });
  },

  deleteOrg: async (id: number): Promise<void> => {
    await api.delete(`/admin/organizations/${id}`);
  },
};