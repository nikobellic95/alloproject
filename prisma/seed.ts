import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const warehouse1 = await prisma.warehouse.create({
    data: { name: 'New York Warehouse' }
  });

  const warehouse2 = await prisma.warehouse.create({
    data: { name: 'Los Angeles Warehouse' }
  });

  const product1 = await prisma.product.create({
    data: {
      name: 'Vitamin C Supplement',
      sku: 'VIT-C-001'
    }
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Omega-3 Fish Oil',
      sku: 'OMEGA-3-001'
    }
  });

  await prisma.stock.create({
    data: {
      productId: product1.id,
      warehouseId: warehouse1.id,
      total: 50,
      reserved: 0
    }
  });

  await prisma.stock.create({
    data: {
      productId: product1.id,
      warehouseId: warehouse2.id,
      total: 30,
      reserved: 0
    }
  });

  await prisma.stock.create({
    data: {
      productId: product2.id,
      warehouseId: warehouse1.id,
      total: 25,
      reserved: 0
    }
  });

  await prisma.stock.create({
    data: {
      productId: product2.id,
      warehouseId: warehouse2.id,
      total: 40,
      reserved: 0
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
