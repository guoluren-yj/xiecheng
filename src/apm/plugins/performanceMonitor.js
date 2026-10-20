import getPluginConfig from '../utils/getPluginConfig';
import initSubjectInGlobal from '../utils/initSubjectInGlobal';
import { initPrivateSubject } from './subject';
import initMetric, { defaultMetricContext } from '../utils/initMetric';
import wrapPerformanceMetric from '../utils/wrapPerformanceMetric';
import getDefaultPerformanceObserver from '../utils/getDefaultPerformanceObserver';
import getDefaultPerformance from '../utils/getDefaultPerformance';
import applyPerformance from '../utils/applyPerformance';
import applyReportMetric from '../utils/applyReportMetric';
import observePerf from '../utils/observePerf';
import applyPerformanceObserver from '../utils/applyPerformanceObserver';
import applySendOnceAndTearDown from '../utils/applySendOnceAndTearDown';
import getPaint from '../utils/getPaint';
import getFirstPVSubject from '../subjects/getFirstPVSubject';
import getPVSubject from '../subjects/getPVSubject';
import hiddenSubject from '../subjects/hiddenSubject';
import unloadSubject from '../subjects/unloadSubject';
import loadSubject from '../subjects/loadSubject';
import longtaskSubject from '../subjects/longtaskSubject';

const FCP_ENTRY_NAME = 'first-contentful-paint';
const FP_ENTRY_NAME = 'first-paint';
const FP_METRIC_NAME = 'fp';
const FCP_METRIC_NAME = 'fcp';

function getFP(report, subjects, globalSubjects) {
  return getPaint(FP_ENTRY_NAME, FP_METRIC_NAME, report, subjects, globalSubjects);
}

function getFCP(report, subjects, globalSubjects) {
  return getPaint(FCP_ENTRY_NAME, FCP_METRIC_NAME, report, subjects, globalSubjects);
}

const FP = [FP_METRIC_NAME, getFP];
const FCP = [FCP_METRIC_NAME, getFCP];

const PERFORMANCE_MONITOR_PLUGIN_NAME = 'performance';
const defaultPerformancePrecollect = { entries: [], observer: undefined };
const SINGLE_METRIC_EV_TYPE = 'performance';
const LONG_TASK_EV_TYPE = 'performance_longtask';

const LCP_ENTRY_NAME = 'largest-contentful-paint';
const LCP_METRIC_NAME = 'lcp';
const LCPListenerEventTypes = ['keydown', 'click'];

function getLCP(report, subjects, [globalHiddenSubject, globalUnloadSubject]) {
  const PerformanceObserver = getDefaultPerformanceObserver();
  const metric = initMetric(LCP_METRIC_NAME, 0);
  const sendOnceAndTearDown = applySendOnceAndTearDown(wrapPerformanceMetric, report, subjects);
  if (!PerformanceObserver) {
    metric.isSupport = false;
    sendOnceAndTearDown(metric);
    return;
  }
  subjects.push(
    observePerfWithBuffer(PerformanceObserver, (entry) => {
      metric.value = entry.startTime;
    }, LCP_ENTRY_NAME),
  );

  function send() {
    sendOnceAndTearDown(metric);
  }

  LCPListenerEventTypes.forEach((eventName) => {
    window.addEventListener(eventName, send, true);
    subjects.push(() => {
      window.removeEventListener(eventName, send, true);
    });
  });
  subjects.push(
    globalHiddenSubject[0](function () {
      metric.isSupport = false;
      sendOnceAndTearDown(metric);
    }),
    globalUnloadSubject[0](function () {
      metric.isBounced = true;
      sendOnceAndTearDown(metric);
    }),
  );
}

const LCP = [LCP_METRIC_NAME, getLCP];
const FI_ENTRY_NAME = 'first-input';
const FID_METRIC_NAME = 'fid';

