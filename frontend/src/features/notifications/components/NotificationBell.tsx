import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, WifiOff, Loader2 } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../../../stores/authStore';
import { tokenStorage } from '../../../lib/tokenStorage';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { NotificationBadge } from './NotificationBadge';
import { NotificationList } from './NotificationList';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useWebSocket();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllRead,
  } = useNotificationStore();

  const token = useAuthStore((s) => s.token || s.accessToken) || tokenStorage.getAccessToken() || null;

  useEffect(() => {
    if (token && token !== 'undefined' && token !== 'null') {
      fetchUnreadCount();
      fetchNotifications();
    }
  }, [token, fetchUnreadCount, fetchNotifications]);

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

  const handleNotificationClick = (id: number) => {
    markAsRead(id);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-full p-2 text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <NotificationBadge count={unreadCount || 0} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-black shadow-2xl z-50 overflow-hidden">

          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm font-mono uppercase tracking-wider">
                Notifications
              </h3>
              {!isConnected && (
                <span title="Real-time disconnected" className="text-white/30">
                  <WifiOff className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="inline-flex items-center gap-1 text-xs font-mono text-white/60 hover:text-white transition-all duration-200"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="bg-black max-h-[400px] overflow-y-auto divide-y divide-white/5">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-white/40" />
              </div>
            ) : (
              <NotificationList
                notifications={notifications}
                loading={loading}
                error={error}
                onMarkAsRead={handleNotificationClick}
                onLoadMore={() => { }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
