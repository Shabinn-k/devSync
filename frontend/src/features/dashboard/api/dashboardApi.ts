import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type { DashboardStats, ActivityItem, TaskItem } from '../types/dashboard';

export const dashboardApi = {
  getStats: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats').then((res) => res.data),

  getActivities: () =>
    apiClient.get<ApiResponse<ActivityItem[]>>('/dashboard/activities').then((res) => res.data),

  getTasks: () =>
    apiClient.get<ApiResponse<TaskItem[]>>('/dashboard/tasks').then((res) => res.data),
};