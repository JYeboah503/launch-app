'use client'

/** Shared educator UI primitives — imported by every educator view so the
 *  views don't import each other (avoids a cycle through the root). */

import { X } from 'lucide-react'

export function ModalShell({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="ed-modal-root" role="dialog" aria-modal="true" aria-label={title}>
      <div className="ed-modal-backdrop" onClick={onClose} />
      <div className={`ed-modal-card ${wide ? 'ed-modal-wide' : ''}`}>
        <div className="ed-modal-head">
          <h2 className="ed-modal-title">{title}</h2>
          <button type="button" className="ed-x" aria-label="Close" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** Relative-ish due label with tone. */
export function dueLabel(iso: string | undefined, nowIso: string): { text: string; overdue: boolean } {
  if (!iso) return { text: 'No due date', overdue: false }
  const diff = Date.parse(iso) - Date.parse(nowIso)
  const days = Math.round(diff / 864e5)
  if (days < 0) return { text: `Overdue ${fmtDate(iso)}`, overdue: true }
  if (days === 0) return { text: 'Due today', overdue: false }
  if (days === 1) return { text: 'Due tomorrow', overdue: false }
  if (days <= 7) return { text: `Due in ${days} days`, overdue: false }
  return { text: `Due ${fmtDate(iso)}`, overdue: false }
}
