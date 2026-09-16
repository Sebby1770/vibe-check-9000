import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
const url = process.env.VIBE_TEST_URL || "http://127.0.0.1:8000",
  session = process.env.VIBE_TEST_SESSION || "vibe-expansion",
  output = process.env.VIBE_TEST_OUTPUT || "/tmp/vibe-check-expansion";
mkdirSync(output, { recursive: true });
const cli = (...args) =>
  execFileSync(
    "npx",
    ["--yes", "agent-browser@0.37.1", "--session", session, ...args],
    { encoding: "utf8", timeout: 60000 },
  );
const ev = (s) => JSON.parse(cli("eval", s).trim());
const shot = (n) => cli("screenshot", `${output}/${n}.png`);
const state = () => ev("window.__vibeInspect.snapshot()");
const reports = [];
const check = (title, fn) => {
  fn();
  reports.push(title);
  console.log(`ok  ${title}`);
};
function helpers() {
  ev(`(async()=>{
 const {counterBrief,STREET_PLACES,rhythmPhrase}=await import('./js/expansion.js');const {dayHash,dayKey}=await import('./js/night.js');
 const frames=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 window.walk={
 key(key){window.dispatchEvent(new KeyboardEvent('keydown',{key}));window.dispatchEvent(new KeyboardEvent('keyup',{key}));},
 async close(){document.querySelector('.activity-overlay:not([hidden]) [data-close]')?.click();document.querySelector('.shop-overlay:not(.activity-overlay):not([hidden]) .shop-close')?.click();document.querySelector('#talk:not(.hidden) #talkClose')?.click();await frames();},
 async place(x,z,lx,lz,y=0){window.__vibeInspect.place(x,z,lx,lz,y);await frames();return window.__vibeInspect.snapshot().target;},
 async street(id){await this.close();const p=STREET_PLACES.find(p=>p.id===id);await this.place(p.x,p.z+(id==='busker'?2:id==='payphone'?-1.5:-1.8),p.x,p.z);this.key('e');await frames();if(document.body.dataset.phase!=='activity')throw Error('Street target failed '+id+': '+window.__vibeInspect.snapshot().target);return document.querySelector('.activity-heading h1').textContent;},
 async shop(pose){await this.close();await this.place(...pose);this.key('e');await frames();if(document.body.dataset.phase==='talk'){document.querySelector('#talkChoices button').click();await frames();}document.querySelector('[data-workshop]').click();await frames();return document.querySelector('.activity-heading h1').textContent;},
 recipe(id){return counterBrief(id,dayHash(dayKey())).recipe;},
 choose(id){this.recipe(id).forEach((n,i)=>document.querySelector('[data-step="'+i+'"][data-pick="'+n+'"]').click());document.querySelector('[data-submit]').click();},
 phrase(round){return rhythmPhrase(round,dayHash(dayKey()));},frames
 };return true;})()`);
}
try {
  cli("open", url + "/?inspect=1");
  cli("wait", "--fn", "!!window.__vibeInspect");
  assert.ok(ev("!!window.__vibeInspect"));
  ev("localStorage.removeItem('vc9k-progress');true");
  cli("open", url + "/?inspect=1");
  cli("wait", "--fn", "!!window.__vibeInspect");
  cli("errors", "--clear");
  cli("find", "role", "button", "click", "--name", "ENTER THE NIGHT");
  helpers();
  const shops = [
    ["records", [-35.1, 33.8, -36.5, 33.8]],
    ["pharmacy", [-23, 33.6, -24.2, 33.6]],
    ["florist", [-12.2, 35.1, -12.2, 36.7]],
    ["liquor", [24.6, 34.8, 24.6, 36.5]],
    ["barber", [35.8, 34.2, 35.9, 36.4]],
    ["rivoli", [6, 34, 6, 35.6]],
    ["diner", [-28.6, 0, -28.6, 1.55]],
  ];
  for (const [id, pose] of shops)
    check(`${id}: assemble the daily counter order`, () => {
      ev(`walk.shop(${JSON.stringify(pose)})`);
      assert.equal(
        ev('document.querySelector("[data-submit]").disabled'),
        true,
      );
      if (id === "records") {
        ev('document.querySelectorAll("[data-step]")[0].click();true');
        shot("record-workshop");
      }
      ev(`walk.choose('${id}');true`);
      assert.ok(state().commerce.expansion.workshops[id]);
      assert.match(
        ev('document.querySelector(".activity-feedback").textContent'),
        /passport is stamped/i,
      );
      if (id === "florist") shot("bouquet-workshop");
    });
  check("all seven counters earn the regular visor", () =>
    assert.ok(state().progress.unlocked.includes("block-regular")),
  );
  check("noticeboard introduces the new street destinations", () => {
    ev('walk.street("noticeboard")');
    assert.equal(ev('document.querySelectorAll(".street-notice").length'), 5);
    shot("noticeboard");
  });
  check("Mabel serves snacks without repeat energy rewards", () => {
    ev('walk.street("nightcart")');
    ev('document.querySelector("[data-snack=chestnuts]").click();true');
    assert.equal(state().commerce.expansion.snacks.length, 1);
    ev('document.querySelector("[data-snack=chestnuts]").click();true');
    assert.equal(state().commerce.expansion.snacks.length, 1);
    shot("night-cart-menu");
  });
  check(
    "play a three-phrase street duet using keyboard and touch controls",
    () => {
      ev('walk.street("busker")');
      for (let round = 0; round < 3; round++) {
        ev('document.querySelector("[data-listen]").click();true');
        cli("wait", String(2000 + round * 600));
        ev(
          `walk.phrase(${round}).forEach(n=>${round === 0 ? 'document.activeElement.dispatchEvent(new KeyboardEvent("keydown",{key:["a","s","d"][n],bubbles:true}))' : 'document.querySelector("[data-pad=\\""+n+"\\"]").click()'});true`,
        );
        assert.equal(state().commerce.expansion.rhythmBest, round + 1);
        assert.ok(
          ev(
            'document.querySelector(".activity-overlay").contains(document.activeElement)',
          ),
          "activity retains keyboard focus",
        );
      }
      assert.ok(state().progress.unlocked.includes("corner-gold"));
      shot("street-duet");
    },
  );
  check("physical clues complete the midnight frequency in order", () => {
    ev('walk.street("payphone")');
    assert.equal(state().commerce.expansion.mystery, 1);
    shot("payphone-story");
    ev('walk.street("signal-sleeve")');
    assert.equal(state().commerce.expansion.mystery, 2);
    ev('walk.street("camera")');
    ev('document.querySelector("[data-contact]").click();true');
    assert.equal(state().commerce.expansion.mystery, 3);
    ev('walk.street("lostproperty")');
    assert.equal(state().commerce.expansion.mystery, 4);
    ev('walk.street("payphone")');
    assert.equal(state().commerce.expansion.mystery, 5);
    assert.equal(state().set.id, "signal-47");
    assert.ok(state().progress.unlocked.includes("signal-silver"));
    shot("signal-complete");
  });
  check("camera captures four distinct areas from the rendered game", () => {
    ev('walk.street("camera")');
    ev('document.querySelector("[data-camera]").click();true');
    assert.ok(state().commerce.expansion.camera);
    ev("walk.close()");
    for (const pose of [
      [44, 27, 44, 31],
      [0, 8, 0, 0],
      [-27, 9, -27, 3],
      [-33.2, 33.6, -33.2, 38],
    ]) {
      ev(
        `(async()=>{await walk.place(...${JSON.stringify(pose)});walk.key('c');await walk.frames();return true;})()`,
      );
    }
    assert.equal(state().commerce.expansion.photos.length, 4);
    assert.equal(state().commerce.expansion.discoveries.length, 4);
    assert.ok(state().progress.unlocked.includes("street-photo"));
    ev(
      'document.getElementById("journalBtn").click();document.querySelector("[data-tab=photos]").click();true',
    );
    assert.equal(ev('document.querySelectorAll(".album-print").length'), 4);
    shot("photo-album");
  });
  check("a real photo becomes an exportable postcard", () => {
    const card = ev(
      `(async()=>{const {drawPhotoPostcard}=await import('./js/postcards.js');const c=await drawPhotoPostcard(window.__vibeInspect.snapshot().commerce.expansion.photos[0]);return {width:c.width,height:c.height,data:c.toDataURL()};})()`,
    );
    assert.equal(card.width, 1120);
    assert.equal(card.height, 790);
    writeFileSync(
      output + "/postcard.png",
      Buffer.from(card.data.split(",")[1], "base64"),
    );
    ev('document.querySelector("[data-delete-photo]").click();true');
    assert.equal(state().commerce.expansion.photos.length, 3);
    assert.equal(state().commerce.expansion.discoveries.length, 4);
    assert.equal(
      ev("document.activeElement.dataset.tab"),
      "photos",
      "album keeps focus after removing a picture",
    );
  });
  check("passport and completed expansion survive reload", () => {
    ev('document.querySelector("[data-tab=passport]").click();true');
    assert.equal(
      ev('document.querySelectorAll(".passport-stamp.earned").length'),
      7,
    );
    shot("passport");
    cli("open", url + "/?inspect=1");
    cli("wait", "--fn", "!!window.__vibeInspect");
    assert.equal(Object.keys(state().commerce.expansion.workshops).length, 7);
    assert.equal(state().commerce.expansion.photos.length, 3);
    assert.equal(state().commerce.expansion.mystery, 5);
    assert.equal(state().set.id, "signal-47");
    cli("find", "role", "button", "click", "--name", "ENTER THE NIGHT");
    helpers();
  });
  check(
    "phone-sized workshop, photo album, and street menu stay usable",
    () => {
      cli("set", "viewport", "390", "844");
      ev("walk.shop([-12.2,35.1,-12.2,36.7])");
      shot("workshop-mobile");
      assert.equal(
        ev(
          'document.querySelector(".activity-sheet").scrollWidth<=document.querySelector(".activity-sheet").clientWidth',
        ),
        true,
      );
      assert.equal(
        ev(
          'Array.from(document.querySelectorAll(".counter-choice")).every(b=>b.getBoundingClientRect().height>=44)',
        ),
        true,
      );
      ev("walk.close()");
      ev(
        'document.getElementById("journalBtn").click();document.querySelector("[data-tab=photos]").click();true',
      );
      shot("album-mobile");
      ev('walk.street("nightcart")');
      shot("cart-mobile");
    },
  );
  ev("walk.close()");
  cli("set", "viewport", "1440", "900");
  for (const [name, pose] of [
    ["camera-kiosk", [44, 27.7, 44, 31]],
    ["music-corner", [44, 17, 44, 14.2]],
    ["night-cart", [-44, 14.6, -44, 17.1]],
    ["street-board", [19, 14.5, 19, 17.45]],
  ]) {
    ev(`walk.place(...${JSON.stringify(pose)})`);
    shot(name);
  }
  assert.equal(
    cli("errors").trim(),
    "",
    "browser must report no unhandled errors",
  );
  writeFileSync(
    output + "/report.json",
    JSON.stringify({ passed: reports, output }, null, 2),
  );
  console.log(`Expansion journeys passed. Screenshots: ${output}`);
} catch (error) {
  shot("failure");
  console.error(
    cli(
      "eval",
      '({phase:document.body.dataset.phase,target:window.__vibeInspect?.snapshot().target,activity:document.querySelector(".activity-feedback")?.textContent})',
    ),
  );
  throw error;
} finally {
  cli("close");
}
