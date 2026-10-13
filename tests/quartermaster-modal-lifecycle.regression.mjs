import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const elements = [];
const timers = [];
const revoked = [];
let notifications = 0;
function element(label = "") {
  const node = {
    textContent: label,
    value: "",
    style: {},
    listeners: {},
    append() {},
    appendChild() {},
    replaceChildren() {},
    remove() {},
    addEventListener(name, handler) {
      this.listeners[name] = handler;
    },
    click() {
      this.clicked = true;
    },
  };
  elements.push(node);
  return node;
}
const QM = {
  state: {
    chatId: "chat-a",
    _notify() {
      notifications++;
    },
  },
  button: element,
  smallInput: element,
  compressImageFile: async () => "data:image/png;base64,fixture",
  forgottenImages: [],
  forgetImage(url) {
    this.forgottenImages.push(url);
  },
  itemImageUrl: (_chatId, _ownerId, id) => `item:${id}`,
  outfitPortraitUrl: (_chatId, _ownerId, id) => `outfit:${id}`,
};
const context = vm.createContext({
  QM,
  QM_OWNER_ID: "persona",
  QM_COLOR_SUCCESS: "green",
  QM_COLOR_SUCCESS_FG: "white",
  Error,
  Blob,
  window: { localStorage: { getItem: () => null } },
  document: { createElement: element, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {} },
  URL: { createObjectURL: () => "blob:inventory", revokeObjectURL: (url) => revoked.push(url) },
  setTimeout: (callback) => timers.push(callback),
});
for (const source of ["10-dock.js", "11-wardrobe.js", "12-image-gen.js"]) {
  vm.runInContext(await readFile(new URL(`../packages/quartermaster/src/${source}`, import.meta.url), "utf8"), context);
}
const dock = QM.dock;
dock._renderImageGenContent = () => {};
dock._imageGenKind = "item";
dock._imageGenSubjectId = "item-a";

QM.itemImagePromptPreview = async (...args) => {
  assert.deepEqual(args, ["chat-a", "persona", "item-a"]);
  return { prompt: "current prompt" };
};
await dock._submitImageGenPromptPreview();
assert.equal(dock._imageGenPrompt, "current prompt");

for (const change of ["reopen", "chat"]) {
  for (const reject of [false, true]) {
    QM.state.chatId = "chat-a";
    let settle;
    QM.itemImagePromptPreview = () =>
      new Promise((resolve, fail) => {
        settle = () => (reject ? fail(new Error("stale error")) : resolve({ prompt: "stale prompt" }));
      });
    const pending = dock._submitImageGenPromptPreview();
    if (change === "reopen") dock._closeImageGenModal();
    else QM.state.chatId = "chat-b";
    dock._imageGenViewState = "choice";
    dock._imageGenPrompt = "new session";
    dock._imageGenError = null;
    settle();
    await pending;
    assert.equal(dock._imageGenViewState, "choice", `${change}: stale preview must not replace the dialog`);
    assert.equal(dock._imageGenPrompt, "new session");
    assert.equal(dock._imageGenError, null);
  }
}

const removed = [];
for (const key of ["addItemBackdrop", "wardrobeBuilderBackdrop", "imageGenBackdrop"]) {
  dock[key] = { remove: () => removed.push(key) };
}
const token = dock._imageGenSessionToken;
dock.close();
assert.equal(removed.length, 3, "closing the dock removes all child dialogs");
assert.ok(dock._imageGenSessionToken > token, "closing the dock invalidates pending previews");

for (const change of ["none", "reopen", "chat", "reset"]) {
  for (const reject of [false, true]) {
    let settle;
    let renders = 0;
    QM.state.chatId = "chat-a";
    QM.state.confirmWardrobe = () =>
      new Promise((resolve, fail) => {
        settle = () => (reject ? fail(new Error("Confirmation failed")) : resolve({ summary: "saved" }));
      });
    dock._renderWardrobeBuilderContent = () => renders++;
    dock._wardrobeSummary = null;
    dock._wardrobeError = null;
    dock._wardrobeViewState = "preview";
    const button = element();
    const pending = dock._submitWardrobeConfirm(button);
    if (change === "reopen") dock._closeWardrobeBuilder();
    if (change === "chat") QM.state.chatId = "chat-b";
    if (change === "reset") dock._resetCachedNodes();
    settle();
    await pending;
    const current = change === "none";
    assert.equal(dock._wardrobeSummary, current && !reject ? "saved" : null, `${change}: confirmation summary`);
    assert.equal(
      dock._wardrobeError,
      current && reject ? "Confirmation failed" : null,
      `${change}: confirmation error`,
    );
    assert.equal(dock._wardrobeViewState, current && reject ? "error" : "preview");
    assert.equal(button.disabled, !(current && reject));
    assert.equal(renders, current ? 1 : 0);
  }
}

