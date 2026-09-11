window.CBCAP_SEED = {
  meta: {
    county: "Lewis County, NY",
    fips: "36049",
    banner:
      "Seeded demonstration \u00b7 Lewis County, NY \u00b7 public sources \u00b7 ZIP codes are planning lenses, not labels for people.",
    promise: "From evidence to a plan you can defend.",
    line: "See the evidence. Test the options. Build the plan.",
    ai: "AI drafts. People decide.",
    note: "Not a partnership with Lewis County. Built from public files only.",
  },
  dimensions: [
    { id: "availability", label: "Availability", slice: true },
    { id: "workforce", label: "Workforce", slice: true },
    { id: "affordability", label: "Affordability", slice: true },
    { id: "administrative", label: "Administrative access", slice: false },
    { id: "quality", label: "Quality and continuity", slice: false },
    { id: "trust", label: "Trust and experience", slice: false },
    { id: "social", label: "Social conditions", slice: true },
    { id: "digital", label: "Digital access", slice: true },
    { id: "geography", label: "Geography and transportation", slice: true, defaultOn: false },
    { id: "rural", label: "Rural resilience", slice: true },
    { id: "coordination", label: "System coordination", slice: false },
    { id: "alignment", label: "Resource alignment", slice: true },
  ],
  releases: [
    { id: "places-2025", label: "CDC PLACES county release", date: "2025-12-04", status: "published" },
    { id: "places-2024", label: "Prior published release", date: "2024-12-06", status: "published" },
  ],
  zctaNames: {
    "13367": "Lowville area",
    "13327": "Croghan area",
    "13368": "Lyons Falls area",
    "13343": "Glenfield area",
    "13325": "Constableville area",
    "13433": "Port Leyden area",
    "13473": "Turin area",
    "13620": "Castorland area",
    "13626": "Copenhagen area",
    "13648": "Harrisville area",
    "13312": "Brantingham area",
    "13345": "Greig area",
    "13305": "Beaver Falls area",
    "13404": "Martinsburg area",
    "13489": "West Leyden area",
  },
  sites: [
    { id: "lcgh", name: "Lewis County General Hospital", kind: "hospital", lon: -75.492, lat: 43.787, zcta: "13367", hours: "Emergency 24 hours · rural hospital", newPatients: "Service-dependent", telehealth: "Some follow-up" },
    { id: "rx-lowville", name: "Retail pharmacy — Lowville", kind: "pharmacy", lon: -75.496, lat: 43.785, zcta: "13367", hours: "Weekday retail hours", newPatients: "Walk-in retail", telehealth: "Not applicable" },
    { id: "clinic-copenhagen", name: "Copenhagen Health Center", kind: "clinic", lon: -75.673, lat: 43.893, zcta: "13626", hours: "Primary care · published extension clinic", newPatients: "Not available in seed", telehealth: "Not available in seed" },
    { id: "clinic-harrisville", name: "Harrisville Health Center", kind: "clinic", lon: -75.321, lat: 44.152, zcta: "13648", hours: "Primary care · published extension clinic", newPatients: "Not available in seed", telehealth: "Not available in seed" },
    { id: "clinic-lyons", name: "South Lewis Health Center", kind: "clinic", lon: -75.361, lat: 43.617, zcta: "13368", hours: "Primary care · published extension clinic", newPatients: "Not available in seed", telehealth: "Not available in seed" },
    { id: "clinic-beaver", name: "Beaver River Health Center", kind: "clinic", lon: -75.430, lat: 43.884, zcta: "13305", hours: "Primary care · published extension clinic", newPatients: "Not available in seed", telehealth: "Not available in seed" }
  ],
  routes: [
    { id: "ny12", name: "NY-12 corridor", coordinates: [[-75.67, 43.90], [-75.49, 43.79], [-75.36, 43.62]] },
    { id: "ny26", name: "NY-26 north", coordinates: [[-75.49, 43.79], [-75.32, 44.15]] }
  ]
};
