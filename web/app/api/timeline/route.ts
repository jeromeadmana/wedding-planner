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
    `SELECT t.*
     FROM wp_timeline_events t
     JOIN wp_events e ON t.event_id = e.id
     WHERE t.event_id = $1 AND e.user_id = $2
     ORDER BY t.order_index, t.time`,
    [eventId, session.user.id]
  )

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, time, title, location, assignee, notes } = body

  if (!eventId || !title?.trim()) {
    return NextResponse.json({ error: "eventId and title are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const { rows } = await query(
    `INSERT INTO wp_timeline_events (event_id, time, title, location, assignee, notes, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE((SELECT MAX(order_index) FROM wp_timeline_events WHERE event_id = $1), 0) + 1)
     RETURNING *`,
    [
      eventId,
      time ?? null,
      title.trim(),
      location ?? null,
      assignee ?? null,
      notes ?? null,
    ]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
