import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, items } = body as { eventId: string; items: { id: string; order_index: number }[] }

  if (!eventId || !items || items.length === 0) {
    return NextResponse.json({ error: "eventId and items are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  // Build CASE WHEN for batch update
  const ids: string[] = []
  const caseParts: string[] = []
  const params: unknown[] = [eventId]

  items.forEach((item, i) => {
    const idIdx = params.length + 1
    const orderIdx = params.length + 2
    params.push(item.id, item.order_index)
    caseParts.push(`WHEN id = $${idIdx} THEN $${orderIdx}::int`)
    ids.push(`$${idIdx}`)
  })

  await query(
    `UPDATE wp_timeline_events
     SET order_index = CASE ${caseParts.join(" ")} END
     WHERE event_id = $1
       AND id IN (${ids.join(", ")})`,
    params
  )

  return NextResponse.json({ success: true })
}
