import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import SessionList from "./SessionList"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Saya Shots" }

interface SessionRow {
  id: string
  session_name: string
  qr_token: string
  is_active: boolean
  reveal_at: string | null
  photo_count: number
  created_at: string
}

interface TotalPhotos {
  count: number
}

export default async function ShotsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  const [{ rows: sessions }, { rows: totalRows }] = await Promise.all([
    query<SessionRow>(
      `SELECT s.*, COUNT(p.id)::int AS photo_count
       FROM wp_photo_sessions s
       LEFT JOIN wp_photos p ON p.session_id = s.id
       WHERE s.event_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [event.id]
    ),
    query<TotalPhotos>(
      `SELECT COUNT(*)::int AS count FROM wp_photos WHERE event_id = $1`,
      [event.id]
    ),
  ])

  const totalPhotos = totalRows[0]?.count ?? 0
  const activeSessions = sessions.filter((s) => s.is_active).length

  return (
    <div>
      <Header
        title="Saya Shots"
        subtitle="Capture every moment"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Total Sessions</p>
          <p className="text-2xl font-semibold text-neutral-800">{sessions.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Total Photos</p>
          <p className="text-2xl font-semibold text-neutral-800">{totalPhotos}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Active Sessions</p>
          <p className="text-2xl font-semibold text-green-600">{activeSessions}</p>
        </div>
      </div>

      <SessionList sessions={sessions} eventId={event.id} />
    </div>
  )
}
