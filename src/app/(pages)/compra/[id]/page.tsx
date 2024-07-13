'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';
import PageCompraId from '@/components/pages/compras/compraId/PageCompraId';

interface Product {
  _id: string;
  PRODUCT_CATEGORY: string;
  PRODUCT_DELETED: boolean;
  PRODUCT_NAME: string;
  PRODUCT_PRICE: number;
  PRODUCT_QUANTITY: number;
  PRODUCT_ID?: string;
}

interface Compra {
  _id: string;
  CART_PRICE: number;
  CART_PRODUCT: Array<{
    PRODUCT_ID: string;
    PRODUCT_QUANTITY: number;
  }>;
  CART_STATUS: string;
  CART_USER_ID: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Category {
  _id: string;
  CATEGORY_DELETED: boolean;
  CATEGORY_NAME: string;
}

interface CompraIdPageProps {
  params: {
    id: string
  }
}

export default function CompraDetalhes({ params }: CompraIdPageProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [compra, setCompra] = useState<Compra | null>(null);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const compraId = params.id;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthToken(token);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authToken) {
      const fetchCompraDetails = async () => {
        try {
          const [compraResponse, productsResponse, categoriesResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/${compraId}`, {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            }),
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product`, {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            }),
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category`, {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            })
          ]);

          const compraData: Compra = await compraResponse.json();
          const productsData: Product[] = await productsResponse.json();
          const categoriesData: Category[] = await categoriesResponse.json();

          const categoryMap: { [key: string]: string } = categoriesData.reduce<{ [key: string]: string }>((acc, category) => {
            acc[category._id] = category.CATEGORY_NAME;
            return acc;
          }, {});

          const productsWithCategoryNames = productsData.map(product => ({
            ...product,
            PRODUCT_CATEGORY: categoryMap[product.PRODUCT_CATEGORY] || product.PRODUCT_CATEGORY
          }));

          const compraProdutosDetalhes = compraData.CART_PRODUCT.map(item => {
            const produtoDetalhes = productsWithCategoryNames.find(prod => prod._id === item.PRODUCT_ID);
            return {
              ...item,
              ...produtoDetalhes,
              PRODUCT_QUANTITY: item.PRODUCT_QUANTITY,
              PRODUCT_ID: item.PRODUCT_ID
            } as Product;
          });

          setCompra(compraData);
          setProdutos(compraProdutosDetalhes);
          setCategories(categoriesData);
        } catch (error) {
          console.error('Failed to fetch compra details:', error);
        }
      };

      fetchCompraDetails();
    }
  }, [authToken, compraId]);

  if (isLoading) {
    return <Loading />;
  }

  return compra ? <PageCompraId compra={compra} produtos={produtos} /> : <Loading />;
}
