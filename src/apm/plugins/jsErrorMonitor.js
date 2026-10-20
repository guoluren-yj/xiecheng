import { isFunction, isPlainObject, isString, pick } from 'lodash';
import getDefaultBrowser from '../utils/getDefaultBrowser';
import getDefaultXMLHttpRequest from '../utils/getDefaultXMLHttpRequest';
import getPluginConfig from '../utils/getPluginConfig';
import reportSelfError from '../utils/reportSelfError';
import getRegexp from '../utils/getRegexp';
import safeStringify from '../utils/safeStringify';
import hookObjectProperty from '../utils/hookObjectProperty';
import applyMonitor from '../utils/applyMonitor';

function isError(e) {
  switch (Object.prototype.toString.call(e)) {
    case'[object Error]':
    case'[object Exception]':
    case'[object DOMError]':
    case'[object DOMException]':
      return !0;
    default:
      return e instanceof Error;
  }
}

function isInstanceOf(e, t) {
  try {
    return e instanceof t;
  } catch (e) {
    return false;
  }
}

function isEvent(e) {
  return 'undefined' != typeof Event && isInstanceOf(e, Event);
}

function isErrorEvent(e) {
  return '[object ErrorEvent]' === Object.prototype.toString.call(e);
}

function isPromiseRejectionEvent(e) {
  return '[object PromiseRejectionEvent]' === Object.prototype.toString.call(e);
}

const ERROR_FIELDS = ['name', 'message', 'stack', 'filename', 'lineno', 'colno'];
const JS_ERROR_DEDUPE_DEFFER = 1e3;


function normalize(e) {
  if (isError(e)) {
    return pick(e, ERROR_FIELDS);
  } else if (isPlainObject(e) || isEvent(e) || isString(e)) {
    return { message: safeStringify(e) };
  }
}

function normalizeError(e) {
  return normalize(e.error);
}

function normalizeException(e) {
  try {
    let reason = undefined;
    if ('reason' in e) {
      reason = e.reason;
    } else if ('detail' in e && 'reason' in e.detail) {
      reason = e.detail.reason;
    }
    if (reason) {
      const r = normalize(reason);
      return {
        ...r,
        name: (r && r.name) || 'UnhandledRejection',
      };
    }
  } catch (e) {
  }
}

function normalizeUnknownError(e) {
  return (isErrorEvent(e) ? normalizeError : isPromiseRejectionEvent(e) ? normalizeException : normalize)(e);
}

const DEFAULT_EVENT_TARGET = ['EventTarget', 'Window', 'Node', 'ApplicationCache', 'ChannelMergerNode', 'EventSource', 'FileReader', 'HTMLUnknownElement', 'IDBDatabase', 'IDBRequest', 'IDBTransaction', 'MessagePort', 'Notification', 'SVGElementInstance', 'Screen', 'TextTrack', 'TextTrackCue', 'TextTrackList', 'WebSocket', 'Worker', 'XMLHttpRequest', 'XMLHttpRequestEventTarget', 'XMLHttpRequestUpload'];
const DEFAULT_TIME_FUNCTION = ['setTimeout', 'setInterval', 'requestAnimationFrame', 'requestIdleCallback'];
const xmlHttpRequestProps = ['onload', 'onerror', 'onprogress', 'onreadystatechange'];
const ADD_EVENT_LISTENER = 'addEventListener';
const REMOVE_EVENT_LISTENER = 'removeEventListener';
const DEFAULT_SOURCE_TYPE = 'capture-global';


function hookGlobalAsync(o, win = getDefaultBrowser(), ajax = getDefaultXMLHttpRequest()) {
  function a(e, n) {
    if (!isFunction(e)) {
      return e;
    }
    const source = {
      type: DEFAULT_SOURCE_TYPE,
      data: { ...n },
    };
    if (!e._w_) {
      e._w_ = function () {
        try {
          return (e.handleEvent && isFunction(e.handleEvent) ? e.handleEvent : e)
            .apply(this, [].map.call(arguments, (e) => a(e, n)));
        } catch (e) {
          const error = normalize(e);
          if (error) {
            o({ error, source });
          }
          throw e;
        }
      };
    }
    const { _w_ } = e;

    _w_._hook_ = true;
    return _w_;
  }

  const n = [];

  if (win) {
    n.push(
      ...DEFAULT_TIME_FUNCTION
        .filter((e) => win[e])
        .map((o) => {
          return hookObjectProperty(
            win,
            o,
            (r) => {
              return function (e, ...t) {
                return r && r.call(
                  ...[this, a(e, { function: o }), ...t],
                );
              };
            },
            false,
          )();
        }),
    );
  }

  if (ajax && ajax.prototype) {
    n.push(
      hookObjectProperty(
        ajax.prototype,
        'send',
        (r) => {
          return function (...t) {
            xmlHttpRequestProps
              .filter((e) => t[e] && !t[e]._hook_)
              .forEach((e) => {
                t[e] = a(t[e], { function: e });
              });

            return r.apply(this, e);
          };
        },
        false,
      )(),
    );
  }

  DEFAULT_EVENT_TARGET.forEach((eventTarget) => {
    const proto = win[eventTarget] && win[eventTarget].prototype;
    if (proto && proto[ADD_EVENT_LISTENER]) {
      n.push(
        hookObjectProperty(
          proto,
          ADD_EVENT_LISTENER,
          (o) => {
            return function (e, t, n) {
              try {
                const handleEvent = t.handleEvent;
                if (isFunction(handleEvent)) {
                  t.handleEvent = a(handleEvent, { function: 'handleEvent', target: eventTarget });
                }
              } catch (e) {
              }
              return o && o.call(this, e, a(t, { function: ADD_EVENT_LISTENER, target: eventTarget }), n);
            };
          },
          false,
        )(),
      );

      n.push(
        hookObjectProperty(
          proto,
          REMOVE_EVENT_LISTENER,
          (r) => {
            return function (e, t, n) {
              if (null != t && t._w_) {
                r.call(this, e, t._w_, n);
              }
              return r.call(this, e, t, n);
            };
          },
          false,
        )(),
      );
    }
  });

  return n;
}

