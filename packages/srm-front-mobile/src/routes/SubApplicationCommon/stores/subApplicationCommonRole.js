import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function subApplicationCommonRole() {
  return {
    primaryKey: 'id',
    autoQuery: true,
    autoQueryAfterSubmit: true,
    paging: false,

    // table表单显示的字段
    fields: [
      {
        name: 'role',
        type: 'object',
        lovCode: 'HIAM.USER_ROLE_MANAGER',
        required: true,
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        label: intl.get('smbl.subAppCommon.model.roleName').d('角色名称'),
        bind: 'role.name',
      },
      {
        name: 'code',
        type: 'string',
        required: true,
        label: intl.get('smbl.subAppCommon.model.roleCode').d('角色编码'),
        bind: 'role.code',
      },
      {
        name: 'id',
        type: 'string',
        required: true,
        bind: 'role.id',
      },
      {
        name: 'operationAction',
        label: intl.get('hzero.common.button.operator').d('操作'),
      },
    ],
    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
    },
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/lovs/sql/data`,
        method: 'get',
        params: {
          lovCode: 'SMBL.SUB_APP_COMMON_ROLE',
          tenantId: organizationId,
        },
      },
    },
  };
}

export { subApplicationCommonRole };
