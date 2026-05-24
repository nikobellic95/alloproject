import { prisma } from '@/lib/prisma';
import { cleanupExpiredReservations } from '@/lib/cleanup';
import { NextResponse } from 'next/server';

export async function GET() {
  await cleanupExpiredReservations();
  
  const products = await prisma.product.findMany({
    include: {
      stock: {
        include: {
          warehouse: true
        }
      }
    }
  });

  return NextResponse.json(products);
}
