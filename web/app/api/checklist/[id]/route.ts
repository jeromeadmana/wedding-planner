import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const allowedFields: Record<string, string> = {
    title: "title",
    category: "category",
    due_date: "due_date",
    is_done: "is_done",
    is_pinned: "is_pinned",
    notes: "notes",
  }

  const setClauses: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  for (const [key, column] of Object.entries(allowedFields)) {
    if (key in body) {
      setClauses.push(`${column} = $${paramIndex}`)
      values.push(body[key])
      paramIndex++
    }
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  values.push(id, session.user.id)

  const { rows } = await query(
    `UPDATE wp_checklist_items c
     SET ${setClauses.join(", ")}
     FROM wp_events e
     WHERE c.event_id = e.id AND c.id = $${paramIndex} AND e.user_id = $${paramIndex + 1}
     RETURNING c.*`,
    values
  )

  if (rows.length === 0) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const { rowCount } = await query(
    `DELETE FROM wp_checklist_items c
     USING wp_events e
     WHERE c.event_id = e.id AND c.id = $1 AND e.user_id = $2`,
    [id, session.user.id]
  )

  if (rowCount === 0) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
