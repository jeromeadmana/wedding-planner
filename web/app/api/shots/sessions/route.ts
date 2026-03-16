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
    `SELECT s.*, COUNT(p.id)::int AS photo_count
     FROM wp_photo_sessions s
     LEFT JOIN wp_photos p ON p.session_id = s.id
     JOIN wp_events e ON s.event_id = e.id
     WHERE e.user_id = $1 AND s.event_id = $2
     GROUP BY s.id
     ORDER BY s.created_at DESC`,
    [session.user.id, eventId]
  )

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, session_name } = body

  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const { rows } = await query(
    `INSERT INTO wp_photo_sessions (event_id, session_name)
     VALUES ($1, $2)
     RETURNING *`,
    [eventId, session_name?.trim() || "Wedding Day"]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
