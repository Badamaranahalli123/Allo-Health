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

      const stock = await tx.stock.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      })

      // ✅ ONLY set reserved to 0, total stays the same
      await tx.stock.update({
        where: { id: stock.id },
        data: {
          reserved: 0,  // ← Set reserved to 0 directly
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
    if (error.message === 'Expired') {
      return NextResponse.json({ error: 'Reservation expired' }, { status: 410 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
