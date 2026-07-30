import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

export function useConnectivity() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnection = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch('https://httpbin.org/get', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      setIsConnected(response.ok);
    } catch {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  useEffect(() => {
    checkConnection();
    intervalRef.current = setInterval(checkConnection, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkConnection]);

  return {
    isConnected,
    isOffline: !isConnected,
    checkConnection,
  };
}

export function useOnlineStatus() {
  const { isOffline } = useConnectivity();
  return !isOffline;
}
