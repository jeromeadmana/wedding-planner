"use client"

interface ChecklistFormData {
  title: string
  category: string
  due_date: string
  notes: string
}

interface ChecklistFormProps {
  data: ChecklistFormData
  onChange: (data: ChecklistFormData) => void
}

const CATEGORIES = [
  "12 months before",
  "9 months before",
  "6 months before",
  "3 months before",
  "1 month before",
  "1 week before",
  "Day of",
  "Other",
]

export default function ChecklistForm({ data, onChange }: ChecklistFormProps) {
  function update(field: keyof ChecklistFormData, value: string) {
    onChange({ ...data, [field]: value })
  }

  return (
    <>
      <div>
        <label className="label">Title *</label>
        <input
          className="input"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Category</label>
        <select
          className="input"
          value={data.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Due Date</label>
        <input
          type="date"
          className="input"
          value={data.due_date}
          onChange={(e) => update("due_date", e.target.value)}
        />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input"
          rows={3}
          value={data.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
    </>
  )
}
