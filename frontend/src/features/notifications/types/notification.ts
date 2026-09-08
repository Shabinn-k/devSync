import type { ApiResponse } from '../../../types/api';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: string;
  action_url?: string;
  metadata?: Record<string, any> | string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface NotificationPaginatedData {
  data: Notification[];
  pagination: Pagination;
}

export type NotificationResponse = ApiResponse<Notification[]> & {
  pagination?: Pagination;
};

export interface UnreadCountData {
  unread_count: number;
}

export type UnreadCountResponse = ApiResponse<UnreadCountData>;

export interface WebSocketNotificationEvent {
  event: 'notification' | string;
  data: Notification;
}
