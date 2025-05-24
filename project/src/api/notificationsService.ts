import apiClient from "./apiClient";
import { Notification } from "../types/notifications";

export const notificationsService = {
  async getAllNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>("/api/notifications/");
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      "/api/notifications/unread/count/",
    );
    return response.data.count;
  },

  async markAsRead(id: number): Promise<Notification> {
    const response = await apiClient.patch<Notification>(
      `/api/notifications/${id}/read/`,
    );
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post("/api/notifications/mark-all-read/");
  },
};

export default notificationsService;
