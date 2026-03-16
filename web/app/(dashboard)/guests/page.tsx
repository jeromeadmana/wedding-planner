import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent, formatCurrency } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import GuestList from "./GuestList"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Guests" }

interface Guest {
  id: string
  event_id: string
  name: string
  email: string | null
  phone: string | null
  group_tag: string | null
  meal_pref: string | null
  plus_one: boolean
  notes: string | null
  invited_at: string
  rsvp_status: string | null
  meal_choice: string | null
}

interface GuestStats {
  total: number
  confirmed: number
  pending: number
  declined: number
}

export default async function GuestsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  const [{ rows: guests }, { rows: stats }] = await Promise.all([
    query<Guest>(
      `SELECT g.id, g.event_id, g.name, g.email, g.phone, g.group_tag, g.meal_pref,
              g.plus_one, g.notes, g.invited_at,
              r.status AS rsvp_status, r.meal_choice
       FROM wp_guests g
       LEFT JOIN wp_rsvps r ON r.guest_id = g.id
       WHERE g.event_id = $1
       ORDER BY g.invited_at DESC`,
      [event.id]
    ),
    query<GuestStats>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE r.status = 'confirmed')::int AS confirmed,
         COUNT(*) FILTER (WHERE r.status = 'pending' OR r.status IS NULL)::int AS pending,
         COUNT(*) FILTER (WHERE r.status = 'declined')::int AS declined
       FROM wp_guests g
       LEFT JOIN wp_rsvps r ON r.guest_id = g.id
       WHERE g.event_id = $1`,
      [event.id]
    ),
  ])

  const s = stats[0] ?? { total: 0, confirmed: 0, pending: 0, declined: 0 }

  return (
    <div>
      <Header
        title="Guest List"
        subtitle="Manage your guests and track RSVPs"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Total Guests</p>
          <p className="text-2xl font-semibold text-neutral-800">{s.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Confirmed</p>
          <p className="text-2xl font-semibold text-green-600">{s.confirmed}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600">{s.pending}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Declined</p>
          <p className="text-2xl font-semibold text-red-600">{s.declined}</p>
        </div>
      </div>

      <GuestList guests={guests} eventId={event.id} />
    </div>
  )
}