function getFID(report, subjects) {
  const PerformanceObserver = getDefaultPerformanceObserver();
  const performance = getDefaultPerformance();
  const metric = initMetric(FID_METRIC_NAME, 0);
  const sendOnceAndTearDown = applySendOnceAndTearDown(wrapPerformanceMetric, report, subjects);
  if (!performance || !PerformanceObserver) {
    metric.isSupport = false;
    sendOnceAndTearDown(metric);
    return;
  }
  const send = (entry) => {
    metric.value = entry.processingStart - entry.startTime;

    sendOnceAndTearDown(metric);
  };
  const [, , getEntriesByType] = applyPerformance(performance);
  const entries = getEntriesByType(FI_ENTRY_NAME)[0];
  if (entries) {
    send(entries);
  } else {
    subjects.push(observePerf(PerformanceObserver, send, [FI_ENTRY_NAME]));
  }
}

const FID = [FID_METRIC_NAME, getFID];
const LS_ENTRY_NAME = 'layout-shift';


const CLS_METRIC_NAME = 'cls';

function applyHandleEntries() {
  let time = 0;
  let times = [];
  return [
    () => {
      time = 0;
    },
    (handleEntry, entry) => {
      if (!entry.hadRecentInput) {
        const head = times[0];
        const tail = times[times.length - 1];
        if (time && entry.startTime - tail < 1e3 && entry.startTime - head < 5e3) {
          time += entry.value;
          times.push(entry.startTime);
        } else {
          time = entry.value;
          times = [entry.startTime];
        }

        handleEntry(time);
      }
    },
  ];
}

function observePerfWithBuffer(PerformanceObserver, callback, entryName) {
  const [, observeWithBuffer, dispose] = applyPerformanceObserver(PerformanceObserver, callback);
  observeWithBuffer(entryName);
  return dispose;
}

function getCLS(report, subjects, [globalHiddenSubject, globalUnloadSubject, privatePvSubject]) {
  const PerformanceObserver = getDefaultPerformanceObserver();
  let metric = initMetric(CLS_METRIC_NAME, 0);
  const reportMetric = applyReportMetric(report);
  if (!PerformanceObserver) {
    metric.isSupport = false;
    reportMetric(metric);
    return;
  }
  const [
    reset,
    applyHandleEntry,
  ] = applyHandleEntries();
  const handleEntry = applyHandleEntry.bind(null, (entry) => {
    if (entry > metric.value) {
      metric.value = entry;
    }
  });
  subjects.push(
    observePerfWithBuffer(PerformanceObserver, handleEntry, LS_ENTRY_NAME),
    globalHiddenSubject[0](reset),
    privatePvSubject[0]((overrides) => {
      reportMetric(metric, overrides);
      reset();
      metric = initMetric(CLS_METRIC_NAME, 0);
    }),
    globalUnloadSubject[0](() => {
      reportMetric(metric);
    }),
  );
}

const CLS = [CLS_METRIC_NAME, getCLS];

const LONGTASK_METRIC_NAME = 'longtask';

function wrapLongtask(longtask) {
  return {
    eventType: LONG_TASK_EV_TYPE,
    payload: { type: 'perf', longtasks: [longtask] },
  };
}

function getLongtask(report, subjects, [, , globalLongtaskSubject]) {
  subjects.push(
    globalLongtaskSubject[0]((longtask) => {
      report(wrapLongtask(longtask));
    }),
  );
}

const LONGTASK = [LONGTASK_METRIC_NAME, getLongtask];

const TIMING_METRIC_NAME = 'timing';

function getTiming(report, subjects, [globalLoadSubject, globalUnloadSubject]) {
  const performance = getDefaultPerformance();
  const [, , getEntriesByType] = applyPerformance(performance);
  const sendOnceAndTearDown = applySendOnceAndTearDown((isBounced) => {
    return {
      eventType: 'performance_timing',
      payload: {
        isBounced,
        timing: performance && performance.timing || undefined,
        navigation_timing: getEntriesByType('navigation')[0],
      },
    };
  }, report, subjects);

  subjects.push(
    globalLoadSubject[0](() => {
      sendOnceAndTearDown(false);
    }),
    globalUnloadSubject[0](() => {
      sendOnceAndTearDown(true);
    }),
  );

}

const TIMING = [TIMING_METRIC_NAME, getTiming];
const MPFID_METRIC_NAME = 'mpfid';

