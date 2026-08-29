/**
 * Shared cross-mode capability layer — the single source of truth for what
 * a student has demonstrated, whether that came from a Journey or a Work
 * scenario. Journeys and Work scenarios are two equal, freely-toggleable
 * modes measuring the same underlying capabilities, not a ladder — this is
 * the surface-level proof that capture works the same way regardless of
 * mode. Wraps/extends lib/play/journeyProfile.ts rather than replacing it —
 * intake/proposal/RunRecord all keep working unchanged.
 */

export interface CapabilityEvent {
  id: string
  source: 'journey' | 'work'
  scenarioId: string
  scenarioTitle: string
  /** Normalized to one of CANONICAL_CAPABILITIES. */
  capability: string
  /** The original tag, if normalization changed it — provenance. */
  rawLabel?: string
  /** Short "what was demonstrated" line, shown in the Scorecard drill-down. */
  evidenceLine: string
  at: string
}

export interface CapabilityAggregate {
  capability: string
  count: number
  /** Most-recent-first. */
  events: CapabilityEvent[]
}

export interface CapabilityStore {
  /** Revived from JourneyProfile.strengthCaps — what the student said they're good at. */
  selfAssessed: string[]
  events: CapabilityEvent[]
  updatedAt: string
}

const KEY = 'launch.capabilityProfile.v1'

export function loadCapabilityStore(): CapabilityStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { selfAssessed: [], events: [], updatedAt: new Date(0).toISOString() }
    const parsed = JSON.parse(raw)
    return {
      selfAssessed: Array.isArray(parsed?.selfAssessed) ? parsed.selfAssessed : [],
      events: Array.isArray(parsed?.events) ? parsed.events : [],
      updatedAt: parsed?.updatedAt || new Date(0).toISOString(),
    }
  } catch {
    return { selfAssessed: [], events: [], updatedAt: new Date(0).toISOString() }
  }
}

function saveCapabilityStore(store: CapabilityStore) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {}
}

/** Pure push — mirrors journeyProfile.ts's appendRun pattern. */
export function appendCapabilityEvents(events: CapabilityEvent[]) {
  if (events.length === 0) return
  const store = loadCapabilityStore()
  store.events = [...store.events, ...events]
  store.updatedAt = new Date().toISOString()
  saveCapabilityStore(store)
}

export function syncSelfAssessed(strengthCaps: string[]) {
  const store = loadCapabilityStore()
  store.selfAssessed = strengthCaps
  store.updatedAt = new Date().toISOString()
  saveCapabilityStore(store)
}

export function aggregateByCapability(store: CapabilityStore): CapabilityAggregate[] {
  const byCap = new Map<string, CapabilityEvent[]>()
  for (const ev of store.events) {
    const list = byCap.get(ev.capability) || []
    list.push(ev)
    byCap.set(ev.capability, list)
  }
  return Array.from(byCap.entries())
    .map(([capability, events]) => ({
      capability,
      count: events.length,
      events: [...events].sort((a, b) => b.at.localeCompare(a.at)),
    }))
    .sort((a, b) => b.count - a.count)
}

export function topCapabilityFrom(counts: Record<string, number> | undefined): string | null {
  if (!counts) return null
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top ? top[0] : null
}

/* ---------------- Canonical taxonomy ---------------- */

/** The 8 FUSE capabilities Journeys already uses — the one vocabulary the
 *  Scorecard ever shows, regardless of which mode a tag came from. */
export const CANONICAL_CAPABILITIES = [
  'Leadership & Influence',
  'Emotional Intelligence',
  'Situational Awareness & Systems Thinking',
  'Reasoning & Critical Thinking',
  'Integrity & Ethics',
  'Adaptability & Cognitive Flexibility',
  'Judgement & Decision-Making',
  'Self-direction',
] as const

/** Work scenarios' decision options carry free-form skill tags (26 observed
 *  across lib/play/sampleScenarios.ts — "Empathy", "Triage", "Loyalty"...)
 *  that overlap with none of the 8 above. Every observed tag is mapped here
 *  so the Scorecard grid is guaranteed to only ever show the canonical 8,
 *  regardless of which mode fed it. Unmapped future tags pass through as
 *  their own card rather than being silently dropped. */
const CAPABILITY_ALIASES: Record<string, string> = {
  Leadership: 'Leadership & Influence',
  Trust: 'Leadership & Influence',
  Empathy: 'Emotional Intelligence',
  Composure: 'Emotional Intelligence',
  Humility: 'Emotional Intelligence',
  Restraint: 'Emotional Intelligence',
  Triage: 'Situational Awareness & Systems Thinking',
  Focus: 'Situational Awareness & Systems Thinking',
  Precision: 'Situational Awareness & Systems Thinking',
  Strategy: 'Reasoning & Critical Thinking',
  Framing: 'Reasoning & Critical Thinking',
  Clarity: 'Reasoning & Critical Thinking',
  Creativity: 'Adaptability & Cognitive Flexibility',
  Ethics: 'Integrity & Ethics',
  Integrity: 'Integrity & Ethics',
  Loyalty: 'Integrity & Ethics',
  Transparency: 'Integrity & Ethics',
  Directness: 'Integrity & Ethics',
  Adaptability: 'Adaptability & Cognitive Flexibility',
  Judgment: 'Judgement & Decision-Making',
  Courage: 'Judgement & Decision-Making',
  Resolve: 'Judgement & Decision-Making',
  Instinct: 'Judgement & Decision-Making',
  Caution: 'Judgement & Decision-Making',
  Discipline: 'Self-direction',
  Initiative: 'Self-direction',
}

export function normalizeCapability(raw: string): string {
  return CAPABILITY_ALIASES[raw] || raw
}
