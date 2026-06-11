import type { Scenario } from './types'

/* Ported verbatim from LQV2.html (lines 3035-3644) — scenario data is unchanged. */

/* === scenario-v2.jsx === */
// Scenario library v2 — five distinct scenarios, one picked at random per session/restart.
// Each factor carries a `kind` that drives how it animates:
//   time   — live countdown, urgent red pulse
//   live   — blinking "LIVE" red dot (broadcast / social)
//   meter  — amber pulse + subtle animated waveform (ambient intensity)
//   signal — soft neutral pulse dot
//   metric — static number, no pulse
//   quote  — italic, muted, no pulse

export const LAKERS_SCENARIO: Scenario = {
  id: "lakers-coach",
  role: "Head Coach — Los Angeles Lakers",
  meta: "GAME 3 · WESTERN CONFERENCE SEMIFINALS · TIP-OFF IN 00:42:18",
  goal: { label: "TEAM BEHIND YOU", target: 75 },
  opening: {
    eyebrow: "The scenario",
    title: "You are down 0–2. The building is restless. Two of your stars aren't speaking.",
    body: "Tip-off is in forty-two minutes, Coach {name}. Your locker room is quiet in the way locker rooms get quiet before something breaks. The series is slipping. The city is watching. Every choice from here is a signal.",
    imageCaption: "Staples Center · tunnel · 00:42 to tip-off",
    ambient: [
      { label: "CROWD", value: "18,997" },
      { label: "TIP-OFF", timeSeconds: 42 * 60 + 18, timeId: "clock-Clock to tip-off" },
      { label: "SERIES", value: "LAL 0 — 2 OPP" }
    ]
  },
  steps: [
    {
      kind: "decision",
      mood: "private",
      transition: "cross-fade",
      eyebrow: "00:38 · Locker room",
      scene: "locker",
      sceneCaption: "East corridor, bench unspoken",
      prompt: "Your starting point guard is icing his knee and won't look up. He hasn't spoken to the team all day.",
      keyAsk: "He hasn't spoken to the team all day.",
      factors: [
        { label: "Locker room volume", value: "barely a murmur", kind: "meter" },
        { label: "Clock to tip-off", value: "00:38:14", tone: "mono", kind: "time" },
        { label: "Weather · downtown LA", value: "63°F · overcast", kind: "metric" },
        { label: "Broadcast", value: "TNT · 14.2M est.", kind: "metric" },
        { label: "Rival coach, pre-game", value: "\"They'll fold in the fourth.\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "Pull him aside. One-on-one.", skill: "Empathy", score: 12, echo: "You pulled him aside. He nodded. Tapped the wall on his way out.", consequence: "He nodded once. Tapped the wall on the way out.", ghost: "Would have felt safe, but private.", surprise: "He's suddenly your biggest fan.", insight: "Private recognition moves people who feel unseen far more than public praise. You picked up on his withdrawal as a bid for attention — not distance — and answered it quietly. That signal rarely feeds back immediately; when it does, months later, it tends to move careers.", insightNavigate: "When someone goes quiet before a high-stakes moment, default to a one-on-one before a team address. The room can wait; the individual often can't.", stats: [{ label: "HIS SHOULDERS", change: "tense → softer" }, { label: "ROOM PULSE", change: "held" }] },
        { id: "b", label: "Address the whole room. Name the tension.", skill: "Leadership", score: 5, echo: "You named the tension. The room tightened. One still won't look up.", consequence: "Room tightened. Shoulders squared. One still won't look up.", ghost: "Would have felt brave, possibly loud.", surprise: "The room respects you. One guy is quietly furious.", insight: "Naming tension publicly is high-variance: it either consolidates the room or exposes the one person not ready to be seen. You made the brave call; the cost is asymmetric — most benefit, one quietly holds a grudge.", insightNavigate: "Public framing works when the group's discomfort is already shared. Privately check the holdout first, then address the room — you lose nothing by sequencing it.", stats: [{ label: "ROOM TENSION", change: "spiked" }, { label: "EYES ON YOU", change: "11 of 12" }] },
        { id: "c", label: "Leave him be. Let the game speak.", skill: "Restraint", score: -8, echo: "You left him alone. He laced up in silence.", consequence: "He laced up alone. Silence went with him down the tunnel.", ghost: "Would have felt disciplined, maybe distant.", surprise: "He's writing you off as a coach.", insight: "Restraint reads as respect when trust is already built — and as abandonment when it isn't. In ambiguous moments, 'giving space' is often the coach's preference, not the player's need. The cost lands later, in performance reviews and exit interviews.", insightNavigate: "Before defaulting to restraint, ask yourself: does this person have a track record of wanting space, or am I just avoiding a hard conversation? The answer usually clarifies the call.", stats: [{ label: "HIS WITHDRAWAL", change: "deeper" }, { label: "YOUR DISTANCE", change: "rising" }] }
      ]
    },
    {
      kind: "decision",
      mood: "tense",
      transition: "whip-pan",
      eyebrow: "00:22 · Whiteboard",
      scene: "whiteboard",
      sceneCaption: "Staff room, markers down",
      prompt: "Your assistant wants to start the rookie. It's bold. It's also a gamble on live television.",
      keyAsk: "a gamble on live television",
      factors: [
        { label: "Rookie · last 4 games", value: "23 / 6 / 5", kind: "metric" },
        { label: "Veteran starter · last 4", value: "11 / 3 / 2", kind: "metric" },
        { label: "Clock to tip-off", value: "00:22:03", tone: "mono", kind: "time" },
        { label: "Broadcast", value: "TNT · national window", kind: "metric" },
        { label: "Front office", value: "quiet, watching", kind: "signal" }
      ],
      options: [
        { id: "a", label: "Start the rookie. Trust the read.", skill: "Courage", score: 10, echo: "You started the rookie. Your assistant exhaled. The room reshaped.", consequence: "Lineup card changed. Your assistant exhaled. Room reshaped around it.", ghost: "Would have been bold, possibly premature.", surprise: "Your assistant thinks you're a genius.", insight: "Players remember the coach who bet on them before the numbers justified it. That one-game gamble shows up in free-agency conversations years later. Boldness read as trust compounds in loyalty.", insightNavigate: "When you're considering a bold personnel move, ask: 'Does this person know I considered them?' Sometimes the deliberation is worth more than the decision — tell them you thought about it, even if you go another way.", stats: [{ label: "THE ROOKIE", change: "adrenaline spiking" }, { label: "YOUR ASSISTANT", change: "exhaling with relief" }] },
        { id: "b", label: "Keep the veteran starting five.", skill: "Judgment", score: 3, echo: "You stuck with the veteran. The rookie's jaw set. Continuity holds.", consequence: "Veterans straightened up. Rookie's jaw set. Continuity holds.", ghost: "Would have been safe, possibly stale.", surprise: "Nothing dramatic. Ownership nods.", insight: "Continuity is underrated until it isn't. Executives often read a coach's willingness to hold a line as maturity — especially under pressure. The cost is a rookie who remembers the moment he didn't get.", insightNavigate: "The 'safe' call is sometimes the right one — but name it as a call, not a default. Tell the rookie: 'This isn't your night, and here's why.' Visibility of your reasoning is what keeps trust intact.", stats: [{ label: "VETERAN NERVES", change: "steady" }, { label: "ROOKIE'S JAW", change: "set" }] },
        { id: "c", label: "Rookie in the second unit, heavy minutes.", skill: "Strategy", score: 8, echo: "You sent the rookie to the second unit. It read as intentional.", consequence: "Read as intentional. Bench reorganized on the fly.", ghost: "Would have been clever, possibly hedged.", surprise: "The analytics desk is already writing about you.", insight: "Compromises read as intentional when you own the framing. You didn't start the rookie OR bench him — you designed a role. That's the move that gets studied.", insightNavigate: "When splitting the difference, announce the design out loud. Silent compromises read as indecision. Named compromises read as strategy.", stats: [{ label: "BENCH ENERGY", change: "rising" }, { label: "ROTATION READ", change: "intentional" }] }
      ]
    },
    {
      kind: "decision",
      mood: "loud",
      transition: "iris-in",
      eyebrow: "00:09 · Tunnel",
      scene: "press",
      sceneCaption: "Press scrum, two mics, one camera",
      prompt: "A reporter corners you. 'Coach {name}, is the locker room fractured?' Two mics. One camera. Seven seconds.",
      keyAsk: "is the locker room fractured?",
      factors: [
        { label: "Cameras", value: "3 rolling", kind: "live" },
        { label: "Clock to tip-off", value: "00:09:47", tone: "mono", kind: "time" },
        { label: "Crowd · lower bowl", value: "18,997 · boisterous", kind: "meter" },
        { label: "Broadcast", value: "TNT · live cut-in ready", kind: "metric" },
        { label: "Social · last 15 min", value: "\"#LakersDrama\" trending", kind: "live" }
      ],
      options: [
        { id: "a", label: "\"We're fine. Watch the game.\"", skill: "Composure", score: 8, echo: "You said \"we're fine.\" It played on three networks in an hour.", consequence: "Seven words. On three networks inside an hour.", ghost: "Would have been calm, possibly curt.", surprise: "The press loves it. Your owner loves it.", insight: "Under pressure, brevity reads as confidence. Long explanations signal anxiety — even when they're true. You gave the press a clean bullet; they ran with it because it was the only clean bullet on offer.", insightNavigate: "In any press or crisis moment, draft your seven-word answer BEFORE the mic is on. If you can't compress your position that tight, you don't have a position — you have a draft.", stats: [{ label: "YOUR PULSE", change: "steady" }, { label: "CLIP LENGTH", change: "7 words" }] },
        { id: "b", label: "\"Every team has friction. Ours uses it.\"", skill: "Framing", score: 12, echo: "You reframed the friction. Three analysts quoting you by tip-off.", consequence: "She wrote it down. Three analysts quoting you by tip-off.", ghost: "Would have been framed, possibly too tidy.", surprise: "You just went viral. In the good way.", insight: "The strongest PR moves don't deflect the narrative — they rewrite it. You turned a weakness frame into a strength frame using the same underlying facts. That kind of reframe scales: your front office starts hiring for it.", insightNavigate: "When you're forced to comment on something uncomfortable, ask: 'What's the honest reframe that makes this a feature, not a bug?' If you can find one, say it clearly. If you can't, honesty beats spin — say so.", stats: [{ label: "THE REPORTER", change: "leaning in" }, { label: "THREE ANALYSTS", change: "scribbling your line" }] },
        { id: "c", label: "Walk past. No comment.", skill: "Discipline", score: -5, echo: "You walked past. The footage loops silently all night.", consequence: "Footage loops silently. A thousand opinions fill your silence.", ghost: "Would have been controlled, possibly loud in its own way.", surprise: "A columnist is going to write the worst version of this.", insight: "Silence isn't neutral in public spaces — it's a canvas. When you won't fill the frame, someone else will, and they'll paint in their colours. 'No comment' is almost always heard as a confirmation.", insightNavigate: "Even if you can't share specifics, say SOMETHING — a short, honest framing that acknowledges the question without answering it. 'I won't comment on X because Y. Here's what I will say about the work.' That shape beats silence every time.", stats: [{ label: "CAMERA LOOP", change: "locked" }, { label: "OPINION VACUUM", change: "filling" }] }
      ]
    },
    {
      kind: "decision",
      mood: "reflective",
      transition: "slow-zoom",
      eyebrow: "Q4 · 00:58 · down 2",
      scene: "court",
      sceneCaption: "Huddle, final timeout",
      prompt: "Final timeout. Last possession. Who gets the ball?",
      keyAsk: "Who gets the ball?",
      factors: [
        { label: "Score", value: "LAL 102 · OPP 104", kind: "metric" },
        { label: "Game clock", value: "00:00:58", tone: "mono", kind: "time" },
        { label: "Star · tonight", value: "29 pts · 7 asts · tired", kind: "metric" },
        { label: "Hot hand · Q4", value: "4/4 from the arc", kind: "metric" },
        { label: "Crowd · on its feet", value: "every section", kind: "meter" }
      ],
      options: [
        { id: "a", label: "The star. He earned this moment.", skill: "Trust", score: 5, echo: "You gave it to the star. The building rose with him.", consequence: "Ball to familiar hands. The building rose with him.", ghost: "Would have been loyal, possibly expected.", surprise: "The star is loyal for life. The hot hand is wounded.", insight: "Giving a star the last shot isn't really a strategic choice — it's a loyalty signal. Whether it falls or not, you've built equity with the most powerful voice in the room. Sometimes that equity is worth more than the bucket.", insightNavigate: "In moments where there's a 'safe' choice that's also the loyal choice, recognise you're not buying a shot — you're buying a relationship. Price it accordingly.", stats: [{ label: "THE ARENA", change: "rising with him" }, { label: "YOUR STAR", change: "pulse steady" }] },
        { id: "b", label: "The hot hand. Ride the wave.", skill: "Adaptability", score: 12, echo: "You rode the hot hand. Defense rotated wrong. Bench half-standing.", consequence: "Defense rotated wrong. Bench already half-standing.", ghost: "Would have been live-read, possibly unproven.", surprise: "The bench loves you. The star is suddenly cold with you.", insight: "'Hot hand' reads as analytical to coaches and as disrespect to veterans. The in-game call was right; the second-order cost is relational. The highest-scoring decisions often carry the highest hidden tax.", insightNavigate: "Before riding a hot hand over a veteran, pull the veteran aside in the timeout: 'I'm going this way — cover it.' One sentence prevents a month of damage.", stats: [{ label: "DEFENSE ROTATION", change: "wrong" }, { label: "BENCH ENERGY", change: "half-stood" }] },
        { id: "c", label: "The hidden play. Catch them off-guard.", skill: "Creativity", score: 10, echo: "You called a hidden play. Backdoor cut. The arena held its breath.", consequence: "Backdoor cut. Three moving parts. The arena held its breath.", ghost: "Would have been inventive, possibly risky.", surprise: "You just entered the league's playbook. Named after you.", insight: "Creative calls in high-leverage moments become canonical — one way or another. Either opponents copy them, or they teach around them. Both cement your reputation as someone worth preparing for.", insightNavigate: "If you're going to call something genuinely creative, commit fully and rehearse silently before the moment. Half-hearted creativity is just confusion.", stats: [{ label: "HELD BREATH", change: "every seat" }, { label: "MISDIRECTION", change: "landed" }] }
      ]
    }
  ],
  outcome: {
    eyebrow: "Final buzzer",
    title: "The building exhales. Four decisions. Somewhere a scout is writing about you.",
    body: "What matters isn't the score on the board — it's the shape of how you decided. Launch logs the texture of your thinking: where you paused, what you prioritized, how you held the pressure."
  },
  reflect: {
    asker: "Your assistant coach leans in",
    prompt: "Talk me through it, Coach. Why that one — and not the others?"
  }
};

export const SEPHORA_SCENARIO: Scenario = {
  id: "sephora-lead",
  role: "Store Lead — Sephora Times Square",
  meta: "FENTY SURPRISE DROP · DOORS OPEN IN 00:26:12",
  goal: { label: "LAUNCH ON LOCK", target: 75 },
  opening: {
    eyebrow: "The scenario",
    title: "The line wraps the block. Two staff just no-showed. Fenty drops live in twenty-six minutes.",
    body: "The stockroom smells like citrus and cardboard, {name}. Your district manager is watching Instagram. A TikTok of your line has fourteen thousand likes and climbing. Every choice from here is a signal — to your team, to the floor, to the feed.",
    imageCaption: "Sephora Times Square · stockroom · 00:26 to doors",
    ambient: [
      { label: "LINE", value: "wraps the block" },
      { label: "DOORS", timeSeconds: 26 * 60 + 12, timeId: "clock-Doors open in" },
      { label: "TRENDING", value: "#FENTYDROP · #4" }
    ]
  },
  steps: [
    {
      kind: "decision", mood: "private", transition: "cross-fade",
      eyebrow: "00:22 · Back room",
      scene: "locker",
      sceneCaption: "Stockroom, fluorescent hum",
      prompt: "Your newest hire is crying in the break room. The line outside just hit the corner.",
      keyAsk: "crying in the break room",
      factors: [
        { label: "Doors open in", value: "00:22:14", tone: "mono", kind: "time" },
        { label: "Line · outside", value: "wraps the block", kind: "meter" },
        { label: "Stock on hand", value: "487 units", kind: "metric" },
        { label: "Instagram mentions", value: "14.2K · +430/min", kind: "live" },
        { label: "District manager", value: "\"Nail it.\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "Pull her aside. Thirty seconds.", skill: "Empathy", score: 10, echo: "You pulled her aside. She breathed. Apron back on.", consequence: "She breathes. Nods. Puts her apron back on.", ghost: "Would have felt human, possibly slow.", surprise: "She's telling everyone you're the best manager she's ever had.", insight: "In retail, the frontline word-of-mouth economy is more honest than any exit survey. A single visible act of humanity travels further than any policy rollout. What you lose in the moment, you gain in the review no one saw you write.", insightNavigate: "When you choose the slower human option, you're investing in reputational capital that compounds silently. Don't expect attribution — expect it to shape who wants to work for you for years.", stats: [{ label: "HER BREATHING", change: "rapid → calm" }, { label: "TEAM MORALE", change: "lifted" }] },
        { id: "b", label: "Give her the till. Keep her off the floor.", skill: "Judgment", score: 5, echo: "You put her on the till. The team is one short on the floor.", consequence: "She's safe, the team is short. The day reshapes around it.", ghost: "Would have been protective, possibly sidelining.", surprise: "Your DM is quietly impressed.", insight: "Middle managers above you prize invisibility of interpersonal friction. What looks like protection of an employee also reads as protection of your manager's inbox. It's a two-way favour, even if you didn't intend the second.", insightNavigate: "When you choose the 'protective' move, notice who else it protects. If it flattens a problem for your boss, that's not a bug — it's career currency. Just don't make a habit of it when the employee deserves more.", stats: [{ label: "HER SAFETY", change: "out of the fire" }, { label: "YOUR FLOOR", change: "one body short" }] },
        { id: "c", label: "She's here or she's not. Decide now.", skill: "Resolve", score: -3, echo: "You told her straight. She stayed. Tense, but on her feet.", consequence: "She stays. Tense, but on her feet. You'll see about it after.", ghost: "Would have been clean, possibly cold.", surprise: "She hates you now. Quietly. It'll come back.", insight: "The 'tough' call in a retail moment often comes back as a leadership gap years later, at exactly the wrong time. People you're hard on in their first month become bosses who remember every word.", insightNavigate: "If you're going to be direct under pressure, make the reason visible: 'I need you on the floor because X.' Terse without context reads as cold. Terse WITH context reads as respect.", stats: [{ label: "HER STANCE", change: "gone rigid" }, { label: "YOUR TEAM", change: "glancing at each other" }] }
      ]
    },
    {
      kind: "decision", mood: "tense", transition: "whip-pan",
      eyebrow: "00:13 · Floor map",
      scene: "whiteboard",
      sceneCaption: "Planogram, tape on the counter",
      prompt: "Your assistant says pull everyone to the front. Your lead advisor wants half on the floor for regulars. Five minutes to decide.",
      keyAsk: "Five minutes to decide.",
      factors: [
        { label: "Doors open in", value: "00:13:07", tone: "mono", kind: "time" },
        { label: "Regulars in queue", value: "~30 VIP", kind: "metric" },
        { label: "Floor staff · ready", value: "6 of 9", kind: "signal" },
        { label: "TikTok saves · last 5m", value: "+2.1K", kind: "live" },
        { label: "Back stock · Fenty", value: "230 units", kind: "metric" }
      ],
      options: [
        { id: "a", label: "All hands to Fenty. Regulars wait.", skill: "Courage", score: 5, echo: "You sent all hands to Fenty. The VIP line sharpened its shoulders.", consequence: "The front becomes a wall of staff. The VIP line sharpens its shoulders.", ghost: "Would have been bold, possibly burning goodwill.", surprise: "Sales crushed. A VIP is writing a complaint to corporate.", insight: "Headline numbers hide loyalty bleeds. The customers who absorbed the quiet weeks are never the ones who make the launch-day margin — but they ARE the ones who write to corporate when they feel dropped.", insightNavigate: "When pressure spikes, name the tradeoff out loud to your team — and if possible, to your regulars. A two-sentence heads-up ('It's drop day, we'll be right with you') turns loyalty bleed into loyalty reinforcement.", stats: [{ label: "FENTY LINE", change: "flowing" }, { label: "VIP TEMPER", change: "rising" }] },
        { id: "b", label: "Split the floor. Seven up front, two on VIP.", skill: "Strategy", score: 12, echo: "You split the floor. It read as intentional.", consequence: "A compromise everyone reads as intentional.", ghost: "Would have been clever, possibly hedged.", surprise: "Your DM is impressed. Also threatened. That's not the same thing.", insight: "Brilliant calls from a rung below create unseen friction with the rung above. Your manager's self-image is often the invisible variable in your career. Intentional compromise reads as intelligence — and sometimes as threat.", insightNavigate: "When you make a strong call in your boss's domain, retro-fit credit to them: 'Your framework on balancing lines made this obvious.' Costs you nothing. Saves the relationship.", stats: [{ label: "VIP WAIT", change: "acceptable" }, { label: "FENTY THROUGHPUT", change: "strong" }] },
        { id: "c", label: "VIP has priority. They kept us through the quiet weeks.", skill: "Loyalty", score: 3, echo: "You put VIP first. The front line bristled but held.", consequence: "The regulars move first. The front line bristles but holds.", ghost: "Would have been grounded, possibly slow.", surprise: "TikTok just called you 'the slow Sephora.'", insight: "Loyalty decisions are judged by who's loudest, not who's right. The silent 20-year regular doesn't post. The 16-year-old with a hashtag does. Your moral logic may not survive your manager's Google alert.", insightNavigate: "Loyalty to long-term customers is defensible — but budget for visible reassurance of the loud new ones. A two-staff 'flex team' runs interference and keeps the narrative out of trouble.", stats: [{ label: "YOUR REGULARS", change: "watching you carefully" }, { label: "THE LINE", change: "holding, barely" }] }
      ]
    },
    {
      kind: "decision", mood: "loud", transition: "iris-in",
      eyebrow: "00:02 · Storefront",
      scene: "press",
      sceneCaption: "Storefront, three phones recording",
      prompt: "A reporter from Glossy corners you. '{name}, is Sephora ready for the Fenty heat?' Two mics. Phones up. Seven seconds.",
      keyAsk: "is Sephora ready for the Fenty heat?",
      factors: [
        { label: "Doors open in", value: "00:02:18", tone: "mono", kind: "time" },
        { label: "Phones · recording", value: "3+", kind: "metric" },
        { label: "Line · now", value: "400+ · corner broken", kind: "meter" },
        { label: "TikTok · #FentyDrop", value: "trending · #4", kind: "live" },
        { label: "Glossy reporter", value: "\"Is this a meltdown?\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "\"We're ready. Watch us work.\"", skill: "Composure", score: 8, echo: "You said \"we're ready.\" Seven words, on three accounts in the hour.", consequence: "Seven words. Clean cut. Runs on three accounts inside the hour.", ghost: "Would have been calm, possibly curt.", surprise: "A leadership podcast just quoted you. Your DM feels skipped.", insight: "Punchy public moments get noticed by people you've never met — and sometimes by people above the ones who should be noticing you first. Visibility can skip a reporting line, which is flattering until it's political.", insightNavigate: "When a quote travels, tell your direct manager before they see it somewhere else. 'Heads up — this clip is out there, here's context.' Removes all political risk, costs nothing.", stats: [{ label: "YOUR CLIP", change: "seven clean words" }, { label: "THE REPORTER", change: "disarmed" }] },
        { id: "b", label: "\"It's drop day. Every store runs hot. We're holding.\"", skill: "Framing", score: 12, echo: "You reframed the heat. Two outlets quoting you by doors-open.", consequence: "The reporter pauses, reframes. By doors-open, two outlets quote it.", ghost: "Would have been framed, possibly too tidy.", surprise: "Corporate wants your line for their campaign. Without your name.", insight: "Great framing belongs to the company the moment it works. Expect to be invisibly absorbed by corporate narrative — and for the choice you make about attribution to define how your next three years go.", insightNavigate: "If your words go upstream, ask for credit in the form of internal recognition (a call with an exec, an introduction) rather than public attribution. It's what you can actually cash in.", stats: [{ label: "HER PEN", change: "moving fast" }, { label: "TWO OUTLETS", change: "running your line" }] },
        { id: "c", label: "\"No comment on heat. Doors in two minutes.\"", skill: "Discipline", score: -3, echo: "You said no comment. The clip loops silently.", consequence: "You walk. The clip loops silently. A hundred captions fill the space.", ghost: "Would have been controlled, possibly loud in its own way.", surprise: "A TikToker just filled the silence with her version of you.", insight: "Silence in the face of cameras is a gift to whoever has the next microphone. Often that's a customer. Sometimes it's your own corporate — and they won't represent you as you would have represented yourself.", insightNavigate: "Pre-cook a single neutral line for any ambush question: 'We're heads-down running the day. Come back at close — I'll walk you through it.' Buys time, fills the vacuum, protects your voice.", stats: [{ label: "THE SILENCE", change: "filling with her words" }, { label: "YOUR CONTROL", change: "slipping" }] }
      ]
    },
    {
      kind: "decision", mood: "reflective", transition: "slow-zoom",
      eyebrow: "+00:15 · Post-open",
      scene: "court",
      sceneCaption: "Inside, first fifteen minutes",
      prompt: "Fifteen minutes in. Register two is lagging. VIP is thirty deep. Who do you pull to save it?",
      keyAsk: "Who do you pull to save it?",
      factors: [
        { label: "Shift buffer", value: "00:05:12", tone: "mono", kind: "time" },
        { label: "Units moved · first 15", value: "210 / 400", kind: "metric" },
        { label: "Peak basket", value: "$2,400", kind: "metric" },
        { label: "VIP waiting", value: "30+", kind: "meter" },
        { label: "Customers on floor", value: "every aisle", kind: "meter" }
      ],
      options: [
        { id: "a", label: "Pull the lead advisor. She reads the floor.", skill: "Trust", score: 8, echo: "You pulled the lead advisor. The register steadied. VIP moved.", consequence: "She steps up. The register steadies. VIP starts moving.", ghost: "Would have been loyal, possibly expected.", surprise: "Your lead advisor would walk through fire for you now.", insight: "Reliable people notice when they're reached for first. It's often the smallest signal that buys the largest retention. And good lieutenants often do your people-development work for you, invisibly, once they feel secure.", insightNavigate: "The 'obvious' call to trust a veteran is often also the retention call. Follow it up with a text that night — 'Thank you, I saw what you did' — to lock it in.", stats: [{ label: "REGISTER SPEED", change: "restored" }, { label: "VIP FLOW", change: "moving" }] },
        { id: "b", label: "The new hire — she's ready. Throw her in.", skill: "Adaptability", score: 5, echo: "You threw the new hire in. Green but fast. The queue bent.", consequence: "Green but fast. The queue bends around her energy.", ghost: "Would have been live-read, possibly unproven.", surprise: "The new hire thrived. The veteran is quietly quitting.", insight: "Giving a chance to the newcomer is also withholding one from the veteran, whether you meant to or not. Tenure reads any skip as a signal — and signals in retail teams travel fast and unattributed.", insightNavigate: "When you reach past someone for the new option, put 30 seconds of framing on it: 'I'm giving her this one because I want you free for X.' Turns a snub into an assignment.", stats: [{ label: "HER ADRENALINE", change: "spiking" }, { label: "THE QUEUE", change: "bending to her energy" }] },
        { id: "c", label: "Redirect VIPs to the private room. Skip the queue.", skill: "Creativity", score: 12, echo: "You redirected VIPs to the private room. The corner breathed.", consequence: "Three parts moving. Private room becomes the store. The corner breathes.", ghost: "Would have been inventive, possibly risky.", surprise: "Two VIPs just made you famous. Corporate is calling.", insight: "Creative workarounds often become company playbook — but they also quietly invert reporting lines. Being the source of a corporate pattern positions you ABOVE the people who currently manage you, even if the org chart hasn't caught up.", insightNavigate: "When your workaround goes scalable, loop your manager in on the pilot as 'co-lead' — even if you're doing 90% of it. It preserves the political structure while your substance still wins.", stats: [{ label: "PRIVATE ROOM", change: "activated" }, { label: "CORNER BREATHING", change: "restored" }] }
      ]
    }
  ],
  outcome: {
    eyebrow: "Doors closed",
    title: "The floor exhales. Four decisions. Somewhere a district manager is writing about you.",
    body: "It isn't the units moved — it's the shape of how you decided. Launch logs the texture of your thinking: where you paused, what you prioritized, how you held the pressure."
  },
  reflect: {
    asker: "Your lead advisor pulls you aside",
    prompt: "Hey {name} — real quick. Why that one, and not the others?"
  }
};

export const NEWSROOM_SCENARIO: Scenario = {
  id: "newsroom-editor",
  role: "Editor-in-Chief — The Standard",
  meta: "PRINT DEADLINE · FRONT PAGE IN 00:18:42",
  goal: { label: "STORY STANDS", target: 75 },
  opening: {
    eyebrow: "The scenario",
    title: "A tip dropped at eleven forty-three. By six your front page is on a truck. And the lede won't hold.",
    body: "The newsroom is still, but not calm, {name} — the stillness of people waiting. Legal is on line two. A junior reporter has a second source. Your competitor just pushed their story to web. Every choice from here is what readers will remember you for.",
    imageCaption: "The Standard · rewrite desk · 00:18 to print",
    ambient: [
      { label: "DESK", value: "quiet, 2 lit" },
      { label: "TO PRINT", timeSeconds: 18 * 60 + 42, timeId: "clock-Print deadline" },
      { label: "WEB SCOOP", value: "42,310 read" }
    ]
  },
  steps: [
    {
      kind: "decision", mood: "private", transition: "cross-fade",
      eyebrow: "00:16 · Rewrite desk",
      scene: "locker",
      sceneCaption: "Rewrite desk, a terminal dimmed",
      prompt: "Your lead reporter is staring at her screen. Her anonymous source just pulled out. The story is half-built on that quote.",
      keyAsk: "Her anonymous source just pulled out.",
      factors: [
        { label: "Print deadline", value: "00:16:21", tone: "mono", kind: "time" },
        { label: "Pageviews · web scoop", value: "42,310", kind: "metric" },
        { label: "Twitter rumble", value: "slow burn · 400/min", kind: "live" },
        { label: "Desk phones", value: "2 lit", kind: "signal" },
        { label: "Publisher", value: "\"Don't miss the window.\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "Sit with her. Rebuild the lede together.", skill: "Empathy", score: 10, echo: "You sat with her. A new angle surfaced in four minutes.", consequence: "She exhales. A new angle surfaces in four minutes.", ghost: "Would have felt human, possibly off-pace.", surprise: "She's going to credit you by name at the awards.", insight: "Reporters who name their editors in public are making a career decision, not a courtesy. You just became part of her brand. That's an asset — and a quiet claim on you she'll cash in at a harder moment.", insightNavigate: "When a junior publicly credits you, respond privately with a note that says you saw it. Don't match the public gesture — the private one is what locks the bond.", stats: [{ label: "HER CONFIDENCE", change: "coming back" }, { label: "A NEW ANGLE", change: "surfaced in four minutes" }] },
        { id: "b", label: "Call the second source yourself. Right now.", skill: "Initiative", score: 8, echo: "You called the second source yourself. The newsroom watched it land.", consequence: "You pick up the phone. The newsroom watches the call land.", ghost: "Would have been decisive, possibly overstepping.", surprise: "The source prefers your junior now. You got played, kindly.", insight: "Seniority can cash in favours a junior can't — but it can also signal that the scene is 'above' the reporter, undermining her standing with the source. Sources optimize for who they think will write the most careful piece, not who made the call.", insightNavigate: "If you're going to parachute in, route the warmth back: 'I'm calling to vouch for [reporter name], who'll take the work from here.' Turns the call into an endorsement, not a takeover.", stats: [{ label: "THE NEWSROOM", change: "eyes on you" }, { label: "YOUR SOURCE", change: "leaning in" }] },
        { id: "c", label: "Give her the room. She's written through worse.", skill: "Trust", score: 5, echo: "You gave her the room. She wrote through it.", consequence: "She writes fast, alone. You feel the draft move.", ghost: "Would have been steady, possibly distant.", surprise: "Her HR complaint is in your file by Monday.", insight: "'Giving space' is a compliment when someone feels seen and an abandonment when they don't. The difference is whether you explicitly named the trust or just silently extended it. Interpretation asymmetry is a career risk.", insightNavigate: "Before stepping back, tell them you're doing it and why: 'I'm not crowding this — you've got it. I'm here if.' Five words. Reframes the whole next hour.", stats: [{ label: "SHE'S", change: "in her zone" }, { label: "THE DRAFT", change: "moving fast" }] }
      ]
    },
    {
      kind: "decision", mood: "tense", transition: "whip-pan",
      eyebrow: "00:11 · Story conference",
      scene: "whiteboard",
      sceneCaption: "Glass room, three drafts taped up",
      prompt: "Three versions of the lead. One careful, one aggressive, one that names names. Your legal counsel wants the careful one.",
      keyAsk: "Your legal counsel wants the careful one.",
      factors: [
        { label: "Print deadline", value: "00:11:04", tone: "mono", kind: "time" },
        { label: "Sources on record", value: "2 (of 3)", kind: "metric" },
        { label: "Legal · flag level", value: "yellow", kind: "signal" },
        { label: "Competitor · web", value: "story live · 8 min ago", kind: "live" },
        { label: "Newsroom mood", value: "leaning aggressive", kind: "metric" }
      ],
      options: [
        { id: "a", label: "Name names. Run the aggressive lede.", skill: "Courage", score: 5, echo: "You ran the aggressive lede. Legal exhaled sharply.", consequence: "Legal exhales sharply. The newsroom straightens.", ghost: "Would have been bold, possibly exposing.", surprise: "You're blacklisted from three press events. You won't know why.", insight: "Aggressive ledes have a second blast radius that shows up long after the lawsuit fear has passed — in soft exclusions, unreturned calls, and invitations that never arrive. PR systems have longer memories than legal ones.", insightNavigate: "When you run hard at a named subject, brief your reporters to seed parallel relationships with adjacent players. The network you build before the piece is the insurance policy against the one you'll lose after.", stats: [{ label: "LEGAL", change: "tensing up" }, { label: "THE NEWSROOM", change: "spines straightening" }] },
        { id: "b", label: "Hold the careful version. Build on it tomorrow.", skill: "Judgment", score: 3, echo: "You held the careful version. The reporter's jaw set.", consequence: "Legal nods. The reporter's jaw sets.", ghost: "Would have been safe, possibly too late.", surprise: "A rival ran it overnight. Your reporter is airing grievances online.", insight: "Juniors vent in public when they feel their work was clipped. Their post is about themselves, not you — but the outside world reads it as a culture signal about your newsroom. Reputational damage often routes through people who love you.", insightNavigate: "When you hold a reporter's copy, tell them WHEN it will run and WHAT you'll add to it. A concrete 'Tuesday, with a sidebar on X' gives them somewhere to put the frustration.", stats: [{ label: "LEGAL", change: "visibly relieved" }, { label: "YOUR REPORTER", change: "jaw setting" }] },
        { id: "c", label: "Aggressive lede, but pull one name until we confirm.", skill: "Framing", score: 12, echo: "You ran aggressive, minus one name. Legal green-lit it.", consequence: "A compromise. Legal green-lights. The desk reforms around it.", ghost: "Would have been clever, possibly hedged.", surprise: "The unnamed subject just became your best source for life.", insight: "In investigative work, restraint visible to the subject is the only currency that actually compounds. People watch how you treat them when you could have hit harder, and they remember it longer than the journalism itself.", insightNavigate: "Consider leaving one name deliberately unpublished even when you have confirmation. The missing name tells the subject you're a professional — and invites them to the table for the bigger story.", stats: [{ label: "LEGAL", change: "quietly satisfied" }, { label: "THE DESK", change: "breathing easier" }] }
      ]
    },
    {
      kind: "decision", mood: "loud", transition: "iris-in",
      eyebrow: "00:05 · Publisher's office",
      scene: "press",
      sceneCaption: "Corner office, door open",
      prompt: "The publisher walks in. '{name}. I need to know we aren't getting sued.' Four minutes to ship. Two mics live — one internal, one yours.",
      keyAsk: "I need to know we aren't getting sued.",
      factors: [
        { label: "Print deadline", value: "00:05:33", tone: "mono", kind: "time" },
        { label: "Legal · flag level", value: "yellow → red?", kind: "signal" },
        { label: "Competitor · updates", value: "4 in last hour", kind: "live" },
        { label: "Web desk", value: "ready to mirror print", kind: "metric" },
        { label: "Publisher", value: "\"Reassure me.\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "\"We stand by it. Every line is sourced.\"", skill: "Composure", score: 10, echo: "You said \"we stand by it.\" He nodded once. The office settled.", consequence: "Short. Direct. He nods once. The office settles.", ghost: "Would have been calm, possibly curt.", surprise: "The publisher is quoting you to the board.", insight: "One-sentence authority lines get absorbed into the publisher's self-image, which means they return as pressure. Once your boss quotes you publicly, you become the person who HAS to mean it next time.", insightNavigate: "If you project calm authority under a publisher, follow up quietly: 'I'll flag if we ever aren't that confident.' Creates an out for the next story where you're not sure.", stats: [{ label: "THE PUBLISHER", change: "shoulders dropping" }, { label: "THE OFFICE", change: "air settling" }] },
        { id: "b", label: "\"Here's exactly where legal is. Here's where we're strong.\"", skill: "Framing", score: 5, echo: "You walked him through it. Lost a minute in the process.", consequence: "You walk him through it. He takes notes. Time loses a minute.", ghost: "Would have been thorough, possibly slow.", surprise: "He's telling everyone he 'helped you' on this.", insight: "Thorough briefings flatter a publisher's sense of involvement. They'll cite the conversation as participation. That's not a bug — it's the unspoken tax of transparency with powerful people.", insightNavigate: "If you involve your publisher deeply, be the one to tell the story after: 'I walked him through the legal review' — own the narrative before he does, with his permission.", stats: [{ label: "THE PUBLISHER", change: "taking notes" }, { label: "A MINUTE", change: "slipped away" }] },
        { id: "c", label: "\"Come to the desk. Read the draft yourself.\"", skill: "Transparency", score: 12, echo: "You brought him to the desk. The newsroom watched him read.", consequence: "He follows you out. The newsroom watches him read.", ghost: "Would have been open, possibly risky.", surprise: "Your newsroom just doubled their courage. For six months.", insight: "Gestural transparency to a publisher changes what a newsroom believes is possible. The reporters weren't watching the publisher read — they were watching whether you'd hold the line if he balked. He didn't. Now they won't either.", insightNavigate: "Symbolic acts of transparency are force multipliers, but only if you're RIGHT. Don't invite the boss to read unless you're genuinely confident. The reverse signal is devastating.", stats: [{ label: "NEWSROOM EYES", change: "watching" }, { label: "PUBLISHER IMMERSION", change: "deep" }] }
      ]
    },
    {
      kind: "decision", mood: "reflective", transition: "slow-zoom",
      eyebrow: "00:00:45 · Final proof",
      scene: "court",
      sceneCaption: "Proof in hand, press waiting",
      prompt: "Forty-five seconds. The pressroom has your file. The lede still reads wrong to you. Do you hold?",
      keyAsk: "Do you hold?",
      factors: [
        { label: "To press", value: "00:00:45", tone: "mono", kind: "time" },
        { label: "Last edit · lede", value: "38 sec ago", kind: "metric" },
        { label: "Pressroom · waiting", value: "green", kind: "signal" },
        { label: "Web mirror · ready", value: "hot", kind: "metric" },
        { label: "Newsroom · watching", value: "every chair", kind: "meter" }
      ],
      options: [
        { id: "a", label: "Ship it. The work is sound.", skill: "Trust", score: 8, echo: "You shipped it. Presses rolled. The room breathed with you.", consequence: "The file locks. Presses roll. The room holds its breath with you.", ghost: "Would have been decisive, possibly unchecked.", surprise: "A typo in paragraph nine is a Twitter meme by noon.", insight: "Shipping under time pressure rewards you exactly once. Any visible error in the final file changes the team's work pattern permanently — people cover themselves around YOU, and your speed costs them velocity.", insightNavigate: "After any high-speed ship, run a short debrief: 'What did we miss? What's the new check?' Codifying the fix beats letting everyone adopt their own private belt-and-braces.", stats: [{ label: "YOUR PULSE", change: "steady" }, { label: "PRESSES", change: "rolling" }] },
        { id: "b", label: "Change one word. The right one.", skill: "Precision", score: 12, echo: "You changed one word. The lede clicked.", consequence: "A single keystroke. The lede clicks. Ship.", ghost: "Would have been careful, possibly small.", surprise: "A media critic calls your lede 'the best four sentences this month.'", insight: "Editor fingerprints on great copy are invisible to readers and glaring to the reporter. A single word change you're proud of can land as creative theft to the person whose byline it carries. Reputation for craft is often built on what juniors won't tell you they feel.", insightNavigate: "When you make the key edit, credit it back in conversation: 'Your draft was 95% there — I just clicked the fourth sentence.' Protects the byline's relationship to the work.", stats: [{ label: "LEDE CLICK", change: "audible" }, { label: "EDIT PRECISION", change: "perfect" }] },
        { id: "c", label: "Hold. Kick to web, fix print in run two.", skill: "Caution", score: 3, echo: "You held print. Web went hot. The truck waited.", consequence: "Print holds for forty-five seconds. Web goes hot. The truck waits.", ghost: "Would have been measured, possibly costly.", surprise: "The pressroom foreman is quietly badmouthing you to the publisher.", insight: "The print supply chain has its own politics. People whose names never appear on bylines — foremen, truck drivers, production — talk to executives you'll never meet. Their irritation with editorial becomes an opinion about YOU without you in the room.", insightNavigate: "Walk the press floor a few times a month when there's no emergency. The relationships you bank in calm times are what get you margin in crisis times.", stats: [{ label: "THE TRUCK", change: "engine idling" }, { label: "THE WEB DESK", change: "spiking" }] }
      ]
    }
  ],
  outcome: {
    eyebrow: "Ink dry",
    title: "The trucks pull out. Four decisions. Somewhere a reader is about to open the page.",
    body: "The story isn't the lede — it's how you held the room while the clock ran. Launch logs the texture of your thinking: where you paused, what you prioritized, how you held the pressure."
  },
  reflect: {
    asker: "Your managing editor catches your eye",
    prompt: "Off the record, {name} — why that call? Why not the others?"
  }
};

export const ER_SCENARIO: Scenario = {
  id: "er-resident",
  role: "Chief Resident — Mercy General ER",
  meta: "MASS CASUALTY · +00:06:14 ON THE CLOCK",
  goal: { label: "ALL SAVED", target: 80 },
  opening: {
    eyebrow: "The scenario",
    title: "Three ambulances in seven minutes. One trauma bay. Your attending is still eight floors up.",
    body: "The board lit up at nine-thirteen, Dr. {name}. Since then, the ER has found its rhythm — triage, IVs, shouts over monitors. You are the senior clinician on the floor. The next call you make decides who gets the bay. Every choice from here carries weight that will be counted.",
    imageCaption: "Mercy General · ER · ambulance bay",
    ambient: [
      { label: "INCOMING", value: "3 · en route" },
      { label: "ON CLOCK", timeSeconds: 6 * 60 + 14, timeId: "er-opening-clock" },
      { label: "OR", value: "1 of 4 ready" }
    ]
  },
  steps: [
    {
      kind: "decision", mood: "private", transition: "cross-fade",
      eyebrow: "+00:08 · Bay 3",
      scene: "locker",
      sceneCaption: "Bay 3 curtain, stable for now",
      prompt: "A nineteen-year-old, stable, but his vitals are drifting. He keeps asking for his mother. She's not here yet.",
      keyAsk: "He keeps asking for his mother.",
      factors: [
        { label: "Time on floor", value: "00:08:41", tone: "mono", kind: "time" },
        { label: "Vitals · Bay 3", value: "HR 108 · BP 108/64", kind: "meter" },
        { label: "Attending · ETA", value: "5 min", kind: "metric" },
        { label: "Admin pager", value: "2 new", kind: "signal" },
        { label: "Senior nurse", value: "\"He's watching you.\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "Sit with him. Ninety seconds. Eye contact.", skill: "Empathy", score: 10, echo: "You sat with him. Vitals stabilized. The bay quieted.", consequence: "He slows. Vitals stabilize. The bay quiets.", ghost: "Would have felt human, possibly costly.", surprise: "His mother's a donor's daughter. The chief knows your name by morning.", insight: "Large donors watch how their grandchildren are treated. A ninety-second act of empathy, witnessed by the wrong (right) person, can rewrite your year. Almost nothing in a hospital career is as consequential as who happens to be watching.", insightNavigate: "Assume every moment of care is being witnessed by someone who matters. Not because they are — but because when they are, you won't know it. The habit is the insurance.", stats: [{ label: "HR", change: "108 → 92" }, { label: "BAY VOLUME", change: "quieting" }] },
        { id: "b", label: "Call his mother yourself. Hand him the phone.", skill: "Initiative", score: 12, echo: "You called his mother yourself. His face changed. Monitors steady.", consequence: "She picks up. His face changes. Monitors steady.", ghost: "Would have been kind, possibly delayed.", surprise: "Beautiful reconciliation — and you're in a HIPAA review.", insight: "Medicine's protective rules were built by people who learned, the hard way, what warmth without consent can cost. The most humane act in the room is sometimes the one that routes you into a quarterly review. That's not failure — that's the work.", insightNavigate: "When you feel moved to make an unofficial call on behalf of a patient, document the reason and the consent in real time — even a single charted sentence. It's the difference between a review and a commendation.", stats: [{ label: "HIS FACE", change: "softened" }, { label: "MONITORS", change: "steady" }] },
        { id: "c", label: "Nod, move on. Trust the nurse to hold him.", skill: "Focus", score: 3, echo: "You trusted the nurse. The bay hummed on without you.", consequence: "You step out. The bay hums. Something is saved, something isn't.", ghost: "Would have been efficient, possibly cold.", surprise: "The nurse is telling med students you never ask.", insight: "Nurses narrate residents to the next generation. You're being scripted in tomorrow's orientations by what you did with the person you trusted today. Every 'trust' without acknowledgement reads, in replay, as dismissal.", insightNavigate: "If you lean on a nurse's judgment, say so before you walk away: 'I'm trusting you on this — tell me if it turns.' Converts invisible delegation into visible respect, which is what actually travels.", stats: [{ label: "YOU", change: "have room to think" }, { label: "HIS DRIFT", change: "hard to read" }] }
      ]
    },
    {
      kind: "decision", mood: "tense", transition: "whip-pan",
      eyebrow: "+00:13 · Triage board",
      scene: "whiteboard",
      sceneCaption: "Board lit, three in the bay",
      prompt: "Three patients incoming, one OR free. Head trauma, pregnant chest pain, pediatric burn. The trauma surgeon is scrubbed and asks you to pick.",
      keyAsk: "asks you to pick",
      factors: [
        { label: "Time on floor", value: "00:13:22", tone: "mono", kind: "time" },
        { label: "OR · ready", value: "1 (of 4)", kind: "metric" },
        { label: "Trauma surgeon", value: "scrubbed, waiting", kind: "signal" },
        { label: "Vitals · incoming 2", value: "HR 132 · SpO2 91", kind: "meter" },
        { label: "Attending · ETA", value: "2 min", kind: "metric" }
      ],
      options: [
        { id: "a", label: "Head trauma first. Golden hour.", skill: "Judgment", score: 10, echo: "You took the head trauma. Team rolled. The other two held.", consequence: "Team rolls. The board reshuffles. The other two hold.", ghost: "Would have been textbook, possibly narrow.", surprise: "Textbook call. The chief files you under 'safe hands.' (That's not good.)", insight: "Textbook calls are career-correct and reputation-flat. Attendings at the top of competitive subspecialties are often looking for evidence of the one unusual call, not the ten right ones. You were right — and forgettable.", insightNavigate: "When you make the textbook call, articulate your thinking in a note or a quick debrief — show the calculus. The visible reasoning is what differentiates you, not the outcome.", stats: [{ label: "THE GOLDEN HOUR", change: "caught" }, { label: "THE OR", change: "ready in twelve" }] },
        { id: "b", label: "Pregnant chest pain. Two lives.", skill: "Ethics", score: 12, echo: "You chose the pregnant chest pain. Surgeon hesitated, then agreed.", consequence: "Surgeon hesitates a beat, then agrees. The team pivots.", ghost: "Would have been principled, possibly slower.", surprise: "The patient's husband is a journalist. He's writing a piece about you.", insight: "Ethical calls that travel outside the hospital become institutional PR. The hospital will absorb your name into its narrative whether you want it to or not. Good ethics in public turn into branding materials behind closed doors.", insightNavigate: "If a decision you make becomes public, reach out proactively to communications before they reach out to you. Shape the frame — or lose it.", stats: [{ label: "TWO LIVES", change: "stabilized" }, { label: "SURGEON PACE", change: "adjusted" }] },
        { id: "c", label: "Pediatric burn — airway risk rising.", skill: "Triage", score: 10, echo: "You prioritized the pediatric burn. A nurse nodded. The room moved.", consequence: "You call it. A nurse nods once. The room moves.", ghost: "Would have been sharp, possibly unpopular.", surprise: "The scrubbed surgeon is quietly furious. You won't hear about it for a year.", insight: "OR politics are territorial. A triage call against a scrubbed surgeon's expectation reads to them as a judgment about their readiness — even when it's about the patient. Professional pride is rarely voiced and almost always acts.", insightNavigate: "When your call reshapes a scrubbed surgeon's plan, find them after and frame it as a request, not a correction: 'I leaned on your read — thank you for holding.' Costs nothing.", stats: [{ label: "THE AIRWAY", change: "secured" }, { label: "YOUR TEAM", change: "moving with you" }] }
      ]
    },
    {
      kind: "decision", mood: "loud", transition: "iris-in",
      eyebrow: "+00:21 · Family corridor",
      scene: "press",
      sceneCaption: "Family corridor, relatives pressing in",
      prompt: "The family of victim four is here. Three people asking at once: 'Dr. {name}, is he going to be okay?' Your hands still smell like gloves. What do you say first?",
      keyAsk: "is he going to be okay?",
      factors: [
        { label: "Time on floor", value: "00:21:05", tone: "mono", kind: "time" },
        { label: "Family · present", value: "3 · asking over each other", kind: "meter" },
        { label: "Chaplain · ETA", value: "4 min", kind: "signal" },
        { label: "Bay 4 · monitors", value: "stable · critical", kind: "live" },
        { label: "Social worker", value: "\"They need a name.\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "\"He's alive. He's in good hands. I'll be back in ten.\"", skill: "Composure", score: 10, echo: "You said three sentences, clean. The corridor steadied.", consequence: "Three sentences. Clean. The corridor steadies around them.", ghost: "Would have been calm, possibly clipped.", surprise: "The family wrote a letter naming you. Peers are suddenly jealous.", insight: "Peers bristle at the colleague who makes the hard thing look simple — because it implies THEY made it harder. Recognition for composure often carries a cost in the team room that no one articulates.", insightNavigate: "When you're publicly praised, find a way to spread the glow: 'The nurses and the chaplain are the reason that corridor stayed steady, not me.' Peer envy is manageable, but only if you manage it.", stats: [{ label: "THE CORRIDOR", change: "exhaling" }, { label: "YOUR TEMPO", change: "unbroken" }] },
        { id: "b", label: "\"I'm his doctor. Walk me through what happened.\"", skill: "Framing", score: 8, echo: "You listened for a minute. Learned two things.", consequence: "You step in. They talk. You listen for sixty seconds — and learn two things.", ghost: "Would have been generous, possibly slow.", surprise: "Residents are copying you — badly. Complaints are rising.", insight: "When you model a skill that looks easy but ISN'T, colleagues imitate the shape without the substance. Your success becomes an accidental standard that others aren't ready for, and the failure rate rises in a way you didn't intend.", insightNavigate: "If you pioneer a practice that works, teach it with the 'how' — not just the 'what.' A five-minute walkthrough prevents six months of copycats stumbling.", stats: [{ label: "YOU", change: "learned two things" }, { label: "THE CORRIDOR", change: "settling" }] },
        { id: "c", label: "\"Someone will be out. I have to go.\"", skill: "Discipline", score: -3, echo: "You said \"someone will be out.\" The chaplain stepped in late.", consequence: "You move. The corridor stays hungry. The chaplain steps in late.", ghost: "Would have been controlled, possibly hard.", surprise: "The chaplain just got your whole cohort assigned mandatory training.", insight: "Chaplains, social workers, and pastoral staff talk to directors you never meet. Their feedback doesn't get attributed but it shapes curriculum and reputation for years. Silence costs nothing to you in the moment and everything to the cohort that follows.", insightNavigate: "Even when you can't stay, NAME the reason you're leaving and WHO'S coming: 'I have to go — I'm heading to a code. The chaplain is two minutes away.' The handoff is the respect.", stats: [{ label: "THE CHAPLAIN", change: "three minutes late" }, { label: "THE CORRIDOR", change: "hungry for answers" }] }
      ]
    },
    {
      kind: "decision", mood: "reflective", transition: "slow-zoom",
      eyebrow: "+00:34 · Decision point",
      scene: "court",
      sceneCaption: "Two bays, two monitors, one you",
      prompt: "Two patients crashing, one you. The fellow can take one. You pick the other.",
      keyAsk: "You pick the other.",
      factors: [
        { label: "Time on floor", value: "00:34:00", tone: "mono", kind: "time" },
        { label: "Bay 2 · vitals", value: "HR 148 · BP 82/54", kind: "meter" },
        { label: "Bay 5 · vitals", value: "HR 122 · SpO2 88", kind: "meter" },
        { label: "Fellow · ready", value: "scrubbed", kind: "signal" },
        { label: "Attending · floor", value: "just arrived", kind: "metric" }
      ],
      options: [
        { id: "a", label: "Bay 2. Lower pressure, more time lost.", skill: "Judgment", score: 8, echo: "You took Bay 2. The team followed your pace across the hall.", consequence: "You cross the hall. The team follows your pace.", ghost: "Would have been reasoned, possibly conservative.", surprise: "Your fellow is writing a newsletter piece: 'The case the chief didn't take.'", insight: "Junior physicians narrate the moments they saw you hesitate. A reasonable delegation reads, to them, as their own breakout moment — and their storytelling becomes the reputation you didn't mean to have.", insightNavigate: "When you delegate a crashing bay, close the loop publicly: debrief the case in rounds next morning, thank the fellow, own your reasoning. You wrote the story. Make sure it's the one the department reads.", stats: [{ label: "YOUR PACE", change: "matched" }, { label: "BAY 5", change: "fellow on it" }] },
        { id: "b", label: "Bay 5. Airway compromise frightens you more.", skill: "Instinct", score: 12, echo: "You took Bay 5 — airway first. Two teams, one tempo.", consequence: "You take airway. The fellow takes pressure. Two teams, one tempo.", ghost: "Would have been instinctive, possibly reactive.", surprise: "Your fellow just quoted you in her fellowship interview.", insight: "Acts of trust during a crisis get described as mentorship in later recruiting cycles. Your instinct in the moment becomes someone else's career story. The ripple is inter-institutional — and you don't get to edit it.", insightNavigate: "When you delegate successfully to a fellow or resident, make sure they hear you credit them back in the debrief. The phrasing they'll reuse for years often comes from what you said in the ten minutes after.", stats: [{ label: "AIRWAY", change: "secured fast" }, { label: "TWO TEAMS", change: "in sync" }] },
        { id: "c", label: "Hold position. Brief the attending. Let them choose.", skill: "Humility", score: 10, echo: "You briefed the attending. Took Bay 2 with fresh eyes.", consequence: "You pause. The attending takes Bay 5. You take Bay 2 with fresh eyes.", ghost: "Would have been humble, possibly hesitant.", surprise: "The attending sponsors you. Your peers just cut you out of dinner.", insight: "Deference that lands with the right senior pays dividends they design themselves. But peer politics punish obvious ascent through seniors, not through peers. You'll gain altitude and lose the flat ground at the same time.", insightNavigate: "When a senior sponsors you, find a small and visible way to sponsor a peer in turn the same week. The ledger of favours in a department is watched more closely than almost anyone admits.", stats: [{ label: "FRESH EYES", change: "applied" }, { label: "ATTENDING", change: "confident" }] }
      ]
    }
  ],
  outcome: {
    eyebrow: "Shift end",
    title: "The floor quiets. Four decisions. Somewhere a family is writing thank-you notes in their head.",
    body: "What matters isn't what you charted — it's how you held the clock, the room, the calls. Launch logs the texture of your thinking: where you paused, what you prioritized, how you held the pressure."
  },
  reflect: {
    asker: "The attending steps beside you",
    prompt: "Walk me through your read, Dr. {name}. Why that call, and not the others?"
  }
};

export const FOUNDER_SCENARIO: Scenario = {
  id: "startup-founder",
  role: "Founder · CEO — AeroLabs",
  meta: "BOARD MEETING · IN 00:45:00 · RUNWAY · 6 WEEKS",
  goal: { label: "BRIDGE SECURED", target: 75 },
  opening: {
    eyebrow: "The scenario",
    title: "Runway is six weeks. The board meets in forty-five minutes. Your co-founder wants out.",
    body: "You've been in this office since four, {name}. Your deck has three different slide fives. Your engineering lead is on a plane. A journalist is waiting on a callback. Every choice from here decides whether the company exists in October.",
    imageCaption: "AeroLabs · HQ · conference room",
    ambient: [
      { label: "RUNWAY", value: "6 WEEKS" },
      { label: "TO BOARD", timeSeconds: 45 * 60, timeId: "clock-Board meeting in" },
      { label: "BURN", value: "$380K/MO" }
    ]
  },
  steps: [
    {
      kind: "decision", mood: "private", transition: "cross-fade",
      eyebrow: "00:41 · Back office",
      scene: "locker",
      sceneCaption: "Back office, two chairs, one mug",
      prompt: "Your co-founder sits down. She says, 'I don't think I can do this anymore.' The board doesn't know.",
      keyAsk: "I don't think I can do this anymore.",
      factors: [
        { label: "Board meeting in", value: "00:41:08", tone: "mono", kind: "time" },
        { label: "Runway", value: "6 weeks · tight", kind: "meter" },
        { label: "Payroll · next", value: "12 days", kind: "metric" },
        { label: "Lead investor", value: "calling at :30", kind: "signal" },
        { label: "Co-founder", value: "\"I'm done.\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "Stop everything. Sit with her.", skill: "Empathy", score: 5, echo: "You closed the laptop. She exhaled. The deck waits.", consequence: "You close the laptop. She exhales. The deck waits.", ghost: "Would have felt human, possibly costly.", surprise: "She's emailing the board tonight. About how great you are.", insight: "Exiting co-founders control a narrative their replacements never will. How you treat her in her last week buys or burns the capital of everyone she'll email after. Relationship triangulation runs through the person leaving, not the one staying.", insightNavigate: "When a co-founder is heading out, prioritize their dignity over your deck. The week after is when they write the letters that define your next year.", stats: [{ label: "HER EXHALE", change: "audible" }, { label: "DECK TIMER", change: "paused" }] },
        { id: "b", label: "Ask her to stay through the meeting. Talk after.", skill: "Judgment", score: 12, echo: "You asked her to stay through the meeting. She nodded.", consequence: "She nods once. The meeting has two of you. For now.", ghost: "Would have been pragmatic, possibly delaying.", surprise: "She resigned overnight. On Twitter. Warmly.", insight: "Asking someone to hold a performance delays their agency — and the compressed agency erupts as a more public exit than it would have been otherwise. The pragmatic ask produces the unpragmatic departure. Founder breakups follow Newton's third law almost exactly.", insightNavigate: "If you must ask a co-founder to hold a moment, co-write the exit communication with them in advance of the meeting, not after. Give them somewhere to put the feeling that isn't public.", stats: [{ label: "HER NOD", change: "cautious" }, { label: "MEETING CAST", change: "intact" }] },
        { id: "c", label: "Tell her you'll announce it. Rip the plaster.", skill: "Directness", score: -8, echo: "You said you'd announce it. She went pale. You meant it.", consequence: "She goes pale. You mean it. The board meeting just changed shape.", ghost: "Would have been bold, possibly reckless.", surprise: "She beat you to LinkedIn. You're the villain now.", insight: "Announcements of other people's departures are almost never yours to make. People with something to say about their own lives will use the internet before they use your stage. Trying to control the narrative is how you lose it.", insightNavigate: "If a co-founder is leaving, let them own the announcement entirely — in fact, offer to help draft it. You'll end up with softer language than any unilateral act could have produced.", stats: [{ label: "HER PALLOR", change: "visible" }, { label: "BOARD SHAPE", change: "changed" }] }
      ]
    },
    {
      kind: "decision", mood: "tense", transition: "whip-pan",
      eyebrow: "00:28 · Strategy",
      scene: "whiteboard",
      sceneCaption: "Whiteboard, three lines of burn",
      prompt: "Three cost cuts on the board. Hiring freeze, cut the hardware program, or halve salaries. Pick what you'll propose.",
      keyAsk: "Pick what you'll propose.",
      factors: [
        { label: "Board meeting in", value: "00:28:12", tone: "mono", kind: "time" },
        { label: "Burn rate · current", value: "$380k/mo", kind: "metric" },
        { label: "Hardware · in flight", value: "3 quarters in", kind: "metric" },
        { label: "TechCrunch · buzz", value: "whisper · 600/hr", kind: "live" },
        { label: "Chief of staff", value: "leans: freeze", kind: "signal" }
      ],
      options: [
        { id: "a", label: "Kill the hardware program. Clean cut.", skill: "Courage", score: 8, echo: "You killed the hardware program. Twelve months died in a sentence.", consequence: "Twelve months of work dies in a sentence. The room reshapes around it.", ghost: "Would have been bold, possibly final.", surprise: "Your head of hardware accepted. Then rewrote the story six weeks later.", insight: "Senior leaders you cut rarely contradict you publicly — they rewrite history in frame-specific ways that land in places you can't control. The sentence ending a program is rarely the last word on it.", insightNavigate: "When you end a senior's work, co-author their next narrative. Offer a reference letter the same week. Dignity buys silence.", stats: [{ label: "TWELVE MONTHS", change: "ended" }, { label: "ROOM SHAPE", change: "reset" }] },
        { id: "b", label: "Hiring freeze + halve my own salary.", skill: "Integrity", score: 12, echo: "You cut your own salary, then froze hiring. The team heard the salary first.", consequence: "The team hears about the salary before the freeze. The room leans in.", ghost: "Would have been symbolic, possibly slow.", surprise: "A senior engineer matched your pay cut. It's semi-viral.", insight: "Leadership integrity under duress seeds recruiting you didn't pay for. The team's response to visible sacrifice is often worth more than the sacrifice itself — but only if they believe it wasn't theatrical.", insightNavigate: "If you cut your salary, keep quiet about it. Let the discovery happen. Announced sacrifice reads as PR; discovered sacrifice reads as character.", stats: [{ label: "THE TEAM", change: "reads integrity" }, { label: "THE ROOM", change: "leaning in" }] },
        { id: "c", label: "Pull forward the fundraise. Propose a bridge.", skill: "Strategy", score: 10, echo: "You pulled forward the fundraise. The board leaned in.", consequence: "You open a new slide. It's clean. The board leans forward.", ghost: "Would have been inventive, possibly optimistic.", surprise: "Your lead investor just heard you're shopping. They're gone.", insight: "VC ecosystems are more territorial than they look. A bridge conversation your current lead hasn't pre-blessed reads as shopping — and shopping is the fastest way to lose the person who was going to save you.", insightNavigate: "When you pull forward a round, tell your current lead BEFORE the board. They need to feel first-called, even if the board technically votes. The hierarchy of feelings is never in the cap table.", stats: [{ label: "YOUR NEW SLIDE", change: "landing clean" }, { label: "THE BOARD", change: "leaning forward" }] }
      ]
    },
    {
      kind: "decision", mood: "loud", transition: "iris-in",
      eyebrow: "00:14 · Journalist call",
      scene: "press",
      sceneCaption: "Corner office, phone on speaker",
      prompt: "A journalist calls. '{name}, we're running a story on AeroLabs running out of runway. Comment by six?' Fourteen minutes to board.",
      keyAsk: "Comment by six?",
      factors: [
        { label: "Board meeting in", value: "00:14:33", tone: "mono", kind: "time" },
        { label: "Story · filed time", value: "18:00", kind: "metric" },
        { label: "Slack · leadership", value: "8 DMs unread", kind: "signal" },
        { label: "Twitter · @AeroLabs", value: "mentions +220%", kind: "live" },
        { label: "Journalist", value: "\"Is it true?\"", kind: "quote" }
      ],
      options: [
        { id: "a", label: "\"We're on a tight quarter. We're building through it.\"", skill: "Composure", score: 10, echo: "You said \"tight quarter, building through it.\" She wrote it down.", consequence: "Eleven words. Clean. She writes it down.", ghost: "Would have been calm, possibly curt.", surprise: "An analyst wrote a post about your 'poise.' VCs are DMing you.", insight: "Measured public quotes become reference material for strangers. The journalist's story isn't the only story — the secondary commentary from adjacent voices is often the one that reaches the people you care about most.", insightNavigate: "When you give a restrained quote, assume secondary audiences will rewrite it into their own frames. Keep your words tight enough that any frame still works.", stats: [{ label: "HER NOTEBOOK", change: "eleven clean words" }, { label: "YOUR EXPOSURE", change: "barely any" }] },
        { id: "b", label: "\"Off the record — here's our actual plan.\"", skill: "Framing", score: 5, echo: "You went off the record. She stopped typing to listen.", consequence: "You open the new slide on the phone. She stops typing, listens.", ghost: "Would have been candid, possibly reckless.", surprise: "Her editor reassigned the story. The replacement is writing it harsher.", insight: "'Off the record' is a two-person agreement in an institution designed to surface information. Journalists can hold confidence. Their editors have different incentives and different job descriptions. Know where the confidence actually ends.", insightNavigate: "If you go off the record, get the editor on the call too — or don't go off. The reporter alone isn't a binding channel at most publications.", stats: [{ label: "SHE", change: "stopped typing to listen" }, { label: "YOUR LEVERAGE", change: "on shaky ground" }] },
        { id: "c", label: "\"No comment until after the board.\"", skill: "Discipline", score: 3, echo: "You said no comment. The story wrote itself without you.", consequence: "You hang up. The story writes itself without you in it.", ghost: "Would have been controlled, possibly louder in print.", surprise: "Your IR contact just used you as a cautionary tale over lunch.", insight: "Investor gossip is slow, quiet, and devastating. The real audience for your silence isn't readers — it's the analyst who watches how you behave under mild pressure, and decides whether you can handle harder pressure later. 'No comment' reads as fragility to people who will never tell you.", insightNavigate: "Even 'no comment' moments deserve a two-sentence briefing to your investors BEFORE the story lands. Owning the context privately is always cheaper than being characterized without it.", stats: [{ label: "STORY VACUUM", change: "+1" }, { label: "YOUR CONTROL", change: "held" }] }
      ]
    },
    {
      kind: "decision", mood: "reflective", transition: "slow-zoom",
      eyebrow: "00:00:30 · Board room",
      scene: "court",
      sceneCaption: "Board room, five faces, one slide",
      prompt: "Thirty seconds to slide five. The lead partner asks: 'What do you actually need from us today?' What do you say?",
      keyAsk: "What do you actually need from us today?",
      factors: [
        { label: "Until you speak", value: "00:00:30", tone: "mono", kind: "time" },
        { label: "Board · in room", value: "5 of 5", kind: "metric" },
        { label: "Lead partner", value: "waiting, pen down", kind: "signal" },
        { label: "Bridge ask · drafted", value: "$2.4M · 9 months", kind: "metric" },
        { label: "Room temperature", value: "quiet, attentive", kind: "meter" }
      ],
      options: [
        { id: "a", label: "\"A bridge. Nine months. Here's what it buys.\"", skill: "Clarity", score: 12, echo: "You asked for a bridge. Nine months. The room leaned forward.", consequence: "One sentence. Pen lifts. The room leans forward.", ghost: "Would have been direct, possibly spare.", surprise: "The board loved it. Your senior board member feels skipped. Cold war starting.", insight: "Senior board members often value their identity as counselor more than their equity. Clarity can paradoxically threaten the people who were going to steady you, because it bypasses the moment they were waiting to be useful in.", insightNavigate: "Even when you know the answer, leave space for the senior voice in the room to ask the question. Pre-rehearse your clarity, then let them extract it. Their pride is worth the thirty seconds.", stats: [{ label: "THE ROOM", change: "leaning forward" }, { label: "A PEN", change: "lifting off the page" }] },
        { id: "b", label: "\"I need your help rethinking the next twelve months.\"", skill: "Humility", score: 8, echo: "You asked for their help. Three people straightened. The tone shifted.", consequence: "Three people straighten. One nods. The tone shifts.", ghost: "Would have been open, possibly unclear.", surprise: "The board is now co-designing your roadmap. Your operators are ready to quit.", insight: "Asking investors to help with 'rethinking' is a door that doesn't close on its own. They are wired to lean in, and once they do, their involvement calcifies. Humility can inadvertently invite operational entanglement that costs you the team you built for autonomy.", insightNavigate: "If you ask for help, narrow the scope in the same breath: 'I need your help on the pricing thesis — nothing else yet.' Frames their contribution as finite.", stats: [{ label: "THREE PEOPLE", change: "straightening up" }, { label: "THE TONE", change: "audibly shifting" }] },
        { id: "c", label: "\"Permission to cut hard and ship by Q2.\"", skill: "Resolve", score: 10, echo: "You asked for permission to cut hard. They leaned in.", consequence: "Permission is not what they expected to give. They lean in.", ghost: "Would have been steely, possibly narrowing.", surprise: "Your head of people drafted her resignation. You find out Monday.", insight: "Boardroom language is a different dialect from operator language. 'Cut hard' in a board deck means 'disciplined.' 'Cut hard' in a people team's Slack means 'be afraid.' What survives the translation depends on who you brief first.", insightNavigate: "The minute you leave a board meeting where you used sharp language, send a note to your head of people paraphrasing it in their dialect before someone else does.", stats: [{ label: "THE BOARD", change: "caught off guard" }, { label: "THE ROOM", change: "pulled toward you" }] }
      ]
    }
  ],
  outcome: {
    eyebrow: "Meeting over",
    title: "The room empties. Four decisions. Somewhere, an LP is updating their notes on you.",
    body: "The company's future isn't in the bridge — it's in the shape of how you decided. Launch logs the texture of your thinking: where you paused, what you prioritized, how you held the pressure."
  },
  reflect: {
    asker: "Your chief of staff keeps pace with you",
    prompt: "{name} — real talk. Why that one? Why not the others?"
  }
};

// Per-option reaction colour — hand-matched to the content of each surprise.
// Good outcomes rotate through fluoro green / gold / magenta / cyan / mint.
// Bad outcomes rotate crimson / orange-red / hot-pink. Mixed outcomes get amber.
export const REACTION_COLORS: Record<string, Array<Record<string, string>>> = {
  "lakers-coach": [
    { a: "#39ff14", b: "#ffd24a", c: "#dc143c" },
    { a: "#39ff14", b: "#50e3c2", c: "#ff4de3" },
    { a: "#ffd24a", b: "#ff4de3", c: "#dc143c" },
    { a: "#ffaa33", b: "#5dd3ff", c: "#ffd24a" }
  ],
  "sephora-lead": [
    { a: "#39ff14", b: "#50e3c2", c: "#ff4500" },
    { a: "#ffaa33", b: "#ffd24a", c: "#ff3b9a" },
    { a: "#5dd3ff", b: "#ff4de3", c: "#dc143c" },
    { a: "#39ff14", b: "#ffaa33", c: "#ffd24a" }
  ],
  "newsroom-editor": [
    { a: "#ffd24a", b: "#ffaa33", c: "#dc143c" },
    { a: "#dc143c", b: "#ff4500", c: "#5dd3ff" },
    { a: "#ffd24a", b: "#ffaa33", c: "#39ff14" },
    { a: "#ff3b9a", b: "#ffd24a", c: "#ff4500" }
  ],
  "er-resident": [
    { a: "#ffd24a", b: "#ffaa33", c: "#ff4500" },
    { a: "#ffaa33", b: "#ffd24a", c: "#dc143c" },
    { a: "#39ff14", b: "#ffaa33", c: "#ff3b9a" },
    { a: "#ff4500", b: "#ffd24a", c: "#ffaa33" }
  ],
  "startup-founder": [
    { a: "#5dd3ff", b: "#ffaa33", c: "#dc143c" },
    { a: "#ff4500", b: "#ff4de3", c: "#dc143c" },
    { a: "#ffd24a", b: "#ff4500", c: "#ff3b9a" },
    { a: "#ffaa33", b: "#ff4500", c: "#dc143c" }
  ]
};

export const SCENARIOS: Scenario[] = [
  LAKERS_SCENARIO,
  SEPHORA_SCENARIO,
  NEWSROOM_SCENARIO,
  ER_SCENARIO,
  FOUNDER_SCENARIO,
]

export function pickRandomScenario(excludeId?: string): Scenario {
  const pool = SCENARIOS.filter((s) => !excludeId || s.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getSampleScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id)
}

export function pickRandomSampleScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
}

const TITLE_TO_SAMPLE: Array<{ keywords: string[]; scenario: Scenario }> = [
  { keywords: ['lakers', 'basketball', 'head coach', 'nba'], scenario: LAKERS_SCENARIO },
  { keywords: ['sephora', 'fenty', 'beauty retail'], scenario: SEPHORA_SCENARIO },
  { keywords: ['newsroom', 'editor', 'standard'], scenario: NEWSROOM_SCENARIO },
  { keywords: ['founder', 'startup', 'seed'], scenario: FOUNDER_SCENARIO },
  { keywords: ['er resident', 'er ', 'hospital', 'triage'], scenario: ER_SCENARIO },
]

export function pickScenarioForTitle(title: string, _description?: string): Scenario {
  const haystack = (title || '').toLowerCase()
  for (const entry of TITLE_TO_SAMPLE) {
    if (entry.keywords.some((k) => haystack.includes(k))) return entry.scenario
  }
  return pickRandomSampleScenario()
}

/* Hex to "r,g,b" — used to set the --tone CSS var from a hex reaction colour. */
export function hexToRgbTriple(hex?: string): string {
  if (!hex || typeof hex !== 'string') return '233,228,214'
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r},${g},${b}`
}
