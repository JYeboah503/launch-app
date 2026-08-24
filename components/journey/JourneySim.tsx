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

import { useMemo, useState } from 'react'
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
  | { kind: 'hub' }
  | { kind: 'node'; id: string }
  | { kind: 'echo'; text: string; skill?: string; effects?: SimEffect; to: string; custom?: boolean }
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
  const [phase, setPhase] = useState<Phase>({ kind: 'hub' })
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

  const fill = (s: string) =>
    s
      .replaceAll('{name}', name || 'mate')
      .replaceAll('{venueLine}', streams.venue === 'sorted' ? ' — Marge kept her word' : '')

  const currentNode: SimNode | null = phase.kind === 'node' ? script.nodes[phase.id] : null

  /* Advance out of an echo: apply effects, then route. */
  const continueFromEcho = () => {
    if (phase.kind !== 'echo') return
    const fx = phase.effects
    if (fx) {
      if (fx.score) setScore((v) => Math.max(0, Math.min(100, v + fx.score!)))
      if (fx.days) setDay((d) => Math.min(script.daysTotal, d + fx.days!))
      if (fx.stream && fx.status) setStreams((s) => ({ ...s, [fx.stream!]: fx.status! }))
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
        // The complication that arrives depends on what the player secured.
        const venueOk = (phase.effects?.stream === 'venue' ? phase.effects.status : streams.venue) === 'sorted'
        setPhase({ kind: 'node', id: venueOk ? script.complication.venueSorted : script.complication.venueNot })
      } else {
        setPhase({ kind: 'hub' })
      }
      return
    }
    setPhase({ kind: 'node', id: to })
  }

  const trackSkill = (skill?: string) => {
    if (!skill) return
    setSkillCounts((c) => ({ ...c, [skill]: (c[skill] || 0) + 1 }))
  }

  const pickOption = (node: SimNode, opt: SimOption) => {
    setCustomText('')
    trackSkill(opt.skill)
    setPhase({ kind: 'echo', text: fill(opt.response), skill: opt.skill, effects: opt.effects, to: opt.to })
  }

  const pickCustom = (node: SimNode | null) => {
    const text = customText.trim()
    if (!text) return
    setCustomText('')
    trackSkill('Self-direction')
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

  const tier = score >= 68 ? 'high' : score >= 45 ? 'mid' : 'low'
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

  return (
    <main className="jsim-root">
      {/* Project header — the evolving state of the activity */}
      <header className="jsim-top">
        <div className="jsim-top-row">
          <button type="button" className="jsim-exit" onClick={onExit}>← Leave</button>
          <div className="jsim-title-wrap">
            <div className="jsim-title">{script.title}</div>
            <div className="jsim-club">{script.club} · {passionLabel}</div>
          </div>
          <div className="jsim-day">DAY {Math.min(day, script.daysTotal)} <span>of {script.daysTotal}</span></div>
        </div>
        <div className="jsim-meter-row">
          <span className="jsim-meter-label">{script.goalLabel}</span>
          <div className="jsim-meter"><div className="jsim-meter-fill" style={{ width: `${score}%` }} /></div>
          <span className="jsim-meter-val">{score}%</span>
        </div>
        <div className="jsim-streams">
          {streamKeys.map((k) => (
            <span key={k} className="jsim-chip" data-status={streams[k]}>
              <i style={{ background: STATUS_COLOR[streams[k]] }} />
              {script.streams[k].label}
              <em>{STATUS_LABEL[streams[k]]}</em>
            </span>
          ))}
        </div>
      </header>

      <section className="jsim-stage">
        {/* ---------------- HUB ---------------- */}
        {phase.kind === 'hub' && (
          <div className="jsim-card" key={`hub-${hubVisits}`}>
            <div className="jsim-eyebrow">
              {hubVisits === 0 ? fill(script.intro.eyebrow) : `Day ${Math.min(day, script.daysTotal)} · back at the clubrooms`}
            </div>
            <h1 className="jsim-narrative">
              {hubVisits === 0
                ? fill(script.intro.narrative)
                : 'One thing done, and the clipboard is already asking about the next. The day is coming whether the list is ready or not.'}
            </h1>
            <div className="jsim-prompt">{hubVisits === 0 ? script.intro.prompt : 'What do you take on next?'}</div>
            <div className="jsim-options">
              {remainingDoors.map((k, i) => (
                <button key={k} type="button" className="jsim-opt" style={{ animationDelay: `${i * 70}ms` }} onClick={() => setPhase({ kind: 'node', id: script.streams[k].entry })}>
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

            {currentNode.kind === 'call' && currentNode.speaker && (
              <div className="jsim-call">
                <div className="jsim-call-head">
                  <span className="jsim-call-dot" /> On the phone — <strong>{currentNode.speaker.name}</strong> · {currentNode.speaker.role}
                </div>
                {(currentNode.dialogue || []).map((line, i) => (
                  <div key={i} className="jsim-bubble" style={{ animationDelay: `${400 + i * 850}ms` }}>
                    {fill(line)}
                  </div>
                ))}
              </div>
            )}

            <div
              className="jsim-prompt"
              style={currentNode.kind === 'call' ? { animation: 'jsimIn 500ms ease both', animationDelay: `${400 + (currentNode.dialogue?.length || 0) * 850}ms` } : undefined}
            >
              {fill(currentNode.prompt)}
            </div>
            <div className="jsim-options">
              {currentNode.options.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  className="jsim-opt"
                  style={{ animationDelay: `${currentNode.kind === 'call' ? 500 + (currentNode.dialogue?.length || 0) * 850 + i * 90 : i * 90}ms` }}
                  onClick={() => pickOption(currentNode, opt)}
                >
                  <span className="jsim-opt-label">{fill(opt.label)}</span>
                  {opt.skill && <span className="jsim-opt-sub">{opt.skill}</span>}
                </button>
              ))}
            </div>
            <div className="jsim-custom" style={currentNode.kind === 'call' ? { animation: 'jsimIn 500ms ease both', animationDelay: `${700 + (currentNode.dialogue?.length || 0) * 850}ms` } : undefined}>
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
          <div className="jsim-card jsim-echo" key="echo">
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
            <button type="button" className="jsim-continue" onClick={continueFromEcho}>Keep going →</button>
          </div>
        )}

        {/* ---------------- ENDING ---------------- */}
        {phase.kind === 'ending' && (
          <div className="jsim-card" key="ending">
            <div className="jsim-eyebrow">{script.goalLabel} · {score}%</div>
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
              See what you showed →
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
    color: #92b8ff;
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

  .jsim-eyebrow {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #92b8ff;
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
  .jsim-call-head strong { color: #92b8ff; }
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
