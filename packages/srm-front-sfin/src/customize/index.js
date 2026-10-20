import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';

const workFlowForms = [
  {
    code: 'SODR.BILL.APPROVE.FORM', // 开票申请审批页面
    models: ['bill'],
    component: () => import('../routes/Bill/Audit/Detail'),
  },
  // {
  //   code: 'SODR.BILL.APPROVE.FORM.SAVE', // 开票申请审批可保存页面
  //   models: [() => import('../models/bill.js')],
  //   component: () => import('../routes/Bill/Audit/Detail'),
  // },
  {
    code: 'SODR.BILL.APPROVE.FORM_READ', // 开票申请审批只读页面
    models: ['bill'],
    component: () => import('../routes/Bill/Audit/Detail'),
  },
  {
    code: 'SFIN.DEDUCTION_WORKFLOW_DOC', // 扣款单流程表单
    models: ['supplierCommon'],
    component: () => import('../routes/SupplierWorkFollowApproval'),
  },
  {
    code: 'SFIN.INVOICE_APPROVE_READONLY', // 应付发票审核(只读)
    models: ['invoice', 'bill'],
    component: () => import('../routes/Invoice/Approve/Detail'),
  },
  {
    code: 'SFIN.PAYMENT', // 到票付款审批单据
    models: ['payQuery'],
    component: () => import('../routes/PaymentQuery/Detail'),
  },
  {
    code: 'SFIN.ADVANCE_PAYMENT', // 预付款申请审批单据
    models: ['payQuery'],
    component: () => import('../routes/PaymentQuery/AdvanceDetail'),
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

workFlowForms.forEach((item) => {
  const { code, models = [], component } = item;
  setWorkflowApproveForm({
    code, // 流程单据内配置的流程单据编码 只读
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        models, // 流程表单页面用到的 model
        component // 流程表单页面组件
      );
    },
  });
});
