import { SRM_MALL } from '_utils/config';
import intl from 'utils/intl';

const tableDs = () => ({
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'enabledFlag',
      label: intl.get('small.ecAddressManage.model.EC.enabledFlag').d('状态'),
    },
    {
      name: 'versionCode',
      type: 'string',
      label: intl.get(`small.ecAddressManage.model.EC.versionCode`).d('地址版本'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`small.ecAddressManage.model.EC.quantity`).d('地址数量'),
    },
    {
      name: 'tenantQuantity',
      type: 'number',
      label: intl.get(`small.ecAddressManage.model.EC.tenantQuantity`).d('租户数量'),
    },
    {
      name: 'lastUpdateDate',
      // type: 'string',
      label: intl.get(`small.ecAddressManage.model.EC.lastUpdateDate`).d('更新时间'),
    },
    {
      name: 'defaultFlag',
      type: 'boolean',
      label: intl.get(`small.ecAddressManage.model.EC.defaultFlag`).d('是否默认地址'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get(`small.ecAddressManage.model.EC.operation`).d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/region-version`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMAL.REGION.VERSION.QUERY' },
      };
    },
  },
});

const tenTableDs = () => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get('small.ecAddressManage.model.EC.tenantName').d('租户名称'),
    },
    {
      name: 'tenantNum',
      type: 'string',
      label: intl.get(`small.ecAddressManage.model.EC.tenantNum`).d('租户编码'),
    },
    {
      name: 'versionCode',
      type: 'string',
      label: intl.get(`small.ecAddressManage.model.EC.versionCode`).d('地址版本'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/region-version-tenant-mapping`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMAL.REGION.VERSION.TENANT.QUERY' },
      };
    },
  },
});

const inheritAddressDS = () => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  queryFields: [
    {
      name: 'versionCode',
      label: intl.get('small.ecAddressManage.model.EC.versionName').d('版本名称'),
    },
    // {
    //   name: 'lastUpdateDate',
    //   label: intl.get('small.ecAddressManage.model.EC.lastUpdateDate').d('更新时间'),
    //   type: 'dateTime',
    // },
  ],
  fields: [
    {
      name: 'versionCode',
      label: intl.get('small.ecAddressManage.model.EC.versionName').d('版本名称'),
    },
    {
      name: 'quantity',
      label: intl.get('small.ecAddressManage.model.EC.quantity').d('地址数量'),
      type: 'number',
    },
    {
      name: 'tenantQuantity',
      label: intl.get('small.ecAddressManage.model.EC.tenantQuantity').d('租户数量'),
      type: 'number',
    },
    {
      name: 'lastUpdateDate',
      label: intl.get('small.ecAddressManage.model.EC.lastUpdateDate').d('更新时间'),
    },
  ],
  transport: {
    read: ({ data}) => ({
      url: `${SRM_MALL}/v1/region-version`,
      method: 'GET',
      data: {...data, enabledFlag: 1},
    }),
  },
});

export { tableDs, tenTableDs, inheritAddressDS };
