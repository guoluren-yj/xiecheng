import intl from 'utils/intl';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const userId = getUserOrganizationId();

const SearchFormDataSet = () => ({
  pageSize: 20,
  autoCreate: true,
  fields: [
    {
      name: 'supplierCompanyLov',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.companyName`).d('公司'),
      lovCode: 'SINV.ASN_CUSTOMER',
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
      lovCode: 'SPUC.SINV_STOCK_OUT_REPORT_SUPPLIER',
      lovPara: {
        tenantId: organizationId,
        partnerTenantId: userId,
      },
      ignore: 'always',
      textField: 'supplierCompanyName',
      required: true,
    },
    {
      name: 'supplierNum',
      type: 'string',
      bind: 'tempkeys.supplierNum',
    },
    {
      name: 'organizationCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.organizationCodes`).d('库存组织编码'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.itemCodes`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.items`).d('物料名称'),
    },
    {
      name: 'inventoryCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.inventoryNames`).d('库房编码'),
    },
    {
      name: 'locationCode',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.locationNames`).d('库位编码'),
    },
    {
      name: 'lotNum',
      type: 'string',
      label: intl.get(`sinv.inventoryBench.model.view.lotNum`).d('批次号'),
    },
  ],
  events: {},
});

export default SearchFormDataSet;
