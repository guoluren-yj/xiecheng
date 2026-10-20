import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function subApplicationCommon() {
  return {
    primaryKey: 'id',
    autoQuery: false,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,

    // table表单显示的字段
    fields: [
      {
        name: 'role',
        type: 'object',
        lovCode: 'HIAM.USER_ROLE_MANAGER',
        lovPara: { tenantId: organizationId },
        label: intl.get('smbl.subAppCommon.model.roleName').d('角色名称'),
      },
      {
        name: 'subApp',
        type: 'object',
        required: true,
        lovCode: 'SMBL.SUB_APP_LIST',
        label: intl.get('smbl.subAppCommon.model.subAppName').d('子应用名称'),
      },
      {
        name: 'roleName',
        type: 'string',
        label: intl.get('smbl.subAppCommon.model.roleName').d('角色名称'),
        bind: 'role.name',
      },
      {
        name: 'subAppName',
        type: 'string',
        bind: 'subApp.subAppName',
        label: intl.get('smbl.subAppCommon.model.subAppName').d('子应用名称'),
      },
      {
        name: 'sequence',
        type: 'number',
        required: true,
        label: intl.get('smbl.subAppCommon.model.sequence').d('排序号'),
      },
      {
        name: 'roleId',
        type: 'string',
        bind: 'role.id',
      },

      {
        name: 'subAppId',
        type: 'string',
        bind: 'subApp.subAppId',
      },
      {
        name: 'operationAction',
        label: intl.get('hzero.common.button.operator').d('操作'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/${organizationId}/sub-application-common`,
        method: 'get',
      },
      create: {
        url: `${SRM_SMBL}/v1/${organizationId}/sub-application-common/save`,
        method: 'put',
      },
      update: {
        url: `${SRM_SMBL}/v1/${organizationId}/sub-application-common/save`,
        method: 'put',
      },
      destroy: {
        url: `${SRM_SMBL}/v1/${organizationId}/sub-application-common`,
        method: 'delete',
      },
    },
  };
}

export { subApplicationCommon };
