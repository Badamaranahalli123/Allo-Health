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

    // Get reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    console.log('📊 Reservation found:', reservation)

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    if (reservation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Reservation already processed' },
        { status: 400 }
      )
    }

    if (new Date() > new Date(reservation.expiresAt)) {
      return NextResponse.json(
        { error: 'Reservation expired' },
        { status: 410 }
      )
    }

    // Increment reserved stock
    await prisma.$executeRaw`
      UPDATE "Stock"
      SET reserved = reserved + ${reservation.quantity}
      WHERE "productId" = ${reservation.productId}
      AND "warehouseId" = ${reservation.warehouseId}
    `

    // Update reservation status
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'confirmed' },
    })

    console.log('✅ Confirm successful')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Confirm error:', error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
