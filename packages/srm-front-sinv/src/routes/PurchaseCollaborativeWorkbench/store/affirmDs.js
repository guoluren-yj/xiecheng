import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const affirmDataSet = (sureSupplier) => ({
  autoQuery: false,
  dataToJSON: 'all',
  pageSize: 20,
  primaryKey: 'invHeaderId',
  cacheSelection: true,
  cacheModified: true,
  queryParameter: {
    customizeUnitCode: sureSupplier
      ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.AFFIRM.SEARCH,SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.AFFIRM.LIST'
      : 'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRM.SEARCH,SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRM.LIST',
  },
  fields: [
    {
      name: 'invStatus',
      type: 'string',
      label: intl.get('sinv.inventoryBench.model.view.linkStatus').d('状态'),
      fixed: 'left',
      lookupCode: 'SPUC.SINV_STOCK_OUT_STATUS',
    },
    {
      name: 'displayInvNum',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.invNum`).d('单据编号'),
      fixed: 'left',
    },
    {
      name: 'processFactory',
      type: 'string',
      lookupCode: 'SPUC.SINV_STOCK_OUT_TYPE',
      label: intl.get(`sinv.inventoryBench.model.view.processFactories`).d('单据类别'),
      fixed: 'left',
    },
    {
      name: 'supplierNum',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.supplierNum`).d('供应商编码'),
      align: 'left',
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.inventoryBench.model.view.supplierNames').d('供应商'),
      align: 'left',
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.inventoryBench.model.view.companyName').d('公司'),
      align: 'left',
    },
    {
      name: 'sourceCode',
      label: intl.get(`sinv.inventoryBench.model.view.sourceCode`).d('单据来源'),
      align: 'left',
      lookupCode: 'SPUC.SINV_STOCK_OUT_SOURCE_CODE',
    },
    {
      name: 'creationName',
      label: intl.get(`sinv.inventoryBench.model.view.creationName`).d('创建人'),
      align: 'left',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sinv.inventoryBench.model.view.creationDate`).d('创建时间'),
      align: 'left',
    },
    {
      name: 'invDateLov',
      label: intl.get(`sinv.inventoryBench.model.view.invDates`).d('周期时间范围'),
      type: 'dateTime',
      ignore: 'always',
      range: ['invDateFrom', 'invDateTo'],
      dynamicProps: {
        disabled: ({ record }) => record.get('invDateFrom') && record.get('invDateTo'),
      },
    },
    {
      name: 'invDateFrom',
      type: 'dateTime',
      bind: 'invDateLov.invDateFrom',
    },

    {
      name: 'invDateTo',
      type: 'dateTime',
      bind: 'invDateLov.invDateTo',
    },
  ],
  transport: {
    read: () => {
      return {
        url: sureSupplier
          ? `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/supplier/confirm`
          : `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/confirm`,
        method: 'GET',
      };
    },
  },
});

export default affirmDataSet;
