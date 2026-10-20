// src/customize/index
// 引入 存储 卡片配置的方法
import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import { setCard } from 'hzero-front/lib/customize/cards';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
// 引入 加载 model 的包装方法
// import { dynamicWrapper } from 'utils/router';

const cardConfigs = [
  {
    code: 'SRM_SSRC_RfqEvent',
    component: async () => dynamicWrapper(window.dvaApp, [], () => import('./Card/inquiryHall')),
  },
  {
    code: 'SRM_SSRC_NewBidEvent',
    component: async () => dynamicWrapper(window.dvaApp, [], () => import('./Card/bidHall')),
  },
  {
    code: 'SRM_SSRC_SupEvent',
    component: async () => dynamicWrapper(window.dvaApp, [], () => import('./Card/supplier')),
  },
];
cardConfigs.forEach((f) => {
  setCard(f);
});

const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

export const dynamicWrapper = (app, models, component) => {
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
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

// 寻源单审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_RELEASE_APPROVAL_INC', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['quotationController', 'inquiryHall', 'bidHall', 'quotationDetail'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/SrcDetail') // 流程表单页面组件
    );
  },
});

// 寻源单核价
setWorkflowApproveForm({
  code: 'SSRC.RFX_CHECK_APPROVAL_INC', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApproval') // 流程表单页面组件
    );
  },
});

// 寻源单核价-NEW
setWorkflowApproveForm({
  code: 'SSRC.RFX_CHECK_APPROVAL_NEW', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [
        'inquiryHall',
        'priceComparison',
        'quotationDetail',
        'supplierQuotation',
        'inquiryHallNewPub',
      ], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalC7n') // 流程表单页面组件
    );
  },
});

// 招标书发布审批工作流
setWorkflowApproveForm({
  code: 'SSRC.BID_RELEASE_APPROVAL_INC', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['bidHall', 'quotationDetail', 'bidEventQuery'], // 流程表单页面用到的 model
      () => import('../routes/sbid/BidHall/Detail') // 流程表单页面组件
    );
  },
});

// 寻源过程控制
setWorkflowApproveForm({
  code: 'SSRC.RFX_ADJUST_APPROVE_INC',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'quotationController', 'quotationDetail', 'queryRfq'],
      () => import('../routes/ssrc/QuotationController/Approval')
    );
  },
});

// 招标定标管理
setWorkflowApproveForm({
  code: 'SSRC.BID_CHECK_APPROVAL_INC', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['bidHall', 'quotationDetail'], // 流程表单页面用到的 model
      () => import('../routes/sbid/BidHall/TargetMange') // 流程表单页面组件
    );
  },
});

// 新价格库审批
setWorkflowApproveForm({
  code: 'SSRC.PRICE_LIB_REQ_INC', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/PriceLibraryNew/WorkFlow') // 流程表单页面组件
    );
  },
});

// RFI发布审批
setWorkflowApproveForm({
  code: 'SSRC.RF_RELEASE_APPROVAL_RPI',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFI')
    );
  },
});

// RFP发布审批
setWorkflowApproveForm({
  code: 'SSRC.RF_RELEASE_APPROVAL_RFP',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFP')
    );
  },
});

// RFI确定供应商审批
setWorkflowApproveForm({
  code: 'SSRC.RF_CHECK_APPROVAL_RFI',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFI')
    );
  },
});

// RFP确定供应商审批
setWorkflowApproveForm({
  code: 'SSRC.RF_CHECK_APPROVAL_RFP',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/ssrc/InquiryHallNew/RFDetail/indexRFP')
    );
  },
});

// 招标书发布审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_RELEASE_APPROVAL_BID', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [
        'quotationController',
        'inquiryHall',
        'bidHall',
        'quotationDetail',
        'inquiryHallBid',
        'inquiryHallNewPub',
      ], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/SrcDetail/workFlowIndex') // 流程表单页面组件
    );
  },
});

// 定标审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_CHECK_APPROVAL_BID', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApproval/workFlowIndex') // 流程表单页面组件
    );
  },
});

// 定标审批-NEW
setWorkflowApproveForm({
  code: 'SSRC.BID_CHECK_APPROVAL_NEW', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [
        'inquiryHall',
        'priceComparison',
        'quotationDetail',
        'supplierQuotation',
        'inquiryHallNewPub',
      ], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalC7n/workFlowIndex') // 流程表单页面组件
    );
  },
});

// 关闭招标书审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_CLOSE_APPROVAL_BID', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHallNew/CloseRfxDrawer/Approval/workFlowIndex') // 流程表单页面组件
    );
  },
});

// 招标时间调整审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_ADJUST_APPROVE_BID', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'quotationController', 'quotationDetail', 'queryRfq'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/QuotationController/Approval') // 流程表单页面组件
    );
  },
});

