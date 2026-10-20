import { noop } from 'lodash';
import getLocationUrl from '../utils/getLocationUrl';

function getOverrides(config) {
  return {
    pid: config.pid,
    view_id: config.viewId,
    url: getLocationUrl(),
  };
}

const FIRST_PV_SUBJECT_NAME = 'f_view_0';

function applyFirstPV(r) {
  return (subscribe, unsubscribe) => {
    const overrides = getOverrides(r.config());
    unsubscribe(
      noop,
      (e) => {
        if (overrides) {
          e(overrides);
        }
      },
    );
  };
}

export default function getFirstPVSubject(client) {
  return [FIRST_PV_SUBJECT_NAME, applyFirstPV(client)];
}
