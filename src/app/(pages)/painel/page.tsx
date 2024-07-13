'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';
import PagePainel from '@/components/pages/painel/PagePainel';

interface User {
  _id: string;
  USER_NAME: string;
  USER_EMAIL: string;
}

interface Compra {
  _id: string;
  CART_USER_ID: string;
  CART_PRODUCT: {
    PRODUCT_ID: string;
    PRODUCT_QUANTITY: number;
    _id: string;
  }[];
  CART_PRICE: number;
  CART_STATUS: 'active' | 'completed' | 'canceled';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Stats {
  activeCount: number;
  completedCount: number;
  canceledCount: number;
  totalCompletedValue: number;
  totalActiveValue: number;
  totalTransactions: number;
}

export default function PainelPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeCount: 0,
    completedCount: 0,
    canceledCount: 0,
    totalCompletedValue: 0,
    totalActiveValue: 0,
    totalTransactions: 0,
  });
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData: User = await response.json();
        localStorage.setItem('userId', userData._id);
        setUser(userData);
      } catch (error) {
        console.error('Fetch user error:', error);
        router.push('/');
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) throw new Error('User ID or token not found');

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 404) {
          setCompras([]);
          setFetchLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch compras');
        }

        const data: Compra[] = await response.json();

        const activeCount = data.filter(compra => compra.CART_STATUS === 'active').length;
        const completedCount = data.filter(compra => compra.CART_STATUS === 'completed').length;
        const canceledCount = data.filter(compra => compra.CART_STATUS === 'canceled').length;
        const totalCompletedValue = data
          .filter(compra => compra.CART_STATUS === 'completed')
          .reduce((sum, compra) => sum + compra.CART_PRICE, 0);
        const totalActiveValue = data
          .filter(compra => compra.CART_STATUS === 'active')
          .reduce((sum, compra) => sum + compra.CART_PRICE, 0);
        const totalTransactions = data.length;

        setStats({
          activeCount,
          completedCount,
          canceledCount,
          totalCompletedValue,
          totalActiveValue,
          totalTransactions
        });

        const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latestCompras = sortedData.slice(0, 5);

        setCompras(latestCompras);
        setFetchLoading(false);
      } catch (error: any) {
        console.error('Fetch compras error:', error);
        setFetchError(error.message);
        setFetchLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchCompras();
    }
  }, [isAuthenticated, user]);

  if (isLoading || fetchLoading) {
    return <Loading />;
  }

  if (fetchError) {
    return <div>Error: {fetchError}</div>;
  }

  return <PagePainel compras={compras} stats={stats} />;
}