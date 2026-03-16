import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { category, business_name, contact_name, phone, email, contract_amount, deposit_paid, status, notes } = body

  if (!business_name?.trim()) {
    return NextResponse.json({ error: "business_name is required" }, { status: 400 })
  }

  const contractAmt = Number(contract_amount) || 0
  const depositAmt = Number(deposit_paid) || 0
  const balance = contractAmt - depositAmt

  const { rows } = await query(
    `UPDATE wp_vendors
     SET category = $1, business_name = $2, contact_name = $3, phone = $4, email = $5,
         contract_amount = $6, deposit_paid = $7, balance = $8, status = $9, notes = $10
     WHERE id = $11
       AND event_id IN (SELECT id FROM wp_events WHERE user_id = $12)
     RETURNING *`,
    [
      category ?? null,
      business_name.trim(),
      contact_name ?? null,
      phone ?? null,
      email ?? null,
      contractAmt,
      depositAmt,
      balance,
      status ?? "contacted",
      notes ?? null,
      id,
      session.user.id,
    ]
  )

  if (rows.length === 0) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })

  return NextResponse.json(rows[0])
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const { rowCount } = await query(
    `DELETE FROM wp_vendors
     WHERE id = $1
       AND event_id IN (SELECT id FROM wp_events WHERE user_id = $2)`,
    [id, session.user.id]
  )

  if (rowCount === 0) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
