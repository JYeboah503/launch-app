'use client'

/**
 * Journeys — the school-platform path for younger students.
 *
 * Deliberately the SAME surface as the work-scenarios student flow:
 * the navy moon hero, the giant Quick play sign, the cream create band
 * with the animated italic input. Clicking a journey cuts straight to
 * that journey's own themed arrival — no generic transition. Stories
 * are journey-based (a Saturday, not a screening), generated from
 * whatever the student says they love, and the final report carries
 * journey copy: capabilities shown, subject shepherding, the funnel
 * into work scenarios, and the payment-locked Launch Credential.
 *
 * Journeys are NOT a finite library. The free-text input is the primary
 * door; the flagship cards below are examples. generateJourney() mocks
 * the open generation (real build: FUSE builds a bespoke story).
 */

import { useEffect, useRef, useState } from 'react'
import { LaunchWordmark } from '@/components/launch-wordmark'
import { StudentScenarioHeader } from '@/components/student-scenario-header'
import { JourneySim } from '@/components/journey/JourneySim'
import { jinStyles } from '@/components/journey/jin-styles'
import { SIM_SCRIPTS } from '@/lib/play/journeySimScripts'
import type { ScenarioSection } from '@/lib/roles'
import {
  type JourneyProfile,
  type ScenarioProposal,
  PAY_CHIPS,
  STRENGTH_CHIPS,
  appendRun,
  clearProfile,
  loadProfile,
  proposeScenario,
  recommendNext,
  saveProfile,
  styleLinesFromCounts,
} from '@/lib/play/journeyProfile'
import type { Scenario } from '@/lib/play/types'
import {
  JOURNEYS,
  JOURNEY_REVEALS,
  PASSIONS,
  generateJourney,
  journeyById,
} from '@/lib/play/journeyScenarios'
import {
  appendCapabilityEvents,
  aggregateByCapability,
  loadCapabilityStore,
  normalizeCapability,
  syncSelfAssessed,
  topCapabilityFrom,
} from '@/lib/capabilityProfile'

/* ---------- Completed-journey stamps (localStorage) ---------- */

export interface JourneyStamp {
  id: string
  journeyId: string
  title: string
  passionLabel: string
  completedAt: string
  capabilities: string[]
}

const STAMPS_KEY = 'launch.journeys.v1'

