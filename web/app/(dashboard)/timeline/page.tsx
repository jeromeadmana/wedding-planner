import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import TimelineList from "./TimelineList"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Timeline" }

export default async function TimelinePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  interface TimelineRow {
    id: string
    event_id: string
    time: string | null
    title: string
    location: string | null
    assignee: string | null
    notes: string | null
    order_index: number
  }

  const { rows: items } = await query<TimelineRow>(
    `SELECT t.*
     FROM wp_timeline_events t
     JOIN wp_events e ON t.event_id = e.id
     WHERE t.event_id = $1 AND e.user_id = $2
     ORDER BY t.order_index, t.time`,
    [event.id, session.user.id]
  )

  return (
    <div>
      <Header
        title="Day-of Timeline"
        subtitle="Plan your event minute by minute"
      />

      <TimelineList items={items} eventId={event.id} />
    </div>
  )
}
