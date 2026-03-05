/* Romantic single-page interactions (no network needed). */

const STORAGE_KEY = "romantic_site_v1_names";
const DEFAULT_HER_NAME = "HafeBeza";
const DEFAULT_YOUR_NAME = "me";
const LEGACY_DEFAULT_HER_NAME = "my love";
const LEGACY_DEFAULT_YOUR_NAME = "me";

const THEME_STORAGE_KEY = "romantic_site_v1_theme";
const THEMES = [
  "rose",
  "lilac",
  "sunset",
  "midnight",
  "aurora",
  "peach",
  "ocean",
  "emerald",
  "ruby",
  "gold",
  "cherry",
  "lavender",
  "neon",
  "cocoa",
  "blush",
  "sky",
  "forest",
  "amethyst",
  "coral",
  "ice",
];

const IMAGE_PATHS = Array.from({ length: 12 }, (_, i) => `./img/img_${i + 1}.png`);
const ANIM_STORAGE_KEY = "romantic_site_v1_anim";

const ARRANGEMENTS = [
  { id: "heart_outline", label: "Heart" },
  { id: "heart_fill", label: "Full heart" },
  { id: "double_heart", label: "Double heart" },
  { id: "infinity", label: "Infinity" },
  { id: "ring", label: "Ring" },
  { id: "spiral", label: "Spiral" },
  { id: "rose", label: "Rose" },
  { id: "star", label: "Star" },
  { id: "wave", label: "Wave" },
  { id: "heartbeat", label: "Heartbeat" },
  { id: "h_letter", label: "H" },
  { id: "bouquet", label: "Bouquet" },
  { id: "ribbon", label: "Ribbon" },
  { id: "constellation", label: "Constellation" },
  { id: "fireworks", label: "Fireworks" },
  { id: "orbit", label: "Orbit" },
  { id: "diamond", label: "Diamond" },
  { id: "butterfly", label: "Butterfly" },
  { id: "arc", label: "Arc" },
  { id: "burst", label: "Burst" },
];

const FEELINGS = [
  "I like you.",
  "You’re on my mind.",
  "My heart chose you.",
  "Softly… it’s you.",
  "I’m happy when it’s you.",
  "You feel special to me.",
  "I’m into you.",
];

const prefersReducedMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function $(id) {
  return document.getElementById(id);
}

function getNames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { her: DEFAULT_HER_NAME, you: DEFAULT_YOUR_NAME };
    const parsed = JSON.parse(raw);
    const names = {
      her: (parsed?.her || DEFAULT_HER_NAME).trim() || DEFAULT_HER_NAME,
      you: (parsed?.you || DEFAULT_YOUR_NAME).trim() || DEFAULT_YOUR_NAME,
    };
    // Migrate old defaults so first-time viewers see her real name.
    if (
      names.her === LEGACY_DEFAULT_HER_NAME &&
      names.you === LEGACY_DEFAULT_YOUR_NAME &&
      DEFAULT_HER_NAME !== LEGACY_DEFAULT_HER_NAME
    ) {
      const migrated = { her: DEFAULT_HER_NAME, you: DEFAULT_YOUR_NAME };
      setNames(migrated);
      return migrated;
    }
    return names;
  } catch {
    return { her: DEFAULT_HER_NAME, you: DEFAULT_YOUR_NAME };
  }
}

function setNames(names) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch {
    // ignore
  }
}

function getTheme() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw && THEMES.includes(raw)) return raw;
  } catch {
    // ignore
  }
  return "";
}

function setTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

function getAnim() {
  try {
    const raw = localStorage.getItem(ANIM_STORAGE_KEY);
    if (raw && ARRANGEMENTS.some((a) => a.id === raw)) return raw;
  } catch {
    // ignore
  }
  return ARRANGEMENTS[0].id;
}

function setAnim(animId) {
  try {
    localStorage.setItem(ANIM_STORAGE_KEY, animId);
  } catch {
    // ignore
  }
}

