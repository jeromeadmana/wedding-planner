import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { deletePhoto } from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { is_visible } = body

  if (is_visible === undefined) {
    return NextResponse.json({ error: "is_visible is required" }, { status: 400 })
  }

  const { rows } = await query(
    `UPDATE wp_photos
     SET is_visible = $1
     WHERE id = $2
     AND session_id IN (
       SELECT s.id FROM wp_photo_sessions s
       JOIN wp_events e ON s.event_id = e.id
       WHERE e.user_id = $3
     )
     RETURNING *`,
    [is_visible, id, session.user.id]
  )

  if (rows.length === 0) return NextResponse.json({ error: "Photo not found" }, { status: 404 })

  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Fetch photo for Cloudinary cleanup with ownership check
  const { rows: photos } = await query(
    `SELECT p.cloudinary_public_id
     FROM wp_photos p
     JOIN wp_photo_sessions s ON p.session_id = s.id
     JOIN wp_events e ON s.event_id = e.id
     WHERE p.id = $1 AND e.user_id = $2`,
    [id, session.user.id]
  )

  if (photos.length === 0) return NextResponse.json({ error: "Photo not found" }, { status: 404 })

  // Delete from Cloudinary
  await deletePhoto(photos[0].cloudinary_public_id)

  // Delete from database
  await query(
    `DELETE FROM wp_photos
     WHERE id = $1
     AND session_id IN (
       SELECT s.id FROM wp_photo_sessions s
       JOIN wp_events e ON s.event_id = e.id
       WHERE e.user_id = $2
     )`,
    [id, session.user.id]
  )

  return new NextResponse(null, { status: 204 })
}
