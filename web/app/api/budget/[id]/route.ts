import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { category, description, estimated_cost, actual_cost, vendor_id, paid, notes } = body

  if (!category?.trim()) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 })
  }

  const { rows } = await query(
    `UPDATE wp_budget_items b
     SET category = $1, description = $2, estimated_cost = $3, actual_cost = $4,
         vendor_id = $5, paid = $6, notes = $7
     FROM wp_events e
     WHERE b.event_id = e.id AND b.id = $8 AND e.user_id = $9
     RETURNING b.*`,
    [category.trim(), description ?? null, estimated_cost ?? 0, actual_cost ?? 0, vendor_id ?? null, paid ?? false, notes ?? null, id, session.user.id]
  )

  if (rows.length === 0) return NextResponse.json({ error: "Budget item not found" }, { status: 404 })

  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const { rowCount } = await query(
    `DELETE FROM wp_budget_items b
     USING wp_events e
     WHERE b.event_id = e.id AND b.id = $1 AND e.user_id = $2`,
    [id, session.user.id]
  )

  if (rowCount === 0) return NextResponse.json({ error: "Budget item not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
