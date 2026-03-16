"use client"

import { formatCurrency } from "@/lib/format"

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

interface BillingManagerProps {
  subscription: Subscription | null
  payments: Payment[]
  eventId: string
}

export default function BillingManager({ subscription, payments, eventId }: BillingManagerProps) {
  const activeModules = subscription?.modules ?? ["checklist"]

  function handleUpgrade(moduleKey: string) {
    alert("PayMongo integration coming soon. Stay tuned!")
  }

  function handleBundle() {
    alert("PayMongo integration coming soon. Stay tuned!")
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Module Manager */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MODULES.map((mod) => {
            const isActive = activeModules.includes(mod.key)
            const isFree = mod.price === 0

            return (
              <div key={mod.key} className="card flex flex-col items-center text-center">
                <span className="text-3xl mb-2">{mod.icon}</span>
                <h3 className="font-medium text-neutral-900 text-sm mb-1">{mod.name}</h3>
                <p className="text-xs text-neutral-400 mb-3">{mod.free}</p>

                {isActive ? (
                  <span className="badge bg-green-100 text-green-700">Active</span>
                ) : isFree ? (
                  <span className="badge bg-neutral-100 text-neutral-500">Free</span>
                ) : (
                  <button
                    onClick={() => handleUpgrade(mod.key)}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Upgrade — {formatCurrency(mod.price)}/mo
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 text-center">
          <button onClick={handleBundle} className="btn-primary">
            Get Complete Bundle — {formatCurrency(BUNDLE_PRICE)}/mo
          </button>
        </div>
      </div>

      {/* Section 2: Payment History */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment History</h2>

        {payments.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-neutral-400">No payments yet</p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">Date</th>
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">Module</th>
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">Amount</th>
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">Status</th>
                  <th className="text-left font-medium text-neutral-500 px-6 py-3">GCash Ref</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-6 py-3 text-neutral-700">
                      {new Date(payment.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-neutral-700 capitalize">{payment.module}</td>
                    <td className="px-6 py-3 text-neutral-700">{formatCurrency(Number(payment.amount))}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`badge ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-neutral-400">{payment.gcash_ref ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
