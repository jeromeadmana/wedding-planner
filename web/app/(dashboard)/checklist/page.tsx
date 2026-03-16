import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import ChecklistView from "./ChecklistView"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Checklist" }

interface ChecklistItem {
  id: string
  title: string
  category: string | null
  due_date: string | null
  is_done: boolean
  is_pinned: boolean
  notes: string | null
  created_at: string
}

interface ChecklistStats {
  total: number
  done: number
  overdue: number
}

export default async function ChecklistPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  const [{ rows: items }, { rows: stats }] = await Promise.all([
    query<ChecklistItem>(
      `SELECT c.id, c.title, c.category, c.due_date, c.is_done, c.is_pinned, c.notes, c.created_at
       FROM wp_checklist_items c
       WHERE c.event_id = $1
       ORDER BY c.is_pinned DESC, c.due_date ASC NULLS LAST, c.created_at`,
      [event.id]
    ),
    query<ChecklistStats>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE is_done)::int AS done,
         COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND NOT is_done)::int AS overdue
       FROM wp_checklist_items
       WHERE event_id = $1`,
      [event.id]
    ),
  ])

  const s = stats[0] ?? { total: 0, done: 0, overdue: 0 }
  const remaining = s.total - s.done
  const progress = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0

  return (
    <div>
      <Header
        title="Checklist"
        subtitle="Track your tasks and stay on schedule"
      />

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-neutral-700">Overall Progress</p>
          <p className="text-sm font-semibold text-neutral-800">{progress}%</p>
        </div>
        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Total</p>
          <p className="text-2xl font-semibold text-neutral-800">{s.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Done</p>
          <p className="text-2xl font-semibold text-green-600">{s.done}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Remaining</p>
          <p className="text-2xl font-semibold text-yellow-600">{remaining}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{s.overdue}</p>
        </div>
      </div>

      <ChecklistView items={items} eventId={event.id} eventType={event.event_type} />
    </div>
  )
}
