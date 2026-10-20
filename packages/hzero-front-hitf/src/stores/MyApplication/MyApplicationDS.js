import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { APPLY_STATUS, SOURCE, TENANT } from '@/constants/CodeConstants';
import { APPROVAL_STATUS_CONSTANTS } from '@/constants/constants';
import getLang from '@/langs/myApplicationLang';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => {
  return {
    autoQuery: true,
    selection: false,
    autoQueryAfterSubmit: true,
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
    fields: [
      {
        name: 'applyCode',
        label: getLang('APPLY_CODE'),
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
    ],
    transport: {
      read: () => ({
        url: `${HZERO_HITF}/v1${level}/perm-applys`,
        method: 'GET',
      }),
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/perm-applys/recall`,
          method: 'POST',
          data: data[0],
        };
      },
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
        label: getLang('TENANT'),
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

const basicFormDS = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: true,
    fields: [
      {
        name: 'statusCode',
        label: getLang('APPROVAL_STATUS'),
        type: 'string',
        lookupCode: APPLY_STATUS,
        defaultValue: APPROVAL_STATUS_CONSTANTS.NEW,
      },
      {
        name: 'applyReason',
        label: getLang('APPLY_REASON'),
        type: 'string',
        required: true,
      },
    ],
    transport: {
      read: ({ data }) => {
        const { applyId } = data;
        return {
          url: `${HZERO_HITF}/v1${level}/perm-applys/${applyId}`,
          method: 'GET',
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/perm-applys/submit`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/perm-applys/submit`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

const interfaceTableDS = (props) => {
  const { onLoad, onUnSelect } = props;
  return {
    autoQuery: true,
    selection: 'multiple',
    primaryKey: 'interfaceId',
    cacheSelection: true,
    pageSize: 10,
    queryFields: [
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
    ],
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
        align: 'center',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/perm-applys/available-interface`,
          method: 'GET',
        };
      },
    },
    events: {
      load: onLoad,
      unSelect: onUnSelect,
    },
  };
};

export { tableDS, expandedTableDS, basicFormDS, interfaceTableDS };
