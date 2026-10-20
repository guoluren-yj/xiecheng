import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getPlatformVersionApi, isTenantRoleLevel } from 'utils/utils';

const getCurrentUrl = getPlatformVersionApi('portal-layouts');
const isTenant = isTenantRoleLevel();
export default function getProtalDs() {
  return {
    // autoQuery: true,
    pageSize: 20,
    primaryKey: 'layoutId',
    forceValidate: true,
    cacheSelection: true,
    fields: [
      {
        name: 'layoutObject',
        type: 'object',
        textField: 'layoutName',
        valueField: 'layoutCode',
        label: intl.get('hptl.portalAssign.model.portalAssign.templateName').d('模板名称'),
      },
      {
        name: 'layoutId',
        type: 'string',
        bind: 'layoutObject.layoutId',
        disabled: true,
      },
      {
        name: 'layoutCode',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.layoutCode').d('模板编码'),
        bind: 'layoutObject.layoutCode',
      },
      {
        name: 'layoutName',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.portalAssign.templateName').d('模板名称'),
        bind: 'layoutObject.layoutName',
        required: true,
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('hptl.portalAssign.model.portalAssign.description').d('模板描述'),
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.tenantName').d('所属租户'),
      },

      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentUrl}`,
          method: 'get',
          // data,
          data: {
            ...data,
            customizeUnitCode: isTenant
              ? 'SPFM.PORTAL.LAYOUT.MANAGE.TENANT.SEARCH_BAR'
              : 'PORTAL_LAYOUT.SEARCH', // 筛选器个性化单元编码
          },
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentUrl}`,
          method: 'post',
          data: data[0],
        };
      },
    },
  };
}
