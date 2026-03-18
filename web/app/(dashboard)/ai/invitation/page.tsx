"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"

export default function InvitationWriterPage() {
  const router = useRouter()
  const [eventType, setEventType] = useState("Wedding")
  const [names, setNames] = useState("")
  const [date, setDate] = useState("")
  const [venue, setVenue] = useState("")
  const [city, setCity] = useState("")
  const [tone, setTone] = useState("Formal")
  const [language, setLanguage] = useState("English")
  const [style, setStyle] = useState("Classic")
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!names.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/ai/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType, names, date, venue, city, tone, language, style }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data.text)
    } catch {
      setError("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <Header title="Invitation Writer" subtitle="AI-crafted invitations in seconds" />
      <Link href="/ai" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Back to AI Tools
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Event Type</label>
            <select className="input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
              <option>Wedding</option>
              <option>Debut</option>
              <option>Birthday</option>
              <option>Baptism</option>
              <option>Anniversary</option>
              <option>Corporate</option>
            </select>
          </div>

          <div>
            <label className="label">Names *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Maria & Carlo"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., December 14, 2026"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Venue</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., San Agustin Church"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>

          <div>
            <label className="label">City</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Manila"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Tone</label>
            <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Formal</option>
              <option>Semi-Formal</option>
              <option>Casual</option>
              <option>Playful</option>
              <option>Romantic</option>
            </select>
          </div>

          <div>
            <label className="label">Language</label>
            <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>Filipino</option>
              <option>Taglish</option>
            </select>
          </div>

          <div>
            <label className="label">Style</label>
            <select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>
              <option>Classic</option>
              <option>Modern</option>
              <option>Poetic</option>
              <option>Minimalist</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading || !names.trim()}>
            {loading ? "Generating..." : "Generate Invitation"}
          </button>
        </form>

        {/* Result */}
        <div>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg className="animate-spin h-8 w-8 mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p>Writing your invitation...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {result && !loading && (
            <div>
              <div className="card">
                <p className="whitespace-pre-wrap font-serif leading-relaxed">{result}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleCopy} className="btn-secondary">
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
                <button onClick={() => handleSubmit()} className="btn-primary">
                  Regenerate
                </button>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <p>Your invitation will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
