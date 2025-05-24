import { User, UserRole } from "./auth";

export enum ComplaintStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export enum ComplaintCategory {
  ROAD = "road",
  WATER = "water",
  ELECTRICITY = "electricity",
  SANITATION = "sanitation",
  PUBLIC_PROPERTY = "public_property",
  OTHERS = "others",
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  submittedBy: User;
  assignedTo?: User;
  statusHistory: StatusUpdate[];
}

export interface StatusUpdate {
  id: number;
  status: ComplaintStatus;
  comment: string;
  updatedBy: User;
  updatedAt: string;
}

export interface ComplaintFilters {
  status?: ComplaintStatus;
  category?: ComplaintCategory;
  search?: string;
  assignedTo?: number;
  submittedBy?: number;
}

export interface NewComplaintData {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: File[];
}

export interface StatusUpdateData {
  status: ComplaintStatus;
  comment: string;
}

// Helper function to check if a user can update a complaint's status
export const canUpdateStatus = (
  userRole: UserRole,
  complaint: Complaint,
): boolean => {
  // Admin can update any complaint
  if (userRole === UserRole.ADMIN) return true;

  // Worker can only update if assigned to them
  if (userRole === UserRole.WORKER) {
    return complaint.assignedTo?.id === complaint.submittedBy.id;
  }

  // Regular users cannot update status
  return false;
};

// Helper function to get available status options based on current status
export const getAvailableStatusOptions = (
  currentStatus: ComplaintStatus,
): ComplaintStatus[] => {
  switch (currentStatus) {
    case ComplaintStatus.PENDING:
      return [ComplaintStatus.IN_PROGRESS, ComplaintStatus.CLOSED];
    case ComplaintStatus.IN_PROGRESS:
      return [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED];
    case ComplaintStatus.RESOLVED:
      return [ComplaintStatus.CLOSED];
    case ComplaintStatus.CLOSED:
      return [];
    default:
      return [];
  }
};
