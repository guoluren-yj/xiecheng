import { createElement } from 'react';
import dynamic from 'dva/dynamic';

// 引入 存储 卡片配置的方法
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';

// 引入 加载 model 的包装方法
const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
export const dynamicWrapper = (app, models, component) => {
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)) ||
      [],
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

// 租户级企业认证审批表单
setWorkflowApproveForm({
  code: 'SPFM.ENTERPRISE_APPROVAL_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['enterprise/approval'], () =>
      import('../routes/Enterprise/TenantApproval/Detail')
    );
  },
});

// 预设审批表单
setWorkflowApproveForm({
  code: 'SPFM_ANNOUNCEMENT_MANAGEMENT:PRESET_APPROVAL_FORM',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['notice'], () =>
      import('../routes/Notice/NoticeIncludeForm')
    );
  },
});

// 预设审批表单
setWorkflowApproveForm({
  code: 'SPFM.BUSINESS_NOTIFICATION_REL:DOC',
  component: async () => {
    return dynamicWrapper(window.dvaApp, ['businessOrderPublish'], () =>
      import('../routes/BusinessOrderPublish/Detail')
    );
  },
});
