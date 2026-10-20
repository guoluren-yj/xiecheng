import reportSelfError from './reportSelfError';

export default function applyMonitor(monitor, config={}, post, r=[]) {
  try {
    const fn = monitor(...r);
    return fn && fn(config, post) || [];
  } catch (error) {
    reportSelfError(error);
    return [];
  }
}
