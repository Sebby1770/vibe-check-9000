/* Named people + props. Dialogue only — meshes live in human.js. */

export const NPCS = [
    {
        id: "rexa",
        name: "REXA",
        role: "DJ",
        x: 0.35,
        z: -11.15,
        y: 0,
        facing: 0,
        color: "#ff2ea6",
        outfit: "dj",
        skin: 0xc68642,
        hair: 0x14080c,
        hairStyle: "short",
        anim: "dance",
        greeting: "Don't talk over the drop.",
        nodes: {
            start: {
                say: "Booth's hot. You dancing or you just decorating the fog?",
                choices: [
                    { text: "Give me something heavier.", next: "heavy" },
                    { text: "What's the room called tonight?", next: "room" },
                    { text: "Can I plug my own track in?", next: "deck" },
                ],
            },
            heavy: {
                say: "Alright. I'll open the filter. If the floor doesn't move, that's on you.",
                action: "drop",
                choices: [{ text: "I'm on it.", next: null }],
            },
            room: {
                say: "VIBE CHECK. Illegal LEDs downstairs, legal dancing. Coat check is a rumor. Stairs on your right go up to Velma.",
                choices: [
                    { text: "I'll find the bar.", next: null },
                    { text: "Hit the drop.", next: "heavy" },
                ],
            },
            deck: {
                say: "ESC, then drop files on the DECK. MP3, WAV, FLAC, whatever your laptop still believes in.",
                action: "open-deck",
                choices: [{ text: "Bet.", next: null }],
            },
        },
    },
    {
        id: "ion",
        name: "ION",
        role: "BARTENDER",
        x: -14.2,
        z: 0.4,
        y: 0,
        facing: Math.PI / 2,
        color: "#00fff7",
        outfit: "bartender",
        skin: 0xe0ac69,
        hair: 0x1a1208,
        hairStyle: "pompadour",
        anim: "idle",
        greeting: "What are we pretending to hydrate with?",
        nodes: {
            start: {
                say: "Menu's a few drinks and a feeling. The sour's cyan. The water's a lie. The third one makes the floor friendlier.",
                choices: [
                    { text: "Neon sour.", next: "sour", action: "drink-cyan" },
                    { text: "Make the room dishonest.", next: "tipsy", action: "tipsy" },
                    { text: "Just water. I'm mysterious.", next: "water", action: "drink-lime" },
                ],
            },
            sour: {
                say: "Cyan in the visor. Don't drive a Checker after this.",
                choices: [{ text: "Cheers.", next: null }],
            },
            tipsy: {
                say: "That's not tipsy. That's the full sermon. Don't hail a Checker until the street stops moving.",
                choices: [{ text: "I regret nothing.", next: null }],
            },
            water: {
                say: "Respect. The lime light still finds you.",
                choices: [{ text: "Back to the floor.", next: null }],
            },
        },
    },
    {
        id: "pixel",
        name: "PIXEL",
        role: "RAVER",
        x: 3.4,
        z: 3.1,
        y: 0,
        facing: -0.6,
        color: "#39ff14",
        outfit: "raver",
        skin: 0x8d5524,
        hair: 0x0d0d0d,
        hairStyle: "short",
        anim: "dance",
        greeting: "You made it past the door. That's already a personality.",
        nodes: {
            start: {
                say: "If you stand still on this floor the building gets offended. Upstairs is slower. The alley doesn't care either way.",
                choices: [
                    { text: "Then let's move.", next: "move", action: "dance" },
                    { text: "Any secrets?", next: "secret" },
                ],
            },
            move: {
                say: "Hold SPACE on the tiles. The room notices. I notice.",
                choices: [{ text: "See you in the strobe.", next: null }],
            },
            secret: {
                say: "Yellow cube by the bar. Back door dumps you in the alley. Fire escape if you want the long way up to Velma.",
                choices: [{ text: "I love a side quest.", next: null }],
            },
        },
    },
    {
        id: "ghost",
        name: "GHOST",
        role: "RAVER",
        x: -4.2,
        z: -3.6,
        y: 0,
        facing: 0.4,
        color: "#b8f000",
        outfit: "raver",
        skin: 0xf1c27d,
        hair: 0x3b2219,
        hairStyle: "short",
        anim: "idle",
        greeting: "I only talk between kicks.",
        nodes: {
            start: {
                say: "People come here to disappear at 128 BPM. You staying, or you going out into 1954 like a tourist?",
                choices: [
                    { text: "I'm staying.", next: "stay" },
                    { text: "What's out there?", next: "out" },
                ],
            },
            stay: {
                say: "Good. Don't check your phone. The visor already knows.",
                choices: [{ text: "Visor's enough.", next: null }],
            },
            out: {
                say: "Front door is 47th. Rain, Checkers, Dottie's pie. Back door is the alley. Muldoon smokes like it's a job.",
                choices: [{ text: "I'll haunt both.", next: null }],
            },
        },
    },
    {
        id: "kai",
        name: "KAI",
        role: "RAVER",
        x: 6.1,
        z: -5.4,
        y: 0,
        facing: -2.4,
        color: "#ffb703",
        outfit: "raver",
        skin: 0xc68642,
        hair: 0x1a0a08,
        hairStyle: "pompadour",
        anim: "dance",
        greeting: "I brought a portable battery and a better attitude.",
        nodes: {
            start: {
                say: "You can dump your own music in the deck. House, jungle, a voice memo of your fridge. The room doesn't judge. 1954 might.",
                choices: [
                    { text: "I'll plug in.", next: "plug", action: "open-deck" },
                    { text: "Procedural is already illegal enough.", next: "proc" },
                ],
            },
            plug: {
                say: "ESC → DECK → drop files. Then come back and pretend you always DJed.",
                choices: [{ text: "On my way.", next: null }],
            },
            proc: {
                say: "Fair. REXA wrote that beat in a cave made of oscillators.",
                choices: [{ text: "Respect the cave.", next: null }],
            },
        },
    },
    {
        id: "nova",
        name: "NOVA",
        role: "HOST",
        x: 0,
        z: 10.1,
        y: 0,
        facing: Math.PI,
        color: "#c77dff",
        outfit: "host",
        skin: 0xe0ac69,
        hair: 0x2a1020,
        hairStyle: "updo",
        anim: "idle",
        greeting: "Welcome to the building that refuses daylight.",
        nodes: {
            start: {
                say: "Guest list is a vibe, not a spreadsheet. Floor's ahead, bar's left, booth's the glowing wall. Stairs on the right. Front door is 47th Street. Back door is trouble.",
                choices: [
                    { text: "I'm going in.", next: null },
                    { text: "Anyone I should meet?", next: "meet" },
                    { text: "What's the year again?", next: "year" },
                ],
            },
            meet: {
                say: "REXA runs the booth. ION pours colors. PIXEL will make you dance. Upstairs, VELMA sings like the war just ended. Outside, DOTTIE has pie and opinions.",
                choices: [{ text: "Copy that.", next: null }],
            },
            year: {
                say: "November 12, 1954. The visor is from later. Don't make it weird. The street already has enough neon.",
                choices: [{ text: "I can do 1954.", next: null }],
            },
        },
    },
    {
        id: "velma",
        name: "VELMA",
        role: "JAZZ SINGER",
        x: 0.1,
        z: -13.05,
        y: 4.4,
        facing: 0,
        color: "#e0b25a",
        outfit: "singer",
        skin: 0xc68642,
        hair: 0x1a0a08,
        hairStyle: "updo",
        anim: "idle",
        greeting: "Keep your voice down. The song is doing the talking.",
        nodes: {
            start: {
                say: "They built a rave under a jazz club and called it architecture. You want a number, or you just leaning on the century?",
                choices: [
                    { text: "Sing me something slow.", next: "slow", action: "jazz" },
                    { text: "How's the view?", next: "view" },
                    { text: "You ever go downstairs?", next: "down" },
                ],
            },
            slow: {
                say: "Alright. I'll tell the trio to walk it. Don't clap on one. This isn't that kind of room.",
                action: "jazz",
                choices: [{ text: "I'll behave.", next: null }],
            },
            view: {
                say: "Atrium looks down on illegal LEDs. Windows look out on 47th. Both of them are lying, in different keys.",
                choices: [{ text: "Pretty city for a liar.", next: null }],
            },
            down: {
                say: "Once. The kick drum tried to date me. I came back to the brushes.",
                choices: [{ text: "Smart.", next: null }],
            },
        },
    },
    {
        id: "marco",
        name: "MARCO",
        role: "LOUNGE CAPTAIN",
        x: -10.4,
        z: 8.2,
        y: 4.4,
        facing: 0.3,
        color: "#d4c4a8",
        outfit: "lounge",
        skin: 0xe0ac69,
        hair: 0x1a1208,
        hairStyle: "short",
        anim: "idle",
        greeting: "Jacket stays on. That's the whole dress code.",
        nodes: {
            start: {
                say: "Welcome to the part of the building that still believes in table service. Jukebox on the east balcony. Fire escape if you need a cigarette with a plot.",
                choices: [
                    { text: "I'll take a window.", next: "window" },
                    { text: "Anyone famous in tonight?", next: "famous" },
                ],
            },
            window: {
                say: "Rain makes the taxis look expensive. Don't wave at Cabby unless you mean it. He will actually stop.",
                choices: [{ text: "Noted.", next: null }],
            },
            famous: {
                say: "RUBY thinks she is. FRANK thinks his room key is. VELMA actually is, if you have ears.",
                choices: [{ text: "I'll listen.", next: null }],
            },
        },
    },
    {
        id: "ruby",
        name: "RUBY",
        role: "SOCIALITE",
        x: -11.6,
        z: 6.4,
        y: 4.4,
        facing: 1.2,
        color: "#ff6b9d",
        outfit: "socialite",
        skin: 0xf1c27d,
        hair: 0x4a1020,
        hairStyle: "updo",
        anim: "idle",
        greeting: "If you're going to stare, at least bring a lighter.",
        nodes: {
            start: {
                say: "I came up for air and found 1954 still happening. Don't tell downstairs. They think they invented night.",
                choices: [
                    { text: "You look like the night invented you.", next: "flirt" },
                    { text: "What's a girl like you doing in a visor club?", next: "why" },
                ],
            },
            flirt: {
                say: "Careful. Charm like that's how people end up in the Gazette. Page six, if you're lucky.",
                choices: [{ text: "I'll risk page six.", next: null }],
            },
            why: {
                say: "The rave is a rumor with a door policy. I like rumors. Also the gin is honest up here.",
                choices: [{ text: "Respect the gin.", next: null }],
            },
        },
    },
    {
        id: "frank",
        name: "FRANK",
        role: "SALESMAN",
        x: 8.6,
        z: -9.8,
        y: 4.4,
        facing: -0.7,
        color: "#7aa2c4",
        outfit: "salesman",
        skin: 0xe0ac69,
        hair: 0x3b2a18,
        hairStyle: "short",
        anim: "idle",
        greeting: "You seen a bucket of ice that isn't metaphorical?",
        nodes: {
            start: {
                say: "Hotel's through the east wall if you believe in lobbies. I have a room key and no ice. That's the American century in one pocket.",
                choices: [
                    { text: "Try the diner.", next: "diner" },
                    { text: "What are you selling?", next: "sell" },
                ],
            },
            diner: {
                say: "Dottie's. Cherry pie that could end a war. Tell her Frank from 4B is still a coward about coffee.",
                choices: [{ text: "I'll mention it.", next: null }],
            },
            sell: {
                say: "Adding machines. Very modern. Very loud. The club downstairs would eat them for breakfast.",
                choices: [{ text: "Keep the receipt.", next: null }],
            },
        },
    },
    {
        id: "vinnie",
        name: "VINNIE",
        role: "A GUY",
        x: -6.2,
        z: -26.4,
        y: 0,
        facing: 0.4,
        color: "#c4a574",
        outfit: "hood",
        skin: 0xc68642,
        hair: 0x1a1208,
        hairStyle: "short",
        anim: "idle",
        greeting: "You didn't see me. That's the whole conversation.",
        nodes: {
            start: {
                say: "Back door of VIBE CHECK dumps celebrities and cowards in the same puddle. You looking for a way in, a way up, or a way to not be on Muldoon's report?",
                choices: [
                    { text: "Way up.", next: "up" },
                    { text: "What's with the cop?", next: "cop" },
                    { text: "Just passing through.", next: "pass" },
                ],
            },
            up: {
                say: "Fire escape on the right. Metal, wet, honest. Dumps you in the lounge like you pay rent.",
                choices: [{ text: "Appreciate it.", next: null }],
            },
            cop: {
                say: "Muldoon's off the clock. That's when he's most on the clock. Don't offer him a cigarette unless you brought two.",
                choices: [{ text: "I'll be polite.", next: null }],
            },
            pass: {
                say: "Sure. The cat's named Socks. She's the only landlord back here.",
                choices: [{ text: "I'll pay rent in chin scratches.", next: null }],
            },
        },
    },
    {
        id: "muldoon",
        name: "MULDOON",
        role: "OFFICER",
        x: 7.4,
        z: -21.2,
        y: 0,
        facing: -1.1,
        color: "#6a8caf",
        outfit: "cop",
        skin: 0xe0ac69,
        hair: 0x2a2018,
        hairStyle: "short",
        anim: "idle",
        greeting: "Keep walking. Or don't. I'm off duty either way.",
        nodes: {
            start: {
                say: "There's no law against a club that forgot what year it is. There is a law against being loud about it on 47th. You gonna be loud?",
                choices: [
                    { text: "I'll keep it to the floor.", next: "floor" },
                    { text: "Got a light?", next: "light" },
                ],
            },
            floor: {
                say: "Good. The alley hears everything and reports nothing. That's the arrangement.",
                choices: [{ text: "Understood.", next: null }],
            },
            light: {
                say: "I got a light. I don't got answers. That's also the arrangement.",
                choices: [{ text: "Fair.", next: null }],
            },
        },
    },
    {
        id: "socks",
        name: "SOCKS",
        role: "ALLEY CAT",
        x: 2.4,
        z: -27.6,
        y: 0,
        facing: -0.3,
        color: "#d8d0c4",
        outfit: "cat",
        skin: 0x222226,
        hair: 0x222226,
        hairStyle: "short",
        anim: "idle",
        kind: "cat",
        greeting: "mrrp.",
        nodes: {
            start: {
                say: "mrrrow. (She bumps your shin like you owe rent. You probably do.)",
                choices: [
                    { text: "Scratch behind the ears.", next: "pet", action: "pet-cat" },
                    { text: "Sorry, I'm late for 1954.", next: null },
                ],
            },
            pet: {
                say: "prrrrrrr. (The alley briefly becomes a better city.)",
                action: "pet-cat",
                choices: [{ text: "Good cat.", next: null }],
            },
        },
    },
    {
        id: "dottie",
        name: "DOTTIE",
        role: "WAITRESS",
        x: -24.6,
        z: 1.35,
        y: 0,
        facing: 0,
        color: "#ff6b6b",
        outfit: "waitress",
        skin: 0xf1c27d,
        hair: 0x6b2a18,
        hairStyle: "updo",
        anim: "idle",
        greeting: "Sit down before the coffee files a complaint.",
        nodes: {
            start: {
                say: "Menu's short because I wrote it. Coffee, cherry pie, and a look that says you came from that club. Frank from 4B still hasn't paid for last Tuesday.",
                choices: [
                    { text: "Coffee, black.", next: "coffee", action: "coffee" },
                    { text: "Cherry pie.", next: "pie", action: "pie" },
                    { text: "Frank says he's a coward about coffee.", next: "frank" },
                ],
            },
            coffee: {
                say: "There. Now you can face 47th without trembling. Don't spill it on the visor.",
                action: "coffee",
                choices: [{ text: "You're a public service.", next: null }],
            },
            pie: {
                say: "Cherry. Honest. If the club downstairs had a dessert it would be this, but louder.",
                action: "pie",
                choices: [{ text: "I'll take the quiet version.", next: null }],
            },
            frank: {
                say: "Ha. Tell him the pie doesn't miss him. The coffee might.",
                choices: [{ text: "I'll deliver that cruelly.", next: null }],
            },
        },
    },
    {
        id: "cabby",
        name: "CABBY",
        role: "HACK",
        x: 10.8,
        z: 16.85,
        y: 0,
        facing: Math.PI,
        color: "#f5c518",
        outfit: "cabbie",
        skin: 0x8d5524,
        hair: 0x1a1208,
        hairStyle: "short",
        anim: "idle",
        greeting: "Where to, visor?",
        nodes: {
            start: {
                say: "Meter's running on principle. I can loop you down 47th and dump you at Dottie's, or you can keep standing in the rain like a movie.",
                choices: [
                    { text: "Loop the block.", next: "ride", action: "hail-cab" },
                    { text: "I'll walk. It's that kind of night.", next: "walk" },
                ],
            },
            ride: {
                say: "Get in. Don't touch the radio. That's a 1951 Chevrolet and a 1954 attitude.",
                action: "hail-cab",
                choices: [{ text: "Yes sir.", next: null }],
            },
            walk: {
                say: "Suit yourself. Watch the puddles. They've got opinions.",
                choices: [{ text: "I'll watch 'em.", next: null }],
            },
        },
    },
    {
        id: "scotty",
        name: "SCOTTY",
        role: "NEWSBOY",
        x: -8.4,
        z: 16.1,
        y: 0,
        facing: 0.2,
        color: "#c45c28",
        outfit: "newsboy",
        skin: 0xe0ac69,
        hair: 0x3b2219,
        hairStyle: "short",
        anim: "idle",
        greeting: "Gazette! Illegal lights in Midtown! Pie prices stable!",
        nodes: {
            start: {
                say: "MIDTOWN GAZETTE, November 12, 1954. Extra extra, some basement invented a new kind of loud. Five cents, or you can read Harold's copy if you're cheap.",
                choices: [
                    { text: "I'll take one.", next: "buy", action: "paper" },
                    { text: "What's the headline?", next: "head" },
                ],
            },
            buy: {
                say: "Attaboy. Don't fold it on the crossword. My cousin made that crossword and he's sensitive.",
                action: "paper",
                choices: [{ text: "I would never.", next: null }],
            },
            head: {
                say: "CLUB FORGETS THE DECADE, STREET REMEMBERS THE RAIN. I wrote that. Well. I shouted it.",
                choices: [{ text: "Byline of the year.", next: null }],
            },
        },
    },
    {
        id: "clara",
        name: "CLARA",
        role: "UNDER THE AWNING",
        x: 3.6,
        z: 14.7,
        y: 0,
        facing: -0.4,
        color: "#9bb7d4",
        outfit: "lady",
        skin: 0xf1c27d,
        hair: 0x2a2018,
        hairStyle: "updo",
        anim: "idle",
        greeting: "If you're a cab, blink twice.",
        nodes: {
            start: {
                say: "I've been waiting long enough for a Checker that I started naming the raindrops. Don't offer me the club. I can hear it from here and I have standards.",
                choices: [
                    { text: "Cabby's right there.", next: "cab" },
                    { text: "Standards are expensive in the rain.", next: "rain" },
                ],
            },
            cab: {
                say: "I know. I'm making him wait. That's also a standard.",
                choices: [{ text: "Ruthless. I respect it.", next: null }],
            },
            rain: {
                say: "So is a good coat. Yours looks like it came from a year that hasn't been invented. I like it anyway.",
                choices: [{ text: "It's a visor, technically.", next: null }],
            },
        },
    },
    {
        id: "harold",
        name: "HAROLD",
        role: "NEWSSTAND",
        x: -12.1,
        z: 14.85,
        y: 0,
        facing: 0,
        color: "#c9a227",
        outfit: "vendor",
        skin: 0x8d5524,
        hair: 0x2a2010,
        hairStyle: "short",
        anim: "idle",
        greeting: "Cigarettes, gum, and other people's business.",
        nodes: {
            start: {
                say: "Gazette's stacked. Luckies are dry. The phone booth works if you like bad news with a dial tone. Don't steal the crossword.",
                choices: [
                    { text: "Let me see a paper.", next: "paper", action: "paper" },
                    { text: "Any tips for a visitor?", next: "tips" },
                ],
            },
            paper: {
                say: "Knock yourself out. Page three says the mayor hates neon. Page three is going to have a terrible night.",
                action: "paper",
                choices: [{ text: "I'll read it in the rain.", next: null }],
            },
            tips: {
                say: "Dottie's for pie. Astoria if you like carpets. Alley if you like the truth. Club if you like lying to the truth at 128 BPM.",
                choices: [{ text: "That's a whole itinerary.", next: null }],
            },
        },
    },
    {
        id: "eleanor",
        name: "ELEANOR",
        role: "FRONT DESK",
        x: 24.8,
        z: 8.6,
        y: 0,
        facing: Math.PI,
        color: "#d4c4a8",
        outfit: "clerk",
        skin: 0xe0ac69,
        hair: 0x3b2219,
        hairStyle: "updo",
        anim: "idle",
        greeting: "We have vacancies. We also have standards.",
        nodes: {
            start: {
                say: "Hotel Astoria. No vacancy for trouble, plenty for people who wipe their feet. Frank in 4B is looking for ice like it's a plot twist.",
                choices: [
                    { text: "Just browsing the century.", next: "browse" },
                    { text: "Is the lounge through there?", next: "lounge" },
                ],
            },
            browse: {
                say: "Browse quietly. The carpets remember everything and they gossip with the elevator.",
                choices: [{ text: "I'll be a rumor.", next: null }],
            },
            lounge: {
                say: "Next door, upstairs. Or the wet fire escape if you enjoy narrative. I pretend I don't see the fire escape.",
                choices: [{ text: "Your secret's safe.", next: null }],
            },
        },
    },
];

