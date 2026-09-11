# CB-CAP edge platform

Wave 0 approved 2026-09-11. Wave 2 logic is in the Worker.

```
cd platform
npm test
npx wrangler dev
```

| Method | Path | Rule |
|---|---|---|
| GET | `/v1/health` | env + persist mode |
| GET | `/v1/demo/sozorock` | synthetic pack |
| POST | `/v1/packs/validate` | missing ≠ 0 |
| POST | `/v1/packs` | validate + persist |
| GET | `/v1/packs/:id` | load pack |
| POST | `/v1/records/draft` | status=draft |
| POST | `/v1/records/:id/accept` | named owner required; 403 otherwise |
| POST | `/v1/records/:id/reject` | named owner required |
| GET | `/v1/records/:id/export` | markdown |

Without D1 the Worker uses process memory. That is enough to prove the contract. It is not a county system of record.

Provision Cloudflare (Tech Inc. account):

```
npx wrangler login
npx wrangler d1 create cbcap
npx wrangler d1 execute cbcap --file=schema.sql
npx wrangler kv namespace create DEMO
npx wrangler r2 bucket create cbcap-artifacts
# paste IDs into wrangler.toml, uncomment bindings, then
npx wrangler deploy
```

Header `X-CB-CAP-Owner` must match body `owner` on accept/reject. Cloudflare Access replaces that header in Wave 3.
