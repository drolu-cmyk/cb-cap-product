# Planning table (Lewis demonstration)

Public-data demonstration. Not a Lewis County deployment.

```
python3 -m http.server 8765 --directory apps/table
```

- `index.html` — 3D table (Three.js from CDN). Needs `js/app.js`, `css/app.css`, `data/seed.js`, `data/seed-lenses.js`, `data/zcta-3d.json`.
- `fallback.html` — 2D stamps if WebGL fails.

Add this to `index.html` before app.js if lenses do not paint:

```
<script src="./data/seed.js"></script>
<script src="./data/seed-lenses.js"></script>
```
