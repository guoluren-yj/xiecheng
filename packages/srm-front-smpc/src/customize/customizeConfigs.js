import { dynamicWrapper } from 'utils/router';

export default [
  {
    code: 'SRM_CompanyMall',
    type: 'CARD',
    component: async () => dynamicWrapper(window.dvaApp, [], () => import('./SRM_CompanyMall')),
  },
  {
    code: 'SMPC.SUP_SHELVE_APPLY_FORM', // 供应商上下架申请工作流
    type: 'WORKFLOW',
    customSubmit: true, // 控制表单渲染完后才能进行审批操作
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/ShelfApply/Detail/workFlow')
      );
    },
  },
  {
    code: 'SMPC.SAME_SKU_MANAGE:SMPC.SAME_SKU_MANAGE_DETAIL', // 同款商品反馈工作流
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/SkuFeedback/Workflow')
      );
    },
  },
  {
    code: 'SMPC.SAME_SKU_MANAGE:SMPC.SAME_SKU_MANAGE_READ', // 同款商品反馈我发起的流程工作流（只读）
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/SkuFeedback/Workflow')
      );
    },
  },
  {
    code: 'SMPC.SKU_INFO_APPROVE:SMPC.SKU_INFO_DETAIL', // 商品工作流审批
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/SkuDetail')
      );
    },
  },
  {
    code: 'SMPC.SKU_INFO_APPROVE:NEW', // 商品工作流审批 - 新表单页面
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/SkuDetail/WorkFlow')
      );
    },
  },
  {
    code: 'SMPC.SKU_INVALID_APPROVE:SMPC.SKU_INFO_DETAIL', // 失效商品工作流审批
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/SkuDetail')
      );
    },
  },
  {
    code: 'SMPC.EC_SHELF_APPROVE:EC_SKU_DETAIL_READ', // 电商商品上架审批
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/EcSkuApproveDetail')
      );
    },
  },
  {
    code: 'SMPC.SKU_APPROVE_BATCH:CATA_SKU_SHELF_APPROVE', // 目录化商品下架审批
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/SkuShelfWorkFlow')
      );
    },
  },
  {
    code: 'SMPC.EC_APPROVE_BATCH:EC_SKU_SHELF_APPROVE', // 电商商品下架审批
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/SkuShelfWorkFlow')
      );
    },
  },
  {
    code: 'SMPC.EC_BATCH_SHELF_APPROVE:EC_SKU_DETAIL_READ',
    type: 'WORKFLOW',
    customSubmit: true,
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        [], // model
        () => import('../routes/product/EcSkuBatchShelfApprove')
      );
    },
  },
];
