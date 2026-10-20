import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { APPLY_STATUS, SOURCE, TENANT } from '@/constants/CodeConstants';
import getLang from '@/langs/approvalLang';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const commonFields = () => [
  {
    name: 'applyCode',
    label: getLang('APPLY_CODE'),
    type: 'string',
  },
  {
    name: 'tenantName',
    label: getLang('BELONG_TENANT'),
    type: 'string',
  },
  {
    name: 'submitter',
    label: getLang('APPLICANT'),
    type: 'string',
  },
  {
    name: 'applyReason',
    label: getLang('APPLY_REASON'),
    type: 'string',
  },
  {
    name: 'submittedTime',
    label: getLang('SUBMITTED_TIME'),
    type: 'dateTime',
  },
  {
    name: 'approvalTime',
    label: getLang('APPROVAL_TIME'),
    type: 'dateTime',
  },
  {
    name: 'statusCode',
    label: getLang('APPROVAL_STATUS'),
    type: 'string',
    lookupCode: APPLY_STATUS,
  },
  {
    name: 'approvalReason',
    label: getLang('APPROVAL_REASON'),
    type: 'string',
  },
];

// 代办
const todoTableDS = () => {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    queryFields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'applyCode',
        label: getLang('APPLY_CODE'),
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
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
      {
        name: 'submittedTimeFrom',
        label: getLang('SUBMITTED_TIME_FROM'),
        type: 'dateTime',
        dynamicProps: {
          max: ({ record }) => record?.get('submittedTimeTo'),
        },
      },
      {
        name: 'submittedTimeTo',
        label: getLang('SUBMITTED_TIME_TO'),
        type: 'dateTime',
        dynamicProps: {
          min: ({ record }) => record?.get('submittedTimeFrom'),
        },
      },
    ],
    fields: commonFields(),
    transport: {
      read: () => ({
        url: `${HZERO_HITF}/v1${level}/perm-applys/todo`,
        method: 'GET',
      }),
    },
  };
};

// 已办
const approvalTableDS = () => {
  return {
    autoQuery: true,
    selection: false,
    pageSize: 10,
    queryFields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'applyCode',
        label: getLang('APPLY_CODE'),
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
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
      {
        name: 'statusCode',
        label: getLang('APPROVAL_STATUS'),
        type: 'string',
        lookupCode: APPLY_STATUS,
      },
      {
        name: 'submittedTimeFrom',
        label: getLang('SUBMITTED_TIME_FROM'),
        type: 'dateTime',
        dynamicProps: {
          max: ({ record }) => record?.get('submittedTimeTo'),
        },
      },
      {
        name: 'submittedTimeTo',
        label: getLang('SUBMITTED_TIME_TO'),
        type: 'dateTime',
        dynamicProps: {
          min: ({ record }) => record?.get('submittedTimeFrom'),
        },
      },
    ],
    fields: commonFields(),
    transport: {
      read: () => ({
        url: `${HZERO_HITF}/v1${level}/perm-applys/approval`,
        method: 'GET',
      }),
    },
  };
};

const expandedTableDS = (props) => {
  const { initialData = [] } = props;
  return {
    data: initialData,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'tenantName',
        label: getLang('BELONG_TENANT'),
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
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
      },
      {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
    ],
  };
};

const approvalFormDS = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: false,
    fields: [
      {
        name: 'approvalReason',
        label: getLang('APPROVAL_REASON'),
        type: 'string',
        required: true,
      },
    ],
    transport: {
      create: ({ data }) => {
        const { _requestType } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/perm-applys/${_requestType}`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

export { todoTableDS, approvalTableDS, expandedTableDS, approvalFormDS };
