import { prisma } from '@/lib/prisma';
import { cleanupExpiredReservations } from '@/lib/cleanup';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
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
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: (error as Error).message },
      { status: 500 }
    );
  }
}
