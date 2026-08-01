/**
 * Journey scenarios — the school-platform path. Gentle, real-life,
 * passion-led branching stories for younger students (Years 8–11).
 *
 * Per the School Platform build plan:
 *  - the student NEVER sees a test — they pick a passion and live a story
 *  - decision → consequence → gently harder
 *  - the same FUSE 10-capability scoring runs invisibly underneath
 *  - language is student-facing: mates, coaches, mornings — never KPIs
 *
 * Three flagship journeys seeded (surf · footy carnival · farm), matching
 * the plan's examples. Same Scenario shape as the work scenarios so the
 * existing play engine runs them unchanged.
 */

import type { Scenario } from '@/lib/play/types'

export const SURF_JOURNEY: Scenario = {
  id: 'journey-surf',
  role: 'Dawn patrol — Saturday at the point',
  meta: 'SATURDAY · FIRST LIGHT · THE POINT',
  goal: { label: 'A GOOD MORNING', target: 70 },
  opening: {
    eyebrow: 'Your story',
    title: 'The surf is pumping. Your crew is half-asleep. The day is yours to shape.',
    body: "It's 5:40am, {name}. Best swell in a month. Your mate Jonah promised he'd come but isn't answering. A grom you sort of know is waxing up alone near the rocks — that section's no joke on a day like this.",
    imageCaption: 'The point · first light',
    ambient: [
      { label: 'SWELL', value: '4ft, clean' },
      { label: 'CREW', value: 'you + maybe Jonah' },
      { label: 'TIDE', value: 'pushing in' },
    ],
  },
  steps: [
    {
      kind: 'decision',
      mood: 'private',
      transition: 'cross-fade',
      eyebrow: 'The carpark',
      scene: 'beach',
      sceneCaption: 'Boards on the sand, phone in hand',
      prompt: "Jonah's still not answering. The waves won't wait — but you did promise to surf together.",
      keyAsk: 'Wait for your mate, or go?',
      factors: [
        { label: 'The sets', value: 'rolling in clean', kind: 'meter' },
        { label: 'Jonah', value: 'no reply · 3 texts', kind: 'metric' },
        { label: 'That grom', value: 'paddling out alone', kind: 'quote' },
      ],
      options: [
        {
          id: 'a', label: 'Give him 15 — text the plan, stretch, watch the sets.', skill: 'Judgement & Decision-Making', score: 12,
          echo: 'You waited. He rolled in at 5:55, grinning, holding two banana breads.', consequence: 'He shows at 5:55 with banana bread. Best session of the summer starts together.',
          ghost: 'The first sets went unridden.', stats: [{ label: 'JONAH', change: 'showed up' }, { label: 'THE MORNING', change: 'shared' }],
          insight: 'You held a promise without wasting the wait — you used the time to read the ocean. Keeping your word AND keeping your eyes open is a real skill.',
        },
        {
          id: 'b', label: 'Paddle out now — he knows where to find you.', skill: 'Execution & Ownership', score: 8,
          echo: 'You got the first set wave of the day. Jonah paddled out later, a bit quiet.', consequence: 'Great waves. Slightly weird vibe when Jonah arrives.',
          ghost: 'The promise stretched a little.', stats: [{ label: 'WAVES', change: 'plenty' }, { label: 'JONAH', change: 'a bit quiet' }],
          insight: 'You backed yourself and owned the morning — worth noticing that small promises carry weight even when nobody says so.',
        },
        {
          id: 'c', label: 'Paddle over near the grom first — keep half an eye on them.', skill: 'Situational Awareness & Systems Thinking', score: 12,
          echo: 'You paddled wide, near the rocks. The grom noticed. Sat a little taller.', consequence: "You're in the water AND watching the rocks. The grom relaxes with company nearby.",
          ghost: 'The best peak is further down.', stats: [{ label: 'THE GROM', change: 'safer' }, { label: 'YOUR WAVES', change: 'fewer, fine' }],
          insight: 'You read the whole beach, not just your own session. Seeing the second-order stuff — who else is out, what could go wrong — is rare at any age.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'cross-fade',
      eyebrow: 'Mid-session',
      scene: 'lineup',
      sceneCaption: 'Out the back, sets building',
      prompt: 'The grom takes a wave too big, goes over the falls, and comes up slow near the rocks. Everyone else is paddling for the next set.',
      keyAsk: 'The next wave is yours. The grom might not be okay.',
      factors: [
        { label: 'Set of the day', value: 'lining up for YOU', kind: 'meter' },
        { label: 'The grom', value: 'up, but slow, drifting', kind: 'quote' },
        { label: 'Rocks', value: '20 metres and closing', kind: 'metric' },
      ],
      options: [
        {
          id: 'a', label: 'Let the wave go. Paddle straight to them.', skill: 'Integrity & Ethics', score: 15,
          echo: 'You reached them first. "I\'m right," they said — but grabbed your rail anyway.', consequence: 'You tow them wide of the rocks. They\'re shaken, okay, and won\'t forget it.',
          ghost: 'The wave of the day rolled through, unridden.', stats: [{ label: 'THE GROM', change: 'safe' }, { label: 'THE WAVE', change: 'gone, worth it' }],
          insight: 'Nobody was watching. You gave up the thing you came for because someone might have needed you — that choice, made when it costs something, is character.',
        },
        {
          id: 'b', label: 'Shout to the older guy nearby and point — then take your wave.', skill: 'Collaboration', score: 9,
          echo: 'He got there fast. You got the wave. Both things happened.', consequence: 'The older surfer helps them in. You surfed the wave with one eye over your shoulder.',
          ghost: 'If he hadn\'t heard you…', stats: [{ label: 'THE GROM', change: 'helped' }, { label: 'YOU', change: 'torn, honest' }],
          insight: 'You delegated fast to the closest capable person — that\'s real teamwork instinct. Worth sitting with: would the shout have been enough on its own?',
        },
        {
          id: 'c', label: 'Watch for three seconds before deciding.', skill: 'Reasoning & Critical Thinking', score: 10,
          echo: 'Three seconds told you: they\'re moving, but the current isn\'t their friend.', consequence: 'You read it right — drifting, not swimming. You paddle over calm instead of panicked.',
          ghost: 'Three seconds is a long time near rocks.', stats: [{ label: 'YOUR READ', change: 'accurate' }, { label: 'RESPONSE', change: 'calm' }],
          insight: 'You bought information before acting — a genuinely advanced move. The trade is speed; knowing when you can afford to look and when you can\'t is the whole game.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'reflective',
      transition: 'cross-fade',
      eyebrow: 'After',
      scene: 'beach',
      sceneCaption: 'Boards on the grass, sun properly up',
      prompt: "The grom's mum arrives, worried and grateful. She asks what happened out there — and the grom is standing right next to her, embarrassed.",
      keyAsk: 'Tell it how?',
      factors: [
        { label: 'The mum', value: 'wants the full story', kind: 'quote' },
        { label: 'The grom', value: 'staring at the sand', kind: 'quote' },
        { label: 'The truth', value: 'it was genuinely close', kind: 'metric' },
      ],
      options: [
        {
          id: 'a', label: '"Big wave, handled it, we all kept an eye out." Keep it light, keep it true.', skill: 'Emotional Intelligence', score: 13,
          echo: 'The mum exhaled. The grom shot you a look that said thanks, twice.', consequence: 'True enough to be honest, light enough to leave the grom their dignity.',
          ghost: 'The full drama stayed in the water.', stats: [{ label: 'THE MUM', change: 'reassured' }, { label: 'THE GROM', change: 'dignity intact' }],
          insight: 'You told the truth at the kindest possible altitude. Reading what each listener needed from the same sentence — that\'s emotional intelligence, full stop.',
        },
        {
          id: 'b', label: 'Tell it exactly as it happened, including how close it got.', skill: 'Integrity & Ethics', score: 10,
          echo: 'The mum went pale, then hugged the grom hard. Rules will follow.', consequence: 'Full truth. The grom cops a month of "not without a mate" — probably fairly.',
          ghost: 'The grom\'s look was hard to read.', stats: [{ label: 'THE TRUTH', change: 'complete' }, { label: 'NEXT SATURDAY', change: 'supervised' }],
          insight: 'You chose accuracy over comfort. Sometimes the complete truth costs someone something — noticing that trade, and choosing it deliberately, matters.',
        },
        {
          id: 'c', label: 'Let the grom tell it. Add nothing unless asked.', skill: 'Leadership & Influence', score: 11,
          echo: 'They told it pretty straight, actually. Grew an inch doing it.', consequence: 'The grom owns their story. You just stand there like it\'s normal.',
          ghost: 'You could have starred in this one.', stats: [{ label: 'THE GROM', change: 'owned it' }, { label: 'YOU', change: 'made space' }],
          insight: 'You handed someone their own moment instead of taking it. Leadership that makes other people bigger is the kind people follow for life.',
        },
      ],
    },
  ],
  outcome: {
    eyebrow: 'The morning, shaped',
    title: 'One session. A dozen quiet choices. All of them yours.',
    body: 'Nothing about today was a test, {name} — it was just Saturday. But the way you read the water, the people, and the moment? That was all skill. Let\'s show you what you just demonstrated.',
  },
  reflect: { asker: 'Jonah, on the drive home', prompt: 'Honestly — would you have waited for me?' },
}

export const FOOTY_JOURNEY: Scenario = {
  id: 'journey-footy',
  role: 'Round-robin day — school footy carnival',
  meta: 'CARNIVAL DAY · 4 GAMES · YOUR TEAM',
  goal: { label: 'A TEAM STILL STANDING', target: 70 },
  opening: {
    eyebrow: 'Your story',
    title: "Four games, one day, and your best player just rolled her ankle warming up.",
    body: "Carnival day, {name}. Your team's buzzing, the draw is brutal, and Tess — your captain and best runner — is icing her ankle before game one has even started. Coach is stuck marking rolls. People are looking at you.",
    imageCaption: 'Oval 3 · 8:50am · game one at 9:00',
    ambient: [
      { label: 'GAMES TODAY', value: '4' },
      { label: 'TESS', value: 'ankle · icing' },
      { label: 'THE DRAW', value: 'toughest team first' },
    ],
  },
  steps: [
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'cross-fade',
      eyebrow: 'Game one · 10 min to start',
      scene: 'oval',
      sceneCaption: 'Team huddle, one captain on the bench',
      prompt: 'Tess says she can play through it. You\'ve seen her limp. The first game is against the team you can\'t beat without her — or can you?',
      keyAsk: 'Play your injured captain, or back the bench?',
      factors: [
        { label: 'Tess', value: '"I\'m fine. Honestly."', kind: 'quote' },
        { label: 'Her ankle', value: 'visibly not fine', kind: 'meter' },
        { label: 'The bench', value: 'two nervous year 8s', kind: 'metric' },
      ],
      options: [
        {
          id: 'a', label: 'Rest her for game one. Tell her the plan is the whole day, not one game.', skill: 'Judgement & Decision-Making', score: 14,
          echo: 'She argued, then nodded. The year 8s played out of their skins.', consequence: 'You lose game one narrowly — and still have a captain for games two, three and four.',
          ghost: 'The scoreboard stung for an hour.', stats: [{ label: 'GAME ONE', change: 'lost, close' }, { label: 'THE DAY', change: 'still alive' }],
          insight: 'You traded a battle for the war and told Tess the truth about why. Long-horizon thinking under a scoreboard is properly hard.',
        },
        {
          id: 'b', label: 'Start her, strict minutes — off at the first sign of trouble.', skill: 'Execution & Ownership', score: 9,
          echo: 'Twelve good minutes, then you called it yourself. She was filthy. You were right.', consequence: 'You win game one. Tess\'s ankle survives — because you pulled her before she\'d agree.',
          ghost: 'One awkward landing and the day was different.', stats: [{ label: 'GAME ONE', change: 'won' }, { label: 'THE CALL', change: 'yours, on time' }],
          insight: 'You set a limit before emotions could argue, and enforced it against your own captain. Pre-committing is what makes hard calls possible.',
        },
        {
          id: 'c', label: 'Ask Tess to captain from the sideline — her voice, the bench\'s legs.', skill: 'Leadership & Influence', score: 12,
          echo: 'She coached like a demon. The year 8s grew up in forty minutes.', consequence: 'You unlock a version of Tess nobody\'s seen. The team finds depth it didn\'t know it had.',
          ghost: 'Her runs were missed. Her voice wasn\'t.', stats: [{ label: 'TESS', change: 'new role, all in' }, { label: 'BENCH', change: 'believed in' }],
          insight: 'You redefined what your best player could give instead of asking her body for what it didn\'t have. Re-deploying talent is elite thinking.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'loud',
      transition: 'cross-fade',
      eyebrow: 'Game three · scores level',
      scene: 'oval',
      sceneCaption: 'Last two minutes, everyone\'s cooked',
      prompt: 'The umpire misses a blatant knock-on — in YOUR favour. Play rolls on. The other team\'s captain is spewing. Your team is looking at you mid-play.',
      keyAsk: 'Say something, or play on?',
      factors: [
        { label: 'The scoreboard', value: 'level · 2 min left', kind: 'meter' },
        { label: 'Their captain', value: '"that\'s not on!"', kind: 'quote' },
        { label: 'The umpire', value: 'didn\'t see it', kind: 'metric' },
      ],
      options: [
        {
          id: 'a', label: 'Tell the umpire. Give the ball back.', skill: 'Integrity & Ethics', score: 15,
          echo: 'The oval went quiet for a second. Their captain just nodded at you.', consequence: 'You hand back the advantage. Both teams play the last two minutes properly.',
          ghost: 'You might lose because of this.', stats: [{ label: 'THE GAME', change: 'clean' }, { label: 'RESPECT', change: 'both sides' }],
          insight: 'You corrected a call that favoured YOU, at the worst possible time to be honest. That\'s the whole definition of integrity — and everyone on that oval felt it.',
        },
        {
          id: 'b', label: 'Play on — umpire\'s call, not yours.', skill: 'Execution & Ownership', score: 6,
          echo: 'You scored off the possession. It counted. It sat a bit heavy.', consequence: 'You win the moment. The other captain remembers.',
          ghost: 'Technically fine. Technically.', stats: [{ label: 'SCOREBOARD', change: 'yours' }, { label: 'AFTERTASTE', change: 'noticeable' }],
          insight: 'Playing to the whistle is a legitimate rule of sport — worth noticing how "allowed" and "proud of it" aren\'t always the same thing.',
        },
        {
          id: 'c', label: 'Quietly kick it out on the next play — square it without a speech.', skill: 'Emotional Intelligence', score: 11,
          echo: 'No announcement. Their captain clocked it anyway. The vibe reset.', consequence: 'You even the ledger without a scene. The game\'s temperature drops two degrees.',
          ghost: 'Almost nobody knows what that kick was.', stats: [{ label: 'THE LEDGER', change: 'squared' }, { label: 'DRAMA', change: 'none' }],
          insight: 'You fixed a fairness problem without making yourself the hero of it. Quiet repair is a sophisticated social skill most adults haven\'t learned.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'reflective',
      transition: 'cross-fade',
      eyebrow: 'Before the final',
      scene: 'oval',
      sceneCaption: 'The team, flat on the grass, one game left',
      prompt: 'Everyone\'s exhausted. The final is against the team that beat you this morning. Little Priya, who hasn\'t scored all day, asks if she can start.',
      keyAsk: 'Your last team-talk and one starting spot.',
      factors: [
        { label: 'The team', value: 'running on lollies', kind: 'meter' },
        { label: 'Priya', value: '"can I start? please?"', kind: 'quote' },
        { label: 'The final', value: 'the morning\'s ghosts', kind: 'metric' },
      ],
      options: [
        {
          id: 'a', label: 'Start Priya. Build the talk around having a crack.', skill: 'Leadership & Influence', score: 13,
          echo: 'Priya scored in the first five minutes. The team lost its mind.', consequence: 'Win or lose, the final belongs to everyone now.',
          ghost: 'The "safest" line-up stayed in your pocket.', stats: [{ label: 'PRIYA', change: 'flying' }, { label: 'THE TEAM', change: 'lifted' }],
          insight: 'You spent your last game on belief instead of certainty. Teams remember who gave them their first moment — you just became that person for Priya.',
        },
        {
          id: 'b', label: 'Strongest team starts — Priya gets a promise of big minutes.', skill: 'Judgement & Decision-Making', score: 9,
          echo: 'You kept the promise. She came on and nearly scored.', consequence: 'The pragmatic call, softened by a promise you actually kept.',
          ghost: 'Nearly.', stats: [{ label: 'START', change: 'strongest four' }, { label: 'PROMISE', change: 'kept' }],
          insight: 'You balanced winning and fairness with a promise — and keeping it is what separated this from a fob-off. Kept promises compound.',
        },
        {
          id: 'c', label: 'Ask the team who should start. Mean it.', skill: 'Collaboration', score: 11,
          echo: 'They picked Priya themselves. Louder than you ever could have.', consequence: 'The decision belongs to all of them — so does the final.',
          ghost: 'You gave away the captain\'s call.', stats: [{ label: 'DECISION', change: 'shared' }, { label: 'BUY-IN', change: 'total' }],
          insight: 'You turned selection into ownership. Handing a real decision to the group — not a fake vote — is trust you can\'t counterfeit.',
        },
      ],
    },
  ],
  outcome: {
    eyebrow: 'Full time',
    title: 'Four games. One rolled ankle. A team that would run through walls.',
    body: 'That wasn\'t a test either, {name} — just carnival day. But captaincy, fairness under a scoreboard, and who you give moments to? All of it showed. Here\'s what we saw.',
  },
  reflect: { asker: 'Tess, ice pack off', prompt: 'Game one. Would you make the same call again?' },
}

export const FARM_JOURNEY: Scenario = {
  id: 'journey-farm',
  role: 'Harvest week — your uncle\'s farm',
  meta: 'JANUARY · HARVEST · 38°C BY LUNCH',
  goal: { label: 'A WEEK WELL RUN', target: 70 },
  opening: {
    eyebrow: 'Your story',
    title: 'A storm is forecast for Thursday. The wheat comes off this week or not at all.',
    body: 'First real harvest week, {name}. Your uncle\'s short-handed and treating you like a grown-up: real jobs, real machinery, real consequences. Then the forecast changes — storms Thursday. Everything just got tighter.',
    imageCaption: 'The east paddock · 6am · header fuelled',
    ambient: [
      { label: 'FORECAST', value: 'storms Thu' },
      { label: 'PADDOCKS LEFT', value: '3' },
      { label: 'CREW', value: 'you, uncle, Davo' },
    ],
  },
  steps: [
    {
      kind: 'decision',
      mood: 'private',
      transition: 'cross-fade',
      eyebrow: 'Tuesday · smoko',
      scene: 'paddock',
      sceneCaption: 'Header ticking over, thermos out',
      prompt: 'Davo — the old hand — reckons the header\'s making "a new noise". Your uncle wants to push on: every hour counts now. You\'re the one who\'s been driving it.',
      keyAsk: 'Push on, or stop and check?',
      factors: [
        { label: 'The noise', value: 'faint · intermittent', kind: 'quote' },
        { label: 'The forecast', value: 'Thursday, closing in', kind: 'meter' },
        { label: 'Davo', value: '"forty years, mate. Check it."', kind: 'quote' },
      ],
      options: [
        {
          id: 'a', label: 'Stop for 20 minutes. Check it with Davo, properly.', skill: 'Reasoning & Critical Thinking', score: 13,
          echo: 'A bearing, starting to go. Twenty minutes now instead of a day on Thursday.', consequence: 'Davo finds a failing bearing. Fixed by lunch. The header runs sweet all week.',
          ghost: 'Twenty minutes you didn\'t technically have.', stats: [{ label: 'THE HEADER', change: 'saved' }, { label: 'THURSDAY', change: 'still possible' }],
          insight: 'You weighed a small certain cost against a large possible one — and trusted the person with forty years of pattern-matching. That\'s evidence-based thinking with humility attached.',
        },
        {
          id: 'b', label: 'Push on, but log the noise and drive gentler.', skill: 'Execution & Ownership', score: 8,
          echo: 'It held. Barely. Davo\'s eyebrow said everything at knock-off.', consequence: 'You make the hours. The bearing waits until Friday to fail — luck you didn\'t earn.',
          ghost: 'Two more days of that noise…', stats: [{ label: 'HOURS', change: 'made' }, { label: 'LUCK', change: 'spent' }],
          insight: 'You kept the machine moving and adapted how you drove — real ownership. Worth noticing when a plan works because of luck rather than judgement.',
        },
        {
          id: 'c', label: 'Ring your uncle — his machine, his call. Give him the facts straight.', skill: 'Collaboration', score: 10,
          echo: '"Check it," he said, after one second. "And thanks for ringing."', consequence: 'He makes the same call Davo would — and knows you\'ll surface problems early.',
          ghost: 'You could have decided yourself.', stats: [{ label: 'TRUST', change: 'banked' }, { label: 'THE CALL', change: 'right, shared' }],
          insight: 'You escalated with facts, not drama, to the person who owns the risk. Knowing which decisions are yours to make is its own kind of judgement.',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'tense',
      transition: 'cross-fade',
      eyebrow: 'Wednesday · 38 degrees',
      scene: 'paddock',
      sceneCaption: 'Heat shimmer over the last big paddock',
      prompt: 'Your uncle wants to skip lunch and run through the heat of the day. Davo\'s slowing down — he\'s 63 and won\'t say a word before he drops.',
      keyAsk: 'The wheat, or the crew?',
      factors: [
        { label: 'Temperature', value: '38° and climbing', kind: 'meter' },
        { label: 'Davo', value: 'quiet · red-faced', kind: 'quote' },
        { label: 'Paddock left', value: '60 hectares', kind: 'metric' },
      ],
      options: [
        {
          id: 'a', label: 'Call it: 40 minutes in the shed, everyone, water and food. Storm or no storm.', skill: 'Judgement & Decision-Making', score: 14,
          echo: 'Your uncle blinked, then nodded. Davo ate three sandwiches in silence.', consequence: 'The break costs 40 minutes. The afternoon runs faster with everyone actually functional.',
          ghost: 'The radar didn\'t care about lunch.', stats: [{ label: 'DAVO', change: 'okay' }, { label: 'AFTERNOON PACE', change: 'up' }],
          insight: 'You made a safety call upward, against the clock and against the boss. People-first under pressure is the difference between running work and just doing it.',
        },
        {
          id: 'b', label: 'Quietly swap Davo onto the ute runs — the air-conditioned job.', skill: 'Emotional Intelligence', score: 13,
          echo: 'Davo grumbled about it for exactly one minute. Then took the keys.', consequence: 'He gets the cool cab without a fuss being made of him. The work doesn\'t stop.',
          ghost: 'The chaser bin is heavier work for you now.', stats: [{ label: 'DAVO', change: 'looked after, dignity intact' }, { label: 'HARVEST', change: 'rolling' }],
          insight: 'You solved a pride problem and a heat problem with one quiet swap. Protecting someone in a way they can accept — that\'s advanced people-reading.',
        },
        {
          id: 'c', label: 'Match your uncle\'s pace — the storm sets the schedule, not us.', skill: 'Execution & Ownership', score: 7,
          echo: 'You got through more than seemed possible. Everyone was wrecked by four.', consequence: 'Huge afternoon. Davo goes home early "to beat the traffic" — there is no traffic.',
          ghost: 'Somebody nearly went down out there.', stats: [{ label: 'HECTARES', change: 'flying' }, { label: 'THE CREW', change: 'running on empty' }],
          insight: 'You matched the intensity the moment demanded — genuine grit. The question a good operator asks afterwards: what was the actual cost, and who paid it?',
        },
      ],
    },
    {
      kind: 'decision',
      mood: 'reflective',
      transition: 'cross-fade',
      eyebrow: 'Thursday · the sky turning',
      scene: 'paddock',
      sceneCaption: 'Last 20 hectares, first fat drops of rain',
      prompt: 'The storm arrives early. You can finish the last corner in the rain — risky for the machine, rough on the grain — or leave 20 hectares standing and call the week.',
      keyAsk: 'Finish ugly, or stop smart?',
      factors: [
        { label: 'The sky', value: 'green-black, close', kind: 'meter' },
        { label: 'Last corner', value: '20 ha · 90 minutes', kind: 'metric' },
        { label: 'Your uncle', value: '"your call, mate."', kind: 'quote' },
      ],
      options: [
        {
          id: 'a', label: 'Stop. Sheet the loads, shed the machines, beat the front home.', skill: 'Judgement & Decision-Making', score: 13,
          echo: 'The front hit twenty minutes after the shed doors shut. Biblical.', consequence: 'You lose 20 hectares and keep everything else — grain, machines, people, all dry.',
          ghost: 'Ninety more minutes and you\'d have had it all. Maybe.', stats: [{ label: 'THE WEEK', change: 'banked' }, { label: 'THE CORNER', change: 'surrendered' }],
          insight: 'Your uncle handed you the call and you chose the certain 95% over the risky 100%. Knowing when a win is already on the table is real commercial judgement.',
        },
        {
          id: 'b', label: 'Go for it — 90 flat-out minutes, everyone briefed on when we pull the pin.', skill: 'Execution & Ownership', score: 10,
          echo: 'You called the pin at 15 hectares as the rain got serious. Nobody argued.', consequence: 'You claw back most of the corner AND stop before it gets silly — because you set the stop-line first.',
          ghost: 'The last five hectares are flat in the mud.', stats: [{ label: 'RECOVERED', change: '15 of 20 ha' }, { label: 'THE PIN', change: 'pulled on time' }],
          insight: 'You went for it WITH a pre-agreed exit — ambition and discipline in the same decision. That combination is rarer than either alone.',
        },
        {
          id: 'c', label: 'Split the difference — one machine finishes, everything else sheds now.', skill: 'Situational Awareness & Systems Thinking', score: 12,
          echo: 'Half the gear was dry before the rain. The header worked the corner till the last safe minute.', consequence: 'You sequence the retreat: maximum grain, minimum exposure, nothing caught out.',
          ghost: 'Coordinating it in a rising wind was… a lot.', stats: [{ label: 'EXPOSURE', change: 'minimised' }, { label: 'GRAIN', change: 'most of it' }],
          insight: 'You saw the week as a system — machines, grain, sky, people — and sequenced it instead of choosing all-or-nothing. Systems thinking, in gumboots.',
        },
      ],
    },
  ],
  outcome: {
    eyebrow: 'The rain on the shed roof',
    title: 'A real week, with real weight on it. You carried it.',
    body: 'No exam room looks like a paddock, {name} — but everything this week asked of you is what the best jobs ask, forever. Machinery calls, people calls, weather calls. Here\'s what you showed.',
  },
  reflect: { asker: 'Your uncle, over the rain', prompt: 'That last corner. Talk me through why.' },
}


export const BAND_JOURNEY: Scenario = {
  id: 'journey-band',
  role: 'Battle of the Bands — three weeks out',
  meta: 'SCHOOL HALL · THREE WEEKS TO SHOW NIGHT',
  goal: { label: 'A BAND STILL TOGETHER', target: 70 },
  opening: {
    eyebrow: 'Your story',
    title: 'Your band got the last slot at Battle of the Bands. Your drummer just quit.',
    body: "Three weeks out, {name}. The song isn't finished, the drummer's gone over a group-chat argument, and Mia — who's never performed but practises constantly — just asked if she can try out.",
    imageCaption: 'The music room · lunchtime',
    ambient: [
      { label: 'SHOW', value: '3 weeks' },
      { label: 'DRUMMER', value: 'quit last night' },
      { label: 'THE SONG', value: '70% written' },
    ],
  },
  steps: [
    {
      kind: 'decision', mood: 'private', transition: 'cross-fade', eyebrow: 'Lunchtime · music room', scene: 'musicroom', sceneCaption: 'One empty drum stool',
      prompt: "Mia can barely look at you while she asks. Jake — your old drummer — is telling people he'd come back if you apologised. You didn't start the argument.",
      keyAsk: 'The stool needs someone.',
      factors: [
        { label: 'Mia', value: 'nervous, prepared', kind: 'quote' },
        { label: 'Jake', value: '"if he apologises…"', kind: 'quote' },
        { label: 'Rehearsals left', value: '8', kind: 'metric' },
      ],
      options: [
        { id: 'a', label: 'Give Mia a real audition — today, full song.', skill: 'Judgement & Decision-Making', score: 13,
          echo: 'She was shaky for one verse. Then she wasn\'t.', consequence: 'Mia nails it by the second chorus. The band has a drummer — a hungrier one.',
          ghost: 'Jake heard about it within the hour.', stats: [{ label: 'MIA', change: 'in' }, { label: 'THE SOUND', change: 'different, alive' }],
          insight: 'You judged the person in front of you on evidence, not the one in your history on comfort. Auditions over assumptions — that\'s selection done right.' },
        { id: 'b', label: 'Swallow it. Apologise to Jake, get the band back.', skill: 'Emotional Intelligence', score: 10,
          echo: 'The apology cost you something. The band noticed you paid it.', consequence: 'Jake\'s back behind the kit by Thursday. Something\'s still unsaid.',
          ghost: 'Mia didn\'t ask twice.', stats: [{ label: 'JAKE', change: 'back' }, { label: 'PRIDE', change: 'spent on the band' }],
          insight: 'You paid with pride to protect the group. Worth noticing: repairs that skip the honest conversation tend to bill you again later.' },
        { id: 'c', label: 'Both — Mia auditions, and you talk to Jake straight.', skill: 'Leadership & Influence', score: 12,
          echo: 'Two hard conversations in one lunchtime. Both needed.', consequence: 'Mia gets her shot; Jake gets honesty instead of an apology. Whoever earns it plays.',
          ghost: 'Managing both took everything you had.', stats: [{ label: 'FAIRNESS', change: 'visible' }, { label: 'YOU', change: 'stretched, upright' }],
          insight: 'You refused a false either/or and ran a fair process in public view. That\'s leadership — the band watched how you did it more than what you decided.' },
      ],
    },
    {
      kind: 'decision', mood: 'tense', transition: 'cross-fade', eyebrow: 'One week out', scene: 'garage', sceneCaption: 'The bridge still isn\'t right',
      prompt: 'Your best song has a broken bridge nobody can fix. Sam wrote a new song — honestly, it\'s better — but learning it from scratch in a week is a risk.',
      keyAsk: 'Polish the old, or back the new?',
      factors: [
        { label: 'Old song', value: 'safe, 90% there', kind: 'meter' },
        { label: 'Sam\'s song', value: 'better, unlearned', kind: 'quote' },
        { label: 'Rehearsals left', value: '3', kind: 'metric' },
      ],
      options: [
        { id: 'a', label: 'Back Sam\'s song. Three rehearsals, all in.', skill: 'Adaptability & Cognitive Flexibility', score: 13,
          echo: 'Rehearsal one was chaos. Rehearsal three was the best you\'ve ever sounded.', consequence: 'The band bets on better. It\'s terrifying and then it isn\'t.',
          ghost: 'The old song sat there, finished-ish, watching.', stats: [{ label: 'THE SET', change: 'upgraded' }, { label: 'NERVES', change: 'earned' }],
          insight: 'You dropped sunk cost the moment better evidence arrived. Most adults can\'t do that with three weeks of work. You did it with a week to go.' },
        { id: 'b', label: 'Fix the bridge — simplify it until it works.', skill: 'Problem Solving', score: 11,
          echo: 'You cut the bridge to four bars. Suddenly the song breathes.', consequence: 'Subtraction fixes what addition couldn\'t. The old song finally lands.',
          ghost: 'Sam shelved the better song quietly.', stats: [{ label: 'THE BRIDGE', change: 'four honest bars' }, { label: 'RISK', change: 'contained' }],
          insight: 'You solved by removing, not adding — genuinely rare instinct. The cost lives in Sam\'s notebook; good leaders go back for those later.' },
        { id: 'c', label: 'Put it to the band. Majority rules, no grudges.', skill: 'Collaboration', score: 10,
          echo: 'Three to one for Sam\'s song. The one was you. You went all in anyway.', consequence: 'The band chooses, together. You back the choice louder than anyone.',
          ghost: 'Your vote lost. Your effort didn\'t show it.', stats: [{ label: 'DECISION', change: 'shared' }, { label: 'YOUR BACKING', change: 'total' }],
          insight: 'Losing the vote and then out-working everyone for the winning option — that\'s what "disagree and commit" actually looks like.' },
      ],
    },
    {
      kind: 'decision', mood: 'loud', transition: 'cross-fade', eyebrow: 'Show night · side of stage', scene: 'stage', sceneCaption: 'Two minutes to your slot',
      prompt: "Mia's frozen. Actually frozen — sticks in hand, staring through the curtain at 400 people. The stage manager is counting you down.",
      keyAsk: 'Ninety seconds.',
      factors: [
        { label: 'Mia', value: 'white-knuckled', kind: 'quote' },
        { label: 'The crowd', value: '~400', kind: 'metric' },
        { label: 'Countdown', value: '90 seconds', kind: 'meter' },
      ],
      options: [
        { id: 'a', label: 'Get in front of her. Eyes only. "First eight bars. Just us in the garage."', skill: 'Emotional Intelligence', score: 14,
          echo: 'She locked onto you. Counted in the first eight. The crowd disappeared for her.', consequence: 'You shrink the stadium to a garage. She plays the best set of anyone\'s life.',
          ghost: 'Ninety seconds is exactly enough for the right sentence.', stats: [{ label: 'MIA', change: 'unfrozen' }, { label: 'THE SET', change: 'hers now' }],
          insight: 'You found the sentence that made the fear small — not "you\'ll be fine" but a picture she could stand inside. That\'s empathy with craft.' },
        { id: 'b', label: 'Open with the acoustic number — buy her two songs to land.', skill: 'Adaptability & Cognitive Flexibility', score: 12,
          echo: 'You reordered the set at the curtain. Nobody in the crowd ever knew.', consequence: 'The plan bends around the person. By song three she\'s driving it.',
          ghost: 'The big opener became the closer. Better, maybe.', stats: [{ label: 'SET LIST', change: 'rewritten live' }, { label: 'MIA', change: 'landed softly' }],
          insight: 'You changed the plan instead of demanding the person change — invisible accommodation, executed in seconds. The crowd never saw the seam.' },
        { id: 'c', label: 'Straight with her: "You earned this stool. Play like the audition."', skill: 'Leadership & Influence', score: 10,
          echo: 'She breathed out. Nodded once. Walked out first.', consequence: 'You hand her back her own evidence. She walks on before you do.',
          ghost: 'Belief, transferred at the curtain.', stats: [{ label: 'MIA', change: 'walked out first' }, { label: 'THE MOMENT', change: 'hers' }],
          insight: 'You reminded her of proof, not hope — "the audition happened, you were there." Evidence beats reassurance under pressure.' },
      ],
    },
  ],
  outcome: {
    eyebrow: 'After the last chord',
    title: 'Three weeks. One quit, one frozen, one better song. You held it together.',
    body: 'Nobody graded any of that, {name} — but forming a team, betting on better, and unfreezing a friend at the curtain? Every band, startup and crew on earth runs on those. Here\'s what you showed.',
  },
  reflect: { asker: 'Sam, packing cables', prompt: 'Would you have played my song if the vote went the other way?' },
}

export const MARKET_JOURNEY: Scenario = {
  id: 'journey-market',
  role: 'Market stall day — your first real customers',
  meta: 'SUNDAY MARKET · 6AM SETUP · SOLD OUT OR BUST',
  goal: { label: 'A STALL WORTH REMEMBERING', target: 70 },
  opening: {
    eyebrow: 'Your story',
    title: 'Forty candles, one trestle table, and the market opens in an hour.',
    body: "Six months of making, {name}, and today strangers decide if it was worth it. Your mate Elle is helping. The stall next door sells candles too — half your price, and the woman running it has been doing this for years.",
    imageCaption: 'Bay 14 · fog lifting',
    ambient: [
      { label: 'STOCK', value: '40 candles' },
      { label: 'NEXT DOOR', value: 'same product, half price' },
      { label: 'GATE', value: 'opens 8am' },
    ],
  },
  steps: [
    {
      kind: 'decision', mood: 'private', transition: 'cross-fade', eyebrow: '7:20am · setup', scene: 'market', sceneCaption: 'Her sign says $8. Yours says $16.',
      prompt: "Elle's panicking about the price difference and wants to drop yours to $10 before the gate opens. Your candles cost $6 each to make.",
      keyAsk: 'Hold your price, or race to the bottom?',
      factors: [
        { label: 'Next door', value: '$8 · factory-made', kind: 'metric' },
        { label: 'Yours', value: '$16 · hand-poured', kind: 'metric' },
        { label: 'Elle', value: '"nobody pays double!"', kind: 'quote' },
      ],
      options: [
        { id: 'a', label: 'Hold $16 — and rewrite the sign: "Hand-poured. Small batch. Six months of Sundays."', skill: 'Reasoning & Critical Thinking', score: 13,
          echo: 'The first customer read the sign, smiled, and paid full price.', consequence: 'You sell the story, not the wax. Different product, different price — the sign does the arguing.',
          ghost: 'Two people walked to the $8 stall. They were never yours.', stats: [{ label: 'PRICE', change: 'held' }, { label: 'STORY', change: 'on the sign' }],
          insight: 'You worked out you weren\'t actually in competition — different product, different buyer. Positioning over panic is real commercial reasoning.' },
        { id: 'b', label: 'Meet in the middle at $12 and move stock fast.', skill: 'Judgement & Decision-Making', score: 9,
          echo: 'Brisk morning. The maths said you left money on the table. The empty table said otherwise.', consequence: 'Volume over margin — a defensible call, deliberately made.',
          ghost: '$4 a candle, forty times…', stats: [{ label: 'PACE', change: 'brisk' }, { label: 'MARGIN', change: 'thinner, chosen' }],
          insight: 'You picked certainty over optimisation and knew what it cost. A chosen trade-off beats an accidental one every time.' },
        { id: 'c', label: 'Walk over and introduce yourself to the neighbour first.', skill: 'Collaboration', score: 12,
          echo: '"Hand-poured? Love. Send anyone who wants fancy to me, I\'ll send you the gift-buyers."', consequence: 'The "competitor" becomes a referral partner in ninety seconds. Different customers, it turns out.',
          ghost: 'Elle watched the whole thing, recalibrating.', stats: [{ label: 'NEXT DOOR', change: 'ally' }, { label: 'GIFT-BUYERS', change: 'incoming' }],
          insight: 'You tested the assumption that proximity means rivalry — it usually doesn\'t. Turning competitors into a network is a career-long superpower.' },
      ],
    },
    {
      kind: 'decision', mood: 'tense', transition: 'cross-fade', eyebrow: '11am · the rush', scene: 'market', sceneCaption: 'Queue four deep, Elle flat out',
      prompt: 'A customer returns a candle from your first-ever batch — "it tunnels, barely burns." She\'s polite. The queue behind her is listening. It probably IS a first-batch fault.',
      keyAsk: 'The queue is watching what you do next.',
      factors: [
        { label: 'The queue', value: 'four deep, ears on', kind: 'meter' },
        { label: 'The candle', value: 'first batch — you knew', kind: 'quote' },
        { label: 'Refund', value: '$16 you\'ve already spent', kind: 'metric' },
      ],
      options: [
        { id: 'a', label: 'Full refund + a new candle from today\'s batch, no quibble.', skill: 'Integrity & Ethics', score: 14,
          echo: 'Two people in the queue bought extra "because of how you handled that."', consequence: 'The refund costs $16. The queue watching you make it costs your competitors more.',
          ghost: 'Your margin flinched. Your name didn\'t.', stats: [{ label: 'HER', change: 'won for life' }, { label: 'THE QUEUE', change: 'convinced' }],
          insight: 'You treated a complaint as a public promise-keeping moment. Trust compounds faster than margin — you just watched it happen live.' },
        { id: 'b', label: 'Replace it and ask exactly how it burned — mine the fault.', skill: 'Reasoning & Critical Thinking', score: 12,
          echo: 'Wick too thin for the jar width. Every candle since is better because she came back.', consequence: 'The return becomes R&D. You fix the whole first batch\'s flaw by Tuesday.',
          ghost: 'The queue waited through your questions. Worth it.', stats: [{ label: 'ROOT CAUSE', change: 'found' }, { label: 'NEXT BATCH', change: 'better' }],
          insight: 'You turned a complaint into data on the spot. Makers who interrogate their failures improve at double speed.' },
        { id: 'c', label: 'Elle handles the refund warmly — you keep the queue moving.', skill: 'Execution & Ownership', score: 9,
          echo: 'Elle was brilliant. The queue never stalled. You caught her eye: thanks.', consequence: 'Divide and conquer under pressure. Both jobs done properly.',
          ghost: 'You didn\'t hear how it burned.', stats: [{ label: 'QUEUE', change: 'kept moving' }, { label: 'ELLE', change: 'trusted with it' }],
          insight: 'You delegated the moment to the right person and held the system together. Noticing what you DIDN\'T learn is the growth edge here.' },
      ],
    },
    {
      kind: 'decision', mood: 'reflective', transition: 'cross-fade', eyebrow: '2pm · eleven candles left', scene: 'market', sceneCaption: 'The fog long gone, feet aching',
      prompt: 'A café owner has been watching your stall for ten minutes. She offers to buy all eleven remaining — at $9 each — and "maybe a regular order, we\'ll see."',
      keyAsk: 'Your first wholesale moment, at a discount.',
      factors: [
        { label: 'Her offer', value: '11 × $9, cash now', kind: 'metric' },
        { label: 'Walk-ups', value: 'still coming, slower', kind: 'meter' },
        { label: '"Regular order"', value: 'maybe · unwritten', kind: 'quote' },
      ],
      options: [
        { id: 'a', label: 'Counter: $11 each today — and a written trial order for next month.', skill: 'Leadership & Influence', score: 13,
          echo: 'She laughed, respected it, and wrote "24/month trial" on the back of her card.', consequence: 'You trade $2 a candle for a real commitment on paper. The stall becomes a supplier.',
          ghost: 'She could have walked. People who respect a counter rarely do.', stats: [{ label: 'TODAY', change: '11 × $11' }, { label: 'NEXT MONTH', change: '24, in writing' }],
          insight: 'You negotiated — kindly, immediately, with a trade instead of a no. And you got the "maybe" onto paper, which is where maybes become real.' },
        { id: 'b', label: 'Take the deal. Empty table, full till, done by 2:15.', skill: 'Judgement & Decision-Making', score: 10,
          echo: 'Sold out. Elle bought celebration doughnuts with the float.', consequence: 'A bird in the hand, taken cleanly. First sell-out day, banked.',
          ghost: 'The "regular order" floated off, unwritten.', stats: [{ label: 'STOCK', change: 'zero' }, { label: 'THE DAY', change: 'won' }],
          insight: 'Closing cleanly has real value — momentum, morale, proof. The unwritten maybe is the tuition fee; next time you\'ll ask for ink.' },
        { id: 'c', label: 'Sell her six, keep five for walk-ups — protect the stall\'s last hours.', skill: 'Situational Awareness & Systems Thinking', score: 11,
          echo: 'The last five went to five different strangers. Two asked for your Instagram.', consequence: 'Wholesale AND retail, balanced. The stall stays alive till close — future customers included.',
          ghost: 'Five candles as marketing budget.', stats: [{ label: 'CAF\u00c9', change: 'six + a taste' }, { label: 'NEW FOLLOWERS', change: 'the real stock' }],
          insight: 'You saw the stall as a system — today\'s revenue AND tomorrow\'s customers — and allocated between them. That\'s portfolio thinking at a trestle table.' },
      ],
    },
  ],
  outcome: {
    eyebrow: 'Packing the ute',
    title: 'Six months of making. Seven hours of selling. A business, briefly, yours.',
    body: 'No classroom covered this morning, {name} — pricing, a public complaint, a negotiation on your feet. Except every choice you made is the actual job. Here\'s what you showed.',
  },
  reflect: { asker: 'Elle, doughnut in hand', prompt: 'The refund, in front of everyone. Why so fast?' },
}

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
  { id: 'music', emoji: '🎸', label: 'Music', journeyId: 'journey-band', keywords: ['music', 'guitar', 'sing', 'band', 'dance', 'drum', 'dj'] },
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
 *  pathway shepherding (subjects + directions) for the reveal screen. */
export const JOURNEY_REVEALS: Record<string, {
  capabilities: { name: string; level: number; line: string }[]
  subjects: string[]
  directions: string[]
}> = {
  'journey-surf': {
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 84, line: 'You weighed waves, mates and rocks — and kept choosing well.' },
      { name: 'Situational Awareness & Systems Thinking', level: 81, line: 'You read the whole beach, not just your own session.' },
      { name: 'Integrity & Ethics', level: 87, line: 'You did the right thing when it cost you the best wave of the day.' },
    ],
    subjects: ['Outdoor Education', 'Marine Studies', 'PDHPE', 'Geography'],
    directions: ['Emergency services', 'Marine science', 'Sports management', 'Teaching & coaching'],
  },
  'journey-footy': {
    capabilities: [
      { name: 'Leadership & Influence', level: 86, line: 'You made other people bigger — Tess, Priya, the whole bench.' },
      { name: 'Integrity & Ethics', level: 84, line: 'You squared the ledger when the umpire missed it.' },
      { name: 'Judgement & Decision-Making', level: 80, line: 'You played the day, not just the game in front of you.' },
    ],
    subjects: ['PDHPE', 'Business Studies', 'Legal Studies', 'English'],
    directions: ['Coaching & high performance', 'Management', 'Law', 'Physiotherapy'],
  },
  'journey-farm': {
    capabilities: [
      { name: 'Judgement & Decision-Making', level: 85, line: 'Machinery calls, weather calls, people calls — you made them all.' },
      { name: 'Emotional Intelligence', level: 82, line: 'You looked after Davo in a way he could accept.' },
      { name: 'Reasoning & Critical Thinking', level: 80, line: 'You stopped for the noise — evidence over urgency.' },
    ],
    subjects: ['Agriculture', 'Engineering Studies', 'Biology', 'Business Studies'],
    directions: ['Agribusiness', 'Engineering', 'Environmental science', 'Operations & logistics'],
  },
}

/** Sky palette arcs — [top, bottom] per beat (opening, step1..3, reveal).
 *  The sky IS the progress bar: each journey moves through its own day. */
export const JOURNEY_SKIES: Record<string, [string, string][]> = {
  'journey-surf':   [['#101c33', '#27406b'], ['#233d63', '#4c6f9a'], ['#3f6a95', '#8fb4d0'], ['#6fa4c8', '#f0d6a4'], ['#8fc3e0', '#fdeecb']],
  'journey-footy':  [['#1b2c22', '#3c5a40'], ['#2e4a35', '#5d8a5f'], ['#4a6d47', '#93b585'], ['#6f8f5e', '#d9cf94'], ['#93b06f', '#f4e9b8']],
  'journey-farm':   [['#20180f', '#4a3419'], ['#3d2e17', '#7a5a2a'], ['#5f4a22', '#b08a48'], ['#7d6631', '#dcb56e'], ['#8f7a3e', '#f2d9a0']],
  'journey-band':   [['#171226', '#332752'], ['#2a2044', '#553e78'], ['#3f2f5e', '#7e5a9c'], ['#5a3f78', '#b083b5'], ['#7a58a6', '#e8c5d8']],
  'journey-market': [['#1f2430', '#3d4a5c'], ['#33445a', '#6a7f94'], ['#4c6a84', '#9fb3bd'], ['#6f93a8', '#e3cba8'], ['#8fb4c4', '#f8e3bd']],
}

export const JOURNEY_REVEALS_EXTRA: typeof JOURNEY_REVEALS = {
  'journey-band': {
    capabilities: [
      { name: 'Emotional Intelligence', level: 86, line: 'You found the sentence that unfroze Mia at the curtain.' },
      { name: 'Adaptability & Cognitive Flexibility', level: 83, line: 'You dropped three weeks of work the moment a better song appeared.' },
      { name: 'Leadership & Influence', level: 81, line: 'You ran a fair process while the whole band watched how.' },
    ],
    subjects: ['Music', 'Drama', 'English', 'Business Studies'],
    directions: ['Creative production', 'Events & entertainment', 'Teaching & coaching', 'Team management'],
  },
  'journey-market': {
    capabilities: [
      { name: 'Reasoning & Critical Thinking', level: 85, line: 'You worked out the $8 stall was never your competitor.' },
      { name: 'Integrity & Ethics', level: 84, line: 'You made the refund in front of the whole queue.' },
      { name: 'Leadership & Influence', level: 80, line: 'You countered the caf\u00e9 owner — kindly, immediately, in writing.' },
    ],
    subjects: ['Business Studies', 'Economics', 'Design & Technology', 'Visual Arts'],
    directions: ['Entrepreneurship', 'Marketing & brand', 'Product & retail', 'Negotiation-heavy roles'],
  },
}
Object.assign(JOURNEY_REVEALS, JOURNEY_REVEALS_EXTRA)

/** OPEN GENERATION (prototype-mocked): journeys are not a finite library.
 *  The student describes anything they love; the real build generates a
 *  bespoke journey via FUSE. Here we pick the structurally-nearest
 *  flagship and frame it with their passion so the INTENT — infinite
 *  journeys — is what the demo communicates. */
export function generateJourney(passionText: string): { scenario: Scenario; passionLabel: string } {
  const scenario = journeyForPassion(passionText)
  const cleaned = (passionText || '').trim()
  const passionLabel = cleaned.length > 1
    ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1, 40)
    : 'Your thing'
  return { scenario, passionLabel }
}
