import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { productId, warehouseId, quantity } = body

  if (!productId || !warehouseId || !quantity) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the stock with FOR UPDATE lock
      const stock = await tx.stock.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } },
      })

      if (!stock) {
        throw new Error('Stock not found')
      }

      // 2. Calculate available
      const available = stock.total - stock.reserved
      console.log('Stock before:', { total: stock.total, reserved: stock.reserved, available })

      if (available < quantity) {
        throw new Error('Not enough stock')
      }

      // 3. Create reservation
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

      // 4. INCREASE reserved count
      const updatedStock = await tx.stock.update({
        where: { id: stock.id },
        data: { reserved: { increment: quantity } },
      })

      console.log('Stock after:', { total: updatedStock.total, reserved: updatedStock.reserved })

      return reservation
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Reservation error:', error)
    if (error.message === 'Not enough stock') {
      return NextResponse.json({ error: 'Stock unavailable' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
