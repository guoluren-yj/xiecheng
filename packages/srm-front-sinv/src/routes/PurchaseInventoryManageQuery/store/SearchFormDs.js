import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const SearchFormDataSet = () => ({
  pageSize: 20,
  autoCreate: true,
  fields: [
    {
      name: 'supplierCompanyLov',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.companyName`).d('公司'),
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
    },
    {
      name: 'companyNum',
      type: 'string',
      bind: 'supplierCompanyLov.companyNum',
    },
    // {
    //   name: 'supplierCompanyId',
    //   type: 'string',
    //   bind: 'supplierCompanyLov.companyId',
    // },
    {
      name: 'tempkeys',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.supplierId`).d('供应商'),
      lovCode: 'SPUC.SINV.SUPPLIER',
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
    },
    {
      name: 'supplierNum',
      type: 'string',
      bind: 'tempkeys.supplierNum',
    },
    {
      name: 'invOrganizationId',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.organizationNames`).d('库存组织编码'),
      lovCode: 'SPFM.USER_AUTH.INVORG',
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
    },
    {
      name: 'organizationCode',
      type: 'string',
      bind: 'invOrganizationId.organizationCode',
    },
    {
      name: 'itemId',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.itemCode`).d('物料编码'),
      lovCode: 'SODR.PO_ITEM',
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
    },
    {
      name: 'itemCode',
      type: 'string',
      bind: 'itemId.itemCode',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.items`).d('物料名称'),
      bind: 'itemId.itemName',
    },
    {
      name: 'inventoryId',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.inventoryNames`).d('库房编码'),
      lovCode: 'SODR.INVENTORY',
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
      transformResponse: (value, object) =>
        object?.inventoryId
          ? {
              ...object,
              inventoryId: object?.inventoryId,
            }
          : null,
    },
    {
      name: 'inventoryCode',
      type: 'string',
      bind: 'inventoryId.inventoryCode',
    },
    {
      name: 'locatorId',
      label: intl.get(`sinv.inventoryBench.model.view.locationNames`).d('库位编码'),
      lovCode: 'SRPM.LOCATION_BY_ORG_INV',
      type: 'object',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            inventoryId: record.get('inventoryId')?.inventoryId,
          };
        },
        // disabled: ({ record }) => !record.get('inventoryId')?.inventoryId,
      },
      transformResponse: (value, object) => {
        return object?.locatorId
          ? {
              ...object,
              locatorId: object?.locatorId,
            }
          : null;
      },
    },
    {
      name: 'locationCode',
      type: 'string',
      bind: 'locatorId.locationCode',
    },
    {
      name: 'lotNum',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.lotNum`).d('批次号'),
    },
  ],
});

export default SearchFormDataSet;
