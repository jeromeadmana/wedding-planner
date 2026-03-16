"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import FormModal from "@/components/FormModal"
import DeleteConfirm from "@/components/DeleteConfirm"
import GuestForm from "./GuestForm"

interface Guest {
  id: string
  event_id: string
  name: string
  email: string | null
  phone: string | null
  group_tag: string | null
  meal_pref: string | null
  plus_one: boolean
  notes: string | null
  invited_at: string
  rsvp_status: string | null
  meal_choice: string | null
}

interface GuestListProps {
  guests: Guest[]
  eventId: string
}

const EMPTY_FORM = { name: "", email: "", phone: "", group_tag: "", meal_pref: "", plus_one: false, notes: "" }

function statusBadge(status: string | null) {
  const s = status ?? "pending"
  const colors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    declined: "bg-red-100 text-red-700",
  }
  return (
    <span className={`badge ${colors[s] ?? "bg-neutral-100 text-neutral-600"}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  )
}

function groupLabel(tag: string | null) {
  if (!tag) return ""
  const labels: Record<string, string> = {
    family: "Family",
    friends: "Friends",
    work: "Work",
    vip: "VIP",
    ninongs_ninangs: "Ninongs / Ninangs",
    other: "Other",
  }
  return labels[tag] ?? tag
}

export default function GuestList({ guests, eventId }: GuestListProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Guest | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filterGroup, setFilterGroup] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  function openAdd() {
    setEditing(null)
    setFormData(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(guest: Guest) {
    setEditing(guest)
    setFormData({
      name: guest.name,
      email: guest.email ?? "",
      phone: guest.phone ?? "",
      group_tag: guest.group_tag ?? "",
      meal_pref: guest.meal_pref ?? "",
      plus_one: guest.plus_one,
      notes: guest.notes ?? "",
    })
    setModalOpen(true)
  }

  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/guests/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, ...formData }),
        })
      }
      setModalOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  function openDelete(guest: Guest) {
    setDeleteTarget(guest)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await fetch(`/api/guests/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteOpen(false)
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = guests.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.email?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterGroup && g.group_tag !== filterGroup) return false
    if (filterStatus && (g.rsvp_status ?? "pending") !== filterStatus) return false
    return true
  })

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input max-w-xs"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[160px]" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
          <option value="">All groups</option>
          <option value="family">Family</option>
          <option value="friends">Friends</option>
          <option value="work">Work</option>
          <option value="vip">VIP</option>
          <option value="ninongs_ninangs">Ninongs / Ninangs</option>
          <option value="other">Other</option>
        </select>
        <select className="input max-w-[160px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
        <button className="btn-primary text-sm ml-auto" onClick={openAdd}>
          + Add Guest
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-neutral-400">
            {guests.length === 0 ? "No guests yet. Add your first guest to get started." : "No guests match your filters."}
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Meal Pref</th>
                <th className="px-4 py-3">+1</th>
                <th className="px-4 py-3">RSVP</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="px-4 py-3 font-medium text-neutral-800">{g.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{g.email ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-500">{g.phone ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-500">{groupLabel(g.group_tag) || "-"}</td>
                  <td className="px-4 py-3 text-neutral-500">{g.meal_pref ?? "-"}</td>
                  <td className="px-4 py-3">{g.plus_one ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{statusBadge(g.rsvp_status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(g)} className="text-xs text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => openDelete(g)} className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Guest" : "Add Guest"}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel={editing ? "Update" : "Add Guest"}
      >
        <GuestForm data={formData} onChange={handleChange} />
      </FormModal>

      <DeleteConfirm
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={deleteTarget?.name ?? "this guest"}
      />
    </>
  )
}
