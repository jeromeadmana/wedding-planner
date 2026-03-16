import Header from "@/components/Header"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Guests" }

// Phase 2: will be wired to real DB (wp_guests + wp_rsvps)
export default function GuestsPage() {
  return (
    <div>
      <Header
        title="Guest List"
        subtitle="Manage your guests and track RSVPs"
        action={
          <button className="btn-primary text-sm">+ Add guest</button>
        }
      />

      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">👥</span>
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">Guest management coming in Phase 2</h3>
        <p className="text-sm text-neutral-400 max-w-xs">
          Add guests, track RSVPs, manage meal preferences, and send automated reminders.
        </p>
        <Link href="/dashboard" className="btn-secondary mt-6 text-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
