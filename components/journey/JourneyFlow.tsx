'use client'

/**
 * Journeys — the school-platform path for younger students.
 *
 * Deliberately the SAME surface as the work-scenarios student flow:
 * the navy moon hero, the giant Quick play sign, the cream create band
 * with the animated italic input, the rocket LaunchTransition, and the
 * full cinema ScenarioPlay engine. Only the content differs — stories
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
import { LaunchTransition } from '@/components/launch-transition'
import { ScenarioPlay } from '@/components/play'
import { JourneySim } from '@/components/journey/JourneySim'
import { FOOTY_SIM } from '@/lib/play/journeySim'
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
import type { CompletionResult, Scenario } from '@/lib/play/types'
import {
  JOURNEYS,
  JOURNEY_REVEALS,
  PASSIONS,
  generateJourney,
  journeyById,
} from '@/lib/play/journeyScenarios'

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

const WORK_UNLOCK_AT = 2

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
  /** Funnel — the student steps up into the work-scenarios flow. */
  onWorkScenarios: () => void
}

export function JourneyFlow({ onExit, onWorkScenarios }: JourneyFlowProps) {
  const [name, setName] = useState('')
  const [interest, setInterest] = useState('')
  const [stamps, setStamps] = useState<JourneyStamp[]>([])
  const [showLaunchTransition, setShowLaunchTransition] = useState(false)
  const [showPlay, setShowPlay] = useState(false)
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
    // The selection conversation runs EVERY time the journeys door opens —
    // prior answers prefill so a returning student moves through fast.
    if (p) {
      setInPassion(p.passion || '')
      setInStrengths(p.strengths || [])
    }
    setIntakeStage('passion')
  }, [])

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

  /* ---------- Launch mechanics — rocket transition, then cinema ---------- */

  const stampedThisRun = useRef(false)

  const startJourney = (scenario: Scenario, passionLabel: string) => {
    stampedThisRun.current = false
    runAnalytics.current = null
    setIntakeStage(null)
    setCurrent({ scenario, passionLabel })
    setShowLaunchTransition(true)
    setTimeout(() => {
      setShowLaunchTransition(false)
      setShowPlay(true)
    }, 4000)
  }

  const handleCreate = () => {
    if (!interest.trim()) return
    const g = generateJourney(interest)
    startJourney(g.scenario, g.passionLabel)
  }

  const handleQuickPlay = () => {
    // The footy grand final is the node-journey exemplar — lead with it.
    const footy = JOURNEYS.find((j) => j.id === 'journey-footy')
    const next =
      (footy && !stamps.some((s) => s.journeyId === footy.id) ? footy : undefined) ||
      JOURNEYS.find((j) => !stamps.some((s) => s.journeyId === j.id)) ||
      JOURNEYS[stamps.length % JOURNEYS.length]
    startJourney(next, next.role)
  }

  const handleFlagship = (j: Scenario) => startJourney(j, j.role)

  const stampCurrent = () => {
    if (!current || stampedThisRun.current) return
    // Guard against double-writes: one stamp per completed run.
    stampedThisRun.current = true
    const caps = (JOURNEY_REVEALS[current.scenario.id]?.capabilities || []).map((c) => c.name)
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
    appendRun({
      journeyId: current.scenario.id,
      passionLabel: current.passionLabel,
      skillCounts:
        runAnalytics.current?.skillCounts ??
        Object.fromEntries(caps.map((c) => [c, 1])),
      score: runAnalytics.current?.score ?? 70,
      completedAt: new Date().toISOString(),
    })
    setProfile(loadProfile())
  }

  const closePlay = () => {
    setShowPlay(false)
    setCurrent(null)
    setInterest('')
    setStamps(loadStamps())
  }

  const handlePlayComplete = (_result: CompletionResult) => closePlay()

  /* ---------- Cinema play — the untouched work-scenarios engine ---------- */

  if (showPlay && current) {
    const reveal = JOURNEY_REVEALS[current.scenario.id]
    // Before the report is reached the current run isn't stamped yet — count
    // it in so the report always reads "including this one".
    const completedCount = stampedThisRun.current ? stamps.length : stamps.length + 1
    const topCap = reveal?.capabilities?.[0]?.name || 'Judgement & Decision-Making'
    const playedIds = stamps.map((s) => s.journeyId)
    const journeyReveal = {
      passionLabel: current.passionLabel,
      capabilities: reveal?.capabilities || [],
      subjects: reveal?.subjects || [],
      directions: reveal?.directions || [],
      completedCount,
      workUnlocked: completedCount >= WORK_UNLOCK_AT,
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
    // The footy grand final runs on the node-journey sim — the Sims-style
    // hub-and-threads exemplar. Other journeys stay on the cinema arcs
    // until their node scripts are authored.
    if (current.scenario.id === 'journey-footy') {
      return (
        <JourneySim
          script={FOOTY_SIM}
          name={name.trim() || 'Explorer'}
          passionLabel={current.passionLabel}
          scenario={current.scenario}
          journeyReveal={journeyReveal}
          onExit={closePlay}
        />
      )
    }
    return (
      <ScenarioPlay
        scenario={current.scenario}
        profile={{ name: name.trim() || 'Explorer' }}
        onComplete={handlePlayComplete}
        onExit={closePlay}
        journeyReveal={journeyReveal}
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
    saveProfile({
      passion: inPassion.trim(),
      strengths: inStrengths,
      strengthCaps,
      payFor: inPay?.label || '',
      createdAt: new Date().toISOString(),
      runs: [],
    })
    setProfile(loadProfile())
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
        <LaunchTransition isActive={showLaunchTransition} onComplete={() => setShowLaunchTransition(false)} />
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

  /* ---------- Journey home — clone of the student-dashboard surface ---------- */

  const workUnlocked = stamps.length >= WORK_UNLOCK_AT
  const lastRun = profile?.runs?.length ? profile.runs[profile.runs.length - 1] : null
  const homeRecs = lastRun
    ? recommendNext(
        lastRun.journeyId,
        Object.entries(lastRun.skillCounts || {}).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          'Judgement & Decision-Making',
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
      <LaunchTransition
        isActive={showLaunchTransition}
        onComplete={() => setShowLaunchTransition(false)}
      />

      {/* Top bar — same chrome as the student dashboard */}
      <div
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          borderColor: 'rgba(146, 184, 255, 0.12)',
          background: 'rgba(7, 9, 28, 0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LaunchWordmark height={40} tone="light" ariaLabel="LAUNCH" />
            <span className="hidden sm:inline editorial-mono" style={{ color: 'rgba(246, 242, 234, 0.5)' }}>
              · journeys
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onExit} className="editorial-pill editorial-pill-ghost text-xs">
              Exit
            </button>
          </div>
        </div>
      </div>

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
          .jy-summit {
            background: rgba(146, 184, 255, 0.08);
            border-color: rgba(146, 184, 255, 0.28);
          }
          .jy-summit.is-locked { cursor: default; opacity: 0.75; }
          .jy-summit.is-locked:hover { transform: none; box-shadow: none; }
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
                <span className="jy-card-role">{passion ? `${passion.emoji} ${passion.label}` : 'Journey'}</span>
                <span className="jy-card-title">{j.role}</span>
                <span className="jy-card-blurb">{j.opening.title}</span>
                {done ? (
                  <span className="jy-card-done">✓ Completed · {new Date(done.completedAt).toLocaleDateString()}</span>
                ) : null}
                <span className="jy-card-arrow">{done ? 'Play again →' : 'Step in →'}</span>
              </button>
            )
          })}

          {/* The summit — work scenarios, visible from day one */}
          <button
            type="button"
            className={`jy-card jy-summit ${workUnlocked ? '' : 'is-locked'}`}
            onClick={workUnlocked ? onWorkScenarios : undefined}
          >
            <span className="jy-card-role">⛰ The next room</span>
            <span className="jy-card-title">Work scenarios</span>
            <span className="jy-card-blurb">
              Bigger rooms, real roles, real companies.
              {workUnlocked ? ' You’ve earned the door.' : ` Unlocks after ${WORK_UNLOCK_AT} journeys · ${Math.min(stamps.length, WORK_UNLOCK_AT)}/${WORK_UNLOCK_AT}.`}
            </span>
            <span className="jy-card-arrow">{workUnlocked ? 'Step in →' : '🔒 Locked for now'}</span>
          </button>
        </div>
      </section>
    </main>
  )
}

