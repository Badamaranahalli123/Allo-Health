import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { productId, warehouseId, quantity } = body

  console.log('🔵 Reserve request:', { productId, warehouseId, quantity })

  if (!productId || !warehouseId || !quantity) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    // Find the stock - using findFirst to be safe
    const stock = await prisma.stock.findFirst({
      where: {
        productId: productId,
        warehouseId: warehouseId,
      },
    })

    console.log('📊 Found stock:', stock)

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    }

    const available = stock.total - stock.reserved
    console.log('📊 Available:', available, 'Requested:', quantity)

    if (available < quantity) {
      return NextResponse.json({ error: 'Not enough stock' }, { status: 409 })
    }

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Use transaction to update both reservation and stock
    const reservation = await prisma.$transaction(async (tx) => {
      // Create reservation
      const newReservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
          status: 'pending',
        },
      })

      // Update reserved stock
      const updatedStock = await tx.stock.update({
        where: { id: stock.id },
        data: { reserved: { increment: quantity } },
      })

      console.log('📊 Updated stock:', updatedStock)

      return newReservation
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
