import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface AuthContextValue {
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isLoading: true });

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Check for existing session on mount
    async function checkAuth() {
      try {
        // TODO: Check SecureStore for refresh token
        // TODO: If token exists, validate with backend
        // For now, just finish loading
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
