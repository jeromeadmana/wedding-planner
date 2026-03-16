import { query } from "@/lib/db"
import { notFound } from "next/navigation"
import GalleryGrid from "./GalleryGrid"
import type { Metadata } from "next"

interface SessionRow {
  id: string
  session_name: string
  qr_token: string
  reveal_at: string | null
  event_title: string
}

interface Photo {
  id: string
  guest_name: string
  cloudinary_url: string
  thumbnail_url: string
  caption: string | null
  taken_at: string
}

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const { rows } = await query<SessionRow>(
    `SELECT s.*, e.title AS event_title
     FROM wp_photo_sessions s
     JOIN wp_events e ON s.event_id = e.id
     WHERE s.qr_token = $1`,
    [token]
  )
  const session = rows[0]
  if (!session) return { title: "Gallery — Saya Shots" }
  return { title: `Gallery — ${session.event_title} — Saya Shots` }
}

export default async function GalleryPage({ params }: Props) {
  const { token } = await params

  const { rows: sessions } = await query<SessionRow>(
    `SELECT s.*, e.title AS event_title
     FROM wp_photo_sessions s
     JOIN wp_events e ON s.event_id = e.id
     WHERE s.qr_token = $1`,
    [token]
  )

  const session = sessions[0]
  if (!session) return notFound()

  // Check if photos are revealed
  const isRevealed = session.reveal_at && new Date(session.reveal_at) <= new Date()

  // Also check if any photos are individually visible
  const { rows: visibleCheck } = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM wp_photos WHERE session_id = $1 AND is_visible = true`,
    [session.id]
  )
  const hasVisiblePhotos = visibleCheck[0]?.count > 0

  if (!isRevealed && !hasVisiblePhotos) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-pink-600 mb-1">Saya Shots</h1>
            <p className="text-sm text-neutral-500">{session.event_title}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-2">Photos Coming Soon</h2>
            <p className="text-sm text-neutral-500 mb-4">
              Photos will be available soon! Check back after the event.
            </p>
            {session.reveal_at && (
              <div className="bg-pink-50 rounded-lg p-3">
                <p className="text-xs text-pink-600 font-medium">
                  Photos reveal at: {new Date(session.reveal_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <div className="mt-6">
            <a
              href={`/shots/${token}`}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              Take more photos
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Fetch visible photos
  const { rows: photos } = await query<Photo>(
    `SELECT id, guest_name, cloudinary_url, thumbnail_url, caption, taken_at
     FROM wp_photos
     WHERE session_id = $1 AND is_visible = true
     ORDER BY taken_at DESC`,
    [session.id]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 px-4 py-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-pink-600">Saya Shots</h1>
          <p className="text-sm text-neutral-600">{session.event_title} — {session.session_name}</p>
          <p className="text-xs text-neutral-400 mt-1">{photos.length} photos</p>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-5xl mx-auto p-4">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 text-sm">No photos to display yet.</p>
          </div>
        ) : (
          <GalleryGrid photos={photos} />
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <a
          href={`/shots/${token}`}
          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
        >
          Take more photos
        </a>
      </div>
    </div>
  )
}
