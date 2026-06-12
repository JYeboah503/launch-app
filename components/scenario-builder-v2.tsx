'use client'

/**
 * Scenario Builder v2 — the rebuilt authoring tool.
 *
 * Decisions encoded:
 *  - 3-step structure: Setup → Author → Review & ship.
 *  - Calm chrome: light surface (white + navy + teal), sans throughout, no
 *    cinematic dark steps, no parallax, no italic display.
 *  - Generic intake questions appear BEFORE the scenario at play time
 *    (never blocking) — authored alongside the scenario decisions on the
 *    same canvas in step 2.
 *  - Each scenario question shows the capability it tests + a one-line
 *    'how we measure' explanation so the org always knows what's being
 *    tested. Optional 'strong vs weak signal' example is collapsible.
 *  - Org sets AI evaluation criteria for each generic question by ticking
 *    templated suggestions. AI scoring (0–10 + reason) lives on the
 *    candidate report side.
 *  - Career stage (Early / Advanced) lives in step 1 and is locked into
 *    the emitted scenario metadata.
 */

import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Plus, Trash2, Copy, Check, Info, Sparkles, RefreshCcw, Pin, ChevronDown } from 'lucide-react'
import { LaunchWordmark } from '@/components/launch-wordmark'
import type { CreatorType, ScenarioLevel, ScenarioVariant } from '@/lib/roles'
import { levelToVariant, defaultLevelForCreator, levelLabel } from '@/lib/roles'
import {
  CAPABILITIES,
  CRITERION_TEMPLATES,
  GENERIC_QUESTION_SUGGESTIONS,
  ATTRIBUTES,
  getCapability,
} from '@/lib/builderData'
import type { GenericIntakeQuestion } from '@/lib/play/types'
import {
  generateScenario,
  regenerateDecision,
  type Difficulty,
  type GeneratorInput,
} from '@/lib/aiGenerator'

/* -------------------------------------------------------- */
/* Types                                                    */
/* -------------------------------------------------------- */

interface ScenarioBuilderV2Props {
  externalOpen?: boolean
  onClose?: () => void
  creatorType?: CreatorType
  /** When the parent locks the level (e.g. teacher = early), we still show
      the toggle for visibility but disabled. Pass `lockLevel` to enforce. */
  lockLevel?: ScenarioLevel
  /** Generic intake questions section visibility. Defaults to true. Corporate
      builder turns this off — corporates skip generic intake. */
  showGenericQuestions?: boolean
  onRoleCreated?: (roleData: {
    id: string
    name: string
    accessCode: string
    skills: string[]
    questionsCount: number
    createdAt: Date
    creatorType: CreatorType
    variant: ScenarioVariant
    genericQuestions: GenericIntakeQuestion[]
  }) => void
}

type Step = 1 | 2 | 3

interface ScenarioDecision {
  id: string
  prompt: string
  capabilityKey: string  // ref into CAPABILITIES
  difficulty: Difficulty
  options: DecisionOption[]
  pinned?: boolean
}

type Leaning = 'support' | 'neutral' | 'challenge'

interface DecisionOption {
  id: string
  text: string
  /** Optional per-option follow-up tree — each option gets its own
   *  "why did you pick THIS?" prompt + 3 leaning-tagged sub-choices. */
  followUp?: {
    prompt: string
    choices: { id: string; text: string; leaning: Leaning; reasoning?: string }[]
  }
}

const DEFAULT_DECISION = (capKey = 'judgement', difficulty: Difficulty = 'medium'): ScenarioDecision => ({
  id: `q-${Math.random().toString(36).slice(2, 8)}`,
  prompt: '',
  capabilityKey: capKey,
  difficulty,
  options: [
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
  ],
})

/** Empty follow-up template for partners authoring a tree branch manually. */
const EMPTY_OPTION_FOLLOWUP = (optIdx: number): DecisionOption['followUp'] => ({
  prompt: 'Why did you go with that?',
  choices: [
    { id: `fu-${optIdx}-0`, text: '', leaning: 'support' },
    { id: `fu-${optIdx}-1`, text: '', leaning: 'neutral' },
    { id: `fu-${optIdx}-2`, text: '', leaning: 'challenge' },
  ],
})

const DEFAULT_GENERIC = (
  prompt = '',
  kind: 'open-text' | 'hard-filter' = 'open-text',
  allowedAnswers?: string[],
): GenericIntakeQuestion => ({
  id: `g-${Math.random().toString(36).slice(2, 8)}`,
  kind,
  prompt,
  criterionIds: [],
  allowedAnswers: kind === 'hard-filter' ? (allowedAnswers || ['', '', '']) : undefined,
})

/**
 * AI-style pre-qualifier seed suggestions. For the demo this is a static list
 * (matches what Savills said in their email — graduation timing, degree
 * background, why-this-org). Devs swap this for a real LLM call that reads
 * the JD + criteria the partner provided.
 */
const SEEDED_PREQUALIFIERS = (): GenericIntakeQuestion[] => [
  DEFAULT_GENERIC(
    'When did you (or will you) graduate?',
    'hard-filter',
    ['Currently studying', 'Final year', 'Graduated in the last 2 years', 'Graduated more than 2 years ago'],
  ),
  DEFAULT_GENERIC(
    'Which best describes your degree?',
    'hard-filter',
    ['Property / Real Estate', 'Finance / Economics / Business', 'Other discipline', 'No tertiary study'],
  ),
  DEFAULT_GENERIC(
    'Why are you interested in building a career with us?',
    'open-text',
  ),
]

/* -------------------------------------------------------- */
/* Component                                                */
/* -------------------------------------------------------- */

