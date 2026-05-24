export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, warehouseId, quantity } = body

    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findFirst({
        where: { productId, warehouseId },
      })

      if (!stock) {
        throw new Error('Stock not found')
      }

      const available = stock.total - stock.reserved
      if (available < quantity) {
        throw new Error('Not enough stock')
      }

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

      // ✅ THIS INCREMENTS RESERVED BY 1
      await tx.stock.update({
        where: { id: stock.id },
        data: { 
          reserved: { increment: quantity }
        },
      })

      return reservation
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Not enough stock') {
      return NextResponse.json({ error: 'Stock unavailable' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
