import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId")
  if (!eventId) return NextResponse.json({ error: "eventId is required" }, { status: 400 })

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const { rows } = await query(
    `SELECT * FROM wp_subscriptions WHERE event_id = $1`,
    [eventId]
  )

  return NextResponse.json(rows[0] ?? null)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, modules } = body

  if (!eventId || !Array.isArray(modules)) {
    return NextResponse.json({ error: "eventId and modules[] are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const { rows } = await query(
    `INSERT INTO wp_subscriptions (event_id, modules)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [eventId, modules]
  )

  if (rows.length > 0) {
    return NextResponse.json(rows[0], { status: 201 })
  }

  // Already exists — return existing
  const { rows: existing } = await query(
    `SELECT * FROM wp_subscriptions WHERE event_id = $1`,
    [eventId]
  )

  return NextResponse.json(existing[0])
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, modules } = body

  if (!eventId || !Array.isArray(modules)) {
    return NextResponse.json({ error: "eventId and modules[] are required" }, { status: 400 })
  }

  const { rows } = await query(
    `UPDATE wp_subscriptions
     SET modules = $1
     WHERE event_id = $2
       AND event_id IN (SELECT id FROM wp_events WHERE user_id = $3)
     RETURNING *`,
    [modules, eventId, session.user.id]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}