const resetRemoved = [];
for (const key of [
  "itemEditorBackdrop",
  "outfitEditorBackdrop",
  "saveOutfitBackdrop",
  "addItemBackdrop",
  "wardrobeBuilderBackdrop",
  "imageGenBackdrop",
]) {
  dock[key] = { remove: () => resetRemoved.push(key) };
}
dock._wardrobeContentContainer = element();
dock._imageGenContentContainer = element();
const wardrobeToken = dock._wardrobeSessionToken;
const imageToken = dock._imageGenSessionToken;
dock._resetCachedNodes();
assert.equal(resetRemoved.length, 6, "rebuilding the dock removes all dialogs");
assert.equal(dock._wardrobeContentContainer, null);
assert.equal(dock._imageGenContentContainer, null);
assert.ok(dock._wardrobeSessionToken > wardrobeToken);
assert.ok(dock._imageGenSessionToken > imageToken);

QM.state.exportInventory = async () => {
  throw new Error("Export unavailable");
};
dock._buildExportImportRow();
const exportButton = elements.find((node) => node.listeners.click);
await exportButton.listeners.click();
assert.equal(QM.state.error, "Export unavailable");
assert.equal(notifications, 1);
assert.equal(exportButton.disabled, false);
QM.state.exportInventory = async () => ({ personaName: "Mari", items: [] });
await exportButton.listeners.click();
assert.ok(elements.some((node) => node.clicked && node.download.endsWith(".json")));
assert.deepEqual(revoked, [], "the download URL survives the click task");
timers.forEach((callback) => callback());
assert.deepEqual(revoked, ["blob:inventory"]);

for (const outcome of ["failure", "success", "chat-change"]) {
  const start = elements.length;
  const uploads = [];
  QM.state.chatId = "chat-a";
  QM.state.error = null;
  QM.state.outfits = [{ id: "existing" }];
  QM.state.createOutfit = async () => {
    if (outcome === "failure") QM.state.error = "Save unavailable";
    else QM.state.outfits = [{ id: "new" }, { id: "existing" }];
    if (outcome === "chat-change") QM.state.chatId = "chat-b";
    return outcome === "failure"
      ? { ok: false, error: "Save unavailable" }
      : { ok: true, result: { outfits: QM.state.outfits } };
  };
  QM.state.uploadOutfitPortrait = async (id) => uploads.push(id);
  dock.body = element();
  dock._openSaveOutfitModal();
  const controls = elements.slice(start);
  controls.find((node) => node.placeholder === "Outfit name").value = "Armor";
  const upload = controls.find((node) => node.type === "file");
  upload.files = [{}];
  await upload.listeners.change();
  const save = controls.find((node) => node.textContent === "Save");
  await save.listeners.click();
  assert.deepEqual(
    uploads,
    outcome === "success" ? ["new"] : [],
    `${outcome}: never replace the previous outfit's portrait`,
  );
  assert.equal(save.disabled, false);
  dock._closeSaveOutfitModal();
}
console.log("Quartermaster modal lifecycle and export regressions passed.");

await test("image connection checks cannot overwrite a later dialog", async () => {
  for (const stale of [false, true]) {
    for (const reject of [false, true]) {
      let settle;
      QM.listImageConnections = () =>
        new Promise((resolve, fail) => {
          settle = () => (reject ? fail(new Error("Connection check failed")) : resolve([{}]));
        });
      const pending = dock._checkImageGenConnections();
      if (stale) {
        dock._closeImageGenModal();
        dock._imageGenHasConnections = "new session";
        dock._imageGenConnectionsError = false;
      }
      settle();
      await pending;
      assert.equal(dock._imageGenHasConnections, stale ? "new session" : !reject);
      assert.equal(dock._imageGenConnectionsError, !stale && reject);
    }
  }
});

