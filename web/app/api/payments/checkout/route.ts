import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

const MODULE_PRICES: Record<string, number> = {
  guests: 149,
  budget: 99,
  vendors: 99,
  checklist: 0,
  seating: 149,
  website: 199,
  shots: 299,
  ai: 399,
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, modules } = body

  if (!eventId || !Array.isArray(modules) || modules.length === 0) {
    return NextResponse.json({ error: "eventId and modules[] are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  // Calculate total
  const total = modules.reduce((sum: number, mod: string) => {
    return sum + (MODULE_PRICES[mod] ?? 0)
  }, 0)

  // Create pending payment record
  const { rows } = await query(
    `INSERT INTO wp_payments (user_id, event_id, amount, module, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [session.user.id, eventId, total, modules.join(",")]
  )

  const payment = rows[0]

  return NextResponse.json({
    checkoutUrl: "#paymongo-coming-soon",
    paymentId: payment.id,
    message: "PayMongo integration coming soon",
  })
}
