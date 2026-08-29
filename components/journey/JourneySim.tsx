'use client'

/**
 * JourneySim — the node-journey player for the school platform.
 *
 * A design-prototype UI that behaves like the brief's "branching
 * narrative journey engine (decision → consequence → next node)":
 * one continuous Sims-style activity with a hub ("where do you
 * start?"), sequential threads (choice → phone call → consequence),
 * a project state strip that visibly evolves, complications that
 * arrive based on what the player did and didn't do, and free-text
 * accepted at every beat. Scripted underneath — the real build
 * generates nodes with FUSE.
 *
 * UI: own register, inspired by the cinema surface (navy, serif
 * display, cream option cards) but built around function first.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  JourneySimScript,
  SimEffect,
  SimNode,
  SimOption,
  StreamKey,
  StreamStatus,
} from '@/lib/play/journeySim'
import { neglectLine } from '@/lib/play/journeySim'
import { styleLinesFromCounts } from '@/lib/play/journeyProfile'
import type { JourneyRevealData, Scenario } from '@/lib/play/types'
import { ReportScreen } from '@/components/play/screens'
import { RevealText } from '@/components/play/parts'
import { LedgerPanel, StreamsPanel, formatLedgerValue, deltaTone } from '@/components/journey/LedgerPanel'
import '@/components/play/styles/play.css'

interface JourneySimProps {
  script: JourneySimScript
  name: string
  passionLabel: string
  scenario: Scenario
  journeyReveal: JourneyRevealData
  onExit: () => void
}

type Phase =
  | { kind: 'arrival' }
  | { kind: 'hub' }
  | { kind: 'node'; id: string }
  | { kind: 'echo'; text: string; skill?: string; effects?: SimEffect; to: string; custom?: boolean }
  | { kind: 'stagecard'; variant: 'twist' | 'final'; to: string }
  | { kind: 'ending' }
  | { kind: 'report' }

const STATUS_LABEL: Record<StreamStatus, string> = {
  todo: 'not started',
  underway: 'underway',
  sorted: 'sorted',
  shaky: 'shaky',
}

const STATUS_COLOR: Record<StreamStatus, string> = {
  todo: 'rgba(246,242,234,0.35)',
  underway: '#92b8ff',
  sorted: '#7ddba3',
  shaky: '#f2b56b',
}

export function JourneySim({ script, name, passionLabel, scenario, journeyReveal, onExit }: JourneySimProps) {
  const streamKeys = Object.keys(script.streams) as StreamKey[]
  const [phase, setPhase] = useState<Phase>({ kind: 'arrival' })
  const [day, setDay] = useState(1)
  const [score, setScore] = useState(50)
  const [threadsDone, setThreadsDone] = useState(0)
  const [hubVisits, setHubVisits] = useState(0)
  const [customText, setCustomText] = useState('')
  const [streams, setStreams] = useState<Record<StreamKey, StreamStatus>>(
    () => Object.fromEntries(streamKeys.map((k) => [k, 'todo'])) as Record<StreamKey, StreamStatus>,
  )
  // Which capabilities the player's picks exercised — the run's analysis.
  const [skillCounts, setSkillCounts] = useState<Record<string, number>>({})
  // A visible running-numbers mechanic (cash tin, stock…) for scripts that
  // define one — absent scripts behave exactly as before.
  const [ledger, setLedger] = useState<Record<string, number>>(() =>
    script.ledger ? Object.fromEntries(Object.entries(script.ledger.keys).map(([k, s]) => [k, s.start])) : {},
  )
  const [lastLedgerDelta, setLastLedgerDelta] = useState<Record<string, number> | undefined>(undefined)

  const fill = (s: string) => s.replaceAll('{name}', name || 'mate')

  const currentNode: SimNode | null = phase.kind === 'node' ? script.nodes[phase.id] : null

  /* Advance out of an echo: apply effects, then route. Ref-guarded so a
     click landing in the same instant as the auto-advance timer can't
     apply the same echo's effects twice. */
  const echoConsumed = useRef(false)
  const continueFromEcho = () => {
    if (phase.kind !== 'echo') return
    if (echoConsumed.current) return
    echoConsumed.current = true
    const fx = phase.effects
    if (fx) {
      if (fx.score) setScore((v) => Math.max(0, Math.min(100, v + fx.score!)))
      if (fx.days) setDay((d) => Math.min(script.daysTotal, d + fx.days!))
      if (fx.stream && fx.status) setStreams((s) => ({ ...s, [fx.stream!]: fx.status! }))
      if (fx.ledger) {
        setLedger((l) =>
          Object.fromEntries(
            Object.entries(l).map(([k, v]) => {
              const spec = script.ledger?.keys[k]
              let next = v + (fx.ledger![k] || 0)
              if (spec?.min != null) next = Math.max(spec.min, next)
              if (spec?.max != null) next = Math.min(spec.max, next)
              return [k, next]
            }),
          ),
        )
        setLastLedgerDelta(fx.ledger)
      } else {
        setLastLedgerDelta(undefined)
      }
    } else {
      setLastLedgerDelta(undefined)
    }
    const to = phase.to
    if (to === 'END') {
      setPhase({ kind: 'ending' })
      return
    }
    if (to === 'HUB') {
      const done = threadsDone + 1
      setThreadsDone(done)
      setHubVisits((v) => v + 1)
      setDay((d) => Math.min(script.daysTotal, d + 1))
      if (done >= script.threadsBeforeFinale) {
        // The complication that arrives depends on what the player secured —
        // announced as a stage change, not just another identical card.
        const check = script.complication.checkStream
        const ok =
          (phase.effects?.stream === check ? phase.effects.status : streams[check]) === 'sorted'
        setPhase({
          kind: 'stagecard',
          variant: 'twist',
          to: ok ? script.complication.whenSorted : script.complication.otherwise,
        })
      } else {
        setPhase({ kind: 'hub' })
      }
      return
    }
    // The finale is a stage change too — "the last call" gets announced.
    if (to === script.finale) {
      setPhase({ kind: 'stagecard', variant: 'final', to })
      return
    }
    setPhase({ kind: 'node', id: to })
  }

  // Echoes and stagecards flow on by themselves — the player is obviously
  // going to keep going, so there's no button. Reading time scales with the
  // text; clicking anywhere on the card skips the wait.
  const autoMs =
    phase.kind === 'stagecard'
      ? 2600
      : phase.kind === 'echo'
        ? Math.min(
            9000,
            Math.max(3600, 1400 + phase.text.split(/\s+/).length * 110 + (phase.effects?.ledger ? 1400 : 0)),
          )
        : 0
  useEffect(() => {
    if (phase.kind !== 'echo' && phase.kind !== 'stagecard') return
    const t = setTimeout(() => {
      if (phase.kind === 'echo') continueFromEcho()
      else if (phase.kind === 'stagecard') setPhase({ kind: 'node', id: phase.to })
    }, autoMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const trackSkill = (skill?: string) => {
    if (!skill) return
    setSkillCounts((c) => ({ ...c, [skill]: (c[skill] || 0) + 1 }))
  }

  const pickOption = (node: SimNode, opt: SimOption) => {
    setCustomText('')
    trackSkill(opt.skill)
    echoConsumed.current = false
    setPhase({ kind: 'echo', text: fill(opt.response), skill: opt.skill, effects: opt.effects, to: opt.to })
  }

  const pickCustom = (node: SimNode | null) => {
    const text = customText.trim()
    if (!text) return
    setCustomText('')
    trackSkill('Self-direction')
    echoConsumed.current = false
    if (!node) {
      // Own-words move from the hub — a self-made thread.
      setPhase({
        kind: 'echo',
        custom: true,
        text: `You run with it: “${text}.” It wasn't on anyone's list — you make it real anyway, and the day is better for it.`,
        skill: 'Self-direction',
        effects: { days: 1, score: 4 },
        to: 'HUB',
      })
      return
    }
    setPhase({
      kind: 'echo',
      custom: true,
      text: `You do it your way: “${text}.” The people around you adjust — your call, your consequences.`,
      skill: 'Self-direction',
      effects: { score: 2 },
      to: node.customTo || 'HUB',
    })
  }

  const tier = script.ledger
    ? ledger[script.ledger.primaryKey] >= script.ledger.tierThresholds.high
      ? 'high'
      : ledger[script.ledger.primaryKey] >= script.ledger.tierThresholds.mid
        ? 'mid'
        : 'low'
    : score >= 68
      ? 'high'
      : score >= 45
        ? 'mid'
        : 'low'
  const neglected = useMemo(
    () => streamKeys.filter((k) => streams[k] === 'todo').map((k) => script.streams[k].label.toLowerCase()),
    [streams, streamKeys, script.streams],
  )

  /* ---------------- REPORT ---------------- */
  if (phase.kind === 'report') {
    // Enrich the reveal with this run's live analysis — "how you decide"
    // comes from the choices actually made, not the script.
    const enriched: JourneyRevealData = {
      ...journeyReveal,
      styleLines: styleLinesFromCounts(skillCounts),
    }
    return (
      <div className="lq-play-root app" data-theme="cinema" style={{ minHeight: '100vh' }}>
        <ReportScreen
          scenario={scenario}
          history={[]}
          onRestart={journeyReveal.onAnotherJourney}
          onHome={onExit}
          journeyReveal={enriched}
        />
      </div>
    )
  }

  const remainingDoors = streamKeys.filter((k) => streams[k] === 'todo')

  // Per-script world — each journey gets its own palette instead of one
  // shared navy shell. Scripts without a theme keep the default look.
  const themeVars = {
    ...(script.theme ? { background: script.theme.background } : {}),
    ['--jsim-accent' as string]: script.theme?.accent ?? '#92b8ff',
  } as React.CSSProperties

  // Arrival — defensive fallback so the engine never hard-depends on the
  // new per-script content.
  const arrival = script.arrival ?? {
    beats: [script.intro.narrative],
    mission: {
      headline: script.title,
      points: [
        `The goal: ${script.goalLabel.toLowerCase()}.`,
        `${script.daysTotal} days on the clock.`,
      ],
    },
  }
  const missionDelay = 500 + arrival.beats.length * 1500 + 300

  // Journey spine — where am I, where am I heading. Pure derivation.
  const complicationIds = [script.complication.whenSorted, script.complication.otherwise]
  const sortedCount = streamKeys.filter((k) => streams[k] === 'sorted').length
  const spineStage: number = (() => {
    if (phase.kind === 'arrival') return 0
    if (phase.kind === 'ending') return 4
    if (phase.kind === 'stagecard') return phase.variant === 'final' ? 3 : 2
    if (phase.kind === 'node') {
      if (phase.id === script.finale) return 3
      if (complicationIds.includes(phase.id)) return 2
      return 1
    }
    if (phase.kind === 'echo') {
      if (phase.to === 'END') return 3
      if (phase.to === script.finale) return 2
      return threadsDone >= script.threadsBeforeFinale ? 2 : 1
    }
    return 1
  })()
  const spineLabels = [
    'Arrive',
    spineStage === 1 ? `The work · ${threadsDone}/${script.threadsBeforeFinale}` : 'The work',
    'The twist',
    'The last call',
    'What you showed',
  ]

  return (
    <main className="jsim-root" style={themeVars}>
      {/* Project header — the evolving state of the activity. During arrival
          it fades in exactly when the mission card explains the dashboard. */}
      <header
        className={`jsim-top${phase.kind === 'arrival' ? ' jsim-top-arriving' : ''}`}
        style={{
          ...(script.theme ? { background: script.theme.topBar } : {}),
          ...(phase.kind === 'arrival' ? { animationDelay: `${missionDelay}ms` } : {}),
        }}
      >
        <div className="jsim-top-row">
          <button type="button" className="jsim-exit" onClick={onExit}>← Leave</button>
          <div className="jsim-title-wrap">
            <div className="jsim-title">{script.title}</div>
            <div className="jsim-club">{script.club} · {passionLabel}</div>
          </div>
          <div className="jsim-day">DAY {Math.min(day, script.daysTotal)} <span>of {script.daysTotal}</span></div>
        </div>
        {script.ledger ? (
          <LedgerPanel config={script.ledger} values={ledger} lastDelta={lastLedgerDelta} />
        ) : script.dashboard?.kind === 'streams' ? (
          <StreamsPanel
            label={script.dashboard.label ?? 'Sorted'}
            sorted={sortedCount}
            total={streamKeys.length}
          />
        ) : (
          <div className="jsim-meter-row">
            <span className="jsim-meter-label">{script.goalLabel}</span>
            <div className="jsim-meter"><div className="jsim-meter-fill" style={{ width: `${score}%` }} /></div>
            <span className="jsim-meter-val">{score}%</span>
          </div>
        )}
        <div className="jsim-streams">
          {streamKeys.map((k) => (
            <span key={k} className="jsim-chip" data-status={streams[k]}>
              <i style={{ background: STATUS_COLOR[streams[k]] }} />
              {script.streams[k].label}
              <em>{STATUS_LABEL[streams[k]]}</em>
            </span>
          ))}
        </div>
        {/* Journey spine — where you are, where you're heading */}
        <div className="jsim-spine" aria-label="Journey progress">
          {spineLabels.map((label, i) => (
            <span
              key={label}
              className="jsim-spine-step"
              data-state={i < spineStage ? 'done' : i === spineStage ? 'now' : 'ahead'}
            >
              <i />
              {label}
            </span>
          ))}
        </div>
      </header>

      <section className="jsim-stage">
        {/* ---------------- ARRIVAL — the cold open ---------------- */}
        {phase.kind === 'arrival' && (
          <div className="jsim-card jsim-arrival">
            <button type="button" className="jsim-arrival-skip" onClick={() => setPhase({ kind: 'hub' })}>
              Skip →
            </button>
            <RevealText as="div" className="jsim-eyebrow" text={fill(script.intro.eyebrow)} delay={150} stagger={28} />
            {arrival.beats.map((beat, i) => (
              <RevealText key={i} className="jsim-arrival-beat" text={fill(beat)} delay={500 + i * 1500} stagger={28} />
            ))}
            <div className="jsim-mission" style={{ animationDelay: `${missionDelay}ms` }}>
              <div className="jsim-mission-head">The mission</div>
              <div className="jsim-mission-headline">{fill(arrival.mission.headline)}</div>
              <ul className="jsim-mission-points">
                {arrival.mission.points.map((p, i) => (
                  <li key={i}>{fill(p)}</li>
                ))}
                <li>{streamKeys.length} doors. You pick the order.</li>
              </ul>
              <button type="button" className="jsim-mission-go" onClick={() => setPhase({ kind: 'hub' })}>
                Step in →
              </button>
            </div>
          </div>
        )}

        {/* ---------------- HUB ---------------- */}
        {phase.kind === 'hub' && (
          <div className="jsim-card" key={`hub-${hubVisits}`}>
            <div className="jsim-eyebrow">
              {hubVisits === 0
                ? fill(script.intro.eyebrow)
                : `Day ${Math.min(day, script.daysTotal)} · ${script.hubReturn?.eyebrow ?? 'back at base'}`}
            </div>
            {/* First visit: the arrival already set the scene — lead with the
                question, not a second wall of narrative. */}
            {hubVisits === 0 ? (
              <h1 className="jsim-narrative">{script.intro.prompt}</h1>
            ) : (
              <>
                <h1 className="jsim-narrative">
                  {fill(script.hubReturn?.narrative ?? "One thing done — what's next?")}
                </h1>
                <div className="jsim-prompt">
                  {script.hubReturn?.prompt ?? 'What do you take on next?'}
                </div>
              </>
            )}
            <div className="jsim-options">
              {remainingDoors.map((k, i) => (
                <button key={k} type="button" className="jsim-opt" style={{ animationDelay: `${hubVisits === 0 ? 200 + i * 90 : i * 70}ms` }} onClick={() => setPhase({ kind: 'node', id: script.streams[k].entry })}>
                  <span className="jsim-opt-label">{script.streams[k].doorLabel}</span>
                  <span className="jsim-opt-sub">{script.streams[k].label}</span>
                </button>
              ))}
            </div>
            <div className="jsim-custom">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') pickCustom(null) }}
                placeholder="or, in your own words — where would you start?"
                aria-label="Your own move"
              />
              <button type="button" disabled={!customText.trim()} onClick={() => pickCustom(null)}>Do it →</button>
            </div>
          </div>
        )}

        {/* ---------------- NODE ---------------- */}
        {phase.kind === 'node' && currentNode && (
          <div className="jsim-card" key={currentNode.id}>
            <div className="jsim-eyebrow">
              Day {Math.min(day, script.daysTotal)} · {currentNode.eyebrow}
            </div>
            <h1 className="jsim-narrative">{fill(currentNode.narrative)}</h1>

            {currentNode.kind !== 'scene' && currentNode.speaker && (
              <div className="jsim-call" data-kind={currentNode.kind}>
                <div className="jsim-call-head">
                  <span className="jsim-call-dot" data-kind={currentNode.kind} />{' '}
                  {currentNode.kind === 'call'
                    ? 'On the phone — '
                    : currentNode.kind === 'text'
                      ? 'Messages — '
                      : 'Face to face — '}
                  <strong>{currentNode.speaker.name}</strong> · {currentNode.speaker.role}
                </div>
                {(currentNode.dialogue || []).map((line, i) => (
                  <div key={i} className="jsim-bubble" data-kind={currentNode.kind} style={{ animationDelay: `${400 + i * 850}ms` }}>
                    {fill(line)}
                  </div>
                ))}
              </div>
            )}

            <div
              className="jsim-prompt"
              style={currentNode.kind !== 'scene' ? { animation: 'jsimIn 500ms ease both', animationDelay: `${400 + (currentNode.dialogue?.length || 0) * 850}ms` } : undefined}
            >
              {fill(currentNode.prompt)}
            </div>
            <div className="jsim-options">
              {currentNode.options.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  className="jsim-opt"
                  style={{ animationDelay: `${currentNode.kind !== 'scene' ? 500 + (currentNode.dialogue?.length || 0) * 850 + i * 90 : i * 90}ms` }}
                  onClick={() => pickOption(currentNode, opt)}
                >
                  <span className="jsim-opt-label">{fill(opt.label)}</span>
                  {opt.skill && <span className="jsim-opt-sub">{opt.skill}</span>}
                </button>
              ))}
            </div>
            <div className="jsim-custom" style={currentNode.kind !== 'scene' ? { animation: 'jsimIn 500ms ease both', animationDelay: `${700 + (currentNode.dialogue?.length || 0) * 850}ms` } : undefined}>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') pickCustom(currentNode) }}
                placeholder="or, in your own words…"
                aria-label="Your own move"
              />
              <button type="button" disabled={!customText.trim()} onClick={() => pickCustom(currentNode)}>Do it →</button>
            </div>
          </div>
        )}

        {/* ---------------- ECHO (what happened) ---------------- */}
        {phase.kind === 'echo' && (
          <div
            className="jsim-card jsim-echo jsim-flow"
            key="echo"
            role="button"
            tabIndex={0}
            onClick={continueFromEcho}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') continueFromEcho() }}
          >
            <div className="jsim-eyebrow">What happened</div>
            <p className="jsim-echo-text">{phase.text}</p>
            <div className="jsim-echo-meta">
              {phase.skill && <span className="jsim-tag">{phase.skill}</span>}
              {phase.effects?.stream && phase.effects.status && (
                <span className="jsim-tag" style={{ color: STATUS_COLOR[phase.effects.status] }}>
                  {script.streams[phase.effects.stream].label} → {STATUS_LABEL[phase.effects.status]}
                </span>
              )}
              {!!phase.effects?.days && <span className="jsim-tag">+{phase.effects.days} day{phase.effects.days! > 1 ? 's' : ''}</span>}
            </div>
            {script.ledger && phase.effects?.ledger && (
              <div className="jsim-receipt">
                <div className="jsim-receipt-head">· · · {(script.ledger.cardHead ?? script.title).toUpperCase()} · · ·</div>
                {Object.entries(phase.effects.ledger).map(([key, delta]) => {
                  const spec = script.ledger!.keys[key]
                  if (!spec || !delta) return null
                  return (
                    <div className="jsim-receipt-row" key={key}>
                      <span>{spec.label}</span>
                      <span className={deltaTone(spec, delta) === 'good' ? 'is-up' : 'is-down'}>
                        {delta > 0 ? '+' : ''}
                        {formatLedgerValue(spec, delta)}
                      </span>
                    </div>
                  )
                })}
                <div className="jsim-receipt-row jsim-receipt-total">
                  <span>{script.ledger.keys[script.ledger.primaryKey].label} now</span>
                  <span>
                    {formatLedgerValue(
                      script.ledger.keys[script.ledger.primaryKey],
                      (ledger[script.ledger.primaryKey] ?? 0) + (phase.effects.ledger[script.ledger.primaryKey] || 0),
                    )}
                  </span>
                </div>
              </div>
            )}
            <div className="jsim-auto-timer" key={`t-${phase.text.slice(0, 24)}`}>
              <i style={{ animationDuration: `${autoMs}ms` }} />
            </div>
          </div>
        )}

        {/* ---------------- STAGECARD — announced turn in the story ---------------- */}
        {phase.kind === 'stagecard' && (
          <div
            className="jsim-card jsim-stagecard jsim-flow"
            key={`stage-${phase.variant}`}
            role="button"
            tabIndex={0}
            onClick={() => setPhase({ kind: 'node', id: phase.to })}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPhase({ kind: 'node', id: phase.to }) }}
          >
            <div className="jsim-eyebrow">Day {Math.min(day, script.daysTotal)}</div>
            <h1 className="jsim-narrative">
              {phase.variant === 'twist' ? "Something's come up." : 'The last call.'}
            </h1>
            <div className="jsim-auto-timer">
              <i style={{ animationDuration: `${autoMs}ms` }} />
            </div>
          </div>
        )}

        {/* ---------------- ENDING ---------------- */}
        {phase.kind === 'ending' && (
          <div className="jsim-card" key="ending">
            <div className="jsim-eyebrow">
              {script.goalLabel} ·{' '}
              {script.ledger
                ? formatLedgerValue(script.ledger.keys[script.ledger.primaryKey], ledger[script.ledger.primaryKey])
                : script.dashboard?.kind === 'streams'
                  ? `${sortedCount}/${streamKeys.length} sorted`
                  : `${score}%`}
            </div>
            <h1 className="jsim-narrative">{script.endings[tier].title}</h1>
            <p className="jsim-ending-body">
              {fill(script.endings[tier].body.replaceAll('{neglectLine}', neglectLine(neglected)))}
            </p>
            <button
              type="button"
              className="jsim-continue"
              onClick={() => {
                journeyReveal.onAnalytics?.({ skillCounts, score })
                setPhase({ kind: 'report' })
              }}
            >
              What you showed →
            </button>
          </div>
        )}
      </section>

      <style>{jsimStyles}</style>
    </main>
  )
}

