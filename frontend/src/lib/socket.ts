import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';
import { tokenStorage } from './tokenStorage';

type StatusListener = (isConnected: boolean, error: string | null) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private connectionError: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private backoff = 1000;
  private readonly maxBackoff = 30000;
  private listeners = new Set<StatusListener>();
  private activeToken: string | null = null; 

  private notifyListeners() {
    this.listeners.forEach((listener) =>
      listener(this.isConnected, this.connectionError)
    );
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.isConnected, this.connectionError);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      connectionError: this.connectionError,
    };
  }

  public connect() {
    if (typeof window === 'undefined') return;

    const token =
      useAuthStore.getState().accessToken ||
      useAuthStore.getState().token ||
      tokenStorage.getAccessToken();

    if (!token || token === 'undefined' || token === 'null') {
      this.connectionError = 'No valid access token available';
      this.isConnected = false;
      this.notifyListeners();
      return;
    }
 
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING) &&
      this.activeToken === token
    ) {
      return;
    }

    this.disconnect();

    this.activeToken = token; 
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const cleanBase = baseUrl.replace(/^http/, 'ws');
    const wsUrl = `${cleanBase}/ws/notifications?token=${encodeURIComponent(token)}`;

    try {
      const socket = new WebSocket(wsUrl);
      this.socket = socket;

      socket.onopen = () => {
        if (this.socket !== socket) return;
        this.isConnected = true;
        this.connectionError = null; 
        this.backoff = 1000;
        this.notifyListeners();
        console.log('[WS] Connected to shared notifications socket');
      };

      socket.onmessage = (event: MessageEvent) => {
        if (this.socket !== socket) return;
        try {
          const payload = JSON.parse(event.data);
 
          if (
            payload?.event === 'notification' ||
            payload?.type === 'notification'
          ) {
            const notif = payload.data || payload.notification;
            if (notif) {
              useNotificationStore.getState().addNotification?.(notif);
              useNotificationStore.getState().addFromWebSocket?.(notif);
            }
          }
 
          window.dispatchEvent(
            new CustomEvent('devsync:ws_message', { detail: payload })
          );
        } catch (err) {
          console.warn('[WS] Failed to parse message', err);
        }
      };

      socket.onerror = () => {
        if (this.socket !== socket) return;
        this.connectionError = 'WebSocket connection error';
        this.isConnected = false; 
        this.notifyListeners();
      };

      socket.onclose = (event: CloseEvent) => {
        if (this.socket !== socket) return;
        this.isConnected = false; 
        this.socket = null;
        this.notifyListeners();
 
        if (event.code !== 1000) {
          const nextDelay = this.backoff;
          this.backoff = Math.min(this.backoff * 2, this.maxBackoff);

          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, nextDelay);
        }
      };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to initialize WebSocket';
      this.connectionError = errorMsg;
      this.isConnected = false; 
      this.notifyListeners();
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;

      if (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      ) {
        this.socket.close(1000, 'Client disconnected');
      }
      this.socket = null;
    }

    this.activeToken = null;
    this.isConnected = false; 
    this.notifyListeners();
  }
}

export const socketService = new SocketService();
export default socketService;
