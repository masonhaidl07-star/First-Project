import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* =========================================================
   MOGCITY — a 3D looksmaxxing life-sim
   Stylized-realistic Three.js build: day/night sky, wind,
   a humanoid character, a free orbit camera, and a walk-in
   gym with usable equipment. Your photo stays on your device.
   ========================================================= */

// ---------- Data ----------
const SAVE_KEY = "mogcity-save";

const TONES = ["#f6d7c4", "#eebfa0", "#d9a06f", "#b97d4e", "#8d5a33", "#5d3a1e"];

const TITLES = [
  { min: 800, name: "ASCENDED" },
  { min: 600, name: "GIGAMOGGER" },
  { min: 450, name: "MOGGER" },
  { min: 300, name: "RISING" },
  { min: 150, name: "GRINDER" },
  { min: 0, name: "NPC" },
];

const PRODUCTS = [
  { id: "cleanser", name: "GlassRinse Cleanser", desc: "+4 SKIN · the foundation", price: 60, boost: 4 },
  { id: "spf", name: "SunMog SPF 50", desc: "+6 SKIN · the real anti-aging cheat", price: 80, boost: 6 },
  { id: "moist", name: "DewMaxx Moisturizer", desc: "+5 SKIN · lock it in", price: 70, boost: 5 },
  { id: "retinol", name: "Retinol Ascension Serum", desc: "+10 SKIN · advanced tier", price: 150, boost: 10 },
  { id: "guasha", name: "Gua Sha of Destiny", desc: "+2 SKIN · mostly vibes", price: 40, boost: 2 },
];

const HAIRCUTS = [
  { id: "buzz", name: "The Buzz", desc: "+4 HAIR · clean reset", price: 50, boost: 4 },
  { id: "fade", name: "Mid-Taper Fade", desc: "+6 HAIR · barber knows", price: 90, boost: 6 },
  { id: "fringe", name: "Textured Fringe", desc: "+8 HAIR · the algorithm's favorite", price: 120, boost: 8 },
  { id: "flow", name: "The Flow", desc: "+10 HAIR · grown, not bought", price: 150, boost: 10 },
];

const OUTFITS = [
  { id: "basic", name: "Basic Tee", desc: "+0 DRIP · day one", price: 0, boost: 0, shirt: 0x8a8a92, pants: 0x3a3a44 },
  { id: "street", name: "Streetwear Set", desc: "+10 DRIP · off the rack at Mogiqlo", price: 200, boost: 10, shirt: 0x17171c, pants: 0x26262e },
  { id: "oldmoney", name: "Old Money Fit", desc: "+15 DRIP · quiet luxury", price: 350, boost: 15, shirt: 0xe8e0cc, pants: 0x2c3a55 },
  { id: "tech", name: "Techwear System", desc: "+20 DRIP · final form", price: 500, boost: 20, shirt: 0x10151b, pants: 0x0e2a33 },
];

const QUIZ = [
  { q: "The single best anti-aging product?", a: ["Sunscreen, daily", "Bone smashing", "A $90 jade roller", "Toothpaste on your face"], c: 0 },
  { q: "Optimal sleep for recovery, skin and aura?", a: ["7–9 hours", "4 hours, grindset", "12+ hours daily", "Sleep is for NPCs"], c: 0 },
  { q: "Best NATURAL way to a sharper jawline?", a: ["Lower body-fat %", "Bone smashing", "Chewing rocks", "Buying one online"], c: 0 },
  { q: "How often should your pillowcase get washed?", a: ["Weekly", "Never", "Once a year", "When it moves on its own"], c: 0 },
  { q: "How long do you run a new routine before judging it?", a: ["About 30 days", "24 hours", "3 days", "One TikTok"], c: 0 },
  { q: "What matters most in style?", a: ["Fit", "Brand logos", "Price tag", "Wearing everything at once"], c: 0 },
  { q: "Daily water target?", a: ["2–3 liters", "One sip", "Only energy drinks", "10 gallons minimum"], c: 0 },
  { q: "What actually fixes posture?", a: ["Rows, face pulls, awareness", "Hoping", "A metal rod", "Standing up once"], c: 0 },
  { q: "What does moisturizer actually do?", a: ["Locks in hydration", "Makes you glow in the dark", "Replaces sleep", "Attracts moths"], c: 0 },
  { q: "Skin freaking out. First move?", a: ["Simplify and stay consistent", "Add 12 new serums", "Scrub harder", "Panic"], c: 0 },
];

const QUIZ_PAY = 40;
const QUIZ_DAILY_CAP = 200;
const WORKOUTS_PER_DAY = 6;

// Gym equipment — each set you complete grants FIT.
const MACHINES = [
  { id: "bench", name: "Bench Press", emoji: "🏋️", gain: 5, reps: 5, note: "Chest day. Drive it up." },
  { id: "squat", name: "Squat Rack", emoji: "🦵", gain: 6, reps: 5, note: "Legs are the cheat code." },
  { id: "tread", name: "Treadmill", emoji: "🏃", gain: 4, reps: 6, note: "Cardio for the jawline." },
  { id: "dumbbell", name: "Dumbbell Rack", emoji: "💪", gain: 4, reps: 6, note: "Curls for the aura." },
  { id: "pulldown", name: "Lat Pulldown", emoji: "🧲", gain: 5, reps: 5, note: "Build the V-taper." },
];

const BOTS = [
  ["JawlineJay", 612, 6], ["AuraFarmer", 540, 9], ["MewKing2009", 488, 7],
  ["SigmaSam", 430, 5], ["GlowUpGreg", 360, 8], ["PrettyBoyPat", 300, 6],
  ["CantStopMoggin", 245, 7], ["LowkeyMogger", 180, 5], ["NPCNed", 60, 1],
];

// ---------- State ----------
let state = null;

function todayStr() { return new Date().toISOString().slice(0, 10); }

function defaultState(name, photo, tone) {
  return {
    name: name || "Mogger",
    photo: photo || null,
    tone: tone || TONES[1],
    stats: { skin: 8, hair: 8, fitness: 8, drip: 4 },
    money: 100,
    hair: "none",
    outfit: "basic",
    owned: { haircuts: [], outfits: ["basic"] },
    dailies: { date: todayStr(), products: [], workouts: 0, quizEarned: 0 },
    createdAt: Date.now(),
  };
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (_) { return null; }
}

function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) {}
}

function ensureDaily() {
  if (state.dailies.date !== todayStr()) {
    state.dailies = { date: todayStr(), products: [], workouts: 0, quizEarned: 0 };
    saveState();
  }
}

function aura() {
  const s = state.stats;
  return Math.round(((s.skin + s.hair + s.fitness + s.drip) / 400) * 1000);
}

function titleFor(a) { return TITLES.find((t) => a >= t.min).name; }

function addStat(key, amount) {
  const before = titleFor(aura());
  state.stats[key] = Math.min(100, state.stats[key] + amount);
  const after = titleFor(aura());
  saveState();
  refreshHUD();
  refreshBillboard();
  if (after !== before) {
    toast(after === "ASCENDED" ? "👑 ASCENDED. The city kneels." : `⬆️ Rank up — you are now ${after}`, 3800);
  }
}

function daysSinceStart() {
  return Math.max(0, Math.floor((Date.now() - state.createdAt) / 86400000));
}

function rankings() {
  const d = daysSinceStart();
  const rows = BOTS.map(([name, base, g]) => ({ name, aura: Math.min(985, base + g * d), me: false }));
  rows.push({ name: state.name, aura: aura(), me: true });
  rows.sort((a, b) => b.aura - a.aura);
  return rows;
}

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const intro = $("intro"), hud = $("hud"), modalWrap = $("modal-wrap"), modalBody = $("modal-body");
const hintEl = $("hint"), toastEl = $("toast");

let toastTimer = null;
function toast(msg, ms = 2200) {
  toastEl.textContent = msg;
  toastEl.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("on"), ms);
}

function refreshHUD() {
  $("hud-name").textContent = state.name;
  $("hud-title").textContent = titleFor(aura());
  $("hud-aura").textContent = `AURA ${aura()}`;
  $("cash").textContent = `$${state.money} MB`;
  for (const k of ["skin", "hair", "fitness", "drip"]) {
    $("bar-" + k).style.width = state.stats[k] + "%";
  }
}