// 议价审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_BARGAIN_APPROVAL_BID', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['bargain', 'bargainPub', 'inquiryHall', 'priceComparison', 'quotationDetail'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/Bargain/Approval/workFlowIndexPub') // 流程表单页面组件
    );
  },
});

// 议价审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_BARGAIN_APPROVAL:NEW', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['bargain', 'bargainPub', 'inquiryHall', 'priceComparison', 'quotationDetail'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/Bargain/Approval/workFlowIndexPub') // 流程表单页面组件
    );
  },
});

// 预定标
setWorkflowApproveForm({
  code: 'SSRC.BID_PENDING_APPROVAL:SSRC.PRE.PEDING', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'bidHall', 'quotationDetail', 'inquiryHallNewPub'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/ConfirmCandidate/RfxWorkFlow') // 流程表单页面组件
    );
  },
});

// 定标审批-NEW-二维表
setWorkflowApproveForm({
  code: 'SSRC.RFX_CHECK_APPROVAL:NEW_CHECK', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail/workflowIndex') // 流程表单页面组件
    );
  },
});

// 定标审批-NEW-二维表
setWorkflowApproveForm({
  code: 'SSRC.RFX_CHECK_APPROVAL:NEW_BID', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail/workflowIndex') // 流程表单页面组件
    );
  },
});

// 线下整单录入审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_WHOLE_APPROVAL:SSRC.RFX_WHOLE_APPROVAL', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHallNew/Whole/Detail') // 流程表单页面组件
    );
  },
});

// 项目管理详情页
setWorkflowApproveForm({
  code: 'SSRC.PROJECT_INFO:SSRC_SRM_PROJECT_RELEASE_INFO', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['tenderPlan'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/TenderPlan/ProjectInfo/Read') // 流程表单页面组件
    );
  },
});

// 专家注册申请详情页
setWorkflowApproveForm({
  code: 'SSRC_EXPERT_REGISTER:SSRC_EXPERT_REGISTER', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['expert'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/Expert/Approve/Detail') // 流程表单页面组件
    );
  },
});

// 定标审批-NEW
setWorkflowApproveForm({
  code: 'SSRC.RFX_CHECK_APPROVAL:M_NEW', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApproval/workFlowIndex') // 流程表单页面组件
    );
  },
});

// 定标审批-新流程单据-和老核价分隔开
setWorkflowApproveForm({
  code: 'SSRC.RFX_NEW_CHECK_APPROVAL:NEW_BID', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail/workflowIndex') // 流程表单页面组件
    );
  },
});

// 定标审批-新流程单据-和老核价分隔开
setWorkflowApproveForm({
  code: 'SSRC.RFX_NEW_CHECK_APPROVAL:NEW_CHECK', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceNewC7N/Detail/workflowIndex') // 流程表单页面组件
    );
  },
});

// 定标概览审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_NEW_CHECK_APPROVAL:OVERVIEW_BID', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalNewC7n/workflowIndex') // 流程表单页面组件
    );
  },
});

// 核价概览审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_NEW_CHECK_APPROVAL:OVERVIEW_INQUIRY', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalNewC7n/workflowIndex') // 流程表单页面组件
    );
  },
});

// 定标概览审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_CHECK_APPROVAL:OVERVIEW_BID', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalNewC7n/workflowIndex') // 流程表单页面组件
    );
  },
});

// 核价概览审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_CHECK_APPROVAL:OVERVIEW_INQUIRY', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['inquiryHall', 'priceComparison', 'quotationDetail', 'supplierQuotation'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/CheckPriceApprovalNewC7n/workflowIndex') // 流程表单页面组件
    );
  },
});

// 调价单工作流
setWorkflowApproveForm({
  code: 'SPC.ADJUSTMENT_PUBLISH_FROM:WORK_FLOW', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/spc/PriceAdjustmentWorkbench/Detail/index') // 流程表单页面组件
    );
  },
});

// 调价单工作流-单据样式
setWorkflowApproveForm({
  code: 'SPC.ADJUSTMENT_PUBLISH_FROM:APPROVAL',
  component: async () =>
    dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/spc/PriceAdjustmentWorkbench/SubmitApprove')
    ),
});

// 寻源项目关闭工作流
setWorkflowApproveForm({
  code: 'SSRC.PROJECT_CLOSE_APPROVAL:SSRC.SOURCE_PROJECT', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/ProjectSetupNew/SourceProjectCloseApprovalWF') // 流程表单页面组件
    );
  },
});

// 寻源项目关闭工作流默认
setWorkflowApproveForm({
  code: 'SSRC.PROJECT_CLOSE_APPROVAL:SSRC.SOURCE_PROJECT_DEFAULT', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/ProjectSetupNew/SourceProjectCloseApprovalWF') // 流程表单页面组件
    );
  },
});

