import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    })

    const productsMap = new Map()

    stocks.forEach((stock) => {
      // ✅ Calculate available = total - reserved
      const available = stock.total - stock.reserved
      
      if (!productsMap.has(stock.productId)) {
        productsMap.set(stock.productId, {
          id: stock.product.id,
          name: stock.product.name,
          sku: stock.product.sku,
          warehouses: [],
        })
      }
      
      productsMap.get(stock.productId).warehouses.push({
        warehouseId: stock.warehouse.id,
        warehouseName: stock.warehouse.name,
        totalStock: stock.total,        // ✅ This should be the DATABASE total (never changes)
        reservedStock: stock.reserved,  // ✅ This is the reserved count
        availableStock: available,       // ✅ This is total - reserved
      })
    })

    return NextResponse.json(Array.from(productsMap.values()))
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json([], { status: 200 })
  }
}
