import Header from "@/components/Header"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Budget" }

// Phase 2: will be wired to real DB (wp_budget_items)
export default function BudgetPage() {
  return (
    <div>
      <Header
        title="Budget Tracker"
        subtitle="Monitor your event expenses"
        action={
          <button className="btn-primary text-sm">+ Add item</button>
        }
      />

      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">₱</span>
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">Budget tracker coming in Phase 2</h3>
        <p className="text-sm text-neutral-400 max-w-xs">
          Track estimated vs. actual costs per category, mark items as paid, and export reports.
        </p>
        <Link href="/dashboard" className="btn-secondary mt-6 text-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
