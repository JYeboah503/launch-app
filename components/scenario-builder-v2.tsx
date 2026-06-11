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
import { X, ChevronLeft, ChevronRight, Plus, Trash2, Copy, Check, Info } from 'lucide-react'
import type { CreatorType, ScenarioLevel, ScenarioVariant } from '@/lib/roles'
import { levelToVariant, defaultLevelForCreator, levelLabel } from '@/lib/roles'
import {
  CAPABILITIES,
  CRITERION_TEMPLATES,
  GENERIC_QUESTION_SUGGESTIONS,
  getCapability,
} from '@/lib/builderData'
import type { GenericIntakeQuestion } from '@/lib/play/types'

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
  options: { id: string; text: string }[]
}

const DEFAULT_DECISION = (capKey = 'judgement'): ScenarioDecision => ({
  id: `q-${Math.random().toString(36).slice(2, 8)}`,
  prompt: '',
  capabilityKey: capKey,
  options: [
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
  ],
})

const DEFAULT_GENERIC = (prompt = ''): GenericIntakeQuestion => ({
  id: `g-${Math.random().toString(36).slice(2, 8)}`,
  prompt,
  criterionIds: [],
})

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

  // step 2 — generic intake questions (corporates skip this; teachers + self
  // see it seeded with one suggestion to make it discoverable).
  const [genericQs, setGenericQs] = useState<GenericIntakeQuestion[]>(
    showGenericQuestions ? [DEFAULT_GENERIC(GENERIC_QUESTION_SUGGESTIONS[0])] : []
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
      {/* Top bar */}
      <header className="b2-top">
        <div className="b2-top-inner">
          <div className="b2-brand">
            <span className="b2-mono">LAUNCH</span>
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
            onNext={() => step1Ready && setStep(2)}
            ready={step1Ready}
          />
        )}

        {step === 2 && (
          <Step2Author
            genericQs={genericQs}
            setGenericQs={setGenericQs}
            showGenericQuestions={showGenericQuestions}
            decisions={decisions}
            setDecisions={setDecisions}
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
          background: #f8f6f0;
          color: var(--lq-ink);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .b2-top {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--lq-line);
          position: sticky; top: 0; z-index: 5;
        }
        .b2-top-inner {
          max-width: 1100px;
          margin: 0 auto;
          height: 56px;
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
          padding: 32px 24px 96px;
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

        .b2-card {
          background: #fff;
          border: 1px solid var(--lq-line);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 12px;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }
        .b2-card:hover { border-color: var(--lq-line-2); }
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

        .b2-foot {
          position: sticky;
          bottom: 0;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid var(--lq-line);
          padding: 14px 24px;
          margin: 32px -24px -96px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .b2-foot-info { color: var(--lq-ink-3); font-size: 13px; }

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
  onNext, ready,
}: any) {
  return (
    <div className="b2-canvas">
      <div className="b2-eyebrow">Step 1 · Setup</div>
      <h1 className="b2-h1">What role are you building this for?</h1>
      <p className="b2-lede">
        Set the role and the audience. Pick the career stage register the
        scenario will run in — early career (story-led) or advanced career
        (clean Q&amp;A).
      </p>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr' }}>
        <div>
          <label className="b2-label" htmlFor="b2-role">Role title</label>
          <input
            id="b2-role"
            className="b2-input"
            placeholder="e.g. Real Estate Analyst, Brand Strategist, Investment Associate"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="b2-label" htmlFor="b2-audience">Who is this for? <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--lq-ink-3)' }}>(optional)</span></label>
          <textarea
            id="b2-audience"
            className="b2-textarea"
            placeholder="e.g. Graduate-level applicants, 0–2 years experience, looking for first analyst hires."
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

      <div className="b2-foot">
        <span className="b2-foot-info">Step 1 of 3 · setup</span>
        <button
          type="button"
          className="b2-btn b2-btn-primary"
          onClick={onNext}
          disabled={!ready}
        >
          Continue to Author <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- */
/* Step 2 — Author (generic + scenario)                      */
/* -------------------------------------------------------- */

function Step2Author({
  genericQs, setGenericQs, showGenericQuestions, decisions, setDecisions, onBack, onNext, ready,
}: any) {
  const addGeneric = () => {
    setGenericQs((prev: GenericIntakeQuestion[]) => [...prev, DEFAULT_GENERIC('')])
  }
  const removeGeneric = (id: string) => {
    setGenericQs((prev: GenericIntakeQuestion[]) => prev.filter((q) => q.id !== id))
  }
  const updateGeneric = (id: string, patch: Partial<GenericIntakeQuestion>) => {
    setGenericQs((prev: GenericIntakeQuestion[]) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
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
          ? 'Generic intake questions come first and run before the scenario. Scenario decisions are the live moments where capability shows up. Each scenario question shows what it tests so you always know what you’re measuring.'
          : 'Scenario decisions are the live moments where capability shows up. Each question shows what it tests so you always know what you’re measuring.'}
      </p>

      {/* Generic intake questions — hidden when the parent has opted out
          (e.g. partner / corporate builder). */}
      {showGenericQuestions && (<>
      <div className="b2-section-title">
        <h2 className="b2-h2">Generic intake questions</h2>
        <span className="b2-pill b2-pill-teal">Before scenario · open text</span>
      </div>
      <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, marginTop: 0, marginBottom: 16, maxWidth: '60ch' }}>
        Free-response questions the candidate answers before they enter the
        scenario. Pick AI criteria for each — you&rsquo;ll see a 0&ndash;10 score and
        a one-line rationale per answer on the candidate report.
      </p>

      {genericQs.map((q: GenericIntakeQuestion, idx: number) => (
        <div key={q.id} className="b2-card">
          <div className="b2-section-title" style={{ marginTop: 0, marginBottom: 10 }}>
            <h3 className="b2-h3">Question {idx + 1}</h3>
            {genericQs.length > 1 && (
              <button
                type="button"
                onClick={() => removeGeneric(q.id)}
                className="b2-btn-icon"
                aria-label="Remove question"
                title="Remove question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <input
            className="b2-input"
            placeholder="e.g. Why are you interested in this role?"
            value={q.prompt}
            onChange={(e) => updateGeneric(q.id, { prompt: e.target.value })}
          />
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
        </div>
      ))}
      <button type="button" className="b2-btn b2-btn-ghost" onClick={addGeneric}>
        <Plus className="w-4 h-4" /> Add a generic question
      </button>
      </>)}

      {/* Scenario decisions */}
      <div className="b2-section-title">
        <h2 className="b2-h2">Scenario decisions</h2>
        <span className="b2-pill b2-pill-navy">Live scenario · click-the-answer</span>
      </div>
      <p style={{ color: 'var(--lq-ink-2)', fontSize: 14, marginTop: 0, marginBottom: 16, maxWidth: '60ch' }}>
        The live moments inside the scenario. Each tests one capability — pick
        which capability, write the prompt, write the three options.
      </p>

      {decisions.map((d: ScenarioDecision, idx: number) => {
        const cap = getCapability(d.capabilityKey)
        return (
          <div key={d.id} className="b2-card">
            <div className="b2-section-title" style={{ marginTop: 0, marginBottom: 10 }}>
              <h3 className="b2-h3">Question {idx + 1}</h3>
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
                <label className="b2-label">Options</label>
                <div className="b2-options">
                  {d.options.map((o, oi) => (
                    <div className="b2-option-row" key={o.id}>
                      <span className="b2-option-bullet">{String.fromCharCode(65 + oi)}</span>
                      <input
                        className="b2-input"
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        value={o.text}
                        onChange={(e) => updateDecisionOption(d.id, o.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <button type="button" className="b2-btn b2-btn-ghost" onClick={addDecision}>
        <Plus className="w-4 h-4" /> Add a scenario question
      </button>

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
