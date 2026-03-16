"use client"

interface EventItem {
  title: string
  time: string
  venue: string
  address: string
  description: string
}

interface Props {
  events: EventItem[]
  onChange: (events: EventItem[]) => void
}

export default function EventsEditor({ events, onChange }: Props) {
  const updateField = (index: number, field: keyof EventItem, value: string) => {
    const updated = events.map((ev, i) =>
      i === index ? { ...ev, [field]: value } : ev
    )
    onChange(updated)
  }

  const addEvent = () => {
    onChange([
      ...events,
      { title: "", time: "", venue: "", address: "", description: "" },
    ])
  }

  const removeEvent = (index: number) => {
    onChange(events.filter((_, i) => i !== index))
  }

  return (
    <div>
      {events.length === 0 && (
        <p className="text-sm text-neutral-500 mb-4">
          No events added yet. Add your ceremony, reception, and other events.
        </p>
      )}

      <div className="space-y-4">
        {events.map((ev, index) => (
          <div key={index} className="p-4 border border-neutral-200 rounded-lg relative">
            <button
              onClick={() => removeEvent(index)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-red-500 text-lg leading-none"
              title="Remove event"
            >
              &times;
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
              <div>
                <label className="label">Title</label>
                <input
                  className="input w-full"
                  placeholder="e.g., Ceremony, Reception"
                  value={ev.title}
                  onChange={(e) => updateField(index, "title", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Time</label>
                <input
                  className="input w-full"
                  placeholder="e.g., 2:00 PM"
                  value={ev.time}
                  onChange={(e) => updateField(index, "time", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Venue</label>
                <input
                  className="input w-full"
                  placeholder="e.g., San Agustin Church"
                  value={ev.venue}
                  onChange={(e) => updateField(index, "venue", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  className="input w-full"
                  placeholder="e.g., Intramuros, Manila"
                  value={ev.address}
                  onChange={(e) => updateField(index, "address", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="label">Description</label>
              <textarea
                className="input w-full"
                placeholder="Optional details..."
                rows={2}
                value={ev.description}
                onChange={(e) => updateField(index, "description", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={addEvent} className="btn-secondary text-sm mt-4">
        + Add Event
      </button>
    </div>
  )
}
