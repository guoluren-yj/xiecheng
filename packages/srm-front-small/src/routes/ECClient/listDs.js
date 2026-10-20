import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId(); // 租户ID
const tableDs = () => ({
  autoQuery: true,
  primaryKey: 'ecClientId',
  pageSize: 20,
  fields: [
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
      bind: 'ecPlatformLov.ecPlatform',
    },
    { name: 'ecTenantId', type: 'string', bind: 'ecPlatformLov.ecTenantId' },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('small.ecClient.model.ecCompanyCode').d('电商公司编码'),
      ignore: 'always',
      valueField: 'companyId',
      textField: 'companyNum',
      // lovPara: { enabledFlag: 1 },
      required: true,
      dynamicProps({ record }) {
        return {
          disabled: !record.get('ecTenantId'),
          lovPara: { tenantId: record.get('ecTenantId') },
        };
      },
      lovCode: 'SMAL.COMPANY',
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
      name: 'dataType',
      type: 'string',
      lookupCode: 'SMAL.ACCOUNT_TYPE',
      label: intl.get('small.ecClient.model.accountType').d('账号类型'),
    },
    {
      name: 'ecCompanyName',
      type: 'string',
      bind: 'companyLov.companyName',
      label: intl.get('small.ecClient.model.ecCompanyName').d('电商公司名称'),
    },
    {
      name: 'userName',
      type: 'string',
      required: true,
      label: intl.get('small.ecClient.model.ecClient.userName').d('账户名'),
    },
    {
      name: 'userPassword',
      type: 'password',
      label: intl.get('small.common.model.apassword').d('账户密码'),
      maxLength: 120,
      dynamicProps({ record }) {
        return {
          required: !record.get('ecClientId'),
          ignore: record.get('ecClientId') ? 'always' : 'never',
        };
      },
      // transformResponse(_, record) {
      //   return record.ecClientId ? '*********' : null;
      // },
    },
    {
      name: 'serverAddress',
      type: 'url',
      label: intl.get('small.ecClient.model.ecClientSite.serverAddress').d('服务地址'),
      maxLength: 200,
      required: true,
    },
    {
      name: 'placeOrderUrl',
      type: 'url',
      label: intl.get('small.ecClient.model.ecClientSite.placeOrderUrl').d('下单地址'),
      maxLength: 300,
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
    {
      name: 'soldTo',
      type: 'string',
      label: 'soldTo',
    },
    {
      name: 'accessKeyId',
      type: 'string',
      label: intl.get('small.common.model.accessKeyId').d('客户id'),
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      label: intl.get('small.common.model.accessKeySecret').d('客户密码'),
      // transformResponse(_, record) {
      //   return record.ecClientId ? '*********' : null;
      // },
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/ec-clients`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMAL.EC_CLIENT.SELECT' },
      };
    },
    submit: {
      url: `${SRM_MALL}/v1/${organizationId}/ec-clients`,
      method: 'PUT',
    },
  },
});

const formDs = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
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
      bind: 'ecPlatformLov.ecPlatform',
    },
    { name: 'ecTenantId', type: 'string', bind: 'ecPlatformLov.ecTenantId' },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('small.ecClient.model.ecCompanyCode').d('电商公司编码'),
      ignore: 'always',
      valueField: 'companyId',
      textField: 'companyNum',
      // lovPara: { enabledFlag: 1 },
      required: true,
      dynamicProps({ record }) {
        return {
          disabled: !record.get('ecTenantId'),
          lovPara: { tenantId: record.get('ecTenantId') },
        };
      },
      lovCode: 'SMAL.COMPANY',
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
      name: 'dataType',
      type: 'string',
      lookupCode: 'SMAL.ACCOUNT_TYPE',
      label: intl.get('small.ecClient.model.accountType').d('账号类型'),
      required: true,
      defaultValue: 1,
    },
    {
      name: 'ecCompanyName',
      type: 'string',
      bind: 'companyLov.companyName',
      label: intl.get('small.ecClient.model.ecCompanyName').d('电商公司名称'),
    },
    {
      name: 'userName',
      type: 'string',
      required: true,
      label: intl.get('small.ecClient.model.ecClient.userName').d('账户名'),
    },
    {
      name: 'userPassword',
      type: 'password',
      label: intl.get('small.common.model.apassword').d('账户密码'),
      maxLength: 120,
    },
    {
      name: 'serverAddress',
      type: 'url',
      label: intl.get('small.ecClient.model.ecClientSite.serverAddress').d('服务地址'),
      maxLength: 200,
      required: true,
    },
    {
      name: 'placeOrderUrl',
      type: 'url',
      label: intl.get('small.ecClient.model.ecClientSite.placeOrderUrl').d('下单地址'),
      maxLength: 300,
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
    {
      name: 'soldTo',
      type: 'string',
      label: 'soldTo',
    },
    {
      name: 'accessKeyId',
      type: 'string',
      label: intl.get('small.common.model.accessKeyId').d('客户id'),
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      label: intl.get('small.common.model.accessKeySecret').d('客户密码'),
    },
  ],
  transport: {
    submit: ({ data }) => {
      const param = data.map((i) => ({ ...i, clientType: 'TENANT', enabledFlag: 1, updateFlag: 1 }));
      return {
        url: `${SRM_MALL}/v1/${organizationId}/ec-clients`,
        method: 'PUT',
        data: param,
      };
    },
  },
});

const remainDs = () => ({
  fields: [
    {
      label: intl.get('small.ecClient.model.ecPlatform').d('电商平台'),
      name: 'ecPlatform',
    },
    {
      label: intl.get('small.ecClient.model.dataType').d('账号类型'),
      name: 'dataType',
      type: 'string',
      lookupCode: 'SMAL.ACCOUNT_TYPE',
    },
    {
      label: intl.get('small.ecClient.model.ecCompanyName').d('电商公司名称'),
      name: 'ecCompanyName',
    },
    {
      label: intl.get('small.ecClient.model.ecClient.userName').d('账户名'),
      name: 'userName',
    },
  ],
});

const remainTableDs = (recordData = {}) => ({
  autoQuery: true,
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: 'pin',
      name: 'pin',
    },
    {
      label: intl.get('small.ecClient.model.mapCode').d('映射的组织/编码'),
      name: 'mapping',
    },
    {
      label: intl.get('small.ecClient.model.rechargeRemain').d('预充值余额'),
      name: 'preChargeRemainLimit',
    },
    {
      label: intl.get('small.ecClient.model.ecClient.payRemain').d('账期余额'),
      name: 'accountingPeriodRemainLimit',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/ec-clients/getAccountBalance`,
        method: 'GET',
        data: { ...data, ecClientId: recordData.ecClientId },
      };
    },
  },
});

const remainDetailDs = (recordData = {}) => ({
  autoQuery: true,
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: 'pin',
      name: 'pin',
    },
    {
      label: intl.get('small.ecClient.model.ecClient.ECOrderNum').d('电商父/子订单号'),
      name: 'orderId',
    },
    {
      label: intl.get('small.ecClient.model.ecClient.transactionType').d('交易类型'),
      name: 'tradeTypeName',
    },
    {
      label: intl.get('small.ecClient.model.ecClient.transactionNumber').d('交易号'),
      name: 'tradeNo',
    },
    {
      label: intl.get('small.ecClient.model.ecClient.variableBalance').d('变动余额'),
      name: 'amount',
    },
    {
      label: intl.get('small.ecClient.model.ecClient.changeTime').d('变动时间'),
      name: 'createdDate',
    },
    {
      label: intl.get('srm.common.supplier.model.remark').d('备注'),
      name: 'notePub',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_MALL}/v1/${organizationId}/ec-clients/getAccountBalanceDetail`,
        method: 'GET',
        data: { ...data, ecClientId: recordData.ecClientId },
      };
    },
  },
});

export { tableDs, formDs, remainDs, remainTableDs, remainDetailDs };
