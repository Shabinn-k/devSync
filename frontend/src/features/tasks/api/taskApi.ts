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

const extractTotal = (res: any): number =>
  res?.data?.pagination?.total_items ??
  res?.data?.total ??
  res?.data?.data?.length ??
  0;

export const taskApi = {
  create: (data: CreateTaskRequest): Promise<Task> =>
    apiClient.post<ApiResponse<Task>>('/tasks', data).then((res) => {
      if (res.data.success && res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to create task');
    }),

  getById: (id: number): Promise<TaskDetail> =>
    apiClient.get<ApiResponse<TaskDetail>>(`/tasks/${id}`).then((res) => {
      if (res.data.success && res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to fetch task');
    }),

  getByProject: (
    projectId: number,
    page = 1,
    limit = 20
  ): Promise<{ data: Task[]; total: number }> =>
    apiClient
      .get<ApiResponse<Task[]>>(`/tasks/project/${projectId}?page=${page}&limit=${limit}`)
      .then((res) => ({
        data: res.data.data || [],
        total: extractTotal(res),
      })),

  getMyTasks: (
    page = 1,
    limit = 20
  ): Promise<{ data: Task[]; total: number }> =>
    apiClient
      .get<ApiResponse<Task[]>>(`/tasks/my?page=${page}&limit=${limit}`)
      .then((res) => ({
        data: res.data.data || [],
        total: extractTotal(res),
      })),

  update: (id: number, data: UpdateTaskRequest): Promise<Task> =>
    apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data).then((res) => {
      if (res.data.success && res.data.data) return res.data.data;
      throw new Error(res.data.message || 'Failed to update task');
    }),

  updateStatus: (id: number, data: UpdateTaskStatusRequest): Promise<{ message: string }> =>
    apiClient
      .put<ApiResponse<{ message: string }>>(`/tasks/${id}/status`, data)
      .then((res) => {
        if (res.data.success && res.data.data) return res.data.data;
        throw new Error(res.data.message || 'Failed to update status');
      }),

  delete: (id: number): Promise<{ message: string }> =>
    apiClient
      .delete<ApiResponse<{ message: string }>>(`/tasks/${id}`)
      .then((res) => {
        if (res.data.success && res.data.data) return res.data.data;
        throw new Error(res.data.message || 'Failed to delete task');
      }),

  addComment: (taskId: number, data: AddCommentRequest): Promise<TaskComment> =>
    apiClient
      .post<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments`, data)
      .then((res) => {
        if (res.data.success && res.data.data) return res.data.data;
        throw new Error(res.data.message || 'Failed to add comment');
      }),

  getComments: (
    taskId: number,
    page = 1,
    limit = 20
  ): Promise<{ data: TaskComment[]; total: number }> =>
    apiClient
      .get<ApiResponse<TaskComment[]>>(`/tasks/${taskId}/comments?page=${page}&limit=${limit}`)
      .then((res) => ({
        data: res.data.data || [],
        total: extractTotal(res),
      })),
};