function applyTheme(theme) {
  const t = THEMES.includes(theme) ? theme : THEMES[0];
  document.body.dataset.theme = t;
  setTheme(t);
  return t;
}

function pickRandomTheme() {
  // Prefer a random theme for first impression (but keep it stable once chosen).
  const i = Math.floor(Math.random() * THEMES.length);
  return THEMES[i];
}

function applyNames(names) {
  const pairs = [
    ["herNameInline", names.her],
    ["herNameLetter", names.her],
    ["yourNameInline", names.you],
    ["yourNameLetter", names.you],
  ];
  for (const [id, value] of pairs) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
}

function formatToday() {
  const d = new Date();
  try {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return d.toDateString();
  }
}

function buildLetterText({ her, you }) {
  const today = formatToday();
  return [
    `Hey ${her}. (${today})`,
    "",
    `It’s early, but I like you.`,
    `I don’t want to be confusing — I want to be clear and respectful.`,
    "",
    `If you’re open to it, can I take you on a date?`,
    "",
    `No pressure — just honesty.`,
    "",
    `— ${you}`,
  ].join("\n");
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderLetterInstant(text) {
  const safe = escapeHtml(text)
    .replaceAll(/\n\n/g, "</p><p>")
    .replaceAll(/\n/g, "<br />")
    .replaceAll(/\*(.*?)\*/g, "<em>$1</em>");
  $("typedLetter").innerHTML = `<p>${safe}</p>`;
}

async function typeLetter(text) {
  const target = $("typedLetter");
  target.textContent = "";

  if (prefersReducedMotion) {
    renderLetterInstant(text);
    return;
  }

  let i = 0;
  const tick = async () => {
    i += 1;
    const slice = text.slice(0, i);
    target.textContent = slice;
    if (i < text.length) {
      const ch = text[i - 1];
      const base = ch === "\n" ? 0 : 9;
      const jitter = ch === "\n" ? 0 : Math.random() * 22;
      await new Promise((r) => setTimeout(r, base + jitter));
      return tick();
    }
    renderLetterInstant(text);
  };
  await tick();
}

function makeToast() {
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  document.body.appendChild(el);
  return el;
}

function showToast(message) {
  const toast = showToast._el || (showToast._el = makeToast());
  toast.textContent = message;
  toast.classList.remove("toast--hide");
  toast.classList.add("toast--show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.add("toast--hide");
  }, 2800);
}

function heartCurvePoint(t) {
  // classic heart curve
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);
  return { x, y };
}

function createHeartTargets(count, width, height) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    pts.push(heartCurvePoint(t));
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const pad = 26;
  const heartW = maxX - minX;
  const heartH = maxY - minY;
  const sx = (width - pad * 2) / heartW;
  const sy = (height - pad * 2) / heartH;
  const s = Math.min(sx, sy) * 0.55;

  const cx = width * 0.5;
  const cy = height * 0.52;

  return pts.map((p) => ({
    x: cx + (p.x - (minX + maxX) / 2) * s,
    y: cy - (p.y - (minY + maxY) / 2) * s, // invert y
  }));
}

function scalePointsToScreen(points, width, height, { scale = 0.64, cx = 0.5, cy = 0.52 } = {}) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const w = Math.max(1e-6, maxX - minX);
  const h = Math.max(1e-6, maxY - minY);
  const pad = 28;
  const sx = (width - pad * 2) / w;
  const sy = (height - pad * 2) / h;
  const s = Math.min(sx, sy) * scale;
  const centerX = width * cx;
  const centerY = height * cy;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  return points.map((p) => ({
    x: centerX + (p.x - midX) * s,
    y: centerY + (p.y - midY) * s,
  }));
}

function makeRingPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    pts.push({ x: Math.cos(t), y: Math.sin(t) });
  }
  return pts;
}

function makeSpiralPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const u = i / Math.max(1, count - 1);
    const t = u * Math.PI * 6.5;
    const r = 0.18 + u * 1.05;
    pts.push({ x: Math.cos(t) * r, y: Math.sin(t) * r });
  }
  return pts;
}

function makeInfinityPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const x = (Math.cos(t) / denom) * 1.6;
    const y = ((Math.sin(t) * Math.cos(t)) / denom) * 1.1;
    pts.push({ x, y });
  }
  return pts;
}

function makeRosePoints(count, k = 4) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const r = Math.cos(k * t);
    pts.push({ x: Math.cos(t) * r, y: Math.sin(t) * r });
  }
  return pts;
}

function makeStarPoints(count) {
  const pts = [];
  const spikes = 5;
  for (let i = 0; i < count; i++) {
    const u = i / count;
    const t = u * Math.PI * 2;
    const r = i % 2 === 0 ? 1.0 : 0.45;
    const a = t * spikes;
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return pts;
}

function makeWavePoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const u = i / Math.max(1, count - 1);
    const x = (u - 0.5) * 2.2;
    const y = Math.sin(u * Math.PI * 3) * 0.55;
    pts.push({ x, y });
  }
  return pts;
}

function makeHeartbeatPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const u = i / Math.max(1, count - 1);
    const x = (u - 0.5) * 2.4;
    let y = 0;
    const d = Math.abs(u - 0.55);
    if (d < 0.06) y = -0.6 + (d / 0.06) * 0.9;
    else if (Math.abs(u - 0.5) < 0.03) y = 0.65 - (Math.abs(u - 0.5) / 0.03) * 1.05;
    else y = Math.sin(u * Math.PI * 6) * 0.08;
    pts.push({ x, y });
  }
  return pts;
}

function makeHLetterPoints(count) {
  const pts = [];
  const leftX = -0.7;
  const rightX = 0.7;
  const topY = -1.0;
  const botY = 1.0;
  const midY = 0.0;
  const seg = Math.max(6, Math.floor(count / 3));
  for (let i = 0; i < seg; i++) {
    const u = i / (seg - 1);
    pts.push({ x: leftX, y: topY + (botY - topY) * u });
  }
  for (let i = 0; i < seg; i++) {
    const u = i / (seg - 1);
    pts.push({ x: rightX, y: topY + (botY - topY) * u });
  }
  while (pts.length < count) {
    const u = (pts.length - seg * 2) / Math.max(1, count - seg * 2 - 1);
    pts.push({ x: leftX + (rightX - leftX) * u, y: midY });
  }
  return pts.slice(0, count);
}

function makeBouquetPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.55) * 1.05;
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.85 });
  }
  return pts;
}

function makeRibbonPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const u = i / Math.max(1, count - 1);
    const x = (u - 0.5) * 2.2;
    const y = Math.sin(u * Math.PI * 4) * 0.42 + (u - 0.5) * 0.25;
    pts.push({ x, y });
  }
  return pts;
}

function makeConstellationPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    pts.push({ x: (Math.random() - 0.5) * 2.2, y: (Math.random() - 0.5) * 1.6 });
  }
  return pts;
}

function makeFireworksPoints(count) {
  const pts = [];
  const rings = 3;
  for (let i = 0; i < count; i++) {
    const ring = i % rings;
    const t = (i / count) * Math.PI * 10;
    const r = 0.35 + ring * 0.35;
    pts.push({ x: Math.cos(t) * r, y: Math.sin(t) * r });
  }
  return pts;
}

function makeOrbitPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const r = i % 2 === 0 ? 1.0 : 0.55;
    pts.push({ x: Math.cos(t) * r, y: Math.sin(t) * r * 0.65 });
  }
  return pts;
}

function makeDiamondPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const u = i / count;
    const t = u * 4;
    const seg = Math.floor(t);
    const f = t - seg;
    let x = 0;
    let y = 0;
    if (seg === 0) {
      x = f;
      y = 1 - f;
    } else if (seg === 1) {
      x = 1 - f;
      y = -f;
    } else if (seg === 2) {
      x = -f;
      y = -1 + f;
    } else {
      x = -1 + f;
      y = f;
    }
    pts.push({ x, y });
  }
  return pts;
}

function makeButterflyPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const r = Math.sin(t) * Math.sin(t) + 0.2;
    pts.push({ x: Math.sin(t) * r * 1.8, y: Math.cos(t) * r * 1.1 });
  }
  return pts;
}

function makeArcPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const u = i / Math.max(1, count - 1);
    const t = Math.PI * (0.1 + u * 0.8);
    pts.push({ x: Math.cos(t) * 1.3, y: Math.sin(t) * 1.0 - 0.35 });
  }
  return pts;
}

function makeBurstPoints(count) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = 0.25 + (i % 6) * 0.16;
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return pts;
}

function makeHeartFillPoints(count) {
  const pts = [];
  while (pts.length < count) {
    const x = (Math.random() - 0.5) * 2.4;
    const y = (Math.random() - 0.5) * 2.4;
    const a = x * x + y * y - 1;
    const inside = a * a * a - x * x * y * y * y <= 0;
    if (inside) pts.push({ x, y: y * 0.9 });
  }
  return pts;
}

function makeDoubleHeartOutline(count) {
  const left = [];
  const right = [];
  const half = Math.floor(count / 2);
  for (let i = 0; i < half; i++) {
    const t = (i / half) * Math.PI * 2;
    left.push(heartCurvePoint(t));
  }
  for (let i = 0; i < count - half; i++) {
    const t = (i / (count - half)) * Math.PI * 2;
    right.push(heartCurvePoint(t));
  }
  const l = left.map((p) => ({ x: p.x / 12 - 0.9, y: -p.y / 12 }));
  const r = right.map((p) => ({ x: p.x / 12 + 0.9, y: -p.y / 12 }));
  return l.concat(r);
}

function getArrangementPoints(id, count) {
  switch (id) {
    case "heart_outline":
      return null;
    case "heart_fill":
      return makeHeartFillPoints(count);
    case "double_heart":
      return makeDoubleHeartOutline(count);
    case "infinity":
      return makeInfinityPoints(count);
    case "ring":
      return makeRingPoints(count);
    case "spiral":
      return makeSpiralPoints(count);
    case "rose":
      return makeRosePoints(count, 4);
    case "star":
      return makeStarPoints(count);
    case "wave":
      return makeWavePoints(count);
    case "heartbeat":
      return makeHeartbeatPoints(count);
    case "h_letter":
      return makeHLetterPoints(count);
    case "bouquet":
      return makeBouquetPoints(count);
    case "ribbon":
      return makeRibbonPoints(count);
    case "constellation":
      return makeConstellationPoints(count);
    case "fireworks":
      return makeFireworksPoints(count);
    case "orbit":
      return makeOrbitPoints(count);
    case "diamond":
      return makeDiamondPoints(count);
    case "butterfly":
      return makeButterflyPoints(count);
    case "arc":
      return makeArcPoints(count);
    case "burst":
      return makeBurstPoints(count);
    default:
      return null;
  }
}

