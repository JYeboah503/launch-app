export interface Student {
  id: string
  name: string
  interests: string[]
  topCapabilities: { name: string; level: number }[]
  overallScore: number
  degree?: string
  atar?: number
  /* ─── Extended profile fields for partner-side filtering on role detail.
        Mirror the CandidateProfile shape so a Submission's profile can
        slot into the same filter logic without translation. ─── */
  university?: string
  graduationYear?: number
  location?: string
  workRights?: 'citizen-permanent' | 'visa-unrestricted' | 'visa-restricted' | 'no-rights'
  industries?: string[]
  selfRatedStrengths?: string[]
  availableFrom?: string
  expectedSalary?: 'under-60' | '60-75' | '75-90' | '90-110' | '110-130' | '130-150' | '150-plus' | 'flexible'
  willingRelocate?: 'yes-anywhere' | 'yes-in-country' | 'yes-in-state' | 'no'
  /** Pre-qualifier verdict — whether they passed all benchmarks. */
  prequalStatus?: 'passed' | 'flagged'
  /** ms to complete the scenario — used as a confidence proxy. */
  completionTimeMs?: number
  /** Contact email from the candidate's intake profile. Blurred surfaces
   *  never render it; exports + the shortlist-compare join on it. */
  email?: string
  /** ISO timestamp the candidate submitted — stamped onto exports. */
  submittedAt?: string
}
