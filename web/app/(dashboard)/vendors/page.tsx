import Header from "@/components/Header"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Vendors" }

// Phase 2: will be wired to real DB (wp_vendors)
export default function VendorsPage() {
  return (
    <div>
      <Header
        title="Vendors"
        subtitle="Track all your suppliers and contracts"
        action={
          <button className="btn-primary text-sm">+ Add vendor</button>
        }
      />

      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">🏪</span>
        <h3 className="text-lg font-semibold text-neutral-700 mb-1">Vendor manager coming in Phase 2</h3>
        <p className="text-sm text-neutral-400 max-w-xs">
          Track caterers, photographers, florists, and all suppliers with contract amounts and payment status.
        </p>
        <Link href="/dashboard" className="btn-secondary mt-6 text-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
