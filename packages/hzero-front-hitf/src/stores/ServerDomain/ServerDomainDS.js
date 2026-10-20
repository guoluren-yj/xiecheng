import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentUser,
} from 'hzero-front/lib/utils/utils';
import { SERVER_DOMAIN_LIST, TENANT, ENABLED_FLAG } from '@/constants/CodeConstants';
import getLang from '@/langs/serverDomainLang';

const organizationId = getCurrentOrganizationId();
const levelUrl = isTenantRoleLevel() ? `/${organizationId}` : '';
const { tenantId, tenantName } = getCurrentUser();
const organizationRoleLevel = isTenantRoleLevel();

const commonFields = () => [
  {
    name: 'tenantNameLov',
    label: getLang('TENANT'),
    lovCode: TENANT,
    type: 'object',
    ignore: 'always',
    textField: 'tenantName',
    valueField: 'tenantId',
    required: !organizationRoleLevel,
  },
  {
    name: 'tenantName',
    label: getLang('TENANT'),
    bind: 'tenantNameLov.tenantName',
    type: 'string',
    defaultValue: organizationRoleLevel ? tenantName : undefined,
  },
  {
    name: 'tenantId',
    bind: 'tenantNameLov.tenantId',
    type: 'string',
    required: !organizationRoleLevel,
    defaultValue: organizationRoleLevel ? tenantId : undefined,
  },
  {
    name: 'domainCode',
    label: getLang('DOMAIN_CODE'),
    type: 'string',
    required: true,
    format: 'uppercase',
  },
  {
    name: 'nameLevelPaths',
    label: getLang('NAME_LEVEL_PATHS'),
    type: 'list',
  },
  {
    name: 'serverDomainParentLov',
    label: getLang('SERVER_DOMAIN_PARENT'),
    lovCode: SERVER_DOMAIN_LIST,
    type: 'object',
    lovPara: { tenantId },
    textField: 'domainName',
    valueField: 'domainId',
    ignore: 'always',
  },
  {
    name: 'parentDomainId',
    bind: 'serverDomainParentLov.domainId',
    type: 'string',
  },
  {
    name: 'parentDomainName',
    bind: 'serverDomainParentLov.domainName',
    type: 'string',
  },
  {
    name: 'source',
    type: 'string',
    label: getLang('SOURCE'),
  },
];

const serverDomainQueryFields = () => [
  {
    name: 'domainName',
    label: getLang('DOMAIN_NAME'),
    type: 'string',
  },
  {
    name: 'domainCode',
    label: getLang('DOMAIN_CODE'),
    type: 'string',
  },
  {
    name: 'enabledFlag',
    label: getLang('STATES'),
    type: 'string',
    lookupCode: ENABLED_FLAG,
    defaultValue: '1',
  },
];

const serverDomainTreeDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/server-domains/tree`,
        method: 'GET',
        params: { ...data, ...params },
      };
    },
    update: ({ data }) => {
      const updateData = data.find((item) => item._requestType);
      const { _requestType } = updateData;
      const path = _requestType === 'enable' ? 'toggle-enable' : 'toggle-disable';
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/server-domains/${path}`,
        method: 'PUT',
        data: updateData,
      };
    },
    destroy: ({ data }) => ({
      url: `${HZERO_HITF}/v1${levelUrl}/server-domains/`,
      method: 'DELETE',
      data: data[0],
    }),
  },
  primaryKey: 'domainId',
  autoQuery: true,
  paging: false,
  parentField: 'parentDomainId',
  idField: 'domainId',
  selection: false,
  fields: [
    ...commonFields(),
    {
      name: 'enabledFlag',
      label: getLang('STATES'),
      type: 'boolean',
    },
    {
      name: 'domainName',
      label: getLang('DOMAIN_NAME'),
      type: 'string',
      required: true,
    },
  ],
  queryFields: serverDomainQueryFields(),
  expandField: 'expand',
});

const domainFormDS = () => ({
  transport: {
    read: ({ data }) => {
      const { domainId } = data;
      return {
        method: 'GET',
        url: `${HZERO_HITF}/v1${levelUrl}/server-domains/${domainId}`,
      };
    },
    update: ({ data }) => {
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/server-domains`,
        method: 'PUT',
        data: data[0],
      };
    },
    create: ({ data }) => {
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/server-domains`,
        method: 'POST',
        data,
      };
    },
  },
  autoQuery: false,
  selection: false,
  fields: [
    ...commonFields(),
    {
      name: 'enabledFlag',
      label: getLang('ENABLE'),
      type: 'boolean',
      required: true,
    },
    {
      name: 'domainName',
      label: getLang('DOMAIN_NAME'),
      type: 'intl',
      required: true,
    },
  ],
});

const serverDomainListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/server-domains`,
        method: 'GET',
        params: { ...data, ...params },
      };
    },
    update: ({ data }) => {
      const { _requestType } = data[0];
      const path = _requestType === 'enable' ? 'toggle-enable' : 'toggle-disable';
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/server-domains/${path}`,
        method: 'PUT',
        data: data[0],
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${HZERO_HITF}/v1${levelUrl}/server-domains`,
        method: 'DELETE',
        data: data[0],
      };
    },
  },
  primaryKey: 'domainId',
  autoQuery: true,
  paging: true,
  pageSize: 10,
  selection: false,
  fields: [
    ...commonFields(),
    {
      name: 'enabledFlag',
      label: getLang('STATES'),
      type: 'boolean',
    },
    {
      name: 'domainName',
      label: getLang('DOMAIN_NAME'),
      type: 'string',
      required: true,
    },
  ],
  queryFields: serverDomainQueryFields(),
});
export { serverDomainTreeDS, serverDomainListDS, domainFormDS };
