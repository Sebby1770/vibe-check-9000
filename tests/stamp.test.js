import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { stampSource, stampHtml } from "../tools/stamp-build.mjs";

const B = "abc1234";

// Every relative module specifier form the game uses gets the build query.
assert.equal(stampSource(`import * as THREE from "three";`, B), `import * as THREE from "three";`, "bare specifiers go through the importmap untouched");
assert.equal(stampSource(`import { a } from "./a.js";`, B), `import { a } from "./a.js?v=${B}";`);
assert.equal(stampSource(`import {polishShop} from'./shop-polish.js';`, B), `import {polishShop} from'./shop-polish.js?v=${B}';`, "minified spacing");
assert.equal(stampSource(`export { x } from "../x.js";`, B), `export { x } from "../x.js?v=${B}";`, "re-exports");
assert.equal(stampSource(`import "./side.js";`, B), `import "./side.js?v=${B}";`, "side-effect imports");
assert.equal(stampSource(`await import("../../vendor/sqlite/index.mjs")`, B), `await import("../../vendor/sqlite/index.mjs?v=${B}")`, "dynamic imports");
assert.equal(stampSource(`new Worker(new URL("./db-worker.js", import.meta.url), { type: "module" })`, B), `new Worker(new URL("./db-worker.js?v=${B}", import.meta.url), { type: "module" })`, "workers");
assert.equal(stampSource(`import { a } from "./a.js?v=old";`, B), `import { a } from "./a.js?v=old";`, "already versioned URLs are left alone");
assert.equal(stampSource(`const s = "./notes.txt"; fetch("./data.json");`, B), `const s = "./notes.txt"; fetch("./data.json");`, "non-module strings are untouched");

// Every relative import in the real source tree is one the stamp recognises.
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : /\.m?js$/.test(n) && !/ \d\.js$/.test(n) ? [p] : []; });
for (const file of walk("js")) {
  const src = readFileSync(file, "utf8"), out = stampSource(src, B);
  const missed = out.split("\n").filter((l) => /^\s*(import|export)\b[^;]*["']\.{1,2}\/[^"']+\.m?js["']/.test(l));
  assert.deepEqual(missed, [], `${file}: unversioned relative import`);
}

// index.html: the entry module and local stylesheets are versioned, the CDN font link and importmap are not.
const html = readFileSync("index.html", "utf8"), out = stampHtml(html, B, "v31.0.0 · build abc1234");
assert.ok(out.includes(`<script type="module" src="js/main.js?v=${B}"></script>`));
assert.ok(out.includes(`href="style.css?v=${B}"`) && out.includes(`href="story.css?v=${B}"`));
assert.ok(!/fonts\.googleapis\.com[^"]*\?v=/.test(out.replace(/css2\?family/, "")), "Google Fonts URL keeps its own query");
assert.ok(out.includes(`"three": "./vendor/three/build/three.module.js"`), "importmap untouched");
assert.ok(out.includes(`data-build="${B}">v31.0.0 · build abc1234</p>`), "build stamp filled in");
assert.equal((out.match(/\?v=abc1234/g) || []).length, (html.match(/<link rel="stylesheet" href="[a-z-]+\.css">/g) || []).length + 1);

console.log("stamp tests passed");
