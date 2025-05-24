import apiClient from "./apiClient";
import { User, UserRole } from "../types/auth";

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>("/api/users/");
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/api/users/${id}/`);
    return response.data;
  },

  async updateUserRole(id: number, role: UserRole): Promise<User> {
    const response = await apiClient.patch<User>(`/api/users/${id}/role/`, {
      role,
    });
    return response.data;
  },

  async getAllWorkers(): Promise<User[]> {
    const response = await apiClient.get<User[]>("/api/workers/");
    return response.data;
  },
};

export default usersService;
