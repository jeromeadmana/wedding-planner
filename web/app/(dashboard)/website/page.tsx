import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import WebsiteEditor from "./WebsiteEditor"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Event Website" }

export default async function WebsitePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  // Auto-create wedding page if not exists, then fetch
  await query(
    `INSERT INTO wp_wedding_pages (event_id) VALUES ($1)
     ON CONFLICT (event_id) DO NOTHING`,
    [event.id]
  )

  const { rows: pageRows } = await query(
    `SELECT * FROM wp_wedding_pages WHERE event_id = $1`,
    [event.id]
  )

  const page = pageRows[0]

  // Fetch event details for the editor
  const { rows: eventRows } = await query(
    `SELECT title, date, venue, city, slug FROM wp_events WHERE id = $1`,
    [event.id]
  )

  const eventData = eventRows[0]

  return (
    <div>
      <Header
        title="Event Website"
        subtitle="Customize your public event page"
        action={
          eventData.slug ? (
            <a
              href={`/e/${eventData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              Preview Site &rarr;
            </a>
          ) : null
        }
      />

      <WebsiteEditor
        page={{
          id: page.id,
          theme: page.theme,
          hero_photo_url: page.hero_photo_url,
          our_story_text: page.our_story_text,
          events_json: page.events_json,
          gallery_urls: page.gallery_urls,
          registry_link: page.registry_link,
          is_live: page.is_live,
        }}
        event={{
          title: eventData.title,
          date: eventData.date,
          venue: eventData.venue,
          city: eventData.city,
          slug: eventData.slug,
        }}
        eventId={event.id}
      />
    </div>
  )
}
