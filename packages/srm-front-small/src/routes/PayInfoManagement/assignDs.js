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
      lovCode: 'HPFM.COMPANY',
      lovPara: { tenantId: organizationId },
      allowClear: false,
      multiple: true,
    },
  ],
};

const batchDs = {
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
  ],
};

const tableDs = {
  autoQuery: false,
  queryFields: [
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('small.common.model.ecCompanyCode').d('电商公司编码'),
      ignore: 'always',
      valueField: 'companyId',
      textField: 'companyNum',
      lovPara: { tenantId: organizationId },
      lovCode: 'HPFM.COMPANY',
    },
    { name: 'companyId', type: 'string', bind: 'companyLov.companyId' },
  ],
  fields: [
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('small.common.model.ecCompanyCode').d('电商公司编码'),
      ignore: 'always',
      valueField: 'companyId',
      textField: 'companyNum',
      lovPara: { tenantId: organizationId },
      required: true,
      lovCode: 'HPFM.COMPANY',
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
      name: 'companyName',
      type: 'string',
      bind: 'companyLov.companyName',
      label: intl.get('small.common.model.ecCompanyName').d('电商公司名称'),
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
    { name: 'uomId', type: 'string', bind: 'uomLov.uomId' },
    { name: 'enabledFlag', type: 'number', label: intl.get('hzero.common.status').d('状态') },
    { name: 'option', label: intl.get('hzero.common.action').d('操作') },
  ],
  transport: {
    read: {
      url: `${SRM_MALL}/v1/${organizationId}/ec-company-assigns/list`,
      method: 'GET',
    },
    submit: {
      url: `${SRM_MALL}/v1/${organizationId}/ec-company-assigns`,
      method: 'POST',
    },
  },
};

export { tableDs, createDs, batchDs };
