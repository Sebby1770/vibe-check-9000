/* The save database operations, independent of where SQLite runs: the worker calls them on the OPFS
   database, and the Node tests call them on the in-memory WebAssembly build. Pure: no DOM, no worker APIs. */
import { HISTORY_LIMIT, chunkCell, cellsIn, rowsFromProgress } from "./schema.js";

export function createOps(db, { persistSoon = () => {}, info = () => ({}) } = {}) {
  return {
  save({ slot = "main", progress, seq = 0, label = "autosave", now = Date.now() }) {
    const data = JSON.stringify(progress);
    const { items, story } = rowsFromProgress(progress, now);
    db.transaction(() => {
      db.exec({ sql: `INSERT INTO saves(slot,version,seq,saved_at,day,data) VALUES (?,?,?,?,?,?)
        ON CONFLICT(slot) DO UPDATE SET version=excluded.version, seq=excluded.seq, saved_at=excluded.saved_at, day=excluded.day, data=excluded.data`,
        bind: [slot, 1, seq, now, progress?.lastDay || null, data] });
      // A restore point at most every 20 seconds of play, or whenever a label marks a moment worth keeping.
      const last = db.selectValue("SELECT saved_at FROM save_history WHERE slot=? ORDER BY id DESC LIMIT 1", [slot]) || 0;
      if (label !== "autosave" || now - last > 20000) {
        db.exec({ sql: "INSERT INTO save_history(slot,seq,saved_at,label,data) VALUES (?,?,?,?,?)", bind: [slot, seq, now, label, data] });
        db.exec({ sql: `DELETE FROM save_history WHERE slot=? AND id NOT IN (SELECT id FROM save_history WHERE slot=? ORDER BY id DESC LIMIT ${HISTORY_LIMIT})`, bind: [slot, slot] });
      }
      const keep = new Set(items.map((r) => r.id));
      for (const id of db.selectValues("SELECT id FROM items WHERE owner='player'")) if (!keep.has(id)) db.exec({ sql: "DELETE FROM items WHERE id=?", bind: [id] });
      for (const r of items) {
        db.exec({ sql: `INSERT INTO items(id,owner,kind,qty,data,updated_at) VALUES (?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET qty=excluded.qty, data=excluded.data, updated_at=excluded.updated_at
          WHERE items.data IS NOT excluded.data OR items.qty IS NOT excluded.qty`, bind: [r.id, r.owner, r.kind, r.qty, r.data, r.updated_at] });
      }
      for (const r of story) {
        db.exec({ sql: `INSERT INTO story(quest,state,step,data,updated_at) VALUES (?,?,?,?,?)
          ON CONFLICT(quest) DO UPDATE SET state=excluded.state, step=excluded.step, data=excluded.data, updated_at=excluded.updated_at
          WHERE story.data IS NOT excluded.data`, bind: [r.quest, r.state, r.step, r.data, r.updated_at] });
      }
    });
    persistSoon();
    return { ok: true, seq, at: now };
  },
  load({ slot = "main" } = {}) {
    const row = db.selectObject("SELECT seq, saved_at AS savedAt, data FROM saves WHERE slot=?", [slot]);
    return row ? { seq: row.seq, savedAt: row.savedAt, progress: JSON.parse(row.data) } : null;
  },
  history({ slot = "main" } = {}) {
    return db.selectObjects("SELECT id, seq, saved_at AS savedAt, label, length(data) AS bytes FROM save_history WHERE slot=? ORDER BY id DESC", [slot]);
  },
  restorePoint({ id }) {
    const data = db.selectValue("SELECT data FROM save_history WHERE id=?", [id]);
    return data ? JSON.parse(data) : null;
  },
  putEntities({ rows = [], now = Date.now() }) {
    db.transaction(() => {
      for (const r of rows) {
        db.exec({ sql: `INSERT INTO entities(id,kind,x,y,z,yaw,cell,state,updated_at) VALUES (?,?,?,?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET kind=excluded.kind, x=excluded.x, y=excluded.y, z=excluded.z, yaw=excluded.yaw,
          cell=excluded.cell, state=excluded.state, updated_at=excluded.updated_at`,
          bind: [r.id, r.kind, r.x, r.y || 0, r.z, r.yaw || 0, chunkCell(r.x, r.z), JSON.stringify(r.state || {}), now] });
      }
    });
    persistSoon();
    return rows.length;
  },
  queryRegion({ minX, maxX, minZ, maxZ, kind = null }) {
    const cells = cellsIn(minX, maxX, minZ, maxZ);
    const rows = db.selectObjects(`SELECT id, kind, x, y, z, yaw, state FROM entities
      WHERE cell IN (${cells.map(() => "?").join(",")}) AND x BETWEEN ? AND ? AND z BETWEEN ? AND ?${kind ? " AND kind=?" : ""}`,
      [...cells, minX, maxX, minZ, maxZ, ...(kind ? [kind] : [])]);
    for (const r of rows) r.state = JSON.parse(r.state);
    return rows;
  },
  countEntities({ kind = null } = {}) {
    return Number(kind ? db.selectValue("SELECT count(*) FROM entities WHERE kind=?", [kind]) : db.selectValue("SELECT count(*) FROM entities"));
  },
  logEvent({ kind, data = {}, now = Date.now() }) {
    db.exec({ sql: "INSERT INTO events(at,kind,data) VALUES (?,?,?)", bind: [now, String(kind), JSON.stringify(data)] });
    db.exec("DELETE FROM events WHERE id <= (SELECT max(id) FROM events) - 5000");
    persistSoon();
    return true;
  },
  outbox({ limit = 200 } = {}) {
    const rows = db.selectObjects("SELECT id, tbl, row_id AS rowId, op, at FROM outbox ORDER BY id LIMIT ?", [limit]);
    // Attach the current row so a sync adapter can send it (table names come from the triggers, never input).
    for (const r of rows) if (r.op !== "delete") r.row = db.selectObject(`SELECT * FROM ${r.tbl} WHERE ${r.tbl === "story" ? "quest" : "id"}=?`, [r.rowId]) || null;
    return rows;
  },
  ackOutbox({ upto }) {
    db.exec({ sql: "DELETE FROM outbox WHERE id <= ?", bind: [upto] });
    return true;
  },
  stats() {
    const n = (t) => Number(db.selectValue(`SELECT count(*) FROM ${t}`));
    return {
      ...info(),
      bytes: Number(db.selectValue("PRAGMA page_count")) * Number(db.selectValue("PRAGMA page_size")),
      saves: n("saves"), history: n("save_history"), items: n("items"), entities: n("entities"),
      npcs: n("npc_state"), story: n("story"), events: n("events"), outbox: n("outbox"),
    };
  },
  };
}
