// 引入 存储 数据权限维度配置的方法
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
// import { isFunction } from 'lodash';
import { dynamicWrapper } from './index';

// eslint-disable-next-line func-names
(function(slodFormCodes) {
  slodFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      customSubmit: true,
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/DeliveryWorkbench/Detail/affirmDetail') // 流程表单页面组件
        );
      },
    });
  });
})([
  'ASN',
  'PLAN',
  'SLOD.ASN_APPROVE_SUBMIT', // 送货单提交流程单据
  'SLOD.PLAN_APPROVE_SUBMIT', // 计划提交流程单据
  'SLOD.LABEL_APPROVE_SUBMIT', // 标签提交流程单据
  'SLOD.PLAN_APPROVE_SUBMIT:EMBEDPAGE', // 单据样式定制-工作流',计划单提交流程单据
]);

// eslint-disable-next-line func-names
(function(slodFormCodes) {
  slodFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      customSubmit: true,
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/DeliveryWorkbench/Detail/allDetail') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SLOD.ASN_APPROVE_CLOSE:ASN',
  'SLOD.ASN_APPROVE_CLOSE:CLOSE',
  'SLOD.PLAN_APPROVE_CLOSE:CLOSE',
  'SLOD.ASN_APPROVE_CLOSE:EMBEDPAGE', // 单据样式定制-工作流',送货单关闭流程单据
  'SLOD.PLAN_APPROVE_CLOSE:EMBEDPAGE', // 单据样式定制-工作流',计划单关闭流程单据
]);

// 新单据流页面
// eslint-disable-next-line func-names
(function(slodFormCodes) {
  slodFormCodes.forEach((code) => {
    setWorkflowApproveForm({
      code, // 流程单据内配置的流程单据编码
      customSubmit: true,
      component: async () => {
        return dynamicWrapper(
          window.dvaApp,
          [], // 流程表单页面用到的 model
          () => import('../routes/DeliveryWorkbench/Detail/Workflow') // 流程表单页面组件
        );
      },
    });
  });
})([
  'SLOD.U_LABEL_APPROVE_SUBMIT:EMBEDPAGE', // 单据样式定制-工作流',唯一标签审批流程单据
  'SLOD.U_LABEL_APPROVE_SUBMIT:UNIQUE_LABEL', // 唯一标签审批流程单据
]);
