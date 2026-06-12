import * as THREE from "three";

/* =========================================================
   MOGCITY — a 3D looksmaxxing life-sim
   Everything runs in your browser. Your photo never leaves
   your device: it's drawn onto your character locally.
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
const WORKOUTS_PER_DAY = 3;

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
    // simple cartoon face
    ctx.fillStyle = "#1c1c22";
    ctx.beginPath(); ctx.arc(size * 0.34, size * 0.42, size * 0.05, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(size * 0.66, size * 0.42, size * 0.05, 0, 7); ctx.fill();
    ctx.strokeStyle = "#1c1c22"; ctx.lineWidth = size * 0.025; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(size * 0.5, size * 0.6, size * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
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

// ---------- Three.js setup ----------
let renderer, scene, camera, player, playerParts, clock;
const buildings = [];
const npcs = [];
let billboardCtx = null, billboardTex = null;

function initThree() {
  const canvas = $("game");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87c5ff);
  scene.fog = new THREE.Fog(0x87c5ff, 45, 95);

  camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 8, 16);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x6a7a55, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3d6, 1.5);
  sun.position.set(18, 30, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -45; sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45;
  scene.add(sun);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  clock = new THREE.Clock();
}

// ---------- World ----------
function box(w, h, d, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
  m.castShadow = true; m.receiveShadow = true;
  return m;
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
  tex.anisotropy = 4;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  return mesh;
}

function makeBuilding(def) {
  const { name, color, sign, x, z, w = 8, h = 5.5, d = 7, type } = def;
  const g = new THREE.Group();

  const body = box(w, h, d, color);
  body.position.y = h / 2;
  g.add(body);

  const roof = box(w + 0.7, 0.45, d + 0.7, 0x23232b);
  roof.position.y = h + 0.22;
  g.add(roof);

  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 2.6),
    new THREE.MeshLambertMaterial({ color: 0x15151a })
  );
  door.position.set(0, 1.3, d / 2 + 0.02);
  g.add(door);

  const signMesh = textPlane(sign, Math.min(w - 1, 7), 1.25, "#0d0d12", def.signColor || "#c8ff00", 88);
  signMesh.position.set(0, h - 0.4, d / 2 + 0.06);
  g.add(signMesh);

  // two display windows
  for (const sx of [-1, 1]) {
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.5),
      new THREE.MeshLambertMaterial({ color: 0xbfe9ff, emissive: 0x223344 })
    );
    win.position.set(sx * (w / 4 + 0.3), 1.7, d / 2 + 0.02);
    g.add(win);
  }

  g.position.set(x, 0, z);
  const dir = new THREE.Vector3(-x, 0, -z).normalize();
  g.rotation.y = Math.atan2(dir.x, dir.z);
  scene.add(g);

  const interactPoint = new THREE.Vector3(x, 0, z).addScaledVector(dir, d / 2 + 1.6);
  buildings.push({ name, type, group: g, center: new THREE.Vector3(x, 0, z), radius: Math.max(w, d) / 2 + 0.7, interactPoint });
}

function makeBillboard() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 360;
  billboardCtx = c.getContext("2d");
  billboardTex = new THREE.CanvasTexture(c);

  const g = new THREE.Group();
  for (const sx of [-3.1, 3.1]) {
    const pole = box(0.35, 6.4, 0.35, 0x2c2c34);
    pole.position.set(sx, 3.2, 0);
    g.add(pole);
  }
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 5.4, 0.3),
    [
      new THREE.MeshLambertMaterial({ color: 0x17171d }),
      new THREE.MeshLambertMaterial({ color: 0x17171d }),
      new THREE.MeshLambertMaterial({ color: 0x17171d }),
      new THREE.MeshLambertMaterial({ color: 0x17171d }),
      new THREE.MeshBasicMaterial({ map: billboardTex }),
      new THREE.MeshLambertMaterial({ color: 0x17171d }),
    ]
  );
  panel.position.y = 6.0;
  panel.castShadow = true;
  g.add(panel);
  g.position.set(0, 0, -16);
  scene.add(g);
}

function refreshBillboard() {
  if (!billboardCtx) return;
  const ctx = billboardCtx;
  ctx.fillStyle = "#0c0c12";
  ctx.fillRect(0, 0, 512, 360);
  ctx.fillStyle = "#c8ff00";
  ctx.font = "800 34px sans-serif";
  ctx.textAlign = "center";
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

function makeWorld() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(95, 95),
    new THREE.MeshLambertMaterial({ color: 0x6fae5a })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(9, 40),
    new THREE.MeshLambertMaterial({ color: 0x9a9aa2 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.01;
  plaza.receiveShadow = true;
  scene.add(plaza);

  for (const [w, d] of [[5, 80], [80, 5]]) {
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshLambertMaterial({ color: 0x55555e })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.005;
    road.receiveShadow = true;
    scene.add(road);
  }

  makeBuilding({ name: "Mogulta", sign: "MOGULTA", signColor: "#ff4fd8", color: 0xd96bb8, x: -19, z: -7, type: "mogulta" });
  makeBuilding({ name: "Mog's Gym", sign: "MOG'S GYM", signColor: "#c8ff00", color: 0xc25340, x: 19, z: -7, type: "gym" });
  makeBuilding({ name: "Mogcuts", sign: "MOGCUTS", signColor: "#41e8ff", color: 0x4f8cff, x: -16, z: 13, type: "mogcuts" });
  makeBuilding({ name: "Mogiqlo", sign: "MOGIQLO", signColor: "#ffffff", color: 0x8f5fd4, x: 16, z: 13, type: "mogiqlo" });
  makeBuilding({ name: "MogU", sign: "MOG UNIVERSITY", signColor: "#ffd84f", color: 0xc9a86a, x: 0, z: 24, w: 10, h: 6.5, type: "mogu" });

  makeBillboard();

  // trees + lamps
  const treeSpots = [[-8, -18], [9, -19], [-26, 4], [27, 3], [-7, 26], [8, 27], [-28, -16], [28, -17], [24, 24], [-25, 24]];
  for (const [x, z] of treeSpots) {
    const trunk = box(0.5, 1.6, 0.5, 0x6b4a2c);
    trunk.position.set(x, 0.8, z);
    scene.add(trunk);
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(1.7, 3.4, 8),
      new THREE.MeshLambertMaterial({ color: 0x3f8f4f })
    );
    leaves.position.set(x, 3.2, z);
    leaves.castShadow = true;
    scene.add(leaves);
  }
  for (const [x, z] of [[-6, -6], [6, -6], [-6, 8], [6, 8]]) {
    const pole = box(0.18, 3.4, 0.18, 0x2c2c34);
    pole.position.set(x, 1.7, z);
    scene.add(pole);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 12),
      new THREE.MeshLambertMaterial({ color: 0xfff2b0, emissive: 0xbfa640 })
    );
    bulb.position.set(x, 3.55, z);
    scene.add(bulb);
  }
}

// ---------- Player ----------
function buildPlayer() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);

  const outfit = OUTFITS.find((o) => o.id === state.outfit) || OUTFITS[0];

  const legL = box(0.3, 0.85, 0.34, outfit.pants); legL.position.set(-0.2, 0.425, 0);
  const legR = legL.clone(); legR.position.x = 0.2;
  body.add(legL, legR);

  const torso = box(0.95, 1.0, 0.5, outfit.shirt);
  torso.position.y = 1.35;
  body.add(torso);

  const armL = box(0.22, 0.9, 0.3, outfit.shirt); armL.position.set(-0.6, 1.35, 0);
  const armR = armL.clone(); armR.position.x = 0.6;
  body.add(armL, armR);

  const faceTex = new THREE.CanvasTexture(makeFaceCanvas());
  const toneMat = new THREE.MeshLambertMaterial({ color: state.tone });
  const faceMat = new THREE.MeshBasicMaterial({ map: faceTex });
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.85, 0.85),
    [toneMat, toneMat, toneMat, toneMat, faceMat, toneMat]
  );
  head.position.y = 2.33;
  head.castShadow = true;
  body.add(head);

  const hairGroup = new THREE.Group();
  hairGroup.position.y = 2.33;
  body.add(hairGroup);

  g.position.set(0, 0, 5);
  scene.add(g);

  player = g;
  playerParts = { body, legL, legR, armL, armR, torso, head, hairGroup, faceMat, toneMat };
  applyHairMesh();
  applyOutfitColors();
}

function applyHairMesh() {
  const hg = playerParts.hairGroup;
  while (hg.children.length) hg.remove(hg.children[0]);
  const dark = 0x1d1d22;
  if (state.hair === "buzz") {
    const m = box(0.87, 0.1, 0.87, dark); m.position.y = 0.48; hg.add(m);
  } else if (state.hair === "fade") {
    const m = box(0.88, 0.24, 0.88, dark); m.position.y = 0.5; hg.add(m);
  } else if (state.hair === "fringe") {
    const top = box(0.9, 0.28, 0.9, dark); top.position.y = 0.52; hg.add(top);
    const fringe = box(0.9, 0.3, 0.14, dark);
    fringe.position.set(0, 0.34, 0.42); fringe.rotation.x = 0.25;
    hg.add(fringe);
  } else if (state.hair === "flow") {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 14, 12),
      new THREE.MeshLambertMaterial({ color: dark })
    );
    m.scale.set(1.0, 0.75, 1.05);
    m.position.y = 0.38;
    hg.add(m);
  }
}

function applyOutfitColors() {
  const outfit = OUTFITS.find((o) => o.id === state.outfit) || OUTFITS[0];
  for (const part of ["torso", "armL", "armR"]) playerParts[part].material.color.setHex(outfit.shirt);
  for (const part of ["legL", "legR"]) playerParts[part].material.color.setHex(outfit.pants);
}

function refreshFace() {
  playerParts.faceMat.map = new THREE.CanvasTexture(makeFaceCanvas());
  playerParts.faceMat.needsUpdate = true;
  playerParts.toneMat.color.set(state.tone);
}

// ---------- NPCs ----------
function makeNPCs() {
  const colors = [0xff9f43, 0x54a0ff, 0xff6b81, 0x1dd1a1];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    const b = box(0.7, 1.5, 0.45, colors[i]); b.position.y = 0.95; g.add(b);
    const h = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 12, 12),
      new THREE.MeshLambertMaterial({ color: TONES[(i * 2) % TONES.length] })
    );
    h.position.y = 2.1; h.castShadow = true; g.add(h);
    g.position.set((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40);
    scene.add(g);
    npcs.push({ g, target: randomSpot(), speed: 1.4 + Math.random() });
  }
}
function randomSpot() {
  return new THREE.Vector3((Math.random() - 0.5) * 56, 0, (Math.random() - 0.5) * 56);
}

// ---------- Input ----------
const keys = new Set();
addEventListener("keydown", (e) => {
  if (e.repeat) return;
  keys.add(e.key.toLowerCase());
  if ((e.key === "e" || e.key === "E" || e.key === "Enter") && nearBuilding && !isPaused()) {
    enterBuilding(nearBuilding);
  }
  if (e.key === "Escape") closeModal();
});
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

const joyVec = { x: 0, z: 0 };
(function setupJoystick() {
  const joy = $("joy"), knob = $("joy-knob");
  let active = null;
  joy.addEventListener("pointerdown", (e) => { active = e.pointerId; joy.setPointerCapture(e.pointerId); move(e); });
  joy.addEventListener("pointermove", (e) => { if (e.pointerId === active) move(e); });
  const end = (e) => {
    if (e.pointerId !== active) return;
    active = null; joyVec.x = 0; joyVec.z = 0;
    knob.style.transform = "translate(-50%, -50%)";
  };
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

$("act-btn").addEventListener("click", () => {
  if (nearBuilding && !isPaused()) enterBuilding(nearBuilding);
});

function isPaused() {
  return !intro.classList.contains("hidden") || !modalWrap.classList.contains("hidden");
}

// ---------- Stores ----------
function enterBuilding(b) {
  ensureDaily();
  if (b.type === "mogulta") openMogulta();
  else if (b.type === "gym") openGym();
  else if (b.type === "mogcuts") openMogcuts();
  else if (b.type === "mogiqlo") openMogiqlo();
  else if (b.type === "mogu") openMogU();
}

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
      if (usedToday) {
        wrap.appendChild(shopRow(p, "✓ Done today", "owned"));
      } else if (state.money < p.price) {
        wrap.appendChild(shopRow(p, `$${p.price}`, "cant", () => toast("Not enough MogBucks. Hit MogU for cash 📚")));
      } else {
        wrap.appendChild(shopRow(p, `Buy $${p.price}`, "", () => {
          state.money -= p.price;
          state.dailies.products.push(p.id);
          addStat("skin", p.boost);
          toast(`${p.name} applied. +${p.boost} SKIN ✨`);
          render(); refreshHUD();
        }));
      }
    }
  };
  render();
}

function openGym() {
  const left = () => WORKOUTS_PER_DAY - state.dailies.workouts;
  openModal(`
    <h2>🏋️ MOG'S GYM</h2>
    <p class="sub">Stop the bar in the green zone. <span id="gym-left">${left()}</span> workout(s) left today.</p>
    <div class="gym-track" id="gym-track">
      <div class="gym-zone good" style="left:35%;width:30%"></div>
      <div class="gym-zone perfect" style="left:46%;width:8%"></div>
      <div class="gym-marker" id="gym-marker" style="left:0%"></div>
    </div>
    <p class="gym-note" id="gym-note">Perfect = +6 FIT · Green-ish = +4 · Miss = +1</p>
    <button class="big-btn" id="gym-btn">STOP 🛑</button>
  `);

  let pos = 0, dir = 1, running = true, raf = null;
  const marker = $("gym-marker"), btn = $("gym-btn"), note = $("gym-note");

  function tick() {
    if (running) {
      pos += dir * 1.6;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      marker.style.left = pos + "%";
    }
    raf = requestAnimationFrame(tick);
  }
  tick();
  modalCleanup = () => cancelAnimationFrame(raf);

  btn.addEventListener("click", () => {
    if (running) {
      if (left() <= 0) { toast("Out of workouts — recovery is part of the program 😤"); return; }
      running = false;
      state.dailies.workouts++;
      let gain = 1, label = "Sloppy rep… +1 FIT";
      if (pos >= 46 && pos <= 54) { gain = 6; label = "PERFECT REP. +6 FIT 💪"; }
      else if (pos >= 35 && pos <= 65) { gain = 4; label = "Solid set. +4 FIT"; }
      addStat("fitness", gain);
      note.textContent = label;
      $("gym-left").textContent = left();
      btn.textContent = left() > 0 ? "GO AGAIN 🔁" : "DONE FOR TODAY ✓";
      saveState();
    } else {
      if (left() <= 0) { toast("Out of workouts — come back tomorrow"); return; }
      running = true;
      btn.textContent = "STOP 🛑";
      note.textContent = "Perfect = +6 FIT · Green-ish = +4 · Miss = +1";
    }
  });
}

function openMogcuts() {
  openModal(`<h2>💈 MOGCUTS</h2><p class="sub">Walk in mid, walk out mogging. Cuts you own can be re-worn free.</p><div id="shop"></div>`);
  const wrap = $("shop");
  const render = () => {
    wrap.innerHTML = "";
    for (const h of HAIRCUTS) {
      const owned = state.owned.haircuts.includes(h.id);
      const wearing = state.hair === h.id;
      if (wearing) {
        wrap.appendChild(shopRow(h, "Wearing ✓", "owned"));
      } else if (owned) {
        wrap.appendChild(shopRow(h, "Wear", "", () => {
          state.hair = h.id; applyHairMesh(); saveState(); render();
          toast(`Switched to ${h.name} 💈`);
        }));
      } else if (state.money < h.price) {
        wrap.appendChild(shopRow(h, `$${h.price}`, "cant", () => toast("Not enough MogBucks 💸")));
      } else {
        wrap.appendChild(shopRow(h, `Cut $${h.price}`, "", () => {
          state.money -= h.price;
          state.owned.haircuts.push(h.id);
          state.hair = h.id;
          applyHairMesh();
          addStat("hair", h.boost);
          toast(`Fresh ${h.name}. +${h.boost} HAIR 🔥`);
          render(); refreshHUD();
        }));
      }
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
      if (wearing) {
        wrap.appendChild(shopRow(o, "Wearing ✓", "owned"));
      } else if (owned) {
        wrap.appendChild(shopRow(o, "Equip", "", () => {
          state.outfit = o.id; applyOutfitColors(); saveState(); render();
          toast(`Equipped ${o.name} 👕`);
        }));
      } else if (state.money < o.price) {
        wrap.appendChild(shopRow(o, `$${o.price}`, "cant", () => toast("Not enough MogBucks 💸")));
      } else {
        wrap.appendChild(shopRow(o, `Cop $${o.price}`, "", () => {
          state.money -= o.price;
          state.owned.outfits.push(o.id);
          state.outfit = o.id;
          applyOutfitColors();
          addStat("drip", o.boost);
          toast(`Copped ${o.name}. +${o.boost} DRIP 🧥`);
          render(); refreshHUD();
        }));
      }
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
        <p class="quiz-q">${item.q}</p>
        <div id="opts"></div>
      `);
      const wrap = $("opts");
      for (const o of opts) {
        const btn = document.createElement("button");
        btn.className = "quiz-opt";
        btn.textContent = o.t;
        btn.addEventListener("click", () => {
          [...wrap.children].forEach((b) => (b.disabled = true));
          ensureDaily();
          if (o.idx === item.c) {
            btn.classList.add("right");
            const pay = state.dailies.quizEarned < QUIZ_DAILY_CAP ? QUIZ_PAY : 5;
            state.money += pay;
            state.dailies.quizEarned += pay;
            earned += pay; correct++;
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
                <h2>📚 MOG UNIVERSITY</h2>
                <p class="sub">Session complete</p>
                <p class="quiz-q">${correct}/5 correct · earned $${earned} MB</p>
                <p class="sub">${correct === 5 ? "Certified looksmaxx scholar 🎓" : "Re-run it. Knowledge is aura."}</p>
                <button class="big-btn" id="again-btn">TAKE ANOTHER QUIZ</button>
              `);
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
$("lb-btn").addEventListener("click", () => {
  if (intro.classList.contains("hidden")) openLeaderboard();
});

// ---------- Game loop ----------
let nearBuilding = null;
let walkT = 0;

function update(dt) {
  if (!player) return;

  let dx = 0, dz = 0;
  if (!isPaused()) {
    if (keys.has("w") || keys.has("arrowup")) dz -= 1;
    if (keys.has("s") || keys.has("arrowdown")) dz += 1;
    if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
    if (keys.has("d") || keys.has("arrowright")) dx += 1;
    dx += joyVec.x; dz += joyVec.z;
  }
  const len = Math.hypot(dx, dz);
  const moving = len > 0.12;

  if (moving) {
    dx /= len; dz /= len;
    const speed = 6.2;
    player.position.x += dx * speed * dt;
    player.position.z += dz * speed * dt;

    // bounds + building collision
    player.position.x = Math.max(-44, Math.min(44, player.position.x));
    player.position.z = Math.max(-44, Math.min(44, player.position.z));
    for (const b of buildings.concat([{ center: new THREE.Vector3(0, 0, -16), radius: 4.6 }])) {
      const v = new THREE.Vector3().subVectors(player.position, b.center);
      v.y = 0;
      const d = v.length();
      if (d < b.radius + 0.5) {
        v.normalize().multiplyScalar(b.radius + 0.5 - d);
        player.position.add(v);
      }
    }

    const targetRot = Math.atan2(dx, dz);
    let diff = targetRot - player.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    player.rotation.y += diff * Math.min(1, dt * 12);

    walkT += dt * 11;
    playerParts.body.position.y = Math.abs(Math.sin(walkT)) * 0.09;
    playerParts.legL.rotation.x = Math.sin(walkT) * 0.7;
    playerParts.legR.rotation.x = -Math.sin(walkT) * 0.7;
    playerParts.armL.rotation.x = -Math.sin(walkT) * 0.55;
    playerParts.armR.rotation.x = Math.sin(walkT) * 0.55;
  } else {
    playerParts.body.position.y *= 0.8;
    for (const part of ["legL", "legR", "armL", "armR"]) playerParts[part].rotation.x *= 0.8;
  }

  // interact prompt
  nearBuilding = null;
  let best = 2.8;
  for (const b of buildings) {
    const d = player.position.distanceTo(b.interactPoint);
    if (d < best) { best = d; nearBuilding = b; }
  }
  if (nearBuilding && !isPaused()) {
    hintEl.textContent = `Enter ${nearBuilding.name} — press E / tap ACT`;
    hintEl.classList.add("on");
  } else {
    hintEl.classList.remove("on");
  }

  // camera follow
  const camTarget = new THREE.Vector3(player.position.x, player.position.y + 7.4, player.position.z + 10.2);
  camera.position.lerp(camTarget, Math.min(1, dt * 5));
  camera.lookAt(player.position.x, 1.7, player.position.z);

  // npcs wander
  for (const n of npcs) {
    const v = new THREE.Vector3().subVectors(n.target, n.g.position);
    v.y = 0;
    if (v.length() < 0.6) { n.target = randomSpot(); continue; }
    v.normalize();
    n.g.position.addScaledVector(v, n.speed * dt);
    n.g.rotation.y = Math.atan2(v.x, v.z);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.06);
  update(dt);
  renderer.render(scene, camera);
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
    ctx.strokeStyle = "#1c1c22"; ctx.lineWidth = 3; ctx.lineCap = "round";
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
    $("continue-btn").addEventListener("click", () => {
      state = existing;
      beginGame();
    });
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
    buildPlayer();
    makeNPCs();
    refreshHUD();
    refreshBillboard();
    intro.classList.add("hidden");
    hud.classList.remove("hidden");
    animate();
    toast(`Welcome to MOGCITY, ${state.name}. Go get your money up at MogU 📚`, 4200);
  });
}

setupIntro();
