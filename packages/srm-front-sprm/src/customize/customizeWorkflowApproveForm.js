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

// relative://pub/sprm/purchase-platform/noerp-detail/${id}
// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      customSubmit: true, // 注册了submit回调函数时必须加这个属性
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          ['purchaseRequisitionInquiry'], // 流程表单页面用到的 model
          () => import('../routes/NewPurchaseDetail/RequisitionInquery') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SPUC_SRM_FORM_SUBMIT_NEW', // SRM表单提交-新
  'SPUC_CATALOG_FORM_SUBMIT_NEW', // 目录化提交表单-新
  'SPUC_EC_FORM_SUBMIT_NEW', // 电商提交表单-新
  'SPUC_PR_SRM_FORM_NEW', // 电商提交表单-新
  'SPUC_PR_CATA_FORM_NEW', // 目录化采购申请表单-新
  'SPUC_PR_EC_FORM_NEW', // 电商采购申请表单-新
  'SPUC_PR_SHOP_FORM_NEW', // 商城手工采购申请表单-新
  'SPUC_SRM_CHANAGE_SUBMIT', // SRM表单变更提交-新
  'SPUC_SRM_FORM_CHANAGE_SUBMIT', // SRM表单变更提交-新
  'SPUC_SRM_SUBMIT_DOC:GLFOTO_SUBMIT_FINANCIAL', // SRM表单采财务审核提交-福达
  'SPUC_SRM_SUBMIT_DOC:GLFOTO_SUBMIT_PURCHASE', // SRM表单采购询价提交-福达
  'SPRM.PR_ERP_CLOSE_DOC:PR_FROM', // ERP关闭
  'SPRM.PR_SRM_CLOSE_DOC:PR_FROM', // SRM 关闭
  'SPRM.PR_SHOP_CLOSE_DOC:PR_FROM', // 商城手工关闭
  'SCUX_TQLY_PR_SUPP:SUSPEND_FROM', // 天齐锂业 采购申请暂挂表单
]);

// relative://pub/sprm/purchase-requisition-inquiry/not-erp-detail/${id}
// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      customSubmit: true, // 注册了submit回调函数时必须加这个属性
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          ['purchaseRequisitionInquiry'], // 流程表单页面用到的 model
          () => import('../routes/PurchaseRequisitionInquiry/NotErpDetail') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SPUC_SRM_FORM_SUBMIT', // SRM表单提交
  'SPUC_SRM_SUBMIT_DOC:INQUERY_TYPE',
  'SPRM.PR_SRM_CANCEL_DOC:QUERY',
  'SPUC_CATALOG_FORM_SUBMIT', // 目录化提交表单
  'SPUC_CATALOG_SUBMIT_DOC', // 目录化提交表单
  'SPUC_EC_FORM_SUBMIT', // 电商提交表单
  'SPUC_EC_SUBMIT_DOC', // 电商流程表单
  'SPUC_PR_SRM_FORM', // SRM采购申请表单
  'SPUC_PR_CATA_FORM', // 目录化采购申请表单
  'SPUC_PR_EC_FORM', // 电商采购申请表单
  'SPUC_PR_SHOP_FORM', // 商城手工采购申请表单
  'SPUC_SRM_FORM_CHANGE_SUBMIT', // SRM表单变更提交
  'SPUC_SRM_SUBMIT_GPP', // SRM表单提交_锦江
  'SPUC_SRM_SUBMIT_DOC', // SRM表单提交_英华利
  'SPUC_CATALOG_FORM_SUBMIT_SDC', // 水滴筹-目录化提交表单
  'SPUC_CATALOG_FORM_SUBMIT_YHL', // 英华利-目录化提交表单
]);

// relative://pub/sprm/purchase-requisition-inquiry/erp-detail/${id}

// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          ['purchaseRequisitionInquiry'], // 流程表单页面用到的 model
          () => import('../routes/PurchaseRequisitionInquiry/ErpDetail') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SPUC_ERP_FORM_SUBMIT', // ERP 提交表单
  'SPUC_ERP_SUBMIT_DOC', // ERP 提交表单
]);

// relative://pub/sprm/purchase-platform/noerp-detail/${id}
// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      customSubmit: true, // 注册了submit回调函数时必须加这个属性
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          ['purchaseRequisitionInquiry'], // 流程表单页面用到的 model
          () => import('../routes/NewPurchaseDetail/RequisitionInquery') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SPUC_SRM_FORM_SUBMIT_NEW', // SRM表单提交-新
  'SPUC_CATALOG_FORM_SUBMIT_NEW', // 目录化提交表单-新
  'SPUC_EC_FORM_SUBMIT_NEW', // 电商提交表单-新
  'SPUC_PR_SRM_FORM_NEW', // 电商提交表单-新
  'SPUC_PR_CATA_FORM_NEW', // 目录化采购申请表单-新
  'SPUC_PR_EC_FORM_NEW', // 电商采购申请表单-新
  'SPUC_PR_SHOP_FORM_NEW', // 商城手工采购申请表单-新
  'SPUC_SRM_CHANAGE_SUBMIT', // SRM表单变更提交-新
  'SPUC_SRM_FORM_CHANAGE_SUBMIT', // SRM表单变更提交-新
  'SPUC_SRM_SUBMIT_DOC:EDIT_DOM', // SRM表单提交
  'SPUC_CATALOG_SUBMIT_DOC:EDIT_DOM',
]);

// relative://pub/sprm/purchase-platform/noerp-detail/${id}
// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/ForcastWorkFlow') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SPRM.FCST_FEEDBACK_WORKFLOW:DOC', // 预测单
]);

// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/ProjectSpace/ReadDetail') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SIEC.PROEJCT:PROJECT_NEW', // 项目信息
]);

// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/ProjectSpace/ReadDetail') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SIEC.PROJECT:PROJECT_NEW_APPROVAL', // 项目信息
]);

// 变更-项目申请单
// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/ProjectSpace/ChangeReadDetail') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SIEC.PROJECT_CHANGE_REQ:DOC', // 项目信息
]);

// 中止等操作的项目申请单
// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/ProjectSpace/ActionDetail') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SIEC.PROJECT_REBOOT_REQ:DOC',
  'SIEC.PROJECT_CONFIRM_REQ:DOC',
  'SIEC.PROJECT_CONFIRM_REQ:DCO',
  'SIEC.PROJECT_SUSPEND_REQ:DOC',
]);

// 采购申请表单
// eslint-disable-next-line func-names
(function (sprmFormCodes) {
  sprmFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/ApprovalForm/PrFrom') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SPUC_EC_SUBMIT_DOC:SUBMIT',
  'SPUC_ERP_SUBMIT_DOC:SUBMIT',
  'SPUC_CATALOG_SUBMIT_DOC:SUBMIT',
  'SPUC_SRM_SUBMIT_DOC:SUBMIT',
  'SPUC_SRM_CHANGE_DOC:SUBMIT',
  'SPRM.PR_SHOP_CANCEL_DOC:SUBMIT',
  'SPRM.PR_EC_CANCEL_DOC:SUBMIT',
  'SPRM.PR_CATA_CANCEL_DOC:SUBMIT',
  'SPRM.PR_SRM_CANCEL_DOC:SUBMIT',
]);
