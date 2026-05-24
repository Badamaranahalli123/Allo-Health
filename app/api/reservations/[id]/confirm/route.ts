import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reservationId = params.id

    console.log('🔵 Confirm request for:', reservationId)

    await prisma.$transaction(async (tx) => {
      // Get reservation
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      })

      console.log('📊 Reservation found:', reservation)

      if (!reservation) {
        throw new Error('Reservation not found')
      }

      if (reservation.status !== 'pending') {
        throw new Error('Reservation already processed')
      }

      if (new Date() > new Date(reservation.expiresAt)) {
        throw new Error('Reservation expired')
      }

      // ✅ Confirm purchase:
      // total decreases because item is sold
      // reserved decreases because hold is removed
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          total: {
            decrement: reservation.quantity,
          },
          reserved: {
            decrement: reservation.quantity,
          },
        },
      })

      // Update reservation status
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'confirmed' },
      })

      console.log('✅ Confirm successful')
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Confirm error:', error)

    let statusCode = 500

    if (error.message === 'Reservation not found') {
      statusCode = 404
    } else if (
      error.message === 'Reservation already processed'
    ) {
      statusCode = 400
    } else if (error.message === 'Reservation expired') {
      statusCode = 410
    }

    return NextResponse.json(
      { error: error.message },
      { status: statusCode }
    )
  }
}
