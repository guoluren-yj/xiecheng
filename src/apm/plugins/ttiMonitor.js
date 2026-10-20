import { isNumber, noop } from 'lodash';
import getPluginConfig from '../utils/getPluginConfig';
import getDefaultPerformance from '../utils/getDefaultPerformance';
import getDefaultMutationObserver from '../utils/getDefaultMutationObserver';
import getLocationUrl from '../utils/getLocationUrl';
import initSubjectInGlobal from '../utils/initSubjectInGlobal';
import initMetric from '../utils/initMetric';
import wrapPerformanceMetric from '../utils/wrapPerformanceMetric';
import applyPerformance from '../utils/applyPerformance';
import applyRecord from '../utils/applyRecord';
import applySendOnceAndTearDown from '../utils/applySendOnceAndTearDown';
import applyMutationObserver from '../utils/applyMutationObserver';
import getFetchMethod from '../utils/getFetchMethod';
import reportOnInitCommonParams from '../utils/reportOnInitCommonParams';
import ajaxSubject from '../subjects/ajaxSubject';
import fetchSubject from '../subjects/fetchSubject';
import longtaskSubject from '../subjects/longtaskSubject';
import resourceSubject from '../subjects/resourceSubject';

const TTI_METRIC_NAME = 'tti', GET_METHOD = 'get', QUIET_TIME_LIMIT = 5e3;

function applyScheduler(now) {
  function run(time) {
    if (time >= lastTime && fn) {
      clearTimeout();
      timer = window.setTimeout(fn, time - now());
      lastTime = time;
    }
  }

  let fn;
  let lastTime = -Infinity;
  let timer = undefined;
  const clearTimeout = () => window.clearTimeout(timer);
  return [
    (callback, defer) => {
      fn = callback;
      run(defer);
    },
    () => {
      clearTimeout();
      fn = undefined;
    },
    run,
  ];
}

const LONGTASK_TYPE = ['longtask'];
const tags = ['img', 'script', 'iframe', 'link', 'audio', 'video', 'source'];

function observeResFetchMutations(MutationObserver, callback) {
  const [observe, disconnect] = applyMutationObserver(MutationObserver, (entries) => {
    for (let i = 0, len = entries.length; i < len; i++) {
      function match(nodes, n) {
        for (let j = 0, len2 = nodes.length; j < len2; j++) {
          if (n.includes(nodes[j].nodeName.toLowerCase()) || nodes[j].children && match(nodes[j].children, n)) {
            return true;
          }
        }
      }

      if ('childList' === entries[i].type && match(entries[i].addedNodes, tags) || 'attributes' === entries[i].type && tags.includes(entries[i].target.nodeName.toLowerCase())) {
        callback(entries[i]);
      }
    }
  });
  return [
    () => observe(document, { attributes: !0, childList: !0, subtree: !0, attributeFilter: ['href', 'src'] }),
    disconnect,
  ];
}

function pushLongTaskIntoList(lastTask, longTaskListt) {
  const { startTime, duration } = lastTask;
  lastTask.start = startTime;
  lastTask.end = startTime + duration;

  longTaskListt.push(lastTask);
}

function calcLastNet2Busy(requestTimes, resourceList, now) {
  if (requestTimes.length > 2) {
    return now();
  }
  const times = [];
  for (let i = 0, len = resourceList.length; i < len; i++) {
    times.push(
      [resourceList[i].start, 0],
      [resourceList[i].end, 1],
    );
  }
  for (let i = 0, len = requestTimes.length; i < len; i++) {
    times.push([requestTimes[i], 0]);
  }
  times.sort((e, t) => e[0] - t[0]);
  for (let i = requestTimes.length, o = times.length - 1; 0 <= o; o--) {
    const [time, flag] = times[o];
    switch (flag) {
      case 0:
        i--;
        break;
      case 1: {
        if (2 < ++i) {
          return time;
        }
      }
    }
  }
  return 0;
}

function getRequestTimes(record) {
  const keys = Object.keys(record);
  const times = [];
  for (let i = 0, len = keys.length; i < len; i++) {
    const value = record[keys[i]];
    if (isNumber(value)) {
      times.push(value);
    }
  }
  return times;
}

