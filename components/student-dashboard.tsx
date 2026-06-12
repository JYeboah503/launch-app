'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AISummary } from '@/components/ai-summary'
import { Statsboard } from '@/components/statsboard'
import { LaunchTransition } from '@/components/launch-transition'
import { ScenarioPlay } from '@/components/play'
import { pickScenarioForTitle } from '@/lib/play/sampleScenarios'
import { getCustomScenarioByCode } from '@/lib/scenarioStore'
import { evaluateAll } from '@/lib/aiEvaluator'
import { addSubmission } from '@/lib/submissionStore'
import type { GenericIntakeQuestion } from '@/lib/play/types'
import type { CompletionResult } from '@/lib/play/types'
import type { ScenarioVariant } from '@/lib/roles'
import { ProjectOverviewPage } from '@/components/project-overview-page'
import { BrandSelector } from '@/components/brand-selector'
import { ProjectsGallery } from '@/components/projects-gallery'
import { TrendingUp, Award, Zap, Clock } from 'lucide-react'
import { Mission } from '@/components/mission-structure'
import { LaunchWordmark } from '@/components/launch-wordmark'

interface Project {
  id: string
  name: string
  description: string
  missions?: Mission[]
  currentMissionId?: string
  currentSubScenarioId?: string
}

interface StudentDashboardProps {
  studentName: string
  onLogout?: () => void
}

const CAPABILITIES = [
  'Problem Solving',
  'Leadership',
  'Communication',
  'Adaptability',
  'Creativity',
  'Collaboration',
]

function useTypewriter(text: string, speed: number = 100) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)
    let index = 0

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return { displayedText, isComplete }
}

interface StudentDashboardProps {
  studentName: string
  onLogout: () => void
}

