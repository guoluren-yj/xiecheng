// 引入 存储 数据权限维度配置的方法
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
import { createElement } from 'react';
import dynamic from 'dva/dynamic';

const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

const dynamicWrapper = (app, models, component) => {
  return dynamic({
    app,
    models: () =>
      models
        .filter((model) => modelNotExisted(app, model))
        .map((m) => import(`../models/${m}.js`)) || [],
    // add routerData prop
    component: () => {
      return component().then((raw) => {
        const Component = raw.default || raw;
        return (props) =>
          createElement(Component, {
            ...props,
          });
      });
    },
  });
};

setWorkflowApproveForm({
  code: 'DEFAULT:WOEKFLOW_STANDARD_TEST', // 流程表单编码
  customSubmit: true, // 注册了submit回调函数时必须加这个属性
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/StandardFormTest') // 流程表单页面组件
    );
  },
});
