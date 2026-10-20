import { createElement } from 'react';
import dynamic from 'dva/dynamic';

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
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)) ||
      [],
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

// 送样申请确认表单（采购方）-不可编辑
setWorkflowApproveForm({
  code: 'SSLM.SAMPLE_CONFIRM_PUR',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SampleDelivery/Confirm/Detail')
    );
  },
});

// 送样申请确认表单（采购方）-可编辑
setWorkflowApproveForm({
  code: 'SSLM.SAMPLE_CONFIRM_DOCUMENT:PUR_EDIT',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SampleDelivery/Confirm/Detail')
    );
  },
});

// 送样申请确认表单(供应商)
setWorkflowApproveForm({
  code: 'SSLM.SAMPLE_CONFIRM_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SampleDelivery/Confirm/Detail')
    );
  },
});

// 供应商录入
setWorkflowApproveForm({
  code: 'SSLM.FIRM_ENTERING_DOCUMENT:INCLUDE',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/SupplierEntryDetail'));
  },
});

// 供应商录入-单据样式定制
setWorkflowApproveForm({
  code: 'SSLM.FIRM_ENTERING_DOCUMENT:DOCUMENT_CUSTOMIZATION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SupplierEntryDetail/WorkFlow')
    );
  },
});

// 现场考察审批单据-线下
setWorkflowApproveForm({
  code: 'SSLM.SITE_EVAL_DOC',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['siteInvestigateReport'], () =>
      import('../routes/SiteInvestigateReport/Manage/Detail')
    );
  },
});

// 供应商配额
setWorkflowApproveForm({
  code: 'SSLM.SUPPLIER_QUOTA_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['supplierQuota'], () =>
      import('../routes/SupplierQuota/Manage/Detail')
    );
  },
});

// 送样申请发布
setWorkflowApproveForm({
  code: 'SSLM.SAMPLE_RELEASE_EDIT_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SampleDelivery/Release/Detail/index')
    );
  },
});

// 送样申请发布（不知道为啥会有两个）
setWorkflowApproveForm({
  code: 'SSLM.SAMPLE_RELEASE_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SampleDelivery/Release/Detail/index')
    );
  },
});

// 供应商信息变更
setWorkflowApproveForm({
  code: 'SSLM.PURC_SUP_CHANGE_FORM_INC', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['supplierInform', 'enterpriseInform', 'supplierInformCompare'], // 流程表单页面用到的 model
      () => import('../routes/SupplierInform/Detail') // 流程表单页面组件
    );
  },
});

// 供应商信息变更 - 支持个性化字段工作流可编辑
setWorkflowApproveForm({
  code: 'SSLM.PURC_SUP_CHANGE_DOCUMENT:EDIT',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['supplierInform', 'enterpriseInform', 'supplierInformCompare'], // 流程表单页面用到的 model
      () => import('../routes/SupplierInform/Detail') // 流程表单页面组件
    );
  },
});

// 企业信息变更
setWorkflowApproveForm({
  code: 'SSLM.FIRM_CHANGE_FORM_INC',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['enterpriseInform'], () =>
      import('../routes/EnterpriseInform/InfoChangeConfirm/Detail')
    );
  },
});

// 企业信息变更 - 支持个性化字段在工作流中可编辑
setWorkflowApproveForm({
  code: 'SSLM.FIRM_CHANGE_DOCUMENT:EDIT',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['enterpriseInform'], () =>
      import('../routes/EnterpriseInform/Detail')
    );
  },
});

// 调查表
setWorkflowApproveForm({
  code: 'SSLM.INVESTIGATE_DOC_INC', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['investigationApproval', 'operatingRecord'], // 流程表单页面用到的 model
      () => import('../routes/Investigation/Approval/Detail') // 流程表单页面组件
    );
  },
});

// 简易供应商入库
setWorkflowApproveForm({
  code: 'SSLM.EXT_SUPPLIER_REQ_FORM_INC',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/SupplierWarehouse/Detail'));
  },
});

// 简易供应商入库
setWorkflowApproveForm({
  code: 'SSLM.EXT_SUPPLIER_REQ_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/SupplierWarehouse/Detail'));
  },
});

