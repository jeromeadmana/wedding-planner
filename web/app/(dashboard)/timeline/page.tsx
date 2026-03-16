import Header from "@/components/Header"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Timeline" }

// Phase 2: will be wired to real DB (wp_timeline_events)
export default function TimelinePage() {
  return (
    <div>
      <Header
        title="Day-of Timeline"
        subtitle="Plan your event minute by minute"
        action={
          <button className="btn-primary text-sm">+ Add event</button>
        }
      />

      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">📅</span>
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">Timeline coming in Phase 2</h3>
        <p className="text-sm text-neutral-400 max-w-xs">
          Build your day-of schedule, assign tasks to vendors, and share a live view with your team.
        </p>
        <Link href="/dashboard" className="btn-secondary mt-6 text-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
