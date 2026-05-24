import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create warehouses
  const mumbaiWarehouse = await prisma.warehouse.upsert({
    where: { id: 'wh_mumbai' },
    update: {},
    create: {
      id: 'wh_mumbai',
      name: 'Mumbai Medical Hub',
      location: 'Mumbai, India',
    },
  })

  const delhiWarehouse = await prisma.warehouse.upsert({
    where: { id: 'wh_delhi' },
    update: {},
    create: {
      id: 'wh_delhi',
      name: 'Delhi Healthcare Center',
      location: 'Delhi, India',
    },
  })

  // Create MEDICAL products (not headphones)
  const bpMonitor = await prisma.product.upsert({
    where: { sku: 'MED-BP-001' },
    update: {},
    create: {
      id: 'p1',
      name: 'Digital Blood Pressure Monitor',
      sku: 'MED-BP-001',
    },
  })

  const oximeter = await prisma.product.upsert({
    where: { sku: 'MED-OX-002' },
    update: {},
    create: {
      id: 'p2',
      name: 'Pulse Oximeter',
      sku: 'MED-OX-002',
    },
  })

  // Create stock
  await prisma.stock.upsert({
    where: {
      productId_warehouseId: {
        productId: bpMonitor.id,
        warehouseId: mumbaiWarehouse.id,
      },
    },
    update: {},
    create: {
      id: 's1',
      productId: bpMonitor.id,
      warehouseId: mumbaiWarehouse.id,
      total: 10,
      reserved: 0,
    },
  })

  await prisma.stock.upsert({
    where: {
      productId_warehouseId: {
        productId: bpMonitor.id,
        warehouseId: delhiWarehouse.id,
      },
    },
    update: {},
    create: {
      id: 's2',
      productId: bpMonitor.id,
      warehouseId: delhiWarehouse.id,
      total: 7,
      reserved: 0,
    },
  })

  await prisma.stock.upsert({
    where: {
      productId_warehouseId: {
        productId: oximeter.id,
        warehouseId: mumbaiWarehouse.id,
      },
    },
    update: {},
    create: {
      id: 's3',
      productId: oximeter.id,
      warehouseId: mumbaiWarehouse.id,
      total: 25,
      reserved: 0,
    },
  })

  await prisma.stock.upsert({
    where: {
      productId_warehouseId: {
        productId: oximeter.id,
        warehouseId: delhiWarehouse.id,
      },
    },
    update: {},
    create: {
      id: 's4',
      productId: oximeter.id,
      warehouseId: delhiWarehouse.id,
      total: 18,
      reserved: 0,
    },
  })

  console.log('✅ Seeded: Medical products with stock')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
