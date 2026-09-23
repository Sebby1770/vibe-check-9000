#!/usr/bin/env node
/* Headless scene driver for visual checks. Needs a static server (default http://127.0.0.1:8232).
   node tests/tools/scene.mjs audit                         → sign/billboard geometry audit (JSON)
   node tests/tools/scene.mjs shot <name> x z lx ly lz [y]  → screenshot from (x, y+1.7, z) looking at (lx,ly,lz)
   node tests/tools/scene.mjs boot <name> [WxH]             → screenshot of the opening screen
   node tests/tools/scene.mjs eval "<js expression>"        → evaluate in the entered game
   Env: VIBE_TEST_URL, VIBE_SESSION (use a unique session per agent), VIBE_OUT (screenshot dir). */
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const url = process.env.VIBE_TEST_URL || "http://127.0.0.1:8232";
const session = process.env.VIBE_SESSION || "vibe-scene";
const out = process.env.VIBE_OUT || "/tmp/vibe-scene";
mkdirSync(out, { recursive: true });
const cli = (...args) => execFileSync("npx", ["--yes", "agent-browser@0.37.1", "--session", session, ...args], { encoding: "utf8", timeout: 120000 });
const ev = (s) => { const raw = cli("eval", s).trim(); try { return JSON.parse(raw); } catch { return raw; } };

function open(size = "1440x900", enter = true) {
  const [w, h] = size.split("x").map(Number);
  try { cli("set", "viewport", String(w), String(h)); } catch { /* older CLI: keep default viewport */ }
  cli("open", `${url}/?inspect=1`);
  cli("wait", "--fn", "!!window.__vibeInspect");
  cli("wait", "900");
  if (enter) {
    ev("document.getElementById('enterBtn').click(); true");
    cli("wait", "1200");
  }
}

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === "audit") {
    open();
    const res = ev(`(async()=>{const {auditSigns}=await import('./tests/tools/sign-audit.js?'+Date.now());const r=auditSigns(window.__vibeInspect.world);return JSON.stringify({count:r.count,issues:r.issues,signs:r.signs.map(s=>({label:s.label,pos:s.pos,normal:s.normal,w:s.w,h:s.h,behind:s.behind}))});})()`);
    process.stdout.write(typeof res === "string" ? res : JSON.stringify(res));
  } else if (cmd === "shot") {
    const [name, x, z, lx, ly, lz, y = "0"] = rest;
    open(process.env.VIBE_SIZE || "1440x900");
    ev(`(async()=>{const I=window.__vibeInspect;I.place(${x},${z},${lx},${lz},${y});I.look(${lx},${ly},${lz});await new Promise(r=>setTimeout(r,700));I.look(${lx},${ly},${lz});return true;})()`);
    cli("wait", "400");
    const file = `${out}/${name}.png`;
    cli("screenshot", file);
    console.log(file);
  } else if (cmd === "boot") {
    const [name, size = "1440x900"] = rest;
    open(size, false);
    cli("wait", "1200");
    const file = `${out}/${name}.png`;
    cli("screenshot", file);
    console.log(file);
  } else if (cmd === "eval") {
    open();
    console.log(JSON.stringify(ev(rest.join(" "))));
  } else {
    console.error("usage: scene.mjs audit | shot <name> x z lx ly lz [y] | boot <name> [WxH] | eval <js>");
    process.exitCode = 2;
  }
} finally {
  try { cli("close"); } catch { /* already closed */ }
}
