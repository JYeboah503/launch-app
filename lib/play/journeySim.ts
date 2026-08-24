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

export type StreamKey = 'team' | 'venue' | 'food' | 'promo' | 'sponsor' | 'umpires'
export type StreamStatus = 'todo' | 'underway' | 'sorted' | 'shaky'

export interface SimEffect {
  stream?: StreamKey
  status?: StreamStatus
  days?: number
  score?: number
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
  kind: 'scene' | 'call'
  stream?: StreamKey
  eyebrow: string
  narrative: string
  prompt: string
  /** Call nodes: who is on the phone and what they say, line by line. */
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
  complication: { venueSorted: string; venueNot: string }
  finale: string
  endings: { high: SimEnding; mid: SimEnding; low: SimEnding }
}

export const FOOTY_SIM: JourneySimScript = {
  id: 'sim-footy-grand-final',
  title: 'The Grand Final',
  club: 'Westside Junior Football Club',
  goalLabel: 'GRAND FINAL DAY',
  daysTotal: 12,
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
      customTo: 'HUB',
      options: [
        {
          id: 'take-macca',
          label: '"Macca\'s our marshal. Tell him he\'s got the fluoro vest and the good chair."',
          skill: 'Emotional Intelligence',
          response:
            "There's a pause, and you can hear Johnny grinning down the phone. \"You just made an old bloke's year.\" By Thursday you have runners, a scoreboard crew, and a marshal who arrives two hours early. Crew: SORTED.",
          to: 'HUB',
          effects: { stream: 'team', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'crew-not-macca',
          label: '"I\'ll take the crew — but I need a quicker marshal. I\'ll tell Macca myself, straight up."',
          skill: 'Integrity & Ethics',
          response:
            'Johnny goes quiet. "Your call, captain. Tell him kind." The call with Macca is hard — he takes it on the chin and offers to run the gate instead. You got the faster marshal, and it cost you something real. Crew: sorted, with a bruise.',
          to: 'HUB',
          effects: { stream: 'team', status: 'sorted', days: 2, score: 3 },
        },
        {
          id: 'shop-around',
          label: '"Let me get back to you — I want to see my other options first."',
          skill: 'Judgement & Decision-Making',
          response:
            'You spend two days working the other five numbers and land... one scoreboard volunteer. When you ring Johnny back, his tone is cooler: "Offer still stands. Half of it, anyway." Crew: patched together, and it shows.',
          to: 'HUB',
          effects: { stream: 'team', status: 'shaky', days: 3, score: -6 },
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
      customTo: 'HUB',
      options: [
        {
          id: 'writing-today',
          label: 'Get it in writing TODAY — chase the league office until the email lands, then walk a printed copy to Marge.',
          skill: 'Self-direction',
          response:
            'Three phone calls, one "I\'ll see what I can do," and at 4:40pm the confirmation lands. You print two copies. Marge sticks one to her shed door: "Ground\'s yours. Fresh lines Friday." Venue: LOCKED.',
          to: 'HUB',
          effects: { stream: 'venue', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'tomorrow',
          label: '"I\'ll sort the paperwork first thing tomorrow — today\'s already full."',
          skill: 'Judgement & Decision-Making',
          response:
            'Tomorrow works — barely. The league office "can\'t find the request" and it takes till 5pm. Marge inks you in with a raised eyebrow: "Cut it finer next time, why don\'t you." Venue: locked, eventually.',
          to: 'HUB',
          effects: { stream: 'venue', status: 'sorted', days: 2, score: 2 },
        },
        {
          id: 'shell-be-right',
          label: '"Pencilled in is basically ours. She\'ll be right."',
          skill: 'Reasoning & Critical Thinking',
          response:
            "Marge exhales like she's heard this exact sentence before. \"Your funeral, love.\" The pennant squad's manager, it turns out, is very fond of paperwork. The ground is now genuinely contested.",
          to: 'HUB',
          effects: { stream: 'venue', status: 'shaky', days: 1, score: -7 },
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
      customTo: 'HUB',
      options: [
        {
          id: 'do-both',
          label: 'Take the whole brief: ask the butcher about the van yourself, and build her the six-person roster.',
          skill: 'Leadership & Influence',
          response:
            "You work it like a checklist. The butcher says yes to the van before you finish the sentence ('Rosa sent you? Say no more'). The roster fills in a day once people hear Rosa's running it. Canteen: HUMMING.",
          to: 'HUB',
          effects: { stream: 'food', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'roster-only',
          label: 'Promise the roster, but park the van idea — one favour at a time.',
          skill: 'Judgement & Decision-Making',
          response:
            'The roster fills. The dead fridge means half the usual stock, and Rosa makes it work because Rosa always makes it work — but she notices the van never happened. Canteen: fine. Just fine.',
          to: 'HUB',
          effects: { stream: 'food', status: 'sorted', days: 2, score: 2 },
        },
        {
          id: 'hand-back',
          label: '"You clearly have this handled, Rosa — I\'ll leave the canteen entirely with you."',
          skill: 'Emotional Intelligence',
          response:
            '"Handled? I just told you what I NEED, and you handed it back." The silence afterwards is educational. Rosa will run her canteen regardless — short-staffed, short-stocked, and shorter with you.',
          to: 'HUB',
          effects: { stream: 'food', status: 'shaky', days: 1, score: -6 },
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
      customTo: 'HUB',
      options: [
        {
          id: 'greenlight-pie',
          label: 'Greenlight all three — and put her pie post on the club banner. Track down that login tonight.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The login lives with a committee member\'s ex-treasurer\'s son. You get it by 9pm. The pie post does 11,000 views by Sunday and the bakery sells out twice. People you\'ve never met are asking about gate times. Crowd: COMING.',
          to: 'HUB',
          effects: { stream: 'promo', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'posts-only',
          label: 'Countdown and profiles yes — skip the pie, keep it about the footy.',
          skill: 'Judgement & Decision-Making',
          response:
            "Clean, sensible, a bit beige. The posts do fine among people already coming. Mia does it all properly and files the pie under 'ideas wasted on adults.' Crowd: decent.",
          to: 'HUB',
          effects: { stream: 'promo', status: 'sorted', days: 2, score: 2 },
        },
        {
          id: 'rein-in',
          label: '"Let\'s not get carried away — one poster template, and I approve every post first."',
          skill: 'Leadership & Influence',
          response:
            "You can hear the air go out of her. \"...Sure. Send me the template when you've approved it.\" Three posts happen instead of fifteen. Approval bottlenecks kill momentum, and this one killed hers.",
          to: 'HUB',
          effects: { stream: 'promo', status: 'shaky', days: 2, score: -5 },
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
      customTo: 'HUB',
      options: [
        {
          id: 'deal-alfie',
          label: '"Deal — and Alfie doesn\'t just toss the coin, he walks out with the captains."',
          skill: 'Emotional Intelligence',
          response:
            "Sav's arms uncross down the phone line — you can hear it. \"...He'll lose his mind. Come get the cash Thursday.\" $400, cheap snags, one very rehearsed eight-year-old. Money: SORTED, with interest.",
          to: 'HUB',
          effects: { stream: 'sponsor', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'negotiate-banner',
          label: 'Take it, but be straight: "The fence spot by the canteen is bigger — cameras favour the goals though. Your pick."',
          skill: 'Integrity & Ethics',
          response:
            "Sav respects the honesty and picks the canteen spot ('people buy pies, people see banner'). Same deal, cleaner terms, and he tells the bakery you're 'one of the straight ones.' Money: sorted.",
          to: 'HUB',
          effects: { stream: 'sponsor', status: 'sorted', days: 1, score: 4 },
        },
        {
          id: 'too-many-strings',
          label: '"The coin toss is the league\'s call, not mine — I can\'t promise Alfie anything."',
          skill: 'Judgement & Decision-Making',
          response:
            "Technically true. Also the sound of $400 leaving the room. \"No worries,\" Sav says, in the tone that means worries. The trophies get downgraded and the first-aid kit stays vintage. Money: thin.",
          to: 'HUB',
          effects: { stream: 'sponsor', status: 'shaky', days: 1, score: -5 },
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
      customTo: 'HUB',
      options: [
        {
          id: 'sign-today',
          label: 'Get Tom\'s signature within the hour and book the good crew — plus a note: "lunch is on the club."',
          skill: 'Self-direction',
          response:
            'You catch Tom at the hardware store and he signs on a paint tin. Form back by 2pm. Karen: "Good crew\'s yours. And I\'ll mention the lunch." Whistles: SORTED — by people with no cousins on either team.',
          to: 'HUB',
          effects: { stream: 'umpires', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'cheap-crew',
          label: '"$180 is steep — what\'s the budget crew like?"',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"Enthusiastic," Karen says, diplomatically. You save $60 and acquire an umpire who calls holding-the-ball like he\'s being paid per whistle. The hill will have opinions. Whistles: booked, budget.',
          to: 'HUB',
          effects: { stream: 'umpires', status: 'sorted', days: 1, score: 1 },
        },
        {
          id: 'form-tomorrow',
          label: '"The form\'s basically a formality — I\'ll send it back tomorrow."',
          skill: 'Judgement & Decision-Making',
          response:
            'Tomorrow, the good crew belongs to the seaside league. Karen finds you "a crew" — singular experience, plural nerves. Whistles: technically covered.',
          to: 'HUB',
          effects: { stream: 'umpires', status: 'shaky', days: 1, score: -5 },
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
        "The morning of. Fresh lines on the grass{venueLine}. Cars already nosing into the carpark two hours early. Whatever's sorted is sorted; whatever isn't is about to introduce itself. Tom finds you by the gate and hands you a coffee: \"Big day, boss.\"",
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
  complication: { venueSorted: 'comp-storm', venueNot: 'comp-venue' },
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
