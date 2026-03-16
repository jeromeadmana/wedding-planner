import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import { NextResponse } from "next/server"

interface TemplateItem {
  title: string
  category: string
}

const WEDDING_TEMPLATE: TemplateItem[] = [
  // 12 months before
  { title: "Book venue", category: "12 months before" },
  { title: "Choose wedding date", category: "12 months before" },
  { title: "Set budget", category: "12 months before" },
  { title: "Hire wedding planner", category: "12 months before" },
  { title: "Start guest list", category: "12 months before" },
  // 9 months before
  { title: "Book photographer", category: "9 months before" },
  { title: "Book videographer", category: "9 months before" },
  { title: "Choose bridal party", category: "9 months before" },
  { title: "Book music/band", category: "9 months before" },
  // 6 months before
  { title: "Order invitations", category: "6 months before" },
  { title: "Book caterer", category: "6 months before" },
  { title: "Choose wedding cake", category: "6 months before" },
  { title: "Book florist", category: "6 months before" },
  { title: "Register for gifts", category: "6 months before" },
  // 3 months before
  { title: "Send invitations", category: "3 months before" },
  { title: "Final guest count", category: "3 months before" },
  { title: "Book transportation", category: "3 months before" },
  { title: "Plan honeymoon", category: "3 months before" },
  { title: "Schedule fitting", category: "3 months before" },
  // 1 month before
  { title: "Confirm all vendors", category: "1 month before" },
  { title: "Final dress fitting", category: "1 month before" },
  { title: "Get marriage license", category: "1 month before" },
  { title: "Plan rehearsal dinner", category: "1 month before" },
  { title: "Write vows", category: "1 month before" },
  // 1 week before
  { title: "Confirm final guest count", category: "1 week before" },
  { title: "Prepare tips for vendors", category: "1 week before" },
  { title: "Pack for honeymoon", category: "1 week before" },
  { title: "Rehearsal dinner", category: "1 week before" },
  { title: "Assign day-of tasks", category: "1 week before" },
  // Day of
  { title: "Eat breakfast", category: "Day of" },
  { title: "Hair and makeup", category: "Day of" },
  { title: "Deliver final payments", category: "Day of" },
  { title: "Enjoy every moment!", category: "Day of" },
]

const DEBUT_TEMPLATE: TemplateItem[] = [
  { title: "Choose venue", category: "12 months before" },
  { title: "Set budget", category: "12 months before" },
  { title: "Choose theme and color scheme", category: "12 months before" },
  { title: "Book photographer", category: "9 months before" },
  { title: "Book videographer", category: "9 months before" },
  { title: "Hire event coordinator", category: "9 months before" },
  { title: "Order invitations", category: "6 months before" },
  { title: "Book caterer", category: "6 months before" },
  { title: "Choose debut cake", category: "6 months before" },
  { title: "Plan 18 roses, candles, treasures", category: "6 months before" },
  { title: "Send invitations", category: "3 months before" },
  { title: "Final guest count", category: "3 months before" },
  { title: "Choose debut gown", category: "3 months before" },
  { title: "Confirm all vendors", category: "1 month before" },
  { title: "Final fitting", category: "1 month before" },
]

const BIRTHDAY_TEMPLATE: TemplateItem[] = [
  { title: "Set budget", category: "3 months before" },
  { title: "Choose venue", category: "3 months before" },
  { title: "Choose theme", category: "3 months before" },
  { title: "Create guest list", category: "1 month before" },
  { title: "Send invitations", category: "1 month before" },
  { title: "Order cake", category: "1 month before" },
  { title: "Plan menu", category: "1 month before" },
  { title: "Buy decorations", category: "1 week before" },
  { title: "Confirm guest count", category: "1 week before" },
  { title: "Set up venue", category: "Day of" },
]

const TEMPLATES: Record<string, TemplateItem[]> = {
  wedding: WEDDING_TEMPLATE,
  debut: DEBUT_TEMPLATE,
  birthday: BIRTHDAY_TEMPLATE,
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { eventId, eventType } = body

  if (!eventId || !eventType) {
    return NextResponse.json({ error: "eventId and eventType are required" }, { status: 400 })
  }

  // Ownership check
  const { rows: evRows } = await query(
    `SELECT id FROM wp_events WHERE id = $1 AND user_id = $2`,
    [eventId, session.user.id]
  )
  if (evRows.length === 0) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const template = TEMPLATES[eventType] ?? TEMPLATES.wedding

  if (template.length === 0) {
    return NextResponse.json({ inserted: 0 })
  }

  // Build a single INSERT with multiple VALUES rows
  const valuePlaceholders: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  for (const item of template) {
    valuePlaceholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`)
    values.push(eventId, item.title, item.category)
    paramIndex += 3
  }

  await query(
    `INSERT INTO wp_checklist_items (event_id, title, category)
     VALUES ${valuePlaceholders.join(", ")}`,
    values
  )

  return NextResponse.json({ inserted: template.length }, { status: 201 })
}
