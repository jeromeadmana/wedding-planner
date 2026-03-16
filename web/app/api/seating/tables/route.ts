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
    `SELECT t.*,
      COALESCE(json_agg(json_build_object('id', sa.id, 'guest_id', g.id, 'guest_name', g.name))
      FILTER (WHERE sa.id IS NOT NULL), '[]') as guests
     FROM wp_tables t
     LEFT JOIN wp_seat_assignments sa ON sa.table_id = t.id
     LEFT JOIN wp_guests g ON g.id = sa.guest_id
     JOIN wp_events e ON t.event_id = e.id
     WHERE e.user_id = $1 AND t.event_id = $2
     GROUP BY t.id ORDER BY t.name`,
    [session.user.id, eventId]
  )

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, name, capacity, notes } = body

  if (!eventId || !name?.trim()) {
    return NextResponse.json({ error: "eventId and name are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const { rows } = await query(
    `INSERT INTO wp_tables (event_id, name, capacity, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [eventId, name.trim(), capacity ?? 8, notes ?? null]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
