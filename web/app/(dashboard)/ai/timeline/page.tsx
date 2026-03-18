"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"

interface TimelineItem {
  time: string
  title: string
  duration: string
  notes: string
}

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  const period = newH >= 12 ? "PM" : "AM"
  const display = newH === 0 ? 12 : newH > 12 ? newH - 12 : newH
  return `${display}:${String(newM).padStart(2, "0")} ${period}`
}

function generateTimeline(
  ceremonyTime: string,
  ceremonyDuration: number,
  travelTime: number,
  receptionDuration: number,
  includePrep: boolean,
  includePhotos: boolean,
  includeAfterParty: boolean
): TimelineItem[] {
  const items: TimelineItem[] = []
  const [cH, cM] = ceremonyTime.split(":").map(Number)
  const ceremonyMinutes = cH * 60 + cM

  let cursor = ceremonyMinutes

  if (includePrep) {
    const prepStart = ceremonyMinutes - 180
    items.push({
      time: addMinutes("0:00", prepStart),
      title: "Bride/Groom Preparation",
      duration: "2 hours",
      notes: "Hair, makeup, and getting dressed. Stay hydrated and eat a light meal.",
    })
  }

  if (includePhotos) {
    const photoStart = ceremonyMinutes - 60
    items.push({
      time: addMinutes("0:00", photoStart),
      title: "First Look & Photo Session",
      duration: "45 min",
      notes: "Couple photos, bridal party photos, and family portraits.",
    })
  }

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Ceremony",
    duration: `${ceremonyDuration} min`,
    notes: "Processional, vows, ring exchange, and recessional.",
  })
  cursor += ceremonyDuration

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Post-Ceremony Photos",
    duration: "15 min",
    notes: "Family group photos and candid shots with guests.",
  })
  cursor += 15

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Travel to Reception",
    duration: `${travelTime} min`,
    notes: "Coordinate transportation for the bridal party.",
  })
  cursor += travelTime

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Cocktail Hour",
    duration: "1 hour",
    notes: "Light appetizers and drinks while the venue is set up.",
  })
  cursor += 60

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Grand Entrance",
    duration: "15 min",
    notes: "Introduction of the wedding party and newlyweds.",
  })
  cursor += 15

  items.push({
    time: addMinutes("0:00", cursor),
    title: "First Dance",
    duration: "10 min",
    notes: "The couple's first dance as newlyweds.",
  })
  cursor += 10

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Welcome Toast",
    duration: "10 min",
    notes: "Welcome remarks from the host or best man.",
  })
  cursor += 10

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Dinner Service",
    duration: "1 hour",
    notes: "Main course served. Visit tables to greet guests.",
  })
  cursor += 60

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Speeches & Toasts",
    duration: "30 min",
    notes: "Maid of honor, best man, and parent speeches.",
  })
  cursor += 30

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Cake Cutting",
    duration: "15 min",
    notes: "Cake cutting ceremony and dessert service.",
  })
  cursor += 15

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Bouquet & Garter Toss",
    duration: "15 min",
    notes: "Fun traditions with single guests.",
  })
  cursor += 15

  // Calculate remaining time for open dancing
  const receptionEnd = ceremonyMinutes + ceremonyDuration + 15 + travelTime + receptionDuration * 60
  const dancingMinutes = Math.max(receptionEnd - cursor - 15, 30)

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Open Dancing",
    duration: `${dancingMinutes} min`,
    notes: "DJ or band plays party music. Photo booth opens.",
  })
  cursor += dancingMinutes

  items.push({
    time: addMinutes("0:00", cursor),
    title: "Send-off",
    duration: "15 min",
    notes: "Sparklers, confetti, or bubble send-off. Final farewell!",
  })
  cursor += 15

  if (includeAfterParty) {
    cursor += 30
    items.push({
      time: addMinutes("0:00", cursor),
      title: "After Party",
      duration: "2 hours",
      notes: "Casual celebration with close friends and family.",
    })
  }

  return items
}

