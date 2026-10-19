/* The save database, off the main thread. SQLite (WebAssembly) on the OPFS "SAH pool" VFS: persistent, fast,
   and needs no cross-origin-isolation headers, so it works on GitHub Pages. If OPFS is unavailable (another
   tab holds it, private mode, old browser) it falls back to an in-memory database mirrored to IndexedDB. */
import { MIGRATIONS, DB_FILE, migrate } from "./schema.js";
import { createOps } from "./ops.js";

// Keep the library quiet: optional-VFS notices are expected and are not errors for players.
globalThis.sqlite3ApiConfig = { debug() {}, log() {}, warn() {}, error() {} };

let sqlite3 = null;
let db = null;
let backend = "none";
let exportTimer = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("vc9k-sqlite", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("files");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(key) {
  const d = await idb();
  return new Promise((resolve) => {
    const r = d.transaction("files").objectStore("files").get(key);
    r.onsuccess = () => resolve(r.result || null);
    r.onerror = () => resolve(null);
  });
}
async function idbPut(key, value) {
  const d = await idb();
  return new Promise((resolve) => {
    const tx = d.transaction("files", "readwrite");
    tx.objectStore("files").put(value, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

async function open() {
  const { default: init } = await import("../../vendor/sqlite/index.mjs");
  sqlite3 = await init();
  for (let attempt = 0; attempt < 4 && !db; attempt++) {
    try {
      const pool = await sqlite3.installOpfsSAHPoolVfs({ name: "vc9k-pool", initialCapacity: 6 });
      db = new pool.OpfsSAHPoolDb(DB_FILE);
      backend = "opfs";
    } catch {
      await sleep(250 * (attempt + 1)); // a reloading tab may still be releasing its handles
    }
  }
  if (!db) {
    db = new sqlite3.oo1.DB(":memory:", "c");
    backend = "memory";
    try {
      const bytes = await idbGet("db");
      if (bytes?.byteLength) {
        const p = sqlite3.wasm.allocFromTypedArray(bytes);
        const flags = sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE | sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE;
        sqlite3.capi.sqlite3_deserialize(db.pointer, "main", p, bytes.byteLength, bytes.byteLength, flags);
        backend = "indexeddb";
      } else if (typeof indexedDB !== "undefined") backend = "indexeddb";
    } catch { /* stays in memory for this session */ }
  }
  db.exec("PRAGMA journal_mode = " + (backend === "opfs" ? "WAL" : "MEMORY") + "; PRAGMA synchronous = NORMAL;");
  const version = migrate(db);
  ops = createOps(db, { persistSoon, info: () => ({ backend, sqlite: sqlite3.version.libVersion }) });
  return { backend, version, sqlite: sqlite3.version.libVersion, migrations: MIGRATIONS.length };
}

function persistSoon() {
  if (backend !== "indexeddb") return;
  clearTimeout(exportTimer);
  exportTimer = setTimeout(() => {
    try { idbPut("db", sqlite3.capi.sqlite3_js_db_export(db.pointer)); } catch { /* next save retries */ }
  }, 400);
}

let ops = null;
let ready = null;
self.onmessage = async ({ data }) => {
  const { id, op, args } = data || {};
  try {
    if (op !== "open" && !ops) await (ready ||= open());
    const result = op === "open" ? await (ready ||= open()) : await ops[op](args || {});
    self.postMessage({ id, ok: true, result });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message || err) });
  }
};
