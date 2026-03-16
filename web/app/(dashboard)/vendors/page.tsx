import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getActiveEvent, formatCurrency } from "@/lib/helpers"
import { query } from "@/lib/db"
import Header from "@/components/Header"
import VendorList from "./VendorList"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Vendors" }

export default async function VendorsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const event = await getActiveEvent(session.user.id)
  if (!event) redirect("/events/new")

  interface VendorRow {
    id: string
    event_id: string
    category: string
    business_name: string
    contact_name: string
    phone: string
    email: string
    contract_amount: number
    deposit_paid: number
    balance: number
    status: string
    notes: string
    created_at: string
  }

  const { rows: vendors } = await query<VendorRow>(
    `SELECT v.*
     FROM wp_vendors v
     JOIN wp_events e ON v.event_id = e.id
     WHERE v.event_id = $1 AND e.user_id = $2
     ORDER BY v.created_at DESC`,
    [event.id, session.user.id]
  )

  const totalContracts = vendors.reduce((sum, v) => sum + Number(v.contract_amount || 0), 0)
  const totalPaid = vendors.reduce((sum, v) => sum + Number(v.deposit_paid || 0), 0)
  const totalBalance = vendors.reduce((sum, v) => sum + Number(v.balance || 0), 0)

  return (
    <div>
      <Header
        title="Vendors"
        subtitle="Track all your suppliers and contracts"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-sm text-neutral-500">Total Vendors</p>
          <p className="text-2xl font-semibold text-neutral-800 mt-1">{vendors.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-500">Total Contracts</p>
          <p className="text-2xl font-semibold text-neutral-800 mt-1">{formatCurrency(totalContracts)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-500">Total Paid</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-neutral-500">Outstanding Balance</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      <VendorList vendors={vendors} eventId={event.id} />
    </div>
  )
}
