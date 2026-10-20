// include表单配置文件 src/customize/index.js
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
import { dynamicWrapper } from '../utils/router';

// PCN变更单据明细   include://pub/siec/pcnmanage-workbench/detail/approve?pcnHeaderId=${pcnHeaderId}&statusConfigId=${statusConfigId}
setWorkflowApproveForm({
  code: 'SIEC.PCN_DETAIL', // 流程单据内配置的流程表单编码
  component: async () => {
    console.log('进入SIEC.PCN_DETAIL');
    return dynamicWrapper(
      window.dvaApp,
      ['pcnmanageWorkbench'], // 流程表单页面用到的 model
      () => import('../routes/PcnmanageWorkbench/Detail/index') // 流程表单页面组件
    );
  },
});

setWorkflowApproveForm({
  code: 'SIEC.PCN_STATUS_CHANGE_DOC:EMBEDPAGE', // 单据样式定制-工作流
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['pcnmanageWorkbench'], // 流程表单页面用到的 model
      () => import('../routes/PcnmanageWorkbenchDetailWork/index') // 流程表单页面组件
    );
  },
});
