'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Warehouse, Clock, CheckCircle2, XCircle, AlertTriangle, ShoppingCart } from 'lucide-react';

interface Reservation {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: 'PENDING' | 'CONFIRMED' | 'RELEASED';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
}

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchReservation();
    }
  }, [params.id]);

  useEffect(() => {
    if (!reservation || reservation.status !== 'PENDING') return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(reservation.expiresAt);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Expired');
        clearInterval(interval);
        fetchReservation();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/reservations/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch reservation');
      
      const data = await res.json();
      setReservation(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${params.id}/confirm`, {
        method: 'POST'
      });

      if (res.status === 410) {
        const data = await res.json();
        setError(data.error || 'Reservation has expired');
        await fetchReservation();
        return;
      }

      if (!res.ok) throw new Error('Failed to confirm');

      await fetchReservation();
    } catch (err) {
      console.error(err);
      setError('An error occurred while confirming');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reservations/${params.id}/release`, {
        method: 'POST'
      });

      if (!res.ok) throw new Error('Failed to cancel');

      await fetchReservation();
    } catch (err) {
      console.error(err);
      setError('An error occurred while cancelling');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Confirmed</Badge>;
      case 'RELEASED':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" onClick={() => router.push('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to products
        </Button>
        <Card className="glass-card">
          <CardHeader>
            <Skeleton className="h-7 w-1/2 mb-2 bg-white/10" />
            <Skeleton className="h-4 w-1/3 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between py-3">
                <Skeleton className="h-5 w-1/4 bg-white/10" />
                <Skeleton className="h-5 w-1/3 bg-white/10" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Reservation Not Found</h2>
              <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
                Back to Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white" onClick={() => router.push('/')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to products
      </Button>

      <Card className="overflow-hidden glass-card">
        <CardHeader className={`border-b border-white/10 ${
          reservation.status === 'CONFIRMED' ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' :
          reservation.status === 'RELEASED' ? 'bg-gradient-to-r from-red-500/10 to-rose-500/10' :
          'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2 text-white">
                {reservation.status === 'PENDING' && <ShoppingCart className="h-6 w-6 text-purple-400" />}
                {reservation.status === 'CONFIRMED' && <CheckCircle2 className="h-6 w-6 text-green-400" />}
                {reservation.status === 'RELEASED' && <XCircle className="h-6 w-6 text-red-400" />}
                Reservation Details
              </CardTitle>
              <CardDescription className="mt-2 font-mono text-sm text-gray-400">
                ID: {reservation.id.slice(0, 8)}...
              </CardDescription>
            </div>
            {getStatusBadge(reservation.status)}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6 glass-card border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-200">Error</AlertTitle>
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Package className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-gray-300">Product</span>
              </div>
              <div className="ml-8">
                <p className="text-lg font-semibold text-white">{reservation.product.name}</p>
                <p className="text-sm text-gray-400 font-mono">SKU: {reservation.product.sku}</p>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Warehouse className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-gray-300">Warehouse</span>
              </div>
              <p className="ml-8 text-lg font-semibold text-white">{reservation.warehouse.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-sm text-gray-400 mb-1">Quantity</p>
                <p className="text-2xl font-bold text-white">{reservation.quantity}</p>
              </div>
              {reservation.status === 'PENDING' && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <p className="text-sm text-gray-400">Time Left</p>
                  </div>
                  <p className={`text-2xl font-bold ${countdown === 'Expired' ? 'text-red-400' : 'text-white'}`}>
                    {countdown}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-white/10 bg-white/5 px-6 py-4">
          {reservation.status === 'PENDING' ? (
            <div className="w-full grid grid-cols-2 gap-4">
              <Button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {actionLoading ? 'Confirming...' : 'Confirm Purchase'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={actionLoading}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {actionLoading ? 'Cancelling...' : 'Cancel'}
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
