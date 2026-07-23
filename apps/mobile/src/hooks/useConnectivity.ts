import { useEffect, useState, useCallback } from 'react';

export function useConnectivity() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return {
    isConnected,
    isOffline: !isConnected,
  };
}

export function useOnlineStatus() {
  const { isOffline } = useConnectivity();
  return !isOffline;
}
