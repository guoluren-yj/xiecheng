import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';
import crypto from 'crypto-js';

function getAdaptorDs() {
  return {
    autoQuery: true,
    pageSize: 10,
    selection: false,
    queryFields: [
      {
        name: 'applyTenant',
        type: 'object',
        label: intl.get('spfm.script.model.script.applyTenant').d('所属租户'),
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
        bind: 'applyTenant.applyTenantName',
        label: intl.get('spfm.script.model.script.applyTenant').d('所属租户'),
      },
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.script.model.script.taskCode').d('挂载点编码'),
      },
      {
        name: 'text',
        type: 'string',
        label: intl.get('spfm.script.model.script.text').d('搜索脚本内容'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.script.model.script.description').d('描述关键字'),
      },
      {
        name: 'runningServiceObj',
        type: 'object',
        label: intl.get('spfm.script.model.script.runningService').d('所属服务'),
        lovCode: 'SADA_ADAPTOR_RUNNINGSERVICE',
        ignore: 'always',
      },
      {
        name: 'runningService',
        type: 'string',
        label: intl.get('spfm.script.model.script.runningService').d('所属服务'),
        bind: 'runningServiceObj.runningService',
      },
      {
        name: 'scriptVersion',
        type: 'string',
        lookupCode: 'SADA.ADAPTOR_SCRIPT_VERSION',
        label: intl.get('spfm.script.model.script.scriptVersion').d('版本'),
      },
    ],
    fields: [
      {
        name: 'id',
        type: 'string',
      },
      {
        name: 'runningService',
        type: 'string',
        label: intl.get('spfm.script.model.script.runningService').d('所属服务'),
      },
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.script.model.script.taskCode').d('挂载点编码'),
      },
      {
        name: 'applyTenantNum',
        type: 'string',
        label: intl.get('spfm.script.model.script.applyTenantNum').d('租户编码'),
      },
      {
        name: 'applyTenantName',
        type: 'string',
        label: intl.get('spfm.script.model.script.applyTenant').d('所属租户'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.script.model.script.description').d('适配器描述'),
      },
      {
        name: 'scriptVersion',
        type: 'string',
        label: intl.get('spfm.script.model.script.scriptVersion').d('版本'),
      },
      {
        name: 'creatorName',
        type: 'string',
        label: intl.get('spfm.script.model.script.creatorName').d('创建人'),
      },
      {
        name: 'adaptorLine',
        type: 'object',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],

    transport: {
      read: {
        url: `${SRM_ADAPTOR}/v1/adaptor-script/search`,
        method: 'GET',
      },
    },
  };
}

function getAdaptorTaskHeadDs() {
  return {
    autoQuery: true,
    dataToJSON: 'dirty',
    fields: [
      {
        name: 'applyTenant',
        type: 'object',
        lovCode: 'SADA.TENANT_NUM',
        ignore: 'always',
        required: true,
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
        name: 'task',
        type: 'object',
        lovCode: 'SADA.TASK_CODE_CONFIG',
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
        required: true,
        placeholder: intl
          .get('spfm.adaptorTask.model.adaptorTask.descriptionRequired')
          .d('请输入描述(关联猪齿鱼需求编号)'),
      },
      {
        name: 'inputEntity',
        type: 'object',
        lovCode: 'SADA.ADAPTOR_ENTITY_STRUCTURE',
        ignore: 'always',
      },
      {
        name: 'inputEntityCode',
        type: 'string',
        bind: 'inputEntity.entityCode',
      },
      {
        name: 'inputEntityName',
        type: 'string',
        bind: 'inputEntity.entityName',
      },
      {
        name: 'scriptVersion',
        type: 'string',
        required: true,
        lookupCode: 'SADA.ADAPTOR_SCRIPT_VERSION',
      },
      {
        name: 'runningService',
        type: 'string',
      },
    ],
  };
}

function getAdaptorTaskLineDs() {
  return {
    paging: false,
    dataToJSON: 'dirty',
    fields: [
      {
        name: 'priority',
        type: 'number',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
      },
      {
        name: 'outputEntity',
        type: 'object',
        lovCode: 'SADA.ADAPTOR_ENTITY_STRUCTURE',
        ignore: 'always',
      },
      {
        name: 'outputEntityCode',
        type: 'string',
        bind: 'outputEntity.entityCode',
      },
      {
        name: 'outputEntityName',
        type: 'string',
        bind: 'outputEntity.entityName',
      },
      {
        name: 'script',
        type: 'string',
      },
      {
        name: 'resultInvokeLov',
        type: 'object',
        lovCode: 'SADA.RESULT_INVOKE',
        ignore: 'always',
      },
      {
        name: 'resultInvoke',
        type: 'string',
        bind: 'resultInvokeLov.beanName',
      },
      {
        name: 'scriptType',
        type: 'string',
        defaultValue: 'JS',
        disabled: true,
      },
      {
        name: 'scriptContent',
        type: 'string',
        transformResponse: (value) => {
          return value ? crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(value)) : value;
        },
      },
    ],
  };
}

export { getAdaptorDs, getAdaptorTaskHeadDs, getAdaptorTaskLineDs };
