/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-08-23 19:16:12
 */
// import { createElement } from 'react';
// import dynamic from 'dva/dynamic';

import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';
import msRouters from '../config/router';
// 修改方法，增加modelNotExisted
// const modelNotExisted = (app = {}, model) =>
//   // eslint-disable-next-line
//   !(app._models || []).some(({ namespace }) => {
//     return namespace === model.substring(model.lastIndexOf('/') + 1);
//   });

// wrapper of dynamic
// export const dynamicWrapper = (app, models, component) => {
//   return dynamic({
//     app,
//     models: () =>
//       models
//         .filter((model) => modelNotExisted(app, model))
//         .map((m) => import(`../models/${m}.js`)) || [],
//     // add routerData prop
//     component: () => {
//       // if (!routerDataCache) {
//       //   routerDataCache = getRouterData(app);
//       // }
//       return component().then((raw) => {
//         const Component = raw.default || raw;
//         return (props) =>
//           createElement(Component, {
//             ...props,
//             // routerData: routerDataCache,
//           });
//       });
//     },
//   });
// };

export function getRouterData(app) {
  return getConvertRouter({
    hzeroRoutes: msRouters(),
    options: { app },
  })();
}
