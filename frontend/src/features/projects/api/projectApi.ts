import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type {
    Project,
    ProjectDetail,
    ProjectMember,
    ProjectRole,
    CreateProjectRequest,
    UpdateProjectRequest,
    AddProjectMemberRequest,
} from '../types/project';

export const projectApi = {
    // Project CRUD
    create: (data: CreateProjectRequest): Promise<Project> =>
        apiClient.post<ApiResponse<Project>>('/projects', data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to create project');
            }),

    getById: (id: number): Promise<ProjectDetail> =>
        apiClient.get<ApiResponse<ProjectDetail>>(`/projects/${id}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to fetch project');
            }),

    getByOrganization: (orgId: number, page?: number, limit?: number): Promise<{ data: Project[]; total: number }> =>
        apiClient.get<ApiResponse<Project[]>>(`/projects/organization/${orgId}?page=${page || 1}&limit=${limit || 20}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return {
                        data: res.data.data,
                        total: res.data.pagination?.total_items || res.data.total || res.data.data.length || 0,
                    };
                }
                return { data: [], total: 0 };
            }),

    getMyProjects: (page?: number, limit?: number): Promise<{ data: Project[]; total: number }> =>
        apiClient.get<ApiResponse<Project[]>>(`/projects/my?page=${page || 1}&limit=${limit || 20}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return {
                        data: res.data.data,
                        total: res.data.pagination?.total_items || res.data.total || res.data.data.length || 0,
                    };
                }
                return { data: [], total: 0 };
            }),

    update: (id: number, data: UpdateProjectRequest): Promise<Project> =>
        apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to update project');
            }),

    delete: (id: number): Promise<{ message: string }> =>
        apiClient.delete<ApiResponse<{ message: string }>>(`/projects/${id}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to delete project');
            }),

    // Members
    addMember: (projectId: number, data: AddProjectMemberRequest): Promise<ProjectMember> =>
        apiClient.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to add member');
            }),

    getMembers: (projectId: number): Promise<ProjectMember[]> =>
        apiClient.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                return [];
            }),

    updateMemberRole: (projectId: number, memberId: number, role: ProjectRole): Promise<{ message: string }> =>
        apiClient.put<ApiResponse<{ message: string }>>(`/projects/${projectId}/members/${memberId}`, { role })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to update member role');
            }),

    removeMember: (projectId: number, memberId: number): Promise<{ message: string }> =>
        apiClient.delete<ApiResponse<{ message: string }>>(`/projects/${projectId}/members/${memberId}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to remove member');
            }),
};