export const PROPS = [
    { id: "phone", x: 7.15, z: 14.85, y: 0, r: 1.7, prompt: "[E] PICK UP THE RECEIVER", action: "phone" },
    { id: "gazette", x: -11.8, z: 14.9, y: 0, r: 1.6, prompt: "[E] READ THE MIDTOWN GAZETTE", action: "paper" },
    { id: "juke", x: 11.15, z: -9.35, y: 4.4, r: 1.7, prompt: "[E] FEED THE JUKEBOX", action: "juke" },
    { id: "cabdoor", x: 14.4, z: 17.55, y: 0, r: 2.2, prompt: "[E] HAIL THE CHECKER", action: "hail-cab" },
];

export const SIT_SPOTS = [
    { id: "banq-n", x: -13.55, z: 3.3, y: 4.4, eye: 1.18, lookX: -7.5, lookZ: 3.3, r: 1.6, prompt: "[E] SIT ON THE BANQUETTE" },
    { id: "banq-s", x: -13.55, z: -1.6, y: 4.4, eye: 1.18, lookX: -7.5, lookZ: -1.6, r: 1.6, prompt: "[E] SIT ON THE BANQUETTE" },
    { id: "chaise", x: 10.6, z: 7.55, y: 4.4, eye: 1.12, lookX: 10.6, lookZ: 3.2, r: 1.7, prompt: "[E] STRETCH OUT ON THE CHAISE" },
    { id: "chair-e", x: 11.85, z: 2.6, y: 4.4, eye: 1.14, lookX: 8.2, lookZ: 1.8, r: 1.5, prompt: "[E] SINK INTO THE CLUB CHAIR" },
    { id: "chair-w", x: 11.9, z: 1.1, y: 4.4, eye: 1.14, lookX: 8.4, lookZ: 2.2, r: 1.5, prompt: "[E] TAKE THE CLUB CHAIR" },
];

