// 引入 存储 卡片配置的方法
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
// 引入 加载 model 的包装方法
import { createElement } from 'react';
import dynamic from 'dva/dynamic';
// import { dynamicWrapper } from '../utils/router';

const workFlowForms = [
  {
    code: 'SSTA.SETTLE_HEADER.EX_ERP_READ', // UX采购方发票申请结算单(导出ERP只读) 有注册submit函数
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER.EX_EXPORT', // UX采购方发票申请结算单(导出ERP)- 有注册submit函数
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER.PUR_READ', // UX采购方结算单(只读)
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER.PUR_EDIT', // UX采购方发票申请结算单(可编辑) 有注册submit函数
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER.SUP_READ', // UX销售方结算单(只读)
    component: () => import('../routes/NewSupplySettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER.P_PRE_EDIT', // UX采购方预付款申请结算单(可编辑）
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/PrePayment/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER.P_PRE_READ', // UX采购方预付款申请结算单(只读）
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/PrePayment/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER:P_PRE_READ_DETAIL', // UX采购方预付款申请结算单(只读）-新审批表单
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/PrePayment/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER:P_PRE_OTHER_EDIT', // UX采购方结算单-预付款申请(其他信息、结算单行个性化字段可编辑）
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/PrePayment/Detail'),
  },
  {
    code: 'SDEP.TENDER_FEES:READ_ONLY', // 保证金详情(只读）
    component: () => import('../routes/SourcingCostPurchaser/TenderDetail'),
  },
  {
    code: 'SDEP.DEPOSIT:_READ_ONLY', // 保证金详情(只读）
    customSubmit: true,
    component: () => import('../routes/SourcingCostPurchaser/DepositDetail'),
  },
  {
    code: 'SDEP.DEPOSIT:PROCESS_DOCUMENT', // 新保证金审批
    customSubmit: true,
    component: () => import('../routes/SourcingCostPurchaser/DepositApproval'),
  },
  {
    code: 'SDEP.SERVER_FEES:_READ_ONLY', // 服务费详情(只读）
    component: () => import('../routes/SourcingCostPurchaser/ServiceDetail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER:EX_ERP_READ_OVERVIEW', // UX采购方开票结算单(导出ERP只读)-概览, 有注册submit函数
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER:EX_ERP_READ_DETAIL', // UX采购方开票结算单(导出ERP只读)-明细, 有注册submit函数
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER:PUR_READ_OVERVIEW', // UX采购方结算单(只读)-概览
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER:PUR_READ_DETAIL', // UX采购方结算单(只读)-明细
    customSubmit: true,
    component: () => import('../routes/NewPurchaseSettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER:SUP_READ_OVERVIEW', // UX销售方结算单(只读)-概览
    component: () => import('../routes/NewSupplySettle/Detail'),
  },
  {
    code: 'SSTA.SETTLE_HEADER:SUP_READ_DETAIL', // UX销售方结算单(只读)-明细
    component: () => import('../routes/NewSupplySettle/Detail'),
  },
  {
    code: 'SSTA.BATCH_APPROVE_HEADER:READ', // 结算单批次审批
    component: () => import('../routes/NewPurchaseSettle/BatchSubmit'),
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
// 设置编码为 SFIN.APPROVE_FORM_A 的 流程表单
setWorkflowApproveForm({
  code: 'SSTA.SETTLE_HEADER_P_EDIT', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaseSettle/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSTA.SETTLE_HEADER_PURCHASE', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaseSettle/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSTA.SETTLE_HEADER_EXPORT', // 流程单据内配置的流程单据编码 有注册submit函数
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaseSettle/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSTA.SETTLE.HEADER.EXPORT.READ', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaseSettle/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSTA.CHARAGE_HEADER_EDIT', // 流程单据内配置的流程单据编码 编辑页面
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/CostSheet/Detail') // 流程表单页面组件
    );
  },
});
setWorkflowApproveForm({
  code: 'SSTA.CHARAGE_HEADER_EDIT_UX', // 流程单据内配置的流程单据编码 编辑页面
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/CostSheet/DetailNew') // 流程表单页面组件
    );
  },
});
setWorkflowApproveForm({
  code: 'SSTA.CHARAGE_HEADER_LINE_EDIT', // 流程单据内配置的流程单据编码 编辑行
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/CostSheet/Detail') // 流程表单页面组件
    );
  },
});
setWorkflowApproveForm({
  code: 'SSTA.CHARAGE_HEADER_LINE_UX', // 流程单据内配置的流程单据编码 编辑行
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/CostSheet/DetailNew') // 流程表单页面组件
    );
  },
});
setWorkflowApproveForm({
  code: 'SSTA.CHARAGE_HEADER', // 流程单据内配置的流程单据编码 只读页面
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/CostSheet/Detail') // 流程表单页面组件
    );
  },
});
setWorkflowApproveForm({
  code: 'SSTA.CHARAGE_HEADER_UX', // 流程单据内配置的流程单据编码 只读页面
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/CostSheet/DetailNew') // 流程表单页面组件
    );
  },
});
// ux采购方费用单只读-新审批表单
setWorkflowApproveForm({
  code: 'SSTA.CHARGE_HEADER:UX_DETAIL', // 流程单据内配置的流程单据编码 只读页面
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/CostSheet/DetailNew') // 流程表单页面组件
    );
  },
});
/**
 * 采购方对账单
 */
