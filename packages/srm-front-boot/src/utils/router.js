/* eslint-disable import/no-dynamic-require */
import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';
import routers from '../config/router';

const convertRouter = (app) =>
  getConvertRouter({
    hzeroRoutes: routers,
    options: { app },
  });

export function getRouterData(app) {
  return convertRouter(app)();
}
