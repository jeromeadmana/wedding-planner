"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"
import { formatCurrency } from "@/lib/format"

interface DrinkResult {
  item: string
  quantity: number
  unit: string
  cost: number
}

const DRINK_TYPES = ["Beer", "Wine", "Cocktails", "Non-Alcoholic"] as const

export default function DrinksCalculatorPage() {
  const [guestCount, setGuestCount] = useState(100)
  const [duration, setDuration] = useState(4)
  const [selectedDrinks, setSelectedDrinks] = useState<Set<string>>(
    new Set(DRINK_TYPES)
  )
  const [results, setResults] = useState<DrinkResult[] | null>(null)

  function toggleDrink(drink: string) {
    setSelectedDrinks((prev) => {
      const next = new Set(prev)
      if (next.has(drink)) {
        next.delete(drink)
      } else {
        next.add(drink)
      }
      return next
    })
  }

  function calculate() {
    const items: DrinkResult[] = []

    if (selectedDrinks.has("Beer")) {
      const totalDrinks = guestCount * 1 * duration
      const cases = Math.ceil(totalDrinks / 24)
      items.push({ item: "Beer", quantity: cases, unit: "cases (24 bottles)", cost: cases * 850 })
    }

    if (selectedDrinks.has("Wine")) {
      const totalGlasses = guestCount * 0.5 * duration
      const bottles = Math.ceil(totalGlasses / 5)
      items.push({ item: "Wine", quantity: bottles, unit: "bottles", cost: bottles * 500 })
    }

    if (selectedDrinks.has("Cocktails")) {
      const totalDrinks = guestCount * 0.3 * duration
      const bottles = Math.ceil(totalDrinks / 16)
      items.push({ item: "Cocktail Spirits", quantity: bottles, unit: "bottles", cost: bottles * 800 })
    }

    if (selectedDrinks.has("Non-Alcoholic")) {
      const totalDrinks = guestCount * 2
      const cases = Math.ceil(totalDrinks / 24)
      items.push({ item: "Soda / Juice", quantity: cases, unit: "cases (24 cans)", cost: cases * 400 })
    }

    // Ice: always included
    const iceKg = Math.ceil(guestCount * 0.5)
    items.push({ item: "Ice", quantity: iceKg, unit: "kg", cost: iceKg * 15 })

    setResults(items)
  }

  const totalCost = results?.reduce((sum, r) => sum + r.cost, 0) ?? 0

  return (
    <div>
      <Header title="Drinks Calculator" subtitle="Calculate exact quantities for your event" />

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
            <label className="label">Guest Count</label>
            <input
              type="number"
              className="input"
              value={guestCount}
              min={1}
              onChange={(e) => setGuestCount(Number(e.target.value))}
            />
          </div>

          <div className="mb-4">
            <label className="label">Event Duration</label>
            <select
              className="input"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
              <option value={5}>5 hours</option>
              <option value={6}>6 hours</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="label">Drink Types</label>
            <div className="space-y-2">
              {DRINK_TYPES.map((drink) => (
                <label key={drink} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedDrinks.has(drink)}
                    onChange={() => toggleDrink(drink)}
                  />
                  {drink}
                </label>
              ))}
            </div>
          </div>

          <button onClick={calculate} className="btn-primary w-full">
            Calculate
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Results</h2>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Quantity</th>
                  <th className="pb-2">Unit</th>
                  <th className="pb-2 text-right">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.item} className="border-b">
                    <td className="py-2">{r.item}</td>
                    <td className="py-2">{r.quantity}</td>
                    <td className="py-2">{r.unit}</td>
                    <td className="py-2 text-right">{formatCurrency(r.cost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="pt-3" colSpan={3}>
                    Total Estimated Cost
                  </td>
                  <td className="pt-3 text-right">{formatCurrency(totalCost)}</td>
                </tr>
              </tfoot>
            </table>

            <p className="text-xs text-gray-500 mt-4">
              Tip: Buy 10% extra to be safe.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
