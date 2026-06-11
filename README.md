# Launch — Capability & Career Training

> Real-world scenario training that builds the human capabilities students,
> candidates and teachers need for life and work after school.

Launch is a multi-audience scenario platform:

- **Students / Candidates** play decision scenarios in either an **Early
  career** (story-led, narrative) or **Advanced career** (clean, Apple-
  restrained Q&A) register. Quick-Play, self-create, or join via an access code.
- **Teachers** create classrooms, hand out class codes, build or pick playful
  scenarios from a curated library, see only their classroom's performance.
- **Corporates / Partners** author advanced scenarios with the v2 builder
  (3 steps · light + teal · capability transparency on every question) and
  filter candidate submissions with **AI-evaluated criteria** on the org's
  intake answers.

---

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind + shadcn primitives + bespoke editorial design system
- Front-end state + `localStorage` persistence (no backend yet — devs will
  wire one in)

## Run it locally

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

Two doors from the landing page:

- **Play** — student / candidate (with Early/Advanced toggle, code entry, Quick-Play)
- **Manage** — Teacher (classrooms) or Corporate (sidebar dashboard)

## End-to-end loop you can test

1. **Manage → Corporate → Scenario builder rail → Open builder.** Three-step
   wizard: setup → author → review & ship. Generate an access code.
2. **Play → Got a code?** Paste the code → the candidate lands in the
   right register (Advanced = clean Q&A; Early = full dramatic flow).
   (Teacher-built scenarios still have an open-text intake step before the
   scenario; corporate-built scenarios skip intake by design.)
3. **Manage → Corporate → Submissions rail.** Every code-launched
   submission shows up with its AI-evaluated intake answers, per-criterion
   scores (0–10), and one-line rationales.

## Project structure (highlights)

```
app/page.tsx                          # top-level state machine + routing
components/
  hero-section.tsx                    # marketing hero
  student-dashboard.tsx               # candidate landing + Quick-Play + code
  teacher-dashboard.tsx               # classrooms list + create flow
  classroom-detail.tsx                # students · scenarios · performance
  scenario-builder-v2.tsx             # NEW 3-step authoring tool
  submissions-view.tsx                # org's review surface for candidates
  play/
    PlayShell.tsx                     # scenario flow state machine
    IntakeQuestionsScreen.tsx         # generic open-text intake
    screens.tsx, parts.tsx            # the LQ v2 play screens
    styles/play.css                   # cream / cinema / professional tokens
lib/
  roles.ts                            # UserRole, AppMode, ScenarioLevel
  builderData.ts                      # 10 capabilities + 14 AI criteria
  aiEvaluator.ts                      # deterministic stub (swap for LLM)
  scenarioStore.ts                    # code → scenario stub (localStorage)
  submissionStore.ts                  # candidate submissions (localStorage)
```

## Publishing new updates

```bash
pnpm publish:gh "what changed"
```

This commits the current working tree and pushes to `origin/main`.
The current shell session also auto-publishes at the end of each significant
batch of edits.

## Honest gaps for the dev team to harden

- **AI evaluator (`lib/aiEvaluator.ts`)** is a deterministic keyword/heuristic
  stub. Same input/output shape as a real LLM call — swap the `scoreCriterion`
  internals for an API call and everything downstream still works.
- **All persistence is `localStorage`.** Scenarios, classrooms, submissions
  all need a real backend store. The store APIs are already abstracted into
  `lib/*Store.ts` — swap the read/write functions for HTTP calls.
- **Old `scenario-builder.tsx`** (the pre-v2 builder) still lives on disk
  but is no longer mounted anywhere. Safe to delete.
- **Scenario decisions** captured at play time aren't yet attached to
  `Submission` records — a 10-line hook in `student-dashboard.tsx`
  `handlePlayComplete`.
