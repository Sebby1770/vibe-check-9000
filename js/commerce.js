import { normalizeLife, PRICES, spend, LIFE_PLACES, HOMES } from './life.js';
import { normalizeExpansion, STREET_PLACES, MYSTERY } from "./expansion.js";
/* The things you carry, and the people you carry them to. Pure, saved per night. */
const item = (id, name, description, detail, kind, color, extra = {}) => ({
  id,
  name,
  description,
  detail,
  kind,
  color,
  ...extra,
});
export const SHOPS_CATALOG = [
  {
    id: "records",
    name: "Rex's Records",
    owner: "SID",
    tagline: "Good records. Questionable decades.",
    color: "#90d9c3",
    items: [
      item(
        "midnight-current",
        "Midnight Current",
        "The 47th Street Circuit",
        "A restless bassline under rain-soaked brass. Take the B-side to REXA.",
        "record",
        "#90d9c3",
        {
          set: {
            id: "midnight-current",
            name: "MIDNIGHT CURRENT",
            bpm: 128,
            tone: 0,
            rhythm: 0,
          },
        },
      ),
      item(
        "blue-hour",
        "Blue Hour",
        "The Velvet Quartet",
        "A slow, blue groove with room for a conversation. REXA knows what to do with it.",
        "record",
        "#e7c775",
        {
          set: {
            id: "blue-hour",
            name: "BLUE HOUR",
            bpm: 112,
            tone: -5,
            rhythm: 1,
          },
        },
      ),
      item(
        "tomorrow-again",
        "Tomorrow, Again",
        "The Future Imperfect",
        "Acid from a year that hasn't happened. Keep the sleeve. Deny everything.",
        "record",
        "#ef9b81",
        {
          set: {
            id: "tomorrow-again",
            name: "TOMORROW, AGAIN",
            bpm: 138,
            tone: 3,
            rhythm: 2,
          },
        },
      ),
    ],
  },
  {
    id: "florist",
    name: "Lily's",
    owner: "LILY",
    tagline: "Something to say without saying it.",
    color: "#d58c9a",
    items: [
      item(
        "velvet-roses",
        "Velvet roses",
        "For the woman at the piano",
        "Wine-red roses, wrapped by hand. Velma's stage could use a little color.",
        "flowers",
        "#ba526b",
      ),
      item(
        "golden-hour",
        "Golden hour",
        "A little sun after dark",
        "Golden chrysanthemums in brown paper. Deliver them to Velma upstairs.",
        "flowers",
        "#e5bd61",
      ),
      item(
        "moon-garden",
        "Moon garden",
        "Quiet company",
        "Ivory blooms and eucalyptus. A quieter kind of encore for Velma.",
        "flowers",
        "#b3d0ba",
      ),
    ],
  },
  {
    id: "pharmacy",
    name: "47th Pharmacy",
    owner: "IRIS",
    tagline: "Soda. Tonic. Unsolicited advice.",
    color: "#7fb9a2",
    items: [
      item(
        "mint-tonic",
        "Midnight mint",
        "A clear head, briefly",
        "Steadies the visor and adds 8 energy on your first glass tonight.",
        "tonic",
        "#7fcbb2",
        { energy: 8, steady: true },
      ),
      item(
        "cherry-fizz",
        "Cherry phosphate",
        "A little optimism",
        "Cherry, bubbles, and 12 energy on your first glass. Absolutely no sermon.",
        "tonic",
        "#da8890",
        { energy: 12 },
      ),
      item(
        "vanilla-soda",
        "Vanilla cloud",
        "The street can wait",
        "A slow soda and a lead: Dottie's keeps the good booth for after midnight. +6 first-glass energy.",
        "tonic",
        "#dfc89f",
        { energy: 6 },
      ),
    ],
  },
  {
    id: "liquor",
    name: "Midtown Gin",
    owner: "ROSIE",
    tagline: "The smooth century. By the bottle.",
    color: "#ccab64",
    items: [
      item(
        "house-dry",
        "47th House Dry",
        "Juniper & a clean finish",
        "Marco's lounge order. Keep it sealed; he has the glasses.",
        "gin",
        "#90a977",
      ),
      item(
        "amber-reserve",
        "Amber Reserve",
        "A little oak, a little theatre",
        "The supper-club bottle. Marco will give it a place of honor.",
        "gin",
        "#d5a863",
      ),
      item(
        "night-botanical",
        "Night Botanical",
        "Citrus under the streetlights",
        "A fragrant bottle for the upstairs bar. Deliver to Marco.",
        "gin",
        "#8eafbc",
      ),
    ],
  },
  {
    id: "barber",
    name: "Tony's Barber",
    owner: "TONY",
    tagline: "Midnight is not a hairstyle.",
    color: "#c77d71",
    items: [
      item(
        "pompadour",
        "The headliner",
        "A little height. A lot of confidence.",
        "A sculpted pompadour. Tony's portrait goes in your pocket and on your night stamp.",
        "haircut",
        "#cd826e",
      ),
      item(
        "side-part",
        "The regular",
        "Clean lines, complicated evening",
        "A sharp side part. A proper portrait for an improper hour.",
        "haircut",
        "#9cb7c6",
      ),
      item(
        "crop",
        "The after-hours",
        "Nothing to get in the way",
        "A neat crop. Less fuss, more floor. Includes a portrait for your stamp.",
        "haircut",
        "#bdab85",
      ),
    ],
  },
  {
    id: "rivoli",
    name: "The Rivoli",
    owner: "WALTER",
    tagline: "Three small impossibilities. Take a seat.",
    color: "#d8b87d",
    items: [
      item(
        "rain",
        "Neon in the Rain",
        "A 36-second city symphony",
        "A stranger follows a light through the rain. Includes a clue for the diner.",
        "ticket",
        "#8caabd",
      ),
      item(
        "visor",
        "The Midnight Visor",
        "Tomorrow came early",
        "A hat, a visor, a suspicious appointment. An original silent short.",
        "ticket",
        "#9fcabd",
      ),
      item(
        "cats",
        "Alley Cats of 47th",
        "The cat knows the way",
        "Socks takes the long way to dinner. An original paper-cut picture.",
        "ticket",
        "#d7bc84",
      ),
    ],
  },
  {
    id: "diner",
    name: "Dottie's Diner",
    owner: "DOTTIE",
    tagline: "Open all night. Everybody ends up here.",
    color: "#cc8c70",
    items: [
      item(
        "counter-coffee",
        "Counter coffee",
        "Hot. Honest. Refilled.",
        "Steadies the visor; +12 energy on the first cup. Served at your seat.",
        "coffee",
        "#b7815f",
        { energy: 12, steady: true },
      ),
      item(
        "cherry-pie",
        "Cherry pie",
        "The reason to stay",
        "A proper slice with a fork. +16 energy on the first order tonight.",
        "pie",
        "#bf6c75",
        { energy: 16 },
      ),
      item(
        "blue-plate",
        "The blue plate",
        "Pie & a late-night story",
        "A small supper and Dottie's latest rumor. +18 energy on the first order.",
        "pie",
        "#90adbd",
        { energy: 18 },
      ),
    ],
  },
];
export const findItem = (id) =>
  SHOPS_CATALOG.flatMap((s) => s.items).find((i) => i.id === id) || null;