// ---------- Modal ----------
let modalCleanup = null;
function openModal(html) {
  if (modalCleanup) { modalCleanup(); modalCleanup = null; }
  modalBody.innerHTML = html;
  modalWrap.classList.remove("hidden");
}
function closeModal() {
  if (modalCleanup) { modalCleanup(); modalCleanup = null; }
  modalWrap.classList.add("hidden");
  modalBody.innerHTML = "";
}
$("modal-close").addEventListener("click", closeModal);

// ---------- Face texture ----------
function makeFaceCanvas(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = state.tone;
  ctx.fillRect(0, 0, size, size);
  if (state.photo) {
    const img = facePhotoImg;
    if (img && img.complete) {
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
    }
  } else {
    // simple face
    ctx.fillStyle = "#1c1c22";
    ctx.beginPath(); ctx.arc(size * 0.36, size * 0.44, size * 0.045, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(size * 0.64, size * 0.44, size * 0.045, 0, 7); ctx.fill();
    ctx.strokeStyle = "#9c6b4e"; ctx.lineWidth = size * 0.03; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(size * 0.5, size * 0.46); ctx.lineTo(size * 0.5, size * 0.58); ctx.stroke();
    ctx.strokeStyle = "#7a3b30";
    ctx.beginPath(); ctx.arc(size * 0.5, size * 0.62, size * 0.13, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
  }
  return c;
}

let facePhotoImg = null;
function loadFacePhoto(cb) {
  if (!state.photo) { cb && cb(); return; }
  facePhotoImg = new Image();
  facePhotoImg.onload = () => cb && cb();
  facePhotoImg.src = state.photo;
}

// ---------- Three.js core ----------
let renderer, camera, clock;
let townScene, gymScene, activeScene;
let context = "town"; // "town" | "gym"

// world refs
let player, playerParts;
const buildings = [];          // town interactables/colliders
const npcs = [];
const windies = [];            // foliage that sways
const clouds = [];
let billboardCtx = null, billboardTex = null;
let sky, sunDisc, moonDisc, stars, sunLight, hemiLight, ambLight;
let gymStations = [];          // gym interactables
let gymExit = null;

let dayTime = 0.32;            // 0=midnight .25=sunrise .5=noon .75=sunset
const DAY_LENGTH = 240;        // seconds per full day

function initThree() {
  const canvas = $("game");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1200);

  // neutral studio environment makes the PBR materials read far more realistic
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  townScene = new THREE.Scene();
  townScene.environment = envTex;
  townScene.fog = new THREE.Fog(0x9fc7e8, 60, 240);

  gymScene = new THREE.Scene();
  gymScene.environment = envTex;
  gymScene.background = new THREE.Color(0x10131a);

  activeScene = townScene;

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  clock = new THREE.Clock();
}

// ---------- Material / mesh helpers ----------
function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? 0.85, metalness: opts.metalness ?? 0.0, ...opts });
}
function box(w, h, d, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), color.isMaterial ? color : std(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function cyl(rt, rb, h, color, seg = 16, opts) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), color.isMaterial ? color : std(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function cap(r, len, color, opts) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), color.isMaterial ? color : std(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function sph(r, color, seg = 18, opts) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), color.isMaterial ? color : std(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function noiseTexture(base, spec, density = 2200, size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < density; i++) {
    const r = spec[(Math.random() * spec.length) | 0];
    ctx.fillStyle = r;
    const x = Math.random() * size, y = Math.random() * size, s = 1 + Math.random() * 2.5;
    ctx.fillRect(x, y, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function textPlane(text, w, h, bg, fg, fontPx = 72) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = Math.round((512 * h) / w);
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = fg;
  ctx.font = `800 ${fontPx}px sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4; tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }));
  return mesh;
}

// ---------- Sky / day-night ----------
function makeSky() {
  const geo = new THREE.SphereGeometry(600, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x2a6cc4) },
      mid: { value: new THREE.Color(0x9fc7e8) },
      bottom: { value: new THREE.Color(0xdfeefb) },
    },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `,
    fragmentShader: `
      varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;
      void main(){
        float h = normalize(vP).y;
        vec3 col = h > 0.0 ? mix(mid, top, pow(clamp(h,0.0,1.0),0.65))
                           : mix(mid, bottom, clamp(-h*2.2,0.0,1.0));
        gl_FragColor = vec4(col,1.0);
      }`,
  });
  sky = new THREE.Mesh(geo, mat);
  townScene.add(sky);

  sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(14, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xfff2c4, fog: false })
  );
  townScene.add(sunDisc);

  moonDisc = new THREE.Mesh(
    new THREE.SphereGeometry(8, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xdfe6ff, fog: false })
  );
  townScene.add(moonDisc);

  // stars
  const sg = new THREE.BufferGeometry();
  const pts = [];
  for (let i = 0; i < 600; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(560);
    if (v.y < 30) v.y = Math.abs(v.y) + 30;
    pts.push(v.x, v.y, v.z);
  }
  sg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, fog: false, transparent: true, opacity: 0 }));
  townScene.add(stars);

  // clouds
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92, fog: false });
  for (let i = 0; i < 9; i++) {
    const g = new THREE.Group();
    const n = 3 + (Math.random() * 3 | 0);
    for (let j = 0; j < n; j++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(6 + Math.random() * 5, 10, 8), cloudMat);
      puff.position.set((Math.random() - 0.5) * 22, Math.random() * 3, (Math.random() - 0.5) * 10);
      puff.scale.y = 0.6;
      g.add(puff);
    }
    g.position.set((Math.random() - 0.5) * 360, 90 + Math.random() * 50, (Math.random() - 0.5) * 360);
    townScene.add(g);
    clouds.push(g);
  }
}

const _day = { skyTop: new THREE.Color(0x2a6cc4), skyMid: new THREE.Color(0x9fc7e8), skyBot: new THREE.Color(0xdfeefb), sun: new THREE.Color(0xfff3d6), hemiSky: new THREE.Color(0xbfe0ff), hemiGround: new THREE.Color(0x6a7a55) };
const _night = { skyTop: new THREE.Color(0x05060f), skyMid: new THREE.Color(0x0a1226), skyBot: new THREE.Color(0x141d33), sun: new THREE.Color(0x223047), hemiSky: new THREE.Color(0x20304f), hemiGround: new THREE.Color(0x10141c) };
const _dusk = new THREE.Color(0xff8a52);
const _tmpC = new THREE.Color();

