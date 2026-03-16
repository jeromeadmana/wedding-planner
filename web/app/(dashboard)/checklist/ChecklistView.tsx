"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import FormModal from "@/components/FormModal"
import DeleteConfirm from "@/components/DeleteConfirm"
import ChecklistForm from "./ChecklistForm"

interface ChecklistItem {
  id: string
  title: string
  category: string | null
  due_date: string | null
  is_done: boolean
  is_pinned: boolean
  notes: string | null
  created_at: string
}

interface ChecklistViewProps {
  items: ChecklistItem[]
  eventId: string
  eventType: string
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

const EMPTY_FORM = { title: "", category: "", due_date: "", notes: "" }

type FilterTab = "all" | "pending" | "done" | "overdue"

function isOverdue(item: ChecklistItem): boolean {
  if (!item.due_date || item.is_done) return false
  return new Date(item.due_date) < new Date(new Date().toDateString())
}

export default function ChecklistView({ items, eventId, eventType }: ChecklistViewProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterTab>("all")
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ChecklistItem | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ChecklistItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [templateLoading, setTemplateLoading] = useState(false)

  // Quick add state
  const [quickTitle, setQuickTitle] = useState("")
  const [quickCategory, setQuickCategory] = useState("")

  // Filter items
  const filtered = items.filter((item) => {
    if (filter === "pending") return !item.is_done
    if (filter === "done") return item.is_done
    if (filter === "overdue") return isOverdue(item)
    return true
  })

  // Group by category
  const grouped = new Map<string, ChecklistItem[]>()
  for (const item of filtered) {
    const cat = item.category ?? "Other"
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(item)
  }

  // Sort categories by predefined order
  const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
    const ai = CATEGORIES.indexOf(a)
    const bi = CATEGORIES.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  function toggleCategory(cat: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  async function toggleDone(item: ChecklistItem) {
    await fetch(`/api/checklist/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: !item.is_done }),
    })
    router.refresh()
  }

  async function togglePin(item: ChecklistItem) {
    await fetch(`/api/checklist/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_pinned: !item.is_pinned }),
    })
    router.refresh()
  }

  function openAdd() {
    setEditing(null)
    setFormData(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(item: ChecklistItem) {
    setEditing(item)
    setFormData({
      title: item.title,
      category: item.category ?? "",
      due_date: item.due_date ?? "",
      notes: item.notes ?? "",
    })
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await fetch(`/api/checklist/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            category: formData.category || null,
            due_date: formData.due_date || null,
            notes: formData.notes || null,
          }),
        })
      } else {
        await fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            title: formData.title,
            category: formData.category || null,
            due_date: formData.due_date || null,
            notes: formData.notes || null,
          }),
        })
      }
      setModalOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await fetch(`/api/checklist/${deleteTarget.id}`, { method: "DELETE" })
      setDeleteOpen(false)
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleQuickAdd(e: FormEvent) {
    e.preventDefault()
    if (!quickTitle.trim()) return
    await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        title: quickTitle.trim(),
        category: quickCategory || null,
      }),
    })
    setQuickTitle("")
    setQuickCategory("")
    router.refresh()
  }

  async function loadTemplate() {
    setTemplateLoading(true)
    try {
      await fetch("/api/checklist/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, eventType }),
      })
      router.refresh()
    } finally {
      setTemplateLoading(false)
    }
  }

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "done", label: "Done" },
    { key: "overdue", label: "Overdue" },
  ]

  return (
    <div>
      {/* Filter tabs + Add button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="btn-primary text-sm">
          + Add Task
        </button>
      </div>

      {/* Load template if no items */}
      {items.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-neutral-500 mb-4">No tasks yet. Start with a template or add your own.</p>
          <button
            onClick={loadTemplate}
            disabled={templateLoading}
            className="btn-primary text-sm"
          >
            {templateLoading ? "Loading..." : "Load Template"}
          </button>
        </div>
      )}

      {/* Grouped items */}
      {sortedCategories.map((cat) => {
        const catItems = grouped.get(cat)!
        const doneCount = catItems.filter((i) => i.is_done).length
        const isCollapsed = collapsedCategories.has(cat)

        return (
          <div key={cat} className="mb-4">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">{isCollapsed ? "▶" : "▼"}</span>
                <span className="font-medium text-neutral-800">{cat}</span>
                <span className="badge bg-neutral-100 text-neutral-600">
                  {doneCount}/{catItems.length}
                </span>
              </div>
            </button>

            {!isCollapsed && (
              <div className="mt-1 space-y-1">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={`card flex items-center gap-3 py-3 px-4 ${
                      item.is_done ? "opacity-60" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.is_done}
                      onChange={() => toggleDone(item)}
                      className="w-5 h-5 rounded border-neutral-300 text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0"
                    />

                    {/* Pin */}
                    <button
                      onClick={() => togglePin(item)}
                      className={`flex-shrink-0 text-lg leading-none ${
                        item.is_pinned ? "text-yellow-500" : "text-neutral-300 hover:text-yellow-400"
                      }`}
                      title={item.is_pinned ? "Unpin" : "Pin"}
                    >
                      ★
                    </button>

                    {/* Title + due date */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-neutral-800 ${item.is_done ? "line-through" : ""}`}>
                        {item.title}
                      </p>
                      {item.due_date && (
                        <p
                          className={`text-xs mt-0.5 ${
                            isOverdue(item) ? "text-red-600 font-medium" : "text-neutral-400"
                          }`}
                        >
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => openEdit(item)}
                      className="text-neutral-400 hover:text-neutral-600 text-sm flex-shrink-0"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(item)
                        setDeleteOpen(true)
                      }}
                      className="text-neutral-400 hover:text-red-600 text-sm flex-shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Quick inline add */}
      {items.length > 0 && (
        <form onSubmit={handleQuickAdd} className="card flex flex-wrap items-center gap-3 mt-4">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Quick add task..."
            className="input flex-1 min-w-[200px]"
          />
          <select
            value={quickCategory}
            onChange={(e) => setQuickCategory(e.target.value)}
            className="input w-auto"
          >
            <option value="">Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary text-sm">
            Add
          </button>
        </form>
      )}

      {/* Edit modal */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Task" : "Add Task"}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <ChecklistForm data={formData} onChange={setFormData} />
      </FormModal>

      {/* Delete confirmation */}
      <DeleteConfirm
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        itemName="this task"
      />
    </div>
  )
}
