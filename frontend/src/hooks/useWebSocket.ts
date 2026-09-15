import { useEffect, useRef, useState, useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore'; 

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = { autoConnect: true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef<number>(1000);
  const maxBackoff = 30000;
  const connectRef = useRef<() => void>(() => {});

  const addNotification = useNotificationStore((state) => state.addNotification);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      socketRef.current.onmessage = null;

      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    const authRaw = localStorage.getItem('auth-storage');
    let token: string | null = null;
    try {
      const parsed = authRaw ? JSON.parse(authRaw) : null;
      token = parsed?.state?.token || parsed?.state?.accessToken || null;
    } catch {
      token = null;
    }
    if (!token) {
      token = localStorage.getItem('devsync_access_token');
    }

    if (!token) {
      setConnectionError('No authentication token found');
      return;
    }

    disconnect();

    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const wsUrl = `${baseUrl.replace(/^http/, 'ws')}/ws/notifications?token=${encodeURIComponent(token)}`;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        backoffRef.current = 1000;
        console.log('[WS] Connected');
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
 
          if (payload?.event === 'notification' && payload?.data) {
            addNotification(payload.data);
          }
          window.dispatchEvent(
            new CustomEvent('devsync:ws_message', { detail: payload })
          );
        } catch (err) {
          console.warn('[WS] Failed to parse message', err);
        }
      };

      socket.onerror = () => {
        setConnectionError('WebSocket connection error');
      };

      socket.onclose = (event: CloseEvent) => {
        setIsConnected(false);
        socketRef.current = null;

        if (event.code !== 1000) {
          const nextDelay = backoffRef.current;
          backoffRef.current = Math.min(backoffRef.current * 2, maxBackoff);

          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current();
          }, nextDelay);
        }
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize WebSocket';
      setConnectionError(errorMsg);
    }
  }, [addNotification, disconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [options.autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
  };
};