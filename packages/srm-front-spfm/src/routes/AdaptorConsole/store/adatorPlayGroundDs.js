/**
 * AdaptorPlayGroundDs.js
 * 适配器PlayGround Dataset
 * @date: 2021-08-18
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { SRM_ADAPTOR } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag ? `${SRM_ADAPTOR}/v1/${organizationId}` : `${SRM_ADAPTOR}/v1`;

function getAdatorPlayGroundDs() {
  const queryTenantFields = !tenantFlag
    ? [
        {
          name: 'applyTenant',
          type: 'object',
          label: intl.get('spfm.adaptorTask.model.adaptorTask.applyTenant').d('所属租户'),
          lovCode: 'SADA_TENANT_PAGE',
        },
        {
          name: 'applyTenantNum',
          type: 'string',
          bind: 'applyTenant.tenantNum',
        },
      ]
    : [];
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    queryFields: [
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('任务编码'),
      },
      {
        name: 'creator',
        type: 'object',
        textField: 'realName',
        valueField: 'createdBy',
        lovCode: 'SADA_PLAYGROUND_USER',
        dynamicProps: () => {
          return { lovPara: { organizationId } };
        },
        label: intl.get('spfm.adaptorTaskDetail.model.adaptorTaskDetail.realName').d('创建人'),
        ignore: 'always',
      },
      {
        name: 'realName',
        type: 'string',
        bind: 'creator.realName',
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.description').d('描述'),
      },
      ...queryTenantFields,
    ],
    fields: [
      {
        name: 'id',
        type: 'string',
        label: 'id',
      },
      {
        name: 'taskCode',
        type: 'string',
        required: true,
        validator: (value) => {
          const pattern = /^[A-Z][A-Z0-9_]*$/;
          if (!pattern.test(value)) {
            return intl
              .get('spfm.adaptorPlayGround.validation.codeUpperBegin')
              .d('全大写及数字，必须以字母开头，可包含“_”');
          }
        },
        label: intl.get('spfm.adaptorTask.model.adaptorTask.taskCode').d('任务编码'),
      },
      {
        name: 'applyTenant',
        type: 'object',
        lovCode: 'SADA_TENANT_PAGE',
        required: true,
        label: intl.get('spfm.adaptorTask.model.adaptorTask.applyTenant').d('所属租户'),
      },
      {
        name: 'applyTenantName',
        type: 'string',
        bind: 'applyTenant.tenantName',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.applyTenant').d('所属租户'),
      },
      {
        name: 'applyTenantNum',
        type: 'string',
        bind: 'applyTenant.tenantNum',
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.description').d('描述'),
      },
      {
        name: 'runningService',
        type: 'string',
        defaultValue: 'srm-adaptor',
      },
      {
        name: 'scriptContent',
        type: 'string',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
      {
        name: 'inputEntity',
        type: 'object',
        lovCode: 'SADA.ADAPTOR_ENTITY_STRUCTURE',
        ignore: 'always',
        label: intl.get('spfm.adaptorTask.model.adaptorTask.inputEntityCode').d('来源结构'),
      },
      {
        name: 'inputContent',
        type: 'string',
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
        name: 'debugTenantNum',
        type: 'string',
      },
      {
        name: 'realName',
        type: 'string',
        label: intl.get('spfm.adaptorTaskDetail.model.adaptorTaskDetail.realName').d('创建人'),
      },
    ],
    transport: {
      read({ data, params: { page, pagesize } }) {
        return {
          url: `${requestUrlPre}/adaptor-playgrounds/query`,
          method: 'get',
          data: { ...data, page, pagesize },
        };
      },
      create: ({ data }) => {
        return {
          url: `${requestUrlPre}/adaptor-playgrounds/save`,
          method: 'post',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${requestUrlPre}/adaptor-playgrounds/save`,
          method: 'post',
          data: data[0],
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${requestUrlPre}/adaptor-playgrounds`,
          method: 'delete',
          data: data[0],
        };
      },
    },
  };
}

function getAdaptorRoutePrefixDs() {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'bindRoutePrefix',
        type: 'string',
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `${requestUrlPre}/adaptor-playgrounds/prefix`,
          method: 'get',
          data,
        };
      },
    },
  };
}

export { getAdatorPlayGroundDs, getAdaptorRoutePrefixDs };
