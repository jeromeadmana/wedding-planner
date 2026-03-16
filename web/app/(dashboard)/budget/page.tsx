import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent, formatCurrency } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import BudgetList from "./BudgetList"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Budget" }

interface BudgetItem {
  id: string
  event_id: string
  vendor_id: string | null
  category: string
  description: string | null
  estimated_cost: number
  actual_cost: number
  paid: boolean
  notes: string | null
  created_at: string
  vendor_name: string | null
}

interface BudgetStats {
  estimated_total: number
  actual_total: number
  paid_total: number
  remaining: number
}

export default async function BudgetPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  const [{ rows: items }, { rows: vendors }, { rows: stats }] = await Promise.all([
    query<BudgetItem>(
      `SELECT b.id, b.event_id, b.vendor_id, b.category, b.description,
              b.estimated_cost, b.actual_cost, b.paid, b.notes, b.created_at,
              v.business_name AS vendor_name
       FROM wp_budget_items b
       LEFT JOIN wp_vendors v ON b.vendor_id = v.id
       WHERE b.event_id = $1
       ORDER BY b.created_at DESC`,
      [event.id]
    ),
    query<{ id: string; business_name: string }>(
      `SELECT id, business_name FROM wp_vendors WHERE event_id = $1 ORDER BY business_name`,
      [event.id]
    ),
    query<BudgetStats>(
      `SELECT
         COALESCE(SUM(estimated_cost), 0)::numeric AS estimated_total,
         COALESCE(SUM(actual_cost), 0)::numeric AS actual_total,
         COALESCE(SUM(CASE WHEN paid THEN actual_cost ELSE 0 END), 0)::numeric AS paid_total,
         COALESCE(SUM(CASE WHEN NOT paid THEN actual_cost ELSE 0 END), 0)::numeric AS remaining
       FROM wp_budget_items
       WHERE event_id = $1`,
      [event.id]
    ),
  ])

  const s = stats[0] ?? { estimated_total: 0, actual_total: 0, paid_total: 0, remaining: 0 }

  return (
    <div>
      <Header
        title="Budget Tracker"
        subtitle="Monitor your event expenses"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Estimated</p>
          <p className="text-2xl font-semibold text-neutral-800">{formatCurrency(Number(s.estimated_total))}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Actual</p>
          <p className="text-2xl font-semibold text-blue-600">{formatCurrency(Number(s.actual_total))}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Paid</p>
          <p className="text-2xl font-semibold text-green-600">{formatCurrency(Number(s.paid_total))}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Remaining</p>
          <p className="text-2xl font-semibold text-orange-600">{formatCurrency(Number(s.remaining))}</p>
        </div>
      </div>

      <BudgetList items={items} eventId={event.id} vendors={vendors} />
    </div>
  )
}
