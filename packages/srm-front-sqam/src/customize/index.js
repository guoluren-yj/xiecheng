import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';

const workFlowForms = [
  {
    code: 'SQAM.CLAIM_APPROVAL', // 索赔单审批工作流
    models: ['claimApproval', 'sqamCommon'],
    component: () => import('../routes/ClaimApproval/Detail'),
  },
  {
    code: 'SQAM.CLAIM_APPROVAL:EDIT', // 索赔单审批工作流 可编辑
    customSubmit: true,
    models: ['claimApproval', 'sqamCommon'],
    component: () => import('../routes/ClaimApproval/Detail'),
  },
  {
    code: 'SQAM.PROBLEM',
    models: [
      'initiated8D',
      'promiseMaintainProvide',
      'followUpProduce',
      'rootReasonAnalyze',
      'foreverDealSolution',
      'relateStandard',
      'isSuitUnderItem',
      'create8D',
    ],
    component: () => import('../routes/Initiated8D/Detail'),
  },
  {
    code: 'SQAM.ED_PROBLEM:EDIT',
    customSubmit: true,
    models: [
      'initiated8D',
      'promiseMaintainProvide',
      'followUpProduce',
      'rootReasonAnalyze',
      'foreverDealSolution',
      'relateStandard',
      'isSuitUnderItem',
      'create8D',
    ],
    component: () => import('../routes/Initiated8D/Detail'),
  },
  {
    code: 'SQAM.ED_PROBLEM:EDIT_ALL',
    customSubmit: true,
    models: [
      'initiated8D',
      'promiseMaintainProvide',
      'followUpProduce',
      'rootReasonAnalyze',
      'foreverDealSolution',
      'relateStandard',
      'isSuitUnderItem',
      'create8D',
    ],
    component: () => import('../routes/Initiated8D/Detail'),
  },
  {
    code: 'SQAM_INSPECTION_PURCHASER', // 质检工作流
    component: () => import('../routes/QualityInspectApproval/Approve'),
  },
  {
    code: 'SQAM.PPAP_PROJECT:WORKBENCH', // PPAP工作流
    component: () => import('../routes/PPAPWorkbench/Detail'),
  },
  {
    code: 'SQAM.PPAP_STAGE:READ',
    component: () => import('../routes/PPAPWorkbench/Detail'),
  },
  {
    code: 'SQAM.PPAP_DOCUMENT:READ',
    component: () => import('../routes/PPAPWorkbench/Detail'),
  },
  {
    code: 'SQAM.PPAP_PROJECT:EDIT_PROJECT', // PPAP工作流项目视图 可编辑
    customSubmit: true,
    component: () => import('../routes/PPAPWorkbench/Detail'),
  },
  {
    code: 'SQAM.PPAP_DOCUMENT:EDIT_DOCUMENT', // 交付物视图可编辑
    customSubmit: true,
    component: () => import('../routes/PPAPWorkbench/Detail'),
  },
  {
    code: 'SQAM.PPAP_STAGE:EDIT', // 阶段视图可编辑
    customSubmit: true,
    component: () => import('../routes/PPAPWorkbench/Detail'),
  },
];

const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

const dynamicWrapper = (app, models, component) => {
  //  eslint-disable-next-line
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
          //  eslint-disable-next-line
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

workFlowForms.forEach((item) => {
  const { code, models = [], component } = item;
  setWorkflowApproveForm({
    code, // 流程单据内配置的流程单据编码 只读
    component: async () => {
      return dynamicWrapper(
        window.dvaApp,
        models, // 流程表单页面用到的 model
        component // 流程表单页面组件
      );
    },
  });
});
