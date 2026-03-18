"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"

export default function SpeechWriterPage() {
  const router = useRouter()
  const [role, setRole] = useState("Best Man")
  const [coupleNames, setCoupleNames] = useState("")
  const [anecdotes, setAnecdotes] = useState("")
  const [tone, setTone] = useState("Heartfelt")
  const [duration, setDuration] = useState("5")
  const [language, setLanguage] = useState("English")
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault()
    if (!coupleNames.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/ai/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, coupleNames, anecdotes, tone, duration, language }),
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

  function renderSpeechText(text: string) {
    const parts = text.split(/(\[pause\])/gi)
    return parts.map((part, i) =>
      part.toLowerCase() === "[pause]" ? (
        <span key={i} className="text-sm text-blue-500 italic">[pause]</span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <div>
      <Header title="Speech Writer" subtitle="AI-powered speeches for any celebration" />
      <Link href="/ai" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Back to AI Tools
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Your Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Best Man</option>
              <option>Maid of Honor</option>
              <option>Father of the Bride</option>
              <option>Mother of the Bride</option>
              <option>Father of the Groom</option>
              <option>Mother of the Groom</option>
              <option>Friend</option>
              <option>Sibling</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="label">Couple/Celebrant Names *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Maria & Carlo"
              value={coupleNames}
              onChange={(e) => setCoupleNames(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Anecdotes</label>
            <textarea
              className="textarea min-h-[120px]"
              placeholder={"Share 2-3 personal stories or memories. The more specific, the better the speech.\n\ne.g., I remember when Carlo first told me about Maria..."}
              value={anecdotes}
              onChange={(e) => setAnecdotes(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Tone</label>
            <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Heartfelt</option>
              <option>Funny</option>
              <option>Formal</option>
              <option>Inspirational</option>
              <option>Nostalgic</option>
            </select>
          </div>

          <div>
            <label className="label">Duration</label>
            <select className="input" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="3">3 minutes</option>
              <option value="5">5 minutes</option>
              <option value="7">7 minutes</option>
              <option value="10">10 minutes</option>
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

          <button type="submit" className="btn-primary w-full" disabled={loading || !coupleNames.trim()}>
            {loading ? "Generating..." : "Generate Speech"}
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
              <p>Writing your speech...</p>
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
                <p className="text-sm text-gray-500 mb-3">
                  ~{duration} minutes ({Math.round(result.split(/\s+/).length)} words)
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{renderSpeechText(result)}</p>
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
              <p>Your speech will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
