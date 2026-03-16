"use client"

interface Vendor {
  id?: string
  business_name: string
  category: string
  contact_name: string
  phone: string
  email: string
  contract_amount: number
  deposit_paid: number
  status: string
  notes: string
}

interface VendorFormProps {
  vendor: Vendor
  onChange: (vendor: Vendor) => void
}

const CATEGORIES = [
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "photo_video", label: "Photo & Video" },
  { value: "flowers", label: "Flowers" },
  { value: "music", label: "Music" },
  { value: "cake", label: "Cake" },
  { value: "attire", label: "Attire" },
  { value: "invitations", label: "Invitations" },
  { value: "transport", label: "Transport" },
  { value: "decor", label: "Decor" },
  { value: "coordination", label: "Coordination" },
  { value: "other", label: "Other" },
]

const STATUSES = [
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "booked", label: "Booked" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
]

export default function VendorForm({ vendor, onChange }: VendorFormProps) {
  const update = (field: keyof Vendor, value: string | number) => {
    onChange({ ...vendor, [field]: value })
  }

  return (
    <>
      <div>
        <label className="label">Business Name *</label>
        <input
          className="input"
          required
          value={vendor.business_name}
          onChange={(e) => update("business_name", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Category</label>
        <select
          className="input"
          value={vendor.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Contact Name</label>
        <input
          className="input"
          value={vendor.contact_name}
          onChange={(e) => update("contact_name", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <input
            className="input"
            value={vendor.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={vendor.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Contract Amount</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={vendor.contract_amount || ""}
            onChange={(e) => update("contract_amount", Number(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label">Deposit Paid</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={vendor.deposit_paid || ""}
            onChange={(e) => update("deposit_paid", Number(e.target.value) || 0)}
          />
        </div>
      </div>
      <div>
        <label className="label">Status</label>
        <select
          className="input"
          value={vendor.status}
          onChange={(e) => update("status", e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input"
          rows={3}
          value={vendor.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
    </>
  )
}