function smoothstep(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

function updateDayNight(dt) {
  dayTime = (dayTime + dt / DAY_LENGTH) % 1;
  const e = (dayTime - 0.25) * Math.PI * 2;       // sun elevation angle
  const az = dayTime * Math.PI * 2;
  const sy = Math.sin(e);
  const sunDir = new THREE.Vector3(Math.cos(e) * Math.cos(az), sy, Math.cos(e) * Math.sin(az)).normalize();

  const day = smoothstep(-0.05, 0.22, sy);        // 0 night → 1 day
  const night = 1 - day;
  const goldenZone = smoothstep(0.0, 0.18, sy) * (1 - smoothstep(0.18, 0.4, sy)); // warm at low sun

  // sky colors
  sky.material.uniforms.top.value.lerpColors(_night.skyTop, _day.skyTop, day);
  sky.material.uniforms.mid.value.lerpColors(_night.skyMid, _day.skyMid, day);
  _tmpC.lerpColors(_night.skyBot, _day.skyBot, day).lerp(_dusk, goldenZone * 0.5);
  sky.material.uniforms.bottom.value.copy(_tmpC);
  townScene.fog.color.copy(_tmpC);

  // sun + light
  const center = player ? player.position : new THREE.Vector3();
  sunDisc.position.copy(center).addScaledVector(sunDir, 480);
  sunDisc.material.color.lerpColors(_dusk, new THREE.Color(0xfff2c4), smoothstep(0.05, 0.35, sy));
  sunDisc.visible = sy > -0.15;
  moonDisc.position.copy(center).addScaledVector(sunDir, -480);
  moonDisc.visible = sy < 0.15;
  stars.position.copy(center);
  stars.material.opacity = night;

  sunLight.position.copy(center).addScaledVector(sunDir, 80);
  sunLight.target.position.copy(center);
  sunLight.intensity = 0.15 + day * 2.4;
  _tmpC.lerpColors(_dusk, _day.sun, smoothstep(0.04, 0.3, sy));
  sunLight.color.copy(_tmpC);
  sunLight.visible = sy > -0.1;

  hemiLight.intensity = 0.25 + day * 0.85;
  hemiLight.color.lerpColors(_night.hemiSky, _day.hemiSky, day);
  hemiLight.groundColor.lerpColors(_night.hemiGround, _day.hemiGround, day);
  ambLight.intensity = 0.18 + day * 0.22;

  // night-glowing emissives (lamps, windows)
  for (const m of nightGlow) m.emissiveIntensity = 0.15 + night * 1.1;

  // drifting clouds
  for (const c of clouds) {
    c.position.x += dt * 1.6;
    if (c.position.x > 200) c.position.x = -200;
    c.children.forEach((p) => (p.material.opacity = 0.25 + day * 0.7));
  }
}

const nightGlow = [];

// ---------- Town world ----------
function makeWorld() {
  // lights
  hemiLight = new THREE.HemisphereLight(0xbfe0ff, 0x6a7a55, 1.0);
  townScene.add(hemiLight);
  ambLight = new THREE.AmbientLight(0xffffff, 0.3);
  townScene.add(ambLight);
  sunLight = new THREE.DirectionalLight(0xfff3d6, 2.4);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  const sc = sunLight.shadow.camera;
  sc.left = -55; sc.right = 55; sc.top = 55; sc.bottom = -55; sc.near = 1; sc.far = 260;
  sunLight.shadow.bias = -0.0004;
  townScene.add(sunLight);
  townScene.add(sunLight.target);

  makeSky();

  // ground
  const grassTex = noiseTexture("#5f9e4c", ["#6fb05a", "#54904a", "#7cbf63", "#4c8642"], 5200);
  grassTex.repeat.set(26, 26);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  townScene.add(ground);

  // plaza
  const stoneTex = noiseTexture("#9a9aa2", ["#a7a7b0", "#8d8d96", "#b2b2bb"], 1800);
  stoneTex.repeat.set(4, 4);
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(10, 48), new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.95 }));
  plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.02; plaza.receiveShadow = true;
  townScene.add(plaza);

  // roads
  const roadTex = noiseTexture("#4a4a52", ["#52525a", "#42424a"], 1200);
  roadTex.repeat.set(2, 20);
  for (const [w, d, ry] of [[6, 220, 20], [220, 6, 2]]) {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: roadTex.clone(), roughness: 0.96 }));
    road.material.map.repeat.set(ry === 20 ? 2 : 20, ry);
    road.rotation.x = -Math.PI / 2; road.position.y = 0.01; road.receiveShadow = true;
    townScene.add(road);
  }

  // buildings
  makeBuilding({ name: "Mogulta", sign: "MOGULTA", signColor: "#ff4fd8", color: 0xd96bb8, x: -22, z: -9, type: "mogulta" });
  makeBuilding({ name: "Mog's Gym", sign: "MOG'S GYM", signColor: "#c8ff00", color: 0xb44a3a, x: 22, z: -9, type: "gym", w: 11, h: 6.5, d: 9 });
  makeBuilding({ name: "Mogcuts", sign: "MOGCUTS", signColor: "#41e8ff", color: 0x4f8cff, x: -19, z: 16, type: "mogcuts" });
  makeBuilding({ name: "Mogiqlo", sign: "MOGIQLO", signColor: "#ffffff", color: 0x8f5fd4, x: 19, z: 16, type: "mogiqlo" });
  makeBuilding({ name: "MogU", sign: "MOG UNIVERSITY", signColor: "#ffd84f", color: 0xc9a86a, x: 0, z: 28, w: 12, h: 7.5, type: "mogu" });

  makeBillboard();

  // scenery
  const treeSpots = [
    [-10, -22], [11, -23], [-30, 6], [31, 5], [-9, 30], [10, 31], [-33, -20],
    [33, -21], [28, 28], [-29, 28], [-14, -2], [14, -2], [-2, -18], [3, 38],
    [-38, 12], [38, 14], [-24, -30], [25, -30], [-40, -4], [40, -2],
  ];
  for (const [x, z] of treeSpots) makeTree(x, z, 0.85 + Math.random() * 0.5);

  const bushSpots = [[-7, -9], [7, -9], [-7, 9], [7, 9], [-15, 24], [15, 24], [12, -16], [-12, -16]];
  for (const [x, z] of bushSpots) makeBush(x, z);

  // hills on the horizon
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = 150 + Math.random() * 40;
    const h = 18 + Math.random() * 30;
    const hill = new THREE.Mesh(new THREE.ConeGeometry(40 + Math.random() * 30, h, 7), std(0x4f7a44, { roughness: 1 }));
    hill.position.set(Math.cos(a) * r, h / 2 - 4, Math.sin(a) * r);
    hill.rotation.y = Math.random() * 6;
    townScene.add(hill);
  }

  // lamps + benches around plaza
  for (const [x, z] of [[-7, -7], [7, -7], [-7, 9], [7, 9]]) makeLamp(x, z);
  makeBench(0, -8, 0);
  makeBench(0, 10, Math.PI);
}

function makeTree(x, z, scale) {
  const g = new THREE.Group();
  const trunk = cyl(0.28 * scale, 0.42 * scale, 2.6 * scale, 0x6b4a2c, 8, { roughness: 1 });
  trunk.position.y = 1.3 * scale;
  g.add(trunk);

  const foliage = new THREE.Group();
  foliage.position.y = 2.6 * scale;
  const greens = [0x3f8f4f, 0x357a42, 0x4aa05a];
  for (let i = 0; i < 3; i++) {
    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry((1.7 - i * 0.35) * scale, 1),
      std(greens[i % greens.length], { roughness: 1, flatShading: true })
    );
    blob.position.set((Math.random() - 0.5) * 0.7 * scale, i * 0.9 * scale, (Math.random() - 0.5) * 0.7 * scale);
    blob.castShadow = true;
    foliage.add(blob);
  }
  g.add(foliage);
  g.position.set(x, 0, z);
  townScene.add(g);
  windies.push({ mesh: foliage, phase: Math.random() * 6.28, amp: 0.05 + Math.random() * 0.04 });
}

function makeBush(x, z) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + Math.random() * 0.3, 1), std(0x3a8048, { roughness: 1, flatShading: true }));
    b.position.set((Math.random() - 0.5) * 0.8, 0.4, (Math.random() - 0.5) * 0.8);
    b.castShadow = true; b.receiveShadow = true;
    g.add(b);
  }
  g.position.set(x, 0, z);
  townScene.add(g);
  windies.push({ mesh: g, phase: Math.random() * 6.28, amp: 0.03 });
}

function makeLamp(x, z) {
  const g = new THREE.Group();
  const pole = cyl(0.08, 0.1, 4.2, 0x2c2c34, 8, { metalness: 0.6, roughness: 0.5 });
  pole.position.y = 2.1; g.add(pole);
  const arm = cyl(0.06, 0.06, 0.6, 0x2c2c34, 6, { metalness: 0.6, roughness: 0.5 });
  arm.rotation.z = Math.PI / 2; arm.position.set(0.3, 4.1, 0); g.add(arm);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xfff2b0, emissive: 0xffd86a, emissiveIntensity: 0.2, roughness: 0.4 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), glassMat);
  bulb.position.set(0.6, 4.0, 0); g.add(bulb);
  nightGlow.push(glassMat);
  g.position.set(x, 0, z);
  townScene.add(g);
}

function makeBench(x, z, rot) {
  const g = new THREE.Group();
  const seat = box(2.2, 0.16, 0.6, 0x7a5230, { roughness: 0.8 }); seat.position.y = 0.55; g.add(seat);
  const back = box(2.2, 0.5, 0.14, 0x7a5230, { roughness: 0.8 }); back.position.set(0, 0.85, -0.24); g.add(back);
  for (const sx of [-0.9, 0.9]) { const leg = box(0.16, 0.55, 0.55, 0x2c2c34, { metalness: 0.5 }); leg.position.set(sx, 0.27, 0); g.add(leg); }
  g.position.set(x, 0, z); g.rotation.y = rot || 0;
  townScene.add(g);
}

