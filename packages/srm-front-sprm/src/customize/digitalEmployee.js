import { setDigitalEmployeeButtonRoute } from 'srm-front-spfm/lib/customize/digitalEmployee';
import dynamic from 'dva/dynamic';
import { createElement } from 'react';

const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

const dynamicWrapper = (app, models, component) => {
  //  eslint-disable-next-line
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)) ||
      [],
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          //  eslint-disable-next-line
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

setDigitalEmployeeButtonRoute({
  path: '/pub/sprm/ai-request-query',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/AiRequestQuery'));
  },
});
setDigitalEmployeeButtonRoute({
  path: '/pub/sprm/ai-source-match',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/AiSourceMatchDetail'));
  },
});
setDigitalEmployeeButtonRoute({
  path: '/pub/sprm/ai-pr-view',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/AiPrView'));
  },
});
setDigitalEmployeeButtonRoute({
  path: '/pub/sprm/ai-pr-view?transferStatus=FAILED',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/AiPrView'));
  },
});
setDigitalEmployeeButtonRoute({
  path: '/pub/sprm/ai-order-view',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/AiOrderView'));
  },
});