const stateSource = await readFile(new URL("../packages/quartermaster/src/05-state.js", import.meta.url), "utf8");
await test("generated images use their own upload result and cannot close a later dialog", async () => {
  const stateContext = vm.createContext({ QM });
  vm.runInContext(stateSource, stateContext);
  QM._missingItemImageIds = new Set();
  for (const kind of ["item", "outfit"]) {
    for (const succeeds of [false, true]) {
      for (const change of ["none", "reopen", "chat"]) {
        QM.state.chatId = "chat-a";
        QM.state.error = null;
        dock._imageGenKind = kind;
        dock._imageGenSubjectId = "subject-a";
        dock._imageGenError = null;
        let settleUpload;
        let startedUpload;
        const uploadStarted = new Promise((resolve) => {
          startedUpload = resolve;
        });
        const upload = () => {
          startedUpload();
          return new Promise((resolve, reject) => {
            settleUpload = () => (succeeds ? resolve({}) : reject(new Error("Upload failed")));
          });
        };
        QM.generateItemImage = QM.generateOutfitPortrait = async () => ({
          imageDataUrl: "data:image/png;base64,fixture",
        });
        QM.uploadItemImage = QM.uploadOutfitPortrait = upload;
        const pending = dock._submitImageGenGenerate();
        await uploadStarted;
        if (change === "reopen") dock._closeImageGenModal();
        if (change === "chat") QM.state.chatId = "chat-b";
        const token = dock._imageGenSessionToken;
        if (change !== "none") dock._imageGenViewState = "choice";
        // Settle the opposite result in the same turn, before the modal's continuation.
        settleUpload();
        await QM.state._mutate(succeeds ? Promise.reject(new Error("Unrelated failure")) : Promise.resolve({}));
        await pending;
        assert.equal(
          dock._imageGenSessionToken,
          token + (succeeds && change === "none" ? 1 : 0),
          `${kind}/${succeeds}/${change}: closes only its successful upload`,
        );
        assert.equal(dock._imageGenError, !succeeds && change === "none" ? "Upload failed" : null);
        if (change !== "none") assert.equal(dock._imageGenViewState, "choice");
      }
    }
  }
});

await test("late inventory reloads cannot replace a mutation, newer reload, or another chat's error", async () => {
  for (const change of ["mutation", "reload", "chat"]) {
    for (const fails of [false, true]) {
      const api = {};
      vm.runInContext(stateSource, vm.createContext({ QM: api }));
      api.state.chatId = "chat-a";
      let settle;
      api.listItems = () =>
        new Promise((resolve, reject) => {
          settle = () =>
            fails ? reject(new Error("Old reload failed")) : resolve({ items: [{ id: "old" }], outfits: [] });
        });
      const pending = api.state._reload();
      if (change === "mutation") await api.state._mutate(Promise.resolve({ items: [{ id: "current" }], outfits: [] }));
      if (change === "reload") {
        api.listItems = async () => ({ items: [{ id: "current" }], outfits: [] });
        await api.state._reload();
      }
      if (change === "chat") {
        api.state.chatId = "chat-b";
        api.state.items = [{ id: "current" }];
      }
      api.state.error = "Current error";
      settle();
      await pending;
      assert.equal(api.state.items[0].id, "current", `${change}/${fails}: keeps current inventory`);
      assert.equal(api.state.error, "Current error", `${change}/${fails}: keeps current error`);
    }
  }
});

await test("outfit saves use their own result while another mutation changes shared state", async () => {
  for (const succeeds of [false, true]) {
    const uploads = [];
    QM.forgottenImages.length = 0;
    QM.state.chatId = "chat-a";
    QM.state.outfits = [{ id: "existing" }];
    let settle;
    QM.createOutfit = () =>
      new Promise((resolve, reject) => {
        settle = () =>
          succeeds ? resolve({ outfits: [{ id: "new" }, { id: "existing" }] }) : reject(new Error("Save failed"));
      });
    QM.uploadOutfitPortrait = async (_chatId, _ownerId, id) => {
      uploads.push(id);
      return {};
    };
    const start = elements.length;
    dock.body = element();
    dock._openSaveOutfitModal();
    const controls = elements.slice(start);
    controls.find((node) => node.placeholder === "Outfit name").value = "Armor";
    const upload = controls.find((node) => node.type === "file");
    upload.files = [{}];
    await upload.listeners.change();
    const save = controls.find((node) => node.textContent === "Save");
    const pending = save.listeners.click();
    settle();
    await QM.state._mutate(
      succeeds ? Promise.reject(new Error("Unrelated failure")) : Promise.resolve({ outfits: [{ id: "unrelated" }] }),
    );
    await pending;
    assert.deepEqual(uploads, succeeds ? ["new"] : []);
    assert.deepEqual(QM.forgottenImages, succeeds ? ["outfit:new"] : [], "drops the cached portrait after its upload");
    assert.equal(save.disabled, false);
    assert.equal(dock.saveOutfitBackdrop === null, succeeds);
    dock._closeSaveOutfitModal();
  }
});

