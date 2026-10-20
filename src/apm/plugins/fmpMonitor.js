import { isFunction } from 'lodash';
import getDefaultBrowser from '../utils/getDefaultBrowser';
import getDefaultDocument from '../utils/getDefaultDocument';
import getDefaultPerformance from '../utils/getDefaultPerformance';
import getDefaultMutationObserver from '../utils/getDefaultMutationObserver';
import getPluginConfig from '../utils/getPluginConfig';
import initSubjectInGlobal from '../utils/initSubjectInGlobal';
import initMetric from '../utils/initMetric';
import applyMutationObserver from '../utils/applyMutationObserver';
import applySendOnceAndTearDown from '../utils/applySendOnceAndTearDown';
import wrapPerformanceMetric from '../utils/wrapPerformanceMetric';
import reportOnInitCommonParams from '../utils/reportOnInitCommonParams';
import getPaint from '../utils/getPaint';
import loadSubject from '../subjects/loadSubject';
import unloadSubject from '../subjects/unloadSubject';
import hiddenSubject from '../subjects/hiddenSubject';

const FMP_METRIC_NAME = 'fmp';
const DEFAULT_IGNORE_TAGS$1 = ['SCRIPT', 'STYLE', 'META', 'HEAD'];


function getDefaultRaf() {
  if (getDefaultBrowser() && 'requestAnimationFrame' in window) {
    return window.requestAnimationFrame;
  }
}

function getDefaultCaf() {
  if (getDefaultBrowser() && 'cancelAnimationFrame' in window) {
    return window.cancelAnimationFrame;
  }
}

function applyAnimationFrame(doc, requestAnimationFrame, cancelAnimationFrame, r) {
  let timer;
  const raf = !isFunction(requestAnimationFrame) || r && doc && doc.hidden ? (callback) => {
    callback(0);
    return 0;
  } : requestAnimationFrame;
  const caf = isFunction(cancelAnimationFrame) ? cancelAnimationFrame : noop;
  return [
    (callback) => {
      if (timer) {
        caf(timer);
      }

      timer = raf(callback);
    },
    raf,
    caf,
  ];
}

function getScore(body, level, ignoreBody, ignoreTags) {
  if (!body || ignoreTags.indexOf(body.tagName) > -1) {
    return 0;
  }
  const { children = [] } = body;
  const score = []
    .slice.call(children)
    .reduceRight((total, child) => total + getScore(child, level + 1, 0 < total, ignoreTags), 0);
  if (score <= 0 && !ignoreBody) {
    if (!isFunction(body.getBoundingClientRect)) {
      return 0;
    }
    const rect = body.getBoundingClientRect() || {};
    const { top, height } = rect;
    if (top > window.innerHeight || height <= 0) {
      return 0;
    }
  }
  return score + 1 + .5 * level;
}

function getFMPInternal([first, ...rest] = []) {
  return rest && rest.reduce(([prev, next], item) => {
    const rate = item.score - prev.score;
    return [item, item.time >= prev.time && next.rate < rate ? { time: item.time, rate } : next];
  }, [first, { time: first?.time, rate: 0 }])[1].time || 0;
}

function getFMP(report, subjects, [globalLoadSubject]) {
  var doc = getDefaultDocument(),
    MutationObserver = getDefaultMutationObserver(),
    performance = getDefaultPerformance(),
    navigationStart = performance && performance.timing && performance.timing.navigationStart || undefined,
    metric = initMetric(FMP_METRIC_NAME, 0),
    sendOnceAndTearDown = applySendOnceAndTearDown(wrapPerformanceMetric, report, subjects);
  if (!doc || !MutationObserver || !navigationStart) {
    return metric.isSupport = !1, void sendOnceAndTearDown(metric);
  }

  function pushItemIntoList() {
    return list.push({
      time: Date.now() - currentTime,
      score: getScore(doc && doc.body, 1, false, DEFAULT_IGNORE_TAGS$1),
    });
  }

  const currentTime = Date.now();
  const list = [];
  const [raf] = applyAnimationFrame(doc, getDefaultRaf(), getDefaultCaf(), true);
  const [observe, disconnect] = applyMutationObserver(MutationObserver, () => raf(pushItemIntoList));
  const duration = currentTime - (navigationStart || 0);
  observe(doc, { subtree: !0, childList: !0 });

  subjects.push(disconnect);
  subjects.push(globalLoadSubject[0](() => {
    setTimeout(() => {
      !function (duration$ = 0) {
        const fmp = getFMPInternal(list);
        metric.value = fmp ? fmp + duration$ : 0;

        sendOnceAndTearDown(metric);

        list.length = 0;
      }(duration);
    }, 200);
  }));
}

const FMP_MONITOR_PLUGIN_NAME = 'fmp';
const defaultConfig = { renderType: 'CSR' };
const FP_ENTRY_NAME = 'first-paint';

export default function FMPMonitorPlugin(client) {
  client.on('init', () => {
    const pluginConfig = getPluginConfig(client, FMP_MONITOR_PLUGIN_NAME, defaultConfig);
    if (pluginConfig) {
      const subjects = [];
      if ('SSR' === pluginConfig.renderType) {
        getPaint(
          FP_ENTRY_NAME,
          FMP_MONITOR_PLUGIN_NAME,
          reportOnInitCommonParams(client),
          subjects,
          [
            initSubjectInGlobal(client, hiddenSubject),
            initSubjectInGlobal(client, unloadSubject),
          ],
        );
      } else {
        getFMP(
          reportOnInitCommonParams(client),
          subjects,
          [
            initSubjectInGlobal(client, loadSubject),
          ],
        );
      }
      client.on('beforeDestroy', () => {
        subjects.forEach((dispose) => dispose());
      });
    }
  });
}
