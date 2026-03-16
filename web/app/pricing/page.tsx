import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Pricing — Saya" }

const MODULES = [
  { key: "guests", name: "Guest Management", free: "Up to 50 guests", price: 149, icon: "👥" },
  { key: "budget", name: "Budget Tracker", free: "Basic tracking", price: 99, icon: "₱" },
  { key: "vendors", name: "Vendor Management", free: "Up to 5 vendors", price: 99, icon: "🏪" },
  { key: "checklist", name: "Checklist", free: "Basic template", price: 0, icon: "✓" },
  { key: "seating", name: "Seating Planner", free: "Up to 5 tables", price: 149, icon: "🪑" },
  { key: "website", name: "Event Website", free: "Basic theme", price: 199, icon: "🌐" },
  { key: "shots", name: "Saya Shots", free: "50 photos", price: 299, icon: "📷" },
  { key: "ai", name: "AI Tools", free: "—", price: 399, icon: "✨" },
]

const BUNDLE_PRICE = 799

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="text-center pt-16 pb-12 px-4">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="text-3xl">🌸</span>
          <span className="text-2xl font-bold tracking-wide text-brand-700">Saya</span>
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-neutral-500 max-w-xl mx-auto">
          Start planning for free. Upgrade individual modules as you need them, or grab the complete bundle.
        </p>
      </header>

      {/* Pricing Tiers */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-1">Free</h2>
              <p className="text-neutral-500">Everything you need to get started</p>
            </div>
            <p className="text-4xl font-bold text-neutral-900 mb-6">
              ₱0<span className="text-base font-normal text-neutral-400">/forever</span>
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {MODULES.map((m) => (
                <li key={m.key} className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="w-5 text-center">{m.icon}</span>
                  <span className="font-medium text-neutral-800">{m.name}</span>
                  <span className="text-neutral-400 ml-auto">{m.free}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="btn-primary text-center w-full">
              Start Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-white rounded-2xl border-2 border-brand-500 p-8 flex flex-col relative">
            <div className="absolute -top-3 left-8">
              <span className="bg-brand-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-1">Pro Modules</h2>
              <p className="text-neutral-500">Upgrade only what you need</p>
            </div>
            <p className="text-4xl font-bold text-neutral-900 mb-6">
              ₱99<span className="text-base font-normal text-neutral-400">–₱399/mo per module</span>
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {MODULES.filter((m) => m.price > 0).map((m) => (
                <li key={m.key} className="flex items-center gap-3 text-sm text-neutral-600">
                  <span className="w-5 text-center">{m.icon}</span>
                  <span className="font-medium text-neutral-800">{m.name}</span>
                  <span className="text-brand-700 font-semibold ml-auto">₱{m.price}/mo</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="btn-primary text-center w-full">
              Start Free
            </Link>
          </div>
        </div>

        {/* Bundle Card */}
        <div className="bg-gradient-to-r from-brand-700 to-pink-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">Complete Bundle</h3>
          <p className="text-white/80 mb-4">All modules included — the best value for your wedding</p>
          <p className="text-5xl font-bold mb-1">
            ₱{BUNDLE_PRICE.toLocaleString()}<span className="text-lg font-normal text-white/70">/mo</span>
          </p>
          <p className="text-sm text-white/60 mb-6">
            Save over ₱{(MODULES.reduce((s, m) => s + m.price, 0) - BUNDLE_PRICE).toLocaleString()} compared to individual modules
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-white text-brand-700 font-semibold hover:bg-white/90 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-12 text-sm text-neutral-400">
        <p>© 2025 Saya. All rights reserved.</p>
      </footer>
    </div>
  )
}