function makeBuilding(def) {
  const { name, color, sign, x, z, w = 9, h = 6, d = 8, type } = def;
  const g = new THREE.Group();

  const wallTex = noiseTexture("#ffffff", ["#f2f2f2", "#e8e8e8"], 600);
  wallTex.repeat.set(2, 2);
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, map: wallTex });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
  body.position.y = h / 2; body.castShadow = true; body.receiveShadow = true;
  g.add(body);

  const roof = box(w + 0.8, 0.5, d + 0.8, 0x23232b, { roughness: 0.9 });
  roof.position.y = h + 0.25; g.add(roof);

  // glass storefront
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x8fd0ff, emissive: 0x2a5a7a, emissiveIntensity: 0.2, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.78 });
  const storefront = new THREE.Mesh(new THREE.PlaneGeometry(w - 1.4, h - 2), glassMat);
  storefront.position.set(0, (h - 2) / 2 + 0.2, d / 2 + 0.04);
  g.add(storefront);
  nightGlow.push(glassMat);

  // door
  const door = box(2.0, 2.8, 0.2, 0x15151a, { roughness: 0.6 });
  door.position.set(0, 1.4, d / 2 + 0.05); g.add(door);
  const doorLight = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.18), new THREE.MeshStandardMaterial({ color: 0xc8ff00, emissive: 0xc8ff00, emissiveIntensity: 0.4 }));
  doorLight.position.set(0, 2.85, d / 2 + 0.16); g.add(doorLight);

  // sign
  const signMesh = textPlane(sign, Math.min(w - 1, 8), 1.3, "#0d0d12", def.signColor || "#c8ff00", 84);
  signMesh.position.set(0, h - 0.5, d / 2 + 0.08); g.add(signMesh);

  // awning
  const awning = box(w - 0.6, 0.18, 1.4, def.signColor ? new THREE.Color(def.signColor).getHex() : 0xc8ff00, { roughness: 0.7 });
  awning.position.set(0, h - 2.1, d / 2 + 0.7); awning.rotation.x = -0.18; g.add(awning);

  g.position.set(x, 0, z);
  const dir = new THREE.Vector3(-x, 0, -z).normalize();
  g.rotation.y = Math.atan2(dir.x, dir.z);
  townScene.add(g);

  const interactPoint = new THREE.Vector3(x, 0, z).addScaledVector(dir, d / 2 + 2.0);
  buildings.push({ name, type, group: g, center: new THREE.Vector3(x, 0, z), radius: Math.max(w, d) / 2 + 0.7, interactPoint });
}

function makeBillboard() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 360;
  billboardCtx = c.getContext("2d");
  billboardTex = new THREE.CanvasTexture(c);
  billboardTex.colorSpace = THREE.SRGBColorSpace;

  const g = new THREE.Group();
  for (const sx of [-3.4, 3.4]) {
    const pole = cyl(0.16, 0.2, 7, 0x2c2c34, 8, { metalness: 0.6, roughness: 0.5 });
    pole.position.set(sx, 3.5, 0); g.add(pole);
  }
  const frame = box(9, 6, 0.4, 0x17171d, { roughness: 0.5, metalness: 0.3 });
  frame.position.y = 7.2; g.add(frame);
  const screenMat = new THREE.MeshStandardMaterial({ map: billboardTex, emissiveMap: billboardTex, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.4 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 5.4), screenMat);
  screen.position.set(0, 7.2, 0.22); g.add(screen);
  nightGlow.push(screenMat);
  g.position.set(0, 0, -20);
  townScene.add(g);
  buildings.push({ name: "Billboard", type: "billboard", center: new THREE.Vector3(0, 0, -20), radius: 4.6, interactPoint: new THREE.Vector3(0, 0, -14) });
}

function refreshBillboard() {
  if (!billboardCtx) return;
  const ctx = billboardCtx;
  ctx.fillStyle = "#0c0c12"; ctx.fillRect(0, 0, 512, 360);
  ctx.fillStyle = "#c8ff00"; ctx.font = "800 34px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("⚡ CITY RANKINGS ⚡", 256, 44);
  ctx.textAlign = "left";
  const rows = rankings().slice(0, 8);
  rows.forEach((r, i) => {
    const y = 86 + i * 36;
    ctx.font = "700 24px sans-serif";
    ctx.fillStyle = r.me ? "#c8ff00" : "#ffffff";
    ctx.fillText(`${i + 1}.  ${r.name.slice(0, 14)}`, 36, y);
    ctx.textAlign = "right";
    ctx.fillStyle = r.me ? "#c8ff00" : "#41e8ff";
    ctx.fillText(String(r.aura), 478, y);
    ctx.textAlign = "left";
  });
  billboardTex.needsUpdate = true;
}

// ---------- Gym interior ----------
function makeGym() {
  const W = 26, D = 20, H = 6;

  const amb = new THREE.AmbientLight(0xffffff, 0.5);
  gymScene.add(amb);
  for (const [lx, lz] of [[-7, -5], [7, -5], [-7, 5], [7, 5], [0, 0]]) {
    const pl = new THREE.PointLight(0xffffff, 60, 24, 2);
    pl.position.set(lx, H - 0.6, lz);
    gymScene.add(pl);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 }));
    panel.rotation.x = Math.PI / 2; panel.position.set(lx, H - 0.05, lz);
    gymScene.add(panel);
  }

  // floor (rubber gym mat)
  const floorTex = noiseTexture("#1f2127", ["#26282f", "#191b20"], 2600);
  floorTex.repeat.set(8, 6);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  gymScene.add(floor);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std(0x15171d, { roughness: 1 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H; gymScene.add(ceil);

  // walls
  const wallMat = std(0x2a2d36, { roughness: 0.9 });
  const mkWall = (w, h, x, z, ry) => { const m = box(w, h, 0.4, wallMat); m.position.set(x, h / 2, z); m.rotation.y = ry || 0; gymScene.add(m); };
  mkWall(W, H, 0, -D / 2, 0);
  mkWall(W, H, 0, D / 2, 0);
  mkWall(D, H, -W / 2, 0, Math.PI / 2);
  mkWall(D, H, W / 2, 0, Math.PI / 2);

  // mirror wall accent
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(W - 4, H - 1.5), new THREE.MeshStandardMaterial({ color: 0x9fb4c4, roughness: 0.08, metalness: 0.9 }));
  mirror.position.set(0, (H - 1.5) / 2 + 0.4, -D / 2 + 0.25);
  gymScene.add(mirror);

  // motivational sign
  const sign = textPlane("NO DAYS OFF", 6, 1.1, "#0d0d12", "#c8ff00", 80);
  sign.position.set(0, H - 1.1, -D / 2 + 0.26);
  gymScene.add(sign);

  // equipment stations
  gymStations = [];
  const benchG = buildBench(); benchG.position.set(-8, 0, -3); placeStation(benchG, MACHINES[0], -8, -3);
  const squatG = buildSquatRack(); squatG.position.set(-2, 0, -5); placeStation(squatG, MACHINES[1], -2, -3.6);
  const treadG = buildTreadmill(); treadG.position.set(5, 0, -3); placeStation(treadG, MACHINES[2], 5, -1.4);
  const dbG = buildDumbbells(); dbG.position.set(8, 0, 4); placeStation(dbG, MACHINES[3], 8, 2.2);
  const pdG = buildPulldown(); pdG.position.set(-7, 0, 4); placeStation(pdG, MACHINES[4], -7, 2.2);

  // exit mat by the entrance (south wall)
  const mat = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), new THREE.MeshStandardMaterial({ color: 0xc8ff00, emissive: 0x4a5a00, emissiveIntensity: 0.4, roughness: 0.8 }));
  mat.rotation.x = -Math.PI / 2; mat.position.set(0, 0.02, D / 2 - 2);
  gymScene.add(mat);
  const exitSign = textPlane("← EXIT", 2.6, 0.7, "#0d0d12", "#c8ff00", 64);
  exitSign.position.set(0, 2.2, D / 2 - 0.22); exitSign.rotation.y = Math.PI;
  gymScene.add(exitSign);
  gymExit = { name: "Street", type: "exit", interactPoint: new THREE.Vector3(0, 0, D / 2 - 2), action: exitGym };
}

function placeStation(group, machine, ix, iz) {
  gymScene.add(group);
  gymStations.push({ name: machine.name, machine, interactPoint: new THREE.Vector3(ix, 0, iz), center: group.position.clone(), radius: 1.3 });
}

