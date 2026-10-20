import { noop } from 'lodash';
import getDefaultDocument from '../utils/getDefaultDocument';
import getPluginConfig from '../utils/getPluginConfig';
import applyMonitor from '../utils/applyMonitor';
import htmlTreeAsString from '../utils/htmlTreeAsString';

function applyDomAndKeyPress(defer) {
  let timer;

  function handleEvent(name, fn) {
    let event;
    return (newEvent) => {
      timer = undefined;

      if (newEvent && event !== newEvent) {
        event = newEvent;
        fn({ event, name });
      }
    };
  }

  return [
    handleEvent,
    (fn) => (event) => {
      let t;
      try {
        t = event.target;
      } catch (e) {
        return;
      }
      const n = t && t.tagName;
      if (n && ('INPUT' === n || 'TEXTAREA' === n || t.isContentEditable)) {
        if (!timer) {
          handleEvent('input', fn)(event);
        }

        clearTimeout(timer);
        timer = window.setTimeout(() => {
          timer = undefined;
        }, defer);
      }
    },
  ];
}

function triggerHandlers(handle, enable) {
  return (arg) => {
    if (enable) {
      try {
        handle(arg);
      } catch (error) {
      }
    }
  };
}

function domBreadcrumb(n) {
  return (e) => {
    let t;
    try {
      t = e.event.target ? htmlTreeAsString(e.event.target) : htmlTreeAsString(e.event);
    } catch (error) {
      t = '<unknown>';
    }
    if (0 !== t.length) {
      n({ type: 'dom', category: 'ui.' + e.name, message: t });
    }
  };
}

function id(e) {
  return e;
}

function applyBreadcrumb(t = 20, n = id, r = (e, t) => e.slice(-t)) {
  let breadcrumbs = [];
  return [
    () => breadcrumbs,
    (breadcrumb) => {
      if (n(breadcrumb)) {
        breadcrumb = {
          ...breadcrumb,
          timestamp: breadcrumb.timestamp || Date.now(),
        };
        breadcrumbs = 0 <= t && breadcrumbs.length + 1 > t
          ? r([...breadcrumbs, breadcrumb], t)
          : [...breadcrumbs, breadcrumb];
      }
    },
  ];
}

function BreadcrumbMonitor(doc = getDefaultDocument()) {
  if (doc) {
    return function (config) {
      const { maxBreadcrumbs, onAddBreadcrumb, onMaxBreadcrumbs, dom } = config;
      const [handleEvent, handlePress] = applyDomAndKeyPress(100);
      const [getBreadcrumbs, addBreadcrumb] = applyBreadcrumb(maxBreadcrumbs, onAddBreadcrumb, onMaxBreadcrumbs);
      const doBreadcrumb = domBreadcrumb(addBreadcrumb);
      const handles = [];
      if (dom) {
        handles.push(handleEvent('click', triggerHandlers(doBreadcrumb, 'dom')));
        handles.push(handlePress(triggerHandlers(doBreadcrumb, 'dom')));
        doc.addEventListener('click', handles[0]);
        doc.addEventListener('keypress', handles[1]);
      }
      return [getBreadcrumbs, addBreadcrumb, () => {
        doc.removeEventListener('click', handles[0]);
        doc.removeEventListener('keypress', handles[1]);
      }];
    };
  }
}

const BREADCRUMB_MONITOR_PLUGIN_NAME = 'breadcrumb';
const defaultConfig$6 = { maxBreadcrumbs: 20, dom: true };

export default function BreadcrumbMonitorPlugin(client) {
  client.on('init', () => {
    const pluginConfig = getPluginConfig(client, BREADCRUMB_MONITOR_PLUGIN_NAME, defaultConfig$6);

    if (pluginConfig) {
      const [getBreadcrumbs, addBreadcrumb, beforeDestroy] = applyMonitor(BreadcrumbMonitor, pluginConfig, noop);
      client.on('report', (e) => {
        if ('http' === e.eventType) {
          addBreadcrumb({
            type: 'http',
            category: e.payload.api,
            message: '',
            data: {
              method: e.payload.request.method,
              url: e.payload.request.url,
              status_code: String(e.payload.response.status),
            },
            timestamp: e.payload.request.timestamp,
          });
        }
        return e;
      });

      client.on('beforeDestroy', beforeDestroy);
      client.provide('getBreadcrumbs', getBreadcrumbs);
      client.provide('addBreadcrumb', addBreadcrumb);
    }
  });
}
