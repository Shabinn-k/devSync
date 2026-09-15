import { create } from 'zustand';
import { notificationApi } from '../api/notificationApi';
import type { Notification } from '../types/notification';

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    isLoading: boolean;
    error: string | null;

    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllRead: () => Promise<void>;
    markAllAsRead: () => Promise<void>;
    addFromWebSocket: (notification: Notification) => void;
    addNotification: (notification: Notification) => void;
    clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ loading: true, isLoading: true, error: null });
        try {
            const data = await notificationApi.getNotifications();
            set({ 
                notifications: Array.isArray(data) ? data : (data as any)?.notifications || [], 
                loading: false, 
                isLoading: false 
            });
        } catch (err: any) {
            set({ 
                error: err.message || 'Failed to fetch notifications', 
                loading: false, 
                isLoading: false 
            });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const res = await notificationApi.getUnreadCount();
            const count = (res as any)?.count ?? (res as any)?.unread_count ?? 0;
            set({ unreadCount: Number(count) || 0 });
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    },

    markAsRead: async (id: number) => {
        const { notifications, unreadCount } = get();
        const target = notifications.find((n) => n.id === id);
        if (!target || target.is_read) return;

        set({
            notifications: notifications.map((n) =>
                n.id === id ? { ...n, is_read: true } : n
            ),
            unreadCount: Math.max(0, unreadCount - 1),
        });

        try {
            await notificationApi.markAsRead(id);
        } catch (err: any) {
            set({ notifications, unreadCount });
        }
    },

    markAllRead: async () => {
        const { notifications, unreadCount } = get();
        if (unreadCount === 0 && notifications.every((n) => n.is_read)) return;

        set({
            notifications: notifications.map((n) => ({ ...n, is_read: true })),
            unreadCount: 0,
        });

        try {
            await notificationApi.markAllAsRead();
        } catch (err: any) {
            set({ notifications, unreadCount });
        }
    },

    markAllAsRead: async () => {
        return get().markAllRead();
    },

    addFromWebSocket: (notification: Notification) => {
        set((state) => {
            const exists = state.notifications.some((n) => n.id === notification.id);
            if (exists) return state;

            return {
                notifications: [notification, ...state.notifications],
                unreadCount: !notification.is_read ? state.unreadCount + 1 : state.unreadCount,
            };
        });
    },

    addNotification: (notification: Notification) => {
        get().addFromWebSocket(notification);
    },

    clearError: () => set({ error: null }),
}));

export default useNotificationStore;