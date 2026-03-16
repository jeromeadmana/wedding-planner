import { query } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: { slug: string }
}

interface EventRow {
  id: string
  title: string
  event_type: string
  date: string | null
  venue: string | null
  city: string | null
  cover_photo_url: string | null
  is_website_live: boolean
  website_theme: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rows } = await query<EventRow>(
    "SELECT title FROM wp_events WHERE slug = $1 AND is_website_live = true",
    [params.slug]
  )
  if (!rows[0]) return { title: "Event not found" }
  return { title: rows[0].title }
}

export default async function EventWebsitePage({ params }: Props) {
  const { rows } = await query<EventRow>(
    `SELECT id, title, event_type, date, venue, city, cover_photo_url, is_website_live, website_theme
     FROM wp_events WHERE slug = $1`,
    [params.slug]
  )

  const event = rows[0]
  if (!event) notFound()
  if (!event.is_website_live) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-center px-4">
        <div>
          <span className="text-5xl">🌸</span>
          <h1 className="mt-4 text-2xl font-display font-bold text-neutral-800">Coming soon</h1>
          <p className="mt-2 text-neutral-500">This event page isn&apos;t published yet.</p>
        </div>
      </div>
    )
  }

  const daysUntil = event.date
    ? Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)
    : null

  const themeColors: Record<string, { bg: string; accent: string; text: string }> = {
    classic: { bg: "#be185d", accent: "#fce7f3", text: "#ffffff" },
    beach:   { bg: "#0e7490", accent: "#e0f2fe", text: "#ffffff" },
    garden:  { bg: "#15803d", accent: "#dcfce7", text: "#ffffff" },
    boho:    { bg: "#92400e", accent: "#fef3c7", text: "#ffffff" },
    modern:  { bg: "#1e293b", accent: "#f1f5f9", text: "#ffffff" },
  }
  const theme = themeColors[event.website_theme] ?? themeColors.classic

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <div
        className="px-6 py-20 text-center"
        style={{ background: theme.bg, color: theme.text }}
      >
        <p className="text-sm uppercase tracking-widest opacity-70 mb-2">We&apos;re getting married</p>
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">{event.title}</h1>
        {event.date && (
          <p className="text-lg opacity-80">
            {new Date(event.date).toLocaleDateString("en-PH", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        )}
        {event.venue && (
          <p className="mt-1 opacity-70 flex items-center justify-center gap-1">
            <span>📍</span> {event.venue}{event.city ? `, ${event.city}` : ""}
          </p>
        )}
      </div>

      {/* Countdown */}
      {daysUntil !== null && daysUntil > 0 && (
        <div className="max-w-md mx-auto -mt-6 px-4">
          <div className="bg-white rounded-xl shadow-md p-5 text-center border border-neutral-100">
            <p className="text-xs text-neutral-400 uppercase tracking-wide mb-3">Counting down</p>
            <div className="flex justify-center gap-4">
              {[
                { val: Math.floor(daysUntil), label: "Days" },
                { val: new Date().getHours(), label: "Hrs" },
                { val: new Date().getMinutes(), label: "Min" },
                { val: new Date().getSeconds(), label: "Sec" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <span className="text-2xl font-bold text-neutral-800">{String(val).padStart(2, "0")}</span>
                  <p className="text-xs text-neutral-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RSVP placeholder */}
      <div className="max-w-md mx-auto mt-8 px-4 pb-16 text-center">
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">Will you be there?</h2>
          <p className="text-sm text-neutral-500 mb-5">Kindly confirm your attendance</p>
          <button
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{ background: theme.bg }}
          >
            Confirm Attendance
          </button>
          <p className="text-xs text-neutral-400 mt-3">RSVP powered by Saya 🌸</p>
        </div>
      </div>
    </div>
  )
}
