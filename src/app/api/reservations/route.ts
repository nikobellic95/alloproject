import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createReservationSchema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  quantity: z.number().int().positive()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, warehouseId, quantity } = createReservationSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        }
      });

      if (!stock) {
        throw new Error('Stock not found');
      }

      const available = stock.total - stock.reserved;
      if (available < quantity) {
        throw new Error('Not enough stock');
      }

      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        },
        data: {
          reserved: {
            increment: quantity
          }
        }
      });

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
          status: 'PENDING'
        },
        include: {
          product: true,
          warehouse: true
        }
      });

      return reservation;
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Not enough stock') {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 409 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
