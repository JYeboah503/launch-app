// Mock data for the dashboard
import { StudentProfile } from '@/components/student-profile-view'
import { Student } from '@/components/student-list'
import type { Challenge } from '@/components/challenges-view'

// Helper function to generate realistic student data
function generateStudents(count: number): Student[] {
  const firstNames = ['Sarah', 'James', 'Maya', 'Alex', 'Emma', 'David', 'Sophie', 'Michael', 'Jessica', 'Daniel', 'Olivia', 'Christopher', 'Isabella', 'Matthew', 'Ava', 'Andrew', 'Mia', 'Joshua', 'Emily', 'Ryan', 'Charlotte', 'Jacob', 'Amelia', 'William', 'Harper', 'Benjamin', 'Evelyn', 'Lucas', 'Abigail', 'Henry', 'Elizabeth', 'Alexander', 'Ella', 'Mason', 'Scarlett', 'Michael', 'Victoria', 'Ethan', 'Grace', 'Daniel', 'Chloe', 'Jacob', 'Camila', 'Logan', 'Penelope', 'Jackson', 'Riley', 'Aiden', 'Layla', 'Samuel', 'Lily']
  const lastNames = ['Chen', 'Riley', 'Patel', 'Kim', 'Rodriguez', 'Thompson', 'Garcia', 'Martinez', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Allen', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Nelson', 'Baker', 'Carter', 'Roberts', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Osborne', 'Sanchez', 'Morris', 'Mendez', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz']
  const interests = [
    ['Product', 'Technology'],
    ['Finance', 'Operations'],
    ['Marketing', 'Design'],
    ['Technology', 'Product'],
    ['Sales', 'Operations'],
    ['Finance', 'Operations'],
    ['Strategy', 'Business'],
    ['Operations', 'Analytics'],
    ['Human Resources', 'Leadership'],
    ['Supply Chain', 'Operations'],
    ['Brand', 'Marketing'],
    ['Data Science', 'Analytics'],
    ['Product', 'Strategy'],
    ['Customer Success', 'Operations'],
    ['Engineering', 'Technology'],
    ['Design', 'Product'],
    ['Sales', 'Strategy'],
    ['Finance', 'Strategy'],
    ['Quality', 'Operations'],
    ['Compliance', 'Risk']
  ]
  const degrees = [
    'Commerce/Engineering',
    'Finance',
    'Design',
    'Computer Science',
    'Business Administration',
    'Law/Commerce',
    'Information Technology',
    'Economics',
    'Marketing',
    'Data Science',
    'Industrial Engineering',
    'Project Management',
    'Accounting',
    'Business Analytics'
  ]
  const capabilities = [
    'Problem Solving',
    'Reasoning & Critical Thinking',
    'Leadership & Influence',
    'Execution & Ownership',
    'Integrity & Ethics',
    'Collaboration',
    'Emotional Intelligence',
    'Adaptability & Cognitive Flexibility',
    'Judgement & Decision-Making',
    'Situational Awareness & Systems Thinking'
  ]

  // Extended profile dimensions for the role-detail filter pipeline
  const universities = [
    'University of Sydney', 'UNSW Sydney', 'University of Melbourne', 'Monash University',
    'University of Queensland', 'ANU', 'UTS', 'Macquarie University', 'RMIT',
    'University of Adelaide', 'University of Western Australia', 'Bond University',
  ]
  const locations = [
    'Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA',
    'Adelaide, SA', 'Canberra, ACT', 'Hobart, TAS', 'Newcastle, NSW',
    'Wollongong, NSW', 'Gold Coast, QLD',
  ]
  const industriesPool = [
    'Property / Real Estate', 'Finance / Banking', 'Consulting / Strategy',
    'Technology', 'Engineering', 'Marketing', 'Operations', 'Sales',
    'Design', 'Government / Public Sector', 'Legal',
  ]
  const workRightsDist: Array<Student['workRights']> = [
    'citizen-permanent', 'citizen-permanent', 'citizen-permanent', 'citizen-permanent',  // 67%
    'visa-unrestricted', 'visa-restricted',                                                // 33%
  ]
  const salaryDist: Array<Student['expectedSalary']> = [
    '60-75', '60-75', '75-90', '75-90', '75-90', '90-110', '90-110',
    '110-130', 'flexible',
  ]
  const relocateDist: Array<Student['willingRelocate']> = [
    'yes-anywhere', 'yes-in-country', 'yes-in-country', 'yes-in-state',
    'yes-in-state', 'yes-in-state', 'no', 'no',
  ]

  const students: Student[] = []

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const studentInterests = interests[Math.floor(Math.random() * interests.length)]
    const degree = degrees[Math.floor(Math.random() * degrees.length)]
    const atar = 88 + Math.random() * 11.9  // broader 88–99.95 range

    // Select 3 random capabilities with scores
    const selectedCapabilities = []
    const shuffledCapabilities = [...capabilities].sort(() => Math.random() - 0.5)
    for (let j = 0; j < 3; j++) {
      selectedCapabilities.push({
        name: shuffledCapabilities[j],
        level: 75 + Math.floor(Math.random() * 20)
      })
    }

    // Profile extras — realistic distributions
    const indPick = [...industriesPool].sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 3))
    const strengthsPick = [...capabilities].sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 3))
    const gradYear = 2024 + Math.floor(Math.random() * 4)  // 2024..2027
    const availDays = Math.floor(Math.random() * 120)  // 0..120 days out
    const availDate = new Date(Date.now() + availDays * 86400000).toISOString().slice(0, 10)
    const prequalPassed = Math.random() < 0.72  // ~72% pass benchmarks by default
    const completionTimeMs = (4 + Math.random() * 22) * 60 * 1000  // 4–26 min

    students.push({
      id: String(i),
      name: `${firstName} ${lastName}`,
      interests: studentInterests,
      topCapabilities: selectedCapabilities,
      overallScore: 70 + Math.floor(Math.random() * 28),
      degree,
      atar: Math.round(atar * 10) / 10,
      university: universities[Math.floor(Math.random() * universities.length)],
      graduationYear: gradYear,
      location: locations[Math.floor(Math.random() * locations.length)],
      workRights: workRightsDist[Math.floor(Math.random() * workRightsDist.length)],
      industries: indPick,
      selfRatedStrengths: strengthsPick,
      availableFrom: availDate,
      expectedSalary: salaryDist[Math.floor(Math.random() * salaryDist.length)],
      willingRelocate: relocateDist[Math.floor(Math.random() * relocateDist.length)],
      prequalStatus: prequalPassed ? 'passed' : 'flagged',
      completionTimeMs: Math.round(completionTimeMs),
    })
  }

  return students
}

