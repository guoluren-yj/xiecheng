
import { dynamicWrapper } from 'utils/router';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';

// 设置流程表单
setWorkflowApproveForm({
  code: 'STCK.IN_OUT_ORDER_APPROVE:STCK.ORDER_DETAIL', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // model
      () => import('../routes/sstk/StockWorkbench/Detail'),
    );
  },
});
