"use client"

import { useState } from "react"

interface Photo {
  id: string
  guest_name: string
  cloudinary_url: string
  thumbnail_url: string
  caption: string | null
  taken_at: string
}

interface GalleryGridProps {
  photos: Photo[]
}

export default function GalleryGrid({ photos }: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [filterGuest, setFilterGuest] = useState("")

  const guestNames = Array.from(new Set(photos.map((p) => p.guest_name))).sort()

  const filtered = filterGuest
    ? photos.filter((p) => p.guest_name === filterGuest)
    : photos

  function getDownloadUrl(url: string) {
    // Cloudinary fl_attachment for download
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/fl_attachment/")
    }
    return url
  }

  return (
    <>
      {/* Guest filter pills */}
      {guestNames.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterGuest("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterGuest === ""
                ? "bg-pink-600 text-white"
                : "bg-white text-neutral-600 hover:bg-pink-50"
            }`}
          >
            All
          </button>
          {guestNames.map((name) => (
            <button
              key={name}
              onClick={() => setFilterGuest(filterGuest === name ? "" : name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterGuest === name
                  ? "bg-pink-600 text-white"
                  : "bg-white text-neutral-600 hover:bg-pink-50"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative group rounded-lg overflow-hidden aspect-square bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <img
              src={photo.thumbnail_url}
              alt={`Photo by ${photo.guest_name}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-xs text-white font-medium truncate">{photo.guest_name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.cloudinary_url}
                alt={`Photo by ${selectedPhoto.guest_name}`}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>

            {/* Info bar */}
            <div className="bg-neutral-900/80 backdrop-blur rounded-b-lg px-4 py-3 mt-2 flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-sm">{selectedPhoto.guest_name}</p>
                {selectedPhoto.caption && (
                  <p className="text-neutral-300 text-xs mt-0.5">{selectedPhoto.caption}</p>
                )}
                <p className="text-neutral-400 text-xs mt-0.5">
                  {new Date(selectedPhoto.taken_at).toLocaleString()}
                </p>
              </div>
              <a
                href={getDownloadUrl(selectedPhoto.cloudinary_url)}
                download
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </a>
            </div>

            {/* Navigation */}
            {filtered.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const idx = filtered.findIndex((p) => p.id === selectedPhoto.id)
                    const prev = idx > 0 ? idx - 1 : filtered.length - 1
                    setSelectedPhoto(filtered[prev])
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const idx = filtered.findIndex((p) => p.id === selectedPhoto.id)
                    const next = idx < filtered.length - 1 ? idx + 1 : 0
                    setSelectedPhoto(filtered[next])
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
