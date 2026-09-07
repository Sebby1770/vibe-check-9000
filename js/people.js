/* Named people in the club. No quiz — just a night out. */

export const NPCS = [
    {
        id: "rexa",
        name: "REXA",
        role: "DJ",
        x: 0.35,
        z: -11.15,
        color: "#ff2ea6",
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
                say: "VIBE CHECK. Illegal LEDs, legal dancing. Coat check is a rumor.",
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
        color: "#00fff7",
        greeting: "What are we pretending to hydrate with?",
        nodes: {
            start: {
                say: "Menu's three drinks and a feeling. Pick.",
                choices: [
                    { text: "Neon sour.", next: "sour", action: "drink-cyan" },
                    { text: "Magenta static.", next: "static", action: "drink-mag" },
                    { text: "Just water. I'm mysterious.", next: "water", action: "drink-lime" },
                ],
            },
            sour: {
                say: "Cyan in the visor. Don't drive a forklift.",
                choices: [{ text: "Cheers.", next: null }],
            },
            static: {
                say: "That's the one that makes the lasers gossip.",
                choices: [{ text: "I needed that.", next: null }],
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
        color: "#39ff14",
        greeting: "You made it past the door. That's already a personality.",
        nodes: {
            start: {
                say: "If you stand still on this floor the building gets offended.",
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
                say: "Yellow cube by the bar. Don't tell ION I said geometry is a personality.",
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
        color: "#b8f000",
        greeting: "I only talk between kicks.",
        nodes: {
            start: {
                say: "People come here to disappear at 128 BPM. You staying?",
                choices: [
                    { text: "I'm staying.", next: "stay" },
                    { text: "Teach me the quiet version.", next: "quiet" },
                ],
            },
            stay: {
                say: "Good. Don't check your phone. The visor already knows.",
                choices: [{ text: "Visor's enough.", next: null }],
            },
            quiet: {
                say: "Corner by the crates. Less laser, more conspiracy.",
                choices: [{ text: "I'll haunt it.", next: null }],
            },
        },
    },
    {
        id: "kai",
        name: "KAI",
        role: "RAVER",
        x: 6.1,
        z: -5.4,
        color: "#ffb703",
        greeting: "I brought a portable battery and a better attitude.",
        nodes: {
            start: {
                say: "You can dump your own music in the deck. House, jungle, a voice memo of your fridge. The room doesn't judge.",
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
        z: 10,
        color: "#c77dff",
        greeting: "Welcome to the building that refuses daylight.",
        nodes: {
            start: {
                say: "Guest list is a vibe, not a spreadsheet. Floor's ahead, bar's left, booth's the glowing wall. E talks to people.",
                choices: [
                    { text: "I'm going in.", next: null },
                    { text: "Anyone I should meet?", next: "meet" },
                ],
            },
            meet: {
                say: "REXA runs the booth. ION pours colors. PIXEL will make you dance. GHOST won't. KAI will steal your aux.",
                choices: [{ text: "Copy that.", next: null }],
            },
        },
    },
];

export function nearestNpc(x, z, max = 2.15) {
    let best = null;
    let bestD = max;
    for (const npc of NPCS) {
        const d = Math.hypot(x - npc.x, z - npc.z);
        if (d < bestD) {
            bestD = d;
            best = npc;
        }
    }
    return best ? { npc: best, dist: bestD } : null;
}

export function onDanceFloor(x, z) {
    return Math.abs(x) < 7.6 && Math.abs(z) < 7.6;
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
