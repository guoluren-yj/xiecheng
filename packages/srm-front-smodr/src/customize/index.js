import { createElement } from 'react';
import dynamic from 'dva/dynamic';
// import { dynamicWrapper } from 'utils/router';

// 引入 存储 卡片配置的方法
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
// 引入 加载 model 的包装方法
const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
export const dynamicWrapper = (app, models, component) => {
  return dynamic({
    app,
    models: () =>
      models
        .filter((model) => modelNotExisted(app, model))
        .map((m) => import(`../models/oms/${m}.js`)) || [],
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return (props) =>
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

// 商城订单审批
setWorkflowApproveForm({
  customSubmit: true, // 控制表单渲染完后才能进行审批操作
  code: 'S2FUL.ORDER_INTERNAL_APPROVE:SMODR.ORDER.DETAIL.APPROVE', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['orderLineManage'], // 流程表单页面用到的 model
      () => import('../routes/oms/OrderDetailWFP') // 流程表单页面组件
    );
  },
});

// 商城批次审批
setWorkflowApproveForm({
  customSubmit: true,
  code: 'S2FUL.BATCH_INTERNAL_APPROVE:SMODR.ORDER.BATCH.APPROVE', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/oms/OrderDetailBatch') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  customSubmit: true,
  code: 'S2FUL.AFTER_SALE_APPROVE:COMMON', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/oms/AfterSaleWFP') // 流程表单页面组件
    );
  },
});

// 商城申请审批
setWorkflowApproveForm({
  customSubmit: true,
  code: 'S2FUL.MALL_REQUEST_APPROVE:COMMON', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/oms/OrderRequestWFP') // 流程表单页面组件
    );
  },
});

// 商城接收审批
setWorkflowApproveForm({
  customSubmit: true,
  code: 'S2FUL.RECEIPT_APPROVE:SMODR.RECEIPT.DETAIL.APPROVE', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/oms/AcceptOrderWFP') // 流程表单页面组件
    );
  },
});
