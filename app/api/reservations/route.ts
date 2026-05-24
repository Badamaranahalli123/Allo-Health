import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, warehouseId, quantity } = body

    console.log('🔵 1. Received request:', { productId, warehouseId, quantity })

    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Find the stock using findFirst (more reliable)
    const stock = await prisma.stock.findFirst({
      where: {
        productId: productId,
        warehouseId: warehouseId,
      },
    })

    console.log('🔵 2. Found stock:', stock)

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
    }

    const available = stock.total - stock.reserved
    console.log('🔵 3. Available:', available, 'Requested:', quantity)

    if (available < quantity) {
      return NextResponse.json({ error: 'Not enough stock' }, { status: 409 })
    }

    // Create reservation
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    const reservation = await prisma.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        expiresAt,
        status: 'pending',
      },
    })

    console.log('🔵 4. Created reservation:', reservation.id)

    // Update reserved stock - USING DIRECT UPDATE
    const updatedStock = await prisma.$executeRaw`
      UPDATE "Stock" 
      SET reserved = reserved + ${quantity}
      WHERE id = ${stock.id}
    `

    console.log('🔵 5. Stock updated, rows affected:', updatedStock)

    // Verify the update
    const verifyStock = await prisma.stock.findFirst({
      where: { id: stock.id },
    })
    console.log('🔵 6. Verified stock:', verifyStock)

    return NextResponse.json(reservation, { status: 201 })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
