/* Multiplayer, later. Every write to items, entities, npc_state and story lands in the local outbox (SQLite
   triggers). A sync adapter drains that outbox to a shared Postgres (schema in server/schema.sql) and acks
   what the server accepted. Nothing is sent unless an adapter is configured; the default is "none". */

export function createSync(store, { kind = "none", url = "", anonKey = "", playerId = "" } = {}) {
  if (kind === "none" || !url) {
    return { kind: "none", async drain() { return { sent: 0 }; } };
  }
  if (kind !== "postgrest") throw new Error(`Unknown sync adapter: ${kind}`);
  // PostgREST / Supabase REST: POST batches of outbox rows to an RPC that applies them for this player.
  return {
    kind,
    async drain(limit = 200) {
      const rows = await store.outbox(limit);
      if (!rows?.length) return { sent: 0 };
      const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/apply_outbox`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({ player: playerId, rows }),
      });
      if (!res.ok) return { sent: 0, error: res.status };
      await store.ackOutbox(rows[rows.length - 1].id);
      return { sent: rows.length };
    },
  };
}
