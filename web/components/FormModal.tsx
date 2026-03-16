"use client"

import { useEffect, useRef } from "react"

interface FormModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  loading?: boolean
  submitLabel?: string
}

export default function FormModal({ open, onClose, title, children, onSubmit, loading, submitLabel = "Save" }: FormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={onSubmit}>
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-100 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </dialog>
  )
}
