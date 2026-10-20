/**
 * 用于普通方法埋点
 */

import { isNumber } from 'lodash';
import { mapCustomize } from 'utils/customize';

const FEATURE = 'trackingMethod';

export function setTrackingMethod({ module, code, method, priority }: { module: string, code: string, method: Function, priority?: number }) {
  if (
    mapCustomize.has({
      module,
      feature: FEATURE,
      key: code,
    })
  ) {
    const oldTracking = mapCustomize.get({
      module,
      feature: FEATURE,
      key: code,
    });
    if (
      isNumber(oldTracking.priority) &&
      isNumber(priority) &&
      oldTracking.priority < priority
    ) {
      mapCustomize.delete({
        module,
        feature: FEATURE,
        key: code,
      });
      mapCustomize.set({
        module,
        feature: FEATURE,
        key: code,
        data: { method },
      });
    }
  } else {
    mapCustomize.set({
      module,
      feature: FEATURE,
      key: code,
      data: { method },
    });
  }
}

export function loadTrackingMethod({ module, code }: { module: string, code: string }) {
  if (
    mapCustomize.has({ module, feature: FEATURE, key: code })
  ) {
    const data = mapCustomize.get({
      module,
      feature: FEATURE,
      key: code,
    });
    if (data && data.method) {
      return data.method;
    }
  }
  return undefined;
}