await test("image deletion uses its own result during concurrent mutations", async () => {
  for (const succeeds of [false, true]) {
    const forgotten = [];
    const api = {
      _missingItemImageIds: new Set(),
      forgetImage: (url) => forgotten.push(url),
      itemImageUrl: (_chatId, _ownerId, id) => `item:${id}`,
    };
    vm.runInContext(stateSource, vm.createContext({ QM: api }));
    api.state.chatId = "chat-a";
    api.deleteItemImage = () => (succeeds ? Promise.resolve({}) : Promise.reject(new Error("Delete failed")));
    await Promise.all([
      api.state.deleteItemImage("item-a"),
      api.state._mutate(succeeds ? Promise.reject(new Error("Other request failed")) : Promise.resolve({})),
    ]);
    assert.equal(api._missingItemImageIds.has("item-a"), succeeds);
    assert.deepEqual(
      forgotten,
      succeeds ? ["item:item-a"] : [],
      "drops the cached image only after a successful delete",
    );
  }
});

await test("a failed mutation cannot overwrite another chat's error", async () => {
  const api = {};
  vm.runInContext(stateSource, vm.createContext({ QM: api }));
  api.state.chatId = "chat-a";
  let fail;
  const request = new Promise((_resolve, reject) => {
    fail = reject;
  });
  const pending = api.state._mutate(request);
  api.state.chatId = "chat-b";
  api.state.error = "Current chat error";
  fail(new Error("Old chat error"));
  await pending;
  assert.equal(api.state.error, "Current chat error");
});

await test("returning to a chat does not accept a mutation from its previous visit", async () => {
  for (const fails of [false, true]) {
    const api = {};
    vm.runInContext(stateSource, vm.createContext({ QM: api }));
    const reads = [];
    api.listItems = () => new Promise((resolve) => reads.push(resolve));
    api.state.setChat("chat-a");
    let settle;
    const pending = api.state._mutate(
      new Promise((resolve, reject) => {
        settle = () => (fails ? reject(new Error("Previous visit")) : resolve({ items: [{ id: "old" }] }));
      }),
    );
    api.state.setChat("chat-b");
    api.state.setChat("chat-a");
    const currentRead = api.state._reload();
    const currentReload = api.state._reloadToken;
    settle();
    assert.equal(await pending, undefined);
    assert.equal(api.state.items, null);
    assert.equal(api.state.error, null);
    assert.equal(api.state._reloadToken, currentReload, "keeps the current visit's reload valid");
    reads.at(-1)({ items: [{ id: "current" }], outfits: [] });
    await currentRead;
    assert.equal(api.state.items[0].id, "current");
  }
});

await test("closing the active chat clears the panel's old error", async () => {
  const api = { state: { chatId: null } };
  vm.runInContext(
    await readFile(new URL("../packages/quartermaster/src/15-panel.js", import.meta.url), "utf8"),
    vm.createContext({ QM: api, document: { createElement: element } }),
  );
  for (const key of ["equippedContent", "outfitsContent", "inventoryContent", "errorNode"]) api.panel[key] = element();
  api.panel.errorNode.style.display = "";
  api.panel._updateContent();
  assert.equal(api.panel.errorNode.style.display, "none");
});

