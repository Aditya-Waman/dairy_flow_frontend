// API utility functions for communicating with the backend
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dairy-flow-backend-postgres.onrender.com';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  token?: string;
  user?: any;
  farmer?: any;
  admin?: any;
  stockItem?: any;
  stock?: any[];
  farmers?: any[];
  admins?: any[];
  request?: any;
  requests?: any[];
  stats?: any;
  report?: any;
  reports?: any;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get JWT token from localStorage
export function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem('auth:user');
    if (authData) {
      const { token } = JSON.parse(authData);
      return token || null;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// Store JWT token in localStorage
export function setAuthToken(token: string) {
  try {
    const authData = localStorage.getItem('auth:user');
    if (authData) {
      const parsed = JSON.parse(authData);
      localStorage.setItem('auth:user', JSON.stringify({ ...parsed, token }));
    }
  } catch {
    // Ignore errors
  }
}

// Clear JWT token from localStorage
export function clearAuthToken() {
  try {
    localStorage.removeItem('auth:user');
  } catch {
    // Ignore errors
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add JWT token if available
  const token = getAuthToken();
  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Use default error message
    }

    throw new ApiError(response.status, errorMessage);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  return response.json();
}

// HTTP methods
export const api = {
  get: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    makeRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> =>
    makeRequest<T>(endpoint, { ...options, method: 'POST', body: data ? JSON.stringify(data) : undefined }),

  put: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> =>
    makeRequest<T>(endpoint, { ...options, method: 'PUT', body: data ? JSON.stringify(data) : undefined }),

  patch: <T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> =>
    makeRequest<T>(endpoint, { ...options, method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),

  delete: <T>(endpoint: string, options?: RequestInit): Promise<T> =>
    makeRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Specific API endpoints
export const authApi = {
  login: (mobile: string, password: string) =>
    api.post<{ success: boolean; user: any; token: string }>('/api/auth/login', { mobile, password }),

  profile: () =>
    api.get<{ success: boolean; user: any }>('/api/auth/profile'),

  logout: () =>
    api.post('/api/auth/logout'),
};

export const farmerApi = {
  getAll: (params?: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any[]>>(`/api/farmers${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/api/farmers/${id}`),

  create: (farmerData: any) =>
    api.post<ApiResponse<any>>('/api/farmers', farmerData),

  update: (id: string, farmerData: any) =>
    api.put<ApiResponse<any>>(`/api/farmers/${id}`, farmerData),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/api/farmers/${id}`),

  toggleStatus: (id: string) =>
    api.patch<ApiResponse<any>>(`/api/farmers/${id}/toggle-status`),

  search: (q: string, params?: { status?: string; limit?: number }) => {
    const searchParams = new URLSearchParams({ q });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get<ApiResponse<any[]>>(`/api/farmers/search?${searchParams.toString()}`);
  },
};

export const adminApi = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any[]>>(`/api/admins${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/api/admins/${id}`),

  create: (adminData: any) =>
    api.post<ApiResponse<any>>('/api/admins', adminData),

  update: (id: string, adminData: any) =>
    api.put<ApiResponse<any>>(`/api/admins/${id}`, adminData),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/api/admins/${id}`),
};

export const stockApi = {
  getAll: (params?: {
    search?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
    lowStock?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any[]>>(`/api/stock${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/api/stock/${id}`),

  create: (stockData: any) =>
    api.post<ApiResponse<any>>('/api/stock', stockData),

  update: (id: string, stockData: any) =>
    api.put<ApiResponse<any>>(`/api/stock/${id}`, stockData),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/api/stock/${id}`),

  getByType: (type: string, params?: { sortBy?: string; sortOrder?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any[]>>(`/api/stock/type/${type}${queryString ? `?${queryString}` : ''}`);
  },

  getStats: () =>
    api.get<ApiResponse<any>>('/api/stock/stats'),

  getLowStock: (threshold?: number) => {
    const searchParams = new URLSearchParams();
    if (threshold !== undefined) {
      searchParams.append('threshold', threshold.toString());
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any[]>>(`/api/stock/low-stock${queryString ? `?${queryString}` : ''}`);
  },

  search: (q: string, params?: { type?: string; limit?: number }) => {
    const searchParams = new URLSearchParams({ q });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get<ApiResponse<any[]>>(`/api/stock/search?${searchParams.toString()}`);
  },
};

export const requestApi = {
  getAll: (params?: {
    farmerId?: string;
    feedId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any[]>>(`/api/requests${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/api/requests/${id}`),

  create: (requestData: any) =>
    api.post<ApiResponse<any>>('/api/requests', requestData),

  approve: (id: string) =>
    api.patch<ApiResponse<any>>(`/api/requests/${id}/approve`, {}),

  reject: (id: string) =>
    api.patch<ApiResponse<any>>(`/api/requests/${id}/reject`, {}),
};

export const reportApi = {
  getReports: (params?: {
    farmerId?: string;
    adminId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any>>('/api/reports' + (queryString ? `?${queryString}` : ''));
  },

  getFarmerReport: (farmerId: string, params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any>>(`/api/reports/farmer/${farmerId}${queryString ? `?${queryString}` : ''}`);
  },

  getFeedStockReport: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    return api.get<ApiResponse<any>>(`/api/reports/feed-stock${queryString ? `?${queryString}` : ''}`);
  },
};
