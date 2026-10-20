import getDefaultLocation from '../utils/getDefaultLocation';
import { captureCurrentContext, syncReportWithCapturedContext } from '../utils/captureCurrentContext';

const EV_METHOD_MAP = {
  sri: 'reportSri',
  st: 'reportResourceError',
  err: 'captureException',
};

function createStore(e) {
  return Object.keys(e).reduce((e, t) => {
    e[t] = [];
    return e;
  }, {});
}

function reverseMap(n) {
  return Object.keys(n).reduce((e, t) => {
    e[n[t]] = t;
    return e;
  }, {});
}

function getStoreOrConsume(client, store, evmethodmap) {
  return (e, t, timestamp = Date.now(), url = getDefaultLocation() && location.href) => {
    const r = {
      ...captureCurrentContext(client),
      url,
      timestamp,
    };
    if (store[e]) {
      if (client[evmethodmap[e]]) {
        syncReportWithCapturedContext(client, r)(() => {
          client[evmethodmap[e]](t);
        });
      } else {
        store[e].push([t, r]);
      }
    }
  };
}

function getConsumeStored(client, store, reversedMap) {
  return (key) => {
    if (key in reversedMap) {
      store[reversedMap[key]]?.forEach(([t, e]) => {
        syncReportWithCapturedContext(client, e)(function () {
          client[key](t);
        });
      });
      store[reversedMap[key]] = null;
    }
  };
}

export default function PrecollectPlugin(client, evmethodmap = EV_METHOD_MAP) {
  var store = createStore(evmethodmap),
    reversedMap = reverseMap(evmethodmap),
    storeOrConsume = getStoreOrConsume(client, store, evmethodmap);
  client?.p?.a?.observe?.(([, n, r, e, t]) => {
    storeOrConsume(n, r, e, t);
  });

  client.on('init', function () {
    client.p?.a?.forEach(([, n, r, e, t]) => {
      storeOrConsume(n, r, e, t);
    });
    if (client.p && client.p.a) {
      client.p.a.length = 0;
    }
  });
  client.provide('precollect', storeOrConsume);
  client.on('provide', getConsumeStored(client, store, reversedMap));
}
