import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type { DashboardStats, ActivityItem, TaskItem } from '../types/dashboard';

export const dashboardApi = { 
  getDashboard: () =>
    apiClient.get<ApiResponse<{
      stats: DashboardStats;
      activities: ActivityItem[];
      tasks: TaskItem[];
    }>>('/dashboard/').then((res) => res.data),
};