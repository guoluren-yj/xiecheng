import { noop } from 'lodash';
import getDefaultHistory from '../utils/getDefaultHistory';
import getDefaultDocument from '../utils/getDefaultDocument';
import getDefaultBrowser from '../utils/getDefaultBrowser';
import getPluginConfig from '../utils/getPluginConfig';
import hookObjectProperty from '../utils/hookObjectProperty';
import { initPrivateSubject } from './subject';
import getFirstPVSubject from '../subjects/getFirstPVSubject';

const HISTORY_SUBJECT_NAME = 'history_0';
const HASH_SUBJECT_NAME = 'hash_0';

function observeHistory(subscribe, unsubscribe) {
  const history = getDefaultHistory();
  if (history) {
    const handlePopstate = () => subscribe(location.href);
    const handleStateChange = function (n) {
      return function (...e) {
        try {
          n.apply(history, e);
        } finally {
          handlePopstate();
        }
      };
    };
    const subjects = [];
    subjects.push(
      hookObjectProperty(history, 'pushState', handleStateChange)(),
      hookObjectProperty(history, 'replaceState', handleStateChange)(),
    );

    window.addEventListener('popstate', handlePopstate, true);

    subjects.push(() => window.removeEventListener('popstate', handlePopstate, true));
    unsubscribe(() => {
      subjects.forEach((dispose) => dispose());
    });
  }
}

function observeHash(subscribe, unsubscribe) {
  const win = getDefaultBrowser();
  if (win) {
    const handleHashChange = () => subscribe(location.href);
    win.addEventListener('hashchange', handleHashChange, true);

    unsubscribe(() => win.removeEventListener('hashchange', handleHashChange, true));
  }
}

const hashSubject = [HASH_SUBJECT_NAME, observeHash];
const historySubject = [HISTORY_SUBJECT_NAME, observeHistory];

function parseUrl(href) {
  const doc = getDefaultDocument();
  if (!doc || !href) {
    return { url: href, protocol: '', domain: '', query: '', path: '', hash: '' };
  }
  const a = doc.createElement('a');
  a.href = href;
  let path = a.pathname || '/';
  if ('/' !== path[0]) {
    path = `/${path}`;
  }
  return {
    url: a.href,
    protocol: a.protocol.slice(0, -1),
    domain: a.hostname,
    query: a.search.substring(1),
    path,
    hash: a.hash,
  };
}

function getDefaultExtractor(routeMode) {
  return (href) => {
    if (routeMode === 'hash') {
      return parseUrl(href).hash?.replace(/^#/, '') || '/';
    }
    return parseUrl(href).path;
  };
}

function applyOnPidChange(report, extractPid, extractor, onPidUpdate) {
  let oldExtractor = extractor;
  let oldExtractPid = extractPid;
  if (onPidUpdate) {
    onPidUpdate(extractPid);
  }
  return [
    (evtName, newExtractPid, newExtractor) => {
      if ('user_set' !== evtName && newExtractPid !== oldExtractor) {
        oldExtractor = newExtractPid;
        oldExtractPid = newExtractor || oldExtractor;
        if (onPidUpdate) {
          onPidUpdate(oldExtractPid);
        }
        report(evtName, oldExtractPid);
      } else if ('user_set' === evtName && newExtractPid !== oldExtractPid) {
        oldExtractPid = newExtractPid;
        if (onPidUpdate) {
          onPidUpdate(oldExtractPid);
        }
        report(evtName, oldExtractPid);
      }
    },
    () => {
      if (extractPid) {
        report('init', extractPid);
      }
    },
  ];
}

function applyOnUrlChange(apply, url) {
  let oldUrl = url;
  return [
    (routeMode, newUrl) => {
      if (newUrl !== oldUrl) {
        oldUrl = newUrl;
        apply(routeMode, oldUrl);
      }
    },
  ];
}

function wrapPageview(e, t) {
  return {
    eventType: 'pageview',
    payload: {
      pid: t,
      source: e,
    },
  };
}

function applyReportPageview(n) {
  return (e, t) => {
    n(wrapPageview(e, t));
  };
}

function isManualMode(e) {
  return 'manual' === e;
}

function pvGetterWithRouteObserver(e, t, n, config) {
  const { sendInit, initPid, routeMode } = config;
  const isManualMode$ = isManualMode(routeMode);
  const extractor = isManualMode$ ? () => '' : getDefaultExtractor(routeMode);
  const extractPid = config.extractPid || noop;
  const { href } = location;
  const [subscribe, unsubscribe] = applyOnPidChange(
    applyReportPageview(e),
    initPid || (extractPid(href) ?? extractor(href)),
    extractor(href),
    config.onPidUpdate,
  );
  if (!isManualMode$) {
    const [a] = applyOnUrlChange(
      (e, t) => subscribe(e, extractor(t), extractPid(t)),
      '',
    );
    if (n.length) {
      n.forEach((e) => t.push(e[0]((e) => a(routeMode, e))));
    }
  }
  if (sendInit) {
    unsubscribe();
  }
  return [subscribe.bind(null, 'user_set')];
}

const PAGEVIEW_MONITOR_PLUGIN_NAME = 'pageview';
const defaultConfig$3 = { sendInit: true, routeMode: 'history' };

export default function PageviewMonitorPlugin(client) {
  client.on('init', () => {
    const pluginConfig = getPluginConfig(client, PAGEVIEW_MONITOR_PLUGIN_NAME, defaultConfig$3);
    if (pluginConfig && location) {
      const e = [];
      const { routeMode, onPidUpdate } = pluginConfig;
      const [n] = pvGetterWithRouteObserver(
        client.report.bind(client),
        e,
        isManualMode(routeMode) ? [] : [client.initSubject(hashSubject), client.initSubject(historySubject)],
        {
          ...pluginConfig,
          initPid: client.config()?.pid,
          onPidUpdate(pid) {
            if (onPidUpdate) {
              onPidUpdate(pid);
            }
            client.set({
              pid,
              viewId: `${pid}_${Date.now()}`,
              actionId: undefined,
            });
          },
        },
      );

      initPrivateSubject(client, getFirstPVSubject(client), -1);

      client.on('config', () => {
        n(client.config().pid);
      });

      client.on('beforeDestroy', () => {
        e.forEach((e) => e());
      });
      client.provide('sendPageview', n);
    }
  });
}
