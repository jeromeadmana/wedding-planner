"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import FormModal from "@/components/FormModal"
import DeleteConfirm from "@/components/DeleteConfirm"
import BudgetForm from "./BudgetForm"
import { formatCurrency } from "@/lib/format"

interface BudgetItem {
  id: string
  event_id: string
  vendor_id: string | null
  category: string
  description: string | null
  estimated_cost: number
  actual_cost: number
  paid: boolean
  notes: string | null
  created_at: string
  vendor_name: string | null
}

interface BudgetListProps {
  items: BudgetItem[]
  eventId: string
  vendors: { id: string; business_name: string }[]
}

const EMPTY_FORM = {
  category: "",
  description: "",
  estimated_cost: 0,
  actual_cost: 0,
  vendor_id: "",
  paid: false,
  notes: "",
}

function categoryLabel(cat: string) {
  const labels: Record<string, string> = {
    venue: "Venue",
    catering: "Catering",
    photography: "Photography",
    videography: "Videography",
    flowers: "Flowers",
    music: "Music",
    cake: "Cake",
    attire: "Attire",
    stationery: "Stationery",
    transport: "Transport",
    decor: "Decor",
    favors: "Favors",
    other: "Other",
  }
  return labels[cat] ?? cat
}

export default function BudgetList({ items, eventId, vendors }: BudgetListProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetItem | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BudgetItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [filterCategory, setFilterCategory] = useState("")

  function openAdd() {
    setEditing(null)
    setFormData(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(item: BudgetItem) {
    setEditing(item)
    setFormData({
      category: item.category,
      description: item.description ?? "",
      estimated_cost: Number(item.estimated_cost),
      actual_cost: Number(item.actual_cost),
      vendor_id: item.vendor_id ?? "",
      paid: item.paid,
      notes: item.notes ?? "",
    })
    setModalOpen(true)
  }

  function handleChange(field: string, value: string | number | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        vendor_id: formData.vendor_id || null,
      }
      if (editing) {
        await fetch(`/api/budget/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/budget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, ...payload }),
        })
      }
      setModalOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function togglePaid(item: BudgetItem) {
    await fetch(`/api/budget/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: item.category,
        description: item.description,
        estimated_cost: item.estimated_cost,
        actual_cost: item.actual_cost,
        vendor_id: item.vendor_id,
        paid: !item.paid,
        notes: item.notes,
      }),
    })
    router.refresh()
  }

  function openDelete(item: BudgetItem) {
    setDeleteTarget(item)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await fetch(`/api/budget/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteOpen(false)
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = items.filter((item) => {
    if (filterCategory && item.category !== filterCategory) return false
    return true
  })

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="input max-w-[180px]" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="venue">Venue</option>
          <option value="catering">Catering</option>
          <option value="photography">Photography</option>
          <option value="videography">Videography</option>
          <option value="flowers">Flowers</option>
          <option value="music">Music</option>
          <option value="cake">Cake</option>
          <option value="attire">Attire</option>
          <option value="stationery">Stationery</option>
          <option value="transport">Transport</option>
          <option value="decor">Decor</option>
          <option value="favors">Favors</option>
          <option value="other">Other</option>
        </select>
        <button className="btn-primary text-sm ml-auto" onClick={openAdd}>
          + Add Item
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-neutral-400">
            {items.length === 0 ? "No budget items yet. Add your first expense to start tracking." : "No items match your filter."}
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3 text-right">Estimated</th>
                <th className="px-4 py-3 text-right">Actual</th>
                <th className="px-4 py-3 text-center">Paid</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="px-4 py-3 font-medium text-neutral-800">{categoryLabel(item.category)}</td>
                  <td className="px-4 py-3 text-neutral-500">{item.description ?? "-"}</td>
                  <td className="px-4 py-3 text-neutral-500">{item.vendor_name ?? "-"}</td>
                  <td className="px-4 py-3 text-right text-neutral-700">{formatCurrency(Number(item.estimated_cost))}</td>
                  <td className="px-4 py-3 text-right text-neutral-700">{formatCurrency(Number(item.actual_cost))}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => togglePaid(item)}
                      className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
                        item.paid
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-neutral-300 bg-white text-transparent hover:border-neutral-400"
                      }`}
                    >
                      {item.paid && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => openDelete(item)} className="text-xs text-red-600 hover:underline">
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
        title={editing ? "Edit Budget Item" : "Add Budget Item"}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel={editing ? "Update" : "Add Item"}
      >
        <BudgetForm data={formData} onChange={handleChange} vendors={vendors} />
      </FormModal>

      <DeleteConfirm
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={deleteTarget ? `${categoryLabel(deleteTarget.category)} - ${deleteTarget.description ?? "item"}` : "this item"}
      />
    </>
  )
}
