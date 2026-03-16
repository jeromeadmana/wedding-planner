import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent, formatCurrency } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import BillingManager from "./BillingManager"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Billing" }

interface Subscription {
  id: string
  modules: string[]
  billing_cycle: string
  next_billing_date: string | null
  status: string
}

interface Payment {
  id: string
  amount: number
  currency: string
  module: string
  status: string
  gcash_ref: string | null
  paid_at: string | null
  created_at: string
}

export default async function BillingPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  let [{ rows: subs }, { rows: payments }] = await Promise.all([
    query<Subscription>(
      `SELECT id, modules, billing_cycle, next_billing_date, status
       FROM wp_subscriptions WHERE event_id = $1`,
      [event.id]
    ),
    query<Payment>(
      `SELECT id, amount, currency, module, status, gcash_ref, paid_at, created_at
       FROM wp_payments WHERE event_id = $1
       ORDER BY created_at DESC`,
      [event.id]
    ),
  ])

  let subscription = subs[0] ?? null

  // Auto-create subscription with default modules if none exists
  if (!subscription) {
    const { rows: created } = await query<Subscription>(
      `INSERT INTO wp_subscriptions (event_id, modules)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING id, modules, billing_cycle, next_billing_date, status`,
      [event.id, ["checklist"]]
    )
    subscription = created[0] ?? null

    // In case of race condition, fetch existing
    if (!subscription) {
      const { rows: existing } = await query<Subscription>(
        `SELECT id, modules, billing_cycle, next_billing_date, status
         FROM wp_subscriptions WHERE event_id = $1`,
        [event.id]
      )
      subscription = existing[0] ?? null
    }
  }

  const activeModules = subscription?.modules ?? ["checklist"]
  const hasPaidModules = activeModules.some((m) => m !== "checklist")
  const totalSpent = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div>
      <Header
        title="Billing"
        subtitle="Manage your subscription and view payment history"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Active Modules</p>
          <p className="text-2xl font-semibold text-neutral-800">{activeModules.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Plan</p>
          <p className="text-2xl font-semibold text-neutral-800">{hasPaidModules ? "Pro" : "Free"}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Next Billing</p>
          <p className="text-2xl font-semibold text-neutral-800">
            {subscription?.next_billing_date
              ? new Date(subscription.next_billing_date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
              : "—"}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-400 mb-1">Total Spent</p>
          <p className="text-2xl font-semibold text-neutral-800">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      <BillingManager
        subscription={subscription}
        payments={payments}
        eventId={event.id}
      />
    </div>
  )
}