function buildBench() {
  const g = new THREE.Group();
  const pad = box(0.7, 0.25, 2.4, 0xc0392b, { roughness: 0.6 }); pad.position.y = 0.65; g.add(pad);
  for (const sz of [-1, 1]) { const leg = box(0.6, 0.6, 0.18, 0x2c2c34, { metalness: 0.6 }); leg.position.set(0, 0.3, sz * 1.0); g.add(leg); }
  // uprights + bar
  for (const sx of [-0.6, 0.6]) { const u = cyl(0.06, 0.06, 1.3, 0x2c2c34, 8, { metalness: 0.7 }); u.position.set(sx, 0.95, -1.0); g.add(u); }
  const bar = cyl(0.05, 0.05, 1.8, 0x9aa0a6, 10, { metalness: 0.9, roughness: 0.3 }); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.55, -1.0); g.add(bar);
  for (const sx of [-0.8, 0.8]) { const plate = cyl(0.32, 0.32, 0.12, 0x111317, 16, { metalness: 0.4 }); plate.rotation.z = Math.PI / 2; plate.position.set(sx, 1.55, -1.0); g.add(plate); }
  return g;
}

function buildSquatRack() {
  const g = new THREE.Group();
  for (const sx of [-0.8, 0.8]) { const post = box(0.16, 2.6, 0.16, 0xc8ff00, { metalness: 0.4, roughness: 0.5 }); post.position.set(sx, 1.3, 0); g.add(post); }
  const top = box(1.9, 0.16, 0.16, 0xc8ff00, { metalness: 0.4 }); top.position.set(0, 2.5, 0); g.add(top);
  const bar = cyl(0.05, 0.05, 2.0, 0x9aa0a6, 10, { metalness: 0.9, roughness: 0.3 }); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.9, 0.1); g.add(bar);
  for (const sx of [-0.9, 0.9]) { const plate = cyl(0.38, 0.38, 0.14, 0x111317, 16, { metalness: 0.4 }); plate.rotation.z = Math.PI / 2; plate.position.set(sx, 1.9, 0.1); g.add(plate); }
  return g;
}

function buildTreadmill() {
  const g = new THREE.Group();
  const base = box(1.1, 0.3, 2.2, 0x1b1d22, { roughness: 0.7 }); base.position.y = 0.15; g.add(base);
  const belt = box(0.9, 0.06, 1.8, 0x0c0d10, { roughness: 0.9 }); belt.position.y = 0.33; g.add(belt);
  for (const sx of [-0.5, 0.5]) { const arm = cyl(0.05, 0.05, 1.3, 0x2c2c34, 8, { metalness: 0.6 }); arm.position.set(sx, 0.95, 0.9); g.add(arm); }
  const consoleMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, emissive: 0x1133aa, emissiveIntensity: 0.5, roughness: 0.4 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.1), consoleMat); panel.position.set(0, 1.5, 0.95); panel.rotation.x = -0.3; g.add(panel);
  const handle = cyl(0.05, 0.05, 1.0, 0x2c2c34, 8, { metalness: 0.6 }); handle.rotation.z = Math.PI / 2; handle.position.set(0, 1.55, 0.9); g.add(handle);
  return g;
}

function buildDumbbells() {
  const g = new THREE.Group();
  const rack = box(2.6, 0.9, 0.7, 0x2c2c34, { metalness: 0.5, roughness: 0.6 }); rack.position.y = 0.45; g.add(rack);
  const colors = [0xc0392b, 0xc8ff00, 0x41e8ff, 0xff4fd8];
  for (let i = 0; i < 4; i++) {
    const x = -0.95 + i * 0.62;
    const handle = cyl(0.05, 0.05, 0.5, 0x9aa0a6, 8, { metalness: 0.8 }); handle.rotation.z = Math.PI / 2; handle.position.set(x, 0.95, 0.25); g.add(handle);
    for (const sx of [-0.22, 0.22]) { const w = sph(0.14, colors[i], 10, { roughness: 0.5 }); w.position.set(x + sx, 0.95, 0.25); g.add(w); }
  }
  return g;
}

function buildPulldown() {
  const g = new THREE.Group();
  const seat = box(0.8, 0.2, 0.8, 0x1f2229, { roughness: 0.7 }); seat.position.set(0, 0.55, 0.4); g.add(seat);
  const post = box(0.24, 3.0, 0.24, 0x2c2c34, { metalness: 0.5 }); post.position.set(0, 1.5, -0.4); g.add(post);
  const arm = box(1.0, 0.2, 0.2, 0x2c2c34, { metalness: 0.5 }); arm.position.set(0, 2.9, 0.0); g.add(arm);
  const stack = box(0.7, 1.6, 0.5, 0x111317, { metalness: 0.4 }); stack.position.set(0, 0.9, -0.7); g.add(stack);
  const barBar = cyl(0.04, 0.04, 1.1, 0x9aa0a6, 8, { metalness: 0.9 }); barBar.rotation.z = Math.PI / 2; barBar.position.set(0, 2.1, 0.1); g.add(barBar);
  return g;
}

// ---------- Humanoid builder ----------
function buildHumanoid(opts) {
  const skinMat = std(opts.tone, { roughness: 0.7 });
  const shirtMat = std(opts.shirt, { roughness: 0.75 });
  const pantsMat = std(opts.pants, { roughness: 0.8 });
  const shoeMat = std(0x1a1a20, { roughness: 0.6 });

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // pelvis + torso (tapered)
  const pelvis = cap(0.26, 0.18, pantsMat); pelvis.position.y = 0.96; pelvis.scale.set(1.0, 0.7, 0.7); body.add(pelvis);
  const torso = cap(0.27, 0.42, shirtMat); torso.position.y = 1.32; torso.scale.set(1.0, 1.0, 0.62); body.add(torso);
  const shoulders = cap(0.12, 0.5, shirtMat); shoulders.rotation.z = Math.PI / 2; shoulders.position.y = 1.5; body.add(shoulders);

  // neck + head
  const neck = cyl(0.08, 0.09, 0.12, skinMat, 10); neck.position.y = 1.62; body.add(neck);
  const head = sph(0.18, skinMat, 20); head.position.y = 1.82; head.scale.set(0.92, 1.05, 0.95); body.add(head);

  // face decal
  const faceMat = new THREE.MeshBasicMaterial({ map: opts.faceTex || null, transparent: !opts.faceTex });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.28), faceMat);
  face.position.set(0, 1.83, 0.17);
  if (opts.faceTex) body.add(face);

  // ears
  for (const sx of [-1, 1]) { const ear = sph(0.045, skinMat, 8); ear.position.set(sx * 0.17, 1.82, 0); body.add(ear); }

  const hairGroup = new THREE.Group(); hairGroup.position.y = 1.82; body.add(hairGroup);

  // arms (pivot at shoulder)
  function arm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.34, 1.5, 0);
    const upper = cap(0.075, 0.34, shirtMat); upper.position.y = -0.22; pivot.add(upper);
    const fore = cap(0.07, 0.3, skinMat); fore.position.y = -0.56; pivot.add(fore);
    const hand = sph(0.085, skinMat, 10); hand.position.y = -0.78; pivot.add(hand);
    body.add(pivot);
    return pivot;
  }
  const armL = arm(-1), armR = arm(1);

  // legs (pivot at hip)
  function leg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.14, 0.92, 0);
    const thigh = cap(0.11, 0.34, pantsMat); thigh.position.y = -0.26; pivot.add(thigh);
    const shin = cap(0.095, 0.34, pantsMat); shin.position.y = -0.62; pivot.add(shin);
    const foot = box(0.16, 0.12, 0.34, shoeMat); foot.position.set(0, -0.86, 0.08); pivot.add(foot);
    body.add(pivot);
    return pivot;
  }
  const legL = leg(-1), legR = leg(1);

  return {
    root, parts: { body, torso, pelvis, shoulders, head, hairGroup, armL, armR, legL, legR, faceMat, skinMat, shirtMat, pantsMat,
      shirtParts: [torso, shoulders], pantsParts: [pelvis] },
  };
}

