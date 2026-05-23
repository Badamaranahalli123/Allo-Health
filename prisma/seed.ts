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
      name: 'Mumbai Distribution Center',
      location: 'Mumbai, India',
    },
  })

  const delhiWarehouse = await prisma.warehouse.upsert({
    where: { id: 'wh_delhi' },
    update: {},
    create: {
      id: 'wh_delhi',
      name: 'Delhi Logistics Hub',
      location: 'Delhi, India',
    },
  })

  // Create products
  const headphones = await prisma.product.upsert({
    where: { sku: 'ALLO-001' },
    update: {},
    create: {
      id: 'p1',
      name: 'Wireless Headphones',
      sku: 'ALLO-001',
    },
  })

  const smartwatch = await prisma.product.upsert({
    where: { sku: 'ALLO-002' },
    update: {},
    create: {
      id: 'p2',
      name: 'Smart Watch',
      sku: 'ALLO-002',
    },
  })

  // Create stock
  await prisma.stock.upsert({
    where: {
      productId_warehouseId: {
        productId: headphones.id,
        warehouseId: mumbaiWarehouse.id,
      },
    },
    update: {},
    create: {
      id: 's1',
      productId: headphones.id,
      warehouseId: mumbaiWarehouse.id,
      total: 5,
      reserved: 0,
    },
  })

  await prisma.stock.upsert({
    where: {
      productId_warehouseId: {
        productId: headphones.id,
        warehouseId: delhiWarehouse.id,
      },
    },
    update: {},
    create: {
      id: 's2',
      productId: headphones.id,
      warehouseId: delhiWarehouse.id,
      total: 3,
      reserved: 0,
    },
  })

  await prisma.stock.upsert({
    where: {
      productId_warehouseId: {
        productId: smartwatch.id,
        warehouseId: mumbaiWarehouse.id,
      },
    },
    update: {},
    create: {
      id: 's3',
      productId: smartwatch.id,
      warehouseId: mumbaiWarehouse.id,
      total: 2,
      reserved: 0,
    },
  })

  console.log('✅ Seeded: 2 products, 2 warehouses, stock configured')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
