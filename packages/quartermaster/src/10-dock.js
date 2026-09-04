// Quartermaster — self-managed floating sheet panel. Mirrors Beholder's
// BH.dock (src/80-dock.js): the host's Tracker Panel is small and shared
// chrome, not roomy enough for a real character-sheet layout (portrait,
// equip-slot columns, inventory grid). So the panel lives in its own
// fixed-position element appended to document.body, independent of any
// host-provided slot container.
//
// A pure view over QM.state (05-state.js) — subscribes while open, repaints
// on every change, unsubscribes while closed. The tracker-panel slot has its
// own inline accordion view (15-panel.js) reading the same state, so
// equipping something in one place is reflected in the other immediately.
//
// Styled with the host's own CSS custom properties (--popover, --foreground,
// --border, etc. — defined on :root in the Engine's globals.css) for general
// chrome, since our panel is plain light DOM appended under document.body
// and inherits them directly. Destructive/dismiss and save/create actions
// use fixed red/green instead of var(--destructive)/var(--primary) on
// purpose — this app's own theme maps --destructive to the same purple as
// --primary, so following it would lose the actual red/green danger-vs-safe
// signal, which matters more here than perfect theme fidelity.
//
// Draggable/resizable/mobile-aware: ported from Beholder's own dock, which
// solves the identical problem (a floating panel over the same host) —
// geometry as CSS custom properties + a stylesheet with !important (inline
// styles can't express :hover or @media, so position/size move out of
// Object.assign and into QM_DOCK_STYLE below), pointerdown-driven move/
// resize, chat-area bounds clamping via the same .rpg-chat-area/TopBar
// selectors, and a 767px mobile breakpoint that goes full-screen — same
// breakpoint Beholder uses elsewhere in the host, kept consistent rather
// than picked independently. touch-action:none on drag surfaces and
// env(safe-area-inset-bottom) on the scrolling body are both host
// conventions confirmed against Pixelforge's own touch surfaces, not
// Quartermaster-specific choices.

const QM_DOCK_STYLE_ID = "qm-dock-style";
const QM_DOCK_STYLE = `
#qm-dock-root{
  position:fixed !important;
  top:var(--qm-window-top,4rem) !important;
  left:var(--qm-window-left,calc(100vw - 36rem)) !important;
  right:auto !important; bottom:auto !important;
  width:var(--qm-window-width,min(960px,calc(100vw - 2rem))) !important;
  height:var(--qm-window-height,min(640px,calc(100vh - 5rem))) !important;
  display:flex !important;
}
#qm-dock-root.qm-dock-collapsed{ display:none !important; }
#qm-dock-header{ cursor:move; touch-action:none; }
#qm-dock-resize-handle{
  position:absolute; right:.25rem; bottom:.25rem; width:1.25rem; height:1.25rem;
  border:0; border-radius:.25rem; padding:0; background:transparent;
  color:var(--muted-foreground, currentcolor); cursor:nwse-resize; opacity:.6; touch-action:none;
}
#qm-dock-resize-handle::after{
  content:""; position:absolute; right:.3rem; bottom:.3rem; width:.5rem; height:.5rem;
  border-right:2px solid currentColor; border-bottom:2px solid currentColor;
}
#qm-dock-resize-handle:hover{ opacity:1; background:var(--accent, rgba(128,128,128,0.15)); }
#qm-dock-root.qm-dock-dragging, #qm-dock-root.qm-dock-resizing{ user-select:none; }
#qm-dock-body{
  scrollbar-width: thin;
  scrollbar-color: var(--border, rgba(128,128,128,0.4)) transparent;
}
#qm-dock-body::-webkit-scrollbar{ width:8px; height:8px; }
#qm-dock-body::-webkit-scrollbar-track{ background:transparent; }
#qm-dock-body::-webkit-scrollbar-thumb{
  background:var(--border, rgba(128,128,128,0.4)); border-radius:4px;
}
#qm-dock-body::-webkit-scrollbar-thumb:hover{ background:var(--muted-foreground, rgba(128,128,128,0.6)); }
@media (max-width:767px){
  #qm-dock-root{
    top:var(--qm-mobile-top,0px) !important; left:0 !important; right:0 !important; bottom:0 !important;
    width:100% !important; height:calc(100dvh - var(--qm-mobile-top,0px)) !important; border-radius:0 !important;
  }
  #qm-dock-header{ cursor:default; touch-action:auto; }
  #qm-dock-resize-handle{ display:none !important; }
  #qm-dock-body{ padding-bottom:max(10px, env(safe-area-inset-bottom)) !important; }
}
`;

const QM_WINDOW_KEY = "marinara.quartermaster.window";
const QM_WINDOW_MARGIN = 12;
const QM_WINDOW_MIN_WIDTH = 320;
const QM_WINDOW_MIN_HEIGHT = 360;
const QM_WINDOW_DEFAULT_WIDTH = 960;
const QM_WINDOW_DEFAULT_HEIGHT = 640;
// Below this measured content width the 3 columns stack vertically instead
// of overlapping — this is also what fixes the ring overflowing into the
// Outfits/Bag columns at the old fixed size, not just a resize nicety.
const QM_DOCK_COLUMNS_STACK_WIDTH = 760;

// UI Size — a CSS zoom factor applied to a wrapper around everything in the
// dock's body except the UI-size row itself (kept at a fixed, predictable
// size so it stays a stable control regardless of the current zoom) and the
// header/resize-handle chrome. zoom (not transform:scale) because it
// affects real layout — content correctly reflows and wraps at its scaled
// size instead of visually stretching past its box — and dock-only per the
// request: the tracker panel (15-panel.js) reads the same QM.state but
// isn't part of this wrapper, so it's unaffected.
const QM_UI_SIZE_KEY = "marinara.quartermaster.uiSize";
const QM_UI_SIZES = { S: 0.85, M: 1, L: 1.2 };
// Independent from QM_UI_SIZES/zoom — this controls the pixel box size of
// outfit portrait thumbnails and item placeholder images specifically, read
// at build time by their card layouts rather than a live CSS zoom, since
// those cards already get rebuilt on every repaint anyway.
const QM_THUMBNAIL_SIZE_KEY = "marinara.quartermaster.thumbnailSize";
const QM_THUMBNAIL_SIZES = { S: 48, M: 72, L: 100 };
// Independent from QM_THUMBNAIL_SIZES above (which still governs item/
// outfit thumbnails, unchanged) — the portrait needs to scale far more
// aggressively per size, since 5 equip-slot-box pairs beside it need real
// vertical room not to overlap at S/M. S stays exactly what it was before;
// M becomes what L used to be; L is double what L used to be.
const QM_PORTRAIT_SCALE = {
  S: QM_THUMBNAIL_SIZES.S / QM_THUMBNAIL_SIZES.M,
  M: QM_THUMBNAIL_SIZES.L / QM_THUMBNAIL_SIZES.M,
  L: (QM_THUMBNAIL_SIZES.L / QM_THUMBNAIL_SIZES.M) * 2,
};
// Cut-corner "gem frame" look for the portrait — shared by both the real
// image and the empty-state placeholder so they read as the same frame
// regardless of which is showing. Border/glow use the theme's own accent
// (var(--primary)), not a fixed brand color, so it matches whatever accent
// the user's actually set in the Engine rather than a hardcoded look.
// Applied to the FRAME (the div wrapping the image/placeholder), not to the
// image/placeholder themselves — clip-path clips a box's descendants along
// with itself, so a child image's square corners are cut away for free
// wherever they'd fall inside the octagon's notches, with no separate
// clip-path needed on the image. The frame's own small padding is what makes
// that backing/mat visible as a ring around the portrait rather than the
// image filling the clipped shape edge-to-edge. Two box-shadow layers: the
// outer glow (unchanged from before) plus a thin inset hairline for a subtle
// "double border" look — same technique, no extra DOM needed for it.
const QM_PORTRAIT_FRAME_STYLE = {
  clipPath: "polygon(12% 0%, 88% 0%, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0% 88%, 0% 12%)",
  border: "2px solid var(--primary, #444)",
  padding: "3px",
  background: "color-mix(in srgb, var(--primary, #444) 10%, rgba(0, 0, 0, 0.55))",
  boxShadow:
    "0 0 12px color-mix(in srgb, var(--primary, #444) 45%, transparent), " +
    "inset 0 0 0 1px color-mix(in srgb, var(--primary, #444) 35%, transparent)",
  boxSizing: "border-box",
};

// Hand-drawn scrollwork corner ornament, designed and iterated visually
// (see _planning/scratch/frame-ornament-lab.html) rather than guessed blind —
// a flat SVG line drawing at ~32px doesn't survive freehand coordinate math
// the way the equip-slot icons didn't either. Drawn once in a canonical
// "top-left-ish" orientation: the dense curl detail sits near local (8,8),
// diagonally inward from local (0,0), with two tendrils sweeping out toward
// (34,2)/(2,34). Every corner reuses this exact same path, oriented by CSS
// transform — see qmBuildPortraitCornerAccent's own comment for why it's
// scale flips, not rotations, and why the specific corner→transform mapping
// below isn't the "obvious" one.
const QM_PORTRAIT_CORNER_PATH =
  "M2 34 C2 16 16 2 34 2 M8 34 C8 20 20 8 34 8 M2 22 C2 22 10 16 10 8 C10 4 8 2 8 2 M22 2 C22 2 16 10 8 10 C4 10 2 8 2 8" +
  " M34 2 C30 6 28 10 28 14 M2 34 C6 30 10 28 14 28";

// scaleX/scaleY (reflections), not rotate(90deg) steps — a true rotation
// would be the "obvious" way to place one ornament at all 4 corners, but
// this path's curl is asymmetric (denser detail on one side), and mirroring
// is what keeps that dense detail pointing in toward the portrait at every
// corner rather than rotating it around to face out toward the corner tip
// at 2 of the 4 positions. The exact mapping (which axis for which corner)
// was arrived at visually, not derived — see the lab file's iteration
// history if this ever needs revisiting.
const QM_PORTRAIT_CORNER_TRANSFORMS = {
  "top left": "scale(-1, -1)",
  "top right": "scaleY(-1)",
  "bottom left": "scaleX(-1)",
  "bottom right": "none",
};

