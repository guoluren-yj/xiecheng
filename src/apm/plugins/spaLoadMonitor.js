import getDefaultDocument from '../utils/getDefaultDocument';
import getDefaultPerformanceObserver from '../utils/getDefaultPerformanceObserver';
import getDefaultMutationObserver from '../utils/getDefaultMutationObserver';
import initSubjectInGlobal from '../utils/initSubjectInGlobal';
import initMetric from '../utils/initMetric';
import applyReportMetric from '../utils/applyReportMetric';
import applyRecord from '../utils/applyRecord';
import applyMutationObserver from '../utils/applyMutationObserver';
import observePerf from '../utils/observePerf';
import { initPrivateSubject } from './subject';
import ajaxSubject from '../subjects/ajaxSubject';
import fetchSubject from '../subjects/fetchSubject';
import longtaskSubject from '../subjects/longtaskSubject';
import getPVSubject from '../subjects/getPVSubject';
import isSensitiveHeader from '../utils/isSensitiveHeader';
import { isString } from 'lodash';

const RESOURCE_TYPE = ['resource'];

const RESOURCE_SUBJECT_NAME = 'resource_0';

function observeResource(subscribe, unsubscribe) {
  const PerformanceObserver = getDefaultPerformanceObserver();
  if (PerformanceObserver) {
    unsubscribe(observePerf(PerformanceObserver, subscribe, RESOURCE_TYPE));
  }
}

const resourceSubject = [RESOURCE_SUBJECT_NAME, observeResource];

const SPA_LOAD_METRIC_NAME = 'spa_load';
const PAGE_ACTIVITY_DELAY = 100;
const MAX_PAGE_ACTIVITY_DELAY = 1e4;

function mergeHeaders(Headers, ...newHeaders) {
  try {
    return newHeaders.reduce((headers, header) => {
      new Headers(header || {}).forEach((e, t) => {
        if (!isSensitiveHeader(t, e)) {
          headers[t] = e;
        }
      });
      return headers;
    }, {});
  } catch (e) {
    return {};
  }
}

function waitActionComplete(onActive, handleComplete, win) {
  function handleActive() {
    win.clearTimeout(timer);

    if (active) {
      timer = win.setTimeout(() => {
        onActive();
      }, PAGE_ACTIVITY_DELAY);
    }
  }

  let timer, maxTimer, active = false;
  return [
    () => {
      active = true;
      win.clearTimeout(maxTimer);
      maxTimer = win.setTimeout(() => {
        onActive();
        handleComplete();
      }, MAX_PAGE_ACTIVITY_DELAY);
      handleActive();
    },
    handleActive,
    () => {
      active = false;
      win.clearTimeout(timer);
      win.clearTimeout(maxTimer);
    },
  ];
}

function formatXHRAllResponseHeaders(e) {
  if (isString(e) && e) {
    return e.split('\r\n').reduce((headers, str) => {
      var n;
      if (isString(str)) {
        const [t, n] = str.split(': ');
        if (!isSensitiveHeader(t, n)) {
          headers[t.toLowerCase()] = n;
        }
      }
      return headers;
    }, {});
  }
  return {};
}

function applyIncompleteReq(subjects, [ajaxSubjectObserver, fetchSubjectObserver], callback, traceIds) {
  const [record, set, remove] = applyRecord();
  let count = 0;
  subjects.push(ajaxSubjectObserver[0](() => {
    count += 1;
    const index = count;
    set(index, Date.now());
    callback();
    return (response) => {
      const headers = formatXHRAllResponseHeaders(response.getAllResponseHeaders());
      const traceId = headers['s-trace-id'];
      if (traceId) {
        traceIds.push(traceId);
      }
      remove(index);
      callback();
    };
  }));

  subjects.push(fetchSubjectObserver[0](() => {
    count += 1;
    const index = count;
    set(index, Date.now());
    callback();
    return (response) => {
      const headers = response._headers;
      const traceId = headers['s-trace-id'];
      if (traceId) {
        traceIds.push(traceId);
      }
      remove(index);
      callback();
    };
  }));

  return record;
}

function getSPA(
  report,
  subjects,
  [
    pvSubjectObserver,
    ajaxSubjectObserver,
    fetchSubjectObserver,
    resourceSubjectObserver,
    longtaskSubjectObserver,
    MutationObserver,
  ],
) {
  function handleComplete() {
    inactive();
    timing = 0;
    disconnect();
  }

  let timing = 0;
  const traceIds = [];
  const reportMetric = applyReportMetric(report);
  const [active, onComplete, inactive] = waitActionComplete(
    () => {
      if (!Object.keys(requestRecord).length && timing) {
        reportMetric(initMetric(SPA_LOAD_METRIC_NAME, Date.now() - timing, { traceIds }));
        traceIds.length = 0;
        handleComplete();
      }
    },
    handleComplete,
    window,
  );
  const requestRecord = applyIncompleteReq(
    subjects,
    [ajaxSubjectObserver, fetchSubjectObserver],
    onComplete,
    traceIds,
  );
  subjects.push(resourceSubjectObserver[0](onComplete));
  subjects.push(longtaskSubjectObserver[0](onComplete));
  const [observe, disconnect] = applyMutationObserver(MutationObserver, onComplete);
  subjects.push(disconnect);
  subjects.push(pvSubjectObserver[0](() => {
    handleComplete();
    timing = Date.now();
    observe(document, { childList: true, subtree: true });
    active();
  }));
  subjects.push(handleComplete);
}

export default function SPALoadMonitorPlugin(client) {
  client.on('init', () => {
    const subjects = [];
    const doc = getDefaultDocument();
    const MutationObserver = getDefaultMutationObserver();
    if (doc && MutationObserver) {
      getSPA(
        client.report.bind(client),
        subjects,
        [
          initPrivateSubject(client, getPVSubject(client)),
          initSubjectInGlobal(client, ajaxSubject),
          initSubjectInGlobal(client, fetchSubject),
          initSubjectInGlobal(client, resourceSubject),
          initSubjectInGlobal(client, longtaskSubject),
          MutationObserver,
        ],
      );

      client.on('beforeDestroy', () => {
        subjects.forEach((dispose) => dispose());
      });
    }
  });
}
