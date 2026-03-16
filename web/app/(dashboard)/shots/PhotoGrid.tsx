"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import DeleteConfirm from "@/components/DeleteConfirm"

interface Photo {
  id: string
  guest_name: string
  cloudinary_url: string
  thumbnail_url: string
  caption: string | null
  is_visible: boolean
  taken_at: string
}

interface PhotoGridProps {
  sessionId: string
}

export default function PhotoGrid({ sessionId }: PhotoGridProps) {
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [revealingAll, setRevealingAll] = useState(false)

  const fetchPhotos = useCallback(async () => {
    setLoadingPhotos(true)
    try {
      const res = await fetch(`/api/shots/photos?sessionId=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setPhotos(data)
      }
    } finally {
      setLoadingPhotos(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  async function toggleVisibility(photo: Photo) {
    setTogglingId(photo.id)
    try {
      await fetch(`/api/shots/photos/${photo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !photo.is_visible }),
      })
      await fetchPhotos()
    } finally {
      setTogglingId(null)
    }
  }

  function openDelete(photo: Photo) {
    setDeleteTarget(photo)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await fetch(`/api/shots/photos/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteOpen(false)
      setDeleteTarget(null)
      await fetchPhotos()
      router.refresh()
    } finally {
      setDeleteLoading(false)
    }
  }

  async function revealAll() {
    setRevealingAll(true)
    try {
      await fetch("/api/shots/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      await fetchPhotos()
      router.refresh()
    } finally {
      setRevealingAll(false)
    }
  }

  const hasHidden = photos.some((p) => !p.is_visible)

  if (loadingPhotos) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-neutral-400">Loading photos...</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-neutral-400">
          No photos yet. Share the QR code with your guests!
        </p>
      </div>
    )
  }

  return (
    <div>
      {hasHidden && (
        <div className="flex justify-end mb-3">
          <button
            onClick={revealAll}
            disabled={revealingAll}
            className="btn-primary text-xs"
          >
            {revealingAll ? "Revealing..." : "Reveal All"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-neutral-100">
            <img
              src={photo.thumbnail_url}
              alt={`Photo by ${photo.guest_name}`}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-xs text-white font-medium truncate">{photo.guest_name}</p>
              <p className="text-[10px] text-white/70">
                {new Date(photo.taken_at).toLocaleDateString()}
              </p>
            </div>
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggleVisibility(photo)}
                disabled={togglingId === photo.id}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow text-xs hover:bg-white"
                title={photo.is_visible ? "Hide" : "Show"}
              >
                {photo.is_visible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
              <button
                onClick={() => openDelete(photo)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow text-xs text-red-600 hover:bg-white"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
            {!photo.is_visible && (
              <div className="absolute top-1 left-1">
                <span className="badge bg-yellow-100 text-yellow-700 text-[10px]">Hidden</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <DeleteConfirm
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName="this photo"
      />
    </div>
  )
}
