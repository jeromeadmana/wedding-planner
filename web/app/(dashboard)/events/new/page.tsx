"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"

const EVENT_TYPES = [
  { value: "wedding",   label: "💍 Wedding" },
  { value: "debut",     label: "🌸 Debut" },
  { value: "birthday",  label: "🎂 Birthday" },
  { value: "corporate", label: "🏢 Corporate" },
  { value: "other",     label: "🎉 Other" },
]

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const body = {
      title:               form.get("title"),
      event_type:          form.get("event_type"),
      date:                form.get("date") || null,
      venue:               form.get("venue") || null,
      city:                form.get("city") || null,
      guest_count_estimate: form.get("guest_count") ? Number(form.get("guest_count")) : null,
    }

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Something went wrong")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="max-w-lg">
      <Header title="Create event" subtitle="Set up your event details" />

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Event type */}
        <div>
          <label className="label">Event type</label>
          <div className="grid grid-cols-3 gap-2">
            {EVENT_TYPES.map((t) => (
              <label key={t.value} className="cursor-pointer">
                <input type="radio" name="event_type" value={t.value} defaultChecked={t.value === "wedding"} className="sr-only peer" />
                <div className="peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-700 border border-neutral-200 rounded-lg py-2.5 text-center text-sm font-medium text-neutral-600 hover:border-brand-300 transition-colors">
                  {t.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="label">Event title <span className="text-red-400">*</span></label>
          <input id="title" name="title" type="text" required placeholder="e.g. Maria & Carlo's Wedding" className="input" />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="label">Event date</label>
          <input id="date" name="date" type="date" className="input" />
        </div>

        {/* Venue + City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="venue" className="label">Venue</label>
            <input id="venue" name="venue" type="text" placeholder="Venue name" className="input" />
          </div>
          <div>
            <label htmlFor="city" className="label">City</label>
            <input id="city" name="city" type="text" placeholder="City" className="input" />
          </div>
        </div>

        {/* Guest count */}
        <div>
          <label htmlFor="guest_count" className="label">Estimated guests</label>
          <input id="guest_count" name="guest_count" type="number" min={1} placeholder="100" className="input" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? "Creating…" : "Create event"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
