import axios, { AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  Claim, 
  ClaimFormData, 
  ClaimFilters, 
  StatusChangeRequest,
  User,
  PresignedUploadResponse,
  Note,
  Assignment,
  SLAReport,
  DashboardStats
} from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> =>
    api.post('/auth/login', credentials),
  
  logout: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/auth/logout'),
  
  getCurrentUser: (): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.get('/auth/me'),
  
  refreshToken: (): Promise<AxiosResponse<ApiResponse<{ token: string }>>> =>
    api.post('/auth/refresh'),
};

// Claims API
export const claimsApi = {
  getClaims: (params: { filters?: ClaimFilters; page?: number; limit?: number }): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Claim>>>> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    return api.get(`/claims?${searchParams.toString()}`);
  },
  
  getClaimById: (id: string): Promise<AxiosResponse<ApiResponse<Claim>>> =>
    api.get(`/claims/${id}`),
  
  createClaim: (claimData: ClaimFormData): Promise<AxiosResponse<ApiResponse<Claim>>> =>
    api.post('/claims', claimData),
  
  updateClaim: (id: string, claimData: Partial<ClaimFormData>): Promise<AxiosResponse<ApiResponse<Claim>>> =>
    api.patch(`/claims/${id}`, claimData),
  
  updateClaimStatus: (id: string, statusChange: StatusChangeRequest): Promise<AxiosResponse<ApiResponse<Claim>>> =>
    api.patch(`/claims/${id}/status`, statusChange),
  
  deleteClaim: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/claims/${id}`),
  
  assignClaim: (assignment: { claimId: string; adjusterId: string; priority: string }): Promise<AxiosResponse<ApiResponse<Assignment>>> =>
    api.post('/assignments', assignment),
};

// Attachments API
export const attachmentsApi = {
  getPresignedUploadUrl: (data: { fileName: string; mimeType: string; size: number; checksum: string }): Promise<AxiosResponse<ApiResponse<PresignedUploadResponse>>> =>
    api.post('/attachments/presign', data),
  
  confirmUpload: (data: { s3Key: string; fileName: string; mimeType: string; size: number; checksum: string; claimId: string }): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.post('/attachments', data),
  
  deleteAttachment: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/attachments/${id}`),
};

// Notes API
export const notesApi = {
  addNote: (claimId: string, note: { body: string; visibility: 'PUBLIC' | 'INTERNAL' }): Promise<AxiosResponse<ApiResponse<Note>>> =>
    api.post(`/claims/${claimId}/notes`, note),
  
  updateNote: (id: string, note: { body: string }): Promise<AxiosResponse<ApiResponse<Note>>> =>
    api.patch(`/notes/${id}`, note),
  
  deleteNote: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/notes/${id}`),
};

// Reports API
export const reportsApi = {
  getSLAReport: (params?: { dateFrom?: string; dateTo?: string }): Promise<AxiosResponse<ApiResponse<SLAReport>>> => {
    const searchParams = new URLSearchParams();
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    return api.get(`/reports/sla?${searchParams.toString()}`);
  },
  
  getDashboardStats: (): Promise<AxiosResponse<ApiResponse<DashboardStats>>> =>
    api.get('/reports/dashboard'),
};

// Users API
export const usersApi = {
  getUsers: (role?: string): Promise<AxiosResponse<ApiResponse<User[]>>> => {
    const params = role ? `?role=${role}` : '';
    return api.get(`/users${params}`);
  },
  
  getUserById: (id: string): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.get(`/users/${id}`),
  
  createUser: (userData: Omit<User, 'id' | 'createdAt'>): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.post('/users', userData),
  
  updateUser: (id: string, userData: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.patch(`/users/${id}`, userData),
  
  deleteUser: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/users/${id}`),
};

export default api;
