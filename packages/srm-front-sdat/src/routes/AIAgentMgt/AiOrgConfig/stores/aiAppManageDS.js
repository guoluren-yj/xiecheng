import intl from 'utils/intl';

const AppListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `/smbl/v1/ai-applications/list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `/smbl/v1/ai-applications/delete`,
        data: data[0],
        method: 'DELETE',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.aiOrgConfig.model.tenantNum').d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiOrgConfig.model.tenantName').d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiOrgConfig.model.aiApp').d('AI 应用'),
      name: 'applicationCode',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.aiOrgConfig.model.tenant').d('租户'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'SRM.TENAT.LIST',
      noCache: true,
    },
    {
      name: 'tenantId',
      bind: 'tenantObj.tenantId',
    },
    {
      label: intl.get('sdat.aiOrgConfig.modal.aiApp').d('AI应用'),
      name: 'applicationCode',
      type: 'string',
    },
  ],
  events: {},
});

const DetailDS = () => ({
  transport: {
    create: ({ data }) => {
      return {
        url: `/smbl/v1/ai-applications/add`,
        data: data[0],
        method: 'POST',
      };
    },

    update: ({ data }) => {
      return {
        url: `/smbl/v1/ai-applications/update`,
        data: data[0],
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  fields: [
    {
      label: intl.get('sdat.aiOrgConfig.model.tenant').d('租户'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'SRM.TENAT.LIST',
      required: true,
      noCache: true,
    },
    {
      name: 'tenantId',
      bind: 'tenantObj.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantObj.tenantName',
    },
    {
      label: intl.get('sdat.aiOrgConfig.modal.aiApp').d('AI应用'),
      name: 'applicationCode',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

const ServiceListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `/smbl/v1/tenant-ai-service-configs/list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `/smbl/v1/tenant-ai-service-configs/add`,
        data,
        method: 'POST',
      };
    },

    update: ({ data }) => {
      return {
        url: `/smbl/v1/tenant-ai-service-configs/update`,
        data,
        method: 'POST',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `/smbl/v1/tenant-ai-service-configs/remove`,
        data: data[0],
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  fields: [
    {
      label: intl.get('sdat.aiOrgConfig.model.serviceName').d('服务名称'),
      name: 'serviceName',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiOrgConfig.model.alias').d('服务别名'),
      name: 'serviceAliasName',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.icon').d('服务图标'),
      name: 'serviceIcon',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiAppManage.model.description').d('服务描述'),
      name: 'serviceDesc',
      type: 'string',
    },
    {
      label: intl.get('sdat.aiOrgConfig.model.isDefault').d('是否首页默认'),
      name: 'isDefault',
      type: 'boolean',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.aiOrgConfig.model.tenantName').d('服务名称'),
      name: 'tenantName',
      type: 'string',
    },
  ],
  events: {},
});

export { AppListDS, DetailDS, ServiceListDS };
