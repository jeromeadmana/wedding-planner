import { query } from "@/lib/db"
import { notFound } from "next/navigation"
import CameraCapture from "./CameraCapture"
import type { Metadata } from "next"

interface SessionRow {
  id: string
  session_name: string
  qr_token: string
  is_active: boolean
  event_title: string
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
  if (!session) return { title: "Saya Shots" }
  return { title: `Saya Shots — ${session.event_title}` }
}

export default async function ShotsCapturePage({ params }: Props) {
  const { token } = await params

  const { rows } = await query<SessionRow>(
    `SELECT s.*, e.title AS event_title
     FROM wp_photo_sessions s
     JOIN wp_events e ON s.event_id = e.id
     WHERE s.qr_token = $1`,
    [token]
  )

  const session = rows[0]
  if (!session) return notFound()

  if (!session.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-pink-600 mb-1">Saya Shots</h1>
            <p className="text-sm text-neutral-500">{session.event_title}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-2">Session Closed</h2>
            <p className="text-sm text-neutral-500">
              This photo session is currently closed. Check back later or contact the event organizer.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CameraCapture
      token={token}
      eventTitle={session.event_title}
      sessionName={session.session_name}
    />
  )
}
