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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden glass-card hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <CardTitle className="text-xl text-white mb-1">{product.name}</CardTitle>
                  {product.description && (
                    <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
                  )}
                  <p className="font-mono text-xs mt-1 text-gray-400">
                    SKU: {product.sku}
                  </p>
                </div>
              </div>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {product.stock.map((stock) => {
                    const available = stock.total - stock.reserved;
                    const isLowStock = available <= 5;
                    const isOutOfStock = available <= 0;

                    return (
                      <div key={stock.id} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-200 text-sm">{stock.warehouse.name}</span>
                          </div>
                          <Badge 
                            className={isOutOfStock 
                              ? 'bg-red-500/20 text-red-400 border-red-500/30 text-xs' 
                              : isLowStock 
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs' 
                                : 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'}
                          >
                            {isOutOfStock ? 'Out of Stock' : `${available} Available`}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleReserve(product.id, stock.warehouse.id)}
                          disabled={isOutOfStock}
                          size="sm"
                          className="w-full text-sm"
                        >
                          {isOutOfStock ? 'Unavailable' : 'Reserve'}
                        </Button>
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
