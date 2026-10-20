import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { isArray, isString } from 'lodash';
import { CODE_UPPER } from 'hzero-front/lib/utils/regExp';
import {
  TENANT,
  SERVICE_TYPE,
  SERVICE_CATEGORY,
  SERVICE_STATUS,
  YES_OR_NO_FLAG,
  SERVER_DOMAIN_LIST,
} from '@/constants/CodeConstants';
import getLang from '@/langs/serviceLang';
import QuestionPopover from '@/components/QuestionPopover';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    autoCreate: false,
    queryFields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
        valueField: 'tenantId',
        textField: 'tenantName',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'serverCode',
        label: getLang('SERVICE_CODE'),
        type: 'string',
        format: 'uppercase',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
      {
        name: 'serviceType',
        label: getLang('SERVICE_TYPE'),
        type: 'string',
        lookupCode: SERVICE_TYPE,
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
      },
      {
        name: 'serviceCategory',
        label: getLang('SERVICE_CATEGORY'),
        type: 'string',
        lookupCode: SERVICE_CATEGORY,
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLE_FLAG'),
        type: 'string',
        lookupCode: YES_OR_NO_FLAG,
      },
      {
        name: 'serverDomainLov',
        label: getLang('DOMAIN'),
        type: 'object',
        ignore: 'always',
        valueField: 'domainId',
        textField: 'domainName',
        lovCode: SERVER_DOMAIN_LIST,
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId: isTenantRoleLevel() ? organizationId : record.get('tenantId'),
          }),
        },
      },
      {
        name: 'serverDomainId',
        type: 'string',
        bind: 'serverDomainLov.domainId',
      },
      {
        name: 'status',
        type: 'string',
        label: getLang('STATUS'),
        lookupCode: SERVICE_STATUS,
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
        type: 'string',
        label: getLang('BELONG_TENANT'),
      },
      {
        name: 'serverCode',
        label: getLang('SERVICE_CODE'),
        type: 'string',
      },
      {
        name: 'serverName',
        label: getLang('SERVER_NAME'),
        type: 'string',
      },
      {
        name: 'serviceType',
        label: getLang('SERVICE_TYPE'),
        type: 'string',
        lookupCode: SERVICE_TYPE,
      },
      {
        name: 'serviceCategory',
        label: getLang('SERVICE_CATEGORY'),
        type: 'string',
        lookupCode: SERVICE_CATEGORY,
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
      },
      {
        name: 'domainUrl',
        type: 'string',
        label: getLang('ADDRESS'),
      },
      {
        name: 'status',
        type: 'string',
        label: getLang('STATUS'),
        lookupCode: SERVICE_STATUS,
      },
      {
        name: 'nameLevelPaths',
        label: getLang('DOMAIN'),
        type: 'object',
        transformRequest: (value) => (isString(value) ? value.split('' / '') : []),
        transformResponse: (value) => (isArray(value) ? value.join('/') : ''),
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLE_FLAG'),
        type: 'number',
      },
      {
        name: 'formatVersion',
        type: 'string',
        label: getLang('CURRENT_VERSION'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-servers`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/interface-servers`,
          method: 'DELETE',
          data: data[0],
        };
      },
    },
  };
};

const cloneFormDS = (props) => {
  const { isCurrentRole, currentRecordTenantId } = props;
  let tenantId;
  if (isTenantRoleLevel()) {
    tenantId = organizationId;
  } else if (!isTenantRoleLevel() && !isCurrentRole) {
    tenantId = currentRecordTenantId;
  }
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: false,
    fields: [
      {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
        noCache: true,
        valueField: 'tenantId',
        textField: 'tenantName',
        required: !isTenantRoleLevel() && isCurrentRole,
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
        defaultValue: tenantId,
      },
      {
        name: 'tenantName',
        type: 'string',
        bind: 'tenantLov.tenantName',
      },
      {
        name: 'serverCode',
        label: getLang('SERVICE_CODE'),
        type: 'string',
        required: true,
        maxLength: 128,
        pattern: CODE_UPPER,
        defaultValidationMessages: {
          patternMismatch: getLang('CODE_UPPER'),
        },
      },
    ],
    transport: {
      create: ({ data }) => {
        const { interfaceServerId, ...otherData } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/interface-servers/clone/${interfaceServerId}`,
          method: 'POST',
          data: otherData,
        };
      },
    },
  };
};

export { tableDS, cloneFormDS };
