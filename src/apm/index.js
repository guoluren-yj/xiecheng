import uuid from 'uuid/v4';
import { defaultTo, isArray, isFunction, isObject, isPlainObject, isString, noop } from 'lodash';
import md5 from 'spark-md5';
import JSEncrypt from 'jsencrypt';
import getGlobalRegistry from './utils/getGlobalRegistry';
import getDefaultBrowser from './utils/getDefaultBrowser';
import getLocationUrl from './utils/getLocationUrl';
import { captureCurrentContext, syncReportWithCapturedContext } from './utils/captureCurrentContext';
import safeStringify from './utils/safeStringify';
import hookObjectProperty from './utils/hookObjectProperty';
import invokeCallbackOnce from './utils/invokeCallbackOnce';
import SubjectPlugin from './plugins/subject';
import SamplePlugin from './plugins/sample';
import PrecollectPlugin from './plugins/precollect';
import CustomPlugin from './plugins/custom';
import PageviewMonitorPlugin from './plugins/pageviewMonitor';
import AjaxMonitorVolPlugin from './plugins/ajaxMonitor';
import FetchMonitorVolPlugin from './plugins/fetchMonitor';
import BreadcrumbMonitorPlugin from './plugins/breadcrumbMonitor';
import JsErrorMonitorPlugin from './plugins/jsErrorMonitor';
import ResourceErrorMonitorPlugin from './plugins/resourceErrorMonitor';
import ResourceMonitorPlugin from './plugins/resourceMonitor';
import PerformanceMonitorPlugin from './plugins/performanceMonitor';
import TTIMonitorPlugin from './plugins/ttiMonitor';
import FMPMonitorPlugin from './plugins/fmpMonitor';
// import BlankScreenMonitorVolPlugin from './plugins/blankScreenMonitor';
import SPALoadMonitorPlugin from './plugins/spaLoadMonitor';
import SDK_VERSION from './version';

const REPORT_DOMAIN = 'home.mem.toxotes.going-link.com';
// const SETTINGS_DOMAIN = REPORT_DOMAIN;
// const SDK_NAME = 'APM_PLUS_WEB';
const SETTINGS_PATH = '/settings/get/webpro';
const BATCH_REPORT_PATH = '/sada/v1/tmm/dust/collector';
const STORAGE_PREFIX = 'APMPLUS';
const DEFAULT_IGNORE_PATHS = [BATCH_REPORT_PATH, SETTINGS_PATH];
const DEFAULT_SAMPLE_CONFIG = { sample_rate: 1, include_users: [], sample_granularity: 'session', rules: {} };
const DEFAULT_SENDER_SIZE = 20;
const EVENTS = ['init', 'start', 'config', 'beforeDestroy', 'provide', 'beforeReport', 'report', 'beforeBuild', 'build', 'beforeSend', 'send', 'beforeConfig'];

let errCount = 0;
let warnCount = 0;

function error(...args) {
  console.error('[SDK]', Date.now(), `${errCount++}`.padStart(8, ' '), ...args);
}

function warn(...args) {
  console.warn('[SDK]', Date.now(), `${warnCount++}`.padStart(8, ' '), ...args);
}

