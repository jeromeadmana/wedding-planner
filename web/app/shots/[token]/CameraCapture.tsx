"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface CameraCaptureProps {
  token: string
  eventTitle: string
  sessionName: string
}

export default function CameraCapture({ token, eventTitle, sessionName }: CameraCaptureProps) {
  const [guestName, setGuestName] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [photoCount, setPhotoCount] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [lastPhoto, setLastPhoto] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraSupported, setCameraSupported] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("saya_shots_name")
    if (saved) setGuestName(saved)
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
      setCameraSupported(true)
    } catch {
      setCameraSupported(false)
    }
  }, [])

  useEffect(() => {
    if (guestName) {
      startCamera()
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [guestName, startCamera])

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) return
    localStorage.setItem("saya_shots_name", trimmed)
    setGuestName(trimmed)
  }

  async function uploadImage(base64: string) {
    if (photoCount >= 20) {
      setError("You've reached the photo limit!")
      return
    }
    setUploading(true)
    setError(null)
    try {
      const res = await fetch("/api/shots/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_token: token,
          guest_name: guestName,
          image: base64,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload failed")
      }
      const data = await res.json()
      setLastPhoto(data.thumbnail_url)
      setPhotoCount((c) => c + 1)
      setTimeout(() => setLastPhoto(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  function captureFromCamera() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL("image/jpeg", 0.8)
    uploadImage(base64)
  }

  function handleFileCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      uploadImage(base64)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  function changeName() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    setCameraActive(false)
    setGuestName("")
    setNameInput("")
    localStorage.removeItem("saya_shots_name")
  }

  // Name entry screen
  if (!guestName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-pink-600 mb-1">Saya Shots</h1>
            <p className="text-neutral-600 text-lg">{eventTitle}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              Join {eventTitle}
            </h2>
            <p className="text-sm text-neutral-500 mb-6">Enter your name to start taking photos</p>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-neutral-800 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent mb-4"
                placeholder="Your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
                required
              />
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-pink-600 text-white font-semibold text-base hover:bg-pink-700 transition-colors"
              >
                Start Capturing
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Camera screen
  const limitReached = photoCount >= 20

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900/95 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-neutral-800">
        <div>
          <h1 className="text-white font-semibold text-sm">{sessionName}</h1>
          <p className="text-neutral-400 text-xs">{guestName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-300 text-sm font-medium">
            {photoCount}/20
          </span>
          <button onClick={changeName} className="text-xs text-pink-400 hover:text-pink-300">
            Change
          </button>
        </div>
      </div>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {cameraSupported && cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-[60vh] object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <p className="text-neutral-400 text-sm mb-2">
              Tap the button below to take a photo
            </p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Upload feedback */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-neutral-600">Uploading...</p>
            </div>
          </div>
        )}

        {lastPhoto && !uploading && (
          <div className="absolute bottom-24 left-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-1">
              <img
                src={lastPhoto}
                alt="Last capture"
                className="w-16 h-16 rounded object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-600 text-white text-sm text-center">
          {error}
        </div>
      )}

      {/* Limit reached */}
      {limitReached && (
        <div className="px-4 py-3 bg-yellow-500 text-white text-sm text-center font-medium">
          You have reached the photo limit!
        </div>
      )}

      {/* Controls */}
      <div className="bg-neutral-900 px-4 py-6 flex items-center justify-center gap-6 border-t border-neutral-800">
        {/* File input (always available) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileCapture}
          className="hidden"
        />

        {cameraSupported && cameraActive ? (
          <>
            {/* Camera capture button */}
            <button
              onClick={captureFromCamera}
              disabled={uploading || limitReached}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-white" />
            </button>
            {/* File picker as alternative */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || limitReached}
              className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center disabled:opacity-40"
              title="Choose from gallery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </button>
          </>
        ) : (
          /* File input as main capture button */
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || limitReached}
            className="w-20 h-20 rounded-full bg-pink-600 flex items-center justify-center disabled:opacity-40 hover:bg-pink-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
        )}
      </div>

      {/* Footer link */}
      <div className="bg-neutral-900 pb-6 text-center">
        <a
          href={`/shots/${token}/gallery`}
          className="text-sm text-pink-400 hover:text-pink-300"
        >
          View all photos
        </a>
      </div>
    </div>
  )
}
