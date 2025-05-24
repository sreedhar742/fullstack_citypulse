import { ComplaintStatus } from "./complaints";

export enum NotificationType {
  COMPLAINT_STATUS = "complaint_status",
  ASSIGNMENT = "assignment",
  COMMENT = "comment",
  SYSTEM = "system",
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  metadata?: {
    complaintId?: number;
    status?: ComplaintStatus;
    userId?: number;
  };
}
