import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";

// Constants
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_REFRESH_URL = `${API_URL}/api/token/refresh/`;

// Token storage keys
const ACCESS_TOKEN_KEY = "citypulse_access_token";
const REFRESH_TOKEN_KEY = "citypulse_refresh_token";

// Interface for JWT token payload
interface JwtPayload {
  exp: number;
  user_id: number;
  role: string;
}

class ApiClient {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // If error is 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for token refresh
            try {
              const newToken = await new Promise<string>((resolve) => {
                this.addRefreshSubscriber((token: string) => {
                  resolve(token);
                });
              });

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              } else {
                originalRequest.headers = {
                  Authorization: `Bearer ${newToken}`,
                };
              }

              return this.api(originalRequest);
            } catch (err) {
              return Promise.reject(err);
            }
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.onRefreshed(newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${newToken}` };
            }

            return this.api(originalRequest);
          } catch (refreshError) {
            // Clear tokens on refresh failure
            this.clearTokens();
            this.isRefreshing = false;
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(TOKEN_REFRESH_URL, {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem(ACCESS_TOKEN_KEY, access);

      this.isRefreshing = false;
      return access;
    } catch (error) {
      this.clearTokens();
      this.isRefreshing = false;
      throw error;
    }
  }

  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  // Store authentication tokens
  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Clear authentication tokens
  public clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // Check if current token is valid
  public isTokenValid(): boolean {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Get user info from token
  public getUserFromToken(): { id: number; role: string } | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    try {
      const { user_id, role } = jwtDecode<JwtPayload>(token);
      return { id: user_id, role };
    } catch (error) {
      return null;
    }
  }

  // API request methods
  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }
}

export default new ApiClient();
