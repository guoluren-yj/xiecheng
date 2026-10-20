import { dynamicWrapper } from 'utils/router';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';

// 设置流程表单
setWorkflowApproveForm({
  customSubmit: true,
  code: 'SAGM.PUR_AGREEMENT_APPROVE', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // model
      () => import('../routes/sagm/ProtocolWorkbench/Detail/WorkFlowDetail')
    );
  },
});

setWorkflowApproveForm({
  customSubmit: true,
  code: 'SAGM.SALE_AGREEMENT_APPROVE:SAGM.SALE_AGREEMENT_DETAIL', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // model
      () => import('../routes/sagm/SagmWorkbench/Detail')
    );
  },
});
