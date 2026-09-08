import apiClient from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type { Notification } from '../types/notification';

export const notificationApi = {
  getNotifications: async (page = 1, limit = 20): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> => {
    const response = await apiClient.get<any>('/notifications', {
      params: { page, limit },
    });

    const data = response.data;
    if (data.success) {
      let list: Notification[] = [];
      if (Array.isArray(data.data)) {
        list = data.data;
      } else if (data.data && Array.isArray(data.data.notifications)) {
        list = data.data.notifications;
      }
      return {
        notifications: list,
        total: data.pagination?.total_items ?? list.length,
        page: data.pagination?.page ?? page,
        totalPages: data.pagination?.total_pages ?? 1,
      };
    }

    return { notifications: [], total: 0, page: 1, totalPages: 1 };
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<any>('/notifications/unread-count');
    if (response.data.success && response.data.data) {
      const cnt = response.data.data.count ?? response.data.data.unread_count;
      return typeof cnt === 'number' ? cnt : 0;
    }
    return 0;
  },

  markAsRead: async (id: number): Promise<boolean> => {
    const response = await apiClient.put<ApiResponse>(`/notifications/${id}/read`);
    return response.data.success;
  },

  markAllAsRead: async (): Promise<boolean> => {
    const response = await apiClient.put<ApiResponse>('/notifications/read-all');
    return response.data.success;
  },

  deleteNotification: async (id: number): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse>(`/notifications/${id}`);
    return response.data.success;
  },
};
