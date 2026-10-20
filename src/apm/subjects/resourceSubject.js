import getDefaultPerformanceObserver from '../utils/getDefaultPerformanceObserver';
import observePerf from '../utils/observePerf';

const RESOURCE_SUBJECT_NAME = 'resource_0';
const RESOURCE_TYPE = ['resource'];

function observeResource(subscribe, unsubscribe) {
  const PerformanceObserver = getDefaultPerformanceObserver();
  if (PerformanceObserver) {
    unsubscribe(observePerf(PerformanceObserver, subscribe, RESOURCE_TYPE));
  }
}

const resourceSubject = [RESOURCE_SUBJECT_NAME, observeResource];
export default resourceSubject;
