/**
 * index.js
 * a适配器脚本列表
 * @date: 2021-07-05
 * @author: angnong <ang.nong@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag ? `${SRM_ADAPTOR}/v1/${organizationId}` : `${SRM_ADAPTOR}/v1`;

export default function getadaptorDs() {
  const queryArr = tenantFlag
    ? [
        {
          name: 'runningService',
          type: 'string',
          label: intl.get('spfm.script.model.script.runningService').d('所属服务'),
        },
      ]
    : [
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
      ];
  return {
    autoQuery: true,
    pageSize: 10,
    selection: false,
    queryFields: [
      {
        name: 'text',
        type: 'string',
        label: intl.get('spfm.script.model.script.text').d('搜索脚本内容'),
      },
      {
        name: 'taskCode',
        type: 'string',
        label: intl.get('spfm.script.model.script.taskCode').d('挂载点编码'),
      },
      ...queryArr,
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.script.model.script.description').d('描述关键字'),
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
        url: `${requestUrlPre}/adaptor-script/search`,
        method: 'GET',
      },
    },
  };
}
