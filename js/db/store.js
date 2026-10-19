/* Main-thread client for the save database. Every call is async and never blocks a frame; saves are
   coalesced so only the newest snapshot is written (instant autosave without a write storm). If workers or
   WebAssembly are unavailable, every method resolves harmlessly and localStorage stays the save. */

export function createStore() {
  let worker = null;
  let nextId = 1;
  const pending = new Map();
  let info = { backend: "none" };
  let seq = 0;
  let queued = null;
  let writing = false;
  const listeners = new Set();

  function call(op, args) {
    if (!worker) return Promise.resolve(null);
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, op, args });
    });
  }

  try {
    worker = new Worker(new URL("./db-worker.js", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }) => {
      const p = pending.get(data?.id);
      if (!p) return;
      pending.delete(data.id);
      data.ok ? p.resolve(data.result) : p.reject(new Error(data.error));
    };
    worker.onerror = (e) => {
      e.preventDefault?.();
      for (const p of pending.values()) p.resolve(null);
      pending.clear();
      worker = null;
      info = { backend: "none" };
    };
  } catch {
    worker = null;
  }

  const ready = call("open").then((r) => { if (r) info = r; return info; }).catch(() => info);

  async function flush() {
    if (writing || !queued) return;
    writing = true;
    const job = queued;
    queued = null;
    try {
      const r = await call("save", job);
      if (r?.ok) for (const fn of listeners) fn({ seq: job.seq, at: r.at, label: job.label });
    } catch { /* the next change retries with a newer snapshot */ }
    writing = false;
    if (queued) flush();
  }

  return {
    ready,
    get backend() { return info.backend; },
    get info() { return info; },
    /** Queue the newest snapshot; written within a frame, older queued snapshots are dropped. */
    save(progress, label = "autosave") {
      if (!worker || !progress) return;
      seq += 1;
      queued = { progress, seq, label, now: Date.now() };
      if (label !== "autosave") { flush(); return; }
      queueMicrotask(flush);
    },
    onSaved(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    load: (slot = "main") => ready.then(() => call("load", { slot })).catch(() => null),
    history: (slot = "main") => ready.then(() => call("history", { slot })).catch(() => []),
    restorePoint: (id) => ready.then(() => call("restorePoint", { id })).catch(() => null),
    putEntities: (rows) => ready.then(() => call("putEntities", { rows })).catch(() => 0),
    queryRegion: (box) => ready.then(() => call("queryRegion", box)).catch(() => []),
    countEntities: (kind) => ready.then(() => call("countEntities", { kind })).catch(() => 0),
    logEvent: (kind, data) => ready.then(() => call("logEvent", { kind, data })).catch(() => false),
    outbox: (limit) => ready.then(() => call("outbox", { limit })).catch(() => []),
    ackOutbox: (upto) => ready.then(() => call("ackOutbox", { upto })).catch(() => false),
    stats: () => ready.then(() => call("stats")).catch(() => null),
  };
}
