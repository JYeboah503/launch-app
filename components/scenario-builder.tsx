'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronRight, X, ChevronDown, Edit2, Trash2, Plus } from 'lucide-react'
import type { CreatorType, ScenarioVariant, ScenarioLevel } from '@/lib/roles'
import { levelToVariant, defaultLevelForCreator } from '@/lib/roles'

interface ScenarioBuilderProps {
  onStartClick?: () => void
  onRoleCreated?: (roleData: {
    id: string
    name: string
    accessCode: string
    skills: string[]
    questionsCount: number
    createdAt: Date
    creatorType: CreatorType
    variant: ScenarioVariant
  }) => void
  /**
   * Optional: lets a parent (e.g. teacher dashboard) open the builder
   * directly into 'role' step, skipping the corporate-dashboard "Start" tile.
   * When this transitions false → true, the modal opens. When the modal closes
   * internally, onClose fires so the parent can reset.
   */
  externalOpen?: boolean
  onClose?: () => void
  /** Locked creator metadata. Defaults to corporate / professional. */
  creatorType?: CreatorType
  variant?: ScenarioVariant
}

type BuilderStep = 'initial' | 'role' | 'details' | 'editor' | 'complete'

interface ScenarioQuestion {
  id: string
  question: string
  skill: string
  questionVariations?: {
    [key: string]: string // key is previous question's answer (e.g., "q1:a" or "q1:a:support")
  }
  options: {
    id: string
    text: string
    consequence: string
    followUpQuestion: string
    followUps: {
      id: string
      text: string
      leaning: 'support' | 'neutral' | 'challenge'
      reasoning: string
    }[]
  }[]
}

const SKILLS = [
  'Problem-Solving & Critical Analysis',
  'Learning Agility',
  'Leadership & Influence',
  'Emotional Intelligence (Empathy & Cultural Awareness)',
  'Decision-Making Under Uncertainty',
  'Resilience & Grit',
  'Adaptability & Cognitive Flexibility',
  'Integrity & Trustworthiness',
  'Collaboration & Team Effectiveness',
  'Situational Awareness & Pattern Recognition'
]

