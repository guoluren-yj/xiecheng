import getLocationUrl from '../utils/getLocationUrl';

function getOverrides(config) {
  return { pid: config.pid, view_id: config.viewId, url: getLocationUrl() };
}

const clients = new WeakMap();

function applyPV(client) {
  return (subscribe, unsubscribe) => {
    function handleBeforeConfig(e) {
      if (e.viewId && e.viewId !== (client.config()?.viewId)) {
        subscribe(overrides);
        overrides = getOverrides(e);
      }
    }

    let overrides = getOverrides(client.config());
    client.on('beforeConfig', handleBeforeConfig);

    unsubscribe(() => {
      client.off('beforeConfig', handleBeforeConfig);
    });
  };
}

const PV_SUBJECT_NAME = 'view_0';

export default function getPVSubject(client) {
  let subject = clients.get(client);
  if (!subject) {
    subject = applyPV(client);
    clients.set(client, subject);
  }
  return [
    PV_SUBJECT_NAME,
    subject,
  ];
}
