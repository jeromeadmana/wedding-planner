import { query } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import CountdownTimer from "./countdown-timer"

/* ──────────────────────────── Types ──────────────────────────── */

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

interface WeddingPageRow {
  id: string
  event_id: string
  theme: string
  hero_photo_url: string | null
  our_story_text: string | null
  events_json: ScheduleEvent[] | null
  gallery_urls: string[] | null
  registry_link: string | null
  is_live: boolean
}

interface ScheduleEvent {
  title?: string
  time?: string
  venue?: string
  address?: string
  description?: string
}

/* ──────────────────────────── Theme ──────────────────────────── */

const THEMES: Record<string, { bg: string; accent: string; text: string; headingText: string }> = {
  classic: { bg: "#be185d", accent: "#fce7f3", text: "#ffffff", headingText: "#be185d" },
  beach:   { bg: "#0e7490", accent: "#e0f2fe", text: "#ffffff", headingText: "#0e7490" },
  garden:  { bg: "#15803d", accent: "#dcfce7", text: "#ffffff", headingText: "#15803d" },
  boho:    { bg: "#92400e", accent: "#fef3c7", text: "#ffffff", headingText: "#92400e" },
  modern:  { bg: "#1e293b", accent: "#f1f5f9", text: "#ffffff", headingText: "#1e293b" },
}

/* ──────────────────────────── SEO ──────────────────────────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rows } = await query<EventRow>(
    "SELECT title, venue, date FROM wp_events WHERE slug = $1",
    [params.slug]
  )
  if (!rows[0]) return { title: "Event not found" }
  const ev = rows[0]
  const desc = [ev.venue, ev.date ? new Date(ev.date).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : null].filter(Boolean).join(" — ")
  return {
    title: ev.title,
    description: desc || `${ev.title} — powered by Saya`,
    openGraph: { title: ev.title, description: desc || undefined },
  }
}

/* ──────────────────────────── Page ──────────────────────────── */

