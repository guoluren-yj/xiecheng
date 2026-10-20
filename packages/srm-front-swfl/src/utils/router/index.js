import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';
import msRouters from '@/config/router';
import '@/customize';

export function getRouterData(app) {
  return getConvertRouter({
    hzeroRoutes: msRouters(),
    options: { app },
  })();
}
