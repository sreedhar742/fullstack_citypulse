import apiClient from "./apiClient";
import {
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
} from "../types/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>(
      "/api/token/",
      credentials,
    );
    const { access, refresh } = response.data;

    // Store tokens
    apiClient.setTokens(access, refresh);

    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>("/api/users/register/", data);
    return response.data;
  },

  async logout(): Promise<void> {
    // JWT is stateless, so we just remove the tokens
    apiClient.clearTokens();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>("/api/users/me/");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null; // Or throw an error, depending on your error handling strategy
    }
  },

  isAuthenticated(): boolean {
    return apiClient.isTokenValid();
  },
};

export default authService;
