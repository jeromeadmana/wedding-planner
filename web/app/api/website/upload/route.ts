import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { uploadPhoto } from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, image } = body

  if (!eventId || !image) {
    return NextResponse.json({ error: "eventId and image are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const folder = `saya/events/${eventId}/website`
  const uploaded = await uploadPhoto(image, folder)

  return NextResponse.json({ url: uploaded.secure_url })
}