// sizePx here is deliberately small relative to the frame — anchored 2px
// out from the frame's own edge (well outside the frame's 3px padding), not
// flush with it, so the ornament's outer tips push past the border while
// the dense inner detail (fixed at local ~8,8 regardless of sizePx) lands
// close to the corner rather than reaching deep into the portrait. Lives on
// `wrapper` (a sibling of the clipped `frame`, not a child of it) — anything
// placed inside `frame` itself would be clipped away wherever it fell in one
// of the octagon's cut notches, corners included.
function qmBuildPortraitCornerAccent(corner, sizePx) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 36 36");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML =
    `<path d="${QM_PORTRAIT_CORNER_PATH}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>` +
    `<circle cx="8" cy="8" r="1.6" fill="currentColor"/>`;
  const offset = "2px";
  Object.assign(svg.style, {
    position: "absolute",
    width: `${sizePx}px`,
    height: `${sizePx}px`,
    color: "var(--primary, #444)",
    pointerEvents: "none",
    transform: QM_PORTRAIT_CORNER_TRANSFORMS[corner],
    top: corner.includes("top") ? offset : "auto",
    bottom: corner.includes("bottom") ? offset : "auto",
    left: corner.includes("left") ? offset : "auto",
    right: corner.includes("right") ? offset : "auto",
  });
  return svg;
}

// Same clamp the lab settled on (20-30px), driven off the portrait's own max
// width at the current Thumbnail Size — there's no single fixed "frame
// width" to size off of the way the lab's test harness had, since the real
// portrait's rendered width varies with its own aspect ratio; the max-width
// QM_PORTRAIT_SCALE already computes is the closest stand-in.
function qmPortraitCornerSize(portraitScale) {
  return qmClampWindowValue(Math.round(160 * portraitScale) * 0.16, 20, 30);
}

function qmClampWindowValue(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

// "The persona" (the export route's own fallback when there's no active
// persona) collapses to an empty slug, which the caller treats as "leave it
// out of the filename" rather than downloading a file literally named
// "the-persona".
function qmFilenameSafe(text) {
  const slug = (typeof text === "string" ? text : "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug === "the-persona" ? "" : slug;
}

function qmReadUiSize() {
  try {
    const stored = window.localStorage.getItem(QM_UI_SIZE_KEY);
    if (stored && QM_UI_SIZES[stored]) return stored;
  } catch {
    // A blocked storage read falls back to the default size.
  }
  return "M";
}

function qmWriteUiSize(size) {
  try {
    window.localStorage.setItem(QM_UI_SIZE_KEY, size);
  } catch {
    // Persisting is a convenience; the session still works without it.
  }
}

function qmReadThumbnailSize() {
  try {
    const stored = window.localStorage.getItem(QM_THUMBNAIL_SIZE_KEY);
    if (stored && QM_THUMBNAIL_SIZES[stored]) return stored;
  } catch {
    // A blocked storage read falls back to the default size.
  }
  return "M";
}

function qmWriteThumbnailSize(size) {
  try {
    window.localStorage.setItem(QM_THUMBNAIL_SIZE_KEY, size);
  } catch {
    // Persisting is a convenience; the session still works without it.
  }
}

function qmReadWindowGeometry() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(QM_WINDOW_KEY) || "null");
    if (stored && [stored.left, stored.top, stored.width, stored.height].every((value) => Number.isFinite(value))) {
      return stored;
    }
  } catch {
    // A blocked or stale storage value falls back to the default placement.
  }
  return null;
}

function qmWriteWindowGeometry(geometry) {
  try {
    window.localStorage.setItem(QM_WINDOW_KEY, JSON.stringify(geometry));
  } catch {
    // Persisting is a convenience; the session still works without it.
  }
}

