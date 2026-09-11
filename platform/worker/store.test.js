import { test } from "node:test";
import assert from "node:assert/strict";
import { memoryStore, persistPack, draftRecord, decideRecord } from "./store.js";
import { SOZOROCK_PACK } from "./seed-sozorock.js";

test("persist pack then draft and accept with owner", async () => {
  const store = memoryStore();
  const { countyId, packId } = await persistPack(store, SOZOROCK_PACK);
  assert.ok(packId.startsWith("pack-"));
  const rec = await draftRecord(store, {
    county_id: countyId, lens_id: "00000", dimension: "availability",
    owner: "", body: "DRAFT\nLimits. CB-CAP does not diagnose.",
  });
  assert.equal(rec.status, "draft");
  const denied = await decideRecord(store, rec.id, { action: "accept", owner: "" });
  assert.equal(denied.ok, false);
  assert.equal(denied.status, 403);
  const ok = await decideRecord(store, rec.id, { action: "accept", owner: "Director Chen", review_date: "2026-09-11" });
  assert.equal(ok.record.status, "accepted");
  const again = await decideRecord(store, rec.id, { action: "reject", owner: "Director Chen" });
  assert.equal(again.status, 409);
});

test("reject is allowed with owner; header mismatch fails", async () => {
  const store = memoryStore();
  const { countyId } = await persistPack(store, SOZOROCK_PACK);
  const rec = await draftRecord(store, {
    county_id: countyId, lens_id: "00001", dimension: "trust", body: "DRAFT",
  });
  const bad = await decideRecord(store, rec.id, { action: "reject", owner: "A", headerOwner: "B" });
  assert.equal(bad.ok, false);
  const good = await decideRecord(store, rec.id, { action: "reject", owner: "A", headerOwner: "A" });
  assert.equal(good.record.status, "rejected");
});
