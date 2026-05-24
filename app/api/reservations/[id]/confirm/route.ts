import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const reservationId = params.id

  console.log('🔵 Confirm request for reservation:', reservationId)

  try {
    // First, get the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    console.log('🔵 Found reservation:', reservation)

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (reservation.status !== 'pending') {
      return NextResponse.json({ error: 'Reservation already processed' }, { status: 400 })
    }

    if (new Date() > new Date(reservation.expiresAt)) {
      return NextResponse.json({ error: 'Reservation expired' }, { status: 410 })
    }

    // Update stock and reservation in transaction
    await prisma.$transaction(async (tx) => {
      // Update stock: decrease total and reserved
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          total: { decrement: reservation.quantity },
          reserved: { decrement: reservation.quantity },
        },
      })

      // Update reservation status
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'confirmed' },
      })
    })

    console.log('✅ Confirm successful for reservation:', reservationId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Confirm error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
