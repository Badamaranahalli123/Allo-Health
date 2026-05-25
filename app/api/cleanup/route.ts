import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const expiredReservations =
      await prisma.reservation.findMany({
        where: {
          status: 'pending',
          expiresAt: {
            lt: new Date(),
          },
        },
      })

    for (const reservation of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        await tx.stock.update({
          where: {
            productId_warehouseId: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
          },
          data: {
            reserved: {
              decrement: reservation.quantity,
            },
          },
        })

        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: 'released',
          },
        })
      })
    }

    return NextResponse.json({
      cleaned: expiredReservations.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
