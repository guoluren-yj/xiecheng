// import moment from 'moment';
import { SRM_SMBL } from '@/utils/config.js';
// import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

// const organizationId = getCurrentOrganizationId();
function listApplicationDS() {
  return {
    primaryKey: 'applicationId',
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 6,

    // table表单显示的字段
    fields: [
      {
        name: 'applicationCode',
        type: 'string',
        required: true,
        unique: true,
        label: intl.get('smbl.application.model.Application.applicationCode').d('应用编码'),
      },
      {
        name: 'applicationName',
        type: 'intl',
        required: true,
        label: intl.get('smbl.application.model.Application.applicationName').d('应用名称'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.model.remark').d('备注'),
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'operationAction',
        type: 'string',
        label: intl.get('hzero.common.table.column.option').d('操作'),
      },
    ],

    // 查询表单字段
    queryFields: [
      {
        name: 'applicationCode',
        type: 'string',
        label: intl.get('smbl.application.model.Application.applicationCode').d('应用编码'),
      },
      {
        name: 'applicationName',
        type: 'string',
        label: intl.get('smbl.application.model.Application.applicationName').d('应用名称'),
      },
    ],
    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/applications`,
        method: 'get',
      },
      create: {
        url: `${SRM_SMBL}/v1/applications`,
        method: 'post',
        autoQuery: true,
      },
      update: {
        url: `${SRM_SMBL}/v1/applications`,
        method: 'post',
      },
      destroy: {
        url: `${SRM_SMBL}/v1/applications`,
        method: 'delete',
      },
    },
  };
}

export { listApplicationDS };