// Default decision tree scenarios with answer-specific follow-up paths
const DEFAULT_SCENARIOS: ScenarioQuestion[] = [
  {
    id: 'q1',
    question: 'You discover a critical flaw in the project timeline just before launch. What do you do?',
    skill: 'Judgment & Decision-Making',
    options: [
      { 
        id: 'a', 
        text: 'Delay launch to fix it properly', 
        consequence: 'You miss the market window but deliver quality. Stakeholders question your risk management.',
        followUpQuestion: 'Why did you choose to delay the launch?',
        followUps: [
          { id: '1', text: 'Delaying gives me more time to ensure everything is perfect', leaning: 'support', reasoning: 'Prioritizes quality and thoroughness' },
          { id: '2', text: 'Delivering a flawed product would damage our reputation more than a delayed launch', leaning: 'neutral', reasoning: 'Balances quality and business impact' },
          { id: '3', text: 'A critical flaw is risky, and I\'d rather delay than have customers deal with it', leaning: 'challenge', reasoning: 'Questions if immediate launch is worth the risk' }
        ]
      },
      { 
        id: 'b', 
        text: 'Proceed with a documented workaround', 
        consequence: 'Launch succeeds but technical debt builds. How do you manage stakeholder expectations?',
        followUpQuestion: 'Why did you choose to proceed with the workaround?',
        followUps: [
          { id: '1', text: 'Getting to market quickly is crucial—we can address the debt later', leaning: 'support', reasoning: 'Prioritizes business velocity and market timing' },
          { id: '2', text: 'A documented workaround lets us ship while managing risk responsibly', leaning: 'neutral', reasoning: 'Balances speed with accountability' },
          { id: '3', text: 'The workaround works short-term, but technical debt compounds quickly', leaning: 'challenge', reasoning: 'Questions the long-term feasibility of this approach' }
        ]
      },
      { 
        id: 'c', 
        text: 'Rally the team for an emergency sprint', 
        consequence: 'The team works overtime. How do you balance urgency with team welfare?',
        followUpQuestion: 'Why did you choose to rally the team for an emergency sprint?',
        followUps: [
          { id: '1', text: 'Our team thrives on challenges, and fixing this in real-time proves our capability', leaning: 'support', reasoning: 'Emphasizes team strength and shared commitment' },
          { id: '2', text: 'An emergency sprint is justified if we have a clear recovery plan afterward', leaning: 'neutral', reasoning: 'Enables action with planned team care' },
          { id: '3', text: 'Frequent emergencies burn out teams and signal poor planning', leaning: 'challenge', reasoning: 'Questions whether this sets a sustainable precedent' }
        ]
      }
    ]
  },
  {
    id: 'q2',
    question: 'A senior colleague strongly disagrees with your strategic recommendation in a meeting. How do you respond?',
    skill: 'Leadership & Influence',
    questionVariations: {
      'q1:a': 'Your senior colleague disagrees with your strategy—similar to the urgency you just handled. However, this time it\'s about direction, not timeline. How do you respond?',
      'q1:b': 'Your senior colleague disagrees with your pragmatic approach. They want a more conservative strategy. How do you respond?',
      'q1:c': 'Your senior colleague questions the aggressive timeline and wants to slow down. How do you respond when they challenge your urgency?',
      'q1:a:support': 'Your senior colleague strongly disagrees and seems frustrated by your decisive nature. How do you handle their opposition?',
      'q1:b:support': 'Your senior colleague prefers the opposite trade-off and challenges your pragmatism. How do you respond?',
      'q1:c:challenge': 'Your senior colleague agrees with your urgency but questions your execution approach. How do you address their concerns?'
    },
    options: [
      { 
        id: 'a', 
        text: 'Acknowledge their concerns and suggest exploring both approaches', 
        consequence: 'The team respects the diplomatic approach. But how do you prevent decision paralysis?',
        followUpQuestion: 'Why did you choose to acknowledge and explore both approaches?',
        followUps: [
          { id: '1', text: 'Building consensus and team trust matters more than being right', leaning: 'support', reasoning: 'Values psychological safety and collaboration' },
          { id: '2', text: 'Exploring both approaches shows respect while maintaining momentum', leaning: 'neutral', reasoning: 'Diplomatic without sacrificing decision speed' },
          { id: '3', text: 'Endless exploration can actually damage team confidence', leaning: 'challenge', reasoning: 'Questions whether exploration might cause paralysis' }
        ]
      },
      { 
        id: 'b', 
        text: 'Present data and evidence to support your position', 
        consequence: 'You establish credibility. How do you maintain the relationship?',
        followUpQuestion: 'Why did you choose to present data to support your position?',
        followUps: [
          { id: '1', text: 'Data-driven decisions are stronger, and facts should win the argument', leaning: 'support', reasoning: 'Prioritizes decision quality through evidence' },
          { id: '2', text: 'Presenting evidence firmly but respectfully maintains credibility', leaning: 'neutral', reasoning: 'Strong argument while preserving relationships' },
          { id: '3', text: 'Data presentation can come across as dismissive of their experience', leaning: 'challenge', reasoning: 'Questions whether facts alone preserve relationships' }
        ]
      },
      { 
        id: 'c', 
        text: 'Defer to their experience and support their approach', 
        consequence: 'You show humility. But how do you ensure your insights are valued?',
        followUpQuestion: 'Why did you choose to defer to their experience?',
        followUps: [
          { id: '1', text: 'Respecting seniority and learning from experience demonstrates maturity', leaning: 'support', reasoning: 'Values wisdom and organizational hierarchy' },
          { id: '2', text: 'Deferring now keeps the door open for your input later', leaning: 'neutral', reasoning: 'Respects experience while preserving future influence' },
          { id: '3', text: 'Over-deferring can signal that you lack conviction or capability', leaning: 'challenge', reasoning: 'Questions whether deference undermines your credibility' }
        ]
      }
    ]
  },
  {
    id: 'q3',
    question: 'You realize a colleague may have taken credit for work you led. What do you do?',
    skill: 'Integrity & Ethics',
    questionVariations: {
      'q1:a|q2:a': 'After both situations, a colleague takes credit for your work. Your pattern of directness and collaboration suggests how you might handle this. What do you do?',
      'q1:a|q2:b': 'You\'ve been decisive and evidence-focused. Now a colleague claims credit for your work. Given your track record, how do you respond?',
      'q1:b|q2:a': 'You\'ve balanced pragmatism with diplomacy. Now a colleague takes credit for your work—another test of your judgment. How do you handle it?',
      'q1:c|q2:b': 'You\'ve pushed for urgency and backed it with evidence. Now a colleague takes credit for work you led. What do you do?',
      'q1:a|q2:a|q3:a': 'This pattern of directness and open collaboration puts you in a strong position to address this directly.',
      'q1:b|q2:c|q3:b': 'Your pragmatic and humble approach suggests a careful documentation approach might fit your style.',
      'q1:c|q2:b|q3:c': 'Your track record of standing firm but looking forward suggests handling this by focusing on future visibility.'
    },
    options: [
      { 
        id: 'a', 
        text: 'Address it directly with them privately', 
        consequence: 'Honest conversation. But what if they deny it or get defensive?',
        followUpQuestion: 'Why did you choose to address it directly?',
        followUps: [
          { id: '1', text: 'Direct honesty clears the air and gives them a chance to explain', leaning: 'support', reasoning: 'Values integrity and interpersonal directness' },
          { id: '2', text: 'Private conversation respects them while protecting your interests', leaning: 'neutral', reasoning: 'Professional approach balancing honesty and discretion' },
          { id: '3', text: 'Direct confrontation might escalate tension unnecessarily', leaning: 'challenge', reasoning: 'Questions whether direct approach is always wise' }
        ]
      },
      { 
        id: 'b', 
        text: 'Document your contributions and notify your manager', 
        consequence: 'Clear record. How do you do this without appearing retaliatory?',
        followUpQuestion: 'Why did you choose to document and notify your manager?',
        followUps: [
          { id: '1', text: 'Creating a clear record protects you and ensures accurate attribution', leaning: 'support', reasoning: 'Values smart career protection' },
          { id: '2', text: 'Manager awareness establishes a professional record appropriately', leaning: 'neutral', reasoning: 'Protective while appearing professional' },
          { id: '3', text: 'Involving management might seem like escalation before addressing directly', leaning: 'challenge', reasoning: 'Questions whether this approach seems retaliatory' }
        ]
      },
      { 
        id: 'c', 
        text: 'Let it go but ensure visibility on future projects', 
        consequence: 'Avoids conflict. But what message does this send?',
        followUpQuestion: 'Why did you choose to let it go and focus forward?',
        followUps: [
          { id: '1', text: 'Moving forward gracefully shows confidence in your future success', leaning: 'support', reasoning: 'Values strategic patience and forward thinking' },
          { id: '2', text: 'Increased visibility prevents future issues without past conflict', leaning: 'neutral', reasoning: 'Protective while maintaining relationships' },
          { id: '3', text: 'Not addressing it might enable them to do it again', leaning: 'challenge', reasoning: 'Questions whether letting it go sets precedent' }
        ]
      }
    ]
  }
]

// Helper function to get adapted question text based on chosen path
function getAdaptedQuestion(scenario: ScenarioQuestion, chosenPath: { [key: string]: { answer: string; reasoning: string } }): string {
  if (!scenario.questionVariations) return scenario.question
  
  // Build variation keys based on previously chosen answers
  const keys: string[] = []
  
  // Try specific combinations first
  const prevQuestionId = scenario.id === 'q2' ? 'q1' : scenario.id === 'q3' ? 'q2' : null
  if (prevQuestionId && chosenPath[prevQuestionId]) {
    const prevAnswer = chosenPath[prevQuestionId].answer
    const prevReasoning = chosenPath[prevQuestionId].reasoning
    keys.push(`${prevQuestionId}:${prevAnswer}|${prevReasoning}`)
    keys.push(`${prevQuestionId}:${prevAnswer}:${prevReasoning}`)
    keys.push(`${prevQuestionId}:${prevAnswer}`)
  }
  
  // For Q3, also try two-step combinations
  if (scenario.id === 'q3' && chosenPath['q1'] && chosenPath['q2']) {
    keys.push(`q1:${chosenPath['q1'].answer}|q2:${chosenPath['q2'].answer}`)
  }
  
  // Find first matching variation
  for (const key of keys) {
    if (scenario.questionVariations[key]) {
      return scenario.questionVariations[key]
    }
  }
  
  return scenario.question
}