function setupPhotoHeart() {
  const host = $("photoHeart");
  const msg = $("heartMessage");
  const revealBtn = $("revealBtn");
  const animBtn = $("animBtn");
  if (!host || !revealBtn || !animBtn) return { toggle: () => {}, nextStyle: () => {} };

  // Show only 3x3 photos (9) on screen at a time.
  const getCount = () => 9;

  let tiles = [];
  let count = getCount();
  let on = false;
  let resizeT = null;
  let autoT = null;
  let pulseT = null;

  let styleIndex = Math.max(
    0,
    ARRANGEMENTS.findIndex((a) => a.id === getAnim())
  );

  const pickFeeling = (names) => {
    const text = FEELINGS[Math.floor(Math.random() * FEELINGS.length)];
    return `${names.her} — ${text}`;
  };

  const buildTiles = () => {
    host.textContent = "";
    tiles = [];
    const shuffled = IMAGE_PATHS.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      const tile = document.createElement("div");
      tile.className = "photoTile";
      const img = document.createElement("img");
      img.src = shuffled[i % shuffled.length];
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      tile.appendChild(img);
      host.appendChild(tile);
      tiles.push(tile);
    }
  };

  const applyArrangement = ({ fromNowhere = true } = {}) => {
    const style = ARRANGEMENTS[styleIndex % ARRANGEMENTS.length];
    setAnim(style.id);
    host.dataset.arrangement = style.id;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const minSide = Math.min(w, h);
    const base = clamp(minSide * 0.13, 44, 92);

    let targets;
    if (style.id === "heart_outline") {
      targets = createHeartTargets(count, w, h);
    } else {
      const pts = getArrangementPoints(style.id, count) || makeRingPoints(count);
      targets = scalePointsToScreen(pts, w, h, { scale: 0.64, cx: 0.5, cy: 0.52 });
    }

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const t = targets[i % targets.length];
      const size = base * (0.72 + Math.random() * 0.7);
      const rot = (Math.random() - 0.5) * 12;
      const delay = Math.random() * 420;
      const op = 0.55 + Math.random() * 0.25;

      tile.style.width = `${size}px`;
      tile.style.height = `${size}px`;
      tile.style.setProperty("--x", `${t.x}px`);
      tile.style.setProperty("--y", `${t.y}px`);
      tile.style.setProperty("--rot", `${rot}deg`);
      tile.style.setProperty("--d", `${delay}ms`);
      tile.style.setProperty("--op", `${op}`);

      if (fromNowhere) {
        const angle = Math.random() * Math.PI * 2;
        const radius = minSide * (0.75 + Math.random() * 0.85);
        tile.style.setProperty("--sx", `${w * 0.5 + Math.cos(angle) * radius}px`);
        tile.style.setProperty("--sy", `${h * 0.5 + Math.sin(angle) * radius}px`);
      }
    }

    if (!on) return;
    host.classList.remove("is-on");
    host.classList.remove("is-pulse");
    if (msg) msg.classList.remove("is-on");
    requestAnimationFrame(() => {
      host.classList.add("is-on");
      if (msg) msg.classList.add("is-on");
      clearTimeout(pulseT);
      pulseT = setTimeout(() => {
        if (on) host.classList.add("is-pulse");
      }, 980);
    });
  };

  const setBtns = () => {
    revealBtn.textContent = on ? "Hide" : "Reveal my heart";
    const style = ARRANGEMENTS[styleIndex % ARRANGEMENTS.length];
    animBtn.textContent = `Anim: ${style.label}`;
  };

  const nextStyle = ({ silent = false } = {}) => {
    styleIndex = (styleIndex + 1) % ARRANGEMENTS.length;
    const names = getNames();
    if (msg) msg.textContent = pickFeeling(names);
    setBtns();
    applyArrangement({ fromNowhere: true });
    if (!silent) showToast(`Animation: ${ARRANGEMENTS[styleIndex].label}`);
  };

  const startAuto = () => {
    clearInterval(autoT);
    autoT = setInterval(() => {
      if (!on || prefersReducedMotion) return;
      nextStyle({ silent: true });
    }, 5000);
  };

  const stopAuto = () => {
    clearInterval(autoT);
    autoT = null;
  };

  const toggle = ({ silent = false } = {}) => {
    if (prefersReducedMotion) {
      if (!silent) showToast("Animations are reduced on this device.");
      return;
    }
    on = !on;
    const names = getNames();
    if (msg) msg.textContent = pickFeeling(names);
    setBtns();

    if (on) {
      applyArrangement({ fromNowhere: true });
      host.classList.add("is-on");
      host.classList.remove("is-pulse");
      if (msg) msg.classList.add("is-on");
      startAuto();
      clearTimeout(pulseT);
      pulseT = setTimeout(() => {
        if (on) host.classList.add("is-pulse");
      }, 980);
      if (!silent) showToast("Watch the shapes change…");
    } else {
      host.classList.remove("is-on");
      host.classList.remove("is-pulse");
      if (msg) msg.classList.remove("is-on");
      stopAuto();
    }
  };

  animBtn.addEventListener("click", () => nextStyle());

  buildTiles();
  setBtns();

  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const nextCount = getCount();
      if (nextCount !== count) {
        count = nextCount;
        buildTiles();
      }
      applyArrangement({ fromNowhere: false });
    }, 220);
  });

  return { toggle, nextStyle };
}

