import { LOCAL_VENUES, ROUTE_STOPS } from './neighborhood.js';
import { furnishingArt } from './homeware-art.js';
import { PRICES, money, wage, FURNISHINGS } from './life.js';
import { passportHTML, albumHTML } from "./expansion-ui.js";
import { DESTINATIONS } from "./commerce.js";
import { recordSleeve } from "./shop-art.js";
const sleeves = new Map();
function sleeveImage(index) {
  if (!sleeves.has(index)) {
    const texture = recordSleeve(index);
    sleeves.set(index, texture.image.toDataURL());
    texture.dispose();
  }
  return sleeves.get(index);
}

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
export function portraitSVG(style = "pompadour", color = "#b67e67") {
  const hair =
    style === "crop"
      ? '<path d="M73 91 Q73 57 120 56 Q164 59 165 93 L157 75 L87 75 Z"/>'
      : style === "side-part"
        ? '<path d="M72 98 Q60 55 111 46 Q160 44 167 98 L153 68 L88 84 Z"/><path d="M91 79 L141 51" stroke="#b99577" stroke-width="2"/>'
        : '<path d="M72 102 Q45 67 80 48 Q67 22 112 28 Q161 22 168 60 L159 97 L151 69 Q106 82 82 70 Z"/>';
  return `<svg viewBox="0 0 240 250" aria-label="Tony's portrait: ${esc(style)}" role="img"><rect width="240" height="250" fill="#e8d5ad"/><path d="M0 220Q32 155 120 172Q207 154 240 220V250H0" fill="${esc(color)}"/><path d="M90 169L120 215L150 169" fill="#fff3d8"/><path d="M110 195L130 195L139 250H101Z" fill="#253c3b"/><path d="M102 140H139V183Q119 197 101 178Z" fill="#bd8562"/><ellipse cx="120" cy="108" rx="45" ry="57" fill="#ce9773"/><g fill="#392e2b">${hair}</g><path d="M86 106H155V126H86Z" fill="#243938"/><path d="M91 110H150V119H91Z" fill="#acd8c7"/><path d="M108 146Q122 152 133 145" stroke="#774f40" stroke-width="3" fill="none"/><path d="M15 16H225V235H15Z" stroke="#6b6251" fill="none"/><text x="120" y="232" text-anchor="middle" fill="#273e3a" font-size="10" font-family="Georgia">TONY'S · 47TH STREET · 1954</text></svg>`;
}
function art(i, index = 0) {
  if (i.kind === "haircut") return portraitSVG(i.id, i.color);
  if (i.kind === "record")
    return `<img src="${sleeveImage(index)}" alt="${esc(i.name)} — original record sleeve"/>`;
  if (i.kind === "flowers")
    return `<svg viewBox="0 0 320 290" aria-hidden="true"><rect width="320" height="290" fill="#e1d6be"/><path d="M106 154L216 150L178 269L152 269Z" fill="#c29d70"/><g stroke="#486453" stroke-width="4">${[90, 112, 139, 163, 185, 210, 230].map((x, k) => `<path d="M163 254L${x} ${75 + (k % 3) * 25}"/>`).join("")}</g>${[90, 112, 139, 163, 185, 210, 230].map((x, k) => `<g fill="${esc(i.color)}"><circle cx="${x}" cy="${75 + (k % 3) * 25}" r="21"/><circle cx="${x - 8}" cy="${64 + (k % 3) * 25}" r="14"/><circle cx="${x + 12}" cy="${65 + (k % 3) * 25}" r="14"/></g><circle cx="${x}" cy="${75 + (k % 3) * 25}" r="6" fill="#eac984"/>`).join("")}<path d="M141 217H187" stroke="#6f5b4c" stroke-width="8"/></svg>`;
  if (i.kind === "ticket")
    return `<svg viewBox="0 0 320 290" aria-hidden="true"><rect width="320" height="290" fill="#24343c"/><circle cx="231" cy="75" r="40" fill="${esc(i.color)}"/><path d="M0 245L55 111H105V194H137V89H193V245H231V153H277V245H320V290H0Z" fill="#102229"/><path d="M125 290L196 146L175 290" fill="${esc(i.color)}" opacity=".55"/><g stroke="#b8bdb6" opacity=".45">${Array.from({ length: 17 }, (_, k) => `<path d="M${k * 24} 20l-54 220"/>`).join("")}</g><text x="24" y="44" fill="#f3e1be" font-size="12" letter-spacing="5" font-family="monospace">RIVOLI PICTURES</text></svg>`;
  if (i.kind === "gin")
    return `<svg viewBox="0 0 320 290" aria-hidden="true"><rect width="320" height="290" fill="#d9cbae"/><ellipse cx="161" cy="253" rx="68" ry="13" fill="#877762" opacity=".4"/><path d="M140 39H180V99Q202 106 202 126V237Q202 248 191 248H129Q118 248 118 237V126Q118 106 140 99Z" fill="${esc(i.color)}"/><rect x="137" y="32" width="46" height="22" rx="3" fill="#564632"/><path d="M127 138H193V211H127Z" fill="#eee0b9"/><text x="160" y="167" text-anchor="middle" font-family="Georgia" font-size="14" fill="#334639">MIDTOWN</text><text x="160" y="190" text-anchor="middle" font-family="Georgia" font-size="22" fill="#334639">GIN</text><path d="M132 119V233" stroke="#fff" opacity=".35" stroke-width="4"/></svg>`;
  if (i.kind === "pie")
    return `<svg viewBox="0 0 320 290" aria-hidden="true"><rect width="320" height="290" fill="#e6d9bc"/><ellipse cx="160" cy="215" rx="113" ry="41" fill="#8aa9a8"/><ellipse cx="160" cy="212" rx="95" ry="29" fill="#f8ecd4"/><path d="M89 205L186 111L234 215L233 240L88 231Z" fill="#b7626d"/><path d="M89 205L186 111L234 215Z" fill="#dfb671"/><path d="M113 184L204 172M133 166L215 192M154 143L184 214M176 124L207 217" stroke="#a16f43" stroke-width="5"/><path d="M112 84Q102 65 118 44M153 91Q143 72 159 51" fill="none" stroke="#faf5e9" stroke-width="5"/></svg>`;
  return `<svg viewBox="0 0 320 290" aria-hidden="true"><rect width="320" height="290" fill="#e5d8b8"/><ellipse cx="153" cy="238" rx="92" ry="21" fill="#a3b4a2"/><path d="M107 97H201L187 224H122Z" fill="${esc(i.color)}"/><ellipse cx="154" cy="99" rx="47" ry="12" fill="#f4e9cb"/><path d="M142 95L177 30" stroke="#b3726c" stroke-width="7"/><path d="M122 122L132 207" stroke="#fff4da" stroke-width="5" opacity=".6"/><g fill="#f9edce">${[130, 154, 178].map((x, k) => `<circle cx="${x}" cy="${145 + k * 17}" r="5"/>`).join("")}</g></svg>`;
}

