import getLocationUrl from './getLocationUrl';

export default function reportOnInitCommonParams(client, getOverrides) {
  const config = client.config();
  const params = {
    url: getLocationUrl(),
    pid: config.pid,
    view_id: config.viewId,
  };
  return (data) => {
    client.report({
      ...data,
      overrides: {
        ...params,
        ...(getOverrides && getOverrides(data) || {}),
      },
    });
  };
}
