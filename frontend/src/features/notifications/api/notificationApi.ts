import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type { Notification } from '../types/notification';

export const notificationApi = { 
    getNotifications: (page?: number, limit?: number): Promise<Notification[]> =>
    apiClient
        .get<ApiResponse<any>>(`/notifications?page=${page || 1}&limit=${limit || 20}`)
        .then((res) => {
            if (!res.data.success || !res.data.data) return [];

            const d = res.data.data;
 
            if (Array.isArray(d.notifications)) return d.notifications;
 
            if (Array.isArray(d)) return d;

            return [];
        }),

    getUnreadCount: (): Promise<{ unread_count: number }> =>
        apiClient
            .get<ApiResponse<{ unread_count: number }>>('/notifications/unread-count')
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;  
                }
                return { unread_count: 0 };
            }),

    markAsRead: (id: number): Promise<void> =>
        apiClient
            .put<ApiResponse<{ message: string }>>(`/notifications/${id}/read`)
            .then((res) => {
                if (!res.data.success) {
                    throw new Error(res.data.message || 'Failed to mark as read');
                }
            }),

    markAllAsRead: (): Promise<void> =>
        apiClient
            .put<ApiResponse<{ message: string }>>('/notifications/read-all')
            .then((res) => {
                if (!res.data.success) {
                    throw new Error(res.data.message || 'Failed to mark all as read');
                }
            }),
};