// ---------- Player ----------
function buildPlayer() {
  const outfit = OUTFITS.find((o) => o.id === state.outfit) || OUTFITS[0];
  const faceTex = new THREE.CanvasTexture(makeFaceCanvas());
  faceTex.colorSpace = THREE.SRGBColorSpace;
  const built = buildHumanoid({ tone: new THREE.Color(state.tone).getHex(), shirt: outfit.shirt, pants: outfit.pants, faceTex });
  player = built.root;
  playerParts = built.parts;
  player.position.set(0, 0, 8);
  townScene.add(player);
  applyHairMesh();
  applyOutfitColors();
}

function applyHairMesh() {
  const hg = playerParts.hairGroup;
  while (hg.children.length) hg.remove(hg.children[0]);
  const dark = 0x171318;
  const hairMat = std(dark, { roughness: 0.9 });
  if (state.hair === "buzz") {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat); m.position.y = 0.02; hg.add(m);
  } else if (state.hair === "fade") {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.195, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat); m.position.y = 0.03; m.scale.y = 1.15; hg.add(m);
  } else if (state.hair === "fringe") {
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMat); top.position.y = 0.04; top.scale.y = 1.2; hg.add(top);
    const fringe = box(0.34, 0.1, 0.12, hairMat); fringe.position.set(0, 0.06, 0.16); fringe.rotation.x = 0.3; hg.add(fringe);
  } else if (state.hair === "flow") {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.23, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.72), hairMat); m.position.y = 0.02; m.scale.set(1.05, 1.2, 1.1); hg.add(m);
  }
  hg.children.forEach((c) => (c.castShadow = true));
}

function applyOutfitColors() {
  const outfit = OUTFITS.find((o) => o.id === state.outfit) || OUTFITS[0];
  playerParts.shirtMat.color.setHex(outfit.shirt);
  playerParts.pantsMat.color.setHex(outfit.pants);
  // arms' upper sleeves share shirtMat already; legs share pantsMat
}

function refreshFace() {
  const tex = new THREE.CanvasTexture(makeFaceCanvas());
  tex.colorSpace = THREE.SRGBColorSpace;
  playerParts.faceMat.map = tex;
  playerParts.faceMat.transparent = false;
  playerParts.faceMat.needsUpdate = true;
  playerParts.skinMat.color.set(state.tone);
}

// ---------- NPCs ----------
function makeNPCs() {
  const shirts = [0xff9f43, 0x54a0ff, 0xff6b81, 0x1dd1a1, 0xa55eea];
  for (let i = 0; i < 6; i++) {
    const built = buildHumanoid({
      tone: new THREE.Color(TONES[(i * 2) % TONES.length]).getHex(),
      shirt: shirts[i % shirts.length],
      pants: 0x33343c,
    });
    built.root.position.set((Math.random() - 0.5) * 60, 0, (Math.random() - 0.5) * 60);
    built.root.scale.setScalar(0.96 + Math.random() * 0.1);
    townScene.add(built.root);
    npcs.push({ root: built.root, parts: built.parts, target: randomSpot(), speed: 1.3 + Math.random(), walkT: Math.random() * 6 });
  }
}
function randomSpot() {
  return new THREE.Vector3((Math.random() - 0.5) * 70, 0, (Math.random() - 0.5) * 70);
}

// ---------- Camera (orbit + follow) ----------
const cam = { yaw: 0, pitch: 0.5, dist: 12, tYaw: 0, tPitch: 0.5, tDist: 12 };

function updateCamera(dt) {
  cam.yaw += (cam.tYaw - cam.yaw) * Math.min(1, dt * 12);
  cam.pitch += (cam.tPitch - cam.pitch) * Math.min(1, dt * 12);
  cam.dist += (cam.tDist - cam.dist) * Math.min(1, dt * 10);

  const tgt = player ? player.position : new THREE.Vector3();
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const ox = Math.sin(cam.yaw) * cp * cam.dist;
  const oy = sp * cam.dist;
  const oz = Math.cos(cam.yaw) * cp * cam.dist;
  const desired = new THREE.Vector3(tgt.x + ox, tgt.y + oy + 0.6, tgt.z + oz);
  camera.position.lerp(desired, Math.min(1, dt * 9));
  camera.lookAt(tgt.x, tgt.y + 1.4, tgt.z);
}

function camForward() { return new THREE.Vector3(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw)); }
function camRight() { return new THREE.Vector3(Math.cos(cam.yaw), 0, -Math.sin(cam.yaw)); }

// ---------- Input ----------
const keys = new Set();
addEventListener("keydown", (e) => {
  if (e.repeat) return;
  keys.add(e.key.toLowerCase());
  if (e.key === "e" || e.key === "E" || e.key === "Enter") tryInteract();
  if (e.key === "Escape") { if (workout) cancelWorkout(); else closeModal(); }
});
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

// left joystick = movement
const joyVec = { x: 0, z: 0 };
(function setupJoystick() {
  const joy = $("joy"), knob = $("joy-knob");
  let active = null;
  joy.addEventListener("pointerdown", (e) => { e.stopPropagation(); active = e.pointerId; joy.setPointerCapture(e.pointerId); move(e); });
  joy.addEventListener("pointermove", (e) => { if (e.pointerId === active) move(e); });
  const end = (e) => { if (e.pointerId !== active) return; active = null; joyVec.x = 0; joyVec.z = 0; knob.style.transform = "translate(-50%, -50%)"; };
  joy.addEventListener("pointerup", end);
  joy.addEventListener("pointercancel", end);
  function move(e) {
    const r = joy.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy) || 1;
    const max = r.width / 2 - 18;
    const cl = Math.min(len, max);
    dx = (dx / len) * cl; dy = (dy / len) * cl;
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    joyVec.x = dx / max; joyVec.z = dy / max;
  }
})();

// canvas drag = look (orbit). Works for mouse and touch.
(function setupLook() {
  const canvas = $("game");
  let active = null, lx = 0, ly = 0;
  canvas.addEventListener("pointerdown", (e) => { if (isPaused()) return; active = e.pointerId; lx = e.clientX; ly = e.clientY; });
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerId !== active) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    lx = e.clientX; ly = e.clientY;
    cam.tYaw -= dx * 0.006;
    cam.tPitch = Math.max(0.12, Math.min(1.35, cam.tPitch + dy * 0.005));
  });
  const end = (e) => { if (e.pointerId === active) active = null; };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("wheel", (e) => { e.preventDefault(); cam.tDist = Math.max(5, Math.min(24, cam.tDist + e.deltaY * 0.01)); }, { passive: false });

  // pinch-zoom (two finger)
  const touches = new Map();
  let pinchStart = 0, distStart = 0;
  canvas.addEventListener("touchstart", (e) => { if (e.touches.length === 2) { pinchStart = pinchDist(e); distStart = cam.tDist; } }, { passive: true });
  canvas.addEventListener("touchmove", (e) => { if (e.touches.length === 2 && pinchStart) { const d = pinchDist(e); cam.tDist = Math.max(5, Math.min(24, distStart * (pinchStart / d))); } }, { passive: true });
  function pinchDist(e) { const a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
})();

$("act-btn").addEventListener("click", tryInteract);

function isPaused() {
  return !intro.classList.contains("hidden") || !modalWrap.classList.contains("hidden");
}

// ---------- Interaction ----------
let nearInteract = null;

function currentInteractables() {
  if (context === "gym") return [...gymStations, gymExit];
  return buildings;
}

function tryInteract() {
  if (isPaused()) return;
  if (workout) { doRep(); return; }
  if (!nearInteract) return;
  if (context === "town") enterBuilding(nearInteract);
  else if (nearInteract.type === "exit") nearInteract.action();
  else if (nearInteract.machine) startWorkout(nearInteract);
}

function enterBuilding(b) {
  ensureDaily();
  if (b.type === "mogulta") openMogulta();
  else if (b.type === "gym") enterGym();
  else if (b.type === "mogcuts") openMogcuts();
  else if (b.type === "mogiqlo") openMogiqlo();
  else if (b.type === "mogu") openMogU();
  else if (b.type === "billboard") openLeaderboard();
}

// ---------- Gym flow ----------
function enterGym() {
  context = "gym";
  activeScene = gymScene;
  townScene.remove(player);
  gymScene.add(player);
  player.position.set(0, 0, 8);
  player.rotation.y = Math.PI;
  cam.yaw = cam.tYaw = Math.PI;
  cam.pitch = cam.tPitch = 0.45;
  ensureDaily();
  const left = WORKOUTS_PER_DAY - state.dailies.workouts;
  toast(`🏋️ Welcome to Mog's Gym — ${left} set(s) left today. Walk up to a machine and press E.`, 3600);
}

