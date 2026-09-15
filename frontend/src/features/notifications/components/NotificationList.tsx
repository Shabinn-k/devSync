import React from 'react';
import { Loader2, Bell, AlertCircle } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../types/notification';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null; 
  onMarkAsRead: (id: number) => void;
  onLoadMore: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  onMarkAsRead, 
}) => {
  if (loading && notifications.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 flex-col items-center justify-center text-center p-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="mt-2 text-sm text-white/40">{error}</p>
        <button
          className="mt-2 rounded-lg border border-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/10"
        >
          Retry
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center text-center">
        <Bell className="h-8 w-8 text-white/20" />
        <p className="mt-2 text-sm text-white/40">No notifications</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
      {/* {hasMore && (
        <div className="p-2 text-center">
          <button
            onClick={onLoadMore}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Load more
          </button>
        </div>
      )} */}
    </div>
  );
};