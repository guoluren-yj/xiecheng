/**
 * adaptorTenantDs.js
 * 适配器租户级列表
 * @date: 2021-10-19
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */

import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
function getAdaptorTenantDs(props) {
  return {
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'task',
        type: 'object',
        lovCode: 'SADA_TASK_CODE_CONFIG_ORG',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('任务编码'),
        ignore: 'always',
        required: true,
      },
      {
        name: 'taskCode',
        type: 'string',
        bind: 'task.taskCode',
        required: true,
      },
      {
        name: 'favorite',
        type: 'boolean',
        defaultValue: false,
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.description').d('描述'),
        required: true,
      },
      {
        name: 'scriptVersion',
        type: 'string',
        required: true,
        defaultValue: '3',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.scriptVersion').d('版本号'),
      },
      {
        name: 'runningService',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.runningService').d('所属服务'),
        required: true,
      },
      {
        name: 'creatorName',
        type: 'string',
        label: intl.get(`spfm.adaptorTask.model.adaptorTask.creatorName`).d('创建人'),
      },
      {
        name: 'enabledFlag',
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
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('任务编码'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.description').d('描述'),
      },
    ],
    transport: {
      read:
        props === 'favorites'
          ? {
              url: `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-favorites`,
              method: 'GET',
            }
          : { url: `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-task-headers`, method: 'GET' },
      create: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-task-headers/adaptor-save`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-task-headers/adaptor-save`,
          method: 'POST',
          data: data[0],
        };
      },
    },
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
        label: intl.get('spfm.adaptorTaskDetail.model.adaptorTaskDetail.priority').d('优先级'),
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.adaptorTaskDetail.model.adaptorTaskDetail.description').d('行描述'),
        placeholder: intl
          .get('spfm.adaptorTask.model.adaptorTask.descriptionRequired')
          .d('请输入描述(关联猪齿鱼需求编号)'),
      },
      {
        name: 'outputEntity',
        type: 'object',
        lovCode: 'SADA.ADAPTOR_ENTITY_STRUCTURE',
        label: intl
          .get('spfm.adaptorTaskDetail.model.adaptorTaskDetail.outputEntity')
          .d('输出结构'),
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
        label: intl.get('spfm.adaptorTaskDetail.model.adaptorTaskDetail.script').d('脚本代码'),
      },
      {
        name: 'resultInvokeLov',
        type: 'object',
        lovCode: 'SADA.RESULT_INVOKE',
        label: intl
          .get('spfm.adaptorTaskDetail.model.adaptorTaskDetail.resultInvokeLov')
          .d('后续调用'),
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
      },
    ],
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
        label: intl.get('spfm.adaptorTask.model.adaptorTask.applyTenant').d('所属租户'),
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
        required: true,
        placeholder: intl
          .get('spfm.adaptorTask.model.adaptorTask.descriptionRequired')
          .d('请输入描述(关联猪齿鱼需求编号)'),
      },
      {
        name: 'inputEntity',
        type: 'object',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.inputEntityCode').d('来源结构'),
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
        label: intl.get('spfm.adaptorTask.model.adaptorTask.scriptVersion').d('版本号'),
      },
      {
        name: 'runningService',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.runningService').d('所属服务'),
      },
    ],
  };
}

export { getAdaptorTenantDs, getAdaptorTaskLineDs, getAdaptorTaskHeadDs };
