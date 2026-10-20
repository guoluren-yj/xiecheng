import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId(); // 租户ID
const tableDs = () => ({
  autoQuery: true,
  selection: false,
  pageSize: 20,
  queryFields: [
    {
      name: 'ecPlatformName',
      type: 'string',
      label: intl.get('small.ecClient.model.ecPlatform').d('电商平台'),
    },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('small.ecClient.model.ecCompany').d('电商公司'),
      ignore: 'always',
      lovCode: 'HPFM.COMPANY',
      valueField: 'companyId',
      textField: 'companyNum',
      lovPara: { enabledFlag: 1 },
    },
    { name: 'ecCompanyId', type: 'string', bind: 'companyLov.companyId' },
  ],
  fields: [
    { name: 'opreate', label: intl.get('small.common.model.operation').d('操作') },
    {
      name: 'customerCode',
      type: 'string',
      label: intl.get('small.ecClient.model.customerCode').d('客户代码'),
    },
    {
      name: 'ecPlatformLov',
      type: 'object',
      label: intl.get('small.ecClient.model.ecPlatform').d('电商平台'),
      ignore: 'always',
      lovCode: 'SMAL.EC_PLATFORM',
      textField: 'ecPlatformCodeName',
      valueField: 'ecPlatform',
      required: true,
      transformResponse(_, record) {
        const initLovData = {
          ecTenantId: record.ecTenantId,
          ecPlatform: record.ecPlatform,
          ecPlatformCodeName: `${record.ecPlatform}-${record.ecPlatformName}`,
        };
        return record.ecPlatform ? initLovData : null;
      },
    },
    {
      name: 'ecPlatform',
      type: 'string',
      label: intl.get('small.ecClient.model.ecClient.ecPlatform.code').d('电商平台代码'),
      bind: 'ecPlatformLov.ecPlatform',
    },
    {
      name: 'ecPlatformName',
      type: 'string',
      label: intl.get('small.common.model.ecPlatformName').d('电商名称'),
      bind: 'ecPlatformLov.ecPlatformName',
    },
    { name: 'ecTenantId', type: 'string', bind: 'ecPlatformLov.ecTenantId' },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('small.ecClient.model.ecCompanyCode').d('电商公司编码'),
      ignore: 'always',
      valueField: 'companyId',
      textField: 'companyNum',
      lovPara: { enabledFlag: 1 },
      required: true,
      dynamicProps({ record }) {
        return {
          disabled: !record.get('ecTenantId'),
          lovPara: { tenantId: record.get('ecTenantId') },
        };
      },
      lovCode: 'HPFM.COMPANY',
      transformResponse(_, record) {
        const initLovData = {
          companyId: record.ecCompanyId,
          companyNum: record.ecCompanyNum,
          companyName: record.ecCompanyName,
        };
        return record.ecPlatform ? initLovData : null;
      },
    },
    { name: 'ecCompanyId', type: 'string', bind: 'companyLov.companyId' },
    {
      name: 'ecCompanyName',
      type: 'string',
      bind: 'companyLov.companyName',
      label: intl.get('small.ecClient.model.ecCompanyName').d('电商公司名称'),
    },
    {
      name: 'userName',
      type: 'string',
      label: intl.get('small.ecClient.model.ecClient.userName').d('账户名'),
    },
    { name: 'enabledFlag', type: 'number', label: intl.get('hzero.common.status').d('状态') },
    {
      name: 'invoiceMethod',
      type: 'string',
      label: intl.get('small.common.model.invoiceMethod').d('开票方式'),
    },
    {
      name: 'invoiceTitle',
      type: 'string',
      label: intl.get('small.common.model.invoiceForm').d('发票形式'),
    },
    {
      name: 'invoiceType',
      type: 'string',
      label: intl.get('small.common.model.invoiceTypes').d('发票类型'),
    },
    {
      name: 'invoiceDetail',
      type: 'string',
      label: intl.get('small.common.model.invoiceDetails').d('发票明细'),
    },
    {
      name: 'paymentMethod',
      type: 'string',
      label: intl.get('small.common.model.paymentMethod').d('支付方式'),
    },
    {
      name: 'freightType',
      type: 'string',
      label: intl.get('small.common.model.freightType').d('运费类型'),
    },
    { name: 'options', label: intl.get('hzero.common.action').d('操作') },
  ],
  transport: {
    read: ({data}) => ({
      url: `${SRM_MALL}/v1/${organizationId}/ec-clients`,
      method: 'GET',
      data: { ...data, customizeUnitCode: 'SMAL.EC_PAYMENT.SEARCH_INFO' },
    }),
    submit: {
      url: `${SRM_MALL}/v1/${organizationId}/ec-clients`,
      method: 'PUT',
    },
  },
  events: {
    load({ dataSet }) {
      dataSet.forEach((record) => {
        if (record.status !== 'add') {
          const current = record;
          current.selectable = false;
        }
      });
    },
  },
});

const cataTableDs = () => ({
  autoQuery: true,
  selection: false,
  paging: false, // 内采只有一行不展示分页
  data: [
    {
      invoiceMethod: '',
      invoiceTitle: '',
      invoiceType: '',
      invoiceDetail: '',
      paymentType: '',
      paymentMethod: '',
      freightType: '',
    },
  ],
  fields: [
    {
      name: 'invoiceMethod',
      type: 'string',
      label: intl.get('small.common.model.invoiceMethod').d('开票方式'),
    },
    {
      name: 'invoiceTitle',
      type: 'string',
      label: intl.get('small.common.model.invoiceForm').d('发票形式'),
    },
    {
      name: 'invoiceType',
      type: 'string',
      label: intl.get('small.common.model.invoiceTypes').d('发票类型'),
    },
    {
      name: 'invoiceDetail',
      type: 'string',
      label: intl.get('small.common.model.invoiceDetails').d('发票明细'),
    },
    {
      name: 'paymentType',
      type: 'string',
      label: intl.get('small.common.model.paymentTypeCata').d('支付类型'),
    },
    {
      name: 'paymentMethod',
      type: 'string',
      label: intl.get('small.common.model.paymentMethod').d('支付方式'),
    },
    {
      name: 'freightType',
      type: 'string',
      label: intl.get('small.common.model.freightType').d('运费类型'),
    },
  ],
  transport: {
    // read: {
    //   url: `${SRM_MALL}/v1/${organizationId}/cata-clients`,
    //   method: 'POST',
    // },
    submit: {
      url: `${SRM_MALL}/v1/${organizationId}/cata-clients`,
      method: 'PUT',
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/cata-clients`,
        data,
        method: 'DELETE',
        transformResponse: (res) => {
          if (!res) {
            dataSet.query();
          }
        },
      };
    },
  },
  events: {
    load({ dataSet }) {
      dataSet.forEach((record) => {
        if (record.status !== 'add') {
          const current = record;
          current.selectable = false;
        }
      });
    },
  },
});

export { tableDs, cataTableDs };