export const DESTINATIONS = [
  ...LIFE_PLACES,
  ...HOMES.map(h=>({id:`home-${h.id}`,name:`${h.number} · ${h.name}`,x:h.doorX+1,z:h.doorZ,y:4.4})),
  ...STREET_PLACES,
  ...SHOPS_CATALOG.filter((s) => s.id !== "diner").map((s) => ({
    id: s.id,
    name: s.name,
    x: {
      records: -33.2,
      pharmacy: -21.8,
      florist: -12.2,
      rivoli: 6,
      liquor: 24.6,
      barber: 35.8,
    }[s.id],
    z: 31.3,
    y: 0,
  })),
  { id: "diner", name: "Dottie's Diner", x: -27, z: 13.6, y: 0 },
  { id: "club", name: "The club", x: 0, z: 13.6, y: 0 },
  { id: "posters", name: "Midtown Poster Co.", x: 11.35, z: 16.18, y: 0 },
  { id: "hotel", name: "Hotel Astoria", x: 26, z: 13.6, y: 0 },
  { id: "subway", name: "The 12:04", x: -22.4, z: 26.6, y: 0 },
  { id: "alley", name: "Socks & the alley", x: 0, z: -19, y: 0 },
  { id: "rexa", name: "REXA's booth", x: 0.35, z: -11.15, y: 0 },
  { id: "velma", name: "Velma · upstairs", x: 0.1, z: -13, y: 4.4 },
  { id: "marco", name: "Marco · upstairs", x: -10.4, z: 8.2, y: 4.4 },
  { id: "frank", name: "Frank · upstairs", x: 8.6, z: -9.8, y: 4.4 },
  { id: "ice", name: "4B ice machine", x: 32, z: -8.5, y: 4.4 },
];
export function normalizeCommerce(data = {}) {
  if (!data || typeof data !== "object") data = {};
  const strings = (value) =>
    Array.isArray(value)
      ? [...new Set(value.filter((x) => typeof x === "string"))]
      : [];
  const playing = Object.hasOwn(data, "playingRecord")
    ? data.playingRecord
    : strings(data.deliveries).includes("rexa")
      ? data.record
      : null;
  return {
    version: 1,
    expansion: normalizeExpansion(data.expansion),
    life: normalizeLife(data.life),
    playingRecord:
      findItem(playing?.id)?.kind === "record" ? findItem(playing.id) : null,
    inventory: Array.isArray(data.inventory)
      ? data.inventory.filter((i) => i && (findItem(i.id) || i.id === "ice"))
      : [],
    completed: strings(data.completed),
    deliveries: strings(data.deliveries),
    leads: strings(data.leads),
    log: strings(data.log).slice(-24),
    style:
      findItem(data.style?.id)?.kind === "haircut"
        ? findItem(data.style.id)
        : null,
    record:
      findItem(data.record?.id)?.kind === "record"
        ? findItem(data.record.id)
        : null,
    film:
      findItem(data.film?.id)?.kind === "ticket"
        ? findItem(data.film.id)
        : null,
  };
}
function logged(state, text) {
  return {
    ...state,
    log: [...state.log.filter((l) => l !== text), text].slice(-24),
  };
}
export function addLead(state, id) {
  state = normalizeCommerce(state);
  return { ...state, leads: [...new Set([...state.leads, id])] };
}
const effectFlag = {
  record: "vinyl",
  flowers: "rose",
  gin: "gin",
  haircut: "haircut",
  ticket: "ticket",
  tonic: "tonic",
  coffee: "coffee",
  pie: "pie",
};
export function transact(input, shopId, itemId) {
  let state = normalizeCommerce(input);
  const shop = SHOPS_CATALOG.find((s) => s.id === shopId),
    selected = shop?.items.find((i) => i.id === itemId);
  if (!selected)
    return {
      state,
      ok: false,
      message: "That isn't on the counter.",
      events: {},
      effect: null,
    };
  const repeated = state.completed.includes(itemId),
    portable = ["record", "flowers", "gin"].includes(selected.kind);
  if (repeated && portable && selected.kind !== "record")
    return {
      state,
      ok: false,
      repeated: true,
      message: "One of those per night. The shop remembers.",
      events: {},
      item: selected,
    };
  const payment = spend(state.life, repeated ? 0 : PRICES[selected.kind] || 0, `${shop.name}: ${selected.name}`);
  if (!payment.ok) return {state,ok:false,item:selected,events:{},message:payment.message};
  state.life = payment.state;
  const owned = { ...selected, shopId };
  if (portable && !state.inventory.some((i) => i.id === itemId))
    state.inventory = [...state.inventory, owned];
  if (selected.kind === "record") state.record = owned;
  if (selected.kind === "haircut") state.style = owned;
  if (selected.kind === "ticket") state.film = owned;
  state.completed = [...new Set([...state.completed, itemId])];
  if (selected.kind === "record") state = addLead(state, "record");
  if (selected.kind === "flowers") state = addLead(state, "flowers");
  if (selected.kind === "gin") state = addLead(state, "gin");
  if (selected.kind === "ticket" || itemId === "vanilla-soda")
    state = addLead(state, "diner");
  state = logged(state, `${shop.name}: ${selected.name}`);
  return {
    state,
    ok: true,
    repeated,
    reward: !repeated,
    item: owned,
    effect: selected.kind,
    events: repeated ? {} : { flags: { [effectFlag[selected.kind]]: true } },
    message: portable
      ? `${selected.name} is in your pocket.`
      : selected.kind === "haircut"
        ? `Tony finished ${selected.name.toLowerCase()}. Your portrait is ready.`
        : selected.kind === "ticket"
          ? `${selected.name}. Your seat is waiting.`
          : `${selected.name}, served. ${repeated ? "The company is the reward this time." : "Enjoy the little things."}`,
  };
}
export function collectIce(input) {
  let state = normalizeCommerce(input);
  if (state.completed.includes("ice"))
    return {
      state,
      ok: false,
      message: "You already collected Frank's ice tonight.",
      events: {},
    };
  const item = {
    id: "ice",
    name: "Frank's ice",
    kind: "ice",
    shopId: "hotel",
    color: "#91c8db",
  };
  state = addLead(state, "ice");
  state.inventory = [...state.inventory, item];
  state.completed = [...state.completed, "ice"];
  return {
    state: logged(state, "Collected ice from the machine in 4B"),
    ok: true,
    reward: true,
    item,
    effect: "ice",
    events: { flags: { ice: true } },
    message: "Ice from 4B. Frank is waiting in the lounge.",
  };
}
export function deliver(input, recipient) {
  let state = normalizeCommerce(input);
  const routes = {
    rexa: [
      "record",
      "recordDelivered",
      "REXA drops your B-side. The room has a new opinion.",
    ],
    velma: [
      "flowers",
      "flowersDelivered",
      "Velma sets your flowers by the piano. This one's for you.",
    ],
    marco: [
      "gin",
      "ginDelivered",
      "Marco puts your bottle on the lounge table. A proper evening.",
    ],
    frank: [
      "ice",
      "iceDelivered",
      "Frank has his ice. The plot twist was plumbing.",
    ],
  };
  const route = routes[recipient];
  if (!route)
    return { state, ok: false, message: "No delivery here.", events: {} };
  const selected =
    recipient === "rexa"
      ? state.record
      : state.inventory.find((i) => i.kind === route[0]);
  if (!selected)
    return {
      state,
      ok: false,
      message: `Bring ${route[0] === "record" ? "a record from Rex's" : route[0] === "flowers" ? "a bouquet from Lily's" : route[0] === "gin" ? "a bottle from Midtown Gin" : "ice from the machine in 4B"}.`,
      events: {},
    };
  const repeated = state.deliveries.includes(recipient);
  if (repeated && recipient !== "rexa")
    return {
      state,
      ok: false,
      message: "Delivered. They remember the gesture.",
      events: {},
    };
  state.deliveries = [...new Set([...state.deliveries, recipient])];
  if (recipient === "rexa") {
    state.playingRecord = selected;
    state.expansion.signalOn = false;
  }
  if (recipient !== "rexa")
    state.inventory = state.inventory.filter((i) => i.id !== selected.id);
  state = logged(state, route[2]);
  return {
    state,
    ok: true,
    repeated,
    reward: !repeated,
    item: selected,
    effect: `deliver-${recipient}`,
    events: repeated ? {} : { flags: { [route[1]]: true } },
    message: route[2],
  };
}
export function getErrands(input) {
  const s = normalizeCommerce(input);
  return [
    {
      id: "record",
      title: "A B-side for REXA",
      description: "Browse at Rex's. Bring a record to the DJ booth.",
      target: s.record ? "rexa" : "records",
      complete: s.deliveries.includes("rexa"),
    },
    {
      id: "flowers",
      title: "An encore for Velma",
      description: "Choose flowers at Lily's and deliver them upstairs.",
      target: s.inventory.some((i) => i.kind === "flowers")
        ? "velma"
        : "florist",
      complete: s.deliveries.includes("velma"),
    },
    {
      id: "gin",
      title: "The supper-club order",
      description: "Take a sealed bottle from Rosie to Marco in the lounge.",
      target: s.inventory.some((i) => i.kind === "gin") ? "marco" : "liquor",
      complete: s.deliveries.includes("marco"),
    },
    {
      id: "ice",
      title: "Frank's plot twist",
      description:
        "Astoria east stairs → 2F → 4B machine → Frank upstairs in the club.",
      target: s.inventory.some((i) => i.kind === "ice") ? "frank" : "ice",
      complete: s.deliveries.includes("frank"),
    },
    {
      id: "diner",
      title: "Where the night ends",
      description:
        "Watch a Rivoli short, then ask Dottie about the booth after midnight.",
      target: "diner",
      complete: s.completed.includes("midnight-story"),
    },
  ]
    .filter((e) => s.leads.includes(e.id) || e.id === "record")
    .concat(
      s.expansion.mystery
        ? [
            {
              id: "signal",
              title: "The midnight frequency",
              description:
                s.expansion.mystery === 5
                  ? "The wrong number found the right night."
                  : STREET_PLACES.find(
                      (p) => p.id === MYSTERY[s.expansion.mystery].target,
                    ).description,
              target:
                s.expansion.mystery === 5
                  ? "payphone"
                  : MYSTERY[s.expansion.mystery].target,
              complete: s.expansion.mystery === 5,
            },
          ]
        : [],
    );
}