await test("detached elements wait for connection before changing shared state or mounting", async () => {
  const chats = [];
  const registry = new Map();
  let mounts = 0;
  let unmounts = 0;
  const api = {
    state: { setChat: (chatId) => chats.push(chatId) },
    panel: {
      mount(container) {
        this.container = container;
        mounts++;
      },
      unmount() {
        this.container = null;
        unmounts++;
      },
    },
  };
  class HostElement {
    isConnected = false;
    getAttribute() {
      return "tracker";
    }
    addEventListener() {}
    removeEventListener() {}
  }
  vm.runInContext(
    await readFile(new URL("../packages/quartermaster/src/90-element.js", import.meta.url), "utf8"),
    vm.createContext({
      QM: api,
      HTMLElement: HostElement,
      customElements: {
        get: (name) => registry.get(name),
        define: (name, value) => registry.set(name, value),
      },
    }),
  );
  const Component = registry.get("marinara-capability-quartermaster");
  const component = new Component();
  component.capabilityProps = { chatId: "stale-chat" };
  component.attributeChangedCallback("view", null, "tracker");
  component.capabilityProps = { chatId: "chat-a" };
  assert.deepEqual(chats, []);
  assert.equal(mounts, 0);
  component.isConnected = true;
  component.connectedCallback();
  assert.deepEqual(chats, ["chat-a"]);
  assert.equal(mounts, 1);
  component.isConnected = false;
  component.disconnectedCallback();
  component.capabilityProps = { chatId: "chat-b" };
  assert.deepEqual(chats, ["chat-a"]);
  assert.equal(unmounts, 1);
});

const apiSource = await readFile(new URL("../packages/quartermaster/src/00-api.js", import.meta.url), "utf8");
const flush = () => new Promise((resolve) => setImmediate(resolve));
const ok = { ok: true, status: 200, body: {} };
function loadApi({ secret = null, storageThrows = false, respond = () => ok } = {}) {
  const calls = [];
  const created = [];
  const revoked = [];
  const timers = [];
  const storage = { secret };
  const context = vm.createContext({
    localStorage: {
      getItem(key) {
        if (storageThrows) throw new Error("blocked");
        return key === "marinara_admin_secret" ? storage.secret : null;
      },
    },
    fetch: (url, init = {}) => {
      calls.push({ url, init });
      return Promise.resolve(respond(url)).then((result) => ({
        ok: result.ok,
        status: result.status,
        json: async () => result.body,
        blob: async () => ({ blob: url }),
      }));
    },
    URL: {
      createObjectURL: (blob) => {
        created.push(blob.blob);
        return `blob:${created.length}`;
      },
      revokeObjectURL: (objectUrl) => revoked.push(objectUrl),
    },
    setTimeout: (callback) => timers.push(callback),
    Event,
  });
  vm.runInContext(apiSource, context);
  const runTimers = () => timers.splice(0).forEach((callback) => callback());
  return { QM: vm.runInContext("QM", context), calls, created, revoked, storage, runTimers };
}
function imageElement() {
  const listeners = {};
  return {
    src: "",
    errors: [],
    addEventListener(name, handler) {
      (listeners[name] ??= []).push(handler);
    },
    dispatchEvent(event) {
      if (event.type === "error") this.errors.push(event.qmRetryable);
      for (const handler of listeners[event.type] ?? []) handler(event);
    },
  };
}
// Responses held until released, by URL, so tests control their order.
function heldResponses() {
  const waiting = [];
  return {
    respond: (url) => new Promise((resolve) => waiting.push({ url, resolve })),
    release(url, result = ok) {
      const index = waiting.findIndex((entry) => entry.url === url);
      waiting.splice(index, 1)[0].resolve(result);
    },
  };
}
const itemUrl = "/api/quartermaster/inventory/chat-a/persona/items/item-a/image";
const otherUrl = "/api/quartermaster/inventory/chat-a/persona/items/item-b/image";
const portraitUrl = "/api/quartermaster/inventory/chat-a/persona/outfits/outfit-a/portrait";

