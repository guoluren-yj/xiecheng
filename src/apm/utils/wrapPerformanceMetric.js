const SINGLE_METRIC_EV_TYPE = 'performance';

export default function wrapPerformanceMetric(payload, overrides) {
  return { eventType: SINGLE_METRIC_EV_TYPE, payload, overrides };
}
