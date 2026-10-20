import wrapPerformanceMetric from './wrapPerformanceMetric';

export default function applyReportMetric(report) {
  return (payload, overrides) => {
    report(wrapPerformanceMetric(payload, overrides));
  };
}