await test("package requests send the saved Admin Secret and the CSRF marker", async () => {
  const withSecret = loadApi({ secret: " s3cret " });
  await withSecret.QM.listItems("chat-a", "persona");
  await withSecret.QM.addItem("chat-a", "persona", { name: "Sword" });
  const [read, write] = withSecret.calls;
  assert.equal(read.init.headers["X-Admin-Secret"], "s3cret");
  assert.equal(read.init.headers["x-marinara-csrf"], undefined);
  assert.equal(read.init.headers["Content-Type"], undefined);
  assert.equal(write.init.headers["X-Admin-Secret"], "s3cret");
  assert.equal(write.init.headers["x-marinara-csrf"], "1");
  assert.equal(write.init.headers["Content-Type"], "application/json");

  for (const options of [{ secret: null }, { storageThrows: true }]) {
    const withoutSecret = loadApi(options);
    await withoutSecret.QM.listItems("chat-a", "persona");
    assert.equal(withoutSecret.calls[0].init.headers["X-Admin-Secret"], undefined);
  }
});

await test("a refused Admin Secret explains how to fix it on this device", async () => {
  const refused = () => ({ ok: false, status: 403, body: { error: "Invalid or missing X-Admin-Secret header" } });
  await assert.rejects(
    loadApi({ secret: "wrong", respond: refused }).QM.listItems("chat-a", "persona"),
    /does not match/,
  );
  await assert.rejects(loadApi({ respond: refused }).QM.listItems("chat-a", "persona"), /has no Admin Secret/);
  const missing = () => ({ ok: false, status: 404, body: { error: "Item not found" } });
  await assert.rejects(
    loadApi({ secret: "s", respond: missing }).QM.listItems("chat-a", "persona"),
    /^Error: Item not found$/,
  );
});

await test("gated images load with the Admin Secret and say whether a failure is worth retrying", async () => {
  const plain = loadApi();
  const plainImg = imageElement();
  plain.QM.setImageSrc(plainImg, itemUrl);
  assert.equal(plainImg.src, itemUrl, "no saved secret: plain src, as before");
  assert.equal(plain.calls.length, 0);

  const loaded = loadApi({ secret: "s3cret" });
  const loadedImg = imageElement();
  loaded.QM.setImageSrc(loadedImg, itemUrl);
  await flush();
  assert.equal(loaded.calls[0].init.headers["X-Admin-Secret"], "s3cret");
  assert.equal(loaded.calls[0].init.cache, "no-store");
  assert.equal(loadedImg.src, "blob:1");

  const engineImg = imageElement();
  loaded.QM.setImageSrc(engineImg, "/api/avatars/persona.png");
  assert.equal(engineImg.src, "/api/avatars/persona.png", "Engine URLs keep a plain src");

  const cases = [
    [() => ({ ok: false, status: 404, body: {} }), false],
    [() => ({ ok: false, status: 403, body: {} }), true],
    [() => ({ ok: false, status: 500, body: {} }), true],
    [() => Promise.reject(new Error("offline")), true],
  ];
  for (const [respond, retryable] of cases) {
    const failing = loadApi({ secret: "s3cret", respond });
    const img = imageElement();
    failing.QM.setImageSrc(img, itemUrl);
    await flush();
    assert.equal(img.src, "");
    assert.deepEqual(img.errors, [retryable]);
  }
});

await test("images are fetched once and shared by every element and repaint", async () => {
  const held = heldResponses();
  const api = loadApi({ secret: "s3cret", respond: held.respond });
  const first = imageElement();
  const second = imageElement();
  api.QM.setImageSrc(first, itemUrl);
  api.QM.setImageSrc(second, itemUrl);
  api.QM.setImageSrc(first, itemUrl);
  assert.equal(api.calls.length, 1, "concurrent loads across elements share one fetch");
  held.release(itemUrl);
  await flush();
  assert.equal(first.src, "blob:1");
  assert.equal(second.src, "blob:1");
  const rebuilt = imageElement();
  api.QM.setImageSrc(rebuilt, itemUrl);
  await flush();
  assert.equal(rebuilt.src, "blob:1", "a rebuilt row reuses the cached image");
  assert.equal(api.calls.length, 1);

  const failing = loadApi({ secret: "s3cret", respond: () => ({ ok: false, status: 500, body: {} }) });
  failing.QM.setImageSrc(imageElement(), itemUrl);
  await flush();
  const repainted = imageElement();
  failing.QM.setImageSrc(repainted, itemUrl);
  await flush();
  assert.equal(failing.calls.length, 1, "a failure is not refetched on every repaint");
  assert.deepEqual(repainted.errors, [true]);
});