export function ScenarioBuilderV2({
  externalOpen,
  onClose,
  creatorType = 'corporate',
  lockLevel,
  showGenericQuestions = true,
  onRoleCreated,
}: ScenarioBuilderV2Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)

  // step 1
  const [roleTitle, setRoleTitle] = useState('')
  const [audienceNote, setAudienceNote] = useState('')
  const [level, setLevel] = useState<ScenarioLevel>(lockLevel ?? defaultLevelForCreator(creatorType))
  const [questionCount, setQuestionCount] = useState<3 | 6 | 9>(6)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [jobDescription, setJobDescription] = useState('')
  const [idealCriteria, setIdealCriteria] = useState('')
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [companyValues, setCompanyValues] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // step 2 — pre-qualifier intake questions. Corporates get AI-seeded
  // suggestions (hard filters + an open-text "why us"); teachers + students
  // get a single open-text starter. The section is collapsed by default for
  // corporate so it doesn't clutter when they don't need pre-qualifiers.
  const [genericQs, setGenericQs] = useState<GenericIntakeQuestion[]>(
    !showGenericQuestions
      ? []
      : creatorType === 'corporate'
        ? SEEDED_PREQUALIFIERS()
        : [DEFAULT_GENERIC(GENERIC_QUESTION_SUGGESTIONS[0])],
  )
  const [genericCollapsed, setGenericCollapsed] = useState<boolean>(
    creatorType === 'corporate',
  )
  const [decisions, setDecisions] = useState<ScenarioDecision[]>([
    DEFAULT_DECISION('judgement'),
    DEFAULT_DECISION('integrity'),
    DEFAULT_DECISION('execution'),
  ])

  // step 3
  const [accessCode, setAccessCode] = useState('')
  const [copied, setCopied] = useState(false)

  // External open handshake
  const openedRef = useRef(false)
  useEffect(() => {
    if (externalOpen && !isOpen) {
      setIsOpen(true)
      setStep(1)
      openedRef.current = true
    }
  }, [externalOpen, isOpen])
  useEffect(() => {
    if (!isOpen && openedRef.current && onClose) {
      onClose()
      openedRef.current = false
    }
  }, [isOpen, onClose])

  // Sync lockLevel if it changes
  useEffect(() => {
    if (lockLevel) setLevel(lockLevel)
  }, [lockLevel])

  /* ------------------------------- */
  /* Step 1 → Step 2 validation       */
  /* ------------------------------- */
  const step1Ready = roleTitle.trim().length > 0
  const step2Ready = decisions.every(
    (d) => d.prompt.trim().length > 0 && d.options.every((o) => o.text.trim().length > 0)
  )

  /* ------------------------------- */
  /* AI generation                    */
  /* ------------------------------- */
  const generatorInput = (): GeneratorInput => ({
    roleTitle,
    variant: levelToVariant(level),
    questionCount,
    difficulty,
    jobDescription: jobDescription || undefined,
    idealCriteria: idealCriteria || undefined,
    attributeKeys: selectedAttributes.length ? selectedAttributes : undefined,
    companyValues: companyValues || undefined,
  })

  const handleGenerate = async () => {
    if (!step1Ready) return
    setIsGenerating(true)
    try {
      const out = await generateScenario(generatorInput())
      const fresh: ScenarioDecision[] = out.decisions.map((d) => ({
        id: d.id,
        prompt: d.prompt,
        capabilityKey: d.capabilityKey,
        difficulty: d.difficulty,
        options: d.options,
      }))
      setDecisions(fresh)
      // Pre-fill pre-qualifier suggestions only if the section can show
      // (not when explicitly turned off by the parent).
      if (showGenericQuestions) setGenericQs(out.preQualifiers)
      setStep(2)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateOne = (id: string) => {
    const target = decisions.find((d) => d.id === id)
    if (!target) return
    const fresh = regenerateDecision(
      generatorInput(),
      target.capabilityKey,
      target.difficulty,
      Math.floor(Math.random() * 1_000_000),
    )
    setDecisions((prev) =>
      prev.map((d) => (d.id === id ? {
        ...d,
        prompt: fresh.prompt,
        options: fresh.options,
      } : d)),
    )
  }

  const handleRegenerateUnpinned = async () => {
    setIsGenerating(true)
    try {
      const out = await generateScenario(generatorInput())
      setDecisions((prev) => {
        const pinned = prev.filter((d) => d.pinned)
        const slots = Math.max(0, questionCount - pinned.length)
        const fresh: ScenarioDecision[] = out.decisions.slice(0, slots).map((d) => ({
          id: d.id,
          prompt: d.prompt,
          capabilityKey: d.capabilityKey,
          difficulty: d.difficulty,
          options: d.options,
        }))
        return [...pinned, ...fresh]
      })
    } finally {
      setIsGenerating(false)
    }
  }

  /* ------------------------------- */
  /* Capability tally for review      */
  /* ------------------------------- */
  const capabilityTally = decisions.reduce<Record<string, number>>((acc, d) => {
    acc[d.capabilityKey] = (acc[d.capabilityKey] || 0) + 1
    return acc
  }, {})
  const capsTested = Object.keys(capabilityTally)

  const handleClose = () => {
    setIsOpen(false)
    setStep(1)
    setRoleTitle('')
    setAudienceNote('')
    setLevel(lockLevel ?? defaultLevelForCreator(creatorType))
    setGenericQs([DEFAULT_GENERIC(GENERIC_QUESTION_SUGGESTIONS[0])])
    setDecisions([
      DEFAULT_DECISION('judgement'),
      DEFAULT_DECISION('integrity'),
      DEFAULT_DECISION('execution'),
    ])
    setAccessCode('')
    setCopied(false)
  }

  /* ------------------------------- */
  /* Ship — emit the role             */
  /* ------------------------------- */
  const handleShip = () => {
    const code = `SCENARIO-${Date.now().toString(36).toUpperCase()}`
    setAccessCode(code)
    if (onRoleCreated) {
      onRoleCreated({
        id: code,
        name: roleTitle,
        accessCode: code,
        skills: capsTested.map((k) => getCapability(k)?.name || k),
        questionsCount: decisions.length,
        createdAt: new Date(),
        creatorType,
        variant: levelToVariant(level),
        genericQuestions: genericQs.filter((g) => g.prompt.trim().length > 0),
      })
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(accessCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  if (!isOpen) return null

  return (
    <div className="b2-shell" role="dialog" aria-label="Scenario builder">
      {/* Top bar — solid (not translucent) so content doesn't ghost through */}
      <header className="b2-top">
        <div className="b2-top-inner">
          <div className="b2-brand">
            <LaunchWordmark height={22} tone="dark" ariaLabel="LAUNCH" />
            <span className="b2-divider">·</span>
            <span className="b2-mono b2-muted">scenario builder</span>
          </div>
          <div className="b2-steps">
            {([1, 2, 3] as Step[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (s < step) setStep(s)
                  else if (s === 2 && step1Ready) setStep(2)
                  else if (s === 3 && step2Ready) setStep(3)
                }}
                className={`b2-step ${step === s ? 'is-active' : ''} ${step > s ? 'is-done' : ''}`}
                aria-current={step === s ? 'step' : undefined}
              >
                <span className="b2-step-n">{s}</span>
                <span className="b2-step-l">
                  {s === 1 ? 'Setup' : s === 2 ? 'Author' : 'Review & ship'}
                </span>
              </button>
            ))}
          </div>
          <button type="button" onClick={handleClose} aria-label="Close" className="b2-close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="b2-body">
        {step === 1 && (
          <Step1Setup
            roleTitle={roleTitle}
            setRoleTitle={setRoleTitle}
            audienceNote={audienceNote}
            setAudienceNote={setAudienceNote}
            level={level}
            setLevel={setLevel}
            lockLevel={lockLevel}
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            idealCriteria={idealCriteria}
            setIdealCriteria={setIdealCriteria}
            selectedAttributes={selectedAttributes}
            setSelectedAttributes={setSelectedAttributes}
            companyValues={companyValues}
            setCompanyValues={setCompanyValues}
            isCorp={creatorType === 'corporate'}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onSkipAI={() => step1Ready && setStep(2)}
            ready={step1Ready}
          />
        )}

        {step === 2 && (
          <Step2Author
            genericQs={genericQs}
            setGenericQs={setGenericQs}
            showGenericQuestions={showGenericQuestions}
            genericCollapsed={genericCollapsed}
            setGenericCollapsed={setGenericCollapsed}
            creatorType={creatorType}
            decisions={decisions}
            setDecisions={setDecisions}
            onRegenerateOne={handleRegenerateOne}
            onRegenerateUnpinned={handleRegenerateUnpinned}
            isGenerating={isGenerating}
            onBack={() => setStep(1)}
            onNext={() => step2Ready && setStep(3)}
            ready={step2Ready}
          />
        )}

        {step === 3 && (
          <Step3Review
            roleTitle={roleTitle}
            level={level}
            genericQs={genericQs}
            showGenericQuestions={showGenericQuestions}
            decisions={decisions}
            capabilityTally={capabilityTally}
            accessCode={accessCode}
            copied={copied}
            onCopy={copyCode}
            onBack={() => setStep(2)}
            onShip={handleShip}
            onClose={handleClose}
          />
        )}
      </main>

      <style>{`
        .b2-shell {
          position: fixed;
          inset: 0;
          z-index: 80;
          /* Slightly warmer/darker cream than panels so the b2-panel surfaces
             read as elevated above the canvas. */
          background: #efeae0;
          color: var(--lq-ink);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .b2-top {
          /* Solid bg — kills the "ghosting" effect when content scrolls under */
          background: #ffffff;
          border-bottom: 1px solid var(--lq-line);
          /* Drop-shadow gives a clear visual divide so the user always knows
             where the bar ends and content begins */
          box-shadow: 0 1px 0 rgba(10, 42, 107, 0.04), 0 6px 14px -10px rgba(10, 42, 107, 0.10);
          position: sticky; top: 0; z-index: 5;
        }
        .b2-top-inner {
          max-width: 1100px;
          margin: 0 auto;
          height: 64px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .b2-brand { display: flex; align-items: center; gap: 8px; }
        .b2-mono {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--lq-ink);
        }
        .b2-muted { color: var(--lq-ink-3); }
        .b2-divider { color: var(--lq-ink-3); }
        .b2-steps {
          flex: 1;
          display: flex;
          gap: 2px;
          justify-content: center;
        }
        .b2-step {
          background: transparent;
          border: none;
          padding: 8px 14px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--lq-ink-3);
          transition: background 160ms ease, color 160ms ease;
        }
        .b2-step:hover { color: var(--lq-ink-2); background: rgba(10,42,107,0.04); }
        .b2-step.is-active { color: var(--launch-navy); background: rgba(10,42,107,0.08); }
        .b2-step.is-done .b2-step-n { background: var(--launch-teal); color: var(--lq-ink); }
        .b2-step-n {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px; height: 22px;
          border-radius: 999px;
          background: rgba(10,42,107,0.10);
          color: var(--launch-navy);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
        }
        .b2-step.is-active .b2-step-n { background: var(--launch-navy); color: var(--lq-cream); }
        .b2-step-l {
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 13px;
          letter-spacing: -0.005em;
        }
        .b2-close {
          background: transparent;
          border: 1px solid var(--lq-line-2);
          border-radius: 999px;
          width: 32px; height: 32px;
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--lq-ink-2);
          cursor: pointer;
          transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
        }
        .b2-close:hover { color: var(--lq-ink); border-color: var(--launch-navy); background: #fff; }

        .b2-body {
          flex: 1;
          overflow-y: auto;
          /* No more 96px bottom — the foot used to be sticky and needed clearance.
             Now it's inline, so 48px is enough breathing room. */
          padding: 32px 24px 48px;
        }
        .b2-canvas { max-width: 880px; margin: 0 auto; }
        .b2-eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--launch-teal);
          margin-bottom: 12px;
        }
        .b2-h1 {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: clamp(28px, 3.4vw, 38px);
          letter-spacing: -0.018em;
          line-height: 1.1;
          color: var(--lq-ink);
          margin: 0 0 12px;
        }
        .b2-h2 {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 20px;
          letter-spacing: -0.012em;
          color: var(--lq-ink);
          margin: 0;
        }
        .b2-h3 {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 15px;
          letter-spacing: -0.005em;
          color: var(--lq-ink);
          margin: 0;
        }
        .b2-lede {
          color: var(--lq-ink-2);
          font-size: 16px;
          line-height: 1.55;
          margin: 0 0 28px;
          max-width: 60ch;
        }
        .b2-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
          display: block;
          margin-bottom: 8px;
        }
        .b2-input, .b2-textarea, .b2-select {
          width: 100%;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          border-radius: 10px;
          padding: 12px 14px;
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.45;
          color: var(--lq-ink);
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }
        .b2-input:focus, .b2-textarea:focus, .b2-select:focus {
          border-color: var(--launch-navy);
          box-shadow: 0 0 0 4px rgba(10, 42, 107, 0.08);
        }
        .b2-textarea { resize: vertical; min-height: 84px; }

        /* Card — white surface sitting on the tinted canvas. Soft shadow gives
           a tangible "object" feel so the partner sees each card as a discrete
           thing instead of a flat strip. */
        .b2-card {
          background: #fff;
          border: 1px solid var(--lq-line);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 12px;
          box-shadow: 0 1px 0 rgba(10, 42, 107, 0.02), 0 4px 14px -10px rgba(10, 42, 107, 0.08);
          transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
        }
        .b2-card:hover {
          border-color: var(--lq-line-2);
          box-shadow: 0 1px 0 rgba(10, 42, 107, 0.03), 0 8px 22px -12px rgba(10, 42, 107, 0.14);
        }

        /* Section panel — used to group a logical chunk of fields under a tinted
           parchment surface, so "Basics", "Shape", "Brief for the AI" each feel
           like their own zone instead of all sitting on flat cream.
           The :before adds an inner highlight for a soft top edge. */
        .b2-panel {
          background: #fbf8f1;
          border: 1px solid rgba(10, 42, 107, 0.06);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 22px;
          position: relative;
        }
        .b2-panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }
        .b2-panel-head h2.b2-h2 {
          line-height: 1.2;
        }
        /* Push the "required/optional" hint chip down to align with the h2 baseline */
        .b2-panel-hint {
          margin-top: 6px;
        }
        .b2-panel-head h2.b2-h2 { margin: 0; }
        .b2-panel-hint {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
        }

        .b2-section-title {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin: 28px 0 12px;
          gap: 16px;
        }

        .b2-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .b2-pill-teal { background: var(--launch-teal-soft); color: var(--launch-teal-3); }
        .b2-pill-navy { background: rgba(10, 42, 107, 0.06); color: var(--launch-navy); }

        .b2-btn {
          appearance: none;
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 10px 20px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          letter-spacing: -0.005em;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 160ms ease, color 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .b2-btn-primary {
          background: var(--launch-navy);
          color: var(--lq-cream);
          border-color: var(--launch-navy);
        }
        .b2-btn-primary:hover:not(:disabled) { background: var(--launch-navy-2); transform: translateY(-1px); }
        .b2-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .b2-btn-ghost {
          background: #fff;
          color: var(--lq-ink-2);
          border-color: var(--lq-line-2);
        }
        .b2-btn-ghost:hover { color: var(--lq-ink); border-color: var(--launch-navy); }
        .b2-btn-icon {
          background: transparent;
          border: 1px solid var(--lq-line-2);
          width: 32px; height: 32px;
          border-radius: 8px;
          display: inline-flex; align-items: center; justify-content: center;
          color: var(--lq-ink-3);
          cursor: pointer;
          transition: color 160ms ease, border-color 160ms ease;
        }
        .b2-btn-icon:hover { color: var(--lq-ink); border-color: var(--launch-navy); }

        /* Bottom CTA — INLINE (not sticky). The partner reaches it by
           scrolling to the end of the form; it doesn't float above content
           or ghost through anything. Solid white card with a soft shadow
           so it reads as "the action belongs to this page". */
        .b2-foot {
          background: #ffffff;
          border: 1px solid var(--lq-line);
          border-radius: 14px;
          padding: 16px 20px;
          margin: 28px 0 8px;
          box-shadow: 0 1px 0 rgba(10, 42, 107, 0.03), 0 4px 14px -10px rgba(10, 42, 107, 0.10);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .b2-foot-info {
          color: var(--lq-ink-3);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .b2-level {
          display: inline-flex;
          padding: 4px;
          border-radius: 999px;
          background: rgba(10, 42, 107, 0.05);
          border: 1px solid var(--lq-line);
        }
        .b2-level button {
          background: transparent;
          border: 1px solid transparent;
          padding: 8px 16px;
          border-radius: 999px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 13px;
          color: var(--lq-ink-2);
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease;
        }
        .b2-level button:hover:not(.is-active) { color: var(--lq-ink); }
        .b2-level button.is-active {
          background: var(--launch-navy);
          color: var(--lq-cream);
        }
        .b2-level button:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Collapsible section head */
        .b2-collapsible-head {
          appearance: none;
          background: transparent;
          border: 1px solid var(--lq-line);
          border-radius: 12px;
          padding: 14px 16px;
          width: 100%;
          margin: 28px 0 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-align: left;
          transition: background 160ms ease, border-color 160ms ease;
        }
        .b2-collapsible-head:hover { background: rgba(10, 42, 107, 0.03); border-color: var(--lq-line-2); }
        .b2-collapsible-caret {
          font-family: var(--font-mono);
          color: var(--lq-ink-3);
          font-size: 14px;
          width: 14px;
          display: inline-block;
        }
        .b2-collapsible-body { padding-top: 6px; }

        /* Disclosure — quiet expand/collapse button for tucked optional fields.
           Looks like a row, not a CTA, so the partner doesn't read it as
           something they "should" click. */
        .b2-disclosure {
          appearance: none;
          background: transparent;
          border: none;
          padding: 12px 0;
          margin: 4px 0 0;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 14px;
          color: var(--lq-ink-2);
          border-top: 1px dashed rgba(10, 42, 107, 0.12);
          transition: color 160ms ease;
        }
        .b2-disclosure:hover { color: var(--lq-ink); }
        .b2-disclosure-caret { transition: transform 200ms ease; color: var(--lq-ink-3); }
        .b2-disclosure-meta {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
        }
        .b2-disclosure-body {
          animation: b2-disclose 200ms ease-out;
        }
        @keyframes b2-disclose {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Section banner — numbered, eyebrow + title, count pill on the right.
           Visually anchors each of the two question sections (basic / launch)
           so partners always know which section they're in. */
        .b2-section-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          margin: 36px 0 14px;
          border-radius: 14px;
          border: 1px solid var(--lq-line-2);
        }
        .b2-section-banner-num {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 16px;
          color: var(--lq-cream);
        }
        .b2-section-banner-meta {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .b2-section-banner-eyebrow {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
        }
        .b2-section-banner-title {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 17px;
          color: var(--lq-ink);
        }
        .b2-section-banner-toggle {
          appearance: none;
          background: transparent;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 0;
          color: var(--lq-ink-2);
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.10em;
        }
        .b2-section-banner-toggle:hover { color: var(--launch-navy); }

        /* Section 1 — pre-qualifiers. Teal-tinted, optional feel. */
        .b2-section-banner-basic {
          background: var(--launch-teal-soft);
          border-color: rgba(27, 158, 143, 0.30);
        }
        .b2-section-banner-basic .b2-section-banner-num {
          background: var(--launch-teal-3);
        }

        /* Section 2 — scenario decisions. Navy-tinted, the main event. */
        .b2-section-banner-launch {
          background: rgba(10, 42, 107, 0.06);
          border-color: rgba(10, 42, 107, 0.18);
          margin-top: 48px; /* extra breathing room above this section */
        }
        .b2-section-banner-launch .b2-section-banner-num {
          background: var(--launch-navy);
        }

        /* Kind switcher inside an intake question card */
        .b2-kind-switch {
          display: inline-flex;
          padding: 3px;
          border-radius: 999px;
          background: rgba(10, 42, 107, 0.05);
          border: 1px solid var(--lq-line);
          gap: 2px;
        }
        .b2-kind-switch button {
          appearance: none;
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 999px;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 12px;
          letter-spacing: -0.005em;
          color: var(--lq-ink-2);
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease;
        }
        .b2-kind-switch button:hover { color: var(--lq-ink); }
        .b2-kind-switch button.is-active {
          background: var(--launch-navy);
          color: var(--lq-cream);
        }

        /* Shape cards for question count */
        .b2-shape-card {
          margin-bottom: 0;
          padding: 14px 16px;
          cursor: pointer;
          text-align: left;
        }

        /* Difficulty pill inline in question header */
        .b2-diff {
          display: inline-flex;
          padding: 2px;
          border-radius: 999px;
          background: rgba(10, 42, 107, 0.05);
          border: 1px solid var(--lq-line);
          gap: 2px;
        }
        .b2-diff button {
          appearance: none;
          background: transparent;
          border: none;
          padding: 4px 10px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
          cursor: pointer;
        }
        .b2-diff button:hover { color: var(--lq-ink); }
        .b2-diff button.is-active {
          background: var(--launch-navy);
          color: var(--lq-cream);
        }

        /* Why probe collapsible */
        .b2-probe {
          margin-top: 6px;
          border-top: 1px solid var(--lq-line);
          padding-top: 12px;
        }
        .b2-probe-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }
        .b2-probe-tag {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 999px;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-right: 8px;
          font-weight: 600;
        }
        .b2-probe-tag-support  { background: rgba(27, 158, 143, 0.16); color: var(--launch-teal-3); }
        .b2-probe-tag-neutral  { background: rgba(10, 42, 107, 0.08);   color: var(--launch-navy); }
        .b2-probe-tag-challenge{ background: rgba(122, 14, 42, 0.10);   color: #7a0e2a; }

        @keyframes b2spin { to { transform: rotate(360deg); } }
        .b2-spin {
          display: inline-flex;
          animation: b2spin 0.9s linear infinite;
        }

        .b2-tests {
          margin-top: 12px;
          padding: 12px 14px;
          background: rgba(27, 158, 143, 0.06);
          border-left: 2px solid var(--launch-teal);
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--lq-ink-2);
        }
        .b2-tests strong {
          color: var(--launch-teal-3);
          font-weight: 600;
        }
        .b2-tests-tap {
          font-size: 11px;
          font-family: var(--font-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--lq-ink-3);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 0 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .b2-tests-tap:hover { color: var(--lq-ink); }

        .b2-criterion {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          margin: 4px 4px 0 0;
          border-radius: 999px;
          background: #fff;
          border: 1px solid var(--lq-line-2);
          font-size: 12px;
          color: var(--lq-ink-2);
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
        }
        .b2-criterion:hover { color: var(--lq-ink); border-color: var(--launch-navy); }
        .b2-criterion.is-on {
          background: var(--launch-teal);
          color: var(--lq-ink);
          border-color: var(--launch-teal);
          font-weight: 600;
        }

        .b2-options { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 12px; }
        .b2-option-row { display: flex; align-items: center; gap: 10px; }
        .b2-option-bullet {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--launch-teal-3);
          width: 20px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Step 1 — Setup                                            */
/* -------------------------------------------------------- */

function Step1Setup({
  roleTitle, setRoleTitle, audienceNote, setAudienceNote, level, setLevel, lockLevel,
  questionCount, setQuestionCount, difficulty, setDifficulty,
  jobDescription, setJobDescription, idealCriteria, setIdealCriteria,
  selectedAttributes, setSelectedAttributes, companyValues, setCompanyValues,
  isCorp, isGenerating, onGenerate, onSkipAI, ready,
}: any) {

  const fileRef = useRef<HTMLInputElement | null>(null)
  /** "More details" disclosure for the optional Brief fields (Ideal criteria,
   *  Required attributes, Company values). JD stays visible by default — the
   *  rest tucks behind this so the panel doesn't dominate the page. */
  const [briefExpanded, setBriefExpanded] = useState(false)
  // Auto-expand once the partner has touched any of the tucked fields, so
  // pre-filled data is never hidden.
  useEffect(() => {
    if (idealCriteria || selectedAttributes.length > 0 || companyValues) {
      setBriefExpanded(true)
    }
  }, [idealCriteria, selectedAttributes.length, companyValues])
  const handleFile = async (file?: File | null) => {
    if (!file) return
    const text = await file.text()
    setJobDescription((prev: string) => (prev ? prev + '\n\n' : '') + text)
  }

  const toggleAttr = (key: string) => {
    setSelectedAttributes((prev: string[]) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const countOptions: { value: 3 | 6 | 9; label: string; sub: string }[] = [
    { value: 3, label: '3 decisions', sub: '~5 min · sharp' },
    { value: 6, label: '6 decisions', sub: '~10 min · standard' },
    { value: 9, label: '9 decisions', sub: '~15 min · deep' },
  ]

  return (
    <div className="b2-canvas">
      <div className="b2-eyebrow">Step 1 · Setup</div>
      <h1 className="b2-h1">What role are you building this for?</h1>
      <p className="b2-lede">
        Tell the AI as much as you can — the more context you give, the more
        grounded the generated questions will be. Everything below is optional
        except the role title.
      </p>

      {/* ----- Basics — required fields on a tinted panel ----- */}
      <section className="b2-panel">
        <div className="b2-panel-head">
          <h2 className="b2-h2">Basics</h2>
          <span className="b2-panel-hint">required</span>
        </div>
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr' }}>
        <div>
          <label className="b2-label" htmlFor="b2-role">Role title</label>
          <input
            id="b2-role"
            className="b2-input"
            placeholder="e.g. Graduate Analyst — Property, Brand Strategist, Investment Associate"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="b2-label" htmlFor="b2-audience">Audience note <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--lq-ink-3)' }}>(optional)</span></label>
          <textarea
            id="b2-audience"
            className="b2-textarea"
            placeholder="e.g. Graduate program candidates, looking for property or finance backgrounds, NSW intake."
            value={audienceNote}
            onChange={(e) => setAudienceNote(e.target.value)}
          />
        </div>

        <div>
          <label className="b2-label">Career stage register</label>
          <div className="b2-level" role="radiogroup" aria-label="Career stage">
            {(['early', 'advanced'] as ScenarioLevel[]).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={level === l}
                onClick={() => setLevel(l)}
                disabled={!!lockLevel}
                className={level === l ? 'is-active' : ''}
              >
                {levelLabel(l)}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--lq-ink-3)', maxWidth: '58ch' }}>
            {level === 'early'
              ? 'Story-led scenario interface with ambient context, decision beats, and a reflective bookend. Best for school cohorts and entry-level candidates.'
              : 'Clean question-and-answer interface — direct, square, calm. Best for senior candidates and corporate hiring loops.'}
          </p>
        </div>
        </div>
      </section>

      {/* ----- Shape — scenario size + difficulty on a tinted panel ----- */}
      <section className="b2-panel">
        <div className="b2-panel-head">
          <h2 className="b2-h2">Shape</h2>
          <span className="b2-panel-hint">required</span>
        </div>
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr' }}>
        <div>
          <label className="b2-label">How many scenario decisions?</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {countOptions.map((opt) => {
              const active = questionCount === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setQuestionCount(opt.value)}
                  className="b2-card b2-shape-card"
                  style={
                    active
                      ? { borderColor: 'var(--launch-navy)', background: 'rgba(10, 42, 107, 0.04)' }
                      : undefined
                  }
                >
                  <div className="b2-h3" style={{ color: active ? 'var(--launch-navy)' : 'var(--lq-ink)' }}>{opt.label}</div>
                  <div className="editorial-mono" style={{ color: 'var(--lq-ink-3)', marginTop: 4, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {opt.sub}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="b2-label">Difficulty</label>
          <div className="b2-level" role="radiogroup" aria-label="Difficulty">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={difficulty === d ? 'is-active' : ''}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--lq-ink-3)', maxWidth: '58ch' }}>
            {difficulty === 'easy' && 'Recognition-level — there’s a recognisably right answer. Best for early-grad screens.'}
            {difficulty === 'medium' && 'Trade-off-level — sensible candidates can disagree. Standard.'}
            {difficulty === 'hard' && 'Ambiguity-level — every option costs something. Best for senior probes. Triggers follow-up "why" probes by default.'}
          </p>
        </div>
        </div>
      </section>

      {/* ----- Brief — all optional. JD always visible; the rest tucked behind
              a "More details" disclosure so the panel doesn't dominate. ----- */}
      <section className="b2-panel">
        <div className="b2-panel-head">
          <div>
            <h2 className="b2-h2">Brief for the AI</h2>
            <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, marginTop: 6, marginBottom: 0, maxWidth: '60ch' }}>
              The more you give, the sharper the generated questions.
            </p>
          </div>
          <span className="b2-panel-hint">optional</span>
        </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
            <label className="b2-label" htmlFor="b2-jd" style={{ margin: 0 }}>Job description</label>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.rtf"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              className="b2-btn b2-btn-ghost"
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => fileRef.current?.click()}
            >
              Upload .txt
            </button>
          </div>
          <textarea
            id="b2-jd"
            className="b2-textarea"
            style={{ minHeight: 160 }}
            placeholder="Paste the JD here. The AI uses this to ground the scenario in the role's real world."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        {/* More details — tucked behind a disclosure so the panel reads
            "JD + an option to add more" instead of a wall of fields. */}
        <div>
          <button
            type="button"
            className="b2-disclosure"
            onClick={() => setBriefExpanded(v => !v)}
            aria-expanded={briefExpanded}
          >
            <ChevronDown
              className="b2-disclosure-caret w-4 h-4"
              style={{ transform: briefExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
            />
            <span>More details</span>
            <span className="b2-disclosure-meta">
              {[
                idealCriteria && 'ideal',
                selectedAttributes.length > 0 && `${selectedAttributes.length} attribute${selectedAttributes.length === 1 ? '' : 's'}`,
                companyValues && 'values',
              ].filter(Boolean).join(' · ') || 'ideal candidate · attributes · values'}
            </span>
          </button>
          {briefExpanded && (
            <div className="b2-disclosure-body" style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr', marginTop: 16 }}>
        <div>
          <label className="b2-label" htmlFor="b2-ideal">Ideal candidate criteria <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--lq-ink-3)' }}>(optional)</span></label>
          <textarea
            id="b2-ideal"
            className="b2-textarea"
            placeholder="e.g. Graduated within the last two years, property or finance degree preferred, can show industry engagement (internships, society involvement, etc)."
            value={idealCriteria}
            onChange={(e) => setIdealCriteria(e.target.value)}
          />
        </div>

        <div>
          <label className="b2-label">Required attributes <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--lq-ink-3)' }}>(pick any number)</span></label>
          <p style={{ color: 'var(--lq-ink-3)', fontSize: 12, marginTop: 0, marginBottom: 10 }}>
            Each attribute maps onto a measured capability under the hood. The AI uses your picks to weight what the scenario tests.
          </p>
          <div>
            {ATTRIBUTES.map((a) => {
              const on = selectedAttributes.includes(a.key)
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAttr(a.key)}
                  className={`b2-criterion ${on ? 'is-on' : ''}`}
                  title={a.description}
                >
                  {on ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {a.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="b2-label" htmlFor="b2-values">Company values <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--lq-ink-3)' }}>(optional)</span></label>
          <textarea
            id="b2-values"
            className="b2-textarea"
            placeholder="e.g. Pride in service, integrity, collaboration, do the right thing. Will shape soft-signal questions."
            value={companyValues}
            onChange={(e) => setCompanyValues(e.target.value)}
          />
        </div>
            </div>
          )}
        </div>
      </div>
      </section>

      <div className="b2-foot">
        <span className="b2-foot-info">Step 1 of 3 · setup</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="b2-btn b2-btn-ghost"
            onClick={onSkipAI}
            disabled={!ready || isGenerating}
            title="Skip the AI and author from scratch"
          >
            Author manually
          </button>
          <button
            type="button"
            className="b2-btn b2-btn-primary"
            onClick={onGenerate}
            disabled={!ready || isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="b2-spin"><RefreshCcw className="w-4 h-4" /></span>
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Step 2 — Author (generic + scenario)                      */
/* -------------------------------------------------------- */

function Step2Author({
  genericQs, setGenericQs, showGenericQuestions, genericCollapsed, setGenericCollapsed, creatorType,
  decisions, setDecisions, onRegenerateOne, onRegenerateUnpinned, isGenerating,
  onBack, onNext, ready,
}: any) {
  const addGeneric = (kind: 'open-text' | 'hard-filter' = 'open-text') => {
    setGenericQs((prev: GenericIntakeQuestion[]) => [...prev, DEFAULT_GENERIC('', kind)])
  }
  const removeGeneric = (id: string) => {
    setGenericQs((prev: GenericIntakeQuestion[]) => prev.filter((q) => q.id !== id))
  }
  const updateGeneric = (id: string, patch: Partial<GenericIntakeQuestion>) => {
    setGenericQs((prev: GenericIntakeQuestion[]) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    )
  }
  const setGenericKind = (id: string, kind: 'open-text' | 'hard-filter') => {
    setGenericQs((prev: GenericIntakeQuestion[]) =>
      prev.map((q) => {
        if (q.id !== id) return q
        return {
          ...q,
          kind,
          // Reset the irrelevant fields so we don't carry stale data forwards.
          criterionIds: kind === 'open-text' ? q.criterionIds : [],
          allowedAnswers: kind === 'hard-filter' ? (q.allowedAnswers && q.allowedAnswers.length > 0 ? q.allowedAnswers : ['', '', '']) : undefined,
        }
      })
    )
  }
  const updateAllowedAnswer = (id: string, idx: number, val: string) => {
    setGenericQs((prev: GenericIntakeQuestion[]) =>
      prev.map((q) => {
        if (q.id !== id) return q
        const next = [...(q.allowedAnswers || [])]
        next[idx] = val
        return { ...q, allowedAnswers: next }
      })
    )
  }
  const addAllowedAnswer = (id: string) => {
    setGenericQs((prev: GenericIntakeQuestion[]) =>
      prev.map((q) => (q.id === id ? { ...q, allowedAnswers: [...(q.allowedAnswers || []), ''] } : q))
    )
  }
  const removeAllowedAnswer = (id: string, idx: number) => {
    setGenericQs((prev: GenericIntakeQuestion[]) =>
      prev.map((q) => {
        if (q.id !== id) return q
        const next = (q.allowedAnswers || []).filter((_, i) => i !== idx)
        return { ...q, allowedAnswers: next.length > 0 ? next : ['', '', ''] }
      })
    )
  }
  const toggleCriterion = (qid: string, cid: string) => {
    setGenericQs((prev: GenericIntakeQuestion[]) =>
      prev.map((q) => {
        if (q.id !== qid) return q
        const has = q.criterionIds.includes(cid)
        return {
          ...q,
          criterionIds: has
            ? q.criterionIds.filter((c) => c !== cid)
            : [...q.criterionIds, cid],
        }
      })
    )
  }

  const isCorp = creatorType === 'corporate'
  const sectionTitle = isCorp ? 'Pre-qualifier questions' : 'Generic intake questions'
  const sectionLede = isCorp
    ? 'Optional pre-screen questions the candidate answers before the scenario. Hard filters set a clear bar (graduation, degree, location); open-text questions get AI-scored against the criteria you tick. We’ve pre-filled a few suggestions from the role — edit, remove, or add your own.'
    : 'Free-response questions the candidate answers before the scenario. Pick AI criteria for each — you’ll see a 0–10 score and a one-line rationale per answer on the candidate report.'
  const hardCount = genericQs.filter((g: GenericIntakeQuestion) => (g.kind || 'open-text') === 'hard-filter').length
  const softCount = genericQs.length - hardCount

  const addDecision = () => {
    setDecisions((prev: ScenarioDecision[]) => [...prev, DEFAULT_DECISION('reasoning')])
  }
  const removeDecision = (id: string) => {
    setDecisions((prev: ScenarioDecision[]) => prev.filter((d) => d.id !== id))
  }
  const updateDecision = (id: string, patch: Partial<ScenarioDecision>) => {
    setDecisions((prev: ScenarioDecision[]) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    )
  }
  const updateDecisionOption = (id: string, optId: string, text: string) => {
    setDecisions((prev: ScenarioDecision[]) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, options: d.options.map((o) => (o.id === optId ? { ...o, text } : o)) }
          : d
      )
    )
  }

  return (
    <div className="b2-canvas">
      <div className="b2-eyebrow">Step 2 · Author</div>
      <h1 className="b2-h1">Build the questions.</h1>
      <p className="b2-lede">
        {showGenericQuestions
          ? 'Two sections. Pre-qualifier questions run before the scenario as a quick screen — optional. Scenario decisions are the live moments where capability shows up.'
          : 'Scenario decisions are the live moments where capability shows up. Each question shows what it tests so you always know what you’re measuring.'}
      </p>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 — Pre-qualifier intake questions (BASIC).
          Tagged "Optional" so partners know they can skip it.
          Collapsed by default for corporates; open for teachers.
          ───────────────────────────────────────────────────────────── */}
      {showGenericQuestions && (<>
      <div className="b2-section-banner b2-section-banner-basic">
        <div className="b2-section-banner-num">1</div>
        <div className="b2-section-banner-meta">
          <div className="b2-section-banner-eyebrow">Optional · before the scenario</div>
          <div className="b2-section-banner-title">{sectionTitle}</div>
        </div>
        <button
          type="button"
          className="b2-section-banner-toggle"
          onClick={() => setGenericCollapsed(!genericCollapsed)}
          aria-expanded={!genericCollapsed}
        >
          <span className="b2-pill b2-pill-teal">
            {isCorp ? `${hardCount} filter · ${softCount} open` : `${genericQs.length} question${genericQs.length === 1 ? '' : 's'}`}
          </span>
          <span className="b2-collapsible-caret" aria-hidden>{genericCollapsed ? '▾ Expand' : '▴ Collapse'}</span>
        </button>
      </div>

      {!genericCollapsed && (
        <div className="b2-collapsible-body">
          <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, marginTop: 0, marginBottom: 16, maxWidth: '64ch' }}>
            {sectionLede}
          </p>

          {genericQs.map((q: GenericIntakeQuestion, idx: number) => {
            const kind = (q.kind || 'open-text')
            return (
              <div key={q.id} className="b2-card">
                <div className="b2-section-title" style={{ marginTop: 0, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 className="b2-h3">Question {idx + 1}</h3>
                    <span
                      className="b2-pill"
                      style={{
                        background: kind === 'hard-filter' ? 'rgba(10, 42, 107, 0.10)' : 'var(--launch-teal-soft)',
                        color: kind === 'hard-filter' ? 'var(--launch-navy)' : 'var(--launch-teal-3)',
                      }}
                    >
                      {kind === 'hard-filter' ? 'Hard filter · multiple choice' : 'Open text · AI scored'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGeneric(q.id)}
                    className="b2-btn-icon"
                    aria-label="Remove question"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Kind switcher */}
                <div className="b2-kind-switch" role="radiogroup" aria-label="Question type">
                  {(['open-text', 'hard-filter'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={kind === k}
                      onClick={() => setGenericKind(q.id, k)}
                      className={kind === k ? 'is-active' : ''}
                    >
                      {k === 'open-text' ? 'Open text (AI scored)' : 'Hard filter (multiple choice)'}
                    </button>
                  ))}
                </div>

                <input
                  className="b2-input"
                  style={{ marginTop: 12 }}
                  placeholder={kind === 'hard-filter' ? 'e.g. When did you graduate?' : 'e.g. Why are you interested in this role?'}
                  value={q.prompt}
                  onChange={(e) => updateGeneric(q.id, { prompt: e.target.value })}
                />

                {kind === 'open-text' ? (
                  <div style={{ marginTop: 16 }}>
                    <span className="b2-label">AI looks for</span>
                    <div>
                      {CRITERION_TEMPLATES.map((c) => {
                        const on = q.criterionIds.includes(c.id)
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCriterion(q.id, c.id)}
                            className={`b2-criterion ${on ? 'is-on' : ''}`}
                            title={c.hint}
                          >
                            {on ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            {c.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 16 }}>
                    <span className="b2-label">Allowed answers</span>
                    <p style={{ color: 'var(--lq-ink-3)', fontSize: 12, marginTop: 0, marginBottom: 10 }}>
                      Candidates pick one. Anyone who picks none of these (or skips) is auto-flagged on the Submissions list — they still get to play.
                    </p>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {(q.allowedAnswers || []).map((ans, ai) => (
                        <div key={ai} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span className="b2-option-bullet">{String.fromCharCode(65 + ai)}</span>
                          <input
                            className="b2-input"
                            placeholder={`Option ${String.fromCharCode(65 + ai)}`}
                            value={ans}
                            onChange={(e) => updateAllowedAnswer(q.id, ai, e.target.value)}
                          />
                          {(q.allowedAnswers || []).length > 2 && (
                            <button
                              type="button"
                              className="b2-btn-icon"
                              onClick={() => removeAllowedAnswer(q.id, ai)}
                              aria-label="Remove option"
                              title="Remove option"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="b2-btn b2-btn-ghost"
                      style={{ marginTop: 8 }}
                      onClick={() => addAllowedAnswer(q.id)}
                    >
                      <Plus className="w-4 h-4" /> Add option
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="b2-btn b2-btn-ghost" onClick={() => addGeneric('open-text')}>
              <Plus className="w-4 h-4" /> Open text question
            </button>
            <button type="button" className="b2-btn b2-btn-ghost" onClick={() => addGeneric('hard-filter')}>
              <Plus className="w-4 h-4" /> Hard filter
            </button>
          </div>
        </div>
      )}
      </>)}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 — Scenario decisions (LAUNCH). The main event.
          Always open; can't be skipped.
          ───────────────────────────────────────────────────────────── */}
      <div className="b2-section-banner b2-section-banner-launch">
        <div className="b2-section-banner-num">{showGenericQuestions ? 2 : 1}</div>
        <div className="b2-section-banner-meta">
          <div className="b2-section-banner-eyebrow">Required · the live scenario</div>
          <div className="b2-section-banner-title">Scenario decisions</div>
        </div>
        <span className="b2-pill b2-pill-navy" style={{ marginLeft: 'auto' }}>
          {decisions.length} question{decisions.length === 1 ? '' : 's'}
        </span>
      </div>
      <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, marginTop: 0, marginBottom: 16, maxWidth: '60ch' }}>
        The live moments inside the scenario. Each tests one capability —
        pick which capability, write the prompt, write the three options.
      </p>

      {decisions.map((d: ScenarioDecision, idx: number) => {
        const cap = getCapability(d.capabilityKey)
        const treeOpts = d.options.filter((o) => o.followUp).length
        return (
          <div key={d.id} className="b2-card">
            <div className="b2-section-title" style={{ marginTop: 0, marginBottom: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h3 className="b2-h3">Question {idx + 1}</h3>
                <DifficultyPill
                  value={d.difficulty}
                  onChange={(v) => updateDecision(d.id, { difficulty: v })}
                />
                {treeOpts > 0 && (
                  <span className="b2-pill" style={{ background: 'rgba(10,42,107,0.06)', color: 'var(--launch-navy)' }}>
                    Tree · {treeOpts}/{d.options.length} branches
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => updateDecision(d.id, { pinned: !d.pinned })}
                  className="b2-btn-icon"
                  aria-label={d.pinned ? 'Unpin question' : 'Pin question (keep on regenerate)'}
                  title={d.pinned ? 'Unpin question' : 'Pin question — kept when you regenerate the others'}
                  style={d.pinned ? { background: 'rgba(27, 158, 143, 0.16)', borderColor: 'var(--launch-teal)', color: 'var(--launch-teal-3)' } : undefined}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRegenerateOne && onRegenerateOne(d.id)}
                  className="b2-btn-icon"
                  aria-label="Regenerate this question with AI"
                  title="Regenerate this question with AI"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
                {decisions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDecision(d.id)}
                    className="b2-btn-icon"
                    aria-label="Remove question"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div>
                <label className="b2-label">Tests this capability</label>
                <select
                  className="b2-select"
                  value={d.capabilityKey}
                  onChange={(e) => updateDecision(d.id, { capabilityKey: e.target.value })}
                >
                  {CAPABILITIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {cap && (
                  <div className="b2-tests">
                    <strong>How we measure it:</strong> {cap.measure}
                  </div>
                )}
              </div>

              <div>
                <label className="b2-label">Prompt</label>
                <textarea
                  className="b2-textarea"
                  placeholder="Set the live moment. e.g. You have 18 minutes until you walk into the room. Two of your stakeholders disagree. What's your first call?"
                  value={d.prompt}
                  onChange={(e) => updateDecision(d.id, { prompt: e.target.value })}
                />
              </div>

              <div>
                <label className="b2-label">Options &amp; follow-up tree</label>
                <p style={{ color: 'var(--lq-ink-3)', fontSize: 12, marginTop: 0, marginBottom: 8 }}>
                  Each option can carry its OWN follow-up branch — a "why did you choose THIS?" probe with three leaning-tagged sub-choices (<strong style={{ color: 'var(--launch-teal-3)' }}>support</strong> · <strong style={{ color: 'var(--launch-navy)' }}>neutral</strong> · <strong style={{ color: '#7a0e2a' }}>challenge</strong>). Add branches selectively or to all options.
                </p>
                <div className="b2-options">
                  {d.options.map((o, oi) => (
                    <OptionRowWithTree
                      key={o.id}
                      bullet={String.fromCharCode(65 + oi)}
                      option={o}
                      optionIndex={oi}
                      onChangeText={(text) => updateDecisionOption(d.id, o.id, text)}
                      onAddTree={() => updateDecision(d.id, {
                        options: d.options.map((opt, j) => j === oi ? { ...opt, followUp: EMPTY_OPTION_FOLLOWUP(oi) } : opt),
                      })}
                      onChangeTree={(fu) => updateDecision(d.id, {
                        options: d.options.map((opt, j) => j === oi ? { ...opt, followUp: fu } : opt),
                      })}
                      onRemoveTree={() => updateDecision(d.id, {
                        options: d.options.map((opt, j) => j === oi ? { ...opt, followUp: undefined } : opt),
                      })}
                    />
                  ))}
                </div>
                {treeOpts === 0 && (
                  <button
                    type="button"
                    className="b2-btn b2-btn-ghost"
                    style={{ marginTop: 8 }}
                    onClick={() => updateDecision(d.id, {
                      options: d.options.map((opt, j) => ({ ...opt, followUp: EMPTY_OPTION_FOLLOWUP(j) })),
                    })}
                  >
                    <Plus className="w-4 h-4" /> Add follow-up branches to all options
                  </button>
                )}
                {treeOpts > 0 && treeOpts < d.options.length && (
                  <button
                    type="button"
                    className="b2-btn b2-btn-ghost"
                    style={{ marginTop: 8 }}
                    onClick={() => updateDecision(d.id, {
                      options: d.options.map((opt, j) => opt.followUp ? opt : { ...opt, followUp: EMPTY_OPTION_FOLLOWUP(j) }),
                    })}
                  >
                    <Plus className="w-4 h-4" /> Add branches to remaining options
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <button type="button" className="b2-btn b2-btn-ghost" onClick={addDecision}>
          <Plus className="w-4 h-4" /> Add a scenario question
        </button>
        {onRegenerateUnpinned && (
          <button
            type="button"
            className="b2-btn b2-btn-ghost"
            onClick={onRegenerateUnpinned}
            disabled={isGenerating}
            title="Regenerate everything that isn't pinned"
          >
            <RefreshCcw className="w-4 h-4" /> Regenerate unpinned
          </button>
        )}
      </div>

      <div className="b2-foot">
        <button type="button" className="b2-btn b2-btn-ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          className="b2-btn b2-btn-primary"
          onClick={onNext}
          disabled={!ready}
        >
          Review & ship <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Step 3 — Review & ship                                    */
/* -------------------------------------------------------- */

function Step3Review({
  roleTitle, level, genericQs, showGenericQuestions, decisions, capabilityTally, accessCode, copied, onCopy, onBack, onShip, onClose,
}: any) {
  return (
    <div className="b2-canvas">
      <div className="b2-eyebrow">Step 3 · Review &amp; ship</div>
      <h1 className="b2-h1">Here&rsquo;s the scenario.</h1>
      <p className="b2-lede">
        Quick check before you generate the access code. Capability map shows
        exactly what each question contributes to the candidate report.
      </p>

      <div className="b2-card">
        <h2 className="b2-h2">{roleTitle}</h2>
        <p style={{ color: 'var(--lq-ink-3)', fontSize: 13, marginTop: 6 }}>
          {levelLabel(level)} register · {decisions.length} scenario question{decisions.length === 1 ? '' : 's'}
          {showGenericQuestions ? ` · ${genericQs.length} intake question${genericQs.length === 1 ? '' : 's'}` : ''}
        </p>
      </div>

      <div className="b2-section-title"><h2 className="b2-h2">Capabilities being tested</h2></div>
      <div>
        {Object.entries(capabilityTally).map(([key, count]: any) => {
          const cap = getCapability(key)
          if (!cap) return null
          return (
            <div className="b2-card" key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <span className="b2-pill b2-pill-teal" style={{ marginTop: 2 }}>{cap.short}</span>
              <div style={{ flex: 1 }}>
                <div className="b2-h3">{cap.name}</div>
                <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, lineHeight: 1.55, margin: '6px 0 0' }}>
                  <strong style={{ color: 'var(--lq-ink)', fontWeight: 600 }}>How we measure it:</strong> {cap.measure}
                </p>
                <span style={{ marginTop: 8, display: 'inline-block', color: 'var(--lq-ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {count} question{count === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {showGenericQuestions && genericQs.filter((g: GenericIntakeQuestion) => g.prompt.trim()).length > 0 && (
        <>
          <div className="b2-section-title"><h2 className="b2-h2">Intake questions &amp; AI criteria</h2></div>
          {genericQs
            .filter((g: GenericIntakeQuestion) => g.prompt.trim())
            .map((g: GenericIntakeQuestion, i: number) => (
              <div className="b2-card" key={g.id}>
                <div className="b2-h3">Q{i + 1}. {g.prompt}</div>
                <div style={{ marginTop: 10 }}>
                  {g.criterionIds.length === 0 ? (
                    <span style={{ color: 'var(--lq-ink-3)', fontSize: 13 }}>
                      No AI criteria selected — answers will be stored unscored.
                    </span>
                  ) : (
                    g.criterionIds.map((cid) => {
                      const c = CRITERION_TEMPLATES.find((x) => x.id === cid)
                      if (!c) return null
                      return (
                        <span key={cid} className="b2-criterion is-on" style={{ cursor: 'default' }}>
                          <Check className="w-3 h-3" /> {c.label}
                        </span>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
        </>
      )}

      {/* Ship / code */}
      {!accessCode ? (
        <div className="b2-foot">
          <button type="button" className="b2-btn b2-btn-ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button type="button" className="b2-btn b2-btn-primary" onClick={onShip}>
            Generate access code
          </button>
        </div>
      ) : (
        <div className="b2-card" style={{ background: 'rgba(27,158,143,0.06)', borderColor: 'rgba(27, 158, 143, 0.32)' }}>
          <div className="b2-eyebrow">Access code</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--launch-teal-3)', marginBottom: 12 }}>
            {accessCode}
          </div>
          <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, marginBottom: 14 }}>
            Share this code with your candidates. They enter it on the Play
            door to launch this scenario.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="b2-btn b2-btn-primary" onClick={onCopy}>
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy code</>}
            </button>
            <button type="button" className="b2-btn b2-btn-ghost" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


/* -------------------------------------------------------- */
/* Inline helpers: difficulty pill + why-probe collapsible  */
/* -------------------------------------------------------- */

function DifficultyPill({ value, onChange }: { value: Difficulty; onChange: (v: Difficulty) => void }) {
  return (
    <div className="b2-diff" role="radiogroup" aria-label="Question difficulty">
      {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
        <button
          key={d}
          type="button"
          role="radio"
          aria-checked={value === d}
          onClick={() => onChange(d)}
          className={value === d ? "is-active" : ""}
        >
          {d}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------- */
/* Per-option follow-up branch row                          */
/* -------------------------------------------------------- */

interface OptionRowWithTreeProps {
  bullet: string
  option: DecisionOption
  optionIndex: number
  onChangeText: (text: string) => void
  onAddTree: () => void
  onChangeTree: (fu: NonNullable<DecisionOption["followUp"]>) => void
  onRemoveTree: () => void
}

function OptionRowWithTree({ bullet, option, optionIndex, onChangeText, onAddTree, onChangeTree, onRemoveTree }: OptionRowWithTreeProps) {
  const [open, setOpen] = useState(false)
  const fu = option.followUp
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="b2-option-row" style={{ alignItems: "center" }}>
        <span className="b2-option-bullet">{bullet}</span>
        <input
          className="b2-input"
          placeholder={`Option ${bullet}`}
          value={option.text}
          onChange={(e) => onChangeText(e.target.value)}
        />
        {!fu ? (
          <button
            type="button"
            className="b2-btn b2-btn-ghost"
            style={{ padding: "6px 10px", fontSize: 12 }}
            onClick={onAddTree}
            title="Add a follow-up branch under this option"
          >
            <Plus className="w-3.5 h-3.5" /> Branch
          </button>
        ) : (
          <button
            type="button"
            className="b2-btn-icon"
            aria-label={open ? "Collapse branch" : "Expand branch"}
            title={open ? "Collapse branch" : "Expand branch"}
            onClick={() => setOpen(!open)}
            style={{ background: "rgba(10, 42, 107, 0.06)", borderColor: "var(--launch-navy)", color: "var(--launch-navy)" }}
          >
            <span style={{ fontFamily: "var(--font-mono)" }}>{open ? "▾" : "▸"}</span>
          </button>
        )}
      </div>

      {/* Per-option follow-up tree body */}
      {fu && open && (
        <div style={{ marginTop: 6, marginLeft: 28, padding: "12px 14px", borderLeft: "2px solid var(--launch-navy)", background: "rgba(10, 42, 107, 0.03)", borderRadius: 6 }}>
          <div className="b2-probe-head" style={{ marginBottom: 6 }}>
            <span className="b2-label" style={{ margin: 0 }}>Follow-up if {bullet} is picked</span>
            <button type="button" className="b2-btn-icon" aria-label="Remove branch" title="Remove this branch" onClick={onRemoveTree}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            className="b2-input"
            placeholder="e.g. Why did you choose to delay the launch?"
            value={fu.prompt}
            onChange={(e) => onChangeTree({ ...fu, prompt: e.target.value })}
          />
          <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
            {fu.choices.map((c, idx) => (
              <div key={c.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`b2-probe-tag b2-probe-tag-${c.leaning}`}>{c.leaning}</span>
                  <input
                    className="b2-input"
                    placeholder={`${c.leaning} answer`}
                    value={c.text}
                    onChange={(e) => onChangeTree({
                      ...fu,
                      choices: fu.choices.map((cc, i) => i === idx ? { ...cc, text: e.target.value } : cc),
                    })}
                  />
                </div>
                <input
                  className="b2-input"
                  style={{ marginTop: 4, fontSize: 12, padding: "8px 12px", color: "var(--lq-ink-3)", fontStyle: "italic" }}
                  placeholder="Reasoning note (optional — shown to the partner reviewing results)"
                  value={c.reasoning || ""}
                  onChange={(e) => onChangeTree({
                    ...fu,
                    choices: fu.choices.map((cc, i) => i === idx ? { ...cc, reasoning: e.target.value } : cc),
                  })}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

