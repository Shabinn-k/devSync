import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, WifiOff } from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { NotificationBadge } from './NotificationBadge';
import { NotificationList } from './NotificationList';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    page,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const { isConnected } = useWebSocket({ autoConnect: true });

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications(1);
  }, [fetchUnreadCount, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLoadMore = () => {
    fetchNotifications(page + 1);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <NotificationBadge count={unreadCount} className="absolute -top-0.5 -right-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Notifications</h3>
              {!isConnected && (
                <span title="Real-time disconnected (Reconnecting...)" className="text-amber-500">
                  <WifiOff className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <NotificationList
            notifications={notifications}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onLoadMore={handleLoadMore}
            onRetry={() => fetchNotifications(1)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
