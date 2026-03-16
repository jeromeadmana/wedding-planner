import { query } from "@/lib/db"
import { uploadPhoto } from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  const { qr_token, guest_name, image, caption } = body

  if (!qr_token || !guest_name?.trim() || !image) {
    return NextResponse.json(
      { error: "qr_token, guest_name, and image are required" },
      { status: 400 }
    )
  }

  // Validate QR token and check session is active
  const { rows: sessions } = await query(
    `SELECT id, event_id FROM wp_photo_sessions
     WHERE qr_token = $1 AND is_active = true`,
    [qr_token]
  )

  if (sessions.length === 0) {
    return NextResponse.json(
      { error: "Invalid or inactive session" },
      { status: 404 }
    )
  }

  const { id: sessionId, event_id: eventId } = sessions[0]

  // Guard: max 20 photos per guest per session
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS count FROM wp_photos
     WHERE session_id = $1 AND guest_name = $2`,
    [sessionId, guest_name.trim()]
  )

  if (countRows[0].count >= 20) {
    return NextResponse.json(
      { error: "Maximum 20 photos per guest per session" },
      { status: 429 }
    )
  }

  // Upload to Cloudinary
  const folder = `saya/events/${eventId}/shots/${sessionId}`
  const uploaded = await uploadPhoto(image, folder)

  // Insert photo record
  const { rows } = await query(
    `INSERT INTO wp_photos (session_id, event_id, guest_name, cloudinary_public_id, cloudinary_url, thumbnail_url, caption)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, cloudinary_url, thumbnail_url`,
    [sessionId, eventId, guest_name.trim(), uploaded.public_id, uploaded.secure_url, uploaded.thumbnail_url, caption ?? null]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
