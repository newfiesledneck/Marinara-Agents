// 3D Avatar Maker: a Home tab where a user builds a 3D avatar for a character or persona and saves it as a
// file the Engine's 3D Avatars agent can show.
//
// The Engine mounts this element once, with view="browser", as the package's Home tab. Everything is made
// in the browser from the package's own kit files (kitfiles.js): no AI and no outside service is needed.
// The look being worked on is kept in this browser as a draft, one for each character or persona, and
// saved for good as a file the user keeps (a small .json look, or the .vrm or .glb avatar, which holds the look too).
import { avatarChoices, createAvatar } from "./avatar.js";
import { exportGlb, exportVrm, FILE_FORMAT, lookInGlb, vrmTerms } from "./exporter.js";
import { FACE_MODES } from "./face.js";
import { PACKAGE_ID, setKitBase } from "./kitfiles.js";
import { checkLook, missingNotes, NEUTRAL_LOOK, OUTFIT_PRESETS, outfitLook, wornLook } from "./looks.js";
import { loadPacks } from "./packs.js";
import { createPanel, h } from "./panel.js";
import { createStage, POSES } from "./stage.js";
import { STYLES } from "./styles.js";
import { getJson } from "./util.js";

const TAG = `marinara-capability-${PACKAGE_ID}`;
const DRAFT_KEY = (owner) => `${PACKAGE_ID}:draft:${owner ? `${owner.type}:${owner.id}` : "none"}`;
const LAST_KEY = `${PACKAGE_ID}:last`;
const TERMS_KEY = `${PACKAGE_ID}:vrm-terms`; // (the author's VRM terms, the same for every avatar they save)
/** The look's fields that are records, merged part by part when a control changes one part. */
const RECORDS = ["shape", "limbs", "colours", "underwear", "clothColours", "variants"];

