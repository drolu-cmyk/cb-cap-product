# CB-CAP edge platform (Wave 1)

Cloudflare-shaped system of record for the planning table.

```
npx wrangler dev --config wrangler.toml
# GET http://127.0.0.1:8787/v1/health
# GET http://127.0.0.1:8787/v1/demo/sozorock
# POST http://127.0.0.1:8787/v1/packs/validate
```

Create remote bindings once, then replace IDs in `wrangler.toml`:

```
npx wrangler d1 create cbcap
npx wrangler d1 execute cbcap --file=schema.sql
npx wrangler kv namespace create DEMO
npx wrangler r2 bucket create cbcap-artifacts
npx wrangler deploy
```

Wave 1 does not persist records. Accept endpoints return 403 by design.
