import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';

const workFlowForms = [
  {
    code: 'SRM_SPFP_RULE:READ', // 返利规则(只读)-明细
    component: () => import('../routes/RuleMaintenance/Rebate/Create/index'),
  },
];

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
    component: () => {
      return component().then((raw) => {
        const Component = raw.default || raw;
        return (props) =>
          //  eslint-disable-next-line
          createElement(Component, {
            ...props,
          });
      });
    },
  });
};

// 折扣规则审批表单
setWorkflowApproveForm({
  code: 'SRM_SPCM_RULE:DETAIL',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/RuleMaintenance/Discount/Create') // 流程表单页面组件
    ),
});

workFlowForms.forEach((item) => {
  const { code, models = [], component, customSubmit } = item;
  setWorkflowApproveForm({
    code, // 流程单据内配置的流程单据编码 只读
    customSubmit,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        models, // 流程表单页面用到的 model
        component // 流程表单页面组件
      );
    },
  });
});
