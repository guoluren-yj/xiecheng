import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/fieldMappingLang';
import { TRANSFORM_TYPE, TRANSFORM_STATUS, TENANT } from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = () => ({
  autoQuery: true,
  pageSize: 10,
  selection: false,
  primaryKey: 'transformId',
  queryFields: [
    !isTenantRoleLevel() && {
      name: 'tenantLov',
      label: getLang('TENANT'),
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
      name: 'transformCode',
      label: getLang('TRANSFORM_CODE'),
      type: 'string',
    },
    {
      name: 'transformName',
      label: getLang('TRANSFORM_NAME'),
      type: 'string',
    },
    {
      name: 'transformType',
      label: getLang('TRANSFORM_TYPE'),
      type: 'string',
      lookupCode: TRANSFORM_TYPE,
    },
    {
      name: 'statusCode',
      label: getLang('STATUS'),
      type: 'string',
      lookupCode: TRANSFORM_STATUS,
    },
  ],
  fields: [
    {
      name: 'tenantName',
      label: getLang('TENANT'),
      type: 'string',
    },
    {
      name: 'transformCode',
      label: getLang('TRANSFORM_CODE'),
      type: 'string',
      help: getLang('TRANSFORM_CODE_HELP'),
    },
    {
      name: 'transformName',
      label: getLang('TRANSFORM_NAME'),
      type: 'string',
      help: getLang('TRANSFORM_NAME_HELP'),
    },
    {
      name: 'transformType',
      label: getLang('TRANSFORM_TYPE'),
      type: 'string',
      lookupCode: TRANSFORM_TYPE,
    },
    {
      name: 'versionDesc',
      label: getLang('VERSION'),
      type: 'string',
    },
    {
      name: 'fromVersionDesc',
      label: getLang('FROM_VERSION'),
      type: 'string',
    },
    {
      name: 'statusCode',
      label: getLang('STATUS'),
      type: 'string',
      lookupCode: TRANSFORM_STATUS,
    },
  ],
  transport: {
    read: (config) => {
      const { data, params } = config;
      return {
        url: `${HZERO_HITF}/v1${level}/transforms`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${HZERO_HITF}/v1${level}/transforms`,
        method: 'DELETE',
        data: data[0],
      };
    },
    update: ({ data }) => {
      const { _requestType, transformId } = data[0];
      return {
        url: `${HZERO_HITF}/v1${level}/transforms/${transformId}/${_requestType}`,
        method: 'POST',
        data: data[0],
      };
    },
  },
});

const historyTableDS = () => ({
  autoQuery: false,
  pageSize: 10,
  selection: false,
  primaryKey: 'transformHistoryId',
  fields: [
    {
      name: 'transformCode',
      label: getLang('TRANSFORM_CODE'),
      type: 'string',
    },
    {
      name: 'transformName',
      label: getLang('TRANSFORM_NAME'),
      type: 'string',
    },
    {
      name: 'transformType',
      label: getLang('TRANSFORM_TYPE'),
      type: 'string',
      lookupCode: TRANSFORM_TYPE,
    },
    {
      name: 'versionDesc',
      label: getLang('VERSION'),
      type: 'string',
    },
    {
      name: 'fromVersionDesc',
      label: getLang('FROM_VERSION'),
      type: 'string',
    },
  ],
  transport: {
    read: (config) => {
      const { data } = config;
      const { transformId } = data;
      return {
        url: `${HZERO_HITF}/v1${level}/transforms/${transformId}/former-version`,
        method: 'GET',
      };
    },
  },
});

const formDS = (props) => {
  const { _required = true, onFieldUpdate = () => {} } = props;
  return {
    primaryKey: 'transformId',
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
        required: !isTenantRoleLevel(),
        valueField: 'tenantId',
        textField: 'tenantName',
      },
      !isTenantRoleLevel() && {
        name: 'tenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      !isTenantRoleLevel() && {
        name: 'tenantName',
        type: 'string',
        bind: 'tenantLov.tenantName',
      },
      {
        name: 'transformCode',
        label: getLang('TRANSFORM_CODE'),
        type: 'string',
        required: _required,
      },
      {
        name: 'transformName',
        label: getLang('TRANSFORM_NAME'),
        type: 'string',
        required: _required,
      },
      {
        name: 'transformType',
        label: getLang('TRANSFORM_TYPE'),
        type: 'string',
        required: true,
        lookupCode: TRANSFORM_TYPE,
      },
      {
        name: 'statusCode',
        label: getLang('STATUS'),
        type: 'string',
        lookupCode: TRANSFORM_STATUS,
        defaultValue: 'NEW',
      },
      {
        name: 'version',
        type: 'number',
        defaultValue: 1,
      },
      {
        name: 'versionDesc',
        label: getLang('VERSION'),
        type: 'string',
      },
      {
        name: 'transformScript',
        label: getLang('TRANSFORM_SCRIPT'),
        type: 'string',
      },
      {
        name: 'sourceStructure',
        label: getLang('SOURCE_STRUCTURE'),
        type: 'string',
      },
      {
        name: 'targetStructure',
        label: getLang('TARGET_STRUCTURE'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryType, ...otherData } = data;
        const { transformId, _historyFlag, version } = otherData;
        let url = `${HZERO_HITF}/v1${level}/transforms/${transformId}`;
        if (queryType === 'FWZC') {
          url = `${HZERO_HITF}/v1${level}/transforms/interface-linked/load`;
        } else if (queryType === 'YYLXDY') {
          url = `${HZERO_HITF}/v1${level}/transforms/composite-linked/load`;
        }
        return {
          url: !_historyFlag
            ? url
            : `${HZERO_HITF}/v1${level}/transforms/${transformId}/former-version/${version}`,
          data: {
            ...otherData,
          },
          method: 'GET',
        };
      },
      create: ({ data }) => {
        const { queryType, ...otherData } = data[0];
        let url = `${HZERO_HITF}/v1${level}/transforms`;
        if (queryType === 'YYLXDY') {
          url = `${HZERO_HITF}/v1${level}/application-insts/transform`;
        }
        return {
          url,
          data: otherData,
          method: 'POST',
        };
      },
      update: ({ data }) => {
        const { queryType, ...otherData } = data[0];
        const { _historyFlag, transformId, version } = otherData;
        let url = `${HZERO_HITF}/v1${level}/transforms`;
        if (queryType === 'YYLXDY') {
          url = `${HZERO_HITF}/v1${level}/application-insts/transform`;
        }
        return _historyFlag
          ? {
              url: `${HZERO_HITF}/v1${level}/transforms/${transformId}/former-version/override/${version}`,
              data: null,
              method: 'POST',
            }
          : {
              url,
              data: otherData,
              method: 'POST',
            };
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.current.setState('version', dataSet.current.get('version'));
      },
      update: onFieldUpdate,
    },
  };
};

export { tableDS, historyTableDS, formDS };
