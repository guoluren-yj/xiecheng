import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const PermissionCompDs = () => ({
  pageSize: 20,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  selection: false,
  fields: [
    {
      name: 'tabCodeMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.tabCodeMeaning').d('页面名称'),
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.operateRoleIdList').d('操作角色权限'),
      name: 'operateRoleIdListAll',
      type: 'object',
      lovCode: 'SPUC.SINV_LOV_ROLE',
      lovPara: {
        tenantId: organizationId,
      },
      multiple: true,
      // ignore: 'always',
    },
    {
      name: 'operateRoleIds',
      type: 'string',
      bind: 'operateRoleIdListAll.id',
      multiple: ',',
    },
    {
      name: 'operateRoleNames',
      type: 'string',
      bind: 'operateRoleIdListAll.name',
      multiple: ',',
    },
    {
      name: 'operateRoleCodes',
      type: 'string',
      bind: 'operateRoleIdListAll.code',
      multiple: ',',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.queryRoleIdList').d('查询角色权限'),
      name: 'queryRoleIdListAll',
      type: 'object',
      lovCode: 'SPUC.SINV_LOV_ROLE',
      lovPara: {
        tenantId: organizationId,
      },
      multiple: true,
      ignore: 'always',
    },
    {
      name: 'queryRoleIds',
      type: 'string',
      bind: 'queryRoleIdListAll.id',
      multiple: ',',
    },
    {
      name: 'queryRoleNames',
      type: 'string',
      bind: 'queryRoleIdListAll.name',
      multiple: ',',
    },
    {
      name: 'queryRoleCodes',
      type: 'string',
      bind: 'queryRoleIdListAll.code',
      multiple: ',',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const { strategyHeaderId } = params || {};
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/${strategyHeaderId}/permission`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export default PermissionCompDs;
