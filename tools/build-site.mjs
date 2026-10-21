/* Builds the public website into one folder, for GitHub Pages and Vercel alike:
     /        the VIBE CHECK 9000 website (site/)
     /play/   the game itself (index.html, styles, js/, vendor/, assets/), with every module URL versioned
   The retired v10 service worker's kill switch stays at the root, where the old worker was registered.

   node tools/build-site.mjs [out dir = dist] */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { stampSource, stampHtml } from "./stamp-build.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, process.argv[2] || "dist");
// macOS sometimes leaves "name 2.ext" copies next to real files; they are never part of the site.
const DUPLICATE = / \d+(\.[a-z]+)?$/i;
const keep = (src) => !DUPLICATE.test(src.split("/").pop()) && !src.endsWith(".DS_Store");

function build() {
  const sha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || git("rev-parse HEAD") || "local").slice(0, 7);
  const date = git("log -1 --format=%cd --date=format:%d\\ %b\\ %Y") || "";
  const { version } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const label = [`v${version}`, `build ${sha}`, date].filter(Boolean).join(" · ");

  rmSync(OUT, { recursive: true, force: true });
  const play = join(OUT, "play");
  mkdirSync(play, { recursive: true });

  // The game.
  for (const f of readdirSync(ROOT)) if (/\.css$/.test(f) && keep(f)) cpSync(join(ROOT, f), join(play, f));
  for (const f of ["index.html", "ads.config.json", "sponsor.html", "LICENSE"]) if (existsSync(join(ROOT, f))) cpSync(join(ROOT, f), join(play, f));
  for (const d of ["js", "vendor", "assets"]) if (existsSync(join(ROOT, d))) cpSync(join(ROOT, d), join(play, d), { recursive: true, filter: keep });
  let files = 0;
  for (const file of walk(join(play, "js"))) {
    const src = readFileSync(file, "utf8"), out = stampSource(src, sha);
    if (out !== src) { writeFileSync(file, out); files++; }
  }
  writeFileSync(join(play, "index.html"), stampHtml(readFileSync(join(play, "index.html"), "utf8"), sha, label));

  // The website.
  cpSync(join(ROOT, "site"), OUT, { recursive: true, filter: keep });
  const site = join(OUT, "index.html");
  writeFileSync(site, readFileSync(site, "utf8")
    .replace(/(<link\b[^>]*\bhref=")((?!https?:|\/\/|data:)[^"?]+\.css)(")/g, `$1$2?v=${sha}$3`)
    .replace(/(<script\b[^>]*\bsrc=")((?!https?:|\/\/)[^"?]+\.js)(")/g, `$1$2?v=${sha}$3`)
    .replace(/\{\{VERSION\}\}/g, `v${version}`)
    .replace(/\{\{BUILD\}\}/g, label));
  cpSync(join(ROOT, "sw.js"), join(OUT, "sw.js"));
  writeFileSync(join(OUT, ".nojekyll"), "");
  console.log(`built ${label} into ${OUT}: website at /, game at /play/ (${files} game modules versioned)`);
}

function git(args) {
  try { return execSync(`git ${args}`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; }
}
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.m?js$/.test(name)) out.push(p);
  }
  return out;
}

build();
