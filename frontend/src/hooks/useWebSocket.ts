import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../lib/socket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = { autoConnect: true }) => {
  const [status, setStatus] = useState(() => socketService.getStatus());

  useEffect(() => {
    const unsubscribe = socketService.subscribeStatus((isConnected, connectionError) => {
      setStatus({ isConnected, connectionError });
    });

    if (options.autoConnect) {
      socketService.connect();
    }

    return () => {
      unsubscribe();
    };
  }, [options.autoConnect]);

  const connect = useCallback(() => {
    socketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  return {
    isConnected: status.isConnected,
    connectionError: status.connectionError,
    connect,
    disconnect,
  };
};

export default useWebSocket;