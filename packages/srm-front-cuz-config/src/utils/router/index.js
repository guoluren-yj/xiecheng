import '../../customize';

import { getConvertRouter } from 'hzero-front/lib/utils/getConvertRouter';
import routers from '../../config/router';
import 'srm-front-boot/lib/utils/less-polyfill';
import 'srm-front-boot/lib/utils/c7nUiConfig';

const convertRouter = app =>
  getConvertRouter({
    hzeroRoutes: routers(),
    options: { app },
  });

export function getRouterData(app) {
  return convertRouter(app)();
}
