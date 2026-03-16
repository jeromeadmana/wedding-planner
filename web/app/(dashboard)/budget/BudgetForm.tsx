"use client"

interface BudgetFormData {
  category: string
  description: string
  estimated_cost: number
  actual_cost: number
  vendor_id: string
  paid: boolean
  notes: string
}

interface BudgetFormProps {
  data: Partial<BudgetFormData>
  onChange: (field: string, value: string | number | boolean) => void
  vendors: { id: string; business_name: string }[]
}

const CATEGORY_OPTIONS = [
  { value: "", label: "Select category..." },
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "flowers", label: "Flowers" },
  { value: "music", label: "Music" },
  { value: "cake", label: "Cake" },
  { value: "attire", label: "Attire" },
  { value: "stationery", label: "Stationery" },
  { value: "transport", label: "Transport" },
  { value: "decor", label: "Decor" },
  { value: "favors", label: "Favors" },
  { value: "other", label: "Other" },
]

export default function BudgetForm({ data, onChange, vendors }: BudgetFormProps) {
  return (
    <>
      <div>
        <label className="label">Category *</label>
        <select
          className="input"
          required
          value={data.category ?? ""}
          onChange={(e) => onChange("category", e.target.value)}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Description</label>
        <input
          className="input"
          value={data.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="e.g. Main reception venue rental"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Estimated Cost</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={data.estimated_cost ?? 0}
            onChange={(e) => onChange("estimated_cost", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="label">Actual Cost</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={data.actual_cost ?? 0}
            onChange={(e) => onChange("actual_cost", parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <div>
        <label className="label">Vendor</label>
        <select
          className="input"
          value={data.vendor_id ?? ""}
          onChange={(e) => onChange("vendor_id", e.target.value)}
        >
          <option value="">No vendor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.business_name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="paid"
          checked={data.paid ?? false}
          onChange={(e) => onChange("paid", e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <label htmlFor="paid" className="text-sm text-neutral-700">Paid</label>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input"
          rows={3}
          value={data.notes ?? ""}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Any additional notes..."
        />
      </div>
    </>
  )
}