const rows = (list) => (Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : []);
/** A character card's name: rows keep the card as JSON in `data` (text or already read). */
function cardName(row) {
  let card = row?.data;
  if (typeof card === "string") {
    try {
      card = JSON.parse(card);
    } catch {
      card = null;
    }
  }
  const name = card?.name ?? card?.data?.name ?? row?.name;
  return typeof name === "string" && name.trim() ? name.trim() : "Unnamed";
}
/** The Engine's personas and characters, as [{ type, id, name }]; empty when they can't be read. */
async function listOwners() {
  const [personas, characters] = await Promise.all([
    getJson("/api/characters/personas/list"),
    getJson("/api/characters"),
  ]);
  const named = (type, list, nameOf) =>
    rows(list)
      .filter((row) => typeof row?.id === "string" && row.id)
      .map((row) => ({ type, id: row.id, name: nameOf(row) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  return [
    ...named("persona", personas, (row) =>
      typeof row.name === "string" && row.name.trim() ? row.name.trim() : "Unnamed",
    ),
    ...named("character", characters, cardName),
  ];
}

/** Browser storage that never throws (private windows, blocked storage): a draft is a convenience. */
const store = {
  read(key) {
    try {
      return JSON.parse(globalThis.localStorage?.getItem(key) ?? "null");
    } catch {
      return null;
    }
  },
  write(key, value) {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {
      // (Nothing to do: the Save tab's files are how work is kept for good.)
    }
  },
};

/** A new avatar's look: the body's own shape, dressed in everyday modern clothes. */
function startingLook(over = {}) {
  const body = over.body === "male" ? "male" : "female";
  const casual = OUTFIT_PRESETS.find((preset) => preset.name === "Modern casual");
  return checkLook({ ...NEUTRAL_LOOK, body, ...(casual ? outfitLook(casual, body) : {}), ...over });
}

/** `patch` laid on `look`: a record's parts are merged (`undefined` clears one; `{ $set }` replaces it all). */
function patched(look, patch) {
  const next = { ...look };
  for (const [field, value] of Object.entries(patch)) {
    if (value === undefined) delete next[field];
    else if (RECORDS.includes(field)) {
      const merged = value.$set ? { ...value.$set } : { ...next[field], ...value };
      for (const key of Object.keys(merged)) if (merged[key] === undefined) delete merged[key];
      next[field] = merged;
    } else next[field] = value;
  }
  // (A hair colour of one's own and one from the list don't both stand.)
  if (patch.hairTint !== undefined) delete next.hairColour;
  return checkLook(next);
}

const fileName = (name, extension) =>
  `${
    (name || "avatar")
      .trim()
      .replace(/[^\p{L}\p{N} _-]+/gu, "")
      .replace(/\s+/gu, "-")
      .slice(0, 60) || "avatar"
  }.${extension}`;

function download(bytes, name, type) {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const link = h("a", { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** The maker in `element`: builds the page and returns { destroy }. */
function mount(element, props) {
  setKitBase(
    props?.kitBase ?? `/api/capability-packages/${props?.packageId ?? PACKAGE_ID}/assets/kit/`,
    props?.packageVersion ?? "",
  );
  const shadow = element.shadowRoot ?? element.attachShadow({ mode: "open" });
  const state = {
    owners: [],
    owner: null,
    name: "",
    look: startingLook(),
    tab: "start",
    filled: null,
    choices: null,
    exported: null,
    terms: vrmTerms(store.read(TERMS_KEY) ?? {}),
    building: 0,
    figure: null,
    redraw: true, // whether the controls are drawn again after the next build (not while a slider is dragged)
  };

  const canvas = h("canvas", {
    tabIndex: 0,
    role: "img",
    "aria-label": "The avatar. Drag to turn it, scroll or pinch to zoom, arrow keys to move the view.",
  });
  const note = h("div", { class: "note", role: "status", "aria-live": "polite" });
  const poseSelect = h("select", {
    "aria-label": "Pose",
    title:
      "How the avatar stands in the preview. Moving turns its head now and then, so you can see the hair swing. A saved file rests in the A-pose (GLB) or the T-pose (VRM).",
    onchange: () => stage.setPose(poseSelect.value),
  });
  for (const [pose, label] of POSES) poseSelect.append(new Option(label, pose));
  // (What the face does in the preview: the moves a saved avatar has, played here. Nothing of it is saved.)
  const faceSelect = h("select", {
    "aria-label": "Face",
    title: "What the face does here: blinking and looking at you, talking, or one expression held",
    onchange: () => stage.setFace(faceSelect.value),
  });
  for (const [mode, label] of FACE_MODES) faceSelect.append(new Option(label, mode));
  const views = h(
    "div",
    { class: "views" },
    h("button", { type: "button", onclick: () => stage.view("body") }, "Whole body"),
    h("button", { type: "button", onclick: () => stage.view("face") }, "Face"),
    h("button", { type: "button", onclick: () => stage.view("hand") }, "Hand"),
    h("button", { type: "button", onclick: () => stage.view("feet") }, "Feet"),
    poseSelect,
    faceSelect,
  );
  const stageBox = h("section", { class: "stage", "aria-label": "Preview" }, canvas, note, views);

  const ownerSelect = h("select", {
    "aria-label": "Who this avatar is for",
    onchange: () => pickOwner(ownerSelect.value),
  });
  const nameInput = h("input", {
    type: "text",
    "aria-label": "Avatar name",
    placeholder: "Avatar name",
    maxLength: 60,
    oninput: () => {
      state.name = nameInput.value;
      saveDraft();
    },
  });
  const openInput = h("input", {
    type: "file",
    accept: ".vrm,.glb,.json,model/gltf-binary,application/json",
    class: "visually-hidden",
    tabIndex: -1,
    "aria-hidden": "true",
    onchange: () => {
      const [file] = openInput.files ?? [];
      openInput.value = "";
      if (file) void openFile(file);
    },
  });

  const panel = createPanel({
    onChange: (patch, { redraw }) => {
      state.look = patched(state.look, patch);
      state.redraw ||= redraw;
      saveDraft();
      void rebuildFigure();
    },
    onTab: (tab) => {
      state.tab = tab;
      render();
    },
    onNew: (look) => {
      state.look = startingLook(look);
      state.exported = null;
      state.redraw = true;
      saveDraft();
      void rebuildFigure();
    },
    onOpen: () => openInput.click(),
    onSaveLook: () => {
      const text = JSON.stringify(
        { avatarMaker: "look", format: FILE_FORMAT, name: state.name, look: state.look },
        null,
        1,
      );
      download(text, fileName(state.name, "avatar.json"), "application/json");
      panel.setStatus("Saved the look as a file.");
    },
    onExport: (options) => void saveAvatar(options),
    onTerms: (patch) => {
      state.terms = vrmTerms({ ...state.terms, ...patch });
      store.write(TERMS_KEY, state.terms);
    },
  });

  const app = h(
    "div",
    { class: "app" },
    h(
      "header",
      {},
      h("h1", {}, "3D Avatar Maker"),
      h("label", { class: "field" }, "For", ownerSelect),
      h("label", { class: "field" }, "Name", nameInput),
      h("span", { class: "grow" }),
      h("button", { type: "button", onclick: () => openInput.click() }, "Open…"),
      h(
        "button",
        {
          class: "main",
          type: "button",
          onclick: () => {
            state.tab = "save";
            render();
          },
        },
        "Save…",
      ),
      openInput,
    ),
    h("main", {}, stageBox, panel.element),
  );
  shadow.replaceChildren(h("style", {}, STYLES), app);

  const stage = createStage(canvas);
  if (stage.failed) {
    note.className = "note bad";
    note.textContent = "This browser couldn't start 3D drawing (WebGL), so the avatar can't be shown here.";
  }

  function render() {
    panel.render({
      look: state.look,
      filled: state.filled,
      choices: state.choices,
      tab: state.tab,
      exported: state.exported,
      terms: state.terms,
    });
  }

  function saveDraft() {
    store.write(DRAFT_KEY(state.owner), { name: state.name, look: state.look });
    store.write(LAST_KEY, state.owner ? { type: state.owner.type, id: state.owner.id } : null);
  }

  /** Builds the figure for the look as it stands and shows it; a newer change wins over one still building. */
  async function rebuildFigure() {
    const turn = ++state.building;
    try {
      const figure = await createAvatar(state.look, state.name || "avatar", "auto");
      if (turn !== state.building || destroyed) {
        figure.dispose();
        return;
      }
      const bodyChanged = state.filled?.body !== figure.avatar.body;
      state.figure = figure;
      state.filled = figure.avatar;
      if (bodyChanged || !state.choices) state.choices = await avatarChoices(figure.avatar.body);
      stage.show(figure);
      if (!stage.failed) {
        // (What the look has that isn't shown, because its pack isn't installed, said under the picture.)
        note.className = "note";
        note.textContent = missingNotes(state.look).join(" ");
      }
      if (state.redraw || bodyChanged) render();
      state.redraw = false;
    } catch (error) {
      if (turn !== state.building) return;
      console.warn(`[${PACKAGE_ID}] the avatar couldn't be built`, error);
      note.className = "note bad";
      note.textContent =
        "The avatar's files couldn't be loaded. If you just installed or updated 3D Avatar Maker, reload the page and try again.";
    }
  }

  function fillOwners() {
    ownerSelect.replaceChildren(new Option("No one yet (a free draft)", ""));
    for (const [type, label] of [
      ["persona", "Personas"],
      ["character", "Characters"],
    ]) {
      const listed = state.owners.filter((owner) => owner.type === type);
      if (!listed.length) continue;
      const group = h("optgroup", { label });
      for (const owner of listed) group.append(new Option(owner.name, `${owner.type}:${owner.id}`));
      ownerSelect.append(group);
    }
    ownerSelect.value = state.owner ? `${state.owner.type}:${state.owner.id}` : "";
  }

  /** Switches to the avatar being made for `key` ("persona:<id>", "character:<id>" or ""): its draft, or a new one. */
  function pickOwner(key) {
    state.owner = state.owners.find((owner) => `${owner.type}:${owner.id}` === key) ?? null;
    const draft = store.read(DRAFT_KEY(state.owner));
    state.look = draft?.look ? checkLook(draft.look) : startingLook();
    if (!state.look.body) state.look = startingLook(state.look);
    state.name = typeof draft?.name === "string" && draft.name ? draft.name : (state.owner?.name ?? "");
    nameInput.value = state.name;
    state.exported = null;
    state.redraw = true;
    store.write(LAST_KEY, state.owner ? { type: state.owner.type, id: state.owner.id } : null);
    void rebuildFigure();
  }

  /** Opens a saved look (.json: this maker's, or a Wanderworld look) or an avatar this maker saved (.vrm, .glb). */
  async function openFile(file) {
    try {
      let read = null;
      if (/\.(?:glb|vrm)$/iu.test(file.name)) read = lookInGlb(await file.arrayBuffer());
      else {
        const parsed = JSON.parse(await file.text());
        if (parsed?.avatarMaker === "look" || parsed?.wanderworld === "look")
          read = { name: parsed.name, look: parsed.look };
      }
      const look = read ? checkLook(read.look) : null;
      if (!look || !Object.keys(look).length) {
        panel.setStatus(
          /\.(?:glb|vrm)$/iu.test(file.name)
            ? "That file wasn't saved by 3D Avatar Maker, so there is no look in it to open."
            : "That file isn't a saved look.",
          true,
        );
        return;
      }
      state.look = look.body ? look : startingLook(look);
      if (typeof read.name === "string" && read.name) {
        state.name = read.name.slice(0, 60);
        nameInput.value = state.name;
      }
      state.exported = null;
      state.redraw = true;
      saveDraft();
      panel.setStatus(`Opened ${file.name}.`);
      void rebuildFigure();
    } catch {
      panel.setStatus("That file couldn't be read.", true);
    }
  }

  async function saveAvatar({ format, maxTextureSize }) {
    if (!state.figure) return;
    panel.setStatus("Saving the avatar…");
    try {
      // (Only what's worn: a piece or hair style whose pack isn't installed stays in the draft and the look file.)
      const options = { look: wornLook(state.look), name: state.name, maxTextureSize };
      const { bytes, vertices, triangles } =
        format === "vrm"
          ? await exportVrm(state.figure, { ...options, terms: state.terms })
          : await exportGlb(state.figure, options);
      stage.setPose(poseSelect.value); // (the export put the figure in its A-pose)
      const file = fileName(state.name, format === "vrm" ? "vrm" : "glb");
      download(bytes, file, "model/gltf-binary");
      state.exported = { file, bytes: bytes.byteLength, vertices, triangles };
      render();
      panel.setStatus("Saved. The steps below say how to use it in a chat.");
    } catch (error) {
      console.warn(`[${PACKAGE_ID}] the avatar couldn't be saved`, error);
      stage.setPose(poseSelect.value);
      panel.setStatus("The avatar couldn't be saved. Try a smaller picture size.", true);
    }
  }

  let destroyed = false;
  fillOwners();
  nameInput.value = state.name;
  render();
  // The wardrobe packs first (packs.js): a draft read before them would lose the pack pieces it wears. Then
  // the free draft, so there is something to see while the Engine's lists load, and then whoever was being
  // worked on last time.
  const listed = listOwners();
  void loadPacks()
    .then(() => {
      if (destroyed) return null;
      pickOwner("");
      return listed;
    })
    .then((owners) => {
      if (destroyed || !owners) return;
      state.owners = owners;
      const last = store.read(LAST_KEY);
      const key = last ? `${last.type}:${last.id}` : "";
      fillOwners();
      if (key && owners.some((owner) => `${owner.type}:${owner.id}` === key)) {
        ownerSelect.value = key;
        pickOwner(key);
      }
    });

  return {
    destroy() {
      destroyed = true;
      state.building++;
      stage.dispose();
      shadow.replaceChildren();
    },
  };
}

class AvatarMakerElement extends HTMLElement {
  constructor() {
    super();
    this.props = null;
    this.mounted = null;
    this.onPropsEvent = () => this.sync();
  }
  // The host assigns capabilityProps and then dispatches marinara-capability-props; handle both orders.
  set capabilityProps(value) {
    this.props = value;
    this.sync();
  }
  get capabilityProps() {
    return this.props;
  }
  connectedCallback() {
    this.addEventListener("marinara-capability-props", this.onPropsEvent);
    this.sync();
  }
  disconnectedCallback() {
    this.removeEventListener("marinara-capability-props", this.onPropsEvent);
    this.mounted?.destroy();
    this.mounted = null;
  }
  sync() {
    try {
      if (this.getAttribute("view") !== "browser" || !this.isConnected || this.mounted) return;
      this.style.cssText += ";display:block;position:relative;overflow:hidden;width:100%;height:100%;";
      this.mounted = mount(this, this.props);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${PACKAGE_ID}]`, error);
      this.dispatchEvent(new CustomEvent("marinara-capability-runtime-error", { detail: { message } }));
    }
  }
}

if (!customElements.get(TAG)) customElements.define(TAG, AvatarMakerElement);
