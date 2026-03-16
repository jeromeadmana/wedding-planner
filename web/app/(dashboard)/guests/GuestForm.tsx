"use client"

interface Guest {
  id?: string
  name: string
  email: string
  phone: string
  group_tag: string
  meal_pref: string
  plus_one: boolean
  notes: string
}

interface GuestFormProps {
  guest?: Guest
  onChange: (field: string, value: string | boolean) => void
  data: Partial<Guest>
}

const GROUP_OPTIONS = [
  { value: "", label: "Select group..." },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "work", label: "Work" },
  { value: "vip", label: "VIP" },
  { value: "ninongs_ninangs", label: "Ninongs / Ninangs" },
  { value: "other", label: "Other" },
]

export default function GuestForm({ onChange, data }: GuestFormProps) {
  return (
    <>
      <div>
        <label className="label">Name *</label>
        <input
          className="input"
          required
          value={data.name ?? ""}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Full name"
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={data.email ?? ""}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className="label">Phone</label>
        <input
          className="input"
          value={data.phone ?? ""}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+63 9xx xxx xxxx"
        />
      </div>
      <div>
        <label className="label">Group</label>
        <select
          className="input"
          value={data.group_tag ?? ""}
          onChange={(e) => onChange("group_tag", e.target.value)}
        >
          {GROUP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Meal Preference</label>
        <input
          className="input"
          value={data.meal_pref ?? ""}
          onChange={(e) => onChange("meal_pref", e.target.value)}
          placeholder="e.g. Vegetarian, Halal"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="plus_one"
          checked={data.plus_one ?? false}
          onChange={(e) => onChange("plus_one", e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <label htmlFor="plus_one" className="text-sm text-neutral-700">Plus one</label>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input"
          rows={3}
          value={data.notes ?? ""}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Any special notes..."
        />
      </div>
    </>
  )
}
