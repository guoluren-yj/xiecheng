export default function applyPerformanceObserver(PerformanceObserver, callback, dispose) {
  const observer = PerformanceObserver && new PerformanceObserver((entries, observer) => {
    if (entries.getEntries) {
      entries.getEntries().forEach(
        (entry, index, entries) => callback(entry, index, entries, observer)
      );
    } else if (dispose) {
      dispose();
    }
  });
  return [
    (entryTypes) => {
      if (!PerformanceObserver || !observer) {
        return dispose && dispose();
      }
      try {
        observer.observe({ entryTypes });
      } catch (e) {
        return dispose && dispose();
      }
    },
    (type) => {
      if (!PerformanceObserver || !observer) {
        return dispose && dispose();
      }
      try {
        observer.observe({ type, buffered: true });
      } catch (e) {
        return dispose && dispose();
      }
      observer.observe({ type, buffered: false });
    },
    () => observer && observer.disconnect(),
  ];
}