// 简易供应商入库重构
setWorkflowApproveForm({
  code: 'SSLM.EXT_SUPPLIER_REQ_DOCUMENT:RE_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SupplierWarehouse/Detail/WorkFlow')
    );
  },
});

// 推荐申请单
setWorkflowApproveForm({
  code: 'SSLM.RECOMMEND_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['recommendApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Recommend') // 流程表单页面组件
    );
  },
});

// 推荐申请单（工作流可编辑）
setWorkflowApproveForm({
  code: 'SSLM.RECOMMEND_FORM_EDIT', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['recommendApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Recommend') // 流程表单页面组件
    );
  },
});

// 潜在申请单
setWorkflowApproveForm({
  code: 'SSLM.POTENTIAL_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['potentialApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Potential') // 流程表单页面组件
    );
  },
});

// 潜在申请单(工作流可编辑)
setWorkflowApproveForm({
  code: 'SSLM.POTENTIAL_FORM_EDIT', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['potentialApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Potential') // 流程表单页面组件
    );
  },
});

// 合格申请单
setWorkflowApproveForm({
  code: 'SSLM.QUALIFIED_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['qualifiedApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Qualified') // 流程表单页面组件
    );
  },
});

// 合格申请单
setWorkflowApproveForm({
  code: 'SSLM.QUALIFIED_FORM_EDIT', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['qualifiedApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Qualified') // 流程表单页面组件
    );
  },
});

// 预留申请单
setWorkflowApproveForm({
  code: 'SSLM.RESERVED_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['prepareApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Prepare') // 流程表单页面组件
    );
  },
});

// 预留申请单
setWorkflowApproveForm({
  code: 'SSLM.RESERVED_FORM_EDIT', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['prepareApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Prepare') // 流程表单页面组件
    );
  },
});

// 降级申请单
setWorkflowApproveForm({
  code: 'SSLM.DEGRADE_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['eliminateApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Eliminate') // 流程表单页面组件
    );
  },
});

// 降级申请单
setWorkflowApproveForm({
  code: 'SSLM.DEGRADE_FORM_EDIT', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['eliminateApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Eliminate') // 流程表单页面组件
    );
  },
});

// 淘汰申请单
setWorkflowApproveForm({
  code: 'SSLM.ELIMINATED_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['eliminateApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Eliminate') // 流程表单页面组件
    );
  },
});

// 淘汰申请单
setWorkflowApproveForm({
  code: 'SSLM.ELIMINATED_FORM_EDIT', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['eliminateApplication', 'commonApplication'], // 流程表单页面用到的 model
      () => import('../routes/SupplierLife/Eliminate') // 流程表单页面组件
    );
  },
});

// 供货能力清单评审
setWorkflowApproveForm({
  code: 'SSLM_SUPPLY_ABILITY_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['supplyAbility'], () =>
      import('../routes/SupplyAbility/Review/Detail')
    );
  },
});

// 供货能力清单拓展中单据
setWorkflowApproveForm({
  code: 'SSLM.ABILITY_EXPAND_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SupplyAbility/Definition/ExpandDetail')
    );
  },
});

// 考评档案填制
setWorkflowApproveForm({
  code: 'SSLM_KPI_EVAL_DTL_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['evaluationArchivesFilling'], // 流程表单页面用到的 model
      () => import('../routes/EvaluationArchivesFilling/Detail') // 流程表单页面组件
    );
  },
});

// 现场考察报告填制
setWorkflowApproveForm({
  code: 'SSLM.SITE_EVAL_SUBMIT_DOCUMENT:FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['siteInvestigateReport'], // 流程表单页面用到的 model
      () => import('../routes/SiteInvestigateReport/Filling/Detail') // 流程表单页面组件
    );
  },
});

// 已填制现场考察报告
setWorkflowApproveForm({
  code: 'SSLM.SITE_EVAL_SUBMIT_DOCUMENT:FILLED_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['siteInvestigateReport'], () =>
      import('../routes/SiteInvestigateReport/Filled/Detail')
    );
  },
});

// 供应商分类变更申请
setWorkflowApproveForm({
  code: 'SSLM.CLASSIFY_ALTER',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['supplierCategoryAlter'], () =>
      import('../routes/SupplierCategoryAlter/Detail')
    );
  },
});

