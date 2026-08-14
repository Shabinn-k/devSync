import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type {
  Organization,
  OrganizationDetail,
  OrganizationMember,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
} from '../types/organization';

export const organizationApi = {
  // Organization CRUD
  create: (data: CreateOrganizationRequest) =>
    apiClient.post<ApiResponse<Organization>>('/organizations', data)
      .then((res) => res.data.data), // ✅ Fix: Extract data

  getById: (id: string) =>
    apiClient.get<ApiResponse<OrganizationDetail>>(`/organizations/${id}`)
      .then((res) => res.data.data), // ✅ Fix

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Organization>>(`/organizations/slug/${slug}`)
      .then((res) => res.data.data), // ✅ Fix

  update: (id: string, data: UpdateOrganizationRequest) =>
    apiClient.put<ApiResponse<Organization>>(`/organizations/${id}`, data)
      .then((res) => res.data.data), // ✅ Fix

  delete: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/organizations/${id}`)
      .then((res) => res.data.data), // ✅ Fix

  list: (page?: number, limit?: number) =>
    apiClient
      .get<ApiResponse<Organization[]>>(`/organizations?page=${page || 1}&limit=${limit || 20}`)
      .then((res) => res.data.data), // ✅ Fix

  getMyOrganizations: () =>
    apiClient.get<ApiResponse<Organization[]>>('/organizations/me')
      .then((res) => res.data.data), // ✅ Fix

  // Members
  addMember: (organizationId: string, data: AddMemberRequest) =>
    apiClient
      .post<ApiResponse<OrganizationMember>>(`/organizations/${organizationId}/members`, data)
      .then((res) => res.data.data), // ✅ Fix

  getMembers: (organizationId: string) =>
    apiClient
      .get<ApiResponse<OrganizationMember[]>>(`/organizations/${organizationId}/members`)
      .then((res) => res.data.data), // ✅ Fix

  updateMemberRole: (organizationId: string, memberId: string, data: UpdateMemberRoleRequest) =>
    apiClient
      .put<ApiResponse<{ message: string }>>(`/organizations/${organizationId}/members/${memberId}`, data)
      .then((res) => res.data.data), // ✅ Fix

  removeMember: (organizationId: string, memberId: string) =>
    apiClient
      .delete<ApiResponse<{ message: string }>>(`/organizations/${organizationId}/members/${memberId}`)
      .then((res) => res.data.data), // ✅ Fix
};