// include可编辑审批表单配置文件 src/customize/index.js
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
import { dynamicWrapper } from '../utils/router';
// 目录化订单审批
setWorkflowApproveForm({
  code: 'CATALOGUE', // 流程单据内配置的流程表单编码
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['orderApproval'], // 流程表单页面用到的 model
      () => import('../routes/OrderApproval/Detail') // 流程表单页面组件
    );
  },
});
// 电商订单审批
setWorkflowApproveForm({
  code: 'E-COMMERCE',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['orderApproval'], () =>
      import('../routes/OrderApproval/Detail')
    );
  },
});
// ERP订单审批
setWorkflowApproveForm({
  code: 'ERP',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['orderApproval'], () =>
      import('../routes/OrderApproval/Detail')
    );
  },
});
// 工作台订单审批
setWorkflowApproveForm({
  code: 'ORDER_WORKBENCH',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () =>
      import('../routes/OrderWorkspace/Detail/OrderApproval')
    );
  },
});

// 商城申请审批
setWorkflowApproveForm({
  code: 'SHOP',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['orderApproval'], () =>
      import('../routes/OrderApproval/Detail')
    );
  },
});

// SRM订单审批
setWorkflowApproveForm({
  code: 'SRM',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['orderApproval'], () =>
      import('../routes/OrderApproval/Detail')
    );
  },
});
// 英华利SRM订单审批
setWorkflowApproveForm({
  code: 'YHL-SRM',
  customSubmit: true,
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['orderApproval'], () =>
      import('../routes/OrderApproval/Detail')
    );
  },
});

// 计划排程
setWorkflowApproveForm({
  code: 'SPUC_PLAN_RELEASE',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['scheduleSheet', 'scheduleSheetCommon'], () =>
      import('../routes/ScheduleSheet/WorlkList')
    );
  },
});

// 新订单审批表单
setWorkflowApproveForm({
  code: 'POHEADER-BILLS:SUBMIT',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/ApprovalForm'));
  },
});

// 新订单变更审批表单
setWorkflowApproveForm({
  code: 'SODR.PO_CHANGE_APPROVE:SUBMIT',
  component: async () => {
    return dynamicWrapper(window.dvaApp, [], () => import('../routes/ApprovalForm'));
  },
});
