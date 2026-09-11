# Planning table (Lewis demonstration)

Public-data demonstration. Not a Lewis County deployment.

## Run

```
python3 -m http.server 8765 --directory apps/table
```

Open `http://localhost:8765/` for the 3D table.  
Open `http://localhost:8765/fallback.html` if WebGL is blocked.

## Files

| File | Role |
|---|---|
| `index.html` | 3D planning table |
| `fallback.html` | 2D stamps + inspector + Decision Record |
| `css/app.css` | Product chrome |
| `js/app.js` | Three.js runtime (procedural editorial terrain) |
| `data/seed.js` | County seed, sites, routes, twelve dimensions |
| `data/seed-lenses.js` | Evidence objects per ZCTA |
| `data/zcta-3d.json` | Projected Census 2010 ZCTA rings |

## Contract

- Color and hatch = evidence state of the **open** dimension.
- Missing is drawn pale + hatch. Never zero.
- ZIP codes are planning lenses, not labels for people.
- Compare is two published dates. Not a ranking.
- Plan is a labeled scenario. Not a prediction of individual health.
- Decision Record is always an AI draft until a human accepts.

Terrain is editorial, not a surveyed DEM. Sites are a seeded subset, not an inventory.
