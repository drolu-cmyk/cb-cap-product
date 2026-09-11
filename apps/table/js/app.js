import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
const ORIGIN = { lon: -75.49, lat: 43.787 };
function project(lon, lat) {
  const x = (lon - ORIGIN.lon) * 111.32 * Math.cos((ORIGIN.lat * Math.PI) / 180);
  const z = -(lat - ORIGIN.lat) * 110.54;
  return [x, z];
}
const STATE = {
  view: "see", surface: "public", zcta: "13367", dimension: "availability",
  layersOn: new Set(CBCAP_SEED.dimensions.filter((d) => d.defaultOn !== false && d.slice).map((d) => d.id)),
  site: null, brief: "", tourI: 0
};
const COLORS = { evidenced: 0xb9c8f5, suspected: 0xe8c9a4, planned: 0xd5dbe3, missing: 0xf4f1ea };
function lens(z) {
  return (window.CBCAP_LENSES && CBCAP_LENSES[z]) || (window.CBCAP_LENSES && CBCAP_LENSES["13367"]) || {
    dimensions: {}, forecast: { caption: "Planning scenario — not a prediction of individual health", title: "—", horizon: "—", text: "" },
    alignmentMatrix: { barriers: [], funding: [], workforce: [], priorities: [] }, relations: [], populationNote: ""
  };
}
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd6cfc0);
const canvas = document.getElementById("view3d");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden";
document.getElementById("stage").appendChild(labelRenderer.domElement);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
camera.position.set(42, 58, 78);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 18;
controls.maxDistance = 180;
controls.target.set(0, 1.2, 0);
scene.add(new THREE.HemisphereLight(0xf2efe8, 0x8a8478, 1));
const sun = new THREE.DirectionalLight(0xfff6e8, 1.05);
sun.position.set(40, 55, 18);
scene.add(sun);
const zipMeshes = new Map();
const siteMeshes = [];
const extraGroup = new THREE.Group();
scene.add(extraGroup);
const callouts = [];
function resize() {
  const s = document.getElementById("stage");
  const w = s.clientWidth || 1, h = s.clientHeight || 1;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h, false); labelRenderer.setSize(w, h);
}
window.addEventListener("resize", resize);
function heightAt(x, z) { return Math.sin(x * 0.07) * 1.8 + Math.cos(z * 0.05) * 1.4; }
function paintZips() {
  zipMeshes.forEach((mesh, z) => {
    const st = (lens(z).dimensions[STATE.dimension] || {}).state || "missing";
    mesh.material.color.setHex(COLORS[st] || COLORS.missing);
    mesh.material.opacity = st === "missing" ? 0.28 : z === STATE.zcta ? 0.92 : 0.62;
    mesh.position.y = mesh.userData.baseY + (z === STATE.zcta ? 0.45 : 0);
  });
}
function addCallout(x, y, z, k, t) {
  const el = document.createElement("div"); el.className = "callout"; el.innerHTML = `<strong>${k}</strong>${t}`;
  const o = new CSS2DObject(el); o.position.set(x, y, z); scene.add(o); callouts.push(o);
}
function syncScene() {
  callouts.forEach((o) => scene.remove(o)); callouts.length = 0; extraGroup.clear();
  if (STATE.routeGroup) STATE.routeGroup.visible = STATE.layersOn.has("geography") || STATE.dimension === "geography";
  const m = zipMeshes.get(STATE.zcta);
  const cx = m ? m.position.x : 0, cz = m ? m.position.z : 0, cy = 4;
  if (STATE.dimension === "digital") addCallout(cx, cy, cz, "Not available", "Pale plate. Not zero.");
  else if (STATE.view === "see") addCallout(cx, cy, cz, "ZIP lens " + STATE.zcta, (CBCAP_SEED.zctaNames[STATE.zcta] || "") + " · planning lens, not people.");
  if (STATE.view === "compare") addCallout(cx, cy, cz, "Two published releases", "2025-12-04 and 2024-12-06. Same land. Not a ranking.");
  if (STATE.view === "plan") {
    const ring = new THREE.Mesh(new THREE.RingGeometry(6, 6.5, 40), new THREE.MeshBasicMaterial({ color: 0xb45309, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(cx, 1.2, cz); extraGroup.add(ring);
    addCallout(cx, cy + 1, cz, "Planning scenario", "System conditions. Not a prediction of health.");
  }
  if (STATE.view === "resource") addCallout(cx, cy, cz, "Resource alignment", "Mismatch is the object. No allocation.");
  if (STATE.view === "track") addCallout(cx, cy, cz, "What changed", "Dated public files only.");
}
async function buildWorld() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 40, 40), new THREE.MeshStandardMaterial({ color: 0xc4bba8, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const data = window.CBCAP_ZCTA3D || (await fetch("./data/zcta-3d.json").then((r) => r.json()));
  STATE.zips3d = data.zips;
  data.zips.forEach((zip) => {
    if (!zip.ring || zip.ring.length < 4) return;
    const shape = new THREE.Shape();
    zip.ring.forEach((p, i) => (i ? shape.lineTo(p[0], -p[1]) : shape.moveTo(p[0], -p[1])));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COLORS.evidenced, transparent: true, opacity: 0.62 }));
    const hy = heightAt(zip.center[0], zip.center[1]) * 0.35;
    mesh.position.y = hy + 0.15; mesh.userData = { zcta: zip.zcta, kind: "zip", baseY: hy + 0.15 };
    scene.add(mesh); zipMeshes.set(zip.zcta, mesh);
  });
  CBCAP_SEED.sites.forEach((s) => {
    const [x, z] = project(s.lon, s.lat);
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, s.kind === "hospital" ? 1.8 : 1, 1.1), new THREE.MeshStandardMaterial({ color: s.kind === "hospital" ? 0x9b1c2c : 0x1e3a8a }));
    box.position.set(x, 1.2, z); box.userData = { kind: "site", id: s.id, zcta: s.zcta };
    scene.add(box); siteMeshes.push(box);
  });
  STATE.routeGroup = new THREE.Group();
  CBCAP_SEED.routes.forEach((r) => {
    const pts = r.coordinates.map(([lon, lat]) => { const [x, z] = project(lon, lat); return new THREE.Vector3(x, 0.8, z); });
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.16, 4, false), new THREE.MeshStandardMaterial({ color: 0x5b6b82 }));
    STATE.routeGroup.add(tube);
  });
  STATE.routeGroup.visible = false;
  scene.add(STATE.routeGroup);
  paintZips(); resize();
}
function renderStamps() {
  const host = document.getElementById("stamps"); if (!host) return;
  const zips = STATE.zips3d || [];
  let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;
  zips.forEach((z) => z.ring.forEach((p) => { minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minZ=Math.min(minZ,p[1]); maxZ=Math.max(maxZ,p[1]); }));
  const w=80,h=52,pad=4,s=Math.min((w-pad*2)/Math.max(1,maxX-minX),(h-pad*2)/Math.max(1,maxZ-minZ));
  const fill = { evidenced:"#b9c8f5", suspected:"#e8c9a4", planned:"#d5dbe3", missing:"url(#hatch)" };
  host.innerHTML = CBCAP_SEED.dimensions.map((d) => {
    const st = (lens(STATE.zcta).dimensions[d.id] || {}).state || "missing";
    const paths = zips.map((z) => {
      const zs = (lens(z.zcta).dimensions[d.id] || {}).state || "missing";
      const dd = z.ring.map((p,i) => `${i?"L":"M"}${(pad+(p[0]-minX)*s).toFixed(1)},${(pad+(p[1]-minZ)*s).toFixed(1)}`).join(" ");
      const sel = z.zcta===STATE.zcta ? " stroke='#15233b' stroke-width='1.4'" : " stroke='#8b95a6' stroke-width='0.4'";
      return `<path d="${dd} Z" fill="${fill[zs]||fill.missing}"${sel}/>`;
    }).join("");
    const svg = zips.length ? `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><pattern id="hatch-${d.id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#f4f1ea"/><path d="M0 4 L4 0" stroke="#c5cad3" stroke-width="0.8"/></pattern></defs>${paths.replaceAll("url(#hatch)",`url(#hatch-${d.id})`)}</svg>` : "";
    return `<button class="stamp" data-stamp="${d.id}" aria-pressed="${d.id===STATE.dimension}">${svg}<b>${d.label}</b><i>${st==="missing"?"not available":st}</i></button>`;
  }).join("");
  host.querySelectorAll("[data-stamp]").forEach((b) => { b.onclick = () => { STATE.dimension = b.dataset.stamp; if (STATE.dimension==="geography") STATE.layersOn.add("geography"); paintZips(); renderUI(); }; });
}
function renderDock() {
  const feats = [["see","See evidence","Color = one dimension"],["compare","Compare releases","Two dates. Not a ranking"],["plan","Test a scenario","Not a prediction"],["resource","Align resources","No allocation"],["track","Track change","Public files"]];
  document.getElementById("feat-dock").innerHTML = feats.map(([id,t,h]) => `<button class="feat" data-feat="${id}" aria-current="${STATE.view===id}"><b>${t}</b><span>${h}</span></button>`).join("");
  document.querySelectorAll("[data-feat]").forEach((b) => { b.onclick = () => { STATE.view = b.dataset.feat; if (["plan","resource","track"].includes(STATE.view)) STATE.surface = "institutional"; renderUI(); }; });
}
function renderRail() {
  const L = lens(STATE.zcta);
  const rows = CBCAP_SEED.dimensions.map((d) => {
    const st = (L.dimensions[d.id] || {}).state || "missing";
    return `<div class="dim-row"><span class="dot ${st}"></span><span>${d.label}</span><span class="state">${st==="missing"?"not available":st}</span></div>`;
  }).join("");
  const opts = Object.entries(CBCAP_SEED.zctaNames).map(([z,n]) => `<option value="${z}" ${z===STATE.zcta?"selected":""}>${z} · ${n}</option>`).join("");
  document.getElementById("rail").innerHTML = `<h2>Barrier dimensions</h2><p class="hint">The land is terrain. Color is evidence state for the open dimension.</p><div class="filters"><select id="filter-zcta">${opts}</select></div>${rows}`;
  document.getElementById("filter-zcta").onchange = (e) => { STATE.zcta = e.target.value; paintZips(); renderUI(); };
}
function draftRecord() {
  const L = lens(STATE.zcta);
  const name = CBCAP_SEED.zctaNames[STATE.zcta] || "";
  const dim = L.dimensions[STATE.dimension] || { state: "missing", mark: "Not available" };
  const d = CBCAP_SEED.dimensions.find((x) => x.id === STATE.dimension);
  return `DECISION RECORD (AI draft · awaiting human)\n\nPlace. ZIP lens ${STATE.zcta} · ${name} · Lewis County, NY (36049)\nOwner. Unassigned\nReview date. Unset\nStatus. draft\n\n${d.label} is ${dim.state} (${dim.mark || ""}).\nDigital access is Not available and is not drawn as zero.\n\nLimits. CB-CAP does not diagnose, predict individual health, allocate funds, or replace CHA/CHIP.\nHonesty. Public-data demonstration. Not a Lewis County deployment.\nJudgment. AI drafts. People decide.`;
}
function renderInspector() {
  const L = lens(STATE.zcta);
  const name = CBCAP_SEED.zctaNames[STATE.zcta] || "";
  const dim = L.dimensions[STATE.dimension] || { state: "missing", mark: "Not available", items: [] };
  const stack = CBCAP_SEED.dimensions.map((d) => {
    const st = (L.dimensions[d.id] || {}).state || "missing";
    return `<button class="cell ${st}" data-open-dim="${d.id}" aria-pressed="${d.id===STATE.dimension}"><span>${d.label}</span><span class="mark">${st==="missing"?"Not available":(L.dimensions[d.id]||{}).mark||st}</span></button>`;
  }).join("");
  let extra = "";
  if (STATE.view === "plan" && L.forecast) extra += `<div class="scenario"><strong>${L.forecast.caption}</strong><p>${L.forecast.title} · ${L.forecast.horizon}</p><p>${L.forecast.text}</p></div>`;
  if (STATE.view === "compare") extra += `<p class="caption">Two dated releases: 2025-12-04 and 2024-12-06. Digital access stays Not available. Not a ranking.</p>`;
  if (STATE.view === "resource" && L.alignmentMatrix) extra += `<div class="matrix"><section><h4>Barriers</h4><ul>${(L.alignmentMatrix.barriers||[]).map((x)=>`<li>${x}</li>`).join("")}</ul></section><section><h4>Funding</h4><ul>${(L.alignmentMatrix.funding||[]).map((x)=>`<li>${x}</li>`).join("")}</ul></section><section><h4>Workforce</h4><ul>${(L.alignmentMatrix.workforce||[]).map((x)=>`<li>${x}</li>`).join("")}</ul></section><section><h4>Priorities</h4><ul>${(L.alignmentMatrix.priorities||[]).map((x)=>`<li>${x}</li>`).join("")}</ul></section></div><p class="caption">Mismatch is the object. No allocation.</p>`;
  if (STATE.view === "track") extra += `<ul class="changed">${(window.CBCAP_CHANGED||[]).map((c)=>`<li><strong>${c.title}</strong><div>${c.detail}</div></li>`).join("")}</ul>`;
  if (STATE.surface === "institutional") extra += `<button class="ghost" id="btn-brief">Draft Decision Record</button>${STATE.brief?`<div class="brief-box">${STATE.brief}</div>`:""}`;
  document.getElementById("inspector").innerHTML = `<p class="lens-kicker">ZIP lens ${STATE.zcta}</p><h2 class="lens-title">${name}</h2><p class="place-note">Census 2010 ZCTA as a planning lens. Not a label for people. Not a Lewis County deployment.</p><div class="stack">${stack}</div><div class="evidence"><p><span class="pill">${dim.mark||""}</span><span class="pill">${dim.state==="missing"?"Not available":dim.state||""}</span></p>${(dim.items||[]).map((i)=>`<article><h3>${i.title}</h3><p>${i.detail}</p><p class="meta-line"><strong>Source.</strong> ${i.source} · <strong>Missingness.</strong> ${i.missingness}</p></article>`).join("")}</div>${extra}<p class="hint">${CBCAP_SEED.meta.ai}</p>`;
  document.querySelectorAll("[data-open-dim]").forEach((b) => { b.onclick = () => { STATE.dimension = b.dataset.openDim; paintZips(); renderUI(); }; });
  const bb = document.getElementById("btn-brief");
  if (bb) bb.onclick = () => {
    STATE.brief = draftRecord();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([STATE.brief], { type: "text/markdown" }));
    a.download = `cb-cap-decision-record-${STATE.zcta}-draft.md`;
    a.click();
    renderInspector();
  };
}
function renderLegend() {
  document.getElementById("legend").innerHTML = `<h3>How to read the table</h3><div class="row"><i class="sw ev"></i> Evidenced</div><div class="row"><i class="sw su"></i> Suspected</div><div class="row"><i class="sw mi"></i> Missing — not zero</div><div class="row"><i class="sw pl"></i> Planned</div>`;
}
function renderChrome() {
  document.querySelectorAll(".workflow button").forEach((b) => b.setAttribute("aria-current", b.dataset.view === STATE.view ? "page" : "false"));
  document.querySelectorAll(".seg button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.surface === STATE.surface ? "true" : "false"));
  document.getElementById("banner-text").textContent = CBCAP_SEED.meta.banner;
  document.getElementById("map-label-a").textContent = STATE.view === "compare" ? "Compare two published releases · not a ranking" : "Lewis County · planning table";
}
function renderUI() { renderChrome(); renderLegend(); renderRail(); renderDock(); renderStamps(); renderInspector(); if (zipMeshes.size) { paintZips(); syncScene(); } }
const TOUR = [
  { title: "The land is terrain.", body: "Hills are not a barrier score. Color is the evidence state of the dimension you opened.", view: "see", dim: "availability", z: "13367" },
  { title: "A ZIP is a lens.", body: "13367 is the Lowville area used for planning. It is not a label for people.", view: "see", dim: "availability", z: "13367" },
  { title: "Missing stays missing.", body: "Digital access is Not available. The plate goes pale. We do not paint zero.", view: "see", dim: "digital", z: "13312" },
  { title: "Sites sit on the land.", body: "The hospital and clinics are masses you can tap. This is not a complete inventory.", view: "see", dim: "availability", z: "13367" },
  { title: "Geography is one dimension.", body: "Corridors appear only when Geography is on. Travel is never the whole access story.", view: "see", dim: "geography", z: "13367" },
  { title: "Compare two releases.", body: "Same county. Dates 2025-12-04 and 2024-12-06. Not a ranking.", view: "compare", dim: "affordability", z: "13367" },
  { title: "A scenario is labeled.", body: "Amber is a planning scenario of system conditions. It is not a prediction of anyone's health.", view: "plan", dim: "rural", z: "13367" },
  { title: "Mismatch is the object.", body: "Resource view shows barriers, funds, workforce, and CHIP priorities. Nothing here allocates money.", view: "resource", dim: "alignment", z: "13367" }
];
function applyTour(i) {
  if (i >= TOUR.length) return endTour();
  const t = TOUR[i];
  STATE.tourI = i; STATE.view = t.view; STATE.dimension = t.dim; STATE.zcta = t.z;
  STATE.surface = (t.view === "see" || t.view === "compare") ? "public" : "institutional";
  if (t.dim === "geography") STATE.layersOn.add("geography"); else STATE.layersOn.delete("geography");
  document.getElementById("tour").classList.remove("hidden");
  document.getElementById("tour-title").textContent = t.title;
  document.getElementById("tour-body").textContent = t.body;
  document.getElementById("tour-step").textContent = `${i + 1} / ${TOUR.length}`;
  paintZips(); renderUI();
}
function endTour() {
  document.getElementById("tour").classList.add("hidden");
  STATE.view = "see"; STATE.surface = "public"; STATE.zcta = "13367"; STATE.dimension = "availability";
  paintZips(); renderUI();
}
function bind() {
  document.querySelectorAll(".workflow button").forEach((b) => { b.onclick = () => { STATE.view = b.dataset.view; if (["plan","resource","track"].includes(STATE.view)) STATE.surface = "institutional"; renderUI(); }; });
  document.querySelectorAll(".seg button").forEach((b) => { b.onclick = () => { STATE.surface = b.dataset.surface; renderUI(); }; });
  document.getElementById("btn-reset").onclick = () => { camera.position.set(42,58,78); controls.target.set(0,1.2,0); };
  document.getElementById("btn-scenario").onclick = () => { STATE.view = "plan"; STATE.surface = "institutional"; renderUI(); };
  document.getElementById("btn-tour").onclick = () => applyTour(0);
  document.getElementById("sheet-toggle").onclick = () => document.querySelector(".app").classList.toggle("sheet-min");
  document.getElementById("tour-skip").onclick = endTour;
  document.getElementById("tour-next").onclick = () => applyTour(STATE.tourI + 1);
  window.addEventListener("keydown", (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "")) return;
    const ids = Object.keys(CBCAP_SEED.zctaNames);
    const i = ids.indexOf(STATE.zcta);
    if (e.key === "ArrowRight" && i < ids.length - 1) STATE.zcta = ids[i + 1];
    else if (e.key === "ArrowLeft" && i > 0) STATE.zcta = ids[i - 1];
    else if (e.key === "Escape") return endTour();
    else return;
    paintZips(); renderUI();
  });
}
const ray = new THREE.Raycaster(); const pointer = new THREE.Vector2();
canvas.addEventListener("pointerup", (e) => {
  const r = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(pointer, camera);
  const hits = ray.intersectObjects([...zipMeshes.values(), ...siteMeshes], false);
  if (!hits.length) return;
  STATE.zcta = hits[0].object.userData.zcta; STATE.site = hits[0].object.userData.kind === "site" ? hits[0].object.userData.id : null;
  paintZips(); renderUI();
});
function tick() { requestAnimationFrame(tick); controls.update(); renderer.render(scene, camera); labelRenderer.render(scene, camera); }
bind(); renderUI(); tick();
buildWorld().then(() => { resize(); applyTour(0); }).catch((err) => {
  console.error(err);
  document.getElementById("map-label-a").textContent = "3D table failed. Opening 2D fallback.";
  setTimeout(() => { window.location.href = "./fallback.html"; }, 900);
});
