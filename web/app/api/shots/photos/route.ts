import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("sessionId")
  if (!sessionId) return NextResponse.json({ error: "sessionId is required" }, { status: 400 })

  const { rows } = await query(
    `SELECT p.*
     FROM wp_photos p
     JOIN wp_photo_sessions s ON p.session_id = s.id
     JOIN wp_events e ON s.event_id = e.id
     WHERE p.session_id = $1 AND e.user_id = $2
     ORDER BY p.taken_at DESC`,
    [sessionId, session.user.id]
  )

  return NextResponse.json(rows)
}
