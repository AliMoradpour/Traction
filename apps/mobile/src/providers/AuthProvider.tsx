import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface AuthContextValue {
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isLoading: true });

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
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
