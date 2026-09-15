  import React, { useState, useRef, useEffect } from 'react';
  import { Bell, CheckCheck, WifiOff, Loader2 } from 'lucide-react';
  import { useNotificationStore } from '../store/notificationStore';
  import { useAuthStore } from '../../../stores/authStore';
  import { tokenStorage } from '../../../lib/tokenStorage';
  import { NotificationBadge } from './NotificationBadge';
  import { NotificationList } from './NotificationList';

  interface WebSocketNotificationEvent {
    event?: string;
    type?: string;
    data?: any;
    notification?: any;
  }

  export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
      notifications,
      unreadCount,
      loading,
      error,
      fetchNotifications,
      fetchUnreadCount,
      markAsRead,
      markAllRead,
      addFromWebSocket,
    } = useNotificationStore();

    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token || s.accessToken) || tokenStorage.getAccessToken() || null;

    useEffect(() => {
      if (token && token !== 'undefined' && token !== 'null') {
        fetchUnreadCount();
        fetchNotifications();
      }
    }, [token, fetchUnreadCount, fetchNotifications]);

    useEffect(() => {
      if (!token || token === 'undefined' || token === 'null') return;

      let cancelled = false;
      let attempts = 0;
      const maxAttempts = 5;

      const connect = () => {
        if (cancelled) return;
        if (!token || token === 'undefined' || token === 'null') return;

        console.log('[WS] Connecting, token length:', token.length);

        if (wsRef.current) {
          wsRef.current.onopen = null;
          wsRef.current.onmessage = null;
          wsRef.current.onerror = null;
          wsRef.current.onclose = null;
          wsRef.current.close();
          wsRef.current = null;
        }

        const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
        const cleanBase = baseUrl.replace(/^http/, 'ws');
        const wsUrl = `${cleanBase}/ws/notifications?token=${encodeURIComponent(token)}`;

        try {
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = () => {
            if (cancelled) {
              ws.close();
              return;
            }
            setIsConnected(true);
            attempts = 0;
          };

          ws.onmessage = (event: MessageEvent) => {
            if (cancelled) return;
            try {
              const payload = JSON.parse(event.data) as WebSocketNotificationEvent;
              window.dispatchEvent(new CustomEvent('devsync:ws_message', { detail: payload }));
              if (payload && (payload.event === 'notification' || payload.type === 'notification')) {
                const notif = payload.data || payload.notification;
                if (notif) {
                  addFromWebSocket(notif);
                }
              }
            } catch { 
            }
          };

          ws.onerror = () => {
            setIsConnected(false);
          };

          ws.onclose = (event: CloseEvent) => {
            setIsConnected(false);
            wsRef.current = null;

            if (cancelled || event.code === 1000) {
              return;
            }

            if (attempts >= maxAttempts) {
              console.warn('[WebSocket] Giving up after 5 failed connection attempts.');
              return;
            }

            const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
            attempts += 1;

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          };
        } catch {
          setIsConnected(false);
          if (attempts >= maxAttempts) {
            console.warn('[WebSocket] Giving up after 5 failed connection attempts.');
            return;
          }
          const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
          attempts += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      connect();

      return () => {
        cancelled = true;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
          wsRef.current.onopen = null;
          wsRef.current.onmessage = null;
          wsRef.current.onerror = null;
          wsRef.current.onclose = null;
          wsRef.current.close();
          wsRef.current = null;
        }
        setIsConnected(false);
      };
    }, [token, user?.id, addFromWebSocket]);
 
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
            {/* Header */}
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

            {/* List */}
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
                  onLoadMore={() => {}}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  export default NotificationBell;