await test("only an element's latest request applies, and forgotten images are never cached", async () => {
  const held = heldResponses();
  const api = loadApi({ secret: "s3cret", respond: held.respond });
  const img = imageElement();
  api.QM.setImageSrc(img, itemUrl);
  api.QM.setImageSrc(img, otherUrl);
  held.release(otherUrl);
  await flush();
  assert.equal(img.src, "blob:1");
  held.release(itemUrl);
  await flush();
  assert.equal(img.src, "blob:1", "an old response after a replacement completes is ignored");
  assert.deepEqual(img.errors, []);

  api.QM.setImageSrc(img, itemUrl);
  await flush();
  assert.equal(img.src, "blob:2", "A -> B -> A shows A");

  const portrait = imageElement();
  api.QM.setImageSrc(portrait, portraitUrl);
  api.QM.forgetImage(portraitUrl);
  held.release(portraitUrl);
  await flush();
  assert.equal(api.created.length, 2, "a response forgotten while loading creates no object URL");
  assert.equal(portrait.src, "");
  assert.deepEqual(portrait.errors, []);
  api.QM.setImageSrc(portrait, portraitUrl);
  assert.equal(api.calls.length, 4, "the next render fetches the replacement");

  api.QM.forgetImage(itemUrl);
  assert.deepEqual(api.revoked, [], "revocation waits for elements still loading the old URL");
  api.runTimers();
  assert.deepEqual(api.revoked, ["blob:2"]);
});

await test("reopening the dock retries real failures, and a new Admin Secret retries everything", async () => {
  const api = loadApi({
    secret: "s3cret",
    respond: (url) => (url === itemUrl ? { ok: false, status: 404, body: {} } : { ok: false, status: 500, body: {} }),
  });
  api.QM.setImageSrc(imageElement(), itemUrl);
  api.QM.setImageSrc(imageElement(), otherUrl);
  await flush();
  api.QM.retryFailedImages();
  api.QM.setImageSrc(imageElement(), itemUrl);
  api.QM.setImageSrc(imageElement(), otherUrl);
  assert.deepEqual(
    api.calls.slice(2).map((call) => call.url),
    [otherUrl],
    "only the non-404 failure is retried on reopen",
  );

  api.QM._missingItemImageIds.add("item-a");
  api.storage.secret = "new-secret";
  api.QM.setImageSrc(imageElement(), itemUrl);
  assert.equal(api.QM._missingItemImageIds.size, 0, "remembered missing items get a fresh try");
  assert.equal(api.calls.at(-1).url, itemUrl);
  assert.equal(api.calls.at(-1).init.headers["X-Admin-Secret"], "new-secret");
});

const serverSource = await readFile(new URL("../packages/quartermaster/server.mjs", import.meta.url), "utf8");
const agentDefinitions = JSON.parse(
  await readFile(new URL("../packages/quartermaster/agents.json", import.meta.url), "utf8"),
);
const slotContext = vm.createContext({ QM: {} });
vm.runInContext(stateSource, slotContext);
vm.runInContext(
  await readFile(new URL("../packages/quartermaster/src/04-icons.js", import.meta.url), "utf8"),
  slotContext,
);
const slotValue = (name) => vm.runInContext(name, slotContext);
const clientSlots = [...slotValue("QM_EQUIP_SLOTS")];

await test("server, client and tracker prompt list the same slots, worn layers outer to inner", () => {
  const serverSlots = [...serverSource.match(/const EQUIP_SLOTS = \[([\s\S]*?)\];/)[1].matchAll(/"([^"]+)"/g)].map(
    (match) => match[1],
  );
  const promptSlots = agentDefinitions[0].defaultPromptTemplate
    .match(/Valid slots \(use these exact ids only\): ([^.]+)\./)[1]
    .split(", ");
  assert.deepEqual(clientSlots, serverSlots);
  assert.deepEqual(promptSlots, serverSlots);
  const before = (...slots) =>
    slots.slice(1).forEach((slot, index) => {
      assert.ok(serverSlots.indexOf(slots[index]) < serverSlots.indexOf(slot), `${slots[index]} before ${slot}`);
    });
  before("armor_torso", "outerwear_torso", "midlayer_torso", "clothing_torso", "underwear_top");
  before("armor_legs", "outerwear_legs", "midlayer_legs", "clothing_legs", "underwear_bottom");
  before("feet", "socks");
  assert.deepEqual(serverSlots.slice(-3), ["extra_wearable_1", "extra_wearable_2", "extra_wearable_3"]);
});

