"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Guest {
  id: string
  name: string
  group_tag: string | null
}

interface Table {
  id: string
  name: string
  capacity: number
}

interface TableAssignment {
  table: Table
  guests: Guest[]
  remaining: number
}

interface SeatingOptimizerProps {
  guests: Guest[]
  tables: Table[]
  eventId: string
}

// Simple deterministic color for group tags
function groupColor(tag: string): string {
  const colors = [
    "bg-blue-400",
    "bg-green-400",
    "bg-purple-400",
    "bg-pink-400",
    "bg-yellow-400",
    "bg-red-400",
    "bg-indigo-400",
    "bg-teal-400",
    "bg-orange-400",
    "bg-cyan-400",
  ]
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function optimizeSeating(
  guests: Guest[],
  tables: Table[]
): { assignments: TableAssignment[]; overflow: Guest[] } {
  // 1. Group guests by group_tag
  const groups = new Map<string, Guest[]>()
  for (const guest of guests) {
    const tag = guest.group_tag || "Ungrouped"
    if (!groups.has(tag)) groups.set(tag, [])
    groups.get(tag)!.push(guest)
  }

  // 2. Sort groups by size descending (but put "Ungrouped" last)
  const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
    if (a[0] === "Ungrouped") return 1
    if (b[0] === "Ungrouped") return -1
    return b[1].length - a[1].length
  })

  // 3. Create table assignment map
  const tableMap: TableAssignment[] = tables.map((t) => ({
    table: t,
    guests: [],
    remaining: t.capacity,
  }))

  const overflow: Guest[] = []

  // 4. Assign each group
  for (const [, groupGuests] of sortedGroups) {
    let toAssign = [...groupGuests]

    while (toAssign.length > 0) {
      // Find table with enough space — prefer exact fit
      let best: TableAssignment | null = null
      let bestDiff = Infinity

      for (const ta of tableMap) {
        if (ta.remaining >= toAssign.length) {
          const diff = ta.remaining - toAssign.length
          if (diff < bestDiff) {
            bestDiff = diff
            best = ta
          }
        }
      }

      if (best) {
        // Entire group fits
        best.guests.push(...toAssign)
        best.remaining -= toAssign.length
        toAssign = []
      } else {
        // No table fits entire remaining group — find table with most space
        let largest: TableAssignment | null = null
        for (const ta of tableMap) {
          if (ta.remaining > 0 && (!largest || ta.remaining > largest.remaining)) {
            largest = ta
          }
        }

        if (largest) {
          const batch = toAssign.splice(0, largest.remaining)
          largest.guests.push(...batch)
          largest.remaining -= batch.length
        } else {
          // No space left at all
          overflow.push(...toAssign)
          toAssign = []
        }
      }
    }
  }

  return { assignments: tableMap, overflow }
}

export default function SeatingOptimizer({
  guests,
  tables,
  eventId,
}: SeatingOptimizerProps) {
  const router = useRouter()
  const [result, setResult] = useState<{
    assignments: TableAssignment[]
    overflow: Guest[]
  } | null>(null)
  const [applying, setApplying] = useState(false)

  if (guests.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Add guests first to use the optimizer.</p>
      </div>
    )
  }

  if (tables.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Add tables in the Seating page first.</p>
      </div>
    )
  }

  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0)
  const overCapacity = guests.length > totalCapacity

  function handleOptimize() {
    const r = optimizeSeating(guests, tables)
    setResult(r)
  }

  async function handleApply() {
    if (!result) return
    setApplying(true)
    try {
      let count = 0
      for (const ta of result.assignments) {
        for (const guest of ta.guests) {
          await fetch("/api/seating/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tableId: ta.table.id,
              guestId: guest.id,
            }),
          })
          count++
        }
      }
      alert(`Applied ${count} assignments!`)
      router.refresh()
    } catch {
      alert("Failed to apply assignments. Please try again.")
    } finally {
      setApplying(false)
    }
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Guests</p>
          <p className="text-2xl font-semibold text-neutral-800">{guests.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Tables</p>
          <p className="text-2xl font-semibold text-neutral-800">{tables.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Total Capacity</p>
          <p className="text-2xl font-semibold text-neutral-800">{totalCapacity}</p>
        </div>
      </div>

      {overCapacity && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-yellow-800">
          Warning: You have {guests.length} guests but only {totalCapacity} seats.{" "}
          {guests.length - totalCapacity} guest(s) will remain unassigned.
        </div>
      )}

      {!result && (
        <button onClick={handleOptimize} className="btn-primary">
          Optimize Seating
        </button>
      )}

      {result && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={handleOptimize} className="btn-secondary">
              Re-optimize
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="btn-primary"
            >
              {applying ? "Applying..." : "Apply Seating Assignments"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {result.assignments.map((ta) => (
              <div key={ta.table.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{ta.table.name}</h3>
                  <span className="badge">
                    {ta.guests.length}/{ta.table.capacity}
                  </span>
                </div>
                {ta.guests.length === 0 ? (
                  <p className="text-xs text-gray-400">No guests assigned</p>
                ) : (
                  <ul className="space-y-1">
                    {ta.guests.map((g) => (
                      <li key={g.id} className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            g.group_tag
                              ? groupColor(g.group_tag)
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="truncate">{g.name}</span>
                        {g.group_tag && (
                          <span className="text-xs text-gray-400 truncate">
                            {g.group_tag}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {result.overflow.length > 0 && (
            <div className="card mt-6">
              <h3 className="font-semibold mb-3 text-red-600">
                Unassigned Guests ({result.overflow.length})
              </h3>
              <ul className="space-y-1">
                {result.overflow.map((g) => (
                  <li key={g.id} className="text-sm text-gray-600">
                    {g.name}
                    {g.group_tag && (
                      <span className="text-xs text-gray-400 ml-2">
                        {g.group_tag}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
