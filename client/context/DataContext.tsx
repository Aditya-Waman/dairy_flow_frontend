import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { farmerApi, adminApi, stockApi, requestApi, ApiError } from "@/lib/api";

export type FarmerStatus = "Active" | "Inactive";
export type Farmer = {
  id: string;
  fullName: string;
  mobile: string;
  code: string;
  email?: string;
  status: FarmerStatus;
  createdAt: string;
  createdBy: string;
  feedHistory: { date: string; feedType: string; bags: number; price: number; approvedBy: string }[];
};

export type AdminUser = {
  id: string;
  name: string;
  mobile: string;
  password: string;
  createdAt: string;
  createdBy: string;
};

export type StockItem = {
  id: string;
  name: string;
  type: string;
  quantityBags: number;
  bagWeight: number; // Weight per bag in kg
  purchasePrice: number;
  sellingPrice: number;
  lastUpdated: string;
  updatedBy: string;
};

export type FeedRequest = {
  id: string;
  farmerId: string | { id: string; fullName: string; mobile: string; code: string };
  feedId: string | { id: string; name: string; type: string; sellingPrice: number; purchasePrice: number };
  qtyBags: number;
  price: number; // auto-calculated (feedPrice * qty)
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  // Historical prices stored at approval time
  sellingPriceAtApproval?: number; // selling price per bag at time of approval
  purchasePriceAtApproval?: number; // purchase price per bag at time of approval
  totalProfitAtApproval?: number; // total profit at time of approval
};

export type DataError = {
  message: string;
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  timestamp: number;
};

