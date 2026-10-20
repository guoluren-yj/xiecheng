import getDefaultPerformanceObserver from './getDefaultPerformanceObserver';
import getDefaultPerformance from './getDefaultPerformance';
import initMetric from './initMetric';
import applySendOnceAndTearDown from './applySendOnceAndTearDown';
import wrapPerformanceMetric from './wrapPerformanceMetric';
import applyPerformance from './applyPerformance';
import observePerf from './observePerf';

const Paint_Type = 'paint'
export default function getPaint(entryName, metricName, report, subjects, [globalHiddenSubject, globalUnloadSubject]) {
  const PerformanceObserver = getDefaultPerformanceObserver();
  const performance = getDefaultPerformance();
  const metric = initMetric(metricName, 0);
  const sendOnceAndTearDown = applySendOnceAndTearDown(wrapPerformanceMetric, report, subjects);
  if (!performance || !PerformanceObserver) {
    metric.isSupport = false;
    sendOnceAndTearDown(metric);
    return;
  }

  function send(entry) {
    metric.value = entry.startTime;
    sendOnceAndTearDown(metric);
  }

  const [, , , , getEntriesByName] = applyPerformance(performance);
  const entries = getEntriesByName(entryName)[0];
  if (entries) {
    send(entries);
  } else {
    subjects.push(
      observePerf(PerformanceObserver, (entry) => {
        if (entry.name === entryName) {
          send(entry);
        }
      }, [Paint_Type]),
      globalHiddenSubject[0](() => {
        metric.isSupport = false;
        sendOnceAndTearDown(metric);
      }),
      globalUnloadSubject[0](() => {
        metric.isBounced = true;
        sendOnceAndTearDown(metric);
      }),
    );
  }
}
