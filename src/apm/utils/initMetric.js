export const defaultMetricContext = {
  isSupport: true,
  isPolyfill: false,
  isBounced: false,
  isCustom: false,
  type: 'perf',
};

export default function initMetric(name, value, otherContext) {
  return {
    name,
    value,
    ...defaultMetricContext,
    ...otherContext,
  };
}