const MOCK_STUDENTS: Student[] = generateStudents(1200)

const STUDENT_PROFILES: Record<string, StudentProfile> = {
  '1': {
    id: '1',
    name: 'Sarah Chen',
    interests: ['Product', 'Technology', 'Strategy'],
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 82, insight: 'Strong judgment in ambiguous situations' },
      { name: 'Reasoning & Critical Thinking', level: 88 },
      { name: 'Problem Solving', level: 92, insight: 'Exceptional at breaking down complex problems' },
      { name: 'Leadership & Influence', level: 85 },
      { name: 'Adaptability & Cognitive Flexibility', level: 81 },
      { name: 'Emotional Intelligence', level: 79 },
      { name: 'Execution & Ownership', level: 84 },
      { name: 'Integrity & Ethics', level: 86 },
      { name: 'Collaboration', level: 80 },
      { name: 'Situational Awareness & Systems Thinking', level: 83 },
    ],
    bio: 'Sarah demonstrates exceptional analytical capabilities with a track record of solving novel, complex problems. She excels in product-focused roles where strategic thinking is valued.',
    degree: 'Commerce/Engineering',
    atar: 99.5,
    school: 'University of Melbourne',
  },
  '2': {
    id: '2',
    name: 'James Riley',
    interests: ['Finance', 'Operations', 'Strategy'],
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 90 },
      { name: 'Reasoning & Critical Thinking', level: 86 },
      { name: 'Problem Solving', level: 88 },
      { name: 'Leadership & Influence', level: 82 },
      { name: 'Adaptability & Cognitive Flexibility', level: 79 },
      { name: 'Emotional Intelligence', level: 83 },
      { name: 'Execution & Ownership', level: 95, insight: 'Delivers consistently on commitments' },
      { name: 'Integrity & Ethics', level: 92 },
      { name: 'Collaboration', level: 87 },
      { name: 'Situational Awareness & Systems Thinking', level: 85 },
    ],
    bio: 'James is a high-execution individual with strong ethical grounding. Ideal for operational roles requiring accountability and precision.',
    degree: 'Finance',
    atar: 99.2,
    school: 'University of Sydney',
  },
  '3': {
    id: '3',
    name: 'Maya Patel',
    interests: ['Marketing', 'Design', 'Product'],
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 84 },
      { name: 'Reasoning & Critical Thinking', level: 81 },
      { name: 'Problem Solving', level: 85 },
      { name: 'Leadership & Influence', level: 87 },
      { name: 'Adaptability & Cognitive Flexibility', level: 86 },
      { name: 'Emotional Intelligence', level: 89, insight: 'Exceptional ability to read and influence people' },
      { name: 'Execution & Ownership', level: 82 },
      { name: 'Integrity & Ethics', level: 88 },
      { name: 'Collaboration', level: 91 },
      { name: 'Situational Awareness & Systems Thinking', level: 80 },
    ],
    bio: 'Maya excels in cross-functional, people-focused environments. Strong emotional intelligence and collaboration make her ideal for team leadership.',
    degree: 'Design',
    atar: 98.8,
    school: 'RMIT University',
  },
  '4': {
    id: '4',
    name: 'Alex Kim',
    interests: ['Technology', 'Product', 'Innovation'],
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 88 },
      { name: 'Reasoning & Critical Thinking', level: 94, insight: 'Top-tier analytical capability' },
      { name: 'Problem Solving', level: 91 },
      { name: 'Leadership & Influence', level: 83 },
      { name: 'Adaptability & Cognitive Flexibility', level: 89 },
      { name: 'Emotional Intelligence', level: 76 },
      { name: 'Execution & Ownership', level: 85 },
      { name: 'Integrity & Ethics', level: 89 },
      { name: 'Collaboration', level: 81 },
      { name: 'Situational Awareness & Systems Thinking', level: 88 },
    ],
    bio: 'Alex is a technical problem-solver with strong analytical and systems-thinking capabilities. Perfect for roles requiring deep technical reasoning.',
    degree: 'Computer Science',
    atar: 99.7,
    school: 'University of New South Wales',
  },
  '5': {
    id: '5',
    name: 'Emma Rodriguez',
    interests: ['Sales', 'Operations', 'Leadership'],
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 87 },
      { name: 'Reasoning & Critical Thinking', level: 84 },
      { name: 'Problem Solving', level: 83 },
      { name: 'Leadership & Influence', level: 93, insight: 'Natural leader with strong influence' },
      { name: 'Adaptability & Cognitive Flexibility', level: 88 },
      { name: 'Emotional Intelligence', level: 90 },
      { name: 'Execution & Ownership', level: 89 },
      { name: 'Integrity & Ethics', level: 91 },
      { name: 'Collaboration', level: 85 },
      { name: 'Situational Awareness & Systems Thinking', level: 82 },
    ],
    bio: 'Emma is a natural leader with exceptional interpersonal capabilities. Strong in both influence and execution, ideal for senior operational roles.',
    degree: 'Business Administration',
    atar: 99.0,
    school: 'Monash University',
  },
  '6': {
    id: '6',
    name: 'David Thompson',
    interests: ['Finance', 'Strategy', 'Operations'],
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 91 },
      { name: 'Reasoning & Critical Thinking', level: 89 },
      { name: 'Problem Solving', level: 87 },
      { name: 'Leadership & Influence', level: 86 },
      { name: 'Adaptability & Cognitive Flexibility', level: 84 },
      { name: 'Emotional Intelligence', level: 85 },
      { name: 'Execution & Ownership', level: 91 },
      { name: 'Integrity & Ethics', level: 96, insight: 'Exceptional ethical grounding' },
      { name: 'Collaboration', level: 88 },
      { name: 'Situational Awareness & Systems Thinking', level: 87 },
    ],
    bio: 'David combines strong integrity with comprehensive business acumen. Excellent for leadership roles requiring both technical rigor and ethical leadership.',
    degree: 'Law/Commerce',
    atar: 99.8,
    school: 'University of Queensland',
  },
}