// 供应商信息变更
setWorkflowApproveForm({
  code: 'SSLM.POCH.SUP_CHANGE_FORM',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['supplierInform', 'enterpriseInform', 'supplierInformCompare'],
      () => import('../routes/SupplierInform/Detail')
    );
  },
});

// 供应商信息变更-单据样式定制
setWorkflowApproveForm({
  code: 'SSLM.PURC_SUP_CHANGE_DOCUMENT:DOCUMENT_CUSTOMIZATION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/SupplierInformNew/WorkFlow'));
  },
});

// 供应商信息变更（新）
setWorkflowApproveForm({
  code: 'SSLM.PURC_SUP_CHANGE_DOCUMENT:NEW_CHANGE_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/SupplierInformNew/Detail'));
  },
});

// 采购方发起-供应商准入单据
setWorkflowApproveForm({
  code: 'SSLM.PURC_SUP_ACCESS_FORM',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['supplierInform', 'enterpriseInform', 'supplierInformCompare'],
      () => import('../routes/SupplierInform/Detail')
    );
  },
});

// 调查表(relative 改 include)
setWorkflowApproveForm({
  code: 'SSLM.INVESTIGATE_DOC',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['investigationApproval', 'operatingRecord'], () =>
      import('../routes/Investigation/Approval/Detail')
    );
  },
});

// 现场考察审批
setWorkflowApproveForm({
  code: 'SSLM.SITE_EVAL_DOC',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['siteInvestigateReport'], () =>
      import('../routes/SiteInvestigateReport/Manage/Detail')
    );
  },
});

// 	考评档案的流程单据
setWorkflowApproveForm({
  code: 'SSLM.KPI_EVAL_PUBLISH_DOCUMENT:KPI_EVAL_DETAIL_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['evaluationDocManage', 'evaluationArchivesFilling'], () =>
      import('../routes/EvaluationDocManage/Detail')
    );
  },
});

// 	考评事件记录
setWorkflowApproveForm({
  code: 'SSLM.EVAL_EVENT_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/EventRecord/Detail'));
  },
});

// 供应商邀约管理-认证审批
setWorkflowApproveForm({
  code: 'SPFM.ENTERPRISE_APPROVAL_N_DOC:SPFM.ENTERPRISE_APPROVAL_NEW', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/SupplierInviteManage/CertificationDeal/Detail') // 流程表单页面组件
    );
  },
});

// 供应商邀约管理-认证审批新
setWorkflowApproveForm({
  code: 'SPFM.ENTERPRISE_APPROVAL_N_DOC:SPFM.ENTERPRISE_APPROVAL_REC', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/SupplierInviteManage/CertificationDeal/WorkFlow') // 流程表单页面组件
    );
  },
});

// 企业信息变更确认-审批
setWorkflowApproveForm({
  code: 'SSLM.FIRM_TENANT_CONFIRM:DETAILS', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['enterpriseInform'], // 流程表单页面用到的 model
      () => import('../routes/EnterpriseInform/InfoChangeConfirm/Detail') // 流程表单页面组件
    );
  },
});

// 	考评档案申诉发布审批
setWorkflowApproveForm({
  code: 'SSLM.KPI_EVAL_APPEAL_DOCUMENT:KPI_EVAL_APPEAL',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['evaluationDocManage', 'evaluationArchivesFilling'], () =>
      import('../routes/EvaluationDocManage/Detail')
    );
  },
});

// 采购方调查表工作台-待审批调查表
setWorkflowApproveForm({
  code: 'SSLM.INVESTIGATE_DOC:NEW', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaserInvestigationWorkbench/Detail/WaitApprove') // 流程表单页面组件
    );
  },
});

// 供应商评估-发布审批
setWorkflowApproveForm({
  code: 'SSLM_EVAL_PLAN:PUBLISH', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/VendorEvaluationPlanWorkbench/Details') // 流程表单页面组件
    );
  },
});

// 生命周期-特批申请单
setWorkflowApproveForm({
  code: 'SSLM.SPECIAL.REQ_APPROVAL:SSLM.SPECIAL_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/LifeCycleManage/Documents/Detail')
    );
  },
});

