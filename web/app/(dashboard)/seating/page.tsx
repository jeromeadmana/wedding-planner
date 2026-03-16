import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import SeatingBoard from "./SeatingBoard"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Seating" }

interface TableRow {
  id: string
  event_id: string
  name: string
  capacity: number
  notes: string | null
  guests: { id: string; guest_id: string; guest_name: string }[]
}

interface UnseatedGuest {
  id: string
  name: string
  group_tag: string | null
}

interface SeatingStats {
  total_tables: number
  total_capacity: number
  seated_count: number
  unseated_count: number
}

export default async function SeatingPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  const [{ rows: tables }, { rows: unseatedGuests }, { rows: statsRows }] = await Promise.all([
    query<TableRow>(
      `SELECT t.*,
        COALESCE(json_agg(json_build_object('id', sa.id, 'guest_id', g.id, 'guest_name', g.name))
        FILTER (WHERE sa.id IS NOT NULL), '[]') as guests
       FROM wp_tables t
       LEFT JOIN wp_seat_assignments sa ON sa.table_id = t.id
       LEFT JOIN wp_guests g ON g.id = sa.guest_id
       WHERE t.event_id = $1
       GROUP BY t.id ORDER BY t.name`,
      [event.id]
    ),
    query<UnseatedGuest>(
      `SELECT g.id, g.name, g.group_tag
       FROM wp_guests g
       WHERE g.event_id = $1
         AND g.id NOT IN (
           SELECT sa.guest_id FROM wp_seat_assignments sa
           JOIN wp_tables t ON sa.table_id = t.id
           WHERE t.event_id = $1
         )
       ORDER BY g.name`,
      [event.id]
    ),
    query<SeatingStats>(
      `SELECT
         (SELECT COUNT(*)::int FROM wp_tables WHERE event_id = $1) AS total_tables,
         (SELECT COALESCE(SUM(capacity), 0)::int FROM wp_tables WHERE event_id = $1) AS total_capacity,
         (SELECT COUNT(*)::int FROM wp_seat_assignments sa JOIN wp_tables t ON sa.table_id = t.id WHERE t.event_id = $1) AS seated_count,
         (SELECT COUNT(*)::int FROM wp_guests g WHERE g.event_id = $1
           AND g.id NOT IN (SELECT sa.guest_id FROM wp_seat_assignments sa JOIN wp_tables t ON sa.table_id = t.id WHERE t.event_id = $1)
         ) AS unseated_count`,
      [event.id]
    ),
  ])

  const s = statsRows[0] ?? { total_tables: 0, total_capacity: 0, seated_count: 0, unseated_count: 0 }

  return (
    <div>
      <Header
        title="Seating Planner"
        subtitle="Arrange your guests across tables"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Tables</p>
          <p className="text-2xl font-semibold text-neutral-800">{s.total_tables}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Total Capacity</p>
          <p className="text-2xl font-semibold text-neutral-800">{s.total_capacity}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Seated</p>
          <p className="text-2xl font-semibold text-green-600">{s.seated_count}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Unseated</p>
          <p className="text-2xl font-semibold text-yellow-600">{s.unseated_count}</p>
        </div>
      </div>

      <SeatingBoard tables={tables} unseatedGuests={unseatedGuests} eventId={event.id} />
    </div>
  )
}
