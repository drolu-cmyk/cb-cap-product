/**
 * SourceAdapter — public files in, evidence objects out.
 * Never convert missing to zero. Never invent a composite.
 */
export const MARKS = [
  "Source estimate",
  "Planning View",
  "User assumption",
  "Planning scenario",
  "Local Evidence",
  "Not available",
  "Planned source",
];

export function evidence(partial) {
  const required = [
    "title", "detail", "source", "date", "geography",
    "denominator", "missingness", "limitations", "mark",
  ];
  for (const key of required) {
    if (!partial[key]) throw new Error("Evidence object missing " + key);
  }
  if (!MARKS.includes(partial.mark)) throw new Error("Unknown mark: " + partial.mark);
  return { ...partial };
}

export function notAvailable(title, geography) {
  return evidence({
    title,
    detail: "No sourced file at this geography.",
    source: "None",
    date: "n/a",
    geography,
    denominator: "n/a",
    missingness: "Not available",
    limitations: "Absence is not a zero rate.",
    mark: "Not available",
  });
}

export const ADAPTER_LEWIS = "public-demo-lewis";

export async function list(adapterId, countyFips) {
  if (adapterId !== ADAPTER_LEWIS) throw new Error("Unknown adapter");
  if (countyFips !== "36049") throw new Error("This adapter only serves Lewis County FIPS 36049");
  return { adapterId, countyFips, note: "Load apps/table/data/seed.js in the client." };
}
