import { create } from 'zustand';
import type { Notification } from '../features/notifications/types/notification';
import { notificationApi } from '../features/notifications/api/notificationApi';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;

  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,

  fetchNotifications: async (page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const res = await notificationApi.getNotifications(page, limit);
      set((state) => {
        const existingIds = new Set(state.notifications.map((n) => n.id));
        const newNotifs = res.notifications.filter((n) => !existingIds.has(n.id));
        const updatedList = page === 1 ? res.notifications : [...state.notifications, ...newNotifs];
        
        return {
          notifications: updatedList,
          loading: false,
          page: res.page,
          hasMore: res.page < res.totalPages,
        };
      });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      set({
        loading: false,
        error: errorObj?.response?.data?.message || errorObj?.message || 'Failed to fetch notifications',
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      set({ unreadCount: count });
    } catch {
    }
  },

  markAsRead: async (id: number) => {
    const { notifications, unreadCount } = get();
    const target = notifications.find((n) => n.id === id);
    if (!target || target.is_read) return;

    set({
      notifications: notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      unreadCount: Math.max(0, unreadCount - 1),
    });

    try {
      await notificationApi.markAsRead(id);
    } catch {
      set({
        notifications,
        unreadCount,
      });
    }
  },

  markAllAsRead: async () => {
    const { notifications, unreadCount } = get();
    if (unreadCount === 0) return;

    set({
      notifications: notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    });

    try {
      await notificationApi.markAllAsRead();
    } catch {
      set({
        notifications,
        unreadCount,
      });
    }
  },

  deleteNotification: async (id: number) => {
    const { notifications, unreadCount } = get();
    const target = notifications.find((n) => n.id === id);
    const wasUnread = target ? !target.is_read : false;

    set({
      notifications: notifications.filter((n) => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
    });

    try {
      await notificationApi.deleteNotification(id);
    } catch {
      set({
        notifications,
        unreadCount,
      });
    }
  },

  addNotification: (newNotif: Notification) => {
    set((state) => {
      const exists = state.notifications.some((n) => n.id === newNotif.id);
      if (exists) return state;

      const updated = [newNotif, ...state.notifications];
      const newUnread = !newNotif.is_read ? state.unreadCount + 1 : state.unreadCount;

      return {
        notifications: updated,
        unreadCount: newUnread,
      };
    });
  },
}));