export default async function EventWebsitePage({ params }: Props) {
  // Fetch event
  const { rows: eventRows } = await query<EventRow>(
    `SELECT id, title, event_type, date, venue, city, cover_photo_url, is_website_live, website_theme
     FROM wp_events WHERE slug = $1`,
    [params.slug]
  )
  const event = eventRows[0]
  if (!event) notFound()

  // Fetch wedding page data
  const { rows: pageRows } = await query<WeddingPageRow>(
    `SELECT id, event_id, theme, hero_photo_url, our_story_text, events_json, gallery_urls, registry_link, is_live
     FROM wp_wedding_pages WHERE event_id = $1`,
    [event.id]
  )
  const page = pageRows[0] ?? null

  // Determine if live: wp_wedding_pages.is_live takes priority, fall back to wp_events.is_website_live
  const isLive = page ? page.is_live : event.is_website_live
  if (!isLive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-center px-4">
        <div>
          <p className="text-5xl mb-4">&#10024;</p>
          <h1 className="text-2xl font-bold text-neutral-800">Coming Soon</h1>
          <p className="mt-2 text-neutral-500 max-w-xs mx-auto">
            This event page is being prepared. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  // Theme — page.theme overrides event.website_theme
  const themeName = page?.theme ?? event.website_theme
  const theme = THEMES[themeName] ?? THEMES.classic

  // Hero image
  const heroImage = page?.hero_photo_url ?? event.cover_photo_url

  // Formatted date
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  // Schedule events
  const scheduleEvents: ScheduleEvent[] = Array.isArray(page?.events_json) ? page.events_json : []

  // Gallery
  const galleryUrls: string[] = Array.isArray(page?.gallery_urls) ? page.gallery_urls.filter(Boolean) : []

  // Registry
  const registryLink = page?.registry_link?.trim() || null

  // Our story
  const ourStory = page?.our_story_text?.trim() || null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ═══════════════════ Hero Section ═══════════════════ */}
      <section
        className="relative flex items-center justify-center text-center px-6"
        style={{
          minHeight: "70vh",
          background: heroImage
            ? `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${heroImage}) center/cover no-repeat`
            : theme.bg,
          color: theme.text,
        }}
      >
        <div className="relative z-10 max-w-2xl mx-auto py-20">
          <p
            className="text-sm uppercase tracking-[0.25em] mb-4 opacity-80"
            style={{ letterSpacing: "0.25em" }}
          >
            {event.event_type === "wedding" ? "We're Getting Married" : "You're Invited"}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            {event.title}
          </h1>
          {formattedDate && (
            <p className="text-lg sm:text-xl opacity-90 mb-2">{formattedDate}</p>
          )}
          {event.venue && (
            <p className="text-base opacity-75">
              {event.venue}
              {event.city ? `, ${event.city}` : ""}
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════ Countdown Timer ═══════════════════ */}
      {event.date && (
        <CountdownTimer
          targetDate={event.date}
          accentBg={theme.accent}
          accentText={theme.bg}
        />
      )}

      {/* ═══════════════════ Our Story ═══════════════════ */}
      {ourStory && (
        <section className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-8"
            style={{ color: theme.headingText }}
          >
            Our Story
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-8" style={{ background: theme.bg }} />
          <p className="text-neutral-600 leading-relaxed text-base sm:text-lg whitespace-pre-line"
             style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {ourStory}
          </p>
        </section>
      )}

      {/* ═══════════════════ Events Schedule ═══════════════════ */}
      {scheduleEvents.length > 0 && (
        <section className="max-w-2xl mx-auto px-6 py-16">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-8 text-center"
            style={{ color: theme.headingText }}
          >
            Events
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-10" style={{ background: theme.bg }} />
          <div className="space-y-4">
            {scheduleEvents.map((evt, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6"
              >
                {evt.title && (
                  <h3 className="font-bold text-lg text-neutral-800 mb-1">{evt.title}</h3>
                )}
                {evt.time && (
                  <p className="text-sm font-medium mb-1" style={{ color: theme.bg }}>
                    {evt.time}
                  </p>
                )}
                {evt.venue && (
                  <p className="text-sm text-neutral-600">{evt.venue}</p>
                )}
                {evt.address && (
                  <p className="text-xs text-neutral-400 mt-0.5">{evt.address}</p>
                )}
                {evt.description && (
                  <p className="text-sm text-neutral-500 mt-3">{evt.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ Gallery ═══════════════════ */}
      {galleryUrls.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-8 text-center"
            style={{ color: theme.headingText }}
          >
            Gallery
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-10" style={{ background: theme.bg }} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {galleryUrls.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Gallery photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════ Gift Registry ═══════════════════ */}
      {registryLink && (
        <section className="max-w-md mx-auto px-6 py-16 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ color: theme.headingText }}
          >
            Gift Registry
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-6" style={{ background: theme.bg }} />
          <p className="text-neutral-500 mb-6 text-sm">
            Your presence is the greatest gift. But if you wish to bless us further:
          </p>
          <a
            href={registryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-full font-semibold text-sm tracking-wide transition-opacity hover:opacity-90"
            style={{ background: theme.bg, color: theme.text }}
          >
            View Registry
          </a>
        </section>
      )}

      {/* ═══════════════════ RSVP Section ═══════════════════ */}
      <section className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: theme.headingText }}
          >
            Will you be there?
          </h2>
          <p className="text-sm text-neutral-500 mb-6">Kindly confirm your attendance</p>
          <button
            className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-opacity hover:opacity-90"
            style={{ background: theme.bg, color: theme.text }}
          >
            Confirm Attendance
          </button>
        </div>
      </section>

      {/* ═══════════════════ Footer ═══════════════════ */}
      <footer className="text-center py-10 px-6 border-t border-neutral-100">
        {formattedDate && (
          <p className="text-xs text-neutral-400 mb-1">{formattedDate}</p>
        )}
        {event.venue && (
          <p className="text-xs text-neutral-400 mb-4">
            {event.venue}{event.city ? `, ${event.city}` : ""}
          </p>
        )}
        <p className="text-[10px] text-neutral-300 uppercase tracking-widest">
          Made with Saya
        </p>
      </footer>
    </div>
  )
}
