function ev(title, detail, extra) {
  return Object.assign({
    title, detail,
    source: "Synthetic demonstration file · SozoRock County seed v1",
    date: "2026-03-01",
    geography: "SozoRock County synthetic lens",
    denominator: "Demonstration population 18,400",
    missingness: "Specified in the seed so every product act can run",
    limitations: "Synthetic. Not a real county. Not a health outcome. Not an inventory.",
    mark: "Planning View",
  }, extra || {});
}
function dim(state, mark, title, detail, extra) {
  return { state, mark, items: [ev(title, detail, Object.assign({ mark }, extra || {}))] };
}
function missing(title) {
  return dim("missing", "Not available", title, "No sourced file at this geography. Absence is not drawn as zero.", {
    source: "None", date: "n/a", denominator: "n/a",
    missingness: "Not available", limitations: "Missing is not zero.",
  });
}
function pack(over) {
  return Object.assign({
    availability: dim("evidenced","Planning View","One hospital, three extension clinics","Seat town holds the hospital. Outlying lenses use scheduled clinic days. Not a grade."),
    workforce: dim("suspected","Planning View","Thin specialty bench","Primary care is staffed. Behavioral health and OB rotate. Vacancy is the constraint."),
    affordability: dim("evidenced","Source estimate","Cost delay on insured and uninsured","Synthetic 2026 release: 8.1% delayed care due to cost. Prior release 8.9%. Same land. Not a rank."),
    administrative: dim("evidenced","Planning View","Enrollment path exists","Navigator hours posted at the hospital and two town halls. Forms still require a return trip."),
    quality: dim("evidenced","Planning View","Continuity after discharge","Follow-up slots exist in seat town. River mill waits 21 days in the seed."),
    trust: dim("suspected","Planning View","Experience is uneven","Synthetic listening sessions name respect and after-hours access. No validated survey instrument."),
    social: dim("evidenced","Local Evidence","Housing and winter fuel","Synthetic CHIP names housing stock and fuel assistance as access conditions."),
    digital: dim("evidenced","Planning View","Portal in seat town, last-mile elsewhere","00000 has portal uptake. 00001 and 00002 have service but not reliable last-mile."),
    geography: dim("evidenced","Planning View","One north corridor, winter isolation","Geography is one dimension. It is not the model."),
    rural: dim("evidenced","Planning View","Critical-access dependence","One hospital. Diversion in winter is a system condition."),
    coordination: dim("planned","Planned source","Shared referral write-back","Quarterly calendar exists. Shared referral write-back is a planned source, not a live feed."),
    alignment: dim("evidenced","Planning View","Mismatch is the object","Documented barriers, cited funds, bench, and CHIP priorities sit side by side. No allocate button."),
  }, over || {});
}
export const SOZOROCK_PACK = {
  version: "cb-cap-county-v1",
  county: "SozoRock County",
  fips: "00000",
  kind: "synthetic",
  honesty: "Synthetic demonstration county. Not a real place. Not a deployment.",
  names: { "00000": "Seat town", "00001": "North ridge", "00002": "River mill" },
  releases: [
    { id: "syn-2026", date: "2026-03-01", label: "Current synthetic release" },
    { id: "syn-2025", date: "2025-03-01", label: "Prior synthetic release" },
  ],
  scenario: {
    caption: "Planning scenario — not a prediction of individual health",
    title: "Winter coverage pressure",
    horizon: "12–24 months",
    text: "If housing strain stays high, the specialty bench stays thin, and the north corridor ices, access pressure rises in winter. System conditions only.",
  },
  alignment: {
    barriers: ["Specialty leaving the county","Housing stock","Winter travel on the north corridor","After-hours coverage"],
    funding: ["Rural health operating support — cited, not an inventory"],
    workforce: ["Hospital + three clinics + rotating specialty"],
    priorities: ["Housing","Behavioral health access","After-hours coverage"],
  },
  changed: [
    { title: "Affordability release refreshed", detail: "2026 8.1% next to 2025 8.9%. Same land. Not a ranking." },
    { title: "Synthetic CHIP posted", detail: "Housing and after-hours coverage named as priorities." },
    { title: "Coordination marked planned source", detail: "Shared referral write-back is planned, not live." },
  ],
  lenses: {
    "00000": { note: "Seat town lens", dimensions: pack({
      digital: dim("evidenced","Planning View","Portal in use","Seat town has portal uptake. Not last-mile proof for the county."),
    }) },
    "00001": { note: "North ridge lens", dimensions: pack({
      availability: dim("suspected","Planning View","Clinic two days a week","No hospital. Scheduled clinic only."),
      digital: dim("suspected","Planning View","Service without last-mile","Coverage exists on paper. Winter outages are common."),
      geography: dim("evidenced","Planning View","Iced corridor","North route is the constraint. Still one of twelve."),
      trust: missing("Validated experience survey"),
    }) },
    "00002": { note: "River mill lens", dimensions: pack({
      quality: dim("suspected","Planning View","21-day follow-up","Discharge follow-up leaves the mill."),
      affordability: dim("evidenced","Source estimate","Cost delay higher than seat","Synthetic 10.2% delayed care due to cost."),
      trust: dim("suspected","Planning View","After-hours gap named","Listening sessions cluster here."),
    }) },
  },
};