type DataContextType = {
  farmers: Farmer[];
  admins: AdminUser[];
  stock: StockItem[];
  requests: FeedRequest[];
  loading: boolean;
  error: DataError | null;
  lastUpdated: number | null;
  addFarmer: (f: Omit<Farmer, "id" | "createdAt" | "createdBy" | "feedHistory">) => Promise<void>;
  updateFarmer: (id: string, patch: Partial<Farmer>) => Promise<void>;
  deleteFarmer: (id: string) => Promise<void>;
  toggleFarmerStatus: (id: string) => Promise<void>;
  addAdmin: (a: Omit<AdminUser, "id" | "createdAt" | "createdBy">) => Promise<void>;
  updateAdmin: (id: string, patch: Partial<AdminUser>) => Promise<void>;
  deleteAdmin: (id: string) => Promise<void>;
  addStock: (item: Omit<StockItem, "id" | "lastUpdated" | "updatedBy">) => Promise<void>;
  updateStock: (id: string, patch: Partial<StockItem>) => Promise<void>;
  createRequest: (farmerId: string, feedId: string, qtyBags: number) => Promise<FeedRequest | null>;
  approveRequest: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  rejectRequest: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [requests, setRequests] = useState<FeedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to create error objects
  const createError = (error: any, type: DataError['type'] = 'unknown'): DataError => ({
    message: error?.message || error?.error || 'An unexpected error occurred',
    type,
    timestamp: Date.now()
  });

  // Helper function to handle API errors
  const handleApiError = (error: any): DataError => {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        return createError(error, 'auth');
      } else if (error.statusCode >= 400 && error.statusCode < 500) {
        return createError(error, 'validation');
      } else if (error.statusCode >= 500) {
        return createError(error, 'server');
      }
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return createError({ message: 'Network connection failed. Please check your internet connection.' }, 'network');
    }
    
    return createError(error, 'unknown');
  };

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data from backend APIs
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Loading initial data...');

        // Load data based on user role
        const apiCalls = [
          farmerApi.getAll(),
          stockApi.getAll(),
          requestApi.getAll(),
        ];
        
        // Only load admin data for superadmin users
        if (user.role === 'superadmin') {
          apiCalls.push(adminApi.getAll());
        }
        
        const results = await Promise.allSettled(apiCalls);
        const [farmersRes, stockRes, requestsRes, adminsRes] = results;

        let hasErrors = false;

        // Process farmers response
        if (farmersRes.status === 'fulfilled') {
          const response = farmersRes.value;
          if (response.success) {
            setFarmers(response.data || response.farmers || []);
            console.log('✅ Farmers loaded:', response.data?.length || response.farmers?.length || 0);
          } else {
            console.error('❌ Farmers API error:', response.error || response.message);
            hasErrors = true;
          }
        } else if (farmersRes.status === 'rejected') {
          console.error('❌ Farmers request failed:', farmersRes.reason);
          hasErrors = true;
        }

        // Process admins response (only for superadmin users)
        if (user.role === 'superadmin') {
          if (adminsRes && adminsRes.status === 'fulfilled') {
            const response = adminsRes.value;
            if (response.success) {
              const adminsData = response.data || response.admins || [];
              console.log('✅ Admins loaded:', adminsData.length);
              setAdmins(adminsData);
            } else {
              console.error('❌ Admins API error:', response.error || response.message);
              hasErrors = true;
            }
          } else if (adminsRes && adminsRes.status === 'rejected') {
            console.error('❌ Admins request failed:', adminsRes.reason);
            hasErrors = true;
          }
        } else {
          // For non-superadmin users, set empty admins array
          setAdmins([]);
        }

        // Process stock response
        if (stockRes.status === 'fulfilled') {
          const response = stockRes.value;
          if (response.success) {
            setStock(response.data || response.stock || []);
            console.log('✅ Stock loaded:', response.data?.length || response.stock?.length || 0);
          } else {
            console.error('❌ Stock API error:', response.error || response.message);
            hasErrors = true;
          }
        } else if (stockRes.status === 'rejected') {
          console.error('❌ Stock request failed:', stockRes.reason);
          hasErrors = true;
        }

        // Process requests response
        if (requestsRes.status === 'fulfilled') {
          const response = requestsRes.value;
          if (response.success) {
            setRequests(response.data || response.requests || []);
            console.log('✅ Requests loaded:', response.data?.length || response.requests?.length || 0);
          } else {
            console.error('❌ Requests API error:', response.error || response.message);
            hasErrors = true;
          }
        } else if (requestsRes.status === 'rejected') {
          console.error('❌ Requests request failed:', requestsRes.reason);
          hasErrors = true;
        }

        if (hasErrors) {
          setError(createError({ message: 'Some data failed to load. Please refresh to try again.' }, 'server'));
        }

        setLastUpdated(Date.now());
        console.log('✅ Data loading completed');

      } catch (error) {
        console.error('❌ Error loading initial data:', error);
        setError(handleApiError(error));
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadInitialData();
  }, [user]);

  // Farmer operations using backend API
  const addFarmer: DataContextType["addFarmer"] = useCallback(async (f) => {
    try {
      setError(null);
      const response = await farmerApi.create(f);
      if (response.success && (response.data || response.farmer)) {
        const newFarmer = response.data || response.farmer;
        setFarmers((prev) => [newFarmer, ...prev]);
        console.log('✅ Farmer added successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to add farmer');
      }
    } catch (error) {
      console.error('❌ Error adding farmer:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  const updateFarmer = useCallback(async (id: string, patch: Partial<Farmer>) => {
    try {
      setError(null);
      const response = await farmerApi.update(id, patch);
      if (response.success && (response.data || response.farmer)) {
        const updatedFarmer = response.data || response.farmer;
        setFarmers((prev) => prev.map((x) => (x.id === id ? updatedFarmer : x)));
        console.log('✅ Farmer updated successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to update farmer');
      }
    } catch (error) {
      console.error('❌ Error updating farmer:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  const deleteFarmer = useCallback(async (id: string) => {
    try {
      setError(null);
      await farmerApi.delete(id);
      setFarmers((prev) => prev.filter((x) => x.id !== id));
      console.log('✅ Farmer deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting farmer:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  const toggleFarmerStatus = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await farmerApi.toggleStatus(id);
      if (response.success && (response.data || response.farmer)) {
        const updatedFarmer = response.data || response.farmer;
        setFarmers((prev) => prev.map((x) => (x.id === id ? updatedFarmer : x)));
        console.log('✅ Farmer status toggled successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to toggle farmer status');
      }
    } catch (error) {
      console.error('❌ Error toggling farmer status:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  // Admin operations using backend API
  const addAdmin: DataContextType["addAdmin"] = useCallback(async (a) => {
    try {
      setError(null);
      const response = await adminApi.create(a);
      if (response.success && (response.data || response.admin)) {
        const newAdmin = response.data || response.admin;
        setAdmins((prev) => [newAdmin, ...prev]);
        console.log('✅ Admin added successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to add admin');
      }
    } catch (error) {
      console.error('❌ Error adding admin:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  const updateAdmin = useCallback(async (id: string, patch: Partial<AdminUser>) => {
    try {
      setError(null);
      const response = await adminApi.update(id, patch);
      if (response.success && (response.data || response.admin)) {
        const updatedAdmin = response.data || response.admin;
        setAdmins((prev) => {
          const newAdmins = prev.map((x) => {
            const adminId = x.id || (x as any)._id;
            return (adminId === id ? updatedAdmin : x);
          });
          return newAdmins;
        });
        console.log('✅ Admin updated successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to update admin');
      }
    } catch (error) {
      console.error('❌ Error updating admin:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError, admins]);

  const deleteAdmin = useCallback(async (id: string) => {
    try {
      setError(null);
      await adminApi.delete(id);
      setAdmins((prev) => prev.filter((x) => {
        const adminId = x.id || (x as any)._id;
        return adminId !== id;
      }));
      console.log('✅ Admin deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting admin:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  // Stock operations using backend API
  const addStock: DataContextType["addStock"] = useCallback(async (item) => {
    try {
      setError(null);
      const response = await stockApi.create(item);
      if (response.success && (response.data || response.stockItem)) {
        const newStockItem = response.data || response.stockItem;
        setStock((prev) => [newStockItem, ...prev]);
        console.log('✅ Stock item added successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to add stock item');
      }
    } catch (error) {
      console.error('❌ Error adding stock:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  const updateStock = useCallback(async (id: string, patch: Partial<StockItem>) => {
    try {
      setError(null);
      const response = await stockApi.update(id, patch);
      if (response.success && (response.data || response.stockItem)) {
        const updatedStockItem = response.data || response.stockItem;
        setStock((prev) => prev.map((x) => (x.id === id ? updatedStockItem : x)));
        console.log('✅ Stock item updated successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to update stock item');
      }
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  // Request operations using backend API
  const createRequest: DataContextType["createRequest"] = useCallback(async (farmerId, feedId, qtyBags) => {
    try {
      setError(null);
      const response = await requestApi.create({ farmerId, feedId, qtyBags });
      if (response.success && (response.data || response.request)) {
        const newRequest = response.data || response.request;
        setRequests((prev) => [newRequest, ...prev]);
        console.log('✅ Request created successfully');
        return newRequest;
      } else {
        throw new Error(response.error || response.message || 'Failed to create request');
      }
    } catch (error) {
      console.error('❌ Error creating request:', error);
      setError(handleApiError(error));
      return null;
    }
  }, [handleApiError]);

  const approveRequest: DataContextType["approveRequest"] = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await requestApi.approve(id);
      if (response.success && (response.data || response.request)) {
        const updatedRequest = response.data || response.request;
        setRequests((prev) => prev.map((r) => (r.id === id ? updatedRequest : r)));

        // Update stock and farmer data after approval
        if (updatedRequest.status === 'Approved') {
          // Refresh stock data to reflect quantity changes
          try {
          const stockResponse = await stockApi.getAll();
          if (stockResponse.success) {
              setStock(stockResponse.data || stockResponse.stock || []);
            }
          } catch (stockError) {
            console.warn('Failed to refresh stock after approval:', stockError);
          }

          // Refresh farmers data to reflect feed history changes
          try {
          const farmersResponse = await farmerApi.getAll();
          if (farmersResponse.success) {
              setFarmers(farmersResponse.data || farmersResponse.farmers || []);
            }
          } catch (farmerError) {
            console.warn('Failed to refresh farmers after approval:', farmerError);
          }
        }

        console.log('✅ Request approved successfully');
        return { ok: true as const };
      } else {
        throw new Error(response.error || response.message || "Approval failed");
      }
    } catch (error: any) {
      console.error('❌ Error approving request:', error);
      setError(handleApiError(error));
      return { ok: false as const, error: error.message || "Approval failed" };
    }
  }, [handleApiError]);

  const rejectRequest: DataContextType["rejectRequest"] = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await requestApi.reject(id);
      if (response.success && (response.data || response.request)) {
        const updatedRequest = response.data || response.request;
        setRequests((prev) => prev.map((r) => (r.id === id ? updatedRequest : r)));
        console.log('✅ Request rejected successfully');
      } else {
        throw new Error(response.error || response.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      setError(handleApiError(error));
      throw error;
    }
  }, [handleApiError]);

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Refreshing data...');

      // Load all data in parallel
      const [farmersRes, adminsRes, stockRes, requestsRes] = await Promise.allSettled([
        farmerApi.getAll(),
        adminApi.getAll(),
        stockApi.getAll(),
        requestApi.getAll(),
      ]);

      let hasErrors = false;

      // Process farmers response
      if (farmersRes.status === 'fulfilled') {
        const response = farmersRes.value;
        if (response.success) {
          setFarmers(response.data || response.farmers || []);
          console.log('✅ Farmers refreshed:', response.data?.length || response.farmers?.length || 0);
        } else {
          console.error('❌ Farmers refresh error:', response.error || response.message);
          hasErrors = true;
        }
      } else if (farmersRes.status === 'rejected') {
        console.error('❌ Farmers refresh failed:', farmersRes.reason);
        hasErrors = true;
      }

      // Process admins response
      if (adminsRes.status === 'fulfilled') {
        const response = adminsRes.value;
        if (response.success) {
          setAdmins(response.data || response.admins || []);
          console.log('✅ Admins refreshed:', response.data?.length || response.admins?.length || 0);
        } else {
          console.error('❌ Admins refresh error:', response.error || response.message);
          hasErrors = true;
        }
      } else if (adminsRes.status === 'rejected') {
        console.error('❌ Admins refresh failed:', adminsRes.reason);
        hasErrors = true;
      }

      // Process stock response
      if (stockRes.status === 'fulfilled') {
        const response = stockRes.value;
        if (response.success) {
          setStock(response.data || response.stock || []);
          console.log('✅ Stock refreshed:', response.data?.length || response.stock?.length || 0);
        } else {
          console.error('❌ Stock refresh error:', response.error || response.message);
          hasErrors = true;
        }
      } else if (stockRes.status === 'rejected') {
        console.error('❌ Stock refresh failed:', stockRes.reason);
        hasErrors = true;
      }

      // Process requests response
      if (requestsRes.status === 'fulfilled') {
        const response = requestsRes.value;
        if (response.success) {
          setRequests(response.data || response.requests || []);
          console.log('✅ Requests refreshed:', response.data?.length || response.requests?.length || 0);
        } else {
          console.error('❌ Requests refresh error:', response.error || response.message);
          hasErrors = true;
        }
      } else if (requestsRes.status === 'rejected') {
        console.error('❌ Requests refresh failed:', requestsRes.reason);
        hasErrors = true;
      }

      if (hasErrors) {
        setError(createError({ message: 'Some data failed to refresh. Please try again.' }, 'server'));
      }

      setLastUpdated(Date.now());
      console.log('✅ Data refresh completed');

    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [user, handleApiError, createError]);

  const value = useMemo(() => ({
    farmers,
    admins,
    stock,
    requests,
    loading,
    error,
    lastUpdated,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    toggleFarmerStatus,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    addStock,
    updateStock,
    createRequest,
    approveRequest,
    rejectRequest,
    refreshData,
    clearError,
  }), [farmers, admins, stock, requests, loading, error, lastUpdated, addFarmer, updateFarmer, deleteFarmer, toggleFarmerStatus, addAdmin, updateAdmin, deleteAdmin, addStock, updateStock, createRequest, approveRequest, rejectRequest, refreshData, clearError]);

  // Provide default context value when not initialized to prevent useData errors
  const defaultValue = useMemo(() => ({
    farmers: [],
    admins: [],
    stock: [],
    requests: [],
    loading: true,
    error: null,
    lastUpdated: null,
    addFarmer: async () => {},
    updateFarmer: async () => {},
    deleteFarmer: async () => {},
    toggleFarmerStatus: async () => {},
    addAdmin: async () => {},
    updateAdmin: async () => {},
    deleteAdmin: async () => {},
    addStock: async () => {},
    updateStock: async () => {},
    createRequest: async () => null,
    approveRequest: async () => ({ ok: false, error: "Not initialized" }),
    rejectRequest: async () => {},
    refreshData: async () => {},
    clearError: () => {},
  }), []);

  return <DataContext.Provider value={isInitialized ? value : defaultValue}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
