import { useCallback, useEffect, useRef,useState } from 'react';

import config from '@/lib/config';

export function useConnectivity() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnection = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      // Ping our own server rather than a third-party site that may be blocked.
      await fetch(`${config.apiUrl}/health`, { signal: controller.signal, cache: 'no-store' });
      setIsConnected(true);
    } catch (error) {
      // A slow answer usually means the hosted server is waking up, not that the
      // phone is offline; only a failed connection counts as offline.
      if ((error as Error)?.name !== 'AbortError') setIsConnected(false);
    } finally {
      clearTimeout(timeoutId);
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