function formatDate(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function doDedupe(defer) {
  const errors = new Map();
  return (error, source, callback) => {
    try {
      const key = `${error.message || ''}:${error.stack}:${source.type}`;
      let info = errors.get(key);
      if (info) {
        clearTimeout(info.timer);
        errors.set(key, {
          ...info,
          extra: {
            count: info.extra.count + 1,
            time: {
              ...info.extra.time,
              endTime: formatDate(),
            },
          },
        });
      } else {
        info = {
          key,
          extra: {
            count: 1,
            time: {
              startTime: formatDate(),
              endTime: formatDate(),
            },
          },
          error,
          source,
        };
        errors.set(key, info);
      }
      info.timer = setTimeout(() => {
        errors.delete(info.key);
        callback(info.error, info.source, info.extra);
      }, defer);
    } catch (error) {
      reportSelfError(error);
    }
  };
}

function JsErrorMonitor(win = getDefaultBrowser()) {
  if (win) {
    return (config, post) => {
      const {
        ignoreErrors,
        onerror,
        onunhandledrejection,
        captureGlobalAsync,
      } = config;
      const regexp = getRegexp(ignoreErrors);
      const subjects = [];
      const dedupe = doDedupe(JS_ERROR_DEDUPE_DEFFER);
      const report = (params) => {
        const {
          error,
          source,
        } = params;
        if (post && error && !(regexp && regexp.test(error.message))) {
          dedupe(error, source, (errorInfo, errorSource, extra) => {
            post({
              eventType: JS_ERROR_EV_TYPE,
              ...extra,
              payload: {
                error: errorInfo,
                source: errorSource,
                breadcrumbs: [],
              },
            });
          });
        }
      };
      if (onerror) {
        const handle = (error) => report({
          error: normalizeError(error),
          source: { type: 'onerror' },
        });
        win.addEventListener('error', handle);
        subjects.push(() => win.removeEventListener('error', handle));
      }
      if (onunhandledrejection) {
        const handle = (error) => report({
          error: normalizeException(error),
          source: { type: 'onunhandledrejection' },
        });
        win.addEventListener('unhandledrejection', handle);
        subjects.push(() => win.removeEventListener('unhandledrejection', handle));
      }
      if (captureGlobalAsync) {
        subjects.push(...hookGlobalAsync(report));
      }

      return [
        function (e/*, t, n*/) {
          return report({
            error: normalizeUnknownError(e),
            // extra: t,
            // react: n,
            // source: { type: 'manual' },
          });
        },
        function () {
          subjects.forEach((dispose) => dispose());
        },
      ];
    };
  }
}

const JS_ERROR_EV_TYPE = 'js_error';
const JS_ERROR_MONITOR_PLUGIN_NAME = 'jsError';
const defaultConfig$4 = {
  ignoreErrors: [],
  onerror: true,
  onunhandledrejection: true,
  captureGlobalAsync: false,
};

export default function JsErrorMonitorPlugin(client) {

  client.on('init', () => {
    window.removeEventListener('error', client.pcErr, true);
    window.removeEventListener('unhandledrejection', client.pcRej, true);

    const pluginConfig = getPluginConfig(client, JS_ERROR_MONITOR_PLUGIN_NAME, defaultConfig$4);
    if (pluginConfig) {
      const [captureException, beforeDestroy] = applyMonitor(JsErrorMonitor, pluginConfig, (data) => {
        if (client.getBreadcrumbs) {
          data.payload.breadcrumbs = client.getBreadcrumbs();
        }
        client.report(data);
      });

      client.on('beforeDestroy', beforeDestroy);
      client.provide('captureException', captureException);
    }
  });
}
