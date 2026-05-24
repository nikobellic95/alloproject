import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.reservation.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Create warehouses
  const warehouses = await Promise.all([
    prisma.warehouse.create({ data: { name: 'New York Warehouse' } }),
    prisma.warehouse.create({ data: { name: 'Los Angeles Warehouse' } }),
    prisma.warehouse.create({ data: { name: 'Chicago Warehouse' } })
  ]);

  // Create 12 products with images
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Vitamin C Supplement',
        sku: 'VIT-C-001',
        description: '1000mg Vitamin C with bioflavonoids for immune support',
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Omega-3 Fish Oil',
        sku: 'OMEGA-3-001',
        description: 'Triple strength EPA/DHA for heart health',
        imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Vitamin D3 + K2',
        sku: 'VIT-D3K2-001',
        description: '5000IU D3 with MK-7 K2 for bone health',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Magnesium Glycinate',
        sku: 'MAG-GLY-001',
        description: 'High absorption magnesium for sleep and relaxation',
        imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Zinc Picolinate',
        sku: 'ZINC-PIC-001',
        description: '30mg elemental zinc for immune function',
        imageUrl: 'https://images.unsplash.com/photo-1576671481703-0d69748c3180?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Collagen Peptides',
        sku: 'COLL-PEP-001',
        description: 'Bovine collagen for skin, hair, and joints',
        imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Probiotic 50 Billion CFU',
        sku: 'PRO-BIO-001',
        description: '30 strains with prebiotics for gut health',
        imageUrl: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Turmeric Curcumin',
        sku: 'TUR-CUR-001',
        description: '95% curcuminoids with BioPerine for absorption',
        imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Ashwagandha Extract',
        sku: 'ASH-EXT-001',
        description: 'KSM-66 ashwagandha for stress management',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Melatonin 10mg',
        sku: 'MEL-10MG-001',
        description: 'Time-release melatonin for healthy sleep cycles',
        imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'B-Complex Vitamins',
        sku: 'B-COMP-001',
        description: 'Full spectrum B-vitamins for energy production',
        imageUrl: 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=800&q=80'
      }
    }),
    prisma.product.create({
      data: {
        name: 'CoQ10 200mg',
        sku: 'COQ10-200-001',
        description: 'Ubiquinone CoQ10 for heart and cellular energy',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
      }
    })
  ]);

  // Add stock for each product in all warehouses
  for (const product of products) {
    for (const warehouse of warehouses) {
      await prisma.stock.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          total: Math.floor(Math.random() * 80) + 20,
          reserved: 0
        }
      });
    }
  }

  console.log('Seeding completed! Added 12 products and 3 warehouses!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
