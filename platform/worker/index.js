/**
 * CB-CAP API Worker — Wave 1
 * Public: health + demo packs + validate.
 * Accept is refused unless later Access + owner role exists.
 */
import { validatePack, DIMENSIONS } from "./validate.js";
import { SOZOROCK_PACK } from "./seed-sozorock.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (url.pathname === "/v1/health") {
      return json({
        ok: true,
        product: env.PRODUCT || "CB-CAP",
        builder: env.BUILDER || "SozoRock Tech Inc.",
        env: env.ENV || "dev",
        honesty: env.HONESTY,
        dimensions: DIMENSIONS.length,
        capabilities: ["see", "validate", "demo"],
        planned: ["persist-pack", "accept-record", "access"],
      });
    }

    if (url.pathname === "/v1/demo/sozorock" && request.method === "GET") {
      if (env.DEMO) {
        const cached = await env.DEMO.get("sozorock-v1", { type: "json" });
        if (cached) return json(cached);
      }
      return json(SOZOROCK_PACK);
    }

    if (url.pathname === "/v1/packs/validate" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, errors: ["JSON body required."] }, 400);
      }
      const result = validatePack(body);
      return json(result, result.ok ? 200 : 400);
    }

    if (url.pathname === "/v1/records/draft" && request.method === "POST") {
      return json({
        ok: false,
        status: "PLANNED",
        reason: "Wave 2. Draft persistence requires D1 + Access. UI may draft locally.",
      }, 501);
    }

    if (url.pathname.match(/^\/v1\/records\/.+\/(accept|reject)$/)) {
      return json({
        ok: false,
        refused: true,
        reason: "A Worker cannot accept a Decision Record. County owner only.",
      }, 403);
    }

    return json({ ok: false, error: "Not found" }, 404);
  },
};
