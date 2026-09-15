import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type {
  Team,
  TeamMember,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  UpdateTeamMemberRoleRequest,
} from '../types/team';

export const teamApi = {
  create: (data: CreateTeamRequest): Promise<Team> =>
    apiClient.post<ApiResponse<Team>>('/teams', data).then((res) => {
      if (res.data.success && res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to create team');
    }),

  getByOrganization: (organizationId: number): Promise<Team[]> =>
    apiClient.get<ApiResponse<Team[]>>(`/teams/organization/${organizationId}`).then((res) => {
      return res.data.data || [];
    }),

  getMyTeams: (): Promise<Team[]> =>
    apiClient.get<ApiResponse<Team[]>>('/teams/my').then((res) => res.data.data || []),

  getById: (id: number): Promise<Team> =>
    apiClient.get<ApiResponse<Team>>(`/teams/${id}`).then((res) => {
      if (res.data.success && res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Team not found');
    }),

  update: (id: number, data: UpdateTeamRequest): Promise<Team> =>
    apiClient.put<ApiResponse<Team>>(`/teams/${id}`, data).then((res) => {
      if (res.data.success && res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update team');
    }),

  delete: (id: number): Promise<void> =>
    apiClient.delete(`/teams/${id}`).then(() => undefined),

  addMember: (teamId: number, data: AddTeamMemberRequest): Promise<TeamMember> =>
    apiClient.post<ApiResponse<TeamMember>>(`/teams/${teamId}/members`, data).then((res) => {
      if (res.data.success && res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to add member');
    }),

  getMembers: (teamId: number): Promise<TeamMember[]> =>
    apiClient.get<ApiResponse<TeamMember[]>>(`/teams/${teamId}/members`).then(
      (res) => res.data.data || []
    ),

  updateMemberRole: (
    teamId: number,
    memberId: number,
    data: UpdateTeamMemberRoleRequest
  ): Promise<void> =>
    apiClient.put(`/teams/${teamId}/members/${memberId}`, data).then(() => undefined),

  removeMember: (teamId: number, memberId: number): Promise<void> =>
    apiClient.delete(`/teams/${teamId}/members/${memberId}`).then(() => undefined),
};