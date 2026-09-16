// Run against `npm start`: VIBE_TEST_URL=http://127.0.0.1:8000 npm run test:browser
// Browser setup uses a local-only inspection API; purchases and dialogue use the real UI.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const url = process.env.VIBE_TEST_URL || "http://127.0.0.1:8000";
const session = process.env.VIBE_TEST_SESSION || "vibe-shop-regression";
const output = resolve(
  process.env.VIBE_TEST_OUTPUT || "/tmp/vibe-check-browser",
);
mkdirSync(output, { recursive: true });
const cli = (...args) =>
  execFileSync(
    "npx",
    ["--yes", "agent-browser@0.37.1", "--session", session, ...args],
    { encoding: "utf8", timeout: 60000 },
  );
const evaluate = (source) => JSON.parse(cli("eval", source).trim());
const screenshot = (name) => cli("screenshot", `${output}/${name}.png`);
const state = () => evaluate("window.__vibeInspect.snapshot()");
const reports = [];
const check = (name, fn) => {
  fn();
  reports.push(name);
  console.log(`ok  ${name}`);
};
function setupHelpers() {
  evaluate(`(async()=>{
        const {NPCS}=await import('./js/people.js');
        const frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        window.journey={
            async place(x,z,lx,lz,y=0){window.__vibeInspect.place(x,z,lx,lz,y);await frame();return window.__vibeInspect.snapshot().target;},
            key(key){window.dispatchEvent(new KeyboardEvent('keydown',{key}));window.dispatchEvent(new KeyboardEvent('keyup',{key}));},
            close(){document.querySelector('.shop-overlay:not([hidden]) .shop-close')?.click();document.querySelector('#talk:not(.hidden) #talkClose')?.click();},
            async person(id){this.close();const n=NPCS.find(n=>n.id===id);await this.place(n.x,n.z+(id==="rexa"?1.9:-1.9),n.x,n.z,n.y||0);this.key('e');await frame();if(document.body.dataset.phase!=="talk")throw Error("No conversation with "+id+": "+JSON.stringify(window.__vibeInspect.snapshot().position));return document.getElementById('talkName').textContent;},
            choice(text){const b=[...document.querySelectorAll('#talkChoices button')].find(b=>b.textContent.includes(text));if(!b)throw Error('Missing dialogue: '+text+'; visible choices: '+document.getElementById('talkChoices').textContent+'; phase: '+document.body.dataset.phase);b.click();},
            select(id){const b=document.querySelector('[data-select="'+id+'"]');if(!b)throw Error('Missing catalog item '+id);b.click();},
            async shop(x,z,lx,lz){this.close();await this.place(x,z,lx,lz);this.key('e');await frame();if(document.body.dataset.phase==='talk'){document.querySelector('#talkChoices button').click();await frame();}return document.querySelector('.shop-heading h1')?.textContent;},
            frame,
        };return true;
    })()`);
}
try {
  cli("open", `${url}/?inspect=1`);
  cli("wait", "--load", "networkidle");
  assert.equal(
    evaluate("!!window.__vibeInspect"),
    true,
    "world must finish booting",
  );
  evaluate(
    `(async()=>{const {PROGRESS_KEY}=await import('./js/progress.js');localStorage.removeItem(PROGRESS_KEY);return true;})()`,
  );
  cli("open", `${url}/?inspect=1`);
  cli("wait", "--load", "networkidle");
  cli("find", "role", "button", "click", "--name", "ENTER THE NIGHT");
  setupHelpers();
  check("Rex’s catalog opens from a physical record bin", () => {
    assert.equal(
      evaluate("journey.shop(-35.1,33.8,-36.5,33.8)"),
      "Rex's Records",
    );
    assert.equal(
      evaluate('document.querySelectorAll("[data-select]").length'),
      3,
    );
  });
  screenshot("records-catalog");
  check("record preview starts and stops on closing catalog", () => {
    evaluate(
      'document.querySelector("[data-preview=blue-hour]").click(); true',
    );
    assert.equal(state().audio.preview, true);
    evaluate('journey.select("blue-hour");journey.close();true');
    assert.equal(state().audio.preview, false);
    assert.equal(state().commerce.record.id, "blue-hour");
  });
  check("B-side delivery changes REXA’s set", () => {
    assert.equal(evaluate('journey.person("rexa")'), "REXA");
    evaluate('journey.choice("B-side");true');
    assert.equal(state().set.name, "BLUE HOUR");
    assert.equal(state().audio.bpm, 112);
    assert.ok(state().commerce.deliveries.includes("rexa"));
  });
  check("pharmacy fountain serves a drink", () => {
    assert.equal(
      evaluate("journey.shop(-23,33.6,-24.2,33.6)"),
      "47th Pharmacy",
    );
    evaluate('journey.select("mint-tonic");true');
    assert.ok(state().progress.night.flags.tonic);
  });
  screenshot("pharmacy-catalog");
  check("Lily’s bouquet reaches Velma", () => {
    assert.equal(evaluate("journey.shop(-12.2,35.1,-12.2,36.7)"), "Lily's");
    evaluate('journey.select("golden-hour");journey.close();true');
    assert.equal(evaluate('journey.person("velma")'), "VELMA");
    evaluate('journey.choice("bouquet");true');
    assert.ok(state().commerce.deliveries.includes("velma"));
    assert.equal(
      state().commerce.inventory.some((i) => i.kind === "flowers"),
      false,
    );
  });
  check("sealed gin reaches Marco", () => {
    assert.equal(evaluate("journey.shop(24.6,34.8,24.6,36.5)"), "Midtown Gin");
    evaluate('journey.select("house-dry");journey.close();true');
    assert.equal(evaluate('journey.person("marco")'), "MARCO");
    evaluate('journey.choice("bottle");true');
    assert.ok(state().commerce.deliveries.includes("marco"));
  });
  check("Nellie gives directions; the machine supplies Frank’s ice", () => {
    assert.equal(evaluate('journey.person("nellie")'), "NELLIE");
    evaluate('journey.choice("take the ice");true');
    assert.equal(
      state().commerce.inventory.some((i) => i.kind === "ice"),
      false,
    );
    evaluate(
      '(async()=>{await journey.place(32,-7.1,32,-8.5,4.4);journey.key("e");await journey.frame();return true;})()',
    );
    assert.ok(state().commerce.inventory.some((i) => i.kind === "ice"));
    assert.equal(evaluate('journey.person("frank")'), "FRANK");
    evaluate('journey.choice("brought your ice");true');
    assert.ok(state().commerce.deliveries.includes("frank"));
  });
  check("Tony seats the player and saves a portrait", () => {
    assert.equal(
      evaluate("journey.shop(35.8,34.2,35.9,36.4)"),
      "Tony's Barber",
    );
    screenshot("barber-catalog");
    evaluate('journey.select("side-part");true');
    assert.equal(state().sitting, true);
    assert.equal(state().commerce.style.id, "side-part");
  });
  check("Rivoli ticket seats player facing an animated film", () => {
    assert.equal(evaluate("journey.shop(6,34,6,35.6)"), "The Rivoli");
    screenshot("rivoli-program");
    evaluate('journey.select("cats");true');
    assert.equal(state().sitting, true);
    assert.equal(state().commerce.film.id, "cats");
    const before = state().filmVersion;
    evaluate(
      "(async()=>{for(let i=0;i<24;i++)await journey.frame();return true;})()",
    );
    assert.ok(state().filmVersion > before);
  });
  screenshot("rivoli-screen");
  check("Dottie serves pie and tells the story after midnight", () => {
    assert.equal(
      evaluate("journey.shop(-28.6,0,-28.6,1.55)"),
      "Dottie's Diner",
    );
    screenshot("diner-menu");
    evaluate('journey.select("cherry-pie");true');
    assert.equal(state().sitting, true);
    evaluate("window.__vibeInspect.advance(451);true");
    assert.equal(evaluate('journey.person("dottie")'), "DOTTIE");
    evaluate('journey.choice("booth after midnight");true');
    assert.ok(state().commerce.completed.includes("midnight-story"));
    evaluate("journey.close();true");
  });
  check("notebook tracks deliveries and marks a destination", () => {
    evaluate('document.getElementById("journalBtn").click();true');
    screenshot("pocket-notebook");
    evaluate('document.querySelector("[data-tab=leads]").click();true');
    assert.ok(
      evaluate('document.querySelectorAll(".journal-errand.done").length') >= 4,
    );
    evaluate('document.querySelector("[data-tab=map]").click();true');
    screenshot("block-map");
    evaluate(
      'document.querySelector("[data-destination=records]").click();true',
    );
    assert.equal(state().phase, "explore");
  });
  check("night stamp includes Tony’s portrait", () => {
    const stamp = evaluate(
      `(async()=>{const {drawNightCard}=await import('./js/share.js');const style=window.__vibeInspect.snapshot().commerce.style;const c=drawNightCard({style});return {width:c.width,height:c.height,data:c.toDataURL()};})()`,
    );
    assert.equal(stamp.width, 960);
    assert.equal(stamp.height, 540);
    writeFileSync(
      `${output}/night-stamp.png`,
      Buffer.from(stamp.data.split(",")[1], "base64"),
    );
  });
  check("completed night survives reload", () => {
    cli("open", `${url}/?inspect=1`);
    cli("wait", "--load", "networkidle");
    assert.deepEqual(state().commerce.deliveries.sort(), [
      "frank",
      "marco",
      "rexa",
      "velma",
    ]);
    assert.equal(state().commerce.style.id, "side-part");
    assert.equal(state().set.name, "BLUE HOUR");
    cli("find", "role", "button", "click", "--name", "ENTER THE NIGHT");
    setupHelpers();
  });
  check(
    "phone-sized catalog has no horizontal overflow and usable actions",
    () => {
      cli("set", "viewport", "390", "844");
      evaluate("journey.shop(-35.1,33.8,-36.5,33.8)");
      screenshot("records-mobile");
      assert.equal(
        evaluate(
          'document.querySelector(".shop-sheet").scrollWidth <= document.querySelector(".shop-sheet").clientWidth',
        ),
        true,
      );
      assert.ok(
        evaluate(
          'Array.from(document.querySelectorAll(".shop-select")).every(b=>b.getBoundingClientRect().height>=40)',
        ),
      );
      evaluate(
        'journey.close();document.getElementById("journalBtn").click();document.querySelector("[data-tab=map]").click();true',
      );
      screenshot("map-mobile");
    },
  );
  check("reduced effects do not mute audio", () => {
    evaluate(
      'journey.close();document.getElementById("settingsBtn").click();document.getElementById("fxToggle").checked=true;document.getElementById("fxToggle").dispatchEvent(new Event("change",{bubbles:true}));true',
    );
    assert.equal(state().audio.muted, false);
    evaluate('document.getElementById("settingsClose").click();true');
  });
  const errors = cli("errors").trim();
  assert.equal(errors, "", `Browser errors: ${errors}`);
  writeFileSync(
    `${output}/report.json`,
    JSON.stringify({ passed: reports, url, output }, null, 2),
  );
  console.log(`Browser journeys passed. Screenshots: ${output}`);
} catch (error) {
  screenshot("failure");
  console.error(
    cli(
      "eval",
      '({phase:document.body.dataset.phase,position:window.__vibeInspect?.snapshot().position,choices:document.getElementById("talkChoices").textContent})',
    ),
  );
  throw error;
} finally {
  cli("close");
}
