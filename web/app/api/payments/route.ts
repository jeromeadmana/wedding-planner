import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId")
  if (!eventId) return NextResponse.json({ error: "eventId is required" }, { status: 400 })

  // Ownership check via JOIN
  const { rows } = await query(
    `SELECT p.*
     FROM wp_payments p
     JOIN wp_events e ON p.event_id = e.id
     WHERE p.event_id = $1 AND e.user_id = $2
     ORDER BY p.created_at DESC`,
    [eventId, session.user.id]
  )

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, module, amount } = body

  if (!eventId || !module || amount == null) {
    return NextResponse.json({ error: "eventId, module, and amount are required" }, { status: 400 })
  }

  const { rows } = await query(
    `INSERT INTO wp_payments (user_id, event_id, amount, module)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [session.user.id, eventId, amount, module]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
