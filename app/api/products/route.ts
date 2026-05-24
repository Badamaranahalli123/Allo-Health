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
        totalStock: stock.total,
        reservedStock: stock.reserved,
        availableStock: available,
      })
    })

    return NextResponse.json(Array.from(productsMap.values()))
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json([], { status: 200 })
  }
}
