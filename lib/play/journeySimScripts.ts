/**
 * Node-journey scripts for the four non-footy passions — same continuous
 * Sims-style shape as FOOTY_SIM: one real activity, a hub of doors,
 * sequential threads (choice → phone call → consequence), a complication
 * whose variant depends on what the player secured, tiered endings.
 * Scripted mocks of the FUSE-generated engine.
 */

import { FOOTY_SIM, type JourneySimScript } from '@/lib/play/journeySim'

/* ------------------------------------------------------------------ */
/* SURF — Run the grom comp                                            */
/* ------------------------------------------------------------------ */

export const SURF_SIM: JourneySimScript = {
  id: 'sim-surf-grom-comp',
  title: 'The Grom Comp',
  club: 'Point Break Boardriders',
  goalLabel: 'COMP DAY',
  daysTotal: 10,
  theme: {
    // Dawn-patrol ocean world — deep pre-sunrise teal, nothing like the
    // navy shell or the market's candle amber.
    background: 'linear-gradient(180deg, #04121a 0%, #0a2530 45%, #10394a 100%)',
    accent: '#5fd4c9',
    topBar: 'rgba(4, 18, 26, 0.85)',
  },
  ledger: {
    primaryKey: 'ready',
    keys: {
      // Swell is weather, not achievement — it only moves when the ocean
      // decides. Comp-ready is the number your choices actually drive.
      swell: { label: 'Swell (ft)', format: 'count', start: 3 },
      window: { label: 'Tide window', format: 'hours', start: 0 },
      ready: { label: 'Comp ready', format: 'percent', start: 25, min: 0, max: 100 },
    },
    tierThresholds: { high: 80, mid: 50 },
    cardHead: 'Conditions log',
  },
  mechanicLabel: 'Live conditions board',
  arrival: {
    beats: [
      'Deano sticks the entry list to the clubhouse fridge and taps it twice.',
      '"Grom comp’s yours this year, {name}. Twenty kids, eight first-timers, Saturday week."',
      'The ocean doesn’t do reschedules.',
    ],
    mission: {
      headline: 'Run the grom comp.',
      points: [
        'Get COMP READY from 25% to as close to 100% as the week allows.',
        'The swell and the tide window are real — watch the conditions board.',
      ],
    },
  },
  hubReturn: {
    eyebrow: 'back at the clubhouse',
    narrative: 'One thing off the fridge list — the rest of it is still looking at you.',
    prompt: 'What do you sort next?',
  },
  intro: {
    eyebrow: 'Day 1 · The clubhouse',
    narrative:
      "Deano sticks the entry list to the fridge and taps it twice. \"Grom comp's yours this year, {name}. Twenty kids, one bank, Saturday week. Sing out if you're drowning.\" Then he's gone, and the list is looking at you.",
    prompt: 'Where do you start?',
  },
  streams: {
    groms: { label: 'Entries & groms', entry: 'groms-1', doorLabel: 'Get the groms signed up' },
    safety: { label: 'Water safety', entry: 'safety-1', doorLabel: 'Sort water safety' },
    heats: { label: 'The heat draw', entry: 'heats-1', doorLabel: 'Draw the heats' },
    beach: { label: 'Beach setup', entry: 'beach-1', doorLabel: 'Set up the beach' },
    prizes: { label: 'Sponsors & prizes', entry: 'prizes-1', doorLabel: 'Find the prizes' },
  },
  nodes: {
    'groms-1': {
      id: 'groms-1',
      kind: 'scene',
      stream: 'groms',
      eyebrow: 'The entry list',
      narrative:
        'Twenty names, eleven finished forms, and eight first-timers who don’t own a board between them. Every kid on that fridge is someone’s whole weekend.',
      prompt: 'How do you close out the entries?',
      customTo: 'groms-call',
      options: [
        {
          id: 'ring-kylie',
          label: 'Ring Kylie — the registrar mum who knows every family in the club.',
          skill: 'Situational Awareness & Systems Thinking',
          response: 'Kylie answers with a lever-arch folder already open. You can hear the tabs.',
          to: 'groms-call',
          effects: { stream: 'groms', status: 'underway', ledger: { ready: 8 } },
        },
        {
          id: 'group-post',
          label: 'Post the form link in the club group and hope.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Six forms roll in, three parents ask questions the post already answers, and then Kylie rings YOU: "Why didn\'t you just ask me, love?"',
          to: 'groms-call',
          effects: { stream: 'groms', status: 'underway', ledger: { ready: -4 } },
        },
        {
          id: 'door-knock',
          label: 'Catch the stragglers in person at Thursday training.',
          skill: 'Leadership & Influence',
          response:
            'Face to face works — forms get signed on car bonnets. Kylie finds you mid-lap with the last three names.',
          to: 'groms-call',
          effects: { stream: 'groms', status: 'underway', ledger: { ready: 6 } },
        },
      ],
    },
    'groms-call': {
      id: 'groms-call',
      kind: 'call',
      stream: 'groms',
      eyebrow: 'On the phone',
      narrative: 'You called Kylie. This is what Kylie is saying:',
      speaker: { name: 'Kylie', role: 'registrar mum · knows every family' },
      dialogue: [
        "Right, I've got all twenty forms sorted by Thursday, that's the easy bit.",
        'The real problem: eight first-timers, three boards between them. The club\'s old foamies are in the shed under forty years of junk.',
        "Get someone to dig them out and check the fins, and every kid surfs. Don't, and five of them watch from the sand.",
      ],
      prompt: 'Eight first-timers, three boards. Your move.',
      customTo: 'groms-3',
      options: [
        {
          id: 'dig-foamies',
          label: 'Shed working bee Thursday after training — foamies out, fins checked, one board per grom.',
          skill: 'Leadership & Influence',
          response:
            'Four dads, one snake scare, nine foamies. Every first-timer gets a board with their name chalked on it. Entries: ALL IN.',
          to: 'groms-3',
          effects: { stream: 'groms', status: 'sorted', days: 2, ledger: { ready: 16 } },
        },
        {
          id: 'borrow-some',
          label: 'Ask the older kids to lend their spares for the day.',
          skill: 'Emotional Intelligence',
          response:
            'Five spares appear — enough, barely, if heats share. Generous, wobbly, workable. Entries: in, with crossed fingers.',
          to: 'groms-3',
          effects: { stream: 'groms', status: 'sorted', days: 1, ledger: { ready: 6 } },
        },
        {
          id: 'their-problem',
          label: '"Boards are a family problem — the form says BYO."',
          skill: 'Judgement & Decision-Making',
          response:
            "Technically true. Thursday, two mums quietly withdraw their kids rather than say they don't own boards. The list is shorter and lighter than it should be.",
          to: 'groms-3',
          effects: { stream: 'groms', status: 'shaky', days: 1, ledger: { ready: -12 } },
        },
      ],
    },

    'groms-3': {
      id: 'groms-3',
      kind: 'talk',
      stream: 'groms',
      eyebrow: 'Thursday training',
      narrative:
        'Thursday training, foamies on the grass. One first-timer — Ollie, eight, ears like wing mirrors — hasn’t gone near the water. His mum catches you by the board racks.',
      speaker: { name: 'Ollie’s mum', role: 'first-comp parent · hovering with love' },
      dialogue: [
        'He’s talked about this comp for three weeks and now he says he’s not doing it.',
        'It’s the hooter. Someone told him you get disqualified if you’re still paddling when it goes.',
        'I don’t want to push him. But I don’t want him quitting over a rumour either.',
      ],
      prompt: 'One scared grom, one rumour, one Thursday to fix it.',
      customTo: 'groms-4',
      options: [
        {
          id: 'hooter-demo',
          label: 'Get the actual hooter out and run a practice heat, hooter and all — make the scary noise boring.',
          skill: 'Emotional Intelligence',
          response:
            'By the third practice heat, Ollie is IN CHARGE of the hooter. By dark he loves the thing. Rumour: deceased.',
          to: 'groms-4',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'tell-mum',
          label: 'Explain the real rule to his mum so she can talk him round at home.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'She nods and relays it word for word. Second-hand courage is better than none — but the hooter stays a monster he’s only heard described.',
          to: 'groms-4',
        },
        {
          id: 'hell-be-right',
          label: '"He’ll be right on the day — they always are."',
          skill: 'Self-direction',
          response:
            'Some are. Usually the ones whose nerves got met early. You’ve just bet Ollie’s whole first comp on "probably."',
          to: 'groms-4',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'groms-4': {
      id: 'groms-4',
      kind: 'text',
      stream: 'groms',
      eyebrow: '9:40pm · your phone',
      narrative: 'Your phone buzzes on the charger. Kylie. She does not text small talk.',
      speaker: { name: 'Kylie', role: 'registrar mum · folder never closes' },
      dialogue: [
        'Late one for you. The Nguyens just moved to town — their girl Lily surfs, wants in.',
        'Entries technically closed Tuesday. I can bend it, but the heat numbers are already balanced.',
        'Your call. She’s apparently very good, which is its own problem.',
      ],
      prompt: 'The twenty-first grom. In or out?',
      customTo: 'groms-5',
      options: [
        {
          id: 'in-redraw',
          label: 'She’s in — new town, new club, that’s what a grom comp is FOR. You’ll rebalance the draw tonight.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Twenty minutes with the whiteboard and every heat still works. Lily’s mum replies with three love hearts and a koala. Welcome to the club.',
          to: 'groms-5',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'in-quietly',
          label: 'In — but squeeze her into an existing heat and hope the numbers hold.',
          skill: 'Judgement & Decision-Making',
          response:
            'Kind, quick, slightly lopsided: heat three now has five kids and one of them is the best surfer on the beach. Saturday will notice.',
          to: 'groms-5',
        },
        {
          id: 'entries-closed',
          label: '"Entries closed Tuesday. Has to mean something."',
          skill: 'Integrity & Ethics',
          response:
            'Defensible — and Saturday a new kid stands on the sand watching a comp she asked to join. Rules held; the welcome mat didn’t.',
          to: 'groms-5',
          effects: { ledger: { ready: -3 } },
        },
      ],
    },
    'groms-5': {
      id: 'groms-5',
      kind: 'scene',
      stream: 'groms',
      eyebrow: 'Marshalling',
      narrative:
        'Twenty kids, five heats, one beach. On the day, every grom needs to know where to stand and when — or the PA spends the morning paging lost eight-year-olds.',
      prompt: 'How do kids find their heats?',
      customTo: 'groms-6',
      options: [
        {
          id: 'colour-zones',
          label: 'Colour zones: flags on the sand matching rashie colours — kids match their shirt to their flag.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'A system a nervous eight-year-old can run on autopilot. Parents can see it from the dune. The PA gets to stay fun instead of functional.',
          to: 'groms-6',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'list-tent',
          label: 'Laminated heat list on the marshalling tent — classic, readable, done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Works for everyone tall enough to read a tent. There will be a small crowd of groms at that laminate all morning, which is its own kind of system.',
          to: 'groms-6',
        },
        {
          id: 'call-them-up',
          label: 'The PA just calls kids up heat by heat — that’s what it’s for.',
          skill: 'Self-direction',
          response:
            'It’s also what wind is for. Every heat now starts with ninety seconds of "IS OLLIE HERE? OLLIE TO THE TENT" while the tide keeps its own schedule.',
          to: 'groms-6',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'groms-6': {
      id: 'groms-6',
      kind: 'talk',
      stream: 'groms',
      eyebrow: 'Friday night · the folder',
      narrative:
        'Friday night at the clubhouse. Kylie arrives with the lever-arch folder and puts it between you like a contract. The list becomes tomorrow in about twelve hours.',
      speaker: { name: 'Kylie', role: 'registrar mum · final pass' },
      dialogue: [
        'Right. Last look. Names, boards, medicals, emergency numbers.',
        'We can read the whole thing out loud together — twenty minutes, no surprises tomorrow.',
        'Or you can trust the folder. It IS a very good folder.',
      ],
      prompt: 'Lock the list, or trust the list?',
      customTo: 'HUB',
      options: [
        {
          id: 'read-through',
          label: 'Read every line out loud together — twenty minutes now beats one surprise at 7am.',
          skill: 'Judgement & Decision-Making',
          response:
            'Line fourteen: a nut allergy nobody had flagged for the sausage sizzle. Line nineteen: two kids sharing one board in back-to-back heats. Both fixed by 8pm. THAT’S why you read it out loud. Entries: LOCKED.',
          to: 'HUB',
          effects: { stream: 'groms', status: 'sorted', ledger: { ready: 3 } },
        },
        {
          id: 'trust-folder',
          label: 'Skim the summary page — Kylie’s folders don’t miss.',
          skill: 'Self-direction',
          response:
            'The folder is indeed very good. Whatever it missed, you’ll meet at 7am with everyone watching. Probably nothing. Probably.',
          to: 'HUB',
        },
        {
          id: 'two-maybes',
          label: '"Leave the two maybes on the list — they’ll show or they won’t."',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Two maybe-kids means two maybe-heats — the draw now has a wobble built in, and you’ll be re-jigging it on the sand while the tide takes notes.',
          to: 'HUB',
          effects: { stream: 'groms', status: 'shaky', ledger: { ready: -4 } },
        },
      ],
    },

    'safety-1': {
      id: 'safety-1',
      kind: 'scene',
      stream: 'safety',
      eyebrow: 'The water',
      narrative:
        "The point looks friendly until it isn't. Twenty kids under 14 in moving water needs more than optimism — it needs the surf club, in writing, on the day.",
      prompt: 'How do you lock in water safety?',
      customTo: 'safety-call',
      options: [
        {
          id: 'ring-baz',
          label: 'Ring Baz, the SLSC captain, before anything else gets booked.',
          skill: 'Judgement & Decision-Making',
          response: 'Baz picks up mid-gear-check. Somewhere behind him an outboard coughs to life.',
          to: 'safety-call',
          effects: { stream: 'safety', status: 'underway', ledger: { ready: 8 } },
        },
        {
          id: 'club-parents',
          label: 'Line up the strongest club parents as water cover — keep it in-house.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Strong swimmers, no rescue gear, no radios. You write the plan down, read it back, and ring Baz anyway.',
          to: 'safety-call',
          effects: { stream: 'safety', status: 'underway' },
        },
        {
          id: 'later-safety',
          label: 'The bank’s been mellow all month — sort safety closer to the day.',
          skill: 'Self-direction',
          response:
            "Mellow for the seniors. You watch a grom get rag-dolled on a two-footer at training and dial Baz from the sand.",
          to: 'safety-call',
          effects: { stream: 'safety', status: 'underway', ledger: { ready: -6 } },
        },
      ],
    },
    'safety-call': {
      id: 'safety-call',
      kind: 'call',
      stream: 'safety',
      eyebrow: 'On the phone',
      narrative: 'You called Baz. This is what Baz is saying:',
      speaker: { name: 'Baz', role: 'SLSC captain · zero sense of humour about water' },
      dialogue: [
        'Grom comp at the point. Good. Here’s how it works or it doesn’t happen.',
        'I’ll give you two IRB crews and a spotter tower — IF you run every heat inside the 7-to-11 window, before the tide swamps the bank.',
        'And my crews eat free at your canteen. That’s not negotiable, that’s tradition.',
      ],
      prompt: 'Baz’s terms are the ocean’s terms.',
      customTo: 'safety-3',
      options: [
        {
          id: 'take-terms',
          label: 'Take the terms whole: rebuild the schedule inside 7–11, feed the crews like kings.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'You redraw the runsheet that night around the tide, not your preferences. Baz texts back one word: "Sensible." Safety: LOCKED, in writing.',
          to: 'safety-3',
          effects: { stream: 'safety', status: 'sorted', days: 2, ledger: { ready: 16, window: 4 } },
        },
        {
          id: 'half-window',
          label: 'Negotiate: heats till noon — the forecast tide looks slow this week.',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"The forecast doesn\'t swim, mate." Baz gives you till 11:30 and makes you sign the risk line yourself. Safety: covered, with a pen-shaped memory.',
          to: 'safety-3',
          effects: { stream: 'safety', status: 'sorted', days: 2, ledger: { ready: 4, window: 5 } },
        },
        {
          id: 'parents-only',
          label: '"We\'ll manage in-house — club parents on boards. Thanks anyway."',
          skill: 'Judgement & Decision-Making',
          response:
            "A long pause. \"Your comp.\" No IRBs, no tower, and every parent on the beach Saturday will be doing your risk assessment with their eyes.",
          to: 'safety-3',
          effects: { stream: 'safety', status: 'shaky', days: 1, ledger: { ready: -14 } },
        },
      ],
    },

    'safety-3': {
      id: 'safety-3',
      kind: 'scene',
      stream: 'safety',
      eyebrow: 'The risk plan',
      narrative:
        'Whatever cover you’ve got Saturday, the club needs a safety plan on PAPER — who watches the water, who runs to the road to meet an ambulance, whose phone has every parent’s number. Boring until the exact second it isn’t.',
      prompt: 'How does the plan get written?',
      customTo: 'safety-4',
      options: [
        {
          id: 'one-pager',
          label: 'Write a one-pager tonight: names against jobs, taped inside the judges’ tent and the canteen.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'One page, five names, zero ambiguity. The canteen mums read it while the pie oven warms up, which is exactly who needs to know it.',
          to: 'safety-4',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'club-template',
          label: 'Dig out the club’s old template from the seniors’ comp and update the names.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The template is thorough and slightly haunted — three of the listed people moved away years ago. You fix what you spot and inherit what you don’t.',
          to: 'safety-4',
        },
        {
          id: 'in-heads',
          label: '"Everyone knows what to do — it’s a beach, not an airport."',
          skill: 'Self-direction',
          response:
            'Everyone knows ROUGHLY what to do, which on a good day is enough and on a bad day is a group of adults pointing at each other.',
          to: 'safety-4',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'safety-4': {
      id: 'safety-4',
      kind: 'text',
      stream: 'safety',
      eyebrow: 'Baz · 6:05am',
      narrative: 'Your phone goes off before the sun does. Baz texts like he’s paying by the letter.',
      speaker: { name: 'Baz', role: 'SLSC captain · up before the birds' },
      dialogue: [
        'Vest count. Every grom in a coloured comp vest, IN the water and ON the list. No vest no surf.',
        'Also need one adult per heat as beach marshal. Not watching their own kid. Good luck with that one.',
        'Confirm by tonight.',
      ],
      prompt: 'Two demands, one deadline.',
      customTo: 'safety-5',
      options: [
        {
          id: 'lock-both',
          label: 'Sort both today: count the vests at lunch, and recruit marshals from parents whose kids surf OTHER heats.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Eighteen vests, two borrowed from the boardriders up the coast, and a marshal roster where nobody guards their own child. Baz replies with a single thumbs up, which from Baz is a parade.',
          to: 'safety-5',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'vests-first',
          label: 'Confirm the vests now, promise the marshal roster "by Friday."',
          skill: 'Judgement & Decision-Making',
          response:
            'Half an answer buys half the calm. Friday you’ll be conscripting marshals at the school gate with a clipboard and pleading eyes.',
          to: 'safety-5',
        },
        {
          id: 'shell-be-right',
          label: 'Reply "all sorted 👍" and figure it out on the day.',
          skill: 'Self-direction',
          response:
            'Baz has forty years of translating "all sorted 👍" into its actual meaning. Saturday morning he counts the vests himself, slowly, in front of you.',
          to: 'safety-5',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'safety-5': {
      id: 'safety-5',
      kind: 'talk',
      stream: 'safety',
      eyebrow: 'The walk-through',
      narrative:
        'Friday arvo, low tide. Shaz — Baz’s 2IC, twice as fast and half as patient — walks the bank with you, reading the water like a page.',
      speaker: { name: 'Shaz', role: 'SLSC 2IC · reads rips for a living' },
      dialogue: [
        'See the dark strip past the second flag? That’s where the water leaves. Kids drift there without noticing.',
        'I want the heats run INSIDE the flags even when the waves look better outside. The little ones will follow the best waves if you let them.',
        'And put your strongest spotter on that strip. Not the tallest dad. The one who actually watches.',
      ],
      prompt: 'The ocean’s floor plan, explained once.',
      customTo: 'safety-6',
      options: [
        {
          id: 'mark-strip',
          label: 'Flag the drift strip with a third marker and brief every marshal on it by name.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'A strip of ocean gets a name and a watcher. Saturday, two groms drift toward it and get turned around before they know they were going. Nobody claps; that’s the point.',
          to: 'safety-6',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'note-it',
          label: 'Note it in the plan and mention it at the morning briefing.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'It goes in the plan between two other bullet points. Briefings at 6:45am reach about 60% of the brains present.',
          to: 'safety-6',
        },
        {
          id: 'looks-fine',
          label: '"The bank looks pretty mellow to me, honestly."',
          skill: 'Self-direction',
          response:
            'Shaz looks at you the way experts look at confidence. "It always does," she says, "from the sand."',
          to: 'safety-6',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'safety-6': {
      id: 'safety-6',
      kind: 'call',
      stream: 'safety',
      eyebrow: 'Friday night · one last number',
      narrative:
        'Friday, dark outside, runsheet done. One number left to ring before tomorrow gets real. You call Baz.',
      speaker: { name: 'Baz', role: 'SLSC captain · final word' },
      dialogue: [
        'Swell’s built a touch overnight, nothing silly. Yet.',
        'Run me through it: vests, marshals, the drift strip, and who calls a hold if I’m mid-rescue.',
        'Get through that list clean and I’ll see you at 6:30 with two crews. Stumble and we talk about what kind of comp you’re actually running.',
      ],
      prompt: 'The final read-back. Clean or not?',
      customTo: 'HUB',
      options: [
        {
          id: 'clean-readback',
          label: 'Read it back item by item — names, times, signals — like a pilot doing the checklist.',
          skill: 'Judgement & Decision-Making',
          response:
            'Ninety seconds, zero gaps. A long exhale down the line — Baz relaxing is a rare recorded event. "Righto. 6:30." Water safety: LOCKED, in writing, in his head, in yours.',
          to: 'HUB',
          effects: { stream: 'safety', status: 'sorted', ledger: { ready: 3 } },
        },
        {
          id: 'broad-strokes',
          label: 'Give him the broad strokes — the detail’s all in the plan document.',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"Documents don’t swim, mate." He accepts it, mostly. Tomorrow he’ll double-check the gaps himself, on your time.',
          to: 'HUB',
        },
        {
          id: 'skip-callback',
          label: 'Text instead — "all good for tmrw 👍" — it’s late.',
          skill: 'Self-direction',
          response:
            'The read-back you skipped is the exact five minutes where the gaps would have surfaced. They’ll surface tomorrow instead, at speed, in salt water.',
          to: 'HUB',
          effects: { stream: 'safety', status: 'shaky', ledger: { ready: -4 } },
        },
      ],
    },

    'heats-1': {
      id: 'heats-1',
      kind: 'scene',
      stream: 'heats',
      eyebrow: 'The draw',
      narrative:
        "The whiteboard is blank and everyone has opinions. Seed by age and the big under-14s flatten the littlies. Seed by ability and someone's mum wants a word about the word 'ability.'",
      prompt: 'How do you draw the heats?',
      customTo: 'heats-call',
      options: [
        {
          id: 'ability-bands',
          label: 'Draw by ability bands with friendly names — Dawn Patrol, The Point Crew, Grommets.',
          skill: 'Emotional Intelligence',
          response:
            'Nobody asks which band is "the good one" because the names give them nowhere to stand. You run it past Deano before inking it.',
          to: 'heats-call',
          effects: { stream: 'heats', status: 'underway', ledger: { ready: 8 } },
        },
        {
          id: 'age-only',
          label: 'Straight age divisions — objective, defensible, done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Clean on paper. Then you watch training: a tiny 13-year-old sharing water with kids twice her weight. You take the draft to Deano.',
          to: 'heats-call',
          effects: { stream: 'heats', status: 'underway', ledger: { ready: 2 } },
        },
        {
          id: 'random-draw',
          label: 'Random draw out of a bucket — fair’s fair.',
          skill: 'Self-direction',
          response:
            'The bucket has no idea what it\'s doing. Heat two is three first-timers and the club champion. Deano suggests, gently, a phone call.',
          to: 'heats-call',
          effects: { stream: 'heats', status: 'underway', ledger: { ready: -6 } },
        },
      ],
    },
    'heats-call': {
      id: 'heats-call',
      kind: 'call',
      stream: 'heats',
      eyebrow: 'On the phone',
      narrative: 'You called Deano. This is what Deano is saying:',
      speaker: { name: 'Deano', role: 'club president · forty summers here' },
      dialogue: [
        "Draw looks decent. One thing you won't have thought of.",
        'Ruby-Rose. First-ever comp, been sick with nerves all week. Her heat draw decides whether she paddles out at all.',
        'Put her with her two mates from training and she surfs. Split them up "for balance" and her mum reckons she won\'t leave the car.',
      ],
      prompt: 'One kid, one draw, one whole comp for her.',
      customTo: 'heats-3',
      options: [
        {
          id: 'mates-heat',
          label: 'Put Ruby-Rose with her mates and balance the OTHER heats around it.',
          skill: 'Emotional Intelligence',
          response:
            'The draw bends around one nervous kid, and no one will ever know. Deano inks the board: "That\'s comp directing, that is." Heats: DRAWN.',
          to: 'heats-3',
          effects: { stream: 'heats', status: 'sorted', days: 1, ledger: { ready: 16 } },
        },
        {
          id: 'fair-is-fair',
          label: 'Keep the balanced draw — one kid can’t bend the format.',
          skill: 'Integrity & Ethics',
          response:
            'Defensible. On the day, heat four runs one grom short and everyone on the sand knows exactly which car she\'s in. Heats: drawn, with a hollow spot.',
          to: 'heats-3',
          effects: { stream: 'heats', status: 'sorted', days: 1, ledger: { ready: -8 } },
        },
        {
          id: 'ask-her',
          label: 'Ring Ruby-Rose’s mum and ask what would actually help.',
          skill: 'Leadership & Influence',
          response:
            '"Just put her with Sasha. And don\'t make a thing of it." Done and done. Sometimes the answer is one question away. Heats: drawn.',
          to: 'heats-3',
          effects: { stream: 'heats', status: 'sorted', days: 1, ledger: { ready: 10 } },
        },
      ],
    },

    'heats-3': {
      id: 'heats-3',
      kind: 'scene',
      stream: 'heats',
      eyebrow: 'Publishing the draw',
      narrative:
        'The draw exists. Now it has to reach twenty families without starting twenty conversations. How it goes public decides how many opinions arrive with it.',
      prompt: 'How does the draw go out?',
      customTo: 'heats-4',
      options: [
        {
          id: 'names-times',
          label: 'Post it with heat TIMES and a one-line note on how the bands were drawn — answer the questions before they’re asked.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The note kills nine questions out of ten in their sleep. The tenth was always coming anyway.',
          to: 'heats-4',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'just-post',
          label: 'Pin the list to the club noticeboard and post a photo of it.',
          skill: 'Self-direction',
          response:
            'Clean and traditional. The group chat spends the evening zooming into a photo of laminated paper, generating theories.',
          to: 'heats-4',
        },
        {
          id: 'drip-feed',
          label: 'Tell each family just their OWN kid’s heat — less noise that way.',
          skill: 'Judgement & Decision-Making',
          response:
            'Twenty private messages later, nobody can see the whole picture — so everyone assumes the part they can’t see is unfair. Transparency was the shortcut.',
          to: 'heats-4',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'heats-4': {
      id: 'heats-4',
      kind: 'text',
      stream: 'heats',
      eyebrow: 'Craig · 8:12pm',
      narrative:
        'The tenth question arrives on schedule. Craig — Digger’s dad, three exclamation marks minimum — has seen the draw.',
      speaker: { name: 'Craig', role: 'Digger’s dad · types in bursts' },
      dialogue: [
        'Mate why is Digger in the SECOND band??? He smoked half those kids at training!!',
        'No disrespect to whoever drew this but he needs proper competition or what’s the point.',
        'Happy to discuss. Calling you in 5 unless you reply.',
      ],
      prompt: 'Four minutes to decide how this goes.',
      customTo: 'heats-5',
      options: [
        {
          id: 'ring-craig',
          label: 'Ring HIM first — two minutes of being heard beats twenty texts.',
          skill: 'Emotional Intelligence',
          response:
            'You explain the bands, he explains Digger’s backhand, honour is satisfied in four minutes flat. He ends the call offering to run the barbecue. Craigs just want to be met.',
          to: 'heats-5',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'text-logic',
          label: 'Reply with the seeding logic, politely and completely.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Correct, calm, and slightly radioactive in text form. He reads reasons; he wanted acknowledgement. Détente, not peace.',
          to: 'heats-5',
        },
        {
          id: 'leave-read',
          label: 'Leave it on read — the draw speaks for itself.',
          skill: 'Self-direction',
          response:
            'The draw does not, in fact, speak. Craig does — to three other dads by 9pm. Saturday now has a small weather system named Craig.',
          to: 'heats-5',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'heats-5': {
      id: 'heats-5',
      kind: 'talk',
      stream: 'heats',
      eyebrow: 'The judges',
      narrative:
        'Three judges, one folding table, forty years of combined opinions. Before Saturday they need ONE brief — especially for the first-timer heats, where what you reward is what kids learn surfing is.',
      speaker: { name: 'Marg', role: 'head judge · seen every comp since ’98' },
      dialogue: [
        'We can score it like a real comp — waves, turns, the lot. The good kids will win by a street.',
        'Or for the first-timers we weight it: paddling out counts, catching ANYTHING counts, standing up is a celebration.',
        'Tell me what Saturday is FOR and I’ll score that.',
      ],
      prompt: 'What is Saturday for?',
      customTo: 'heats-6',
      options: [
        {
          id: 'weight-courage',
          label: '"First-timer heats score courage — paddling, catching, standing. The open heats score surfing."',
          skill: 'Judgement & Decision-Making',
          response:
            'Marg writes it on the criteria sheet in pen. Saturday, a kid who stands up for one second gets a score and a roar. That kid surfs for the next ten years.',
          to: 'heats-6',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'straight-comp',
          label: '"Score it straight — it’s a comp, not a participation day."',
          skill: 'Integrity & Ethics',
          response:
            'Defensible, clean, and a little cold at the shallow end: the first-timer heat sheet will read 0.5, 0.5, 0.7, and a kid will learn the ocean keeps score.',
          to: 'heats-6',
        },
        {
          id: 'judges-call',
          label: '"You’re the judges — whatever you reckon."',
          skill: 'Self-direction',
          response:
            'Three judges, three private systems. By heat four the scores wobble between them and the dune notices before you do.',
          to: 'heats-6',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'heats-6': {
      id: 'heats-6',
      kind: 'scene',
      stream: 'heats',
      eyebrow: 'Friday · the board',
      narrative:
        'The whiteboard version of the draw is tomorrow’s single point of truth — and whiteboards meet weather, thumbs, and Trevor. One last decision protects it.',
      prompt: 'How does the draw survive Saturday?',
      customTo: 'HUB',
      options: [
        {
          id: 'laminate-spare',
          label: 'Laminate two copies, tape one in the judges’ tent, and pre-plan the no-show rule with Marg.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Rain, thumbs, and Trevor are all defeated in advance. When a grom no-shows at heat three, the rule already exists and nobody has to invent policy on wet sand. Heats: DRAWN, weatherproofed.',
          to: 'HUB',
          effects: { stream: 'heats', status: 'sorted', ledger: { ready: 3 } },
        },
        {
          id: 'board-only',
          label: 'The whiteboard’s fine under the marquee — it’s one day.',
          skill: 'Self-direction',
          response:
            'It IS mostly fine. One gust, one dropped towel, and heat five briefly becomes interpretive. Recoverable, with jogging.',
          to: 'HUB',
        },
        {
          id: 'redraw-morning',
          label: 'Actually — redraw everything Saturday 6am with final numbers. Freshest data.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Freshest data, zero buffer: your 6am is now a redraw, a reprint, and a queue of parents watching you do administration at dawn. The tide window doesn’t care that you’re busy.',
          to: 'HUB',
          effects: { stream: 'heats', status: 'shaky', ledger: { ready: -4 } },
        },
      ],
    },

    'beach-1': {
      id: 'beach-1',
      kind: 'scene',
      stream: 'beach',
      eyebrow: 'The beach',
      narrative:
        "A comp is a village that exists for six hours: tents, flags, a PA that hates sand, a judges' table, and forty parents who'll stand wherever you don't want them.",
      prompt: 'How does the village get built?',
      customTo: 'beach-call',
      options: [
        {
          id: 'ring-chen',
          label: 'Ring Mrs Chen — she ran the school fete like a military operation.',
          skill: 'Leadership & Influence',
          response: '"Send me a list and a 6am start time," she says, before you finish asking.',
          to: 'beach-call',
          effects: { stream: 'beach', status: 'underway', ledger: { ready: 8 } },
        },
        {
          id: 'do-it-yourself',
          label: 'Sketch the layout yourself tonight — it’s just tents and flags.',
          skill: 'Self-direction',
          response:
            "Your sketch is good. Your arms are two. You price out the 5am solo build, swallow, and ring Mrs Chen.",
          to: 'beach-call',
          effects: { stream: 'beach', status: 'underway' },
        },
        {
          id: 'morning-of',
          label: 'Wing the setup on the morning — beaches are self-explanatory.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'You picture forty parents, no shade, and a PA in a puddle at 6:45am. The picture rings Mrs Chen for you.',
          to: 'beach-call',
          effects: { stream: 'beach', status: 'underway', ledger: { ready: -6 } },
        },
      ],
    },
    'beach-call': {
      id: 'beach-call',
      kind: 'call',
      stream: 'beach',
      eyebrow: 'On the phone',
      narrative: 'You called Mrs Chen. This is what Mrs Chen is saying:',
      speaker: { name: 'Mrs Chen', role: 'parent army · ran the fete' },
      dialogue: [
        'I can give you six parents, two utes and every marquee in my garage.',
        'In exchange: the parent viewing area goes WHERE I SAY — up the dune, out of the judges\' eyeline. Last year a dad "helped" judge from behind the table.',
        'And somebody young and cheerful runs the PA. Not Trevor. You know why.',
      ],
      prompt: 'An army with two conditions.',
      customTo: 'beach-3',
      options: [
        {
          id: 'accept-army',
          label: 'Done and done — dune viewing, roped judge zone, and you find a Year 9 who loves a microphone.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Saturday, 7:40am: a tent village stands, parents perch happily on the dune, and the Year 9 on the PA is already doing nicknames. Beach: BUILT.',
          to: 'beach-3',
          effects: { stream: 'beach', status: 'sorted', days: 2, ledger: { ready: 16 } },
        },
        {
          id: 'tents-only',
          label: 'Take the marquees, skip the viewing rules — parents will stand where they stand.',
          skill: 'Judgement & Decision-Making',
          response:
            'The village goes up. By heat three there\'s a dad at the judges\' shoulder narrating scores. Mrs Chen looks at you across the sand. Beach: built, leaky.',
          to: 'beach-3',
          effects: { stream: 'beach', status: 'sorted', days: 2, ledger: { ready: 2 } },
        },
        {
          id: 'trevor',
          label: '"Trevor’s already offered to do the PA, though. It’d be rude to un-ask him."',
          skill: 'Emotional Intelligence',
          response:
            'Mrs Chen goes very quiet. Trevor opens the comp with a nineteen-minute anecdote about 1987. Kind decision, long morning. Beach: built, with commentary.',
          to: 'beach-3',
          effects: { stream: 'beach', status: 'shaky', days: 2, ledger: { ready: -8 } },
        },
      ],
    },

    'beach-3': {
      id: 'beach-3',
      kind: 'scene',
      stream: 'beach',
      eyebrow: 'The load list',
      narrative:
        'Two utes, one trailer, and a garage of gear that all has to arrive in the right ORDER — marquees before tables, PA before speeches, urn before anyone asks about tea. Load order is build order.',
      prompt: 'How do the utes get packed?',
      customTo: 'beach-4',
      options: [
        {
          id: 'reverse-load',
          label: 'Pack in reverse: first thing needed goes in LAST. Write the list on the trailer in chalk.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'At 6am the marquees come off first because they went in last. The chalk list makes six dads interchangeable, which is the entire trick of logistics.',
          to: 'beach-4',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'tetris-it',
          label: 'Pack for space — get everything in, sort it out on the sand.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Everything fits beautifully. At the beach, the first thing needed is under four other things, as tradition demands.',
          to: 'beach-4',
        },
        {
          id: 'whatever-fits',
          label: 'It’s tents and flags — chuck it in, she’ll be right.',
          skill: 'Self-direction',
          response:
            'She is mostly right. The judges’ table, however, is discovered at 7:15am to still be in the clubhouse, holding raffle tickets.',
          to: 'beach-4',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'beach-4': {
      id: 'beach-4',
      kind: 'talk',
      stream: 'beach',
      eyebrow: 'Trevor',
      narrative:
        'Trevor finds you at the clubhouse with the specific casualness of a man who has rehearsed. He has heard — everyone has heard — that the PA is going to "someone young."',
      speaker: { name: 'Trevor', role: 'club legend · nineteen-minute anecdotes' },
      dialogue: [
        'Not here to make a fuss. Did the PA in ’96, you know. And ’97 to 2019, but who’s counting.',
        'Young fella will do a fine job, I’m sure. Voice like a seagull, but fine.',
        'Just… if there’s anything else needs doing Saturday. I’m around. That’s all.',
      ],
      prompt: 'A proud man, asking sideways.',
      customTo: 'beach-5',
      options: [
        {
          id: 'starter-role',
          label: 'Give him a REAL job: official starter — the hooter, the countdowns, the drama.',
          skill: 'Emotional Intelligence',
          response:
            'Trevor accepts with enormous dignity and goes home to practise hooter technique. Saturday he starts every heat like it’s the Olympics, and the PA stays anecdote-free. Everybody won.',
          to: 'beach-5',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'straight-truth',
          label: 'Straight with him: the PA needed young energy this year, and you wanted him free to enjoy the day.',
          skill: 'Integrity & Ethics',
          response:
            'He takes it on the chin, mostly. Respect earned, warmth pending. He’ll watch heat one from a deliberate distance, then drift back by lunch.',
          to: 'beach-5',
        },
        {
          id: 'dodge-trevor',
          label: '"Nothing comes to mind, but I’ll let you know!" (Escape.)',
          skill: 'Self-direction',
          response:
            'Trevor knows a dodge when he receives one; he’s delivered thousands. Saturday he narrates the setup from a camp chair, to anyone, at length, adjacent to the PA.',
          to: 'beach-5',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'beach-5': {
      id: 'beach-5',
      kind: 'text',
      stream: 'beach',
      eyebrow: 'Mrs Chen · 9:03pm',
      narrative: 'A photo arrives: the beach, annotated in red like a battle plan. Mrs Chen is awake and optimising.',
      speaker: { name: 'Mrs Chen', role: 'parent army · sends maps at night' },
      dialogue: [
        'Site map attached. One decision I can’t make for you: judges’ tent at position A or B.',
        'A = perfect view of the break, sun in their eyes by 9am. B = shaded all day, slightly side-on view.',
        'Squinting judges are grumpy judges. Side-on judges miss the close ones. Pick.',
      ],
      prompt: 'A or B. There is no C.',
      customTo: 'beach-6',
      options: [
        {
          id: 'shade-b',
          label: 'B — comfort for six hours beats a perfect view for two. Put a spotter at the waterline for the close calls.',
          skill: 'Judgement & Decision-Making',
          response:
            'Shaded judges, a spotter relaying the tight finishes, and Marg’s mood holding all day. The system covers what the angle gives up.',
          to: 'beach-6',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'view-a',
          label: 'A — judges need the view, that’s the job. Get them hats and a beach umbrella.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The view is glorious until 9:15, when three judges begin scoring silhouettes. The umbrella helps the way umbrellas do: intermittently, then airborne.',
          to: 'beach-6',
        },
        {
          id: 'let-chen-pick',
          label: '"You pick — you’re better at this than me 😅"',
          skill: 'Self-direction',
          response:
            'She picks B in four seconds, which you could have done. The map comes back annotated: "Decisions delegated are fine. Decisions AVOIDED are a habit. — MC"',
          to: 'beach-6',
          effects: { ledger: { ready: -2 } },
        },
      ],
    },
    'beach-6': {
      id: 'beach-6',
      kind: 'scene',
      stream: 'beach',
      eyebrow: 'Friday 5pm · the stake-out',
      narrative:
        'Last light on an empty beach. You can walk the site now with tape and pegs — tent here, PA there, flags so — or trust that 6am will sort itself with enough shouting.',
      prompt: 'Stake it out tonight, or build cold tomorrow?',
      customTo: 'HUB',
      options: [
        {
          id: 'peg-tonight',
          label: 'Walk it tonight: pegs, tape, chalk arrows — so 6am is assembly, not invention.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Twenty minutes of pegs turns tomorrow’s build into IKEA-with-instructions. Mrs Chen’s crew hits the sand at 6:00 and a village exists by 7:15. Beach: BUILT before it’s built.',
          to: 'HUB',
          effects: { stream: 'beach', status: 'sorted', ledger: { ready: 3 } },
        },
        {
          id: 'photo-plan',
          label: 'Take photos of the site map to everyone’s phones — that’ll guide the build.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Six people, six phones, six zoom levels. The village assembles at 85% of the plan, which is fine, and 40 minutes late, which might not be.',
          to: 'HUB',
        },
        {
          id: 'sixam-sort',
          label: 'It’s a beach — 6am with enough dads sorts itself.',
          skill: 'Self-direction',
          response:
            'It sorts itself the way traffic sorts itself. The build finishes as the first groms arrive, and the judges’ tent faces a direction chosen by momentum.',
          to: 'HUB',
          effects: { stream: 'beach', status: 'shaky', ledger: { ready: -4 } },
        },
      ],
    },

    'prizes-1': {
      id: 'prizes-1',
      kind: 'scene',
      stream: 'prizes',
      eyebrow: 'The prizes',
      narrative:
        "Trophies for the podium, something for every first-timer, and the club account holds $180. Tina's surf shop faces the carpark — she sees every board that goes in the water.",
      prompt: 'Where do the prizes come from?',
      customTo: 'prizes-call',
      options: [
        {
          id: 'pitch-tina',
          label: 'Walk into Tina’s with an actual pitch: banner spot + first-timers wearing her rashies in photos.',
          skill: 'Leadership & Influence',
          response:
            'Tina listens with one eyebrow up — her version of taking you seriously. Then she picks up the phone to make it official.',
          to: 'prizes-call',
          effects: { stream: 'prizes', status: 'underway', ledger: { ready: 8 } },
        },
        {
          id: 'buy-cheap',
          label: 'Spend the $180 on medals and call it done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Medals ordered. It works, thinly — and then Tina calls the club: "Why didn\'t anyone ASK me about the grom comp?"',
          to: 'prizes-call',
          effects: { stream: 'prizes', status: 'underway' },
        },
        {
          id: 'skip-prizes',
          label: 'Kids surf for the love of it — skip prizes, save the money.',
          skill: 'Self-direction',
          response:
            "They do surf for love. They also count trophies like dragons count gold. Deano forwards you Tina's number without comment.",
          to: 'prizes-call',
          effects: { stream: 'prizes', status: 'underway', ledger: { ready: -6 } },
        },
      ],
    },
    'prizes-call': {
      id: 'prizes-call',
      kind: 'call',
      stream: 'prizes',
      eyebrow: 'On the phone',
      narrative: 'You called Tina. This is what Tina is saying:',
      speaker: { name: 'Tina', role: 'surf shop owner · sponsors who she likes' },
      dialogue: [
        "A grom comp with eight first-timers? That's the best thing this club's done in years.",
        'Here\'s my offer: trophies for the podiums, a $30 voucher for every single first-timer, and demo foamies on the sand all day.',
        'One condition — the vouchers get handed out ON the podium, by name, with the PA saying it. First comps should be loud.',
      ],
      prompt: 'Tina wants the first-timers famous.',
      customTo: 'prizes-3',
      options: [
        {
          id: 'podium-moment',
          label: 'Build a whole first-timers podium moment into the schedule — every name, full PA, photos.',
          skill: 'Emotional Intelligence',
          response:
            'You put it in the runsheet as its own event. Eight kids are about to hear a beach cheer their name. Prizes: SORTED — better than sorted.',
          to: 'prizes-3',
          effects: { stream: 'prizes', status: 'sorted', days: 1, ledger: { ready: 16 } },
        },
        {
          id: 'take-quietly',
          label: 'Take the deal, but keep the ceremony short — the tide window is tight.',
          skill: 'Judgement & Decision-Making',
          response:
            'Fair call on a tight day. Tina trims the vouchers to podium-only and half the magic goes with it. Prizes: sorted, standard.',
          to: 'prizes-3',
          effects: { stream: 'prizes', status: 'sorted', days: 1, ledger: { ready: 4 } },
        },
        {
          id: 'counter-cash',
          label: 'Counter: "Could we do cash for the club instead of vouchers?"',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"I sell surf gear, love, not sponsorships." The eyebrow comes down. You keep the trophies and lose the shine. Prizes: covered, coolly.',
          to: 'prizes-3',
          effects: { stream: 'prizes', status: 'shaky', days: 1, ledger: { ready: -8 } },
        },
      ],
    },

    'prizes-3': {
      id: 'prizes-3',
      kind: 'scene',
      stream: 'prizes',
      eyebrow: 'The envelopes',
      narrative:
        'Eight vouchers, eight first-timers. Handed over as "here you go," they’re paper. Handed over RIGHT, they’re the thing a kid keeps in a drawer for years. Detail is the difference.',
      prompt: 'How do the vouchers get done?',
      customTo: 'prizes-4',
      options: [
        {
          id: 'named-envelopes',
          label: 'A named envelope for each kid — first name huge, club logo, "FIRST EVER COMP" across the seal.',
          skill: 'Emotional Intelligence',
          response:
            'An hour with texta and the good paper. Eight envelopes that look like they matter, because they do.',
          to: 'prizes-4',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'neat-stack',
          label: 'Vouchers in a neat labelled stack at the judges’ table — efficient, findable.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Tidy and fine. On the podium they’ll be handed over like receipts — the value arrives, the moment doesn’t.',
          to: 'prizes-4',
        },
        {
          id: 'day-of-sort',
          label: 'They’re vouchers — sort them on the day.',
          skill: 'Self-direction',
          response:
            'On the day, "sorting" happens during heat five, on a windy table, and one voucher takes a short solo flight toward the dunes.',
          to: 'prizes-4',
          effects: { ledger: { ready: -4 } },
        },
      ],
    },
    'prizes-4': {
      id: 'prizes-4',
      kind: 'text',
      stream: 'prizes',
      eyebrow: 'Tina · lunchtime',
      narrative: 'Tina texts in bursts, like her shop bell keeps interrupting.',
      speaker: { name: 'Tina', role: 'surf shop · knows everyone' },
      dialogue: [
        'Local paper rang. They want a photo Saturday — first-timers with the demo boards, my banner behind.',
        'Great for the club, great for me, obviously. But eight kids, one camera, mid-comp.',
        'You run the day. Tell me when, or tell me no.',
      ],
      prompt: 'Free press, mid-comp. Handle it.',
      customTo: 'prizes-5',
      options: [
        {
          id: 'slot-photo',
          label: 'Yes — slot it in the lunch break, tell the eight families TODAY, and give the paper a 15-minute window.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'A photo with a fence around it: one window, pre-warned parents, zero heats disturbed. Tina texts back a sunglasses emoji, which is her highest honour.',
          to: 'prizes-5',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'vague-yes',
          label: '"Yeah should be fine, we’ll find a moment on the day."',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"A moment" on comp day is a unicorn. The photographer will arrive during heat three and begin hunting one, with you as the guide.',
          to: 'prizes-5',
        },
        {
          id: 'no-press',
          label: 'No — the day’s complicated enough without cameras.',
          skill: 'Judgement & Decision-Making',
          response:
            'Simpler day, smaller day. Tina takes it fine; the club Facebook mums, upon learning later, do not. Eight kids miss a clipping their grandmas would have framed.',
          to: 'prizes-5',
          effects: { ledger: { ready: -2 } },
        },
      ],
    },
    'prizes-5': {
      id: 'prizes-5',
      kind: 'call',
      stream: 'prizes',
      eyebrow: 'Bruce the engraver',
      narrative:
        'The trophies exist; the nameplates don’t. Bruce engraves everything in town and answers the phone like you’ve interrupted surgery. You called Bruce.',
      speaker: { name: 'Bruce', role: 'engraver · zero tolerance for typos' },
      dialogue: [
        'Trophies by Friday, yes, IF I get final wording today. Not tonight. Today.',
        'And I engrave what you SEND. Last year a netball club sent me "Under 11s Chapions." Guess what forty parents saw.',
        'Spell every name like it’s your own. Read it twice. Send it once.',
      ],
      prompt: 'Wording due today. How careful is careful?',
      customTo: 'prizes-6',
      options: [
        {
          id: 'triple-check',
          label: 'Cross-check every name against Kylie’s entry forms, get one other person to proofread, send by 3pm.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Two passes catch a "Kayde/Kade" and one surname with a silent H nobody would have guessed. Bruce replies "received. acceptable." — practically a hug.',
          to: 'prizes-6',
          effects: { ledger: { ready: 2 } },
        },
        {
          id: 'from-memory',
          label: 'Type the list from memory — you know these kids.',
          skill: 'Self-direction',
          response:
            'You know these kids VERBALLY. Spelling is a different sport. Odds are decent; odds are not a proofread.',
          to: 'prizes-6',
          effects: { ledger: { ready: -3 } },
        },
        {
          id: 'generic-plates',
          label: 'Skip names — "1st Place" plates only, safe and reusable.',
          skill: 'Judgement & Decision-Making',
          response:
            'Unmistypeable, uncollectable. A trophy with your name outlives a trophy with your rank by about thirty years of shelf time.',
          to: 'prizes-6',
        },
      ],
    },
    'prizes-6': {
      id: 'prizes-6',
      kind: 'talk',
      stream: 'prizes',
      eyebrow: 'Friday · the run-sheet',
      narrative:
        'Tina closes the shop early and walks the podium moment with you on the actual sand — where the kids stand, who says names, where the vouchers sit. Rehearsal is respect.',
      speaker: { name: 'Tina', role: 'sponsor · wants it loud' },
      dialogue: [
        'Walk it with me. Kids come up HERE, envelopes sit THERE, PA reads the name, pause for the cheer.',
        'The pause is the whole thing. Read-name-hand-envelope-next is a queue. Read name, WAIT, let the beach make noise — that’s a memory.',
        'Lock the order now or it’ll get eaten by the schedule tomorrow, and I’ve seen that happen to better moments.',
      ],
      prompt: 'Lock the moment, or leave it to the day?',
      customTo: 'HUB',
      options: [
        {
          id: 'lock-runsheet',
          label: 'Lock it: the first-timer ceremony gets its own run-sheet line, a named MC, and Tina’s pause written in.',
          skill: 'Judgement & Decision-Making',
          response:
            'It’s in the schedule in pen, between the semis and the final, where nothing can eat it. Eight cheers are now guaranteed structural features of Saturday. Prizes: SORTED, staged.',
          to: 'HUB',
          effects: { stream: 'prizes', status: 'sorted', ledger: { ready: 3 } },
        },
        {
          id: 'know-the-gist',
          label: '"We’ve got the gist — it’ll flow on the day."',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The gist survives contact with Saturday at about 70%. The cheers happen; two kids get read out mid-walk and the pause gets trimmed by a keen MC.',
          to: 'HUB',
        },
        {
          id: 'squeeze-end',
          label: 'Bolt it onto the end of the main presentation — one ceremony, done.',
          skill: 'Self-direction',
          response:
            'By the end, half the crowd is folding chairs and the first-timers get their moment as background noise to packing up. Tina watches with the eyebrow. The low one.',
          to: 'HUB',
          effects: { stream: 'prizes', status: 'shaky', ledger: { ready: -4 } },
        },
      ],
    },

    'comp-swell': {
      id: 'comp-swell',
      kind: 'scene',
      eyebrow: 'Complication · the swell jumps',
      narrative:
        "Friday night the buoy goes rogue: the swell jumps two foot overnight. Saturday's waves will be proper. Baz's crews are locked and placed — but the littlest groms will be looking at the biggest surf of their lives.",
      prompt: 'Bigger waves, same kids. Adjust.',
      customTo: 'finale',
      options: [
        {
          id: 'move-inside',
          label: 'Shift the first-timer heats to the inside reform — smaller, safer, still real waves — and tell every parent tonight.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Baz repositions a crew without being asked twice. The littlies get waves sized for their courage, and the parents got told before they had to wonder. The comp bends; it doesn\'t break.',
          to: 'finale',
          effects: { days: 1, ledger: { ready: 16, swell: 2 } },
        },
        {
          id: 'run-as-drawn',
          label: 'Run it as drawn — groms are tougher than their parents think.',
          skill: 'Self-direction',
          response:
            'Some are. Two aren\'t: heat one ends with a rescue-adjacent paddle assist and a mum you\'ll be apologising to for a season.',
          to: 'finale',
          effects: { ledger: { ready: -10, swell: 2 } },
        },
        {
          id: 'delay-decide',
          label: 'Decide at 6am on the sand with Baz.',
          skill: 'Judgement & Decision-Making',
          response:
            'Defensible — but 6am decisions ripple: heats redrawn on the fly, parents told nothing overnight, and twenty minutes of your window gone to a huddle.',
          to: 'finale',
          effects: { ledger: { ready: 4, swell: 2, window: -1 } },
        },
      ],
    },
    'comp-rip': {
      id: 'comp-rip',
      kind: 'scene',
      eyebrow: 'Complication · the rip',
      narrative:
        "Mid-comp Saturday, the bank shifts and a rip opens beside the takeoff — with heat five IN the water and no IRB anywhere near it, because there is no IRB. The safety you didn't lock is the gap everyone can suddenly see.",
      prompt: 'Kids in the water, a rip, and no rescue cover. Now.',
      customTo: 'finale',
      options: [
        {
          id: 'horn-now',
          label: 'HORN. Everyone in, comp paused, and you personally ring Baz to beg a crew for the afternoon.',
          skill: 'Judgement & Decision-Making',
          response:
            'The heat re-runs forty minutes later with an IRB idling on the shoulder and your pride in Baz\'s glovebox. "Told you," is all he says. Worth it.',
          to: 'finale',
          effects: { days: 1, ledger: { ready: 8 } },
        },
        {
          id: 'strong-dads',
          label: 'Send the two strongest dads out on longboards to shepherd the heat through.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'It holds — barely, visibly. Every parent on the sand watches the improvisation and understands exactly what it is.',
          to: 'finale',
          effects: { ledger: { ready: -4 } },
        },
        {
          id: 'push-through',
          label: 'The kids are all strong swimmers — finish the heat, then reassess.',
          skill: 'Self-direction',
          response:
            "The heat finishes. A grom comes in two hundred metres down the beach, crying, fine. 'Fine' is doing heavy lifting in that sentence, and everyone knows it.",
          to: 'finale',
          effects: { ledger: { ready: -14 } },
        },
      ],
    },

    finale: {
      id: 'finale',
      kind: 'scene',
      eyebrow: 'Comp day · the last heat',
      narrative:
        "The final, and the tide is filling in fast — the window Baz drew is closing. You can squeeze the final onto the fading point bank, move everyone to the small clean inside runner, or call it on points and skip the final.",
      prompt: 'How does the grom comp end?',
      customTo: 'END',
      options: [
        {
          id: 'inside-final',
          label: 'Move the final to the inside runner — waist-high, clean, every wave in front of the crowd.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Four kids trade the lead for fifteen minutes in waves everyone on the beach can see. The hooter sounds and the sand ROARS. Small waves, big ending.',
          to: 'END',
          effects: { ledger: { ready: 16 } },
        },
        {
          id: 'point-final',
          label: 'Send it on the point — a proper final on the proper wave, tight margins.',
          skill: 'Judgement & Decision-Making',
          response:
            'Two set waves come through in fifteen minutes. Two kids score, two chase lumps of tide. The trophy feels a little like weather.',
          to: 'END',
          effects: { ledger: { ready: -6 } },
        },
        {
          id: 'points-call',
          label: 'Call it on heat points — no final, everyone in before the tide.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Tidy and flat. The kid who missed first by half a point will mention the final that never happened at every barbecue until Christmas.',
          to: 'END',
          effects: { ledger: { ready: 2 } },
        },
      ],
    },
  },
  threadsBeforeFinale: 3,
  complication: { checkStream: 'safety', whenSorted: 'comp-swell', otherwise: 'comp-rip' },
  finale: 'finale',
  endings: {
    high: {
      title: 'Deano just handed you next year’s Open.',
      body: 'Every grom surfed, the first-timers got their names roared across a beach, and the ocean threw its curveball at a comp that was ready for it. Deano finds you stacking marquees: "Same again next year. Bigger." Every good hour of the day traces back to a call you made before it mattered.{neglectLine}',
    },
    mid: {
      title: 'A real comp. The ocean nearly ran it for you.',
      body: 'Kids surfed, parents clapped, trophies went home in car seats. A couple of moments ran thinner than they needed to — the ones where the day asked you to adjust early and you adjusted late. You can name them, which is exactly how comp directors get good.{neglectLine}',
    },
    low: {
      title: 'Everyone went home safe. That was closer than it should’ve been.',
      body: 'Between the gaps in the plan and the ocean\'s opinions, the comp ran on luck and improvisation. Deano\'s debrief is one sentence: "The water tells you everything a week early, mate." Next time, listen a week early.{neglectLine}',
    },
  },
}

/* ------------------------------------------------------------------ */
/* FARM — Harvest week                                                 */
/* ------------------------------------------------------------------ */

export const FARM_SIM: JourneySimScript = {
  id: 'sim-farm-harvest',
  title: 'Harvest Week',
  club: 'Your uncle’s place · 900 acres',
  goalLabel: 'HARVEST WEEK',
  daysTotal: 5,
  theme: {
    // Pre-dawn paddock world — dark olive and wheat-gold, headlights in
    // stubble. Reads nothing like the ocean teal or the market amber.
    background: 'linear-gradient(180deg, #10130a 0%, #1c2410 45%, #2e3414 100%)',
    accent: '#e8c15a',
    topBar: 'rgba(16, 19, 10, 0.85)',
  },
  ledger: {
    primaryKey: 'tonnes',
    keys: {
      tonnes: { label: 'In the silo (t)', format: 'count', start: 0 },
      // A countdown key that keeps the default up-good direction on
      // purpose: it only ever moves via authored NEGATIVE deltas, so every
      // spent hour renders amber — the storm clock always reads as cost.
      // (Authored dramaturgy, not simulation — it may drift from the day
      // counter, and that's fine.)
      hours: { label: 'Dry hours left', format: 'hours', start: 72, min: 0 },
    },
    tierThresholds: { high: 240, mid: 130 },
    cardHead: 'Silo docket',
  },
  mechanicLabel: 'Storm clock + silo',
  arrival: {
    beats: [
      'Monday, 6am. Your uncle spreads the paddock map across the ute bonnet and weighs the corners down with spanners.',
      '"Storm front Thursday night, {name}. You’re running the ground game this week." He taps the river flat twice and gets in the cab.',
      'Every dry hour from here is one you spend or bank.',
    ],
    mission: {
      headline: 'Get the harvest in before the storm.',
      points: [
        'Fill the silo — 240 tonnes banked is a great week.',
        'The dry-hours clock only runs down. Spend it where it counts.',
      ],
    },
  },
  hubReturn: {
    eyebrow: 'back at the ute',
    narrative: 'One thing squared away — the map on the bonnet still has corners.',
    prompt: 'What do you sort next?',
  },
  intro: {
    eyebrow: 'Monday 6am · the ute bonnet',
    narrative:
      "Your uncle spreads the paddock map across the bonnet and weighs the corners down with spanners. \"Storm front Thursday night, {name}. You're running the ground game this week — crew, machines, logistics. I'm on the header.\" He taps the river flat twice and gets in the cab.",
    prompt: 'Four days. Where do you start?',
  },
  streams: {
    header: { label: 'The machines', entry: 'header-1', doorLabel: 'Check the machines' },
    crew: { label: 'The crew', entry: 'crew-1', doorLabel: 'Set up the crew' },
    paddocks: { label: 'Paddock order', entry: 'paddocks-1', doorLabel: 'Plan the paddock order' },
    weather: { label: 'The storm', entry: 'weather-1', doorLabel: 'Get ahead of the storm' },
    silo: { label: 'Trucks & silo', entry: 'silo-1', doorLabel: 'Book the trucks' },
  },
  nodes: {
    'header-1': {
      id: 'header-1',
      kind: 'scene',
      stream: 'header',
      eyebrow: 'The shed',
      narrative:
        "Davo — forty harvests, hears machines like doctors hear hearts — reckons the header's making 'a new noise.' Your uncle, over the radio: 'She always makes noises. Keep her rolling.' Both of them are waiting on you.",
      prompt: 'The most expensive machine on the farm has an opinion.',
      customTo: 'header-call',
      options: [
        {
          id: 'ring-blue',
          label: 'Ring Blue the mechanic — describe the noise while Davo listens in.',
          skill: 'Reasoning & Critical Thinking',
          response: 'Blue answers from under something diesel. "Make the noise with your mouth. Go on."',
          to: 'header-call',
          effects: { stream: 'header', status: 'underway', ledger: { hours: -1 } },
        },
        {
          id: 'quick-look',
          label: 'Stop for twenty minutes and eyeball it with Davo first.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Davo finds heat where heat shouldn\'t be — a bearing running warm. You ring Blue with actual information.',
          to: 'header-call',
          effects: { stream: 'header', status: 'underway', ledger: { hours: -2 } },
        },
        {
          id: 'push-on',
          label: 'Uncle said roll. Roll — check it tonight after dark.',
          skill: 'Self-direction',
          response:
            "All day the noise gets a semitone worse. By dark, Davo's silence is louder than the header. You ring Blue with the torch in your teeth.",
          to: 'header-call',
          effects: { stream: 'header', status: 'underway', ledger: { hours: -4 } },
        },
      ],
    },
    'header-call': {
      id: 'header-call',
      kind: 'call',
      stream: 'header',
      eyebrow: 'On the phone',
      narrative: 'You called Blue. This is what Blue is saying:',
      speaker: { name: 'Blue', role: 'mechanic · fixes half the district' },
      dialogue: [
        "That's a bearing, that is. Front drum, I'd put money on it.",
        "Here's your maths: I come Wednesday it's a two-hour job and $300. She lets go mid-paddock, it's two DAYS and four grand — in HARVEST week.",
        'I can squeeze you in tomorrow 6am, before I start at the Hendersons. One window. Your call.',
      ],
      prompt: 'A two-hour job now or a two-day disaster later. Probably.',
      customTo: 'header-3',
      options: [
        {
          id: 'book-blue',
          label: 'Book the 6am. The header stops for two hours tomorrow, storm or no storm.',
          skill: 'Judgement & Decision-Making',
          response:
            'Blue pulls a bearing the colour of bad news out of the drum at 6:40am. "Day and a half, tops, before she let go." Your uncle looks at the part, then at you, and says nothing — the good kind. Machines: SOUND.',
          to: 'header-3',
          effects: { stream: 'header', status: 'sorted', days: 1, ledger: { tonnes: 30, hours: -14 } },
        },
        {
          id: 'nurse-it',
          label: '"Talk Davo through babying it — slower drum speed, grease every smoko. We\'ll make it to Friday."',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Blue exhales. "Might hold. Grease it like you love it." It holds — at 80% pace, with Davo\'s ear cocked all week. Machines: limping on purpose.',
          to: 'header-3',
          effects: { stream: 'header', status: 'sorted', days: 1, ledger: { tonnes: 20, hours: -14 } },
        },
        {
          id: 'risk-it',
          label: '"Every hour counts this week. She’s made noises for years — run it."',
          skill: 'Self-direction',
          response:
            '"Your funeral. Keep my number handy." Every rattle for the rest of the week sounds like four grand. Machines: a bet you\'re still holding.',
          to: 'header-3',
          effects: { stream: 'header', status: 'shaky', days: 0, ledger: { hours: -2 } },
        },
      ],
    },

    'header-3': {
      id: 'header-3',
      kind: 'scene',
      stream: 'header',
      eyebrow: 'The field kit',
      narrative:
        'Blue’s parting advice, free of charge: "The breakdown that kills you is the one you drive back to the shed for." The ute can carry a field kit — belts, filters, a spare bearing, the good grease gun — or space for more fuel.',
      prompt: 'What rides in the ute all week?',
      customTo: 'header-4',
      options: [
        {
          id: 'stock-kit',
          label: 'Build the kit tonight from Blue’s list — every likely part, labelled, in one crate.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'One crate, eleven parts, a laminated list. Wednesday a belt lets go mid-paddock and costs eleven minutes instead of half a day. The crate pays for itself before lunch.',
          to: 'header-4',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'usual-spares',
          label: 'Chuck in the usual spares — the shed’s only ten minutes away.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Ten minutes there, ten back, and ten finding the part in the shed’s archaeology. "Ten minutes away" is farm maths for forty.',
          to: 'header-4',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'fuel-space',
          label: 'Fuel takes the space — breakdowns are Blue’s problem now.',
          skill: 'Self-direction',
          response:
            'Blue is one man with a district of customers in storm week. Being on his list is not the same as being at the front of it.',
          to: 'header-4',
          effects: { ledger: { hours: -4 } },
        },
      ],
    },
    'header-4': {
      id: 'header-4',
      kind: 'talk',
      stream: 'header',
      eyebrow: 'The morning listen',
      narrative:
        'Next dawn, Davo waves you over to the header with two mugs of tea and an agenda. He wants to teach you something forty harvests taught him.',
      speaker: { name: 'Davo', role: 'old hand · hears machines like heartbeats' },
      dialogue: [
        'Every morning, before she works: walk around her once, slow. Hand on the panels. Listen to her idle.',
        'A machine tells you the day before. New rattle, warm bearing, belt singing a bit high — she TELLS you.',
        'Do the walk with me now and every dawn after, or trust the gauges. Gauges are for after it’s already wrong.',
      ],
      prompt: 'Five minutes every dawn, or trust the dashboard?',
      customTo: 'header-5',
      options: [
        {
          id: 'learn-walk',
          label: 'Do the walk with him every morning — hands, ears, the lot.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'By Wednesday you can hear the difference between a happy idle and a Tuesday idle. It’s the cheapest instrument on the farm and it lives in your ears now.',
          to: 'header-5',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'sometimes-walk',
          label: 'Join when you can — mornings are busy and the roster needs you too.',
          skill: 'Judgement & Decision-Making',
          response:
            'Two walks out of five. Davo covers the gaps without being asked, which is both a relief and a small silent grade on your report card.',
          to: 'header-5',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'trust-gauges',
          label: '"She’s got sensors for all that, Davo."',
          skill: 'Self-direction',
          response:
            '"She’s got sensors for what the ENGINEERS worried about." He does the walk alone, every dawn, and tells you nothing unless you ask. You’ve made knowledge optional.',
          to: 'header-5',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'header-5': {
      id: 'header-5',
      kind: 'text',
      stream: 'header',
      eyebrow: 'Blue · 8:51pm',
      narrative: 'Blue texts the way he talks: like punctuation costs extra.',
      speaker: { name: 'Blue', role: 'mechanic · billing hours somewhere' },
      dialogue: [
        'invoice attached. also.',
        'while i was under her — chaser bin left rear tyre. sidewalls cracked. not TODAY bad. this-week bad, loaded, on stubble.',
        'got one matching tyre in the shop. henderson asked about it monday. first in best dressed.',
      ],
      prompt: 'A tyre you didn’t budget, a rival who asked first.',
      customTo: 'header-6',
      options: [
        {
          id: 'buy-tyre',
          label: 'Buy it tonight — a loaded chaser on a blown sidewall is a tipped chaser.',
          skill: 'Judgement & Decision-Making',
          response:
            'Fitted by smoko tomorrow. Thursday the old tyre comes off looking like dried riverbed, and everyone who sees it goes quiet for a second.',
          to: 'header-6',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'nurse-tyre',
          label: 'Run it easy — lighter loads, no sharp turns, check it every fill.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Lighter loads means more trips means more hours. The tyre holds, the maths doesn’t, quite.',
          to: 'header-6',
          effects: { ledger: { hours: -3 } },
        },
        {
          id: 'let-henderson',
          label: 'Let Henderson have it — your tyres always look like that.',
          skill: 'Self-direction',
          response:
            'They do always look like that. That’s not the reassurance you think it is, and now the only matching tyre in town works for the competition.',
          to: 'header-6',
          effects: { ledger: { hours: -4 } },
        },
      ],
    },
    'header-6': {
      id: 'header-6',
      kind: 'scene',
      stream: 'header',
      eyebrow: 'Dusk · the grease gun',
      narrative:
        'Machines survive harvest week on ritual: grease points every night, fuel filters checked, chains eyeballed under a torch. The ritual needs an owner or it becomes a rumour.',
      prompt: 'Who owns the nightly once-over?',
      customTo: 'HUB',
      options: [
        {
          id: 'roster-ritual',
          label: 'Roster it: you and Davo alternate nights, list on the shed wall, initialled when done.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Initials on a list — embarrassingly simple, completely effective. Every machine starts every dawn like it’s been to a spa. Machines: MINDED, nightly.',
          to: 'HUB',
          effects: { stream: 'header', status: 'sorted', ledger: { tonnes: 10, hours: -2 } },
        },
        {
          id: 'when-time',
          label: 'Grease when there’s time — the week will find its rhythm.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The week’s rhythm turns out to be a drum solo. Grease happens three nights of five, which is the mechanical equivalent of mostly brushing your teeth.',
          to: 'HUB',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'machines-tough',
          label: 'She’s a work machine, not a show pony — run her.',
          skill: 'Self-direction',
          response:
            'Work machines keep score quietly. Every skipped night is a small loan from the gearbox, and gearboxes charge interest in harvest week.',
          to: 'HUB',
          effects: { stream: 'header', status: 'shaky', ledger: { hours: -4 } },
        },
      ],
    },

    'crew-1': {
      id: 'crew-1',
      kind: 'scene',
      stream: 'crew',
      eyebrow: 'The crew',
      narrative:
        "Five people, four days, thirty-eight degrees forecast for Wednesday. Davo won't admit heat exists, the two backpackers are keen but green, and your cousin Sock drives the chaser bin like it owes him money.",
      prompt: 'How do you set the crew up to last the week?',
      customTo: 'crew-call',
      options: [
        {
          id: 'ring-davo',
          label: 'Ring Davo tonight and build the roster WITH him — his knowledge, your spreadsheet.',
          skill: 'Emotional Intelligence',
          response: 'Davo answers on the ninth ring, because answering fast is for city people.',
          to: 'crew-call',
          effects: { stream: 'crew', status: 'underway', ledger: { hours: -1 } },
        },
        {
          id: 'post-roster',
          label: 'Write the roster yourself and stick it in the shed — clean lines, no debates.',
          skill: 'Self-direction',
          response:
            "Clean lines, one problem: you've got Davo raking in the worst of Wednesday's heat. He won't say anything. That's the problem. You ring him.",
          to: 'crew-call',
          effects: { stream: 'crew', status: 'underway', ledger: { hours: -2 } },
        },
        {
          id: 'wing-crew',
          label: 'The crew sorts itself every year — let them fall into their spots.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'They fall into last year\'s spots — which puts a backpacker on the chaser bin next to a header worth more than his country\'s GDP. You reach for the phone.',
          to: 'crew-call',
          effects: { stream: 'crew', status: 'underway', ledger: { hours: -3 } },
        },
      ],
    },
    'crew-call': {
      id: 'crew-call',
      kind: 'call',
      stream: 'crew',
      eyebrow: 'On the phone',
      narrative: 'You called Davo. This is what Davo is saying:',
      speaker: { name: 'Davo', role: 'old hand · forty harvests, zero complaints' },
      dialogue: [
        "Roster, eh. Righto. Put the German fella on the field bin with me — he listens, that one.",
        "Wednesday's going to be a shocker. Thirty-eight and no wind. I'll be right, before you ask.",
        "But if you're smart — and the jury's out — you'll run the young blokes in shifts through the hot hours and keep the water ute MOVING. Blokes don't stop to drink. Bring the drink to the blokes.",
      ],
      prompt: 'Davo just told you how to run Wednesday. And told you he won’t stop.',
      customTo: 'crew-3',
      options: [
        {
          id: 'davo-plan-plus',
          label: 'Take his whole plan — shifts, roving water ute — and give DAVO the air-conditioned chaser cab Wednesday "because the German needs supervising."',
          skill: 'Emotional Intelligence',
          response:
            'A pause. "...Suppose someone\'s got to watch him." Davo spends the hottest day of the week in the cool cab, pride fully intact, teaching a backpacker to hear machines. Crew: SET, and set kindly.',
          to: 'crew-3',
          effects: { stream: 'crew', status: 'sorted', days: 1, ledger: { tonnes: 35, hours: -12 } },
        },
        {
          id: 'plan-only',
          label: 'Run his shift plan exactly as given — Davo included in the rotation like everyone else.',
          skill: 'Judgement & Decision-Making',
          response:
            'The plan is good because it\'s his. Wednesday 2pm, Davo skips his own break — of course he does — and finishes the day grey and swaying. The plan needed one more move. Crew: held, just.',
          to: 'crew-3',
          effects: { stream: 'crew', status: 'sorted', days: 1, ledger: { tonnes: 30, hours: -14 } },
        },
        {
          id: 'ignore-advice',
          label: '"Shifts will slow us down. Everyone works through — we\'ll rest when it rains."',
          skill: 'Self-direction',
          response:
            "Wednesday takes its payment in people: one backpacker down with heat stress by 3pm, Sock driving angry, and Davo silently doing two jobs. You rest Thursday whether it rains or not. Crew: frayed.",
          to: 'crew-3',
          effects: { stream: 'crew', status: 'shaky', days: 1, ledger: { tonnes: 15, hours: -16 } },
        },
      ],
    },

    'crew-3': {
      id: 'crew-3',
      kind: 'scene',
      stream: 'crew',
      eyebrow: 'Smoko logistics',
      narrative:
        'An army marches on its stomach; a harvest crew runs on smoko. Five people spread across three paddocks, thirty-eight degrees coming — food and water either arrive on schedule or people start making bad decisions hungry.',
      prompt: 'How does the crew get fed and watered?',
      customTo: 'crew-4',
      options: [
        {
          id: 'esky-run',
          label: 'Schedule it like freight: 9:30 and 2:30 esky runs to each machine, water ute topped up at every fuel stop.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Sandwiches arrive at machines like clockwork. Sock stops being hangry by Tuesday, which colleagues will later describe as the week’s biggest yield gain.',
          to: 'crew-4',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'shed-spread',
          label: 'Big spread at the shed — everyone comes in when they’re hungry.',
          skill: 'Emotional Intelligence',
          response:
            'Lovely, communal, and a twenty-minute round trip per machine per meal. The header sits idle while Davo butters a roll. Hospitality has a hectare cost.',
          to: 'crew-4',
          effects: { ledger: { hours: -3 } },
        },
        {
          id: 'byo-food',
          label: 'Grown adults can pack their own lunch.',
          skill: 'Self-direction',
          response:
            'The backpackers pack crisps and optimism. By 2pm Wednesday the water ute is the most popular vehicle on the farm and you’re driving it reactively.',
          to: 'crew-4',
          effects: { ledger: { hours: -4 } },
        },
      ],
    },
    'crew-4': {
      id: 'crew-4',
      kind: 'talk',
      stream: 'crew',
      eyebrow: 'Sock',
      narrative:
        'Your cousin Sock corners you at the fuel drum, jaw first. He’s been driving the chaser bin like it insulted him since Monday, and the why finally surfaces.',
      speaker: { name: 'Sock', role: 'cousin · chaser bin · currently furious' },
      dialogue: [
        'Davo gets the header, the Germans get babysat, and I get "just drive the bin, Sock." Again.',
        'I’ve done four harvests. FOUR. When do I get trusted with something that isn’t a glorified wheelbarrow?',
        'Forget it. Where do you want the bin.',
      ],
      prompt: 'Four harvests of feeling like furniture.',
      customTo: 'crew-5',
      options: [
        {
          id: 'give-ownership',
          label: 'Give him real ownership: the whole cart-and-tip cycle is HIS to run, targets and all, reporting straight to you.',
          skill: 'Leadership & Influence',
          response:
            'Sock re-plans the tip cycle by dinner and shaves minutes off every rotation, because it’s HIS now. The bin stops being driven angrily. Turns out it was never about the bin.',
          to: 'crew-5',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'hear-him',
          label: 'Hear him out properly, promise the header next quiet week — this week can’t bend.',
          skill: 'Emotional Intelligence',
          response:
            'Being met halfway lands as being met. He drives like a professional instead of a protest. The IOU is real, though, and he’ll remember it.',
          to: 'crew-5',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'not-now-sock',
          label: '"Storm week, Sock. Feelings Friday."',
          skill: 'Self-direction',
          response:
            'Efficient — and the chaser bin resumes its grudge. Wednesday he takes a corner loaded at a speed best described as "editorial."',
          to: 'crew-5',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'crew-5': {
      id: 'crew-5',
      kind: 'text',
      stream: 'crew',
      eyebrow: 'Jonas · 9:12pm',
      narrative: 'The German backpacker texts with the careful grammar of a man triple-checking a translation app.',
      speaker: { name: 'Jonas', role: 'backpacker · keen, green' },
      dialogue: [
        'Hello. Question for tomorrow, sorry for late.',
        'Davo said "kick off at sparrow’s, back paddock, don’t forget the augers." I understand each word separately.',
        'What time is sparrow? Which paddock is back? What must I do with augers? Thank you.',
      ],
      prompt: 'Three questions that decide whether tomorrow starts on time.',
      customTo: 'crew-6',
      options: [
        {
          id: 'voice-memo',
          label: 'Send a voice memo with times, a pin-drop of the paddock, and a photo of the augers with arrows.',
          skill: 'Emotional Intelligence',
          response:
            'Ninety seconds of your evening. Jonas arrives at 5:55am at the right gate with the right gear, and starts teaching the other backpacker your pin-drop system.',
          to: 'crew-6',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'translate-text',
          label: 'Reply: "5:30am, the paddock behind the silo, augers = the big grain screws, Davo will show you."',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Clear enough. He’s there at 5:30 — at the silo, waiting to be shown, while Davo waits at the paddock. Fifteen minutes of national miscommunication.',
          to: 'crew-6',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'ask-davo-mate',
          label: '"Just follow Davo’s ute in the morning 👍"',
          skill: 'Self-direction',
          response:
            'Davo leaves at 5:10, before Jonas’s alarm. The morning begins with a lost Bavarian doing respectful laps of the property.',
          to: 'crew-6',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'crew-6': {
      id: 'crew-6',
      kind: 'talk',
      stream: 'crew',
      eyebrow: 'The toolbox meeting',
      narrative:
        'Dusk at the shed. The crew hoses dust off boots. Ten minutes here — what happened, what broke, what tomorrow needs — is either a habit or a hope.',
      speaker: { name: 'Davo', role: 'old hand · watching what you do' },
      dialogue: [
        'Old boss ran a ten-minute yarn every dusk. Everyone says one thing that went wrong, one thing coming tomorrow.',
        'Feels like nothing. It’s everything — that’s where Wednesday’s problems get caught on Tuesday night.',
        'Your call though. You’re the ground game.',
      ],
      prompt: 'Ten minutes at dusk, every day, or as needed?',
      customTo: 'HUB',
      options: [
        {
          id: 'run-toolbox',
          label: 'Lock it in: ten minutes, every dusk, everyone speaks, you go last.',
          skill: 'Leadership & Influence',
          response:
            'Night two, Jonas mentions a "small noise" in the field bin that turns out to be a bent auger flight — caught for the price of a listen. The crew starts finishing each other’s plans. Crew: RUNNING itself.',
          to: 'HUB',
          effects: { stream: 'crew', status: 'sorted', ledger: { tonnes: 10, hours: -2 } },
        },
        {
          id: 'notes-fridge',
          label: 'A notes sheet on the shed fridge — write problems down, you’ll read them nightly.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The sheet gathers three notes and a doodle of the header. People say things they’d never write. Half the signal stays in helmets.',
          to: 'HUB',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'as-needed',
          label: 'Meetings are for offices — anyone with a problem knows where you are.',
          skill: 'Self-direction',
          response:
            'Nobody with a small problem interrupts a busy boss — so small problems queue up quietly and merge. You’ll meet the merged version Thursday.',
          to: 'HUB',
          effects: { stream: 'crew', status: 'shaky', ledger: { hours: -4 } },
        },
      ],
    },

    'paddocks-1': {
      id: 'paddocks-1',
      kind: 'scene',
      stream: 'paddocks',
      eyebrow: 'The map',
      narrative:
        "Three paddocks: the home block (easy, average wheat), the top block (good wheat, no drama), and the river flat (your BEST wheat on ground that turns to porridge in rain). The order you strip them is the week's biggest lever.",
      prompt: 'What order do you run?',
      customTo: 'paddocks-call',
      options: [
        {
          id: 'flat-first',
          label: 'River flat first — best wheat off the riskiest ground while the sky’s clear.',
          skill: 'Situational Awareness & Systems Thinking',
          response: 'You radio your uncle to talk it through before you commit the week to it.',
          to: 'paddocks-call',
          effects: { stream: 'paddocks', status: 'underway', ledger: { hours: -1 } },
        },
        {
          id: 'easy-first',
          label: 'Home block first — start where the crew can find its rhythm.',
          skill: 'Emotional Intelligence',
          response:
            'Rhythm matters. So does the radar. You get one easy morning in before the river flat question starts tapping your shoulder. You radio your uncle.',
          to: 'paddocks-call',
          effects: { stream: 'paddocks', status: 'underway', ledger: { tonnes: 25, hours: -6 } },
        },
        {
          id: 'as-always',
          label: 'Run the same order as every year — home, top, flat. Tradition is a plan.',
          skill: 'Self-direction',
          response:
            "Tradition was built in years the storm came Sunday. This one's booked for Thursday. You radio your uncle before tradition signs you up for porridge.",
          to: 'paddocks-call',
          effects: { stream: 'paddocks', status: 'underway', ledger: { hours: -2 } },
        },
      ],
    },
    'paddocks-call': {
      id: 'paddocks-call',
      kind: 'call',
      stream: 'paddocks',
      eyebrow: 'On the radio',
      narrative: 'You radioed your uncle. This is what he’s saying:',
      speaker: { name: 'Your uncle', role: 'on the header · channel 40' },
      dialogue: [
        'Go on then, tell me the order. *header noise*',
        "Before you do — moisture reading on the flat won't be right till Tuesday arvo. Strip it too wet and the silo docks us on every load.",
        "So: flat first risks dockage, flat last risks the storm. Sequencing's the whole job, mate. Your call. *header noise*",
      ],
      prompt: 'Wet dockage or wet paddock. Sequence it.',
      customTo: 'paddocks-3',
      options: [
        {
          id: 'flat-tuesday',
          label: 'Split it: home block Monday–Tuesday, moisture test Tuesday arvo, river flat WEDNESDAY, top block rides out the storm.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The Tuesday reading comes back perfect, the flat comes off dry Wednesday, and the top block — safe ground — waits politely for Friday sunshine. Your uncle, on channel 40: "Who taught you that?" Order: NAILED.',
          to: 'paddocks-3',
          effects: { stream: 'paddocks', status: 'sorted', days: 1, ledger: { tonnes: 140, hours: -18 } },
        },
        {
          id: 'flat-now',
          label: 'Flat first from tomorrow, moisture be damned — the storm scares you more than dockage.',
          skill: 'Judgement & Decision-Making',
          response:
            'Half of Tuesday\'s loads get docked for moisture — real money — but every tonne of your best wheat sleeps in the silo by Wednesday night. Expensive insurance, honestly bought. Order: set.',
          to: 'paddocks-3',
          effects: { stream: 'paddocks', status: 'sorted', days: 1, ledger: { tonnes: 120, hours: -14 } },
        },
        {
          id: 'flat-last',
          label: 'Keep the flat for Thursday — the storm might miss, and dry wheat is worth the wait.',
          skill: 'Self-direction',
          response:
            '"Bold," says your uncle, in the tone that means unwise. The week now ends in a race between a header and a weather front, and the front doesn\'t take smoko. Order: a gamble with a Thursday deadline.',
          to: 'paddocks-3',
          effects: { stream: 'paddocks', status: 'shaky', days: 0, ledger: { hours: -4 } },
        },
      ],
    },

    'paddocks-3': {
      id: 'paddocks-3',
      kind: 'scene',
      stream: 'paddocks',
      eyebrow: 'The moisture tester',
      narrative:
        'The whole sequencing plan hangs off one instrument: the moisture tester in the shed, last calibrated during a previous government. Whoever runs it, and how honestly, decides when the flat is legal to strip.',
      prompt: 'How do you handle the tester?',
      customTo: 'paddocks-4',
      options: [
        {
          id: 'calibrate-first',
          label: 'Run a check sample against June’s receival tester TODAY — calibrate yours to hers, since hers decides the dockage.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Yours reads 0.8 high — enough to make wet wheat look legal. Twenty minutes at the weighbridge just saved you from trusting a confident liar all week.',
          to: 'paddocks-4',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'use-as-is',
          label: 'It’s always been near enough — sample and go.',
          skill: 'Self-direction',
          response:
            'Near enough, in dockage terms, is a price. Every reading this week now carries a question mark it didn’t need to.',
          to: 'paddocks-4',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'feel-method',
          label: 'Davo can tell by biting a grain — forty harvests beats a gadget.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Davo CAN tell, within a per cent or so. The silo docks by decimal places, and Davo’s teeth aren’t admissible at the weighbridge.',
          to: 'paddocks-4',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'paddocks-4': {
      id: 'paddocks-4',
      kind: 'text',
      stream: 'paddocks',
      eyebrow: 'June · receival point',
      narrative: 'June texts like the district’s spreadsheet grew a personality.',
      speaker: { name: 'June', role: 'receival point · decimal places' },
      dialogue: [
        'FYI for your planning: spec this week is 12.5 moisture. 12.6–13.0 cops a $9/t dock. Above 13, don’t bother driving here.',
        'Everyone races the storm and brings me damp grain Thursday, then acts shocked. Every year.',
        'Set your own cutoff NOW while it’s a maths question, not at 2pm Thursday when it’s a feelings question.',
      ],
      prompt: 'Where’s your line?',
      customTo: 'paddocks-5',
      options: [
        {
          id: 'hard-cutoff',
          label: 'Hard line at 12.5 — write it on the shed door, tell the crew nobody strips over spec, storm or not.',
          skill: 'Integrity & Ethics',
          response:
            'A number on a door removes forty future arguments. Thursday, when it’s a feelings question, the door answers it.',
          to: 'paddocks-5',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'dock-maths',
          label: 'Pre-compute the trade: at $9/t dock versus total loss in rain, 12.9 wheat is still worth stripping if the storm’s inside 12 hours.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'A decision table on a feed-bag: WHEN to accept dockage, not whether. Slightly galaxy-brained, genuinely useful — if Thursday goes to plan.',
          to: 'paddocks-5',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'decide-later',
          label: '"Cheers June" — you’ll judge it load by load when it matters.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Load-by-load judgement at 2pm Thursday, with a storm on the ridge and a crew waiting on you, is exactly the feelings question June warned about.',
          to: 'paddocks-5',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'paddocks-5': {
      id: 'paddocks-5',
      kind: 'talk',
      stream: 'paddocks',
      eyebrow: 'Smoko · the south end',
      narrative:
        'Davo unwraps his sandwich, looks at the river flat on your map, and taps the bottom corner with one enormous finger.',
      speaker: { name: 'Davo', role: 'old hand · knows every dip' },
      dialogue: [
        'Your map’s right and also wrong. The flat’s south end sits low — holds moisture a full day longer than the north. Always has.',
        'Strip her north-to-south and the south end gets its extra drying day for free, just from the order you drive.',
        'Or go south-first while the sky’s clear, if you reckon the storm’s coming early. Same paddock, two different bets.',
      ],
      prompt: 'One paddock, two bets. Which end first?',
      customTo: 'paddocks-6',
      options: [
        {
          id: 'north-first',
          label: 'North-to-south — give the wet end every free drying hour the route can buy.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The route itself becomes a drying machine. When the header reaches the south corner, the tester reads legal by exactly the margin the order bought.',
          to: 'paddocks-6',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'south-first',
          label: 'South-first — take the risky corner off while the sky’s definitely clear.',
          skill: 'Judgement & Decision-Making',
          response:
            'Insurance thinking: the worst ground comes off wettest-but-safe, eating a little dockage to delete the nightmare scenario. Davo nods slowly — the nod that means "defensible."',
          to: 'paddocks-6',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'straight-lines',
          label: 'Run it the way the GPS likes — longest straight runs, most efficient stripping.',
          skill: 'Self-direction',
          response:
            'The GPS optimises fuel, not moisture. Beautiful straight lines deliver the south end to the header at its wettest possible moment.',
          to: 'paddocks-6',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'paddocks-6': {
      id: 'paddocks-6',
      kind: 'scene',
      stream: 'paddocks',
      eyebrow: 'The shed door',
      narrative:
        'The plan now lives in three heads and two phones. The shed door has a square metre of clear steel and there’s chalk in the ute. A plan everyone can SEE is a different species from a plan everyone’s heard.',
      prompt: 'Where does the plan live?',
      customTo: 'HUB',
      options: [
        {
          id: 'chalk-map',
          label: 'Chalk the whole week on the door: paddock order, cutoff number, truck slots, storm deadline. Update it nightly.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The door becomes mission control. Anyone who forgets anything walks past the answer six times a day. Your uncle studies it Tuesday and adds one chalk tick — approved. Order: NAILED to a door.',
          to: 'HUB',
          effects: { stream: 'paddocks', status: 'sorted', ledger: { tonnes: 10, hours: -1 } },
        },
        {
          id: 'group-chat-plan',
          label: 'Photo of your notebook to the crew group chat — same information, less chalk.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Sent, seen by four, absorbed by two. A phone plan is real until someone’s screen cracks or Jonas’s data runs out. Which, Wednesday, it does.',
          to: 'HUB',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'plan-in-head',
          label: 'The plan’s in your head and you’re on the radio all day — that’s enough.',
          skill: 'Self-direction',
          response:
            'It’s enough until you’re busy — which is always. Every question now routes through one channel: you. The plan has a single point of failure with your name on it.',
          to: 'HUB',
          effects: { stream: 'paddocks', status: 'shaky', ledger: { hours: -4 } },
        },
      ],
    },

    'weather-1': {
      id: 'weather-1',
      kind: 'scene',
      stream: 'weather',
      eyebrow: 'The sky',
      narrative:
        "The bureau says Thursday night. Kev next door — who's watched this valley's weather for fifty years — reckons bureaus are for tourists. Between the app and the neighbour, someone knows when this storm actually lands.",
      prompt: 'How do you get ahead of the front?',
      customTo: 'weather-call',
      options: [
        {
          id: 'ring-kev',
          label: 'Ring Kev — fifty years of this exact sky beats a national average.',
          skill: 'Situational Awareness & Systems Thinking',
          response: 'Kev answers like he\'s been waiting: "Saw the header out. Wondered when you\'d call."',
          to: 'weather-call',
          effects: { stream: 'weather', status: 'underway', ledger: { hours: -1 } },
        },
        {
          id: 'app-only',
          label: 'Trust the radar app — refresh it hourly, plan on Thursday night.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The app is confident the way apps are. Your uncle squints at the horizon anyway, then at you: "Ring Kev."',
          to: 'weather-call',
          effects: { stream: 'weather', status: 'underway', ledger: { hours: -1 } },
        },
        {
          id: 'ignore-weather',
          label: 'Storms do what storms do — strip wheat, watch sky, adjust.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"Adjust" is what people say before they get wet. Wednesday\'s clouds start rehearsing early and you ring Kev from the ute.',
          to: 'weather-call',
          effects: { stream: 'weather', status: 'underway', ledger: { hours: -3 } },
        },
      ],
    },
    'weather-call': {
      id: 'weather-call',
      kind: 'call',
      narrative: 'You called Kev. This is what Kev is saying:',
      stream: 'weather',
      eyebrow: 'On the phone',
      speaker: { name: 'Kev', role: 'neighbour · fifty years of this sky' },
      dialogue: [
        "Bureau says Thursday night. They're half right.",
        "Front like this one, with the ridge sitting where it is — she'll clip us Thursday ARVO. Three, four o'clock. The night bit is for the coast.",
        'And listen: my shed\'s empty this week. Anything you can\'t fit under cover — machines, grain carts — bring it over Wednesday. No charge. Harvest rules.',
      ],
      prompt: 'Six hours earlier than the bureau, and a free shed.',
      customTo: 'weather-3',
      options: [
        {
          id: 'plan-arvo',
          label: 'Re-plan the whole week around THURSDAY 2PM — and take the shed: machines under cover Wednesday night.',
          skill: 'Judgement & Decision-Making',
          response:
            'Every deadline in the week moves six hours earlier, quietly, now — instead of loudly on Thursday. Kev\'s shed swallows the grain carts Wednesday. When the front arrives at 3:40pm Thursday, it finds a farm that expected it. Storm: OUTPLANNED.',
          to: 'weather-3',
          effects: { stream: 'weather', status: 'sorted', days: 1, ledger: { tonnes: 30, hours: -6 } },
        },
        {
          id: 'split-difference',
          label: 'Plan for Thursday noon "to be safe" but skip the shed run — moving machines costs half a day.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The earlier deadline saves the wheat. The machines spend the storm under tarps that mostly hold, and "mostly" costs you a wet air filter and a Friday morning. Storm: beaten on points.',
          to: 'weather-3',
          effects: { stream: 'weather', status: 'sorted', days: 0, ledger: { tonnes: 25, hours: -6 } },
        },
        {
          id: 'trust-bureau',
          label: '"The bureau has satellites, Kev. Thursday night it is — but thanks for the shed offer."',
          skill: 'Self-direction',
          response:
            'Kev chuckles, not unkindly. "Satellites. Righto." You keep Thursday-night deadlines in a Thursday-arvo week, and the margin you think you have is six hours of fiction. Storm: underestimated.',
          to: 'weather-3',
          effects: { stream: 'weather', status: 'shaky', days: 0, ledger: { hours: -4 } },
        },
      ],
    },

    'weather-3': {
      id: 'weather-3',
      kind: 'scene',
      stream: 'weather',
      eyebrow: 'Trigger points',
      narrative:
        '"Watch the sky" isn’t a plan; it’s a mood. A plan is trigger points: which exact signs mean keep going, hurry up, or stop and shed everything — decided now, while nobody’s tired or hopeful.',
      prompt: 'What are your storm triggers?',
      customTo: 'weather-4',
      options: [
        {
          id: 'write-triggers',
          label: 'Write three triggers with Davo: wind swings north = hurry. Anvil cloud over the ridge = last loads. First drops = machines shed, no debate.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Three signs, three moves, agreed at a kitchen table by calm people. Thursday, tired people will just execute what calm people decided.',
          to: 'weather-4',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'radar-alerts',
          label: 'Set the radar app to alert at 50km — technology can stand watch.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The app watches faithfully. It alerts everyone’s pockets at once, mid-task, with no opinion about what to DO — that part was supposed to be decided already.',
          to: 'weather-4',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'judgement-day',
          label: 'You’ll judge it live — plans this specific just get in the way.',
          skill: 'Self-direction',
          response:
            'Live judgement Thursday means making the week’s biggest call at the exact moment you’re most tired, most invested, and most tempted by "ten more minutes."',
          to: 'weather-4',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'weather-4': {
      id: 'weather-4',
      kind: 'text',
      stream: 'weather',
      eyebrow: 'Bureau app · 5:47am',
      narrative: 'Wednesday dawn, your phone lights up with an official update wearing official confidence.',
      speaker: { name: 'BOM alert', role: 'severe weather update · automated' },
      dialogue: [
        'SEVERE WEATHER UPDATE: front now expected THURSDAY EVENING (9pm–midnight). Damaging winds, heavy rainfall.',
        'That’s six hours LATER than Kev’s call. Six extra dry hours — if the satellite’s right and the neighbour’s wrong.',
        'Someone in your crew has already seen it and is recalculating out loud at the fuel drums.',
      ],
      prompt: 'The bureau just offered you six lovely hours. Take them?',
      customTo: 'weather-5',
      options: [
        {
          id: 'plan-to-kev',
          label: 'Plan to Kev’s 3pm, treat the bureau’s hours as a bonus you don’t spend in advance.',
          skill: 'Judgement & Decision-Making',
          response:
            'You keep the early deadline and pocket any extra hours if they arrive. Nobody ever regretted finishing before the storm; plenty have regretted the reverse.',
          to: 'weather-5',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'split-diff',
          label: 'Split it — plan to 6pm Thursday and watch the western sky hard from noon.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'A hedge with homework: three hours claimed, sky-watching duty assigned. Reasonable — as long as the person watching the sky isn’t also driving a header.',
          to: 'weather-5',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'take-bureau',
          label: 'Six hours is six hours — replan the whole Thursday around the 9pm arrival.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The crew hears "more time" and exhales, which is exactly the problem. Deadlines that move once are widely assumed to move twice. Kev, told over the fence, says only: "Righto."',
          to: 'weather-5',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'weather-5': {
      id: 'weather-5',
      kind: 'talk',
      stream: 'weather',
      eyebrow: 'Kev’s shed',
      narrative:
        'Wednesday arvo at Kev’s: a shed the size of a hangar, half empty, doors open like an invitation. What crosses his fence tonight sleeps dry through whatever comes.',
      speaker: { name: 'Kev', role: 'neighbour · harvest rules' },
      dialogue: [
        'Room for the grain carts, the field bins, and the little tractor if you stack it smart.',
        'Bring them tonight and it’s twenty minutes each way while the track’s dry. Bring them tomorrow arvo and you’ll be doing it in the wind with everything else on fire.',
        'Or don’t. Tarps are a religion too. Wrong one, but a religion.',
      ],
      prompt: 'The shed run: tonight, tomorrow, or tarps?',
      customTo: 'weather-6',
      options: [
        {
          id: 'run-tonight',
          label: 'Tonight — two drivers, three trips, everything wheeled and precious under Kev’s roof by dark.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'An hour of boring convoy work while the sky’s still friendly. Thursday, whatever else happens, half your equipment list is simply not in the storm’s vocabulary.',
          to: 'weather-6',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'thursday-morning',
          label: 'Thursday first thing — tonight the crew needs sleep more than the gear needs a roof.',
          skill: 'Emotional Intelligence',
          response:
            'Humane, and probably fine. Thursday morning now contains one more job in front of the storm, in a queue of jobs in front of the storm.',
          to: 'weather-6',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'tarps-do',
          label: 'Tarps and tie-downs — the gear’s survived storms before.',
          skill: 'Self-direction',
          response:
            'Kev looks at your tarps the way Baz looks at forecasts. "Survived" and "came through well" are different words, and Friday morning explains the difference.',
          to: 'weather-6',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'weather-6': {
      id: 'weather-6',
      kind: 'call',
      stream: 'weather',
      eyebrow: 'Wednesday 9pm · Kev',
      narrative:
        'Last light gone, forecast apps disagreeing politely. One number settles it. You call Kev.',
      speaker: { name: 'Kev', role: 'fifty years of this exact sky' },
      dialogue: [
        'Ridge is holding. She’ll clip us Thursday arvo like I said — maybe 3, maybe 4. The 9pm story is for the coast.',
        'One change: wind’ll swing north about noon. When you feel that swing, you’re in the last lap whatever the clock says.',
        'Ring me at noon tomorrow and I’ll call it live. Or don’t, and trust tonight’s guess for eighteen more hours.',
      ],
      prompt: 'A live update at noon, or tonight’s forecast forever?',
      customTo: 'HUB',
      options: [
        {
          id: 'noon-checkin',
          label: 'Lock the noon call in both calendars — tomorrow’s plan gets one live correction, guaranteed.',
          skill: 'Judgement & Decision-Making',
          response:
            'Noon Thursday, Kev picks up on half a ring: "Swing’s early. Go NOW." That correction — one phone call — is worth more than every app on your phone. Storm: OUTPLANNED, live.',
          to: 'HUB',
          effects: { stream: 'weather', status: 'sorted', ledger: { tonnes: 10, hours: -1 } },
        },
        {
          id: 'maybe-ring',
          label: '"I’ll ring if things look weird." Keep it loose.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"Weird" is a lagging indicator — by the time it looks weird from a header cab, Kev’s update is twenty minutes less useful than it was.',
          to: 'HUB',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'got-it-covered',
          label: '"Cheers Kev, we’re set — see you when it’s over."',
          skill: 'Self-direction',
          response:
            'You’ve traded a live feed from fifty years of local sky for a static guess made in the dark. It might hold. The ridge has opinions overnight.',
          to: 'HUB',
          effects: { stream: 'weather', status: 'shaky', ledger: { hours: -3 } },
        },
      ],
    },

    'silo-1': {
      id: 'silo-1',
      kind: 'scene',
      stream: 'silo',
      eyebrow: 'The logistics',
      narrative:
        "Wheat in a paddock is a crop; wheat in the silo is money. Between them: two trucks, one driver each, and June at the receival point who decides how long anyone waits in the queue.",
      prompt: 'How do you keep the wheat moving?',
      customTo: 'silo-call',
      options: [
        {
          id: 'ring-june',
          label: 'Ring June at receival and book your slots for the whole week, today.',
          skill: 'Situational Awareness & Systems Thinking',
          response: 'June picks up over the rumble of someone else\'s truck. "Booking ahead? You\'re learning."',
          to: 'silo-call',
          effects: { stream: 'silo', status: 'underway', ledger: { hours: -1 } },
        },
        {
          id: 'rock-up',
          label: 'Trucks just rock up like every year — the queue is the queue.',
          skill: 'Self-direction',
          response:
            'Every farm in the district is racing the same storm. Monday\'s "queue" is nineteen trucks long, and your driver texts you a photo of his lunch, then his dinner. You ring June.',
          to: 'silo-call',
          effects: { stream: 'silo', status: 'underway', ledger: { hours: -5 } },
        },
        {
          id: 'field-bins',
          label: 'Buy time: hire two extra field bins so the header never waits on trucks.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Smart buffer — the header never stops. The bins still have to empty somewhere, though, and that somewhere has a queue. You ring June.',
          to: 'silo-call',
          effects: { stream: 'silo', status: 'underway', ledger: { hours: -2 } },
        },
      ],
    },
    'silo-call': {
      id: 'silo-call',
      kind: 'call',
      stream: 'silo',
      eyebrow: 'On the phone',
      narrative: 'You called June. This is what June is saying:',
      speaker: { name: 'June', role: 'receival point · runs the queue, runs the district' },
      dialogue: [
        "Storm week. Everyone wants Thursday slots and nobody wants Monday ones. People are funny.",
        'Here\'s what I\'ve got: guaranteed fast-lane slots Tuesday and Wednesday if you commit NOW. Thursday I can\'t promise anyone anything — it\'ll be carnage.',
        'Oh — and tell your driver the Henderson boy jumped the queue on him last year. If it happens again I want it sorted between them, not at my weighbridge.',
      ],
      prompt: 'Certainty early, carnage late.',
      customTo: 'silo-3',
      options: [
        {
          id: 'commit-early',
          label: 'Commit to Tuesday–Wednesday slots and re-plan stripping to feed them — sell the certainty to your uncle.',
          skill: 'Judgement & Decision-Making',
          response:
            'The week now has a drumbeat: strip, cart, tip, repeat, no queues. Thursday, while the district fights at the weighbridge, your wheat is already money. June waves your last truck through personally. Logistics: HUMMING.',
          to: 'silo-3',
          effects: { stream: 'silo', status: 'sorted', days: 1, ledger: { tonnes: 60, hours: -10 } },
        },
        {
          id: 'keep-flex',
          label: 'Take Tuesday slots only — keep Thursday flexible in case the week runs late.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Half certainty, half hope. Thursday\'s queue is every bit the carnage June promised, and your second truck spends four hours in it — but the week survives. Logistics: workable.',
          to: 'silo-3',
          effects: { stream: 'silo', status: 'sorted', days: 0, ledger: { tonnes: 35, hours: -8 } },
        },
        {
          id: 'sort-thursday',
          label: '"We\'ll take our chances Thursday with everyone else."',
          skill: 'Self-direction',
          response:
            'Thursday, nineteen trucks, one storm bearing down, and yours is number seventeen. Wheat sits in field bins watching clouds. June\'s told-you-so is silent and total. Logistics: the queue.',
          to: 'silo-3',
          effects: { stream: 'silo', status: 'shaky', days: 0, ledger: { tonnes: 10, hours: -10 } },
        },
      ],
    },

    'silo-3': {
      id: 'silo-3',
      kind: 'scene',
      stream: 'silo',
      eyebrow: 'The trucks',
      narrative:
        'Two trucks, both older than you, about to do their hardest week of the year. A flat tyre or a torn tarp mid-week doesn’t just cost a truck — it stalls the whole chain behind it.',
      prompt: 'Pre-week truck check: how deep?',
      customTo: 'silo-4',
      options: [
        {
          id: 'full-check',
          label: 'Full once-over tonight with the drivers: tyres, tarps, lights, hydraulics — and fix what you find NOW.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Findings: one tarp ratchet seized, one brake light dead, one spare flat. All fixed by nine, all invisible forever — which is what good maintenance looks like.',
          to: 'silo-4',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'drivers-check',
          label: 'Ask the drivers to check their own rigs — their trucks, their pride.',
          skill: 'Leadership & Influence',
          response:
            'Macca checks his to the bolt. The second driver’s "yeah all good" covers a tarp he’s been meaning to look at since March.',
          to: 'silo-4',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'roadworthy-enough',
          label: 'They passed rego — the week will tell you what’s broken.',
          skill: 'Self-direction',
          response:
            'The week does tell you, Wednesday, loaded, on the highway shoulder. The week’s feedback style is expensive.',
          to: 'silo-4',
          effects: { ledger: { hours: -4 } },
        },
      ],
    },
    'silo-4': {
      id: 'silo-4',
      kind: 'talk',
      stream: 'silo',
      eyebrow: 'The drivers',
      narrative:
        'Macca leans on his bullbar with the second driver, both waiting on the week’s marching orders — and both remembering last year’s weighbridge incident with the Henderson boy.',
      speaker: { name: 'Macca', role: 'truck driver · twenty years of queues' },
      dialogue: [
        'Give us the slots and we’ll hit them. One thing though — if the Henderson kid pushes in again this year, what’s the play?',
        'Last year I sat there like a gentleman and lost forty minutes. June says sort it between us, away from her bridge.',
        'So sort it. Now, while everyone’s calm.',
      ],
      prompt: 'Set the queue rules before the queue exists.',
      customTo: 'silo-5',
      options: [
        {
          id: 'ring-hendersons',
          label: 'Ring the Hendersons TONIGHT — driver to driver, sort the slot etiquette before anyone’s tired.',
          skill: 'Leadership & Influence',
          response:
            'Five minutes of adult conversation. Turns out the Henderson boy thought jump-ins were normal because nobody ever said otherwise. This year: waves, not weigh-ins.',
          to: 'silo-5',
          effects: { ledger: { hours: -1 } },
        },
        {
          id: 'brief-macca',
          label: 'Brief Macca: hold your slot, stay polite, radio ME if it happens — you’ll handle it live.',
          skill: 'Judgement & Decision-Making',
          response:
            'A protocol instead of a peace treaty. Workable — though "radio the boss" mid-queue still costs minutes the plan already spent.',
          to: 'silo-5',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'boys-sort-it',
          label: '"You’re grown men, sort it on the day."',
          skill: 'Self-direction',
          response:
            'Grown men with forty minutes of last year’s grudge and a storm deadline. June watches Thursday’s discussion from her window with professional disappointment.',
          to: 'silo-5',
          effects: { ledger: { hours: -3 } },
        },
      ],
    },
    'silo-5': {
      id: 'silo-5',
      kind: 'text',
      stream: 'silo',
      eyebrow: 'June · Tuesday 4:40pm',
      narrative: 'A text from June, which is the receival-point equivalent of a hot stock tip.',
      speaker: { name: 'June', role: 'receival point · plays favourites, earned' },
      dialogue: [
        'Cancellation just now. One fast-lane slot, tomorrow 7am sharp. Yours if you want it.',
        'Catch: 7am means loading tonight, in the dark, after the day you’ve already had.',
        'Offer expires when someone else texts back faster. Which is usually the Hendersons.',
      ],
      prompt: 'A free slot with a night attached.',
      customTo: 'silo-6',
      options: [
        {
          id: 'take-slot',
          label: 'Take it — load tonight under the shed lights, thank the crew with bacon at dawn.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'An hour of headlamp work buys a truck through the bridge before the district’s awake. The bacon costs $14 and buys goodwill you can’t price.',
          to: 'silo-6',
          effects: { ledger: { tonnes: 20, hours: -3 } },
        },
        {
          id: 'check-first',
          label: 'Check with Macca before committing — his night, his call too.',
          skill: 'Emotional Intelligence',
          response:
            'Macca replies in forty seconds: "Load now. Ask questions never." You take the slot with a driver who chose it — slightly slower, twice as solid.',
          to: 'silo-6',
          effects: { ledger: { tonnes: 20, hours: -4 } },
        },
        {
          id: 'pass-slot',
          label: 'Pass — the crew’s cooked and the schedule’s already good.',
          skill: 'Judgement & Decision-Making',
          response:
            'Defensible care for the humans. The Hendersons take the slot within the minute, and Thursday’s queue is one truck longer with yours in it.',
          to: 'silo-6',
          effects: { ledger: { hours: -1 } },
        },
      ],
    },
    'silo-6': {
      id: 'silo-6',
      kind: 'scene',
      stream: 'silo',
      eyebrow: 'The cartage board',
      narrative:
        'Loads are leaving, dockets are accumulating in gloveboxes, and nobody currently knows the ONE number that matters: how many tonnes are actually IN the silo versus still in the paddock’s promises.',
      prompt: 'How do you track the real number?',
      customTo: 'HUB',
      options: [
        {
          id: 'tally-board',
          label: 'A tally board in the shed: every docket chalked up the moment the truck returns. One glance = the truth.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The board becomes the farm’s scoreboard — crew members start doing the maths out loud at smoko. Nothing motivates like a number everyone can see move. Logistics: COUNTED.',
          to: 'HUB',
          effects: { stream: 'silo', status: 'sorted', ledger: { tonnes: 10, hours: -1 } },
        },
        {
          id: 'docket-shoebox',
          label: 'Dockets in the ute’s glovebox — you’ll add them up each night.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'You add them up two nights of five. The other nights, the week’s real total is a warm feeling plus a shoebox.',
          to: 'HUB',
          effects: { ledger: { hours: -2 } },
        },
        {
          id: 'junes-got-it',
          label: 'June’s system tracks every load — ring her if you ever need the total.',
          skill: 'Self-direction',
          response:
            'June’s system is flawless and closes at 5pm. Your 9pm planning sessions now feature the phrase "roughly, I reckon," which is how paddocks get missed.',
          to: 'HUB',
          effects: { stream: 'silo', status: 'shaky', ledger: { hours: -3 } },
        },
      ],
    },

    'comp-early': {
      id: 'comp-early',
      kind: 'scene',
      eyebrow: 'Complication · the front moves',
      narrative:
        "Wednesday night, Kev's forecast gets a second opinion — from the sky. The front is now due Thursday MIDDAY. Whatever's still standing at noon tomorrow meets it head-on. The machines are sound, the plan is real, and the clock just shrank.",
      prompt: 'Twelve fewer hours. Re-cut the plan.',
      customTo: 'finale',
      options: [
        {
          id: 'lights-tonight',
          label: 'Strip under lights TONIGHT — headlights, floodlights, thermos relay. Take the riskiest wheat off in the dark.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The paddock at midnight looks like a slow ship at sea. By 2am the wheat that couldn\'t survive a wet Thursday is in the bin. The crew is wrecked and quietly proud. You bought the morning.',
          to: 'finale',
          effects: { days: 1, ledger: { tonnes: 80, hours: -20 } },
        },
        {
          id: 'dawn-sprint',
          label: 'Protect the crew’s sleep — 4:30am start, sprint the morning, hard stop at noon.',
          skill: 'Judgement & Decision-Making',
          response:
            'A rested crew strips fast and clean. It\'s close — the last loads run at 11:40 with the horizon turning green-black — but close counts. Mostly.',
          to: 'finale',
          effects: { ledger: { tonnes: 60, hours: -12 } },
        },
        {
          id: 'hold-plan',
          label: 'One forecast update isn’t a plan change. Hold Thursday as drawn.',
          skill: 'Self-direction',
          response:
            'The front does not consult your plan. Noon Thursday arrives with wheat still standing and the first fat drops hitting the header\'s windscreen.',
          to: 'finale',
          effects: { ledger: { hours: -10 } },
        },
      ],
    },
    'comp-breakdown': {
      id: 'comp-breakdown',
      kind: 'scene',
      eyebrow: 'Complication · she lets go',
      narrative:
        "Wednesday, 11am, mid-paddock: the noise Davo warned about ends in a BANG you feel through the ute. The header sits dead in half-stripped wheat with a storm two days out — the bearing you didn't fix has resigned, effective immediately.",
      prompt: 'Dead header, live storm.',
      customTo: 'finale',
      options: [
        {
          id: 'beg-blue',
          label: 'Ring Blue, admit everything, and offer whatever it takes for an emergency call-out.',
          skill: 'Integrity & Ethics',
          response:
            '"Should\'ve booked the 6am, eh." Blue comes at 7pm, works under lights till one, charges like a wounded bull and earns every cent. She rolls at dawn — a day gone, lesson priced in.',
          to: 'finale',
          effects: { days: 1, ledger: { tonnes: 30, hours: -24 } },
        },
        {
          id: 'borrow-header',
          label: 'Ring Kev — his old header’s slower, but it’s RUNNING. Beg a loan.',
          skill: 'Leadership & Influence',
          response:
            '"Harvest rules," says Kev, and sends it over with his grandson driving. Two headers — one wounded, one geriatric — limp the harvest forward in tandem. The district will talk about it fondly at your expense forever.',
          to: 'finale',
          effects: { days: 1, ledger: { tonnes: 50, hours: -18 } },
        },
        {
          id: 'wait-parts',
          label: 'Order the part, wait for the courier, lose the day properly.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The courier arrives Thursday morning, the fix takes till noon, and the storm takes everything after that. The paddock stands in the rain doing the maths on your Monday decision.',
          to: 'finale',
          effects: { days: 1, ledger: { tonnes: 10, hours: -30 } },
        },
      ],
    },

    finale: {
      id: 'finale',
      kind: 'scene',
      eyebrow: 'Thursday · the last corner',
      narrative:
        "The front is ON the ridge — you can smell the rain in it. One corner of wheat left: ninety minutes of stripping, maybe sixty of dry sky. The crew idles in a rough line, every cab looking at your ute.",
      prompt: 'The week comes down to one call.',
      customTo: 'END',
      options: [
        {
          id: 'split-corner',
          label: 'The header takes the best forty minutes of the corner; everyone else sheets loads and sheds machines NOW. Air-horn signal, pre-agreed.',
          skill: 'Judgement & Decision-Making',
          response:
            'The heart of the corner comes off while the crew makes everything else stormproof behind it. Two horn blasts, cabs under cover, and the wall of rain crosses the fence to find nothing left out that matters.',
          to: 'END',
          effects: { ledger: { tonnes: 60, hours: -1 } },
        },
        {
          id: 'send-corner',
          label: 'Send it — ninety flat-out minutes, beat the sky or wear it.',
          skill: 'Self-direction',
          response:
            'The sky wins by twenty minutes. Wet wheat in the box, a header sleeping outdoors, and a bogged ute for Friday. Great story. Expensive story.',
          to: 'END',
          effects: { ledger: { tonnes: 25, hours: -2 } },
        },
        {
          id: 'shed-now',
          label: 'Call it — the corner stands, everything with wheels gets home dry.',
          skill: 'Integrity & Ethics',
          response:
            'A real cost, cleanly chosen: one corner of wheat takes the rain standing while machines and people watch dry from the shed. Your uncle: "Cheapest wheat we ever lost."',
          to: 'END',
          effects: { ledger: { tonnes: 40 } },
        },
      ],
    },
  },
  threadsBeforeFinale: 3,
  complication: { checkStream: 'header', whenSorted: 'comp-early', otherwise: 'comp-breakdown' },
  finale: 'finale',
  endings: {
    high: {
      title: 'Rain on the shed roof, and everything that matters is under it.',
      body: 'The silo holds the wheat that counted, the machines are dry, and the crew is upright and laughing about the week already. Your uncle pours two teas and says nothing, which is the medal. Every good hour traces back to a call you made before it was urgent.{neglectLine}',
    },
    mid: {
      title: 'The silo’s mostly full. So is the lesson book.',
      body: 'You beat the storm on the whole — a docked load here, a queue there, one afternoon that ran on luck. Around the kitchen table your uncle replays the week without blame and names the two calls he\'d want back. You knew before he said them.{neglectLine}',
    },
    low: {
      title: 'The storm won this round.',
      body: 'Wet wheat, lost days, a crew that carried what the plan didn\'t. Your uncle pours the teas anyway: "Every farmer\'s had this week. The good ones only have it once." The map of what to do differently is painfully, usefully exact.{neglectLine}',
    },
  },
}

/* ------------------------------------------------------------------ */
/* BAND — Show night                                                   */
/* ------------------------------------------------------------------ */

export const BAND_SIM: JourneySimScript = {
  id: 'sim-band-show-night',
  title: 'Show Night',
  club: 'Battle of the Bands · school hall',
  goalLabel: 'SHOW NIGHT',
  daysTotal: 21,
  theme: {
    // Backstage-violet world — stage-light purple on black, side-of-stage
    // dark. Unmistakably not the ocean, the paddock, or the market.
    background: 'linear-gradient(180deg, #120a1c 0%, #1e1030 45%, #2a1545 100%)',
    accent: '#c98bff',
    topBar: 'rgba(18, 10, 28, 0.85)',
  },
  ledger: {
    primaryKey: 'tight',
    keys: {
      tight: { label: 'Set tightness', format: 'percent', start: 35, min: 0, max: 100 },
      // Rehearsals left keeps default up-good: spending one reads amber
      // (honest cost), and Aldous granting extra slots reads green.
      rehearsals: { label: 'Rehearsals left', format: 'count', start: 9, min: 0 },
    },
    tierThresholds: { high: 80, mid: 55 },
    cardHead: 'Set sheet',
  },
  mechanicLabel: 'Set-tightness meter',
  arrival: {
    beats: [
      'The lineup drops at lunch: your band has the LAST slot at Battle of the Bands. Prime time.',
      'Forty minutes later Jake quits the band over a group-chat argument you didn’t start. One empty drum stool, one half-written song.',
      'Three weeks, {name}. Everyone’s looking at you.',
    ],
    mission: {
      headline: 'Get a band on that stage.',
      points: [
        'Get SET TIGHTNESS from 35% to 80%+ before the last slot.',
        'Nine rehearsals left — every big call spends or earns them.',
      ],
    },
  },
  hubReturn: {
    eyebrow: 'back in the music room',
    narrative: 'One fire out — the whiteboard list hasn’t gotten any shorter on its own.',
    prompt: 'What do you take on next?',
  },
  intro: {
    eyebrow: 'Three weeks out · the music room',
    narrative:
      "The lineup drops at lunch: your band has the LAST slot at Battle of the Bands — prime time, {name}. Forty minutes later Jake quits the band over a group-chat argument you didn't start. One empty drum stool, one half-written song, three weeks. Everyone's looking at you.",
    prompt: 'Where do you start?',
  },
  streams: {
    drummer: { label: 'The drum stool', entry: 'drummer-1', doorLabel: 'Solve the drummer problem' },
    setlist: { label: 'The setlist', entry: 'setlist-1', doorLabel: 'Lock the setlist' },
    gear: { label: 'Gear & sound', entry: 'gear-1', doorLabel: 'Sort the gear' },
    crowd: { label: 'The crowd', entry: 'crowd-1', doorLabel: 'Fill the hall' },
    rehearsal: { label: 'Rehearsals', entry: 'rehearsal-1', doorLabel: 'Lock the rehearsal room' },
  },
  nodes: {
    'drummer-1': {
      id: 'drummer-1',
      kind: 'scene',
      stream: 'drummer',
      eyebrow: 'One empty stool',
      narrative:
        "Mia — never performed, practises constantly — has asked, eyes on the floor, if she can try out. Jake is telling people he'd come back 'if you apologised.' You didn't start the argument. You do need a drummer.",
      prompt: 'The stool decides the band. Who decides the stool?',
      customTo: 'drummer-call',
      options: [
        {
          id: 'call-mia',
          label: 'Call Mia — give her a real audition before nerves talk her out of asking twice.',
          skill: 'Leadership & Influence',
          response: 'She picks up on half a ring, like the phone was in her hand. It probably was.',
          to: 'drummer-call',
          effects: { stream: 'drummer', status: 'underway', ledger: { tight: 8 } },
        },
        {
          id: 'text-jake',
          label: 'Text Jake first: "No apology — but the stool\'s open if you want to EARN it back."',
          skill: 'Integrity & Ethics',
          response:
            'Jake types for a long time. Three dots, gone, three dots, gone. Then nothing. You call Mia.',
          to: 'drummer-call',
          effects: { stream: 'drummer', status: 'underway', ledger: { tight: 6 } },
        },
        {
          id: 'swallow-it',
          label: 'Swallow it and apologise to Jake — the old lineup for the big night.',
          skill: 'Emotional Intelligence',
          response:
            "You draft the apology four times and delete it four times, because it isn't true. Some prices are wrong even when they're cheap. You call Mia instead.",
          to: 'drummer-call',
          effects: { stream: 'drummer', status: 'underway', ledger: { tight: 2 } },
        },
      ],
    },
    'drummer-call': {
      id: 'drummer-call',
      kind: 'call',
      stream: 'drummer',
      eyebrow: 'On the phone',
      narrative: 'You called Mia. This is what Mia is saying:',
      speaker: { name: 'Mia', role: 'practises constantly · never performed' },
      dialogue: [
        "Okay so — yes, I want to audition. Full song, whatever you pick, I've learned everything you've ever posted.",
        "But I need you to know two things. One: I'm better than Jake and I can prove it in eight bars.",
        "Two: I've never played in front of anyone except my dog. If you give me the stool, you're getting the drumming AND the nerves. Package deal.",
      ],
      prompt: 'The truth, offered up front. What do you do with it?',
      customTo: 'drummer-3',
      options: [
        {
          id: 'full-audition',
          label: 'Full audition today, whole band watching — and if she earns it, she gets the stool AND a stage-nerves plan.',
          skill: 'Leadership & Influence',
          response:
            "Shaky for eight bars, then she locks in like she's played with you for a year. The band exchanges the look. You have a drummer — and you write 'nerves plan' on the whiteboard like the professional you're becoming. Stool: MIA'S.",
          to: 'drummer-3',
          effects: { stream: 'drummer', status: 'sorted', days: 3, ledger: { tight: 16, rehearsals: -2 } },
        },
        {
          id: 'quiet-tryout',
          label: 'Private tryout, just you two — protect her from an audience until show night.',
          skill: 'Emotional Intelligence',
          response:
            'She plays brilliantly to a room of one. Kind — but now her first-ever audience of more than one person will be three hundred people. The nerves bill got deferred, not paid. Stool: hers, untested.',
          to: 'drummer-3',
          effects: { stream: 'drummer', status: 'sorted', days: 3, ledger: { tight: 4, rehearsals: -2 } },
        },
        {
          id: 'keep-shopping',
          label: '"You\'re in the mix — let me see who else is out there first."',
          skill: 'Judgement & Decision-Making',
          response:
            'Two days of asking around produces one Year 7 who owns half a kit. When you come back, Mia\'s reply is slower, cooler: "Sure. If you still need me." The stool is hers now anyway — minus some trust. Stool: filled, dented.',
          to: 'drummer-3',
          effects: { stream: 'drummer', status: 'shaky', days: 4, ledger: { tight: -12, rehearsals: -3 } },
        },
      ],
    },

    'drummer-3': {
      id: 'drummer-3',
      kind: 'scene',
      stream: 'drummer',
      eyebrow: 'First full rehearsal',
      narrative:
        'Mia’s first rehearsal with the whole band. How the first hour goes decides whether she’s "the new drummer" for three weeks or just the drummer by Friday.',
      prompt: 'How do you run her first session?',
      customTo: 'drummer-4',
      options: [
        {
          id: 'her-strongest',
          label: 'Open with the song she knows BEST — let the band hear her at full power before anything hard.',
          skill: 'Leadership & Influence',
          response:
            'She counts in the opener and the room physically changes. First impressions are a production decision, and you just produced one.',
          to: 'drummer-4',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'top-of-set',
          label: 'Run the set in order from the top — professional, methodical.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Sensible — except song one opens with the bass intro, so Mia sits exposed and waiting for four bars while everyone watches her not play yet.',
          to: 'drummer-4',
        },
        {
          id: 'jam-loose',
          label: 'Just jam — let chemistry happen naturally.',
          skill: 'Self-direction',
          response:
            'Jams reward confidence, and confidence is the one thing she hasn’t earned yet. She plays small for an hour while the guitars noodle over her.',
          to: 'drummer-4',
          effects: { ledger: { tight: -4 } },
        },
      ],
    },
    'drummer-4': {
      id: 'drummer-4',
      kind: 'text',
      stream: 'drummer',
      eyebrow: 'Jake · 11:48pm',
      narrative: 'Late-night buzz. Jake. The three dots appear and disappear twice before the message lands.',
      speaker: { name: 'Jake', role: 'ex-drummer · fishing' },
      dialogue: [
        'heard you got mias sister or whatever on drums lol',
        'good luck with the last slot I guess. genuinely.',
        'anyway if it falls apart before the show you know my number. no hard feelings from my end btw',
      ],
      prompt: 'The door he slammed, reopened a crack. At midnight.',
      customTo: 'drummer-5',
      options: [
        {
          id: 'kind-clear',
          label: 'Kind and closed: "Appreciate it. Mia’s our drummer. Come watch — front row’s loud."',
          skill: 'Integrity & Ethics',
          response:
            'Clear enough to end the wobble, warm enough to keep a friend. He replies "might do" — and the band stops being a question in anyone’s group chat.',
          to: 'drummer-5',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'leave-open',
          label: 'Keep it vague — "cheers man" — no point burning a backup drummer.',
          skill: 'Judgement & Decision-Making',
          response:
            'Insurance with a leak: "backup drummer" gets back to Mia by Tuesday, because everything gets back to everyone. She practises harder and trusts slightly less.',
          to: 'drummer-5',
          effects: { ledger: { tight: -2 } },
        },
        {
          id: 'ignore-jake',
          label: 'No reply. Midnight texts don’t deserve answers.',
          skill: 'Self-direction',
          response:
            'Silence reads as drama even when it’s just sleep. Jake screenshots his own unanswered text into the group chat with a shrug emoji, and the story writes itself without you.',
          to: 'drummer-5',
          effects: { ledger: { tight: -3 } },
        },
      ],
    },
    'drummer-5': {
      id: 'drummer-5',
      kind: 'talk',
      stream: 'drummer',
      eyebrow: 'The nerves plan',
      narrative:
        'After Wednesday’s rehearsal, Mia packs her sticks slowly — the universal signal for "I need to say a thing." The package deal she warned you about is due for its first payment.',
      speaker: { name: 'Mia', role: 'drummer · nerves pending' },
      dialogue: [
        'Okay so the drumming part is fine. It’s the BEFORE part — the standing side-stage waiting part. My hands go cold and I forget how thumbs work.',
        'I looked stuff up. Some drummers have a routine — same warm-up, same eight bars on a practice pad, headphones till the second we walk on.',
        'Will you build one with me? Like, actually build it, not just say "you’ll be fine"?',
      ],
      prompt: 'She’s asking for scaffolding, not sympathy.',
      customTo: 'drummer-6',
      options: [
        {
          id: 'build-ritual',
          label: 'Build the whole ritual with her tonight — warm-up, pad pattern, headphones, and YOUR job: the count-in eye contact.',
          skill: 'Emotional Intelligence',
          response:
            'Twenty minutes designing a pre-show ritual like engineers. It ends with a laminated card for her stick bag, because laminating things is how this band shows love now.',
          to: 'drummer-6',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'point-resources',
          label: 'Send her the best videos on stage nerves — the pros explain it better than you can.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Good videos, genuinely. But she asked you to build it WITH her, and what arrived was homework. The ritual exists at 60% strength: hers, alone.',
          to: 'drummer-6',
        },
        {
          id: 'youll-be-fine',
          label: '"Honestly, once you start playing you’ll forget the nerves exist."',
          skill: 'Self-direction',
          response:
            'The exact sentence she pre-banned, delivered verbatim. She nods, zips the stick bag, and files the lesson: bring this stuff to the internet, not the bandleader.',
          to: 'drummer-6',
          effects: { ledger: { tight: -4 } },
        },
      ],
    },
    'drummer-6': {
      id: 'drummer-6',
      kind: 'scene',
      stream: 'drummer',
      eyebrow: 'The tape',
      narrative:
        'Someone’s phone has been propped on the amp filming run-throughs all week. The band has never actually watched one back. The tape knows things.',
      prompt: 'Watch the tape together, or trust the feeling?',
      customTo: 'HUB',
      options: [
        {
          id: 'watch-together',
          label: 'Pizza and the tape, whole band — everyone names one thing THEY’LL fix, nobody critiques anyone else.',
          skill: 'Leadership & Influence',
          response:
            'The rule does the magic: five people volunteering their own fixes instead of defending themselves. Mia spots her own rushed fill before anyone could mention it. Stool: HERS, on tape.',
          to: 'HUB',
          effects: { stream: 'drummer', status: 'sorted', ledger: { tight: 3 } },
        },
        {
          id: 'watch-alone',
          label: 'Watch it yourself and pass on notes individually — gentler that way.',
          skill: 'Emotional Intelligence',
          response:
            'Gentle, and slower: your notes arrive secondhand, and everyone privately wonders what notes the OTHERS got. The tape’s best trick — shared truth — stays unused.',
          to: 'HUB',
        },
        {
          id: 'delete-tape',
          label: 'Never watch the tape. Bands run on confidence, not footage.',
          skill: 'Self-direction',
          response:
            'Confidence unchecked by evidence has a name: the demo you think you sounded like. The gap between feel and tape stays exactly where the judges will find it.',
          to: 'HUB',
          effects: { stream: 'drummer', status: 'shaky', ledger: { tight: -4 } },
        },
      ],
    },

    'setlist-1': {
      id: 'setlist-1',
      kind: 'scene',
      stream: 'setlist',
      eyebrow: 'The setlist',
      narrative:
        "Three songs, twelve minutes, last slot of the night. The crowd will be tired, hyped, and half-deaf. The set you pick is the argument the band has been politely not having for a week.",
      prompt: 'How do you settle the setlist?',
      customTo: 'setlist-call',
      options: [
        {
          id: 'call-sam',
          label: 'Call Sam — the quiet one whose demos everyone secretly replays.',
          skill: 'Situational Awareness & Systems Thinking',
          response: 'Sam answers with a guitar still ringing. "Oh no. Is this about the setlist?"',
          to: 'setlist-call',
          effects: { stream: 'setlist', status: 'underway', ledger: { tight: 8 } },
        },
        {
          id: 'band-vote',
          label: 'Put it to a band vote — majority rules, no grudges.',
          skill: 'Integrity & Ethics',
          response:
            'The vote splits perfectly down the middle, because of course it does. Everyone looks at you. You call Sam for the tiebreaker nobody will resent.',
          to: 'setlist-call',
          effects: { stream: 'setlist', status: 'underway', ledger: { tight: 4 } },
        },
        {
          id: 'your-call',
          label: 'Captain’s pick — you write the set tonight and present it done.',
          skill: 'Self-direction',
          response:
            'Decisive — and the room goes slightly quiet when you pin it up, which tells you something. You take Sam aside to pressure-test it.',
          to: 'setlist-call',
          effects: { stream: 'setlist', status: 'underway' },
        },
      ],
    },
    'setlist-call': {
      id: 'setlist-call',
      kind: 'call',
      stream: 'setlist',
      eyebrow: 'On the phone',
      narrative: 'You called Sam. This is what Sam is saying:',
      speaker: { name: 'Sam', role: 'writes better than anyone admits' },
      dialogue: [
        "Okay, since you asked. The set everyone's arguing about? It's fine. Fine loses battles of the bands.",
        "I wrote something Tuesday night. It's... better than anything we have. I can send it, but it means learning a new song with three weeks left and a new drummer.",
        "Or we polish what we've got until it shines. Safe and shiny, or better and scary. That's really the choice.",
      ],
      prompt: 'Safe and shiny, or better and scary.',
      customTo: 'setlist-3',
      options: [
        {
          id: 'back-sam',
          label: 'Better and scary. Sam’s song closes the set — and you say WHY out loud to the whole band.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"We\'re switching because it\'s BETTER, and Sam bringing it is the best thing that\'s happened to this band." Sam grows four inches on the phone. The set now has a secret weapon and a deadline. Setlist: LOCKED, brave.',
          to: 'setlist-3',
          effects: { stream: 'setlist', status: 'sorted', days: 3, ledger: { tight: 12, rehearsals: -2 } },
        },
        {
          id: 'polish-safe',
          label: 'Safe and shiny — polish the drilled set, park Sam’s song for after the battle.',
          skill: 'Judgement & Decision-Making',
          response:
            'The set tightens nicely. Sam says "makes sense" in the voice people use when it doesn\'t. A good, careful call — and everyone half-wonders about the road not taken. Setlist: locked, safe.',
          to: 'setlist-3',
          effects: { stream: 'setlist', status: 'sorted', days: 3, ledger: { tight: 4, rehearsals: -2 } },
        },
        {
          id: 'cram-both',
          label: 'Do both — squeeze Sam’s song in AND keep the full old set.',
          skill: 'Self-direction',
          response:
            'Four songs into a twelve-minute slot with a three-week drummer. Every rehearsal now practises everything and perfects nothing. Setlist: overstuffed.',
          to: 'setlist-3',
          effects: { stream: 'setlist', status: 'shaky', days: 3, ledger: { tight: -12, rehearsals: -2 } },
        },
      ],
    },

    'setlist-3': {
      id: 'setlist-3',
      kind: 'scene',
      stream: 'setlist',
      eyebrow: 'The joins',
      narrative:
        'Twelve minutes means the GAPS count. Three songs badly joined is three songs plus two awkward silences where the crowd checks their phones. The transitions are the fourth song.',
      prompt: 'What happens between the songs?',
      customTo: 'setlist-4',
      options: [
        {
          id: 'design-segues',
          label: 'Design both joins: drum fill straight into song two, bass drone under the tuning gap into three. Rehearse the joins as their own thing.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The set becomes one twelve-minute thing instead of three four-minute things. Judges notice bands that never let the air out. They write it down.',
          to: 'setlist-4',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'quick-chat',
          label: 'Keep short planned banter between songs — thank the crowd, breathe, reset.',
          skill: 'Emotional Intelligence',
          response:
            'Charm buys grace, if the charm is rehearsed. "Planned banter" unrehearsed becomes "so um, yeah, this next one…" — which is a gap wearing a costume.',
          to: 'setlist-4',
        },
        {
          id: 'gaps-fine',
          label: 'Gaps are normal — every band has them.',
          skill: 'Self-direction',
          response:
            'Every band does. The winning one usually doesn’t. Twelve minutes has room for exactly zero shrugs.',
          to: 'setlist-4',
          effects: { ledger: { tight: -4 } },
        },
      ],
    },
    'setlist-4': {
      id: 'setlist-4',
      kind: 'talk',
      stream: 'setlist',
      eyebrow: 'The key problem',
      narrative:
        'Wednesday, mid-rehearsal, the singer keeps straining at the same bar of the closer. Sam catches you after, guitar case half-zipped, voice low.',
      speaker: { name: 'Sam', role: 'writer · protective of the song' },
      dialogue: [
        'You hear it too, right. The bridge sits a third too high for Dana. Every take, same crack.',
        'Drop the whole song a third and it’s comfortable — but it loses the shimmer. That top line is kind of… the point of it.',
        'Or Dana works the high line all week and we bet on the night. Her call? My call? Yours?',
      ],
      prompt: 'The song’s shimmer versus the singer’s throat.',
      customTo: 'setlist-5',
      options: [
        {
          id: 'ask-dana',
          label: 'Put Dana in the room with Sam and let THEM solve it — singer and writer, you just hold the space.',
          skill: 'Leadership & Influence',
          response:
            'Twenty minutes later they emerge with a third option nobody had: drop the verse, keep the high bridge, Dana saves her voice for the one moment that needs it. Craft beats hierarchy.',
          to: 'setlist-5',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'drop-key',
          label: 'Drop the key — a clean note beats a brave crack, every time, in every room.',
          skill: 'Judgement & Decision-Making',
          response:
            'Safe and singable. Sam transposes it without complaint, the way people don’t complain when something small dies. The song works. It used to soar.',
          to: 'setlist-5',
        },
        {
          id: 'bet-the-night',
          label: 'Keep the key — Dana will rise to it when the adrenaline hits.',
          skill: 'Self-direction',
          response:
            'Adrenaline is not a vocal coach. You’ve scheduled a coin flip for the most-watched bar of the night, and everyone on stage will hear it coming.',
          to: 'setlist-5',
          effects: { ledger: { tight: -4 } },
        },
      ],
    },
    'setlist-5': {
      id: 'setlist-5',
      kind: 'text',
      stream: 'setlist',
      eyebrow: 'Zoe · 3:33pm',
      narrative: 'Zoe texts with the urgency of someone whose content calendar has a hole in it.',
      speaker: { name: 'Zoe', role: 'runs the socials · needs the goods' },
      dialogue: [
        'OK the countdown’s working but people are DEMANDING to know what the secret song is.',
        'Give me the title and I’ll tease it properly. Or even 5 seconds of the chorus??',
        'Mystery has a shelf life, band person. It expires Thursday.',
      ],
      prompt: 'Feed the mystery or protect the reveal?',
      customTo: 'setlist-6',
      options: [
        {
          id: 'protect-reveal',
          label: 'Hold the reveal — send her a clip of the band REACTING to the song instead. Faces, no audio.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Five faces hearing a chorus you can’t hear does bigger numbers than the chorus would have. The mystery gets fed without being eaten. Zoe: "ok that’s actually genius."',
          to: 'setlist-6',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'give-title',
          label: 'Give her just the title — enough to tease, not enough to spoil.',
          skill: 'Judgement & Decision-Making',
          response:
            'The title alone is honestly a decent tease. Within an hour, two kids from the jazz ensemble have found Sam’s old demo online. Mostly-secret is a real category, it turns out.',
          to: 'setlist-6',
        },
        {
          id: 'leak-chorus',
          label: 'Send the 5-second chorus — engagement is engagement.',
          skill: 'Self-direction',
          response:
            'Numbers go UP; the reveal goes away. Saturday’s biggest moment now premieres on a phone screen on a Tuesday, compressed to sound like a robot bee.',
          to: 'setlist-6',
          effects: { ledger: { tight: -3 } },
        },
      ],
    },
    'setlist-6': {
      id: 'setlist-6',
      kind: 'scene',
      stream: 'setlist',
      eyebrow: 'Running order',
      narrative:
        'Last structural call: the order. Where the best song sits shapes the whole twelve minutes — and the version you lock tonight is the one your hands will know on Saturday.',
      prompt: 'Lock the order. Which shape?',
      customTo: 'HUB',
      options: [
        {
          id: 'strong-close',
          label: 'Open big, breathe in the middle, CLOSE with the best song — lock it tonight, print it, tape it to every amp.',
          skill: 'Judgement & Decision-Making',
          response:
            'Locked, printed, taped. The band stops relitigating the order at every rehearsal, which frees up astonishing amounts of brain. Last thing the judges hear: your best. Setlist: FINAL.',
          to: 'HUB',
          effects: { stream: 'setlist', status: 'sorted', ledger: { tight: 3 } },
        },
        {
          id: 'best-first',
          label: 'Best song FIRST — grab the room before anyone’s attention wanders.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'A real strategy with a real cost: eight minutes of descent after your peak. The room stays won-ish. Judges remember endings.',
          to: 'HUB',
        },
        {
          id: 'keep-options',
          label: 'Stay flexible — decide the final order at soundcheck based on the vibe.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"Vibe-based sequencing" at 5:30pm on show day means five people learning the plan an hour before executing it under lights. Flexibility this late is just deferred stress.',
          to: 'HUB',
          effects: { stream: 'setlist', status: 'shaky', ledger: { tight: -4 } },
        },
      ],
    },

    'gear-1': {
      id: 'gear-1',
      kind: 'scene',
      stream: 'gear',
      eyebrow: 'Gear & sound',
      narrative:
        "The school hall PA is older than the teachers and has a reputation: last year it ate the closing band's vocals alive. Gus, the AV tech, is the only person who understands it — part mechanic, part priest.",
      prompt: 'How do you make sure the crowd actually HEARS you?',
      customTo: 'gear-call',
      options: [
        {
          id: 'befriend-gus',
          label: 'Find Gus early and get him ON SIDE — the tech decides who sounds good.',
          skill: 'Emotional Intelligence',
          response: 'Gus answers the AV room phone suspiciously — nobody ever calls Gus BEFORE a disaster.',
          to: 'gear-call',
          effects: { stream: 'gear', status: 'underway', ledger: { tight: 8 } },
        },
        {
          id: 'own-gear',
          label: 'Plan to bring your own amps and vocal rig — control what you can control.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Solid instinct — except the hall desk still sits between your rig and the speakers, and the desk belongs to Gus. You call him.',
          to: 'gear-call',
          effects: { stream: 'gear', status: 'underway', ledger: { tight: 4 } },
        },
        {
          id: 'same-as-everyone',
          label: 'Every band uses the house PA — you’ll get what they get.',
          skill: 'Self-direction',
          response:
            'What they got last year was a closing band nobody could hear. The memory of it dials Gus\'s number for you.',
          to: 'gear-call',
          effects: { stream: 'gear', status: 'underway', ledger: { tight: -4 } },
        },
      ],
    },
    'gear-call': {
      id: 'gear-call',
      kind: 'call',
      stream: 'gear',
      eyebrow: 'On the phone',
      narrative: 'You called Gus. This is what Gus is saying:',
      speaker: { name: 'Gus', role: 'AV tech · speaks fluent broken PA' },
      dialogue: [
        "Calling three weeks early. Huh. Nobody's ever done that.",
        'Straight truth: channel two is dying. It\'ll fail on somebody that night — whoever\'s vocals are patched through it when it goes.',
        "I can hard-route your set around it and do you a real soundcheck at 5:30 — IF you show up on time, cables coiled, and someone helps me pack down after. I'm one person.",
      ],
      prompt: 'The tech just offered you the keys. Terms attached.',
      customTo: 'gear-3',
      options: [
        {
          id: 'full-deal',
          label: 'Deal — 5:15 arrival, cables coiled, and the whole band stays for pack-down. Shake on it.',
          skill: 'Leadership & Influence',
          response:
            "Gus writes your band's name on the desk in Sharpie — around channel two, in a route of his own design. You will be the only band that night whose vocals are safe. Gear: WIRED, by an ally.",
          to: 'gear-3',
          effects: { stream: 'gear', status: 'sorted', days: 2, ledger: { tight: 16, rehearsals: -1 } },
        },
        {
          id: 'soundcheck-only',
          label: 'Take the soundcheck, dodge the pack-down — it’s a school night.',
          skill: 'Judgement & Decision-Making',
          response:
            '"Right," says Gus, in the tone of a man re-ranking his priorities. You get a decent check and a standard patch — channel two included in the lottery. Gear: probably fine.',
          to: 'gear-3',
          effects: { stream: 'gear', status: 'sorted', days: 1, ledger: { tight: 2, rehearsals: -1 } },
        },
        {
          id: 'wing-sound',
          label: '"We\'ll just soundcheck fast on the night like everyone else."',
          skill: 'Self-direction',
          response:
            'Gus wishes you luck with genuine sympathy, which is worse than sarcasm. Show night now includes a mystery: which band does channel two eat? Gear: unresolved.',
          to: 'gear-3',
          effects: { stream: 'gear', status: 'shaky', days: 1, ledger: { tight: -12, rehearsals: -1 } },
        },
      ],
    },

    'gear-3': {
      id: 'gear-3',
      kind: 'scene',
      stream: 'gear',
      eyebrow: 'The band’s own kit',
      narrative:
        'Whatever the hall provides, the band brings its own tangle: leads, pedals, a snare, hopes. Right now that tangle lives in four bedrooms and nobody owns the list.',
      prompt: 'Who owns the gear list?',
      customTo: 'gear-4',
      options: [
        {
          id: 'label-crate',
          label: 'One crate, one list, everything labelled with tape and texta tonight — and ONE person owns checking it.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The crate becomes sacred. On show day, "where’s the tuner" is answered by a crate instead of a panic. Roadies have known this for fifty years; now so do you.',
          to: 'gear-4',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'everyone-theirs',
          label: 'Everyone’s responsible for their own gear — like always.',
          skill: 'Self-direction',
          response:
            '"Like always" includes the time the bass amp’s power lead stayed home twice in one term. Four separate memories is not a system; it’s four separate coin flips.',
          to: 'gear-4',
          effects: { ledger: { tight: -2 } },
        },
        {
          id: 'list-day-before',
          label: 'Make the list Friday night — closer to the day, fresher in mind.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Friday night is also when nerves arrive. Lists written by nervous people at 10pm have a documented missing-item rate. The maths prefers Monday.',
          to: 'gear-4',
        },
      ],
    },
    'gear-4': {
      id: 'gear-4',
      kind: 'text',
      stream: 'gear',
      eyebrow: 'Gus · during school',
      narrative: 'Gus texts in full sentences, because Gus does everything properly.',
      speaker: { name: 'Gus', role: 'AV tech · wants paperwork' },
      dialogue: [
        'If you want the good soundcheck, I need a stage plot and input list by Thursday. Who stands where, what plugs into what, how many vocal mics.',
        'Every year one band hands me a napkin drawing. One band hands me nothing and describes their setup interpretively at 5:30pm.',
        'Don’t be either band.',
      ],
      prompt: 'Paperwork for the man who controls your sound.',
      customTo: 'gear-5',
      options: [
        {
          id: 'proper-plot',
          label: 'Do it properly tonight: measured stage plot, numbered inputs, a note thanking him for channel two.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Gus receives possibly the first correctly-formatted stage plot in the event’s history. He prints it, laminates it, and shows it to another band as an example. You are now the favourite.',
          to: 'gear-5',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'decent-sketch',
          label: 'A clear phone sketch with labels — 90% of the value, 10% of the effort.',
          skill: 'Judgement & Decision-Making',
          response:
            'Genuinely fine. Gus deciphers the drummer’s handwriting with only one clarifying text. The soundcheck will run smoothly, if not lovingly.',
          to: 'gear-5',
        },
        {
          id: 'tell-him-there',
          label: '"We’ll just walk him through it at soundcheck — it’s four instruments, not Coachella."',
          skill: 'Self-direction',
          response:
            'Your 25-minute soundcheck now spends its first ten as a geography lesson. Gus’s Sharpie hovers over his channel-two route, reconsidering its generosity.',
          to: 'gear-5',
          effects: { ledger: { tight: -3 } },
        },
      ],
    },
    'gear-5': {
      id: 'gear-5',
      kind: 'talk',
      stream: 'gear',
      eyebrow: 'The AV room',
      narrative:
        'Thursday lunch, the AV room — a shrine of coiled cables and dead technology Gus keeps for parts. He waves you in and gestures at a shelf.',
      speaker: { name: 'Gus', role: 'AV tech · believer in backups' },
      dialogue: [
        'Backups. Whatever fails Saturday, it fails at the worst moment — that’s not pessimism, that’s physics.',
        'Take a spare vocal mic and two DI boxes now. If nothing breaks, you carry them back Sunday, no harm.',
        'And decide NOW who grabs what if something dies mid-set. In the moment, nobody decides anything — they just look at each other.',
      ],
      prompt: 'The failure drill: run it or skip it?',
      customTo: 'gear-6',
      options: [
        {
          id: 'run-drill',
          label: 'Take the spares AND run the drill at rehearsal — kill the vocal mic mid-song, practise the swap.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The drill takes four minutes and feels silly right up until it feels like insurance. The band now has a muscle memory for disaster, which is the opposite of panic.',
          to: 'gear-6',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'take-spares',
          label: 'Take the spares, skip the drill — having them is the main thing.',
          skill: 'Judgement & Decision-Making',
          response:
            'Having a fire extinguisher and knowing where it is are related but different safety levels. The spares ride to the show in the crate, unrehearsed.',
          to: 'gear-6',
        },
        {
          id: 'no-jinx',
          label: '"Planning for failure invites it. We’re good."',
          skill: 'Self-direction',
          response:
            'Gus stares at you across forty years of things that failed anyway. "Right," he says, and puts the DI boxes back slowly, like a man filing evidence.',
          to: 'gear-6',
          effects: { ledger: { tight: -3 } },
        },
      ],
    },
    'gear-6': {
      id: 'gear-6',
      kind: 'call',
      stream: 'gear',
      eyebrow: 'Friday night · Gus',
      narrative:
        'Friday, 8pm. Tomorrow the hall fills. One call confirms the whole sound picture — or leaves it to fate and a dying channel. You call Gus.',
      speaker: { name: 'Gus', role: 'AV tech · the final patch' },
      dialogue: [
        'Right on time. Here’s where we stand: your route around channel two is drawn, your soundcheck is 5:30, doors at 7.',
        'Confirm three things: arrival 5:15, cables coiled, pack-down crew after. Say them back to me and it’s locked.',
        'Or wing tomorrow. The desk remembers who wings.',
      ],
      prompt: 'Say it back, or leave it loose?',
      customTo: 'HUB',
      options: [
        {
          id: 'confirm-all',
          label: 'Say all three back, names attached — who arrives, who coils, who stays for pack-down.',
          skill: 'Judgement & Decision-Making',
          response:
            '"5:15, coiled, and four of us after — Sam’s bringing his dad’s trolley." A pause, then the highest praise in Gus’s language: "See you at 5:15." Gear: WIRED, in writing.',
          to: 'HUB',
          effects: { stream: 'gear', status: 'sorted', ledger: { tight: 3 } },
        },
        {
          id: 'confirm-vague',
          label: '"Yep, all good for tomorrow!" — enthusiasm covers the details.',
          skill: 'Self-direction',
          response:
            'Enthusiasm is not a run-sheet. Gus pencils you in as "probably fine," which is one grade below the grade that gets the extra five minutes of check time.',
          to: 'HUB',
        },
        {
          id: 'renegotiate',
          label: 'Actually — ask if the band can skip pack-down after all. School night, big day.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'A deal re-opened at the last minute is a deal downgraded. Gus goes formal: standard patch, standard check, channel two back in the lottery. The Sharpie route gets a question mark.',
          to: 'HUB',
          effects: { stream: 'gear', status: 'shaky', ledger: { tight: -4 } },
        },
      ],
    },

    'crowd-1': {
      id: 'crowd-1',
      kind: 'scene',
      stream: 'crowd',
      eyebrow: 'The crowd',
      narrative:
        "Last slot is prime time only if people STAY. By 9pm, half the hall historically drifts — unless someone gives them a reason to hold their spot. Zoe runs the school's socials account like a small media empire.",
      prompt: 'How do you keep a hall full until the last song?',
      customTo: 'crowd-call',
      options: [
        {
          id: 'brief-zoe',
          label: 'Call Zoe and hand her the whole canvas — countdowns, teasers, her call.',
          skill: 'Leadership & Influence',
          response: 'Zoe answers already talking: "I\'ve been WAITING for one of the bands to be smart about this."',
          to: 'crowd-call',
          effects: { stream: 'crowd', status: 'underway', ledger: { tight: 8 } },
        },
        {
          id: 'posters',
          label: 'Posters and word of mouth — the classics.',
          skill: 'Self-direction',
          response:
            'Twelve posters go up. Two survive the cleaner. Zoe DMs you a screenshot: "You know posters don\'t keep people till 9pm, right? Call me."',
          to: 'crowd-call',
          effects: { stream: 'crowd', status: 'underway' },
        },
        {
          id: 'lineup-luck',
          label: 'Last slot sells itself — the finale IS the marketing.',
          skill: 'Judgement & Decision-Making',
          response:
            'The finale is the marketing to people who already care. The other three hundred need a reason. Zoe finds YOU at recess: "Please let me help before you waste prime time."',
          to: 'crowd-call',
          effects: { stream: 'crowd', status: 'underway', ledger: { tight: -4 } },
        },
      ],
    },
    'crowd-call': {
      id: 'crowd-call',
      kind: 'call',
      stream: 'crowd',
      eyebrow: 'On the phone',
      narrative: 'You called Zoe. This is what Zoe is saying:',
      speaker: { name: 'Zoe', role: 'runs the school account · 4,000 followers' },
      dialogue: [
        'Here\'s the campaign and you can\'t say no to all of it.',
        'One: mystery countdown — "the last band has a secret" — no names, ten days out. Two: a 15-second rehearsal clip where the new drummer is CLEARLY incredible but you never see her face.',
        'Three, the closer: we announce the secret song exists but not what it is. People stay for reveals. It\'s science.',
      ],
      prompt: 'Zoe has built a hype machine. Feed it or throttle it.',
      customTo: 'crowd-3',
      options: [
        {
          id: 'feed-machine',
          label: 'Run all three — and give her the faceless Mia clip tonight.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The faceless drummer clip does numbers the school account has never seen. By show week, strangers are arguing in comments about who she is. Nobody is leaving before the last slot. Crowd: STAYING.',
          to: 'crowd-3',
          effects: { stream: 'crowd', status: 'sorted', days: 3, ledger: { tight: 16, rehearsals: -2 } },
        },
        {
          id: 'two-of-three',
          label: 'Countdown and clip yes — but no "secret song" promises we might not keep.',
          skill: 'Integrity & Ethics',
          response:
            'Honest and solid. The hype is real but ceilinged — curiosity without the cliffhanger. Zoe files the third idea under "wasted on cowards," affectionately. Crowd: healthy.',
          to: 'crowd-3',
          effects: { stream: 'crowd', status: 'sorted', days: 2, ledger: { tight: 6, rehearsals: -1 } },
        },
        {
          id: 'throttle',
          label: '"Tone it down — one tasteful announcement post. We\'re musicians, not influencers."',
          skill: 'Self-direction',
          response:
            'The tasteful post gets forty-one likes, thirty from parents. Prime time will play to whoever\'s left after the raffle. Zoe: "Tasteful. Cool cool cool." Crowd: thinning.',
          to: 'crowd-3',
          effects: { stream: 'crowd', status: 'shaky', days: 2, ledger: { tight: -10, rehearsals: -1 } },
        },
      ],
    },

    'crowd-3': {
      id: 'crowd-3',
      kind: 'scene',
      stream: 'crowd',
      eyebrow: 'Friday assembly · 30 seconds',
      narrative:
        'The battle gets a thirty-second plug at Friday assembly, and the organisers have offered each band the mic. Three hundred students, one shot, zero patience for boring.',
      prompt: 'What do you do with thirty seconds?',
      customTo: 'crowd-4',
      options: [
        {
          id: 'tease-mystery',
          label: 'Play into the mystery: "Last band. Last slot. You already know more about our drummer than we’ve told anyone." Walk off.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Eleven seconds, total silence, then the buzz. Half the assembly opens the school account before the bell. Confidence is a genre and you just played it.',
          to: 'crowd-4',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'straight-info',
          label: 'Clean and clear: who, when, why to stay till the end.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Informative, forgettable, fine. The message lands in the part of the brain that stores bus timetables.',
          to: 'crowd-4',
        },
        {
          id: 'skip-assembly',
          label: 'Skip it — assemblies are cringe and the socials are already working.',
          skill: 'Self-direction',
          response:
            'The other bands take their thirty seconds. One of them is funny. On a marketing channel with three hundred captive listeners, absence is also a message.',
          to: 'crowd-4',
          effects: { ledger: { tight: -3 } },
        },
      ],
    },
    'crowd-4': {
      id: 'crowd-4',
      kind: 'text',
      stream: 'crowd',
      eyebrow: 'Zoe · Wednesday',
      narrative: 'Zoe sends a screenshot of a graph with one arrow drawn on it in red.',
      speaker: { name: 'Zoe', role: 'socials · watches the numbers' },
      dialogue: [
        'Midweek dip, see the arrow. Normal, but we’re not doing normal.',
        'I need ONE piece of new fuel: behind-the-scenes photo, a poll, anything with a face in it.',
        'Bands that go quiet midweek play to the people who were always coming. Fuel me.',
      ],
      prompt: 'The machine is hungry midweek.',
      customTo: 'crowd-5',
      options: [
        {
          id: 'poll-closer',
          label: 'Give her a poll: "What should the LAST song of the whole night be?" — let the school argue about your set.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Four hundred votes and two friendly comment wars. The school now has an opinion about your closer, which means the school is now invested in hearing it.',
          to: 'crowd-5',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'bts-photo',
          label: 'Send a rehearsal photo — sweaty, real, mid-take.',
          skill: 'Emotional Intelligence',
          response:
            'Honest and warm; decent numbers. The dip flattens rather than reverses. Polls beat photos, Zoe notes, "for future reference."',
          to: 'crowd-5',
        },
        {
          id: 'ignore-dip',
          label: '"It’s a dip, Zoe, not a crisis. Focus on rehearsals."',
          skill: 'Judgement & Decision-Making',
          response:
            'Half right — rehearsals DO matter more. But momentum compounds both directions, and Thursday’s numbers open lower than Wednesday’s closed.',
          to: 'crowd-5',
          effects: { ledger: { tight: -2 } },
        },
      ],
    },
    'crowd-5': {
      id: 'crowd-5',
      kind: 'talk',
      stream: 'crowd',
      eyebrow: 'The other bands',
      narrative:
        'Priya — fronts the second-slot band, terrifyingly organised — finds you at the lockers with a proposition and a clipboard she pretends not to have.',
      speaker: { name: 'Priya', role: 'rival frontwoman · thinks in systems' },
      dialogue: [
        'Straight up: the night’s real enemy isn’t each other, it’s the 9pm drift. Empty hall, everyone loses.',
        'Proposal: all four bands push ONE message — "stay for the whole night, vote at the end." We cross-promote each other once.',
        'You’re the last slot. You benefit most. You in, or are we competitors about this?',
      ],
      prompt: 'Cooperate on the crowd, compete on the stage?',
      customTo: 'crowd-6',
      options: [
        {
          id: 'all-in-alliance',
          label: 'In — and offer the alliance YOUR megaphone: Zoe’s account promotes all four bands’ slots.',
          skill: 'Leadership & Influence',
          response:
            'The four-band push makes the NIGHT the event, not any one act. Priya shakes on it like a merger. The hall that stays full at 9pm is a hall you helped build.',
          to: 'crowd-6',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'in-quietly',
          label: 'In, but low-key — share their posts, keep Zoe’s big plays for your own band.',
          skill: 'Judgement & Decision-Making',
          response:
            'Half an alliance. It works, half. Priya clocks the asymmetry — organised people always do — and files it without comment.',
          to: 'crowd-6',
        },
        {
          id: 'decline-priya',
          label: '"We’re good — last slot promotes itself."',
          skill: 'Self-direction',
          response:
            'The other three bands run the campaign without you. It works — the hall stays fuller longer — and every "stay till the end" post conspicuously features three band names, not four.',
          to: 'crowd-6',
          effects: { ledger: { tight: -3 } },
        },
      ],
    },
    'crowd-6': {
      id: 'crowd-6',
      kind: 'scene',
      stream: 'crowd',
      eyebrow: 'Doors plan',
      narrative:
        'Last crowd decision: the room itself. Where people SIT shapes how a hall sounds — and a front section of the right people is the difference between polite applause and a wall of noise.',
      prompt: 'Who owns the front rows?',
      customTo: 'HUB',
      options: [
        {
          id: 'pack-front',
          label: 'Reserve the front two rows: Year 7s from the assembly, the jazz kids, everyone who voted in the poll — the loud believers.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'A curated front row is a hype section wearing a lanyard. When Mia’s first fill lands, the noise starts two metres from the stage and teaches the room how to behave. Crowd: PLACED.',
          to: 'HUB',
          effects: { stream: 'crowd', status: 'sorted', ledger: { tight: 3 } },
        },
        {
          id: 'first-come',
          label: 'First come, first seated — it’s a school hall, not a wedding.',
          skill: 'Integrity & Ethics',
          response:
            'Fair and fine. The front row self-selects to early arrivers: two teachers, a grandparent, and a kid doing homework. Great people. Quiet people.',
          to: 'HUB',
        },
        {
          id: 'doors-whatever',
          label: 'Doors are the organisers’ problem — you’re a musician.',
          skill: 'Self-direction',
          response:
            'The organisers optimise for fire exits, not atmosphere. The hall fills back-to-front like a bath, and the first three rows Saturday are a moat of empty chairs.',
          to: 'HUB',
          effects: { stream: 'crowd', status: 'shaky', ledger: { tight: -4 } },
        },
      ],
    },

    'rehearsal-1': {
      id: 'rehearsal-1',
      kind: 'scene',
      stream: 'rehearsal',
      eyebrow: 'The room',
      narrative:
        "A band is just the hours it practises. The music room is bookable — in theory. In practice, Mr Aldous guards the timetable like a dragon, and the jazz ensemble believes Thursday belongs to them by divine right.",
      prompt: 'Where do the hours come from?',
      customTo: 'rehearsal-call',
      options: [
        {
          id: 'call-aldous',
          label: 'Call Mr Aldous with an actual rehearsal plan — dates, times, what you’re working toward.',
          skill: 'Situational Awareness & Systems Thinking',
          response: '"A student. With a schedule. Proposed in advance." You can hear him sitting down.',
          to: 'rehearsal-call',
          effects: { stream: 'rehearsal', status: 'underway', ledger: { tight: 8 } },
        },
        {
          id: 'garage-only',
          label: 'Skip the politics — rehearse in Sam’s garage.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            "The garage works until Sam's neighbour starts a log of 'incidents.' Two rehearsals in, you need the music room, which means you need Mr Aldous.",
          to: 'rehearsal-call',
          effects: { stream: 'rehearsal', status: 'underway', ledger: { tight: 2 } },
        },
        {
          id: 'squat-room',
          label: 'Just use the room at lunch — possession is nine-tenths of rehearsal.',
          skill: 'Self-direction',
          response:
            'It works twice. The third time, the jazz ensemble arrives mid-chorus with Mr Aldous behind them like weather. Diplomacy is now mandatory.',
          to: 'rehearsal-call',
          effects: { stream: 'rehearsal', status: 'underway', ledger: { tight: -6 } },
        },
      ],
    },
    'rehearsal-call': {
      id: 'rehearsal-call',
      kind: 'call',
      stream: 'rehearsal',
      eyebrow: 'On the phone',
      narrative: 'You called Mr Aldous. This is what he’s saying:',
      speaker: { name: 'Mr Aldous', role: 'music dept · guards the timetable' },
      dialogue: [
        'The room is contested territory, as you know. Jazz has Thursdays, choir has Tuesdays, and entropy has the rest.',
        'However. I can give you Monday and Wednesday after school, plus the Friday BEFORE show week — prime slots — on one condition.',
        'Your band plays two songs at the Year 7 orientation assembly. My budget meeting is that week and I need the music program looking... alive.',
      ],
      prompt: 'Prime slots, priced in an assembly gig.',
      customTo: 'rehearsal-3',
      options: [
        {
          id: 'take-gig',
          label: 'Deal — and treat the assembly as Mia’s dress rehearsal: her first crowd, three weeks before the one that counts.',
          skill: 'Judgement & Decision-Making',
          response:
            "Two birds, one assembly: Aldous gets his showcase, and Mia plays to two hundred Year 7s — terrified, then triumphant. The nerves bill gets paid early, in a low-stakes room. Rehearsals: LOCKED, twice over.",
          to: 'rehearsal-3',
          effects: { stream: 'rehearsal', status: 'sorted', days: 3, ledger: { tight: 16, rehearsals: 2 } },
        },
        {
          id: 'slots-only',
          label: 'Take the slots, politely dodge the assembly — the set isn’t ready for daylight.',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"Hm. Mondays only, then." Half the hours, none of the favour. The set gets tight-ish and Mia\'s first crowd will be the big one. Rehearsals: enough, barely.',
          to: 'rehearsal-3',
          effects: { stream: 'rehearsal', status: 'sorted', days: 2, ledger: { tight: 2, rehearsals: -1 } },
        },
        {
          id: 'no-deal',
          label: '"An assembly gig for room access? That\'s extortion, sir." (Say it charmingly.)',
          skill: 'Integrity & Ethics',
          response:
            'He ALMOST smiles. "It\'s economics." No deal — the garage it is, with the neighbour\'s log growing daily and the drum kit half-packed at all times. Rehearsals: improvised.',
          to: 'rehearsal-3',
          effects: { stream: 'rehearsal', status: 'shaky', days: 2, ledger: { tight: -10, rehearsals: -1 } },
        },
      ],
    },

    'rehearsal-3': {
      id: 'rehearsal-3',
      kind: 'scene',
      stream: 'rehearsal',
      eyebrow: 'The hours',
      narrative:
        'However many slots you’ve got, the question is what fills them. Full run-throughs feel like progress; sections feel like homework. Only one of them fixes the bar everyone keeps fluffing.',
      prompt: 'How does a rehearsal hour get spent?',
      customTo: 'rehearsal-4',
      options: [
        {
          id: 'sections-first',
          label: 'Surgery first: list the five worst bars on the whiteboard, drill them till they’re boring, THEN one full run.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Drilling the ugly bits is nobody’s favourite hour and everybody’s best one. By Friday the five worst bars are just… bars. The full run at the end tastes like dessert.',
          to: 'rehearsal-4',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'full-runs',
          label: 'Full runs every time — the set as the audience will hear it.',
          skill: 'Self-direction',
          response:
            'Momentum feels great. The same bar breaks in the same place every run, gets the same wince, and stays broken — polished around, never through.',
          to: 'rehearsal-4',
          effects: { ledger: { tight: -2 } },
        },
        {
          id: 'vibe-split',
          label: 'Half and half, decided on the day by energy levels.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Reading the room is a real skill — but "energy levels" reliably vote for the fun option, and the ugly bars know how to hide behind a good vibe.',
          to: 'rehearsal-4',
        },
      ],
    },
    'rehearsal-4': {
      id: 'rehearsal-4',
      kind: 'talk',
      stream: 'rehearsal',
      eyebrow: 'The jazz ensemble',
      narrative:
        'Wednesday, packing down five minutes over time, you turn around to find Marcus — jazz ensemble captain, cardigan, unimpressed — in the doorway holding a trumpet like a gavel.',
      speaker: { name: 'Marcus', role: 'jazz captain · defends Thursdays' },
      dialogue: [
        'You’re over time. Again. We have regionals in a month and this room is OURS at four.',
        'I don’t make the timetable. I just enforce it, apparently, because nobody else will.',
        'We can keep doing this dance every week, or you can tell me how this actually works from now on.',
      ],
      prompt: 'Territory dispute, five minutes at a time.',
      customTo: 'rehearsal-5',
      options: [
        {
          id: 'swap-deal',
          label: 'Cut a deal: you’re out at 3:55 sharp — and jazz gets your Friday slot show week, since you’ll be at the hall anyway.',
          skill: 'Leadership & Influence',
          response:
            'Marcus recalculates, nods once, and offers their spare percussion mat "for your drummer" on the way out. Borders make good neighbours; trades make allies.',
          to: 'rehearsal-5',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'apologise-clean',
          label: 'Straight apology, no excuses — and set a phone alarm for 3:50 in front of him.',
          skill: 'Integrity & Ethics',
          response:
            'The alarm ceremony lands better than any argument. The dance ends; the détente is real if unwarmed.',
          to: 'rehearsal-5',
        },
        {
          id: 'battle-bigger',
          label: '"Regionals is a month away, Marcus. Our show is in DAYS."',
          skill: 'Self-direction',
          response:
            'Urgency versus urgency, loudly, in a doorway. Marcus goes to Mr Aldous, who rules for the timetable — and now your slot ends at 3:55 by DECREE, with a witness.',
          to: 'rehearsal-5',
          effects: { ledger: { tight: -3 } },
        },
      ],
    },
    'rehearsal-5': {
      id: 'rehearsal-5',
      kind: 'text',
      stream: 'rehearsal',
      eyebrow: 'Mia · 7:20pm',
      narrative: 'Mia texts in her careful way — three drafts visible in the typing bubbles before the real one lands.',
      speaker: { name: 'Mia', role: 'drummer · wants more reps' },
      dialogue: [
        'Ok so. I need more practice than the band slots. Like, me-alone practice, on a real kit.',
        'Problem: our neighbour has declared war on drums after 6pm and I get home at 5:40.',
        'I’m not asking you to fix it, I’m just saying it’s the thing standing between me and being ready.',
      ],
      prompt: 'She needs a kit and a room. You know a school.',
      customTo: 'rehearsal-6',
      options: [
        {
          id: 'lunch-kit',
          label: 'Ask Aldous for lunchtime music-room access for her — practice pads at home, real kit at lunch.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Aldous agrees before you finish the sentence — solo practice is the one request he’s never refused in thirty years. Mia gets five lunchtimes a week and stops apologising for wanting them.',
          to: 'rehearsal-6',
          effects: { ledger: { tight: 2 } },
        },
        {
          id: 'pads-enough',
          label: 'Tell her the practice pad covers most of it — kit feel is overrated.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Pads build hands, not confidence behind a full kit under pressure. She practises hard and arrives Saturday with technique in surplus and stage-feel on backorder.',
          to: 'rehearsal-6',
          effects: { ledger: { tight: -2 } },
        },
        {
          id: 'her-problem',
          label: '"Hmm, tricky. Let me know what you figure out!"',
          skill: 'Self-direction',
          response:
            'She figures out a church hall, eventually, on her own — and quietly updates her model of what asking you for things achieves.',
          to: 'rehearsal-6',
          effects: { ledger: { tight: -3 } },
        },
      ],
    },
    'rehearsal-6': {
      id: 'rehearsal-6',
      kind: 'scene',
      stream: 'rehearsal',
      eyebrow: 'Show week · the taper',
      narrative:
        'Show week. The instinct says CRAM — every night, every hour. Every musician who’s been here says the opposite: peak early, taper in, arrive hungry. One schedule to write.',
      prompt: 'How does show week run?',
      customTo: 'HUB',
      options: [
        {
          id: 'taper-plan',
          label: 'Taper: hard Monday-Tuesday, polish Wednesday, light Thursday, OFF Friday except a 20-minute ritual run.',
          skill: 'Judgement & Decision-Making',
          response:
            'Friday the band is rested, itchy, and slightly annoyed they can’t play more — which is EXACTLY the state that walks on stage dangerous. Rehearsals: SPENT right.',
          to: 'HUB',
          effects: { stream: 'rehearsal', status: 'sorted', ledger: { tight: 3 } },
        },
        {
          id: 'steady-week',
          label: 'Normal schedule all week — consistency got you here.',
          skill: 'Self-direction',
          response:
            'Consistent and slightly stale: by Thursday the set is a chore you perform correctly. Saturday needs it to be an event you attack.',
          to: 'HUB',
        },
        {
          id: 'cram-week',
          label: 'Every available hour — you can rest Sunday.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'By Thursday, Dana’s voice is fraying at the exact bar you protected, and everyone’s sick of song two. You’ve spent Saturday’s energy on Wednesday’s reps.',
          to: 'HUB',
          effects: { stream: 'rehearsal', status: 'shaky', ledger: { tight: -4, rehearsals: -2 } },
        },
      ],
    },

    'comp-frozen': {
      id: 'comp-frozen',
      kind: 'scene',
      eyebrow: 'Complication · 8:38pm, side of stage',
      narrative:
        "Show night. The gear is wired, the hall is FULL, the MC is saying your band's name — and Mia is frozen at the curtain gap, sticks in hand, whispering \"I can't.\" Two minutes. The room you built is waiting for the drummer you chose.",
      prompt: 'The whole three weeks comes down to one sentence.',
      customTo: 'finale',
      options: [
        {
          id: 'eight-bars',
          label: 'Get in front of her, eyes only: "First eight bars. Just us in the garage. I count you in, you stop thinking."',
          skill: 'Emotional Intelligence',
          response:
            'She locks onto your count like a lifeline. Bar nine, she stops thinking. By the chorus she\'s playing to the back row and the back row knows it.',
          to: 'finale',
          effects: { ledger: { tight: 16 } },
        },
        {
          id: 'captain-voice',
          label: 'Firm and warm: "You earned this stool. Play it like the audition. GO."',
          skill: 'Leadership & Influence',
          response:
            'It works — she walks on and plays tight, careful, a notch inside herself. The crowd never knows. You do.',
          to: 'finale',
          effects: { ledger: { tight: 6 } },
        },
        {
          id: 'swap-out',
          label: 'Protect the set — Sam covers the kit for song one, Mia joins "when she\'s ready."',
          skill: 'Judgement & Decision-Making',
          response:
            'Sam covers, rough but fine. Mia watches from the wing, and "ready" never comes — some doors close the second you don\'t walk through them.',
          to: 'finale',
          effects: { ledger: { tight: -12 } },
        },
      ],
    },
    'comp-pa': {
      id: 'comp-pa',
      kind: 'scene',
      eyebrow: 'Complication · 6:15pm, soundcheck',
      narrative:
        "Soundcheck. Channel two — the one nobody re-routed — dies exactly as prophesied, mid-check, and takes the vocal mix with it. The tech you never made an ally shrugs: \"It is what it is.\" You're on at 8:40.",
      prompt: 'No vocals, two hours, a hall filling up.',
      customTo: 'finale',
      options: [
        {
          id: 'church-rig',
          label: 'Ring the church around the corner — they have a vocal rig, and your band helps at their fete every year.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Twenty minutes of lugging and one grateful minister later, you own the only clean vocals on the bill. Last slot just became an advantage again.',
          to: 'finale',
          effects: { ledger: { tight: 12 } },
        },
        {
          id: 'rearrange',
          label: 'Re-voice the set live: drop the high harmony, push the guitar hook, let the crowd carry the chorus.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'A musician\'s fix for a technician\'s problem — clever, mostly works, and the sing-along chorus becomes an accidental moment. Thinner than it should be, braver than it looks.',
          to: 'finale',
          effects: { ledger: { tight: 6 } },
        },
        {
          id: 'demand-fix',
          label: 'Make the organisers fix THEIR PA — escalate until someone owns it.',
          skill: 'Self-direction',
          response:
            'You are right, loudly, for ninety minutes. No spare channel exists in the building. Your prep time is gone and the tech is now actively unhelpful.',
          to: 'finale',
          effects: { ledger: { tight: -12 } },
        },
      ],
    },

    finale: {
      id: 'finale',
      kind: 'scene',
      eyebrow: 'Show night · the last slot',
      narrative:
        "Lights down, hall full, your name in the MC's mouth. Twelve minutes belong to your band and everything you did — or didn't do — for three weeks walks on stage with you.",
      prompt: 'Last call before the count-in. Where’s your head?',
      customTo: 'END',
      options: [
        {
          id: 'for-the-band',
          label: 'One huddle: "Whatever happens out there, we built this. Play for each other, not the judges."',
          skill: 'Leadership & Influence',
          response:
            'Four heads in, one breath, and the band walks on as a THING, not four people. It sounds like it, too — whatever the scoreboard says, the room can hear a band that likes itself.',
          to: 'END',
          effects: { ledger: { tight: 12 } },
        },
        {
          id: 'for-the-win',
          label: '"Judges mark the closer hardest. Nail the ending, win the night." All business.',
          skill: 'Judgement & Decision-Making',
          response:
            'The set is precise, the ending lands clean. It\'s excellent. It\'s also slightly... performed. Bands play best when they forget the marking criteria.',
          to: 'END',
          effects: { ledger: { tight: 4 } },
        },
        {
          id: 'wing-it',
          label: 'No speeches. Walk on, plug in, let the night be the night.',
          skill: 'Self-direction',
          response:
            'Sometimes cool is a plan and sometimes it\'s the absence of one. The first song starts a half-beat ragged before the band finds each other. The crowd forgives; the judges note.',
          to: 'END',
          effects: { ledger: { tight: -4 } },
        },
      ],
    },
  },
  threadsBeforeFinale: 3,
  complication: { checkStream: 'gear', whenSorted: 'comp-frozen', otherwise: 'comp-pa' },
  finale: 'finale',
  endings: {
    high: {
      title: 'The room is still shouting and Mia won’t put the sticks down.',
      body: 'Clean sound when it mattered, a set with a secret weapon, a hall that stayed full to the last chord — and a first-timer who owned the closer. Whether the trophy comes or not stopped mattering around bar nine. Sam\'s already talking about the next song. You built this, call by call.{neglectLine}',
    },
    mid: {
      title: 'A real set, played all the way through.',
      body: 'Three weeks after the band fell apart, it stood on a stage and sounded like itself — that\'s the headline. It was tighter in the garage, and you can trace exactly why: the call made safe where brave was on offer. Every band that lasts has this exact night in its history.{neglectLine}',
    },
    low: {
      title: 'You got through it. The van ride home is quiet.',
      body: 'A ragged set through compromised sound to a thinning hall — and somebody who should have been on that stage watching from the wing. Here\'s the thing though: the band still exists, the next gig has a date, and you know precisely which three calls you\'d make differently. That\'s the whole apprenticeship.{neglectLine}',
    },
  },
}

/* ------------------------------------------------------------------ */
/* MARKET — Stall day                                                  */
/* ------------------------------------------------------------------ */

export const MARKET_SIM: JourneySimScript = {
  id: 'sim-market-stall-day',
  title: 'Stall Day',
  club: 'Makers’ market · school grounds',
  goalLabel: 'STALL DAY',
  daysTotal: 7,
  ledger: {
    primaryKey: 'cash',
    keys: {
      cash: { label: 'Cash tin', format: 'currency', start: 0 },
      stock: { label: 'Candles ready', format: 'count', start: 60 },
    },
    tierThresholds: { high: 500, mid: 300 },
    cardHead: 'Stall day',
  },
  mechanicLabel: 'Live cash ledger',
  theme: {
    // Warm market-morning world — candle-lit amber, nothing like the navy
    // cinema shell. The journey should FEEL like standing behind a stall.
    background: 'linear-gradient(180deg, #171009 0%, #241709 45%, #33200d 100%)',
    accent: '#f0b45c',
    topBar: 'rgba(23, 16, 9, 0.85)',
  },
  arrival: {
    beats: [
      'Sunday night. Sixty candles you made with your own hands, boxed on the kitchen table.',
      'The makers’ market is Saturday, {name} — stall fee paid, trestle booked.',
      'One week to turn three months of making into a real business.',
    ],
    mission: {
      headline: 'Sell out by three o’clock.',
      points: [
        'The cash tin is the score — $500 is a real business.',
        'Sixty candles, one Saturday. The till doesn’t do vibes.',
      ],
    },
  },
  hubReturn: {
    eyebrow: 'back at the kitchen table',
    narrative: "One box sorted — the next one's already waiting.",
    prompt: 'What do you take on next?',
  },
  intro: {
    eyebrow: 'Sunday night · the kitchen table',
    narrative:
      "Sixty candles you made with your own hands, boxed on the kitchen table, {name}. The makers' market is Saturday — stall fee paid, trestle booked, one week to turn three months of making into a real business for eight hours. Your mum is pretending not to watch how you handle it.",
    prompt: 'One week to market day. Where do you start?',
  },
  streams: {
    stock: { label: 'The stock', entry: 'stock-1', doorLabel: 'Finish the stock' },
    price: { label: 'Pricing & the sign', entry: 'price-1', doorLabel: 'Set your prices' },
    spot: { label: 'Your spot', entry: 'spot-1', doorLabel: 'Lock your spot' },
    wholesale: { label: 'The café lead', entry: 'wholesale-1', doorLabel: 'Chase the café lead' },
    buyers: { label: 'Getting buyers', entry: 'buyers-1', doorLabel: 'Get buyers coming' },
  },
  nodes: {
    'stock-1': {
      id: 'stock-1',
      kind: 'scene',
      stream: 'stock',
      eyebrow: 'The stock',
      narrative:
        "Sixty candles — except twelve are from your first-ever pour: wonky tops, weak scent, tunnelling risk. They LOOK fine in the box. Whether they go to market is a question about what your name means on a label.",
      prompt: 'What happens to the dodgy dozen?',
      customTo: 'stock-call',
      options: [
        {
          id: 'ask-mum',
          label: 'Ask Mum — she’s watched every batch and she’ll tell you the truth at full strength.',
          skill: 'Emotional Intelligence',
          response: 'She dries her hands, picks up a wonky one, and gives it the sniff of judgement.',
          to: 'stock-call',
          effects: { stream: 'stock', status: 'underway' },
        },
        {
          id: 'burn-test',
          label: 'Run a burn test tonight — data before decisions.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Three test candles later: two tunnel, one drowns its wick. The data has spoken. You take the verdict to Mum, who has opinions about the fix.',
          to: 'stock-call',
          effects: { stream: 'stock', status: 'underway', ledger: { stock: -3 } },
        },
        {
          id: 'sell-all',
          label: 'Sell everything — buyers can’t tell a wonky top from artisanal charm.',
          skill: 'Self-direction',
          response:
            'You rehearse the word "rustic" in the mirror and can\'t keep a straight face. Mum appears in the doorway with the look. The conversation happens anyway.',
          to: 'stock-call',
          effects: { stream: 'stock', status: 'underway' },
        },
      ],
    },
    'stock-call': {
      id: 'stock-call',
      kind: 'call',
      stream: 'stock',
      eyebrow: 'The kitchen consult',
      narrative: 'You asked Mum. This is what Mum is saying:',
      speaker: { name: 'Mum', role: 'quality control · unpaid, unsparing' },
      dialogue: [
        "Right. The twelve from the first batch — you know and I know. The scent's half-strength and two of them will tunnel.",
        "You've got three options and only one of them is nothing: re-melt them into new candles — costs you two evenings. Sell them cheap AS seconds, labelled honestly. Or bin the problem and sell fifty-eight.",
        "What you don't do is put them out at full price with your name on the bottom. That's not a candle decision, love. That's a reputation decision.",
      ],
      prompt: 'Two evenings, honest seconds, or a smaller table.',
      customTo: 'stock-3',
      options: [
        {
          id: 'remelt',
          label: 'Re-melt the dozen — two late nights, twelve GOOD candles, full stock with a clean conscience.',
          skill: 'Self-direction',
          response:
            'Tuesday and Wednesday nights smell like beeswax and stubbornness. By Thursday, sixty candles — actually sixty this time — and every single one is one you\'d put your name on. Because you did. Stock: FULL and honest.',
          to: 'stock-3',
          effects: { stream: 'stock', status: 'sorted', days: 2, ledger: { stock: 3 } },
        },
        {
          id: 'seconds-basket',
          label: 'A "seconds" basket at half price, labelled honestly: "first batch — imperfect, still lovely."',
          skill: 'Integrity & Ethics',
          response:
            'The honesty becomes a feature — the seconds basket charms people INTO the stall. Less margin, more trust, zero late nights. Stock: sorted, cleverly.',
          to: 'stock-3',
          effects: { stream: 'stock', status: 'sorted', days: 1 },
        },
        {
          id: 'quiet-mix',
          label: 'Mix the dozen through the good stock — spread the risk thin.',
          skill: 'Judgement & Decision-Making',
          response:
            "Mum says nothing, which says everything. Somewhere out there, twelve customers are about to form an opinion about your label — and two of them will be right. Stock: sixty, asterisked.",
          to: 'stock-3',
          effects: { stream: 'stock', status: 'shaky', days: 0, ledger: { cash: -20 } },
        },
      ],
    },

    'stock-3': {
      id: 'stock-3',
      kind: 'scene',
      stream: 'stock',
      eyebrow: 'The unboxing moment',
      narrative:
        'A candle at a market changes hands twice: once at your table, once at home when someone unwraps it. Right now yours travel in a supermarket bag. Packaging is the second impression you don’t get to attend.',
      prompt: 'What do they leave the stall in?',
      customTo: 'stock-4',
      options: [
        {
          id: 'kraft-wrap',
          label: 'Kraft paper, twine, and a small "hand-poured by…" sticker — $9 of materials, a whole brand.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Wrapped, they stop being candles and start being GIFTS — which is what half your Saturday buyers actually came for. The sticker is your logo now. It cost nine dollars.',
          to: 'stock-4',
          effects: { ledger: { cash: -9 } },
        },
        {
          id: 'paper-bags',
          label: 'Plain paper bags from the newsagent — tidy, cheap, done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Perfectly respectable. The candle arrives home anonymous, though — nothing on the bag says where to find you again.',
          to: 'stock-4',
          effects: { ledger: { cash: -4 } },
        },
        {
          id: 'byo-hands',
          label: 'People have hands. Save every cent of margin.',
          skill: 'Self-direction',
          response:
            'Margin preserved; two buyers juggle jars awkwardly to the carpark, and one gift purchase quietly doesn’t happen because "I’d have to wrap it myself."',
          to: 'stock-4',
        },
      ],
    },
    'stock-4': {
      id: 'stock-4',
      kind: 'text',
      stream: 'stock',
      eyebrow: 'Mum · from the kitchen',
      narrative: 'Mum texts you from one room away, which is how you know it’s official business.',
      speaker: { name: 'Mum', role: 'quality control · one room away' },
      dialogue: [
        'Two jars on the bench have no labels. Is that vanilla or the sandalwood? Because I can’t tell and neither will a customer.',
        'Also which ones are the strong pour and which are the light? You KNOW but the table won’t.',
        'Sort your system now, not Saturday 6am. Dinner’s at 7.',
      ],
      prompt: 'The labelling system, due before dinner.',
      customTo: 'stock-5',
      options: [
        {
          id: 'label-all',
          label: 'Label every jar tonight: scent, pour date, burn hours — bottom sticker, consistent format.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'An hour of stickers turns sixty mystery jars into inventory. Saturday, "which one’s the sandalwood?" gets answered by the jar itself, sixty times.',
          to: 'stock-5',
          effects: { ledger: { cash: 8 } },
        },
        {
          id: 'label-scents',
          label: 'Just scent labels — the rest lives in your head.',
          skill: 'Judgement & Decision-Making',
          response:
            'Halfway is workable: customers get answers, but "how long does it burn?" still routes every single time through you, mid-sale, all day.',
          to: 'stock-5',
        },
        {
          id: 'sniff-test',
          label: 'Reply: "the darker one’s sandalwood, you can smell them??"',
          skill: 'Self-direction',
          response:
            'Mum replies with one thumbs-down. Saturday, a customer asks which is vanilla, sniffs four jars, buys none, and leaves with a small headache you gave her.',
          to: 'stock-5',
          effects: { ledger: { cash: -8 } },
        },
      ],
    },
    'stock-5': {
      id: 'stock-5',
      kind: 'talk',
      stream: 'stock',
      eyebrow: 'The recipe book',
      narrative:
        'Wednesday night in the workshop, Mum picks up your best-selling scent, turns it over, and asks the question that separates makers from businesses.',
      speaker: { name: 'Mum', role: 'asking the business question' },
      dialogue: [
        'If this one sells out Saturday — could you make it again, EXACTLY the same, next month?',
        'Or is the recipe "a bit of this until it smells right"? Because charming doesn’t scale, love.',
        'Ratios, temperatures, cure times. In a book. Tonight’s as good a night as any.',
      ],
      prompt: 'Is the recipe in your head or on paper?',
      customTo: 'stock-6',
      options: [
        {
          id: 'write-book',
          label: 'Write the batch book tonight — every scent, ratios, temps, what went wrong and when.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Two hours of writing down what your hands already know. The hobby becomes repeatable, which is the entire secret difference between a good batch and a good business.',
          to: 'stock-6',
          effects: { ledger: { cash: 8 } },
        },
        {
          id: 'photos-notes',
          label: 'Photograph your notes and jars — a rough record beats none.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'A camera roll is a memory, not a method — but it’s SOMETHING, and future-you will squint at these photos gratefully.',
          to: 'stock-6',
        },
        {
          id: 'hands-know',
          label: '"My hands know the recipe, Mum. That’s the craft."',
          skill: 'Self-direction',
          response:
            'Your hands know THIS batch. Next month’s wax supplier changes, and your hands will be negotiating with a stranger. The craft was half memory all along.',
          to: 'stock-6',
          effects: { ledger: { cash: -6 } },
        },
      ],
    },
    'stock-6': {
      id: 'stock-6',
      kind: 'scene',
      stream: 'stock',
      eyebrow: 'Friday night · the pack',
      narrative:
        'Everything that happens at 6am Saturday is decided tonight. The stock can be counted, boxed in table order, and manifest-listed — or it can be Saturday-morning archaeology.',
      prompt: 'The Friday pack: how thorough?',
      customTo: 'HUB',
      options: [
        {
          id: 'manifest-pack',
          label: 'Full pack tonight: counted, boxed in unload order, manifest taped to each lid, car loaded except the fragile row.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The morning becomes: wake, drive, unpack, sell. Every box knows its job. Mum inspects the car boot and says "hm" — the good hm. Stock: PACKED like you’ve done this before.',
          to: 'HUB',
          effects: { stream: 'stock', status: 'sorted', ledger: { cash: 8 } },
        },
        {
          id: 'mostly-packed',
          label: 'Boxes packed, counting and loading left for the morning.',
          skill: 'Judgement & Decision-Making',
          response:
            'Eighty per cent tonight, twenty per cent at 5:40am — which is exactly when the twenty per cent finds ways to become forty.',
          to: 'HUB',
        },
        {
          id: 'morning-person',
          label: 'You’ll pack in the morning — you think better at dawn anyway.',
          skill: 'Self-direction',
          response:
            'Dawn-you inherits a bench of loose jars and a 7am bump-in. The tester candle and the float tin both make the trip only because Mum does a doorway check.',
          to: 'HUB',
          effects: { stream: 'stock', status: 'shaky', ledger: { cash: -8 } },
        },
      ],
    },

    'price-1': {
      id: 'price-1',
      kind: 'scene',
      stream: 'price',
      eyebrow: 'The price tag',
      narrative:
        "Your unit cost is $6 — soy wax, lead-free wicks, real oils. The discount shop sells candles for $8. Yours are better and you know it, but the sign has to make a stranger know it in four seconds.",
      prompt: 'What does the tag say?',
      customTo: 'price-call',
      options: [
        {
          id: 'ask-deb',
          label: 'Ring Deb — fifteen years of stalls, sells out by two o’clock every market.',
          skill: 'Situational Awareness & Systems Thinking',
          response: 'Deb answers over the squeak of a price gun. "Pricing call, is it? Sit down, kid."',
          to: 'price-call',
          effects: { stream: 'price', status: 'underway' },
        },
        {
          id: 'cost-plus',
          label: 'Do the maths yourself: cost × 2.5 = $15. Round to $16. Done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The spreadsheet agrees with you. Spreadsheets always do. Whether STRANGERS agree is a different table — you ring Deb to pressure-test it.',
          to: 'price-call',
          effects: { stream: 'price', status: 'underway' },
        },
        {
          id: 'undercut',
          label: 'Price at $10 — nearly the discount shop, obviously better. Volume wins.',
          skill: 'Self-direction',
          response:
            '$4 a candle for three months of work. You do that maths twice, feel slightly ill, and ring Deb before printing anything.',
          to: 'price-call',
          effects: { stream: 'price', status: 'underway' },
        },
      ],
    },
    'price-call': {
      id: 'price-call',
      kind: 'call',
      stream: 'price',
      eyebrow: 'On the phone',
      narrative: 'You called Deb. This is what Deb is saying:',
      speaker: { name: 'Deb', role: 'veteran stallholder · sells out by 2pm' },
      dialogue: [
        "First rule: never price against the discount shop. You're not selling the same thing, so don't let your SIGN say you are.",
        'Sixteen dollars is right — IF the sign does the work: "Hand-poured soy · lead-free wick · 40-hour burn." And put one candle out OPEN so people can smell what they\'re paying for.',
        'Second rule: have a bundle. Three for forty. People love maths that feels like winning.',
      ],
      prompt: 'Deb just gave you the playbook.',
      customTo: 'price-3',
      options: [
        {
          id: 'full-playbook',
          label: 'Run the whole playbook — $16, the working sign, the open smell-tester, 3-for-$40 bundle.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'You print the sign, stage the tester, and rehearse saying "three for forty" like it\'s no big deal. The stall now has a STORY at four seconds\' glance. Pricing: ARMED.',
          to: 'price-3',
          effects: { stream: 'price', status: 'sorted', days: 1, ledger: { cash: 48, stock: -3 } },
        },
        {
          id: 'price-only',
          label: 'Take the $16 but skip the theatre — good candles speak for themselves.',
          skill: 'Judgement & Decision-Making',
          response:
            'They speak — quietly, from inside closed jars, next to a sign that just says a number. Right price, mute story. Pricing: set, undersold.',
          to: 'price-3',
          effects: { stream: 'price', status: 'sorted', days: 1, ledger: { cash: 32, stock: -2 } },
        },
        {
          id: 'ignore-deb',
          label: '"Respectfully, Deb, $10 moves more units. Volume is my strategy."',
          skill: 'Self-direction',
          response:
            '"It\'s your funeral, and it\'ll be a well-attended one at those prices." Every sale now earns $4 and teaches your market you\'re the cheap stall. Pricing: a race to the bottom, entered voluntarily.',
          to: 'price-3',
          effects: { stream: 'price', status: 'shaky', days: 0, ledger: { cash: 20, stock: -2 } },
        },
      ],
    },

    'price-3': {
      id: 'price-3',
      kind: 'scene',
      stream: 'price',
      eyebrow: 'The sign itself',
      narrative:
        'Whatever the sign SAYS, it also has to exist — legible from three metres, upright in wind, not laminated-in-the-rain-at-midnight. The physical sign is where pricing strategies go to get tested.',
      prompt: 'How does the sign get made?',
      customTo: 'price-4',
      options: [
        {
          id: 'chalkboard-a',
          label: 'Borrow Mum’s A-frame chalkboard — big letters, changeable prices, looks like a real shop.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The A-frame stands in the walkway and does the job signs are FOR: it stops feet. Changeable chalk also means the 2:30pm bundle flip takes ten seconds.',
          to: 'price-4',
          effects: { ledger: { cash: 8 } },
        },
        {
          id: 'print-nice',
          label: 'Design and print it properly at Officeworks — $12, crisp, professional.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Handsome and fixed: the price is now literally laminated. Any mid-day pricing move will happen on a sticky note stuck over your own design.',
          to: 'price-4',
          effects: { ledger: { cash: -12 } },
        },
        {
          id: 'texta-cardboard',
          label: 'Texta on cardboard Saturday morning — rustic is on-brand anyway.',
          skill: 'Self-direction',
          response:
            '"Rustic" and "rushed" are neighbours with a shared fence. The 6am version has a spelling wobble and a coffee ring, both of which customers will politely not mention.',
          to: 'price-4',
          effects: { ledger: { cash: -6 } },
        },
      ],
    },
    'price-4': {
      id: 'price-4',
      kind: 'text',
      stream: 'price',
      eyebrow: 'Deb · 7:15am',
      narrative: 'Deb texts at stallholder o’clock, mid-setup at some other market, gulls audible in the typos.',
      speaker: { name: 'Deb', role: 'veteran stallholder · gospel via SMS' },
      dialogue: [
        'Forgot the most important bit. CARD READER. Borrow one, hire one, beg one.',
        'Half the market walks past with no cash and every intention. "Sorry, cash only" is the most expensive sentence at a market.',
        'Square reader’s like $2 a transaction or whatever. You’ll make it back by 9:30. Trust Deb.',
      ],
      prompt: 'Tap-and-go or cash only?',
      customTo: 'price-5',
      options: [
        {
          id: 'get-reader',
          label: 'Sort a reader this week — borrow your cousin’s Square, test it Thursday with a $1 charge.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Tested Thursday, trusted Saturday. The third customer of the day says "tap? oh thank god" and buys a bundle. Deb’s maths holds by 9:20.',
          to: 'price-5',
          effects: { ledger: { cash: 12 } },
        },
        {
          id: 'cash-plus-transfer',
          label: 'Cash plus a printed bank-transfer QR — free, mostly works.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Mostly works: three buyers do the transfer dance politely. Two others say "I’ll come back with cash" — a sentence with a 40% survival rate.',
          to: 'price-5',
        },
        {
          id: 'cash-only',
          label: 'Cash only — readers are fees and faff. There’s an ATM at the servo.',
          skill: 'Self-direction',
          response:
            'The servo is 400 metres away. You spend Saturday watching a particular kind of walk: interested, patting pockets, apologetic, gone.',
          to: 'price-5',
          effects: { ledger: { cash: -12 } },
        },
      ],
    },
    'price-5': {
      id: 'price-5',
      kind: 'talk',
      stream: 'price',
      eyebrow: 'The float',
      narrative:
        'Thursday night, Mum puts a biscuit tin on the table and rattles it. The float quiz has begun, and she has strong feelings born of twenty years of school fete tills.',
      speaker: { name: 'Mum', role: 'ran the fete till for a decade' },
      dialogue: [
        'First customer of the day pays for a $16 candle with a $50. What do you hand back, from where?',
        'You need a float, love. Fives, tens, a roll of coins — about $100 in boring money, counted TWICE.',
        'And decide now where big notes live during the day. Not the open tin. Markets have wind and light fingers, in that order.',
      ],
      prompt: 'The float: how much, and where does money live?',
      customTo: 'price-6',
      options: [
        {
          id: 'proper-float',
          label: '$100 float, counted twice — and a zip pouch under your apron for everything over $50.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The $50 moment happens at 8:40am exactly as prophesied. You hand back change like a till professional while the stallholder next door is still asking around for fives.',
          to: 'price-6',
          effects: { ledger: { cash: 8 } },
        },
        {
          id: 'small-float',
          label: '$40 in mixed change — enough for a normal morning.',
          skill: 'Judgement & Decision-Making',
          response:
            'Enough for a NORMAL morning. Rae’s post is aiming for a better-than-normal one, and by 10am you’re buying back your own fives from the doorknob man.',
          to: 'price-6',
        },
        {
          id: 'wing-change',
          label: 'Whatever’s in your wallet plus optimism.',
          skill: 'Self-direction',
          response:
            'The first $50 note defeats your wallet at 8:40am. The sale survives via Mum’s handbag, which now holds an equity stake in the business.',
          to: 'price-6',
          effects: { ledger: { cash: -8 } },
        },
      ],
    },
    'price-6': {
      id: 'price-6',
      kind: 'scene',
      stream: 'price',
      eyebrow: 'The four-second test',
      narrative:
        'The sign, the price, the story — all decided by people who already love your candles. The last check is a stranger: does the whole pitch land in the four seconds a walking person gives it?',
      prompt: 'Test the pitch on fresh eyes, or trust it?',
      customTo: 'HUB',
      options: [
        {
          id: 'stranger-test',
          label: 'Set the table in the driveway and make the neighbour walk past it cold — then fix what she misses.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'She reads the price, misses the 40-hour burn line ("too small"), and asks if the tester’s allowed to be sniffed ("put SMELL ME on it"). Four seconds of stranger beats four hours of theory. Pricing: PROVEN.',
          to: 'HUB',
          effects: { stream: 'price', status: 'sorted', ledger: { cash: 8 } },
        },
        {
          id: 'family-jury',
          label: 'Run it past the family at dinner — close enough to fresh eyes.',
          skill: 'Emotional Intelligence',
          response:
            'The family jury loves everything, which is the problem with family juries. One useful note survives the warmth: Dad couldn’t read the burn line either.',
          to: 'HUB',
        },
        {
          id: 'trust-the-work',
          label: 'It’s tested enough — Deb designed half of it, after all.',
          skill: 'Self-direction',
          response:
            'Deb designed the STRATEGY; your handwriting executed it. The gap between those two things is exactly the kind that shows up at nine on a Saturday, in public.',
          to: 'HUB',
          effects: { stream: 'price', status: 'shaky', ledger: { cash: -8 } },
        },
      ],
    },

    'spot-1': {
      id: 'spot-1',
      kind: 'scene',
      stream: 'spot',
      eyebrow: 'The map',
      narrative:
        "Stall #14 — the one you were assigned — is in the dead middle row, downwind of the sausage sizzle. Everything about a market stall is location, and location belongs to Faye, the coordinator, who likes people who ask early.",
      prompt: 'Play the spot you got, or play for a better one?',
      customTo: 'spot-call',
      options: [
        {
          id: 'ring-faye',
          label: 'Ring Faye early in the week, polite and specific: is a corner spot open?',
          skill: 'Leadership & Influence',
          response: 'Faye answers with the rustle of the site map. Everything about her says "first in, best dressed."',
          to: 'spot-call',
          effects: { stream: 'spot', status: 'underway' },
        },
        {
          id: 'keep-14',
          label: 'Fourteen is fine — make the stall itself the destination.',
          skill: 'Self-direction',
          response:
            "Bold — but 'destination' needs foot traffic to redirect. You check the map again, notice #14's neighbours (tarps, a man who sells doorknobs), and ring Faye.",
          to: 'spot-call',
          effects: { stream: 'spot', status: 'underway' },
        },
        {
          id: 'early-grab',
          label: 'Turn up at 6am Saturday and quietly set up in a better empty spot.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'A plan that works right up until its owner arrives at 6:40 with a van and a temper. You put the idea down slowly and ring Faye like a person with a future at this market.',
          to: 'spot-call',
          effects: { stream: 'spot', status: 'underway' },
        },
      ],
    },
    'spot-call': {
      id: 'spot-call',
      kind: 'call',
      stream: 'spot',
      eyebrow: 'On the phone',
      narrative: 'You called Faye. This is what Faye is saying:',
      speaker: { name: 'Faye', role: 'market coordinator · owns the map' },
      dialogue: [
        'Corner spots went weeks ago, love. BUT.',
        "The flower stall just cancelled — that's #2, right at the entrance, morning sun, everyone walks past it twice. It's yours for an extra $15 site fee.",
        'One catch: entrance stalls MUST look full all day. A half-empty entrance table makes my whole market look tired. Can you keep it stocked and styled till three?',
      ],
      prompt: 'The best spot on the map, with a standard attached.',
      customTo: 'spot-3',
      options: [
        {
          id: 'take-two',
          label: 'Take #2 — pay the $15, and plan the table so it restocks from boxes underneath and never looks bare.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'You sketch the table like a shop window: height at the back, tester at the front, restock crates hidden under the cloth. Faye inks you in at the entrance. Spot: PRIME.',
          to: 'spot-3',
          effects: { stream: 'spot', status: 'sorted', days: 1, ledger: { cash: -15 } },
        },
        {
          id: 'stay-14',
          label: 'Thank her, keep #14 — save the $15 and skip the pressure.',
          skill: 'Judgement & Decision-Making',
          response:
            'Reasonable. Number 14 is what it is: steady trickle, sausage smoke, doorknob man doing surprisingly good numbers. Spot: yours, modest.',
          to: 'spot-3',
          effects: { stream: 'spot', status: 'sorted', days: 0 },
        },
        {
          id: 'haggle-fee',
          label: '"Fifteen extra? Can you waive it, since you need the entrance filled anyway?"',
          skill: 'Reasoning & Critical Thinking',
          response:
            'A beat of silence. "The fee stands, and so does the queue of people who\'ll pay it." You\'ve talked yourself back to #14 and onto Faye\'s "handle with care" list. Spot: middle row, plus a lesson in leverage — namely, who has it.',
          to: 'spot-3',
          effects: { stream: 'spot', status: 'shaky', days: 0 },
        },
      ],
    },

    'spot-3': {
      id: 'spot-3',
      kind: 'scene',
      stream: 'spot',
      eyebrow: 'The dining-table dress rehearsal',
      narrative:
        'Wherever the stall ends up, the TABLE is the shop. Tonight the dining table can become a full dress rehearsal — cloth, risers, tester, sign — or the layout can stay theoretical until it meets a windy 7am.',
      prompt: 'Mock the whole table tonight?',
      customTo: 'spot-4',
      options: [
        {
          id: 'full-mock',
          label: 'Full mock-up: cloth, upturned boxes as risers, phone photo from "customer height" — then fix what the photo shows.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The photo is brutal and useful: the sign hides behind the tallest jar and the tester is unreachable. Twenty minutes of shuffling later, the table reads like a shop window. Saturday setup: fifteen minutes, zero thinking.',
          to: 'spot-4',
          effects: { ledger: { cash: 8 } },
        },
        {
          id: 'sketch-layout',
          label: 'Sketch the layout on paper — the idea’s the important part.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The sketch is sound. Paper, however, has no wind, no wobbly leg, and no sun angle — three co-designers who only show up on the day.',
          to: 'spot-4',
        },
        {
          id: 'vibe-it',
          label: 'You’ll arrange it on the day — tables aren’t hard.',
          skill: 'Self-direction',
          response:
            'Tables aren’t hard; mornings are. The 7am version gets built under time pressure in front of early browsers, and stays at "first draft" all day.',
          to: 'spot-4',
          effects: { ledger: { cash: -8 } },
        },
      ],
    },
    'spot-4': {
      id: 'spot-4',
      kind: 'talk',
      stream: 'spot',
      eyebrow: 'The doorknob man',
      narrative:
        'You track down Ron — the doorknob man, twelve years at this market, sells brass fittings and wisdom in equal measure — at his shed, because intel beats guessing.',
      speaker: { name: 'Ron', role: 'doorknob stall · twelve years of Saturdays' },
      dialogue: [
        'Ah, the candle kid. Right, free education: the crowd comes in two waves. Nine sharp — the serious buyers, lists, no browsing. Eleven — the wanderers, coffee in hand, buying feelings.',
        'Your morning pitch is SPECS — burn time, ingredients. Your eleven o’clock pitch is GIFTS — birthdays, teachers, "treat yourself."',
        'Same candles, two languages. Most stallholders only ever learn one.',
      ],
      prompt: 'Two crowds, two pitches. Use it?',
      customTo: 'spot-5',
      options: [
        {
          id: 'two-pitches',
          label: 'Build both pitches — specs card for the 9am wave, a "gifts sorted" line for the wanderers, swap emphasis at 10:30.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Saturday proves Ron right within the hour: the 9am crowd reads your burn-time card and nods; the 11am crowd hears "teacher presents, done" and buys pairs. Two languages, one table.',
          to: 'spot-5',
          effects: { ledger: { cash: 12 } },
        },
        {
          id: 'one-pitch',
          label: 'Stick to one honest pitch — quality speaks both languages.',
          skill: 'Integrity & Ethics',
          response:
            'It speaks one and a half. The morning crowd loves you; the eleven o’clock wanderers hear ingredients when they wanted feelings, and drift on to the fudge stall.',
          to: 'spot-5',
        },
        {
          id: 'doorknob-doubt',
          label: 'Nod politely — crowd theory from a doorknob salesman.',
          skill: 'Self-direction',
          response:
            'Ron has out-earned every scented stall at that market for a decade. Saturday, you watch him switch pitches at 10:30 like a man changing gears, and take the lesson late.',
          to: 'spot-5',
          effects: { ledger: { cash: -8 } },
        },
      ],
    },
    'spot-5': {
      id: 'spot-5',
      kind: 'text',
      stream: 'spot',
      eyebrow: 'Faye · Thursday',
      narrative: 'Faye’s logistics text arrives formatted like she’s done this nine hundred times, because she has.',
      speaker: { name: 'Faye', role: 'market coordinator · runs a tight ship' },
      dialogue: [
        'Bump-in 6:30–7:30, gates lock at 7:45. Park in the west lot AFTER unloading, not before, or you’ll block the food trucks and I’ll narrate it over the PA.',
        'Forecast says gusts to 30km/h. Everything on your table either weighs something or is tied to something. Tablecloth clips are $4 at the hardware.',
        'Reply CONFIRMED so I know you read past the first line.',
      ],
      prompt: 'Logistics, weather, and a woman who checks.',
      customTo: 'spot-6',
      options: [
        {
          id: 'confirmed-full',
          label: 'Reply CONFIRMED, buy the clips, plan the unload-then-park sequence with Mum tonight.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Four dollars of clips and one rehearsed unload later, your 6:45 bump-in is smooth enough that Faye points it out to a flustered newcomer as "how it’s done." Status: teacher’s pet, deservedly.',
          to: 'spot-6',
          effects: { ledger: { cash: -4 } },
        },
        {
          id: 'confirmed-skim',
          label: 'Reply CONFIRMED and skim the rest — you’ll figure it out there.',
          skill: 'Self-direction',
          response:
            'You park before unloading. The PA narration is brief, warm, and heard by the entire market. The food-truck queue applauds when you move the car.',
          to: 'spot-6',
          effects: { ledger: { cash: -8 } },
        },
        {
          id: 'ask-questions',
          label: 'Reply CONFIRMED plus two good questions: where’s the nearest power point, and can you leave the trestle overnight Friday?',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Answers: yes to power (nobody ever asks), yes to the trestle (saves your 6:30 entirely). Questions asked early are logistics solved free.',
          to: 'spot-6',
          effects: { ledger: { cash: 8 } },
        },
      ],
    },
    'spot-6': {
      id: 'spot-6',
      kind: 'scene',
      stream: 'spot',
      eyebrow: 'Friday · the sky check',
      narrative:
        'Last spot decision: the weather plan. The forecast says gusts and a 20% shower chance — which either becomes a two-minute contingency now, or improvisational theatre at 11am tomorrow.',
      prompt: 'The weather contingency: real or vibes?',
      customTo: 'HUB',
      options: [
        {
          id: 'tarp-kit',
          label: 'Pack the kit: clear tarp for the rain, clips everywhere, and a "wet weather layout" photo saved on your phone.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The 11:20 shower lasts nine minutes. Your table spends them under clear plastic, still shoppable, while two stalls down someone dries doorknobs with a tea towel. Spot: WEATHERPROOF.',
          to: 'HUB',
          effects: { stream: 'spot', status: 'sorted', ledger: { cash: 8 } },
        },
        {
          id: 'umbrella-plan',
          label: 'Chuck the beach umbrella in the car — covers most of it.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"Most of it" is doing real work in that sentence. The umbrella covers the stock OR the sign OR you, and the gusts have votes on which.',
          to: 'HUB',
        },
        {
          id: 'twenty-percent',
          label: '20% means 80% fine. Pack nothing.',
          skill: 'Self-direction',
          response:
            'The market is outdoors and statistics are indoors. Nine wet minutes cost you the 11am wanderer wave and the kraft wrap’s crispness — the 80% never showed up to help.',
          to: 'HUB',
          effects: { stream: 'spot', status: 'shaky', ledger: { cash: -8 } },
        },
      ],
    },

    'wholesale-1': {
      id: 'wholesale-1',
      kind: 'scene',
      stream: 'wholesale',
      eyebrow: 'The lead',
      narrative:
        "Lena, who owns the café on Main St, bought two candles from your school fete table last term. She's mentioned — twice — that she'd 'love to chat about stocking them.' A standing order would change what this hobby is.",
      prompt: 'The biggest opportunity isn’t at the market at all.',
      customTo: 'wholesale-call',
      options: [
        {
          id: 'call-lena',
          label: 'Call Lena BEFORE market day — walk in with a deal, not a maybe.',
          skill: 'Leadership & Influence',
          response: 'Lena picks up over the milk steamer. "The candle kid! I was hoping you\'d call."',
          to: 'wholesale-call',
          effects: { stream: 'wholesale', status: 'underway' },
        },
        {
          id: 'after-market',
          label: 'Wait until after Saturday — walk in with sales numbers as proof.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Patient — but Lena mentioned it twice, and twice-mentioned things get bought from somebody. You call her before someone else\'s candles do.',
          to: 'wholesale-call',
          effects: { stream: 'wholesale', status: 'underway' },
        },
        {
          id: 'too-big',
          label: 'A standing order on top of school? Park it — the market is enough.',
          skill: 'Self-direction',
          response:
            'Sensible fear, worth interrogating. You talk it over with Mum, who says the thing mums say: "You can always say no AFTER you hear the offer." You call Lena.',
          to: 'wholesale-call',
          effects: { stream: 'wholesale', status: 'underway' },
        },
      ],
    },
    'wholesale-call': {
      id: 'wholesale-call',
      kind: 'call',
      stream: 'wholesale',
      eyebrow: 'On the phone',
      narrative: 'You called Lena. This is what Lena is saying:',
      speaker: { name: 'Lena', role: 'café owner · Main St' },
      dialogue: [
        "Here's what I'm thinking: twenty candles a month for the shop and the gift shelf.",
        "I'd need them at $9 each — retail's hard, margins are real — and the first batch by NEXT Friday.",
        'And a custom label. "Burnt Bean & Co." Something that looks like it belongs on my counter, not a school fete.',
      ],
      prompt: 'A real order: wrong price, tight deadline, extra work. Negotiate.',
      customTo: 'wholesale-3',
      options: [
        {
          id: 'counter-full',
          label: 'Counter kindly and on paper: "$11 a unit, first batch the Friday AFTER next — and the custom label’s free."',
          skill: 'Leadership & Influence',
          response:
            'The label offer lands exactly as planned — that\'s the part she wanted. "Eleven, week after next, done. Send me an invoice, businessperson." Your first standing order, on YOUR terms. Café: SIGNED.',
          to: 'wholesale-3',
          effects: { stream: 'wholesale', status: 'sorted', days: 1, ledger: { cash: 220, stock: -20 } },
        },
        {
          id: 'take-as-is',
          label: 'Take it exactly as offered — $9, next Friday. A real order is a real order.',
          skill: 'Judgement & Decision-Making',
          response:
            '$3 a unit and four school nights sacrificed to hit HER deadline. Real, yes. Priced like a favour, also yes. Café: signed, on her terms.',
          to: 'wholesale-3',
          effects: { stream: 'wholesale', status: 'sorted', days: 1, ledger: { cash: 180, stock: -20 } },
        },
        {
          id: 'decline-lena',
          label: '"I\'m flattered — but between school and the market, I\'d be promising what I can\'t deliver."',
          skill: 'Integrity & Ethics',
          response:
            'Honest, and she takes it well: "Door\'s open when you\'re ready." A clean no beats a broken yes — though the shelf will hold SOMEONE\'s candles by spring. Café: passed, politely.',
          to: 'wholesale-3',
          effects: { stream: 'wholesale', status: 'sorted', days: 0 },
        },
      ],
    },

    'wholesale-3': {
      id: 'wholesale-3',
      kind: 'scene',
      stream: 'wholesale',
      eyebrow: 'The real numbers',
      narrative:
        'Whatever you told Lena, the conversation exposed a gap: you’ve never costed a candle PROPERLY. Wax, wick, jar, oils — sure. But your hours, the stall fees, the petrol, the burnt batches. The real number decides every future deal.',
      prompt: 'Do the real maths?',
      customTo: 'wholesale-4',
      options: [
        {
          id: 'true-costing',
          label: 'Spreadsheet the TRUE unit cost tonight — materials, failures, fees, and your hours at actual dollars.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The real number is $8.90, not $6 — your evenings were free only to everyone else. Every price you quote from tonight onward stands on ground that exists.',
          to: 'wholesale-4',
          effects: { ledger: { cash: 12 } },
        },
        {
          id: 'materials-only',
          label: 'Materials-only costing is standard for hobbyists — keep it simple.',
          skill: 'Judgement & Decision-Making',
          response:
            'Simple, and quietly generous to everyone who buys from you. The word "hobbyist" is doing a lot of load-bearing in that sentence, and Lena noticed it before you did.',
          to: 'wholesale-4',
        },
        {
          id: 'vibes-costing',
          label: 'The prices feel right — maths would just complicate it.',
          skill: 'Self-direction',
          response:
            'The prices feel right the way a guess feels right: comfortably, until someone asks a follow-up question. Wholesale buyers exclusively ask follow-up questions.',
          to: 'wholesale-4',
          effects: { ledger: { cash: -8 } },
        },
      ],
    },
    'wholesale-4': {
      id: 'wholesale-4',
      kind: 'talk',
      stream: 'wholesale',
      eyebrow: 'The capacity talk',
      narrative:
        'Mum sits down at the workshop bench with two teas, which is the formal signal. The subject: what this business is allowed to cost you.',
      speaker: { name: 'Mum', role: 'asking the hard one' },
      dialogue: [
        'Straight question: how many hours a week can this take — with school, with footy, with actual sleep?',
        'Because orders don’t care about exams. A standing order is standing there in November too, holding its little invoice.',
        'Pick a number now, while nobody’s asking you for anything. That number is your real answer to every future Lena.',
      ],
      prompt: 'How many hours is this allowed to be?',
      customTo: 'wholesale-5',
      options: [
        {
          id: 'set-capacity',
          label: 'Set it honestly: eight hours a week, cap forty candles a month — and write it where you’ll see it.',
          skill: 'Judgement & Decision-Making',
          response:
            'A number on the workshop wall. Future deals now get measured against it instead of against enthusiasm — which is how fourteen-year-old businesses survive being fourteen.',
          to: 'wholesale-5',
          effects: { ledger: { cash: 8 } },
        },
        {
          id: 'depends-week',
          label: '"Depends on the week, Mum. I’ll manage it."',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Flexible, which is what people say before the flexible thing quietly eats Tuesday nights. Mum lets it go, in the specific way that means she hasn’t.',
          to: 'wholesale-5',
        },
        {
          id: 'as-much-as-it-takes',
          label: '"As much as it takes. This could be big."',
          skill: 'Self-direction',
          response:
            'Ambition without a boundary isn’t a plan, it’s a weather system. Mum writes nothing, says nothing, and starts keeping her own quiet count of your late nights.',
          to: 'wholesale-5',
          effects: { ledger: { cash: -6 } },
        },
      ],
    },
    'wholesale-5': {
      id: 'wholesale-5',
      kind: 'text',
      stream: 'wholesale',
      eyebrow: 'Lena · Thursday',
      narrative: 'Lena sends a photo: an empty shelf near her register, warm light, a handwritten "watch this space" card already propped on it.',
      speaker: { name: 'Lena', role: 'café owner · shelf optimist' },
      dialogue: [
        'The space in question 👆 Whatever happens between us, that shelf needs SOMETHING lovely on it by spring.',
        'No pressure. Medium pressure. The card was Jodie’s idea.',
        'Come past after the market Saturday either way — I want to hear how it went. Flat white’s on me.',
      ],
      prompt: 'A warm door, held open. Respond.',
      customTo: 'wholesale-6',
      options: [
        {
          id: 'photo-back',
          label: 'Send back a photo of your best three candles styled together: "Saturday first. Then let’s talk shelves."',
          skill: 'Leadership & Influence',
          response:
            'She replies with the heart-eyes and shows the photo to two customers that afternoon. Whatever the paperwork says, the relationship is now the asset.',
          to: 'wholesale-6',
          effects: { ledger: { cash: 8 } },
        },
        {
          id: 'polite-thanks',
          label: '"Thanks Lena! Will do 😊" — warm, brief, done.',
          skill: 'Emotional Intelligence',
          response:
            'Perfectly nice. The door stays open; the moment to put something IN it drifts past like the smell of someone else’s coffee.',
          to: 'wholesale-6',
        },
        {
          id: 'seen-1015',
          label: 'You’ll reply after the market — busy week, she’ll understand.',
          skill: 'Self-direction',
          response:
            'Seen, 10:15am. Businesses run on many things, and "seen" is not one of them. Saturday’s flat white gets measurably cooler.',
          to: 'wholesale-6',
          effects: { ledger: { cash: -6 } },
        },
      ],
    },
    'wholesale-6': {
      id: 'wholesale-6',
      kind: 'scene',
      stream: 'wholesale',
      eyebrow: 'The one-pager',
      narrative:
        'Last question on the café front, and it’s bigger than the café: what IS this thing you’re building? A one-page plan — what you make, what it costs, what you charge, where it goes next — would answer every Lena forever.',
      prompt: 'Write the one-pager?',
      customTo: 'HUB',
      options: [
        {
          id: 'write-onepager',
          label: 'One page, tonight: the product, the real costs, the capacity cap, and one sentence on where this goes by Christmas.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'It takes forty minutes and fits on one page, because true things are short. You tape it inside the workshop cupboard — a business plan disguised as a note to self. Café front: SORTED, on paper.',
          to: 'HUB',
          effects: { stream: 'wholesale', status: 'sorted', ledger: { cash: 8 } },
        },
        {
          id: 'plan-in-notes',
          label: 'Jot the key numbers in your phone notes — planning without the ceremony.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The numbers exist, filed between a wifi password and a song lyric. Findable, technically. Consulted, occasionally.',
          to: 'HUB',
        },
        {
          id: 'just-vibes',
          label: 'Plans are for later — right now it’s candles and momentum.',
          skill: 'Self-direction',
          response:
            'Momentum without direction is just speed. The next opportunity will find you exactly this unprepared, and the one after that will stop coming to find you at all.',
          to: 'HUB',
          effects: { stream: 'wholesale', status: 'shaky', ledger: { cash: -8 } },
        },
      ],
    },

    'buyers-1': {
      id: 'buyers-1',
      kind: 'scene',
      stream: 'buyers',
      eyebrow: 'The crowd',
      narrative:
        "A market stall with no audience is a table outside. Auntie Rae runs the town's community Facebook group — eight thousand members, terrifying reach, strong opinions about punctuation.",
      prompt: 'How do buyers find out you exist?',
      customTo: 'buyers-call',
      options: [
        {
          id: 'ring-rae',
          label: 'Ring Auntie Rae and pitch her a post — she loves a local-kid-makes-good story.',
          skill: 'Leadership & Influence',
          response: '"Darling! I was JUST saying the group needs more young makers. Tell me everything."',
          to: 'buyers-call',
          effects: { stream: 'buyers', status: 'underway' },
        },
        {
          id: 'own-account',
          label: 'Start a little Instagram for the candles — build your own audience.',
          skill: 'Self-direction',
          response:
            'Nine followers by Wednesday, six of them relatives. Good long game, wrong week. Auntie Rae\'s group has eight thousand people in it TODAY. You ring her.',
          to: 'buyers-call',
          effects: { stream: 'buyers', status: 'underway' },
        },
        {
          id: 'walk-ins',
          label: 'Markets bring their own crowd — save the marketing energy.',
          skill: 'Judgement & Decision-Making',
          response:
            "They bring A crowd — for the sausage sizzle and the doorknobs. Buyers looking for YOU specifically don't exist unless you create them. Mum leaves Auntie Rae's number on the fridge, casually.",
          to: 'buyers-call',
          effects: { stream: 'buyers', status: 'underway' },
        },
      ],
    },
    'buyers-call': {
      id: 'buyers-call',
      kind: 'call',
      stream: 'buyers',
      eyebrow: 'On the phone',
      narrative: 'You called Auntie Rae. This is what she’s saying:',
      speaker: { name: 'Auntie Rae', role: 'community group admin · 8,000 members' },
      dialogue: [
        'Here\'s what works in the group, and I know because I\'ve run it for nine years.',
        'Not an ad — a STORY. "Local Year 9 turns three months of pocket money into a candle business, debuts Saturday." With photos of you actually making them. Flour on the apron, so to speak.',
        'Post goes up Thursday 7pm — peak scroll. And you WILL reply to every single comment, including Barbara\'s. ESPECIALLY Barbara\'s.',
      ],
      prompt: 'A story, a time slot, and Barbara.',
      customTo: 'buyers-3',
      options: [
        {
          id: 'full-story',
          label: 'Give her the whole story — workshop photos tonight, Thursday 7pm, and yes, you’ll answer Barbara.',
          skill: 'Emotional Intelligence',
          response:
            'The post does 400 reactions and 61 comments, three of them Barbara\'s (answered, graciously). By Friday, strangers are planning to "pop by for the candle kid." Buyers: INCOMING.',
          to: 'buyers-3',
          effects: { stream: 'buyers', status: 'sorted', days: 1, ledger: { cash: 40, stock: -3 } },
        },
        {
          id: 'post-no-photos',
          label: 'Do the post but skip the making-of photos — keep it simple.',
          skill: 'Judgement & Decision-Making',
          response:
            'A nice post that reads like an ad does ad numbers: forty likes, two shares. Reach without story is just reach. Buyers: some.',
          to: 'buyers-3',
          effects: { stream: 'buyers', status: 'sorted', days: 1, ledger: { cash: 16, stock: -1 } },
        },
        {
          id: 'too-cringe',
          label: '"Photos of ME making them? That\'s so embarrassing. Just the candles, please."',
          skill: 'Self-direction',
          response:
            '"The cringe IS the marketing, darling." She posts candles-only; it sinks by 8pm under a post about roadworks. Buyers: whoever wanders past.',
          to: 'buyers-3',
          effects: { stream: 'buyers', status: 'shaky', days: 1 },
        },
      ],
    },

    'buyers-3': {
      id: 'buyers-3',
      kind: 'scene',
      stream: 'buyers',
      eyebrow: 'The photos',
      narrative:
        'Whatever goes online, it needs photos — and candle photos are their own dark art. Phone-flash-on-the-kitchen-bench makes $16 candles look like $4 ones. Light is free; knowing that is the trick.',
      prompt: 'How do the photos get made?',
      customTo: 'buyers-4',
      options: [
        {
          id: 'window-light',
          label: 'Golden hour by the window: lit candle, plain background, one styled trio shot, one honest workshop mess shot.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Forty minutes and zero dollars later, the photos look like a boutique’s. The workshop-mess one outperforms everything — people trust flour on the apron.',
          to: 'buyers-4',
          effects: { ledger: { cash: 8 } },
        },
        {
          id: 'quick-snaps',
          label: 'Decent snaps on the bench — good enough, week’s busy.',
          skill: 'Judgement & Decision-Making',
          response:
            'Good enough, literally: the photos say "fine" about candles that are better than fine. The gap between product and picture is margin, leaking.',
          to: 'buyers-4',
        },
        {
          id: 'stock-photos',
          label: 'Grab nice candle photos off Pinterest — yours look basically the same.',
          skill: 'Self-direction',
          response:
            'They look BETTER, which is the trap. The third commenter asks which one is actually yours, in the polite tone people use right before deciding something about you.',
          to: 'buyers-4',
          effects: { ledger: { cash: -8 } },
        },
      ],
    },
    'buyers-4': {
      id: 'buyers-4',
      kind: 'text',
      stream: 'buyers',
      eyebrow: 'Barbara · 8:52pm',
      narrative: 'It begins. A comment notification, then two more. Barbara has questions, and Barbara’s questions have an audience.',
      speaker: { name: 'Barbara', role: 'community group · asks for a friend' },
      dialogue: [
        'Asking for my daughter who has ASTHMA — are these actually soy or "soy blend"?? The blend ones are basically paraffin. People should know.',
        'Also $16 seems steep for a candle a child made, no offence intended, just being honest for the group.',
        'Will there be unscented options. My late husband couldn’t abide lavender.',
      ],
      prompt: 'Three Barbaras in one Barbara. The group is watching.',
      customTo: 'buyers-5',
      options: [
        {
          id: 'gracious-facts',
          label: 'Answer all three, warmly and specifically: 100% soy with the supplier named, the price explained in one line, and yes — two unscented, she can have first pick.',
          skill: 'Emotional Intelligence',
          response:
            'Grace under Barbara is a spectator sport, and you just won it. Her reply — "well. that IS proper soy. see you Saturday" — reads like a knighthood. The group notices.',
          to: 'buyers-5',
          effects: { ledger: { cash: 12 } },
        },
        {
          id: 'brief-reply',
          label: 'One polite line answering the soy question — don’t feed the rest.',
          skill: 'Judgement & Decision-Making',
          response:
            'The soy answer lands; the unanswered price jab sits there gathering four sympathetic likes. Half-answered Barbaras regenerate.',
          to: 'buyers-5',
        },
        {
          id: 'ignore-barbara',
          label: 'Don’t engage — everyone knows what Barbara’s like.',
          skill: 'Self-direction',
          response:
            'Everyone does know what Barbara’s like, which is why they watch how people HANDLE her. Silence reads as "the kid can’t answer," and the thread drifts somewhere unhelpful.',
          to: 'buyers-5',
          effects: { ledger: { cash: -10 } },
        },
      ],
    },
    'buyers-5': {
      id: 'buyers-5',
      kind: 'talk',
      stream: 'buyers',
      eyebrow: 'The volunteers',
      narrative:
        'Friday lunch, your two best mates corner you: they’re coming Saturday "to help." Enthusiasm: infinite. Retail experience: a lemonade stand in Year 4, which ended in a refund.',
      speaker: { name: 'Tess', role: 'best mate · dangerously keen' },
      dialogue: [
        'Right, we’re in. What do we DO though? Do we, like, yell about candles? I’ll do it. I’ll yell.',
        'Josh wants the money job. I told him you’d never give Josh the money job.',
        'Seriously — jobs, please, or we’ll freelance, and you KNOW how we freelance.',
      ],
      prompt: 'Free staff, feral energy. Deploy them.',
      customTo: 'buyers-6',
      options: [
        {
          id: 'brief-crew',
          label: 'Give them real jobs with scripts: Tess out front with the tester ("have a smell — the vanilla’s the famous one"), Josh on restock and wrap. Money stays yours.',
          skill: 'Leadership & Influence',
          response:
            'Tess turns out to be a NATURAL — she stops more feet in an hour than the sign does all day. Josh wraps like a machine. The stall becomes three people deep and feels like a shop.',
          to: 'buyers-6',
          effects: { ledger: { cash: 12 } },
        },
        {
          id: 'moral-support',
          label: 'Tell them just to come hang out — company’s the real help.',
          skill: 'Emotional Intelligence',
          response:
            'Lovely, and slightly crowded: two extra bodies BEHIND the table chatting to you is two fewer customers who can reach the tester. Friendly congestion is still congestion.',
          to: 'buyers-6',
        },
        {
          id: 'decline-help',
          label: 'Solo operation — explaining jobs takes longer than doing them.',
          skill: 'Self-direction',
          response:
            'True for one hour, false for eight. At the 11am rush you’re wrapping, charging, and restocking in a three-way juggle while two willing helpers eat sausage rolls somewhere, unasked.',
          to: 'buyers-6',
          effects: { ledger: { cash: -8 } },
        },
      ],
    },
    'buyers-6': {
      id: 'buyers-6',
      kind: 'scene',
      stream: 'buyers',
      eyebrow: 'Saturday morning · the last post',
      narrative:
        'Stall built, sun up, ten minutes before the gates. One thing left the phone can do: tell everyone who meant to come that TODAY is the day and WHERE you are — before it goes in the apron pocket for good.',
      prompt: 'The morning-of post: what and when?',
      customTo: 'HUB',
      options: [
        {
          id: 'morning-post',
          label: 'One great post at 8am — stall photo, "found us at #2, the vanilla’s already going" — then the phone goes IN THE APRON until the 1pm lull.',
          skill: 'Judgement & Decision-Making',
          response:
            'The post catches the whole "saw it Thursday, forgot" crowd at breakfast. Three people arrive holding their phones open to it like tickets. Then the phone disappears and the HUMANS get you. Buyers: DELIVERED.',
          to: 'HUB',
          effects: { stream: 'buyers', status: 'sorted', ledger: { cash: 12 } },
        },
        {
          id: 'story-updates',
          label: 'Live updates through the day — content is a flywheel.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The flywheel spins; so do you. Every story posted is ninety seconds of eye contact the queue didn’t get, and the queue keeps a ledger of its own.',
          to: 'HUB',
        },
        {
          id: 'no-post',
          label: 'The Thursday post did its job — today is for selling.',
          skill: 'Self-direction',
          response:
            'Half right: today IS for selling. But "Saturday! Stall #2!" was the one message the Thursday crowd was waiting for, and it never came. A dozen intenders stay intenders.',
          to: 'HUB',
          effects: { stream: 'buyers', status: 'shaky', ledger: { cash: -8 } },
        },
      ],
    },

    'comp-refund': {
      id: 'comp-refund',
      kind: 'scene',
      eyebrow: 'Complication · 11:30am, the refund',
      narrative:
        "Saturday, mid-rush. A woman returns her candle from an hour ago — \"it tunnelled, barely any scent\" — while FOUR people wait behind her, listening. You know the batch. Your pricing and your sign promised better. Now the queue watches what your name is worth.",
      prompt: 'Four witnesses. One unhappy customer. Go.',
      customTo: 'finale',
      options: [
        {
          id: 'loud-refund',
          label: 'Full refund PLUS a replacement from the good batch — loud enough for the queue: "If it\'s not right, I make it right."',
          skill: 'Integrity & Ethics',
          response:
            'She leaves with both and a smile. Two people in the queue buy TWO candles each — the refund cost $16 and purchased a reputation in front of witnesses.',
          to: 'finale',
          effects: { ledger: { cash: 48, stock: -5 } },
        },
        {
          id: 'quiet-swap',
          label: 'Swap it quietly with an apology and keep the line moving.',
          skill: 'Judgement & Decision-Making',
          response:
            'Fair, fast, forgettable. She\'s satisfied; the queue learned nothing about you either way. A moment spent, not invested.',
          to: 'finale',
          effects: { ledger: { stock: -1 } },
        },
        {
          id: 'explain-burn',
          label: 'Explain candle care — tunnelling usually means short first burns. Offer 50% off her next one.',
          skill: 'Reasoning & Critical Thinking',
          response:
            "You might even be right about the burn time. Doesn't matter: four listening customers heard \"it's sort of your fault.\" Two of them drift off mid-lecture.",
          to: 'finale',
          effects: { ledger: { cash: -8 } },
        },
      ],
    },
    'comp-pricewar': {
      id: 'comp-pricewar',
      kind: 'scene',
      eyebrow: 'Complication · 9:20am, next door',
      narrative:
        "Stall #15 unloads industrial boxes of candles priced at $8 — and your tag says a number you never built a story for. Customers hover between the two tables, comparing with their eyebrows. The price war you didn't prepare for has set up next door.",
      prompt: 'Same product, half the price, six feet away. Apparently.',
      customTo: 'finale',
      options: [
        {
          id: 'rewrite-sign',
          label: 'Hold your price and rewrite the sign NOW: "Hand-poured soy · lead-free · 40-hr burn — smell the difference," with an open tester.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The sign starts doing the arguing. People sniff, nod, and pay double for a different product — because now it visibly IS one. The $8 stall keeps its customers; you keep yours.',
          to: 'finale',
          effects: { ledger: { cash: 64, stock: -4 } },
        },
        {
          id: 'meet-neighbour',
          label: 'Walk over, introduce yourself, and turn #15 into an ally — trade referrals, not blows.',
          skill: 'Emotional Intelligence',
          response:
            '"Party favours and gifts aren\'t the same shelf," she agrees, and by 11 you\'re sending each other customers. Not maximum margin — maximum neighbourhood.',
          to: 'finale',
          effects: { ledger: { cash: 48, stock: -3 } },
        },
        {
          id: 'drop-price',
          label: 'Drop to $10 before the morning’s lost — match the market.',
          skill: 'Self-direction',
          response:
            'Sales tick up; margin evaporates. You\'ve priced three months of craft like an afternoon of factory time, and the $8 stall barely noticed you enter the war.',
          to: 'finale',
          effects: { ledger: { cash: 40, stock: -4 } },
        },
      ],
    },

    finale: {
      id: 'finale',
      kind: 'scene',
      eyebrow: 'Saturday 2:30pm · the last half hour',
      narrative:
        "Thirty minutes left, fourteen candles on the table, crowd thinning toward the carpark. Whatever the day was, this is its last move — and Deb was right about people loving maths that feels like winning.",
      prompt: 'Close it out.',
      customTo: 'END',
      options: [
        {
          id: 'bundle-close',
          label: 'Flip the sign: "3 for $40 — gift-wrapped free." Turn stragglers into a sell-out.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Gift logic beats candle logic at 2:30pm. Four buyers do Christmas maths on the spot, and the SOLD OUT sign goes up at 2:56. You keep the sign as a trophy.',
          to: 'END',
          effects: { ledger: { cash: 160, stock: -12 } },
        },
        {
          id: 'hold-firm',
          label: 'Hold full price to the bell — leftovers become café stock or next month’s head start.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Six more sell at $16; eight come home. Whether that\'s "unsold stock" or "inventory" depends entirely on the café call you made this week.',
          to: 'END',
          effects: { ledger: { cash: 96, stock: -6 } },
        },
        {
          id: 'slash-end',
          label: 'Slash to $5 and clear the table — empty boxes, full vibes.',
          skill: 'Self-direction',
          response:
            'The table empties fast — right up until the woman who paid $16 at 9:05 walks past the $5 sign. Her face does the accounting for you.',
          to: 'END',
          effects: { ledger: { cash: 70, stock: -14 } },
        },
      ],
    },
  },
  threadsBeforeFinale: 3,
  complication: { checkStream: 'price', whenSorted: 'comp-refund', otherwise: 'comp-pricewar' },
  finale: 'finale',
  endings: {
    high: {
      title: 'Count the tin again. Yep — you smashed it.',
      body: 'A prime spot that stayed styled, a sign that argued for you, strangers who came looking for "the candle kid" — and a cash tin that holds more than the goal. Mum stops pretending not to watch. Three months of making, one week of deciding, and every big number traces to a call you made under pressure.{neglectLine}',
    },
    mid: {
      title: 'A real trading day. The tin doesn’t lie.',
      body: 'Solid sales, a lesson or two priced into the margin, most of the goal covered. Somewhere between the pricing, the spot and the café you left real money on the table — and you know exactly where, which is precisely how shop owners get sharp.{neglectLine}',
    },
    low: {
      title: 'The tin is light. The lessons aren’t.',
      body: 'A price you couldn\'t defend, a moment in front of the queue that went sideways, a table that emptied the wrong way. But look: you MADE a thing, took it to market, and survived contact with real customers. The next stall — and there will be one — starts from everything this one taught you.{neglectLine}',
    },
  },
}

/* ------------------------------------------------------------------ */
/* Registry — journey id → sim script                                  */
/* ------------------------------------------------------------------ */

export const SIM_SCRIPTS: Record<string, JourneySimScript> = {
  'journey-footy': FOOTY_SIM,
  'journey-surf': SURF_SIM,
  'journey-farm': FARM_SIM,
  'journey-band': BAND_SIM,
  'journey-market': MARKET_SIM,
}
