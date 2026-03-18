"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Link from "next/link"
import { formatCurrency } from "@/lib/format"

const CATEGORIES = [
  { name: "Venue & Catering", pct: 0.40, icon: "\ud83c\udfdb\ufe0f" },
  { name: "Photography & Video", pct: 0.12, icon: "\ud83d\udcf8" },
  { name: "Flowers & Decor", pct: 0.08, icon: "\ud83d\udc90" },
  { name: "Attire & Beauty", pct: 0.08, icon: "\ud83d\udc57" },
  { name: "Music & Entertainment", pct: 0.06, icon: "\ud83c\udfb5" },
  { name: "Invitations & Stationery", pct: 0.03, icon: "\u2709\ufe0f" },
  { name: "Transportation", pct: 0.03, icon: "\ud83d\ude97" },
  { name: "Miscellaneous", pct: 0.10, icon: "\ud83d\udce6" },
  { name: "Contingency Fund", pct: 0.10, icon: "\ud83d\udee1\ufe0f" },
]

const CITY_MULTIPLIER: Record<string, number> = {
  Manila: 1.3,
  Cebu: 1.1,
  Davao: 1.0,
  Batangas: 0.95,
  Tagaytay: 1.15,
  "Provincial/Other": 0.8,
}

const CITIES = Object.keys(CITY_MULTIPLIER)
const EVENT_TYPES = ["Wedding", "Debut", "Birthday", "Corporate", "Other"]

function getTips(budget: number): string[] {
  if (budget < 300000) {
    return [
      "Consider off-peak dates (weekdays, January\u2013March) for venue discounts.",
      "DIY centerpieces and invitations can save 5\u201310% of your budget.",
      "Ask vendors for package deals that bundle services together.",
      "Prioritize photography \u2014 photos are the lasting memory of your event.",
    ]
  }
  if (budget < 700000) {
    return [
      "You have a solid mid-range budget \u2014 negotiate vendor packages for best value.",
      "Allocate more to photography and videography for premium output.",
      "Consider a Sunday event for 10\u201320% venue savings over Saturday.",
      "Book vendors 6\u201312 months in advance for better rates.",
    ]
  }
  return [
    "With a premium budget, focus on guest experience and personalized touches.",
    "Consider a wedding planner/coordinator to maximize every peso.",
    "Invest in live entertainment \u2014 a band elevates the reception significantly.",
    "Premium catering with a tasting session ensures exceptional food quality.",
  ]
}

export default function BudgetAdvisorPage() {
  const [totalBudget, setTotalBudget] = useState("")
  const [guestCount, setGuestCount] = useState("")
  const [city, setCity] = useState("Manila")
  const [eventType, setEventType] = useState("Wedding")
  const [showResults, setShowResults] = useState(false)

  const budget = Number(totalBudget) || 0
  const guests = Number(guestCount) || 1
  const multiplier = CITY_MULTIPLIER[city] ?? 1
  const perGuestCost = (budget / guests) * multiplier
  const contingency = budget * 0.1

  return (
    <div>
      <Header title="Budget Advisor" subtitle="Smart budget allocation by category" />

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
            <label className="label">Total Budget (\u20b1)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g., 500000"
              value={totalBudget}
              min={0}
              onChange={(e) => setTotalBudget(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="label">Guest Count</label>
            <input
              type="number"
              className="input"
              placeholder="e.g., 150"
              value={guestCount}
              min={1}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="label">City</label>
            <select
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="label">Event Type</label>
            <select
              className="input"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowResults(true)}
            className="btn-primary w-full"
            disabled={budget <= 0}
          >
            Generate Budget Plan
          </button>
        </div>

        {/* Results */}
        {showResults && budget > 0 && (
          <div className="space-y-6">
            {/* Category breakdown */}
            <div className="card">
              <h2 className="font-semibold text-lg mb-4">Category Breakdown</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2"></th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-right">%</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((cat) => (
                    <tr key={cat.name} className="border-b">
                      <td className="py-2">{cat.icon}</td>
                      <td className="py-2">{cat.name}</td>
                      <td className="py-2 text-right">{Math.round(cat.pct * 100)}%</td>
                      <td className="py-2 text-right">
                        {formatCurrency(Math.round(budget * cat.pct))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center">
                <p className="text-sm text-neutral-400 mb-1">Total Budget</p>
                <p className="text-xl font-semibold text-neutral-800">
                  {formatCurrency(budget)}
                </p>
              </div>
              <div className="card text-center">
                <p className="text-sm text-neutral-400 mb-1">Per Guest Cost</p>
                <p className="text-xl font-semibold text-blue-600">
                  {formatCurrency(Math.round(perGuestCost))}
                </p>
              </div>
              <div className="card text-center">
                <p className="text-sm text-neutral-400 mb-1">Contingency</p>
                <p className="text-xl font-semibold text-orange-600">
                  {formatCurrency(Math.round(contingency))}
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <h2 className="font-semibold text-lg mb-3">Tips for Your Budget</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {getTips(budget).map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-500 mt-0.5">&#x2022;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
