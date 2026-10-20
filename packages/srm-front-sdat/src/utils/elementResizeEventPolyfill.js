/* eslint-disable no-multi-assign */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-destructuring */
import ResizeObserver from 'resize-observer-polyfill';

const addEventListener = EventTarget.prototype.addEventListener;

const createHTMLEvent = (type) => {
  const event = document.createEvent('HTMLEvents');
  event.initEvent(type);
  return event;
};

export const EventListenerWrapper = function addEventListenerWrapper(type) {
  if (type === 'resize') {
    registerEvent(this);
  }

  addEventListener.apply(this, arguments);
};

function initObserver(callback) {
  const observer = (initObserver.observer = initObserver.observer || new ResizeObserver(callback));
  observer.initialized = true;

  return observer;
}

function registerEvent(elm) {
  const observer = initObserver((entries) => {
    if (observer.initialized) {
      observer.initialized = false;
      return;
    }
    for (const entry of entries) {
      const event = createHTMLEvent('resize');
      entry.target.dispatchEvent(event);
      if (entry && entry.target && typeof entry.target.onresize === 'function') {
        entry.target.onresize(event);
      }
    }
  });

  observer.observe(elm);
}

HTMLElement.prototype.addEventListener = EventListenerWrapper;

Reflect.defineProperty(HTMLElement.prototype, 'onresize', {
  set(handler) {
    this._onresize = handler;
    if (typeof handler !== 'function') {
      return;
    }
    registerEvent(this);
  },
  get() {
    return this._onresize || null;
  },
});
