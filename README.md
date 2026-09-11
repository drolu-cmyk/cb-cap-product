# CB-CAP

**County planning for health access**  
SozoRock Tech Inc.

From evidence to a plan you can defend.  
See the evidence. Test the options. Build the plan.  
AI drafts. People decide.

This repository is the commercial product definition, reference table, and Wave 1 edge platform for CB-CAP.

The **demonstrable product** uses a synthetic place — SozoRock County, FIPS `00000` — so every barrier dimension and every product act can run. Lewis County, New York remains a public-data reference place only. Neither is a deployment.

## Read this first

- Operating model: [`docs/blueprint/README.md`](docs/blueprint/README.md)
- Edge platform: [`platform/`](platform/)
- Product table: [`apps/table/product.html`](apps/table/product.html)

## Run

```
python3 -m http.server 8765 --directory apps/table
# http://localhost:8765/product.html
# http://localhost:8765/blueprint.html

cd platform && npx wrangler dev
# GET /v1/health
# GET /v1/demo/sozorock
# POST /v1/packs/validate
```

Table can load the Worker pack: `product.html?api=http://127.0.0.1:8787`

## SKUs

1. Public Preview — Foundation, read-only
2. Planning Sprint — Tech Inc., 8 weeks, one county
3. County Workspace — Tech Inc., licensed, after a source agreement

## Status

Wave 0 blueprint: LIVE. Wave 1 Worker + validator + D1 schema: LIVE in repo (bindings not yet provisioned). Wave 2 persist/accept: PLANNED.
