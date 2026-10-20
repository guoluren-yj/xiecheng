import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';
import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import msRouters from '../config/router';

export function getRouterData(app) {
  return getConvertRouter({
    hzeroRoutes: msRouters(),
    options: { app },
  })();
}

const modelNotExisted = (app = {}, model) =>
  !(app._models || []).some(
    ({ namespace }) => namespace === model.substring(model.lastIndexOf('/') + 1)
  );
// wrapper of dynamic
export const dynamicWrapper = (app, models, component) =>
  dynamic({
    app,
    models: () =>
      models
        .filter((model) => modelNotExisted(app, model))
        .map((m) => import(`../models/${m}.js`)) || [],
    // add routerData prop
    component: () =>
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      component().then((raw) => {
        const Component = raw.default || raw;
        return (props) =>
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      }),
  });

// export const dynamicWrapper = (app, models, component) => {
//   console.log('dynamicWrapper初始')
//   return dynamic({
//     app,
//     models: () => {
//       console.log('models初始')
//       return models
//       .filter((model) => modelNotExisted(app, model))
//       .map((m) => import(`../models/${m}.js`)) || []
//     },
//     // add routerData prop
//     component: () => {
//         console.log('component初始')
//         return component().then((raw) => {
//           const Component = raw.default || raw;
//           return (props) =>
//             createElement(Component, {
//               ...props,
//               // routerData: routerDataCache,
//           });
//       }),
//     }
//   });
// }
