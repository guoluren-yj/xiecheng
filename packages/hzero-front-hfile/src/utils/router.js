// import { createElement } from 'react';
// import dynamic from 'dva/dynamic';
// import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';

// import msRouters from '../config/router';

// const modelNotExisted = (app = {}, model) =>
//   // eslint-disable-next-line
//   !(app._models || []).some(({ namespace }) => {
//     return namespace === model.substring(model.lastIndexOf('/') + 1);
//   });

// // wrapper of dynamic
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

// export function getRouterData(app) {
//   return getConvertRouter({
//     hzeroRoutes: msRouters(),
//     options: { app },
//   })();
// }

// 注释原文件，引入hzero-front中的内容
import { getConvertRouter } from 'hzero-front/lib/utils/getConvertRouter';
import routers from '../config/routers';

const convertRouter = app =>
  getConvertRouter({
    hzeroRoutes: routers,
    options: { app },
  });

export function getRouterData(app) {
  return convertRouter(app)();
}
