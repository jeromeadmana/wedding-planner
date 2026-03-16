import { query } from "@/lib/db"
import { NextResponse } from "next/server"

// Mobile app calls this after Google OAuth to upsert the user
export async function POST(req: Request) {
  const { email, name, avatar } = await req.json()

  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

  await query(
    `INSERT INTO wp_users (email, name, avatar)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
       SET name   = EXCLUDED.name,
           avatar = EXCLUDED.avatar`,
    [email, name ?? null, avatar ?? null]
  )

  const { rows } = await query<{ id: string }>(
    "SELECT id FROM wp_users WHERE email = $1",
    [email]
  )

  return NextResponse.json({ id: rows[0]?.id })
}
