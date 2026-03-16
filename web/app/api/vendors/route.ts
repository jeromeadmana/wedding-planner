import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get("eventId")
  if (!eventId) return NextResponse.json({ error: "eventId is required" }, { status: 400 })

  const { rows } = await query(
    `SELECT v.*
     FROM wp_vendors v
     JOIN wp_events e ON v.event_id = e.id
     WHERE v.event_id = $1 AND e.user_id = $2
     ORDER BY v.created_at DESC`,
    [eventId, session.user.id]
  )

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, category, business_name, contact_name, phone, email, contract_amount, deposit_paid, status, notes } = body

  if (!eventId || !business_name?.trim()) {
    return NextResponse.json({ error: "eventId and business_name are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const contractAmt = Number(contract_amount) || 0
  const depositAmt = Number(deposit_paid) || 0
  const balance = contractAmt - depositAmt

  const { rows } = await query(
    `INSERT INTO wp_vendors (event_id, category, business_name, contact_name, phone, email, contract_amount, deposit_paid, balance, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      eventId,
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
    ]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
