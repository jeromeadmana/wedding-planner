"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormModal from "@/components/FormModal"
import DeleteConfirm from "@/components/DeleteConfirm"
import TableForm from "./TableForm"

interface AssignedGuest {
  id: string
  guest_id: string
  guest_name: string
}

interface Table {
  id: string
  name: string
  capacity: number
  notes: string | null
  guests: AssignedGuest[]
}

interface Guest {
  id: string
  name: string
  group_tag: string | null
}

interface TableFormData {
  name: string
  capacity: number
  notes: string
}

interface SeatingBoardProps {
  tables: Table[]
  unseatedGuests: Guest[]
  eventId: string
}

export default function SeatingBoard({ tables, unseatedGuests, eventId }: SeatingBoardProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [deleteTable, setDeleteTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TableFormData>({ name: "", capacity: 8, notes: "" })
  const [dragOverTableId, setDragOverTableId] = useState<string | null>(null)

  const filteredGuests = unseatedGuests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.group_tag && g.group_tag.toLowerCase().includes(search.toLowerCase()))
  )

  function openAdd() {
    setEditingTable(null)
    setFormData({ name: "", capacity: 8, notes: "" })
    setModalOpen(true)
  }

  function openEdit(table: Table) {
    setEditingTable(table)
    setFormData({ name: table.name, capacity: table.capacity, notes: table.notes ?? "" })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingTable) {
        await fetch(`/api/seating/tables/${editingTable.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name, capacity: formData.capacity, notes: formData.notes || null }),
        })
      } else {
        await fetch("/api/seating/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, name: formData.name, capacity: formData.capacity, notes: formData.notes || null }),
        })
      }
      setModalOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTable) return
    setLoading(true)
    try {
      await fetch(`/api/seating/tables/${deleteTable.id}`, { method: "DELETE" })
      setDeleteTable(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign(tableId: string, guestId: string) {
    await fetch("/api/seating/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId, guestId }),
    })
    router.refresh()
  }

  async function handleUnassign(guestId: string) {
    await fetch("/api/seating/assign", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId }),
    })
    router.refresh()
  }

  function onDragStart(e: React.DragEvent, guestId: string) {
    e.dataTransfer.setData("guestId", guestId)
  }

  function onDragOver(e: React.DragEvent, tableId: string) {
    e.preventDefault()
    setDragOverTableId(tableId)
  }

  function onDragLeave() {
    setDragOverTableId(null)
  }

  function onDrop(e: React.DragEvent, tableId: string) {
    e.preventDefault()
    setDragOverTableId(null)
    const guestId = e.dataTransfer.getData("guestId")
    if (guestId) handleAssign(tableId, guestId)
  }

  function getCapacityColor(table: Table) {
    const count = table.guests.length
    if (count > table.capacity) return "border-red-400"
    if (count === table.capacity) return "border-yellow-400"
    return "border-green-400"
  }

  return (
    <div className="flex gap-6 min-h-[400px]">
      {/* Left sidebar — Unseated guests */}
      <div className="w-64 flex-shrink-0">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Unseated Guests ({unseatedGuests.length})
          </h3>
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-sm mb-3 w-full"
          />
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
            {filteredGuests.length === 0 && (
              <p className="text-xs text-neutral-400 py-2">
                {unseatedGuests.length === 0 ? "All guests are seated" : "No guests match"}
              </p>
            )}
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                draggable
                onDragStart={(e) => onDragStart(e, guest.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 cursor-grab hover:border-neutral-300 active:cursor-grabbing text-sm"
              >
                <span className="text-neutral-800 truncate flex-1">{guest.name}</span>
                {guest.group_tag && (
                  <span className="badge text-xs">{guest.group_tag}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right main area — Tables */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-700">Tables ({tables.length})</h3>
          <button onClick={openAdd} className="btn-primary text-sm">
            + Add Table
          </button>
        </div>

        {tables.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-neutral-500 mb-2">No tables yet</p>
            <p className="text-sm text-neutral-400">Create a table to start arranging your guests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                onDragOver={(e) => onDragOver(e, table.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, table.id)}
                className={`card border-2 transition-colors ${getCapacityColor(table)} ${
                  dragOverTableId === table.id ? "bg-neutral-50 ring-2 ring-neutral-300" : ""
                }`}
              >
                {/* Table header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-neutral-800">{table.name}</h4>
                    <p className="text-xs text-neutral-500">
                      {table.guests.length}/{table.capacity} seats
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(table)}
                      className="text-neutral-400 hover:text-neutral-600 p-1 text-sm"
                      title="Edit table"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTable(table)}
                      className="text-neutral-400 hover:text-red-500 p-1 text-sm"
                      title="Delete table"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {table.notes && (
                  <p className="text-xs text-neutral-400 mb-2">{table.notes}</p>
                )}

                {/* Guest list */}
                <div className="space-y-1">
                  {table.guests.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between px-2 py-1.5 rounded bg-neutral-50 text-sm"
                    >
                      <span className="text-neutral-700 truncate">{g.guest_name}</span>
                      <button
                        onClick={() => handleUnassign(g.guest_id)}
                        className="text-neutral-400 hover:text-red-500 text-xs ml-2 flex-shrink-0"
                        title="Remove from table"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {table.guests.length === 0 && (
                    <p className="text-xs text-neutral-400 py-3 text-center">
                      Drag guests here
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Table Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTable ? "Edit Table" : "Add Table"}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <TableForm data={formData} onChange={setFormData} />
      </FormModal>

      {/* Delete Confirm */}
      <DeleteConfirm
        open={!!deleteTable}
        onClose={() => setDeleteTable(null)}
        onConfirm={handleDelete}
        loading={loading}
        itemName={deleteTable?.name ?? "this table"}
      />
    </div>
  )
}