setWorkflowApproveForm({
  code: 'SSTA_BILL_PURCHASER', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbench/Detail') // 流程表单页面组件
    );
  },
});
/**
 * 采购方对账单
 */
setWorkflowApproveForm({
  code: 'SSTA_BILL_PURCHASER_UX', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbench/DetailNew') // 流程表单页面组件
    );
  },
});
/**
 * 采购方对账单-新审批表单
 */
setWorkflowApproveForm({
  code: 'SSTA.BILL_PURCHASER:UX_DETAIL', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbench/DetailNew') // 流程表单页面组件
    );
  },
});
/**
 * 采购方对账单
 */
setWorkflowApproveForm({
  code: 'SSTA.BILL_PURCHASER:OTHER_EDIT', // 流程单据内配置的流程单据编码 其他信息可编辑
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbench/DetailNew') // 流程表单页面组件
    );
  },
});
setWorkflowApproveForm({
  code: 'SSTA.BILL_SUPPLIER:SSTA_BILL_PURCHASER_UX',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbench/DetailNew') // 流程表单页面组件
    );
  },
});
setWorkflowApproveForm({
  code: 'SSTA.BILL_SUPPLIER:OTHER_EDIT_PUR',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbench/DetailNew') // 流程表单页面组件
    );
  },
});
/**
 * 销售方对账单
 */
setWorkflowApproveForm({
  code: 'SSTA_BILL_SUBMIT_SUPPLIER', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbenchSup/Detail') // 流程表单页面组件
    );
  },
});
/**
 * 销售方对账单UX
 */
setWorkflowApproveForm({
  code: 'SSTA_BILL_SUBMIT_SUPPLIER_UX', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbenchSup/DetailNew') // 流程表单页面组件
    );
  },
});

/**
 * 销售方对账单UX-新审批表单
 */
setWorkflowApproveForm({
  code: 'SSTA.BILL_SUPPLIER:UX_DETAIL', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbenchSup/DetailNew') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSTA.BILL_SUPPLIER:OTHER_EDIT', // 流程单据内配置的流程单据编码 只读
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbenchSup/DetailNew') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSTA.SETTLE_HEADER_SUPPLIER', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/SupplySettle/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSTA.SETTLE_PREPAYMENT_PUR', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaseSettle/PrePayment') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSTA.SETTLE_PREPAYMENT_EDIT', // 流程单据内配置的流程单据编码 预付款 编辑页面
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaseSettle/PrePayment') // 流程表单页面组件
    );
  },
});

/**
 * 采购方对账单
 */
setWorkflowApproveForm({
  code: 'SSTA_BILL_SUBMIT_PURCHASER', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbench/Detail') // 流程表单页面组件
    );
  },
});
/**
 * 采购方对账单UX
 */
setWorkflowApproveForm({
  code: 'SSTA_BILL_SUBMIT_PURCHASER_UX', // 流程单据内配置的流程单据编码 只读
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ReconciliationWorkbench/DetailNew') // 流程表单页面组件
    );
  },
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
