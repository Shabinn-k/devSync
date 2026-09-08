import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type {
    Task,
    TaskDetail,
    TaskComment,
    CreateTaskRequest,
    UpdateTaskRequest,
    UpdateTaskStatusRequest,
    AddCommentRequest,
} from '../types/task';

export const taskApi = {
    // Task CRUD
    create: (data: CreateTaskRequest): Promise<Task> =>
        apiClient.post<ApiResponse<Task>>('/tasks', data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to create task');
            }),

    getById: (id: number): Promise<TaskDetail> =>
        apiClient.get<ApiResponse<TaskDetail>>(`/tasks/${id}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to fetch task');
            }),

    getByProject: (projectId: number, page?: number, limit?: number): Promise<{ data: Task[]; total: number }> =>
        apiClient.get<ApiResponse<Task[]>>(`/tasks/project/${projectId}?page=${page || 1}&limit=${limit || 20}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return {
                        data: res.data.data,
                        total: (res.data as any).total || res.data.data.length,
                    };
                }
                return { data: [], total: 0 };
            }),

    getMyTasks: (page?: number, limit?: number): Promise<{ data: Task[]; total: number }> =>
        apiClient.get<ApiResponse<Task[]>>(`/tasks/my?page=${page || 1}&limit=${limit || 20}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return {
                        data: res.data.data,
                        total: (res.data as any).total || res.data.data.length,
                    };
                }
                return { data: [], total: 0 };
            }),

    update: (id: number, data: UpdateTaskRequest): Promise<Task> =>
        apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to update task');
            }),

    updateStatus: (id: number, data: UpdateTaskStatusRequest): Promise<{ message: string }> =>
        apiClient.put<ApiResponse<{ message: string }>>(`/tasks/${id}/status`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to update status');
            }),

    delete: (id: number): Promise<{ message: string }> =>
        apiClient.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to delete task');
            }),

    // Comments
    addComment: (taskId: number, data: AddCommentRequest): Promise<TaskComment> =>
        apiClient.post<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to add comment');
            }),

    getComments: (taskId: number, page?: number, limit?: number): Promise<{ data: TaskComment[]; total: number }> =>
        apiClient.get<ApiResponse<TaskComment[]>>(`/tasks/${taskId}/comments?page=${page || 1}&limit=${limit || 20}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return {
                        data: res.data.data,
                        total: (res.data as any).total || res.data.data.length,
                    };
                }
                return { data: [], total: 0 };
            }),
};