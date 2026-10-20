import { isFunction } from 'lodash';

export default function applyPerformance(performance) {
  const timing = performance && performance.timing || undefined;
  return [
    timing,
    () => {
      return performance && performance.now
        ? performance.now()
        : (Date.now ? Date.now() : +new Date()) - (timing && timing.navigationStart || 0);
    },
    (type) => {
      const { getEntriesByType } = (performance || {});
      return isFunction(getEntriesByType) && getEntriesByType.call(performance, type) || [];
    },
    () => {
      const { clearResourceTimings } = (performance || {});
      if (isFunction(clearResourceTimings)) {
        clearResourceTimings.call(performance);
      }
    },
    (name) => {
      const { getEntriesByName } = (performance || {});
      return isFunction(getEntriesByName) && getEntriesByName.call(performance, name) || [];
    },
  ];
}
