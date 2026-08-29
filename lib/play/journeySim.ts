/**
 * Journey Sim — the node-journey script for the school platform.
 *
 * IMPORTANT (design prototype): this is NOT a real branching engine.
 * It is a scripted node graph whose UI *behaves like* the engine in the
 * build plan — "Branching narrative journey engine (decision →
 * consequence → next node)... Sims-style... mature toward harder
 * problems." The student picks a passion, lands in one continuous
 * real-life activity, chooses where to start (six doors), works
 * sequential threads (choice → phone call → consequence), and the
 * project state + difficulty visibly evolve off their inputs. Free
 * text is accepted at every beat and absorbed into the story.
 * The real build generates these nodes with FUSE.
 *
 * Exemplar: the footy-club grand final, per Jojo's brief-back
 * (organise the grand final → where do you start? → team thread →
 * "you have six phone numbers" → "you called Johnny and this is
 * what Johnny is saying").
 */

/** Workstream keys are per-script (footy has venue/canteen, farm has
 *  header/paddocks…) — any string, defined by the script's `streams`. */
export type StreamKey = string
export type StreamStatus = 'todo' | 'underway' | 'sorted' | 'shaky'

export interface SimEffect {
  stream?: StreamKey
  status?: StreamStatus
  days?: number
  score?: number
  /** Deltas per ledger key, e.g. { cash: 220, stock: -2 }. Only meaningful
   *  when the script defines `ledger` — additive, doesn't touch `score`. */
  ledger?: Record<string, number>
}

export interface SimOption {
  id: string
  label: string
  skill?: string
  /** The consequence beat shown after picking — "what happened". */
  response: string
  /** Next node id, or 'HUB' to return to the project hub. */
  to: string
  effects?: SimEffect
}

export interface SimNode {
  id: string
  /** 'scene' = a moment with choices. The other three are conversations —
   *  same dialogue mechanics, different framing: a phone call, a
   *  face-to-face talk, or a text-message thread. Threads should mix them
   *  so no two beats feel like the same interaction. */
  kind: 'scene' | 'call' | 'talk' | 'text'
  stream?: StreamKey
  eyebrow: string
  narrative: string
  prompt: string
  /** Conversation nodes: who you're talking to and what they say, line by line. */
  speaker?: { name: string; role: string }
  dialogue?: string[]
  options: SimOption[]
  /** Where a typed-in "own words" move lands next. */
  customTo?: string
}

export interface SimEnding {
  title: string
  body: string
}

/** A visible running-numbers mechanic — e.g. a market stall's cash tin and
 *  stock count — that replaces the abstract 0-100 goal meter for scripts
 *  that define it. Additive to the engine: scripts without `ledger` behave
 *  exactly as before. */
export interface LedgerKeySpec {
  label: string
  format: 'currency' | 'count' | 'hours' | 'percent'
  start: number
  /** Which direction is good news — drives delta-chip and update-card
   *  colouring. Default 'up'. A key that falls via authored NEGATIVE
   *  deltas (e.g. farm's dry hours) keeps 'up' so drops render as bad. */
  goodDirection?: 'up' | 'down'
  /** Optional clamp applied when deltas land (percent keys need [0,100]). */
  min?: number
  max?: number
}
export interface LedgerConfig {
  /** Which key's value decides the ending tier. MUST be an up-good key —
   *  the tier comparison is a plain >= against the thresholds. */
  primaryKey: string
  keys: Record<string, LedgerKeySpec>
  /** In the primary key's own units — replaces the universal 68/45 score
   *  thresholds for scripts that define a ledger. */
  tierThresholds: { high: number; mid: number }
  /** Head line on the update-card artifact ("· · · X · · ·"); defaults to
   *  the script title. */
  cardHead?: string
}

export interface JourneySimScript {
  id: string
  title: string
  club: string
  goalLabel: string
  daysTotal: number
  intro: { eyebrow: string; narrative: string; prompt: string }
  streams: Record<StreamKey, { label: string; entry: string; doorLabel: string }>
  nodes: Record<string, SimNode>
  /** Threads completed before the complication forces its way in. */
  threadsBeforeFinale: number
  /** Which complication arrives depends on whether `checkStream` was
   *  secured — difficulty evolves off the player's own inputs. */
  complication: { checkStream: StreamKey; whenSorted: string; otherwise: string }
  finale: string
  endings: { high: SimEnding; mid: SimEnding; low: SimEnding }
  /** Optional distinct mechanic — a visible dashboard instead of the
   *  abstract goal meter. Absent scripts are unaffected. */
  ledger?: LedgerConfig
  /** Per-script copy for repeat hub visits — without this, the player
   *  falls back to a neutral generic line rather than another script's
   *  flavour text. */
  hubReturn?: { eyebrow: string; narrative: string; prompt: string }
  /** Per-script visual world — each journey should FEEL like its job, not
   *  share one navy shell. Absent scripts keep the default cinema navy. */
  theme?: {
    /** Full-page background (CSS gradient/color). */
    background: string
    /** Accent for eyebrows, day counter, call highlights. */
    accent: string
    /** Header/backdrop tint behind the sticky top bar. */
    topBar: string
  }
  /** Cinematic cold open — 2-3 scene beats revealed in sequence inside the
   *  journey's own themed world, then a mission card, then "Step in →".
   *  Replaces the generic LaunchTransition as the journey lead-up.
   *  {name} is interpolated in beats. */
  arrival?: {
    beats: string[]
    mission: { headline: string; points: string[] }
  }
  /** Alternative header dashboard computed FROM stream statuses — no
   *  per-option effect changes needed. Mutually exclusive with `ledger`. */
  dashboard?: { kind: 'streams'; label?: string }
  /** Short mechanic descriptor for selection cards ("Live cash ledger"). */
  mechanicLabel?: string
}

