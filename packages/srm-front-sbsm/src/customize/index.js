// 引入 存储 卡片配置的方法
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
// 引入 加载 model 的包装方法
import { createElement } from 'react';
import dynamic from 'dva/dynamic';

const workFlowForms = [
  {
    code: 'SBSM.TERM_RELEASE:TERM_READ', // 付款条款定义只读
    // customSubmit: true,
    component: () => import('../routes/FundPlanTerm/Detail'),
  },
  {
    code: 'SBSM.PREP_HEADER:READ', // 编制单只读
    component: () => import('../routes/FundPlanPreparation/Detail'),
  },
  {
    code: 'SBSM_BALANCE_HEADER:READ', // 汇总单只读
    component: () => import('../routes/FundPlanSummary/Detail'),
  },
  {
    code: 'SBSM.PAY_REVERSE_DOCUMENT:VIEW',
    component: () => import('../routes/PaymentWorkbench/Detail'),
  },
  {
    code: 'SBSM.PAY_HEADER:VIEW',
    component: () => import('../routes/PaymentWorkbench/Detail'),
  },
  {
    code: 'SBSM.PAY_HEADER_BATCH:VIEW',
    component: () => import('../routes/PaymentWorkbench/BatchWorkflow'),
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
    // add routerData prop
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
