import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== 'PENDING') {
        throw new Error('Reservation is not pending');
      }

      if (new Date() > reservation.expiresAt) {
        throw new Error('Reservation expired');
      }

      await tx.reservation.update({
        where: { id },
        data: {
          status: 'CONFIRMED'
        }
      });

      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId
          }
        },
        data: {
          total: {
            decrement: reservation.quantity
          },
          reserved: {
            decrement: reservation.quantity
          }
        }
      });

      return reservation;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Reservation expired') {
        return NextResponse.json({ error: 'Reservation has expired' }, { status: 410 });
      }
      if (error.message === 'Reservation not found') {
        return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
      }
      if (error.message === 'Reservation is not pending') {
        return NextResponse.json({ error: 'Reservation is not pending' }, { status: 400 });
      }
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
