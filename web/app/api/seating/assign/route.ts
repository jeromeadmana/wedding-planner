import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { tableId, guestId } = body

  if (!tableId || !guestId) {
    return NextResponse.json({ error: "tableId and guestId are required" }, { status: 400 })
  }

  // Ownership: verify table belongs to user's event
  const { rows: tableRows } = await query(
    `SELECT t.id FROM wp_tables t
     JOIN wp_events e ON t.event_id = e.id
     WHERE t.id = $1 AND e.user_id = $2`,
    [tableId, session.user.id]
  )
  if (tableRows.length === 0) return NextResponse.json({ error: "Table not found" }, { status: 404 })

  await query(
    `INSERT INTO wp_seat_assignments (table_id, guest_id)
     VALUES ($1, $2)
     ON CONFLICT (guest_id) DO UPDATE SET table_id = $1`,
    [tableId, guestId]
  )

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { guestId } = body

  if (!guestId) {
    return NextResponse.json({ error: "guestId is required" }, { status: 400 })
  }

  // Ownership: verify guest belongs to user's event
  const { rows: guestRows } = await query(
    `SELECT g.id FROM wp_guests g
     JOIN wp_events e ON g.event_id = e.id
     WHERE g.id = $1 AND e.user_id = $2`,
    [guestId, session.user.id]
  )
  if (guestRows.length === 0) return NextResponse.json({ error: "Guest not found" }, { status: 404 })

  await query(
    `DELETE FROM wp_seat_assignments WHERE guest_id = $1`,
    [guestId]
  )

  return new NextResponse(null, { status: 204 })
}
