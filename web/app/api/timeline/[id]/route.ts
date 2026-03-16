import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { time, title, location, assignee, notes } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }

  const { rows } = await query(
    `UPDATE wp_timeline_events
     SET time = $1, title = $2, location = $3, assignee = $4, notes = $5
     WHERE id = $6
       AND event_id IN (SELECT id FROM wp_events WHERE user_id = $7)
     RETURNING *`,
    [
      time ?? null,
      title.trim(),
      location ?? null,
      assignee ?? null,
      notes ?? null,
      id,
      session.user.id,
    ]
  )

  if (rows.length === 0) return NextResponse.json({ error: "Timeline item not found" }, { status: 404 })

  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const { rowCount } = await query(
    `DELETE FROM wp_timeline_events
     WHERE id = $1
       AND event_id IN (SELECT id FROM wp_events WHERE user_id = $2)`,
    [id, session.user.id]
  )

  if (rowCount === 0) return NextResponse.json({ error: "Timeline item not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
