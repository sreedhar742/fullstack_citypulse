import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import authService from "../api/authService";
import {
  AuthState,
  LoginCredentials,
  RegisterData,
  User,
  UserRole,
} from "../types/auth";

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasRole: (roles: UserRole[]) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => false,
  hasRole: () => false,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  const setError = (error: string) => {
    setAuthState((prev) => ({ ...prev, error }));
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  const checkAuth = useCallback(async (): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      if (!authService.isAuthenticated()) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
        return false;
      }

      const user = await authService.getCurrentUser();
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
      return true;
    } catch (error) {
      // If token is invalid or expired
      authService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      return false;
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authService.login(credentials);
      await checkAuth();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await authService.register(data);
      // After registration, login the user
      await login({ username: data.username, password: data.password });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      await authService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setError("Logout failed. Please try again.");
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!authState.user) return false;
    return roles.includes(authState.user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        login,
        register,
        logout,
        checkAuth,
        hasRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
