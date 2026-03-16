import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { deletePhoto } from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { session_name, is_active, reveal_at } = body

  // Build dynamic SET clause
  const setClauses: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (session_name !== undefined) {
    setClauses.push(`session_name = $${paramIndex++}`)
    values.push(session_name.trim())
  }
  if (is_active !== undefined) {
    setClauses.push(`is_active = $${paramIndex++}`)
    values.push(is_active)
  }
  if (reveal_at !== undefined) {
    setClauses.push(`reveal_at = $${paramIndex++}`)
    values.push(reveal_at)
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  values.push(id, session.user.id)

  const { rows } = await query(
    `UPDATE wp_photo_sessions
     SET ${setClauses.join(", ")}
     WHERE id = $${paramIndex++}
     AND event_id IN (SELECT id FROM wp_events WHERE user_id = $${paramIndex})
     RETURNING *`,
    values
  )

  if (rows.length === 0) return NextResponse.json({ error: "Session not found" }, { status: 404 })

  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Fetch photos to delete from Cloudinary
  const { rows: photos } = await query(
    `SELECT p.cloudinary_public_id
     FROM wp_photos p
     JOIN wp_photo_sessions s ON p.session_id = s.id
     JOIN wp_events e ON s.event_id = e.id
     WHERE s.id = $1 AND e.user_id = $2`,
    [id, session.user.id]
  )

  // Delete each photo from Cloudinary
  for (const photo of photos) {
    await deletePhoto(photo.cloudinary_public_id)
  }

  // Delete the session (CASCADE will handle wp_photos rows)
  const { rowCount } = await query(
    `DELETE FROM wp_photo_sessions
     WHERE id = $1
     AND event_id IN (SELECT id FROM wp_events WHERE user_id = $2)`,
    [id, session.user.id]
  )

  if (rowCount === 0) return NextResponse.json({ error: "Session not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