function exitGym() {
  context = "town";
  activeScene = townScene;
  gymScene.remove(player);
  townScene.add(player);
  const gym = buildings.find((b) => b.type === "gym");
  player.position.copy(gym.interactPoint);
  player.rotation.y = Math.PI;
  cam.yaw = cam.tYaw = 0;
  toast("Back on the street 🌆");
}

// rep-based workout
let workout = null;       // { machine, reps, target }
let repPulse = 0;
function startWorkout(station) {
  ensureDaily();
  const left = WORKOUTS_PER_DAY - state.dailies.workouts;
  if (left <= 0) { toast("Out of energy — recovery is part of the program 😤 Come back tomorrow."); return; }
  const m = station.machine;
  workout = { machine: m, reps: 0, target: m.reps };
  $("workout").classList.remove("hidden");
  $("workout-title").textContent = `${m.emoji} ${m.name.toUpperCase()}`;
  updateWorkoutUI();
}
function doRep() {
  if (!workout) return;
  workout.reps++;
  repPulse = 1;
  updateWorkoutUI();
  if (workout.reps >= workout.target) finishWorkout();
}
function updateWorkoutUI() {
  if (!workout) return;
  $("workout-reps").textContent = `Rep ${workout.reps} / ${workout.target} — tap ACT / press E`;
  $("workout-fill").style.width = (workout.reps / workout.target) * 100 + "%";
  $("workout-note").textContent = workout.machine.note;
}
function finishWorkout() {
  const m = workout.machine;
  state.dailies.workouts++;
  saveState();
  addStat("fitness", m.gain);
  refreshHUD();
  $("workout").classList.add("hidden");
  const left = WORKOUTS_PER_DAY - state.dailies.workouts;
  toast(`Set complete. +${m.gain} FIT 💪 ${left > 0 ? left + " set(s) left" : "That's a wrap for today."}`);
  workout = null;
}
function cancelWorkout() {
  workout = null;
  $("workout").classList.add("hidden");
}
$("workout-quit").addEventListener("click", cancelWorkout);

// ---------- Stores (modals) ----------
function shopRow(item, btnLabel, btnClass, onClick) {
  const row = document.createElement("div");
  row.className = "shop-item";
  row.innerHTML = `<div class="info"><b>${item.name}</b><small>${item.desc}</small></div>`;
  const btn = document.createElement("button");
  btn.className = "buy-btn " + btnClass;
  btn.textContent = btnLabel;
  if (onClick) btn.addEventListener("click", onClick);
  row.appendChild(btn);
  return row;
}

function openMogulta() {
  openModal(`<h2>🧴 MOGULTA</h2><p class="sub">Skincare superstore. Restocks daily — your skin compounds.</p><div id="shop"></div>`);
  const wrap = $("shop");
  const render = () => {
    wrap.innerHTML = "";
    for (const p of PRODUCTS) {
      const usedToday = state.dailies.products.includes(p.id);
      if (usedToday) wrap.appendChild(shopRow(p, "✓ Done today", "owned"));
      else if (state.money < p.price) wrap.appendChild(shopRow(p, `$${p.price}`, "cant", () => toast("Not enough MogBucks. Hit MogU for cash 📚")));
      else wrap.appendChild(shopRow(p, `Buy $${p.price}`, "", () => {
        state.money -= p.price; state.dailies.products.push(p.id); addStat("skin", p.boost);
        toast(`${p.name} applied. +${p.boost} SKIN ✨`); render(); refreshHUD();
      }));
    }
  };
  render();
}

function openMogcuts() {
  openModal(`<h2>💈 MOGCUTS</h2><p class="sub">Walk in mid, walk out mogging. Cuts you own can be re-worn free.</p><div id="shop"></div>`);
  const wrap = $("shop");
  const render = () => {
    wrap.innerHTML = "";
    for (const h of HAIRCUTS) {
      const owned = state.owned.haircuts.includes(h.id);
      const wearing = state.hair === h.id;
      if (wearing) wrap.appendChild(shopRow(h, "Wearing ✓", "owned"));
      else if (owned) wrap.appendChild(shopRow(h, "Wear", "", () => { state.hair = h.id; applyHairMesh(); saveState(); render(); toast(`Switched to ${h.name} 💈`); }));
      else if (state.money < h.price) wrap.appendChild(shopRow(h, `$${h.price}`, "cant", () => toast("Not enough MogBucks 💸")));
      else wrap.appendChild(shopRow(h, `Cut $${h.price}`, "", () => {
        state.money -= h.price; state.owned.haircuts.push(h.id); state.hair = h.id; applyHairMesh(); addStat("hair", h.boost);
        toast(`Fresh ${h.name}. +${h.boost} HAIR 🔥`); render(); refreshHUD();
      }));
    }
  };
  render();
}

function openMogiqlo() {
  openModal(`<h2>👕 MOGIQLO</h2><p class="sub">Fit beats brand — but a better fit beats both. Owned fits re-equip free.</p><div id="shop"></div>`);
  const wrap = $("shop");
  const render = () => {
    wrap.innerHTML = "";
    for (const o of OUTFITS) {
      const owned = state.owned.outfits.includes(o.id);
      const wearing = state.outfit === o.id;
      if (wearing) wrap.appendChild(shopRow(o, "Wearing ✓", "owned"));
      else if (owned) wrap.appendChild(shopRow(o, "Equip", "", () => { state.outfit = o.id; applyOutfitColors(); saveState(); render(); toast(`Equipped ${o.name} 👕`); }));
      else if (state.money < o.price) wrap.appendChild(shopRow(o, `$${o.price}`, "cant", () => toast("Not enough MogBucks 💸")));
      else wrap.appendChild(shopRow(o, `Cop $${o.price}`, "", () => {
        state.money -= o.price; state.owned.outfits.push(o.id); state.outfit = o.id; applyOutfitColors(); addStat("drip", o.boost);
        toast(`Copped ${o.name}. +${o.boost} DRIP 🧥`); render(); refreshHUD();
      }));
    }
  };
  render();
}

function openMogU() {
  const startSession = () => {
    const pool = [...QUIZ].sort(() => Math.random() - 0.5).slice(0, 5);
    let i = 0, correct = 0, earned = 0;
    const renderQ = () => {
      const item = pool[i];
      const opts = item.a.map((t, idx) => ({ t, idx })).sort(() => Math.random() - 0.5);
      openModal(`
        <h2>📚 MOG UNIVERSITY</h2>
        <p class="sub">Question ${i + 1}/5 · $${QUIZ_PAY} per correct (full rate up to $${QUIZ_DAILY_CAP}/day, then $5)</p>
        <p class="quiz-q">${item.q}</p><div id="opts"></div>`);
      const wrap = $("opts");
      for (const o of opts) {
        const btn = document.createElement("button");
        btn.className = "quiz-opt"; btn.textContent = o.t;
        btn.addEventListener("click", () => {
          [...wrap.children].forEach((b) => (b.disabled = true));
          ensureDaily();
          if (o.idx === item.c) {
            btn.classList.add("right");
            const pay = state.dailies.quizEarned < QUIZ_DAILY_CAP ? QUIZ_PAY : 5;
            state.money += pay; state.dailies.quizEarned += pay; earned += pay; correct++;
            toast(`Correct! +$${pay} MB 🤑`);
          } else {
            btn.classList.add("wrong");
            [...wrap.children].find((b) => b.textContent === item.a[item.c])?.classList.add("right");
            toast("Wrong — the city remembers 💀");
          }
          saveState(); refreshHUD();
          setTimeout(() => {
            i++;
            if (i < 5) renderQ();
            else {
              openModal(`
                <h2>📚 MOG UNIVERSITY</h2><p class="sub">Session complete</p>
                <p class="quiz-q">${correct}/5 correct · earned $${earned} MB</p>
                <p class="sub">${correct === 5 ? "Certified looksmaxx scholar 🎓" : "Re-run it. Knowledge is aura."}</p>
                <button class="big-btn" id="again-btn">TAKE ANOTHER QUIZ</button>`);
              $("again-btn").addEventListener("click", startSession);
            }
          }, 950);
        });
        wrap.appendChild(btn);
      }
    };
    renderQ();
  };
  startSession();
}

