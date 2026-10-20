import getDefaultPerformanceObserver from '../utils/getDefaultPerformanceObserver';
import observePerf from '../utils/observePerf';

const LONGTASK_TYPE = ['longtask'];

const LONGTASK_SUBJECT_NAME = 'longtask_0';

function observeLongtask(subscribe, unsubscribe) {
  const PerformanceObserver = getDefaultPerformanceObserver();
  if (PerformanceObserver) {
    unsubscribe(observePerf(PerformanceObserver, subscribe, LONGTASK_TYPE));
  }
}

const longtaskSubject = [LONGTASK_SUBJECT_NAME, observeLongtask];

export default longtaskSubject;
