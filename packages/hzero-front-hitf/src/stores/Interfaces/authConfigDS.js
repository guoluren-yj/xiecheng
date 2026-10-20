import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentTenant,
} from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/interfacesLang';
import {
  AUTH_LEVEL,
  AUTH_TYPE,
  TENANT,
  SELF_TENANT_ORG,
  USER_ROLE,
  APPLICATION_CLIENT,
} from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    primaryKey: 'interfaceAuthId',
    autoQuery: false,
    pageSize: 10,
    selection: 'multiple',
    cacheSelection: true,
    queryFields: [
      {
        name: 'authLevel',
        label: getLang('AUTH_LEVEL'),
        type: 'string',
        lookupCode: AUTH_LEVEL,
      },
      {
        name: 'authLevelValueClientLov',
        label: getLang('AUTH_LEVEL_CLIENT'),
        type: 'object',
        ignore: 'always',
        lovCode: APPLICATION_CLIENT,
        valueField: 'clientName',
        textField: 'clientName',
        lovPara: {
          tenantId: isTenantRoleLevel() ? organizationId : null,
        },
        dynamicProps: {
          disabled: ({ record }) => record.get('authLevel') !== 'CLIENT',
        },
      },
      {
        name: 'authLevelClientName',
        type: 'string',
        bind: 'authLevelValueClientLov.clientName',
        ignore: 'always',
        dynamicProps: {
          ignore: ({ record }) => {
            if (record.get('authLevel') !== 'CLIENT') {
              return 'always';
            } else {
              return 'never';
            }
          },
        },
      },
      {
        name: 'authLevelValueTenantLov',
        label: getLang('AUTH_LEVEL_TENANT'),
        type: 'object',
        ignore: 'always',
        lovCode: isTenantRoleLevel() ? SELF_TENANT_ORG : TENANT,
        valueField: 'tenantId',
        textField: 'tenantName',
        lovPara: {
          tenantNum: isTenantRoleLevel() ? getCurrentTenant().tenantNum : null,
        },
        dynamicProps: {
          disabled: ({ record }) => record.get('authLevel') !== 'TENANT',
        },
      },
      {
        name: 'authLevelTenantId',
        type: 'string',
        bind: 'authLevelValueTenantLov.tenantId',
        ignore: 'always',
        dynamicProps: {
          ignore: ({ record }) => {
            if (record.get('authLevel') !== 'TENANT') {
              return 'always';
            } else {
              return 'never';
            }
          },
        },
      },
      {
        name: 'authLevelValueRoleLov',
        label: getLang('AUTH_LEVEL_ROLE'),
        type: 'object',
        ignore: 'always',
        lovCode: USER_ROLE,
        valueField: 'id',
        textField: 'name',
        lovPara: {
          tenantId: isTenantRoleLevel() ? organizationId : null,
        },
        dynamicProps: {
          disabled: ({ record }) => record.get('authLevel') !== 'ROLE',
        },
      },
      {
        name: 'authLevelRoleId',
        type: 'string',
        bind: 'authLevelValueRoleLov.id',
        ignore: 'always',
        dynamicProps: {
          ignore: ({ record }) => {
            if (record.get('authLevel') !== 'ROLE') {
              return 'always';
            } else {
              return 'never';
            }
          },
        },
      },
    ],
    fields: [
      {
        name: 'authLevel',
        label: getLang('AUTH_LEVEL'),
        type: 'string',
        width: 100,
        lookupCode: AUTH_LEVEL,
        align: 'center',
      },
      {
        name: 'authLevelValue',
        label: getLang('AUTH_LEVEL_VALUE'),
        type: 'string',
        width: 180,
      },
      {
        name: 'authLevelValueMeaning',
        label: getLang('AUTH_LEVEL_VALUE'),
        type: 'string',
        width: 180,
      },
      {
        name: 'authType',
        label: getLang('AUTH_TYPE'),
        type: 'string',
        width: 150,
        lookupCode: AUTH_TYPE,
        align: 'center',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { interfaceId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/${interfaceId}/auth/self`,
          method: 'GET',
          data,
        };
      },
      destroy: ({ data }) => {
        const { interfaceId } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/${interfaceId}/auth/batch-delete`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};
const basicFormDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { interfaceId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/interfaces/${interfaceId}`,
          method: 'GET',
          data: null,
        };
      },
    },
  };
};

export { tableDS, basicFormDS };
