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
    `SELECT c.id, c.event_id, c.title, c.category, c.due_date, c.is_done, c.is_pinned, c.notes, c.created_at
     FROM wp_checklist_items c
     JOIN wp_events e ON c.event_id = e.id
     WHERE c.event_id = $1 AND e.user_id = $2
     ORDER BY c.is_pinned DESC, c.due_date ASC NULLS LAST, c.created_at`,
    [eventId, session.user.id]
  )

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, title, category, due_date, notes } = body

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
    `INSERT INTO wp_checklist_items (event_id, title, category, due_date, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [eventId, title.trim(), category ?? null, due_date ?? null, notes ?? null]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
