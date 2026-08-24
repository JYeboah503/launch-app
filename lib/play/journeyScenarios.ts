/**
 * Journey scenarios — the school-platform path. Gentle, real-life,
 * goal-driven activities for younger students (Years 8–11).
 *
 * Shape (per Jojo, 1 Aug 2026): a journey is ONE continuous activity —
 * like running a project in The Sims — not a series of unrelated
 * questions. Every journey:
 *   1. opens with a clear activity ("run the school footy carnival")
 *   2. beat one: the player CHOOSES their objective — what a win looks like
 *   3. beats two–five: a congruent chain of events, in timeline order,
 *      where each scene follows from the last and every decision moves
 *      the goal meter
 *   4. the ENDING is tiered (outcomeTiers): how the day lands is decided
 *      by the sum of their calls — high / mid / low
 *
 * Same Scenario shape as the work scenarios so the existing play engine
 * runs them unchanged: the goal meter IS the objective tracker, live
 * factors show the state of the day evolving, and echoes carry each
 * choice into the next scene.
 *
 * The student NEVER sees a test. Language stays student-facing: mates,
 * mornings, canteens — never KPIs.
 */

import type { Scenario } from '@/lib/play/types'

/* ------------------------------------------------------------------ */
/* 1 · FOOTY — Run the school footy carnival                           */
/* ------------------------------------------------------------------ */

