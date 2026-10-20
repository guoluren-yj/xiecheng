import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/fieldMappingLang';
import { TRANSFORM_TYPE, TRANSFORM_STATUS, TENANT } from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const formDS = (props) => {
  const { sourceFunc, onFieldUpdate = () => {} } = props;
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
      read: () => {
        let url;
        if (sourceFunc === 'services') {
          url = `${HZERO_HITF}/v1${level}/transforms/interface-linked/load`;
        } else if (sourceFunc === 'typeDefinition') {
          url = `${HZERO_HITF}/v1${level}/transforms/composite-linked/load`;
        }
        return {
          url,
          method: 'GET',
        };
      },
      create: ({ data }) => {
        let url;
        if (sourceFunc === 'services') {
          url = `${HZERO_HITF}/v1${level}/transforms`;
        } else if (sourceFunc === 'typeDefinition') {
          url = `${HZERO_HITF}/v1${level}/application-insts/transform`;
        }
        return {
          url,
          data: data[0],
          method: 'POST',
        };
      },
      update: ({ data }) => {
        let url;
        if (sourceFunc === 'services') {
          url = `${HZERO_HITF}/v1${level}/transforms`;
        } else if (sourceFunc === 'typeDefinition') {
          url = `${HZERO_HITF}/v1${level}/application-insts/transform`;
        }
        return {
          url,
          data: data[0],
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

const enableDS = (props) => {
  const { sourceFunc } = props;
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    transport: {
      create: ({ data }) => {
        let url;
        if (sourceFunc === 'services') {
          const { transformId } = data[0];
          url = `${HZERO_HITF}/v1${level}/transforms/${transformId}/enable`;
        } else if (sourceFunc === 'typeDefinition') {
          url = `${HZERO_HITF}/v1${level}/application-insts/transform/publish`;
        }
        return {
          url,
          data: data[0],
          method: sourceFunc === 'typeDefinition' ? 'POST' : 'PUT',
        };
      },
    },
  };
};

const disableDS = (props) => {
  const { sourceFunc } = props;
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    transport: {
      create: ({ data }) => {
        let url;
        if (sourceFunc === 'services') {
          const { transformId } = data[0];
          url = `${HZERO_HITF}/v1${level}/transforms/${transformId}/disable`;
        } else if (sourceFunc === 'typeDefinition') {
          url = `${HZERO_HITF}/v1${level}/application-insts/transform/offline`;
        }
        return {
          url,
          data: data[0],
          method: sourceFunc === 'typeDefinition' ? 'POST' : 'PUT',
        };
      },
    },
  };
};

export { formDS, enableDS, disableDS };
