/* Deploy-time cache busting for the GitHub Pages build. The game ships as plain ES modules, so a browser
   that cached last night's world.js would happily run it against tonight's main.js. Every relative module
   URL gets ?v=<build> (static imports, re-exports, dynamic import() and new URL(..., import.meta.url) for
   workers), and so do index.html's entry script and stylesheets. Vendored three.js and sqlite are pinned
   versions and keep their URLs. The title's build stamp shows which deploy you're looking at.

   node tools/stamp-build.mjs <site dir> <build id> [date] */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SPEC = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\bnew\s+URL\s*\(\s*)(["'])(\.{1,2}\/[^"'?#\s]+?\.m?js)\2/g;

/** Appends ?v=<build> to every relative .js/.mjs module specifier in a source file. */
export function stampSource(code, build) {
  return code.replace(SPEC, (_, lead, q, path) => `${lead}${q}${path}?v=${build}${q}`);
}

/** Versions the entry module and local stylesheets in index.html and fills in the build stamp. */
export function stampHtml(html, build, label = `build ${build}`) {
  return html
    .replace(/(<script\b[^>]*\bsrc=")((?!https?:|\/\/)[^"?]+\.m?js)(")/g, `$1$2?v=${build}$3`)
    .replace(/(<link\b[^>]*\bhref=")((?!https?:|\/\/|data:)[^"?]+\.css)(")/g, `$1$2?v=${build}$3`)
    .replace(/data-build="dev"/g, `data-build="${build}"`)
    .replace(/(<[^>]+id="bootBuild"[^>]*>)[^<]*(<)/, `$1${label}$2`);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.m?js$/.test(name)) out.push(p);
  }
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const [site, build, date] = process.argv.slice(2);
  if (!site || !build) { console.error("usage: node tools/stamp-build.mjs <site dir> <build id> [date]"); process.exit(1); }
  const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const label = [`v${version}`, `build ${build}`, date].filter(Boolean).join(" · ");
  let files = 0, specs = 0;
  for (const file of walk(join(site, "js"))) {
    const src = readFileSync(file, "utf8"), out = stampSource(src, build);
    if (out !== src) { writeFileSync(file, out); files++; specs += (out.match(/\?v=/g) || []).length - (src.match(/\?v=/g) || []).length; }
  }
  const index = join(site, "index.html");
  writeFileSync(index, stampHtml(readFileSync(index, "utf8"), build, label));
  console.log(`stamped ${label}: ${specs} module URLs in ${files} files, plus index.html`);
}
