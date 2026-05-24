'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Warehouse, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  imageUrl: string;
  stock: {
    id: string;
    productId: string;
    warehouseId: string;
    total: number;
    reserved: number;
    warehouse: {
      id: string;
      name: string;
    };
  }[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (productId: string, warehouseId: string) => {
    setError(null);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, warehouseId, quantity: 1 })
      });

      if (res.status === 409) {
        const data = await res.json();
        setError(data.error || 'Not enough stock available');
        await fetchProducts();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to reserve');
      }

      const reservation = await res.json();
      router.push(`/reservations/${reservation.id}`);
    } catch (err) {
      console.error('Error reserving:', err);
      setError('An error occurred while reserving');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-3">
          Inventory Reservation System
        </h1>
        <p className="text-gray-400 text-lg">Reserve products before checkout to secure your stock</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 glass-card">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden glass-card">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2 bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map((j) => (
                  <div key={j} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <Skeleton className="h-5 w-1/3 mb-2 bg-white/10" />
                    <Skeleton className="h-4 w-2/3 bg-white/10" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden glass-card hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.01]">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <CardTitle className="text-2xl font-bold text-white mb-2">{product.name}</CardTitle>
                  {product.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-2">{product.description}</p>
                  )}
                  <p className="font-mono text-sm text-gray-400">
                    SKU: {product.sku}
                  </p>
                </div>
              </div>
              <CardContent className="pt-6 px-6 pb-6">
                <div className="space-y-4">
                  {product.stock.map((stock) => {
                    const available = stock.total - stock.reserved;
                    const isLowStock = available <= 10;
                    const isOutOfStock = available <= 0;

                    return (
                      <div key={stock.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                              <Warehouse className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="font-semibold text-gray-200">{stock.warehouse.name}</span>
                          </div>
                          <Badge 
                            className={isOutOfStock 
                              ? 'bg-red-500/20 text-red-400 border-red-500/30 px-3 py-1' 
                              : isLowStock 
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1' 
                                : 'bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1'}
                          >
                            {isOutOfStock ? 'Out of Stock' : `${available} Available`}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            Total: {stock.total} | Reserved: {stock.reserved}
                          </div>
                          <Button
                            onClick={() => handleReserve(product.id, stock.warehouse.id)}
                            disabled={isOutOfStock}
                            className={isOutOfStock 
                              ? 'bg-gray-700 hover:bg-gray-700' 
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'}
                          >
                            {isOutOfStock ? 'Unavailable' : 'Reserve'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
