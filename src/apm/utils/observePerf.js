import applyPerformanceObserver from './applyPerformanceObserver';

export default function observePerf(PerformanceObserver, subscribe, entryTypes) {
  const [observe, , dispose] = applyPerformanceObserver(PerformanceObserver, subscribe);
  observe(entryTypes);
  return dispose;
}
