"use client"

import { useState, FormEvent, useRef } from "react"
import { useRouter } from "next/navigation"
import FormModal from "@/components/FormModal"
import DeleteConfirm from "@/components/DeleteConfirm"
import TimelineForm from "./TimelineForm"

interface TimelineItem {
  id: string
  event_id: string
  time: string | null
  title: string
  location: string | null
  assignee: string | null
  notes: string | null
  order_index: number
}

interface TimelineListProps {
  items: TimelineItem[]
  eventId: string
}

const EMPTY_ITEM = {
  title: "",
  time: "",
  location: "",
  assignee: "",
  notes: "",
}

function formatTime(time: string | null): string {
  if (!time) return ""
  // time is HH:MM:SS or HH:MM from the DB
  const parts = time.split(":")
  const h = parseInt(parts[0], 10)
  const m = parts[1]
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m} ${ampm}`
}

export default function TimelineList({ items, eventId }: TimelineListProps) {
  const router = useRouter()
  const [orderedItems, setOrderedItems] = useState(items)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<TimelineItem | null>(null)
  const [form, setForm] = useState(EMPTY_ITEM)
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TimelineItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  // Sync when props change
  if (items !== orderedItems && JSON.stringify(items) !== JSON.stringify(orderedItems)) {
    setOrderedItems(items)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_ITEM)
    setShowModal(true)
  }

  const openEdit = (item: TimelineItem) => {
    setEditing(item)
    setForm({
      title: item.title,
      time: item.time ? item.time.substring(0, 5) : "",
      location: item.location || "",
      assignee: item.assignee || "",
      notes: item.notes || "",
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/timeline/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            time: form.time || null,
          }),
        })
      } else {
        await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            ...form,
            time: form.time || null,
          }),
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
      await fetch(`/api/timeline/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    dragOverItem.current = index
  }

  const handleDrop = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    if (dragItem.current === dragOverItem.current) return

    const reordered = [...orderedItems]
    const [removed] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOverItem.current, 0, removed)

    setOrderedItems(reordered)
    dragItem.current = null
    dragOverItem.current = null

    // Send new order to API
    const reorderPayload = reordered.map((item, idx) => ({
      id: item.id,
      order_index: idx,
    }))

    await fetch("/api/timeline/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, items: reorderPayload }),
    })

    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button className="btn-primary text-sm" onClick={openAdd}>
          + Add item
        </button>
      </div>

      {orderedItems.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-semibold text-neutral-700 mb-1">No timeline items yet</h3>
          <p className="text-sm text-neutral-400 max-w-xs">
            Add your first timeline item to start planning your day-of schedule.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[79px] top-0 bottom-0 w-px bg-neutral-200 hidden sm:block" />

          <div className="space-y-4">
            {orderedItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                className="flex gap-4 cursor-grab active:cursor-grabbing group"
              >
                {/* Time column */}
                <div className="w-16 shrink-0 text-right pt-4">
                  <span className="text-sm font-bold text-neutral-700">
                    {formatTime(item.time)}
                  </span>
                </div>

                {/* Dot */}
                <div className="hidden sm:flex shrink-0 items-start pt-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 group-hover:bg-neutral-600 ring-4 ring-white" />
                </div>

                {/* Card */}
                <div className="card flex-1 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-800">{item.title}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-neutral-500">
                        {item.location && (
                          <span>{item.location}</span>
                        )}
                        {item.assignee && (
                          <span>{item.assignee}</span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="mt-2 text-sm text-neutral-400">{item.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-neutral-400 hover:text-neutral-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Timeline Item" : "Add Timeline Item"}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <TimelineForm item={form} onChange={setForm} />
      </FormModal>

      <DeleteConfirm
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName={deleteTarget?.title}
      />
    </>
  )
}
