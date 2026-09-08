import React from 'react';
import { Loader2, BellOff, RefreshCw } from 'lucide-react';
import type { Notification } from '../types/notification';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onMarkAsRead: (id: number) => void;
  onDelete?: (id: number) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  hasMore,
  onMarkAsRead,
  onDelete,
  onLoadMore,
  onRetry,
}) => {
  if (error && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-600" />
        <span className="text-sm">Loading notifications...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
        <BellOff className="w-10 h-10 mb-2 stroke-1 text-gray-400" />
        <p className="text-sm font-medium">No notifications yet</p>
        <p className="text-xs text-gray-400 mt-1">We will notify you when something happens</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px]">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>

      {hasMore && (
        <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more notifications'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
