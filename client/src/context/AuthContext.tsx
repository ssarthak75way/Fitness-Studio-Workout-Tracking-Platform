import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { User } from '../types';

// ... existing imports

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, newUser: User) => void;
  logout: () => void;
  updateUser: (newUser: User) => void;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  impersonate: (userId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isImpersonating, setIsImpersonating] = useState<boolean>(!!localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if token exists on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getProfile();
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
    setIsImpersonating(false);
    navigate('/login');
  };

  const impersonate = async (userId: string) => {
    try {
      const response = await authService.impersonate(userId);
      const { user: newUser, token: newToken } = response.data;

      // Save current token as admin token
      if (token) {
        localStorage.setItem('adminToken', token);
      }

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      setIsImpersonating(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Impersonation failed:', error);
      throw error;
    }
  };

  const stopImpersonation = async () => {
    try {
      const response = await authService.stopImpersonation();
      const { user: newUser, token: newToken } = response.data;

      localStorage.removeItem('adminToken');
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      setIsImpersonating(false);
      navigate('/admin/users');
    } catch (error) {
      console.error('Stopping impersonation failed:', error);
      // Fallback: if API fails, at least try to restore admin token from localStorage if possible
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        localStorage.setItem('token', adminToken);
        localStorage.removeItem('adminToken');
        window.location.reload();
      } else {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUser,
      isAuthenticated: !!token,
      loading,
      isLoading: loading,
      impersonate,
      stopImpersonation,
      isImpersonating
    }}>
      {children}
    </AuthContext.Provider>
  );
};


// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};