// Helper function to generate questions based on structure
function generateQuestionsForStructure(count: number): ScenarioQuestion[] {
  // For now, replicate the first question as needed to reach the desired count
  const questions: ScenarioQuestion[] = []
  const baseQuestion = DEFAULT_SCENARIOS[0]
  
  for (let i = 0; i < count; i++) {
    questions.push({
      ...baseQuestion,
      id: `q${i + 1}`
    })
  }
  
  return questions
}

export function ScenarioBuilder({
  onStartClick,
  onRoleCreated,
  externalOpen,
  onClose,
  creatorType = 'corporate',
  variant = 'professional',
}: ScenarioBuilderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<BuilderStep>('initial')

  // Honour external open requests (e.g. teacher dashboard "Build my own").
  const hasOpenedRef = useRef(false)
  useEffect(() => {
    if (externalOpen && !isOpen) {
      setIsOpen(true)
      setStep('role')
      hasOpenedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalOpen])

  // Surface close events back up (only after the builder has actually opened).
  useEffect(() => {
    if (!isOpen && hasOpenedRef.current && onClose) {
      onClose()
      hasOpenedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [structure, setStructure] = useState('3x3')
  const [selectedSkills, setSelectedSkills] = useState<{ skill: string; difficulty: string }[]>([])
  // Career-stage register the creator is authoring for. Defaults by creator
  // type; either creator can override before generating the access code.
  const [level, setLevel] = useState<ScenarioLevel>(defaultLevelForCreator(creatorType))
  const [accessCode, setAccessCode] = useState('')
  const [scenarios, setScenarios] = useState<ScenarioQuestion[]>(DEFAULT_SCENARIOS)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [expandedFollowUp, setExpandedFollowUp] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [chosenPath, setChosenPath] = useState<{ [questionId: string]: { answer: string; reasoning: string } }>({})
  const [copied, setCopied] = useState(false)

  // Navigate to role selection step when starting
  const handleStartBuilding = () => {
    setIsOpen(true)
    setStep('role')
  }

  const handleGenerateCode = () => {
    const code = `SCENARIO-${Date.now().toString(36).toUpperCase()}`
    const questionCount = structure === '3x3' ? 3 : structure === '6x3' ? 6 : 9
    setAccessCode(code)
    setStep('complete')
    
    // Call the callback with role data. Corporate-authored scenarios carry
    // creator metadata so the play flow can render the locked professional
    // variant (wired up in Section D).
    if (onRoleCreated) {
      const skillNames = selectedSkills.map(s => s.skill)
      onRoleCreated({
        id: code,
        name: role,
        accessCode: code,
        skills: skillNames,
        questionsCount: questionCount,
        createdAt: new Date(),
        creatorType,
        // Level chosen inside the builder overrides the parent's default
        // variant. This way the same builder mount can ship either register.
        variant: levelToVariant(level),
      })
    }
  }

  const handleReset = () => {
    setIsOpen(false)
    setStep('initial')
    setRole('')
    setDescription('')
    setDifficulty('medium')
    setSelectedSkills([])
    setAccessCode('')
    setScenarios(DEFAULT_SCENARIOS)
    setEditingQuestion(null)
    setChosenPath({})
    setExpandedQuestion(null)
    setCopied(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.skill === skill)
      if (exists) {
        return prev.filter(s => s.skill !== skill)
      } else {
        return [...prev, { skill, difficulty: 'medium' }]
      }
    })
  }

  const handleRoleSubmit = () => {
    if (role.trim()) {
      setStep('details')
    }
  }

  const handleGoToEditor = () => {
    if (description.trim() && selectedSkills.length > 0) {
      // Generate questions based on structure selection
      const questionCount = structure === '3x3' ? 3 : structure === '6x3' ? 6 : 9
      const generatedQuestions = generateQuestionsForStructure(questionCount)
      setScenarios(generatedQuestions)
      setStep('editor')
    }
  }

  const updateSkillDifficulty = (skill: string, diff: string) => {
    setSelectedSkills(prev =>
      prev.map(s => s.skill === skill ? { ...s, difficulty: diff } : s)
    )
  }

  const deleteQuestion = (id: string) => {
    setScenarios(prev => prev.filter(q => q.id !== id))
  }

  const startEditQuestion = (id: string, text: string) => {
    setEditingQuestion(id)
    setEditText(text)
  }

  const saveEditQuestion = (id: string) => {
    setScenarios(prev =>
      prev.map(q => q.id === id ? { ...q, question: editText } : q)
    )
    setEditingQuestion(null)
    setEditText('')
  }

  const updateOptionConsequence = (questionId: string, optionId: string, newConsequence: string) => {
    setScenarios(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map(o =>
                o.id === optionId ? { ...o, consequence: newConsequence } : o
              )
            }
          : q
      )
    )
  }

  const trackAnswerChoice = (questionId: string, optionId: string, reasoning: string = '') => {
    // When an answer is selected, store the choice for question adaptation
    setChosenPath(prev => ({
      ...prev,
      [questionId]: { answer: optionId, reasoning }
    }))
  }

  const handleFollowUpClick = (questionId: string, optionId: string, followUpId: string, leaning: string) => {
    // Track the reasoning when a follow-up is selected
    trackAnswerChoice(questionId, optionId, leaning)
  }

  return (
    <>
      <div className="border-b border-[var(--lq-line)] bg-[var(--lq-cream-2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <div className="editorial-eyebrow mb-3">The studio · scenario</div>
              <h2 className="editorial-display-sm mb-5 max-w-[22ch]">
                Write the moment you want them to walk into.
              </h2>
              <p className="editorial-lede mb-6 max-w-[58ch]" style={{ color: 'var(--lq-ink-2)' }}>
                Sketch the role. Drop in the kind of decision the job actually
                turns on. We&rsquo;ll shape it into a live scenario, with
                consequences that reach back, and generate an access code for
                your shortlist.
              </p>
              <button
                onClick={handleStartBuilding}
                className="editorial-pill editorial-pill-primary group/btn"
              >
                Begin a scenario
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right-side index — what to expect, mirrors LQ ambient list */}
            <aside className="lg:col-span-5">
              <div className="editorial-mono mb-3" style={{ color: 'var(--lq-ink-3)' }}>
                What you&rsquo;ll do
              </div>
              <ol className="space-y-3">
                {[
                  ['01', 'Name the role', 'A line, not a brief. Just what you&rsquo;re hiring for.'],
                  ['02', 'Set the stakes', 'The capabilities the work actually depends on.'],
                  ['03', 'Shape the moments', 'Three to nine decisions, with real consequence.'],
                  ['04', 'Hand it off', 'Issue an access code to your shortlist.'],
                ].map(([num, label, desc]) => (
                  <li
                    key={num}
                    className="flex items-start gap-4 py-2 border-b border-[var(--lq-line)] last:border-b-0"
                  >
                    <span
                      className="editorial-mono"
                      style={{ minWidth: 24, color: 'var(--launch-navy)' }}
                    >
                      {num}
                    </span>
                    <div>
                      <div
                        className="text-base"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 500,
                          letterSpacing: '-0.012em',
                          color: 'var(--lq-ink)',
                        }}
                      >
                        {label}
                      </div>
                      <div
                        className="text-sm mt-0.5"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontStyle: 'italic',
                          color: 'var(--lq-ink-2)',
                        }}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: desc as string }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </div>

      {/* Full-Screen Wizard - Step 1: Role */}
      {isOpen && step === 'role' && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #07091c 0%, #0e1737 50%, #182046 100%)',
            color: 'var(--lq-cream)',
          }}
        >
          {/* Floating glow shapes */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: '8%', right: '-6%', width: 560, height: 560, borderRadius: '50%',
              background:
                'radial-gradient(circle at 30% 30%, rgba(146, 184, 255, 0.32) 0%, rgba(27, 158, 143, 0.10) 45%, transparent 75%)',
              filter: 'blur(8px)',
              animation: 'wizardOrbFloat 14s ease-in-out infinite alternate',
            }}
          />
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              bottom: '-12%', left: '-10%', width: 460, height: 460, borderRadius: '50%',
              background:
                'radial-gradient(circle at 60% 40%, rgba(27, 158, 143, 0.28) 0%, transparent 70%)',
              filter: 'blur(10px)',
              animation: 'wizardOrbFloat 18s ease-in-out infinite alternate-reverse',
            }}
          />
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: '50%', left: '50%', width: 820, height: 820, borderRadius: '50%',
              border: '1px solid rgba(146, 184, 255, 0.12)',
              transform: 'translate(-50%, -50%)',
              animation: 'wizardRingSpin 90s linear infinite',
            }}
          />

          {/* Top bar — brand + step + close */}
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="brand-mark" aria-hidden />
              <span
                className="text-[12px] tracking-[0.22em] uppercase font-semibold"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--lq-cream)' }}
              >
                LAUNCH
              </span>
              <span className="hidden sm:inline editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                · scenario builder
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                Step 1 of 3
              </span>
              <button
                onClick={handleReset}
                aria-label="Close"
                className="p-2 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(246,242,234,0.8)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Magazine spread */}
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-12 pb-20 grid lg:grid-cols-12 gap-10 items-center min-h-[calc(100vh-72px)]">
            <div className="lg:col-span-7">
              <div
                className="editorial-mono mb-4"
                style={{ color: 'rgba(146, 184, 255, 0.7)' }}
              >
                Begin a scenario
              </div>
              <h1
                className="mb-6 max-w-[18ch]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 300,
                  fontSize: 'clamp(40px, 5.4vw, 72px)',
                  letterSpacing: '-0.028em',
                  lineHeight: 1.04,
                  color: 'var(--lq-cream)',
                }}
              >
                Who are you <em style={{ fontStyle: 'italic', color: '#92b8ff' }}>actually</em> hiring for?
              </h1>
              <p
                className="max-w-[58ch] text-base sm:text-lg"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  color: 'rgba(246, 242, 234, 0.78)',
                  lineHeight: 1.5,
                }}
              >
                Just the role. The way you&rsquo;d say it across a desk.
                We&rsquo;ll build the moment around it.
              </p>

              {/* Role input — magazine-style underlined field */}
              <div className="mt-12 max-w-[44ch]">
                <input
                  type="text"
                  placeholder="Head Coach. Newsroom Editor. Store Lead."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-transparent outline-none transition-colors pb-3 border-b-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: 'clamp(22px, 2.6vw, 34px)',
                    letterSpacing: '-0.018em',
                    color: 'var(--lq-cream)',
                    borderColor: role ? '#92b8ff' : 'rgba(146, 184, 255, 0.25)',
                    caretColor: '#92b8ff',
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && role.trim()) handleRoleSubmit()
                  }}
                  autoFocus
                />

                <div className="flex items-center gap-3 mt-8">
                  <button
                    onClick={handleRoleSubmit}
                    disabled={!role.trim()}
                    className="px-6 py-2.5 rounded-full transition-all duration-300 inline-flex items-center gap-2 group disabled:opacity-40 disabled:pointer-events-none"
                    style={{
                      background: '#92b8ff',
                      color: 'var(--lq-ink)',
                      border: '1px solid #b9d2ff',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: 14,
                      boxShadow: '0 6px 20px rgba(146, 184, 255, 0.35)',
                    }}
                  >
                    Continue
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-[3px]">→</span>
                  </button>
                  <span className="editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.55)' }}>
                    ↵ to commit
                  </span>
                </div>
              </div>
            </div>

            {/* Right column — atmospheric prompts */}
            <aside className="lg:col-span-5 hidden lg:block">
              <div className="editorial-mono mb-4" style={{ color: 'rgba(146, 184, 255, 0.55)' }}>
                What we&rsquo;re asking for
              </div>
              <ul className="space-y-3 max-w-[34ch]">
                {[
                  ['One line.', 'A title, not a job spec.'],
                  ['As you&rsquo;d say it.', 'No internal jargon necessary.'],
                  ['One person.', 'You can do another after.'],
                ].map(([k, v], i) => (
                  <li
                    key={i}
                    className="border-l-2 pl-4 py-1"
                    style={{ borderColor: 'rgba(146, 184, 255, 0.25)' }}
                  >
                    <div
                      className="text-base"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        letterSpacing: '-0.012em',
                        color: 'var(--lq-cream)',
                      }}
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: k as string }}
                    />
                    <div
                      className="text-sm mt-1"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        color: 'rgba(246, 242, 234, 0.65)',
                      }}
                    >
                      {v}
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <style>{`
            @keyframes wizardOrbFloat {
              from { transform: translate3d(0, 0, 0) scale(1); }
              to   { transform: translate3d(-12px, -18px, 0) scale(1.06); }
            }
            @keyframes wizardRingSpin { to { transform: translate(-50%, -50%) rotate(360deg); } }
          `}</style>
        </div>
      )}

      {/* Full-Screen Wizard - Step 2: Shape the moment */}
      {isOpen && step === 'details' && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #07091c 0%, #0e1737 50%, #182046 100%)',
            color: 'var(--lq-cream)',
          }}
        >
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: '4%', right: '-8%', width: 520, height: 520, borderRadius: '50%',
              background:
                'radial-gradient(circle at 30% 30%, rgba(146, 184, 255, 0.28) 0%, rgba(27, 158, 143, 0.08) 45%, transparent 75%)',
              filter: 'blur(8px)',
              animation: 'wizardOrbFloat 14s ease-in-out infinite alternate',
            }}
          />

          {/* Top bar */}
          <div className="sticky top-0 z-10" style={{ background: 'rgba(7, 9, 28, 0.86)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(146, 184, 255, 0.12)' }}>
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="brand-mark" aria-hidden />
                <span
                  className="text-[12px] tracking-[0.22em] uppercase font-semibold"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--lq-cream)' }}
                >
                  LAUNCH
                </span>
                <span className="hidden sm:inline editorial-mono truncate" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                  · {role}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                  Step 2 of 3
                </span>
                <button
                  onClick={handleReset}
                  aria-label="Close"
                  className="p-2 rounded-full transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(246,242,234,0.8)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
            <div className="editorial-mono mb-4" style={{ color: 'rgba(146, 184, 255, 0.7)' }}>
              Step 2 · the brief
            </div>
            <h1
              className="mb-5 max-w-[18ch]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(36px, 4.4vw, 56px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                color: 'var(--lq-cream)',
              }}
            >
              What does the work <em style={{ fontStyle: 'italic', color: '#92b8ff' }}>actually</em> turn on?
            </h1>
            <p
              className="max-w-[60ch] text-base sm:text-lg mb-12"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                color: 'rgba(246, 242, 234, 0.72)',
                lineHeight: 1.5,
              }}
            >
              Tell us the moments this person will keep getting tested in. The
              decisions where the room is watching.
            </p>

            {/* Career-stage register toggle — picks which interface students see */}
            <div className="mb-10">
              <label className="editorial-mono block mb-3" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                Who is this for?
              </label>
              <div
                role="radiogroup"
                aria-label="Career stage"
                className="inline-flex p-1 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(146, 184, 255, 0.18)',
                }}
              >
                {(['early', 'advanced'] as const).map((opt) => {
                  const active = level === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setLevel(opt)}
                      className="px-4 py-2 rounded-md transition-all"
                      style={{
                        background: active ? 'var(--launch-teal)' : 'transparent',
                        color: active ? 'var(--lq-ink)' : 'rgba(246, 242, 234, 0.78)',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600,
                        fontSize: 13,
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {opt === 'early' ? 'Early career' : 'Advanced career'}
                    </button>
                  )
                })}
              </div>
              <p
                className="mt-2 text-sm max-w-[58ch]"
                style={{ color: 'rgba(246, 242, 234, 0.55)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}
              >
                {level === 'early'
                  ? 'Story-led, scenario-rich interface — discovery + exploration. Best for school-age and entry-level cohorts.'
                  : 'Clean question-and-answer interface — direct, square, calm. Best for senior candidates and corporate hiring loops.'}
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
              {/* Left — description + structure */}
              <div className="lg:col-span-7 space-y-10">
                <div>
                  <label className="editorial-mono block mb-3" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                    The shape of the work
                  </label>
                  <textarea
                    placeholder={`What does a hard day for the ${role || 'role'} actually look like? What calls do they have to make?`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-5 py-4 outline-none transition-colors resize-none"
                    rows={5}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: 18,
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 18,
                      color: 'var(--lq-cream)',
                      lineHeight: 1.5,
                    }}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="editorial-mono block mb-3" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                    How long should it run?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: '3x3', label: '3 decisions', sub: '~5 min · sharp' },
                      { value: '6x3', label: '6 decisions', sub: '~10 min · standard' },
                      { value: '9x3', label: '9 decisions', sub: '~15 min · deep' },
                    ].map((opt) => {
                      const active = structure === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setStructure(opt.value)}
                          className="px-5 py-4 rounded-[14px] text-left transition-all"
                          style={{
                            background: active ? 'rgba(146, 184, 255, 0.16)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${active ? '#92b8ff' : 'rgba(255,255,255,0.10)'}`,
                          }}
                        >
                          <div
                            className="text-base mb-1"
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 500,
                              letterSpacing: '-0.012em',
                              color: 'var(--lq-cream)',
                            }}
                          >
                            {opt.label}
                          </div>
                          <div className="editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                            {opt.sub}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right — capabilities */}
              <div className="lg:col-span-5">
                <label className="editorial-mono block mb-3" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                  What we&rsquo;ll measure
                </label>
                <p className="text-sm mb-5" style={{ color: 'rgba(246, 242, 234, 0.6)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  Pick the capabilities the role lives or dies on. Tag the
                  difficulty — easy is recognition, hard is a real test.
                </p>
                <div
                  className="space-y-2 max-h-[420px] overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {SKILLS.map((skill) => {
                    const sel = selectedSkills.find((s) => s.skill === skill)
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className="w-full px-4 py-3 rounded-[14px] transition-all text-left flex items-center justify-between gap-3"
                        style={{
                          background: sel ? 'rgba(146, 184, 255, 0.14)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${sel ? '#92b8ff' : 'rgba(255,255,255,0.08)'}`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            letterSpacing: '-0.012em',
                            color: 'var(--lq-cream)',
                            fontSize: 15,
                          }}
                        >
                          {skill}
                        </span>
                        {sel && (
                          <select
                            onClick={(e) => e.stopPropagation()}
                            value={sel.difficulty}
                            onChange={(e) => {
                              e.stopPropagation()
                              updateSkillDifficulty(skill, e.target.value)
                            }}
                            className="px-3 py-1 text-xs rounded-full"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.14)',
                              color: 'var(--lq-cream)',
                              fontFamily: 'var(--font-mono)',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                            }}
                          >
                            <option value="easy" style={{ color: '#000' }}>Easy</option>
                            <option value="medium" style={{ color: '#000' }}>Medium</option>
                            <option value="hard" style={{ color: '#000' }}>Hard</option>
                          </select>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-3 pt-10 mt-12 border-t" style={{ borderColor: 'rgba(146, 184, 255, 0.12)' }}>
              <button
                onClick={() => setStep('role')}
                className="px-5 py-2.5 rounded-full transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'rgba(246,242,234,0.85)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleGoToEditor}
                disabled={!description.trim() || selectedSkills.length === 0}
                className="px-6 py-2.5 rounded-full transition-all duration-300 inline-flex items-center gap-2 group disabled:opacity-40 disabled:pointer-events-none"
                style={{
                  background: '#92b8ff',
                  color: 'var(--lq-ink)',
                  border: '1px solid #b9d2ff',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: '0 6px 20px rgba(146, 184, 255, 0.32)',
                }}
              >
                Shape the moments
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-[3px]">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Wizard - Step 3: Hand it off */}
      {isOpen && step === 'complete' && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #07091c 0%, #0e1737 50%, #182046 100%)',
            color: 'var(--lq-cream)',
          }}
        >
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: '12%', left: '50%', width: 720, height: 720, borderRadius: '50%',
              background:
                'radial-gradient(circle at 50% 50%, rgba(27, 158, 143, 0.32) 0%, rgba(146, 184, 255, 0.10) 45%, transparent 75%)',
              filter: 'blur(10px)',
              transform: 'translateX(-50%)',
              animation: 'wizardOrbFloat 16s ease-in-out infinite alternate',
            }}
          />

          {/* Top bar */}
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="brand-mark" aria-hidden />
              <span
                className="text-[12px] tracking-[0.22em] uppercase font-semibold"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--lq-cream)' }}
              >
                LAUNCH
              </span>
              <span className="hidden sm:inline editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                · scenario ready
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="editorial-mono" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                Step 3 of 3
              </span>
              <button
                onClick={handleReset}
                aria-label="Close"
                className="p-2 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(246,242,234,0.8)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative max-w-4xl mx-auto px-6 sm:px-10 pt-12 pb-20">
            <div className="editorial-mono mb-4" style={{ color: 'rgba(146, 184, 255, 0.7)' }}>
              The handoff
            </div>
            <h1
              className="mb-5 max-w-[18ch]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 'clamp(36px, 4.4vw, 56px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.05,
                color: 'var(--lq-cream)',
              }}
            >
              The room is <em style={{ fontStyle: 'italic', color: '#92b8ff' }}>ready</em>.
            </h1>
            <p
              className="max-w-[58ch] text-base sm:text-lg mb-12"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                color: 'rgba(246, 242, 234, 0.72)',
                lineHeight: 1.5,
              }}
            >
              Your scenario is live. Share the code below with the people you
              want to walk into it.
            </p>

            {/* Access code card */}
            <div
              className="rounded-[22px] p-8 sm:p-10 mb-6 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(146, 184, 255, 0.16) 0%, rgba(146, 184, 255, 0.06) 100%)',
                border: '1px solid rgba(146, 184, 255, 0.32)',
              }}
            >
              <div className="editorial-mono mb-3" style={{ color: '#92b8ff' }}>
                Access code
              </div>
              <p
                className="break-all mb-6"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  letterSpacing: '0.04em',
                  color: 'var(--lq-cream)',
                  lineHeight: 1.1,
                }}
              >
                {accessCode}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleCopyCode}
                  className="px-5 py-2.5 rounded-full transition-all duration-300 inline-flex items-center gap-2"
                  style={{
                    background: copied ? 'rgba(146, 255, 177, 0.18)' : '#92b8ff',
                    color: copied ? '#92ffb1' : 'var(--lq-ink)',
                    border: copied ? '1px solid rgba(146, 255, 177, 0.4)' : '1px solid #b9d2ff',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy code'}
                </button>
                <span className="editorial-mono" style={{ color: 'rgba(246, 242, 234, 0.55)' }}>
                  Share with your shortlist
                </span>
              </div>
            </div>

            {/* Summary card */}
            <div
              className="rounded-[22px] p-7 sm:p-8 mb-10"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="editorial-mono mb-2" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>Role</div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      fontSize: 20,
                      letterSpacing: '-0.012em',
                      color: 'var(--lq-cream)',
                    }}
                  >
                    {role}
                  </p>
                </div>
                <div>
                  <div className="editorial-mono mb-2" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>Length</div>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      fontSize: 20,
                      letterSpacing: '-0.012em',
                      color: 'var(--lq-cream)',
                    }}
                  >
                    {structure === '3x3' && '3 decisions'}
                    {structure === '6x3' && '6 decisions'}
                    {structure === '9x3' && '9 decisions'}
                  </p>
                </div>
                <div className="sm:col-span-2 pt-4 border-t" style={{ borderColor: 'rgba(146, 184, 255, 0.14)' }}>
                  <div className="editorial-mono mb-3" style={{ color: 'rgba(146, 184, 255, 0.6)' }}>
                    Capabilities measured
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((s) => (
                      <span
                        key={s.skill}
                        className="editorial-chip"
                        style={{
                          background: 'rgba(146, 184, 255, 0.14)',
                          color: 'var(--lq-cream)',
                        }}
                      >
                        {s.skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full transition-all duration-300 inline-flex items-center gap-2 group"
                style={{
                  background: '#92b8ff',
                  color: 'var(--lq-ink)',
                  border: '1px solid #b9d2ff',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: '0 6px 20px rgba(146, 184, 255, 0.32)',
                }}
              >
                Build another
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-[3px]">→</span>
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-full transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'rgba(246,242,234,0.85)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Back to studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Editor */}
      {isOpen && step === 'editor' && (
        <div className="fixed inset-0 bg-[var(--lq-cream)] z-40 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[var(--lq-cream)]/92 backdrop-blur-md border-b border-[var(--lq-line)] z-10">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="brand-mark" aria-hidden />
                  <span className="editorial-mono" style={{ color: 'var(--launch-navy)' }}>
                    The studio · {structure === '3x3' ? '3 decisions' : structure === '6x3' ? '6 decisions' : '9 decisions'}
                  </span>
                </div>
                <h1
                  className="truncate"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: 'clamp(20px, 2vw, 28px)',
                    letterSpacing: '-0.018em',
                    color: 'var(--lq-ink)',
                  }}
                >
                  {role}
                </h1>
                <p
                  className="text-sm truncate mt-0.5"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    color: 'var(--lq-ink-2)',
                  }}
                >
                  {description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateCode}
                  className="px-5 py-2.5 rounded-full transition-all duration-300 inline-flex items-center gap-2 group"
                  style={{
                    background: 'var(--launch-navy)',
                    color: 'var(--lq-cream)',
                    border: '1px solid var(--launch-navy)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 14,
                    boxShadow: '0 4px 14px rgba(10, 42, 107, 0.22)',
                  }}
                >
                  Hand it off
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-[3px]">→</span>
                </button>
                <button
                  onClick={() => setStep('initial')}
                  aria-label="Close"
                  className="p-2 rounded-full transition-colors"
                  style={{
                    background: 'rgba(14, 24, 51, 0.04)',
                    border: '1px solid var(--lq-line)',
                    color: 'var(--lq-ink-2)',
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Important Note — editorial card */}
          <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-8">
            <div
              className="rounded-[18px] p-5 sm:p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(27, 158, 143, 0.10) 0%, rgba(146, 184, 255, 0.06) 100%)',
                border: '1px solid rgba(27, 158, 143, 0.32)',
              }}
            >
              <div className="flex gap-4 items-start">
                <span className="brand-mark mt-1.5" aria-hidden />
                <div>
                  <div className="editorial-mono mb-2">How this plays</div>
                  <p
                    className="text-sm leading-relaxed max-w-[78ch]"
                    style={{ color: 'var(--lq-ink-2)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
                  >
                    Every applicant sees the same {scenarios.length}
                    {scenarios.length === 1 ? ' moment' : ' moments'} below — but
                    nobody walks through the same scenario. After each pick they
                    have to name <em>why</em> they chose it, and the next moment
                    reshapes around the path they&rsquo;ve carved. We&rsquo;re
                    measuring how they decide, not what they remember.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scenarios — magazine-style decision cards */}
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 space-y-10">
            {scenarios.map((scenario, idx) => (
              <article
                key={scenario.id}
                className="editorial-card overflow-hidden transition-all duration-300 hover:border-[var(--lq-ink-2)]"
              >
                {/* Question Header — eyebrow row + serif prompt */}
                <div className="p-7 sm:p-8 pb-6 border-b border-[var(--lq-line)]">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="editorial-mono" style={{ color: 'var(--launch-navy)' }}>
                        Decision {String(idx + 1).padStart(2, '0')} of {String(scenarios.length).padStart(2, '0')}
                      </span>
                      <span className="editorial-chip editorial-chip-lime">{scenario.skill}</span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(scenario.id)}
                      className="p-2 rounded-full transition-colors group"
                      style={{ background: 'rgba(14, 24, 51, 0.04)', color: 'var(--lq-ink-3)' }}
                      title="Remove this decision"
                    >
                      <Trash2 className="w-4 h-4 group-hover:text-[#dc143c] transition-colors" />
                    </button>
                  </div>

                  {editingQuestion === scenario.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-3 outline-none transition-colors resize-none rounded-[14px]"
                        rows={3}
                        style={{
                          background: 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid var(--lq-line-2)',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 500,
                          fontSize: 22,
                          letterSpacing: '-0.018em',
                          color: 'var(--lq-ink)',
                          lineHeight: 1.25,
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditQuestion(scenario.id)}
                          className="editorial-pill editorial-pill-primary text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingQuestion(null)}
                          className="editorial-pill editorial-pill-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditQuestion(scenario.id, scenario.question)}
                      className="text-left w-full group"
                    >
                      <h3 className="editorial-prompt mb-2">
                        {getAdaptedQuestion(scenario, chosenPath)}
                      </h3>
                      <div
                        className="editorial-mono inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--launch-navy)' }}
                      >
                        <Edit2 className="w-3 h-3" />
                        Tap to edit
                      </div>
                    </button>
                  )}
                </div>

                {/* Options — editorial cards in a 3-column grid that collapses to 1 when expanded */}
                <div className="p-7 sm:p-8 bg-[var(--lq-cream-2)]">
                  <div
                    className={`grid gap-3 transition-all ${
                      expandedQuestion && expandedQuestion.startsWith(scenario.id) ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
                    }`}
                  >
                    {scenario.options.map((option) => {
                      const isExpanded = expandedQuestion === `${scenario.id}-${option.id}`
                      const isOtherExpanded =
                        expandedQuestion && expandedQuestion.startsWith(scenario.id) && !isExpanded
                      if (isOtherExpanded) return null

                      return (
                        <div
                          key={option.id}
                          className="overflow-hidden transition-all duration-300"
                          style={{
                            background: isExpanded ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.55)',
                            border: `1px solid ${isExpanded ? 'var(--launch-navy)' : 'var(--lq-line-2)'}`,
                            borderRadius: 18,
                          }}
                        >
                          {/* Option button — bold serif label, no letter chip */}
                          <button
                            onClick={() => {
                              trackAnswerChoice(scenario.id, option.id)
                              setExpandedQuestion(
                                expandedQuestion === `${scenario.id}-${option.id}`
                                  ? null
                                  : `${scenario.id}-${option.id}`
                              )
                            }}
                            className="w-full text-left p-5 sm:p-6 transition-colors"
                          >
                            <div
                              className="editorial-mono mb-3"
                              style={{ color: isExpanded ? 'var(--launch-navy)' : 'var(--lq-ink-3)' }}
                            >
                              Option {option.id.toUpperCase()}
                            </div>
                            <p
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 500,
                                fontSize: 18,
                                letterSpacing: '-0.012em',
                                color: 'var(--lq-ink)',
                                lineHeight: 1.3,
                              }}
                            >
                              {option.text}
                            </p>
                            {!isExpanded && (
                              <span
                                className="editorial-mono inline-flex items-center gap-1 mt-4"
                                style={{ color: 'var(--launch-navy)' }}
                              >
                                Shape consequence →
                              </span>
                            )}
                          </button>

                          {/* Expanded — consequence textarea + follow-up questions */}
                          {isExpanded && (
                            <div
                              className="p-5 sm:p-7 space-y-7 border-t"
                              style={{ borderColor: 'var(--lq-line)' }}
                            >
                              {/* Consequence */}
                              <div>
                                <label className="editorial-mono block mb-3">
                                  What happens next
                                </label>
                                <textarea
                                  value={option.consequence}
                                  onChange={(e) => updateOptionConsequence(scenario.id, option.id, e.target.value)}
                                  className="w-full px-4 py-3 outline-none transition-colors resize-none rounded-[14px]"
                                  rows={2}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    border: '1px solid var(--lq-line-2)',
                                    fontFamily: 'var(--font-display)',
                                    fontStyle: 'italic',
                                    fontSize: 16,
                                    color: 'var(--lq-ink)',
                                    lineHeight: 1.5,
                                  }}
                                />
                                <p
                                  className="text-xs mt-2"
                                  style={{
                                    color: 'var(--lq-ink-3)',
                                    fontFamily: 'var(--font-display)',
                                    fontStyle: 'italic',
                                  }}
                                >
                                  This is the moment they walk into right after picking this option.
                                </p>
                              </div>

                              {/* Follow-up Question */}
                              <div className="pt-2">
                                <div className="editorial-mono mb-3">
                                  Then we ask
                                </div>
                                <p
                                  className="mb-5"
                                  style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 500,
                                    fontSize: 20,
                                    letterSpacing: '-0.012em',
                                    color: 'var(--lq-ink)',
                                    lineHeight: 1.25,
                                  }}
                                >
                                  {option.followUpQuestion}
                                </p>

                                {/* Follow-ups — three reasoning paths with editorial leaning palette */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {option.followUps.map((followUp) => {
                                    const leaning = followUp.leaning
                                    const isOpen =
                                      expandedFollowUp === `${scenario.id}-${option.id}-${followUp.id}`
                                    const palette =
                                      leaning === 'support'
                                        ? {
                                            bg: 'rgba(27, 158, 143, 0.10)',
                                            bgOpen: 'rgba(27, 158, 143, 0.18)',
                                            border: 'rgba(27, 158, 143, 0.45)',
                                            label: 'Supports the call',
                                            mark: 'var(--launch-lime-3)',
                                          }
                                        : leaning === 'neutral'
                                        ? {
                                            bg: 'rgba(10, 42, 107, 0.06)',
                                            bgOpen: 'rgba(10, 42, 107, 0.12)',
                                            border: 'rgba(10, 42, 107, 0.32)',
                                            label: 'Pragmatic read',
                                            mark: 'var(--launch-navy)',
                                          }
                                        : {
                                            bg: 'rgba(220, 90, 50, 0.08)',
                                            bgOpen: 'rgba(220, 90, 50, 0.14)',
                                            border: 'rgba(220, 90, 50, 0.36)',
                                            label: 'Questions the call',
                                            mark: '#c8553d',
                                          }
                                    return (
                                      <button
                                        key={followUp.id}
                                        onClick={() => {
                                          handleFollowUpClick(scenario.id, option.id, followUp.id, leaning)
                                          setExpandedFollowUp(
                                            isOpen
                                              ? null
                                              : `${scenario.id}-${option.id}-${followUp.id}`
                                          )
                                        }}
                                        className="text-left transition-all duration-300 group"
                                        style={{
                                          background: isOpen ? palette.bgOpen : palette.bg,
                                          border: `1px solid ${palette.border}`,
                                          borderRadius: 14,
                                          padding: 16,
                                        }}
                                      >
                                        <div className="flex items-center gap-2 mb-2">
                                          <span
                                            style={{
                                              width: 6,
                                              height: 6,
                                              borderRadius: '50%',
                                              background: palette.mark,
                                              display: 'inline-block',
                                            }}
                                            aria-hidden
                                          />
                                          <span
                                            className="editorial-mono"
                                            style={{ color: palette.mark }}
                                          >
                                            {palette.label}
                                          </span>
                                        </div>
                                        <p
                                          style={{
                                            fontFamily: 'var(--font-display)',
                                            fontWeight: 500,
                                            fontSize: 15,
                                            letterSpacing: '-0.01em',
                                            color: 'var(--lq-ink)',
                                            lineHeight: 1.35,
                                          }}
                                        >
                                          {followUp.text}
                                        </p>
                                        {isOpen && (
                                          <p
                                            className="mt-3 pt-3"
                                            style={{
                                              borderTop: `1px solid ${palette.border}`,
                                              fontFamily: 'var(--font-display)',
                                              fontStyle: 'italic',
                                              fontSize: 13,
                                              color: 'var(--lq-ink-2)',
                                              lineHeight: 1.5,
                                            }}
                                          >
                                            {followUp.reasoning}
                                          </p>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </article>
            ))}

            {/* Summary — editorial card with mono labels + Newsreader counts */}
            <div
              className="rounded-[22px] p-7 sm:p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 42, 107, 0.06) 0%, rgba(146, 184, 255, 0.06) 100%)',
                border: '1px solid rgba(10, 42, 107, 0.22)',
              }}
            >
              <div className="editorial-mono mb-5" style={{ color: 'var(--launch-navy)' }}>
                The shape of the scenario
              </div>
              <div className="grid grid-cols-3 gap-6 mb-5">
                {[
                  { label: 'Decisions', value: scenarios.length },
                  { label: 'Options each', value: 3 },
                  { label: 'Possible paths', value: scenarios.length * 3 * 3 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="editorial-mono mb-2">{s.label}</div>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        fontSize: 'clamp(28px, 3vw, 40px)',
                        letterSpacing: '-0.022em',
                        color: 'var(--launch-navy)',
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
              <p
                className="text-sm leading-relaxed max-w-[68ch]"
                style={{ color: 'var(--lq-ink-2)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
              >
                Each applicant&rsquo;s answers reshape what comes next. They
                won&rsquo;t see consequences upfront — only the moment they
                walked into.
              </p>
            </div>

            <div className="h-20" />
          </div>
        </div>
      )}
    </>
  )
}
