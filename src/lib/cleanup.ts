import { prisma } from './prisma';

export async function cleanupExpiredReservations() {
  const now = new Date();

  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: now }
    }
  });

  for (const reservation of expiredReservations) {
    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: 'RELEASED' }
      });

      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId
          }
        },
        data: {
          reserved: { decrement: reservation.quantity }
        }
      });
    });
  }
}