function attachNameModal() {
  const namesModal = $("namesModal");
  const herInput = $("herNameInput");
  const yourInput = $("yourNameInput");
  const saveBtn = $("saveNamesBtn");

  $("changeNamesBtn").addEventListener("click", () => {
    const current = getNames();
    herInput.value = current.her === DEFAULT_HER_NAME ? "" : current.her;
    yourInput.value = current.you === DEFAULT_YOUR_NAME ? "" : current.you;
    if (typeof namesModal.showModal === "function") namesModal.showModal();
    else namesModal.setAttribute("open", "open");
  });

  saveBtn.addEventListener("click", () => {
    const next = {
      her: (herInput.value || DEFAULT_HER_NAME).trim() || DEFAULT_HER_NAME,
      you: (yourInput.value || DEFAULT_YOUR_NAME).trim() || DEFAULT_YOUR_NAME,
    };
    setNames(next);
    applyNames(next);
    showToast("Saved. Now it feels even more personal.");
  });
}

function setupReveal() {
  const targets = Array.from(document.querySelectorAll(".section"));
  for (const el of targets) el.classList.add("reveal");
  if (prefersReducedMotion) {
    for (const el of targets) el.classList.add("reveal--in");
    return;
  }
  if (!("IntersectionObserver" in window)) {
    for (const el of targets) el.classList.add("reveal--in");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal--in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  for (const el of targets) io.observe(el);
}

// --- Music (gentle WebAudio) ---
function createMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const ctx = new AudioContextClass();
  const master = ctx.createGain();
  master.gain.value = 0.0;
  master.connect(ctx.destination);

  const notes = [0, 4, 7, 11, 14]; // major-ish
  let step = 0;
  let running = false;
  let timer = null;

  function playOne() {
    if (!running) return;
    const base = 220; // A3
    const semitone = notes[step % notes.length] + (step % 2 ? 12 : 0);
    const freq = base * Math.pow(2, semitone / 12);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

    osc.connect(g);
    g.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);

    step += 1;
  }

  function start() {
    running = true;
    master.gain.value = 0.65;
    if (timer) clearInterval(timer);
    timer = setInterval(playOne, 420);
    playOne();
  }

  function stop() {
    running = false;
    master.gain.value = 0.0;
    if (timer) clearInterval(timer);
    timer = null;
  }

  async function toggle() {
    if (ctx.state === "suspended") await ctx.resume();
    if (running) stop();
    else start();
    return running;
  }

  return { toggle, stop, ctx };
}

