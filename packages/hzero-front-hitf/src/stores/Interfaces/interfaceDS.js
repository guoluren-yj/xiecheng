import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentTenant,
} from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/interfacesLang';
import {
  TENANT,
  SERVICE_TYPE,
  YES_OR_NO_FLAG,
  AUTH_LEVEL,
  AUTH_TYPE,
  SELF_TENANT_ORG,
  USER_ROLE,
  APPLICATION_CLIENT,
  SOURCE,
} from '@/constants/CodeConstants';
import QuestionPopover from '@/components/QuestionPopover';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    primaryKey: 'interfaceId',
    autoQuery: true,
    pageSize: 10,
    selection: 'multiple',
    cacheSelection: true,
    queryFields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
      },
      !isTenantRoleLevel() && {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'interfaceName',
        label: getLang('INTERFACE_NAME'),
        type: 'string',
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
        align: 'center',
      },
      {
        name: 'serverType',
        label: getLang('SERVER_TYPE'),
        type: 'string',
        lookupCode: SERVICE_TYPE,
        align: 'center',
      },
      isTenantRoleLevel() && {
        name: 'tenantAuthFlag',
        label: getLang('AUTH_TENANT'),
        type: 'string',
        lookupCode: YES_OR_NO_FLAG,
        align: 'center',
      },
      isTenantRoleLevel() && {
        name: 'authFlag',
        label: getLang('AUTH_ROLE'),
        type: 'string',
        lookupCode: YES_OR_NO_FLAG,
        align: 'center',
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
      },
      {
        name: 'interfaceContextDigest',
        label: (
          <QuestionPopover
            text={getLang('INTERFACE_CONTEXT_DIGEST')}
            message={getLang('INTERFACE_CONTEXT_DIGEST_TIP')}
          />
        ),
        type: 'string',
      },
    ],
    fields: [
      {
        name: 'tenantName',
        label: getLang('BELONG_TENANT'),
        type: 'string',
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
      },
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
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
      {
        name: 'serverType',
        label: getLang('SERVER_TYPE'),
        type: 'string',
        align: 'center',
        lookupCode: SERVICE_TYPE,
      },
      {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
      {
        name: 'isPublicFlag',
        label: getLang('IS_PUBLIC_FLAG'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'tenantAuth',
        label: (
          <QuestionPopover text={getLang('AUTH_TENANT')} message={getLang('AUTH_TENANT_TIP')} />
        ),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'roleAuth',
        label: <QuestionPopover text={getLang('AUTH_ROLE')} message={getLang('AUTH_ROLE_TIP')} />,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interfaces/self`,
          method: 'GET',
          data,
        };
      },
    },
  };
};

const basicFormDS = (props = {}) => {
  const { onFieldUpdate = () => {} } = props;
  return {
    autoQuery: false,
    autoCreate: true,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'authLevel',
        label: getLang('AUTH_LEVEL'),
        type: 'string',
        required: true,
        lookupCode: AUTH_LEVEL,
      },
      {
        name: 'authLevelValue',
      },
      {
        name: 'authLevelValueMeaning',
      },
      {
        name: 'authLevelValueTenantLov',
        label: getLang('AUTH_LEVEL_VALUE'),
        type: 'object',
        ignore: 'always',
        lovCode: isTenantRoleLevel() ? SELF_TENANT_ORG : TENANT,
        valueField: 'tenantId',
        textField: 'tenantName',
        lovPara: {
          tenantNum: isTenantRoleLevel() ? getCurrentTenant().tenantNum : null,
        },
        dynamicProps: {
          required: ({ record }) => record.get('authLevel') === 'TENANT',
        },
      },
      {
        name: 'authLevelValueTenant',
        bind: 'authLevelValueTenantLov.tenantId',
      },
      {
        name: 'authLevelValueMeaningTenant',
        bind: 'authLevelValueTenantLov.tenantName',
      },
      {
        name: 'authLevelValueRoleLov',
        label: getLang('AUTH_LEVEL_VALUE'),
        type: 'object',
        ignore: 'always',
        lovCode: USER_ROLE,
        valueField: 'id',
        textField: 'name',
        lovPara: {
          tenantId: isTenantRoleLevel() ? organizationId : null,
        },
        dynamicProps: {
          required: ({ record }) => record.get('authLevel') === 'ROLE',
        },
      },
      {
        name: 'authLevelValueRole',
        bind: 'authLevelValueRoleLov.id',
      },
      {
        name: 'authLevelValueMeaningRole',
        bind: 'authLevelValueRoleLov.name',
      },
      {
        name: 'roleId',
        bind: 'authLevelValueRoleLov.id',
      },
      {
        name: 'authLevelValueClientLov',
        label: getLang('AUTH_LEVEL_VALUE'),
        type: 'object',
        ignore: 'always',
        lovCode: APPLICATION_CLIENT,
        valueField: 'clientName',
        textField: 'clientName',
        lovPara: {
          tenantId: isTenantRoleLevel() ? organizationId : null,
        },
        dynamicProps: {
          required: ({ record }) => record.get('authLevel') === 'CLIENT',
        },
      },
      {
        name: 'authLevelValueClient',
        bind: 'authLevelValueClientLov.clientName',
      },
      {
        name: 'authLevelValueMeaningClient',
        bind: 'authLevelValueClientLov.clientName',
      },
      {
        name: 'authType',
        label: getLang('AUTH_TYPE'),
        type: 'string',
        align: 'center',
        required: true,
        lookupCode: AUTH_TYPE,
        defaultValue: 'NONE',
      },
      {
        name: 'remark',
        label: getLang('REMARK'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { interfaceId, interfaceAuthId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/${interfaceId}/auth/${interfaceAuthId}`,
          method: 'GET',
          data: null,
        };
      },
    },
    events: {
      update: onFieldUpdate,
    },
  };
};

export { tableDS, basicFormDS };
