# CB-CAP

**County planning for health access**  
SozoRock Tech Inc.

From evidence to a plan you can defend.  
See the evidence. Test the options. Build the plan.  
AI drafts. People decide.

This repository is the **commercial product definition and reference table** for CB-CAP. It is not a Lewis County deployment. Lewis County, New York appears as a public-data demonstration place only.

## Run the planning table

```
python3 -m http.server 8765 --directory apps/table
```

- 3D table: http://localhost:8765/
- 2D fallback: http://localhost:8765/fallback.html

## What this repo is

| Path | Contents |
|---|---|
| `docs/product/` | Locked copy, offer, PRD, plan, playbook, operating model |
| `docs/sprint/` | 8-week Planning Sprint kit |
| `docs/ACCEPTANCE.md` | PRD §10 stranger checks |
| `docs/PUBLIC.md` | What the Foundation preview may say |
| `docs/INSTITUTIONAL.md` | What the Workspace may say |
| `packages/schema/` | Evidence object and twelve dimensions |
| `templates/` | Decision Record and one-pager |
| `apps/table/` | Lewis planning-table demonstration |

## What this repo is not

Not a diagnostic system. Not a forecast of individual health. Not eligibility or allocation. Not a complete facility inventory. Not an official CHA/CHIP.

## SKUs

1. **Public Preview** — Foundation, read-only  
2. **Planning Sprint** — Tech Inc., 8 weeks, one county  
3. **County Workspace** — Tech Inc., licensed, after a source agreement  

## Status

Demonstration table: LIVE as a seeded object (3D + 2D).  
Workspace auth, live adapters, dual-cloud: PLANNED.

## Related repos (do not collapse into this one)

- Public/product health surface: `drolu-cmyk/sozorock-health`  
- Institutional runtime: `drolu-cmyk/sozorock-health-agentic`  
- Commercial door: `drolu-cmyk/sozorock-com` path `/cb-cap`

This repo owns the offer and the reference table.
