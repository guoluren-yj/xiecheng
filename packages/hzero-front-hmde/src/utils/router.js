import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';

import msRouters from '../config/router';
import '../lowcodeGlobal.less';
import '../businessGlobal.less';

export function getRouterData(app) {
  return getConvertRouter({
    hzeroRoutes: msRouters(),
    options: { app },
  })();
}
