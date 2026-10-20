import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId(); // 租户ID

const createDs = {
  autoCreate: true,
  fields: [
    {
      name: 'companyLov',
      type: 'object',
      lovCode: 'SMAL.COMPANY',
      allowClear: false,
      lovPara: { tenantId: organizationId },
      multiple: true,
    },
  ],
};

const batchDs = () => ({
  fields: [
    {
      name: 'currencyLov',
      type: 'object',
      label: intl.get('small.ecClient.view.defaultCurrency').d('默认币种'),
      textField: 'currencyName',
      valueField: 'currencyCode',
      lovCode: 'SCEI.COMPANY_ASSIGN.CURRENCY',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'uomLov',
      type: 'object',
      label: intl.get('small.ecClient.view.defaultUom').d('默认计量单位'),
      textField: 'uomName',
      valueField: 'uomId',
      lovCode: 'SCEI.COMPANY_ASSIGN.UOM',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'itemLov',
      type: 'object',
      label: intl.get('small.ecClient.view.freightItem').d('运费物料映射'),
      lovCode: 'SMAL.CUSTOMER_ITEM',
      textField: 'itemName',
      ignore: 'always',
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
    },
    {
      name: 'itemName',
      bind: 'itemLov.itemName',
    },
  ],
});

const tableDs = (ecTenantId) => ({
  autoQuery: false,
  primaryKey: 'assignId',
  pageSize: 20,
  queryFields: [
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('small.common.model.company').d('公司'),
      ignore: 'always',
      valueField: 'companyId',
      textField: 'companyNum',
      lovCode: 'SMAL.COMPANY',
      lovPara: { tenantId: organizationId },
    },
    { name: 'companyId', type: 'string', bind: 'companyLov.companyId' },
  ],
  fields: [
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('small.common.model.companyCode').d('公司编码'),
      ignore: 'always',
      valueField: 'companyId',
      textField: 'companyNum',
      required: true,
      lovCode: 'SMAL.COMPANY',
      lovPara: { tenantId: organizationId },
      transformResponse(_, record) {
        const initData = {
          companyId: record.companyId,
          companyName: record.companyName,
          companyNum: record.companyNum,
        };

        return record.companyId ? initData : null;
      },
    },
    { name: 'companyId', type: 'string', bind: 'companyLov.companyId' },
    { name: 'companyNum', type: 'string', bind: 'companyLov.companyNum' },
    {
      name: 'emailLov',
      type: 'object',
      label: intl.get('small.common.model.supplierEmail').d('供应商收单邮箱'),
      ignore: 'always',
      valueField: 'userId',
      multiple: true,
      textField: 'realName',
      lovCode: 'SMAL.SUPPLIER_ACCOUNT_EMAIL',
      lovPara: { organizationId: ecTenantId },
      transformResponse(_, record) {
        // const initData = {
        //   userId: record?.users?.map((i) => i.id),
        //   realName: record?.users?.map((i) => i.realName),
        // };
        return record?.users?.map((i) => i.id);
      },
    },
    { name: 'userId', bind: 'emailLov.userId' },
    { name: 'realName', bind: 'emailLov.realName' },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companyLov.companyName',
      label: intl.get('small.common.model.companyName').d('公司名称'),
    },
    {
      name: 'addressCode',
      type: 'string',
      label: intl.get('small.ecClient.view.addressCode').d('地址编码'),
    },
    {
      name: 'currencyLov',
      type: 'object',
      label: intl.get('small.ecClient.view.defaultCurrency').d('默认币种'),
      textField: 'currencyName',
      valueField: 'currencyCode',
      lovCode: 'SCEI.COMPANY_ASSIGN.CURRENCY',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      transformResponse(_, record) {
        const initData = {
          currencyName: record.currencyName,
          currencyCode: record.currencyCode,
        };

        return record.currencyCode ? initData : null;
      },
    },
    { name: 'currencyCode', type: 'string', bind: 'currencyLov.currencyCode' },
    {
      name: 'uomLov',
      type: 'object',
      label: intl.get('small.ecClient.view.defaultUom').d('默认计量单位'),
      textField: 'uomName',
      valueField: 'uomId',
      lovCode: 'SCEI.COMPANY_ASSIGN.UOM',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      transformResponse(_, record) {
        const initData = {
          uomId: record.uomId,
          uomName: record.uomName,
        };
        return record.uomId ? initData : null;
      },
    },
    {
      name: 'itemLov',
      type: 'object',
      label: intl.get('small.ecClient.view.freightItem').d('运费物料映射'),
      lovCode: 'SMAL.CUSTOMER_ITEM',
      textField: 'itemName',
      ignore: 'always',
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
    },
    {
      name: 'itemName',
      bind: 'itemLov.itemName',
    },
    { name: 'uomId', type: 'string', bind: 'uomLov.uomId' },
    { name: 'enabledFlag', label: intl.get('hzero.common.button.enable').d('启用') },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/ec-company-assigns/list`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMAL.EC_CLIENT.COMPANY' },
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/ec-company-assigns`,
        method: 'POST',
        data: { ecCompanyAssignList: data },
      };
    },
  },
});

export { tableDs, createDs, batchDs };
