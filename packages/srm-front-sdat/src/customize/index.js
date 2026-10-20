// src/customize/index.js
// 引入 存储 卡片配置的方法
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';

// 引入 加载 model 的包装方法
import { dynamicWrapper } from '../utils/router';

// 设置编码为 SDAT.RISK_PROCESS_APPROVAL 的 流程表单
setWorkflowApproveForm({
  code: 'SDAT.RISK_PROCESS_APPROVAL:DOC', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/RiskApproveForm') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SDAT.RISK_BROADCAST_APPROVAL:DOC', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/RiskApproveForm') // 流程表单页面组件
    );
  },
});

// 设置编码为 SDAT.RISK_PROCESS_APPROVAL_V2 的 流程表单
setWorkflowApproveForm({
  code: 'SDAT.RISK_PROCESS_APPROVAL_V2:DOC', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/riskScanConfig/RiskApproveForm') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SDAT.RISK_BROADCAST_V2:DOC', // 流程单据内配置的流程表单编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/riskScanConfig/RiskApproveForm') // 流程表单页面组件
    );
  },
});
