import getLocationUrl from './getLocationUrl';

export default function getCbHook(r) {
  return (t) => {
    if (!t) {
      return t;
    }
    const config = r.config();
    const n = {
      url: getLocationUrl(),
      pid: config.pid,
      view_id: config.viewId,
      context: r.context?.toString(),
    };
    return (e) => {
      t({
        ...e,
        overrides: {
          ...n,
          timestamp: e.payload.request.timestamp,
        },
      });
    };
  };
}
