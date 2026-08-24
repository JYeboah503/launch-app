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
          effects: { score: 4, stream: 'groms', status: 'underway' },
        },
        {
          id: 'group-post',
          label: 'Post the form link in the club group and hope.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Six forms roll in, three parents ask questions the post already answers, and then Kylie rings YOU: "Why didn\'t you just ask me, love?"',
          to: 'groms-call',
          effects: { score: -2, stream: 'groms', status: 'underway' },
        },
        {
          id: 'door-knock',
          label: 'Catch the stragglers in person at Thursday training.',
          skill: 'Leadership & Influence',
          response:
            'Face to face works — forms get signed on car bonnets. Kylie finds you mid-lap with the last three names.',
          to: 'groms-call',
          effects: { score: 3, stream: 'groms', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'dig-foamies',
          label: 'Shed working bee Thursday after training — foamies out, fins checked, one board per grom.',
          skill: 'Leadership & Influence',
          response:
            'Four dads, one snake scare, nine foamies. Every first-timer gets a board with their name chalked on it. Entries: ALL IN.',
          to: 'HUB',
          effects: { stream: 'groms', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'borrow-some',
          label: 'Ask the older kids to lend their spares for the day.',
          skill: 'Emotional Intelligence',
          response:
            'Five spares appear — enough, barely, if heats share. Generous, wobbly, workable. Entries: in, with crossed fingers.',
          to: 'HUB',
          effects: { stream: 'groms', status: 'sorted', days: 1, score: 3 },
        },
        {
          id: 'their-problem',
          label: '"Boards are a family problem — the form says BYO."',
          skill: 'Judgement & Decision-Making',
          response:
            "Technically true. Thursday, two mums quietly withdraw their kids rather than say they don't own boards. The list is shorter and lighter than it should be.",
          to: 'HUB',
          effects: { stream: 'groms', status: 'shaky', days: 1, score: -6 },
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
          effects: { score: 4, stream: 'safety', status: 'underway' },
        },
        {
          id: 'club-parents',
          label: 'Line up the strongest club parents as water cover — keep it in-house.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Strong swimmers, no rescue gear, no radios. You write the plan down, read it back, and ring Baz anyway.',
          to: 'safety-call',
          effects: { score: 0, stream: 'safety', status: 'underway' },
        },
        {
          id: 'later-safety',
          label: 'The bank’s been mellow all month — sort safety closer to the day.',
          skill: 'Self-direction',
          response:
            "Mellow for the seniors. You watch a grom get rag-dolled on a two-footer at training and dial Baz from the sand.",
          to: 'safety-call',
          effects: { score: -3, stream: 'safety', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'take-terms',
          label: 'Take the terms whole: rebuild the schedule inside 7–11, feed the crews like kings.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'You redraw the runsheet that night around the tide, not your preferences. Baz texts back one word: "Sensible." Safety: LOCKED, in writing.',
          to: 'HUB',
          effects: { stream: 'safety', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'half-window',
          label: 'Negotiate: heats till noon — the forecast tide looks slow this week.',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"The forecast doesn\'t swim, mate." Baz gives you till 11:30 and makes you sign the risk line yourself. Safety: covered, with a pen-shaped memory.',
          to: 'HUB',
          effects: { stream: 'safety', status: 'sorted', days: 2, score: 2 },
        },
        {
          id: 'parents-only',
          label: '"We\'ll manage in-house — club parents on boards. Thanks anyway."',
          skill: 'Judgement & Decision-Making',
          response:
            "A long pause. \"Your comp.\" No IRBs, no tower, and every parent on the beach Saturday will be doing your risk assessment with their eyes.",
          to: 'HUB',
          effects: { stream: 'safety', status: 'shaky', days: 1, score: -7 },
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
          effects: { score: 4, stream: 'heats', status: 'underway' },
        },
        {
          id: 'age-only',
          label: 'Straight age divisions — objective, defensible, done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Clean on paper. Then you watch training: a tiny 13-year-old sharing water with kids twice her weight. You take the draft to Deano.',
          to: 'heats-call',
          effects: { score: 1, stream: 'heats', status: 'underway' },
        },
        {
          id: 'random-draw',
          label: 'Random draw out of a bucket — fair’s fair.',
          skill: 'Self-direction',
          response:
            'The bucket has no idea what it\'s doing. Heat two is three first-timers and the club champion. Deano suggests, gently, a phone call.',
          to: 'heats-call',
          effects: { score: -3, stream: 'heats', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'mates-heat',
          label: 'Put Ruby-Rose with her mates and balance the OTHER heats around it.',
          skill: 'Emotional Intelligence',
          response:
            'The draw bends around one nervous kid, and no one will ever know. Deano inks the board: "That\'s comp directing, that is." Heats: DRAWN.',
          to: 'HUB',
          effects: { stream: 'heats', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'fair-is-fair',
          label: 'Keep the balanced draw — one kid can’t bend the format.',
          skill: 'Integrity & Ethics',
          response:
            'Defensible. On the day, heat four runs one grom short and everyone on the sand knows exactly which car she\'s in. Heats: drawn, with a hollow spot.',
          to: 'HUB',
          effects: { stream: 'heats', status: 'sorted', days: 1, score: -4 },
        },
        {
          id: 'ask-her',
          label: 'Ring Ruby-Rose’s mum and ask what would actually help.',
          skill: 'Leadership & Influence',
          response:
            '"Just put her with Sasha. And don\'t make a thing of it." Done and done. Sometimes the answer is one question away. Heats: drawn.',
          to: 'HUB',
          effects: { stream: 'heats', status: 'sorted', days: 1, score: 5 },
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
          effects: { score: 4, stream: 'beach', status: 'underway' },
        },
        {
          id: 'do-it-yourself',
          label: 'Sketch the layout yourself tonight — it’s just tents and flags.',
          skill: 'Self-direction',
          response:
            "Your sketch is good. Your arms are two. You price out the 5am solo build, swallow, and ring Mrs Chen.",
          to: 'beach-call',
          effects: { score: 0, stream: 'beach', status: 'underway' },
        },
        {
          id: 'morning-of',
          label: 'Wing the setup on the morning — beaches are self-explanatory.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'You picture forty parents, no shade, and a PA in a puddle at 6:45am. The picture rings Mrs Chen for you.',
          to: 'beach-call',
          effects: { score: -3, stream: 'beach', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'accept-army',
          label: 'Done and done — dune viewing, roped judge zone, and you find a Year 9 who loves a microphone.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Saturday, 7:40am: a tent village stands, parents perch happily on the dune, and the Year 9 on the PA is already doing nicknames. Beach: BUILT.',
          to: 'HUB',
          effects: { stream: 'beach', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'tents-only',
          label: 'Take the marquees, skip the viewing rules — parents will stand where they stand.',
          skill: 'Judgement & Decision-Making',
          response:
            'The village goes up. By heat three there\'s a dad at the judges\' shoulder narrating scores. Mrs Chen looks at you across the sand. Beach: built, leaky.',
          to: 'HUB',
          effects: { stream: 'beach', status: 'sorted', days: 2, score: 1 },
        },
        {
          id: 'trevor',
          label: '"Trevor’s already offered to do the PA, though. It’d be rude to un-ask him."',
          skill: 'Emotional Intelligence',
          response:
            'Mrs Chen goes very quiet. Trevor opens the comp with a nineteen-minute anecdote about 1987. Kind decision, long morning. Beach: built, with commentary.',
          to: 'HUB',
          effects: { stream: 'beach', status: 'shaky', days: 2, score: -4 },
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
          effects: { score: 4, stream: 'prizes', status: 'underway' },
        },
        {
          id: 'buy-cheap',
          label: 'Spend the $180 on medals and call it done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Medals ordered. It works, thinly — and then Tina calls the club: "Why didn\'t anyone ASK me about the grom comp?"',
          to: 'prizes-call',
          effects: { score: 0, stream: 'prizes', status: 'underway' },
        },
        {
          id: 'skip-prizes',
          label: 'Kids surf for the love of it — skip prizes, save the money.',
          skill: 'Self-direction',
          response:
            "They do surf for love. They also count trophies like dragons count gold. Deano forwards you Tina's number without comment.",
          to: 'prizes-call',
          effects: { score: -3, stream: 'prizes', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'podium-moment',
          label: 'Build a whole first-timers podium moment into the schedule — every name, full PA, photos.',
          skill: 'Emotional Intelligence',
          response:
            'You put it in the runsheet as its own event. Eight kids are about to hear a beach cheer their name. Prizes: SORTED — better than sorted.',
          to: 'HUB',
          effects: { stream: 'prizes', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'take-quietly',
          label: 'Take the deal, but keep the ceremony short — the tide window is tight.',
          skill: 'Judgement & Decision-Making',
          response:
            'Fair call on a tight day. Tina trims the vouchers to podium-only and half the magic goes with it. Prizes: sorted, standard.',
          to: 'HUB',
          effects: { stream: 'prizes', status: 'sorted', days: 1, score: 2 },
        },
        {
          id: 'counter-cash',
          label: 'Counter: "Could we do cash for the club instead of vouchers?"',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"I sell surf gear, love, not sponsorships." The eyebrow comes down. You keep the trophies and lose the shine. Prizes: covered, coolly.',
          to: 'HUB',
          effects: { stream: 'prizes', status: 'shaky', days: 1, score: -4 },
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
          effects: { score: 8, days: 1 },
        },
        {
          id: 'run-as-drawn',
          label: 'Run it as drawn — groms are tougher than their parents think.',
          skill: 'Self-direction',
          response:
            'Some are. Two aren\'t: heat one ends with a rescue-adjacent paddle assist and a mum you\'ll be apologising to for a season.',
          to: 'finale',
          effects: { score: -5 },
        },
        {
          id: 'delay-decide',
          label: 'Decide at 6am on the sand with Baz.',
          skill: 'Judgement & Decision-Making',
          response:
            'Defensible — but 6am decisions ripple: heats redrawn on the fly, parents told nothing overnight, and twenty minutes of your window gone to a huddle.',
          to: 'finale',
          effects: { score: 2 },
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
          effects: { score: 4, days: 1 },
        },
        {
          id: 'strong-dads',
          label: 'Send the two strongest dads out on longboards to shepherd the heat through.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'It holds — barely, visibly. Every parent on the sand watches the improvisation and understands exactly what it is.',
          to: 'finale',
          effects: { score: -2 },
        },
        {
          id: 'push-through',
          label: 'The kids are all strong swimmers — finish the heat, then reassess.',
          skill: 'Self-direction',
          response:
            "The heat finishes. A grom comes in two hundred metres down the beach, crying, fine. 'Fine' is doing heavy lifting in that sentence, and everyone knows it.",
          to: 'finale',
          effects: { score: -7 },
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
          effects: { score: 8 },
        },
        {
          id: 'point-final',
          label: 'Send it on the point — a proper final on the proper wave, tight margins.',
          skill: 'Judgement & Decision-Making',
          response:
            'Two set waves come through in fifteen minutes. Two kids score, two chase lumps of tide. The trophy feels a little like weather.',
          to: 'END',
          effects: { score: -3 },
        },
        {
          id: 'points-call',
          label: 'Call it on heat points — no final, everyone in before the tide.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Tidy and flat. The kid who missed first by half a point will mention the final that never happened at every barbecue until Christmas.',
          to: 'END',
          effects: { score: 1 },
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
          effects: { score: 4, stream: 'header', status: 'underway' },
        },
        {
          id: 'quick-look',
          label: 'Stop for twenty minutes and eyeball it with Davo first.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'Davo finds heat where heat shouldn\'t be — a bearing running warm. You ring Blue with actual information.',
          to: 'header-call',
          effects: { score: 3, stream: 'header', status: 'underway' },
        },
        {
          id: 'push-on',
          label: 'Uncle said roll. Roll — check it tonight after dark.',
          skill: 'Self-direction',
          response:
            "All day the noise gets a semitone worse. By dark, Davo's silence is louder than the header. You ring Blue with the torch in your teeth.",
          to: 'header-call',
          effects: { score: -3, stream: 'header', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'book-blue',
          label: 'Book the 6am. The header stops for two hours tomorrow, storm or no storm.',
          skill: 'Judgement & Decision-Making',
          response:
            'Blue pulls a bearing the colour of bad news out of the drum at 6:40am. "Day and a half, tops, before she let go." Your uncle looks at the part, then at you, and says nothing — the good kind. Machines: SOUND.',
          to: 'HUB',
          effects: { stream: 'header', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'nurse-it',
          label: '"Talk Davo through babying it — slower drum speed, grease every smoko. We\'ll make it to Friday."',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Blue exhales. "Might hold. Grease it like you love it." It holds — at 80% pace, with Davo\'s ear cocked all week. Machines: limping on purpose.',
          to: 'HUB',
          effects: { stream: 'header', status: 'sorted', days: 1, score: 2 },
        },
        {
          id: 'risk-it',
          label: '"Every hour counts this week. She’s made noises for years — run it."',
          skill: 'Self-direction',
          response:
            '"Your funeral. Keep my number handy." Every rattle for the rest of the week sounds like four grand. Machines: a bet you\'re still holding.',
          to: 'HUB',
          effects: { stream: 'header', status: 'shaky', days: 0, score: -6 },
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
          effects: { score: 4, stream: 'crew', status: 'underway' },
        },
        {
          id: 'post-roster',
          label: 'Write the roster yourself and stick it in the shed — clean lines, no debates.',
          skill: 'Self-direction',
          response:
            "Clean lines, one problem: you've got Davo raking in the worst of Wednesday's heat. He won't say anything. That's the problem. You ring him.",
          to: 'crew-call',
          effects: { score: 0, stream: 'crew', status: 'underway' },
        },
        {
          id: 'wing-crew',
          label: 'The crew sorts itself every year — let them fall into their spots.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'They fall into last year\'s spots — which puts a backpacker on the chaser bin next to a header worth more than his country\'s GDP. You reach for the phone.',
          to: 'crew-call',
          effects: { score: -3, stream: 'crew', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'davo-plan-plus',
          label: 'Take his whole plan — shifts, roving water ute — and give DAVO the air-conditioned chaser cab Wednesday "because the German needs supervising."',
          skill: 'Emotional Intelligence',
          response:
            'A pause. "...Suppose someone\'s got to watch him." Davo spends the hottest day of the week in the cool cab, pride fully intact, teaching a backpacker to hear machines. Crew: SET, and set kindly.',
          to: 'HUB',
          effects: { stream: 'crew', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'plan-only',
          label: 'Run his shift plan exactly as given — Davo included in the rotation like everyone else.',
          skill: 'Judgement & Decision-Making',
          response:
            'The plan is good because it\'s his. Wednesday 2pm, Davo skips his own break — of course he does — and finishes the day grey and swaying. The plan needed one more move. Crew: held, just.',
          to: 'HUB',
          effects: { stream: 'crew', status: 'sorted', days: 1, score: 2 },
        },
        {
          id: 'ignore-advice',
          label: '"Shifts will slow us down. Everyone works through — we\'ll rest when it rains."',
          skill: 'Self-direction',
          response:
            "Wednesday takes its payment in people: one backpacker down with heat stress by 3pm, Sock driving angry, and Davo silently doing two jobs. You rest Thursday whether it rains or not. Crew: frayed.",
          to: 'HUB',
          effects: { stream: 'crew', status: 'shaky', days: 1, score: -7 },
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
          effects: { score: 4, stream: 'paddocks', status: 'underway' },
        },
        {
          id: 'easy-first',
          label: 'Home block first — start where the crew can find its rhythm.',
          skill: 'Emotional Intelligence',
          response:
            'Rhythm matters. So does the radar. You get one easy morning in before the river flat question starts tapping your shoulder. You radio your uncle.',
          to: 'paddocks-call',
          effects: { score: 1, stream: 'paddocks', status: 'underway' },
        },
        {
          id: 'as-always',
          label: 'Run the same order as every year — home, top, flat. Tradition is a plan.',
          skill: 'Self-direction',
          response:
            "Tradition was built in years the storm came Sunday. This one's booked for Thursday. You radio your uncle before tradition signs you up for porridge.",
          to: 'paddocks-call',
          effects: { score: -2, stream: 'paddocks', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'flat-tuesday',
          label: 'Split it: home block Monday–Tuesday, moisture test Tuesday arvo, river flat WEDNESDAY, top block rides out the storm.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'The Tuesday reading comes back perfect, the flat comes off dry Wednesday, and the top block — safe ground — waits politely for Friday sunshine. Your uncle, on channel 40: "Who taught you that?" Order: NAILED.',
          to: 'HUB',
          effects: { stream: 'paddocks', status: 'sorted', days: 1, score: 9 },
        },
        {
          id: 'flat-now',
          label: 'Flat first from tomorrow, moisture be damned — the storm scares you more than dockage.',
          skill: 'Judgement & Decision-Making',
          response:
            'Half of Tuesday\'s loads get docked for moisture — real money — but every tonne of your best wheat sleeps in the silo by Wednesday night. Expensive insurance, honestly bought. Order: set.',
          to: 'HUB',
          effects: { stream: 'paddocks', status: 'sorted', days: 1, score: 3 },
        },
        {
          id: 'flat-last',
          label: 'Keep the flat for Thursday — the storm might miss, and dry wheat is worth the wait.',
          skill: 'Self-direction',
          response:
            '"Bold," says your uncle, in the tone that means unwise. The week now ends in a race between a header and a weather front, and the front doesn\'t take smoko. Order: a gamble with a Thursday deadline.',
          to: 'HUB',
          effects: { stream: 'paddocks', status: 'shaky', days: 0, score: -5 },
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
          effects: { score: 4, stream: 'weather', status: 'underway' },
        },
        {
          id: 'app-only',
          label: 'Trust the radar app — refresh it hourly, plan on Thursday night.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The app is confident the way apps are. Your uncle squints at the horizon anyway, then at you: "Ring Kev."',
          to: 'weather-call',
          effects: { score: 1, stream: 'weather', status: 'underway' },
        },
        {
          id: 'ignore-weather',
          label: 'Storms do what storms do — strip wheat, watch sky, adjust.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"Adjust" is what people say before they get wet. Wednesday\'s clouds start rehearsing early and you ring Kev from the ute.',
          to: 'weather-call',
          effects: { score: -3, stream: 'weather', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'plan-arvo',
          label: 'Re-plan the whole week around THURSDAY 2PM — and take the shed: machines under cover Wednesday night.',
          skill: 'Judgement & Decision-Making',
          response:
            'Every deadline in the week moves six hours earlier, quietly, now — instead of loudly on Thursday. Kev\'s shed swallows the grain carts Wednesday. When the front arrives at 3:40pm Thursday, it finds a farm that expected it. Storm: OUTPLANNED.',
          to: 'HUB',
          effects: { stream: 'weather', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'split-difference',
          label: 'Plan for Thursday noon "to be safe" but skip the shed run — moving machines costs half a day.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The earlier deadline saves the wheat. The machines spend the storm under tarps that mostly hold, and "mostly" costs you a wet air filter and a Friday morning. Storm: beaten on points.',
          to: 'HUB',
          effects: { stream: 'weather', status: 'sorted', days: 0, score: 3 },
        },
        {
          id: 'trust-bureau',
          label: '"The bureau has satellites, Kev. Thursday night it is — but thanks for the shed offer."',
          skill: 'Self-direction',
          response:
            'Kev chuckles, not unkindly. "Satellites. Righto." You keep Thursday-night deadlines in a Thursday-arvo week, and the margin you think you have is six hours of fiction. Storm: underestimated.',
          to: 'HUB',
          effects: { stream: 'weather', status: 'shaky', days: 0, score: -6 },
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
          effects: { score: 4, stream: 'silo', status: 'underway' },
        },
        {
          id: 'rock-up',
          label: 'Trucks just rock up like every year — the queue is the queue.',
          skill: 'Self-direction',
          response:
            'Every farm in the district is racing the same storm. Monday\'s "queue" is nineteen trucks long, and your driver texts you a photo of his lunch, then his dinner. You ring June.',
          to: 'silo-call',
          effects: { score: -3, stream: 'silo', status: 'underway' },
        },
        {
          id: 'field-bins',
          label: 'Buy time: hire two extra field bins so the header never waits on trucks.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Smart buffer — the header never stops. The bins still have to empty somewhere, though, and that somewhere has a queue. You ring June.',
          to: 'silo-call',
          effects: { score: 2, stream: 'silo', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'commit-early',
          label: 'Commit to Tuesday–Wednesday slots and re-plan stripping to feed them — sell the certainty to your uncle.',
          skill: 'Judgement & Decision-Making',
          response:
            'The week now has a drumbeat: strip, cart, tip, repeat, no queues. Thursday, while the district fights at the weighbridge, your wheat is already money. June waves your last truck through personally. Logistics: HUMMING.',
          to: 'HUB',
          effects: { stream: 'silo', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'keep-flex',
          label: 'Take Tuesday slots only — keep Thursday flexible in case the week runs late.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'Half certainty, half hope. Thursday\'s queue is every bit the carnage June promised, and your second truck spends four hours in it — but the week survives. Logistics: workable.',
          to: 'HUB',
          effects: { stream: 'silo', status: 'sorted', days: 0, score: 2 },
        },
        {
          id: 'sort-thursday',
          label: '"We\'ll take our chances Thursday with everyone else."',
          skill: 'Self-direction',
          response:
            'Thursday, nineteen trucks, one storm bearing down, and yours is number seventeen. Wheat sits in field bins watching clouds. June\'s told-you-so is silent and total. Logistics: the queue.',
          to: 'HUB',
          effects: { stream: 'silo', status: 'shaky', days: 0, score: -6 },
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
          effects: { score: 8, days: 1 },
        },
        {
          id: 'dawn-sprint',
          label: 'Protect the crew’s sleep — 4:30am start, sprint the morning, hard stop at noon.',
          skill: 'Judgement & Decision-Making',
          response:
            'A rested crew strips fast and clean. It\'s close — the last loads run at 11:40 with the horizon turning green-black — but close counts. Mostly.',
          to: 'finale',
          effects: { score: 4 },
        },
        {
          id: 'hold-plan',
          label: 'One forecast update isn’t a plan change. Hold Thursday as drawn.',
          skill: 'Self-direction',
          response:
            'The front does not consult your plan. Noon Thursday arrives with wheat still standing and the first fat drops hitting the header\'s windscreen.',
          to: 'finale',
          effects: { score: -6 },
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
          effects: { score: 3, days: 1 },
        },
        {
          id: 'borrow-header',
          label: 'Ring Kev — his old header’s slower, but it’s RUNNING. Beg a loan.',
          skill: 'Leadership & Influence',
          response:
            '"Harvest rules," says Kev, and sends it over with his grandson driving. Two headers — one wounded, one geriatric — limp the harvest forward in tandem. The district will talk about it fondly at your expense forever.',
          to: 'finale',
          effects: { score: 5, days: 1 },
        },
        {
          id: 'wait-parts',
          label: 'Order the part, wait for the courier, lose the day properly.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The courier arrives Thursday morning, the fix takes till noon, and the storm takes everything after that. The paddock stands in the rain doing the maths on your Monday decision.',
          to: 'finale',
          effects: { score: -6, days: 1 },
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
          effects: { score: 8 },
        },
        {
          id: 'send-corner',
          label: 'Send it — ninety flat-out minutes, beat the sky or wear it.',
          skill: 'Self-direction',
          response:
            'The sky wins by twenty minutes. Wet wheat in the box, a header sleeping outdoors, and a bogged ute for Friday. Great story. Expensive story.',
          to: 'END',
          effects: { score: -4 },
        },
        {
          id: 'shed-now',
          label: 'Call it — the corner stands, everything with wheels gets home dry.',
          skill: 'Integrity & Ethics',
          response:
            'A real cost, cleanly chosen: one corner of wheat takes the rain standing while machines and people watch dry from the shed. Your uncle: "Cheapest wheat we ever lost."',
          to: 'END',
          effects: { score: 3 },
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
          effects: { score: 4, stream: 'drummer', status: 'underway' },
        },
        {
          id: 'text-jake',
          label: 'Text Jake first: "No apology — but the stool\'s open if you want to EARN it back."',
          skill: 'Integrity & Ethics',
          response:
            'Jake types for a long time. Three dots, gone, three dots, gone. Then nothing. You call Mia.',
          to: 'drummer-call',
          effects: { score: 3, stream: 'drummer', status: 'underway' },
        },
        {
          id: 'swallow-it',
          label: 'Swallow it and apologise to Jake — the old lineup for the big night.',
          skill: 'Emotional Intelligence',
          response:
            "You draft the apology four times and delete it four times, because it isn't true. Some prices are wrong even when they're cheap. You call Mia instead.",
          to: 'drummer-call',
          effects: { score: 1, stream: 'drummer', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'full-audition',
          label: 'Full audition today, whole band watching — and if she earns it, she gets the stool AND a stage-nerves plan.',
          skill: 'Leadership & Influence',
          response:
            "Shaky for eight bars, then she locks in like she's played with you for a year. The band exchanges the look. You have a drummer — and you write 'nerves plan' on the whiteboard like the professional you're becoming. Stool: MIA'S.",
          to: 'HUB',
          effects: { stream: 'drummer', status: 'sorted', days: 3, score: 8 },
        },
        {
          id: 'quiet-tryout',
          label: 'Private tryout, just you two — protect her from an audience until show night.',
          skill: 'Emotional Intelligence',
          response:
            'She plays brilliantly to a room of one. Kind — but now her first-ever audience of more than one person will be three hundred people. The nerves bill got deferred, not paid. Stool: hers, untested.',
          to: 'HUB',
          effects: { stream: 'drummer', status: 'sorted', days: 3, score: 2 },
        },
        {
          id: 'keep-shopping',
          label: '"You\'re in the mix — let me see who else is out there first."',
          skill: 'Judgement & Decision-Making',
          response:
            'Two days of asking around produces one Year 7 who owns half a kit. When you come back, Mia\'s reply is slower, cooler: "Sure. If you still need me." The stool is hers now anyway — minus some trust. Stool: filled, dented.',
          to: 'HUB',
          effects: { stream: 'drummer', status: 'shaky', days: 4, score: -6 },
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
          effects: { score: 4, stream: 'setlist', status: 'underway' },
        },
        {
          id: 'band-vote',
          label: 'Put it to a band vote — majority rules, no grudges.',
          skill: 'Integrity & Ethics',
          response:
            'The vote splits perfectly down the middle, because of course it does. Everyone looks at you. You call Sam for the tiebreaker nobody will resent.',
          to: 'setlist-call',
          effects: { score: 2, stream: 'setlist', status: 'underway' },
        },
        {
          id: 'your-call',
          label: 'Captain’s pick — you write the set tonight and present it done.',
          skill: 'Self-direction',
          response:
            'Decisive — and the room goes slightly quiet when you pin it up, which tells you something. You take Sam aside to pressure-test it.',
          to: 'setlist-call',
          effects: { score: 0, stream: 'setlist', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'back-sam',
          label: 'Better and scary. Sam’s song closes the set — and you say WHY out loud to the whole band.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            '"We\'re switching because it\'s BETTER, and Sam bringing it is the best thing that\'s happened to this band." Sam grows four inches on the phone. The set now has a secret weapon and a deadline. Setlist: LOCKED, brave.',
          to: 'HUB',
          effects: { stream: 'setlist', status: 'sorted', days: 3, score: 8 },
        },
        {
          id: 'polish-safe',
          label: 'Safe and shiny — polish the drilled set, park Sam’s song for after the battle.',
          skill: 'Judgement & Decision-Making',
          response:
            'The set tightens nicely. Sam says "makes sense" in the voice people use when it doesn\'t. A good, careful call — and everyone half-wonders about the road not taken. Setlist: locked, safe.',
          to: 'HUB',
          effects: { stream: 'setlist', status: 'sorted', days: 3, score: 2 },
        },
        {
          id: 'cram-both',
          label: 'Do both — squeeze Sam’s song in AND keep the full old set.',
          skill: 'Self-direction',
          response:
            'Four songs into a twelve-minute slot with a three-week drummer. Every rehearsal now practises everything and perfects nothing. Setlist: overstuffed.',
          to: 'HUB',
          effects: { stream: 'setlist', status: 'shaky', days: 3, score: -6 },
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
          effects: { score: 4, stream: 'gear', status: 'underway' },
        },
        {
          id: 'own-gear',
          label: 'Plan to bring your own amps and vocal rig — control what you can control.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Solid instinct — except the hall desk still sits between your rig and the speakers, and the desk belongs to Gus. You call him.',
          to: 'gear-call',
          effects: { score: 2, stream: 'gear', status: 'underway' },
        },
        {
          id: 'same-as-everyone',
          label: 'Every band uses the house PA — you’ll get what they get.',
          skill: 'Self-direction',
          response:
            'What they got last year was a closing band nobody could hear. The memory of it dials Gus\'s number for you.',
          to: 'gear-call',
          effects: { score: -2, stream: 'gear', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'full-deal',
          label: 'Deal — 5:15 arrival, cables coiled, and the whole band stays for pack-down. Shake on it.',
          skill: 'Leadership & Influence',
          response:
            "Gus writes your band's name on the desk in Sharpie — around channel two, in a route of his own design. You will be the only band that night whose vocals are safe. Gear: WIRED, by an ally.",
          to: 'HUB',
          effects: { stream: 'gear', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'soundcheck-only',
          label: 'Take the soundcheck, dodge the pack-down — it’s a school night.',
          skill: 'Judgement & Decision-Making',
          response:
            '"Right," says Gus, in the tone of a man re-ranking his priorities. You get a decent check and a standard patch — channel two included in the lottery. Gear: probably fine.',
          to: 'HUB',
          effects: { stream: 'gear', status: 'sorted', days: 1, score: 1 },
        },
        {
          id: 'wing-sound',
          label: '"We\'ll just soundcheck fast on the night like everyone else."',
          skill: 'Self-direction',
          response:
            'Gus wishes you luck with genuine sympathy, which is worse than sarcasm. Show night now includes a mystery: which band does channel two eat? Gear: unresolved.',
          to: 'HUB',
          effects: { stream: 'gear', status: 'shaky', days: 1, score: -6 },
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
          effects: { score: 4, stream: 'crowd', status: 'underway' },
        },
        {
          id: 'posters',
          label: 'Posters and word of mouth — the classics.',
          skill: 'Self-direction',
          response:
            'Twelve posters go up. Two survive the cleaner. Zoe DMs you a screenshot: "You know posters don\'t keep people till 9pm, right? Call me."',
          to: 'crowd-call',
          effects: { score: 0, stream: 'crowd', status: 'underway' },
        },
        {
          id: 'lineup-luck',
          label: 'Last slot sells itself — the finale IS the marketing.',
          skill: 'Judgement & Decision-Making',
          response:
            'The finale is the marketing to people who already care. The other three hundred need a reason. Zoe finds YOU at recess: "Please let me help before you waste prime time."',
          to: 'crowd-call',
          effects: { score: -2, stream: 'crowd', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'feed-machine',
          label: 'Run all three — and give her the faceless Mia clip tonight.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'The faceless drummer clip does numbers the school account has never seen. By show week, strangers are arguing in comments about who she is. Nobody is leaving before the last slot. Crowd: STAYING.',
          to: 'HUB',
          effects: { stream: 'crowd', status: 'sorted', days: 3, score: 8 },
        },
        {
          id: 'two-of-three',
          label: 'Countdown and clip yes — but no "secret song" promises we might not keep.',
          skill: 'Integrity & Ethics',
          response:
            'Honest and solid. The hype is real but ceilinged — curiosity without the cliffhanger. Zoe files the third idea under "wasted on cowards," affectionately. Crowd: healthy.',
          to: 'HUB',
          effects: { stream: 'crowd', status: 'sorted', days: 2, score: 3 },
        },
        {
          id: 'throttle',
          label: '"Tone it down — one tasteful announcement post. We\'re musicians, not influencers."',
          skill: 'Self-direction',
          response:
            'The tasteful post gets forty-one likes, thirty from parents. Prime time will play to whoever\'s left after the raffle. Zoe: "Tasteful. Cool cool cool." Crowd: thinning.',
          to: 'HUB',
          effects: { stream: 'crowd', status: 'shaky', days: 2, score: -5 },
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
          effects: { score: 4, stream: 'rehearsal', status: 'underway' },
        },
        {
          id: 'garage-only',
          label: 'Skip the politics — rehearse in Sam’s garage.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            "The garage works until Sam's neighbour starts a log of 'incidents.' Two rehearsals in, you need the music room, which means you need Mr Aldous.",
          to: 'rehearsal-call',
          effects: { score: 1, stream: 'rehearsal', status: 'underway' },
        },
        {
          id: 'squat-room',
          label: 'Just use the room at lunch — possession is nine-tenths of rehearsal.',
          skill: 'Self-direction',
          response:
            'It works twice. The third time, the jazz ensemble arrives mid-chorus with Mr Aldous behind them like weather. Diplomacy is now mandatory.',
          to: 'rehearsal-call',
          effects: { score: -3, stream: 'rehearsal', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'take-gig',
          label: 'Deal — and treat the assembly as Mia’s dress rehearsal: her first crowd, three weeks before the one that counts.',
          skill: 'Judgement & Decision-Making',
          response:
            "Two birds, one assembly: Aldous gets his showcase, and Mia plays to two hundred Year 7s — terrified, then triumphant. The nerves bill gets paid early, in a low-stakes room. Rehearsals: LOCKED, twice over.",
          to: 'HUB',
          effects: { stream: 'rehearsal', status: 'sorted', days: 3, score: 8 },
        },
        {
          id: 'slots-only',
          label: 'Take the slots, politely dodge the assembly — the set isn’t ready for daylight.',
          skill: 'Reasoning & Critical Thinking',
          response:
            '"Hm. Mondays only, then." Half the hours, none of the favour. The set gets tight-ish and Mia\'s first crowd will be the big one. Rehearsals: enough, barely.',
          to: 'HUB',
          effects: { stream: 'rehearsal', status: 'sorted', days: 2, score: 1 },
        },
        {
          id: 'no-deal',
          label: '"An assembly gig for room access? That\'s extortion, sir." (Say it charmingly.)',
          skill: 'Integrity & Ethics',
          response:
            'He ALMOST smiles. "It\'s economics." No deal — the garage it is, with the neighbour\'s log growing daily and the drum kit half-packed at all times. Rehearsals: improvised.',
          to: 'HUB',
          effects: { stream: 'rehearsal', status: 'shaky', days: 2, score: -5 },
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
          effects: { score: 8 },
        },
        {
          id: 'captain-voice',
          label: 'Firm and warm: "You earned this stool. Play it like the audition. GO."',
          skill: 'Leadership & Influence',
          response:
            'It works — she walks on and plays tight, careful, a notch inside herself. The crowd never knows. You do.',
          to: 'finale',
          effects: { score: 3 },
        },
        {
          id: 'swap-out',
          label: 'Protect the set — Sam covers the kit for song one, Mia joins "when she\'s ready."',
          skill: 'Judgement & Decision-Making',
          response:
            'Sam covers, rough but fine. Mia watches from the wing, and "ready" never comes — some doors close the second you don\'t walk through them.',
          to: 'finale',
          effects: { score: -6 },
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
          effects: { score: 6, days: 0 },
        },
        {
          id: 'rearrange',
          label: 'Re-voice the set live: drop the high harmony, push the guitar hook, let the crowd carry the chorus.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'A musician\'s fix for a technician\'s problem — clever, mostly works, and the sing-along chorus becomes an accidental moment. Thinner than it should be, braver than it looks.',
          to: 'finale',
          effects: { score: 3 },
        },
        {
          id: 'demand-fix',
          label: 'Make the organisers fix THEIR PA — escalate until someone owns it.',
          skill: 'Self-direction',
          response:
            'You are right, loudly, for ninety minutes. No spare channel exists in the building. Your prep time is gone and the tech is now actively unhelpful.',
          to: 'finale',
          effects: { score: -6 },
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
          effects: { score: 6 },
        },
        {
          id: 'for-the-win',
          label: '"Judges mark the closer hardest. Nail the ending, win the night." All business.',
          skill: 'Judgement & Decision-Making',
          response:
            'The set is precise, the ending lands clean. It\'s excellent. It\'s also slightly... performed. Bands play best when they forget the marking criteria.',
          to: 'END',
          effects: { score: 2 },
        },
        {
          id: 'wing-it',
          label: 'No speeches. Walk on, plug in, let the night be the night.',
          skill: 'Self-direction',
          response:
            'Sometimes cool is a plan and sometimes it\'s the absence of one. The first song starts a half-beat ragged before the band finds each other. The crowd forgives; the judges note.',
          to: 'END',
          effects: { score: -2 },
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
          effects: { score: 3, stream: 'stock', status: 'underway' },
        },
        {
          id: 'burn-test',
          label: 'Run a burn test tonight — data before decisions.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Three test candles later: two tunnel, one drowns its wick. The data has spoken. You take the verdict to Mum, who has opinions about the fix.',
          to: 'stock-call',
          effects: { score: 4, stream: 'stock', status: 'underway' },
        },
        {
          id: 'sell-all',
          label: 'Sell everything — buyers can’t tell a wonky top from artisanal charm.',
          skill: 'Self-direction',
          response:
            'You rehearse the word "rustic" in the mirror and can\'t keep a straight face. Mum appears in the doorway with the look. The conversation happens anyway.',
          to: 'stock-call',
          effects: { score: -3, stream: 'stock', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'remelt',
          label: 'Re-melt the dozen — two late nights, twelve GOOD candles, full stock with a clean conscience.',
          skill: 'Self-direction',
          response:
            'Tuesday and Wednesday nights smell like beeswax and stubbornness. By Thursday, sixty candles — actually sixty this time — and every single one is one you\'d put your name on. Because you did. Stock: FULL and honest.',
          to: 'HUB',
          effects: { stream: 'stock', status: 'sorted', days: 2, score: 8 },
        },
        {
          id: 'seconds-basket',
          label: 'A "seconds" basket at half price, labelled honestly: "first batch — imperfect, still lovely."',
          skill: 'Integrity & Ethics',
          response:
            'The honesty becomes a feature — the seconds basket charms people INTO the stall. Less margin, more trust, zero late nights. Stock: sorted, cleverly.',
          to: 'HUB',
          effects: { stream: 'stock', status: 'sorted', days: 1, score: 5 },
        },
        {
          id: 'quiet-mix',
          label: 'Mix the dozen through the good stock — spread the risk thin.',
          skill: 'Judgement & Decision-Making',
          response:
            "Mum says nothing, which says everything. Somewhere out there, twelve customers are about to form an opinion about your label — and two of them will be right. Stock: sixty, asterisked.",
          to: 'HUB',
          effects: { stream: 'stock', status: 'shaky', days: 0, score: -6 },
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
          effects: { score: 4, stream: 'price', status: 'underway' },
        },
        {
          id: 'cost-plus',
          label: 'Do the maths yourself: cost × 2.5 = $15. Round to $16. Done.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'The spreadsheet agrees with you. Spreadsheets always do. Whether STRANGERS agree is a different table — you ring Deb to pressure-test it.',
          to: 'price-call',
          effects: { score: 3, stream: 'price', status: 'underway' },
        },
        {
          id: 'undercut',
          label: 'Price at $10 — nearly the discount shop, obviously better. Volume wins.',
          skill: 'Self-direction',
          response:
            '$4 a candle for three months of work. You do that maths twice, feel slightly ill, and ring Deb before printing anything.',
          to: 'price-call',
          effects: { score: -2, stream: 'price', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'full-playbook',
          label: 'Run the whole playbook — $16, the working sign, the open smell-tester, 3-for-$40 bundle.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'You print the sign, stage the tester, and rehearse saying "three for forty" like it\'s no big deal. The stall now has a STORY at four seconds\' glance. Pricing: ARMED.',
          to: 'HUB',
          effects: { stream: 'price', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'price-only',
          label: 'Take the $16 but skip the theatre — good candles speak for themselves.',
          skill: 'Judgement & Decision-Making',
          response:
            'They speak — quietly, from inside closed jars, next to a sign that just says a number. Right price, mute story. Pricing: set, undersold.',
          to: 'HUB',
          effects: { stream: 'price', status: 'sorted', days: 1, score: 1 },
        },
        {
          id: 'ignore-deb',
          label: '"Respectfully, Deb, $10 moves more units. Volume is my strategy."',
          skill: 'Self-direction',
          response:
            '"It\'s your funeral, and it\'ll be a well-attended one at those prices." Every sale now earns $4 and teaches your market you\'re the cheap stall. Pricing: a race to the bottom, entered voluntarily.',
          to: 'HUB',
          effects: { stream: 'price', status: 'shaky', days: 0, score: -6 },
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
          effects: { score: 4, stream: 'spot', status: 'underway' },
        },
        {
          id: 'keep-14',
          label: 'Fourteen is fine — make the stall itself the destination.',
          skill: 'Self-direction',
          response:
            "Bold — but 'destination' needs foot traffic to redirect. You check the map again, notice #14's neighbours (tarps, a man who sells doorknobs), and ring Faye.",
          to: 'spot-call',
          effects: { score: 1, stream: 'spot', status: 'underway' },
        },
        {
          id: 'early-grab',
          label: 'Turn up at 6am Saturday and quietly set up in a better empty spot.',
          skill: 'Adaptability & Cognitive Flexibility',
          response:
            'A plan that works right up until its owner arrives at 6:40 with a van and a temper. You put the idea down slowly and ring Faye like a person with a future at this market.',
          to: 'spot-call',
          effects: { score: -3, stream: 'spot', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'take-two',
          label: 'Take #2 — pay the $15, and plan the table so it restocks from boxes underneath and never looks bare.',
          skill: 'Situational Awareness & Systems Thinking',
          response:
            'You sketch the table like a shop window: height at the back, tester at the front, restock crates hidden under the cloth. Faye inks you in at the entrance. Spot: PRIME.',
          to: 'HUB',
          effects: { stream: 'spot', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'stay-14',
          label: 'Thank her, keep #14 — save the $15 and skip the pressure.',
          skill: 'Judgement & Decision-Making',
          response:
            'Reasonable. Number 14 is what it is: steady trickle, sausage smoke, doorknob man doing surprisingly good numbers. Spot: yours, modest.',
          to: 'HUB',
          effects: { stream: 'spot', status: 'sorted', days: 0, score: 1 },
        },
        {
          id: 'haggle-fee',
          label: '"Fifteen extra? Can you waive it, since you need the entrance filled anyway?"',
          skill: 'Reasoning & Critical Thinking',
          response:
            'A beat of silence. "The fee stands, and so does the queue of people who\'ll pay it." You\'ve talked yourself back to #14 and onto Faye\'s "handle with care" list. Spot: middle row, plus a lesson in leverage — namely, who has it.',
          to: 'HUB',
          effects: { stream: 'spot', status: 'shaky', days: 0, score: -4 },
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
          effects: { score: 4, stream: 'wholesale', status: 'underway' },
        },
        {
          id: 'after-market',
          label: 'Wait until after Saturday — walk in with sales numbers as proof.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Patient — but Lena mentioned it twice, and twice-mentioned things get bought from somebody. You call her before someone else\'s candles do.',
          to: 'wholesale-call',
          effects: { score: 1, stream: 'wholesale', status: 'underway' },
        },
        {
          id: 'too-big',
          label: 'A standing order on top of school? Park it — the market is enough.',
          skill: 'Self-direction',
          response:
            'Sensible fear, worth interrogating. You talk it over with Mum, who says the thing mums say: "You can always say no AFTER you hear the offer." You call Lena.',
          to: 'wholesale-call',
          effects: { score: 0, stream: 'wholesale', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'counter-full',
          label: 'Counter kindly and on paper: "$11 a unit, first batch the Friday AFTER next — and the custom label’s free."',
          skill: 'Leadership & Influence',
          response:
            'The label offer lands exactly as planned — that\'s the part she wanted. "Eleven, week after next, done. Send me an invoice, businessperson." Your first standing order, on YOUR terms. Café: SIGNED.',
          to: 'HUB',
          effects: { stream: 'wholesale', status: 'sorted', days: 1, score: 9 },
        },
        {
          id: 'take-as-is',
          label: 'Take it exactly as offered — $9, next Friday. A real order is a real order.',
          skill: 'Judgement & Decision-Making',
          response:
            '$3 a unit and four school nights sacrificed to hit HER deadline. Real, yes. Priced like a favour, also yes. Café: signed, on her terms.',
          to: 'HUB',
          effects: { stream: 'wholesale', status: 'sorted', days: 1, score: 1 },
        },
        {
          id: 'decline-lena',
          label: '"I\'m flattered — but between school and the market, I\'d be promising what I can\'t deliver."',
          skill: 'Integrity & Ethics',
          response:
            'Honest, and she takes it well: "Door\'s open when you\'re ready." A clean no beats a broken yes — though the shelf will hold SOMEONE\'s candles by spring. Café: passed, politely.',
          to: 'HUB',
          effects: { stream: 'wholesale', status: 'sorted', days: 0, score: 3 },
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
          effects: { score: 4, stream: 'buyers', status: 'underway' },
        },
        {
          id: 'own-account',
          label: 'Start a little Instagram for the candles — build your own audience.',
          skill: 'Self-direction',
          response:
            'Nine followers by Wednesday, six of them relatives. Good long game, wrong week. Auntie Rae\'s group has eight thousand people in it TODAY. You ring her.',
          to: 'buyers-call',
          effects: { score: 1, stream: 'buyers', status: 'underway' },
        },
        {
          id: 'walk-ins',
          label: 'Markets bring their own crowd — save the marketing energy.',
          skill: 'Judgement & Decision-Making',
          response:
            "They bring A crowd — for the sausage sizzle and the doorknobs. Buyers looking for YOU specifically don't exist unless you create them. Mum leaves Auntie Rae's number on the fridge, casually.",
          to: 'buyers-call',
          effects: { score: -2, stream: 'buyers', status: 'underway' },
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
      customTo: 'HUB',
      options: [
        {
          id: 'full-story',
          label: 'Give her the whole story — workshop photos tonight, Thursday 7pm, and yes, you’ll answer Barbara.',
          skill: 'Emotional Intelligence',
          response:
            'The post does 400 reactions and 61 comments, three of them Barbara\'s (answered, graciously). By Friday, strangers are planning to "pop by for the candle kid." Buyers: INCOMING.',
          to: 'HUB',
          effects: { stream: 'buyers', status: 'sorted', days: 1, score: 8 },
        },
        {
          id: 'post-no-photos',
          label: 'Do the post but skip the making-of photos — keep it simple.',
          skill: 'Judgement & Decision-Making',
          response:
            'A nice post that reads like an ad does ad numbers: forty likes, two shares. Reach without story is just reach. Buyers: some.',
          to: 'HUB',
          effects: { stream: 'buyers', status: 'sorted', days: 1, score: 2 },
        },
        {
          id: 'too-cringe',
          label: '"Photos of ME making them? That\'s so embarrassing. Just the candles, please."',
          skill: 'Self-direction',
          response:
            '"The cringe IS the marketing, darling." She posts candles-only; it sinks by 8pm under a post about roadworks. Buyers: whoever wanders past.',
          to: 'HUB',
          effects: { stream: 'buyers', status: 'shaky', days: 1, score: -4 },
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
          effects: { score: 8 },
        },
        {
          id: 'quiet-swap',
          label: 'Swap it quietly with an apology and keep the line moving.',
          skill: 'Judgement & Decision-Making',
          response:
            'Fair, fast, forgettable. She\'s satisfied; the queue learned nothing about you either way. A moment spent, not invested.',
          to: 'finale',
          effects: { score: 2 },
        },
        {
          id: 'explain-burn',
          label: 'Explain candle care — tunnelling usually means short first burns. Offer 50% off her next one.',
          skill: 'Reasoning & Critical Thinking',
          response:
            "You might even be right about the burn time. Doesn't matter: four listening customers heard \"it's sort of your fault.\" Two of them drift off mid-lecture.",
          to: 'finale',
          effects: { score: -6 },
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
          effects: { score: 7 },
        },
        {
          id: 'meet-neighbour',
          label: 'Walk over, introduce yourself, and turn #15 into an ally — trade referrals, not blows.',
          skill: 'Emotional Intelligence',
          response:
            '"Party favours and gifts aren\'t the same shelf," she agrees, and by 11 you\'re sending each other customers. Not maximum margin — maximum neighbourhood.',
          to: 'finale',
          effects: { score: 4 },
        },
        {
          id: 'drop-price',
          label: 'Drop to $10 before the morning’s lost — match the market.',
          skill: 'Self-direction',
          response:
            'Sales tick up; margin evaporates. You\'ve priced three months of craft like an afternoon of factory time, and the $8 stall barely noticed you enter the war.',
          to: 'finale',
          effects: { score: -6 },
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
          effects: { score: 7 },
        },
        {
          id: 'hold-firm',
          label: 'Hold full price to the bell — leftovers become café stock or next month’s head start.',
          skill: 'Reasoning & Critical Thinking',
          response:
            'Six more sell at $16; eight come home. Whether that\'s "unsold stock" or "inventory" depends entirely on the café call you made this week.',
          to: 'END',
          effects: { score: 3 },
        },
        {
          id: 'slash-end',
          label: 'Slash to $5 and clear the table — empty boxes, full vibes.',
          skill: 'Self-direction',
          response:
            'The table empties fast — right up until the woman who paid $16 at 9:05 walks past the $5 sign. Her face does the accounting for you.',
          to: 'END',
          effects: { score: -4 },
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