function getMPFID(report, subjects, [globalLoadSubject, , globalLongtaskSubject]) {
  const PerformanceObserver = getDefaultPerformanceObserver();
  const metric = initMetric(MPFID_METRIC_NAME, 0);
  const sendOnceAndTearDown = applySendOnceAndTearDown(wrapPerformanceMetric, report, subjects);
  if (!PerformanceObserver) {
    metric.isSupport = false;
    sendOnceAndTearDown(metric);
    return;
  }
  const performance = getDefaultPerformance();
  const longtasks = [];
  subjects.push(globalLongtaskSubject[0]((longtask) => {
    longtasks.push(longtask);
  }));

  function send() {
    const [, , , , getEntriesByName] = applyPerformance(performance);
    const entry = getEntriesByName(FCP_ENTRY_NAME)[0];
    const entryStartTime = entry && entry.startTime || 0;
    metric.value = longtasks.reduce((value, longtask) => {
      const { duration, startTime } = longtask;
      return value < duration && entryStartTime < startTime ? duration : value;
    }, 0);
    longtasks.length = 0;
    sendOnceAndTearDown(metric);
  }

  subjects.push(
    globalLoadSubject[0](() => {
      setTimeout(send, 200);
    }),
  );
}

const MPFID = [MPFID_METRIC_NAME, getMPFID];
const SPA_LOAD_METRIC_NAME = 'spa_load';

function getSPA(report) {
  let startTime = 0;

  const metric = initMetric(SPA_LOAD_METRIC_NAME, 0);
  return [
    () => {
      startTime = Date.now();
    },
    () => {
      metric.value = Date.now() - startTime;
      if (report) {
        report(wrapPerformanceMetric(metric));
      }
      startTime = 0;
    },
  ];
}

export default function PerformanceMonitorPlugin(client) {
  client.on('init', function () {
    const performancePrecollect = client.pp || defaultPerformancePrecollect;
    performancePrecollect.observer?.disconnect();
    const pluginConfig = getPluginConfig(client, PERFORMANCE_MONITOR_PLUGIN_NAME, {});
    if (pluginConfig) {
      const globalHiddenSubject = initSubjectInGlobal(client, hiddenSubject);
      const globalUnloadSubject = initSubjectInGlobal(client, unloadSubject);
      const globalLoadSubject = initSubjectInGlobal(client, loadSubject);
      const globalLongtaskSubject = initSubjectInGlobal(client, longtaskSubject);
      const subjectsList = [];
      let overrides = undefined;
      initPrivateSubject(client, getFirstPVSubject(client), -1)[0]((e) => {
        overrides = e;
      })();

      const report = (data) => {
        if (data.eventType === SINGLE_METRIC_EV_TYPE && data.payload.name === CLS[0] || data.eventType === LONG_TASK_EV_TYPE) {
          client.report(data);
        } else {
          client.report({ ...data, overrides });
        }
      };

      const privatePvSubject = initPrivateSubject(client, getPVSubject(client));

      [FP, FCP, LCP, FID, CLS].forEach((subject) => {
        if (pluginConfig[subject[0]] !== false) {
          const subjects = [];
          subject[1](report, subjects, [globalHiddenSubject, globalUnloadSubject, privatePvSubject]);
          subjectsList.push(subjects);
        }
      });

      [LONGTASK, TIMING, MPFID].forEach((subject) => {
        if (pluginConfig[subject[0]] !== false) {
          const subjects = [];
          subject[1](report, subjects, [globalLoadSubject, globalUnloadSubject, globalLongtaskSubject]);
          subjectsList.push(subjects);
        }
      });

      const [performanceInit, performanceSend] = getSPA(client.report.bind(client));
      client.provide('performanceInit', performanceInit);
      client.provide('performanceSend', performanceSend);
      performancePrecollect.entries.length = 0;
      client.provide('sendCustomPerfMetric', (metricContext) => {
        client.report(wrapPerformanceMetric({
          ...defaultMetricContext,
          ...metricContext,
          isCustom: true,
        }));
      });

      client.on('beforeDestroy', () => {
        subjectsList.reduce((e, t) => e.concat(t), []).forEach((dispose) => dispose());

        subjectsList.length = 0;
      });
    }
  });
}
