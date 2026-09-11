/**
 * County pack validator.
 * Never convert missing to zero. Never invent a composite.
 */
export const DIMENSIONS = [
  "availability","workforce","affordability","administrative","quality","trust",
  "social","digital","geography","rural","coordination","alignment",
];

export const MARKS = [
  "Source estimate","Planning View","User assumption","Planning scenario",
  "Local Evidence","Not available","Planned source",
];

export const STATES = ["evidenced","suspected","planned","missing"];

const EVIDENCE_KEYS = ["title","detail","source","date","geography","denominator","missingness","limitations","mark"];

export function validatePack(pack) {
  const errors = [];
  if (!pack || typeof pack !== "object") return { ok: false, errors: ["Pack must be an object."] };
  if (!pack.county) errors.push("county is required.");
  if (!pack.fips) errors.push("fips is required.");
  if (!pack.lenses || typeof pack.lenses !== "object") {
    errors.push("lenses is required.");
    return { ok: false, errors };
  }
  const lensIds = Object.keys(pack.lenses);
  if (lensIds.length < 1) errors.push("At least one lens is required.");
  for (const z of lensIds) {
    const dims = (pack.lenses[z] && pack.lenses[z].dimensions) || {};
    for (const id of DIMENSIONS) {
      const d = dims[id];
      if (!d) { errors.push(`${z}.${id} missing — leave an explicit Not available object, do not omit.`); continue; }
      if (!STATES.includes(d.state)) errors.push(`${z}.${id} has unknown state.`);
      if (d.state === "missing" && d.mark !== "Not available") errors.push(`${z}.${id} missing must use mark Not available.`);
      if (d.state !== "missing" && (!d.items || !d.items[0] || !String(d.items[0].detail || "").trim())) {
        errors.push(`${z}.${id} has no detail. Empty detail must be state=missing, not zero.`);
      }
      const item = d.items && d.items[0];
      if (item) {
        for (const k of EVIDENCE_KEYS) {
          if (item[k] == null || item[k] === "") errors.push(`${z}.${id} evidence missing field ${k}.`);
        }
        if (item.mark && !MARKS.includes(item.mark)) errors.push(`${z}.${id} unknown mark.`);
        if (typeof item.detail === "number") errors.push(`${z}.${id} detail is numeric. Missing is not zero.`);
      }
    }
  }
  return { ok: errors.length === 0, errors, lenses: lensIds.length, dimensions: DIMENSIONS.length };
}
