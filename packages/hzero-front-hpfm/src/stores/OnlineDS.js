/**
 *
 * @date: 2019-10-16
 * @author: jinmingyang <mingyang.jin@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import intl from 'utils/intl';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel, getCurrentTenant } from 'utils/utils';
import uuid from 'uuid/v4';

const organizationId = getCurrentOrganizationId();
const { tenantId: currentTenantId, tenantName: currentTenantName } = getCurrentTenant();

const listDS = () => ({
  primaryKey: uuid(),
  dataKey: 'content',
  selection: false,
  autoQuery: true,
  queryFields: [
    !isTenantRoleLevel() && {
      name: 'tenantId',
      type: 'object',
      required: true,
      label: intl.get('hpfm.online.model.online.tenantName').d('当前租户'),
      lovCode: 'HPFM.TENANT',
      noCache: true,
      defaultValue: {
        tenantId: currentTenantId,
        tenantName: currentTenantName,
      },
    },
    {
      name: 'includeFlag',
      type: 'string',
      lookupCode: 'SMAL.PRODUCT_GROUP_INCLUDE_NO_STOCK_FLAG',
      noCache: true,
      defaultValue: '1',
      label: intl.get('hpfm.online.model.online.loginNameFilterMethod').d('登录名过滤方式'),
    },
    {
      name: 'loginNameList',
      type: 'string',
      noCache: true,
      multiple: true,
      label: intl.get('hpfm.online.model.online.loginName').d('登录名'),
    },
  ].filter(Boolean),
  fields: [
    {
      name: 'loginName',
      type: 'string',
      label: intl.get('hpfm.online.model.online.loginName').d('登录名'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get('hpfm.online.model.online.tenantName').d('当前租户'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get('hpfm.online.model.online.organizationName').d('所属租户'),
    },
    {
      name: 'loginDate',
      type: 'dateTime',
      label: intl.get('hpfm.online.model.online.loginDate').d('登陆时间'),
    },
    {
      name: 'loginIp',
      type: 'string',
      label: intl.get('hpfm.online.model.online.loginIp').d('登录地址'),
    },
    {
      name: 'phone',
      type: 'string',
      label: intl.get('hpfm.online.model.online.phone').d('电话'),
    },
    {
      name: 'email',
      type: 'string',
      label: intl.get('hpfm.online.model.online.email').d('邮箱'),
    },
  ],
  transport: {
    read: (config) => {
      const { data } = config;
      const { tenantId } = data;
      return {
        ...config,
        method: 'post',
        url: `${HZERO_PLATFORM}/v1${isTenantRoleLevel() ? `/${organizationId}/` : `/`}online-users`,
        params: {
          tenantId: tenantId && tenantId.tenantId,
        },
        data: {
          ...data,
          includeFlag: data?.includeFlag === '1',
          tenantId: tenantId && tenantId.tenantId,
        },
      };
    },
  },
});

export { listDS };