export function StudentDashboard({ studentName, onLogout }: StudentDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Product Strategy Challenge',
      description: 'Design a new feature for a mobile app',
      currentMissionId: '1',
      currentSubScenarioId: '1',
      missions: [
        {
          id: '1',
          title: 'Discovery & Validation',
          description: 'Understand the problem and validate with users',
          subScenarios: [
            { id: '1', title: 'User Research Kickoff', description: 'Interview 5 key users', status: 'current' },
            { id: '2', title: 'Problem Statement', description: 'Define the core problem', status: 'locked' },
            { id: '3', title: 'Solution Validation', description: 'Test assumptions', status: 'locked' },
          ],
        },
        {
          id: '2',
          title: 'Design & Prototyping',
          description: 'Create and iterate on design solutions',
          subScenarios: [
            { id: '4', title: 'Wireframing', description: 'Sketch initial concepts', status: 'locked' },
            { id: '5', title: 'High-Fidelity Design', description: 'Create polished designs', status: 'locked' },
            { id: '6', title: 'User Testing', description: 'Gather feedback on design', status: 'locked' },
          ],
        },
        {
          id: '3',
          title: 'Launch Planning',
          description: 'Plan the go-to-market strategy',
          subScenarios: [
            { id: '7', title: 'Launch Strategy', description: 'Define launch plan', status: 'locked' },
            { id: '8', title: 'Success Metrics', description: 'Define KPIs', status: 'locked' },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Leadership Scenario',
      description: 'Navigate a team conflict situation',
      currentMissionId: '1',
      currentSubScenarioId: '1',
      missions: [
        {
          id: '1',
          title: 'Understand the Situation',
          description: 'Gather facts and perspectives',
          subScenarios: [
            { id: '1', title: 'Individual Conversations', description: 'Speak with team members', status: 'completed' },
            { id: '2', title: 'Root Cause Analysis', description: 'Identify the core issue', status: 'current' },
          ],
        },
        {
          id: '2',
          title: 'Resolution & Alignment',
          description: 'Bring the team together',
          subScenarios: [
            { id: '3', title: 'Team Meeting', description: 'Address the conflict', status: 'locked' },
            { id: '4', title: 'Action Plan', description: 'Create next steps', status: 'locked' },
          ],
        },
      ],
    },
    {
      id: '3',
      name: 'Data Analysis Project',
      description: 'Analyze and present market trends',
      missions: [],
    },
    {
      id: '4',
      name: 'UX Design Sprint',
      description: 'Create user-centered design solutions',
      missions: [],
    },
    {
      id: '5',
      name: 'Business Growth Plan',
      description: 'Develop a scalable business strategy',
      missions: [],
    },
  ])

  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showLaunchTransition, setShowLaunchTransition] = useState(false)
  const [showScenarioPlay, setShowScenarioPlay] = useState(false)
  const [showProjectsGallery, setShowProjectsGallery] = useState(false)
  const lastBrandRef = useRef<string>('')
  const [currentScenarioTitle, setCurrentScenarioTitle] = useState('')
  const [currentScenarioDescription, setCurrentScenarioDescription] = useState('')
  // Self-created/quick-play scenarios default to the playful register. When a
  // scenario is launched via an access code, the variant locks to the
  // creator's metadata (teacher → playful, corporate → professional).
  const [currentScenarioVariant, setCurrentScenarioVariant] = useState<ScenarioVariant>('playful')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [currentGenericQuestions, setCurrentGenericQuestions] = useState<GenericIntakeQuestion[] | undefined>(undefined)
  const [currentScenarioCode, setCurrentScenarioCode] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [interest, setInterest] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [visibleCapabilities, setVisibleCapabilities] = useState<number[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showBrandSelector, setShowBrandSelector] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0)
  const [animatedText, setAnimatedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const scenarioExamples = [
    'Marketing Manager at Apple',
    'Business Analyst at Chelsea FC',
    'Product Manager at Microsoft',
    'Sales Director at Nike',
    'Operations Lead at Amazon',
    'Strategy Manager at Google',
  ]

  const exampleColors = [
    'text-lime-400',
    'text-blue-400',
    'text-emerald-400',
    'text-purple-400',
    'text-cyan-400',
    'text-pink-400',
  ]
  
  const typewriterText = 'EXPLORE YOUR TALENT,\nCONNECT WITH EMPLOYERS'
  const { displayedText, isComplete } = useTypewriter(typewriterText, 80)

  useEffect(() => {
    const handleScroll = () => {
      const heroElement = document.getElementById('hero-section')
      if (!heroElement) return
      
      const heroRect = heroElement.getBoundingClientRect()
      const scrollPercent = Math.max(0, 1 - (heroRect.bottom / window.innerHeight))
      const capabilitiesToShow = Math.floor(scrollPercent * CAPABILITIES.length)
      
      setVisibleCapabilities(
        Array.from({ length: Math.min(capabilitiesToShow, CAPABILITIES.length) }, (_, i) => i)
      )
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Typing animation for scenario examples
  useEffect(() => {
    if (interest.trim()) {
      setAnimatedText('')
      return
    }

    const currentExample = scenarioExamples[currentExampleIndex]
    let timeout: NodeJS.Timeout

    if (isTyping) {
      if (animatedText.length < currentExample.length) {
        timeout = setTimeout(() => {
          setAnimatedText(currentExample.slice(0, animatedText.length + 1))
        }, 30) // Fast typing speed
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false)
        }, 800) // Short pause before erasing
      }
    } else {
      if (animatedText.length > 0) {
        timeout = setTimeout(() => {
          setAnimatedText(animatedText.slice(0, -1))
        }, 25) // Fast erasing speed
      } else {
        setIsTyping(true)
        setCurrentExampleIndex((prev) => (prev + 1) % scenarioExamples.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [animatedText, isTyping, currentExampleIndex, interest, scenarioExamples.length])

  const handleCreateProject = () => {
    if (!interest.trim()) return
    // Use the typed interest directly as the department/scenario.
    // Variant is whatever the student chose via the Early/Advanced toggle —
    // don't reset it here; the toggle is the source of truth for self-create.
    setCurrentGenericQuestions(undefined)
    setCurrentScenarioCode(null)
    setSelectedDepartment(interest)
    setShowLaunchTransition(true)
    setCurrentScenarioTitle(interest)
    const scenarioDescription = `You're working as ${interest}. A critical decision needs to be made that will impact your team and company's strategic direction. What's your first strategic move?`
    setCurrentScenarioDescription(scenarioDescription)
    setTimeout(() => {
      setShowLaunchTransition(false)
      setShowScenarioPlay(true)
    }, 4000)
  }

  /**
   * Launch a scenario from an access code (issued by a teacher or corporate
   * from the builder). Resolves to a stub in the scenarioStore, locks the
   * variant to the creator's choice, and uses the role title to seed a
   * playable scenario via pickScenarioForTitle.
   */
  const handleCodeSubmit = () => {
    const code = codeInput.trim()
    if (!code) return
    const stub = getCustomScenarioByCode(code)
    if (!stub) {
      setCodeError('Code not recognised. Check spelling.')
      return
    }
    setCodeError(null)
    setCurrentScenarioTitle(stub.title)
    setCurrentScenarioDescription(
      `You've been given a ${stub.title} scenario. A live decision is unfolding — what's your first move?`
    )
    setCurrentScenarioVariant(stub.variant)
    setCurrentGenericQuestions(stub.genericQuestions)
    setCurrentScenarioCode(stub.code)
    setShowLaunchTransition(true)
    setTimeout(() => {
      setShowLaunchTransition(false)
      setShowScenarioPlay(true)
    }, 4000)
  }

  const handleQuickScenario = () => {
    // Quick scenario button - go to brand selector. Variant honours whatever
    // the student chose via the Early/Advanced toggle.
    setCurrentGenericQuestions(undefined)
    setCurrentScenarioCode(null)
    setShowBrandSelector(true)
  }

  const handleDepartmentSelected = (department: string) => {
    setSelectedDepartment(department)
    setShowBrandSelector(false)
    setShowLaunchTransition(true)
    setCurrentScenarioTitle(department)
    // Variant carried through from the toggle — don't reset here.
    const scenarioDescription = `You've been assigned to the ${department} team. A critical decision needs to be made that will impact the company's strategic direction. What's your first strategic move?`
    setCurrentScenarioDescription(scenarioDescription)
    setTimeout(() => {
      setShowLaunchTransition(false)
      setShowScenarioPlay(true)
    }, 4000)
  }

  const handlePlayComplete = (result: CompletionResult) => {
    console.log('[v0] Student completed scenario:', result)
    setShowScenarioPlay(false)
    setShowLaunchTransition(false)
    if (result.kind === 'create-new-scenario') {
      setShowBrandSelector(true)
    } else if (result.kind === 'department-selected') {
      setSelectedDepartment(`${result.company} · ${result.department}`)
    }
  }

  const handlePlayExit = () => {
    setShowScenarioPlay(false)
    setShowLaunchTransition(false)
  }

  // Show projects gallery if viewing all projects
  if (showProjectsGallery) {
    return (
      <ProjectsGallery
        projects={projects}
        onBack={() => setShowProjectsGallery(false)}
        onProjectSelect={(project) => {
          setSelectedProject(project)
          setShowProjectsGallery(false)
        }}
        onDashboard={() => {
          setShowProjectsGallery(false)
          setSelectedProject(null)
        }}
      />
    )
  }

  // Show project overview if a project is selected
  if (selectedProject && selectedProject.missions && selectedProject.missions.length > 0) {
    return (
      <ProjectOverviewPage 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)}
        onResumeMission={() => {
          // Start the launch transition sequence
          setShowLaunchTransition(true)
          setCurrentScenarioTitle(selectedProject.name)
          
          // After launch transition completes, show scenario play
          setTimeout(() => {
            setShowLaunchTransition(false)
            setShowScenarioPlay(true)
          }, 4000)
        }}
      />
    )
  }

  return (
    <main
      className="dark min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, #07091c 0%, #0e1737 50%, #182046 100%)',
        color: 'var(--lq-cream)',
      }}
    >
      <LaunchTransition
        isActive={showLaunchTransition}
        onComplete={() => setShowLaunchTransition(false)} 
      />
      {showScenarioPlay && (
        <ScenarioPlay
          scenario={pickScenarioForTitle(currentScenarioTitle, currentScenarioDescription)}
          profile={{ name: studentName }}
          variant={currentScenarioVariant}
          genericQuestions={currentGenericQuestions}
          onIntakeComplete={(answers, profile) => {
            // Evaluate the answers via the AI stub and persist a submission
            // immediately, so the org sees it even if the candidate bails on
            // the scenario afterwards.
            if (currentScenarioCode) {
              // Even when the scenario has no pre-qualifier questions, the
              // host still gets called with the captured profile (and empty
              // answers) so we ALWAYS write a Submission with full profile.
              const verdicts = currentGenericQuestions
                ? evaluateAll(currentGenericQuestions, answers)
                : []
              // Any verdict marked belowBenchmark flags the whole submission:
              // covers BOTH hard-filter (picked non-passing answer) and
              // open-text (overall < minScore) cases. Partner sees a single
              // red "Below benchmark" badge on Submissions; can sort/filter
              // by the flag.
              const notQualified = verdicts.some((v) => v.belowBenchmark === true)
              addSubmission({
                id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                scenarioCode: currentScenarioCode,
                scenarioTitle: currentScenarioTitle,
                candidateName: profile?.name || studentName || 'Student',
                variant: currentScenarioVariant,
                submittedAt: new Date().toISOString(),
                profile,
                intake: verdicts,
                notQualified,
                decisions: [],
              })
            }
          }}
          onComplete={handlePlayComplete}
          onExit={handlePlayExit}
        />
      )}
      {showBrandSelector && (
        <BrandSelector
          onBrandSelect={(brand) => {
            lastBrandRef.current = brand?.name || ''
          }}
          onDepartmentSelect={(department) => {
            const brandName = lastBrandRef.current
            const fullTitle = brandName ? `${brandName} · ${department}` : department
            setSelectedDepartment(department)
            setCurrentScenarioTitle(fullTitle)
            setCurrentScenarioDescription(
              `You've been assigned to the ${department} team at ${brandName || 'the company'}. A critical decision needs to be made that will impact strategic direction. What's your first strategic move?`
            )
            setShowBrandSelector(false)
            setShowLaunchTransition(true)
            setTimeout(() => {
              setShowLaunchTransition(false)
              setShowScenarioPlay(true)
            }, 4000)
          }}
          onClose={() => setShowBrandSelector(false)}
        />
      )}
      <div className="fixed top-0 left-0 right-0 z-40 border-b" style={{ borderColor: 'rgba(146, 184, 255, 0.12)', background: 'rgba(7, 9, 28, 0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LaunchWordmark height={26} tone="light" ariaLabel="LAUNCH" />
            <span className="hidden sm:inline editorial-mono" style={{ color: 'rgba(246, 242, 234, 0.5)' }}>
              · student
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="editorial-pill editorial-pill-ghost text-xs"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <section
        id="hero-section"
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

        {/* Quick Play — fills the upper screen; front-page font,
            cream with a light-blue italic accent. */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          <button
            type="button"
            onClick={handleQuickScenario}
            className="quick-play-sign"
          >
            Quick <em>play</em>
          </button>
        </div>

        {/* Cream band — full-bleed "Create your own scenario".
            The navy→cream edge IS the clear divide. */}
        <div className="relative z-10 create-band">
          <div className="create-band-inner">
            <div className="quick-create-label">Create your own scenario</div>

            {/* Career-stage register — self-created scenarios let the player pick */}
            <div
              role="radiogroup"
              aria-label="Career stage"
              className="self-level-toggle mt-4"
            >
              {(['playful', 'professional'] as const).map((v) => {
                const active = currentScenarioVariant === v
                return (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCurrentScenarioVariant(v)}
                    className="self-level-opt"
                    style={
                      active
                        ? { background: 'var(--launch-navy)', color: 'var(--lq-cream)', borderColor: 'var(--launch-navy)' }
                        : undefined
                    }
                  >
                    {v === 'playful' ? 'Early career' : 'Advanced career'}
                  </button>
                )
              })}
            </div>

            <div className="relative w-full max-w-2xl mt-5 sm:mt-6">
              <input
                id="create-scenario-input"
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                className="w-full bg-transparent text-2xl sm:text-3xl outline-none cursor-text relative z-10 text-center"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--lq-ink)',
                  fontWeight: 400,
                  letterSpacing: '-0.015em',
                  caretColor: 'var(--launch-lime-3)',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
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

            {/* "Got a code?" — code-entry path for assigned scenarios */}
            <div className="code-entry">
              <span className="code-entry-label">Got a code?</span>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value.toUpperCase())
                  if (codeError) setCodeError(null)
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCodeSubmit() }}
                placeholder="CLASS-XXXXXX or SCENARIO-…"
                className="code-entry-input"
                aria-label="Access code"
              />
              <button
                type="button"
                onClick={handleCodeSubmit}
                disabled={!codeInput.trim()}
                className="code-entry-btn"
              >
                Join →
              </button>
            </div>
            {codeError && (
              <p className="code-entry-error" role="alert">{codeError}</p>
            )}

            {/* Scroll cue — navy ink on cream */}
            <button
              type="button"
              aria-label="Scroll for more"
              onClick={() => {
                document
                  .getElementById('student-more')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          /* Full-bleed band — classical mosaic faded behind a cream wash.
             The cream overlay keeps the navy text readable; the mosaic
             reads as a warm parchment backdrop, not a subject. */
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
          /* Career-stage register toggle on the cream band */
          .self-level-toggle {
            display: inline-flex;
            padding: 4px;
            border-radius: 999px;
            background: rgba(14, 24, 51, 0.05);
            border: 1px solid rgba(14, 24, 51, 0.12);
          }
          .self-level-opt {
            padding: 8px 16px;
            border-radius: 999px;
            border: 1px solid transparent;
            background: transparent;
            color: var(--lq-ink-2);
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 13px;
            letter-spacing: -0.005em;
            cursor: pointer;
            transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
          }
          .self-level-opt:hover { color: var(--lq-ink); }

          /* "Create your own scenario" — navy ink on the cream band,
             bigger and centred, front-page display font. */
          .quick-create-label {
            font-family: var(--font-display);
            font-weight: 500;
            font-size: clamp(24px, 3.4vw, 40px);
            letter-spacing: -0.02em;
            line-height: 1.1;
            color: var(--launch-navy);
            text-align: center;
          }
          /* Quick Play — one big borderless sign, front-page font.
             Light weight, cream lead-word, light-blue italic accent.
             Calm, not aggressive. */
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

          /* "Got a code?" entry — quiet third path on the cream band */
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
            min-width: 220px;
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
          .code-entry-error {
            margin-top: 10px;
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #7a0e2a;
          }

          /* Scroll cue — navy ink on the cream band, gently bobbing */
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

          /* Colourful stat tiles — each carries its own accent. */
          .metric-card {
            border-radius: var(--card-r);
            background: rgba(246, 242, 234, 0.045);
            border: 1px solid rgba(246, 242, 234, 0.10);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
          }
          .metric-card:hover {
            background: color-mix(in srgb, var(--accent) 10%, rgba(246, 242, 234, 0.045));
            border-color: color-mix(in srgb, var(--accent) 45%, transparent);
            box-shadow: 0 12px 32px color-mix(in srgb, var(--accent) 18%, transparent);
          }
          .metric-accent-bar {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--accent);
            opacity: 0.55;
            transition: opacity 300ms ease;
          }
          .metric-card:hover .metric-accent-bar { opacity: 1; }

          /* Project cards — accent top-edge, lifts colour on hover. */
          .project-card {
            border-radius: var(--card-r);
            background: rgba(246, 242, 234, 0.05);
            border: 1px solid rgba(246, 242, 234, 0.10);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
          }
          .project-card:hover {
            background: color-mix(in srgb, var(--accent) 9%, rgba(246, 242, 234, 0.05));
            border-color: color-mix(in srgb, var(--accent) 42%, transparent);
            box-shadow: 0 14px 36px color-mix(in srgb, var(--accent) 16%, transparent);
          }
        `}</style>
      </section>
      <section id="student-more" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4 items-stretch min-h-60 sm:min-h-80">
          {/* Left: AI Summary - Twice the width */}
          <div className="lg:col-span-2">
            <AISummary 
              studentName={studentName}
              improvements={['Leadership', 'Problem Solving', 'Communication']}
            />
          </div>

          {/* Right: Stats in 2x2 Grid - Smaller boxes */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 h-full">
              {[
                {
                  icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
                  label: 'Skills Improved',
                  value: 12,
                  unit: 'skills',
                  accent: '#1B9E8F',
                  trend: 24,
                },
                {
                  icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
                  label: 'Time on Platform',
                  value: 42,
                  unit: 'hours',
                  accent: '#fbbf24',
                  trend: 18,
                },
                {
                  icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
                  label: 'Scenarios Completed',
                  value: 28,
                  unit: 'completed',
                  accent: '#a78bfa',
                  trend: 32,
                },
                {
                  icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
                  label: 'Consistency Streak',
                  value: 15,
                  unit: 'days',
                  accent: '#92b8ff',
                  trend: 7,
                },
              ].map((metric, idx) => (
                <div
                  key={idx}
                  className="metric-card relative overflow-hidden p-5 sm:p-6 transition-all duration-300 hover:-translate-y-[2px] cursor-pointer group flex flex-col"
                  style={{ ['--accent' as string]: metric.accent }}
                >
                  <span className="metric-accent-bar" aria-hidden />
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="p-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${metric.accent} 16%, transparent)`,
                          color: metric.accent,
                        }}
                      >
                        <div className="w-5 h-5">
                          {metric.icon}
                        </div>
                      </div>
                      {metric.trend !== undefined && (
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] tracking-[0.16em] uppercase font-medium"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${metric.accent} 16%, transparent)`,
                            color: metric.accent,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {metric.trend}%
                        </div>
                      )}
                    </div>

                    <div className="editorial-mono mb-2">{metric.label}</div>

                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-4xl sm:text-5xl"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 600,
                          letterSpacing: '-0.025em',
                          color: metric.accent,
                          lineHeight: 1,
                        }}
                      >
                        {metric.value}
                      </span>
                      <span className="text-sm" style={{ color: 'rgba(246, 242, 234, 0.5)' }}>{metric.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad-sm space-y-10">
        <div className="editorial-container px-4 sm:px-6">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-2">
            <div>
              <div className="editorial-eyebrow mb-2">Recent projects</div>
              <h2 className="editorial-display-sm">Keep building your skills.</h2>
            </div>
            <button
              onClick={() => setShowProjectsGallery(true)}
              className="editorial-mono inline-flex items-center gap-2 transition-colors hover:text-[var(--lq-cream)]"
              style={{ color: 'rgba(246, 242, 234, 0.62)' }}
            >
              View all <span aria-hidden>→</span>
            </button>
          </div>
        </div>

        <div className="overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[#0e1737] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[#0e1737] to-transparent z-20 pointer-events-none" />

          <div className="relative z-10 overflow-x-auto scrollbar-hide px-4 sm:px-6 py-2" style={{ scrollBehavior: 'smooth' }}>
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {projects.map((project, idx) => {
                const projectAccents = ['#1B9E8F', '#92b8ff', '#fbbf24', '#a78bfa', '#f472b6']
                const accent = projectAccents[idx % projectAccents.length]
                return (
                <article
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedProject(project) }}
                  className="project-card relative overflow-hidden p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-[2px] group cursor-pointer h-80 sm:h-[360px] flex-shrink-0 w-80 sm:w-96"
                  style={{ ['--accent' as string]: accent }}
                >
                  <span className="metric-accent-bar" aria-hidden />
                  <div className="flex items-start justify-between mb-3">
                    <div className="editorial-mono" style={{ color: accent }}>Project · {String(idx + 1).padStart(2, '0')}</div>
                    <span
                      aria-hidden
                      className="inline-block rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ width: 9, height: 9, background: accent }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-2xl sm:text-3xl line-clamp-2 mb-3"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        letterSpacing: '-0.018em',
                        lineHeight: 1.05,
                      }}
                    >
                      {project.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed line-clamp-3"
                      style={{ color: 'rgba(246, 242, 234, 0.62)' }}
                    >
                      {project.description}
                    </p>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowLaunchTransition(true)
                      setCurrentScenarioTitle(project.name)
                      setCurrentScenarioDescription(project.description || '')
                      setTimeout(() => {
                        setShowLaunchTransition(false)
                        setShowScenarioPlay(true)
                      }, 4000)
                    }}
                    size="sm"
                    className="self-start"
                  >
                    Resume <span aria-hidden>→</span>
                  </Button>
                </article>
                )
              })}
            </div>
          </div>
        </div>

        <div className="editorial-container px-4 sm:px-6 flex flex-col items-center">
          <Button
            size="lg"
            onClick={() => setShowNewProjectModal(true)}
            className="w-full sm:w-auto"
          >
            <span aria-hidden>+</span> New project
          </Button>
        </div>
      </section>

      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full mx-4 space-y-6 border border-border">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Start a New Project</h2>
              <p className="text-muted-foreground">
                What is the coolest job you'd want to do?
              </p>
            </div>

            <Input
              type="text"
              placeholder="e.g., Product Manager at a tech startup"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProject()
              }}
              className="rounded-xl h-12 text-base"
              autoFocus
            />

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowNewProjectModal(false)
                  setJobTitle('')
                }}
                variant="outline"
                className="flex-1 rounded-xl h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!jobTitle.trim()}
                className="flex-1 rounded-xl h-12 bg-accent hover:bg-accent/90 text-foreground font-semibold"
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
