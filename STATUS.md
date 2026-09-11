# Status labels

| Label | Meaning |
|---|---|
| LIVE | Present |
| IMPLEMENTED_ACTIVATION_GATED | Built, not on for this surface |
| PLANNED | Specified, not built |
| RETIRED | Do not show |

LIVE: product table acts, SozoRock seed, pack validator, Worker routes `/v1/health` `/v1/demo/sozorock` `/v1/packs/validate`, D1 schema, target operating model.

IMPLEMENTED_ACTIVATION_GATED: Institutional Local Evidence form (browser-local); accept/reject in UI (not persisted).

PLANNED: D1 persistence, R2 export, Cloudflare Access, live adapters, dual-cloud, billing.

Worker `/v1/records/:id/accept` returns 403 by design.

Do not mark Lewis as LIVE-client. SozoRock County is synthetic.
