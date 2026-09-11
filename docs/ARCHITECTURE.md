# Architecture

Source of truth: `docs/blueprint/README.md`.

```
Public Preview  → Pages + Worker demo pack (read-only)
County Workspace → Pages + Access + D1 packs + R2 exports
Planning Sprint  → facilitation around Workspace
```

Wave 1 (in repo):

- Worker `platform/worker/index.js`
- Validator `platform/worker/validate.js` (missing ≠ 0)
- D1 schema `platform/schema.sql`
- Table `apps/table/product.html` (offline seed; `?api=` loads Worker pack)

No composite layer. No EHR write. No Worker-accepted Decision Record.
