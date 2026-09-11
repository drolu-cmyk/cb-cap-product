import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "./index.js";
import { SOZOROCK_PACK } from "./seed-sozorock.js";

async function call(path, opts = {}) {
  const req = new Request("https://api.cbcap.test" + path, opts);
  return worker.fetch(req, {});
}

test("health and demo", async () => {
  const h = await (await call("/v1/health")).json();
  assert.equal(h.ok, true);
  assert.equal(h.persist, "memory");
  const demo = await (await call("/v1/demo/sozorock")).json();
  assert.equal(demo.county, "SozoRock County");
});

test("pack persist, draft, refuse accept without owner, accept with owner", async () => {
  const saved = await (await call("/v1/packs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(SOZOROCK_PACK),
  })).json();
  assert.equal(saved.ok, true);
  const draft = await (await call("/v1/records/draft", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      county_id: saved.countyId, lens_id: "00000", dimension: "availability",
      body: "DECISION RECORD\nLimits. CB-CAP does not diagnose.",
    }),
  })).json();
  assert.equal(draft.record.status, "draft");
  const denied = await call("/v1/records/" + draft.record.id + "/accept", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(denied.status, 403);
  const ok = await (await call("/v1/records/" + draft.record.id + "/accept", {
    method: "POST",
    headers: { "content-type": "application/json", "X-CB-CAP-Owner": "Director Chen" },
    body: JSON.stringify({ owner: "Director Chen", review_date: "2026-09-11" }),
  })).json();
  assert.equal(ok.record.status, "accepted");
});
