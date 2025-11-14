import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  mode: 'real' | 'demo' | null;
  username: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string, isDemo: boolean) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem('planflow_auth');
    if (stored) {
      return JSON.parse(stored);
    }
    return { isAuthenticated: false, mode: null, username: null };
  });

  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem('planflow_auth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('planflow_auth');
    }
  }, [authState]);

  const login = (username: string, password: string, isDemo: boolean): boolean => {
    if (isDemo) {
      setAuthState({
        isAuthenticated: true,
        mode: 'demo',
        username: 'demo'
      });
      return true;
    }

    if (username === 'test' && password === 'test') {
      setAuthState({
        isAuthenticated: true,
        mode: 'real',
        username: 'test'
      });
      return true;
    }

    return false;
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, mode: null, username: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
