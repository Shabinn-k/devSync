import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type {
    Team,
    TeamDetail,
    TeamMember,
    TeamRole,
    CreateTeamRequest,
    UpdateTeamRequest,
    AddTeamMemberRequest,
} from '../types/team';

export const teamApi = {
    create: (data: CreateTeamRequest): Promise<Team> =>
        apiClient.post<ApiResponse<Team>>('/teams', data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to create team');
            }),

    getById: (id: number): Promise<TeamDetail> =>
        apiClient.get<ApiResponse<TeamDetail>>(`/teams/${id}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to fetch team');
            }),

    getByOrganization: (orgId: number, limit = 20, offset = 0): Promise<{ data: Team[]; total: number }> =>
        apiClient.get<ApiResponse<Team[]>>(`/teams/organization/${orgId}?limit=${limit}&offset=${offset}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return {
                        data: res.data.data,
                        total: res.data.pagination?.total_items || res.data.total || res.data.data.length || 0,
                    };
                }
                return { data: [], total: 0 };
            }),

    getMyTeams: (): Promise<Team[]> =>
        apiClient.get<ApiResponse<Team[]>>('/teams/my')
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                return [];
            }),

    update: (id: number, data: UpdateTeamRequest): Promise<Team> =>
        apiClient.put<ApiResponse<Team>>(`/teams/${id}`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to update team');
            }),

    delete: (id: number): Promise<{ message: string }> =>
        apiClient.delete<ApiResponse<{ message: string }>>(`/teams/${id}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to delete team');
            }),

    addMember: (teamId: number, data: AddTeamMemberRequest): Promise<TeamMember> =>
        apiClient.post<ApiResponse<TeamMember>>(`/teams/${teamId}/members`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to add team member');
            }),

    getMembers: (teamId: number): Promise<TeamMember[]> =>
        apiClient.get<ApiResponse<TeamMember[]>>(`/teams/${teamId}/members`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                return [];
            }),

    updateMemberRole: (teamId: number, memberId: number, role: TeamRole): Promise<{ message: string }> =>
        apiClient.put<ApiResponse<{ message: string }>>(`/teams/${teamId}/members/${memberId}`, { role })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to update member role');
            }),

    removeMember: (teamId: number, memberId: number): Promise<{ message: string }> =>
        apiClient.delete<ApiResponse<{ message: string }>>(`/teams/${teamId}/members/${memberId}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to remove member');
            }),
};
