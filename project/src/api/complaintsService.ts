import apiClient from "./apiClient";
import {
  Complaint,
  ComplaintFilters,
  NewComplaintData,
  StatusUpdateData,
} from "../types/complaints";

export const complaintsService = {
  async getAllComplaints(filters?: ComplaintFilters): Promise<Complaint[]> {
    const response = await apiClient.get<Complaint[]>("/api/complaints/", {
      params: filters,
    });
    return response.data;
  },

  async getComplaintById(id: number): Promise<Complaint> {
    const response = await apiClient.get<Complaint>(`/api/complaints/${id}/`);
    return response.data;
  },

  async createComplaint(data: NewComplaintData): Promise<Complaint> {
    // Handle file uploads using FormData
    console.log("Creating complaint with data:", data);
    
    const formData = new FormData();

    // Add text fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("location", data.location);
    
    if (data.latitude) formData.append("latitude", data.latitude.toString());
    if (data.longitude) formData.append("longitude", data.longitude.toString());

    // Add images if present
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    console.log("FormData for complaint:", formData);
    const response = await apiClient.post<Complaint>(
      "/api/complaints-create/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    console.log("Created complaint response:", response.data);
    return response.data;
  },

  async updateComplaintStatus(
    id: number,
    data: StatusUpdateData,
  ): Promise<Complaint> {
    const response = await apiClient.patch<Complaint>(
      `/api/complaints/${id}/status/`,
      data,
    );
    return response.data;
  },

  async assignComplaint(id: number, workerId: number): Promise<Complaint> {
    const response = await apiClient.patch<Complaint>(
      `/api/complaints/${id}/assign/`,
      { worker_id: workerId },
    );
    return response.data;
  },
};

export default complaintsService;
