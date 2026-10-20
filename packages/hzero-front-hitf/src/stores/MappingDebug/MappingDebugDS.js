import getLang from '@/langs/mappingDebugLang';
import {
  TENANT,
  INVOKE_ABLE_INTERFACE,
  PACKET_MAPPING_LEVEL,
  TRANSFORM_TYPE,
  TRANSFORM_STATUS,
  CAST_TYPE,
} from '@/constants/CodeConstants';
import { TRANSFORM_TYPE as TRANSFORM_TYPE_CONS } from '@/constants/constants';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

const headerFormDS = (props = {}) => {
  const { _required = true, onFieldUpdate = () => {} } = props;
  return {
    primaryKey: 'castHeaderId',
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'tenantId',
        label: getLang('TENANT'),
        type: 'string',
        required: !isTenantRoleLevel(),
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'tenantLov',
        label: getLang('TENANT'),
        type: 'object',
        ignore: 'always',
        required: !isTenantRoleLevel(),
        lovCode: TENANT,
      },
      {
        name: 'tenantNum',
        label: getLang('TENANT'),
        type: 'string',
        required: !isTenantRoleLevel(),
        bind: 'tenantLov.tenantNum',
      },
      {
        name: 'invokeAbleInterface',
        label: getLang('INVOKE_ABLE_INTERFACE'),
        type: 'object',
        ignore: 'always',
        required: _required,
        lovCode: INVOKE_ABLE_INTERFACE,
        dynamicProps: ({ record }) => ({
          lovPara: record.get('tenantId')
            ? {
                tenantId: record.get('tenantId'),
              }
            : {},
        }),
      },
      {
        name: 'namespace',
        label: getLang('NAMESPACE'),
        type: 'string',
        bind: 'invokeAbleInterface.namespace',
        readOnly: true,
      },
      {
        name: 'serverCode',
        label: getLang('SERVER_CODE'),
        type: 'string',
        bind: 'invokeAbleInterface.serverCode',
        readOnly: true,
      },
      {
        name: 'interfaceCode',
        label: getLang('INTERFACE_CODE'),
        type: 'string',
        bind: 'invokeAbleInterface.interfaceCode',
        readOnly: true,
      },
      {
        name: 'interfaceUrl',
        label: getLang('INTERFACE_URL'),
        type: 'string',
        bind: 'invokeAbleInterface.interfaceUrl',
        readOnly: true,
      },
      {
        name: 'level',
        label: getLang('MAPPING_TARGET'),
        type: 'string',
        required: _required,
        lookupCode: PACKET_MAPPING_LEVEL,
      },
      {
        name: 'dataType',
        label: getLang('MAPPING_TYPE'),
        type: 'string',
        required: _required,
        lookupCode: TRANSFORM_TYPE,
        defaultValue: TRANSFORM_TYPE_CONS.REST_TO_REST,
      },
    ],
    events: {
      update: onFieldUpdate,
    },
  };
};

const dataConfigDS = () => {
  return {
    autoQuery: false,
    pageSize: 10,
    selection: false,
    primaryKey: 'castLineId',
    fields: [
      {
        name: 'castRoot',
        label: getLang('CAST_ROOT'),
        type: 'string',
      },
      {
        name: 'castField',
        label: getLang('CAST_FIELD'),
        type: 'string',
      },
      {
        name: 'castType',
        label: getLang('CAST_TYPE'),
        type: 'string',
        lookupCode: CAST_TYPE,
      },
      {
        name: 'castExpr',
        label: getLang('CAST_FORMULA'),
        type: 'string',
      },
      {
        name: 'castVal',
        label: getLang('CAST_VAL'),
        type: 'string',
      },
    ],
  };
};

const fieldConfigDS = (props) => {
  const { _required = true } = props;
  return {
    primaryKey: 'transformId',
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
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
        required: true,
      },
      {
        name: 'sourceStructure',
        label: getLang('SOURCE_STRUCTURE'),
        type: 'string',
        required: true,
      },
      {
        name: 'targetStructure',
        label: getLang('TARGET_STRUCTURE'),
        type: 'string',
        required: true,
      },
    ],
  };
};

const fieldDataDrawerDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'inputData',
        type: 'string',
        required: true,
      },
    ],
  };
};

export { headerFormDS, fieldConfigDS, fieldDataDrawerDS, dataConfigDS };
