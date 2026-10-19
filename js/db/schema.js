/* SQLite schema for VIBE CHECK 9000 saves. Pure: no DOM, no three, no worker — imported by the database
   worker and by the Node tests (which run the same SQL on the in-memory WebAssembly build).

   Tables
   - meta          key/value facts about this database
   - saves         the current snapshot per slot (the whole progress object as JSON)
   - save_history  rolling autosave restore points (newest HISTORY_LIMIT kept)
   - items         everything the player carries or owns, one row per item
   - entities      world objects with positions, indexed by kind + 64 m chunk for region queries
   - npc_state     per-character memory and position overrides
   - story         chapter / objective progress
   - events        an append-only log of what happened (talks, purchases, story beats)
   - outbox        filled by triggers on every write: the queue a future multiplayer sync drains */

export const SCHEMA_VERSION = 1;
export const HISTORY_LIMIT = 20;
export const CHUNK = 64;
export const DB_FILE = "/vc9k.sqlite3";

export const MIGRATIONS = [
  // v1
  `
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS saves (
    slot TEXT PRIMARY KEY, version INTEGER NOT NULL, seq INTEGER NOT NULL,
    saved_at INTEGER NOT NULL, day TEXT, data TEXT NOT NULL CHECK (json_valid(data))
  );
  CREATE TABLE IF NOT EXISTS save_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT, slot TEXT NOT NULL, seq INTEGER NOT NULL,
    saved_at INTEGER NOT NULL, label TEXT, data TEXT NOT NULL CHECK (json_valid(data))
  );
  CREATE INDEX IF NOT EXISTS save_history_slot ON save_history(slot, id DESC);
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY, owner TEXT NOT NULL DEFAULT 'player', kind TEXT NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1, data TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS items_owner ON items(owner, kind);
  CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY, kind TEXT NOT NULL, x REAL NOT NULL, y REAL NOT NULL DEFAULT 0, z REAL NOT NULL,
    yaw REAL NOT NULL DEFAULT 0, cell INTEGER NOT NULL, state TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS entities_cell ON entities(cell, kind);
  CREATE INDEX IF NOT EXISTS entities_kind ON entities(kind);
  CREATE TABLE IF NOT EXISTS npc_state (
    id TEXT PRIMARY KEY, x REAL, z REAL, yaw REAL, mood TEXT, memory TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS story (
    quest TEXT PRIMARY KEY, state TEXT NOT NULL, step INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, kind TEXT NOT NULL, data TEXT NOT NULL DEFAULT '{}'
  );
  CREATE INDEX IF NOT EXISTS events_kind ON events(kind, id);
  CREATE TABLE IF NOT EXISTS outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT, tbl TEXT NOT NULL, row_id TEXT NOT NULL, op TEXT NOT NULL, at INTEGER NOT NULL
  );
  ${["items", "entities", "npc_state", "story"].map((t) => `
  CREATE TRIGGER IF NOT EXISTS ${t}_outbox_ins AFTER INSERT ON ${t} BEGIN
    INSERT INTO outbox(tbl,row_id,op,at) VALUES ('${t}', NEW.${t === "story" ? "quest" : "id"}, 'upsert', NEW.updated_at); END;
  CREATE TRIGGER IF NOT EXISTS ${t}_outbox_upd AFTER UPDATE ON ${t} BEGIN
    INSERT INTO outbox(tbl,row_id,op,at) VALUES ('${t}', NEW.${t === "story" ? "quest" : "id"}, 'upsert', NEW.updated_at); END;
  CREATE TRIGGER IF NOT EXISTS ${t}_outbox_del AFTER DELETE ON ${t} BEGIN
    INSERT INTO outbox(tbl,row_id,op,at) VALUES ('${t}', OLD.${t === "story" ? "quest" : "id"}, 'delete', CAST(strftime('%s','now') AS INTEGER) * 1000); END;`).join("")}
  `,
];

/** Applies every migration newer than the database's user_version. `db` is a sqlite3 oo1 DB. */
export function migrate(db) {
  const current = Number(db.selectValue("PRAGMA user_version")) || 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
    });
  }
  db.exec({ sql: "INSERT INTO meta(key,value) VALUES ('schema',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", bind: [String(SCHEMA_VERSION)] });
  return Number(db.selectValue("PRAGMA user_version"));
}

/** 64 m chunk id for a world position; matches the open-world streaming grid. */
export function chunkCell(x, z) {
  const cx = Math.floor(x / CHUNK) + 512;
  const cz = Math.floor(z / CHUNK) + 512;
  return cz * 1024 + cx;
}

/** Every chunk id overlapping an axis-aligned rectangle (inclusive). */
export function cellsIn(minX, maxX, minZ, maxZ) {
  const out = [];
  for (let cz = Math.floor(minZ / CHUNK); cz <= Math.floor(maxZ / CHUNK); cz++)
    for (let cx = Math.floor(minX / CHUNK); cx <= Math.floor(maxX / CHUNK); cx++) out.push((cz + 512) * 1024 + cx + 512);
  return out;
}

/** Rows derived from a progress snapshot: what the player carries/owns, and story progress. */
export function rowsFromProgress(progress, now = Date.now()) {
  const items = [];
  const c = progress?.night?.commerce || {};
  for (const it of c.inventory || []) if (it?.id) items.push({ id: `inv:${it.id}`, owner: "player", kind: it.kind || "item", qty: 1, data: JSON.stringify({ name: it.name || it.id }), updated_at: now });
  const life = c.life || {};
  for (const h of life.properties || []) items.push({ id: `home:${h}`, owner: "player", kind: "home", qty: 1, data: JSON.stringify({ active: life.home === h }), updated_at: now });
  for (const f of life.furnishings || []) items.push({ id: `furn:${f}`, owner: "player", kind: "furnishing", qty: 1, data: JSON.stringify({ installed: (life.installed || []).includes(f) }), updated_at: now });
  for (const k of Object.keys(c.neighborhood?.purchases || {})) items.push({ id: `keepsake:${k}`, owner: "player", kind: "keepsake", qty: 1, data: "{}", updated_at: now });
  const story = [];
  const s = progress?.story;
  if (s && typeof s === "object") {
    for (const [quest, q] of Object.entries(s.quests || {})) story.push({ quest, state: String(q.state || "active"), step: Number(q.step) || 0, data: JSON.stringify(q), updated_at: now });
  }
  return { items, story };
}