const jsimStyles = `
  .jsim-root {
    min-height: 100vh;
    background: linear-gradient(180deg, #07091c 0%, #0e1737 55%, #182046 100%);
    color: var(--lq-cream, #f6f2ea);
    display: flex;
    flex-direction: column;
  }
  .jsim-top {
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 14px clamp(16px, 4vw, 40px) 12px;
    background: rgba(7, 9, 28, 0.82);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(146, 184, 255, 0.14);
  }
  .jsim-top-row { display: flex; align-items: center; gap: 14px; }
  .jsim-exit {
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.14);
    color: rgba(246,242,234,0.85);
    border-radius: 999px;
    padding: 7px 14px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .jsim-title-wrap { flex: 1; min-width: 0; }
  .jsim-title {
    font-family: var(--font-display);
    font-weight: 450;
    font-size: clamp(17px, 2.2vw, 22px);
    letter-spacing: -0.015em;
    line-height: 1.1;
  }
  .jsim-club {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.5);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .jsim-day {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.1em;
    color: var(--jsim-accent, #92b8ff);
    white-space: nowrap;
  }
  .jsim-day span { color: rgba(246,242,234,0.45); font-size: 10px; }
  .jsim-meter-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
  .jsim-meter-label {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.16em;
    color: rgba(246,242,234,0.55);
    white-space: nowrap;
  }
  .jsim-meter {
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: rgba(246,242,234,0.12);
    overflow: hidden;
  }
  .jsim-meter-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #92b8ff, #7ddba3);
    transition: width 700ms cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .jsim-meter-val { font-family: var(--font-mono); font-size: 11px; color: rgba(246,242,234,0.75); }
  .jsim-streams { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .jsim-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(246,242,234,0.12);
    background: rgba(246,242,234,0.04);
    font-size: 11px;
    color: rgba(246,242,234,0.8);
    transition: border-color 300ms ease, background 300ms ease;
  }
  .jsim-chip[data-status='sorted'] { border-color: rgba(125,219,163,0.45); }
  .jsim-chip[data-status='shaky'] { border-color: rgba(242,181,107,0.5); }
  .jsim-chip[data-status='underway'] { border-color: rgba(146,184,255,0.45); }
  .jsim-chip i { width: 7px; height: 7px; border-radius: 999px; display: inline-block; }
  .jsim-chip em {
    font-style: normal;
    font-family: var(--font-mono);
    font-size: 8.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.45);
  }

  .jsim-stage {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: clamp(24px, 5vh, 56px) clamp(16px, 4vw, 40px) 80px;
  }
  .jsim-card { width: 100%; max-width: 880px; animation: jsimIn 500ms cubic-bezier(0.2,0.7,0.2,1) both; }
  @keyframes jsimIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

  /* During arrival the header holds back, then fades in exactly when the
     mission card explains the dashboard (inline animationDelay). */
  .jsim-top-arriving { opacity: 0; animation: jsimTopIn 600ms ease both; }
  @keyframes jsimTopIn { from { opacity: 0; } to { opacity: 1; } }

  /* Journey spine — the persistent where-am-I rail */
  .jsim-spine { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 14px; margin-top: 11px; }
  .jsim-spine-step {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.32);
    transition: color 400ms ease;
  }
  .jsim-spine-step i {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(246,242,234,0.22);
    transition: background 400ms ease, box-shadow 400ms ease;
  }
  .jsim-spine-step[data-state='done'] { color: rgba(246,242,234,0.5); }
  .jsim-spine-step[data-state='done'] i { background: rgba(246,242,234,0.5); }
  .jsim-spine-step[data-state='now'] { color: var(--jsim-accent, #92b8ff); }
  .jsim-spine-step[data-state='now'] i {
    background: var(--jsim-accent, #92b8ff);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--jsim-accent, #92b8ff) 25%, transparent);
  }

  /* Arrival — the cold open */
  .jsim-arrival { position: relative; padding-top: 8px; }
  .jsim-arrival-skip {
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: 1px solid rgba(246,242,234,0.18);
    border-radius: 999px;
    padding: 6px 14px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.55);
    cursor: pointer;
    transition: color 200ms ease, border-color 200ms ease;
  }
  .jsim-arrival-skip:hover { color: rgba(246,242,234,0.9); border-color: rgba(246,242,234,0.4); }
  .jsim-arrival-beat {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(20px, 3vw, 30px);
    letter-spacing: -0.02em;
    line-height: 1.35;
    max-width: 38ch;
    margin: 0 0 18px;
    color: var(--lq-cream, #f6f2ea);
  }
  .jsim-mission {
    margin-top: 26px;
    max-width: 460px;
    background: #f4efe4;
    color: #131b33;
    border-radius: 16px;
    padding: 20px 22px 18px;
    box-shadow: 0 18px 50px rgba(0,0,0,0.4);
    animation: jsimIn 600ms cubic-bezier(0.2,0.7,0.2,1) both;
  }
  .jsim-mission-head {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(19,27,51,0.55);
    margin-bottom: 8px;
  }
  .jsim-mission-headline {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: clamp(19px, 2.4vw, 24px);
    letter-spacing: -0.02em;
    line-height: 1.25;
    margin-bottom: 12px;
  }
  .jsim-mission-points { list-style: none; margin: 0 0 16px; padding: 0; }
  .jsim-mission-points li {
    position: relative;
    padding-left: 16px;
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.55;
    color: rgba(19,27,51,0.85);
  }
  .jsim-mission-points li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 9px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--jsim-accent, #92b8ff);
  }
  .jsim-mission-go {
    background: #131b33;
    color: #f4efe4;
    border: none;
    border-radius: 999px;
    padding: 11px 22px;
    font-family: var(--font-body);
    font-weight: 650;
    font-size: 14px;
    cursor: pointer;
    transition: transform 200ms cubic-bezier(0.2,0.7,0.2,1), box-shadow 200ms ease;
  }
  .jsim-mission-go:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,0.35); }
  .jsim-mission-go:active { transform: translateY(0); }

  /* Stagecard — announced turn in the story */
  .jsim-stagecard { text-align: left; padding-top: clamp(24px, 10vh, 90px); }
  .jsim-stagecard .jsim-narrative { font-size: clamp(26px, 4.4vw, 44px); }

  /* Auto-flowing cards: no button — they advance on their own, click to skip */
  .jsim-flow { cursor: pointer; outline: none; }
  .jsim-auto-timer {
    margin-top: 22px;
    max-width: 220px;
    height: 2px;
    border-radius: 999px;
    background: rgba(246,242,234,0.14);
    overflow: hidden;
  }
  .jsim-auto-timer i {
    display: block;
    height: 100%;
    width: 0;
    border-radius: 999px;
    background: var(--jsim-accent, #92b8ff);
    animation: jsimTimer linear both;
  }
  @keyframes jsimTimer { from { width: 0; } to { width: 100%; } }

  /* Conversation variants — a phone call, a face-to-face, a text thread */
  .jsim-call-dot[data-kind='talk'] { background: #f2b56b; animation: none; }
  .jsim-call-dot[data-kind='text'] { background: #92b8ff; animation: none; border-radius: 3px; }
  .jsim-bubble[data-kind='text'] {
    font-family: var(--font-mono);
    font-size: 13px;
    border-radius: 16px 16px 16px 4px;
    background: rgba(146, 184, 255, 0.1);
  }
  .jsim-call[data-kind='talk'] { border-left: 2px solid rgba(242, 181, 107, 0.45); }

  .jsim-eyebrow {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--jsim-accent, #92b8ff);
    margin-bottom: 14px;
  }
  .jsim-narrative {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(21px, 3.4vw, 32px);
    letter-spacing: -0.02em;
    line-height: 1.3;
    margin: 0 0 18px;
    max-width: 34ch;
    color: var(--lq-cream, #f6f2ea);
  }
  .jsim-prompt {
    font-family: var(--font-body);
    font-weight: 650;
    font-size: clamp(15px, 1.7vw, 17px);
    color: rgba(246,242,234,0.92);
    margin: 18px 0 14px;
  }
  .jsim-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 10px; }
  .jsim-opt {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
    padding: 16px 16px 13px;
    border-radius: 14px;
    border: 1px solid rgba(14,24,51,0.12);
    background: #f4efe4;
    color: #131b33;
    cursor: pointer;
    animation: jsimIn 420ms ease both;
    transition: transform 200ms cubic-bezier(0.2,0.7,0.2,1), box-shadow 200ms ease;
  }
  .jsim-opt:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
  .jsim-opt:active { transform: translateY(0); }
  .jsim-opt-label { font-size: 14.5px; font-weight: 600; line-height: 1.4; }
  .jsim-opt-sub {
    font-family: var(--font-mono);
    font-size: 8.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(19,27,51,0.5);
  }
  .jsim-custom { display: flex; gap: 8px; margin-top: 12px; }
  .jsim-custom input {
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
    transition: border-color 200ms ease;
  }
  .jsim-custom input:focus { border-color: rgba(146,184,255,0.7); border-style: solid; }
  .jsim-custom input::placeholder { color: rgba(246,242,234,0.4); }
  .jsim-custom button {
    border: none;
    border-radius: 999px;
    padding: 12px 20px;
    background: rgba(246,242,234,0.92);
    color: #131b33;
    font-weight: 700;
    font-size: 13.5px;
    cursor: pointer;
  }
  .jsim-custom button:disabled { opacity: 0.35; cursor: default; }

  .jsim-call {
    margin: 6px 0 4px;
    border-left: 2px solid rgba(146,184,255,0.35);
    padding-left: 16px;
  }
  .jsim-call-head {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.6);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .jsim-call-head strong { color: var(--jsim-accent, #92b8ff); }
  .jsim-call-dot {
    width: 8px; height: 8px; border-radius: 999px; background: #7ddba3;
    animation: jsimPulse 1.6s ease-in-out infinite;
  }
  @keyframes jsimPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
  .jsim-bubble {
    max-width: 56ch;
    background: rgba(246,242,234,0.08);
    border: 1px solid rgba(246,242,234,0.1);
    border-radius: 4px 16px 16px 16px;
    padding: 11px 15px;
    margin-bottom: 9px;
    font-size: 15px;
    line-height: 1.5;
    color: rgba(246,242,234,0.95);
    animation: jsimIn 450ms ease both;
  }

  .jsim-echo-text {
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(19px, 2.8vw, 26px);
    line-height: 1.45;
    color: rgba(246,242,234,0.95);
    max-width: 44ch;
    margin: 0 0 18px;
  }
  .jsim-echo-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
  .jsim-receipt {
    width: min(320px, 100%);
    background: #f6f2ea;
    color: #2a2118;
    font-family: var(--font-mono);
    font-size: 12.5px;
    padding: 14px 18px 16px;
    margin: -6px 0 24px;
    border-radius: 3px;
    transform: rotate(-0.6deg);
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    animation: jsimReceiptIn 500ms cubic-bezier(0.2,0.7,0.2,1) both;
    animation-delay: 250ms;
  }
  @keyframes jsimReceiptIn {
    from { opacity: 0; transform: rotate(-0.6deg) translateY(10px); }
    to { opacity: 1; transform: rotate(-0.6deg) translateY(0); }
  }
  .jsim-receipt-head {
    text-align: center;
    font-size: 9.5px;
    letter-spacing: 0.16em;
    color: rgba(42,33,24,0.55);
    border-bottom: 1.5px dashed rgba(42,33,24,0.3);
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
  .jsim-receipt-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 3px 0;
  }
  .jsim-receipt-row .is-up { color: #1c7a45; font-weight: 700; }
  .jsim-receipt-row .is-down { color: #a3542a; font-weight: 700; }
  .jsim-receipt-total {
    border-top: 1.5px dashed rgba(42,33,24,0.3);
    margin-top: 6px;
    padding-top: 8px;
    font-weight: 700;
  }
  .jsim-tag {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 5px 11px;
    border-radius: 999px;
    border: 1px solid rgba(246,242,234,0.18);
    color: rgba(246,242,234,0.75);
  }
  .jsim-continue {
    border: none;
    border-radius: 999px;
    padding: 14px 26px;
    background: var(--lq-cream, #f6f2ea);
    color: #131b33;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: transform 200ms cubic-bezier(0.2,0.7,0.2,1);
  }
  .jsim-continue:hover { transform: translateY(-1px); }
  .jsim-ending-body {
    font-size: 16.5px;
    line-height: 1.65;
    color: rgba(246,242,234,0.85);
    max-width: 62ch;
    margin: 0 0 26px;
  }

  @media (max-width: 640px) {
    .jsim-top-row { flex-wrap: wrap; }
    .jsim-title-wrap { order: 3; width: 100%; }
    .jsim-options { grid-template-columns: 1fr; }
  }
`

export default JourneySim
