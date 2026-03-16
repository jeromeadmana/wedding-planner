"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import FormModal from "@/components/FormModal"
import DeleteConfirm from "@/components/DeleteConfirm"
import PhotoGrid from "./PhotoGrid"

interface Session {
  id: string
  session_name: string
  qr_token: string
  is_active: boolean
  reveal_at: string | null
  photo_count: number
  created_at: string
}

interface SessionListProps {
  sessions: Session[]
  eventId: string
}

const EMPTY_FORM = { session_name: "" }

export default function SessionList({ sessions, eventId }: SessionListProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Session | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function openAdd() {
    setEditing(null)
    setFormData(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(session: Session) {
    setEditing(session)
    setFormData({ session_name: session.session_name })
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/shots/sessions/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch("/api/shots/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, ...formData }),
        })
      }
      setModalOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  function openDelete(session: Session) {
    setDeleteTarget(session)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await fetch(`/api/shots/sessions/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteOpen(false)
      setDeleteTarget(null)
      if (selectedSession === deleteTarget.id) setSelectedSession(null)
      router.refresh()
    } finally {
      setDeleteLoading(false)
    }
  }

  async function toggleActive(session: Session) {
    setTogglingId(session.id)
    try {
      await fetch(`/api/shots/sessions/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !session.is_active }),
      })
      router.refresh()
    } finally {
      setTogglingId(null)
    }
  }

  async function revealAll(sessionId: string) {
    setRevealingId(sessionId)
    try {
      await fetch("/api/shots/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      router.refresh()
    } finally {
      setRevealingId(null)
    }
  }

  function copyLink(qrToken: string, sessionId: string) {
    const url = `${window.location.origin}/shots/${qrToken}`
    navigator.clipboard.writeText(url)
    setCopiedId(sessionId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function getQrUrl(qrToken: string) {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/shots/${qrToken}`
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button className="btn-primary text-sm" onClick={openAdd}>
          + New Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-neutral-400">
            No photo sessions yet. Create your first session to start capturing moments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800">{s.session_name}</h3>
                  <span
                    className={`badge ${
                      s.is_active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-xs text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => openDelete(s)} className="text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-neutral-500">Photos:</span>
                <span className="text-sm font-medium text-neutral-800">{s.photo_count}</span>
              </div>

              <div className="flex justify-center mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getQrUrl(s.qr_token))}`}
                  alt={`QR code for ${s.session_name}`}
                  width={160}
                  height={160}
                  className="rounded-lg border border-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => copyLink(s.qr_token, s.id)}
                  className="btn-secondary text-xs"
                >
                  {copiedId === s.id ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={() => toggleActive(s)}
                  disabled={togglingId === s.id}
                  className="btn-secondary text-xs"
                >
                  {togglingId === s.id ? "..." : s.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => revealAll(s.id)}
                  disabled={revealingId === s.id}
                  className="btn-secondary text-xs"
                >
                  {revealingId === s.id ? "Revealing..." : "Reveal All Photos"}
                </button>
                <button
                  onClick={() =>
                    setSelectedSession(selectedSession === s.id ? null : s.id)
                  }
                  className="btn-primary text-xs"
                >
                  {selectedSession === s.id ? "Hide Photos" : "View Photos"}
                </button>
              </div>

              {selectedSession === s.id && (
                <div className="mt-4 border-t border-neutral-100 pt-4">
                  <PhotoGrid sessionId={s.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Session" : "New Session"}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel={editing ? "Update" : "Create Session"}
      >
        <div>
          <label className="label">Session Name</label>
          <input
            className="input"
            placeholder="e.g. Wedding Day, Reception, After Party"
            value={formData.session_name}
            onChange={(e) => setFormData({ session_name: e.target.value })}
            required
          />
        </div>
      </FormModal>

      <DeleteConfirm
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={deleteTarget?.session_name ?? "this session"}
      />
    </>
  )
}
