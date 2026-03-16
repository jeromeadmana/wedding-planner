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
    `SELECT wp.* FROM wp_wedding_pages wp
     JOIN wp_events e ON wp.event_id = e.id
     WHERE wp.event_id = $1 AND e.user_id = $2`,
    [eventId, session.user.id]
  )

  return NextResponse.json(rows[0] ?? null)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId } = body

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
    `INSERT INTO wp_wedding_pages (event_id) VALUES ($1)
     ON CONFLICT (event_id) DO NOTHING
     RETURNING *`,
    [eventId]
  )

  if (rows.length > 0) {
    return NextResponse.json(rows[0], { status: 201 })
  }

  // Already exists — return existing
  const { rows: existing } = await query(
    `SELECT * FROM wp_wedding_pages WHERE event_id = $1`,
    [eventId]
  )

  return NextResponse.json(existing[0])
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, ...fields } = body

  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 })
  }

  const allowedFields = [
    "theme",
    "hero_photo_url",
    "our_story_text",
    "events_json",
    "gallery_urls",
    "registry_link",
    "is_live",
  ]

  const setClauses: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  for (const field of allowedFields) {
    if (field in fields) {
      setClauses.push(`${field} = $${paramIndex}`)
      values.push(fields[field])
      paramIndex++
    }
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  // Always update timestamp
  setClauses.push(`updated_at = NOW()`)

  const eventIdParam = paramIndex
  const userIdParam = paramIndex + 1
  values.push(eventId, session.user.id)

  const { rows } = await query(
    `UPDATE wp_wedding_pages
     SET ${setClauses.join(", ")}
     WHERE event_id = $${eventIdParam}
       AND event_id IN (SELECT id FROM wp_events WHERE user_id = $${userIdParam})
     RETURNING *`,
    values
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}