// --- Hearts canvas ---
function setupHeartsCanvas() {
  const canvas = $("hearts");
  const ctx = canvas.getContext && canvas.getContext("2d", { alpha: true });
  if (!ctx) return { spawnBurst: () => {}, onPointer: () => {}, stop: () => {} };
  const particles = [];
  let w = 0;
  let h = 0;
  let raf = 0;

  function resize() {
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function heartPath(x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(
      x - size / 2,
      y + (size + topCurveHeight) / 2,
      x,
      y + (size + topCurveHeight) / 2,
      x,
      y + size
    );
    ctx.bezierCurveTo(
      x,
      y + (size + topCurveHeight) / 2,
      x + size / 2,
      y + (size + topCurveHeight) / 2,
      x + size / 2,
      y + topCurveHeight
    );
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
  }

  function spawnBurst(cx, cy, count = 26) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.8;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 1.2,
        size: 7 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.08,
        life: 0,
        ttl: 95 + Math.random() * 55,
        hue: 330 + Math.random() * 40,
      });
    }
  }

  function spawnDrift() {
    particles.push({
      x: Math.random() * w,
      y: h + 20,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -0.6 - Math.random() * 1.1,
      size: 7 + Math.random() * 12,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.03,
      life: 0,
      ttl: 220 + Math.random() * 120,
      hue: 325 + Math.random() * 50,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += 1;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vy += 0.008; // slight gravity

      const t = 1 - p.life / p.ttl;
      if (t <= 0) {
        particles.splice(i, 1);
        continue;
      }

      const alpha = clamp(t, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      ctx.globalAlpha = 0.85 * alpha;
      ctx.fillStyle = `hsl(${p.hue}deg 95% 70%)`;
      heartPath(0, 0, p.size);
      ctx.fill();

      ctx.globalAlpha = 0.15 * alpha;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    if (!prefersReducedMotion) raf = requestAnimationFrame(draw);
  }

  function onPointer(e) {
    const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? w / 2;
    const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? h / 2;
    spawnBurst(x, y, 18);
  }

  resize();
  window.addEventListener("resize", resize);
  if (!prefersReducedMotion) {
    for (let i = 0; i < 14; i++) spawnDrift();
    setInterval(spawnDrift, 900);
    raf = requestAnimationFrame(draw);
  }

  return { spawnBurst, onPointer, stop: () => cancelAnimationFrame(raf) };
}

function injectToastStyles() {
  const css = document.createElement("style");
  css.textContent = `
    .toast{
      position: fixed;
      left: 50%;
      bottom: 18px;
      transform: translate(-50%, 14px);
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.2);
      background: rgba(15, 12, 22, .88);
      color: rgba(255,255,255,.92);
      box-shadow: 0 18px 55px rgba(0,0,0,.55);
      opacity: 0;
      z-index: 50;
      font-size: 13px;
      max-width: min(90vw, 520px);
      text-align: center;
      pointer-events: none;
      transition: opacity 180ms ease, transform 180ms ease;
    }
    .toast--show{ opacity: 1; transform: translate(-50%, 0); }
    .toast--hide{ opacity: 0; transform: translate(-50%, 14px); }
    @media (prefers-reduced-motion: reduce){
      .toast{ transition: none; }
    }
  `;
  document.head.appendChild(css);
}

function main() {
  injectToastStyles();

  const existingTheme = getTheme();
  applyTheme(existingTheme || pickRandomTheme());

  $("todayBadge").textContent = `Made just for you • ${formatToday()}`;

  const names = getNames();
  applyNames(names);

  const photoHeart = setupPhotoHeart();
  attachNameModal();
  setupReveal();

  const hearts = setupHeartsCanvas();
  const music = createMusic();

  const musicBtn = $("musicBtn");
  const musicHint = $("musicHint");
  if (!music) {
    musicBtn.disabled = true;
    musicHint.textContent = "Music isn’t supported in this browser.";
  } else {
    musicBtn.addEventListener("click", async () => {
      const on = await music.toggle();
      musicBtn.textContent = on ? "Pause music" : "Tap for a little music";
      showToast(on ? "For you. Always." : "Okay. Quiet, but still love.");
    });
  }

  const letterModal = $("letterModal");
  const openLetterBtn = $("openLetterBtn");
  const sparkleBtn = $("sparkleBtn");
  const typed = $("typedLetter");

  openLetterBtn.addEventListener("click", async () => {
    const current = getNames();
    applyNames(current);
    typed.textContent = "";
    if (typeof letterModal.showModal === "function") letterModal.showModal();
    else letterModal.setAttribute("open", "open");
    await typeLetter(buildLetterText(current));
  });

  sparkleBtn.addEventListener("click", () => {
    hearts.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.4, 34);
    showToast("Sending hearts… delivered.");
  });

  const revealBtn = $("revealBtn");
  revealBtn.addEventListener("click", () => {
    photoHeart.toggle();
    hearts.spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 24);
  });

  // Auto-reveal once for a nice first impression.
  setTimeout(() => {
    photoHeart.toggle({ silent: true });
  }, 650);

  document.addEventListener("pointerdown", (e) => {
    if (prefersReducedMotion) return;
    hearts.onPointer(e);
  });
}

document.addEventListener("DOMContentLoaded", main);