// 价格澄清审批-询价
setWorkflowApproveForm({
  code: 'SSRC_PRICE_CLARIFY:INQUIRY_APPROVAL_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/sbid/ExpertScoring/PriceClarification/Approval/workflowIndex') // 流程表单页面组件
    );
  },
});

// 价格澄清审批-招标
setWorkflowApproveForm({
  code: 'SSRC_PRICE_CLARIFY:BID_APPROVAL_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/sbid/ExpertScoring/PriceClarification/Approval/workflowIndex') // 流程表单页面组件
    );
  },
});

// 价格澄清审批-默认
setWorkflowApproveForm({
  code: 'SSRC_PRICE_CLARIFY:APPROAL_FORM_DEFAULT', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/sbid/ExpertScoring/PriceClarification/Approval/workflowIndex') // 流程表单页面组件
    );
  },
});

// 寻源项目变更工作流
setWorkflowApproveForm({
  code: 'SSRC.PROJECT_CHANGE_APPROVAL:_PROCESS_DOCUMENT', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/ProjectSetupNew/SPChangeApprovalWF') // 流程表单页面组件
    );
  },
});

// 寻源项目变更工作流默认
setWorkflowApproveForm({
  code: 'SSRC.PROJECT_CHANGE_APPROVAL:DEFAULT', // 流程单据内配置的流程单据编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/ProjectSetupNew/SPChangeApprovalWF') // 流程表单页面组件
    );
  },
});

// 发起议价审批-询价
setWorkflowApproveForm({
  code: 'SSRC.RFX_BARGAIN_APPROVAL:INQUIRY_BARGAIN_APPROVAL', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['priceComparison'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/Bargain/ApprovalC7N/workflowIndex') // 流程表单页面组件
    );
  },
});

// 发起议价审批-招标
setWorkflowApproveForm({
  code: 'SSRC.RFX_BARGAIN_APPROVAL:BID_BARGAIN_APPROVAL', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['priceComparison'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/Bargain/ApprovalC7N/workflowIndex') // 流程表单页面组件
    );
  },
});

// 寻源项目发布工作流
setWorkflowApproveForm({
  code: 'SSRC.SOURCE_PROJECT_APPROVAL:RELEASE', // 流程单据内配置的流程单据编码
  customSubmit: true, // 注册了submit回调函数时必须加这个属性
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/ProjectSetupNew/SPDetail/indexApproval') // 流程表单页面组件
    );
  },
});

// 澄清答疑发布审批工作流 - 默认
setWorkflowApproveForm({
  code: 'SSRC_CLARIFY_RELEASE:DEFAULT', // 流程单据内配置的流程单据编码
  customSubmit: true, // 注册了submit回调函数时必须加这个属性
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/Clarify/ApprovalWFC7N/wfIndex') // 流程表单页面组件
    );
  },
});

// 澄清答疑发布审批工作流 - 询价
setWorkflowApproveForm({
  code: 'SSRC_CLARIFY_RELEASE:INQUIRY', // 流程单据内配置的流程单据编码
  customSubmit: true, // 注册了submit回调函数时必须加这个属性
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/Clarify/ApprovalWFC7N/wfIndex') // 流程表单页面组件
    );
  },
});

// 澄清答疑发布审批工作流 - 招标
setWorkflowApproveForm({
  code: 'SSRC_CLARIFY_RELEASE:NEW_BID', // 流程单据内配置的流程单据编码
  customSubmit: true, // 注册了submit回调函数时必须加这个属性
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/Clarify/ApprovalWFC7N/wfIndex') // 流程表单页面组件
    );
  },
});

// 退回至核价审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_ROLLBACK_APPROVAL:INQUIRY_APPROVAL_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['priceComparison'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/BackToCheckPriceApproval/workflowIndex') // 流程表单页面组件
    );
  },
});

// 退回至定标审批
setWorkflowApproveForm({
  code: 'SSRC.RFX_ROLLBACK_APPROVAL:BID_APPROVAL_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['priceComparison'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/BackToCheckPriceApproval/workflowIndex') // 流程表单页面组件
    );
  },
});

// 退回至核价审批-默认
setWorkflowApproveForm({
  code: 'SSRC.RFX_ROLLBACK_APPROVAL:APPROAL_FORM_DEFAULT', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['priceComparison'], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHall/BackToCheckPriceApproval/workflowIndex') // 流程表单页面组件
    );
  },
});

// i/p 过程控制审批
setWorkflowApproveForm({
  code: 'SSRC.RF_ADJUST_APPROVE:DEFAULT', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/ssrc/InquiryHallNew/RFControllerApproval') // 流程表单页面组件
    );
  },
});
