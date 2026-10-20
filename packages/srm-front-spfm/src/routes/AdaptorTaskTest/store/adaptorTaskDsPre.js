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

function getAdaptorTaskDs() {
  return {
    // autoQuery: true,
    fields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.applyTenant').d('所属租户'),
        required: true,
        lovCode: 'SADA.TENANT_NUM',
        ignore: 'always',
      },
      {
        name: 'applyTenantName',
        type: 'string',
        bind: 'applyTenant.tenantName',
      },
      {
        name: 'applyTenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'resultInvokeLov',
        type: 'object',
        lovCode: 'SADA.RESULT_INVOKE',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.resultInvoke').d('后续调用'),
        ignore: 'always',
      },
      {
        name: 'resultInvoke',
        type: 'string',
        bind: 'resultInvokeLov.beanName',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.resultInvoke').d('后续调用'),
      },
      {
        name: 'task',
        type: 'object',
        lovCode: 'SADA.TASK_CODE_CONFIG',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('任务编码'),
        ignore: 'always',
        required: true,
      },
      {
        name: 'taskCode',
        type: 'string',
        bind: 'task.taskCode',
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.description').d('描述'),
        placeholder: intl
          .get('spfm.adaptorTask.model.adaptorTask.descriptionPlaceholder')
          .d('例如: srm-8765或cdp-8765用于实现功能C'),
        required: true,
        validator: (value) => {
          const pattern = /.*(cdp|srm)-[0-9]+.*/;
          if (!pattern.test(value)) {
            return intl
              .get('spfm.adaptorTask.model.adaptorTask.descriptionRequired')
              .d('请输入描述(关联猪齿鱼需求编号)');
          }
        },
      },
      {
        name: 'trustful',
        type: 'boolean',
        defaultValue: true,
        label: intl.get('spfm.adaptorTask.model.adaptorTask.trustful').d('是否可信'),
      },
      {
        name: 'scriptVersion',
        type: 'string',
        required: true,
        lookupCode: 'SADA.ADAPTOR_SCRIPT_VERSION',
        defaultValue: '3',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.scriptVersion').d('版本号'),
      },
      {
        name: 'runningService',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.runningService').d('所属服务'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.enabled').d('是否启用'),
      },
      {
        name: 'creatorName',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.creatorName').d('创建人'),
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    selection: false,
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/adaptor-task-headers`,
        method: 'GET',
      },
      create: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/adaptor-task-headers/adaptor-save`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/adaptor-task-headers/adaptor-save`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
}

function getAdaptorTaskTreeDs() {
  return {
    selection: 'single',
    parentField: 'treePid',
    idField: 'treeId',
    autoCreate: false,
    expandField: 'extend',
    autoQuery: true,
    fields: [
      {
        name: 'treeId',
        type: 'string',
      },
      {
        name: 'runningService',
        type: 'string',
      },
      {
        name: 'taskCode',
        type: 'string',
      },
    ],
    queryFields: [
      {
        name: 'queryTaskCode',
        type: 'string',
      },
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
    ],
    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/adaptor-task-headers/level`,
        method: 'GET',
      },
    },
  };
}

function getQueryFormDs() {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'taskCode',
        type: 'string',
      },
      {
        name: 'applyTenant',
        type: 'object',
        lovCode: 'SADA.TENANT_NUM',
        ignore: 'always',
      },
      {
        name: 'applyTenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'description',
        type: 'string',
      },
    ],
  };
}

export { getAdaptorTaskDs, getAdaptorTaskTreeDs, getQueryFormDs };