export function createShopUI(hooks = {}) {
  const root = document.createElement("section");
  root.className = "shop-overlay";
  root.hidden = true;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "47th Street shop");
  document.body.append(root);
  let department = "tonight", unownedOnly = false;
  let shop = null,
    state = {},
    context = {},
    errands = [],
    zone = "street",
    tab = "pockets",
    prior = null,
    preview = null;
  function close() {
    if (root.hidden) return;
    hooks.onStopPreview?.();
    preview = null;
    root.hidden = true;
    document.body.classList.remove("shopping");
    document.getElementById("visor").inert = false;
    prior?.focus?.();
  }
  function exit() {
    close();
    hooks.onClose?.();
  }
  function open() {
    if (root.hidden) prior = document.activeElement;
    root.hidden = false;
    document.body.classList.add("shopping");
    document.getElementById("visor").inert = true;
    root.setAttribute("aria-label", shop ? shop.name : "Pocket notebook");
    render();
    root.querySelector("button")?.focus();
  }
  function selectLabel(i) {
    return i.kind === "record"
      ? "TAKE THIS RECORD"
      : i.kind === "haircut"
        ? "TAKE THE CHAIR"
        : i.kind === "ticket"
          ? "TAKE A SEAT"
          : i.kind === "flowers"
            ? "WRAP THIS BOUQUET"
            : i.kind === "gin"
              ? "COLLECT THIS BOTTLE"
              : "PLACE MY ORDER";
  }
  function render() {
    const focused = root.querySelector(":focus")?.dataset.key,
      scroll = root.querySelector(".shop-scroll")?.scrollTop || 0;
    root.style.setProperty("--shop-ink", shop?.color || "#9dbaab");
    root.innerHTML = `<div class="shop-sheet"><header class="shop-mast"><span>47TH STREET <i>•</i> NEW YORK</span><button class="shop-close" data-key="close" aria-label="Return to the street">CLOSE <b>×</b></button></header><div class="shop-scroll">${shop ? renderShop() : renderJournal()}</div><footer class="shop-foot"><span>${shop ? "A little something for the night. Every price on the card." : "The city is small. Your evening doesn’t have to be."}</span><span>EST. 1954 / OPEN LATE</span></footer><div class="shop-receipt" role="status" aria-live="polite" hidden></div></div>`;
    root.querySelector('[data-key="close"]').onclick = exit;
    root.querySelectorAll('[data-department]').forEach(b=>b.onclick=()=>{department=b.dataset.department;render();});
    root.querySelector('[data-filter]')?.addEventListener('click',()=>{unownedOnly=!unownedOnly;render();});
    root.querySelector('[data-career]')?.addEventListener('click',()=>{const id=shop.id;close();hooks.onCareer?.(id);});
    root.querySelector('[data-life]')?.addEventListener('click',()=>{close();hooks.onLife?.('wallet');});
    root.querySelector('[data-myhome]')?.addEventListener('click',()=>{close();hooks.onLife?.('homes');});
    root.querySelectorAll('[data-furnishing]').forEach(b=>b.onclick=()=>hooks.onFurnishing?.(b.dataset.furnishing));
    root.querySelector("[data-workshop]")?.addEventListener("click", () => {
      const id = shop.id;
      close();
      hooks.onWorkshop?.(id);
    });
    root
      .querySelectorAll("[data-export-photo]")
      .forEach(
        (b) => (b.onclick = () => hooks.onExportPhoto?.(b.dataset.exportPhoto)),
      );
    root
      .querySelectorAll("[data-delete-photo]")
      .forEach(
        (b) => (b.onclick = () => hooks.onDeletePhoto?.(b.dataset.deletePhoto)),
      );
    root
      .querySelectorAll("[data-select]")
      .forEach(
        (b) => (b.onclick = () => hooks.onSelect?.(shop.id, b.dataset.select)),
      );
    root.querySelectorAll("[data-preview]").forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.preview;
          if (preview === id) {
            hooks.onStopPreview?.();
            preview = null;
          } else {
            preview = id;
            hooks.onPreview?.(shop.items.find((i) => i.id === id));
          }
          render();
        }),
    );
    root.querySelectorAll("[data-tab]").forEach(
      (b) =>
        (b.onclick = () => {
          tab = b.dataset.tab;
          render();
          root.querySelector(`[data-tab="${tab}"]`)?.focus();
        }),
    );
    root.querySelectorAll("[data-destination]").forEach(
      (b) =>
        (b.onclick = () => {
          hooks.onNavigate?.(b.dataset.destination);
          exit();
        }),
    );
    root.querySelector(".shop-scroll").scrollTop = scroll;
    if (focused)
      root.querySelector(`[data-key="${focused}"]`)?.focus({
        preventScroll: true,
      });
    if (!root.hidden && !root.contains(document.activeElement))
      (
        root.querySelector(`[data-tab="${tab}"]`) ||
        root.querySelector("button")
      )?.focus({ preventScroll: true });
  }
  function renderShop() {
    const feature = (context.featuredIndex ?? 0) % shop.items.length, life=state.life;
    const heading=`<div class='shop-heading'><p class='shop-eyebrow'>${esc(shop.owner)} IS AT THE COUNTER <span>● OPEN LATE</span></p><h1>${esc(shop.name)}</h1><p>${esc(shop.tagline)}</p></div><div class='shop-tools'><button class='shop-workshop-link' data-workshop><span><small>THE NIGHTLY FAVOR · $20 THANK-YOU</small><strong>Behind the counter · ${state.expansion?.workshops?.[shop.id]?'Passport stamped':'Help with tonight’s order'}</strong></span><b>↗</b></button><button class='shop-career-link' data-career data-key='career'>${life.active?.job===shop.id?'RESUME PAID SHIFT':'PAID SHIFTS · '+money(wage(life,shop.id))} ↗</button></div><nav class='shop-departments' aria-label='Shop departments'><div class='department-switch'>${[['tonight','TONIGHT’S SELECTION'],['home','HOME & KEEPSAKES']].map(([id,label])=>`<button data-department='${id}' data-key='dept-${id}' aria-current='${department===id?'page':'false'}'>${label}</button>`).join('')}</div><button class='shop-wallet-link' data-life data-key='wallet'>WALLET · ${money(life.wallet)} ↗</button></nav>`;
    if(department==='home') {const i=FURNISHINGS.find(i=>i.shop===shop.id),owned=life.furnishings.includes(i.id);return `${heading}<p class='shop-home-intro'>A little of ${esc(shop.name)} to take home. Buy once, keep across nights. We’ll deliver when you have your own apartment.</p><div class='shop-cards homewares'><article class='shop-card ${owned?'is-selected':''}'><div class='homeware-art'>${furnishingArt(i.id)}</div><div class='shop-card-copy'><p class='shop-item-kind'>PERMANENT FURNISHING ${owned?'· OWNED':''}</p><h2>${i.name}</h2><p class='shop-detail'>${i.detail}</p><div class='shop-price'>${owned?'YOURS TO KEEP':money(i.price)}<small>DELIVERY INCLUDED</small></div><button class='shop-select' data-furnishing='${i.id}' data-key='furnishing-${i.id}' ${owned||life.wallet<i.price?'disabled':''}>${owned?'ALREADY OWNED':life.wallet<i.price?'NEED '+money(i.price-life.wallet)+' MORE':'BUY FOR MY HOME ↗'}</button></div></article><aside class='homeware-note'><p class='shop-eyebrow'>THOUGHTFULLY CHOSEN. MADE TO LAST.</p><h2>A home with a little history.</h2><p>Every shop has its own piece for your apartment. All seven can be displayed together.</p><p>${life.home?'Your active apartment is ready for a delivery.':'No keys yet? Your purchase stays safely in storage until you move in.'}</p><button data-myhome>EXPLORE MY HOME ↗</button></aside></div>`;}
    const visible=shop.items.map((i,k)=>({i,k})).filter(({i})=>!unownedOnly||!state.completed?.includes(i.id));
    return `${heading}<div class='shop-rule'><span>TONIGHT’S SELECTION · ${shop.items.length} PICKS</span><span>${esc(context.clock||'LATE EDITION')}</span></div><div class='shop-owned-filter'><button data-filter data-key='filter' aria-pressed='${unownedOnly}'>${unownedOnly?'SHOW EVERYTHING':'SHOW UNCOLLECTED'}</button><p class='shop-detail'>Prices shown below. Replays and repeat service tonight are included.</p></div><div class='shop-cards'>${visible.map(({i,k})=>{
      const owned=state.completed?.includes(i.id),selected=[state.style?.id,state.record?.id,state.film?.id].includes(i.id),price=owned?0:PRICES[i.kind]||0,unavailable=owned&&['flowers','gin'].includes(i.kind),short=life.wallet<price;
      return `<article class='shop-card ${selected?'is-selected':''}'><div class='shop-art'>${art(i,k)}<span class='shop-number'>0${k+1}</span>${k===feature?`<span class='shop-pick'>STAFF PICK</span>`:''}</div><div class='shop-card-copy'><p class='shop-item-kind'>${esc(i.kind)} ${owned?'· YOUR NIGHT':''}</p><h2>${esc(i.name)}</h2><p class='shop-description'>${esc(i.description)}</p><p class='shop-detail'>${esc(i.detail)}</p><div class='shop-price'>${owned?'COLLECTED ✓':money(price)}<small>${owned?'TONIGHT':'PAY ON COLLECTION'}</small></div><div class='shop-card-actions'>${i.kind==='record'?`<button class='shop-preview' data-key='preview-${i.id}' data-preview='${i.id}' aria-pressed='${preview===i.id}'>${preview===i.id?'■ STOP PREVIEW':'▷ LISTEN · 8 SEC'}</button>`:''}<button class='shop-select' data-key='select-${i.id}' data-select='${i.id}' ${unavailable||short?'disabled':''}>${short?'NEED '+money(price-life.wallet)+' MORE':selected&&i.kind==='record'?'KEEP THIS SELECTION':unavailable?'ALREADY COLLECTED':selectLabel(i)} <span>↗</span></button></div></div></article>`;
    }).join('')||`<p class='shop-home-intro'>You’ve collected every selection tonight. Switch to Show everything to revisit your favorites.</p>`}</div><aside class='shop-note'><span>FROM THE COUNTER</span><p>Browsing is always free. For a little extra pocket money, take a paid shift here. Three orders, a pay envelope, and a place to come back to.</p></aside>`;
  }
  function renderJournal() {
    const keepsakes=LOCAL_VENUES.flatMap(v=>v.items.filter(i=>state.neighborhood?.purchases.includes(i.id)).map(i=>({...i,kind:'keepsake',color:v.color})));
    const pocketItems=[...(state.inventory||[]),...keepsakes];
    const delivery=state.neighborhood?.active;
    const nextStop=delivery?LOCAL_VENUES.find(v=>v.id===ROUTE_STOPS[delivery.stop]):null;

    return `<div class="shop-heading"><p class="shop-eyebrow">PROPERTY OF THE PERSON IN THE VISOR</p><h1>The night, in your pocket.</h1><p>A few things to keep. A few people to find.</p></div><button class="shop-career-link" data-life>LIFE ON 47TH · WALLET, JOBS &amp; APARTMENTS ↗</button><article class="journal-errand"><span>↗</span><div><small>${delivery?'PARCEL IN YOUR POCKET · $30 ON COMPLETION':'NEW ON THE EAST SIDE'}</small><h2>${delivery?`Next stop: ${esc(nextStop.name)}`:'Three counters. A new neighborhood.'}</h2><p>${delivery?'Your delivery is saved. Bring the parcel to the counter.':'Visit the bookshop, bakery and arcade. Collect keepsakes, play Signal Match or earn $30 on a delivery round.'}</p><button data-destination="${delivery?nextStop.id:'bakery'}">${delivery?'CONTINUE MY ROUND':'FIND SUNRISE BAKERY'} ↗</button></div></article><nav class="journal-tabs" aria-label="Notebook sections">${["pockets", "leads", "map", "passport", "photos"].map((t) => `<button data-tab="${t}" data-key="tab-${t}" aria-current="${tab === t ? "page" : "false"}">${t === "map" ? "THE BLOCK" : t.toUpperCase()} ${t === "pockets" ? `<small>${pocketItems.length || 0}</small>` : ""}</button>`).join("")}</nav>${
      tab === "pockets"
        ? `<div class="journal-pockets">${state.style ? `<article class="pocket-portrait">${portraitSVG(state.style.id, state.style.color)}<div><p class="shop-eyebrow">TONY'S PORTRAIT</p><h2>${esc(state.style.name)}</h2><p>Your next night stamp includes this look.</p></div></article>` : ""}${pocketItems.length ? pocketItems.map((i) => `<article class="pocket-item"><span style="background:${esc(i.color)}">${i.kind === "record" ? "◎" : i.kind === "flowers" ? "✿" : i.kind === "gin" ? "♧" : "◇"}</span><div><small>${esc(i.kind)}</small><h2>${esc(i.name)}</h2><p>${esc(i.description || "Collected on 47th Street.")}</p></div></article>`).join("") : '<div class="journal-empty"><span>◇</span><h2>Room for a good evening.</h2><p>Start at Rex’s across the street. Sid has a record REXA needs to hear.</p><button data-destination="records">FIND REX’S ↗</button></div>'}</div><div class="journal-log"><p class="shop-eyebrow">THE VISOR REMEMBERS</p>${
            (state.log || [])
              .slice(-8)
              .reverse()
              .map((l) => `<p>— ${esc(l)}</p>`)
              .join("") || "<p>The first page is yours.</p>"
          }</div>`
        : tab === "leads"
          ? `<div class="journal-errands">${errands.map((e) => `<article class="journal-errand ${e.complete ? "done" : ""}"><span>${e.complete ? "✓" : "○"}</span><div><small>${e.complete ? "DELIVERED" : "A LEAD WORTH FOLLOWING"}</small><h2>${esc(e.title)}</h2><p>${esc(e.description)}</p>${e.complete ? "" : `<button data-destination="${esc(e.target)}">MARK THE WAY ↗</button>`}</div></article>`).join("")}</div>`
          : tab === "passport"
            ? passportHTML(state.expansion)
            : tab === "photos"
              ? albumHTML(state.expansion)
              : renderMap()
    }`;
  }
  function renderMap() {
    const shopIds = [
      "records",
      "pharmacy",
      "florist",
      "rivoli",
      "liquor",
      "barber",
    ];
    const pin = (id) => {
      const d = DESTINATIONS.find((d) => d.id === id);
      return `<button class="map-place ${zone === id ? "here" : ""}" data-destination="${id}"><span>${esc(d.name)}</span><small>${zone === id ? "YOU ARE HERE" : "MARK THE WAY ↗"}</small></button>`;
    };
    return `<div class="block-map"><p class="map-north">↑ UPTOWN <span>WALKING MAP · NOT TO SCALE</span></p><div class="map-shops">${shopIds.map(pin).join("")}</div><div class="map-street"><span>← WEST</span><strong>47TH STREET</strong><span>EAST →</span></div><div class="map-subway">${pin("subway")}</div><div class="map-near">${["diner", "club", "hotel"].map(pin).join("")}</div><p class="map-detail">Club east stairs → Velma, Marco & Frank<br>Astoria east stairs → 2F & the 4B ice machine</p><div class="map-alley">${pin("alley")}</div><p class="shop-eyebrow">NEW ON THE SIDEWALK</p><div class="map-new-places">${["noticeboard", "busker", "nightcart", "camera", "payphone", "property", "clubdesk"].map(pin).join("")}</div><p class="shop-eyebrow">THE EAST SIDE · KEEP WALKING EAST ALONG 47TH</p><div class="map-new-places">${["books", "bakery", "arcade", "mercer", "hawthorne", "eastavenue", "48th"].map(pin).join("")}</div><p class="map-detail">Mercer Garden is just past the Corner Set. Continue to East Avenue for Hawthorne Park, then turn north for 48th Street. Enter Blue Note Books, Sunrise Bakery and Eastern Arcade. Rosa’s bakery has $30 courier rounds.</p><p class="shop-eyebrow">WALK THE WHOLE BLOCK</p><div class="map-new-places">${["northloop", "southloop"].map(pin).join("")}</div><p class="map-detail">West Avenue and Riverside Avenue join 46th and 49th Streets into a continuous loop. East Avenue connects the cross streets. The covered passage behind the club leads directly to 46th Street.</p></div>`;
  }
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      exit();
      return;
    }
    if (e.key === "Tab") {
      const all = [...root.querySelectorAll("button:not(:disabled)")].filter(
        (el) => !el.closest("[hidden]"),
      );
      const first = all[0],
        last = all.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    e.stopPropagation();
  });
  root.addEventListener("keyup", (e) => e.stopPropagation());
  return {
    get isOpen() {
      return !root.hidden;
    },
    openShop(s, data, ctx = {}) {
      if(shop?.id!==s.id) {department="tonight";unownedOnly=false;}
      shop = s;
      state = data;
      context = ctx;
      open();
    },
    openJournal(data, leads = [], currentZone = "street", section = "pockets") {
      shop = null;
      state = data;
      errands = leads;
      zone = currentZone;
      tab = section;
      open();
    },
    update(data, ctx) {
      state = data;
      if (ctx) context = ctx;
      if (!root.hidden) render();
    },
    stopPreview() {
      preview = null;
      if (!root.hidden) render();
    },
    showReceipt(i, message) {
      const box = root.querySelector(".shop-receipt");
      if (!box) return;
      box.hidden = false;
      box.innerHTML = `<span>✓</span><div><strong>${esc(i?.name || "A good turn")}</strong><p>${esc(message)}</p></div><button aria-label="Dismiss receipt">×</button>`;
      box.querySelector("button").onclick = () => {
        box.hidden = true;
      };
    },
    close,
  };
}
