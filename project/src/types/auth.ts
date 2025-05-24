export enum UserRole {
  USER = "user",
  WORKER = "worker",
  ADMIN = "admin",
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  dateJoined: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
