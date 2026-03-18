import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import Link from "next/link"
import SeatingOptimizer from "./SeatingOptimizer"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Seating Optimizer" }

export default async function SeatingOptimizerPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  const [{ rows: guests }, { rows: tables }] = await Promise.all([
    query<{ id: string; name: string; group_tag: string | null }>(
      `SELECT id, name, group_tag FROM wp_guests WHERE event_id = $1 ORDER BY group_tag, name`,
      [event.id]
    ),
    query<{ id: string; name: string; capacity: number }>(
      `SELECT id, name, capacity FROM wp_tables WHERE event_id = $1 ORDER BY name`,
      [event.id]
    ),
  ])

  return (
    <div>
      <Header title="Seating Optimizer" subtitle="Auto-assign guests to tables by group" />

      <div className="mb-4">
        <Link href="/ai" className="text-sm text-blue-600 hover:underline">
          &larr; Back to AI Tools
        </Link>
      </div>

      <SeatingOptimizer guests={guests} tables={tables} eventId={event.id} />
    </div>
  )
}
