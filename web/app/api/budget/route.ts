import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId")
  if (!eventId) return NextResponse.json({ error: "eventId is required" }, { status: 400 })

  const { rows } = await query(
    `SELECT b.id, b.event_id, b.vendor_id, b.category, b.description,
            b.estimated_cost, b.actual_cost, b.paid, b.notes, b.created_at,
            v.business_name AS vendor_name
     FROM wp_budget_items b
     LEFT JOIN wp_vendors v ON b.vendor_id = v.id
     JOIN wp_events e ON b.event_id = e.id
     WHERE b.event_id = $1 AND e.user_id = $2
     ORDER BY b.created_at DESC`,
    [eventId, session.user.id]
  )

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, category, description, estimated_cost, actual_cost, vendor_id, paid, notes } = body

  if (!eventId || !category?.trim()) {
    return NextResponse.json({ error: "eventId and category are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const { rows } = await query(
    `INSERT INTO wp_budget_items (event_id, category, description, estimated_cost, actual_cost, vendor_id, paid, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [eventId, category.trim(), description ?? null, estimated_cost ?? 0, actual_cost ?? 0, vendor_id ?? null, paid ?? false, notes ?? null]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
