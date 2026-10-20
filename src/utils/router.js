import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';
import routers from '../config/routers';

export function getRouterData(app) {
  return getConvertRouter({
    hzeroRoutes: routers,
    options: { app },
  })();
}
