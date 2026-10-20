import { HZERO_HITF, HZERO_IAM, VERSION_IS_OP } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import getLang from '@/langs/clientRoleLang';
import { TENANT, HIAM_ROLE_SOURCE, HIAM_RESOURCE_LEVEL, SOURCE } from '@/constants/CodeConstants';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const tableDS = (props) => {
  const {
    onLoad = () => {},
    onSelect = () => {},
    onUnselect = () => {},
    onSelectAll = () => {},
    onUnSelectAll = () => {},
  } = props;
  return {
    primaryKey: 'id',
    autoQuery: true,
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
        name: 'name',
        label: getLang('NAME'),
        type: 'string',
      },
      !VERSION_IS_OP &&
        !isTenantRoleLevel() && {
          name: 'level',
          label: getLang('LEVEL'),
          type: 'string',
          lookupCode: HIAM_RESOURCE_LEVEL,
        },
      !VERSION_IS_OP &&
        !isTenantRoleLevel() && {
          name: 'roleSource',
          label: getLang('ROLE_SOURCE'),
          type: 'string',
          lookupCode: HIAM_ROLE_SOURCE,
        },
    ],
    fields: [
      {
        name: 'tenantName',
        label: getLang('BELONG_TENANT'),
        type: 'string',
      },
      {
        name: 'name',
        label: getLang('NAME'),
        type: 'string',
      },
      {
        name: 'code',
        label: getLang('CODE'),
        type: 'string',
      },
      {
        name: 'level',
        label: getLang('LEVEL'),
        type: 'string',
        lookupCode: HIAM_RESOURCE_LEVEL,
      },
      {
        name: 'parentRoleName',
        label: getLang('TOP_ROLE'),
        type: 'string',
      },
      {
        name: 'roleSource',
        label: getLang('ROLE_SOURCE'),
        type: 'string',
        lookupCode: HIAM_ROLE_SOURCE,
      },
      {
        name: 'inheritedRoleName',
        label: getLang('BELONG'),
        type: 'string',
      },
      {
        name: 'enabled',
        label: getLang('STATUS'),
        type: 'boolean',
      },
      {
        name: 'levelPath',
        label: getLang('LEVEL_PATH'),
        type: 'string',
      },
    ],
    transport: {
      read: ({ params, data }) => {
        return {
          url: `${HZERO_IAM}/hzero/v1/roles/self/manageable-roles`,
          method: 'GET',
          params: {
            tenantId: isTenantRoleLevel() ? organizationId : undefined,
            ...params,
            ...data,
            enabled: true,
          },
        };
      },
    },
    events: {
      load: onLoad,
      select: onSelect,
      unSelect: onUnselect,
      selectAll: onSelectAll,
      unSelectAll: onUnSelectAll,
    },
  };
};

const copyAuthDS = (props) => {
  const { roleId } = props;
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'code',
        label: getLang('CODE'),
        type: 'string',
      },
      {
        name: 'name',
        label: getLang('NAME'),
        type: 'string',
      },
      {
        name: 'description',
        label: getLang('EXPLAIN'),
        type: 'string',
      },
    ],
    transport: {
      create: ({ data }) => {
        const { submittedData } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/client-roles/copy/${roleId}`,
          method: 'POST',
          data: submittedData,
        };
      },
    },
  };
};

const roleFormDS = (props) => {
  const { roleId } = props;
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'code',
        label: getLang('CODE'),
        type: 'string',
      },
      {
        name: 'name',
        label: getLang('NAME'),
        type: 'string',
      },
      {
        name: 'description',
        label: getLang('EXPLAIN'),
        type: 'string',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IAM}/hzero/v1${level}/roles/${roleId}`,
          method: 'GET',
        };
      },
    },
  };
};

const authTableDS = (props) => {
  const {
    roleId,
    onSelect = () => {},
    onUnselect = () => {},
    onSelectAll = () => {},
    onUnSelectAll = () => {},
  } = props;
  return {
    autoQuery: true,
    pageSize: 10,
    queryFields: [
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
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
        name: 'interfaceName',
        label: getLang('CODE_OR_NAME'),
        type: 'string',
        placeholder: getLang('SEARCH_NAME'),
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
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/client-roles/${roleId}`,
          method: 'GET',
        };
      },
      destroy: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/client-roles/${roleId}/recycle`,
          method: 'POST',
        };
      },
    },
    events: {
      select: onSelect,
      unSelect: onUnselect,
      selectAll: onSelectAll,
      unSelectAll: onUnSelectAll,
    },
  };
};

const interfaceTableDS = (props) => {
  const { roleId } = props;
  return {
    autoQuery: true,
    pageSize: 10,
    queryParameter: {
      tenantId: organizationId,
    },
    queryFields: [
      !isTenantRoleLevel() && {
        name: 'tenantLov',
        label: getLang('BELONG_TENANT'),
        type: 'object',
        lovCode: TENANT,
        ignore: 'always',
      },
      {
        name: 'queryTenantId',
        type: 'string',
        bind: 'tenantLov.tenantId',
      },
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
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
    ],
    fields: [
      isTenantRoleLevel() && {
        name: 'sourceType',
        label: getLang('SOURCE_TYPE'),
        type: 'string',
        lookupCode: SOURCE,
      },
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
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/client-roles/${roleId}/authorizable`,
          method: 'GET',
        };
      },
      update: ({ data }) => {
        const { submittedData } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/client-roles/${roleId}`,
          method: 'POST',
          data: submittedData,
        };
      },
    },
  };
};

export { tableDS, copyAuthDS, roleFormDS, authTableDS, interfaceTableDS };
