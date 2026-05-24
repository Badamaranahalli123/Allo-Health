import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ✅ GET endpoint for Orders page
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

// ✅ POST endpoint for creating reservations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, warehouseId, quantity } = body

    console.log('🔵 Reserve:', { productId, warehouseId, quantity })

    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const stock = await prisma.stock.findFirst({
      where: { productId, warehouseId },
    })

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    }

    const available = stock.total - stock.reserved
    console.log('Stock before:', { total: stock.total, reserved: stock.reserved, available })

    if (available < quantity) {
      return NextResponse.json({ error: 'Not enough stock' }, { status: 409 })
    }

    const reservation = await prisma.$transaction(async (tx) => {
      // Create reservation
      const newReservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          status: 'pending',
        },
      })

      // Update reserved stock
      await tx.stock.update({
        where: { id: stock.id },
        data: { reserved: { increment: quantity } },
      })

      return newReservation
    })

    console.log('✅ Reservation created:', reservation.id)
    return NextResponse.json(reservation, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
