"use client"

import { useEffect, useRef } from "react"

interface DeleteConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  itemName?: string
}

export default function DeleteConfirm({ open, onClose, onConfirm, loading, itemName = "this item" }: DeleteConfirmProps) {
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
      className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-xl backdrop:bg-black/40"
    >
      <h3 className="text-lg font-semibold text-neutral-800 mb-2">Delete {itemName}?</h3>
      <p className="text-sm text-neutral-500 mb-6">This action cannot be undone.</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </dialog>
  )
}
