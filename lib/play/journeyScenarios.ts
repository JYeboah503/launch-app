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

export const JOURNEYS: Scenario[] = [SURF_JOURNEY, FOOTY_JOURNEY, FARM_JOURNEY]

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
  { id: 'music', emoji: '🎸', label: 'Music', journeyId: 'journey-footy', keywords: ['music', 'guitar', 'sing', 'band', 'dance', 'drum'] },
  { id: 'gaming', emoji: '🎮', label: 'Gaming', journeyId: 'journey-surf', keywords: ['gam', 'minecraft', 'fortnite', 'computer', 'code'] },
  { id: 'making', emoji: '🛠️', label: 'Making things', journeyId: 'journey-farm', keywords: ['build', 'make', 'craft', 'art', 'draw', 'cook', 'bake'] },
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