export const FOOTY_JOURNEY: Scenario = {
  id: 'journey-footy',
  role: 'Run the school footy carnival',
  meta: 'THREE WEEKS · ONE CARNIVAL · YOUR CALL',
  goal: { label: 'CARNIVAL DAY', target: 70 },
  opening: {
    eyebrow: 'Your activity',
    title: 'The school footy carnival is three weeks away. This year, it’s yours to run.',
    body: "Mr Kelly hands you the folder at recess, {name}. Eight teams, one oval, a canteen, and a date that doesn't move. Everything else — how it runs, what it's for, what people remember — is up to you. First call: what does a win look like?",
    imageCaption: 'The oval · three weeks out',
    ambient: [
      { label: 'WEEKS LEFT', value: '3' },
      { label: 'TEAMS IN', value: '8' },
      { label: 'BUDGET', value: '$150 float' },
    ],
  },
  steps: [
    {
      kind: 'decision',
      mood: 'private',
      transition: 'cross-fade',
      eyebrow: 'Three weeks out · the empty oval',
      scene: 'whiteboard',
      sceneCaption: 'A folder, a blank runsheet, and you',
      prompt: 'Before anything gets booked, you have to pick what this carnival is FOR. Everything you decide after this bends toward it.',
      factors: [
        { label: 'MR KELLY', value: '"your call, captain"' },
        { label: 'THE FOLDER', value: 'last year’s runsheet' },
        { label: 'THE DATE', value: 'locked' },
      ],
      options: [
        {
          id: 'obj-everyone',
          label: 'Objective: every single kid gets real game time — including the ones never picked.',
          skill: 'Leadership & Influence',
          score: 0,
          echo: 'Objective locked: every kid plays. Now every roster call has a reason.',
          consequence: 'You write it at the top of the runsheet. Rosters just got harder — and mattered more.',
          stats: [
            { label: 'OBJECTIVE', change: 'every kid plays' },
            { label: 'ROSTERS', change: 'now the hard part' },
          ],
          insight: 'Choosing people over polish is a leadership call. The day now has a soul.',
        },
        {
          id: 'obj-crowd',
          label: 'Objective: pack the sideline — make it the loudest day the school’s ever had.',
          skill: 'Judgement & Decision-Making',
          score: 0,
          echo: 'Objective locked: pack the sideline. Every choice now feeds the atmosphere.',
          consequence: 'Posters, music, a half-time kicking comp. The runsheet starts to look like a show.',
          stats: [
            { label: 'OBJECTIVE', change: 'biggest crowd ever' },
            { label: 'RUNSHEET', change: 'part footy, part show' },
          ],
        },
        {
          id: 'obj-jerseys',
          label: 'Objective: raise enough at the canteen to buy the juniors new jerseys.',
          skill: 'Reasoning & Critical Thinking',
          score: 0,
          echo: 'Objective locked: $900 for junior jerseys. The canteen just became your engine room.',
          consequence: 'You do the maths on a sausage sizzle. It works — barely — if nothing goes wrong.',
          stats: [
            { label: 'OBJECTIVE', change: '$900 for jerseys' },
            { label: 'CANTEEN', change: 'the engine room' },
          ],
          ghost: 'A number is a brave objective. Everyone can see if you hit it.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'whip-right',
      eyebrow: 'Two weeks out · the budget meeting',
      scene: 'press',
      sceneCaption: 'The front office, Tuesday lunch',
      prompt: "The office says the oval hire ate the float — you have $40 left for everything else. Your objective doesn't change. Your plan has to.",
      factors: [
        { label: 'BUDGET', value: '$40 left' },
        { label: 'NEEDED', value: 'BBQ, bibs, first-aid' },
        { label: 'WEEKS LEFT', value: '2' },
      ],
      options: [
        {
          id: 'sponsor',
          label: 'Walk to the butcher on Main St and pitch a sponsorship — snags for a banner spot.',
          skill: 'Leadership & Influence',
          score: 9,
          echo: 'You pitched the butcher — and walked out with donated snags and a handshake.',
          consequence: "He says yes before you finish. \"My kid's in Year 8. Put the banner near the canteen.\" Budget problem: gone.",
          stats: [
            { label: 'BUDGET', change: 'saved by the butcher' },
            { label: 'YOU', change: 'made the ask' },
          ],
          insight: 'You asked for something real from a real adult. That is the whole skill.',
        },
        {
          id: 'trim',
          label: 'Cut the extras — no music, no kicking comp. Protect the games themselves.',
          skill: 'Judgement & Decision-Making',
          score: 3,
          echo: 'You trimmed the frills and protected the footy. Safe — the day survives, smaller.',
          consequence: 'The runsheet gets leaner. Nothing breaks, but the day loses some of its shine.',
          stats: [
            { label: 'BUDGET', change: 'balanced' },
            { label: 'THE DAY', change: 'smaller than planned' },
          ],
        },
        {
          id: 'spend',
          label: 'Spend the $40 on posters anyway — a big crowd will fix the money later.',
          skill: 'Adaptability & Cognitive Flexibility',
          score: -7,
          echo: 'You gambled the last $40 on posters. Now there’s no float for the BBQ.',
          consequence: 'The posters look great. The canteen has no starting cash, and you’re two weeks out with $0.',
          stats: [
            { label: 'BUDGET', change: '$0' },
            { label: 'RISK', change: 'live and growing' },
          ],
          ghost: 'Hope is not a float.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'private',
      transition: 'iris-in',
      eyebrow: 'One week out · rosters',
      scene: 'locker',
      sceneCaption: 'Team sheets on the library table',
      prompt: "Rosters are due. Marcus — never picked for anything, been to every working bee — asks quietly if he'll actually get a game. Two captains want him benched.",
      factors: [
        { label: 'MARCUS', value: 'waiting on your answer' },
        { label: 'CAPTAINS', value: 'want to win' },
        { label: 'TEAM SHEETS', value: 'due 3pm' },
      ],
      options: [
        {
          id: 'rotate',
          label: 'Build rotations into the rules: everyone plays at least two full quarters. Non-negotiable.',
          skill: 'Integrity & Ethics',
          score: 9,
          echo: 'You made game time a RULE, not a favour. Marcus is on the sheet in ink.',
          consequence: "The captains grumble for a day, then build around it. Marcus starts training at lunch. Something shifts in Year 8.",
          stats: [
            { label: 'MARCUS', change: 'two quarters, in ink' },
            { label: 'THE RULES', change: 'protect everyone' },
          ],
          insight: 'Rules beat favours. A favour helps Marcus once — a rule helps every Marcus after him.',
        },
        {
          id: 'promise',
          label: 'Promise Marcus a game privately, but leave the sheets to the captains.',
          skill: 'Emotional Intelligence',
          score: 2,
          echo: 'You promised Marcus privately — and left the power with the captains.',
          consequence: "Marcus smiles. But on the day, his game time depends on a captain remembering your quiet deal.",
          stats: [
            { label: 'MARCUS', change: 'has your word' },
            { label: 'THE SHEETS', change: 'captains’ call' },
          ],
        },
        {
          id: 'defer',
          label: 'Winning matters — let the captains pick their strongest sides all day.',
          skill: 'Judgement & Decision-Making',
          score: -6,
          echo: 'You backed the captains. The strongest sides play — and Marcus watches.',
          consequence: 'The games will be sharper. The sideline will have kids on it who came to play and never will.',
          stats: [
            { label: 'THE FOOTY', change: 'sharper' },
            { label: 'THE SIDELINE', change: 'kids in uniforms, waiting' },
          ],
          ghost: 'Whatever your objective was — someone remembers this carnival forever. Which version?',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'drop-slam',
      eyebrow: 'The night before · 9:40pm',
      scene: 'tunnel',
      sceneCaption: 'Rain on the window, phone buzzing',
      prompt: "The forecast turns: 80% rain from 1pm. The canteen roster just lost two parents. Your phone is full of \"what do we do?\" — and everyone means YOU.",
      factors: [
        { label: 'FORECAST', value: 'rain from 1pm' },
        { label: 'CANTEEN', value: '2 parents down' },
        { label: 'YOUR PHONE', value: '11 unread' },
      ],
      options: [
        {
          id: 'compress',
          label: 'Rebuild the runsheet tonight: shorter games, finals before 1pm, canteen peaks early.',
          skill: 'Situational Awareness & Systems Thinking',
          score: 10,
          echo: 'You rebuilt the whole day around the weather — finals done before the rain lands.',
          consequence: "It takes until midnight. New runsheet in the group chat by 7am: tighter games, early finals, canteen blitz at morning tea. People reply with thumbs up. They needed someone to decide.",
          stats: [
            { label: 'RUNSHEET', change: 'rain-proofed' },
            { label: 'THE GROUP CHAT', change: 'calm restored' },
          ],
          insight: 'You moved the plan to meet reality instead of hoping reality would move.',
        },
        {
          id: 'push-on',
          label: "Hold the plan. Forecasts change — you're not rebuilding everything on an 80%.",
          skill: 'Judgement & Decision-Making',
          score: -6,
          echo: 'You held the original plan and bet against the sky.',
          consequence: 'You sleep fine. But the runsheet still has the finals at 2pm, and the radar hasn’t blinked.',
          stats: [
            { label: 'PLAN', change: 'unchanged' },
            { label: 'THE SKY', change: 'not negotiating' },
          ],
        },
        {
          id: 'delegate',
          label: 'Ring Mr Kelly and hand him the weather call — he’s the adult.',
          skill: 'Emotional Intelligence',
          score: 1,
          echo: 'You handed the weather call to Mr Kelly.',
          consequence: '"I\'ll back whatever you decide," he says, and hands it straight back. Some calls come with the folder.',
          stats: [
            { label: 'THE CALL', change: 'still yours' },
            { label: 'TIME LOST', change: '20 minutes' },
          ],
          ghost: 'Asking for help is strong. Handing back the wheel is different.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'loud',
      transition: 'zoom-punch',
      eyebrow: 'Carnival day · 12:50pm',
      scene: 'court',
      sceneCaption: 'First drops. Grand final about to start.',
      prompt: "It's here — the sky goes dark ten minutes before the grand final. Kids are buzzing, parents are eyeing the carpark, and the umpire looks at you: play it, shorten it, or call it?",
      factors: [
        { label: 'RAIN', value: 'first drops' },
        { label: 'THE FINAL', value: 'about to start' },
        { label: 'EVERYONE', value: 'looking at you' },
      ],
      options: [
        {
          id: 'shorten',
          label: 'Two ten-minute halves, starting NOW. A real final, finished before it buckets.',
          skill: 'Judgement & Decision-Making',
          score: 9,
          echo: 'You shortened the final and started it instantly — a real ending, beaten rain.',
          consequence: "The siren beats the downpour by four minutes. Kids are muddy, screaming, thrilled. It's the final everyone retells.",
          stats: [
            { label: 'THE FINAL', change: 'played and won' },
            { label: 'THE RAIN', change: 'beaten by 4 min' },
          ],
          insight: 'You changed the shape of the thing to save the heart of it.',
        },
        {
          id: 'full',
          label: 'Play the full final. Mud is part of footy.',
          skill: 'Self-direction',
          score: -5,
          echo: 'You played the full final into the weather.',
          consequence: "By half-time it's sheeting down. Parents pull kids mid-game, the second half is seven-a-side, and the trophy is handed over in the gym.",
          stats: [
            { label: 'SECOND HALF', change: 'seven-a-side' },
            { label: 'TROPHY', change: 'handed over in the gym' },
          ],
        },
        {
          id: 'call-it',
          label: 'Call it now — joint premiers, everyone under cover, nobody hurt.',
          skill: 'Integrity & Ethics',
          score: 3,
          echo: 'You called it early — joint premiers, everyone dry.',
          consequence: "Safe, defensible, a bit hollow. Two captains hold one trophy for the photo, and both smiles are half-size.",
          stats: [
            { label: 'EVERYONE', change: 'dry and safe' },
            { label: 'THE ENDING', change: 'shared, unfinished' },
          ],
        },
      ],
    },
  ],
  outcome: {
    eyebrow: 'The carnival, after',
    title: 'The oval empties. The story starts.',
    body: 'However it went — you ran it. Eight teams, one day, a hundred small calls, and yours were the ones that shaped it.',
  },
  outcomeTiers: {
    high: {
      eyebrow: 'The carnival, after',
      title: 'They’ll be talking about this one for years.',
      body: "The butcher's banner, Marcus's second quarter, a grand final that beat the rain by four minutes. Mr Kelly finds you stacking chairs: \"Same job next year?\" You ran a day that worked BECAUSE of your calls — every one of them is in the story people are already retelling.",
    },
    mid: {
      eyebrow: 'The carnival, after',
      title: 'It happened. Most of it worked.',
      body: "The games ran, the canteen fed people, and the rough patches — the ones your gutsier calls could have smoothed — got absorbed by goodwill. A solid carnival. Somewhere in the day you can see exactly which two decisions would have made it a great one.",
    },
    low: {
      eyebrow: 'The carnival, after',
      title: 'The day survived you. Just.',
      body: "Rain in the second half, a canteen with no float, kids who never got a game. People were kind about it — they always are — but walking the empty oval you can trace every wobble back to a call you'd take back. That's not failure. That's the exact map for next time.",
    },
  },
  reflect: {
    asker: 'Mr Kelly, leaning on the fence',
    prompt: 'Interesting choice of objective. Out of everything a carnival could be — why that?',
  },
}

/* ------------------------------------------------------------------ */
/* 2 · SURF — Run the grom comp at the point                           */
/* ------------------------------------------------------------------ */

export const SURF_JOURNEY: Scenario = {
  id: 'journey-surf',
  role: 'Run the grom comp at the point',
  meta: 'SATURDAY · THE POINT · YOUR COMP',
  goal: { label: 'COMP DAY', target: 70 },
  opening: {
    eyebrow: 'Your activity',
    title: 'The club just handed you the grom comp. Twenty kids, one bank, Saturday.',
    body: "Deano from the boardriders catches you after training, {name}: \"You're running the grom comp this year. Heats, safety, the lot.\" Twenty kids under 14, parents on the sand, and a point break that doesn't care about any of it. First: what kind of day are you building?",
    imageCaption: 'The point · Tuesday check',
    ambient: [
      { label: 'GROMS ENTERED', value: '20' },
      { label: 'FORECAST', value: '3-4ft Saturday' },
      { label: 'HELPERS', value: 'you + 2 seniors' },
    ],
  },
  steps: [
    {
      kind: 'decision',
      mood: 'private',
      transition: 'cross-fade',
      eyebrow: 'Tuesday · the clubhouse',
      scene: 'beach',
      sceneCaption: 'Entry list on the fridge door',
      prompt: 'Twenty names on the fridge. Before you draw a single heat, decide what Saturday is actually for.',
      factors: [
        { label: 'DEANO', value: '"your comp now"' },
        { label: 'ENTRIES', value: '8 first-timers' },
        { label: 'THE BANK', value: 'working, shifty' },
      ],
      options: [
        {
          id: 'obj-first-timers',
          label: 'Objective: all eight first-timers paddle out AND come in smiling.',
          skill: 'Emotional Intelligence',
          score: 0,
          echo: 'Objective locked: every first-timer finishes their heat smiling.',
          consequence: 'You mark the eight names with a dot. The whole runsheet will bend around those dots.',
          stats: [
            { label: 'OBJECTIVE', change: '8 first heats, 8 smiles' },
            { label: 'HEAT DRAW', change: 'built around the dots' },
          ],
          insight: 'A comp that grows surfers beats a comp that ranks them.',
        },
        {
          id: 'obj-clean',
          label: 'Objective: run it so clean the club hands you the OPEN next year.',
          skill: 'Self-direction',
          score: 0,
          echo: 'Objective locked: flawless operation — heats on time, zero chaos.',
          consequence: 'You draw the heat board like a timetable. On time becomes your religion.',
          stats: [
            { label: 'OBJECTIVE', change: 'flawless day' },
            { label: 'THE BOARD', change: 'timed to the minute' },
          ],
        },
        {
          id: 'obj-safe',
          label: 'Objective: whatever happens, every grom comes in safe. Everything else is bonus.',
          skill: 'Judgement & Decision-Making',
          score: 0,
          echo: 'Objective locked: safety is the scoreboard.',
          consequence: 'You ring the SLSC about water cover before you draw a single heat. Priorities, set.',
          stats: [
            { label: 'OBJECTIVE', change: 'everyone in safe' },
            { label: 'FIRST CALL', change: 'water safety' },
          ],
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'whip-right',
      eyebrow: 'Thursday · forecast flip',
      scene: 'whiteboard',
      sceneCaption: 'The swell chart just jumped',
      prompt: "The forecast jumps: Saturday is now 4-5ft with a morning high tide swamping the kids' bank. The safe window is 7–10am. Your heat board says 8am–2pm.",
      factors: [
        { label: 'NEW FORECAST', value: '4-5ft' },
        { label: 'SAFE WINDOW', value: '7–10am only' },
        { label: 'YOUR BOARD', value: 'runs to 2pm' },
      ],
      options: [
        {
          id: 'compress-heats',
          label: 'Compress everything: 15-minute heats, first horn at 7 sharp, done by 10.',
          skill: 'Situational Awareness & Systems Thinking',
          score: 9,
          echo: 'You compressed the whole comp into the safe window — done by 10am.',
          consequence: "You redraw the board Thursday night and message every parent: \"EARLY start, early finish.\" It's tight, it's doable, and it happens inside the good water.",
          stats: [
            { label: 'HEAT BOARD', change: 'rebuilt for the window' },
            { label: 'PARENTS', change: 'notified Thursday' },
          ],
          insight: 'You read the ocean and moved the comp — not the other way round.',
        },
        {
          id: 'move-beachie',
          label: 'Move the whole comp to the beachie — smaller, safer, worse waves.',
          skill: 'Judgement & Decision-Making',
          score: 3,
          echo: 'You moved the comp to the beachie — safe, but soft.',
          consequence: "The older groms groan — the beachie is a closeout. But it holds any tide, and nobody's parents are pacing the sand.",
          stats: [
            { label: 'VENUE', change: 'the beachie' },
            { label: 'WAVE QUALITY', change: 'meh' },
          ],
        },
        {
          id: 'hold-board',
          label: 'Keep the board as drawn — the forecast has been wrong all week.',
          skill: 'Adaptability & Cognitive Flexibility',
          score: -7,
          echo: 'You kept the original board and bet against the swell chart.',
          consequence: 'Friday night the buoy readings come in exactly as forecast. Your afternoon heats are now scheduled into serious water.',
          stats: [
            { label: 'THE BOARD', change: 'unchanged' },
            { label: 'THE BUOY', change: 'agreeing with the chart' },
          ],
          ghost: 'The ocean doesn’t read your runsheet.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'private',
      transition: 'iris-in',
      eyebrow: 'Friday · the older crew',
      scene: 'locker',
      sceneCaption: 'Three seniors at the rack',
      prompt: "Three older boardriders corner you: they want the point from 9–10am for a \"proper surf\" — right through your last heats. They're the guys who taught you to surf.",
      factors: [
        { label: 'THE SENIORS', value: 'calling in a favour' },
        { label: 'YOUR HEATS', value: '9–10am, on the point' },
        { label: 'HISTORY', value: 'they taught you' },
      ],
      options: [
        {
          id: 'recruit',
          label: 'Counter-offer: surf 7–8am, then be my water safety till 10. Groms get heroes in the lineup.',
          skill: 'Leadership & Influence',
          score: 9,
          echo: 'You turned the seniors from a problem into your water-safety crew.',
          consequence: "They look at each other and shrug: \"Yeah, alright.\" Saturday now has three strong paddlers shadowing the grom heats — and the groms get to share water with their heroes.",
          stats: [
            { label: 'SENIORS', change: 'water safety, signed on' },
            { label: 'GROMS', change: 'heroes in the lineup' },
          ],
          insight: 'The best answer to a competing want is a bigger shared one.',
        },
        {
          id: 'hold-line',
          label: 'Straight no: the point is the comp’s from 7 till 10. See you at 10:01.',
          skill: 'Integrity & Ethics',
          score: 4,
          echo: 'You held the line — the point belongs to the groms till 10.',
          consequence: "One of them mutters, two of them respect it. The bank stays clear. The favour account runs a little lower.",
          stats: [
            { label: 'THE POINT', change: 'groms only till 10' },
            { label: 'FAVOUR ACCOUNT', change: 'debited' },
          ],
        },
        {
          id: 'share-peak',
          label: 'Let them surf the far peak during heats — should be fine, probably.',
          skill: 'Emotional Intelligence',
          score: -6,
          echo: 'You let the seniors share the water with the heats. "Should be fine."',
          consequence: "Saturday 9:15: a senior takes off inside a first-timer's wave, and the kid's mum is at your elbow before he surfaces.",
          stats: [
            { label: 'THE LINEUP', change: 'contested' },
            { label: 'ONE MUM', change: 'at your elbow' },
          ],
          ghost: '"Probably fine" is a plan with a hole in it.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'drop-slam',
      eyebrow: 'Saturday 8:40am · the rip',
      scene: 'beach',
      sceneCaption: 'Heat five paddling out',
      prompt: "Mid-comp, the bank shifts and a rip opens beside the takeoff. Heat five is IN the water — including Ruby, 11, her first-ever heat, drifting toward it. Nothing's gone wrong yet.",
      factors: [
        { label: 'THE RIP', value: 'new, pulling' },
        { label: 'RUBY', value: 'drifting, hasn’t noticed' },
        { label: 'HORN', value: '9 minutes left' },
      ],
      options: [
        {
          id: 'pause-heat',
          label: 'Horn NOW. Everyone in, re-run the heat on the safe side after a bank check.',
          skill: 'Judgement & Decision-Making',
          score: 10,
          echo: 'You stopped the heat before anything happened — then re-ran it safely.',
          consequence: "Nine minutes lost, zero incidents. Ruby paddles back out on the safe side and catches two waves. Nobody on the beach even knows what you saw — and that's the point.",
          stats: [
            { label: 'HEAT FIVE', change: 're-run, clean' },
            { label: 'INCIDENTS', change: 'zero, ever' },
          ],
          insight: 'Stopping early looks dramatic for ten seconds. It looks like nothing forever after — that’s what good calls look like.',
        },
        {
          id: 'send-water',
          label: 'Send your water-safety senior to shadow Ruby, let the heat run.',
          skill: 'Situational Awareness & Systems Thinking',
          score: 4,
          echo: 'You put a shadow on Ruby and let the heat run.',
          consequence: 'It works — the senior steers her off the rip line, the heat finishes. Your heart rate does not.',
          stats: [
            { label: 'RUBY', change: 'shadowed, safe' },
            { label: 'MARGIN', change: 'thinner than you liked' },
          ],
        },
        {
          id: 'watch',
          label: "Watch closely and trust it — she's got a board under her, she'll drift wide at worst.",
          skill: 'Self-direction',
          score: -8,
          echo: 'You watched and hoped. The rip made its own decision.',
          consequence: "Ruby ends up sixty metres down the beach, scared and crying, fine. Her heat is done, her comp is done, and her dad's question — \"who was watching?\" — has one answer.",
          stats: [
            { label: 'RUBY', change: 'safe, done for the day' },
            { label: 'HER DAD', change: 'asking who was watching' },
          ],
          ghost: 'Fine by luck is not fine.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'loud',
      transition: 'zoom-punch',
      eyebrow: 'Saturday 9:45am · the final',
      scene: 'court',
      sceneCaption: 'Last heat, tide filling in',
      prompt: "The final. The tide is filling and the window is closing fast. You can run it now on the fading bank, shift everyone to the inside runner — smaller but clean — or call the comp on points and skip the final.",
      factors: [
        { label: 'THE BANK', value: 'fading fast' },
        { label: 'INSIDE RUNNER', value: 'small, clean' },
        { label: 'PARENTS', value: 'cameras out' },
      ],
      options: [
        {
          id: 'inside',
          label: 'Move the final to the inside runner. Smaller waves, real waves, real finish.',
          skill: 'Adaptability & Cognitive Flexibility',
          score: 9,
          echo: 'You moved the final to the inside — small, clean, and FINISHED.',
          consequence: "Waist-high runners, four kids swapping the lead for fifteen minutes, a beach full of noise. It's not big — it's better: everyone watching can see every wave.",
          stats: [
            { label: 'THE FINAL', change: 'played to the horn' },
            { label: 'THE BEACH', change: 'front-row seats' },
          ],
          insight: 'You gave up spectacle for a finish everyone shared. Days end better on purpose.',
        },
        {
          id: 'send-final',
          label: 'Run it on the point now — big final, big memories, tighter margins.',
          skill: 'Judgement & Decision-Making',
          score: -4,
          echo: 'You sent the final into the fading bank.',
          consequence: "Two good waves come through in fifteen minutes. Two kids get scored, two paddle circles chasing lumps of tide. The trophy feels a bit random.",
          stats: [
            { label: 'WAVES RIDDEN', change: 'four, total' },
            { label: 'THE RESULT', change: 'luck-flavoured' },
          ],
        },
        {
          id: 'points',
          label: 'Call it on heat points — no final, everyone’s home by 10.',
          skill: 'Reasoning & Critical Thinking',
          score: 2,
          echo: 'You called it on points and skipped the final.',
          consequence: "Tidy, defensible, flat. The kid who came second by 0.5 will ask about that final for a year.",
          stats: [
            { label: 'COMP', change: 'decided on paper' },
            { label: 'THE FINAL', change: 'never happened' },
          ],
        },
      ],
    },
  ],
  outcome: {
    eyebrow: 'The comp, after',
    title: 'Boards on roofs. Sand everywhere. Done.',
    body: 'Twenty groms, one shifting bank, and a morning of calls that were all yours.',
  },
  outcomeTiers: {
    high: {
      eyebrow: 'The comp, after',
      title: 'Deano just handed you the Open.',
      body: "Every first-timer finished a heat. The seniors are asking if they're water safety NEXT year too. The inside-runner final is already club legend, and Ruby's dad shook your hand twice. \"Same again next year,\" Deano says, \"except you're running the Open as well.\" The day worked because you kept re-shaping it around the ocean and the kids — in that order.",
    },
    mid: {
      eyebrow: 'The comp, after',
      title: 'A good comp. The ocean nearly made it a great one.',
      body: "It ran, kids surfed, parents clapped. A couple of moments got thinner than they needed to be — the ones where you held on when the day was asking you to adjust. You can name them. That's the difference between running a comp and reading one.",
    },
    low: {
      eyebrow: 'The comp, after',
      title: 'Everyone went home. That’s the good news.',
      body: "Between the swell you didn't plan for and the rip you watched too long, the comp limped home on luck. Deano's debrief is one sentence: \"The ocean was telling you all morning, mate.\" Next time — and there should be a next time — let the day change your plan earlier.",
    },
  },
  reflect: {
    asker: 'Deano, waxing a board',
    prompt: 'Out of everything the comp could be — why’d you pick that as the win?',
  },
}

/* ------------------------------------------------------------------ */
/* 3 · FARM — Bring in the harvest before Thursday's storm             */
/* ------------------------------------------------------------------ */

export const FARM_JOURNEY: Scenario = {
  id: 'journey-farm',
  role: 'Bring in the harvest before the storm',
  meta: 'FOUR DAYS · ONE STORM · YOUR WEEK',
  goal: { label: 'HARVEST WEEK', target: 70 },
  opening: {
    eyebrow: 'Your activity',
    title: 'Four days of harvest. A storm lands Thursday night. Your uncle just made you second-in-command.',
    body: "First light Monday, {name}. Your uncle spreads the paddock map on the ute bonnet: \"Storm front Thursday night. You're running the crew side of this week — I'm on the header.\" Four days, three paddocks, five people. Before the engines start: what does winning the week mean?",
    imageCaption: 'The home paddock · Monday 6am',
    ambient: [
      { label: 'DAYS TO STORM', value: '4' },
      { label: 'PADDOCKS', value: '3 to strip' },
      { label: 'CREW', value: '5 incl. Davo' },
    ],
  },
  steps: [
    {
      kind: 'decision',
      mood: 'private',
      transition: 'cross-fade',
      eyebrow: 'Monday 6am · the ute bonnet',
      scene: 'whiteboard',
      sceneCaption: 'Paddock map, thermos, first light',
      prompt: 'Your uncle waits, engine idling. Four days, one storm. Tell him what this week is about — because every call after this one leans on it.',
      factors: [
        { label: 'YOUR UNCLE', value: 'waiting on you' },
        { label: 'THE FRONT', value: 'Thursday night' },
        { label: 'THE MAP', value: '3 paddocks, 1 river flat' },
      ],
      options: [
        {
          id: 'obj-tonnes',
          label: 'Objective: every tonne in the silo before the first drop falls.',
          skill: 'Self-direction',
          score: 0,
          echo: 'Objective locked: the full harvest beats the storm. All of it.',
          consequence: '"Big call," your uncle says, and grins. The week now runs at full throttle by design.',
          stats: [
            { label: 'OBJECTIVE', change: 'every tonne in' },
            { label: 'THE WEEK', change: 'full throttle' },
          ],
        },
        {
          id: 'obj-crew',
          label: 'Objective: the crew finishes the week safe and still talking to each other — tonnes second.',
          skill: 'Emotional Intelligence',
          score: 0,
          echo: 'Objective locked: people first, tonnes second.',
          consequence: '"Your grandfather ran it that way," he says quietly. Breaks go INTO the schedule, not around it.',
          stats: [
            { label: 'OBJECTIVE', change: 'crew home whole' },
            { label: 'SCHEDULE', change: 'breaks built in' },
          ],
          insight: 'Naming people as the objective changes every hour that follows.',
        },
        {
          id: 'obj-machines',
          label: 'Objective: protect the machines — a blown header costs more than a wet paddock.',
          skill: 'Reasoning & Critical Thinking',
          score: 0,
          echo: 'Objective locked: the machines outlast the week.',
          consequence: 'You schedule maintenance stops like they’re sacred. Slower — and nothing gets run into the ground.',
          stats: [
            { label: 'OBJECTIVE', change: 'machines protected' },
            { label: 'PACE', change: 'deliberate' },
          ],
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'whip-right',
      eyebrow: 'Tuesday · smoko',
      scene: 'locker',
      sceneCaption: 'Header ticking over, thermos out',
      prompt: "Davo — the old hand — reckons the header's making \"a new noise.\" Your uncle, over the radio, wants to push on: every hour counts now. Both of them are waiting on you.",
      factors: [
        { label: 'DAVO', value: '"new noise, I’m telling ya"' },
        { label: 'UNCLE', value: 'radio: "keep it rolling"' },
        { label: 'HOURS TO STORM', value: '58' },
      ],
      options: [
        {
          id: 'stop-check',
          label: 'Stop for 20 minutes. If Davo hears something, there’s something.',
          skill: 'Reasoning & Critical Thinking',
          score: 9,
          echo: 'You stopped for the noise — and found a bearing running hot.',
          consequence: "Twenty minutes and one grease gun later, you've dodged a two-DAY breakdown. Davo says nothing. Davo doesn't need to.",
          stats: [
            { label: 'BEARING', change: 'caught in time' },
            { label: 'DAYS SAVED', change: 'probably two' },
          ],
          insight: 'Evidence over urgency: the noise was data, and you treated it that way.',
        },
        {
          id: 'log-push',
          label: 'Log it, drive gentler, check it properly tonight after dark.',
          skill: 'Judgement & Decision-Making',
          score: 2,
          echo: 'You noted the noise and nursed the header till dark.',
          consequence: 'The night check finds the bearing worn but alive. You got away with it — this time — and lost the evening to the repair.',
          stats: [
            { label: 'BEARING', change: 'worn, caught late' },
            { label: 'YOUR EVENING', change: 'spent under the header' },
          ],
        },
        {
          id: 'push-on',
          label: 'Push on. Old machines make noises — the storm doesn’t wait for maybes.',
          skill: 'Self-direction',
          score: -7,
          echo: 'You overruled Davo and kept the header rolling.',
          consequence: "Wednesday 11am the bearing lets go with a bang you feel in your teeth. Half a day gone to the repair, and Davo's silence is louder than the noise ever was.",
          stats: [
            { label: 'HEADER', change: 'down half a day' },
            { label: 'DAVO', change: 'saying nothing, loudly' },
          ],
          ghost: 'The storm was 58 hours away. The noise was right there.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'iris-in',
      eyebrow: 'Wednesday · 38 degrees',
      scene: 'press',
      sceneCaption: 'Heat shimmer on the stubble',
      prompt: "Thirty-eight in the shade and no shade. Davo's slowing — missing calls on the radio, twice. He'd die before he'd sit out a harvest day. The crew is watching how you handle him.",
      factors: [
        { label: 'MERCURY', value: '38°C' },
        { label: 'DAVO', value: 'proud, wilting' },
        { label: 'THE CREW', value: 'watching you' },
      ],
      options: [
        {
          id: 'ute-job',
          label: 'Give Davo the ute-and-logistics run — the air-conditioned job that needs his brain.',
          skill: 'Emotional Intelligence',
          score: 9,
          echo: 'You moved Davo to the ute run — cool cab, real job, pride intact.',
          consequence: "\"Someone's gotta run the chaser bins properly,\" you say. Davo grumbles for exactly one minute, then runs logistics better than anyone alive. The crew clocks HOW you did it.",
          stats: [
            { label: 'DAVO', change: 'cool cab, key job' },
            { label: 'HIS PRIDE', change: 'never touched' },
          ],
          insight: 'You looked after him in a way he could accept. That is the entire skill.',
        },
        {
          id: 'call-break',
          label: 'Call forty minutes in the shed for EVERYONE. Water, food, storm or no storm.',
          skill: 'Leadership & Influence',
          score: 4,
          echo: 'You stopped the whole crew — everyone in the shed, water and food.',
          consequence: "Forty minutes lost, five people recharged. Your uncle checks his watch, then nods once. Davo gets his break without being singled out.",
          stats: [
            { label: 'CREW', change: 'recharged' },
            { label: 'TIME', change: '40 min spent' },
          ],
        },
        {
          id: 'let-run',
          label: "Say nothing. Davo's been doing harvests since before you were born.",
          skill: 'Judgement & Decision-Making',
          score: -7,
          echo: 'You let Davo push through the heat.',
          consequence: "At 3pm he goes down beside the chaser bin — heat stress. He's okay. He's also done for the week, in the house, humiliated, and you're a person short with a storm coming.",
          stats: [
            { label: 'DAVO', change: 'heat stress, done' },
            { label: 'CREW', change: 'one short, rattled' },
          ],
          ghost: 'Respecting someone isn’t the same as protecting them.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'private',
      transition: 'page-turn',
      eyebrow: 'Wednesday night · the kitchen table',
      scene: 'tunnel',
      sceneCaption: 'Radar on the laptop, tea going cold',
      prompt: "New radar run: the storm's edge now clips Thursday AFTERNOON, not night. The river flat — your best wheat, your worst mud — takes four hours to strip. Your uncle slides the laptop over: \"Sequence tomorrow however you want.\"",
      factors: [
        { label: 'STORM EDGE', value: 'Thu afternoon now' },
        { label: 'RIVER FLAT', value: 'best wheat, floods first' },
        { label: 'HOURS LEFT', value: 'maybe 14 dry' },
      ],
      options: [
        {
          id: 'flat-first',
          label: 'River flat FIRST, from first light — take the best wheat off the riskiest ground while it’s dry.',
          skill: 'Situational Awareness & Systems Thinking',
          score: 10,
          echo: 'You re-sequenced the whole day: river flat at dawn, high ground after.',
          consequence: "Header's on the flat at 5:50am. By 10 the best wheat is in the silo and you're stripping high ground that can wait out rain. The sequence WAS the decision.",
          stats: [
            { label: 'RIVER FLAT', change: 'stripped by 10am' },
            { label: 'RISK', change: 'moved to safe ground' },
          ],
          insight: 'Same paddocks, same hours — the ORDER was worth thousands. Systems thinking is just sequencing under pressure.',
        },
        {
          id: 'as-planned',
          label: 'Keep the planned order — the home paddocks first, flat last. Changing plans at 9pm breeds mistakes.',
          skill: 'Self-direction',
          score: -6,
          echo: 'You held the original sequence: river flat last.',
          consequence: "Thursday 1pm you're halfway through the flat when the first band arrives early. The header bogs twice; a quarter of your best wheat takes the rain standing up.",
          stats: [
            { label: 'RIVER FLAT', change: 'caught by the edge' },
            { label: 'BEST WHEAT', change: 'a quarter rained on' },
          ],
        },
        {
          id: 'split-crew',
          label: 'Split the difference: half-strip the flat tonight under lights, finish the plan tomorrow.',
          skill: 'Adaptability & Cognitive Flexibility',
          score: 3,
          echo: 'You ran the flat under lights till midnight.',
          consequence: 'Night stripping is slow and the crew pays for it Thursday, but the riskiest half of the flat sleeps in the silo. A tired, defensible middle road.',
          stats: [
            { label: 'FLAT', change: 'half in, by lights' },
            { label: 'CREW', change: 'running on fumes' },
          ],
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'loud',
      transition: 'zoom-punch',
      eyebrow: 'Thursday 2:30pm · the last paddock',
      scene: 'court',
      sceneCaption: 'The front on the ridge line',
      prompt: "The front is ON the ridge — you can smell it. One corner of wheat left, maybe 90 minutes of stripping, maybe 60 of dry. The crew looks at you: send it, shed it, or split it?",
      factors: [
        { label: 'THE FRONT', value: 'on the ridge' },
        { label: 'WHEAT LEFT', value: '~90 min of stripping' },
        { label: 'DRY WINDOW', value: 'maybe 60 min' },
      ],
      options: [
        {
          id: 'split-it',
          label: 'One machine strips the best 40 minutes of it, everything else sheds NOW. Pre-agree the pull-out signal.',
          skill: 'Judgement & Decision-Making',
          score: 9,
          echo: 'You took the best of the corner and shedded everything else — signal pre-agreed.',
          consequence: "Header takes the heart of the corner while the crew sheets loads and sheds machines behind it. Two air-horn blasts at 3:15, everything under cover as the wall of rain crosses the fence line. The last 15% stands in the weather; the week doesn't.",
          stats: [
            { label: 'THE CORNER', change: 'best of it in' },
            { label: 'MACHINES & CREW', change: 'shedded, dry' },
          ],
          insight: 'You sized the risk, took a bounded bite of it, and pre-agreed the exit. That’s professional-grade decision-making in a wheat paddock.',
        },
        {
          id: 'send-it',
          label: 'Send it — 90 flat-out minutes, everyone briefed, beat the sky or wear it.',
          skill: 'Self-direction',
          score: -5,
          echo: 'You went all-in on the corner against the sky.',
          consequence: "The sky wins by twenty minutes. Wheat in the box gets rained on, the header sleeps in the open, and the ute needs a tow out of the gateway. Great story, expensive story.",
          stats: [
            { label: 'THE SKY', change: 'won by 20 min' },
            { label: 'THE HEADER', change: 'wet, bogged-adjacent' },
          ],
        },
        {
          id: 'shed-all',
          label: 'Call it now. Sheet the loads, shed the machines, beat the front home. The corner stands.',
          skill: 'Integrity & Ethics',
          score: 3,
          echo: 'You called the week twenty minutes early and got everything home dry.',
          consequence: "The corner takes the rain standing up — a real cost, cleanly chosen. Machines dry, crew dry, nobody bogged. Your uncle: \"Cheapest wheat we ever lost.\"",
          stats: [
            { label: 'THE CORNER', change: 'left standing' },
            { label: 'EVERYTHING ELSE', change: 'home and dry' },
          ],
        },
      ],
    },
  ],
  outcome: {
    eyebrow: 'The week, after',
    title: 'Rain on the shed roof. Week over.',
    body: 'Four days, three paddocks, one storm — and a week of calls that were yours.',
  },
  outcomeTiers: {
    high: {
      eyebrow: 'The week, after',
      title: 'Your uncle puts the kettle on and says nothing. That’s the medal.',
      body: "The silo's full of the wheat that mattered, the machines are dry, Davo ran logistics like a general, and the storm hit an empty paddock. Rain hammers the shed roof like applause. \"Same job next harvest,\" your uncle finally says. \"Permanent.\" Every good hour of this week traces back to a call you made.",
    },
    mid: {
      eyebrow: 'The week, after',
      title: 'The silo’s mostly full. The lessons are too.',
      body: "You beat the storm on the whole — a rained-on load here, a lost half-day there. Around the kitchen table your uncle replays the week without blame: \"There's two hours on Tuesday and a sequence call on Wednesday I'd want back.\" You know exactly which ones he means. So will you, next year.",
    },
    low: {
      eyebrow: 'The week, after',
      title: 'The storm won this one.',
      body: "Wet wheat, a header that spent half a day broken, Davo in the house, and a corner — more than a corner — standing in the rain. Your uncle pours two teas anyway. \"Every farmer's had this week. The good ones only have it once.\" The map of what to do differently is painfully, usefully clear.",
    },
  },
  reflect: {
    asker: 'Your uncle, over the ute bonnet',
    prompt: 'Of all the ways to run this week — why’d you pick that as the win?',
  },
}

/* ------------------------------------------------------------------ */
/* 4 · BAND — Get the band to show night                               */
/* ------------------------------------------------------------------ */

export const BAND_JOURNEY: Scenario = {
  id: 'journey-band',
  role: 'Get the band to show night',
  meta: 'THREE WEEKS · ONE STAGE · YOUR BAND',
  goal: { label: 'SHOW NIGHT', target: 70 },
  opening: {
    eyebrow: 'Your activity',
    title: 'Battle of the Bands is in three weeks. Your drummer just quit. You’re holding the band.',
    body: "Lunchtime, music room, {name}. The band got the last slot at Battle of the Bands — and the group chat is on fire because Jake quit last night. The song's 70% written, Mia wants to audition, and everyone's looking at you. Before any of that: what are you actually building toward?",
    imageCaption: 'The music room · three weeks out',
    ambient: [
      { label: 'WEEKS TO SHOW', value: '3' },
      { label: 'DRUMMER', value: 'quit last night' },
      { label: 'THE SONG', value: '70% written' },
    ],
  },
  steps: [
    {
      kind: 'decision',
      mood: 'private',
      transition: 'cross-fade',
      eyebrow: 'Three weeks out · the music room',
      scene: 'locker',
      sceneCaption: 'One empty drum stool',
      prompt: 'Before you fix the drummer problem, decide what show night is FOR. The next three weeks take their orders from this.',
      factors: [
        { label: 'THE BAND', value: 'rattled, waiting' },
        { label: 'THE SLOT', value: 'last — prime time' },
        { label: 'THE CHAT', value: '43 unread' },
      ],
      options: [
        {
          id: 'obj-win',
          label: 'Objective: win it. Best band on the night, trophy on the music room shelf.',
          skill: 'Self-direction',
          score: 0,
          echo: 'Objective locked: win Battle of the Bands.',
          consequence: 'You say it out loud and the room changes — rehearsals just became training.',
          stats: [
            { label: 'OBJECTIVE', change: 'win the night' },
            { label: 'REHEARSALS', change: 'now training' },
          ],
        },
        {
          id: 'obj-mia',
          label: 'Objective: whoever’s on that stage kills it — including a first-timer if Mia earns the stool.',
          skill: 'Leadership & Influence',
          score: 0,
          echo: 'Objective locked: build the band UP — new blood welcome.',
          consequence: 'The audition just became real. So did your job: getting a first-timer stage-ready in three weeks.',
          stats: [
            { label: 'OBJECTIVE', change: 'grow the band' },
            { label: 'MIA', change: 'gets her shot' },
          ],
          insight: 'Choosing to build people is the slowest path and the strongest one.',
        },
        {
          id: 'obj-together',
          label: 'Objective: the band walks off that stage still a band. Friendship first, placing second.',
          skill: 'Emotional Intelligence',
          score: 0,
          echo: 'Objective locked: the band survives show night intact.',
          consequence: 'Every fight for the next three weeks now has a tiebreaker: does this keep us together?',
          stats: [
            { label: 'OBJECTIVE', change: 'still mates after' },
            { label: 'TIEBREAKER', change: 'set' },
          ],
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'whip-right',
      eyebrow: 'Two and a half weeks out · the stool',
      scene: 'press',
      sceneCaption: 'Mia in the doorway, sticks in hand',
      prompt: "Mia can barely look at you while she asks for the audition. Jake — who quit — is telling people he'd come back if you apologised. You didn't start the argument. You DO need a drummer.",
      factors: [
        { label: 'MIA', value: 'nervous, prepared' },
        { label: 'JAKE', value: '"if you apologise…"' },
        { label: 'REHEARSALS LEFT', value: '8' },
      ],
      options: [
        {
          id: 'audition',
          label: 'Give Mia a real audition — today, full song, fair verdict.',
          skill: 'Leadership & Influence',
          score: 9,
          echo: 'You gave Mia a real audition — and she earned the stool outright.',
          consequence: "She's shaky for eight bars, then locks in like she's played with you for a year. The band exchanges a look. You have a drummer — one who practises MORE than Jake ever did.",
          stats: [
            { label: 'THE STOOL', change: 'Mia’s — earned' },
            { label: 'REHEARSAL ENERGY', change: 'reset, hungry' },
          ],
          insight: 'You ran a fair process in front of the whole band. They’ll trust the next call because of how you made this one.',
        },
        {
          id: 'apologise',
          label: 'Swallow it. Apologise to Jake, get the old lineup back for the big night.',
          skill: 'Emotional Intelligence',
          score: 2,
          echo: 'You apologised for a fight you didn’t start, and Jake came back.',
          consequence: "The band's whole again, technically. Jake plays like someone doing you a favour, and Mia stops coming past the music room.",
          stats: [
            { label: 'JAKE', change: 'back, on his terms' },
            { label: 'MIA', change: 'gone quiet' },
          ],
        },
        {
          id: 'both-tracks',
          label: 'Audition Mia AND text Jake straight: "no apology, but the stool’s open if you want to earn it back."',
          skill: 'Integrity & Ethics',
          score: 4,
          echo: 'You opened the stool to fair competition — Mia auditions, Jake’s invited on even terms.',
          consequence: "Jake reads it, types for a while, doesn't come. Mia does. The band notices you didn't trade the truth for a drummer.",
          stats: [
            { label: 'THE TERMS', change: 'fair, public' },
            { label: 'JAKE', change: 'chose out' },
          ],
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'private',
      transition: 'iris-in',
      eyebrow: 'One week out · the setlist',
      scene: 'whiteboard',
      sceneCaption: 'Sam’s phone on the amp, new demo playing',
      prompt: "Sam plays the band a song written two nights ago. It's better than the one you've rehearsed for three weeks — and the bridge of the old one still isn't landing. One week out: which song goes on stage?",
      factors: [
        { label: 'NEW SONG', value: 'better, raw' },
        { label: 'OLD SONG', value: 'drilled, bridge wobbly' },
        { label: 'REHEARSALS LEFT', value: '3' },
      ],
      options: [
        {
          id: 'new-song',
          label: "Back Sam's song. Three rehearsals, all in — better beats familiar.",
          skill: 'Adaptability & Cognitive Flexibility',
          score: 8,
          echo: 'You dropped three weeks of work for the better song — and told Sam why out loud.',
          consequence: "\"We're switching because it's BETTER, and Sam — that's the best thing anyone's brought this band.\" Three rehearsals of pure focus. Risky. Alive.",
          stats: [
            { label: 'SETLIST', change: 'the better song' },
            { label: 'SAM', change: 'ten feet tall' },
          ],
          insight: 'You let go of sunk cost the moment better walked in. Most adults can’t.',
        },
        {
          id: 'fix-bridge',
          label: 'Stay with the drilled song — spend the three rehearsals fixing the bridge.',
          skill: 'Reasoning & Critical Thinking',
          score: 3,
          echo: 'You backed the drilled song and attacked the bridge.',
          consequence: "By Thursday the bridge finally lands. It's the safer song, tight as a drum. Sam's demo stays on Sam's phone, and Sam noticed.",
          stats: [
            { label: 'THE BRIDGE', change: 'finally fixed' },
            { label: 'SAM’S SONG', change: 'shelved' },
          ],
        },
        {
          id: 'mash',
          label: 'Do both — open with the old one, close on Sam’s. Twice the songs, half the polish.',
          skill: 'Judgement & Decision-Making',
          score: -6,
          echo: 'You crammed both songs into three rehearsals.',
          consequence: "Neither song gets enough reps. Friday's run-through has a wobbly bridge AND a shaky new chorus, and everyone knows it.",
          stats: [
            { label: 'POLISH', change: 'split in half' },
            { label: 'FRIDAY RUN', change: 'wobbly × 2' },
          ],
          ghost: 'Two half-ready songs is one unready set.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'drop-slam',
      eyebrow: 'Show night · 6:15pm soundcheck',
      scene: 'tunnel',
      sceneCaption: 'The PA just died mid-check',
      prompt: "Soundcheck. The hall PA blows a channel — vocals now sound like a phone in a bucket. The tech shrugs: \"It is what it is.\" You go on at 8:40. The other bands are panicking in order.",
      factors: [
        { label: 'PA', value: 'one channel down' },
        { label: 'YOUR SLOT', value: '8:40pm, last' },
        { label: 'THE TECH', value: 'shrugging' },
      ],
      options: [
        {
          id: 'borrow-rig',
          label: "Ring the church around the corner — they've got a vocal rig, and you help at their fete every year.",
          skill: 'Situational Awareness & Systems Thinking',
          score: 9,
          echo: 'You borrowed the church vocal rig an hour before doors.',
          consequence: "Twenty minutes of lugging, one grateful minister, and by 7:30 you're the only band on the bill with clean vocals. Playing LAST just became an advantage.",
          stats: [
            { label: 'VOCALS', change: 'clean — only yours' },
            { label: 'LAST SLOT', change: 'now an advantage' },
          ],
          insight: 'You knew what the network around you could do, and you asked. Resourcefulness is mostly relationships.',
        },
        {
          id: 'rearrange',
          label: 'Re-voice the set on the spot: drop the high harmony, push the guitar hook, let the room carry the chorus.',
          skill: 'Adaptability & Cognitive Flexibility',
          score: 4,
          echo: 'You re-arranged the set around the broken channel.',
          consequence: "It's clever and it mostly works — the hook covers what the PA can't. A musician's fix for a technician's problem.",
          stats: [
            { label: 'THE SET', change: 're-voiced in 30 min' },
            { label: 'THE CHORUS', change: 'crowd-powered' },
          ],
        },
        {
          id: 'complain',
          label: 'Get the organisers to fix it — it’s THEIR PA, make it their problem until it’s solved.',
          skill: 'Self-direction',
          score: -6,
          echo: 'You escalated the PA to the organisers and waited.',
          consequence: "You're right, and it doesn't matter: no spare channel exists in the building. You've spent your prep hour arguing and your soundcheck slot is gone.",
          stats: [
            { label: 'THE PA', change: 'still broken' },
            { label: 'YOUR PREP HOUR', change: 'spent arguing' },
          ],
          ghost: 'Being right and being ready are different jobs. Only one of them plays at 8:40.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'loud',
      transition: 'zoom-punch',
      eyebrow: 'Show night · 8:38pm',
      scene: 'court',
      sceneCaption: 'Side of stage, crowd chanting',
      prompt: "Two minutes to stage. Mia's frozen at the curtain gap — sticks in hand, staring at the biggest crowd of her life, whispering \"I can't.\" The MC is already saying your band's name.",
      factors: [
        { label: 'MIA', value: 'frozen at the curtain' },
        { label: 'THE MC', value: 'saying your name' },
        { label: 'THE CROWD', value: 'chanting' },
      ],
      options: [
        {
          id: 'eyes-only',
          label: 'Get in front of her, eyes only: "First eight bars. Just us in the garage. I\'ll count you in."',
          skill: 'Emotional Intelligence',
          score: 10,
          echo: 'You shrank the moment to eight bars and a count-in — and Mia walked on.',
          consequence: "She locks onto your count like a lifeline. Bar nine, she stops thinking. By the chorus she's playing to the back row. You watched it happen from two feet away.",
          stats: [
            { label: 'MIA', change: 'on stage, flying' },
            { label: 'THE COUNT-IN', change: 'the whole trick' },
          ],
          insight: 'You didn’t fix her fear — you shrank the task until she could carry it. That sentence works on every scared human forever.',
        },
        {
          id: 'straight',
          label: 'Straight and firm: "You earned this stool. Play it like the audition. GO."',
          skill: 'Leadership & Influence',
          score: 3,
          echo: 'You gave Mia the captain’s version — earned it, play it, go.',
          consequence: "It works — she goes on, plays tight and careful, a notch inside herself. The crowd never knows. You do.",
          stats: [
            { label: 'MIA', change: 'on, playing safe' },
            { label: 'THE SET', change: 'tight, careful' },
          ],
        },
        {
          id: 'swap-plan',
          label: 'Protect the set: quietly ask Sam to cover the kit for song one, Mia joins when she’s ready.',
          skill: 'Judgement & Decision-Making',
          score: -5,
          echo: 'You benched Mia "for one song" to protect the set.',
          consequence: "Sam covers, rough but fine. Mia watches from the wing, and \"when she's ready\" never comes — some doors close the moment you don't walk through them.",
          stats: [
            { label: 'SONG ONE', change: 'covered, rough' },
            { label: 'MIA', change: 'in the wing all night' },
          ],
          ghost: 'The set was never the thing you were building.',
        },
      ],
    },
  ],
  outcome: {
    eyebrow: 'After the last chord',
    title: 'Ears ringing. Hands shaking. Done.',
    body: 'Three weeks, one stage, and a band that got there because of your calls.',
  },
  outcomeTiers: {
    high: {
      eyebrow: 'After the last chord',
      title: 'The room is still shouting and Mia won’t put the sticks down.',
      body: "Clean vocals when no other band had them, the better song, and a first-timer who owned the last chorus of the night. Whether the trophy comes or not stopped mattering around bar nine. Sam's already talking about the next song; Mia's mum is crying near the mixing desk. You built this — call by call.",
    },
    mid: {
      eyebrow: 'After the last chord',
      title: 'A real set, played all the way through.',
      body: "You got a band on stage three weeks after it fell apart — that's the headline. It was tighter in the garage, and you can trace exactly why: a rehearsal spent arguing, a call made safe when brave was available. Every band that lasts has this exact night in its history.",
    },
    low: {
      eyebrow: 'After the last chord',
      title: 'You got through it. The band’s quiet in the van.',
      body: "A wobbly set through a broken PA, and someone who should have been on that stage wasn't. Nobody says much on the drive home. Here's the thing though — the band still exists, the next gig already has a date, and you now know precisely which three calls you'd make differently. That's not nothing. That's the whole apprenticeship.",
    },
  },
  reflect: {
    asker: 'Sam, packing a pedal board',
    prompt: 'Out of everything show night could be — why’d you make THAT the goal?',
  },
}

/* ------------------------------------------------------------------ */
/* 5 · MARKET — Run your stall from setup to the last sale             */
/* ------------------------------------------------------------------ */

export const MARKET_JOURNEY: Scenario = {
  id: 'journey-market',
  role: 'Run your market stall — setup to sell-out',
  meta: 'ONE SATURDAY · 60 CANDLES · YOUR STALL',
  goal: { label: 'STALL DAY', target: 70 },
  opening: {
    eyebrow: 'Your activity',
    title: 'Sixty candles, one trestle table, eight hours. The market opens at nine.',
    body: "Saturday, 7am, {name}. Three months of making — sixty candles boxed in the boot, a cash tin with a $50 float, and stall #14 at the school market. Whatever happens between now and 3pm is a small business, and it's yours. First: what does a great day look like?",
    imageCaption: 'Stall #14 · 7:04am',
    ambient: [
      { label: 'STOCK', value: '60 candles' },
      { label: 'FLOAT', value: '$50' },
      { label: 'HOURS', value: '9am – 3pm' },
    ],
  },
  steps: [
    {
      kind: 'decision',
      mood: 'private',
      transition: 'cross-fade',
      eyebrow: '7am · the empty table',
      scene: 'whiteboard',
      sceneCaption: 'Trestle, tablecloth, sixty boxes',
      prompt: 'Before the first customer exists, decide what today is for. Price tags, patter, everything downstream — it all follows this.',
      factors: [
        { label: 'THE TABLE', value: 'yours till 3' },
        { label: 'COST TO MAKE', value: '$6 a candle' },
        { label: 'SCHOOL TRIP', value: 'needs $200' },
      ],
      options: [
        {
          id: 'obj-profit',
          label: 'Objective: clear $200 profit — the school trip paid in full, by you.',
          skill: 'Reasoning & Critical Thinking',
          score: 0,
          echo: 'Objective locked: $200 clear. Every price and every deal now has a maths test.',
          consequence: 'You do the numbers on the tablecloth: 25 candles at $14 gets you there. Now every discount is a real decision.',
          stats: [
            { label: 'OBJECTIVE', change: '$200 clear' },
            { label: 'BREAK-EVEN', change: '25 candles @ $14' },
          ],
        },
        {
          id: 'obj-sellout',
          label: 'Objective: the SOLD OUT sign by 3pm — sixty empty boxes, whatever it takes.',
          skill: 'Self-direction',
          score: 0,
          echo: 'Objective locked: sell every single candle.',
          consequence: 'Volume is the game now. Pricing, bundles, energy — all tuned to move sixty units.',
          stats: [
            { label: 'OBJECTIVE', change: '60 of 60 gone' },
            { label: 'THE GAME', change: 'volume' },
          ],
        },
        {
          id: 'obj-regulars',
          label: 'Objective: people who come BACK — names, repeat customers, maybe a real order book.',
          skill: 'Emotional Intelligence',
          score: 0,
          echo: 'Objective locked: build customers, not just sales.',
          consequence: 'You put a little "custom orders" card on the table. Today is a shopfront for something longer.',
          stats: [
            { label: 'OBJECTIVE', change: 'repeat customers' },
            { label: 'THE TABLE', change: 'now a shopfront' },
          ],
          insight: 'Playing the long game on day one — that’s founder thinking.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'whip-right',
      eyebrow: '9:20am · the neighbour problem',
      scene: 'press',
      sceneCaption: 'Stall #15 unloads candles. $8 candles.',
      prompt: "Stall #15 — a parent, industrial quantities — is selling candles for $8. Yours are $16, and you know your soy wax and lead-free wicks cost $6 a unit. First customers are hovering, comparing.",
      factors: [
        { label: 'NEXT DOOR', value: 'candles @ $8' },
        { label: 'YOUR PRICE', value: '$16' },
        { label: 'CUSTOMERS', value: 'hovering, comparing' },
      ],
      options: [
        {
          id: 'story-sign',
          label: 'Hold $16 — rewrite the sign: "Hand-poured soy · lead-free wick · 40-hr burn. Smell the difference."',
          skill: 'Reasoning & Critical Thinking',
          score: 9,
          echo: 'You held your price and sold the difference instead.',
          consequence: "You put an open candle on the table for smelling. Customers pick it up, get it, pay $16. You're not selling the same product for double — you're selling a different product, and now the sign says so.",
          stats: [
            { label: 'PRICE', change: 'held at $16' },
            { label: 'THE SIGN', change: 'does the arguing' },
          ],
          insight: 'You refused a price war you couldn’t win and switched to a value story you couldn’t lose.',
        },
        {
          id: 'meet-neighbour',
          label: 'Go say g’day to #15 — trade a candle, talk shop, maybe send each other customers.',
          skill: 'Emotional Intelligence',
          score: 4,
          echo: 'You made the $8 stall an ally instead of a rival.',
          consequence: "She's lovely. She sells party favours; you sell gifts. By 11 you're sending each other customers: \"bulk? next door — fancy? next door the other way.\"",
          stats: [
            { label: '#15', change: 'ally, not rival' },
            { label: 'REFERRALS', change: 'flowing both ways' },
          ],
        },
        {
          id: 'price-drop',
          label: 'Drop to $10 — match the market before it walks past you all day.',
          skill: 'Adaptability & Cognitive Flexibility',
          score: -7,
          echo: 'You dropped to $10 and joined a price war against factory candles.',
          consequence: "Sales tick up, margin evaporates: $4 a candle means even a SELL-OUT barely clears the trip money. You've priced your three months of work like it took an afternoon.",
          stats: [
            { label: 'MARGIN', change: '$4 — ouch' },
            { label: 'BEST CASE NOW', change: 'barely breaks $200' },
          ],
          ghost: 'The $8 stall isn’t your competitor. It never was.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'iris-in',
      eyebrow: '11:30am · the refund',
      scene: 'locker',
      sceneCaption: 'A queue of four, and one unhappy face',
      prompt: "A woman returns her candle from an hour ago — \"it tunnelled, barely any scent\" — while FOUR people wait behind her, listening. You recognise the batch: your first pour, the experimental one. She's not wrong.",
      factors: [
        { label: 'THE QUEUE', value: '4 people, listening' },
        { label: 'THE BATCH', value: 'your first pour' },
        { label: 'SHE’S', value: 'not wrong' },
      ],
      options: [
        {
          id: 'public-refund',
          label: 'Full refund PLUS a replacement from the good batch — loudly enough for the queue to hear why.',
          skill: 'Integrity & Ethics',
          score: 10,
          echo: 'You made the refund a public promise: "if it’s not right, I make it right."',
          consequence: "\"That batch was my first pour — this one's from the good run, and your money back for the trouble.\" She leaves with both. Two people in the queue buy TWO candles each. The refund cost $16 and bought a reputation.",
          stats: [
            { label: 'THE QUEUE', change: 'heard everything' },
            { label: 'TRUST', change: 'purchased, cheap' },
          ],
          insight: 'You treated a complaint as marketing. In front of witnesses, integrity converts.',
        },
        {
          id: 'quiet-swap',
          label: 'Quietly swap it for a good one — "so sorry" — and keep the queue moving.',
          skill: 'Judgement & Decision-Making',
          score: 3,
          echo: 'You fixed it quietly and kept the line moving.',
          consequence: "Fair, fast, forgettable. She's satisfied; the queue learned nothing about you either way.",
          stats: [
            { label: 'CUSTOMER', change: 'satisfied' },
            { label: 'THE MOMENT', change: 'spent quietly' },
          ],
        },
        {
          id: 'defend',
          label: 'Explain candle care — tunnelling usually means short first burns. Offer 50% off her next one.',
          skill: 'Reasoning & Critical Thinking',
          score: -6,
          echo: 'You explained why the candle failed instead of fixing it.',
          consequence: "You might even be right about the burn time. Doesn't matter: four listening customers heard \"it's kind of your fault.\" Two of them drift off mid-explanation.",
          stats: [
            { label: 'THE QUEUE', change: 'two walked' },
            { label: 'BEING RIGHT', change: 'expensive today' },
          ],
          ghost: 'Nobody in a queue has ever been argued into loyalty.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'private',
      transition: 'page-turn',
      eyebrow: '1:45pm · the café owner',
      scene: 'tunnel',
      sceneCaption: 'A business card on your tablecloth',
      prompt: "The café owner from Main St has been back twice. Now she puts down a card: \"Twenty candles a month for the shop — but I'd need them at $9 each, and the first batch by Friday.\" Your unit cost is $6. School goes five days a week.",
      factors: [
        { label: 'THE OFFER', value: '20/month @ $9' },
        { label: 'YOUR COST', value: '$6 a unit' },
        { label: 'FIRST BATCH', value: 'due Friday' },
      ],
      options: [
        {
          id: 'counter',
          label: 'Counter, kindly and on paper: "$11 a unit, first batch NEXT Friday — and I’ll do your custom label free."',
          skill: 'Leadership & Influence',
          score: 9,
          echo: 'You countered the café — better price, honest timeline, sweetener included.',
          consequence: "She smiles at the label offer — that's the bit she wanted. \"$11, next Friday, done.\" You just negotiated your first standing order without blinking at a real adult.",
          stats: [
            { label: 'THE DEAL', change: '$11 · monthly · signed' },
            { label: 'TIMELINE', change: 'one you can keep' },
          ],
          insight: 'You countered on price AND timeline in the same breath. Most first-time founders fold on both.',
        },
        {
          id: 'take-it',
          label: 'Take it as offered — $9 is still profit, and a monthly order is a monthly order.',
          skill: 'Judgement & Decision-Making',
          score: -4,
          echo: 'You took the first offer and the Friday deadline.',
          consequence: "$3 a unit for your hardest week of the month, and a Friday deadline that will eat four school nights. A real order — priced like a favour.",
          stats: [
            { label: 'MARGIN', change: '$3 — thin' },
            { label: 'YOUR WEEKNIGHTS', change: 'spoken for' },
          ],
          ghost: 'The first offer is the start of the conversation, not the end.',
        },
        {
          id: 'decline',
          label: 'Thank her and pass — today’s stall comes first, and wholesale can wait a season.',
          skill: 'Self-direction',
          score: 2,
          echo: 'You passed on wholesale to protect what’s working.',
          consequence: "Clean and honest. She keeps your card. The door's ajar for a season when you have more hours than homework.",
          stats: [
            { label: 'THE DOOR', change: 'left ajar' },
            { label: 'TODAY', change: 'protected' },
          ],
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'loud',
      transition: 'zoom-punch',
      eyebrow: '2:30pm · the last half hour',
      scene: 'court',
      sceneCaption: '14 candles left, crowd thinning',
      prompt: "Half an hour left. Fourteen candles on the table and the crowd is thinning. Whatever your objective was this morning — this is the last move of the day. Make it count.",
      factors: [
        { label: 'STOCK LEFT', value: '14' },
        { label: 'TIME LEFT', value: '30 min' },
        { label: 'THE CROWD', value: 'thinning' },
      ],
      options: [
        {
          id: 'bundle',
          label: 'Flip the sign: "3 for $40 — gift-wrapped free." Turn stragglers into sell-out.',
          skill: 'Adaptability & Cognitive Flexibility',
          score: 8,
          echo: 'You invented the 3-for-$40 bundle on the spot — and the table cleared.',
          consequence: "Gift logic beats candle logic at 2:30pm: four buyers do the maths on Christmas and take twelve candles between them. The SOLD OUT sign goes up at 2:56.",
          stats: [
            { label: 'THE TABLE', change: 'cleared by 2:56' },
            { label: 'THE SIGN', change: 'SOLD OUT' },
          ],
          insight: 'You re-packaged, re-priced and re-framed in one move — retail instincts, live.',
        },
        {
          id: 'hold-price',
          label: 'Hold full price to the horn — fourteen left over just means stock for the café deal.',
          skill: 'Reasoning & Critical Thinking',
          score: 4,
          echo: 'You held price and banked the leftovers as next month’s stock.',
          consequence: 'Six more sell at $16. Eight come home — which is either unsold stock or a head start on wholesale, depending on the deal you cut at 1:45.',
          stats: [
            { label: 'SOLD AT FULL', change: '6 more' },
            { label: 'LEFTOVER', change: 'stock or head start' },
          ],
        },
        {
          id: 'give-away',
          label: 'Start discounting hard — $5, $3, free with a smile. Empty table, full vibes.',
          skill: 'Emotional Intelligence',
          score: -5,
          echo: 'You slashed to clear and gave the last ones away.',
          consequence: "The table empties and the last hour feels great — until the woman who paid $16 at 9:05 walks past the $3 sign. Her face does the accounting for you.",
          stats: [
            { label: 'THE TABLE', change: 'empty' },
            { label: 'THE 9AM BUYER', change: 'did the maths' },
          ],
          ghost: 'Every discount teaches your earliest customers a lesson you didn’t mean to.',
        },
      ],
    },
  ],
  outcome: {
    eyebrow: 'After the pack-down',
    title: 'One folded trestle table. One heavier cash tin.',
    body: 'Eight hours of real customers, real money, real calls — all yours.',
  },
  outcomeTiers: {
    high: {
      eyebrow: 'After the pack-down',
      title: 'Count it again. Yep — you smashed it.',
      body: "The tin holds more than the trip money, the SOLD OUT sign is in the boot, and there's a café order — at YOUR price — sitting in your pocket. The stall next door waves goodbye like an old mate. Three months of making, one day of deciding, and every big number in that tin traces to a call you made under pressure.",
    },
    mid: {
      eyebrow: 'After the pack-down',
      title: 'A real trading day. The tin doesn’t lie.',
      body: "Solid sales, a lesson or two priced into the margin, and most of the trip money covered. Somewhere between the neighbour, the refund and the café you left real money on the table — and you know exactly where, which is precisely how shop owners get sharp.",
    },
    low: {
      eyebrow: 'After the pack-down',
      title: 'The tin is light. The lessons aren’t.',
      body: "A price war you couldn't win, a moment in front of the queue that went sideways, a deal signed on the wrong terms — today charged tuition. But look: you MADE a thing, took it to market, and survived contact with real customers at fourteen. The next stall — and there will be one — starts from everything this one taught you.",
    },
  },
  reflect: {
    asker: 'Your mum, pretending to browse',
    prompt: 'Interesting goal to pick. Out of everything today could be — why that one?',
  },
}

/* ------------------------------------------------------------------ */
/* Exports & helpers                                                   */
/* ------------------------------------------------------------------ */

export const JOURNEYS: Scenario[] = [SURF_JOURNEY, FOOTY_JOURNEY, FARM_JOURNEY, BAND_JOURNEY, MARKET_JOURNEY]

/** Passion tiles for the journey entry — the doc's whole entry mechanic:
 *  the student picks what they LOVE; the journey wraps it. */
export interface Passion {
  id: string
  emoji: string
  label: string
  journeyId: string
  keywords: string[]
}

export const PASSIONS: Passion[] = [
  { id: 'surfing', emoji: '🏄', label: 'Surfing', journeyId: 'journey-surf', keywords: ['surf', 'beach', 'ocean', 'swim', 'wave'] },
  { id: 'footy', emoji: '🏉', label: 'Footy', journeyId: 'journey-footy', keywords: ['footy', 'football', 'rugby', 'afl', 'soccer', 'netball', 'basketball', 'sport', 'team'] },
  { id: 'farming', emoji: '🚜', label: 'Farming', journeyId: 'journey-farm', keywords: ['farm', 'animal', 'outdoors', 'tractor', 'country', 'horse', 'dog'] },
  { id: 'music', emoji: '🎸', label: 'Music', journeyId: 'journey-band', keywords: ['music', 'guitar', 'sing', 'band', 'dance', 'drum', 'dj', 'busk', 'beat', 'rap', 'song', 'producer', 'piano'] },
  { id: 'gaming', emoji: '🎮', label: 'Gaming', journeyId: 'journey-band', keywords: ['gam', 'minecraft', 'fortnite', 'computer', 'code', 'esport'] },
  { id: 'making', emoji: '🛠️', label: 'Making things', journeyId: 'journey-market', keywords: ['build', 'make', 'craft', 'art', 'draw', 'cook', 'bake', 'sew', 'candle', 'sell'] },
]

/** Map free-text ("I love fishing with my pop") to the closest journey. */
export function journeyForPassion(text: string): Scenario {
  const t = (text || '').toLowerCase()
  for (const p of PASSIONS) {
    if (p.keywords.some((k) => t.includes(k))) {
      return JOURNEYS.find((j) => j.id === p.journeyId) || SURF_JOURNEY
    }
  }
  return SURF_JOURNEY
}

export function journeyById(id: string): Scenario | undefined {
  return JOURNEYS.find((j) => j.id === id)
}

/** What each journey reveals — the 3 capabilities it most exercises, plus
 *  pathway shepherding (subjects + directions) for the journey report. */
export const JOURNEY_REVEALS: Record<string, {
  capabilities: { name: string; level: number; line: string }[]
  subjects: string[]
  directions: string[]
}> = {
  'journey-surf': {
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 85, line: 'You ran a comp around a moving ocean — pausing heats, moving finals, choosing endings on purpose.' },
      { name: 'Situational Awareness & Systems Thinking', level: 82, line: 'You read tides, rips and twenty kids at once, and kept re-sequencing the day around them.' },
      { name: 'Leadership & Influence', level: 80, line: 'You turned the older crew from a problem into your water-safety team with one counter-offer.' },
    ],
    subjects: ['Outdoor Education', 'Marine Studies', 'PDHPE', 'Geography'],
    directions: ['Event management', 'Emergency services', 'Marine science', 'Teaching & coaching'],
  },
  'journey-footy': {
    capabilities: [
      { name: 'Leadership & Influence', level: 86, line: 'You pitched a real sponsor, set rules that protected every kid, and owned the weather call everyone else ducked.' },
      { name: 'Situational Awareness & Systems Thinking', level: 83, line: 'You rebuilt an entire carnival runsheet overnight around a forecast — and it held.' },
      { name: 'Integrity & Ethics', level: 82, line: 'Marcus got his two quarters in ink because you made fairness a rule, not a favour.' },
    ],
    subjects: ['PDHPE', 'Business Studies', 'Legal Studies', 'English'],
    directions: ['Event & sports management', 'Coaching & high performance', 'Operations', 'Community leadership'],
  },
  'journey-farm': {
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 85, line: 'Machinery calls, people calls, storm calls — you sized each risk and took bounded bites of it.' },
      { name: 'Emotional Intelligence', level: 82, line: 'You looked after Davo in a way his pride could accept.' },
      { name: 'Situational Awareness & Systems Thinking', level: 81, line: 'The river-flat re-sequence — same hours, different order — was the week’s biggest win.' },
    ],
    subjects: ['Agriculture', 'Engineering Studies', 'Biology', 'Business Studies'],
    directions: ['Agribusiness', 'Engineering', 'Environmental science', 'Operations & logistics'],
  },
  'journey-band': {
    capabilities: [
      { name: 'Emotional Intelligence', level: 86, line: 'You shrank Mia’s fear to eight bars and a count-in — and she flew.' },
      { name: 'Adaptability & Cognitive Flexibility', level: 83, line: 'A better song, a blown PA, a frozen drummer — you re-planned around every one of them.' },
      { name: 'Leadership & Influence', level: 81, line: 'You ran fair processes in front of the whole band, and they trusted the next call because of it.' },
    ],
    subjects: ['Music', 'Drama', 'English', 'Business Studies'],
    directions: ['Creative production', 'Events & entertainment', 'Teaching & coaching', 'Team management'],
  },
  'journey-market': {
    capabilities: [
      { name: 'Reasoning & Critical Thinking', level: 85, line: 'You priced on value, refused the wrong price war, and did the margin maths before every deal.' },
      { name: 'Integrity & Ethics', level: 84, line: 'You made the refund in front of the whole queue — and it bought more than it cost.' },
      { name: 'Leadership & Influence', level: 81, line: 'You countered a real adult on price AND timeline in one breath — kindly, on paper.' },
    ],
    subjects: ['Business Studies', 'Economics', 'Design & Technology', 'Visual Arts'],
    directions: ['Entrepreneurship', 'Marketing & brand', 'Product & retail', 'Negotiation-heavy roles'],
  },
}

/** OPEN GENERATION (prototype-mocked): journeys are not a finite library.
 *  The student describes anything they love; the real build generates a
 *  bespoke goal-driven activity via FUSE. Here we pick the structurally-
 *  nearest flagship and frame it with their passion so the INTENT —
 *  infinite journeys — is what the demo communicates. */
export function generateJourney(passionText: string): { scenario: Scenario; passionLabel: string } {
  const scenario = journeyForPassion(passionText)
  const cleaned = (passionText || '').trim()
  const passionLabel = cleaned.length > 1
    ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1, 40)
    : 'Your thing'
  return { scenario, passionLabel }
}
