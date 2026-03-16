"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import FormModal from "@/components/FormModal"
import DeleteConfirm from "@/components/DeleteConfirm"
import VendorForm from "./VendorForm"
import { formatCurrency } from "@/lib/format"

interface Vendor {
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

interface VendorListProps {
  vendors: Vendor[]
  eventId: string
}

const EMPTY_VENDOR = {
  business_name: "",
  category: "",
  contact_name: "",
  phone: "",
  email: "",
  contract_amount: 0,
  deposit_paid: 0,
  status: "contacted",
  notes: "",
}

const STATUS_COLORS: Record<string, string> = {
  contacted: "bg-gray-100 text-gray-700",
  quoted: "bg-blue-100 text-blue-700",
  booked: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  completed: "bg-purple-100 text-purple-700",
}

const CATEGORY_LABELS: Record<string, string> = {
  venue: "Venue",
  catering: "Catering",
  photo_video: "Photo & Video",
  flowers: "Flowers",
  music: "Music",
  cake: "Cake",
  attire: "Attire",
  invitations: "Invitations",
  transport: "Transport",
  decor: "Decor",
  coordination: "Coordination",
  other: "Other",
}

export default function VendorList({ vendors, eventId }: VendorListProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [form, setForm] = useState(EMPTY_VENDOR)
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  const filtered = vendors.filter((v) => {
    const matchesSearch = v.business_name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || v.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_VENDOR)
    setShowModal(true)
  }

  const openEdit = (vendor: Vendor) => {
    setEditing(vendor)
    setForm({
      business_name: vendor.business_name,
      category: vendor.category || "",
      contact_name: vendor.contact_name || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      contract_amount: vendor.contract_amount || 0,
      deposit_paid: vendor.deposit_paid || 0,
      status: vendor.status || "contacted",
      notes: vendor.notes || "",
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/vendors/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      } else {
        await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, ...form }),
        })
      }
      setShowModal(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await fetch(`/api/vendors/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setDeleteLoading(false)
    }
  }

  const usedCategories = Array.from(new Set(vendors.map((v) => v.category).filter(Boolean)))

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="input flex-1"
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input sm:w-48"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {usedCategories.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
          ))}
        </select>
        <button className="btn-primary text-sm" onClick={openAdd}>
          + Add vendor
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">
            {vendors.length === 0 ? "No vendors yet" : "No vendors match your filters"}
          </h3>
          <p className="text-sm text-neutral-400 max-w-xs">
            {vendors.length === 0
              ? "Add your first vendor to start tracking suppliers and contracts."
              : "Try adjusting your search or category filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="pb-3 pr-4 font-medium">Business Name</th>
                <th className="pb-3 pr-4 font-medium">Category</th>
                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Contact</th>
                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Phone</th>
                <th className="pb-3 pr-4 font-medium text-right">Contract</th>
                <th className="pb-3 pr-4 font-medium text-right">Paid</th>
                <th className="pb-3 pr-4 font-medium text-right">Balance</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 pr-4 font-medium text-neutral-800">{v.business_name}</td>
                  <td className="py-3 pr-4 text-neutral-500">{CATEGORY_LABELS[v.category] || v.category || "—"}</td>
                  <td className="py-3 pr-4 text-neutral-500 hidden md:table-cell">{v.contact_name || "—"}</td>
                  <td className="py-3 pr-4 text-neutral-500 hidden lg:table-cell">{v.phone || "—"}</td>
                  <td className="py-3 pr-4 text-right text-neutral-700">{formatCurrency(Number(v.contract_amount))}</td>
                  <td className="py-3 pr-4 text-right text-neutral-700">{formatCurrency(Number(v.deposit_paid))}</td>
                  <td className="py-3 pr-4 text-right font-medium text-neutral-800">{formatCurrency(Number(v.balance))}</td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${STATUS_COLORS[v.status] || "bg-gray-100 text-gray-700"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(v)}
                        className="text-neutral-400 hover:text-neutral-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(v)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
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
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Vendor" : "Add Vendor"}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <VendorForm vendor={form} onChange={setForm} />
      </FormModal>

      <DeleteConfirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={deleteTarget?.business_name}
      />
    </>
  )
}
