import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
        setAccessToken(token);
        setIsAuthenticated(true);
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      const userResponse = await authAPI.getCurrentUser();
      setUser(userResponse.data);
      setAccessToken(access);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      const response = await authAPI.refresh(refresh);
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      setAccessToken(access);
      return access;
    } catch (error) {
      console.error('Refresh failed:', error);
      logout();
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  // auto-refresh access token every 4 mins
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        refreshAccessToken();
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    accessToken,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
