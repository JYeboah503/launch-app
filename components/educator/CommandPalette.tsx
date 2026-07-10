'use client'

/** ⌘K command palette — jump to any student, cohort, or action from
 *  anywhere in the educator workspace. Arrow keys + Enter, Esc to close. */

import { useEffect, useMemo, useRef, useState } from 'react'
import { type EdWorkspace } from '@/components/educator/types'
import { Search, Users, GraduationCap, Plus, GitCompare, Settings, PencilRuler } from 'lucide-react'

export interface PaletteItem {
  id: string
  label: string
  hint: string
  icon: React.ReactNode
  run: () => void
}

export function CommandPalette({
  ws, onClose, onOpenCohort, onOpenStudent, onNewCohort, onCompare, onSettings, onBuild,
}: {
  ws: EdWorkspace
  onClose: () => void
  onOpenCohort: (id: string) => void
  onOpenStudent: (cohortId: string, studentId: string) => void
  onNewCohort: () => void
  onCompare: () => void
  onSettings: () => void
  onBuild: () => void
}) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)

  const items = useMemo<PaletteItem[]>(() => {
    const actions: PaletteItem[] = [
      { id: 'act-new', label: 'New cohort', hint: 'Action', icon: <Plus className="w-4 h-4" />, run: onNewCohort },
      { id: 'act-build', label: 'Build a scenario', hint: 'Action', icon: <PencilRuler className="w-4 h-4" />, run: onBuild },
      { id: 'act-compare', label: 'Compare cohorts', hint: 'Action', icon: <GitCompare className="w-4 h-4" />, run: onCompare },
      { id: 'act-settings', label: 'School settings', hint: 'Action', icon: <Settings className="w-4 h-4" />, run: onSettings },
    ]
    const cohorts: PaletteItem[] = ws.cohorts.map((c) => ({
      id: `co-${c.id}`,
      label: c.name,
      hint: `Cohort · ${c.studentIds.length} students`,
      icon: <GraduationCap className="w-4 h-4" />,
      run: () => onOpenCohort(c.id),
    }))
    const students: PaletteItem[] = ws.students.map((s) => {
      const cohort = ws.cohorts.find((c) => c.studentIds.includes(s.id))
      return {
        id: `st-${s.id}`,
        label: s.name,
        hint: `Student · ${cohort?.name ?? 'Unassigned'}`,
        icon: <Users className="w-4 h-4" />,
        run: cohort ? () => onOpenStudent(cohort.id, s.id) : () => {},
      }
    })
    const all = [...actions, ...cohorts, ...students]
    const needle = q.trim().toLowerCase()
    if (!needle) return [...actions, ...cohorts, ...students.slice(0, 6)]
    return all.filter((i) => i.label.toLowerCase().includes(needle)).slice(0, 12)
  }, [q, ws, onNewCohort, onBuild, onCompare, onSettings, onOpenCohort, onOpenStudent])

  useEffect(() => { setIdx(0) }, [q])

  const run = (item: PaletteItem) => { onClose(); item.run() }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Enter' && items[idx]) { e.preventDefault(); run(items[idx]) }
    else if (e.key === 'Escape') onClose()
  }

  // Keep the active row visible.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${idx}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  return (
    <div className="ed-pal-root" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="ed-pal-backdrop" onClick={onClose} />
      <div className="ed-pal">
        <div className="ed-pal-input">
          <Search className="w-4 h-4" style={{ color: 'var(--lq-ink-3)', flexShrink: 0 }} />
          <input
            autoFocus
            value={q}
            placeholder="Jump to a student, cohort, or action…"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
          />
          <kbd>esc</kbd>
        </div>
        <div className="ed-pal-list" ref={listRef}>
          {items.length === 0 && <div className="ed-pal-none">Nothing matches &ldquo;{q}&rdquo;</div>}
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              data-idx={i}
              className={`ed-pal-item ${i === idx ? 'is-on' : ''}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => run(item)}
            >
              <span className="ed-pal-ico">{item.icon}</span>
              <span className="ed-pal-lbl">{item.label}</span>
              <span className="ed-pal-hint">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .ed-pal-root { position: fixed; inset: 0; z-index: 120; display: flex; align-items: flex-start; justify-content: center; padding: 12vh 20px 20px; }
        .ed-pal-backdrop { position: absolute; inset: 0; background: rgba(14, 24, 51, 0.38); backdrop-filter: blur(3px); }
        .ed-pal { position: relative; width: 100%; max-width: 560px; background: #fff; border-radius: 16px; box-shadow: 0 30px 80px -20px rgba(14,24,51,0.5); overflow: hidden; }
        .ed-pal-input { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--lq-line); }
        .ed-pal-input input { flex: 1; border: none; outline: none; font-family: var(--font-body); font-size: 15px; color: var(--lq-ink); background: transparent; }
        .ed-pal-input kbd { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; color: var(--lq-ink-3); border: 1px solid var(--lq-line-2); border-radius: 5px; padding: 2px 6px; }
        .ed-pal-list { max-height: 330px; overflow-y: auto; padding: 6px; }
        .ed-pal-item { width: 100%; display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 10px; border: none; background: none; cursor: pointer; text-align: left; }
        .ed-pal-item.is-on { background: var(--ed-accent-soft); }
        .ed-pal-ico { color: var(--lq-ink-3); display: inline-flex; }
        .ed-pal-item.is-on .ed-pal-ico { color: var(--ed-accent); }
        .ed-pal-lbl { flex: 1; font-size: 14px; font-weight: 500; color: var(--lq-ink); }
        .ed-pal-hint { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--lq-ink-3); }
        .ed-pal-none { padding: 22px; text-align: center; font-size: 13px; color: var(--lq-ink-3); font-style: italic; }
      `}</style>
    </div>
  )
}