export const GAZETTE = {
    title: "MIDTOWN GAZETTE",
    date: "FRIDAY, NOVEMBER 12, 1954  ·  FIVE CENTS",
    headline: "ILLEGAL LEDS REPORTED IN 47TH ST. BASEMENT",
    lede: "Patrons describe a nightclub that refuses the decade it is standing in. Police say the alley already knew.",
    columns: [
        "Officer Muldoon, off duty and on a cigarette, declined to comment except to say the rain was 'doing its job.'",
        "Dottie's Diner reports cherry pie sales up 40 percent among persons wearing unexplained visors.",
        "Hotel Astoria: NO VACANCY for trouble. Vacancies for everyone else, if they wipe their feet.",
        "Weather: rain until the city gets tired of looking beautiful. Overnight low, 44. Chance of jazz, 100 percent.",
    ],
};

export const PHONE_LINES = [
    "A voice like a saxophone: 'Tell Velma the bridge is in B-flat tonight.' Click.",
    "Dial tone, then a woman: 'He's not at the Astoria. Try the alley. He hates the alley, so that's where he is.'",
    "An operator: 'What year are you calling from, please?' You hang up out of respect.",
    "Static, then: 'The cube by the bar is not a metaphor. Stop treating it like one.'",
    "A kid shouting extras: 'Gazette! Club forgets the decade!' You are on the phone with the newspaper.",
];

