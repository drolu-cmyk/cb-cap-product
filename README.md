# CB-CAP

**County planning for health access**  
SozoRock Tech Inc.

From evidence to a plan you can defend.  
See the evidence. Test the options. Build the plan.  
AI drafts. People decide.

This repository is the commercial product definition and reference table for CB-CAP.

The **demonstrable product** uses a synthetic place — SozoRock County, FIPS `00000`, ZIP lenses `00000` / `00001` / `00002` — so every barrier dimension and every product act can run. Any county can replace that seed with typed values or a JSON pack. Lewis County, New York remains a public-data reference place only. Neither is a deployment.

## Run the product table

```
python3 -m http.server 8765 --directory apps/table
```

- Product table (synthetic county, all acts): http://localhost:8765/product.html
- Lewis 3D table: http://localhost:8765/
- Lewis 2D fallback: http://localhost:8765/fallback.html

## What this repo is

| Path | Contents |
|---|---|
| `apps/table/product.html` | SozoRock County product table — open this first |
| `docs/product/` | Locked copy, offer, PRD, plan, playbook, operating model |
| `docs/sprint/` | 8-week Planning Sprint kit |
| `docs/ACCEPTANCE.md` | PRD §10 stranger checks |
| `packages/schema/` | Evidence object, twelve dimensions, county-input pack |
| `templates/` | Decision Record and one-pager |
| `apps/table/` | Lewis planning-table demonstration |

## What this repo is not

Not a diagnostic system. Not a forecast of individual health. Not eligibility or allocation. Not a complete facility inventory. Not an official CHA/CHIP. Not a real county.

## SKUs

1. **Public Preview** — Foundation, read-only  
2. **Planning Sprint** — Tech Inc., 8 weeks, one county  
3. **County Workspace** — Tech Inc., licensed, after a source agreement  

## Status

Product table: LIVE as a synthetic seeded object.  
Workspace auth, live adapters, dual-cloud: PLANNED.

## Related repos (do not collapse into this one)

- Public/product health surface: `drolu-cmyk/sozorock-health`  
- Institutional runtime: `drolu-cmyk/sozorock-health-agentic`  
- Commercial door: `drolu-cmyk/sozorock-com` path `/cb-cap`
