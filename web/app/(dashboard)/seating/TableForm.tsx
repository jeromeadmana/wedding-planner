"use client"

interface TableFormData {
  name: string
  capacity: number
  notes: string
}

interface TableFormProps {
  data: TableFormData
  onChange: (data: TableFormData) => void
}

export default function TableForm({ data, onChange }: TableFormProps) {
  return (
    <>
      <div>
        <label className="label">Table Name *</label>
        <input
          className="input w-full"
          required
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g., Table 1, VIP Table, Family Table"
        />
      </div>
      <div>
        <label className="label">Capacity</label>
        <input
          type="number"
          className="input w-full"
          min={1}
          max={50}
          value={data.capacity}
          onChange={(e) => onChange({ ...data, capacity: parseInt(e.target.value) || 8 })}
        />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input w-full"
          rows={3}
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          placeholder="Optional notes about this table"
        />
      </div>
    </>
  )
}
