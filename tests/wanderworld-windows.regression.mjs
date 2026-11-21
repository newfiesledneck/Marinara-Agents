// The windows over the world: a floating window (floating.js) kept inside the view and remembered, the
// Illustrate window's placeholders (illustrate.js) as the server fills them, and the AI assistant's chat
// (assistant.js). They need a page, so a small stand-in for one is made here.
// Run: node tests/wanderworld-windows.regression.mjs
import assert from "node:assert/strict";

class Node {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parent = null;
    this.listeners = {};
    this.attributes = {};
    this.style = {};
    this.value = "";
    this.own = "";
  }
  get textContent() {
    return this.own + this.children.map((child) => child.textContent).join("");
  }
  set textContent(text) {
    this.own = String(text);
    this.children = [];
  }
  get isConnected() {
    return true;
  }
  append(...nodes) {
    for (const node of nodes) {
      const child = typeof node === "string" ? Object.assign(new Node("#text"), { own: node }) : node;
      child.parent = this;
      this.children.push(child);
    }
  }
  prepend(...nodes) {
    const was = this.children;
    this.children = [];
    this.append(...nodes);
    this.children.push(...was);
  }
  replaceChildren(...nodes) {
    this.children = [];
    this.append(...nodes);
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this);
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  addEventListener(type, run) {
    (this.listeners[type] ??= []).push(run);
  }
  removeEventListener() {}
  fire(type, event = {}) {
    for (const run of this.listeners[type] ?? [])
      run({ target: this, preventDefault() {}, stopPropagation() {}, closest: () => null, ...event });
  }
  find(test) {
    if (test(this)) return this;
    for (const child of this.children) {
      const found = child.find(test);
      if (found) return found;
    }
    return null;
  }
  closest() {
    return null;
  }
  contains(node) {
    return !!this.find((each) => each === node);
  }
  focus() {}
  setSelectionRange() {}
  scrollIntoView() {}
  setPointerCapture() {}
}
globalThis.document = { createElement: (tag) => new Node(tag) };
const stored = new Map();
globalThis.localStorage = {
  getItem: (key) => stored.get(key) ?? null,
  setItem: (key, value) => stored.set(key, String(value)),
};
const settle = () => new Promise((done) => setTimeout(done, 0));

// A floating window: where it was left comes back, it's always wholly inside the view (a small view
// doesn't shrink what was kept), and opening or moving it is remembered.
{
  const { makeFloating } = await import("../packages/wanderworld/src/floating.js");
  stored.set("test.window", JSON.stringify({ x: 900, y: 20, w: 300, h: 200, open: false }));
  const layer = Object.assign(new Node("div"), { clientWidth: 600, clientHeight: 400 });
  const frame = new Node("div");
  const bar = new Node("div");
  const floating = makeFloating(layer, frame, bar, "test.window", { w: 320, h: 240, open: true });
  assert.equal(floating.isOpen(), false, "it stays closed as it was left");
  floating.setOpen(true);
  assert.deepEqual([frame.style.left, frame.style.width, frame.style.display], ["296px", "300px", "flex"]);
  assert.equal(JSON.parse(stored.get("test.window")).open, true, "remembered open");
  layer.clientWidth = 250;
  floating.place();
  assert.deepEqual([frame.style.left, frame.style.width], ["4px", "242px"], "fitted into a narrow view");
  assert.equal(floating.state.w, 300, "without losing its own size");
  layer.clientWidth = 600;
  floating.place();
  bar.fire("pointerdown", { clientX: 310, clientY: 30, pointerId: 1 });
  bar.fire("pointermove", { clientX: 210, clientY: 130 });
  bar.fire("pointerup");
  assert.deepEqual(JSON.parse(stored.get("test.window")).x, 196, "dragged by its title, and remembered there");
}

// The Illustrate window: every placeholder its template uses is explained, and the server fills them in
// (an empty one takes its sentence with it).
{
  const { DEFAULT_TEMPLATE, PLACEHOLDERS } = await import("../packages/wanderworld/src/illustrate.js");
  const { fillTemplate } = await import("../packages/wanderworld/server.mjs");
  for (const [, key] of DEFAULT_TEMPLATE.matchAll(/\{(\w+)\}/gu)) assert.ok(PLACEHOLDERS[key], `{${key}} is explained`);
  const filled = fillTemplate(DEFAULT_TEMPLATE, {
    persona: "Zoey",
    activity: "fishing",
    place: "the pond",
    people: "",
  });
  assert.match(filled, /^Zoey fishing at the pond/u);
  assert.ok(!filled.includes("With them"), "nobody with them: that sentence goes");
  assert.ok(!/\{\w+\}/u.test(filled), "no placeholder is left");
}

// The AI assistant: a question typed and sent with Enter goes with the chat so far, the answer is shown,
// and the chat is kept with the world; a world's kept chat comes back.
{
  const { createAssistant } = await import("../packages/wanderworld/src/assistant.js");
  const asked = [];
  const kept = [];
  const box = createAssistant({
    onAsk: async (history) => {
      asked.push(history);
      return { reply: "Mira is the baker.", proposed: [], skipped: [] };
    },
    onChat: (history) => kept.push(history),
    onLorebooks: async () => [],
    onMemoryPeople: () => [],
  });
  const input = box.find((node) => node.tagName === "TEXTAREA");
  input.value = "Who is Mira?";
  input.fire("keydown", { key: "Enter", shiftKey: false });
  await settle();
  await settle();
  assert.deepEqual(asked, [[{ role: "user", text: "Who is Mira?" }]]);
  assert.equal(input.value, "", "the box is emptied");
  assert.ok(box.textContent.includes("Mira is the baker."), "the answer is shown");
  assert.deepEqual(kept.at(-1), [
    { role: "user", text: "Who is Mira?" },
    { role: "assistant", text: "Mira is the baker." },
  ]);
  input.value = "Shift and Enter is a new line";
  input.fire("keydown", { key: "Enter", shiftKey: true });
  await settle();
  assert.equal(asked.length, 1, "not sent");
  box.setChat([
    { role: "user", text: "Earlier question" },
    { role: "assistant", text: "Earlier answer" },
    { role: "nobody", text: "" },
  ]);
  assert.ok(box.textContent.includes("Earlier answer"), "a world's chat comes back");
  assert.ok(!box.textContent.includes("Mira is the baker."), "and the last world's goes");
}

console.log("ok: windows over the world");