const CHALLENGES: Record<string, Challenge[]> = {
  '1': [
    {
      id: 'c1',
      title: 'Strategic Market Analysis',
      capability: 'Problem Solving',
      interest: 'Product',
      difficulty: 'Hard',
      description: 'Analyze a complex market scenario with competing priorities and ambiguous data to recommend a strategic direction.',
    },
    {
      id: 'c2',
      title: 'Technical Architecture Decision',
      capability: 'Reasoning & Critical Thinking',
      interest: 'Technology',
      difficulty: 'Hard',
      description: 'Evaluate multiple technical approaches to solve a scalability challenge and justify your recommendation.',
    },
    {
      id: 'c3',
      title: 'Stakeholder Alignment',
      capability: 'Leadership & Influence',
      interest: 'Product',
      difficulty: 'Medium',
      description: 'Navigate conflicting stakeholder interests to reach consensus on a key product direction.',
    },
  ],
  '2': [
    {
      id: 'c4',
      title: 'Operational Efficiency Audit',
      capability: 'Execution & Ownership',
      interest: 'Operations',
      difficulty: 'Medium',
      description: 'Identify process inefficiencies in a business operation and develop an implementation plan.',
    },
    {
      id: 'c5',
      title: 'Financial Risk Assessment',
      capability: 'Judgement & Decision-Making',
      interest: 'Finance',
      difficulty: 'Hard',
      description: 'Assess financial risks in a complex transaction and recommend mitigation strategies.',
    },
  ],
  '3': [
    {
      id: 'c6',
      title: 'Campaign Launch Coordination',
      capability: 'Collaboration',
      interest: 'Marketing',
      difficulty: 'Medium',
      description: 'Coordinate a cross-functional marketing campaign with multiple dependencies and stakeholders.',
    },
    {
      id: 'c7',
      title: 'Customer Empathy Research',
      capability: 'Emotional Intelligence',
      interest: 'Design',
      difficulty: 'Easy',
      description: 'Conduct research to understand customer pain points and develop user-centric solutions.',
    },
  ],
  '4': [
    {
      id: 'c8',
      title: 'System Design Challenge',
      capability: 'Reasoning & Critical Thinking',
      interest: 'Technology',
      difficulty: 'Hard',
      description: 'Design a complex system architecture that balances performance, scalability, and maintainability.',
    },
    {
      id: 'c9',
      title: 'Product Roadmap Planning',
      capability: 'Situational Awareness & Systems Thinking',
      interest: 'Product',
      difficulty: 'Hard',
      description: 'Develop a strategic product roadmap considering market trends, technical constraints, and business goals.',
    },
  ],
  '5': [
    {
      id: 'c10',
      title: 'Team Leadership Scenario',
      capability: 'Leadership & Influence',
      interest: 'Leadership',
      difficulty: 'Medium',
      description: 'Lead a team through a crisis scenario requiring quick decision-making and team alignment.',
    },
    {
      id: 'c11',
      title: 'Sales Strategy Development',
      capability: 'Collaboration',
      interest: 'Sales',
      difficulty: 'Medium',
      description: 'Develop a go-to-market strategy collaborating with multiple departments.',
    },
  ],
  '6': [
    {
      id: 'c12',
      title: 'Enterprise Deal Negotiation',
      capability: 'Judgement & Decision-Making',
      interest: 'Finance',
      difficulty: 'Hard',
      description: 'Negotiate a complex enterprise deal balancing risk, opportunity, and company interests.',
    },
    {
      id: 'c13',
      title: 'Ethical Leadership Dilemma',
      capability: 'Integrity & Ethics',
      interest: 'Leadership',
      difficulty: 'Hard',
      description: 'Navigate an ethical dilemma in a business scenario requiring principled decision-making.',
    },
  ],
}

export {
  MOCK_STUDENTS,
  STUDENT_PROFILES,
  CHALLENGES,
}
