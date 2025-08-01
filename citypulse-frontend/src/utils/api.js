import axios from 'axios';

const API_BASE_URL = 'http://13.203.205.29/backend';
// const API_BASE_URL = 'http://localhost:8000'; // Uncomment this line for local development
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't override Content-Type if it's already set (for multipart/form-data)
  if (config.headers['Content-Type'] === 'multipart/form-data') {
    delete config.headers['Content-Type']; // Let the browser set it with the boundary
  }
  
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // If the original request used FormData, we need to make sure not to set Content-Type
          if (originalRequest.headers['Content-Type'] === 'multipart/form-data') {
            delete originalRequest.headers['Content-Type'];
          }
          
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/token/', credentials),
  refresh: (refreshToken) => api.post('/api/token/refresh/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/me/'),
};

// Complaints API
export const complaintsAPI = {
  getAll: () => api.get('/complaints/'),
  getUserComplaints: () => api.get('/complaints/user/'),
  create: (complaintData) => {
    // Special handling for multipart/form-data (file uploads)
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/complaints-create/', complaintData, config);
  },
  getStatus: (complaintId) => api.get(`/complaints/${complaintId}/status/`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/list-all-users/'),
  addWorkerOrUser: (userData) => api.post('/add-worker-or-user/', userData),
  getCurrentUser: () => api.get('/me/'),
};

// Workers API
export const workersAPI = {
  getAll: () => api.get('/workers/'),
  getTasks: () => api.get('/tasks/'),
  getWorkerTasks: (workerId) => api.get(`/tasks/worker/${workerId}/`),
  getAssignedTasks: (workerId) => api.get(`/tasks/assigned/?worker_id=${workerId}`),
};

// Notifications API
export const notificationsAPI = {
  getByUser: () => api.get(`/notifications/user/`),
  getUnread: () => api.get('/notifications/unread/'),
  getByTime: (days) => api.get(`/notifications/time/${days}/`),
};

export default api;