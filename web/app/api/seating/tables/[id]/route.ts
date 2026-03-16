import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, capacity, notes } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { rows } = await query(
    `UPDATE wp_tables t
     SET name = $1, capacity = $2, notes = $3
     FROM wp_events e
     WHERE t.event_id = e.id AND t.id = $4 AND e.user_id = $5
     RETURNING t.*`,
    [name.trim(), capacity ?? 8, notes ?? null, id, session.user.id]
  )

  if (rows.length === 0) return NextResponse.json({ error: "Table not found" }, { status: 404 })

  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const { rowCount } = await query(
    `DELETE FROM wp_tables t
     USING wp_events e
     WHERE t.event_id = e.id AND t.id = $1 AND e.user_id = $2`,
    [id, session.user.id]
  )

  if (rowCount === 0) return NextResponse.json({ error: "Table not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
