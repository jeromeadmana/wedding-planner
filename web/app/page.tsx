import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Saya — Plan your event. Feel the saya.",
}

const features = [
  { icon: "👥", title: "Guest Management",     desc: "Import contacts, track RSVPs, manage meal preferences and groups." },
  { icon: "₱",  title: "Budget Tracker",        desc: "Monitor every peso — estimated vs. actual, with category breakdowns." },
  { icon: "🏪", title: "Vendor Manager",        desc: "Track caterers, photographers, florists and all contracts in one place." },
  { icon: "📅", title: "Day-of Timeline",       desc: "Build a minute-by-minute schedule and share it with your team." },
  { icon: "📷", title: "Saya Shots",            desc: "Guests scan a QR and take photos. You reveal them all after the event." },
  { icon: "🌐", title: "Event Website",         desc: "A beautiful page for your event — free subdomain or your own domain." },
]

const eventTypes = [
  { emoji: "💍", label: "Weddings" },
  { emoji: "🌸", label: "Debuts" },
  { emoji: "🎂", label: "Birthdays" },
  { emoji: "🏢", label: "Corporate" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-display font-bold text-neutral-900">Saya</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
            Log in
          </Link>
          <Link href="/login" className="btn-primary text-sm py-2">
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-16 pb-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium mb-6">
          🇵🇭 Built for Filipino celebrations · Scales to any event
        </div>
        <h1 className="text-5xl sm:text-6xl font-display font-bold text-neutral-900 leading-tight">
          Plan your event.{" "}
          <span className="text-brand-600">Feel the saya.</span>
        </h1>
        <p className="mt-6 text-lg text-neutral-500 max-w-xl mx-auto">
          Guests, budget, vendors, photos — all managed from one simple dashboard.
          So you can focus on what matters: the celebration.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/login" className="btn-primary text-base px-7 py-3">
            Start planning — it&apos;s free →
          </Link>
          <p className="text-xs text-neutral-400">Free up to 30 guests · No card required</p>
        </div>

        {/* Event types */}
        <div className="flex items-center justify-center gap-6 mt-10">
          {eventTypes.map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-sm text-neutral-500">
              <span className="text-xl">{t.emoji}</span>
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-neutral-50 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-neutral-900 text-center mb-3">
            Everything you need. <span className="text-brand-600">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-center text-neutral-500 mb-12">One platform to replace your spreadsheets, group chats, and 5 apps.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold text-neutral-800">{f.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-display font-bold text-neutral-900 mb-3">
          Pay only for what you use
        </h2>
        <p className="text-neutral-500 mb-8">
          Start free. Unlock modules as you need them — no bundles, no surprises.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            { name: "Guest Manager", price: "₱149/mo" },
            { name: "Budget Tracker", price: "₱99/mo" },
            { name: "Vendor Manager", price: "₱99/mo" },
            { name: "Event Website", price: "₱199/mo" },
            { name: "Saya Shots", price: "₱299/event" },
            { name: "AI Tools Bundle", price: "₱399/mo" },
          ].map((m) => (
            <div key={m.name} className="rounded-xl border border-neutral-200 p-4">
              <p className="font-medium text-neutral-800">{m.name}</p>
              <p className="text-brand-600 font-semibold mt-1">{m.price}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-400">
          Or get everything for <strong className="text-neutral-600">₱799/mo</strong> — Complete Bundle
        </p>
      </section>

      {/* CTA */}
      <section className="bg-brand-700 px-6 py-16 text-center">
        <h2 className="text-3xl font-display font-bold text-white mb-3">Ready to feel the saya?</h2>
        <p className="text-brand-200 mb-8">Join thousands of couples and organizers across the Philippines.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors">
          Get started for free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-xs text-neutral-400 border-t border-neutral-100">
        © 2025 Saya · Made with 🌸 in the Philippines
      </footer>
    </div>
  )
}
