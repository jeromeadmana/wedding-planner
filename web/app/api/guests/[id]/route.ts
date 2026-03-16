import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, email, phone, group_tag, meal_pref, plus_one, notes } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { rows } = await query(
    `UPDATE wp_guests g
     SET name = $1, email = $2, phone = $3, group_tag = $4, meal_pref = $5, plus_one = $6, notes = $7
     FROM wp_events e
     WHERE g.event_id = e.id AND g.id = $8 AND e.user_id = $9
     RETURNING g.*`,
    [name.trim(), email ?? null, phone ?? null, group_tag ?? null, meal_pref ?? null, plus_one ?? false, notes ?? null, id, session.user.id]
  )

  if (rows.length === 0) return NextResponse.json({ error: "Guest not found" }, { status: 404 })

  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Delete RSVPs first
  await query(
    `DELETE FROM wp_rsvps r
     USING wp_guests g, wp_events e
     WHERE r.guest_id = g.id AND g.event_id = e.id AND g.id = $1 AND e.user_id = $2`,
    [id, session.user.id]
  )

  const { rowCount } = await query(
    `DELETE FROM wp_guests g
     USING wp_events e
     WHERE g.event_id = e.id AND g.id = $1 AND e.user_id = $2`,
    [id, session.user.id]
  )

  if (rowCount === 0) return NextResponse.json({ error: "Guest not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
