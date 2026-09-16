/* The living block: serializable rules, independent of DOM and rendering. */
export const WORKSHOPS = [
  {
    id: "records",
    owner: "SID",
    title: "Build the midnight set",
    subtitle: "Three records. One room to win over.",
    noun: "A set for the listening booth",
    verb: "CUT THE SET",
    color: "#466f72",
    icon: "◎",
    steps: [
      ["OPENING", ["Blue brass", "Warm keys", "Rain piano"]],
      ["THE TURN", ["Walking bass", "Handclaps", "Brush drums"]],
      ["CLOSER", ["Velvet strings", "Night organ", "Dawn bells"]],
    ],
  },
  {
    id: "pharmacy",
    owner: "IRIS",
    title: "Work the soda fountain",
    subtitle: "Measure once. Stir like you mean it.",
    noun: "A fountain special",
    verb: "POUR & SERVE",
    color: "#678e7a",
    icon: "◒",
    steps: [
      ["SYRUP", ["Cherry", "Mint", "Vanilla"]],
      ["TOP IT UP", ["Soda water", "Cream soda", "Ginger fizz"]],
      ["FINISH", ["Lime twist", "Cream float", "Maraschino"]],
    ],
  },
  {
    id: "florist",
    owner: "LILY",
    title: "Make somebody’s evening",
    subtitle: "A bouquet is a sentence without a period.",
    noun: "A hand-tied bouquet",
    verb: "TIE THE BOUQUET",
    color: "#9b5972",
    icon: "✿",
    steps: [
      ["FLOWERS", ["Velvet roses", "Golden daisies", "Moon lilies"]],
      ["GREENERY", ["Silver eucalyptus", "Fern fronds", "Olive sprigs"]],
      ["WRAPPING", ["Kraft paper", "Ivory tissue", "Midnight ribbon"]],
    ],
  },
  {
    id: "liquor",
    owner: "ROSIE",
    title: "Pack the supper-club order",
    subtitle: "Sealed bottles. A card. The right address.",
    noun: "A supper-club parcel",
    verb: "SEAL THE PARCEL",
    color: "#977f49",
    icon: "♧",
    steps: [
      ["BOTTLE", ["House Dry", "Amber Reserve", "Night Botanical"]],
      ["PACKING", ["Straw-lined box", "Green tissue", "Travel sleeve"]],
      ["DESTINATION", ["Velma’s piano", "Marco’s table", "Frank’s booth"]],
    ],
  },
  {
    id: "barber",
    owner: "TONY",
    title: "Dress the portrait",
    subtitle: "The haircut is half the story.",
    noun: "A portrait appointment",
    verb: "FINISH THE PORTRAIT",
    color: "#66838e",
    icon: "✂",
    steps: [
      ["CUT", ["Pompadour", "Side part", "Close crop"]],
      ["JACKET", ["Midnight blue", "Chestnut wool", "Sage linen"]],
      ["DETAIL", ["Ivory pocket square", "Gold tie pin", "Burgundy tie"]],
    ],
  },
  {
    id: "rivoli",
    owner: "WALTER",
    title: "Save the late show",
    subtitle: "The reels arrived in the wrong order. Naturally.",
    noun: "A restored picture",
    verb: "THREAD THE PROJECTOR",
    color: "#6d607f",
    icon: "▣",
    steps: [
      [
        "ACT I · ARRIVAL",
        ["The last train", "A rain-soaked visor", "A cat at the window"],
      ],
      [
        "ACT II · DISCOVERY",
        ["The missing letter", "Two untouched coffees", "The open suitcase"],
      ],
      [
        "ACT III · GOODNIGHT",
        ["A light upstairs", "Dawn on the platform", "The diner door"],
      ],
    ],
  },
  {
    id: "diner",
    owner: "DOTTIE",
    title: "The midnight counter shift",
    subtitle: "Three things on the tray. No one leaves hungry.",
    noun: "A supper tray",
    verb: "RING THE BELL",
    color: "#a7694e",
    icon: "☕",
    steps: [
      ["THE PLATE", ["Cherry pie", "Grilled cheese", "Blue-plate supper"]],
      ["SOMETHING WARM", ["Counter coffee", "Hot cocoa", "Black tea"]],
      ["THE SIDE", ["Vanilla scoop", "Pickle spear", "Buttered toast"]],
    ],
  },
];
export const STREET_PLACES = [
  {
    id: "noticeboard",
    name: "The neighborhood board",
    x: 19,
    z: 16.9,
    y: 0,
    description: "A good place to start. Every new lead in one place.",
  },
  {
    id: "busker",
    name: "The Corner Set",
    x: 44,
    z: 14.2,
    y: 0,
    description: "Play a call-and-response with the street musician.",
  },
  {
    id: "nightcart",
    name: "Mabel’s Night Cart",
    x: -44,
    z: 17.1,
    y: 0,
    description: "Chestnuts, pretzels, cocoa. A warm pause on 47th.",
  },
  {
    id: "camera",
    name: "47th Camera Club",
    x: 44,
    z: 30.5,
    y: 0,
    description: "Borrow a camera. Keep the night in six frames.",
  },
  {
    id: "payphone",
    name: "The midnight payphone",
    x: 7.15,
    z: 14.85,
    y: 0,
    description: "Someone has been calling from the wrong decade.",
  },
  {
    id: "signal-sleeve",
    name: "Rex’s marked sleeve",
    x: -29.2,
    z: 35.9,
    y: 0,
    description: "Find the silver sleeve on the side display at Rex’s.",
  },
  {
    id: "lostproperty",
    name: "Astoria lost property",
    x: 30,
    z: 9.7,
    y: 0,
    description: "A small case in the hotel lobby. Nobody claims the future.",
  },
];
export const SNACKS = [
  {
    id: "chestnuts",
    name: "Roasted chestnuts",
    detail: "Warm paper bag, a little salt. +10 energy on the first bag.",
    energy: 10,
    icon: "◉",
  },
  {
    id: "pretzel",
    name: "Midnight pretzel",
    detail: "Soft middle, proper crust. +12 energy on the first order.",
    energy: 12,
    icon: "∞",
  },
  {
    id: "cocoa",
    name: "Spiced cocoa",
    detail: "Warm hands, steady visor. +8 energy on the first cup.",
    energy: 8,
    icon: "☕",
  },
];
export const SIGNAL_SET = {
  id: "signal-47",
  name: "THE MIDNIGHT FREQUENCY",
  bpm: 124,
  tone: 7,
  rhythm: 2,
};
export const MYSTERY = [
  {
    target: "payphone",
    title: "A call from tomorrow",
    copy: "The receiver is warm. “You’re early,” says a voice. “Or I’m late. Sid kept the record nobody ordered. Find the silver sleeve at Rex’s. Please don’t let them play the silence.”",
  },
  {
    target: "signal-sleeve",
    title: "The sleeve without a record",
    copy: "Inside: a photograph, cut exactly in half. On the back: CAMERA CLUB, 47TH. The person in it has your visor. Ask for the missing contact sheet at the camera kiosk.",
  },
  {
    target: "camera",
    title: "Frame number thirteen",
    copy: "The second half shows the Astoria lobby. Under the clock sits a small lost-property case. Written along the edge: “The future is something somebody left behind.”",
  },
  {
    target: "lostproperty",
    title: "A frequency in a suitcase",
    copy: "The latch gives. A reel hums without a machine. A note says: “Bring the sound back to the phone. Tell the city we made it.” The receiver on 47th is waiting.",
  },
  {
    target: "payphone",
    title: "The city answers",
    copy: "“There you are.” The line becomes a bass note. Upstairs, someone opens a window. REXA finds a channel the console never had. For a moment, both decades are listening. THE MIDNIGHT FREQUENCY is yours.",
  },
];
const unique = (v) =>
  Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === "string"))] : [];
