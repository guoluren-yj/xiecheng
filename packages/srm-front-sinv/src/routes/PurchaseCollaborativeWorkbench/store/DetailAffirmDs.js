import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const detailAffirmDataSet = (sureSupplier) => ({
  autoQuery: false,
  dataToJSON: 'all',
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  primaryKey: 'invLineId',
  queryParameter: {
    customizeUnitCode: sureSupplier
      ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.SEARCH,SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST'
      : 'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.SEARCH,SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST',
  },
  fields: [
    {
      name: 'invStatus',
      type: 'string',
      label: intl.get('sinv.inventoryBench.model.view.linkStatus').d('状态'),
    },
    {
      name: 'displayInvHeaderAndLineNum',
      type: 'string',
      label: intl
        .get(`sinv.inventoryBench.model.view.displayInvHeaderAndLineNum`)
        .d('单据编号-行号'),
    },
    {
      name: 'processFactory',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.processFactories`).d('单据类别'),
    },
    {
      name: 'invOrganizationId',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.invOrganizationId`).d('库存组织'),
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.itemCode`).d('物料编码'),
      name: 'itemCode',
    },

    {
      label: intl.get(`sinv.inventoryBench.model.view.customerItemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      name: 'uomId',
      label: intl.get(`sinv.inventoryBench.model.view.uomId`).d('单位'),
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.quantityShow`).d('数量'),
      name: 'quantity',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.affirmQuantity`).d('确认数量'),
      name: 'affirmQuantity',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.inspectQuantity`).d('线下盘点库存总量'),
      name: 'inspectQuantity',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.theoryQuantities`).d('理论库存现有量'),
      name: 'theoryQuantity',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.inventoryVariance`).d('库存差异值'),
      name: 'inventoryVariance',
    },
    {
      name: 'locationId',
      label: intl.get(`sinv.inventoryBench.model.view.locationId`).d('库房'),
    },
    {
      name: 'inventoryId',
      label: intl.get(`sinv.inventoryBench.model.view.inventoryId`).d('库位'),
    },

    {
      name: 'companyName',
      label: intl.get('sinv.inventoryBench.model.view.companyName').d('公司'),
    },
    {
      name: 'displaySupplierName',
      type: 'string',
      label: intl.get('sinv.inventoryBench.model.view.displaySupplierName').d('供应商'),
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.sourceNum`).d('来源订单'),
      name: 'sourceNum',
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.lotNum`).d('批次号'),
      name: 'lotNum',
    },

    {
      name: 'sourceCode',
      label: intl.get(`sinv.inventoryBench.model.view.sourceCode`).d('单据来源'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sinv.inventoryBench.model.view.creationDate`).d('创建时间'),
      align: 'left',
    },
  ],
  transport: {
    read: () => {
      return {
        url: sureSupplier
          ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/line/confirm`
          : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/line/confirm`,
        method: 'GET',
      };
    },
  },
});

export default detailAffirmDataSet;
