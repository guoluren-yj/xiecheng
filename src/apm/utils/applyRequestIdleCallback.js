export default function applyRequestIdleCallback(win) {
  return win.requestIdleCallback ||  ((callback) => win.setTimeout(callback, 1));
}
