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
      // - Decrease total (permanent deduction)
      // - Decrease reserved (remove the hold)
      const stock = await tx.stock.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      })

      console.log('📊 Stock before confirm:', { total: stock.total, reserved: stock.reserved })

      await tx.stock.update({
        where: { id: stock.id },
        data: {
          total: { decrement: reservation.quantity },
          reserved: { decrement: reservation.quantity },
        },
      })

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'confirmed' },
      })

      const updatedStock = await tx.stock.findFirst({
        where: { id: stock.id },
      })
      console.log('📊 Stock after confirm:', { total: updatedStock.total, reserved: updatedStock.reserved })

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
