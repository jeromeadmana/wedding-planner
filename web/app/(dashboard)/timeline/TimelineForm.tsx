"use client"

interface TimelineFormData {
  title: string
  time: string
  location: string
  assignee: string
  notes: string
}

interface TimelineFormProps {
  item: TimelineFormData
  onChange: (item: TimelineFormData) => void
}

export default function TimelineForm({ item, onChange }: TimelineFormProps) {
  const update = (field: keyof TimelineFormData, value: string) => {
    onChange({ ...item, [field]: value })
  }

  return (
    <>
      <div>
        <label className="label">Title *</label>
        <input
          className="input"
          required
          value={item.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Time</label>
        <input
          className="input"
          type="time"
          value={item.time}
          onChange={(e) => update("time", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Location</label>
        <input
          className="input"
          value={item.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Assignee</label>
        <input
          className="input"
          value={item.assignee}
          onChange={(e) => update("assignee", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input"
          rows={3}
          value={item.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
    </>
  )
}
