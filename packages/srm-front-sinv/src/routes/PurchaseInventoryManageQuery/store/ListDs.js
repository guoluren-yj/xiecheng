import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const InvertoryDataSet = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  cacheSelection: true,
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  // autoCreate: true,
  queryParameter: {
    customizeUnitCode: 'SINV-PURCHASER-INVENTORY-QUERY.SEARCH',
  },
  fields: [
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.items`).d('物料名称'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.uomName`).d('单位'),
    },
    {
      name: 'stockQuantity',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.stockQuantity`).d('库存现有量'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.organizationName`).d('库存组织'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.inventoryName`).d('库房'),
    },
    {
      name: 'locationName',
      label: intl.get(`sinv.inventoryBench.model.view.locationName`).d('库位'),
    },
    {
      name: 'lotNum',
      label: intl.get(`sinv.inventoryBench.model.view.lotNum`).d('批次号'),
    },
    {
      name: 'supplierNum',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.supplierNum`).d('供应商编码'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.supplierName`).d('供应商名称'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.companyName`).d('公司'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/stockout/report/page`,
        method: 'GET',
        data: data.params,
      };
    },
  },
});

export default InvertoryDataSet;
