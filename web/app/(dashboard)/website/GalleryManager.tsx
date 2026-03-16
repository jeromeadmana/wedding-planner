"use client"

import { useState, useRef } from "react"

interface Props {
  urls: string[]
  eventId: string
  onUpdate: (urls: string[]) => void
}

export default function GalleryManager({ urls, eventId, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const res = await fetch("/api/website/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, image: base64 }),
        })
        if (res.ok) {
          const { url } = await res.json()
          onUpdate([...urls, url])
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setUploading(false)
    }

    // Reset input so the same file can be selected again
    e.target.value = ""
  }

  const removePhoto = (index: number) => {
    onUpdate(urls.filter((_, i) => i !== index))
  }

  return (
    <div>
      {/* Upload dropzone */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors mb-4"
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-neutral-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-neutral-500">Uploading...</span>
          </div>
        ) : (
          <>
            <p className="text-neutral-500 mb-1">Click to upload a photo</p>
            <p className="text-xs text-neutral-400">Add photos to your event gallery</p>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Gallery grid */}
      {urls.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-4">
          No photos yet. Upload photos to showcase your event.
        </p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {urls.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`Gallery photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
