import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60)
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { rows } = await query(
    `SELECT id, title, event_type, date, venue, city, guest_count_estimate, slug, is_website_live, created_at
     FROM wp_events WHERE user_id = $1 ORDER BY created_at DESC`,
    [session.user.id]
  )
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, event_type, date, venue, city, guest_count_estimate } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  // Generate a unique slug
  const base = slugify(title)
  const rand = Math.random().toString(36).slice(2, 6)
  const slug = `${base}-${rand}`

  const { rows } = await query(
    `INSERT INTO wp_events (user_id, title, event_type, date, venue, city, guest_count_estimate, slug)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, slug`,
    [session.user.id, title.trim(), event_type ?? "wedding", date ?? null, venue ?? null, city ?? null, guest_count_estimate ?? null, slug]
  )

  return NextResponse.json(rows[0], { status: 201 })
}
