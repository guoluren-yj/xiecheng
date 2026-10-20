import '../../customize';

import { getConvertRouter } from 'hzero-front/lib/utils/getConvertRouter';
import routers from '../../config/routers';

const convertRouter = app =>
  getConvertRouter({
    hzeroRoutes: routers,
    options: { app },
  });

export function getRouterData(app) {
  return convertRouter(app)();
}