function hasKey(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function mergeDeepConcatArray(...e) {
  let n = {};
  for (let r = 0; r < e.length;) {
    n = _mergeDeepMergeArray(n, e[r++]);
  }
  return n;
}

function _mergeDeepMergeArray(target, source) {
  const merged = {
    ...target,
  };
  for (const n in source) {
    if (hasKey(source, n) && source[n] !== undefined) {
      if (isObject(source[n]) && isPlainObject(source[n])) {
        merged[n] = _mergeDeepMergeArray(isObject(target[n]) ? target[n] : {}, source[n]);
      } else if (isArray(source[n]) && isArray(target[n])) {
        merged[n] = _mergeDeepArray(target[n], source[n]);
      } else {
        merged[n] = source[n];
      }
    }
  }
  return merged;
}

function _mergeDeepArray(target, source) {
  target = isArray(target) ? target : [];
  source = isArray(source) ? source : [];
  return [...target, ...source].map((e) => {
    if (!(e instanceof RegExp)) {
      if (isObject(e) && isPlainObject(e)) {
        return _mergeDeepMergeArray({}, e);
      }
      if (isArray(e)) {
        return _mergeDeepArray([], e);
      }
    }
    return e;
  });
}

function createContextAgent() {
  let context = {};
  let safeContext = {};
  const contextAgent = {
    set(key, value) {
      context[key] = value;
      safeContext[key] = safeStringify(value);
      return contextAgent;
    },
    merge(t) {
      context = {
        ...context,
        ...t,
      };
      Object.keys(t).forEach(function (e) {
        safeContext[e] = safeStringify(t[e]);
      });
      return contextAgent;
    },
    delete(key) {
      delete context[key];
      delete safeContext[key];
      return contextAgent;
    },
    clear() {
      context = {};
      safeContext = {};
      return contextAgent;
    },
    get(e) {
      return safeContext[e];
    },
    toString() {
      return {
        ...safeContext,
      };
    },
  };
  return contextAgent;
}

function getDefaultXMLHttpRequest() {
  if ('function' == typeof XMLHttpRequest && isFunction(XMLHttpRequest)) return XMLHttpRequest;
}

function getDefaultNavigator() {
  if (getDefaultBrowser() && 'navigator' in window) return window.navigator;
}

function getDefaultNetworkInformation() {
  const navigator = getDefaultNavigator();
  if (navigator) {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  }
}

function arrayRemove(array, item) {
  if (!isArray(array)) {
    return array;
  }
  const index = array.indexOf(item);
  if (index >= 0) {
    const newArray = array.slice();
    newArray.splice(index, 1);
    return newArray;
  }
  return array;
}

function safeVisit(e, t, n) {
  let [o, ...i] = t.split('.');
  while (e && i.length > 0) {
    e = e[o];
    [o, ...i] = i;
  }
  if (e) {
    return n(e, o);
  }
}

function safeCall(e, t, n) {
  return safeVisit(e, t, (e, t) => {
    if (e && t in e && isFunction(e[t])) {
      try {
        return e[t].apply(e, n);
      } catch (e) {
      }
    }
  });
}

function runProcessors(handles) {
  return (params) => {
    let result = params;
    for (let index = 0, len = handles.length; index < len && result; index++) {
      try {
        result = handles[index](result);
      } catch (e) {
        error(e);
      }
    }
    return result;
  };
}

const browserBuilder = {
  build: function (eventData) {
    const { eventType, payload, extra = {}, overrides, count, time } = eventData;
    const { context } = extra;
    return {
      eventType,
      payload: {
        breadcrumb: {
          ...context,
          ...overrides,
        },
        ...isPlainObject(payload) ? payload : JSON.parse(JSON.stringify(payload)),
      },
      count,
      time,
    };
  },
};


function onPageUnload(handle) {
  const browser = getDefaultBrowser();
  if (browser) {
    const [onceHandle] = invokeCallbackOnce(handle);

    ['unload', 'beforeunload', 'pagehide'].forEach((evtName) => {
      browser.addEventListener(evtName, onceHandle);
    });
  }
}

function normalizeInitConfig(e) {
  const plugins = e.plugins || {};
  for (const pluginsKey in plugins) {
    if (plugins[pluginsKey] && !isObject(plugins[pluginsKey])) {
      plugins[pluginsKey] = {};
    }
  }
  return {
    ...e,
    plugins: plugins,
  };
}

function validateInitConfig(e) {
  return isObject(e) && 'aid' in e;
}

function normalizeUserConfig(e) {
  return { ...e };
}

function withCommandArray(client, a, n) {
  function u(...e) {
    const [o, ...rest] = e;
    if (o) {
      const name = o.split('.')[0];
      if (name in u) {
        return safeCall(u, o, rest);
      }
      const r = c[name] || [];
      r.push([defaultTo(a && a(client), {}), ...e]);
      c[name] = r;
    }
  }

  const c = {};
  hookObjectProperty(client, 'provide', (n) => {
    return (e, t) => {
      u[e] = t;
      n.call(client, e, t);
    };
  })();
  for (const e in client) {
    if (Object.prototype.hasOwnProperty.call(client, e)) {
      u[e] = client[e];
    }
  }

  client.on('provide', (e) => {
    if (c[e]) {
      c[e].forEach(([e, ...t]) => {
        if (n) {
          n(client, e, t);
        }
      });

      c[e] = null;
    }
  });
  return u;
}

function getReportUrl(domain, path = BATCH_REPORT_PATH) {
  return `${domain && domain.indexOf('//') >= 0 ? '' : 'https://'}${domain}${path}`;
}

function getSettingsUrl(domain, path = SETTINGS_PATH) {
  return `${domain && domain.indexOf('//') >= 0 ? '' : 'https://'}${domain}${path}`;
}

function getServerConfig(transport, domain, aid, callback) {
  transport.get({
    withCredentials: true,
    url: `${getSettingsUrl(domain)}?aid=${aid}`,
    success(e) {
      callback(e.data || {});
    },
    fail() {
      callback();
    },
  });
}

function mergeSampleConfig(target, source) {
  if (!target || !source) {
    return target || source;
  }
  const sample = {
    ...target,
    ...source,
  };

  sample.include_users = [
    ...target.include_users || [],
    ...source.include_users || [],
  ];
  sample.rules = [
    ...Object.keys(target.rules || {}),
    ...Object.keys(source.rules || {}),
  ].reduce((rules, key) => {
    if (!(key in rules)) {
      if (key in (target.rules || {}) && key in (source.rules || {})) {
        rules[key] = {
          ...target.rules[key],
          ...source.rules[key],
        };
        rules[key].conditional_sample_rules = [
          ...target.rules[key].conditional_sample_rules || [],
          ...source.rules[key].conditional_sample_rules || [],
        ];
      } else {
        rules[key] = target.rules?.[key] || source.rules?.[key];
      }
    }
    return rules;
  }, {});

  return sample;
}

function getViewId(e) {
  return e + '_' + Date.now();
}

function getDefaultSessionId() {
  return uuid();
}

function getStorageItem(e) {
  try {
    const t = localStorage.getItem(e);
    if (isString(t)) {
      return JSON.parse(t);
    }
    return t;
  } catch (e) {
    return;
  }
}

function setStorageItem(e, t) {
  try {
    localStorage.setItem(e, isString(t) ? t : JSON.stringify(t));
  } catch (e) {
  }
}

function getStorageKey(e) {
  return STORAGE_PREFIX + e;
}

function getStoreInfo(e) {
  e = getStorageKey(e);
  return getStorageItem(e) || { userId: uuid(), deviceId: uuid(), r: Math.random() };
}

function request(e, options, XMLHttpRequest) {
  const {
    url,
    data,
    success = noop,
    fail = noop,
    getResponseText = noop,
    withCredentials = false,
  } = options;
  const ajax = new XMLHttpRequest();
  ajax.withCredentials = withCredentials;
  ajax.open(e, url, true);
  ajax.setRequestHeader('Content-Type', 'application/json');
  ajax.onload = function () {
    if (getResponseText) {
      getResponseText(this.responseText);
    }
    try {
      if (this.responseText) {
        success(JSON.parse(this.responseText));
      } else {
        success({});
      }
    } catch (e) {
      fail(e);
    }
  };
  ajax.onerror = function () {
    fail(new Error('Network request failed'));
  };
  ajax.onabort = function () {
    fail(new Error('Network request aborted'));
  };
  ajax.send(data);
}

function getXhrTransport() {
  const XMLHttpRequest = getDefaultXMLHttpRequest();
  return XMLHttpRequest ? {
    get(e) {
      request('GET', e, XMLHttpRequest);
    },
    post(e) {
      request('POST', e, XMLHttpRequest);
    },
  } : { get: noop, post: noop };
}

function getDefaultConfig(config) {
  config = getStoreInfo(config.aid);
  return {
    aid: 'srm-pc',
    pid: '',
    token: '',
    viewId: getViewId('_'),
    userId: config.userId,
    deviceId: config.deviceId,
    sessionId: getDefaultSessionId(),
    domain: REPORT_DOMAIN,
    plugins: {
      ajax: { ignoreUrls: DEFAULT_IGNORE_PATHS },
      fetch: { ignoreUrls: DEFAULT_IGNORE_PATHS },
      breadcrumb: {},
      pageview: {},
      jsError: {},
      resource: {},
      resourceError: {},
      performance: {},
      tti: {},
      fmp: {},
      blankScreen: false,
    },
    release: '',
    env: config.env || 'production',
    tenant: config.tenant,
    publicKey: config.publicKey,
    sample: { ...DEFAULT_SAMPLE_CONFIG, r: config.r },
    useLocalConfig: true,
    transport: getXhrTransport(),
  };
}

const DEFAULT_SIZE = 10;
const DEFAULT_WAIT = 1e3;


function stringifyBatch(events, config) {
  const { aid, env, tenant, userId, user, publicKey } = config;
  const osType = getDefaultNavigator() && (navigator.userAgentData?.platform || navigator.platform);

  const common = {
    osType,
    endType: aid,
    env,
    tenant,
    userId,
    user,
    host: location.host,
    sdkVersion: SDK_VERSION,
  };
  const body = { common, events };
  const hex = md5.hash(JSON.stringify(body));
  const encrypt = new JSEncrypt();

  encrypt.setPublicKey(publicKey);

  const signBody = encrypt.encrypt(hex);
  return JSON.stringify({
    dustDto: body,
    signBody,
    clientId: aid,
  });
}

function getBeaconTransport() {
  const browser = getDefaultBrowser();
  return browser && browser.navigator.sendBeacon ? {
    get() {
    },
    post(url, data) {
      browser.navigator.sendBeacon(url, data);
    },
  } : { get: noop, post: noop };
}

function createBatchSender(options, getConfig) {
  const {
    transport,
  } = options;
  let {
    endpoint,
    size = DEFAULT_SIZE,
    wait = DEFAULT_WAIT,
  } = options;
  let fail;
  let batchData = [];
  let c = 0;

  function send() {
    if (batchData.length) {
      const data = this.getBatchData();
      transport.post({
        url: endpoint,
        data,
        fail(e) {
          if (fail) {
            fail(e, data);
          }
        },
      });

      batchData = [];
    }
  }

  return {
    getSize() {
      return size;
    },
    getWait() {
      return wait;
    },
    setSize(newSize) {
      size = newSize;
    },
    setWait(newWait) {
      wait = newWait;
    },
    getEndpoint() {
      return endpoint;
    },
    setEndpoint(newEndpoint) {
      endpoint = newEndpoint;
    },
    send(e) {
      batchData.push(e);
      if (batchData.length >= size) {
        send.call(this);
      }
      clearTimeout(c);

      c = setTimeout(send.bind(this), wait);
    },
    flush() {
      clearTimeout(c);
      send.call(this);
    },
    getBatchData() {
      return batchData.length ? stringifyBatch(batchData, getConfig()) : '';
    },
    clear() {
      clearTimeout(c);
      batchData = [];
    },
    fail(e) {
      fail = e;
    },
  };
}

function createBrowserSender(options, getConfig) {
  function send(data) {
    beaconTransport.post(batchSender.getEndpoint(), stringifyBatch([data], getConfig()));
  }

  const batchSender = createBatchSender(options, getConfig);
  const beaconTransport = getBeaconTransport();
  onPageUnload(() => {
    const batchData = batchSender.getBatchData();
    if (batchData) {
      beaconTransport.post(batchSender.getEndpoint(), batchData);
      batchSender.clear();
    }
    batchSender.send = send;
  });

  return batchSender;
}

function createClient(config) {
  let sender;
  let inited = false;
  let started = false;
  let destroied = false;
  let configManager;
  let preStartQueue = [];
  const {
    builder,
    createSender,
    createDefaultConfig,
    createConfigManager,
    userConfigNormalizer,
    initConfigNormalizer,
    validateInitConfig,
  } = config;
  const events = {};
  EVENTS.forEach(function (e) {
    return events[e] = [];
  });
  const client = {
    getBuilder() {
      return builder;
    },
    getSender() {
      return sender;
    },
    getPreStartQueue() {
      return preStartQueue;
    },
    init(config) {
      if (inited) {
        warn('already inited');
      } else {
        if (!(config && isObject(config) && validateInitConfig(config))) {
          throw new Error('invalid InitConfig, init failed');
        }
        const t = createDefaultConfig(config);
        if (!t) {
          throw new Error('defaultConfig missing');
        }
        config = initConfigNormalizer(config);
        configManager = createConfigManager(t);
        configManager.setConfig(config);
        configManager.onChange(() => {
          emit('config');
        });
        sender = createSender(configManager.getConfig());
        if (!sender) {
          throw new Error('sender missing');
        }

        inited = true;
        emit('init', inited);
      }
    },
    set(e) {
      if (inited && e && isObject(e)) {
        emit('beforeConfig', false, e);
        if (configManager) {
          configManager.setConfig(e);
        }
      }
    },
    config: function (e) {
      if (inited) {
        if (e && isObject(e)) {
          emit('beforeConfig', false, e);
          if (configManager) {
            configManager.setConfig(userConfigNormalizer(e));
          }
        }
        if (configManager) {
          return configManager.getConfig();
        }
      }
    },
    provide: function (e, t) {
      if (keys.includes(e)) {
        warn('cannot provide ' + e + ', reserved');
      } else {
        client[e] = t;
        emit('provide', false, e);
      }
    },
    start() {
      if (inited && !started && configManager) {
        configManager.onReady(() => {
          started = true;
          emit('start', true);
          preStartQueue.forEach((e) => {
            const { context } = this;
            if (context) {
              const { extra } = e;
              e.extra = {
                ...extra,
                context: context.toString(),
              };
            }
            this.build(e);
          });
          preStartQueue = [];
        });
      }
    },
    pause() {
      started = false;
    },
    report(e) {
      if (e) {
        e = runProcessors(events.beforeReport)(e);
        if (!e) {
          return;
        }
        e = runProcessors(events.report)(e);
        if (e) {
          if (started) {
            this.build(e);
          } else {
            preStartQueue.push(e);
          }
        }
      }
    },
    build(e) {
      if (started) {
        e = runProcessors(events.beforeBuild)(e);
        if (e) {
          e = builder.build(e);
          if (!e) {
            return;
          }
          e = runProcessors(events.build)(e);
          if (e) {
            this.send(e);
          }
        }
      }
    },
    send(e) {
      if (started) {
        e = runProcessors(events.beforeSend)(e);
        if (e) {
          sender.send(e);
          emit('send', false, e);
        }
      }
    },
    destroy() {
      destroied = true;
      emit('beforeDestroy', true);
    },
    on(eventName, handle) {
      if (('init' === eventName && inited) || ('start' === eventName && started) || ('beforeDestroy' === eventName && destroied)) {
        handle();
      } else if (events[eventName]) {
        events[eventName].push(handle);
      }
    },
    off(eventName, handle) {
      if (events[eventName]) {
        events[eventName] = arrayRemove(events[eventName], handle);
      }
    },
  };
  const keys = Object.keys(client);
  return client;

  function emit(e, clear = false, ...n) {
    events[e].forEach((e) => {
      try {
        e.apply(undefined, [...n]);
      } catch (e) {
        console.error(e);
      }
    });
    if (clear) {
      events[e].length = 0;
    }
  }
}

function ContextPlugin(client) {
  const contextAgent = createContextAgent();
  client.provide('context', contextAgent);
  client.on('report', (e) => {
    if (!e.extra) {
      e.extra = {};
    }

    e.extra.context = contextAgent.toString();
    return e;
  });
}

function IntegrationPlugin(client) {
  client.on('init', () => {
    const setupedIntegration = [];
    const config = client.config();
    if (config && config.integrations) {
      config.integrations.forEach((integration) => {
        if (!setupedIntegration.includes(integration.name)) {
          setupedIntegration.push(integration.name);
          integration.setup(client);
          if (integration.tearDown) {
            client.on('beforeDestroy', integration.tearDown);
          }
        }
      });
    }
  });
}

const MAX_RTT = 700;

function TimeCalibrationPlugin(client) {
  let startTime, o = false;
  client.on('init', () => {
    startTime = Date.now();
    client.on('config', () => {
      const serverTimestamp = client.config()?.serverTimestamp;
      if (!isNaN(serverTimestamp) && Number(serverTimestamp) > 0 && !o) {
        o = true;
        const endTime = Date.now();
        if (endTime - startTime < MAX_RTT && serverTimestamp) {
          const e = serverTimestamp - (endTime + startTime) / 2;
          if (!isNaN(e) && (0 < e || e < -6e5)) {
            client.set({ offset: e });
          }
        }
      }
    });
  });
}

function addConfigToReportEvent(e, config) {
  const { aid, pid, viewId, userId } = config;
  return {
    ...e,
    extra: {
      aid,
      pid,
      view_id: viewId,
      user_id: userId,
      ...(e.extra || {}),
    },
  };
}

function joinQueryWithMap(n) {
  if (isObject(n)) {
    return Object.keys(n)
      .reduce((e, t) => `${e}&${t}=${n[t]}`, '')
      .replace('&', '?');
  }
  return '';
}

function InjectConfigPlugin(client) {
  client.on('beforeBuild', (e) => addConfigToReportEvent(e, client.config()));
}

function InjectQueryPlugin(client) {
  client.on('start', () => {
    // const {
    //   deviceId,
    //   sessionId,
    //   release,
    //   env,
    //   offset,
    //   aid,
    //   token,
    // } = client.config();

    const map = {
      // did: deviceId,
      // sid: sessionId,
      // release: release,
      // env: env,
      // sname: SDK_NAME,
      // sversion: SDK_VERSION,
      // soffset: offset || 0,
      // biz_id: aid,
      // x_auth_token: token,
    };
    const sender = client.getSender();
    sender.setEndpoint(sender.getEndpoint() + joinQueryWithMap(map));
  });
}

function addEnvToSendEvent(e) {
  return {
    ...e,
    extra: {
      url: getLocationUrl(),
      timestamp: Date.now(),
      ...(e.extra || {}),
    },
  };
}

function InjectEnvPlugin(e) {
  e.on('report', (e) => addEnvToSendEvent(e));
}

function getNetworkType(networkInformation) {
  return networkInformation?.effectiveType || networkInformation?.type || '';
}

function InjectNetworkTypePlugin(client) {
  const networkInformation = getDefaultNetworkInformation();
  let network_type = getNetworkType(networkInformation);
  if (networkInformation) {
    networkInformation.onchange = () => {
      network_type = getNetworkType(networkInformation);
    };
  }
  client.on('report', (e) => ({
    ...e,
    extra: {
      ...(e.extra || {}),
      network_type,
    },
  }));
}

function saveStoreInfo(config) {
  const { aid, userId, deviceId, sample } = config;
  setStorageItem(getStorageKey(aid), { userId: userId, deviceId: deviceId, r: sample.r });
}

function parseServerConfig(config) {
  if (!config) {
    return {};
  }
  const { sample, timestamp, status } = config;
  if (!sample) {
    return {};
  }
  const {
    sample_rate,
    sample_granularity,
  } = sample;
  return {
    sample: {
      include_users: sample.include_users,
      sample_rate: status && 4 === status ? 0 : sample_rate,
      sample_granularity: sample_granularity,
      rules: sample.rules.reduce((rules, rule) => {
        const {
          name,
          enable,
          sample_rate: rule_sample_rate,
          conditional_sample_rules,
        } = rule;
        rules[name] = {
          enable,
          sample_rate: rule_sample_rate,
          conditional_sample_rules,
        };
        return rules;
      }, {}),
    }, serverTimestamp: timestamp,
  };
}


function createBrowserConfigManager(initConfig) {
  let lastChangedConfig;
  let serverConfig;
  let localConfig;
  let config = initConfig;
  let changedConfig = {};
  let ready = noop;
  let onChange = noop;
  return {
    getConfig() {
      return config;
    },
    setConfig(newConfig) {
      changedConfig = {
        ...changedConfig,
        ...(newConfig || {}),
      };
      setupConfig();
      if (!lastChangedConfig) {
        lastChangedConfig = newConfig;
        if (config.useLocalConfig) {
          localConfig = {};
          ready();
        } else if (serverConfig) {
          parseServerConfigToLocalConfig();
        } else {
          getServerConfig(
            config.transport,
            config.domain,
            config.aid,
            (serverConfig$) => {
              serverConfig = serverConfig$;
              parseServerConfigToLocalConfig();
            },
          );
        }
      }
      return config;
    },
    onChange(handleChange) {
      onChange = handleChange;
    },
    onReady(handleReady) {
      ready = function () {
        if (initConfig.userId !== config.userId) {
          initConfig.sample.r = Math.random();
          setupConfig();
        }
        saveStoreInfo(config);
        handleReady();
      };
      if (localConfig) {
        ready();
      }
    },
  };

  function setupConfig() {
    const config$ = {
      ...initConfig,
      ...(localConfig || {}),
      ...changedConfig,
    };
    config$.plugins = mergeDeepConcatArray(initConfig.plugins, (localConfig && localConfig.plugins) || {}, changedConfig.plugins || {});
    config$.sample = mergeSampleConfig(mergeSampleConfig(initConfig.sample, localConfig && localConfig.sample), changedConfig.sample);
    config = config$;
    onChange();
  }

  function parseServerConfigToLocalConfig() {
    localConfig = parseServerConfig(serverConfig);
    setupConfig();
    ready();
  }
}

function createMinimalBrowserClient(options = {}) {
  const {
    createSender = (config) => {
      return createBrowserSender({
          size: config.senderSize || DEFAULT_SENDER_SIZE,
          endpoint: getReportUrl(config.domain),
          transport: config.transport,
        },
        () => client.config(),
      );
    },
    builder = browserBuilder,
    createDefaultConfig = getDefaultConfig,
  } = options;
  const client = createClient({
    validateInitConfig,
    initConfigNormalizer: normalizeInitConfig,
    userConfigNormalizer: normalizeUserConfig,
    createSender,
    builder,
    createDefaultConfig,
    createConfigManager: createBrowserConfigManager,
  });
  ContextPlugin(client);
  const globalRegistry = getGlobalRegistry(getDefaultBrowser());
  SubjectPlugin(client, globalRegistry && globalRegistry.subject);
  TimeCalibrationPlugin(client);
  InjectConfigPlugin(client);
  InjectEnvPlugin(client);
  InjectNetworkTypePlugin(client);
  InjectQueryPlugin(client);
  const clientWithCommandArray = withCommandArray(client, captureCurrentContext, (e, t, n) => {
    return syncReportWithCapturedContext(e, t)(() => {
      const [t, ...e] = n;
      client[t].apply(client, [...e]);
    });
  });
  IntegrationPlugin(clientWithCommandArray);
  return clientWithCommandArray;
}

function createBrowserClient(options = {}) {
  const client = createMinimalBrowserClient(options);

  SamplePlugin(client);
  PrecollectPlugin(client);
  CustomPlugin(client);
  PageviewMonitorPlugin(client);
  AjaxMonitorVolPlugin(client);
  FetchMonitorVolPlugin(client);
  TTIMonitorPlugin(client);
  FMPMonitorPlugin(client);
  BreadcrumbMonitorPlugin(client);
  JsErrorMonitorPlugin(client);
  PerformanceMonitorPlugin(client);
  ResourceErrorMonitorPlugin(client);
  ResourceMonitorPlugin(client);
  // BlankScreenMonitorVolPlugin(client);
  SPALoadMonitorPlugin(client);
  return client;
}

const PRECOLLECT = 'precollect';
const BOTTOM_UP_TIME = 3e5;

function npmPreCollect(win, client) {
  if ('addEventListener' in win) {
    client.pcErr = (e) => {
      const target = (e = e || win.event).target || e.srcElement || {};
      if (target instanceof Element || target instanceof HTMLElement) {
        if (target.getAttribute('integrity')) {
          client(PRECOLLECT, 'sri', target.getAttribute('href') || target.getAttribute('src'));
        } else {
          client(PRECOLLECT, 'st', {
            tagName: target.tagName,
            url: target.getAttribute('href') || target.getAttribute('src'),
          });
        }
      } else {
        client(PRECOLLECT, 'err', e.error);
      }
    };

    client.pcRej = function (e) {
      e = e || win.event;
      client(PRECOLLECT, 'err', e.reason || e.detail && e.detail.reason);
    };

    win.addEventListener('error', client.pcErr, true);
    win.addEventListener('unhandledrejection', client.pcRej, true);
    setTimeout(() => {
      win.removeEventListener('error', client.pcErr, true);
      win.removeEventListener('unhandledrejection', client.pcRej, true);
    }, BOTTOM_UP_TIME);
  }

  if ('PerformanceObserver' in win && 'PerformanceLongTaskTiming' in win) {
    client.pp = { entries: [] };
    client.pp.observer = new PerformanceObserver((e) => {
      client.pp.entries = client.pp.entries.concat(e.getEntries());
    });
    client.pp.observer.observe({ entryTypes: ['longtask', 'largest-contentful-paint', 'layout-shift'] });
    setTimeout(() => {
      client.pp.observer.disconnect();
    }, BOTTOM_UP_TIME);
  }
}

const browserClient = createBrowserClient();
const win = getDefaultBrowser();
if (win) {
  npmPreCollect(win, browserClient);
  const analyticsObject = win['ToxotesApmAnalyticsObject'] || 'collectBrowserEvent';
  win[analyticsObject] = browserClient;
}
