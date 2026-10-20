/**
 * docFlowPermissionDs.js
 * 单据流权限 Dataset
 * @date: 2021-08-25
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
function getDocFlowRoleDs() {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 20,
    queryFields: [
      {
        name: 'roleName',
        type: 'string',
        label: intl.get('spfm.docFlowPermission.model.role.name').d('角色名称'),
      },
    ],
    fields: [
      {
        name: 'roleId',
        type: 'string',
      },
      {
        name: 'roleName',
        type: 'string',
        label: intl.get('spfm.docFlowPermission.model.role.name').d('角色名称'),
      },
      {
        name: 'roleCode',
        type: 'string',
        label: intl.get('spfm.docFlowPermission.model.role.code').d('角色编码'),
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hzero.common.tenantName').d('所属租户'),
      },
      {
        name: 'status',
        type: 'string',
        label: intl.get('hzero.common.button.status').d('状态'),
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      read: ({ data, params: { page, pagesize } }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${organizationId}/node-authoritys`,
          method: 'get',
          data: { ...data, page, pagesize },
        };
      },
    },
  };
}

function getDocFlowPermissionDs() {
  return {
    autoQuery: false,
    selection: false,
    checkField: 'allocated',
    parentField: 'nodeDefinitionCode',
    expandField: 'expand',
    idField: 'authorityCode',
    fields: [
      { name: 'authorityCode', type: 'string' },
      { name: 'expand', type: 'boolean' },
      { name: 'nodeDefinitionCode', type: 'string' },
    ],
    transport: {
      read: ({ data: { roleId } }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${organizationId}/node-authoritys/details`,
          method: 'get',
          params: {
            roleId,
          },
        };
      },
      update: {
        url: `${SRM_DATA_PROCESS}/v1/${organizationId}/node-authoritys`,
        method: 'put',
      },
    },
  };
}

export { getDocFlowRoleDs, getDocFlowPermissionDs };