function loadStamps(): JourneyStamp[] {
  try {
    const raw = localStorage.getItem(STAMPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveStamp(stamp: JourneyStamp): JourneyStamp[] {
  const next = [...loadStamps(), stamp]
  try {
    localStorage.setItem(STAMPS_KEY, JSON.stringify(next))
  } catch {}
  return next
}

/* ---------- Journey example lines for the animated input ---------- */

const JOURNEY_EXAMPLES = [
  'fishing with my pop',
  'BMX with my brother',
  'baking for the school fete',
  'horses before school',
  'building worlds in Minecraft',
  'surf before anyone’s awake',
]

interface JourneyFlowProps {
  onExit: () => void
  /** Funnel — the student steps up into the work-scenarios flow (the
   *  gated "summit" card / journey-report nudge, earned after 2 journeys).
   *  Separate from onScenarioModeChange below — that's the ambient header
   *  toggle, always available; this is the in-story earned funnel. */
  onWorkScenarios: () => void
  /** Header toggle — freely switches Work scenarios ⇄ Journeys any time
   *  a scenario isn't actively being played. */
  onScenarioModeChange: (mode: ScenarioSection) => void
  /** Opens the mode-agnostic capability Scorecard. */
  onOpenScorecard?: () => void
}

export function JourneyFlow({ onExit, onWorkScenarios, onScenarioModeChange, onOpenScorecard }: JourneyFlowProps) {
  const [name, setName] = useState('')
  const [interest, setInterest] = useState('')
  const [stamps, setStamps] = useState<JourneyStamp[]>([])
  const [showPlay, setShowPlay] = useState(false)
  // Quick play — a pre-selection board of scenarios, rotated daily.
  const [showDaily, setShowDaily] = useState(false)
  const [current, setCurrent] = useState<{ scenario: Scenario; passionLabel: string } | null>(null)

  // Typing animation — same mechanic as the work-scenarios create band.
  const [animatedText, setAnimatedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [exampleIdx, setExampleIdx] = useState(0)

  // Intake — the first-visit conversation that leads a student into a
  // scenario "like they're already in it": passion → strengths → paid-for
  // → one tailored proposal with a free-text redirect.
  const [profile, setProfile] = useState<JourneyProfile | null>(null)
  const [intakeStage, setIntakeStage] = useState<null | 'passion' | 'strengths' | 'pay' | 'proposal'>(null)
  const [inPassion, setInPassion] = useState('')
  const [inStrengths, setInStrengths] = useState<string[]>([])
  const [inPay, setInPay] = useState<{ label: string; journeyId: string } | null>(null)
  const [proposal, setProposal] = useState<ScenarioProposal | null>(null)
  const [redirectText, setRedirectText] = useState('')
  const runAnalytics = useRef<{ skillCounts: Record<string, number>; score: number } | null>(null)

  useEffect(() => {
    setStamps(loadStamps())
    const p = loadProfile()
    setProfile(p)
    // Prefill the guided path from the saved profile — but don't force it.
    // Entry lands on the map: Quick play = today's pre-selected scenarios
    // (updated daily); creating your own offers guided OR free-text.
    if (p) {
      setInPassion(p.passion || '')
      setInStrengths(p.strengths || [])
    }
  }, [])

  /** The guided create path — passion → strengths → paid-for → proposal.
   *  Opt-in from the create band now, not a forced gate on entry. */
  const startGuided = () => setIntakeStage('passion')

  useEffect(() => {
    if (interest.trim()) {
      setAnimatedText('')
      return
    }
    const currentExample = JOURNEY_EXAMPLES[exampleIdx]
    let timeout: ReturnType<typeof setTimeout>
    if (isTyping) {
      if (animatedText.length < currentExample.length) {
        timeout = setTimeout(() => {
          setAnimatedText(currentExample.slice(0, animatedText.length + 1))
        }, 30)
      } else {
        timeout = setTimeout(() => setIsTyping(false), 800)
      }
    } else {
      if (animatedText.length > 0) {
        timeout = setTimeout(() => setAnimatedText(animatedText.slice(0, -1)), 25)
      } else {
        setIsTyping(true)
        setExampleIdx((prev) => (prev + 1) % JOURNEY_EXAMPLES.length)
      }
    }
    return () => clearTimeout(timeout)
  }, [animatedText, isTyping, exampleIdx, interest])

  /* ---------- Launch mechanics — straight into the journey's own arrival ---------- */

  const stampedThisRun = useRef(false)
  // Bumped per run and used as JourneySim's key: without the remount,
  // play-next batches setShowPlay(false)+true into a no-op and the
  // previous run's day/streams/ledger state leaks into the new one.
  const runSeq = useRef(0)

  const startJourney = (scenario: Scenario, passionLabel: string) => {
    stampedThisRun.current = false
    runAnalytics.current = null
    runSeq.current += 1
    setIntakeStage(null)
    setShowDaily(false)
    setCurrent({ scenario, passionLabel })
    setShowPlay(true)
  }

  const handleCreate = () => {
    if (!interest.trim()) return
    const g = generateJourney(interest)
    startJourney(g.scenario, g.passionLabel)
  }

  // Quick play = pre-selection, updated daily. The rotation is
  // deterministic by date so "today's scenarios" genuinely change each
  // day (mocked — the real build curates this server-side).
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  const dailyPicks = [0, 1, 2].map((i) => JOURNEYS[(dayIndex + i) % JOURNEYS.length])
  const handleQuickPlay = () => setShowDaily(true)

  const handleFlagship = (j: Scenario) => startJourney(j, j.role)

  const stampCurrent = () => {
    if (!current || stampedThisRun.current) return
    // Guard against double-writes: one stamp per completed run.
    stampedThisRun.current = true
    const revealCaps = JOURNEY_REVEALS[current.scenario.id]?.capabilities || []
    const caps = revealCaps.map((c) => c.name)
    setStamps(
      saveStamp({
        id: `stamp-${Date.now().toString(36)}`,
        journeyId: current.scenario.id,
        title: current.scenario.role,
        passionLabel: current.passionLabel,
        completedAt: new Date().toISOString(),
        capabilities: caps,
      }),
    )
    // Record the run on the profile — live analytics from the sim when
    // available, otherwise the journey's known capability exercise.
    const skillCounts = runAnalytics.current?.skillCounts ?? Object.fromEntries(caps.map((c) => [c, 1]))
    appendRun({
      journeyId: current.scenario.id,
      passionLabel: current.passionLabel,
      skillCounts,
      score: runAnalytics.current?.score ?? 70,
      completedAt: new Date().toISOString(),
    })
    setProfile(loadProfile())
    // Feed the shared cross-mode capability layer — same data, one event
    // per capability touched, evidence line pulled from the journey's
    // known reveal copy where the name matches.
    const at = new Date().toISOString()
    appendCapabilityEvents(
      Object.keys(skillCounts).map((capability) => ({
        id: `cap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        source: 'journey',
        scenarioId: current.scenario.id,
        scenarioTitle: current.scenario.role,
        capability: normalizeCapability(capability),
        rawLabel: capability,
        evidenceLine: revealCaps.find((c) => c.name === capability)?.line || `Demonstrated in ${current.scenario.role}.`,
        at,
      })),
    )
  }

  const closePlay = () => {
    setShowPlay(false)
    setCurrent(null)
    setInterest('')
    setStamps(loadStamps())
  }

  /* ---------- Cinema play — the untouched work-scenarios engine ---------- */

  if (showPlay && current) {
    const reveal = JOURNEY_REVEALS[current.scenario.id]
    // Before the report is reached the current run isn't stamped yet — count
    // it in so the report always reads "including this one".
    const completedCount = stampedThisRun.current ? stamps.length : stamps.length + 1
    // Prefer what the student actually did this run over the journey's
    // static metadata — falls back only if analytics aren't in yet.
    const topCap =
      topCapabilityFrom(runAnalytics.current?.skillCounts) ||
      reveal?.capabilities?.[0]?.name ||
      'Judgement & Decision-Making'
    const playedIds = stamps.map((s) => s.journeyId)
    const journeyReveal = {
      passionLabel: current.passionLabel,
      capabilities: reveal?.capabilities || [],
      subjects: reveal?.subjects || [],
      directions: reveal?.directions || [],
      completedCount,
      // Arcs get static pattern lines from the journey's capability profile;
      // the sim overrides these with lines from the player's actual picks.
      styleLines: styleLinesFromCounts(
        Object.fromEntries((reveal?.capabilities || []).map((c, i) => [c.name, 3 - i])),
      ),
      nextUp: recommendNext(current.scenario.id, topCap, playedIds),
      onPlayNext: (journeyId: string, title: string) => {
        const next = journeyById(journeyId)
        if (!next) return
        setShowPlay(false)
        setStamps(loadStamps())
        startJourney(next, title)
      },
      onAnalytics: (d: { skillCounts: Record<string, number>; score: number }) => {
        runAnalytics.current = d
      },
      onReached: stampCurrent,
      onWorkScenarios,
      onAnotherJourney: closePlay,
    }
    // EVERY journey runs on the node-journey sim — the continuous
    // Sims-style shape (hub → threads → calls → complication → finale)
    // is THE journey experience. One script per passion.
    const script = SIM_SCRIPTS[current.scenario.id] || SIM_SCRIPTS['journey-footy']
    return (
      <JourneySim
        key={runSeq.current}
        script={script}
        name={name.trim() || 'Explorer'}
        passionLabel={current.passionLabel}
        scenario={current.scenario}
        journeyReveal={journeyReveal}
        onExit={closePlay}
      />
    )
  }

  /* ---------- Intake — the first-visit conversation ---------- */

  const toggleStrength = (label: string) =>
    setInStrengths((s) =>
      s.includes(label) ? s.filter((x) => x !== label) : s.length < 3 ? [...s, label] : s,
    )

  const choosePay = (chip: { label: string; journeyId: string }) => {
    setInPay(chip)
    setProposal(proposeScenario(inPassion, inStrengths, chip.label, chip.journeyId))
    setIntakeStage('proposal')
  }

  const acceptProposal = () => {
    if (!proposal) return
    const strengthCaps = STRENGTH_CHIPS.filter((c) => inStrengths.includes(c.label)).map((c) => c.cap)
    // Intake re-runs every visit by design — preserve run history rather
    // than resetting it, or a student's accumulated profile would be wiped
    // before every single new journey.
    const existing = loadProfile()
    saveProfile({
      passion: inPassion.trim(),
      strengths: inStrengths,
      strengthCaps,
      payFor: inPay?.label || '',
      createdAt: existing?.createdAt || new Date().toISOString(),
      runs: existing?.runs || [],
    })
    setProfile(loadProfile())
    syncSelfAssessed(strengthCaps)
    const target = journeyById(proposal.journeyId)
    if (!target) return
    const label = inPassion.trim()
      ? inPassion.trim().charAt(0).toUpperCase() + inPassion.trim().slice(1, 40)
      : target.role
    startJourney(target, label)
  }

  const redirectProposal = () => {
    const t = redirectText.trim()
    if (!t) return
    const next = proposeScenario(t, inStrengths, inPay?.label || '', inPay?.journeyId || '')
    setProposal({ ...next, framing: 'Righto — how about this instead:' })
    setInPassion(t)
    setRedirectText('')
  }

  const redoProfile = () => {
    clearProfile()
    setProfile(null)
    setInPassion('')
    setInStrengths([])
    setInPay(null)
    setProposal(null)
    setIntakeStage('passion')
  }

  if (intakeStage) {
    return (
      <main className="jin-root">
        <div className="jin-top">
          <LaunchWordmark height={34} tone="light" ariaLabel="LAUNCH" />
          <span className="jin-top-meta">· journeys</span>
          <span style={{ flex: 1 }} />
          <button type="button" className="jin-ghost" onClick={() => setIntakeStage(null)}>
            Skip → all journeys
          </button>
          <button type="button" className="jin-ghost" onClick={onExit}>Exit</button>
        </div>

        <section className="jin-stage">
          {intakeStage === 'passion' && (
            <div className="jin-card" key="passion">
              <div className="jin-eyebrow">Building your {profile ? 'next' : 'first'} scenario · 1 of 3</div>
              <h1 className="jin-q">What are you passionate about?</h1>
              <p className="jin-sub">Anything counts. The more yours, the better.</p>
              <div className="jin-chips">
                {PASSIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`jin-chip ${inPassion === p.label ? 'is-on' : ''}`}
                    onClick={() => setInPassion(p.label)}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
              <input
                className="jin-input"
                type="text"
                value={inPassion}
                onChange={(e) => setInPassion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && inPassion.trim()) setIntakeStage('strengths') }}
                placeholder="or say it your way — “fishing with my pop”, “making beats”…"
                aria-label="What are you passionate about?"
              />
              <div className="jin-row">
                <span className="jin-name">
                  <em>I&rsquo;m</em>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="your name"
                    aria-label="Your name"
                  />
                </span>
                <button
                  type="button"
                  className="jin-next"
                  disabled={!inPassion.trim()}
                  onClick={() => setIntakeStage('strengths')}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {intakeStage === 'strengths' && (
            <div className="jin-card" key="strengths">
              <div className="jin-eyebrow">Building your {profile ? 'next' : 'first'} scenario · 2 of 3</div>
              <h1 className="jin-q">What do you reckon you&rsquo;re good at?</h1>
              <p className="jin-sub">Pick up to three. Be honest — nobody&rsquo;s marking this.</p>
              <div className="jin-chips">
                {STRENGTH_CHIPS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`jin-chip ${inStrengths.includes(c.label) ? 'is-on' : ''}`}
                    onClick={() => toggleStrength(c.label)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="jin-row">
                <button type="button" className="jin-ghost" onClick={() => setIntakeStage('passion')}>← Back</button>
                <button
                  type="button"
                  className="jin-next"
                  disabled={inStrengths.length === 0}
                  onClick={() => setIntakeStage('pay')}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {intakeStage === 'pay' && (
            <div className="jin-card" key="pay">
              <div className="jin-eyebrow">Building your {profile ? 'next' : 'first'} scenario · 3 of 3</div>
              <h1 className="jin-q">Fast-forward — you&rsquo;re 25. What would you love to be getting paid to do?</h1>
              <p className="jin-sub">A direction, not a contract. You can change your mind forever.</p>
              <div className="jin-chips">
                {PAY_CHIPS.map((c) => (
                  <button key={c.id} type="button" className="jin-chip" onClick={() => choosePay(c)}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="jin-row">
                <button type="button" className="jin-ghost" onClick={() => setIntakeStage('strengths')}>← Back</button>
              </div>
            </div>
          )}

          {intakeStage === 'proposal' && proposal && (
            <div className="jin-card" key="proposal">
              <div className="jin-eyebrow">Your scenario</div>
              <p className="jin-framing">{proposal.framing}</p>
              <h1 className="jin-q">{proposal.title}</h1>
              <p className="jin-sub">{proposal.hook}</p>
              <div className="jin-row" style={{ marginTop: 22 }}>
                <button type="button" className="jin-next" onClick={acceptProposal}>
                  Let&rsquo;s go →
                </button>
              </div>
              <div className="jin-redirect">
                <input
                  type="text"
                  value={redirectText}
                  onChange={(e) => setRedirectText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') redirectProposal() }}
                  placeholder="or, what would you rather? tell us and we’ll rebuild it…"
                  aria-label="What would you rather?"
                />
                <button type="button" disabled={!redirectText.trim()} onClick={redirectProposal}>
                  Rebuild →
                </button>
              </div>
            </div>
          )}
        </section>
        <style>{jinStyles}</style>
      </main>
    )
  }

  /* ---------- Quick play — today's scenarios, updated daily ---------- */

  if (showDaily) {
    return (
      <main className="jin-root">
        <div className="jin-top">
          <LaunchWordmark height={34} tone="light" ariaLabel="LAUNCH" />
          <span className="jin-top-meta">· quick play</span>
          <span style={{ flex: 1 }} />
          <button type="button" className="jin-ghost" onClick={() => setShowDaily(false)}>← Back</button>
        </div>
        <section className="jin-stage">
          <div className="jin-card" style={{ maxWidth: 920 }}>
            <div className="jin-eyebrow">
              Today&rsquo;s scenarios ·{' '}
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h1 className="jin-q">Three fresh picks. New ones tomorrow.</h1>
            <p className="jin-sub">Step straight into one — or go back and build your own.</p>
            <div className="chooser-options" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {dailyPicks.map((j, i) => {
                const done = stamps.some((s) => s.journeyId === j.id)
                return (
                  <button
                    key={j.id}
                    type="button"
                    className="chooser-option"
                    onClick={() => {
                      setShowDaily(false)
                      startJourney(j, j.role)
                    }}
                  >
                    <span className="chooser-option-eyebrow">
                      {i === 0 ? "⭐ Today's pick" : 'Fresh today'}
                    </span>
                    <span className="chooser-option-title">{j.role}</span>
                    <span className="chooser-option-blurb">{j.opening.title}</span>
                    {SIM_SCRIPTS[j.id]?.mechanicLabel && (
                      <span className="chooser-option-meta">⏱ ~10 min · {SIM_SCRIPTS[j.id].mechanicLabel}</span>
                    )}
                    <span className="chooser-option-arrow">{done ? 'Play again →' : 'Step in →'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
        <style>{jinStyles}</style>
      </main>
    )
  }

  /* ---------- Journey home — clone of the student-dashboard surface ---------- */

  const lastRun = profile?.runs?.length ? profile.runs[profile.runs.length - 1] : null
  // Driven by everything demonstrated across every journey played, not just
  // the single most recent run — the actual fix for "smarter sequencing."
  const accumulatedTopCap = aggregateByCapability(loadCapabilityStore())[0]?.capability
  const homeRecs = lastRun
    ? recommendNext(
        lastRun.journeyId,
        accumulatedTopCap || 'Judgement & Decision-Making',
        stamps.map((s) => s.journeyId),
      )
    : null

  return (
    <main
      className="dark min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #07091c 0%, #0e1737 50%, #182046 100%)',
        color: 'var(--lq-cream)',
      }}
    >
      <StudentScenarioHeader
        subLabel="journeys"
        actionLabel="Exit"
        onAction={onExit}
        mode="journey"
        onModeChange={onScenarioModeChange}
        hideModeToggle={false}
        onOpenScorecard={onOpenScorecard}
      />

      <section
        className="relative min-h-screen flex flex-col px-4 sm:px-8 md:px-12 overflow-hidden pt-20"
      >
        {/* Softly-blurred moon — same treatment as the front page */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Moon%20final-K7dIJI6GEA4qMkAGyHWOt2WR0Q2XDM.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.55,
            filter: 'blur(2px)',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,9,28,0.55) 0%, rgba(7,9,28,0.5) 35%, rgba(14,23,55,0.65) 70%, rgba(24,32,70,0.9) 100%)',
          }}
          aria-hidden
        />

        {/* Quick play — the same giant sign */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <button type="button" onClick={handleQuickPlay} className="quick-play-sign">
            Quick <em>play</em>
          </button>
        </div>

        {/* Cream band — "Create your own journey" */}
        <div className="relative z-10 create-band">
          <div className="create-band-inner">
            <div className="quick-create-label">Create your own journey</div>
            <p
              className="mt-2 text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(14px, 1.4vw, 17px)',
                color: 'rgba(14, 24, 51, 0.55)',
              }}
            >
              Tell us what you love. We&rsquo;ll build the story around it.
            </p>

            <div className="relative w-full max-w-2xl mt-5 sm:mt-6">
              <input
                id="create-journey-input"
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full bg-transparent text-2xl sm:text-3xl outline-none cursor-text relative z-10 text-center"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--lq-ink)',
                  fontWeight: 400,
                  letterSpacing: '-0.015em',
                  caretColor: 'var(--launch-lime-3)',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                aria-label="What do you love?"
              />
              {!interest && (
                <div
                  className="absolute left-0 right-0 top-0 text-2xl sm:text-3xl pointer-events-none text-center"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'rgba(14, 24, 51, 0.38)',
                    fontWeight: 400,
                    letterSpacing: '-0.015em',
                    fontStyle: 'italic',
                  }}
                >
                  {animatedText}
                  <span className="opacity-50 animate-pulse">|</span>
                </div>
              )}
            </div>

            {/* Name entry — the band's quiet second field */}
            <div className="code-entry">
              <span className="code-entry-label">I&rsquo;m</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                placeholder="your name"
                className="code-entry-input"
                aria-label="Your name"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={!interest.trim()}
                className="code-entry-btn"
              >
                Go →
              </button>
            </div>

            {/* Or take the guided path — passion → strengths → proposal */}
            <button type="button" className="guided-link mt-4" onClick={startGuided}>
              Not sure what to type? <span>Take the guided path →</span>
            </button>

            {/* Scroll cue — down to the flagship journeys */}
            <button
              type="button"
              aria-label="Scroll for more"
              onClick={() => {
                document.getElementById('journey-more')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="scroll-cue mt-8"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        <style>{`
          .create-band {
            left: 50%;
            transform: translateX(-50%);
            width: 100vw;
            background-image:
              linear-gradient(180deg,
                rgba(246, 242, 234, 0.86) 0%,
                rgba(246, 242, 234, 0.78) 45%,
                rgba(246, 242, 234, 0.88) 100%),
              url('/images/capabilities-mosaic.png');
            background-size: cover, cover;
            background-position: center, center;
            background-repeat: no-repeat, no-repeat;
            padding: clamp(32px, 6vh, 60px) 24px clamp(28px, 5vh, 52px);
          }
          .create-band-inner {
            max-width: 720px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .quick-create-label {
            font-family: var(--font-display);
            font-weight: 500;
            font-size: clamp(24px, 3.4vw, 40px);
            letter-spacing: -0.02em;
            line-height: 1.1;
            color: var(--launch-navy);
            text-align: center;
          }
          .quick-play-sign {
            display: inline-block;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            font-family: var(--font-display);
            font-weight: 300;
            font-size: clamp(56px, 10vw, 132px);
            letter-spacing: -0.028em;
            line-height: 1.02;
            color: var(--lq-cream);
            transition: transform 280ms cubic-bezier(0.2,0.7,0.2,1), opacity 280ms ease;
          }
          .quick-play-sign em {
            font-style: italic;
            color: #92b8ff;
          }
          .quick-play-sign:hover { transform: scale(1.02); opacity: 0.94; }
          .quick-play-sign:active { transform: scale(0.99); }

          .code-entry {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-top: 22px;
            padding: 6px 6px 6px 18px;
            background: rgba(255, 255, 255, 0.65);
            border: 1px solid var(--lq-line-2);
            border-radius: 999px;
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            transition: border-color 200ms ease, box-shadow 200ms ease;
          }
          .code-entry:focus-within {
            border-color: var(--launch-navy);
            box-shadow: 0 0 0 4px rgba(10, 42, 107, 0.10);
          }
          .code-entry-label {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--lq-ink-3);
          }
          .code-entry-input {
            background: transparent;
            border: none;
            outline: none;
            color: var(--lq-ink);
            font-family: var(--font-mono);
            font-size: 14px;
            letter-spacing: 0.08em;
            min-width: 180px;
            padding: 8px 4px;
          }
          .code-entry-input::placeholder {
            color: var(--lq-ink-3);
            letter-spacing: 0.04em;
          }
          .code-entry-btn {
            border: none;
            background: var(--launch-navy);
            color: var(--lq-cream);
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 13px;
            padding: 8px 16px;
            border-radius: 999px;
            cursor: pointer;
            transition: background 200ms ease, transform 200ms ease;
          }
          .code-entry-btn:hover:not(:disabled) {
            background: var(--launch-navy-2);
            transform: translateY(-1px);
          }
          .code-entry-btn:disabled { opacity: 0.45; cursor: not-allowed; }

          /* Guided-path link — the second create route on the cream band */
          .guided-link {
            background: none;
            border: none;
            cursor: pointer;
            font-family: var(--font-body);
            font-size: 13.5px;
            color: rgba(14, 24, 51, 0.55);
            transition: color 200ms ease;
          }
          .guided-link span {
            color: var(--launch-navy);
            font-weight: 650;
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          .guided-link:hover { color: var(--lq-ink); }

          .scroll-cue {
            color: rgba(10, 42, 107, 0.45);
            background: none;
            border: none;
            cursor: pointer;
            transition: color 200ms ease;
            animation: scrollCueBob 1.8s ease-in-out infinite;
          }
          .scroll-cue:hover { color: rgba(10, 42, 107, 0.85); }
          @keyframes scrollCueBob {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(5px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .scroll-cue { animation: none; }
          }

          /* Flagship journey cards — same card idiom as the student
             dashboard's project cards. */
          .jy-card {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            gap: 8px;
            padding: 22px 22px 18px;
            border-radius: var(--card-r, 14px);
            background: rgba(246, 242, 234, 0.05);
            border: 1px solid rgba(246, 242, 234, 0.10);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            cursor: pointer;
            transition: background 240ms ease, border-color 240ms ease, box-shadow 240ms ease, transform 240ms cubic-bezier(0.2,0.7,0.2,1);
          }
          .jy-card:hover {
            background: color-mix(in srgb, #92b8ff 9%, rgba(246, 242, 234, 0.05));
            border-color: color-mix(in srgb, #92b8ff 42%, transparent);
            box-shadow: 0 14px 36px color-mix(in srgb, #92b8ff 16%, transparent);
            transform: translateY(-2px);
          }
          .jy-card-role {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(146, 184, 255, 0.85);
          }
          .jy-card-title {
            font-family: var(--font-display);
            font-weight: 400;
            font-size: 19px;
            letter-spacing: -0.015em;
            line-height: 1.25;
            color: var(--lq-cream);
          }
          .jy-card-blurb {
            font-size: 13.5px;
            line-height: 1.5;
            color: rgba(246, 242, 234, 0.62);
          }
          .jy-card-arrow {
            margin-top: auto;
            padding-top: 8px;
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 13px;
            color: #92b8ff;
          }
          .jy-card-done {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(190, 227, 178, 0.85);
          }
          .jy-card-meta {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(246, 242, 234, 0.45);
          }
          .jy-summit {
            background: rgba(146, 184, 255, 0.08);
            border-color: rgba(146, 184, 255, 0.28);
          }
        `}</style>
      </section>

      {/* Flagship journeys — examples, not the catalogue */}
      <section id="journey-more" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {homeRecs && (
          <div className="mb-10">
            <div className="editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.75)' }}>
              built from how you played
            </div>
            <h2
              className="mt-2 mb-5"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(26px, 3.4vw, 40px)',
                letterSpacing: '-0.02em',
                color: 'var(--lq-cream)',
              }}
            >
              Your next scenario
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { rec: homeRecs.effective, role: 'You’d be effective in' },
                { rec: homeRecs.different, role: 'Something entirely different' },
              ].map(({ rec, role }) => (
                <button
                  key={rec.journeyId + role}
                  type="button"
                  className="jy-card"
                  onClick={() => {
                    const next = journeyById(rec.journeyId)
                    if (next) startJourney(next, rec.title)
                  }}
                >
                  <span className="jy-card-role">{role}</span>
                  <span className="jy-card-title">{rec.title}</span>
                  <span className="jy-card-blurb">{rec.blurb}</span>
                  <span className="jy-card-done">{rec.reason}</span>
                  <span className="jy-card-arrow">Step in →</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={redoProfile}
              className="editorial-mono mt-4"
              style={{ color: 'rgba(246,242,234,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ↻ tell us about you again
            </button>
          </div>
        )}
        <div className="mb-6">
          <div className="editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.75)' }}>
            or start from one of these
          </div>
          <h2
            className="mt-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(26px, 3.4vw, 40px)',
              letterSpacing: '-0.02em',
              color: 'var(--lq-cream)',
            }}
          >
            Example journeys
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {JOURNEYS.map((j) => {
            const done = stamps.find((s) => s.journeyId === j.id)
            const passion = PASSIONS.find((p) => p.journeyId === j.id)
            return (
              <button key={j.id} type="button" className="jy-card" onClick={() => handleFlagship(j)}>
                <span className="jy-card-role">
                  {passion ? `${passion.emoji} ${passion.label}` : 'Journey'}
                </span>
                <span className="jy-card-title">{j.role}</span>
                <span className="jy-card-blurb">{j.opening.title}</span>
                {SIM_SCRIPTS[j.id]?.mechanicLabel && (
                  <span className="jy-card-meta">⏱ ~10 min · {SIM_SCRIPTS[j.id].mechanicLabel}</span>
                )}
                {done ? (
                  <span className="jy-card-done">✓ Completed · {new Date(done.completedAt).toLocaleDateString()}</span>
                ) : null}
                <span className="jy-card-arrow">{done ? 'Play again →' : 'Step in →'}</span>
              </button>
            )
          })}

          {/* Work scenarios — an equal mode, not a graduation. Always open. */}
          <button type="button" className="jy-card jy-summit" onClick={onWorkScenarios}>
            <span className="jy-card-role">⛰ The other mode</span>
            <span className="jy-card-title">Work scenarios</span>
            <span className="jy-card-blurb">Bigger rooms, real roles, real companies — same capabilities, different door.</span>
            <span className="jy-card-arrow">Step in →</span>
          </button>
        </div>
      </section>
    </main>
  )
}

// jinStyles moved to ./jin-styles.ts — shared with SchoolChooser, which
// reuses this dark-register CSS verbatim.