export const FOOTY_SIM: JourneySimScript = {
  id: 'sim-footy-grand-final',
  title: 'The Grand Final',
  club: 'Westside Junior Football Club',
  goalLabel: 'GRAND FINAL DAY',
  daysTotal: 12,
  theme: {
    // Stadium dusk — deep grass green, floodlight lime accent.
    background: 'linear-gradient(180deg, #0a1410 0%, #12241a 45%, #1a3324 100%)',
    accent: '#8fe08f',
    topBar: 'rgba(10, 20, 16, 0.85)',
  },
  dashboard: { kind: 'streams', label: 'Jobs sorted' },
  mechanicLabel: 'Six-job board',
  hubReturn: {
    eyebrow: 'back at the clubrooms',
    narrative: 'One thread sorted — the clipboard is still half full.',
    prompt: 'What do you take on next?',
  },
  arrival: {
    beats: [
      'Twelve days out, the league confirms it: the grand final is at YOUR ground.',
      'Tom hands you the clipboard in front of the whole club. "It\'s yours, {name}."',
      'A few hundred people are coming. Right now, nothing is booked.',
    ],
    mission: {
      headline: 'Run grand final day.',
      points: [
        'Get every job on the clipboard to SORTED before the siren.',
        'The board up top counts JOBS SORTED — and the day counter is real.',
      ],
    },
  },
  intro: {
    eyebrow: 'Day 1 · The clubrooms',
    narrative:
      "The league just confirmed it: the grand final is at YOUR club in twelve days. Tom, the club president, hands you the clipboard in front of everyone. \"You've got this, {name}. Anything you need, ask. But it's yours.\" Twelve days. One ground. A few hundred people coming.",
    prompt: 'Where do you start?',
  },
  streams: {
    team: { label: 'Volunteers & crew', entry: 'team-1', doorLabel: 'Start gathering your crew' },
    venue: { label: 'The ground', entry: 'venue-1', doorLabel: 'Lock in the ground' },
    food: { label: 'Canteen & food', entry: 'food-1', doorLabel: 'Sort the canteen' },
    promo: { label: 'Getting people there', entry: 'promo-1', doorLabel: 'Get the word out' },
    sponsor: { label: 'Sponsors', entry: 'sponsor-1', doorLabel: 'Find a sponsor' },
    umpires: { label: 'Umpires & officials', entry: 'umpires-1', doorLabel: 'Book the umpires' },
  },
  nodes: {
    /* ---------------- TEAM ---------------- */
    'team-1': {
      id: 'team-1',
      kind: 'scene',
      stream: 'team',
      eyebrow: 'The volunteer list',
      narrative:
        "Tom slides you the volunteers page: six phone numbers, and three jobs that MUST be filled — team runners, scoreboard crew, ground marshal. You have started organising your crew. These are your responsibilities now.",
      prompt: 'Six numbers. How do you work the list?',
      customTo: 'team-call',
      options: [
        {
          id: 'johnny-first',
          label: 'Start with Johnny, the old coach — he knows every parent in this club.',
          skill: 'Leadership & Influence',
          response:
            'You dial Johnny before you lose your nerve. Straight to voicemail — but forty seconds later your phone lights up. He’s calling you back.',
          to: 'team-call',
          effects: { score: 4, status: 'underway', stream: 'team' },
        },
        {
          id: 'split-list',
          label: 'Split the list with Priya, the team manager — three calls each, tonight.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Priya takes the bottom three names without blinking. "Done by eight," she says. Your half starts with the number marked JOHNNY (COACH, RETIRED-ISH).',
          to: 'team-call',
          effects: { score: 3, status: 'underway', stream: 'team' },
        },
        {
          id: 'group-text',
          label: 'One group text to all six: "Grand final’s at ours. Who’s in?"',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Two thumbs-up, one "who is this?", and three silences. Group texts are easy to send and easy to ignore. Then Johnny rings you — he doesn’t do group chats.',
          to: 'team-call',
          effects: { score: -2, status: 'underway', stream: 'team' },
        },
      ],
    },
    'team-call': {
      id: 'team-call',
      kind: 'call',
      stream: 'team',
      eyebrow: 'On the phone',
      narrative: 'You called Johnny. This is what Johnny is saying:',
      speaker: { name: 'Johnny', role: 'old coach · 40 years at the club' },
      dialogue: [
        "Heard you're running the big one. Good. About time someone your age did.",
        "I can get you runners and a full scoreboard crew by Thursday — no worries at all.",
        "One condition: old Macca does ground marshal. He's slow, mate, and he'll talk your ear off... but he's never missed a Westside grand final in forty years.",
      ],
      prompt: 'What do you tell Johnny?',
      customTo: 'team-3',
      options: [
        {
          id: 'take-macca',
          label: '"Macca\'s our marshal. Tell him he\'s got the fluoro vest and the good chair."',
          skill: 'Emotional Intelligence',
          response:
            "There's a pause, and you can hear Johnny grinning down the phone. \"You just made an old bloke's year.\" By Thursday you have runners, a scoreboard crew, and a marshal who arrives two hours early. Crew: SORTED.",
          to: 'team-3',
          effects: { stream: 'team', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'crew-not-macca',
          label: '"I\'ll take the crew — but I need a quicker marshal. I\'ll tell Macca myself, straight up."',
          skill: 'Integrity & Ethics',
          response:
            'Johnny goes quiet. "Your call, captain. Tell him kind." The call with Macca is hard — he takes it on the chin and offers to run the gate instead. You got the faster marshal, and it cost you something real. Crew: sorted, with a bruise.',
          to: 'team-3',
          effects: { stream: 'team', status: 'sorted', days: 2, score: 3 },
        },
        {
          id: 'shop-around',
          label: '"Let me get back to you — I want to see my other options first."',
          skill: 'Judgement & Decision-Making',
          response:
            'You spend two days working the other five numbers and land... one scoreboard volunteer. When you ring Johnny back, his tone is cooler: "Offer still stands. Half of it, anyway." Crew: patched together, and it shows.',
          to: 'team-3',
          effects: { stream: 'team', status: 'shaky', days: 3, score: -6 },
        },
      ],
    },

    'team-3': {
      id: 'team-3',
      kind: 'talk',
      stream: 'team',
      eyebrow: 'Macca',
      narrative:
        'Next afternoon, a ute you don’t recognise is parked at the clubrooms. Macca — fluoro vest already ON, a week early — is walking the boundary line like it owes him money.',
      speaker: { name: 'Macca', role: 'forty grand finals · zero missed' },
      dialogue: [
        'Just walking the ground. Old habit. You get a feel for where the day goes wrong, walking it.',
        'Gate bottlenecks there, see — one gate, three hundred people, kickoff minus twenty. And the hill shade goes by eleven; old folks’ll bake unless someone thinks about it.',
        'Not telling you your job. Just telling you the ground. Free of charge.',
      ],
      prompt: 'Forty years of the ground, offered in one lap.',
      customTo: 'team-4',
      options: [
        {
          id: 'walk-with',
          label: 'Do the whole lap with him, notebook out — turn his forty years into your run-sheet.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'One lap, nine notes, three of them things nobody under sixty would ever think of. The second gate gets planned on the spot. Macca walks taller on the way back.',
          to: 'team-4',
          effects: { score: 2 },
        },
        {
          id: 'note-two',
          label: 'Take the gate point and the shade point — the rest is probably nostalgia.',
          skill: 'Judgement & Decision-Making',
          response:
            'The two points were the good ones, mostly. "Probably nostalgia" also contained the bit about where the ambulance parks, which you’ll re-derive the hard way later.',
          to: 'team-4',
        },
        {
          id: 'humour-him',
          label: 'Nod along politely and get back inside — you’ve got calls to make.',
          skill: 'Self-direction',
          response:
            'Macca finishes his lap alone. The notes stay in his head, where they’ve lived rent-free for forty years and where, this Saturday, they’ll do you no good at all.',
          to: 'team-4',
          effects: { score: -2 },
        },
      ],
    },
    'team-4': {
      id: 'team-4',
      kind: 'text',
      stream: 'team',
      eyebrow: 'Priya · 8:04pm',
      narrative: 'Priya texts the way she manages the team: a spreadsheet arrives before the greeting does.',
      speaker: { name: 'Priya', role: 'team manager · runs on spreadsheets' },
      dialogue: [
        'Roster attached. Green = confirmed. Look at 2–4pm and tell me what you see.',
        'Everyone signed up for the morning because everyone wants to WATCH the actual game. Shock.',
        'We need four bodies who’ll work the canteen and gate during the second half. Ideas, or do I start guilting people?',
      ],
      prompt: 'The 2pm hole. Every event has one.',
      customTo: 'team-5',
      options: [
        {
          id: 'split-shifts',
          label: 'Split every job into half-game shifts — everyone works one half, watches one half. Rebuild the roster that way tonight.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The reframe fills the hole in an hour — nobody minds working when the deal includes watching. Priya replies with the rarest emoji in her set: the trophy.',
          to: 'team-5',
          effects: { score: 2 },
        },
        {
          id: 'guilt-list',
          label: '"Start guilting. You’re better at it than me."',
          skill: 'Leadership & Influence',
          response:
            'She is better at it. Four names appear by morning, two of them attached to people who’ll mention this favour at every barbecue until Christmas.',
          to: 'team-5',
        },
        {
          id: 'hole-fine',
          label: '"It’s the second half — half the crowd leaves anyway. We’ll cover it thin."',
          skill: 'Self-direction',
          response:
            'Grand final crowds don’t leave, they THICKEN. The 2pm hole is now a plan, and plans built on "probably fine" bill you at the worst hour.',
          to: 'team-5',
          effects: { score: -2 },
        },
      ],
    },
    'team-5': {
      id: 'team-5',
      kind: 'scene',
      stream: 'team',
      eyebrow: 'The job cards',
      narrative:
        'Twelve volunteers now exist on paper. On the day, each of them will ask the same question: "So what exactly do I do?" You can answer that twelve times at 8am Saturday, or once, tonight, on paper.',
      prompt: 'How do volunteers learn their jobs?',
      customTo: 'team-6',
      options: [
        {
          id: 'one-pagers',
          label: 'A card per job: times, tasks, who to find when stuck, one emergency number. Laminated, lanyarded.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Twelve cards, one evening. Saturday morning, volunteers read their necks instead of queueing at yours. The lanyards cost $8 and buy you a morning.',
          to: 'team-6',
          effects: { score: 2 },
        },
        {
          id: 'group-briefing',
          label: 'One big WhatsApp voice note explaining everything — efficient, personal.',
          skill: 'Emotional Intelligence',
          response:
            'Nine of twelve listen to it. The other three "will listen on the way" — and arrive Saturday with questions the voice note answered at minute two.',
          to: 'team-6',
        },
        {
          id: 'figure-it-out',
          label: 'They’re adults at a footy club — they’ll find their spots.',
          skill: 'Self-direction',
          response:
            'They find spots. Whether they’re THE spots is revealed at 8:15am, when the scoreboard crew is on the gate and the gate crew is asking Rosa for jobs.',
          to: 'team-6',
          effects: { score: -2 },
        },
      ],
    },
    'team-6': {
      id: 'team-6',
      kind: 'talk',
      stream: 'team',
      eyebrow: 'Thursday · the muster',
      narrative:
        'Johnny suggests it sideways, the way he coaches: "Some clubs do a little walk-through before a big day. Not saying you have to." Thursday 6pm is free. So is everyone else, mostly.',
      speaker: { name: 'Johnny', role: 'old coach · asking sideways' },
      dialogue: [
        'Thirty minutes, tops. Everyone stands where they’ll stand, walks what they’ll walk.',
        'Sounds like overkill for volunteers, I know. It’s not the walking that matters — it’s that everyone SEES everyone else’s job once.',
        'That’s the difference between twelve helpers and a crew. Your call, captain.',
      ],
      prompt: 'The Thursday walk-through: run it?',
      customTo: 'HUB',
      options: [
        {
          id: 'run-muster',
          label: 'Run it — thirty minutes, everyone walks their job, sausages after.',
          skill: 'Leadership & Influence',
          response:
            'Twenty minutes in, the gate crew and the canteen invent a handover you’d never have designed. Johnny watches from the fence, saying nothing, meaning everything. Crew: A CREW now.',
          to: 'HUB',
          effects: { stream: 'team', status: 'sorted', score: 3 },
        },
        {
          id: 'key-people',
          label: 'Just the four key roles walk through — everyone else gets the summary.',
          skill: 'Judgement & Decision-Making',
          response:
            'The four walk it well. The other eight get a summary of a walk, which is like a postcard of a meal — accurate, not nourishing.',
          to: 'HUB',
        },
        {
          id: 'skip-muster',
          label: 'Everyone’s given enough time already — don’t push it.',
          skill: 'Emotional Intelligence',
          response:
            'Considerate, genuinely. But Saturday’s first hour now doubles as the rehearsal, with three hundred people watching the cast learn their marks.',
          to: 'HUB',
          effects: { stream: 'team', status: 'shaky', score: -3 },
        },
      ],
    },

    /* ---------------- VENUE ---------------- */
    'venue-1': {
      id: 'venue-1',
      kind: 'scene',
      stream: 'venue',
      eyebrow: 'The ground',
      narrative:
        "Here's the thing nobody's said out loud: the league PENNANT squad also trains at your ground Saturday mornings, and nothing about the grand final is in writing yet. The ground belongs to whoever locks it first.",
      prompt: 'How do you lock in the ground?',
      customTo: 'venue-call',
      options: [
        {
          id: 'call-marge',
          label: 'Ring Marge, the groundskeeper — she decides what happens on that grass, whatever the paperwork says.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Everyone books the ground through the league office. The smart ones call Marge. She picks up on the second ring.',
          to: 'venue-call',
          effects: { score: 4, status: 'underway', stream: 'venue' },
        },
        {
          id: 'email-league',
          label: 'Email the league office for the official booking and cc Tom.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Sensible. The auto-reply says three business days. You don’t have three business days’ worth of nerves — so you ring Marge as well.',
          to: 'venue-call',
          effects: { score: 2, status: 'underway', stream: 'venue' },
        },
        {
          id: 'assume-fine',
          label: "It's the GRAND FINAL — obviously the ground's ours. Surely.",
          skill: 'Judgement & Decision-Making',
          response:
            '"Obviously" is doing a lot of work in that sentence. Something itches at you overnight, and by morning you\'re dialling Marge anyway.',
          to: 'venue-call',
          effects: { score: -3, status: 'underway', stream: 'venue' },
        },
      ],
    },
    'venue-call': {
      id: 'venue-call',
      kind: 'call',
      stream: 'venue',
      eyebrow: 'On the phone',
      narrative: 'You called Marge. This is what Marge is saying:',
      speaker: { name: 'Marge', role: 'groundskeeper · runs the place, actually' },
      dialogue: [
        "You're lucky you rang this week and not next.",
        'Pennant squad has Saturday morning pencilled. PENCILLED, not inked. First one to get me something in writing wins the grass.',
        "Get me an email from the league TODAY and the ground's yours all day — I'll even mark the lines fresh Friday night.",
      ],
      prompt: 'The ground goes to whoever moves first.',
      customTo: 'venue-3',
      options: [
        {
          id: 'writing-today',
          label: 'Get it in writing TODAY — chase the league office until the email lands, then walk a printed copy to Marge.',
          skill: 'Self-direction',
          response:
            'Three phone calls, one "I\'ll see what I can do," and at 4:40pm the confirmation lands. You print two copies. Marge sticks one to her shed door: "Ground\'s yours. Fresh lines Friday." Venue: LOCKED.',
          to: 'venue-3',
          effects: { stream: 'venue', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'tomorrow',
          label: '"I\'ll sort the paperwork first thing tomorrow — today\'s already full."',
          skill: 'Judgement & Decision-Making',
          response:
            'Tomorrow works — barely. The league office "can\'t find the request" and it takes till 5pm. Marge inks you in with a raised eyebrow: "Cut it finer next time, why don\'t you." Venue: locked, eventually.',
          to: 'venue-3',
          effects: { stream: 'venue', status: 'sorted', days: 2, score: 2 },
        },
        {
          id: 'shell-be-right',
          label: '"Pencilled in is basically ours. She\'ll be right."',
          skill: 'Reasoning & Critical Thinking',
          response:
            "Marge exhales like she's heard this exact sentence before. \"Your funeral, love.\" The pennant squad's manager, it turns out, is very fond of paperwork. The ground is now genuinely contested.",
          to: 'venue-3',
          effects: { stream: 'venue', status: 'shaky', days: 1, score: -7 },
        },
      ],
    },

    'venue-3': {
      id: 'venue-3',
      kind: 'scene',
      stream: 'venue',
      eyebrow: 'The ground walk',
      narrative:
        'Booked is not the same as ready. A slow lap of the ground with fresh eyes turns up what three hundred visitors will find at speed on Saturday: a sunken sprinkler head near the wing, one loose fence panel, and a scoreboard ladder held together by faith.',
      prompt: 'Three hazards, five days. Handle them how?',
      customTo: 'venue-4',
      options: [
        {
          id: 'log-and-fix',
          label: 'Photograph all three, text the list to Marge and Tom, and book the working bee for Wednesday.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'A list with photos gets actioned; a worry in your head doesn’t. Wednesday’s working bee is four dads, one esky, three fixes — and Marge nodding at the sprinkler like you’ve passed something.',
          to: 'venue-4',
          effects: { score: 2 },
        },
        {
          id: 'fix-worst',
          label: 'The sprinkler’s the real ankle-breaker — fix that, note the rest.',
          skill: 'Judgement & Decision-Making',
          response:
            'Triage is a real skill and you used it. The fence panel holds all day. The scoreboard ladder, though, gets remembered at the exact moment someone’s halfway up it.',
          to: 'venue-4',
        },
        {
          id: 'grounds-fine',
          label: 'It’s survived forty seasons — it’ll survive Saturday.',
          skill: 'Self-direction',
          response:
            'The ground has survived forty seasons of people who knew where the sprinkler head was. Saturday imports three hundred people who don’t.',
          to: 'venue-4',
          effects: { score: -2 },
        },
      ],
    },
    'venue-4': {
      id: 'venue-4',
      kind: 'talk',
      stream: 'venue',
      eyebrow: 'Marge’s list',
      narrative:
        'Marge waves you into her shed — part workshop, part museum — and pulls a folded paper from her overalls. Her grand final list, same one for thirty years.',
      speaker: { name: 'Marge', role: 'groundskeeper · has a list older than you' },
      dialogue: [
        'Fresh lines Friday night, that’s mine. Goal pads, YOURS — league fines clubs that run finals on bare posts now.',
        'Sightscreen needs two blokes and a prayer to move. And the carpark: someone with a vest DIRECTING, or it self-organises into a puzzle nobody can leave.',
        'Four jobs. I do one. Guess who owns the other three.',
      ],
      prompt: 'Marge’s list just became your list.',
      customTo: 'venue-5',
      options: [
        {
          id: 'assign-all',
          label: 'Assign all three before you leave the shed: pads to the working bee, sightscreen to the pennant boys as a peace offering, carpark to Macca’s gate crew.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Three jobs land on three owners inside ten minutes — and handing the pennant squad the sightscreen turns rivals into stakeholders. Marge almost smiles. Almost.',
          to: 'venue-5',
          effects: { score: 2 },
        },
        {
          id: 'take-them-on',
          label: 'Add all three to your own Saturday-morning list — fewer moving parts.',
          skill: 'Self-direction',
          response:
            'Your Saturday-morning list now has eleven items and one you. Fewer moving parts, sure — the part that moves is just doing four jobs at once.',
          to: 'venue-5',
          effects: { score: -1 },
        },
        {
          id: 'pads-really',
          label: '"Goal pads? It’s junior footy, Marge, not the MCG."',
          skill: 'Reasoning & Critical Thinking',
          response:
            'She pulls out the league circular, laminated, highlighted. "Two hundred dollar fine, love. Section four." Being right is her hobby and you just gave her a turn.',
          to: 'venue-5',
          effects: { score: -2 },
        },
      ],
    },
    'venue-5': {
      id: 'venue-5',
      kind: 'text',
      stream: 'venue',
      eyebrow: 'Unknown number · 7:58pm',
      narrative: 'A number you don’t know, a tone you recognise instantly: the pennant squad’s manager has thoughts.',
      speaker: { name: 'Gary (Pennant)', role: 'pennant manager · aggrieved' },
      dialogue: [
        'Gary here, pennant squad. Hear you’ve got the ground Saturday. All of it. All day. Must be nice.',
        'My blokes have a state trial Monday and nowhere to run a captain’s session now. Not your problem, apparently.',
        'Anyway. Good luck with the big day. We’ll be training somewhere, I suppose.',
      ],
      prompt: 'A grievance in three texts. Handle Gary.',
      customTo: 'venue-6',
      options: [
        {
          id: 'offer-window',
          label: 'Offer him the ground 7–8:30am Saturday — done before your setup needs the grass, goodwill banked.',
          skill: 'Emotional Intelligence',
          response:
            'Gary’s reply arrives suspiciously fast: "That’d actually work. Decent of you." His squad even shifts the sightscreen on their way off. Rivals make the best allies — they’re already organised.',
          to: 'venue-6',
          effects: { score: 2 },
        },
        {
          id: 'sympathy-only',
          label: 'Sympathetic but firm: the booking stands, and you genuinely hope Monday goes well.',
          skill: 'Integrity & Ethics',
          response:
            'Clean and defensible. Gary’s "no worries" carries the emotional temperature of a Bunnings receipt, but the matter is closed.',
          to: 'venue-6',
        },
        {
          id: 'ignore-gary',
          label: 'Not your circus. Leave it on read.',
          skill: 'Self-direction',
          response:
            'Gary screenshots the silence for the league group chat, where it grows a small audience. Nothing comes of it except the thing that always comes of it: a reputation, forming without you.',
          to: 'venue-6',
          effects: { score: -2 },
        },
      ],
    },
    'venue-6': {
      id: 'venue-6',
      kind: 'call',
      stream: 'venue',
      eyebrow: 'Friday 6pm · Marge',
      narrative:
        'Friday evening. Through the clubroom window you can see Marge’s line-marker parked by the shed. One call confirms the ground is actually, finally, fully ready. You call Marge.',
      speaker: { name: 'Marge', role: 'groundskeeper · final inspection' },
      dialogue: [
        'Lines go down at seven, dew willing. Pads are on — saw the working bee do it. Carpark vest is hanging on my shed door for whoever claims it.',
        'Run me the last mile: gates, bins, the sightscreen, that sprinkler of yours. Tell me it’s all owned.',
        'I’ve seen thirty of these, love. The good ones are boring by Friday night. Bore me.',
      ],
      prompt: 'Bore Marge with readiness, or leave loose ends?',
      customTo: 'HUB',
      options: [
        {
          id: 'bore-marge',
          label: 'Walk her through every item, owner by owner, until she has nothing to add.',
          skill: 'Judgement & Decision-Making',
          response:
            'Ninety seconds of the most boring inventory of your life. A pause, then: "Well. That’s that, then." From Marge, that’s a standing ovation. Ground: READY, inspected, inked.',
          to: 'HUB',
          effects: { stream: 'venue', status: 'sorted', score: 3 },
        },
        {
          id: 'mostly-there',
          label: '"Pretty much all sorted — couple of small things I’ll catch in the morning."',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"Mm," says Marge, a syllable containing thirty years of Saturdays that started with "small things." The morning will be a race between you and the small things.',
          to: 'HUB',
        },
        {
          id: 'shes-got-it',
          label: 'Skip the call — Marge has run thirty of these without your checklist.',
          skill: 'Self-direction',
          response:
            'Marge has run thirty of HER job. Yours — gates, bins, vests, owners — has never been run by anyone, and Friday night was its only rehearsal slot.',
          to: 'HUB',
          effects: { stream: 'venue', status: 'shaky', score: -3 },
        },
      ],
    },

    /* ---------------- FOOD ---------------- */
    'food-1': {
      id: 'food-1',
      kind: 'scene',
      stream: 'food',
      eyebrow: 'The canteen',
      narrative:
        "The canteen is the club's whole fundraising engine, and grand final day is its biggest day of the year. Rosa runs it like a kitchen brigade — but the roster's empty and the big fridge died on Tuesday.",
      prompt: 'A dead fridge and an empty roster. Where do you start?',
      customTo: 'food-call',
      options: [
        {
          id: 'rosa-first',
          label: 'Call Rosa first — never plan the canteen without the canteen boss.',
          skill: 'Emotional Intelligence',
          response:
            "Correct instinct. Rosa answers mid-chop — you can hear the knife. \"About time someone called me. Sit down, I'll tell you what we actually need.\"",
          to: 'food-call',
          effects: { score: 4, status: 'underway', stream: 'food' },
        },
        {
          id: 'fix-fridge',
          label: 'Attack the fridge problem first — food safety before rosters.',
          skill: 'Reasoning & Critical Thinking',
          response:
            "A repairer can come Thursday for $180, 'maybe fix it, maybe not.' Before you book anything, you ring Rosa — and she's already three steps ahead of you.",
          to: 'food-call',
          effects: { score: 3, status: 'underway', stream: 'food' },
        },
        {
          id: 'roster-blast',
          label: 'Fire out a roster sign-up sheet to every club family tonight.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Four names by morning — not bad. Except two of them are already on Johnny\'s scoreboard crew, and Rosa is calling YOU: "Who\'s double-booking my people?"',
          to: 'food-call',
          effects: { score: -2, status: 'underway', stream: 'food' },
        },
      ],
    },
    'food-call': {
      id: 'food-call',
      kind: 'call',
      stream: 'food',
      eyebrow: 'On the phone',
      narrative: 'You called Rosa. This is what Rosa is saying:',
      speaker: { name: 'Rosa', role: 'canteen boss · 300 sausages on a good day' },
      dialogue: [
        "Listen carefully because I'll say it once. Forget the big fridge — it's been dying for two years.",
        'The butcher will lend us his cold van for the day if someone ASKS him properly. That solves storage AND doubles what we can sell.',
        "What I actually need from you: six bodies across the day and someone on the barbecue who isn't Tom. Last year he burned forty snags and blamed the wind.",
      ],
      prompt: 'Rosa knows exactly what she needs. Do you?',
      customTo: 'food-3',
      options: [
        {
          id: 'do-both',
          label: 'Take the whole brief: ask the butcher about the van yourself, and build her the six-person roster.',
          skill: 'Leadership & Influence',
          response:
            "You work it like a checklist. The butcher says yes to the van before you finish the sentence ('Rosa sent you? Say no more'). The roster fills in a day once people hear Rosa's running it. Canteen: HUMMING.",
          to: 'food-3',
          effects: { stream: 'food', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'roster-only',
          label: 'Promise the roster, but park the van idea — one favour at a time.',
          skill: 'Judgement & Decision-Making',
          response:
            'The roster fills. The dead fridge means half the usual stock, and Rosa makes it work because Rosa always makes it work — but she notices the van never happened. Canteen: fine. Just fine.',
          to: 'food-3',
          effects: { stream: 'food', status: 'sorted', days: 2, score: 2 },
        },
        {
          id: 'hand-back',
          label: '"You clearly have this handled, Rosa — I\'ll leave the canteen entirely with you."',
          skill: 'Emotional Intelligence',
          response:
            '"Handled? I just told you what I NEED, and you handed it back." The silence afterwards is educational. Rosa will run her canteen regardless — short-staffed, short-stocked, and shorter with you.',
          to: 'food-3',
          effects: { stream: 'food', status: 'shaky', days: 1, score: -6 },
        },
      ],
    },

    'food-3': {
      id: 'food-3',
      kind: 'talk',
      stream: 'food',
      eyebrow: 'The cold van',
      narrative:
        'The butcher’s shop, quiet hour. Sav wipes down the slicer while you raise the cold van — the favour Rosa said would double what the canteen can sell.',
      speaker: { name: 'Sav', role: 'butcher · does favours properly or not at all' },
      dialogue: [
        'The van, eh. Rosa’s idea, I can tell — she’s been eyeing it since the Christmas fete.',
        'Yes — IF: it’s back by six, spotless, and whoever drives it has an actual licence and an actual clue. It’s my second-biggest asset, that van.',
        'And it comes with my snags in it, obviously. Cost price. Nobody sells someone else’s sausages out of my van.',
      ],
      prompt: 'A van, three conditions, one handshake on offer.',
      customTo: 'food-4',
      options: [
        {
          id: 'terms-in-writing',
          label: 'Shake on it and text him the terms back afterwards — driver’s name, return time, cleaning plan — so nothing lives on a handshake alone.',
          skill: 'Integrity & Ethics',
          response:
            'The follow-up text lands and Sav replies with one word: "Professional." The van is now certain in a way handshakes aren’t, and Rosa gets her doubled fridge space.',
          to: 'food-4',
          effects: { score: 2 },
        },
        {
          id: 'handshake-only',
          label: 'Shake on it and sort the details later — deal’s done, that’s the main thing.',
          skill: 'Self-direction',
          response:
            'The deal is done-ish. "Later" is where details go to blur, and Thursday you’ll be texting "sorry — who did we say was driving?" to a man who notices things like that.',
          to: 'food-4',
        },
        {
          id: 'too-many-conditions',
          label: '"Three conditions for a loan? Maybe we’ll just get ice and eskies."',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Eskies hold a third of the stock at twice the faff, and Rosa hears about the turned-down van before you’re back at the car. The maths was never close.',
          to: 'food-4',
          effects: { score: -2 },
        },
      ],
    },
    'food-4': {
      id: 'food-4',
      kind: 'scene',
      stream: 'food',
      eyebrow: 'The menu board',
      narrative:
        'Rosa can cook for three hundred; she refuses to do pricing "because last year the committee argued about the pie margin for forty minutes." The menu board — what’s sold, at what price, in what order — lands on you.',
      prompt: 'Build the menu board how?',
      customTo: 'food-5',
      options: [
        {
          id: 'simple-menu',
          label: 'Short and fast: snags, pies, drinks, one meal deal — big prices, round numbers, no maths at the till.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Round numbers move queues. The $10 pie-drink-snag deal becomes the day’s default order, and the line never backs past the fence — which, Rosa notes, has never happened.',
          to: 'food-5',
          effects: { score: 2 },
        },
        {
          id: 'big-menu',
          label: 'Go big — the crowd deserves options: burgers, wraps, the lot.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Options are lovely and each one is a station, a queue, and a decision. The burger line alone eats a volunteer whole. Rosa runs it because Rosa runs everything, at a cost.',
          to: 'food-5',
          effects: { score: -1 },
        },
        {
          id: 'same-as-always',
          label: 'Copy whatever last year’s board said — it worked, presumably.',
          skill: 'Judgement & Decision-Making',
          response:
            'Last year’s board priced snags at 2019 numbers. The canteen sells out AND undershoots its best fundraising day of the year — busy is not the same as right.',
          to: 'food-5',
        },
      ],
    },
    'food-5': {
      id: 'food-5',
      kind: 'text',
      stream: 'food',
      eyebrow: 'Rosa · Thursday 9:31pm',
      narrative: 'Rosa texts like she cooks: precisely, and with no patience for waste.',
      speaker: { name: 'Rosa', role: 'canteen boss · counts everything' },
      dialogue: [
        'Numbers time. I’m ordering bread tomorrow 7am. Mia’s posts have me nervous — how many are ACTUALLY coming? 250? 400?',
        'Order short and we run out by half time in front of everyone. Order long and the club eats sausage sandwiches till Christmas.',
        'Give me your number and OWN it. That’s all I ask.',
      ],
      prompt: 'Rosa needs one number by 7am.',
      customTo: 'food-6',
      options: [
        {
          id: 'evidence-number',
          label: 'Build the number from evidence tonight: Mia’s reach, ticket chatter, last year’s gate — land on 350 and tell Rosa why.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'You send "350, here’s the working" at 10pm. Rosa replies "good. that’s how you order bread." Saturday clears 340 through the gate. Nobody ever knows how close that was — which is the job.',
          to: 'food-6',
          effects: { score: 2 },
        },
        {
          id: 'split-difference',
          label: 'Say 300 — the middle of her range feels safe.',
          skill: 'Judgement & Decision-Making',
          response:
            'A guess dressed as a decision. It half-works: the snags stretch, the buns don’t, and the last hour of canteen service goes continental.',
          to: 'food-6',
        },
        {
          id: 'your-call-rosa',
          label: '"You know canteens better than me — your call, Rosa."',
          skill: 'Self-direction',
          response:
            'She DOES know canteens. She doesn’t know Mia’s eleven thousand pie views. Rosa orders for a normal final; Saturday isn’t one; the gap is bread-shaped.',
          to: 'food-6',
          effects: { score: -2 },
        },
      ],
    },
    'food-6': {
      id: 'food-6',
      kind: 'scene',
      stream: 'food',
      eyebrow: 'Friday night · the canteen',
      narrative:
        'Friday, 7pm. The canteen can be fully staged tonight — urn filled, floats counted, van parked and plugged, stations labelled — or it can all happen at 6:30am with cold hands and hot tempers.',
      prompt: 'Stage tonight or sprint tomorrow?',
      customTo: 'HUB',
      options: [
        {
          id: 'stage-tonight',
          label: 'Full stage tonight with Rosa — every station ready, van cold and stocked, a torch-lit walkthrough at the end.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'By 8:40 the canteen looks like it’s mid-service, minus people. Rosa locks up, hands you a leftover pie, and says "you’d survive in a kitchen" — her highest civilian honour. Canteen: LOADED.',
          to: 'HUB',
          effects: { stream: 'food', status: 'sorted', score: 3 },
        },
        {
          id: 'half-stage',
          label: 'Stage the dry goods tonight, leave the cold chain for morning.',
          skill: 'Judgement & Decision-Making',
          response:
            'Sensible split on paper. In practice the morning cold-chain window collides with the gate opening, and Rosa does two jobs at the hour she planned to do one.',
          to: 'HUB',
        },
        {
          id: 'morning-sprint',
          label: 'Everyone’s tired — fresh 6am start will be quicker anyway.',
          skill: 'Self-direction',
          response:
            '6am arrives unfresh. The urn takes forty minutes nobody budgeted, the van needs a jump start, and the first customers queue politely at a canteen still finding its aprons.',
          to: 'HUB',
          effects: { stream: 'food', status: 'shaky', score: -3 },
        },
      ],
    },

    /* ---------------- PROMO ---------------- */
    'promo-1': {
      id: 'promo-1',
      kind: 'scene',
      stream: 'promo',
      eyebrow: 'Getting people there',
      narrative:
        "A grand final with an empty hill is just a game. Mia — Year 12, runs the school's media account, 4,000 followers — has offered to help. The club's own \"socials\" are a Facebook page last updated in 2023.",
      prompt: 'How do you fill the hill?',
      customTo: 'promo-call',
      options: [
        {
          id: 'brief-mia',
          label: 'Call Mia and give her the whole canvas — posters, countdown, player profiles, her call.',
          skill: 'Leadership & Influence',
          response:
            "Mia picks up already talking: \"Okay so I've had ideas for WEEKS.\" You can hear her opening three apps at once.",
          to: 'promo-call',
          effects: { score: 4, status: 'underway', stream: 'promo' },
        },
        {
          id: 'posters',
          label: 'Keep it classic: posters in every shop window on Main St, flyers at school pickup.',
          skill: 'Self-direction',
          response:
            "Twelve shopkeepers say yes, two say 'ask head office.' It's working, slowly — and then Mia rings YOU, slightly offended she wasn't asked.",
          to: 'promo-call',
          effects: { score: 2, status: 'underway', stream: 'promo' },
        },
        {
          id: 'word-of-mouth',
          label: "It's a grand final — people will just come. They always do.",
          skill: 'Judgement & Decision-Making',
          response:
            "Your nan would come through a cyclone. Everyone else has weekends. Mia calls you Tuesday: \"So... are we DOING anything about crowd? Asking for the whole town.\"",
          to: 'promo-call',
          effects: { score: -3, status: 'underway', stream: 'promo' },
        },
      ],
    },
    'promo-call': {
      id: 'promo-call',
      kind: 'call',
      stream: 'promo',
      eyebrow: 'On the phone',
      narrative: 'You called Mia. This is what Mia is saying:',
      speaker: { name: 'Mia', role: 'Year 12 · runs the school account' },
      dialogue: [
        "Right, here's the plan and you can't say no to all of it.",
        'One: countdown posts starting tonight, player profiles from Thursday. Two: I need the CLUB page login, which apparently nobody alive possesses.',
        "Three — and this is the good one — the bakery said they'll do a GRAND FINAL PIE if we promote it. A pie, {name}. Local news LOVES a pie.",
      ],
      prompt: 'Mia has momentum. Direct it.',
      customTo: 'promo-3',
      options: [
        {
          id: 'greenlight-pie',
          label: 'Greenlight all three — and put her pie post on the club banner. Track down that login tonight.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The login lives with a committee member\'s ex-treasurer\'s son. You get it by 9pm. The pie post does 11,000 views by Sunday and the bakery sells out twice. People you\'ve never met are asking about gate times. Crowd: COMING.',
          to: 'promo-3',
          effects: { stream: 'promo', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'posts-only',
          label: 'Countdown and profiles yes — skip the pie, keep it about the footy.',
          skill: 'Judgement & Decision-Making',
          response:
            "Clean, sensible, a bit beige. The posts do fine among people already coming. Mia does it all properly and files the pie under 'ideas wasted on adults.' Crowd: decent.",
          to: 'promo-3',
          effects: { stream: 'promo', status: 'sorted', days: 2, score: 2 },
        },
        {
          id: 'rein-in',
          label: '"Let\'s not get carried away — one poster template, and I approve every post first."',
          skill: 'Leadership & Influence',
          response:
            "You can hear the air go out of her. \"...Sure. Send me the template when you've approved it.\" Three posts happen instead of fifteen. Approval bottlenecks kill momentum, and this one killed hers.",
          to: 'promo-3',
          effects: { stream: 'promo', status: 'shaky', days: 2, score: -5 },
        },
      ],
    },

    'promo-3': {
      id: 'promo-3',
      kind: 'text',
      stream: 'promo',
      eyebrow: 'Mia · 10:14pm',
      narrative: 'Three drafts arrive in a row, then a voice note you don’t need to play to hear.',
      speaker: { name: 'Mia', role: 'creative engine · needs an answer NOW' },
      dialogue: [
        'Countdown post draft attached x3. Version A is safe, B is funny, C is — okay C might get me in trouble with the principal but it WILL go off.',
        'I need a pick in the next hour or we miss tonight’s posting window.',
        'Also whichever one you pick, that’s the VOICE for the whole campaign. No pressure. Some pressure.',
      ],
      prompt: 'A, B, or the one with principal risk.',
      customTo: 'promo-4',
      options: [
        {
          id: 'pick-b',
          label: 'Version B — funny travels, and a grand final can carry a joke. Reply inside the hour with one line of why.',
          skill: 'Judgement & Decision-Making',
          response:
            'Decisive, fast, and reasoned — the trifecta that keeps creatives creating. B does numbers, sets the voice, and Mia stops triple-texting because she trusts the answers will come.',
          to: 'promo-4',
          effects: { score: 2 },
        },
        {
          id: 'pick-a-safe',
          label: 'Version A — it’s a footy club, keep it clean and classic.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Safe lands safely. The campaign finds a polite audience of people already coming. Mia posts it professionally and saves B in a folder labelled "wasted."',
          to: 'promo-4',
        },
        {
          id: 'decide-tomorrow',
          label: '"Big decision — let me sleep on it and we’ll nail it tomorrow."',
          skill: 'Self-direction',
          response:
            'The posting window closes while you sleep on a two-minute decision. Momentum, it turns out, has business hours — and they were tonight.',
          to: 'promo-4',
          effects: { score: -2 },
        },
      ],
    },
    'promo-4': {
      id: 'promo-4',
      kind: 'scene',
      stream: 'promo',
      eyebrow: 'Main Street',
      narrative:
        'The internet is humming; Main Street isn’t. Half this town’s grand final crowd doesn’t scroll — they read shop windows, the bakery corkboard, and the sign outside the servo. The analog layer needs an owner too.',
      prompt: 'How does the offline town find out?',
      customTo: 'promo-5',
      options: [
        {
          id: 'poster-run',
          label: 'One lunchtime poster run: twelve shops, the servo sign, the bakery corkboard — and ask each shopkeeper to mention it at the till.',
          skill: 'Leadership & Influence',
          response:
            'The till-mention is the trick — twelve shopkeepers become twelve broadcasters. By Thursday, people with no internet and strong opinions about the forward line know the gate time.',
          to: 'promo-5',
          effects: { score: 2 },
        },
        {
          id: 'few-posters',
          label: 'Posters at the bakery and the servo — the two that matter.',
          skill: 'Judgement & Decision-Making',
          response:
            'The two that matter do matter. The other ten were free reach, left on the table with the flyers.',
          to: 'promo-5',
        },
        {
          id: 'online-is-enough',
          label: 'It’s 2026 — if it’s not online it doesn’t exist.',
          skill: 'Self-direction',
          response:
            'Nan’s bowls club — fourteen guaranteed attendees with folding chairs and gate-fee cash — does not follow the school account. They find out Sunday, from the paper, past tense.',
          to: 'promo-5',
          effects: { score: -2 },
        },
      ],
    },
    'promo-5': {
      id: 'promo-5',
      kind: 'call',
      stream: 'promo',
      eyebrow: 'The local paper',
      narrative:
        'An unknown number, a landline. The local paper has smelled a story — Mia’s pie post reached their news desk, which is one part-time journalist named Colleen. You answer.',
      speaker: { name: 'Colleen', role: 'local paper · writes everything herself' },
      dialogue: [
        'Colleen, from the Gazette. The grand final pie thing — is that real? Don’t answer, of course it’s real, I’ve seen the queue.',
        'I want the organiser angle: "Local teen runs the whole show." Photo by the goals, few quotes, out Thursday.',
        'Or I can write it off the Facebook comments, which I’d rather not, because Barbara’s in there.',
      ],
      prompt: 'Front page of a very small paper. Take the interview?',
      customTo: 'promo-6',
      options: [
        {
          id: 'share-spotlight',
          label: 'Do it — but make the photo the whole crew: Rosa, Marge, Mia, Macca. The story is the club, not you.',
          skill: 'Emotional Intelligence',
          response:
            'Colleen loves it more — "ensemble pieces write themselves." Thursday’s front page shows six people who now feel famous, and every one of them works twice as hard Saturday. Spotlight, invested.',
          to: 'promo-6',
          effects: { score: 2 },
        },
        {
          id: 'solo-interview',
          label: 'Take the interview solo — it’s efficient and the story lands either way.',
          skill: 'Self-direction',
          response:
            'A fine story with one face in it. The crew reads it Thursday; nobody says anything, which is how volunteers say something.',
          to: 'promo-6',
        },
        {
          id: 'no-comment',
          label: 'Politely decline — press before the event feels like a jinx.',
          skill: 'Judgement & Decision-Making',
          response:
            'Colleen writes it anyway, from the comments, as threatened. The piece is 60% accurate and 40% Barbara, and now it’s also the club’s official press coverage.',
          to: 'promo-6',
          effects: { score: -2 },
        },
      ],
    },
    'promo-6': {
      id: 'promo-6',
      kind: 'scene',
      stream: 'promo',
      eyebrow: 'The info post',
      narrative:
        'Hype gets people interested; INFORMATION gets them there. Gate times, parking, gold-coin entry, wet-weather plan — the boring post is the one three hundred people will actually screenshot.',
      prompt: 'The boring-but-vital post: how thorough?',
      customTo: 'HUB',
      options: [
        {
          id: 'everything-post',
          label: 'One pinned mega-post Friday: times, map, parking, entry, canteen menu, wet plan — screenshot-ready, pinned everywhere.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Saturday’s most-viewed content isn’t the pie — it’s your parking map. The gate queue moves like it’s been briefed, because it has. Word out: COMPLETELY.',
          to: 'HUB',
          effects: { stream: 'promo', status: 'sorted', score: 3 },
        },
        {
          id: 'times-only',
          label: 'Post times and entry fee — people can figure out the rest.',
          skill: 'Judgement & Decision-Making',
          response:
            'People figure out the rest by phoning the club, whose phone is you. Saturday morning you answer eleven versions of "where do we park, love?"',
          to: 'HUB',
        },
        {
          id: 'hype-enough',
          label: 'The hype IS the info — they know where the ground is.',
          skill: 'Self-direction',
          response:
            'They know where the ground is. They don’t know it’s gold-coin entry, so the gate becomes a coin-hunting ceremony, one car at a time, forever.',
          to: 'HUB',
          effects: { stream: 'promo', status: 'shaky', score: -3 },
        },
      ],
    },

    /* ---------------- SPONSOR ---------------- */
    'sponsor-1': {
      id: 'sponsor-1',
      kind: 'scene',
      stream: 'sponsor',
      eyebrow: 'The money problem',
      narrative:
        "Tom mentions, too casually, that the club account has $240 in it — and grand final day needs trophies, umpire fees, and a first-aid kit that isn't from 2019. The word he's avoiding is 'sponsor.'",
      prompt: 'The day needs money. Where does it come from?',
      customTo: 'sponsor-call',
      options: [
        {
          id: 'butcher-pitch',
          label: 'Pitch Sav the butcher in person — his kid plays under-12s, and his shopfront faces the ground.',
          skill: 'Leadership & Influence',
          response:
            "You practise the pitch twice outside his shop, then walk in during the quiet hour. Sav wipes his hands and listens with his arms crossed — which, you'll learn, is just how Sav listens. Then he picks up the phone to call you back properly.",
          to: 'sponsor-call',
          effects: { score: 4, status: 'underway', stream: 'sponsor' },
        },
        {
          id: 'sausage-day',
          label: 'Skip sponsors — run a pre-final sausage sizzle fundraiser Saturday.',
          skill: 'Self-direction',
          response:
            'It raises $310 and costs you a full day you did not have. Worth it? Ask the four other threads that needed you. Sav hears about it and rings you anyway: "Why didn\'t you just ASK me?"',
          to: 'sponsor-call',
          effects: { score: 0, status: 'underway', stream: 'sponsor', days: 1 },
        },
        {
          id: 'tom-problem',
          label: "Money's a committee problem. Hand it back to Tom.",
          skill: 'Judgement & Decision-Making',
          response:
            'Tom nods slowly, the way adults do when they\'re disappointed on a delay. "Righto. I\'ll see what I can scrape." Two days later he hands you a number that isn\'t enough — and Sav\'s number: "He asked about you."',
          to: 'sponsor-call',
          effects: { score: -3, status: 'underway', stream: 'sponsor', days: 2 },
        },
      ],
    },
    'sponsor-call': {
      id: 'sponsor-call',
      kind: 'call',
      stream: 'sponsor',
      eyebrow: 'On the phone',
      narrative: 'You called Sav. This is what Sav is saying:',
      speaker: { name: 'Sav', role: 'butcher · under-12s dad' },
      dialogue: [
        "So. The grand final. My shop, three hundred hungry people, fifty metres apart. I'm listening.",
        "Here's my offer: $400 cash for the day, snags at cost for the canteen — and my banner goes on the fence where the cameras can see it.",
        'One more thing. My boy Alfie is doing the coin toss. Non-negotiable. He practised.',
      ],
      prompt: 'A real offer, with strings. What do you say?',
      customTo: 'sponsor-3',
      options: [
        {
          id: 'deal-alfie',
          label: '"Deal — and Alfie doesn\'t just toss the coin, he walks out with the captains."',
          skill: 'Emotional Intelligence',
          response:
            "Sav's arms uncross down the phone line — you can hear it. \"...He'll lose his mind. Come get the cash Thursday.\" $400, cheap snags, one very rehearsed eight-year-old. Money: SORTED, with interest.",
          to: 'sponsor-3',
          effects: { stream: 'sponsor', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'negotiate-banner',
          label: 'Take it, but be straight: "The fence spot by the canteen is bigger — cameras favour the goals though. Your pick."',
          skill: 'Integrity & Ethics',
          response:
            "Sav respects the honesty and picks the canteen spot ('people buy pies, people see banner'). Same deal, cleaner terms, and he tells the bakery you're 'one of the straight ones.' Money: sorted.",
          to: 'sponsor-3',
          effects: { stream: 'sponsor', status: 'sorted', days: 1, score: 4 },
        },
        {
          id: 'too-many-strings',
          label: '"The coin toss is the league\'s call, not mine — I can\'t promise Alfie anything."',
          skill: 'Judgement & Decision-Making',
          response:
            "Technically true. Also the sound of $400 leaving the room. \"No worries,\" Sav says, in the tone that means worries. The trophies get downgraded and the first-aid kit stays vintage. Money: thin.",
          to: 'sponsor-3',
          effects: { stream: 'sponsor', status: 'shaky', days: 1, score: -5 },
        },
      ],
    },

    'sponsor-3': {
      id: 'sponsor-3',
      kind: 'scene',
      stream: 'sponsor',
      eyebrow: 'The budget',
      narrative:
        'Whatever money the day has, it now needs SPLITTING: trophies, umpire fees, the prehistoric first-aid kit, and a small "things will go wrong" buffer. Every dollar can only be spent once.',
      prompt: 'Split the budget how?',
      customTo: 'sponsor-4',
      options: [
        {
          id: 'needs-first',
          label: 'Safety and obligations first: first-aid kit and umpire fees locked, trophies get whatever’s left, keep a $50 buffer untouched.',
          skill: 'Judgement & Decision-Making',
          response:
            'Unsexy and correct. The trophies end up mid-range and nobody ever mentions it; the buffer gets spent Saturday on a megaphone battery, which briefly makes you a genius.',
          to: 'sponsor-4',
          effects: { score: 2 },
        },
        {
          id: 'trophies-first',
          label: 'Trophies first — kids keep them forever, everything else is plumbing.',
          skill: 'Emotional Intelligence',
          response:
            'The trophies are genuinely beautiful. The first-aid kit remains vintage, a fact you’ll think about exactly once on Saturday, at speed.',
          to: 'sponsor-4',
        },
        {
          id: 'spend-as-comes',
          label: 'No split — pay things as they come up, see what’s left.',
          skill: 'Self-direction',
          response:
            '"See what’s left" is a budget the way "see where we end up" is a map. The last invoice arrives to an account that’s already seen what was left.',
          to: 'sponsor-4',
          effects: { score: -2 },
        },
      ],
    },
    'sponsor-4': {
      id: 'sponsor-4',
      kind: 'talk',
      stream: 'sponsor',
      eyebrow: 'Tom · the thank-you plan',
      narrative:
        'Tom catches you stacking chairs and raises the thing committees always forget until it’s awkward: how the club actually THANKS the people funding the day.',
      speaker: { name: 'Tom', role: 'club president · been burned before' },
      dialogue: [
        'Two years ago we forgot to thank the tyre shop over the PA. They’d given us five hundred bucks. Never sponsored again.',
        'Whoever’s backing us this year — banner’s not enough. PA mentions, a photo with the cup, an invite to present something.',
        'Cheap to do, expensive to forget. Who owns it?',
      ],
      prompt: 'Gratitude, as infrastructure.',
      customTo: 'sponsor-5',
      options: [
        {
          id: 'thank-you-runsheet',
          label: 'You own it: PA scripts at quarter breaks, a trophy-presentation role, and a framed photo delivered Monday.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Gratitude with a run-sheet. Saturday the PA thanks the sponsor four times without sounding like an ad, and Monday’s framed photo goes straight up behind a counter, where it advertises the CLUB all year.',
          to: 'sponsor-5',
          effects: { score: 2 },
        },
        {
          id: 'pa-mention',
          label: 'A couple of PA mentions will do — nobody sponsors juniors for the glory.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Half true: they don’t do it for glory, they do it for BELONGING. Two mentions deliver the minimum, and the minimum is what gets reconsidered at next year’s budget.',
          to: 'sponsor-5',
        },
        {
          id: 'toms-job',
          label: '"That’s presidential work, Tom — you’ve got the voice for it."',
          skill: 'Self-direction',
          response:
            'Tom accepts, then forgets at the exact moment the tyre-shop story predicted — busy days eat good intentions. It gets remembered at the after-match, late, as an apology.',
          to: 'sponsor-5',
          effects: { score: -2 },
        },
      ],
    },
    'sponsor-5': {
      id: 'sponsor-5',
      kind: 'text',
      stream: 'sponsor',
      eyebrow: 'The bakery · Wednesday',
      narrative: 'The bakery — riding high on grand-final-pie fame — texts an offer nobody saw coming.',
      speaker: { name: 'Deb (bakery)', role: 'bakery owner · pie famous' },
      dialogue: [
        'That pie post has gone MENTAL. We want in properly — $100 for the day if the pie gets called "the official pie of the grand final" on the PA.',
        'Cash is in the till, you can grab it whenever.',
        'This all above board with your other sponsors? Don’t want a butcher war. This town remembers the Great Raffle Dispute.',
      ],
      prompt: 'Free money, possible butcher war.',
      customTo: 'sponsor-6',
      options: [
        {
          id: 'check-then-accept',
          label: 'Check with the main sponsor FIRST — pies and snags aren’t rivals — then accept with both blessings.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'One two-minute call prevents the butcher war before it exists — "pies aren’t snags, mate, take the money." $100 banked, two sponsors who both feel respected, zero raffle-style disputes.',
          to: 'sponsor-6',
          effects: { score: 2 },
        },
        {
          id: 'just-accept',
          label: 'Accept on the spot — $100 is $100 and it’s a pie, not a takeover.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The money’s real and the risk mostly isn’t — but the main sponsor hears "official pie" over the PA before hearing it from you, and files the sequence away.',
          to: 'sponsor-6',
        },
        {
          id: 'decline-bakery',
          label: 'Decline — one sponsor keeps things simple.',
          skill: 'Judgement & Decision-Making',
          response:
            'Simple, and $100 lighter, and the bakery’s pie energy — the best free marketing the day had — cools to room temperature.',
          to: 'sponsor-6',
          effects: { score: -1 },
        },
      ],
    },
    'sponsor-6': {
      id: 'sponsor-6',
      kind: 'scene',
      stream: 'sponsor',
      eyebrow: 'The money plan',
      narrative:
        'Grand final day will move more cash than the club sees in a month: gate tin, canteen till, sponsor money. Right now the plan for all of it is "pockets." One decision makes it a system.',
      prompt: 'Where does the money live on Saturday?',
      customTo: 'HUB',
      options: [
        {
          id: 'cash-system',
          label: 'A system: floats counted and signed out, one lockbox in the clubroom safe, cash cleared from tins hourly, Tom banks it Monday with a tally.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Boring, bulletproof, five minutes to set up. Sunday’s count matches Saturday’s tally to the dollar, and the treasurer — a man who has seen things — calls it "the cleanest grand final in club history." Money: MINDED.',
          to: 'HUB',
          effects: { stream: 'sponsor', status: 'sorted', score: 3 },
        },
        {
          id: 'trusted-pockets',
          label: 'Rosa holds canteen cash, Macca holds gate cash — trusted pockets, like always.',
          skill: 'Emotional Intelligence',
          response:
            'The pockets are genuinely trustworthy. The COUNT is the problem: three sums in three heads, reconciled from memory at the after-match, roughly.',
          to: 'HUB',
        },
        {
          id: 'sort-it-sunday',
          label: 'Collect everything at the end and count it Sunday — one job, once.',
          skill: 'Self-direction',
          response:
            'A full day of uncounted cash in moving containers. Nothing goes missing, probably — but "probably" is now the club’s accounting standard, and the treasurer develops a small twitch.',
          to: 'HUB',
          effects: { stream: 'sponsor', status: 'shaky', score: -3 },
        },
      ],
    },

    /* ---------------- UMPIRES ---------------- */
    'umpires-1': {
      id: 'umpires-1',
      kind: 'scene',
      stream: 'umpires',
      eyebrow: 'The officials',
      narrative:
        "Small detail, enormous consequence: no accredited umpires, no grand final. The league office assigns them — for a fee, from a roster that fills fast in finals season.",
      prompt: 'How do you make sure someone neutral is holding the whistle?',
      customTo: 'umpires-call',
      options: [
        {
          id: 'book-now',
          label: 'Ring the league office today and book the full crew before the roster fills.',
          skill: 'Judgement & Decision-Making',
          response:
            'The hold music is a flute version of a song you almost recognise. Eleven minutes later, Karen from fixtures picks up — and Karen, it turns out, is the most important phone call of your week.',
          to: 'umpires-call',
          effects: { score: 4, status: 'underway', stream: 'umpires' },
        },
        {
          id: 'parent-umps',
          label: 'Cheaper plan: two parents with umpiring backgrounds do it as a favour.',
          skill: 'Reasoning & Critical Thinking',
          response:
            "Cheaper, yes. Then you imagine a 50/50 free kick in the last minute, called by someone's DAD, and the hill's reaction. You ring the league office after all.",
          to: 'umpires-call',
          effects: { score: 0, status: 'underway', stream: 'umpires' },
        },
        {
          id: 'later-umps',
          label: "Umpires are a next-week problem. There's bigger fires today.",
          skill: 'Self-direction',
          response:
            "It's a next-week problem for you and forty other clubs, and the roster doesn't care whose fires were bigger. When you finally call, Karen's first words are: \"Cutting it fine, aren't we.\"",
          to: 'umpires-call',
          effects: { score: -3, status: 'underway', stream: 'umpires', days: 2 },
        },
      ],
    },
    'umpires-call': {
      id: 'umpires-call',
      kind: 'call',
      stream: 'umpires',
      eyebrow: 'On the phone',
      narrative: 'You called the league office. This is what Karen is saying:',
      speaker: { name: 'Karen', role: 'league fixtures · knows everything' },
      dialogue: [
        'Grand final crew, Westside. Let me look... you want the GOOD crew, which everybody wants.',
        "It's $180 for the three of them, invoice to the club, and I need the booking form back SIGNED today — not tomorrow, today.",
        "Between us: get them a decent lunch from that canteen of yours and they'll remember it. Umpires talk, love. About clubs, mostly.",
      ],
      prompt: 'Karen has the good crew on hold. Literally.',
      customTo: 'umpires-3',
      options: [
        {
          id: 'sign-today',
          label: 'Get Tom\'s signature within the hour and book the good crew — plus a note: "lunch is on the club."',
          skill: 'Self-direction',
          response:
            'You catch Tom at the hardware store and he signs on a paint tin. Form back by 2pm. Karen: "Good crew\'s yours. And I\'ll mention the lunch." Whistles: SORTED — by people with no cousins on either team.',
          to: 'umpires-3',
          effects: { stream: 'umpires', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'cheap-crew',
          label: '"$180 is steep — what\'s the budget crew like?"',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"Enthusiastic," Karen says, diplomatically. You save $60 and acquire an umpire who calls holding-the-ball like he\'s being paid per whistle. The hill will have opinions. Whistles: booked, budget.',
          to: 'umpires-3',
          effects: { stream: 'umpires', status: 'sorted', days: 1, score: 1 },
        },
        {
          id: 'form-tomorrow',
          label: '"The form\'s basically a formality — I\'ll send it back tomorrow."',
          skill: 'Judgement & Decision-Making',
          response:
            'Tomorrow, the good crew belongs to the seaside league. Karen finds you "a crew" — singular experience, plural nerves. Whistles: technically covered.',
          to: 'umpires-3',
          effects: { stream: 'umpires', status: 'shaky', days: 1, score: -5 },
        },
      ],
    },

    'umpires-3': {
      id: 'umpires-3',
      kind: 'scene',
      stream: 'umpires',
      eyebrow: 'The umpire kit',
      narrative:
        'Karen’s tip keeps echoing: "umpires talk, about clubs, mostly." What a crew remembers is the small stuff — a change room that locks, cold water at the breaks, and the lunch. Especially the lunch.',
      prompt: 'What does the umpires’ day look like?',
      customTo: 'umpires-4',
      options: [
        {
          id: 'proper-kit',
          label: 'Do it properly: cleared change room with a working lock, esky of water at the fence, and Rosa’s good lunch — plated, not bagged.',
          skill: 'Emotional Intelligence',
          response:
            'It costs the club maybe twenty dollars and one clean room. The crew notices everything — they always do — and a noticed kindness follows a club around the league for years.',
          to: 'umpires-4',
          effects: { score: 2 },
        },
        {
          id: 'water-lunch',
          label: 'Water and a canteen voucher — generous enough.',
          skill: 'Judgement & Decision-Making',
          response:
            'Perfectly adequate, which is precisely the word the crew will use about your club at their next five games.',
          to: 'umpires-4',
        },
        {
          id: 'theyre-paid',
          label: 'They’re getting $180 — that IS the hospitality.',
          skill: 'Self-direction',
          response:
            'They’re paid to umpire, not to change in a storeroom that smells of line-marking paint. Fair isn’t the same as remembered, and umpires deal exclusively in remembered.',
          to: 'umpires-4',
          effects: { score: -2 },
        },
      ],
    },
    'umpires-4': {
      id: 'umpires-4',
      kind: 'text',
      stream: 'umpires',
      eyebrow: 'Karen · Thursday',
      narrative: 'Karen texts with the crisp finality of a woman closing out her week’s fixtures.',
      speaker: { name: 'Karen', role: 'league fixtures · sends the fine print' },
      dialogue: [
        'Crew details: arriving 11:15, three of them, chief is Errol. Park them near the rooms, they hate carrying bags.',
        'IMPORTANT: Errol wants team sheets 45 MINUTES before the bounce, signed, both clubs. He’s failed finals over late sheets before. He enjoys it.',
        'Forward this to both coaches NOW, not Saturday. You’ve been warned, love.',
      ],
      prompt: 'Errol and his forty-five minutes.',
      customTo: 'umpires-5',
      options: [
        {
          id: 'forward-confirm',
          label: 'Forward to both coaches immediately and require a "got it" reply from each — then diarise a Saturday 11am chase.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Both "got it"s land within the hour, and Saturday’s 11am chase catches the away coach mid-forgetting. Sheets reach Errol at 12:40 for a 1:30 bounce. He looks almost disappointed.',
          to: 'umpires-5',
          effects: { score: 2 },
        },
        {
          id: 'forward-only',
          label: 'Forward it to both coaches — job done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Sent is not the same as landed. Your coach replies; the away coach’s read receipt sits there like a bad omen with a timestamp.',
          to: 'umpires-5',
        },
        {
          id: 'saturday-remind',
          label: 'You’ll remind everyone on the day — Thursday’s for real problems.',
          skill: 'Self-direction',
          response:
            'Saturday’s reminder finds the away coach mid-warm-up, sheetless, and Errol checking his watch with visible joy. The bounce moves seven minutes for a piece of paper.',
          to: 'umpires-5',
          effects: { score: -2 },
        },
      ],
    },
    'umpires-5': {
      id: 'umpires-5',
      kind: 'talk',
      stream: 'umpires',
      eyebrow: 'The coaches',
      narrative:
        'Both coaches, one clubroom, Thursday night — your idea. Finals bring out the lawyer in every coach, and the things they agree on BEFORE Saturday are the things that can’t blow up DURING it.',
      speaker: { name: 'Coach Reynolds', role: 'your coach · reasonable until provoked' },
      dialogue: [
        'Righto, since you’ve got us both here. Interchange steward — whose volunteer? Timekeeper — whose stopwatch? And who talks to the umpires if it gets spicy?',
        'Because last year at Eastside, nobody agreed any of that, and it got sorted at half time. Loudly. Near a camera.',
        'Your meeting, captain. Chair it.',
      ],
      prompt: 'Three questions that explode if left until Saturday.',
      customTo: 'umpires-6',
      options: [
        {
          id: 'chair-it',
          label: 'Chair it properly: one neutral steward each way, timekeeper shared, and ONLY the captains speak to umpires. Written up, texted to both.',
          skill: 'Leadership & Influence',
          response:
            'Fifteen minutes, three agreements, two coaches mildly impressed at being managed. The follow-up text makes it official. Saturday’s spice now has nowhere to live.',
          to: 'umpires-6',
          effects: { score: 2 },
        },
        {
          id: 'let-them-sort',
          label: 'Let the two coaches thrash it out between themselves — you take notes.',
          skill: 'Emotional Intelligence',
          response:
            'They land somewhere workable after some ancestral grievances air out. The notes help. The meeting runs forty minutes longer than it needed a chair.',
          to: 'umpires-6',
        },
        {
          id: 'league-rules',
          label: '"The league rulebook covers all this — just follow it."',
          skill: 'Reasoning & Critical Thinking',
          response:
            'It does cover it, on page forty-something, which neither coach has read since 2019. Rulebooks don’t chair meetings, and Saturday inherits the ambiguity.',
          to: 'umpires-6',
          effects: { score: -2 },
        },
      ],
    },
    'umpires-6': {
      id: 'umpires-6',
      kind: 'scene',
      stream: 'umpires',
      eyebrow: 'The escort plan',
      narrative:
        'Last officials job: the day itself. Someone meets the crew at the gate, walks them at half time through a crowd with opinions, and hands over the match paperwork at the end. Or nobody does, and they fend for themselves.',
      prompt: 'Who owns the umpires on the day?',
      customTo: 'HUB',
      options: [
        {
          id: 'name-an-owner',
          label: 'Give them a named owner all day: Priya meets, escorts, and handles paperwork — introduced to Errol by text beforehand.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Errol arrives to a handshake with his name in it and a person whose whole job is his crew’s day. "Well-run club," he tells Karen on Monday — four words that outlast the season. Whistles: LOOKED AFTER.',
          to: 'HUB',
          effects: { stream: 'umpires', status: 'sorted', score: 3 },
        },
        {
          id: 'youll-cover',
          label: 'You’ll meet them yourself and keep half an eye out all day.',
          skill: 'Self-direction',
          response:
            'Your half an eye is oversubscribed. The 11:15 arrival collides with a canteen question and the crew waits eight minutes at a locked gate, quietly grading you.',
          to: 'HUB',
        },
        {
          id: 'grown-adults',
          label: 'They’re professionals at a footy ground — they’ll manage.',
          skill: 'Judgement & Decision-Making',
          response:
            'They manage. They also walk to their cars at half time through a hill that’s three snags deep into strong opinions, unescorted, and Errol’s Monday report has a paragraph in it now.',
          to: 'HUB',
          effects: { stream: 'umpires', status: 'shaky', score: -3 },
        },
      ],
    },

    /* ---------------- COMPLICATIONS ---------------- */
    'comp-storm': {
      id: 'comp-storm',
      kind: 'scene',
      eyebrow: 'Complication · the forecast turns',
      narrative:
        "You've earned a quiet evening, so naturally the forecast changes: 40% chance of storms Saturday afternoon. The ground is locked, the plans are moving — but the sky has opinions. Tom forwards you the radar with one word: \"Thoughts?\"",
      prompt: 'The day is built. Now weatherproof it — or don’t.',
      customTo: 'finale',
      options: [
        {
          id: 'wet-plan',
          label: 'Build the wet-weather plan with Marge tonight: covered areas, tarps for the canteen, a 30-minute-earlier start agreed with the league.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Marge answers on the fifth ring, listens, and says the six best words of your week: "I\'ve got tarps. Come Friday." The league approves the earlier start. If the sky behaves, nobody notices your plan. If it doesn\'t, everybody will.',
          to: 'finale',
          effects: { score: 8, days: 1 },
        },
        {
          id: 'watch-radar',
          label: '40% means 60% fine. Watch the radar, decide Saturday morning.',
          skill: 'Judgement & Decision-Making',
          response:
            'You sleep with the radar app open. Saturday dawns undecided, and every call you might need to make is still unmade — just later, with less time.',
          to: 'finale',
          effects: { score: -4 },
        },
        {
          id: 'early-start',
          label: 'Just move the start 30 minutes earlier and tell everyone tonight.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            "Half a plan is better than none. The league approves it; Mia's announcement post does the rounds. The canteen tarps, though, stay un-thought-of.",
          to: 'finale',
          effects: { score: 3 },
        },
      ],
    },
    'comp-venue': {
      id: 'comp-venue',
      kind: 'scene',
      eyebrow: 'Complication · the ground fight',
      narrative:
        "It lands on a Tuesday: the pennant squad's manager got their booking IN WRITING, and yours never was. Officially, they have Saturday morning at your ground. Tom's voicemail is calm the way dads are calm when things are not calm.",
      prompt: 'The ground you assumed was yours, isn’t. Fix it.',
      customTo: 'finale',
      options: [
        {
          id: 'beg-league',
          label: 'Get to the league office in person with Tom — a grand final outranks a training run, make them say it officially.',
          skill: 'Leadership & Influence',
          response:
            "Twenty awkward minutes and one printed fixture later, the league agrees the grand final takes precedence — pennant squad shifts to Sunday, unhappily. You got the ground back. You also learned what 'in writing' is for.",
          to: 'finale',
          effects: { score: 5, days: 1 },
        },
        {
          id: 'afternoon-final',
          label: 'Sidestep the fight: move the grand final to the afternoon slot.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Workable — but every plan built for morning (canteen peak, umpire booking, Mia\'s posts) now needs re-doing in four days, and afternoon is when the weather usually turns.',
          to: 'finale',
          effects: { score: 0, days: 2 },
        },
        {
          id: 'share-ground',
          label: '"They can train on the half we\'re not using while we set up. Everyone wins?"',
          skill: 'Judgement & Decision-Making',
          response:
            'Nobody wins. Setup happens around flying footballs, Marge threatens to lock EVERYONE out, and the pennant manager narrates your morning like a critic. The day starts frayed.',
          to: 'finale',
          effects: { score: -5 },
        },
      ],
    },

    /* ---------------- FINALE ---------------- */
    finale: {
      id: 'finale',
      kind: 'scene',
      eyebrow: 'Grand final day · 7:10am',
      narrative:
        "The morning of. Fresh lines on the grass. Cars already nosing into the carpark two hours early. Whatever's sorted is sorted; whatever isn't is about to introduce itself. Tom finds you by the gate and hands you a coffee: \"Big day, boss.\"",
      prompt: 'Last call of the project. How do you spend the final hour before gates?',
      customTo: 'END',
      options: [
        {
          id: 'walk-ground',
          label: 'Walk the whole ground with the clipboard — every station, every person, one final check.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            "You find three small problems on the walk — a missing bin, a scoreboard cable, a lost umpire — and fix all three before they become anyone's day. The gates open on time to a ground that looks... ready. Because it is.",
          to: 'END',
          effects: { score: 6 },
        },
        {
          id: 'help-canteen',
          label: 'Jump on the canteen line for the morning rush — lead from the till.',
          skill: 'Emotional Intelligence',
          response:
            "Rosa hands you an apron without a word, which from Rosa is a hug. You see the day the way the volunteers see it — and they see you seeing it. The small problems out on the ground, though, solve themselves slowly or not at all.",
          to: 'END',
          effects: { score: 3 },
        },
        {
          id: 'hand-to-tom',
          label: 'Hand Tom the clipboard: "Your club, your day. I\'m going to go watch the footy."',
          skill: 'Judgement & Decision-Making',
          response:
            "Tom blinks, laughs, and takes it. Fair enough — you built the machine. But machines need drivers, and twice that morning someone runs past you carrying a problem that used to be yours.",
          to: 'END',
          effects: { score: -3 },
        },
      ],
    },
  },
  threadsBeforeFinale: 3,
  complication: { checkStream: 'venue', whenSorted: 'comp-storm', otherwise: 'comp-venue' },
  finale: 'finale',
  endings: {
    high: {
      title: 'The best grand final this club has ever run.',
      body: "The siren goes and the hill ROARS. Every thread you touched held, and everyone can feel it — the day runs like something that was DECIDED into existence, call by call, because it was. Tom finds you at the fence: \"Committee wants you running the whole season next year. I told them you'd say yes.\"{neglectLine}",
    },
    mid: {
      title: 'A real grand final. It held together.',
      body: "The day happens — footy gets played, snags get eaten, nobody riots. You can see the seams only because you built them: the thread that got patched instead of sorted, the call you returned a day late. Tom shakes your hand: \"Bloody good job.\" He means it. You know where the next ten percent lives.{neglectLine}",
    },
    low: {
      title: 'The footy happened. The day fought you the whole way.',
      body: "Somehow, two teams played a grand final in the middle of everything going sideways — the scramble, the queues, the problems arriving in the exact order you'd left them. Volunteers carried what the plan didn't. Tom hands you a lukewarm coffee at the siren: \"Rough one. You'll want another crack at this.\" He's right. And the map of exactly what to do differently is already in your head.{neglectLine}",
    },
  },
}

/** Streams the player never engaged with, woven into the ending. */
export function neglectLine(neglected: string[]): string {
  if (neglected.length === 0) return ''
  const list =
    neglected.length === 1
      ? neglected[0]
      : neglected.slice(0, -1).join(', ') + ' and ' + neglected[neglected.length - 1]
  return ` The parts nobody touched — ${list} — got improvised on the day by people covering for the plan.`
}
