import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';

import msRouters from '../config/router';

export function getRouterData(app) {
  return getConvertRouter({
    hzeroRoutes: msRouters(),
    options: { app },
  })();
}