export function nearestNpc(x, z, y = 0, max = 2.2) {
    let best = null;
    let bestD = max;
    for (const npc of NPCS) {
        if (Math.abs((npc.y || 0) - y) > 1.85) continue;
        const d = Math.hypot(x - npc.x, z - npc.z);
        if (d < bestD) {
            bestD = d;
            best = npc;
        }
    }
    return best ? { npc: best, dist: bestD } : null;
}

export function nearestSit(x, z, y = 0, max = 1.8) {
    let best = null;
    let bestD = max;
    for (const spot of SIT_SPOTS) {
        if (Math.abs((spot.y || 0) - y) > 1.2) continue;
        const d = Math.hypot(x - spot.x, z - spot.z);
        if (d < bestD) {
            bestD = d;
            best = spot;
        }
    }
    return best ? { spot: best, dist: bestD } : null;
}

export function nearestProp(x, z, y = 0, max = 2.2) {
    let best = null;
    let bestD = max;
    for (const prop of PROPS) {
        if (Math.abs((prop.y || 0) - y) > 1.85) continue;
        const d = Math.hypot(x - prop.x, z - prop.z);
        if (d < bestD) {
            bestD = d;
            best = prop;
        }
    }
    return best ? { prop: best, dist: bestD } : null;
}

export function onDanceFloor(x, z, y = 0) {
    return Math.abs(x) < 7.6 && Math.abs(z) < 7.6 && (y || 0) < 2.2;
}

export function getNode(npc, nodeId) {
    if (!npc || !npc.nodes) return null;
    return npc.nodes[nodeId] || npc.nodes.start || null;
}

export function applyChoice(npc, nodeId, choiceIndex) {
    const node = getNode(npc, nodeId);
    if (!node || !node.choices || !node.choices[choiceIndex]) {
        return { nodeId: null, action: null, closed: true };
    }
    const choice = node.choices[choiceIndex];
    return {
        nodeId: choice.next,
        action: choice.action || node.action || null,
        closed: !choice.next,
        npc,
    };
}
