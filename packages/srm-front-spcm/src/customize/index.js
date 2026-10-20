import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
// import { dynamicWrapper } from '../utils/router';

const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });
// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
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

// 协议发布流程
setWorkflowApproveForm({
  code: 'SPCM.APPROVED_FORM', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['purchaseContractView', 'contractCommon', 'contractMaintain', 'editorOnline'], // 流程表单页面用到的 model
      () => import('../routes/PurchaseContractView/Detail') // 流程表单页面组件
    ),
});

// 协议确认流程
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_CONFIRM', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['contractSign', 'contractCommon', 'editorOnline'], // 流程表单页面用到的 model
      () => import('../routes/ContractSign/Detail') // 流程表单页面组件
    ),
});

// 协议确认流程-我发起的协议
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_CONFIRME_FORM:PUR', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['purchaseContractView', 'contractCommon', 'contractMaintain', 'editorOnline'], // 流程表单页面用到的 model
      () => import('../routes/PurchaseContractView/Detail') // 流程表单页面组件
    ),
});

// 协议终止流程
setWorkflowApproveForm({
  code: 'SPCM.CON_TERMINATION', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['purchaseContractView', 'contractCommon', 'contractMaintain', 'editorOnline'], // 流程表单页面用到的 model
      () => import('../routes/PurchaseContractView/Detail') // 流程表单页面组件
    ),
});

// 协议作废流程
setWorkflowApproveForm({
  code: 'SPCM.CON_INVALID', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['purchaseContractView', 'contractCommon', 'contractMaintain', 'editorOnline'], // 流程表单页面用到的 model
      () => import('../routes/PurchaseContractView/Detail') // 流程表单页面组件
    ),
});

// 协议变更流程
setWorkflowApproveForm({
  code: 'SPCM.CON_CHANGE', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['purchaseContractView', 'contractCommon', 'contractMaintain', 'editorOnline'], // 流程表单页面用到的 model
      () => import('../routes/PurchaseContractView/Detail') // 流程表单页面组件
    ),
});

// 协议模板列表页查看表单
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_TEMPLATE', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['contractTemplate', 'contractCommon'], // 流程表单页面用到的 model
      () => import('../routes/ContractTemplate') // 流程表单页面组件
    ),
});

// 协议模板列表页查看表单-新
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_TEMPLATE:NEW', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['contractTemplate', 'contractCommon'], // 流程表单页面用到的 model
      () => import('../routes/ContractTemplate') // 流程表单页面组件
    ),
});

// 查看协议模板
setWorkflowApproveForm({
  code: 'SPCM.TEMPLATE_DETAIL', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['contractTemplate', 'contractCommon', 'editorOnline'], // 流程表单页面用到的 model
      () => import('../routes/ContractTemplate/Detail/TemplateDetail') // 流程表单页面组件
    ),
});

// 查看协议模板-新
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_TEMPLATE:FILE_DETAIL', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['contractTemplate', 'contractCommon', 'editorOnline'], // 流程表单页面用到的 model
      () => import('../routes/ContractTemplate/Detail/TemplateDetail') // 流程表单页面组件
    ),
});

// 协议模板明细页
setWorkflowApproveForm({
  code: 'SPCM.COMTRACT_TEMPLATE_DETAIL', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['contractTemplate', 'contractCommon'], // 流程表单页面用到的 model
      () => import('../routes/ContractTemplate/Detail') // 流程表单页面组件
    ),
});

// 协议模板明细页-新
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_TEMPLATE:DETAIL_NEW', // 流程单据内配置的流程单据编码
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['contractTemplate', 'contractCommon'], // 流程表单页面用到的 model
      () => import('../routes/ContractTemplate/Detail') // 流程表单页面组件
    ),
});

// 发布流程-工作台
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_APPROVED_FORM:WORKFORM',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/Detail/view')
    ),
});

// 终止流程-工作台
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_TERMINATION_FORM:WORKFORM',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/Detail/view')
    ),
});

// 作废流程-工作台
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_INVALID_FORM:WORKFROM',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/Detail/view')
    ),
});

// 变更流程-工作台
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_CHANGE_FORM:WORKFORM',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/Detail/view')
    ),
});

// 协议签署-工作台
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_CONFIRME_FORM:EDIT_SHARE',
  customSubmit: true,
  component: async () =>
    dynamicWrapper(window.dvaApp, ['contractSign', 'contractCommon', 'editorOnline'], () =>
      import('../routes/ContractSign/Detail')
    ),
});

// 归档流程-工作台
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_ARCHIVE_FORM:WORKFORM',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/Detail/view')
    ),
});

// 协议确认表单-工作台详情
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_CONFIRME_FORM:WORKFORM.VIEW',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/Detail/view')
    ),
});

// 协议提交表单-工作台-单据样式
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_APPROVED_FORM:PURWF.VIEW',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/ContractApprovalWF')
    ),
});

// 协议提确认表单（供）-工作台-单据样式
setWorkflowApproveForm({
  code: 'SPCM.CONTRACT_CONFIRME_FORM:SUPWF.VIEW',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/ContractApprovalWF')
    ),
});

// 协议确认生效后审批表单-单据样式
setWorkflowApproveForm({
  code: 'SPCM.COMFIRM_EFFECT_APPROVAL:WFVIEW',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/ContractApprovalWF')
    ),
});

// 协议确认生效后审批表单
setWorkflowApproveForm({
  code: 'SPCM.COMFIRM_EFFECT_APPROVAL:WORKFORM',
  component: async () =>
    dynamicWrapper(
      window.dvaApp,
      ['workSpace', 'contractCommon', 'contractMaintain', 'contractChapter', 'editorOnline'],
      () => import('../routes/workspace/Detail/view')
    ),
});
