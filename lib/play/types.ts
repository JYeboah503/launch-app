import type { ScenarioVariant } from '@/lib/roles'

/**
 * Generic intake question — open-text free-response question the org asks
 * BEFORE the scenario starts (never blocking). The org picks templated
 * criteria; an AI evaluates the candidate's typed answer against the ticked
 * criteria and returns a 0-10 score with a one-line rationale per question.
 *
 * Lives on the scenario alongside the decision steps.
 */
export interface GenericIntakeQuestion {
  id: string
  prompt: string
  criterionIds: string[]  // refs into CRITERION_TEMPLATES in lib/builderData.ts
}

export type FactorKind = 'time' | 'live' | 'meter' | 'signal' | 'metric' | 'quote'
export type SceneId = 'locker' | 'whiteboard' | 'press' | 'court' | 'tunnel' | 'reflect' | string
export type Mood = 'private' | 'tense' | 'loud' | 'reflective' | string
export type Theme = 'cream' | 'cinema' | 'professional'

/**
 * Map a scenario variant to a play-flow theme.
 *
 * 'playful' → 'cinema' (today's dramatic, colourful default — preserves the
 * existing Quick-Play look exactly).
 * 'professional' → 'professional' (the new restrained, cooler register — see
 * `.lq-play-root[data-theme="professional"]` in play.css).
 */
export function themeForVariant(v?: ScenarioVariant): Theme {
  return v === 'professional' ? 'professional' : 'cinema'
}

export interface Factor {
  label: string
  value?: string
  kind?: FactorKind | string
  timeSeconds?: number
  timeId?: string
  tone?: 'mono' | string
}

export interface OptionStat {
  label: string
  change: string
}

export interface DecisionOption {
  id: string
  label: string
  skill?: string
  score?: number
  echo?: string
  consequence?: string
  surprise?: string
  insight?: string
  insightNavigate?: string
  ghost?: string
  stats?: OptionStat[]
  reactionColor?: string
}

export interface DecisionStep {
  kind: 'decision'
  mood?: Mood
  scene: SceneId
  sceneCaption?: string
  eyebrow: string
  prompt: string
  keyAsk?: string
  transition?: string
  factors: Factor[]
  options: DecisionOption[]
}

export interface OpeningContent {
  eyebrow: string
  title: string
  body: string
  imageCaption?: string
  ambient: Factor[]
}

export interface OutcomeContent {
  eyebrow: string
  title: string
  body: string
}

export interface ReflectContent {
  asker?: string
  prompt?: string
}

export interface Scenario {
  id: string
  role: string
  meta: string
  goal: { label: string; target: number }
  opening: OpeningContent
  steps: DecisionStep[]
  outcome: OutcomeContent
  reflect?: ReflectContent
  /** Visual register. Optional — when unset, the play flow keeps its default look. */
  variant?: ScenarioVariant
}

export interface Profile {
  name: string
  pronouns?: string
}

/* History entry — mirrors the LQ App entry shape. `kind: 'decision'` carries
   the full picked-option payload; `kind: 'reflect'` is just a label. */
export interface HistoryEntry {
  kind: 'decision' | 'reflect'
  id?: string
  label: string
  skill?: string
  consequence?: string
  echo?: string
  surprise?: string
  insight?: string
  insightNavigate?: string
  stats?: OptionStat[]
  ghost?: string
  score?: number
  reactionColor?: string
  stepIdx?: number
  custom?: boolean
}

export type CompletionResult =
  | { kind: 'back-to-dashboard' }
  | { kind: 'create-new-scenario' }
  | { kind: 'department-selected'; company: string; department: string }
