/**
 * Pack + Decision Record store.
 * D1 when bound. Memory fallback for tests and wrangler without remote IDs.
 * Accepted records are immutable. Worker never sets accepted by itself.
 */
function now() {
  return new Date().toISOString();
}
function id(prefix) {
  return prefix + "-" + crypto.randomUUID();
}
export function memoryStore() {
  const counties = new Map();
  const packs = new Map();
  const records = new Map();
  const audit = [];
  return {
    async putCounty(row) { counties.set(row.id, row); return row; },
    async getCounty(countyId) { return counties.get(countyId) || null; },
    async putPack(row) { packs.set(row.id, row); return row; },
    async getPack(packId) { return packs.get(packId) || null; },
    async putRecord(row) { records.set(row.id, row); return row; },
    async getRecord(recordId) { return records.get(recordId) || null; },
    async listRecords(countyId) { return [...records.values()].filter((r) => r.county_id === countyId); },
    async audit(event) { audit.push(event); return event; },
    async listAudit(entity) { return audit.filter((e) => e.entity === entity); },
  };
}
export function d1Store(db) {
  return {
    async putCounty(row) {
      await db.prepare("INSERT OR REPLACE INTO counties (id, name, fips, honesty, kind, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(row.id, row.name, row.fips, row.honesty, row.kind, row.created_at).run();
      return row;
    },
    async getCounty(countyId) { return db.prepare("SELECT * FROM counties WHERE id = ?").bind(countyId).first(); },
    async putPack(row) {
      await db.prepare("INSERT INTO packs (id, county_id, version, pack_json, created_at) VALUES (?, ?, ?, ?, ?)").bind(row.id, row.county_id, row.version, row.pack_json, row.created_at).run();
      return row;
    },
    async getPack(packId) { return db.prepare("SELECT * FROM packs WHERE id = ?").bind(packId).first(); },
    async putRecord(row) {
      await db.prepare(`INSERT OR REPLACE INTO records
         (id, county_id, lens_id, dimension, status, owner, review_date, body, created_at, decided_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        row.id, row.county_id, row.lens_id, row.dimension, row.status,
        row.owner || null, row.review_date || null, row.body, row.created_at, row.decided_at || null
      ).run();
      return row;
    },
    async getRecord(recordId) { return db.prepare("SELECT * FROM records WHERE id = ?").bind(recordId).first(); },
    async listRecords(countyId) {
      const res = await db.prepare("SELECT * FROM records WHERE county_id = ?").bind(countyId).all();
      return res.results || [];
    },
    async audit(event) {
      await db.prepare("INSERT INTO audit_events (id, actor, action, entity, at) VALUES (?, ?, ?, ?, ?)").bind(event.id, event.actor, event.action, event.entity, event.at).run();
      return event;
    },
    async listAudit(entity) {
      const res = await db.prepare("SELECT * FROM audit_events WHERE entity = ?").bind(entity).all();
      return res.results || [];
    },
  };
}
export async function persistPack(store, pack) {
  const countyId = "county-" + String(pack.fips || pack.county).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await store.putCounty({
    id: countyId, name: pack.county, fips: pack.fips,
    honesty: pack.honesty || "User-supplied pack. Missing must stay Not available.",
    kind: pack.kind || "synthetic", created_at: now(),
  });
  const row = {
    id: id("pack"), county_id: countyId, version: 1,
    pack_json: typeof pack === "string" ? pack : JSON.stringify(pack),
    created_at: now(),
  };
  await store.putPack(row);
  await store.audit({ id: id("aud"), actor: "system", action: "pack.persist", entity: row.id, at: now() });
  return { countyId, packId: row.id };
}
export async function draftRecord(store, input) {
  const body = String(input.body || "").trim();
  if (!body) throw new Error("Record body required.");
  const row = {
    id: id("rec"), county_id: input.county_id, lens_id: input.lens_id,
    dimension: input.dimension, status: "draft", owner: input.owner || "",
    review_date: input.review_date || "", body, created_at: now(), decided_at: null,
  };
  await store.putRecord(row);
  await store.audit({ id: id("aud"), actor: input.owner || "unassigned", action: "record.draft", entity: row.id, at: now() });
  return row;
}
export async function decideRecord(store, recordId, decision) {
  const rec = await store.getRecord(recordId);
  if (!rec) return { ok: false, status: 404, error: "Record not found." };
  if (rec.status === "accepted") return { ok: false, status: 409, error: "Accepted records are immutable. Create a new version." };
  if (decision.action !== "accept" && decision.action !== "reject") return { ok: false, status: 400, error: "action must be accept or reject." };
  const owner = String(decision.owner || "").trim();
  if (!owner) return { ok: false, status: 403, error: "A named county owner must decide. The Worker cannot accept." };
  if (decision.headerOwner && decision.headerOwner !== owner) return { ok: false, status: 403, error: "Owner header does not match body owner." };
  rec.status = decision.action === "accept" ? "accepted" : "rejected";
  rec.owner = owner;
  rec.review_date = decision.review_date || rec.review_date;
  rec.decided_at = now();
  await store.putRecord(rec);
  await store.audit({ id: id("aud"), actor: owner, action: "record." + rec.status, entity: rec.id, at: rec.decided_at });
  return { ok: true, record: rec };
}
export { now, id };
