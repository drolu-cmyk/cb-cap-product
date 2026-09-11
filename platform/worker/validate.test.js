import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePack } from "./validate.js";
import { SOZOROCK_PACK } from "./seed-sozorock.js";

test("SozoRock seed validates", () => {
  const r = validatePack(SOZOROCK_PACK);
  assert.equal(r.ok, true, r.errors && r.errors.join("; "));
});

test("empty detail is rejected unless missing", () => {
  const pack = structuredClone(SOZOROCK_PACK);
  pack.lenses["00000"].dimensions.availability.state = "evidenced";
  pack.lenses["00000"].dimensions.availability.items[0].detail = "";
  const r = validatePack(pack);
  assert.equal(r.ok, false);
});

test("omitted dimension is rejected", () => {
  const pack = structuredClone(SOZOROCK_PACK);
  delete pack.lenses["00000"].dimensions.digital;
  const r = validatePack(pack);
  assert.equal(r.ok, false);
});
