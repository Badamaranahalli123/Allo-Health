import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Fetch reservations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    const where = status ? { status: status as any } : {}
    
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(reservations)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// POST - Create reservation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, warehouseId, quantity } = body

    console.log('🔵 Reserve request:', { productId, warehouseId, quantity })

    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find the stock
      const stock = await tx.stock.findFirst({
        where: { productId, warehouseId },
      })

      if (!stock) {
        throw new Error('Stock not found')
      }

      const available = stock.total - stock.reserved
      console.log('📊 Current stock:', { id: stock.id, total: stock.total, reserved: stock.reserved, available })

      if (available < quantity) {
        throw new Error('Not enough stock')
      }

      // Create reservation
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)

      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
          status: 'pending',
        },
      })

      // ✅ CRITICAL: ONLY increase reserved. TOTAL DOES NOT CHANGE
      const updatedStock = await tx.stock.update({
        where: { id: stock.id },
        data: { 
          reserved: { increment: quantity }
        },
      })

      console.log('📊 After update:', { total: updatedStock.total, reserved: updatedStock.reserved })

      return reservation
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error:', error)
    if (error.message === 'Not enough stock') {
      return NextResponse.json({ error: 'Stock unavailable' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
