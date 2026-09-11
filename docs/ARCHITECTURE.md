# Architecture

```
Public Preview  →  read-only table + stamps + sources
County Workspace → Preview + local evidence + Decision Record
Planning Sprint  → facilitation around Workspace
```

Client: planning table (WebGL) + SVG multiples + inspector.
Seed: versioned JSON with source notes (`data/lewis/`).
Adapter (PLANNED): `SourceAdapter.list(countyFips)` returns evidence objects. Lewis seed is adapter `public-demo-lewis`.

No composite layer. No write to EHR. Audit panel is the only place for engineering identifiers.
