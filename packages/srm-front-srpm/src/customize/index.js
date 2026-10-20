// include可编辑审批表单配置文件 src/customize/index.js
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
import { dynamicWrapper } from '../utils/router';
// 需求计划单审批表单
setWorkflowApproveForm({
  code: 'REQUEST_PLAN_BALANCE_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['rpExecuteProgram'], // 流程表单页面用到的 model
      () => import('../routes/RpExecuteProgram/Detail') // 流程表单页面组件
    );
  },
});

// 需求计划提报单审批表单
setWorkflowApproveForm({
  code: 'REQUEST_PLAN_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/RequisitionPlanDetail/ReadOnly') // 流程表单页面组件
    );
  },
});

// 需求计划提报单审批表单
setWorkflowApproveForm({
  code: 'SRPM.REQUEST_PLAN_DOC:EDIT_FORM', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/RequisitionPlanDetail/ReadOnly') // 流程表单页面组件
    );
  },
});