export default function TimelineGeneratorPage() {
  const router = useRouter()
  const [ceremonyTime, setCeremonyTime] = useState("14:00")
  const [ceremonyDuration, setCeremonyDuration] = useState(45)
  const [travelTime, setTravelTime] = useState(30)
  const [receptionDuration, setReceptionDuration] = useState(4)
  const [includePrep, setIncludePrep] = useState(true)
  const [includePhotos, setIncludePhotos] = useState(true)
  const [includeAfterParty, setIncludeAfterParty] = useState(false)
  const [timeline, setTimeline] = useState<TimelineItem[] | null>(null)
  const [copying, setCopying] = useState(false)

  function generate() {
    const items = generateTimeline(
      ceremonyTime,
      ceremonyDuration,
      travelTime,
      receptionDuration,
      includePrep,
      includePhotos,
      includeAfterParty
    )
    setTimeline(items)
  }

  async function copyToTimeline(eventId: string) {
    if (!timeline) return
    const ok = confirm(
      `This will add ${timeline.length} items to your timeline. Continue?`
    )
    if (!ok) return

    setCopying(true)
    try {
      for (const item of timeline) {
        await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            time: item.time,
            title: item.title,
            notes: `${item.duration} \u2014 ${item.notes}`,
          }),
        })
      }
      alert("Timeline items added successfully!")
      router.push("/timeline")
    } catch {
      alert("Failed to copy timeline. Please try again.")
    } finally {
      setCopying(false)
    }
  }

  return (
    <div>
      <Header
        title="Timeline Generator"
        subtitle="Generate a minute-by-minute schedule"
      />

      <div className="mb-4">
        <Link href="/ai" className="text-sm text-blue-600 hover:underline">
          &larr; Back to AI Tools
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card">
          <h2 className="font-semibold text-lg mb-4">Event Details</h2>

          <div className="mb-4">
            <label className="label">Ceremony Time</label>
            <input
              type="time"
              className="input"
              value={ceremonyTime}
              onChange={(e) => setCeremonyTime(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="label">Ceremony Duration</label>
            <select
              className="input"
              value={ceremonyDuration}
              onChange={(e) => setCeremonyDuration(Number(e.target.value))}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="label">Travel Time to Reception (minutes)</label>
            <input
              type="number"
              className="input"
              value={travelTime}
              min={0}
              onChange={(e) => setTravelTime(Number(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <label className="label">Reception Duration</label>
            <select
              className="input"
              value={receptionDuration}
              onChange={(e) => setReceptionDuration(Number(e.target.value))}
            >
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
              <option value={5}>5 hours</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="label">Include Sections</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includePrep}
                  onChange={(e) => setIncludePrep(e.target.checked)}
                />
                Preparation
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includePhotos}
                  onChange={(e) => setIncludePhotos(e.target.checked)}
                />
                Photo Session
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={includeAfterParty}
                  onChange={(e) => setIncludeAfterParty(e.target.checked)}
                />
                After Party
              </label>
            </div>
          </div>

          <button onClick={generate} className="btn-primary w-full">
            Generate Timeline
          </button>
        </div>

        {/* Results */}
        {timeline && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Your Schedule</h2>
              <button
                onClick={() => {
                  // We need the eventId from a cookie/session — use the API which handles auth
                  // The eventId is embedded via the page context; for simplicity we fetch it
                  fetch("/api/events/active")
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.id) copyToTimeline(data.id)
                      else alert("No active event found.")
                    })
                    .catch(() => alert("Could not fetch event info."))
                }}
                disabled={copying}
                className="btn-secondary text-sm"
              >
                {copying ? "Copying..." : "Copy to My Timeline"}
              </button>
            </div>

            <div className="relative">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4 pb-6 last:pb-0">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0" />
                    {i < timeline.length - 1 && (
                      <div className="w-0.5 bg-blue-200 flex-1 mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{item.time}</p>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.duration} &mdash; {item.notes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
