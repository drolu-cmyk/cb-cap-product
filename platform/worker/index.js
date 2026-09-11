/**
 * CB-CAP API Worker — Wave 2
 * Demo + validate + persist pack + draft record + human decide.
 * Accept is refused without a named owner. Worker never auto-accepts.
 */
import { validatePack, DIMENSIONS } from "./validate.js";
import { SOZOROCK_PACK } from "./seed-sozorock.js";
import { memoryStore, d1Store, persistPack, draftRecord, decideRecord } from "./store.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-CB-CAP-Owner",
};

const MEM = memoryStore();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  });
}

function store(env) {
  return env && env.DB ? d1Store(env.DB) : MEM;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const db = store(env);
    const persistReady = Boolean(env && env.DB);

    if (url.pathname === "/v1/health" && request.method === "GET") {
      return json({
        ok: true,
        product: (env && env.PRODUCT) || "CB-CAP",
        builder: (env && env.BUILDER) || "SozoRock Tech Inc.",
        env: (env && env.ENV) || "dev",
        honesty: env && env.HONESTY,
        dimensions: DIMENSIONS.length,
        persist: persistReady ? "d1" : "memory",
        capabilities: ["see", "validate", "demo", "persist-pack", "draft-record", "human-decide"],
        planned: ["access", "r2-export-object", "live-adapters"],
      });
    }

    if (url.pathname === "/v1/demo/sozorock" && request.method === "GET") {
      if (env && env.DEMO) {
        const cached = await env.DEMO.get("sozorock-v1", { type: "json" });
        if (cached) return json(cached);
      }
      return json(SOZOROCK_PACK);
    }

    if (url.pathname === "/v1/packs/validate" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch {
        return json({ ok: false, errors: ["JSON body required."] }, 400);
      }
      const result = validatePack(body);
      return json(result, result.ok ? 200 : 400);
    }

    if (url.pathname === "/v1/packs" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch {
        return json({ ok: false, errors: ["JSON body required."] }, 400);
      }
      const result = validatePack(body);
      if (!result.ok) return json(result, 400);
      const saved = await persistPack(db, body);
      return json({ ok: true, persist: persistReady ? "d1" : "memory", ...saved }, 201);
    }

    if (url.pathname.startsWith("/v1/packs/") && request.method === "GET") {
      const packId = url.pathname.split("/")[3];
      const row = await db.getPack(packId);
      if (!row) return json({ ok: false, error: "Pack not found." }, 404);
      return json({ ok: true, id: row.id, county_id: row.county_id, pack: JSON.parse(row.pack_json) });
    }

    if (url.pathname === "/v1/records/draft" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch {
        return json({ ok: false, errors: ["JSON body required."] }, 400);
      }
      try {
        const rec = await draftRecord(db, body);
        return json({ ok: true, record: rec, note: "Draft. A named owner must accept or reject." }, 201);
      } catch (err) {
        return json({ ok: false, error: err.message }, 400);
      }
    }

    const decide = url.pathname.match(/^\/v1\/records\/([^/]+)\/(accept|reject)$/);
    if (decide && request.method === "POST") {
      const recordId = decide[1];
      const action = decide[2];
      let body = {};
      try { body = await request.json(); } catch { body = {}; }
      const result = await decideRecord(db, recordId, {
        action,
        owner: body.owner,
        review_date: body.review_date,
        headerOwner: request.headers.get("X-CB-CAP-Owner"),
      });
      if (!result.ok) return json(result, result.status || 400);
      return json(result);
    }

    if (url.pathname.startsWith("/v1/records/") && request.method === "GET") {
      const parts = url.pathname.split("/");
      const recordId = parts[3];
      const rec = await db.getRecord(recordId);
      if (!rec) return json({ ok: false, error: "Record not found." }, 404);
      if (parts[4] === "export") {
        return new Response(rec.body, {
          headers: {
            "content-type": "text/markdown; charset=utf-8",
            "content-disposition": `attachment; filename="${rec.id}.md"`,
            ...CORS,
          },
        });
      }
      return json({ ok: true, record: rec });
    }

    return json({ ok: false, error: "Not found" }, 404);
  },
};
