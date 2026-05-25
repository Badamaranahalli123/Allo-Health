import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { productId, warehouseId, quantity } = body

    console.log('🔵 Reserve request:', {
      productId,
      warehouseId,
      quantity,
    })

    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find stock row
      const stock = await tx.stock.findFirst({
        where: {
          productId,
          warehouseId,
        },
      })

      if (!stock) {
        throw new Error('Stock not found')
      }

      console.log('📊 Before:', {
        total: stock.total,
        reserved: stock.reserved,
        available: stock.total - stock.reserved,
      })

      // Reservation expires in 10 mins
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 10)

      // ✅ CONCURRENCY SAFE UPDATE
      // Only reserve if enough stock exists
      const updatedRows = await tx.$executeRaw`
        UPDATE "Stock"
        SET reserved = reserved + ${quantity}
        WHERE id = ${stock.id}
        AND (total - reserved) >= ${quantity}
      `

      // If no rows updated → stock unavailable
      if (updatedRows === 0) {
        throw new Error('Not enough stock')
      }

      // Create reservation AFTER successful stock hold
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
          status: 'pending',
        },
      })

      // Fetch updated stock for logging
      const updatedStock = await tx.stock.findUnique({
        where: {
          id: stock.id,
        },
      })

      console.log('📊 After:', {
        total: updatedStock?.total,
        reserved: updatedStock?.reserved,
        available:
          (updatedStock?.total || 0) -
          (updatedStock?.reserved || 0),
      })

      return reservation
    })

    return NextResponse.json(result, {
      status: 201,
    })
  } catch (error: any) {
    console.error('❌ Error:', error)

    if (error.message === 'Not enough stock') {
      return NextResponse.json(
        { error: 'Stock unavailable' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