// 生命周期-特批申请单-可编辑表单
setWorkflowApproveForm({
  code: 'SSLM.SPECIAL.REQ_APPROVAL:EDIT_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/LifeCycleManage/Documents/Detail')
    );
  },
});

// 生命周期-特批申请单-单据样式定制
setWorkflowApproveForm({
  code: 'SSLM.SPECIAL.REQ_APPROVAL:DOCUMENT_CUSTOMIZATION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/LifeCycleManage/ApprovalForm')
    );
  },
});

// 生命周期-升降级申请单
setWorkflowApproveForm({
  code: 'SSLM.NORMAL.REQ_APPROVAL:SSLM.NORMAL_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/LifeCycleManage/Documents/Detail')
    );
  },
});

// 生命周期-升降级申请单-可编辑表单
setWorkflowApproveForm({
  code: 'SSLM.NORMAL.REQ_APPROVAL:EDIT_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/LifeCycleManage/Documents/Detail')
    );
  },
});

// 生命周期-升降级申请单-单据样式定制
setWorkflowApproveForm({
  code: 'SSLM.NORMAL.REQ_APPROVAL:DOCUMENT_CUSTOMIZATION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/LifeCycleManage/ApprovalForm')
    );
  },
});

// 采购方评估-线下审批
setWorkflowApproveForm({
  code: 'SSLM.SITE_EVAL_DOC_OFFLINE:APPROVE_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaserEvaluationWorkbench/Details') // 流程表单页面组件
    );
  },
});

// 采购方评估-审批表单
setWorkflowApproveForm({
  code: 'SSLM.REPORT_DOCUMENT:APPROVE_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaserEvaluationWorkbench/Details') // 流程表单页面组件
    );
  },
});

// 采购方评估-评估结果确认（线上）-单据样式
setWorkflowApproveForm({
  code: 'SSLM.REPORT_DOCUMENT:CUSTOM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaserEvaluationWorkbench/WorkFlow/ResultApprove') // 流程表单页面组件
    );
  },
});

// 采购方评估-评估结果确认（线下）-单据样式
setWorkflowApproveForm({
  code: 'SSLM.REPORT_DOCUMENT_OFFLINE:CUSTOM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaserEvaluationWorkbench/WorkFlow/ResultApprove') // 流程表单页面组件
    );
  },
});

// 采购方评估-评估准备-可编辑
setWorkflowApproveForm({
  code: 'SSLM.REPORT_DOCUMENT:EVAL_PREPARE_EDIT',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/PurchaserEvaluationWorkbench/Details')
    );
  },
});

// 评估报告单据
setWorkflowApproveForm({
  code: 'SSLM.REPORT_DOCUMENT_OFFLINE:APPROVE_FORM',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaserEvaluationWorkbench/Details') // 流程表单页面组件
    );
  },
});

// 采购方评估-内部评估审批
setWorkflowApproveForm({
  code: 'SSLM.SITE_EVAL_SUBMIT_DOCUMENT:EVAL_RESULT_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/PurchaserEvaluationWorkbench/ScoreDetails') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSLM.REPORT_SUBMIT_DOCUMENT:EVAL_RESULT_FORM',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [],
      () => import('../routes/PurchaserEvaluationWorkbench/ScoreDetails') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSLM.INVESTIGATE_DOC:INVESTIGATE_WRITE_FORM',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['investigationWrite'],
      () => import('../routes/Investigation/Write/Detail') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SSLM.INVESTIGATE_DOC:SUP_INVESTIGATE_WORKBENCH_FORM',
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [],
      () => import('../routes/SupplierInvestigationWorkbench/Detail') // 流程表单页面组件
    );
  },
});

// 	考评档案新建的流程单据
setWorkflowApproveForm({
  code: 'SSLM.KPI_EVAL_NEW_DOCUMENT:KPI_EVAL_DETAIL_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['evaluationDocManage', 'evaluationArchivesFilling'], () =>
      import('../routes/EvaluationDocManage/Detail')
    );
  },
});

// 企业信息变更租户审批-单据样式定制
setWorkflowApproveForm({
  code: 'SSLM.FIRM_CHANGE_DOCUMENT:DOCUMENT_CUSTOMIZATION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/EnterpriseInformTenantApproval/WorkFlow')
    );
  },
});

