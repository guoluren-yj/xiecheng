/**
 * adaptorTaskDs.js
 * 适配器列表
 * @date: 2020-08-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';

export default function () {
  return {
    // autoQuery: true,
    fields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.applyTenant').d('所属租户'),
        lovCode: 'SADA.TENANT_NUM',
        ignore: 'always',
      },
      {
        name: 'applyTenantName',
        type: 'string',
        bind: 'applyTenant.tenantName',
      },
      {
        name: 'debugTenantNum',
        type: 'string',
      },
      {
        name: 'applyTenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('任务编码'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.description').d('描述'),
      },
      {
        name: 'inputEntityCode',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.inputEntityCode').d('来源结构'),
      },
      // {
      //   name: 'version',
      //   type: 'string',
      //   label: '版本号',
      // },
      {
        name: 'runningService',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.runningService').d('所属服务'),
      },
      {
        name: 'enabled',
        type: 'boolean',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.enabled').d('是否启用'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.applyTenant').d('所属租户'),
        lovCode: 'SADA.TENANT_NUM',
        ignore: 'always',
      },
      {
        name: 'applyTenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('任务编码'),
      },
    ],
    selection: false,
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/adaptor-task-headers`,
        method: 'GET',
      },
    },
  };
}
