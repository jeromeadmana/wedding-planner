import { auth } from "@/lib/auth"
import { query } from "@/lib/db"
import Link from "next/link"
import Header from "@/components/Header"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }

interface Event {
  id: string
  title: string
  event_type: string
  date: string | null
  venue: string | null
  city: string | null
  guest_count_estimate: number | null
  slug: string
}

interface Stats {
  guests: number
  confirmed: number
  budget_total: number
  budget_spent: number
  vendors: number
  tasks_done: number
  tasks_total: number
}

const EVENT_TYPE_EMOJI: Record<string, string> = {
  wedding:   "💍",
  debut:     "🌸",
  birthday:  "🎂",
  corporate: "🏢",
  other:     "🎉",
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  // Fetch user's events
  const { rows: events } = await query<Event>(
    `SELECT id, title, event_type, date, venue, city, guest_count_estimate, slug
     FROM wp_events WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  )

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-6xl mb-4">🌸</span>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-2">Welcome to Saya!</h2>
        <p className="text-neutral-500 mb-8 max-w-sm">
          You haven&apos;t created an event yet. Let&apos;s get started.
        </p>
        <Link href="/events/new" className="btn-primary text-base px-6 py-3">
          Create your first event
        </Link>
      </div>
    )
  }

  // Use the first (most recent) event as the active one
  const event = events[0]

  // Fetch stats for this event
  const [guestsRes, budgetRes, vendorsRes, checklistRes] = await Promise.all([
    query<{ total: string; confirmed: string }>(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE r.status = 'confirmed') AS confirmed
       FROM wp_guests g
       LEFT JOIN wp_rsvps r ON r.guest_id = g.id
       WHERE g.event_id = $1`,
      [event.id]
    ),
    query<{ total: string; spent: string }>(
      `SELECT COALESCE(SUM(estimated_cost), 0) AS total,
              COALESCE(SUM(actual_cost), 0) AS spent
       FROM wp_budget_items WHERE event_id = $1`,
      [event.id]
    ),
    query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM wp_vendors WHERE event_id = $1`,
      [event.id]
    ),
    query<{ done: string; total: string }>(
      `SELECT COUNT(*) FILTER (WHERE is_done) AS done, COUNT(*) AS total
       FROM wp_checklist_items WHERE event_id = $1`,
      [event.id]
    ),
  ])

  const stats: Stats = {
    guests:       Number(guestsRes.rows[0]?.total ?? 0),
    confirmed:    Number(guestsRes.rows[0]?.confirmed ?? 0),
    budget_total: Number(budgetRes.rows[0]?.total ?? 0),
    budget_spent: Number(budgetRes.rows[0]?.spent ?? 0),
    vendors:      Number(vendorsRes.rows[0]?.total ?? 0),
    tasks_done:   Number(checklistRes.rows[0]?.done ?? 0),
    tasks_total:  Number(checklistRes.rows[0]?.total ?? 0),
  }

  const daysUntil = event.date
    ? Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div>
      <Header
        title={`${EVENT_TYPE_EMOJI[event.event_type] ?? "🎉"} ${event.title}`}
        subtitle={[event.venue, event.city].filter(Boolean).join(", ") || "No venue set yet"}
        action={
          <Link href="/events/new" className="btn-secondary text-sm">
            + New event
          </Link>
        }
      />

      {/* Countdown */}
      {daysUntil !== null && (
        <div className={`mb-6 rounded-xl px-6 py-4 flex items-center gap-4 ${
          daysUntil > 0
            ? "bg-brand-50 border border-brand-100"
            : "bg-green-50 border border-green-100"
        }`}>
          <span className="text-3xl font-display font-bold text-brand-700">
            {daysUntil > 0 ? daysUntil : 0}
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-700">
              {daysUntil > 0 ? "days to go" : daysUntil === 0 ? "It's today! 🎉" : "Event passed"}
            </p>
            <p className="text-xs text-neutral-400">
              {new Date(event.date!).toLocaleDateString("en-PH", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Link href="/guests" className="card hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Guests</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{stats.guests}</p>
          <p className="text-sm text-neutral-400 mt-0.5">{stats.confirmed} confirmed</p>
        </Link>

        <Link href="/budget" className="card hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Budget</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">
            ₱{stats.budget_spent.toLocaleString()}
          </p>
          <p className="text-sm text-neutral-400 mt-0.5">
            of ₱{stats.budget_total.toLocaleString()}
          </p>
        </Link>

        <Link href="/vendors" className="card hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Vendors</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{stats.vendors}</p>
          <p className="text-sm text-neutral-400 mt-0.5">tracked</p>
        </Link>

        <Link href="/timeline" className="card hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Checklist</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{stats.tasks_done}</p>
          <p className="text-sm text-neutral-400 mt-0.5">of {stats.tasks_total} done</p>
        </Link>
      </div>

      {/* Event switcher (if multiple events) */}
      {events.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Your events</h3>
          <div className="space-y-2">
            {events.map((e) => (
              <div
                key={e.id}
                className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                  e.id === event.id
                    ? "border-brand-200 bg-brand-50"
                    : "border-neutral-100 hover:bg-neutral-50"
                }`}
              >
                <span>{EVENT_TYPE_EMOJI[e.event_type] ?? "🎉"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-800 truncate">{e.title}</p>
                  <p className="text-xs text-neutral-400">
                    {e.date ? new Date(e.date).toLocaleDateString("en-PH") : "No date"}
                  </p>
                </div>
                {e.id === event.id && (
                  <span className="badge bg-brand-100 text-brand-700">Active</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
