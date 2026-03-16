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
    `SELECT g.id, g.event_id, g.name, g.email, g.phone, g.group_tag, g.meal_pref,
            g.plus_one, g.notes, g.invited_at,
            r.status AS rsvp_status, r.meal_choice, r.message AS rsvp_message, r.responded_at
     FROM wp_guests g
     LEFT JOIN wp_rsvps r ON r.guest_id = g.id
     JOIN wp_events e ON g.event_id = e.id
     WHERE g.event_id = $1 AND e.user_id = $2
     ORDER BY g.invited_at DESC`,
    [eventId, session.user.id]
  )

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, name, email, phone, group_tag, meal_pref, plus_one, notes } = body

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
    `INSERT INTO wp_guests (event_id, name, email, phone, group_tag, meal_pref, plus_one, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [eventId, name.trim(), email ?? null, phone ?? null, group_tag ?? null, meal_pref ?? null, plus_one ?? false, notes ?? null]
  )

  const guest = rows[0]

  // Create RSVP row with pending status
  const token = crypto.randomUUID()
  await query(
    `INSERT INTO wp_rsvps (guest_id, event_id, token, status)
     VALUES ($1, $2, $3, 'pending')`,
    [guest.id, eventId, token]
  )

  return NextResponse.json(guest, { status: 201 })
}
