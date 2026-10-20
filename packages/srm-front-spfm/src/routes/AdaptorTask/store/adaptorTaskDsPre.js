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

function getAdaptorTaskDs(props) {
  return {
    queryFields: [
      {
        name: 'task',
        type: 'object',
        lovCode: 'SADA.ADAPTOR_TASK_CODE',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('挂载点编码'),
        ignore: 'always',
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
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.enabled').d('启用'),
      },
    ],
    fields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.applyTenant').d('所属租户'),
        required: true,
        lovCode: 'SADA_TENANT_PAGE',
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
        lovCode: 'SADA.ADAPTOR_TASK_CODE',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('挂载点编码'),
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
          .d('例如: pur|platform|src|mall|data|cdp|saas|srm-8765用于实现功能XXXX'),
        required: true,
        validator: (value) => {
          const pattern = /.*(cro|pur|platform|src|mall|data|cdp|saas|srm)-[0-9]+.*/;
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
        label: intl.get('spfm.adaptorTask.model.adaptorTask.trustful').d('可信'),
      },
      {
        name: 'scriptVersion',
        type: 'string',
        required: true,
        lookupCode: 'SADA.ADAPTOR_SCRIPT_VERSION',
        defaultValue: '3',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.scriptVersion').d('MarmotScript版本'),
      },
      {
        name: 'runningService',
        type: 'string',
        required: true,
        label: intl.get('spfm.adaptorTask.model.adaptorTask.runningService').d('所属服务'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.enabled').d('启用'),
      },
      {
        name: 'creatorName',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.creatorName').d('创建人'),
      },
      {
        name: 'favorite',
        type: 'boolean',
        defaultValue: false,
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
      {
        name: 'creationDate',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.creationDate').d('创建时间'),
      },
    ],
    selection: false,
    transport: {
      read:
        props === 'favorites'
          ? {
              url: `${SRM_ADAPTOR}/v1/adaptor-favorites`,
              method: 'GET',
            }
          : {
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
        lovCode: 'SADA_TENANT_PAGE',
        ignore: 'always',
      },
      {
        name: 'applyTenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'applyTenantName',
        type: 'string',
        bind: 'applyTenant.tenantName',
      },
      {
        name: 'description',
        type: 'string',
      },
    ],
  };
}

export { getAdaptorTaskDs, getQueryFormDs };
