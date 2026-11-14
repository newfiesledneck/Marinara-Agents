// Quartermaster — the public client API for other packages: window.Quartermaster.
// A package on the Home tab (or anywhere with no chat) opens the dock on a sheet
// of its own, a scope "<package id>:<key>" (README, "For other packages").
//
// The client bundle is only loaded by the Engine once a chat slot mounts it, so
// a host loads it first:
//   await import(`/api/capability-packages/quartermaster/client?v=${version}`)
// with the version from GET /api/quartermaster/status. It is the same address
// the Engine uses, so the browser keeps one copy.
//
// Nothing here runs for a chat unless another package calls it.

// Same rules as server.mjs (QM_SCOPE_RE, QM_OWNER_RE); the server checks again.
const QM_HOST_SCOPE_RE = /^[a-z0-9][a-z0-9-]{0,63}:[A-Za-z0-9_-]{1,100}$/;
const QM_HOST_OWNER_RE = /^[A-Za-z0-9_-]{1,100}(:[A-Za-z0-9_-]{1,100})?$/;

// The sheet a host has the dock open on, and the chat to go back to when that
// dock closes (90-element.js records it while the host's sheet is showing).
QM.hostSheet = null;
QM.hostReturnChatId = null;

QM.releaseHostSheet = () => {
  QM.hostSheet = null;
  if (QM.dock.root) delete QM.dock.root.dataset.qmHost;
  const chatId = QM.hostReturnChatId;
  QM.hostReturnChatId = null;
  QM.state.setChat(chatId);
};

const Quartermaster = {
  version: typeof QM_VERSION === "string" ? QM_VERSION : null,
  // Grows as the client API does; never shrinks. The server's own list is GET /status.
  features: ["open", "reload", "changed-event", "icon"],
  icon: QM_ICON_SVG,

  // Opens the dock on a host's sheet and reads it afresh, since the host may
  // have changed it through the routes while the dock was closed. `persona`,
  // when given, says who the sheet is about first ({ personaId, name,
  // appearance, avatarUrl }, any of them). Rejects on a bad scope or owner.
  async open({ scope, owner = "persona", persona } = {}) {
    if (typeof scope !== "string" || !QM_HOST_SCOPE_RE.test(scope)) {
      throw new TypeError('Quartermaster.open needs a scope like "my-package:world-1"');
    }
    if (typeof owner !== "string" || !QM_HOST_OWNER_RE.test(owner)) {
      throw new TypeError('Quartermaster.open: owner must look like "persona" or "character:<id>"');
    }
    if (persona && typeof persona === "object") await QM.setSheetOwner(scope, owner, persona);
    if (!QM.hostSheet) QM.hostReturnChatId = QM.state.chatId;
    QM.hostSheet = { scope, owner };
    const alreadyShowing = QM.state.chatId === scope && QM_OWNER_ID === owner;
    QM.state.setSheet(scope, owner);
    QM.dock.openPanel();
    if (QM.dock.root) QM.dock.root.dataset.qmHost = scope.split(":")[0];
    // A new sheet is loaded by setSheet; one already showing is read again.
    if (alreadyShowing) QM.state._reload();
  },

  close() {
    QM.dock.close();
  },

  toggle(options) {
    if (QM.dock.isOpen()) QM.dock.close();
    else return Quartermaster.open(options);
  },

  isOpen() {
    return QM.dock.isOpen();
  },

  // "I changed this sheet through the routes, read it again." Does nothing
  // unless that sheet is the one showing.
  reload(scope, owner = "persona") {
    if (QM.state.chatId === scope && QM_OWNER_ID === owner) QM.state._reload();
  },

  // Calls fn({ scope, owner }) after the dock or panel changes a sheet (a chat's
  // too: scope is then the chat id). Returns a function that stops it. The same
  // news is the window event "quartermaster:changed".
  onChange(fn) {
    const listener = (event) => fn(event.detail);
    window.addEventListener("quartermaster:changed", listener);
    return () => window.removeEventListener("quartermaster:changed", listener);
  },
};

if (typeof window !== "undefined") window.Quartermaster = Quartermaster;
