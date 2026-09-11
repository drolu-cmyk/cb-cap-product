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
  site: null, brief: ""
};
const COLORS = { evidenced: 0xb9c8f5, suspected: 0xe8c9a4, planned: 0xd5dbe3, missing: 0xf4f1ea };
function lens(z) { return (window.CBCAP_LENSES && CBCAP_LENSES[z]) || (window.CBCAP_LENSES && CBCAP_LENSES["13367"]) || { dimensions: {}, forecast: { caption: "Planning scenario — not a prediction of individual health", title: "—", horizon: "—", text: "" }, alignmentMatrix: { barriers: [], funding: [], workforce: [], priorities: [] }, relations: [], items: [], populationNote: "" }; }
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
  if (STATE.view === "compare") addCallout(cx, cy, cz, "Two published releases", "Same land. Not a ranking.");
  if (STATE.view === "plan") {
    const ring = new THREE.Mesh(new THREE.RingGeometry(6, 6.5, 40), new THREE.MeshBasicMaterial({ color: 0xb45309, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(cx, 1.2, cz); extraGroup.add(ring);
    addCallout(cx, cy + 1, cz, "Planning scenario", "System conditions. Not a prediction of health.");
  }
  if (STATE.view === "resource") addCallout(cx, cy, cz, "Resource alignment", "Mismatch is the object. No allocation.");
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
  STATE.routeGroup = new THREE.Group(); STATE.routeGroup.visible = false;
  scene.add(STATE.routeGroup);
  paintZips(); resize();
}
function renderStamps() {
  const host = document.getElementById("stamps"); if (!host) return;
  host.innerHTML = CBCAP_SEED.dimensions.map((d) => {
    const st = (lens(STATE.zcta).dimensions[d.id] || {}).state || "missing";
    return `<button class="stamp" data-stamp="${d.id}" aria-pressed="${d.id === STATE.dimension}"><b>${d.label}</b><i>${st === "missing" ? "not available" : st}</i></button>`;
  }).join("");
  host.querySelectorAll("[data-stamp]").forEach((b) => { b.onclick = () => { STATE.dimension = b.dataset.stamp; paintZips(); renderUI(); }; });
}
function renderDock() {
  const feats = [["see","See evidence","Color = one dimension"],["compare","Compare releases","Two dates. Not a ranking"],["plan","Test a scenario","Not a prediction"],["resource","Align resources","No allocation"],["track","Track change","Public files"]];
  document.getElementById("feat-dock").innerHTML = feats.map(([id,t,h]) => `<button class="feat" data-feat="${id}" aria-current="${STATE.view===id}"><b>${t}</b><span>${h}</span></button>`).join("");
  document.querySelectorAll("[data-feat]").forEach((b) => { b.onclick = () => { STATE.view = b.dataset.feat; if (["plan","resource","track"].includes(STATE.view)) STATE.surface = "institutional"; renderUI(); }; });
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
  if (STATE.view === "compare") extra += `<p class="caption">Two dated releases. Digital access stays Not available. Not a ranking.</p>`;
  if (STATE.surface === "institutional") extra += `<button class="ghost" id="btn-brief">Draft Decision Record</button>${STATE.brief?`<div class="brief-box">${STATE.brief}</div>`:""}`;
  document.getElementById("inspector").innerHTML = `<p class="lens-kicker">ZIP lens ${STATE.zcta}</p><h2 class="lens-title">${name}</h2><p class="place-note">Census 2010 ZCTA as a planning lens. Not a label for people. Not a Lewis County deployment.</p><div class="stack">${stack}</div><div class="evidence"><p><span class="pill">${dim.mark||""}</span><span class="pill">${dim.state||""}</span></p>${(dim.items||[]).map((i)=>`<article><h3>${i.title}</h3><p>${i.detail}</p><p class="meta-line"><strong>Source.</strong> ${i.source} · <strong>Missingness.</strong> ${i.missingness}</p></article>`).join("")}</div>${extra}<p class="hint">${CBCAP_SEED.meta.ai}</p>`;
  document.querySelectorAll("[data-open-dim]").forEach((b) => { b.onclick = () => { STATE.dimension = b.dataset.openDim; paintZips(); renderUI(); }; });
  const bb = document.getElementById("btn-brief");
  if (bb) bb.onclick = () => {
    STATE.brief = `DECISION RECORD (AI draft · awaiting human)\nPlace. ${STATE.zcta} · ${name} · Lewis County NY 36049\n${STATE.dimension} is ${dim.state}. Digital access is Not available — not zero.\nLimits. No diagnosis, no individual prediction, no allocation.`;
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
function renderUI() { renderChrome(); renderLegend(); renderDock(); renderStamps(); renderInspector(); if (zipMeshes.size) { paintZips(); syncScene(); } }
function bind() {
  document.querySelectorAll(".workflow button").forEach((b) => { b.onclick = () => { STATE.view = b.dataset.view; if (["plan","resource","track"].includes(STATE.view)) STATE.surface = "institutional"; renderUI(); }; });
  document.querySelectorAll(".seg button").forEach((b) => { b.onclick = () => { STATE.surface = b.dataset.surface; renderUI(); }; });
  document.getElementById("btn-reset").onclick = () => { camera.position.set(42,58,78); controls.target.set(0,1.2,0); };
  document.getElementById("btn-scenario").onclick = () => { STATE.view = "plan"; STATE.surface = "institutional"; renderUI(); };
  document.getElementById("btn-tour").onclick = () => { document.getElementById("tour").classList.remove("hidden"); };
  document.getElementById("sheet-toggle").onclick = () => document.querySelector(".app").classList.toggle("sheet-min");
  document.getElementById("tour-skip").onclick = () => document.getElementById("tour").classList.add("hidden");
  document.getElementById("tour-next").onclick = () => document.getElementById("tour").classList.add("hidden");
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
buildWorld().then(() => { resize(); renderUI(); }).catch((err) => { console.error(err); document.getElementById("map-label-a").textContent = "Use fallback.html if WebGL fails."; });
