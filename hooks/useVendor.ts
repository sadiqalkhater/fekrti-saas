// hooks/useVendor.ts
// Hook لإدارة بيانات التاجر والعمليات

'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Vendor, Project, Service, Proposal, Invoice } from '@/types';

interface UseVendorReturn {
  vendor: Vendor | null;
  loading: boolean;
  error: string | null;
  projects: Project[];
  services: Service[];
  proposals: Proposal[];
  invoices: Invoice[];
  stats: {
    totalProjects: number;
    totalServices: number;
    totalProposals: number;
    totalInvoices: number;
    totalRevenue: number;
  } | null;
  
  // Methods
  fetchVendor: (vendorId: string) => Promise<void>;
  updateVendor: (data: Partial<Vendor>) => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchProposals: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  getStats: () => Promise<void>;
}

export function useVendor(vendorId?: string): UseVendorReturn {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<any>(null);

  // جلب بيانات التاجر
  const fetchVendor = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/vendors/${id}`);
      setVendor(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'خطأ في تحميل البيانات';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // تحديث بيانات التاجر
  const updateVendor = useCallback(async (data: Partial<Vendor>) => {
    try {
      const response = await axios.put(`/api/vendors/${vendor?.id}`, data);
      setVendor(response.data);
      toast.success('تم تحديث البيانات بنجاح');
    } catch (err: any) {
      const message = err.response?.data?.error || 'خطأ في التحديث';
      toast.error(message);
      throw err;
    }
  }, [vendor?.id]);

  // جلب المشاريع
  const fetchProjects = useCallback(async () => {
    if (!vendor?.id) return;
    try {
      const response = await axios.get(`/api/vendors/${vendor.id}/projects`);
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  }, [vendor?.id]);

  // جلب الخدمات
  const fetchServices = useCallback(async () => {
    if (!vendor?.id) return;
    try {
      const response = await axios.get(`/api/vendors/${vendor.id}/services`);
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  }, [vendor?.id]);

  // جلب العروض
  const fetchProposals = useCallback(async () => {
    if (!vendor?.id) return;
    try {
      const response = await axios.get(`/api/vendors/${vendor.id}/proposals`);
      setProposals(response.data);
    } catch (err) {
      console.error('Error fetching proposals:', err);
    }
  }, [vendor?.id]);

  // جلب الفواتير
  const fetchInvoices = useCallback(async () => {
    if (!vendor?.id) return;
    try {
      const response = await axios.get(`/api/vendors/${vendor.id}/invoices`);
      setInvoices(response.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  }, [vendor?.id]);

  // جلب الإحصائيات
  const getStats = useCallback(async () => {
    if (!vendor?.id) return;
    try {
      const response = await axios.get(`/api/vendors/${vendor.id}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [vendor?.id]);

  // جلب البيانات عند التحميل
  useEffect(() => {
    if (vendorId) {
      fetchVendor(vendorId);
    }
  }, [vendorId, fetchVendor]);

  return {
    vendor,
    loading,
    error,
    projects,
    services,
    proposals,
    invoices,
    stats,
    fetchVendor,
    updateVendor,
    fetchProjects,
    fetchServices,
    fetchProposals,
    fetchInvoices,
    getStats,
  };
}

// ==================== useAuth Hook ====================

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب بيانات المستخدم الحالي
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (err) {
      toast.error('خطأ في تسجيل الخروج');
    }
  }, []);

  return { user, loading, logout };
}

// ==================== useFavorites Hook ====================

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/favorites');
      setFavorites(response.data.map((fav: any) => fav.serviceId));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (serviceId: string) => {
    try {
      await axios.post('/api/favorites', { serviceId });
      setFavorites((prev) => [...prev, serviceId]);
      toast.success('تمت الإضافة إلى المفضلة');
    } catch (err) {
      toast.error('خطأ في الإضافة');
    }
  }, []);

  const removeFavorite = useCallback(async (serviceId: string) => {
    try {
      await axios.delete(`/api/favorites/${serviceId}`);
      setFavorites((prev) => prev.filter((id) => id !== serviceId));
      toast.success('تم الحذف من المفضلة');
    } catch (err) {
      toast.error('خطأ في الحذف');
    }
  }, []);

  const isFavorite = (serviceId: string) => favorites.includes(serviceId);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
