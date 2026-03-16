import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { sessionId } = body

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
  }

  // Reveal all photos (set is_visible = true) with ownership check
  const { rowCount } = await query(
    `UPDATE wp_photos
     SET is_visible = true
     WHERE session_id = $1
     AND session_id IN (
       SELECT s.id FROM wp_photo_sessions s
       JOIN wp_events e ON s.event_id = e.id
       WHERE e.user_id = $2
     )`,
    [sessionId, session.user.id]
  )

  // Update reveal_at timestamp on the session
  const { rowCount: sessionCount } = await query(
    `UPDATE wp_photo_sessions
     SET reveal_at = NOW()
     WHERE id = $1
     AND event_id IN (SELECT id FROM wp_events WHERE user_id = $2)`,
    [sessionId, session.user.id]
  )

  if (sessionCount === 0) return NextResponse.json({ error: "Session not found" }, { status: 404 })

  return NextResponse.json({ revealed: rowCount ?? 0 })
}
