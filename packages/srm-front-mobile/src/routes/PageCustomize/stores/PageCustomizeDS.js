import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function pageCustomizeDS() {
  return {
    primaryKey: 'pageCustomizeId',
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'description',
        type: 'string',
        required: true,
        label: intl.get('smbl.pageCustomize.model.PageCustomize.description').d('描述'),
      },
      {
        name: 'standardPagePath',
        type: 'string',
        required: true,
        label: intl
          .get('smbl.pageCustomize.model.PageCustomize.standardPagePath')
          .d('标准页面路径'),
      },
      {
        name: 'customizePagePath',
        type: 'string',
        required: true,
        label: intl
          .get('smbl.pageCustomize.model.PageCustomize.customizePagePath')
          .d('个性化页面路径'),
      },
      {
        name: 'application',
        type: 'object',
        label: intl.get('smbl.application.model.Application.application').d('应用'),
        noCache: true,
        lovCode: 'SMBL.APPLICATION.VIEW',
        required: true,
      },
      {
        name: 'applicationName',
        bind: 'application.applicationName',
      },
      {
        name: 'applicationId',
        bind: 'application.applicationId',
      },
      {
        name: 'tenant',
        type: 'object',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
        lovCode: 'HPFM.TENANT',
        noCache: true,
        required: true,
      },
      {
        name: 'tenantName',
        bind: 'tenant.tenantName',
      },
      {
        name: 'tenantId',
        bind: 'tenant.tenantId',
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'operationAction',
        type: 'string',
        label: intl.get('hzero.common.table.column.option').d('操作'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.model.remark').d('备注'),
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'description',
        type: 'string',
        label: intl.get('smbl.pageCustomize.model.PageCustomize.description').d('页面路径描述'),
      },
      {
        name: 'standardPagePath',
        type: 'string',
        label: intl
          .get('smbl.pageCustomize.model.PageCustomize.standardPagePath')
          .d('标准页面路径'),
      },
      {
        name: 'tenantId',
        type: 'object',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
        lovCode: 'HPFM.TENANT',
        noCache: true,
        required: true,
        transformRequest: (value) => value && value.tenantId,
      },
      {
        name: 'applicationId',
        type: 'object',
        label: intl.get('smbl.application.model.Application.application').d('应用'),
        noCache: true,
        lovCode: 'SMBL.APPLICATION.VIEW',
        transformRequest: (value) => value && value.applicationId,
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },

    transport: {
      read: {
        url: `${SRM_SMBL}/v1/page/customizes`,
        method: 'get',
      },
      destroy: {
        url: `${SRM_SMBL}/v1/page/customizes`,
        method: 'delete',
      },
      create: {
        url: `${SRM_SMBL}/v1/page/customizes`,
        method: 'post',
        autoQuery: true,
      },
      update: {
        url: `${SRM_SMBL}/v1/page/customizes`,
        method: 'post',
      },
    },
  };
}
export { pageCustomizeDS };