function getLastBusyAndLongTasks(subjects, [globalAjaxSubject, globalFetchSubject, globalLongtaskSubject, globalResourceSubject, MutationObserver], entries) {
  return (run, now) => {
    const [record, set, remove] = applyRecord();
    const longTaskList = [];
    const resourceList = [];
    entries.forEach((entry) => {
      if (entry.entryType === LONGTASK_TYPE[0]) {
        pushLongTaskIntoList(entry, longTaskList);
      }
    });
    let count = 0;
    subjects.push(
      globalAjaxSubject[0](([method]) => {
        if ((method || '').toLowerCase() !== GET_METHOD) {
          return noop;
        }
        count += 1;
        let count$ = count;
        set(count$, now());
        return () => {
          remove(count$);
        };
      }),
    );

    subjects.push(
      globalFetchSubject[0](([request, requestInit]) => {
        if (!window.Request || getFetchMethod(request, requestInit, window.Request) !== GET_METHOD) {
          return noop;
        }
        count += 1;
        const count$ = count;
        set(count$, now());
        return () => {
          remove(count$);
        };
      }),
    );
    const [observe, disconnect] = MutationObserver && observeResFetchMutations(MutationObserver, () => run(now() + QUIET_TIME_LIMIT)) || [];
    if (observe) {
      observe();
    }

    function getLastBusy() {
      return calcLastNet2Busy(getRequestTimes(record), resourceList, now);
    }

    if (disconnect) {
      subjects.push(disconnect);
    }

    subjects.push(
      globalLongtaskSubject[0]((longTask) => {
        pushLongTaskIntoList(longTask, longTaskList);
        const { startTime, duration } = longTask;
        run(startTime + duration + QUIET_TIME_LIMIT);
      }),
      globalResourceSubject[0](({ fetchStart, responseEnd }) => {
        resourceList.push({ start: fetchStart, end: responseEnd });
        run(getLastBusy() + QUIET_TIME_LIMIT);
      }),
      () => {
        longTaskList.length = 0;
        resourceList.length = 0;
      },
    );

    return [longTaskList, getLastBusy];
  };
}

function computeTTI(startTime, minValue, lastBusy, now, longTaskList) {
  if (now - lastBusy < QUIET_TIME_LIMIT) {
    return null;
  }
  const value = 0 === longTaskList.length ? startTime : longTaskList[longTaskList.length - 1].end;
  return now - value < QUIET_TIME_LIMIT ? null : Math.max(value, minValue);
}

function getMinValue(timing) {
  const { domContentLoadedEventEnd, navigationStart = 0 } = timing || {};
  return domContentLoadedEventEnd
    ? domContentLoadedEventEnd - navigationStart
    : null;
}

const FCP_ENTRY_NAME = 'first-contentful-paint';

function getTTI(report, subjects, [globalAjaxSubject, globalFetchSubject, globalLongtaskSubject, globalResourceSubject], pp) {
  const metric = initMetric(TTI_METRIC_NAME, 0);
  const sendOnceAndTearDown = applySendOnceAndTearDown(wrapPerformanceMetric, report, subjects);
  const performance = getDefaultPerformance();
  const { entries = [], observer } = pp || {};
  subjects.push(() => {
    if (observer) {
      observer && observer.disconnect();
    }

    entries.length = 0;
  });
  if (!window || !XMLHttpRequest || !performance || !PerformanceObserver || PerformanceObserver.supportedEntryTypes && !(PerformanceObserver.supportedEntryTypes || []).includes(LONGTASK_TYPE[0])) {
    metric.isSupport = false;
    sendOnceAndTearDown(metric);
    return;
  }
  const [timing, now, , , getEntriesByName] = applyPerformance(performance);
  const [start, end, run] = applyScheduler(now);
  const [longTaskList, getLastBusy] = getLastBusyAndLongTasks(
    subjects,
    [
      globalAjaxSubject,
      globalFetchSubject,
      globalLongtaskSubject,
      globalResourceSubject,
      getDefaultMutationObserver(),
    ],
    entries,
  )(run, now);
  subjects.push(end);

  function send(e) {
    metric.value = e;
    sendOnceAndTearDown(metric);
  }

  const lastLongTask = longTaskList[longTaskList.length - 1];
  start(
    () => {
      const entries = getEntriesByName(FCP_ENTRY_NAME)[0];
      const min = getMinValue(timing);
      const computedTTI = computeTTI(
        (entries ? entries.startTime : min) || 0,
        min || 0,
        getLastBusy(),
        now(),
        longTaskList,
      );
      if (!computedTTI) {
        return run(now() + 1e3);
      }
      send(computedTTI);
    },
    Math.max(getLastBusy() + QUIET_TIME_LIMIT, lastLongTask ? lastLongTask.end : 0),
  );
}

const TTI_MONITOR_PLUGIN_NAME = 'tti';

export default function TTIMonitorPlugin(client) {
  client.on('init', () => {
    if (getPluginConfig(client, TTI_MONITOR_PLUGIN_NAME, {})) {
      const subjects = [];

      getTTI(
        reportOnInitCommonParams(client),
        subjects,
        [
          initSubjectInGlobal(client, ajaxSubject),
          initSubjectInGlobal(client, fetchSubject),
          initSubjectInGlobal(client, longtaskSubject),
          initSubjectInGlobal(client, resourceSubject),
        ],
        client.pp,
      );

      client.on('beforeDestroy', () => {
        subjects.forEach((e) => e());
      });
    }
  });
}