function openLeaderboard() {
  openModal(`<h2>🏆 City Rankings</h2><p class="sub">Top moggers in MOGCITY (local rankings — global servers coming soon)</p><div id="lb"></div>`);
  const wrap = $("lb");
  rankings().forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "lb-row" + (r.me ? " me" : "");
    row.innerHTML = `<span class="rank">${i + 1}</span><span class="who">${r.name}${r.me ? " (you)" : ""}</span><span class="pts">${r.aura} aura</span>`;
    wrap.appendChild(row);
  });
}
$("lb-btn").addEventListener("click", () => { if (intro.classList.contains("hidden")) openLeaderboard(); });

// ---------- Game loop ----------
let walkT = 0;

function animateLimbs(parts, t, moving) {
  if (moving) {
    parts.body.position.y = Math.abs(Math.sin(t)) * 0.06;
    parts.legL.rotation.x = Math.sin(t) * 0.6;
    parts.legR.rotation.x = -Math.sin(t) * 0.6;
    parts.armL.rotation.x = -Math.sin(t) * 0.5;
    parts.armR.rotation.x = Math.sin(t) * 0.5;
  } else {
    parts.body.position.y *= 0.85;
    for (const p of [parts.legL, parts.legR, parts.armL, parts.armR]) p.rotation.x *= 0.85;
  }
}

function collide(pos, colliders) {
  for (const b of colliders) {
    const v = new THREE.Vector3().subVectors(pos, b.center); v.y = 0;
    const d = v.length();
    if (d < b.radius + 0.45) { v.normalize().multiplyScalar(b.radius + 0.45 - d); pos.add(v); }
  }
}

function update(dt) {
  if (!player) return;
  const time = clock.elapsedTime;

  // movement (camera-relative)
  let mx = 0, mz = 0;
  if (!isPaused() && !workout) {
    const F = camForward(), R = camRight();
    let fwd = 0, side = 0;
    if (keys.has("w") || keys.has("arrowup")) fwd += 1;
    if (keys.has("s") || keys.has("arrowdown")) fwd -= 1;
    if (keys.has("d") || keys.has("arrowright")) side += 1;
    if (keys.has("a") || keys.has("arrowleft")) side -= 1;
    fwd += -joyVec.z; side += joyVec.x;
    mx = F.x * fwd + R.x * side;
    mz = F.z * fwd + R.z * side;
  }
  const len = Math.hypot(mx, mz);
  const moving = len > 0.12;

  if (moving) {
    mx /= len; mz /= len;
    const speed = 6.2;
    player.position.x += mx * speed * dt;
    player.position.z += mz * speed * dt;

    if (context === "town") {
      player.position.x = Math.max(-70, Math.min(70, player.position.x));
      player.position.z = Math.max(-70, Math.min(70, player.position.z));
      collide(player.position, buildings);
    } else {
      player.position.x = Math.max(-12, Math.min(12, player.position.x));
      player.position.z = Math.max(-9, Math.min(9, player.position.z));
      collide(player.position, gymStations);
    }

    const targetRot = Math.atan2(mx, mz);
    let diff = targetRot - player.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    player.rotation.y += diff * Math.min(1, dt * 12);

    walkT += dt * 11;
  }
  animateLimbs(playerParts, walkT, moving);

  // workout rep pump
  if (workout && repPulse > 0) {
    repPulse = Math.max(0, repPulse - dt * 3);
    const flex = repPulse;
    playerParts.armL.rotation.x = -1.4 * flex;
    playerParts.armR.rotation.x = -1.4 * flex;
  }

  // interaction detection
  nearInteract = null;
  let best = context === "gym" ? 2.4 : 3.2;
  for (const b of currentInteractables()) {
    if (!b) continue;
    const d = player.position.distanceTo(b.interactPoint);
    if (d < best) { best = d; nearInteract = b; }
  }
  if (nearInteract && !isPaused() && !workout) {
    if (context === "gym" && nearInteract.type !== "exit") {
      const leftSets = WORKOUTS_PER_DAY - state.dailies.workouts;
      hintEl.textContent = leftSets > 0 ? `${nearInteract.machine.emoji} ${nearInteract.name} — ${leftSets} set(s) left · press E / ACT` : `${nearInteract.name} — rest day, come back tomorrow`;
    } else if (nearInteract.type === "exit") {
      hintEl.textContent = "Leave the gym — press E / tap ACT";
    } else {
      hintEl.textContent = `Enter ${nearInteract.name} — press E / tap ACT`;
    }
    hintEl.classList.add("on");
  } else {
    hintEl.classList.remove("on");
  }

  // town-only ambience
  if (context === "town") {
    updateDayNight(dt);
    const wind = 0.6 + 0.4 * Math.sin(time * 0.25);
    for (const w of windies) {
      w.mesh.rotation.z = Math.sin(time * 1.3 + w.phase) * w.amp * wind;
      w.mesh.rotation.x = Math.cos(time * 1.1 + w.phase) * w.amp * 0.6 * wind;
    }
    for (const n of npcs) {
      const v = new THREE.Vector3().subVectors(n.target, n.root.position); v.y = 0;
      const nd = v.length();
      if (nd < 0.6) { n.target = randomSpot(); animateLimbs(n.parts, n.walkT, false); continue; }
      v.normalize();
      n.root.position.addScaledVector(v, n.speed * dt);
      n.root.rotation.y = Math.atan2(v.x, v.z);
      n.walkT += dt * 9;
      animateLimbs(n.parts, n.walkT, true);
    }
  }

  updateCamera(dt);
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.06);
  update(dt);
  renderer.render(activeScene, camera);
}

// ---------- Intro flow ----------
let pendingPhoto = null;
let pendingTone = TONES[1];

function drawIntroPreview() {
  const c = $("face-preview");
  const ctx = c.getContext("2d");
  ctx.fillStyle = pendingTone;
  ctx.fillRect(0, 0, c.width, c.height);
  if (pendingPhoto) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
    img.src = pendingPhoto;
  } else {
    ctx.fillStyle = "#1c1c22";
    ctx.beginPath(); ctx.arc(33, 40, 5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(63, 40, 5, 0, 7); ctx.fill();
    ctx.strokeStyle = "#7a3b30"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(48, 58, 15, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
}

function setupIntro() {
  const tonesWrap = $("tones");
  TONES.forEach((t) => {
    const d = document.createElement("div");
    d.className = "tone" + (t === pendingTone ? " sel" : "");
    d.style.background = t;
    d.addEventListener("click", () => {
      pendingTone = t;
      [...tonesWrap.children].forEach((el) => el.classList.remove("sel"));
      d.classList.add("sel");
      drawIntroPreview();
    });
    tonesWrap.appendChild(d);
  });
  drawIntroPreview();

  $("photo-input").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const ctx = c.getContext("2d");
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
        pendingPhoto = c.toDataURL("image/jpeg", 0.82);
        drawIntroPreview();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  $("start-btn").addEventListener("click", () => {
    const name = $("name-input").value.trim() || "Mogger";
    state = defaultState(name, pendingPhoto, pendingTone);
    saveState();
    beginGame();
  });

  const existing = loadState();
  if (existing && existing.stats) {
    $("intro-new").classList.add("hidden");
    $("intro-continue").classList.remove("hidden");
    $("continue-label").textContent = `Welcome back, ${existing.name} — ${Math.round(((existing.stats.skin + existing.stats.hair + existing.stats.fitness + existing.stats.drip) / 400) * 1000)} aura · $${existing.money} MB`;
    $("continue-btn").addEventListener("click", () => { state = existing; beginGame(); });
    $("newgame-btn").addEventListener("click", () => {
      if (confirm("Wipe your save and start over?")) {
        localStorage.removeItem(SAVE_KEY);
        $("intro-continue").classList.add("hidden");
        $("intro-new").classList.remove("hidden");
      }
    });
  }
}

function beginGame() {
  ensureDaily();
  loadFacePhoto(() => {
    initThree();
    makeWorld();
    makeGym();
    buildPlayer();
    makeNPCs();
    refreshHUD();
    refreshBillboard();
    intro.classList.add("hidden");
    hud.classList.remove("hidden");
    animate();
    toast(`Welcome to MOGCITY, ${state.name}. Drag to look around · WASD to move 🌆`, 4200);
  });
}

setupIntro();
