# CB-CAP Target Operating Model and Platform Blueprint

**Classification.** Internal planning artifact · SozoRock Tech Inc.  
**Audience.** Offer owner, engineering, Foundation steward, credit reviewers  
**Status.** Approved as the build contract for Wave 1–3  
**Date.** 2026-09-11  
**Demo place.** SozoRock County (synthetic, FIPS 00000). Lewis remains a public-data reference, not a client.

This file supersedes ad-hoc table work. Locked copy still governs language. This file governs *how the firm would sell, run, and host the product*.

---

## 0. Why the current object fails the test

A Deloitte or Accenture team would not ship a single HTML file and call it a product. A Cloudflare credit reviewer would not treat that file as a technology product.

| Test | Current object | Required object |
|---|---|---|
| Offer | Three SKUs named on paper | SKUs mapped to environments, SLAs, and deliverables |
| Experience | Demo table in one file | Two surfaces (Public Preview, County Workspace) on distinct hosts |
| System of record | `localStorage` | Versioned county pack + Decision Record in D1; artifacts in R2 |
| Trust | Honesty line in a banner | Control framework: evidence contract, accept/reject rights, audit log, no-PHI rule |
| Delivery | “Keep adding features” | Waves with exit criteria and a factory (sprint kit + platform) |
| Cloud | GitHub Pages copy of static files | Cloudflare Pages + Worker + D1 + R2 + KV + Access + WAF |
| Credits | Nothing to attach to an account | Named products that consume Workers/D1/R2/Pages |

The table UI is a *scene*. It is not the product. The product is: evidence in, judgment recorded, missing kept missing, board-defensible export out — on an edge platform a county counsel can ask about.

---

## 1. Situation

Counties already hold CHA/CHIP PDFs, CDC PLACES, HRSA lists, and facility inventories. Those files do not produce a single, dated Decision Record that keeps twelve access dimensions separate and keeps absence visible.

Substitutes collapse the problem:

- A composite index (cannot be defended)
- A travel-time map (geography becomes the whole model)
- A slide deck (no evidence object, no accept/reject)

CB-CAP is the planning system of record for *access conditions*, not a care system, not a forecast engine, not an allocator.

---

## 2. Ambition (target state in one paragraph)

A county planning owner opens a Workspace on a SozoRock Tech Inc. host. Public files and owner-supplied documents appear as evidence objects. Missing dimensions stay hatched. The owner tests a labeled scenario, drafts a Decision Record, and accepts or rejects it. The Foundation can publish a read-only Preview of demonstration counties. Tech Inc. runs eight-week sprints as the first revenue object. The platform runs on Cloudflare’s edge so Public Preview is global and cheap, and Institutional Workspace is Access-gated without standing up a regional hospital-grade stack.

---

## 3. Value architecture

### Value streams

| Stream | Job | Output | Who pays |
|---|---|---|---|
| VS-1 See | Make sourced vs missing visible on one county | Planning table + stamps | Preview (Foundation), Sprint (Tech Inc.) |
| VS-2 Judge | Turn a selection into a dated record | Decision Record pack | Sprint + Workspace |
| VS-3 Refresh | Replace a release without silent overwrite | Compare view + Track list | Workspace |
| VS-4 Govern | Keep language, rights, and data bounds | Audit log + source agreement | Workspace |

Allowed metrics: time to first draft Decision Record; owner can run the 20-minute script; share of dimensions still Not available (must remain visible); counsel-ready export.

Forbidden: predicted cases, ZIP ranks, “coverage lifted 12%” unless an evaluation sits outside CB-CAP.

---

## 4. Capability model

| ID | Capability | Wave 1 | Wave 3 |
|---|---|---|---|
| C1 | Evidence management | Seed + schema + validate pack | Live adapters |
| C2 | Planning table experience | 2D product table + tour + stamps | 3D as enhancement |
| C3 | Judgment | Draft + export; accept/reject in UI | Persist status in D1 |
| C4 | Sprint factory | Agenda + source agreement | Facilitator workspace |
| C5 | Trust & compliance | Locked copy, no PHI | Access, audit, retention |
| C6 | Edge platform | wrangler, Worker health, Pages | D1 + R2 + KV + Access |

---

## 5. Target technology architecture (Cloudflare-first)

```
DNS + WAF + Bot
  Pages: sozorock.com/cb-cap     offer
  Pages: table.cbcap.*           app
  Worker: api.cbcap.*            API
       D1  cbcap
       R2  cbcap-artifacts
       KV  cbcap-demo
       Access (Workspace only)
```

### Worker API (v1)

| Method | Path | Who | Does |
|---|---|---|---|
| GET | `/v1/health` | public | Build env, no secrets |
| GET | `/v1/demo/sozorock` | public | Synthetic county pack |
| GET | `/v1/demo/lewis` | public | Public-data reference |
| POST | `/v1/packs/validate` | public | Schema check. Missing ≠ 0 |
| POST | `/v1/packs` | Access | Persist pack version |
| POST | `/v1/records/draft` | Access | `status=draft` |
| POST | `/v1/records/:id/accept` | Access + owner | Human only. Worker refuses otherwise |
| GET | `/v1/records/:id/export` | Access | R2 object |

AI may draft. Worker must refuse accept unless the caller is the named owner.

### Environments

dev (synthetic only) · preview (PR Pages) · prod-public (demo seeds) · prod-workspace (Access + source agreement)

---

## 6. Control framework

| Control | Rule |
|---|---|
| Language | Locked copy; CI copy-lint |
| Missingness | Validator rejects numeric fill of empty fields |
| Judgment | AI cannot accept |
| Place | ZIP is a lens |
| Scenario | Caption immutable |
| PHI | Forbidden in v1 |
| Overwrite | Accepted records immutable |

---

## 7. Waves

| Wave | Build | Exit |
|---|---|---|
| 0 Freeze | This blueprint | Accepted |
| 1 Edge | wrangler + Worker + D1 schema + table from pack | health + demo + validate |
| 2 Judgment | D1 draft, R2 export, owner accept | Record persists |
| 3 Workspace | Access + Local Evidence + tenant | Sprint can run |
| 4 Adapters | Public-file workers | New dated pack |
| 5 Dual-cloud | Only if a buyer requires it | Not a credit gate |

---

## 8. Cloudflare credit map

Credits attach to Workers, Pages, D1, R2, KV, Durable Objects, Observability. A static HTML file generates almost none and reads as a marketing site.

Spend on Pages, Workers, D1, R2, KV, Access. Do not spend the Workers AI cap on a model that accepts plans. v1 drafts from templates.

Application hygiene: SozoRock Tech Inc. for-profit; public website on company domain; business email on that domain; GitHub showing Workers/Pages.

---

## 9. Wave 1 acceptance

1. Open the public table and complete the tour.
2. Point at hatch and say “not available, not zero.”
3. Import or type a county pack and see stamps recompute.
4. Export a Decision Record that includes limits.
5. Hit `GET /v1/health` and `GET /v1/demo/sozorock`.
6. Repo contains `platform/wrangler.toml`, a Worker, and a D1 schema.

If 1–5 fail, it is not a product. If 6 fails, it is not credit-ready.
