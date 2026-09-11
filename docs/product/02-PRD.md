# CB-CAP — Product requirements

Version 1.0 · Lewis County as reference place · Status: ready for a dedicated repo

## 1. Purpose

Give a county planning owner a single table where evidence stays visible, missing stays missing, twelve access dimensions stay separate, and a human can accept or reject a drafted Decision Record.

## 2. Users

| Role | Surface | Can |
|---|---|---|
| Resident / public visitor | Public Preview | View demonstration county, read sources, no write |
| County planning owner | Workspace | All public acts + add local evidence + draft/accept records |
| Facilitator (Tech Inc.) | Workspace | Seed, train, not accept on behalf of the county |
| Reviewer (legal / board) | Export | Read Decision Record PDF/Markdown |

No consumer patient account. No PHI.

## 3. Place rules

- Unit of view: ZCTA used as a spatial lens.
- Vintage labeled on screen (Lewis v1: Census 2010 outlines).
- Never treat a ZIP as a community name for people.
- Never convert missing to zero.
- Never present a composite as a designation or rank.
- Never label a scenario as a prediction of individual health.

## 4. Evidence object (required on every claim)

`title · detail · source · date · geography · denominator · missingness · limitations · mark`

Marks: Source estimate · Planning View · User assumption · Planning scenario · Local Evidence · Not available · Planned source.

## 5. Twelve dimensions (equal)

Availability · Workforce · Affordability · Administrative access · Quality and continuity · Trust and experience · Social conditions · Digital access · Geography and transportation · Rural resilience · System coordination · Resource alignment.

Geography is one dimension. It is never the model.

## 6. Functional requirements

### F1 See
3D or 2D planning table of one county. Plates encode evidence state of the open dimension. Terrain is context. Sites are inspectable masses. Keyboard and pointer both select a lens.

### F2 Small multiples
Twelve stamp maps, identical outline and legend. Selecting a stamp drives the table. Selecting a ZIP outlines that lens in every stamp.

### F3 Compare
Two published releases, same geography. Difference is a change in dated files, not a forecast.

### F4 Plan
One labeled planning scenario object (ring or equivalent). Caption fixed. No time-tween of plates into a future “worse.”

### F5 Resource
Four-part alignment view: documented barriers, available funding (as cited), workforce capacity (as cited), community priorities (CHIP). No allocate button.

### F6 Track
List of what changed between releases or added Local Evidence.

### F7 Inspect
Inspector shows the evidence object. Audit panel holds technical detail.

### F8 Local evidence
Identity, version, date, scope, citation locator. Institutional only.

### F9 Decision Record
Draft from current selection. Fields: place, owner, review date, dimension states, scenario text, limits. Status: draft · awaiting human · accepted · rejected. AI never accepts.

### F10 Surfaces
Public Preview vs Institutional Workspace. Vocabulary public. Engineering terms stay in audit.

## 7. Non-functionals

- WCAG 2.2 AA target for chrome, stamps, inspector. Color never the only channel (hatch + text).
- `prefers-reduced-motion` honored.
- Phone: table + sheet + stamp strip.
- 2D fallback if WebGL fails.
- No PHI. Aggregate deidentified only.
- Seeded demo must boot from one file or one deployable app with no secrets in the client.
- Status labels: LIVE · IMPLEMENTED_ACTIVATION_GATED · PLANNED · RETIRED.

## 8. Lewis v1 data contract

| Layer | Source class | Note |
|---|---|---|
| ZCTA outlines | Census TIGER (vintage labeled) | Lens only |
| Sites | NYS Health Profiles / CMS POS class | Seeded subset, not inventory |
| Corridors | Public route class (NY-12, NY-26) | Geography dimension |
| Social priorities | Lewis 2025 CHA/CHIP PDF | Local Evidence |
| Affordability / PLACES-style | Public estimates | Source estimate, county or ZCTA as published |
| Digital, trust | Absent | Not available |

Live adapters are a later increment. V1 may ship on a versioned seed that names each field’s source.

## 9. Explicit non-goals (v1)

Live nationwide coverage. Authored partnership with Lewis County. Payment in-app. EHR write-back. Agent autonomy. Composite index. Surveyed DEM requirement (editorial terrain allowed if labeled).

## 10. Acceptance

A reviewer who has never seen the file can:

1. State what color and hatch mean.
2. Find a missing dimension and see it is not zero.
3. Open Compare and say what two dates are.
4. Open Plan and read that it is not a prediction.
5. Export a Decision Record that includes limits.

If any of those fail, it is not ready.
