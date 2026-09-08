import { useEffect, useRef, useState, useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import type { WebSocketNotificationEvent } from '../features/notifications/types/notification';

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = { autoConnect: true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef<number>(1000); // initial backoff 1s
  const maxBackoff = 30000; // max backoff 30s
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

      if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    const token = localStorage.getItem('devsync_access_token');
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
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data) as WebSocketNotificationEvent;
          if (payload && payload.event === 'notification' && payload.data) {
            addNotification(payload.data);
          }
        } catch {
          
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
