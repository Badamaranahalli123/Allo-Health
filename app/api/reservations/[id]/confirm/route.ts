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

    const result = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      })

      if (!reservation) {
        throw new Error('Reservation not found')
      }

      if (reservation.status !== 'pending') {
        throw new Error('Reservation already processed')
      }

      if (new Date() > new Date(reservation.expiresAt)) {
        throw new Error('Expired')
      }

      // ✅ CORRECT: When confirming:
      // 1. Decrease total (permanent deduction)
      // 2. Decrease reserved (remove hold)
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          total: { decrement: reservation.quantity },     // ← Permanent deduction
          reserved: { decrement: reservation.quantity },  // ← Release the hold
        },
      })

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'confirmed' },
      })

      return { success: true }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Confirm error:', error)
    if (error.message === 'Expired') {
      return NextResponse.json({ error: 'Reservation expired' }, { status: 410 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