/* Intake conversation — one question per screen, chips as inspiration,
   free text as the hero. Navy register consistent with the sim. */
const jinStyles = `
  .jin-root {
    min-height: 100vh;
    background: linear-gradient(180deg, #07091c 0%, #0e1737 55%, #182046 100%);
    color: var(--lq-cream, #f6f2ea);
    display: flex;
    flex-direction: column;
  }
  .jin-top {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px clamp(16px, 4vw, 40px);
    border-bottom: 1px solid rgba(146, 184, 255, 0.12);
  }
  .jin-top-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.5);
  }
  .jin-ghost {
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.14);
    color: rgba(246,242,234,0.85);
    border-radius: 999px;
    padding: 8px 16px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .jin-stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(24px, 6vh, 64px) clamp(16px, 4vw, 40px) 90px;
  }
  .jin-card { width: 100%; max-width: 760px; animation: jinIn 500ms cubic-bezier(0.2,0.7,0.2,1) both; }
  @keyframes jinIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .jin-eyebrow {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #92b8ff;
    margin-bottom: 16px;
  }
  .jin-q {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(26px, 4.4vw, 42px);
    letter-spacing: -0.022em;
    line-height: 1.15;
    color: var(--lq-cream, #f6f2ea);
    margin: 0 0 10px;
    max-width: 24ch;
  }
  .jin-sub {
    font-size: 15.5px;
    color: rgba(246,242,234,0.6);
    margin: 0 0 22px;
  }
  .jin-framing {
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(16px, 2vw, 19px);
    color: rgba(246,242,234,0.75);
    margin: 0 0 14px;
    max-width: 52ch;
  }
  .jin-chips { display: flex; flex-wrap: wrap; gap: 9px; margin-bottom: 20px; }
  .jin-chip {
    padding: 11px 18px;
    border-radius: 999px;
    border: 1px solid rgba(246,242,234,0.25);
    background: rgba(246,242,234,0.05);
    color: rgba(246,242,234,0.9);
    font-size: 14.5px;
    font-weight: 550;
    cursor: pointer;
    transition: background 200ms ease, border-color 200ms ease, transform 200ms cubic-bezier(0.2,0.7,0.2,1);
  }
  .jin-chip:hover { transform: translateY(-1px); border-color: rgba(146,184,255,0.6); }
  .jin-chip.is-on {
    background: var(--lq-cream, #f6f2ea);
    color: #131b33;
    border-color: var(--lq-cream, #f6f2ea);
  }
  .jin-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid rgba(246,242,234,0.28);
    padding: 10px 2px 12px;
    color: var(--lq-cream, #f6f2ea);
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(17px, 2.2vw, 21px);
    outline: none;
    margin-bottom: 22px;
    transition: border-color 200ms ease;
  }
  .jin-input:focus { border-color: #92b8ff; }
  .jin-input::placeholder { color: rgba(246,242,234,0.35); }
  .jin-row { display: flex; align-items: center; gap: 14px; }
  .jin-name {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 16px;
    border: 1px solid rgba(246,242,234,0.2);
    border-radius: 999px;
  }
  .jin-name em {
    font-family: var(--font-mono);
    font-style: normal;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.5);
  }
  .jin-name input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--lq-cream, #f6f2ea);
    font-size: 14px;
    width: 130px;
    padding: 6px 4px;
  }
  .jin-next {
    margin-left: auto;
    border: none;
    border-radius: 999px;
    padding: 13px 26px;
    background: var(--lq-cream, #f6f2ea);
    color: #131b33;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: transform 200ms cubic-bezier(0.2,0.7,0.2,1), opacity 200ms ease;
  }
  .jin-next:hover:not(:disabled) { transform: translateY(-1px); }
  .jin-next:disabled { opacity: 0.35; cursor: default; }
  .jin-redirect { display: flex; gap: 8px; margin-top: 26px; }
  .jin-redirect input {
    flex: 1;
    background: transparent;
    border: 1.5px dashed rgba(246,242,234,0.3);
    border-radius: 999px;
    padding: 12px 18px;
    color: var(--lq-cream, #f6f2ea);
    font-family: var(--font-display);
    font-style: italic;
    font-size: 15px;
    outline: none;
  }
  .jin-redirect input:focus { border-color: rgba(146,184,255,0.7); border-style: solid; }
  .jin-redirect input::placeholder { color: rgba(246,242,234,0.4); }
  .jin-redirect button {
    border: 1px solid rgba(246,242,234,0.3);
    border-radius: 999px;
    padding: 12px 20px;
    background: transparent;
    color: rgba(246,242,234,0.9);
    font-weight: 650;
    font-size: 13.5px;
    cursor: pointer;
  }
  .jin-redirect button:disabled { opacity: 0.35; cursor: default; }
`