export function normalizeExpansion(data = {}) {
  if (!data || typeof data !== "object") data = {};
  return {
    version: 1,
    workshops: Object.fromEntries(
      WORKSHOPS.filter((w) => typeof data.workshops?.[w.id] === "string").map(
        (w) => [w.id, data.workshops[w.id].slice(0, 220)],
      ),
    ),
    snacks: unique(data.snacks).filter((id) => SNACKS.some((s) => s.id === id)),
    rhythmBest: Math.max(
      0,
      Math.min(3, Math.floor(Number(data.rhythmBest) || 0)),
    ),
    camera: !!data.camera,
    photos: (Array.isArray(data.photos) ? data.photos : [])
      .filter(
        (p) =>
          p &&
          typeof p.id === "string" &&
          typeof p.image === "string" &&
          p.image.startsWith("data:image/jpeg;base64,") &&
          p.image.length < 180000,
      )
      .slice(-6)
      .map((p) => ({
        id: p.id.slice(0, 80),
        image: p.image,
        title: String(p.title || "47th Street").slice(0, 80),
        clock: String(p.clock || "").slice(0, 20),
      })),
    discoveries: unique(data.discoveries).slice(0, 24),
    mystery: Math.max(0, Math.min(5, Math.floor(Number(data.mystery) || 0))),
    signalOn: !!data.signalOn,
  };
}
export function counterBrief(id, seed = 0) {
  const w = WORKSHOPS.find((w) => w.id === id);
  if (!w) return null;
  const offset = WORKSHOPS.indexOf(w),
    v = Math.abs(Math.floor(Number(seed) || 0));
  const recipe = w.steps.map(
    (step, i) => (Math.floor(v / 3 ** i) + offset + i) % 3,
  );
  return {
    ...w,
    recipe,
    request: recipe.map((n, i) => w.steps[i][1][n]).join(" · "),
  };
}
export function finishCounter(input, id, picks, seed = 0) {
  const state = normalizeExpansion(input),
    brief = counterBrief(id, seed);
  if (
    !brief ||
    !Array.isArray(picks) ||
    picks.length !== 3 ||
    picks.some((n, i) => n !== brief.recipe[i])
  )
    return {
      state,
      ok: false,
      reward: false,
      message:
        "Check the order slip. Your choices stay on the counter; change any part and try again.",
    };
  const reward = !state.workshops[id];
  state.workshops[id] = brief.request;
  return {
    state,
    ok: true,
    reward,
    message: reward
      ? `${brief.owner} approves. ${brief.noun} is ready. Your passport is stamped.`
      : "Another good job. Your stamp is already in the book.",
    events: {
      flags: { counterRegular: Object.keys(state.workshops).length === 7 },
    },
  };
}
export function followSignal(input, place) {
  const state = normalizeExpansion(input),
    clue = MYSTERY[state.mystery];
  if (!clue)
    return {
      state,
      ok: false,
      message: "The line is quiet. The city is still listening.",
      title: "The midnight frequency",
    };
  if (place !== clue.target)
    return {
      state,
      ok: false,
      title: "A piece out of order",
      message: `Start with ${STREET_PLACES.find((p) => p.id === clue.target)?.name}. Your notebook has the lead.`,
    };
  state.mystery++;
  if (state.mystery === 5) state.signalOn = true;
  return {
    state,
    ok: true,
    title: clue.title,
    message: clue.copy,
    events: { flags: { signalFound: state.mystery === 5 } },
  };
}
export function takeSnack(input, id) {
  const state = normalizeExpansion(input),
    snack = SNACKS.find((s) => s.id === id);
  if (!snack) return { state, ok: false };
  const reward = !state.snacks.includes(id);
  if (reward) state.snacks.push(id);
  return {
    state,
    ok: true,
    reward,
    energy: reward ? snack.energy : 0,
    steady: id === "cocoa",
    message: reward
      ? `${snack.name}. Mabel tucked a warm receipt in your notebook.`
      : "Another one, on Mabel. You already got tonight’s energy boost.",
  };
}
export function finishDuet(input, rounds) {
  const state = normalizeExpansion(input);
  const best = Math.max(0, Math.min(3, Math.floor(Number(rounds) || 0)));
  const reward = best === 3 && state.rhythmBest < 3;
  state.rhythmBest = Math.max(state.rhythmBest, best);
  return {
    state,
    ok: true,
    reward,
    events: { flags: { streetDuet: state.rhythmBest === 3 } },
  };
}
export function rhythmPhrase(round, seed = 0) {
  return Array.from(
    { length: Math.max(3, Math.min(5, round + 3)) },
    (_, i) => (Math.abs(Math.floor(seed)) + i * i + round + i) % 3,
  );
}
export function addPhoto(input, photo, zone) {
  const state = normalizeExpansion(input);
  if (!state.camera)
    return {
      state,
      ok: false,
      message: "Borrow a camera at the 47th Camera Club first.",
    };
  const candidate = normalizeExpansion({ photos: [photo] }).photos[0];
  if (!candidate)
    return { state, ok: false, message: "The photograph could not be saved." };
  state.photos = [
    ...state.photos.filter((p) => p.id !== photo.id),
    candidate,
  ].slice(-6);
  state.discoveries = [...new Set([...state.discoveries, zone])];
  return {
    state,
    ok: true,
    message: `${candidate.title} — saved to your album.`,
    events: { flags: { streetPhotographer: state.discoveries.length >= 4 } },
  };
}
export function removePhoto(input, id) {
  const state = normalizeExpansion(input);
  state.photos = state.photos.filter((p) => p.id !== id);
  return state;
}

export function streetColliders() {
  return [
    {
      minX: -45.35,
      maxX: -42.65,
      minZ: 16.6,
      maxZ: 17.65,
      minY: -1,
      maxY: 1.3,
    },
    { minX: 42.6, maxX: 45.4, minZ: 30.65, maxZ: 31.75, minY: -1, maxY: 2.8 },
    { minX: 17.7, maxX: 20.3, minZ: 17.3, maxZ: 17.65, minY: -1, maxY: 2.6 },
    { minX: 29.2, maxX: 30.8, minZ: 9.65, maxZ: 10.45, minY: -1, maxY: 1.3 },
    {
      minX: -29.75,
      maxX: -28.65,
      minZ: 35.65,
      maxZ: 36.35,
      minY: -1,
      maxY: 1.05,
    },
  ];
}