await test("every slot is on the portrait ring once, with labels, an icon, and a distinct search label", () => {
  const ringSlots = [
    ...slotValue("QM_OVERLAY_TOP_SLOTS"),
    ...slotValue("QM_OVERLAY_SLOT_PAIRS").flat(),
    ...Object.values(slotValue("QM_OVERLAY_SLOT_LAYERS")).flat(),
    ...slotValue("QM_OVERLAY_BOTTOM_SLOTS"),
    ...slotValue("QM_OVERLAY_EXTRA_SLOTS"),
  ];
  assert.deepEqual([...ringSlots].sort(), [...clientSlots].sort());
  const labels = slotValue("QM_SLOT_LABELS");
  for (const slot of clientSlots) {
    assert.ok(labels[slot], `${slot} label`);
    assert.ok(slotValue("QM_OVERLAY_SLOT_LABELS")[slot], `${slot} ring label`);
    assert.ok(slotValue("QM_OVERLAY_SLOT_LABEL_LINES")[slot]?.length, `${slot} ring label lines`);
    assert.ok(slotValue("QM_SLOT_ICON_PATHS")[slot], `${slot} drawn icon`);
  }
  // The Bag's slot search matches a label by substring, so no label may contain another.
  for (const a of clientSlots) {
    for (const b of clientSlots) {
      if (a !== b) assert.ok(!labels[a].toLowerCase().includes(labels[b].toLowerCase()), `${a} vs ${b}`);
    }
  }
});

await test("clothing layers sit beside the inner box when they fit, otherwise stack outer first above it", () => {
  const saved = {
    build: dock._buildOverlaySlotBox,
    container: dock.equippedContainer,
    portrait: dock.portraitWrapper,
    built: dock._layersBesideBuilt,
    createElement: context.document.createElement,
  };
  // In the real bundle 05-state.js shares the dock's scope; this context loads only the dock files.
  context.QM_OVERLAY_SLOT_LAYERS = slotValue("QM_OVERLAY_SLOT_LAYERS");
  dock._buildOverlaySlotBox = (slot) => ({ slot });
  context.document.createElement = () => ({
    style: {},
    children: [],
    append(...nodes) {
      this.children.push(...nodes);
    },
  });
  // Copied into this realm first: arrays built inside the vm context have a different prototype.
  const slotsOf = (nodes) => [...nodes].map((node) => node.slot);
  try {
    const layers = (slot, side, beside) => dock._withClothingLayers(slot, { slot }, side, beside);
    assert.deepEqual(slotsOf(layers("clothing_torso", "left", false)), [
      "outerwear_torso",
      "midlayer_torso",
      "clothing_torso",
    ]);
    assert.deepEqual(slotsOf(layers("clothing_legs", "right", false)), [
      "outerwear_legs",
      "midlayer_legs",
      "clothing_legs",
    ]);
    const [torsoRow] = layers("clothing_torso", "left", true);
    assert.deepEqual(slotsOf(torsoRow.children), ["outerwear_torso", "midlayer_torso", "clothing_torso"]);
    const [legsRow] = layers("clothing_legs", "right", true);
    assert.deepEqual(slotsOf(legsRow.children), ["clothing_legs", "midlayer_legs", "outerwear_legs"]);
    assert.deepEqual(slotsOf(layers("armor_torso", "left", true)), ["armor_torso"]);

    // Two sides of 3 * 92 + 2 * 4, the 160px portrait, and two 8px column gaps.
    dock.portraitWrapper = { offsetWidth: 160 };
    dock.equippedContainer = { clientWidth: 744 };
    assert.equal(dock._clothingLayersBeside(), true);
    dock.equippedContainer = { clientWidth: 743 };
    assert.equal(dock._clothingLayersBeside(), false);
    dock.equippedContainer = { clientWidth: 0 };
    dock._layersBesideBuilt = true;
    assert.equal(dock._clothingLayersBeside(), true, "nothing measurable keeps the last layout");
  } finally {
    dock._buildOverlaySlotBox = saved.build;
    dock.equippedContainer = saved.container;
    dock.portraitWrapper = saved.portrait;
    dock._layersBesideBuilt = saved.built;
    context.document.createElement = saved.createElement;
  }
});
