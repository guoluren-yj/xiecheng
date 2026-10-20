import { setComponent } from 'hzero-front/lib/customize/hpfm';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
import { dynamicWrapper } from '../utils/router/utils';

setComponent('PersonalLoginRecordRoute', () =>
  // TODO: there is use global vari dvaApp
  dynamicWrapper(window.dvaApp, ['personalLoginRecord'], () =>
    import('../routes/PersonalLoginRecord')
  )
);

/**
 * 日历租户级工作流
 */
setWorkflowApproveForm({
  code: 'SMDM.CALENDARY_SUBMIT_DOC:SMDM_SRM_CALENDAR_FORM_SUB', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      ['calendar'], // 流程表单页面用到的 model
      () => import('../routes/Calendar/Detail/readOnly') // 流程表单页面组件
    );
  },
});