function qmEnsureDockStyle() {
  if (document.getElementById(QM_DOCK_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = QM_DOCK_STYLE_ID;
  style.textContent = QM_DOCK_STYLE;
  (document.head || document.body).appendChild(style);
}

QM.dock = {
  isOpenFlag: false,
  unsubscribe: null,
  root: null,
  header: null,
  body: null,
  columns: null,
  zoomWrapper: null,
  uiSizeButtons: null,
  thumbnailSizeButtons: null,
  errorNode: null,
  feedSelect: null,
  settingsSection: null,
  settingsContent: null,
  settingsChevron: null,
  underwearToggle: null,
  armorToggle: null,
  weaponsToggle: null,
  replaceRealAvatarToggle: null,
  equippedContainer: null,
  outfitsContainer: null,
  outfitForm: null,
  form: null,
  listContainer: null,
  portraitWrapper: null,
  portraitImage: null,
  portraitPlaceholder: null,
  portraitCorners: null,
  portraitFrame: null,
  connectorSvg: null,
  equippedSlotBoxRefs: null,
  geometry: qmReadWindowGeometry(),
  bodyWidth: QM_WINDOW_DEFAULT_WIDTH,
  uiSize: qmReadUiSize(),
  thumbnailSize: qmReadThumbnailSize(),
  // Collapsed by default to keep the dock compact; not persisted — a session
  // -only UI preference, unlike geometry/uiSize which are worth remembering
  // across visits.
  settingsExpanded: false,
  // Which equip slot's picker is open, if any — set by clicking a slot box,
  // cleared by picking an item, clicking the same slot again, closing the
  // dock, or switching chats (see close()/QM.state.setChat's own reset).
  selectedSlot: null,
  _windowBound: false,
  _outsideClickBound: false,
  _interaction: null,
  _boundsObserver: null,
  _bodyObserver: null,

  // Every DOM node _paint/_ensureRoot cache on `this` so a repaint can find
  // and update them without rebuilding — cleared together whenever the root
  // is rebuilt or there's no chat to show, since a stale reference into a
  // detached tree is worse than none.
  _resetCachedNodes() {
    this.columns = null;
    this.zoomWrapper = null;
    this.uiSizeButtons = null;
    this.thumbnailSizeButtons = null;
    this.errorNode = null;
    this.feedSelect = null;
    this.settingsSection = null;
    this.settingsContent = null;
    this.settingsChevron = null;
    this.underwearToggle = null;
    this.armorToggle = null;
    this.weaponsToggle = null;
    this.replaceRealAvatarToggle = null;
    this.equippedContainer = null;
    this.outfitsContainer = null;
    this.outfitForm = null;
    this.form = null;
    this.listContainer = null;
    this.portraitWrapper = null;
    this.portraitImage = null;
    this.portraitPlaceholder = null;
    this.portraitCorners = null;
    this.portraitFrame = null;
    this.connectorSvg = null;
    this.equippedSlotBoxRefs = null;
  },

  isOpen() {
    return this.isOpenFlag;
  },

  toggle() {
    if (this.isOpenFlag) this.close();
    else this.openPanel();
  },

  openPanel() {
    this.isOpenFlag = true;
    this._ensureRoot();
    this.root.classList.remove("qm-dock-collapsed");
    this._syncToggles();
    this.syncGeometry();
    if (!this.unsubscribe) {
      this.unsubscribe = QM.state.subscribe(() => this._paint());
      // Picks up server-side changes from the tracker agent, which has no
      // way to push an update to us — see QM.state.startPolling's comment.
      QM.state.startPolling();
    }
    QM.state.ensureLoaded();
    this._paint();
  },

  close() {
    this.isOpenFlag = false;
    this.selectedSlot = null;
    if (this.root) this.root.classList.add("qm-dock-collapsed");
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      QM.state.stopPolling();
    }
    this._syncToggles();
  },

  _syncToggles() {
    for (const button of document.querySelectorAll(".qm-launch")) {
      button.setAttribute("aria-pressed", this.isOpenFlag ? "true" : "false");
    }
  },

  isMobile() {
    return window.matchMedia("(max-width: 767px)").matches;
  },

  // The live roleplay chat area, not the viewport — keeps the dock from
  // drifting over the composer or off past the sidebar. Same selectors
  // Beholder's dock uses against this same host.
  getChatBounds() {
    const areas = Array.from(document.querySelectorAll(".rpg-chat-area"))
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 1 && rect.height > 1)
      .sort((left, right) => right.width * right.height - left.width * left.height);
    const rect = areas[0] || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    const topbar = document.querySelector('[data-component="TopBar"], header.mari-topbar');
    const topbarBottom = topbar ? topbar.getBoundingClientRect().bottom : rect.top;
    const top = Math.min(rect.bottom, Math.max(rect.top, topbarBottom));
    return { left: rect.left, top, right: rect.right, bottom: rect.bottom };
  },

  applyGeometry(geometry) {
    if (!this.root) return;
    this.root.style.setProperty("--qm-window-left", `${Math.round(geometry.left)}px`);
    this.root.style.setProperty("--qm-window-top", `${Math.round(geometry.top)}px`);
    this.root.style.setProperty("--qm-window-width", `${Math.round(geometry.width)}px`);
    this.root.style.setProperty("--qm-window-height", `${Math.round(geometry.height)}px`);
  },

  syncGeometry() {
    if (!this.root) return;
    const bounds = this.getChatBounds();
    this.root.style.setProperty("--qm-mobile-top", `${Math.round(bounds.top)}px`);
    if (this.isMobile()) return;

    const availableWidth = Math.max(1, bounds.right - bounds.left);
    const availableHeight = Math.max(1, bounds.bottom - bounds.top);
    const margin = Math.min(QM_WINDOW_MARGIN, availableWidth / 4, availableHeight / 4);
    const maxWidth = Math.max(1, availableWidth - margin * 2);
    const maxHeight = Math.max(1, availableHeight - margin * 2);
    const minWidth = Math.min(QM_WINDOW_MIN_WIDTH, maxWidth);
    const minHeight = Math.min(QM_WINDOW_MIN_HEIGHT, maxHeight);
    const width = qmClampWindowValue(this.geometry?.width ?? QM_WINDOW_DEFAULT_WIDTH, minWidth, maxWidth);
    const height = qmClampWindowValue(this.geometry?.height ?? QM_WINDOW_DEFAULT_HEIGHT, minHeight, maxHeight);
    const defaultLeft = bounds.right - margin - width;
    const defaultTop = bounds.top + margin;
    const left = qmClampWindowValue(
      this.geometry?.left ?? defaultLeft,
      bounds.left + margin,
      bounds.right - margin - width,
    );
    const top = qmClampWindowValue(
      this.geometry?.top ?? defaultTop,
      bounds.top + margin,
      bounds.bottom - margin - height,
    );
    this.geometry = { left, top, width, height };
    this.applyGeometry(this.geometry);
  },

  observeChatBounds() {
    if (typeof ResizeObserver !== "function") return;
    this._boundsObserver?.disconnect();
    this._boundsObserver = new ResizeObserver(() => this.syncGeometry());
    const area = Array.from(document.querySelectorAll(".rpg-chat-area")).find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1;
    });
    if (area) this._boundsObserver.observe(area);
    const main = document.querySelector(".mari-main");
    if (main && main !== area) this._boundsObserver.observe(main);
  },

  // Tracks the dock's own content width so the columns/ring can reflow as
  // it's resized, independent of the chat-bounds observer above (which
  // tracks where the dock is ALLOWED to be, not how wide it currently is).
  observeBodyWidth() {
    if (typeof ResizeObserver !== "function" || !this.body) return;
    this._bodyObserver?.disconnect();
    this._bodyObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (!width || Math.abs(width - this.bodyWidth) < 4) return;
      this.bodyWidth = width;
      this._applyResponsiveLayout();
    });
    this._bodyObserver.observe(this.body);
  },

  _zoomFactor() {
    return QM_UI_SIZES[this.uiSize] || 1;
  },

  // Cheap re-layout that doesn't touch QM.state — just toggles flex
  // direction on the stable, cached column/ring containers based on the
  // last measured body width. The ring's own middleRow is rebuilt on every
  // state repaint anyway (_buildEquippedSection), so it just reads
  // this.bodyWidth fresh each time rather than needing a matching toggle
  // here. Thresholds scale by the current zoom factor: at UI Size L,
  // zoomed content needs more real (unzoomed) body pixels to fit the same
  // logical layout, so the stack point has to move out to match, or L would
  // stack sooner than it actually needs to.
  _applyResponsiveLayout() {
    if (this.columns) {
      const stacked = this.bodyWidth < QM_DOCK_COLUMNS_STACK_WIDTH * this._zoomFactor();
      this.columns.style.flexDirection = stacked ? "column" : "row";
    }
    if (this.equippedContainer) {
      this.equippedContainer.replaceChildren(this._buildEquippedSection());
      requestAnimationFrame(() => this._updateConnectorLines());
    }
  },

  resizeBy(deltaWidth, deltaHeight) {
    if (this.isMobile()) return;
    this.syncGeometry();
    const bounds = this.getChatBounds();
    const geometry = this.geometry;
    if (!geometry) return;
    const margin = Math.min(QM_WINDOW_MARGIN, (bounds.right - bounds.left) / 4, (bounds.bottom - bounds.top) / 4);
    const maxWidth = Math.max(1, bounds.right - margin - geometry.left);
    const maxHeight = Math.max(1, bounds.bottom - margin - geometry.top);
    this.geometry = {
      ...geometry,
      width: qmClampWindowValue(geometry.width + deltaWidth, Math.min(QM_WINDOW_MIN_WIDTH, maxWidth), maxWidth),
      height: qmClampWindowValue(geometry.height + deltaHeight, Math.min(QM_WINDOW_MIN_HEIGHT, maxHeight), maxHeight),
    };
    this.applyGeometry(this.geometry);
    qmWriteWindowGeometry(this.geometry);
  },

  // Pointerdown-driven move (header) or resize (corner handle). Ported from
  // Beholder's dock almost verbatim — same host, same problem.
  startInteraction(kind, event) {
    if (this.isMobile() || event.button !== 0 || !this.root) return;
    const target = event.target instanceof Element ? event.target : null;
    if (kind === "move" && target?.closest("button, input, label, select, textarea, a")) return;
    event.preventDefault();
    this._interaction?.();

    const pointerId = event.pointerId;
    const startRect = this.root.getBoundingClientRect();
    const start = {
      x: event.clientX,
      y: event.clientY,
      left: startRect.left,
      top: startRect.top,
      width: startRect.width,
      height: startRect.height,
    };
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = kind === "move" ? "move" : "nwse-resize";
    document.body.style.userSelect = "none";
    this.root.classList.add(kind === "move" ? "qm-dock-dragging" : "qm-dock-resizing");

    const onMove = (moveEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const bounds = this.getChatBounds();
      const margin = Math.min(QM_WINDOW_MARGIN, (bounds.right - bounds.left) / 4, (bounds.bottom - bounds.top) / 4);
      const deltaX = moveEvent.clientX - start.x;
      const deltaY = moveEvent.clientY - start.y;
      if (kind === "move") {
        const left = qmClampWindowValue(start.left + deltaX, bounds.left + margin, bounds.right - margin - start.width);
        const top = qmClampWindowValue(start.top + deltaY, bounds.top + margin, bounds.bottom - margin - start.height);
        this.geometry = { left, top, width: start.width, height: start.height };
      } else {
        const maxWidth = Math.max(1, bounds.right - margin - start.left);
        const maxHeight = Math.max(1, bounds.bottom - margin - start.top);
        this.geometry = {
          left: start.left,
          top: start.top,
          width: qmClampWindowValue(start.width + deltaX, Math.min(QM_WINDOW_MIN_WIDTH, maxWidth), maxWidth),
          height: qmClampWindowValue(start.height + deltaY, Math.min(QM_WINDOW_MIN_HEIGHT, maxHeight), maxHeight),
        };
      }
      this.applyGeometry(this.geometry);
    };

    const finish = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      this.root?.classList.remove("qm-dock-dragging", "qm-dock-resizing");
      if (this.geometry) qmWriteWindowGeometry(this.geometry);
      this._interaction = null;
    };
    const onEnd = (endEvent) => {
      if (endEvent.pointerId === pointerId) finish();
    };
    this._interaction = finish;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  },

  _ensureRoot() {
    if (this.root && document.body.contains(this.root)) return;
    qmEnsureDockStyle();

    const root = document.createElement("div");
    root.id = "qm-dock-root";
    root.className = "qm-dock-collapsed";
    Object.assign(root.style, {
      flexDirection: "column",
      background: "var(--popover, #fff)",
      color: "var(--popover-foreground, #1a1a1a)",
      border: "1px solid var(--border, rgba(0,0,0,0.15))",
      borderRadius: "var(--radius, 8px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      zIndex: "9999",
      overflow: "hidden",
    });

    const header = document.createElement("div");
    header.id = "qm-dock-header";
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 10px",
      borderBottom: "1px solid var(--border, rgba(0,0,0,0.1))",
      fontWeight: "600",
      flexShrink: "0",
    });
    const title = document.createElement("span");
    title.textContent = "Quartermaster";
    const closeButton = QM.button("×", { bg: QM_COLOR_DANGER, fg: QM_COLOR_DANGER_FG });
    closeButton.setAttribute("aria-label", "Close Quartermaster");
    Object.assign(closeButton.style, { fontSize: "14px", lineHeight: "1", padding: "2px 8px" });
    closeButton.addEventListener("click", () => this.close());
    header.append(title, closeButton);
    header.addEventListener("pointerdown", (event) => this.startInteraction("move", event));

    const body = document.createElement("div");
    body.id = "qm-dock-body";
    Object.assign(body.style, {
      padding: "10px",
      overflowY: "auto",
      flex: "1",
      minHeight: "0",
    });

    const resizeHandle = document.createElement("button");
    resizeHandle.type = "button";
    resizeHandle.id = "qm-dock-resize-handle";
    resizeHandle.title = "Resize Quartermaster";
    resizeHandle.setAttribute("aria-label", "Resize Quartermaster");
    resizeHandle.addEventListener("pointerdown", (event) => this.startInteraction("resize", event));
    resizeHandle.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 48 : 16;
      const delta = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }[event.key];
      if (!delta) return;
      event.preventDefault();
      this.resizeBy(delta[0], delta[1]);
    });

    root.append(header, body, resizeHandle);
    document.body.appendChild(root);
    this.root = root;
    this.header = header;
    this.body = body;
    // A fresh body element means everything built for a previous root no
    // longer exists.
    this._resetCachedNodes();

    this.observeChatBounds();
    this.observeBodyWidth();
    if (!this._windowBound) {
      this._windowBound = true;
      let frame = 0;
      window.addEventListener("resize", () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          this.syncGeometry();
        });
      });
    }
    if (!this._outsideClickBound) {
      this._outsideClickBound = true;
      // Matches most other Marinara menus (and the original extension):
      // clicking anywhere outside the open dock closes it. Capture phase so
      // an intervening stopPropagation() elsewhere in the host can't hide a
      // click from this; pointerdown (not click) to match the drag/resize
      // handlers' own event choice and to close as soon as the press lands,
      // not after it releases. Two exclusions: mid-drag/resize (this
      // .root.contains would be true anyway since the pointer started
      // inside, but this also covers a resize handle drag that ends outside
      // the dock's own bounds), and the toolbar launch button itself — its
      // own click handler already toggles, so also closing here would
      // close-then-immediately-reopen instead of just toggling once.
      document.addEventListener(
        "pointerdown",
        (event) => {
          if (!this.isOpenFlag || this._interaction || !this.root) return;
          const target = event.target instanceof Element ? event.target : null;
          if (!target || this.root.contains(target) || target.closest(".qm-launch")) return;
          this.close();
        },
        true,
      );
    }
  },

  // Rebuilds only what changed. Forms are built once and left alone on every
  // repaint — rebuilding them on every add/delete/quantity change was wiping
  // out whatever the user had already typed, since a fresh <input> has no
  // value.
  _paint() {
    if (!this.body || !this.isOpenFlag) return;

    if (!QM.state.chatId) {
      this.body.replaceChildren(QM.textNode("No active chat."));
      this._resetCachedNodes();
      return;
    }

    if (!this.form || !this.body.contains(this.form)) {
      // Outside the zoom wrapper, so it stays a fixed-size, stable control
      // no matter what size it's currently set to.
      const uiSizeRow = this._buildUiSizeRow();
      const thumbnailSizeRow = this._buildThumbnailSizeRow();
      const sizeControlsRow = document.createElement("div");
      Object.assign(sizeControlsRow.style, {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "16px",
        marginBottom: "8px",
        flexShrink: "0",
      });
      sizeControlsRow.append(uiSizeRow, thumbnailSizeRow);

      this.zoomWrapper = document.createElement("div");

      this.errorNode = QM.textNode("");
      this.errorNode.style.color = QM_COLOR_DANGER;
      this.errorNode.style.display = "none";

      const feedRow = this._buildAppearanceFeedRow();
      this.settingsSection = this._buildSettingsSection();

      // Built once and cached — the ring layout re-inserts this same node on
      // every repaint instead of rebuilding it, so equipping/unequipping
      // something doesn't reset or reload the portrait <img>.
      this.portraitWrapper = this._buildPortrait();

      const columns = document.createElement("div");
      columns.id = "qm-dock-columns";
      Object.assign(columns.style, {
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        flexDirection: this.bodyWidth < QM_DOCK_COLUMNS_STACK_WIDTH * this._zoomFactor() ? "column" : "row",
      });
      this.columns = columns;

      // Left: Outfits. Center: portrait ring. Right: Bag/Inventory.
      const outfitsColumn = document.createElement("div");
      Object.assign(outfitsColumn.style, { flex: "1", minWidth: "0", width: "100%" });
      this.outfitsContainer = document.createElement("div");
      this.outfitForm = this._buildSaveOutfitForm();
      outfitsColumn.append(QM.sectionHeading("Outfits"), this.outfitForm, this.outfitsContainer);

      const equippedColumn = document.createElement("div");
      Object.assign(equippedColumn.style, { flex: "1.6", minWidth: "0", width: "100%" });
      const equippedHeadingRow = document.createElement("div");
      Object.assign(equippedHeadingRow.style, {
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: "6px",
      });
      const equippedHeadingSpacer = document.createElement("span");
      const unequipAllButton = QM.button("Unequip All", {
        bg: "var(--secondary, transparent)",
        fg: "var(--secondary-foreground, inherit)",
        border: true,
      });
      unequipAllButton.addEventListener("click", () => QM.state.unequipAll());
      equippedHeadingRow.append(equippedHeadingSpacer, QM.sectionHeading("Equipped"), unequipAllButton);
      this.equippedContainer = document.createElement("div");
      equippedColumn.append(equippedHeadingRow, this.equippedContainer);

      const bagColumn = document.createElement("div");
      Object.assign(bagColumn.style, { flex: "1", minWidth: "0", width: "100%" });
      this.form = this._buildAddItemForm();
      this.listContainer = document.createElement("div");
      bagColumn.append(QM.sectionHeading("Bag"), this.form, this.listContainer);

      columns.append(outfitsColumn, equippedColumn, bagColumn);
      this.zoomWrapper.append(this.errorNode, feedRow, this.settingsSection, columns);
      this.body.replaceChildren(sizeControlsRow, this.zoomWrapper);
      this._applyUiSize();
      this._applyThumbnailSize();
    }

    if (QM.state.error) {
      this.errorNode.textContent = `Error: ${QM.state.error}`;
      this.errorNode.style.display = "";
    } else {
      this.errorNode.style.display = "none";
    }

    this.feedSelect.value = QM.state.appearanceFeedMode;
    this.underwearToggle.checked = QM.state.showUnderwear;
    this.armorToggle.checked = QM.state.showArmor;
    this.weaponsToggle.checked = QM.state.showWeapons;
    this.replaceRealAvatarToggle.checked = QM.state.replaceRealAvatarOnEquip;
    // display was previously only set once at _buildPortrait()'s construction
    // time, from whatever hasAvatar was at mount — harmless while the only
    // input was the persona's own avatar (rarely changes mid-session), but
    // outfit-portrait swapping changes this input constantly, so both the
    // src and the image/placeholder toggle need to be live here, not just src.
    const portraitUrl = QM.state.activeOutfitPortraitUrl() || QM.state.personaAvatarUrl;
    if (this.portraitImage && this.portraitPlaceholder) {
      this.portraitImage.style.display = portraitUrl ? "block" : "none";
      this.portraitPlaceholder.style.display = portraitUrl ? "none" : "flex";
      if (portraitUrl) this.portraitImage.src = portraitUrl;
      // Scales with Thumbnail Size same as item/outfit thumbnails, relative
      // to the 160x200 / 120x120 box _buildPortrait() sized at "M" — live
      // here (not just at _buildPortrait()'s one-time construction) since a
      // size change repaints without rebuilding the cached portrait nodes.
      const portraitScale = QM_PORTRAIT_SCALE[this.thumbnailSize];
      this.portraitImage.style.maxWidth = `${Math.round(160 * portraitScale)}px`;
      this.portraitImage.style.maxHeight = `${Math.round(200 * portraitScale)}px`;
      this.portraitPlaceholder.style.width = `${Math.round(120 * portraitScale)}px`;
      this.portraitPlaceholder.style.height = `${Math.round(120 * portraitScale)}px`;
      if (this.portraitCorners) {
        const cornerSize = qmPortraitCornerSize(portraitScale);
        for (const corner of this.portraitCorners) {
          corner.style.width = `${cornerSize}px`;
          corner.style.height = `${cornerSize}px`;
        }
      }
    }
    this.equippedContainer.replaceChildren(this._buildEquippedSection());
    requestAnimationFrame(() => this._updateConnectorLines());
    this.outfitsContainer.replaceChildren(this._buildOutfitsList());
    this.listContainer.replaceChildren(this._buildItemList());
  },

  _buildAppearanceFeedRow() {
    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginBottom: "8px",
      fontSize: "12px",
    });

    const label = document.createElement("span");
    label.textContent = "Feed appearance:";
    label.style.color = "var(--muted-foreground, currentcolor)";

    const select = QM.smallInput("select");
    select.style.flex = "1";
    for (const option of QM_APPEARANCE_FEED_OPTIONS) {
      const optionEl = document.createElement("option");
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      select.appendChild(optionEl);
    }
    select.addEventListener("change", () => QM.state.updateAppearanceFeedMode(select.value));
    this.feedSelect = select;

    row.append(label, select);
    return row;
  },

  // Fixed-size (outside the zoom wrapper) so the size control itself
  // doesn't grow/shrink along with everything it controls. The active size
  // gets QM.button's primary fill; the other two stay neutral outlines —
  // reapplied by _applyUiSize rather than baked in here, so a size change
  // can update the same buttons in place without rebuilding them.
  _buildUiSizeRow() {
    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      flexShrink: "0",
    });

    const label = document.createElement("span");
    label.textContent = "UI Size:";
    label.style.color = "var(--muted-foreground, currentcolor)";
    row.appendChild(label);

    this.uiSizeButtons = {};
    for (const size of Object.keys(QM_UI_SIZES)) {
      const button = QM.button(size);
      button.style.padding = "2px 10px";
      button.addEventListener("click", () => this._setUiSize(size));
      this.uiSizeButtons[size] = button;
      row.appendChild(button);
    }
    return row;
  },

  _setUiSize(size) {
    if (!QM_UI_SIZES[size] || this.uiSize === size) return;
    this.uiSize = size;
    qmWriteUiSize(size);
    this._applyUiSize();
    // The zoom factor changed, which shifts the outfits/equipped/bag
    // columns' own stack threshold (_applyResponsiveLayout reads it) even
    // though the real body width didn't move.
    this._applyResponsiveLayout();
  },

  _applyUiSize() {
    if (this.zoomWrapper) this.zoomWrapper.style.zoom = this._zoomFactor();
    for (const [size, button] of Object.entries(this.uiSizeButtons || {})) {
      const active = size === this.uiSize;
      button.style.background = active ? "var(--primary, #444)" : "var(--secondary, transparent)";
      button.style.color = active ? "var(--primary-foreground, #fff)" : "var(--secondary-foreground, inherit)";
      button.style.border = active ? "none" : "1px solid var(--border, rgba(0,0,0,0.2))";
    }
  },

  // Controls the pixel box size of outfit portrait thumbnails and item
  // placeholder images — separate from UI Size (that's a CSS zoom over the
  // whole dock; this only affects how much room images take up in each
  // card). Outfit/item cards already get rebuilt on every repaint, so a
  // size change just triggers a full repaint rather than a live style patch.
  _buildThumbnailSizeRow() {
    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      flexShrink: "0",
    });

    const label = document.createElement("span");
    label.textContent = "Thumbnail Size:";
    label.style.color = "var(--muted-foreground, currentcolor)";
    row.appendChild(label);

    this.thumbnailSizeButtons = {};
    for (const size of Object.keys(QM_THUMBNAIL_SIZES)) {
      const button = QM.button(size);
      button.style.padding = "2px 10px";
      button.addEventListener("click", () => this._setThumbnailSize(size));
      this.thumbnailSizeButtons[size] = button;
      row.appendChild(button);
    }
    return row;
  },

  _setThumbnailSize(size) {
    if (!QM_THUMBNAIL_SIZES[size] || this.thumbnailSize === size) return;
    this.thumbnailSize = size;
    qmWriteThumbnailSize(size);
    this._applyThumbnailSize();
    this._paint();
  },

  _applyThumbnailSize() {
    for (const [size, button] of Object.entries(this.thumbnailSizeButtons || {})) {
      const active = size === this.thumbnailSize;
      button.style.background = active ? "var(--primary, #444)" : "var(--secondary, transparent)";
      button.style.color = active ? "var(--primary-foreground, #fff)" : "var(--secondary-foreground, inherit)";
      button.style.border = active ? "none" : "1px solid var(--border, rgba(0,0,0,0.2))";
    }
  },

  // A collapsible wrapper (chevron + label, click to expand) around the
  // slot-visibility toggles — collapsed by default to keep the dock compact
  // when there's nothing to configure. Built once; the toggle checkboxes
  // inside get their checked state synced every repaint (_paint), same as
  // the other cached form-like controls.
  _buildSettingsSection() {
    const section = document.createElement("div");
    Object.assign(section.style, {
      border: "1px solid var(--border, rgba(128,128,128,0.3))",
      borderRadius: "var(--radius, 4px)",
      marginBottom: "8px",
      overflow: "hidden",
    });

    const header = document.createElement("button");
    header.type = "button";
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      width: "100%",
      padding: "6px 8px",
      background: "var(--secondary, transparent)",
      color: "inherit",
      border: "none",
      font: "inherit",
      textAlign: "left",
      cursor: "pointer",
    });

    const chevron = document.createElement("span");
    chevron.textContent = "▸";
    Object.assign(chevron.style, {
      display: "inline-block",
      transition: "transform 0.15s ease",
      transform: this.settingsExpanded ? "rotate(90deg)" : "rotate(0deg)",
    });
    this.settingsChevron = chevron;

    const label = document.createElement("span");
    label.textContent = "Settings";
    Object.assign(label.style, {
      fontWeight: "600",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    });

    header.append(chevron, label);
    header.addEventListener("click", () => {
      this.settingsExpanded = !this.settingsExpanded;
      this.settingsContent.style.maxHeight = this.settingsExpanded ? "320px" : "0px";
      this.settingsChevron.style.transform = this.settingsExpanded ? "rotate(90deg)" : "rotate(0deg)";
    });

    // max-height + overflow:hidden, not display:none/"" — display can't be
    // transitioned, so the section used to snap open/closed instantly. 320px
    // is a generous ceiling for the current content (slot toggles, the
    // real-avatar toggle + its warning note, export/import); it doesn't need
    // to track real content height since it's never the constraining factor
    // once expanded.
    const content = document.createElement("div");
    Object.assign(content.style, {
      padding: "0 8px",
      maxHeight: this.settingsExpanded ? "320px" : "0px",
      overflow: "hidden",
      transition: "max-height 0.2s ease",
    });
    content.appendChild(this._buildSlotVisibilityRow());
    content.appendChild(this._buildRealAvatarToggleRow());
    content.appendChild(this._buildExportImportRow());
    this.settingsContent = content;

    section.append(header, content);
    return section;
  },

  // Portable character sheet: export the current chat's items/outfits/
  // settings as a downloadable file, or replace them by importing one back —
  // in a fresh chat this needs no tracker agent enabled at all, matching the
  // original extension's own export/import.
  _buildExportImportRow() {
    const row = document.createElement("div");
    Object.assign(row.style, { display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" });

    const exportButton = QM.button("Export…", {
      bg: "var(--secondary, transparent)",
      fg: "var(--secondary-foreground, inherit)",
      border: true,
    });
    exportButton.addEventListener("click", async () => {
      exportButton.disabled = true;
      try {
        const payload = await QM.state.exportInventory();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const personaSlug = qmFilenameSafe(payload.personaName);
        const datePart = new Date().toISOString().slice(0, 10);
        link.download = `quartermaster-inventory-${personaSlug ? `${personaSlug}-` : ""}${datePart}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } finally {
        exportButton.disabled = false;
      }
    });

    const importButton = QM.button("Import…", {
      bg: "var(--secondary, transparent)",
      fg: "var(--secondary-foreground, inherit)",
      border: true,
    });
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.style.display = "none";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (!file) return;
      const hasExistingData = (QM.state.items ?? []).length > 0 || (QM.state.outfits ?? []).length > 0;
      if (hasExistingData && !window.confirm("Importing replaces this chat's current items and outfits. Continue?")) {
        return;
      }
      let payload;
      try {
        payload = JSON.parse(await file.text());
      } catch {
        QM.state.error = "That file isn't valid JSON.";
        QM.state._notify();
        return;
      }
      await QM.state.importInventory(payload);
    });
    importButton.addEventListener("click", () => fileInput.click());

    row.append(exportButton, importButton, fileInput);
    return row;
  },

  // A single row, one checkbox per group: "Show Slots: [ ] Underwear
  // [ ] Armor [ ] Weapons". Matches the original extension's SLOT_GROUPS
  // convention — armor, underwear, and weapon are the only groups with a
  // toggle, everything else is always on. A group hidden here removes its
  // slots from both the portrait ring and the equip picker (07-ui.js's
  // defaultSlotSelect), not just a cosmetic hide — see
  // QM.state.groupVisible/slotVisible.
  _buildSlotVisibilityRow() {
    const row = document.createElement("div");
    Object.assign(row.style, {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "10px",
      fontSize: "12px",
    });

    const label = document.createElement("span");
    label.textContent = "Show Slots:";
    label.style.color = "var(--muted-foreground, currentcolor)";
    row.appendChild(label);

    const build = (labelText, onChange) => {
      const checkboxLabel = document.createElement("label");
      Object.assign(checkboxLabel.style, { display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" });
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.addEventListener("change", () => onChange(checkbox.checked));
      const text = document.createElement("span");
      text.textContent = labelText;
      checkboxLabel.append(checkbox, text);
      return { label: checkboxLabel, checkbox };
    };

    const underwear = build("Underwear", (value) => QM.state.updateShowUnderwear(value));
    this.underwearToggle = underwear.checkbox;
    const armor = build("Armor", (value) => QM.state.updateShowArmor(value));
    this.armorToggle = armor.checkbox;
    const weapons = build("Weapons", (value) => QM.state.updateShowWeapons(value));
    this.weaponsToggle = weapons.checkbox;

    row.append(underwear.label, armor.label, weapons.label);
    return row;
  },

  // Opt-in, default-off: also push the active outfit's portrait to the
  // persona's REAL avatar (not just this dock's own display), reverting to
  // whatever it was before when unequipped. Two costs worth surfacing right
  // here rather than only in the README, since this toggle is the one place
  // a user decides to take them on: (1) the Engine keeps a permanent version
  // history entry on every avatar change — no way to suppress it; (2) other
  // Marinara UI showing the persona's avatar (chat header, persona picker)
  // may take a while to visually catch up, per a known Engine-side caching
  // behavior — generation-time reads (e.g. "send avatar as reference") are
  // unaffected, this dock's own portrait display is unaffected either way.
  _buildRealAvatarToggleRow() {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, { marginTop: "8px", fontSize: "12px" });

    const checkboxLabel = document.createElement("label");
    Object.assign(checkboxLabel.style, { display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" });
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => QM.state.updateReplaceRealAvatarOnEquip(checkbox.checked));
    const text = document.createElement("span");
    text.textContent = "Also replace persona's real avatar on equip";
    checkboxLabel.append(checkbox, text);
    this.replaceRealAvatarToggle = checkbox;

    const note = document.createElement("p");
    note.textContent =
      "Reverts automatically when unequipped. Each change adds a permanent entry to the persona's " +
      "version history (can't be turned off), and other Marinara screens showing this avatar may take " +
      "a bit to catch up visually — image generation itself isn't affected.";
    Object.assign(note.style, {
      margin: "4px 0 0",
      fontSize: "11px",
      color: "var(--muted-foreground, currentcolor)",
    });

    wrapper.append(checkboxLabel, note);
    return wrapper;
  },

  // Built once (like the forms) and cached on this.portraitImage/
  // this.portraitPlaceholder so a refreshed avatar can be applied live
  // without a repaint — see render()'s own comment on why both need their
  // display toggled on every render now, not just src. Shows the active
  // outfit's own portrait when one's set (QM.state.activeOutfitPortraitUrl),
  // falling back to the persona's real avatar otherwise.
  _buildPortrait() {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      display: "flex",
      justifyContent: "center",
      marginBottom: "8px",
      position: "relative",
    });

    // No fixed box — the frame just centers whatever's inside it. A fixed
    // square with object-fit: cover was cropping non-square avatars; capping
    // width/height on the <img> itself and letting it size naturally (below)
    // shows the whole portrait at its real aspect ratio instead. The frame
    // itself (not the image/placeholder) carries QM_PORTRAIT_FRAME_STYLE now
    // — see that constant's own comment for why.
    const frame = document.createElement("div");
    Object.assign(frame.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...QM_PORTRAIT_FRAME_STYLE,
    });
    // Measured by _updateConnectorLines to find where the connector lines
    // should actually terminate — the frame is the real visual boundary
    // (border, clip-path corners), not `wrapper`, which also contains the
    // corner ornaments sitting outside that boundary.
    this.portraitFrame = frame;

    const image = document.createElement("img");
    image.alt = "Persona portrait";
    const hasAvatar = Boolean(QM.state.personaAvatarUrl);
    // QM_PORTRAIT_SCALE, not QM_THUMBNAIL_SIZES directly — the portrait
    // needs to scale much more aggressively per size than item/outfit
    // thumbnails do, since 5 slot-box pairs need real vertical room beside
    // it not to overlap at S/M. See QM_PORTRAIT_SCALE's own comment.
    const portraitScale = QM_PORTRAIT_SCALE[this.thumbnailSize];
    Object.assign(image.style, {
      maxWidth: `${Math.round(160 * portraitScale)}px`,
      maxHeight: `${Math.round(200 * portraitScale)}px`,
      width: "auto",
      height: "auto",
      objectFit: "contain",
      display: hasAvatar ? "block" : "none",
    });
    if (hasAvatar) image.src = QM.state.personaAvatarUrl;
    this.portraitImage = image;

    const placeholder = document.createElement("span");
    placeholder.textContent = "No portrait";
    Object.assign(placeholder.style, {
      width: `${Math.round(120 * portraitScale)}px`,
      height: `${Math.round(120 * portraitScale)}px`,
      background: "var(--muted, rgba(128,128,128,0.15))",
      display: hasAvatar ? "none" : "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "11px",
      color: "var(--muted-foreground, currentcolor)",
    });
    image.addEventListener("error", () => {
      image.style.display = "none";
      placeholder.style.display = "flex";
      requestAnimationFrame(() => this._updateConnectorLines());
    });
    image.addEventListener("load", () => {
      image.style.display = "block";
      placeholder.style.display = "none";
      // The one geometry change that doesn't go through a full
      // _buildEquippedSection() rebuild — a freshly loaded avatar can change
      // the frame's rendered size (different aspect ratio than whatever was
      // showing before), so the connector lines need their own explicit
      // recompute here.
      requestAnimationFrame(() => this._updateConnectorLines());
    });
    this.portraitPlaceholder = placeholder;

    frame.append(image, placeholder);
    const cornerSize = qmPortraitCornerSize(portraitScale);
    this.portraitCorners = [
      qmBuildPortraitCornerAccent("top left", cornerSize),
      qmBuildPortraitCornerAccent("top right", cornerSize),
      qmBuildPortraitCornerAccent("bottom left", cornerSize),
      qmBuildPortraitCornerAccent("bottom right", cornerSize),
    ];
    wrapper.append(frame, ...this.portraitCorners);
    return wrapper;
  },

  // Head/Eyes/Ears/Neck sit in a row above the portrait, Belt/Feet below —
  // beside it. The remaining 5 pairs (QM_OVERLAY_SLOT_PAIRS) sit in columns
  // to either side, stretched (alignItems: "stretch" on middleRow) to match
  // whatever the portrait's own real rendered height turns out to be, then
  // spread evenly across that matched height (space-between) — there's no
  // way to pin a slot to a real anatomical position without pose analysis,
  // since personas vary in aspect ratio, so this is the practical
  // alternative. `this.portraitWrapper` itself is cached/reused (not
  // rebuilt here) so the avatar <img> element survives every repaint.
  _buildEquippedSection() {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      alignItems: "center",
      position: "relative",
    });

    // Reset fresh each rebuild — _buildOverlaySlotBox populates this as it
    // creates each box, keyed by slot, so _updateConnectorLines knows which
    // element to measure and which frame edge it should reach toward without
    // re-deriving "which side is this slot on" from scratch every time.
    this.equippedSlotBoxRefs = new Map();

    // Painted first so slot boxes/portrait (opaque, drawn after in DOM
    // order) sit visually on top of the lines rather than the lines
    // crossing over them — only the small connection nodes are meant to
    // read as touching an edge. Absolutely positioned to fill `wrapper`
    // exactly (inset: 0), remeasured by _updateConnectorLines once real
    // layout exists — building the lines here would just measure zeros,
    // since nothing's attached to the document yet at this point.
    const connectorSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // width/height: 100% is load-bearing, not redundant with inset: 0 — SVG
    // is a replaced element, and a replaced element's auto-height under
    // position:absolute falls back to its intrinsic size (an SVG's default
    // is literally 300x150, the same classic default <canvas> has) rather
    // than actually stretching to the containing block the way an ordinary
    // div would. Confirmed live in _planning/scratch/connector-lines-lab.html
    // — inset: 0 alone silently clipped every line past the first ~150px.
    Object.assign(connectorSvg.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    });
    this.connectorSvg = connectorSvg;
    wrapper.appendChild(connectorSvg);

    const topRow = document.createElement("div");
    Object.assign(topRow.style, { display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" });
    for (const slot of QM_OVERLAY_TOP_SLOTS) {
      const box = this._buildOverlaySlotBox(slot);
      this.equippedSlotBoxRefs.set(slot, { element: box, side: "top" });
      topRow.appendChild(box);
    }
    wrapper.appendChild(topRow);

    const middleRow = document.createElement("div");
    Object.assign(middleRow.style, {
      display: "flex",
      gap: "8px",
      alignItems: "stretch",
      justifyContent: "center",
      width: "100%",
    });

    const leftColumn = document.createElement("div");
    Object.assign(leftColumn.style, { display: "flex", flexDirection: "column", justifyContent: "space-between" });
    const rightColumn = document.createElement("div");
    Object.assign(rightColumn.style, { display: "flex", flexDirection: "column", justifyContent: "space-between" });
    for (const [leftSlot, rightSlot] of QM_OVERLAY_SLOT_PAIRS) {
      // A pair always shares one group (or neither has one) — see
      // QM_OVERLAY_SLOT_PAIRS's own comment — so checking the left slot
      // alone is enough to decide the whole row.
      if (!QM.state.slotVisible(leftSlot)) continue;
      const leftBox = this._buildOverlaySlotBox(leftSlot);
      const rightBox = this._buildOverlaySlotBox(rightSlot);
      this.equippedSlotBoxRefs.set(leftSlot, { element: leftBox, side: "left" });
      this.equippedSlotBoxRefs.set(rightSlot, { element: rightBox, side: "right" });
      leftColumn.appendChild(leftBox);
      rightColumn.appendChild(rightBox);
    }

    middleRow.append(leftColumn, this.portraitWrapper, rightColumn);
    wrapper.appendChild(middleRow);

    const bottomRow = document.createElement("div");
    Object.assign(bottomRow.style, { display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" });
    for (const slot of QM_OVERLAY_BOTTOM_SLOTS) {
      const box = this._buildOverlaySlotBox(slot);
      this.equippedSlotBoxRefs.set(slot, { element: box, side: "bottom" });
      bottomRow.appendChild(box);
    }
    wrapper.appendChild(bottomRow);

    return wrapper;
  },

  // Called (via requestAnimationFrame, so real layout exists) after every
  // _buildEquippedSection() attach, after a Thumbnail Size change, and after
  // the portrait image itself finishes loading (the one case that changes
  // the frame's rendered size without going through a full section
  // rebuild). Fully rebuilds the connector SVG's contents every time rather
  // than trying to incrementally patch it — geometry can change for enough
  // different reasons (selection, equip state, resize, image load) that a
  // full recompute is simpler and cheap enough at this scale (≤16 slots).
  _updateConnectorLines() {
    const svg = this.connectorSvg;
    const frame = this.portraitFrame;
    if (!svg || !frame || !svg.isConnected) return;
    const containerRect = svg.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return;
    svg.setAttribute("width", String(containerRect.width));
    svg.setAttribute("height", String(containerRect.height));
    svg.replaceChildren();

    // Frame edges in container-relative coordinates.
    const frameLeft = frameRect.left - containerRect.left;
    const frameTop = frameRect.top - containerRect.top;
    const frameRight = frameLeft + frameRect.width;
    const frameBottom = frameTop + frameRect.height;

    // Boxes on the same side are distributed across the matching frame edge
    // in the same relative order they appear on screen (top-to-bottom for
    // the side columns, left-to-right for the top/bottom rows) — a fan of
    // distinct connection points, not every line converging on one spot.
    const bySide = { top: [], bottom: [], left: [], right: [] };
    for (const [slot, ref] of this.equippedSlotBoxRefs) {
      if (!ref.element.isConnected) continue;
      bySide[ref.side].push({ slot, rect: ref.element.getBoundingClientRect() });
    }
    bySide.top.sort((a, b) => a.rect.left - b.rect.left);
    bySide.bottom.sort((a, b) => a.rect.left - b.rect.left);
    bySide.left.sort((a, b) => a.rect.top - b.rect.top);
    bySide.right.sort((a, b) => a.rect.top - b.rect.top);

    const qmFrameSpread = (list, from, to) =>
      list.map((entry, index) => from + ((to - from) * (index + 1)) / (list.length + 1));

    const topPoints = qmFrameSpread(bySide.top, frameLeft + 6, frameRight - 6);
    const bottomPoints = qmFrameSpread(bySide.bottom, frameLeft + 6, frameRight - 6);
    const leftPoints = qmFrameSpread(bySide.left, frameTop + 6, frameBottom - 6);
    const rightPoints = qmFrameSpread(bySide.right, frameTop + 6, frameBottom - 6);

    const qmDrawConnector = (slot, boxX, boxY, frameX, frameY) => {
      const selected = this.selectedSlot === slot;
      const opacity = selected ? 0.85 : 0.32;
      const midX = (boxX + frameX) / 2;
      const midY = (boxY + frameY) / 2;
      // A gentle bow rather than a straight segment — offset the midpoint
      // perpendicular to the line's own direction, scaled down for short
      // lines so it never overshoots into a visible kink.
      const dx = frameX - boxX;
      const dy = frameY - boxY;
      const length = Math.hypot(dx, dy) || 1;
      const bow = Math.min(10, length * 0.12);
      const curveX = midX + (-dy / length) * bow;
      const curveY = midY + (dx / length) * bow;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${boxX} ${boxY} Q ${curveX} ${curveY} ${frameX} ${frameY}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "var(--primary, #7a5cff)");
      path.setAttribute("stroke-width", selected ? "1.6" : "1");
      path.setAttribute("opacity", String(opacity));
      svg.appendChild(path);

      for (const [x, y] of [
        [boxX, boxY],
        [frameX, frameY],
      ]) {
        const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        node.setAttribute("cx", String(x));
        node.setAttribute("cy", String(y));
        node.setAttribute("r", selected ? "2.4" : "1.8");
        node.setAttribute("fill", "var(--primary, #7a5cff)");
        node.setAttribute("opacity", String(opacity));
        svg.appendChild(node);
      }
    };

    for (const [slot, ref] of this.equippedSlotBoxRefs) {
      if (!ref.element.isConnected) continue;
      const box = ref.element.getBoundingClientRect();
      const boxX = box.left - containerRect.left + box.width / 2;
      const boxY = box.top - containerRect.top + box.height / 2;
      if (ref.side === "top") {
        const index = bySide.top.findIndex((entry) => entry.slot === slot);
        qmDrawConnector(slot, boxX, box.bottom - containerRect.top, topPoints[index], frameTop);
      } else if (ref.side === "bottom") {
        const index = bySide.bottom.findIndex((entry) => entry.slot === slot);
        qmDrawConnector(slot, boxX, box.top - containerRect.top, bottomPoints[index], frameBottom);
      } else if (ref.side === "left") {
        const index = bySide.left.findIndex((entry) => entry.slot === slot);
        qmDrawConnector(slot, box.right - containerRect.left, boxY, frameLeft, leftPoints[index]);
      } else if (ref.side === "right") {
        const index = bySide.right.findIndex((entry) => entry.slot === slot);
        qmDrawConnector(slot, box.left - containerRect.left, boxY, frameRight, rightPoints[index]);
      }
    }
  },

  // One equip-slot overlay box, in one of three visual states: empty
  // (neutral border), equipped (theme-accent border — QM.button()'s own
  // default fill, matching the Equip button beside it), or selected
  // (stronger accent + glow, this.selectedSlot === slot — set by clicking
  // the box body). Selecting reveals the bag picker inline, whether the
  // slot's empty or already occupied (swap, not just fill); an equipped
  // slot always shows a small "×" badge to unequip directly, whether
  // selected or not. Dark/semi-transparent regardless of the app's own
  // light/dark theme — this sits on top of a persona photo of unknown
  // brightness, so it needs its own reliable contrast rather than following
  // var(--card)/var(--foreground), the same reasoning a photo-overlay
  // caption uses. The icon area shows the equipped item's own image when it
  // has one (same by-name lookup item cards use), falling back to a plain
  // slot pictogram (QM.buildSlotIcon) both when empty and when an equipped
  // item has no matching image.
  _buildOverlaySlotBox(slot) {
    const equippedItem = QM.state.itemInSlot(slot);
    const selected = this.selectedSlot === slot;

    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "2px",
      width: "92px",
      padding: "5px 6px",
      borderRadius: "var(--radius, 4px)",
      cursor: "pointer",
      boxSizing: "border-box",
      pointerEvents: "auto",
      background: "rgba(15, 15, 18, 0.72)",
      color: "#f2f2f2",
      ...(selected
        ? {
            border: "2px solid var(--ring, var(--primary, #444))",
            boxShadow: "0 0 8px color-mix(in srgb, var(--primary, #444) 55%, transparent)",
          }
        : equippedItem
          ? { border: "1px solid var(--primary, #444)" }
          : { border: "1px solid rgba(255, 255, 255, 0.22)" }),
    });
    box.addEventListener("click", (event) => {
      if (event.target.closest("[data-qm-unequip]")) return; // the × badge handles its own click
      this.selectedSlot = selected ? null : slot;
      this._paint();
    });

    const iconSize = 32;
    const imageWrap = document.createElement("div");
    Object.assign(imageWrap.style, {
      width: `${iconSize}px`,
      height: `${iconSize}px`,
      borderRadius: "var(--radius, 4px)",
      overflow: "hidden",
      background: "rgba(255, 255, 255, 0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(255, 255, 255, 0.55)",
      flexShrink: "0",
    });
    if (equippedItem) {
      // Same by-name image lookup item cards use (QM.itemImageUrl). On a
      // 404 (no matching image, uploaded or pack), falls back to the
      // slot's own plain pictogram rather than leaving the box empty.
      const img = document.createElement("img");
      img.alt = equippedItem.name;
      Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover", display: "block" });
      img.addEventListener("error", () => {
        img.remove();
        imageWrap.appendChild(QM.buildSlotIconRaster(slot, iconSize - 6));
      });
      img.src = QM.itemImageUrl(QM.state.chatId, QM_OWNER_ID, equippedItem.id);
      imageWrap.appendChild(img);
    } else {
      imageWrap.appendChild(QM.buildSlotIconRaster(slot, iconSize - 6));
    }
    box.appendChild(imageWrap);

    // Pre-split into explicit lines (QM_OVERLAY_SLOT_LABEL_LINES), not left
    // to natural wrapping — see that constant's own comment for why: at a
    // fixed box width, different first-word lengths wrapped inconsistently
    // between a pair's two labels, throwing the two columns out of
    // alignment with each other.
    const label = document.createElement("span");
    Object.assign(label.style, {
      fontSize: "9px",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      lineHeight: "1.2",
      color: "rgba(255, 255, 255, 0.75)",
    });
    const labelLines = QM_OVERLAY_SLOT_LABEL_LINES[slot];
    labelLines.forEach((line, index) => {
      if (index > 0) label.appendChild(document.createElement("br"));
      label.appendChild(document.createTextNode(line));
    });
    box.appendChild(label);

    const status = document.createElement("span");
    status.textContent = equippedItem ? equippedItem.name : "Empty";
    if (equippedItem) status.title = equippedItem.name;
    Object.assign(status.style, {
      fontSize: "10px",
      fontWeight: equippedItem ? "600" : "400",
      fontStyle: equippedItem ? "normal" : "italic",
      textAlign: "center",
      maxWidth: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: equippedItem ? "#f2f2f2" : "rgba(255, 255, 255, 0.5)",
    });
    box.appendChild(status);

    if (equippedItem) {
      const unequipButton = document.createElement("button");
      unequipButton.type = "button";
      unequipButton.dataset.qmUnequip = "true";
      unequipButton.textContent = "×";
      const unequipLabel = `Unequip ${QM_OVERLAY_SLOT_LABELS[slot]}`;
      unequipButton.title = unequipLabel;
      unequipButton.setAttribute("aria-label", unequipLabel);
      Object.assign(unequipButton.style, {
        position: "absolute",
        top: "-6px",
        right: "-6px",
        width: "16px",
        height: "16px",
        lineHeight: "14px",
        padding: "0",
        fontSize: "12px",
        borderRadius: "50%",
        cursor: "pointer",
        background: QM_COLOR_DANGER,
        color: QM_COLOR_DANGER_FG,
        border: "none",
      });
      unequipButton.addEventListener("click", () => {
        QM.state.updateItem(equippedItem.id, { location: "bag" });
        if (selected) this.selectedSlot = null;
      });
      box.appendChild(unequipButton);
    }

    if (selected) {
      const bagItems = QM.state.bagItems();
      const select = document.createElement("select");
      select.disabled = bagItems.length === 0;
      select.addEventListener("click", (event) => event.stopPropagation()); // don't toggle selection off under the open dropdown
      Object.assign(select.style, {
        width: "100%",
        marginTop: "2px",
        fontSize: "9px",
        boxSizing: "border-box",
        borderRadius: "3px",
        background: "rgba(255, 255, 255, 0.1)",
        color: "#f2f2f2",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        colorScheme: "dark",
      });
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = bagItems.length === 0 ? "(bag empty)" : "Equip…";
      select.appendChild(placeholderOption);
      for (const item of bagItems) {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
      }
      select.addEventListener("change", () => {
        const itemId = select.value;
        if (itemId) {
          QM.state.updateItem(itemId, { location: `equipped:${slot}` });
          this.selectedSlot = null;
        }
      });
      box.appendChild(select);
    }

    return box;
  },

  _buildSaveOutfitForm() {
    const form = document.createElement("form");
    Object.assign(form.style, { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "8px" });

    const line = document.createElement("div");
    Object.assign(line.style, { display: "flex", gap: "6px" });

    const nameInput = QM.smallInput("input");
    nameInput.type = "text";
    nameInput.placeholder = "Save current as outfit…";
    nameInput.required = true;
    nameInput.style.flex = "1";

    const saveButton = QM.button("Save", { bg: QM_COLOR_SUCCESS, fg: QM_COLOR_SUCCESS_FG });
    saveButton.type = "submit";

    line.append(nameInput, saveButton);

    const descriptionInput = QM.smallInput("input");
    descriptionInput.type = "text";
    descriptionInput.placeholder = "Description (fed to appearance when selected above)";
    descriptionInput.style.width = "100%";
    descriptionInput.style.boxSizing = "border-box";

    form.append(line, descriptionInput);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return;
      saveButton.disabled = true;
      await QM.state.createOutfit({ name, description: descriptionInput.value });
      saveButton.disabled = false;
      nameInput.value = "";
      descriptionInput.value = "";
    });

    return form;
  },

  _buildOutfitsList() {
    const list = document.createElement("ul");
    Object.assign(list.style, {
      listStyle: "none",
      margin: "0",
      padding: "0",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    });

    const outfits = QM.state.sortedOutfits();
    if (outfits.length === 0) {
      const empty = QM.textNode("No saved outfits yet.");
      empty.style.color = "var(--muted-foreground, currentcolor)";
      empty.style.margin = "0";
      list.appendChild(empty);
      return list;
    }

    for (const outfit of outfits) {
      list.appendChild(this._buildOutfitRow(outfit));
    }
    return list;
  },

  // A small clickable thumbnail (or a dashed placeholder when unset) that
  // opens a file picker to upload/replace this outfit's portrait, plus a "×"
  // to remove it. Compression happens client-side (QM.compressImageFile)
  // before the upload call — the server only validates size/type, it never
  // resizes. Phase 1 is upload-only; a "generate" option belongs here later
  // once image-generation reachability from a package is actually confirmed.
  // sizePx follows QM_THUMBNAIL_SIZES[this.thumbnailSize] — same S/M/L
  // control that sizes item-card placeholders, so the two stay visually
  // consistent with each other.
  _buildOutfitPortraitControl(outfit, sizePx) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      position: "relative",
      flexShrink: "0",
      width: `${sizePx}px`,
      height: `${sizePx}px`,
    });

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png,image/jpeg,image/webp";
    fileInput.style.display = "none";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (!file) return;
      try {
        const dataUrl = await QM.compressImageFile(file);
        await QM.state.uploadOutfitPortrait(outfit.id, dataUrl);
      } catch (error) {
        QM.state.error = error && error.message ? error.message : String(error);
        QM.state._notify();
      }
    });

    const thumbButton = document.createElement("button");
    thumbButton.type = "button";
    thumbButton.title = outfit.portraitFile ? "Replace portrait" : "Add portrait";
    Object.assign(thumbButton.style, {
      width: `${sizePx}px`,
      height: `${sizePx}px`,
      padding: "0",
      cursor: "pointer",
      borderRadius: "var(--radius, 4px)",
      overflow: "hidden",
      background: "var(--muted, rgba(128,128,128,0.15))",
      border: outfit.portraitFile
        ? "1px solid var(--border, rgba(128,128,128,0.3))"
        : "1px dashed var(--border, rgba(128,128,128,0.4))",
    });
    thumbButton.addEventListener("click", () => fileInput.click());

    if (outfit.portraitFile) {
      const thumb = document.createElement("img");
      thumb.alt = `${outfit.name} portrait`;
      thumb.src = QM.outfitPortraitUrl(QM.state.chatId, QM_OWNER_ID, outfit.id);
      Object.assign(thumb.style, { width: "100%", height: "100%", objectFit: "cover", display: "block" });
      thumbButton.appendChild(thumb);
    } else {
      thumbButton.textContent = "+";
      Object.assign(thumbButton.style, {
        fontSize: `${Math.round(sizePx * 0.4)}px`,
        lineHeight: "1",
        color: "var(--muted-foreground, currentcolor)",
      });
    }

    wrapper.append(thumbButton, fileInput);

    if (outfit.portraitFile) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.title = "Remove portrait";
      removeButton.textContent = "×";
      Object.assign(removeButton.style, {
        position: "absolute",
        top: "-6px",
        right: "-6px",
        width: "14px",
        height: "14px",
        lineHeight: "12px",
        padding: "0",
        fontSize: "11px",
        borderRadius: "50%",
        cursor: "pointer",
        background: QM_COLOR_DANGER,
        color: QM_COLOR_DANGER_FG,
        border: "none",
      });
      removeButton.addEventListener("click", () => QM.state.deleteOutfitPortrait(outfit.id));
      wrapper.appendChild(removeButton);
    }

    return wrapper;
  },

  // Unlike outfit portraits, an item's image isn't a stored reference —
  // it's resolved server-side by name (findItemImageFile, matching an
  // uploaded file or a hand-placed image-pack file the same way — see
  // server.mjs's own comment). So the client doesn't know in advance
  // whether one exists; it just tries the URL and falls back to the dashed
  // placeholder on a 404 via onerror/onload, rather than checking a flag.
  _buildItemImageControl(item, sizePx) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      position: "relative",
      flexShrink: "0",
      width: `${sizePx}px`,
      height: `${sizePx}px`,
    });

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png,image/jpeg,image/webp";
    fileInput.style.display = "none";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      fileInput.value = "";
      if (!file) return;
      try {
        const dataUrl = await QM.compressImageFile(file);
        await QM.state.uploadItemImage(item.id, dataUrl);
      } catch (error) {
        QM.state.error = error && error.message ? error.message : String(error);
        QM.state._notify();
      }
    });

    const thumbButton = document.createElement("button");
    thumbButton.type = "button";
    thumbButton.title = "Upload/replace image";
    Object.assign(thumbButton.style, {
      width: `${sizePx}px`,
      height: `${sizePx}px`,
      padding: "0",
      cursor: "pointer",
      borderRadius: "var(--radius, 4px)",
      overflow: "hidden",
      background: "var(--muted, rgba(128,128,128,0.15))",
      border: "1px dashed var(--border, rgba(128,128,128,0.4))",
    });
    thumbButton.addEventListener("click", () => fileInput.click());

    const placeholderMark = document.createElement("span");
    placeholderMark.textContent = "+";
    Object.assign(placeholderMark.style, {
      fontSize: `${Math.round(sizePx * 0.4)}px`,
      lineHeight: "1",
      color: "var(--muted-foreground, currentcolor)",
    });
    thumbButton.appendChild(placeholderMark);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.title = "Remove uploaded image (a matching image-pack file, if any, would still show)";
    removeButton.textContent = "×";
    Object.assign(removeButton.style, {
      position: "absolute",
      top: "-6px",
      right: "-6px",
      width: "14px",
      height: "14px",
      lineHeight: "12px",
      padding: "0",
      fontSize: "11px",
      borderRadius: "50%",
      cursor: "pointer",
      background: QM_COLOR_DANGER,
      color: QM_COLOR_DANGER_FG,
      border: "none",
      display: "none",
    });
    removeButton.addEventListener("click", () => QM.state.deleteItemImage(item.id));

    const img = document.createElement("img");
    img.alt = `${item.name} image`;
    // No loading="lazy": this element starts (and often stays, on a
    // no-match) display:none, which has no layout box — a lazy image can
    // never be "near the viewport" with no box at all, so the browser may
    // never actually fetch it, leaving the placeholder showing forever even
    // when a real match exists on disk. Fetch eagerly instead; the item
    // list is never long enough for that to matter.
    Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover", display: "none" });
    img.addEventListener("load", () => {
      placeholderMark.style.display = "none";
      thumbButton.style.border = "1px solid var(--border, rgba(128,128,128,0.3))";
      img.style.display = "block";
      removeButton.style.display = "block";
    });
    img.addEventListener("error", () => {
      img.remove();
      // No matching image (uploaded or pack) — fall back to that item's own
      // default-slot icon rather than the bare "+" mark, same pictograms
      // the equip-slot boxes use. An item with no default slot set keeps
      // the plain "+" on purpose: it's a real, useful visual cue while
      // scrolling the bag that this item still needs one set.
      if (item.defaultSlot) {
        placeholderMark.style.display = "none";
        thumbButton.appendChild(QM.buildSlotIconRaster(item.defaultSlot, Math.round(sizePx * 0.6)));
      }
    });
    img.src = QM.itemImageUrl(QM.state.chatId, QM_OWNER_ID, item.id);
    thumbButton.appendChild(img);

    wrapper.append(thumbButton, fileInput, removeButton);
    return wrapper;
  },

  _buildOutfitRow(outfit) {
    const row = document.createElement("li");
    Object.assign(row.style, {
      display: "flex",
      flexDirection: "column",
      gap: "3px",
      border: "1px solid var(--border, rgba(128,128,128,0.3))",
      borderRadius: "var(--radius, 4px)",
      padding: "4px 6px",
    });

    const topLine = document.createElement("div");
    Object.assign(topLine.style, { display: "flex", alignItems: "center", gap: "6px" });

    const equipped = QM.state.outfitMatchesCurrent(outfit);
    const name = document.createElement("span");
    name.style.flex = "1";
    name.textContent = equipped ? `${outfit.name} (equipped)` : outfit.name;
    if (equipped) name.style.fontWeight = "600";

    const equipButton = QM.button("Equip");
    equipButton.addEventListener("click", () => QM.state.equipOutfit(outfit.id));

    const updateButton = QM.button("Update", {
      bg: "var(--secondary, transparent)",
      fg: "var(--secondary-foreground, inherit)",
      border: true,
    });
    updateButton.title = "Resave the currently-equipped items into this outfit";
    updateButton.addEventListener("click", () => QM.state.updateOutfit(outfit.id, { resnapshot: true }));

    const deleteButton = QM.button("Delete", { bg: QM_COLOR_DANGER, fg: QM_COLOR_DANGER_FG });
    deleteButton.addEventListener("click", () => QM.state.deleteOutfit(outfit.id));

    topLine.append(name, equipButton, updateButton, deleteButton);
    row.appendChild(topLine);

    // Left half: the portrait thumbnail/upload control (bigger than before —
    // an image reads faster at a glance than a name, per the request).
    // Right half: description, wrapping instead of cut off.
    const bodyRow = document.createElement("div");
    Object.assign(bodyRow.style, { display: "flex", gap: "8px", alignItems: "flex-start" });

    const portraitControl = this._buildOutfitPortraitControl(outfit, QM_THUMBNAIL_SIZES[this.thumbnailSize]);

    const description = QM.descriptionTextarea(outfit.description, (value) =>
      QM.state.updateOutfit(outfit.id, { description: value }),
    );
    description.style.flex = "1";

    bodyRow.append(portraitControl, description);
    row.appendChild(bodyRow);

    return row;
  },

  _buildAddItemForm() {
    const form = document.createElement("form");
    Object.assign(form.style, { display: "flex", flexDirection: "column", gap: "4px", marginBottom: "8px" });

    const line = document.createElement("div");
    Object.assign(line.style, { display: "flex", gap: "6px" });

    const nameInput = QM.smallInput("input");
    nameInput.type = "text";
    nameInput.placeholder = "Item name";
    nameInput.required = true;
    nameInput.style.flex = "1";

    const quantityInput = QM.smallInput("input");
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.value = "1";
    quantityInput.style.width = "56px";

    const addButton = QM.button("Add", { bg: QM_COLOR_SUCCESS, fg: QM_COLOR_SUCCESS_FG });
    addButton.type = "submit";

    line.append(nameInput, quantityInput, addButton);

    const descriptionInput = QM.smallInput("input");
    descriptionInput.type = "text";
    descriptionInput.placeholder = "Description (optional)";
    descriptionInput.style.width = "100%";
    descriptionInput.style.boxSizing = "border-box";

    form.append(line, descriptionInput);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return;
      addButton.disabled = true;
      await QM.state.addItem({ name, quantity: quantityInput.value, description: descriptionInput.value });
      addButton.disabled = false;
      nameInput.value = "";
      quantityInput.value = "1";
      descriptionInput.value = "";
    });

    return form;
  },

  _buildItemList() {
    const list = document.createElement("ul");
    Object.assign(list.style, {
      listStyle: "none",
      margin: "0",
      padding: "0",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    });

    const items = QM.state.bagItems();
    if (items.length === 0) {
      const empty = QM.textNode("Bag is empty.");
      empty.style.color = "var(--muted-foreground, currentcolor)";
      empty.style.margin = "0";
      list.appendChild(empty);
      return list;
    }

    for (const item of items) {
      list.appendChild(this._buildItemRow(item));
    }
    return list;
  },

  _buildItemRow(item) {
    const row = document.createElement("li");
    Object.assign(row.style, {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      border: "1px solid var(--border, rgba(128,128,128,0.3))",
      borderRadius: "var(--radius, 4px)",
      padding: "4px 6px",
    });

    const topLine = document.createElement("div");
    Object.assign(topLine.style, { display: "flex", alignItems: "center", gap: "6px" });

    // Editable in place, same trigger (change/blur) as every other field on
    // the card — renaming pushes through to any saved outfit's own snapshot
    // of this item too (server.mjs's items PATCH route), so a renamed item
    // doesn't show its old name the next time an outfit that equips it gets
    // re-equipped.
    const nameInput = QM.smallInput("input");
    nameInput.type = "text";
    nameInput.value = item.name;
    nameInput.style.flex = "1";
    nameInput.style.fontWeight = "600";
    nameInput.addEventListener("change", () => {
      const name = nameInput.value.trim();
      if (name) QM.state.updateItem(item.id, { name });
      else nameInput.value = item.name; // Empty isn't a valid name — revert rather than submit it.
    });

    const quantityInput = QM.smallInput("input");
    quantityInput.type = "number";
    // 0 is a legitimate quantity now ("used up but still tracked" — the same
    // rule the tracker agent follows), so this no longer floors at 1 the way
    // a brand-new item's starting quantity still does.
    quantityInput.min = "0";
    quantityInput.value = String(item.quantity);
    quantityInput.style.width = "48px";
    quantityInput.addEventListener("change", () => QM.state.updateItem(item.id, { quantity: quantityInput.value }));

    const deleteButton = QM.button("Delete", { bg: QM_COLOR_DANGER, fg: QM_COLOR_DANGER_FG });
    deleteButton.addEventListener("click", () => QM.state.deleteItem(item.id));

    topLine.append(nameInput, quantityInput, deleteButton);

    // Left half: the item's image (uploaded, or matched by name from a
    // hand-placed image pack — see _buildItemImageControl's own comment).
    // Right half: everything else, stacked, at whatever's left of the
    // card's width instead of spanning full-width like before.
    const bodyRow = document.createElement("div");
    Object.assign(bodyRow.style, { display: "flex", gap: "8px", alignItems: "flex-start" });

    const imageControl = this._buildItemImageControl(item, QM_THUMBNAIL_SIZES[this.thumbnailSize]);

    const detailsColumn = document.createElement("div");
    Object.assign(detailsColumn.style, {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      flex: "1",
      minWidth: "0",
    });

    const storedLine = document.createElement("div");
    Object.assign(storedLine.style, { display: "flex", alignItems: "center", gap: "6px" });

    const storedLabel = document.createElement("span");
    storedLabel.textContent = "Stored at:";
    Object.assign(storedLabel.style, { fontSize: "11px", color: "var(--muted-foreground, currentcolor)" });

    const storedInput = QM.smallInput("input");
    storedInput.type = "text";
    storedInput.placeholder = "bag";
    storedInput.value = item.location.startsWith("stored:") ? item.location.slice("stored:".length) : "";
    storedInput.style.flex = "1";
    storedInput.addEventListener("change", () => {
      const text = storedInput.value.trim();
      QM.state.updateItem(item.id, { location: text ? `stored:${text}` : "bag" });
    });

    storedLine.append(storedLabel, storedInput);

    const equipLine = document.createElement("div");
    Object.assign(equipLine.style, { display: "flex", alignItems: "center", gap: "6px" });
    const defaultSlotSelect = QM.defaultSlotSelect(item);
    defaultSlotSelect.style.flex = "1";
    const equipButton = QM.button("Equip");
    // A stored defaultSlot can still point at a slot whose group has since
    // been hidden (defaultSlotSelect just won't offer it as an option
    // anymore) — block the shortcut button too, or it'd be the one way left
    // to equip into a slot a toggle is supposed to disable.
    const canEquip = Boolean(item.defaultSlot) && QM.state.slotVisible(item.defaultSlot);
    equipButton.disabled = !canEquip;
    equipButton.style.opacity = canEquip ? "1" : "0.5";
    equipButton.addEventListener("click", () => {
      if (canEquip) QM.state.updateItem(item.id, { location: `equipped:${item.defaultSlot}` });
    });
    equipLine.append(defaultSlotSelect, equipButton);

    const description = QM.descriptionTextarea(item.description, (value) =>
      QM.state.updateItem(item.id, { description: value }),
    );

    detailsColumn.append(storedLine, equipLine, description);
    bodyRow.append(imageControl, detailsColumn);

    row.append(topLine, bodyRow);
    return row;
  },
};
