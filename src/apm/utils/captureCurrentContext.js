import getLocationUrl from './getLocationUrl';

export function captureCurrentContext(client) {
  const t = { url: getLocationUrl(), timestamp: Date.now() };
  const config = client.config();
  if (config && config.pid) {
    t.pid = config.pid;
  }
  if (client && client.context) {
    t.context = client.context.toString();
  }
  return t;
}

export function syncReportWithCapturedContext(client, overrides) {
  return (callback) => {
    function report(e) {
      e.overrides = overrides;
      return e;
    }

    client.on('report', report);
    callback();
    client.off('report', report);
  };
}
