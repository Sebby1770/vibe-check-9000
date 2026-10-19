// The SQLite save database: migrations, instant saves with rolling restore points, item/story rows,
// region queries over thousands of world objects, and the multiplayer outbox. Runs the real SQL on the
// in-memory WebAssembly build of SQLite.
import assert from "node:assert/strict";
import init from "../vendor/sqlite/node.mjs";
import { migrate, MIGRATIONS, HISTORY_LIMIT, chunkCell, cellsIn, rowsFromProgress } from "../js/db/schema.js";
import { createOps } from "../js/db/ops.js";

const sqlite3 = await init();
const db = new sqlite3.oo1.DB(":memory:", "c");
assert.equal(migrate(db), MIGRATIONS.length, "migrations reach the latest version");
assert.equal(migrate(db), MIGRATIONS.length, "migrating twice is harmless");
const ops = createOps(db, { info: () => ({ backend: "memory" }) });

const progress = {
  lastDay: "2026-10-19", look: "stock", unlocked: ["stock"], flags: {},
  night: { commerce: { inventory: [{ id: "ice", kind: "ice", name: "Frank's ice" }], life: { wallet: 140, properties: ["studio"], home: "studio", furnishings: ["lamp"], installed: ["lamp"] }, neighborhood: { purchases: { postcard: true } } } },
  story: { version: 1, quests: { doors: { state: "done", step: 3 }, picture: { state: "active", step: 1 } } },
};
let t = 1_700_000_000_000;
const first = ops.save({ progress, seq: 1, now: t });
assert.equal(first.ok, true);
assert.deepEqual(ops.load({}).progress, progress, "the snapshot round-trips exactly");
assert.equal(ops.history({}).length, 1, "the first save is a restore point");

// Saves every second for a minute: still one live save, restore points spaced and capped.
for (let i = 2; i <= 200; i++) ops.save({ progress: { ...progress, flags: { tick: i % 2 === 0 } }, seq: i, now: (t += 1000) });
ops.save({ progress, seq: 201, label: "chapter", now: (t += 10) });
const history = ops.history({});
assert.equal(db.selectValue("SELECT count(*) FROM saves"), 1);
assert.ok(history.length <= HISTORY_LIMIT, "restore points are capped");
assert.equal(history[0].label, "chapter", "labelled moments always become restore points");
assert.equal(ops.load({}).seq, 201);
assert.deepEqual(ops.restorePoint({ id: history[1].id }).night, progress.night);

// Items and story rows mirror the snapshot, and removals propagate.
const rows = rowsFromProgress(progress, t);
assert.deepEqual(rows.items.map((r) => r.id).sort(), ["furn:lamp", "home:studio", "inv:ice", "keepsake:postcard"]);
assert.equal(db.selectValue("SELECT count(*) FROM items"), 4);
assert.equal(db.selectValue("SELECT state FROM story WHERE quest='picture'"), "active");
ops.save({ progress: { ...progress, night: { commerce: { ...progress.night.commerce, inventory: [] } } }, seq: 202, now: (t += 1000) });
assert.equal(db.selectValue("SELECT count(*) FROM items WHERE id='inv:ice'"), 0, "delivered items leave the table");

// Thousands of world objects, queried by region through the chunk index.
assert.equal(chunkCell(0, 0), 512 * 1024 + 512);
assert.ok(cellsIn(-10, 70, -10, 10).includes(chunkCell(65, 5)));
const many = [];
for (let i = 0; i < 6000; i++) many.push({ id: `reel-${i}`, kind: i % 3 ? "lamp" : "reel", x: -400 + (i % 100) * 9, z: -300 + Math.floor(i / 100) * 11, state: { found: false } });
const started = performance.now();
assert.equal(ops.putEntities({ rows: many, now: t }), 6000);
const writeMs = performance.now() - started;
const q0 = performance.now();
const near = ops.queryRegion({ minX: -10, maxX: 54, minZ: -10, maxZ: 54, kind: "reel" });
const queryMs = performance.now() - q0;
assert.ok(near.length > 0 && near.every((r) => r.kind === "reel" && r.x >= -10 && r.x <= 54 && r.z >= -10 && r.z <= 54));
assert.equal(ops.countEntities({ kind: "reel" }), 2000);
assert.ok(writeMs < 4000, `6000 entities written in ${writeMs.toFixed(0)} ms`);
assert.ok(queryMs < 50, `region query in ${queryMs.toFixed(1)} ms`);

// Every write is queued for a future multiplayer sync, with the row attached.
const out = ops.outbox({ limit: 5 });
assert.equal(out.length, 5);
assert.ok(out.every((r) => ["items", "entities", "npc_state", "story"].includes(r.tbl)));
assert.ok(out.some((r) => r.op === "upsert" && r.row), "upserts carry their current row");
ops.ackOutbox({ upto: out[4].id });
assert.equal(ops.outbox({ limit: 1 })[0].id, out[4].id + 1, "acked rows leave the outbox");

ops.logEvent({ kind: "talk", data: { npc: "velma" }, now: t });
const stats = ops.stats();
assert.equal(stats.backend, "memory");
assert.equal(stats.entities, 6000);
console.log(`db: migrations, instant saves + ${history.length} restore points, item/story rows, 6000 entities in ${writeMs.toFixed(0)} ms, region query ${queryMs.toFixed(1)} ms, outbox`);