// 企业信息变更平台确认-单据样式定制
setWorkflowApproveForm({
  code: 'SSLM.FIRM_TENANT_CONFIRM:DOCUMENT_CUSTOMIZATION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/EnterpriseInformTenantApproval/WorkFlow')
    );
  },
});

// 绩效考评-评分工作台(老的流程单据)
setWorkflowApproveForm({
  code: 'SSLM.KPI_EVAL_DTL_DOCUMENT:FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/AppraisalScore/WorkFlow'));
  },
});

// 配额申请单
setWorkflowApproveForm({
  code: 'SSLM.SUPPLIER_QUOTA_DOCUMENT:QUOTA_APPLICATION_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SupplierQuotaApplication/Detail')
    );
  },
});

// 调查表审批-单据样式定制
setWorkflowApproveForm({
  code: 'SSLM.INVESTIGATE_DOC:DOCUMENT_CUSTOMIZATION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/PurchaserInvestigationWorkbench/Detail/WorkFlow')
    );
  },
});

// 绩效考评-新建审批表单
setWorkflowApproveForm({
  code: 'SSLM.KPI_MANGE_NEW_DOCUMENT:FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/AppraisalPurchaser/WorkFlow/NewApprove')
    );
  },
});

// 绩效考评-新建审批表单-无单据样式定制（工作流目前不允许流程定义中只有一个单据样式定制的审批表单）
setWorkflowApproveForm({
  code: 'SSLM.KPI_MANGE_NEW_DOCUMENT:FORM_NO_SIGN',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/AppraisalPurchaser/WorkFlow/NewApprove')
    );
  },
});

// 绩效考评-汇总提交审批表单
setWorkflowApproveForm({
  code: 'SSLM.KPI_MANGE_PUBLISH_DOC:FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/AppraisalPurchaser/WorkFlow/SubmitApprove')
    );
  },
});

// 绩效考评-汇总提交审批表单-无单据样式定制（工作流目前不允许流程定义中只有一个单据样式定制的审批表单）
setWorkflowApproveForm({
  code: 'SSLM.KPI_MANGE_PUBLISH_DOC:FORM_NO_SIGN',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/AppraisalPurchaser/WorkFlow/SubmitApprove')
    );
  },
});

// 绩效考评-申诉审批表单
setWorkflowApproveForm({
  code: 'SSLM.KPI_MANGE_APPEAL_DOCUMENT:FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/AppraisalPurchaser/WorkFlow/AppealApprove')
    );
  },
});

// 绩效考评-申诉审批表单无单据样式定制（工作流目前不允许流程定义中只有一个单据样式定制的审批表单）
setWorkflowApproveForm({
  code: 'SSLM.KPI_MANGE_APPEAL_DOCUMENT:FORM_NO_SIGN',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/AppraisalPurchaser/WorkFlow/AppealApprove')
    );
  },
});

// 绩效考评-评分工作台(新的流程单据)
setWorkflowApproveForm({
  code: 'SSLM.KPI_MANGE_DTL_DOCUMENT:FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/AppraisalScore/WorkFlow'));
  },
});

// 绩效考评-评分工作台(新的流程单据)-无单据样式定制（工作流目前不允许流程定义中只有一个单据样式定制的审批表单）
setWorkflowApproveForm({
  code: 'SSLM.KPI_MANGE_DTL_DOCUMENT:FORM_NO_SIGN',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/AppraisalScore/WorkFlow'));
  },
});

// 供货能力清单管理审批-单据样式定制
setWorkflowApproveForm({
  code: 'SSLM_SUPPLY_ABILITY_REQ:DOCUMENT_CUSTOMIZATION',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SupplyAbilityNew/SupplyAbility/WorkFlow')
    );
  },
});

// 供货能力申请单-只读
setWorkflowApproveForm({
  code: 'SSLM_SA_REQ_DOCUMENT:SUPPLY_ABILITY_VIEW',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SupplyAbilityDoc/PurchaserWorkbench/Detail')
    );
  },
});

// 供货能力申请单-单据样式
setWorkflowApproveForm({
  code: 'SSLM_SA_REQ_DOCUMENT:SUPPLY_ABILITY_CUSTOM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/SupplyAbilityDoc/PurchaserWorkbench/WorkFlow')
    );
  },
});
