import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
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
      models
        .filter((model) => modelNotExisted(app, model))
        .map((m) => import(`../models/${m}.js`)) || [],
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return (props) =>
          //  eslint-disable-next-line
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

// 预算编制表单
setWorkflowApproveForm({
  code: 'SBUD_BUDGET_APPROVEL_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/Budgeting/onlyView') // 流程表单页面组件
    );
  },
});

// 预算编制新建审批表单
setWorkflowApproveForm({
  code: 'BUDGET_NEW_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/Budget/ReadOnly') // 流程表单页面组件
    );
  },
});

// 预算编制调整审批表单
setWorkflowApproveForm({
  code: 'BUDGET_EDIT_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/Budget/ReadOnly') // 流程表单页面组件
    );
  },
});
