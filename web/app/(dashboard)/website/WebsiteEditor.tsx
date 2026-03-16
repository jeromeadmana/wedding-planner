"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import EventsEditor from "./EventsEditor"
import GalleryManager from "./GalleryManager"

interface WeddingPage {
  id: string
  theme: string
  hero_photo_url: string | null
  our_story_text: string | null
  events_json: unknown[]
  gallery_urls: string[]
  registry_link: string | null
  is_live: boolean
}

interface EventInfo {
  title: string
  date: string | null
  venue: string | null
  city: string | null
  slug: string
}

interface EventItem {
  title: string
  time: string
  venue: string
  address: string
  description: string
}

interface Props {
  page: WeddingPage
  event: EventInfo
  eventId: string
}

const TABS = ["Theme", "Hero", "Story", "Events", "Gallery", "Registry", "Settings"] as const
type Tab = (typeof TABS)[number]

const THEMES = [
  { key: "classic", label: "Classic", bg: "#be185d", accent: "#fce7f3" },
  { key: "beach", label: "Beach", bg: "#0e7490", accent: "#e0f2fe" },
  { key: "garden", label: "Garden", bg: "#15803d", accent: "#dcfce7" },
  { key: "boho", label: "Boho", bg: "#92400e", accent: "#fef3c7" },
  { key: "modern", label: "Modern", bg: "#1e293b", accent: "#f1f5f9" },
]

export default function WebsiteEditor({ page, event, eventId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Theme")
  const [pageData, setPageData] = useState<WeddingPage>(page)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const save = useCallback(
    async (fields: Record<string, unknown>) => {
      setSaving(true)
      setSaved(false)
      try {
        const res = await fetch("/api/website", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, ...fields }),
        })
        if (res.ok) {
          const updated = await res.json()
          setPageData((prev) => ({ ...prev, ...updated }))
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }
      } finally {
        setSaving(false)
      }
    },
    [eventId]
  )

  const debouncedSave = useCallback(
    (fields: Record<string, unknown>) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => save(fields), 500)
    },
    [save]
  )

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (storyTimer.current) clearTimeout(storyTimer.current)
    }
  }, [])

  const handleThemeSelect = (theme: string) => {
    setPageData((prev) => ({ ...prev, theme }))
    debouncedSave({ theme })
  }

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setPageData((prev) => ({ ...prev, hero_photo_url: url }))
          await save({ hero_photo_url: url })
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setUploading(false)
    }
  }

  const handleHeroRemove = () => {
    setPageData((prev) => ({ ...prev, hero_photo_url: null }))
    save({ hero_photo_url: null })
  }

  const handleStoryChange = (text: string) => {
    setPageData((prev) => ({ ...prev, our_story_text: text }))
    if (storyTimer.current) clearTimeout(storyTimer.current)
    storyTimer.current = setTimeout(() => save({ our_story_text: text }), 1000)
  }

  const handleEventsChange = (events: EventItem[]) => {
    setPageData((prev) => ({ ...prev, events_json: events }))
    debouncedSave({ events_json: JSON.stringify(events) })
  }

  const handleGalleryUpdate = (urls: string[]) => {
    setPageData((prev) => ({ ...prev, gallery_urls: urls }))
    debouncedSave({ gallery_urls: urls })
  }

  const handleRegistryBlur = () => {
    save({ registry_link: pageData.registry_link })
  }

  const handlePublishToggle = () => {
    const newValue = !pageData.is_live
    setPageData((prev) => ({ ...prev, is_live: newValue }))
    save({ is_live: newValue })
  }

  const publicUrl = `/e/${event.slug}`

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {saving && <span className="text-sm text-neutral-400">Saving...</span>}
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
        >
          Preview
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-pink-600 text-pink-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {/* THEME TAB */}
        {activeTab === "Theme" && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Choose a Theme</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleThemeSelect(t.key)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    pageData.theme === t.key
                      ? "border-pink-600 shadow-md"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: t.bg }}
                  />
                  <p className="text-sm font-medium text-neutral-700">{t.label}</p>
                  {pageData.theme === t.key && (
                    <span className="badge mt-1 inline-block text-xs">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* HERO TAB */}
        {activeTab === "Hero" && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Hero Photo</h3>
            {pageData.hero_photo_url ? (
              <div>
                <img
                  src={pageData.hero_photo_url}
                  alt="Hero"
                  className="w-full max-h-64 object-cover rounded-lg mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-sm"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleHeroRemove}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center hover:border-neutral-400 transition-colors"
                disabled={uploading}
              >
                {uploading ? (
                  <p className="text-neutral-500">Uploading...</p>
                ) : (
                  <>
                    <p className="text-neutral-500 mb-1">Click to upload a hero photo</p>
                    <p className="text-xs text-neutral-400">
                      This will be displayed at the top of your event page
                    </p>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeroUpload}
              className="hidden"
            />
          </div>
        )}

        {/* STORY TAB */}
        {activeTab === "Story" && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Our Story</h3>
            <textarea
              className="input min-h-[200px] w-full"
              placeholder="Tell your love story... How did you meet? What makes your relationship special?"
              value={pageData.our_story_text ?? ""}
              onChange={(e) => handleStoryChange(e.target.value)}
              onBlur={() => save({ our_story_text: pageData.our_story_text })}
            />
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === "Events" && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Event Schedule</h3>
            <EventsEditor
              events={(Array.isArray(pageData.events_json) ? pageData.events_json : []) as EventItem[]}
              onChange={handleEventsChange}
            />
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === "Gallery" && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Photo Gallery</h3>
            <GalleryManager
              urls={pageData.gallery_urls ?? []}
              eventId={eventId}
              onUpdate={handleGalleryUpdate}
            />
          </div>
        )}

        {/* REGISTRY TAB */}
        {activeTab === "Registry" && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Gift Registry</h3>
            <label className="label">Registry Link</label>
            <input
              type="url"
              className="input w-full"
              placeholder="https://your-registry-link.com"
              value={pageData.registry_link ?? ""}
              onChange={(e) =>
                setPageData((prev) => ({ ...prev, registry_link: e.target.value }))
              }
              onBlur={handleRegistryBlur}
            />
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "Settings" && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Publish Settings</h3>

            <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg mb-6">
              <div>
                <p className="font-medium text-neutral-800">Publish your event page</p>
                <p className="text-sm text-neutral-500">
                  {pageData.is_live
                    ? "Your page is live and visible to guests"
                    : "Your page is not visible to guests yet"}
                </p>
              </div>
              <button
                onClick={handlePublishToggle}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  pageData.is_live ? "bg-green-500" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    pageData.is_live ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              {pageData.is_live ? (
                <span className="badge bg-green-100 text-green-700">Live</span>
              ) : (
                <span className="badge bg-neutral-100 text-neutral-600">Draft</span>
              )}
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg mb-6">
              <p className="text-sm text-neutral-500 mb-1">Public URL</p>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 underline text-sm break-all"
              >
                {typeof window !== "undefined"
                  ? `${window.location.origin}${publicUrl}`
                  : publicUrl}
              </a>
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-500 mb-3">QR Code</p>
              <div className="flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${
                    typeof window !== "undefined"
                      ? encodeURIComponent(`${window.location.origin}${publicUrl}`)
                      : encodeURIComponent(publicUrl)
                  }`}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
