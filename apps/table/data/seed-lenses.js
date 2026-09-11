function ev(title, detail, mark) {
  return { title, detail, source: "Seeded from public files for demonstration", date: "2025", geo: "Lewis County ZCTA lens", denominator: "As published", missingness: "Coverage varies", limitations: "Demonstration object. Not a complete inventory.", mark: mark || "Source estimate" };
}
function dim(state, mark, title, detail) {
  return { state, mark, actors: ["County public health", "Hospital"], items: [ev(title, detail, mark)] };
}
const COMMON = {
  administrative: dim("planned", "Planned source", "Enrollment path", "No county-wide file. Planned."),
  quality: dim("planned", "Planned source", "Continuity", "Not assembled at ZCTA."),
  trust: dim("missing", "Not available", "Trust", "No ZCTA trust measure. Not zero."),
  coordination: dim("planned", "Planned source", "Shared planning", "Not sourced at ZCTA."),
  digital: dim("missing", "Not available", "Digital access", "No complete file. Not zero."),
};
function pack(over) {
  return Object.assign({
    availability: dim("evidenced", "Source estimate", "Supply pressure", "Rural hospital plus extension clinics. Not a grade."),
    workforce: dim("evidenced", "Source estimate", "Small pool", "Thin bench."),
    affordability: dim("evidenced", "Source estimate", "Cost pressure", "PLACES/ACS class estimate."),
    social: dim("evidenced", "Local Evidence", "Housing strain", "Lewis 2025 CHA/CHIP names housing."),
    geography: dim("evidenced", "Source estimate", "Winter isolation", "One of twelve dimensions."),
    rural: dim("evidenced", "Planning View", "Critical-access dependence", "One hospital."),
    alignment: dim("evidenced", "Planning View", "Mismatch", "Not an allocation."),
  }, COMMON, over);
}
window.CBCAP_LENSES = window.CBCAP_LENSES || {};
CBCAP_LENSES["13367"] = {
  populationNote: "Largest place lens",
  dimensions: pack({ digital: dim("suspected", "Suspected gap", "Portal access", "Seat town is not last-mile proof.") }),
  relations: [{ a: "rural", b: "availability", type: "co-occurs" }],
  forecast: { caption: "Planning scenario — not a prediction of individual health", title: "Winter coverage pressure", horizon: "12–24 months", text: "If housing strain stays high and the bench stays thin, access pressure rises in winter.", drivers: ["CHIP housing", "Single hospital"] },
  alignmentMatrix: { barriers: ["Specialty leaving county", "Housing", "Winter travel"], funding: ["Public rural health — not an inventory"], workforce: ["LCGH + clinics"], priorities: ["Housing", "Anxiety and stress", "Suicide"] }
};
Object.keys(CBCAP_SEED.zctaNames || {}).forEach((z) => {
  if (CBCAP_LENSES[z]) return;
  CBCAP_LENSES[z] = {
    populationNote: "ZCTA 2010 lens",
    dimensions: pack({}),
    relations: [{ a: "geography", b: "availability", type: "co-occurs" }],
    forecast: CBCAP_LENSES["13367"].forecast,
    alignmentMatrix: CBCAP_LENSES["13367"].alignmentMatrix
  };
});
window.CBCAP_CHANGED = window.CBCAP_CHANGED || [
  { title: "PLACES release refreshed", detail: "2025 next to 2024. Digital stays Not available.", why: "Compare dated files. Do not rank." },
  { title: "Lewis CHA/CHIP 2025 posted", detail: "Public plan names housing and mental health.", why: "Local Evidence from a public plan. Not a partnership." }
];
