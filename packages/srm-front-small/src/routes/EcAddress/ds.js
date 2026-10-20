import { SRM_MALL } from '_utils/config';
import intl from 'utils/intl';

const tableDs = () => ({
  autoQuery: false,
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'regionCode',
      type: 'string',
      label: intl.get('small.ecAddressManage.model.EC.regionCode').d('地址编码'),
    },
    {
      name: 'regionName',
      type: 'string',
      label: intl.get(`small.ecAddressManage.model.EC.regionName`).d('地址名称'),
    },
    {
      name: 'regionLevel',
      type: 'string',
      label: intl.get(`small.ecAddressManage.model.EC.regionLevel`).d('区域等级'),
    },
    {
      name: 'enabledFlag',
      label: intl.get('small.ecAddressManage.model.EC.enabledFlag').d('状态'),
    },
    {
      name: 'operation',
      label: intl.get('small.common.model.operation').d('操作'),
    },
  ],
  transport: {
    read({ data }) {
      const { filterParam, ...rest } = data;
      return {
        url: `${SRM_MALL}/v1/mall-regions/Subordinate`,
        method: 'GET',
        data: { ...filterParam, ...rest },
      };
    },
  },
});

const treeDs = () => ({
  primaryKey: 'regionCode',
  expandField: 'expand',
  idField: 'regionCode',
  selection: 'single',
  parentField: 'parentRegionCode',
  fields: [
    {
      name: 'regionCode',
      type: 'string',
    },
    {
      name: 'parentRegionCode',
      type: 'string',
    },
    {
      name: 'expand',
      type: 'boolean',
    },
    {
      name: 'regionName',
      type: 'string',
    },
  ],
  transport: {
    read({ data }) {
      const { regionCode, ...other } = data;
      return {
        url: `${SRM_MALL}/v1/mall-regions/Subordinate`,
        method: 'GET',
        data: { page: -1, regionCode, ...other },
      };
    },
  },
});

export { tableDs, treeDs };
