// hooks/useVendor.ts
// Hook لإدارة بيانات التاجر والعمليات

'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Service, Vendor } from '@/types';

export interface VendorStats {
  totalProjects: number;
  totalServices: number;
  totalProposals: number;
  totalInvoices: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export function apiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) return err.response?.data?.error || fallback;
  return fallback;
}

/**
 * متجر المستخدم الحالي وإحصائياته.
 * `hasVendor` تكون false عندما لا يملك المستخدم متجرًا بعد.
 */
export function useVendor() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [topServices, setTopServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVendor, setHasVendor] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ vendor: Vendor; stats: VendorStats; topServices: Service[] }>('/api/vendors/me');
      setVendor(response.data.vendor);
      setStats(response.data.stats);
      setTopServices(response.data.topServices);
      setHasVendor(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setHasVendor(false);
      } else if (axios.isAxiosError(err) && err.response?.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      } else {
        const message = apiError(err, 'خطأ في تحميل البيانات');
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // تحديث بيانات التاجر
  const updateVendor = useCallback(
    async (data: Partial<Vendor>) => {
      if (!vendor) return;
      try {
        const response = await axios.put<Vendor>(`/api/vendors/${vendor.id}`, data);
        setVendor(response.data);
        toast.success('تم تحديث البيانات بنجاح');
      } catch (err) {
        toast.error(apiError(err, 'خطأ في التحديث'));
        throw err;
      }
    },
    [vendor],
  );

  // إنشاء متجر لمستخدم ليس لديه متجر
  const createVendor = useCallback(
    async (data: Partial<Vendor>) => {
      try {
        await axios.post('/api/vendors', data);
        toast.success('تم إنشاء متجرك');
        await refresh();
      } catch (err) {
        toast.error(apiError(err, 'خطأ في إنشاء المتجر'));
        throw err;
      }
    },
    [refresh],
  );

  return { vendor, stats, topServices, loading, hasVendor, error, refresh, updateVendor, createVendor };
}

// ==================== useAuth Hook ====================

export function useAuth() {
  const [user, setUser] = useState<{ id: string; name: string; email: string; avatar: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب بيانات المستخدم الحالي
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch {
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
    } catch {
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
      const response = await axios.get<{ serviceId: string }[]>('/api/favorites');
      setFavorites(response.data.map((fav) => fav.serviceId));
    } catch {
      // الزائر غير المسجّل ليس له مفضلة
      setFavorites([]);
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
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      toast.error(status === 401 ? 'سجّل الدخول لحفظ المفضلة' : 'خطأ في الإضافة');
    }
  }, []);

  const removeFavorite = useCallback(async (serviceId: string) => {
    try {
      await axios.delete(`/api/favorites/${serviceId}`);
      setFavorites((prev) => prev.filter((id) => id !== serviceId));
      toast.success('تم الحذف من المفضلة');
    } catch {
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
