import intl from 'utils/intl';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';
import notification from 'utils/notification';
import { getCurrentLanguage, getCurrentOrganizationId, getResponse } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const language = getCurrentLanguage();

// 地址DS
const getAddressInfoDS = ({ changeReqId }) => ({
  paging: false,
  fields: [
    {
      name: 'companyAddressId',
    },
    {
      name: 'countryObj',
      type: 'object',
      required: true,
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`sslm.supplierEntryDetail.model.address.countryId`).d('国家/地区'),
    },
    {
      name: 'countryId',
      type: 'string',
      bind: 'countryObj.countryId',
      required: true,
    },
    {
      name: 'countryCode',
      type: 'string',
      bind: 'countryObj.countryCode',
    },
    {
      name: 'countryName',
      type: 'string',
      bind: 'countryObj.countryName',
    },
    {
      name: 'quickIndex',
      bind: 'countryObj.quickIndex',
    },
    {
      name: 'regionId',
      type: 'string',
      label: intl.get(`sslm.supplierEntryDetail.model.address.regionId`).d('省/市/区'),
    },
    {
      name: 'regionPathName',
      readOnly: true,
      type: 'string',
      label: intl.get(`sslm.supplierEntryDetail.model.address.regionId`).d('省/市/区'),
      validator: (value, name, record) => {
        const { countryCode, quickIndex, isLeaf = true, regionId } = record.get([
          'countryCode',
          'quickIndex',
          'isLeaf',
          'regionId',
        ]);
        if (countryCode === 'CN' || quickIndex === 'CN') {
          if (!isLeaf && regionId) {
            return intl.get('sslm.common.view.message.lastRegion').d('须选择填写至最末级地区');
          }
          return true;
        }
        return true;
      },
    },
    {
      name: 'addressDetail',
      type: 'intl',
      required: true,
      label: intl.get(`sslm.supplierEntryDetail.model.address.businessAddress`).d('经营地址'),
    },
    {
      name: 'quickIndex',
      bind: 'countryObj.quickIndex',
    },
    {
      name: 'postCode',
      type: 'string',
      label: intl.get(`sslm.supplierEntryDetail.model.address.postCode`).d('邮政编码'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN'
            ? /^[0-9]*$/
            : false,
        minLength: ({ record }) =>
          record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN' ? 6 : null,
        maxLength: ({ record }) =>
          record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN' ? 6 : null,
        defaultValidationMessages: ({ record }) => {
          return record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN'
            ? {
                tooShort: intl
                  .get(`spfm.address.model.address.validate.postCode`)
                  .d('请输入6位数字'),
              }
            : {};
        },
      },
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get(`sslm.supplierEntryDetail.model.address.description`).d('地址备注'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  events: {
    update: ({ record, name }) => {
      if (name === 'countryObj') {
        record.set('regionId', null);
        record.set('regionPathName', null);
      }
    },
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs/no-basic`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_ADDRESS_INFO',
          ...queryParams,
          ...other,
          changeReqId,
          dataSource: 3,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-address-reqs/delete`,
        method: 'DELETE',
        data,
        params: { ...params, customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.ENTRY_ADDRESS_INFO' },
      };
    },
  },
});

// 银行DS
const getBankInfoDS = ({ changeReqId }) => ({
  paging: false,
  fields: [
    {
      name: 'bankCountryObj',
      type: 'object',
      required: true,
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`sslm.supplierEntryDetail.model.bank.bankCountry`).d('国家/地区'),
      noCache: true,
    },
    {
      name: 'bankCountryId',
      type: 'string',
      bind: 'bankCountryObj.countryId',
      required: true,
    },
    {
      name: 'bankCountryName',
      type: 'string',
      bind: 'bankCountryObj.countryName',
    },
    {
      name: 'bankFirmObj',
      required: true,
      lovCode: 'SMDM.BANK_BRANCK_FIRM_TENANT',
      lovPara: { tenantId: organizationId },
      type: 'object',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.bankFirm`).d('联行行号'),
    },
    {
      name: 'bankFirm',
      type: 'string',
      bind: 'bankFirmObj.bankFirm',
    },
    {
      name: 'bankCode',
      required: true,
      disabled: true,
      type: 'string',
      bind: 'bankFirmObj.bankCode',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.bankInternalCode`).d('银行（国际）代码'),
    },
    {
      name: 'bankName',
      disabled: true,
      type: 'string',
      bind: 'bankFirmObj.bankName',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.bankName`).d('银行名称'),
    },
    {
      name: 'bankId',
      type: 'string',
      bind: 'bankFirmObj.bankId',
    },
    {
      name: 'bankBranchId',
      type: 'string',
      bind: 'bankFirmObj.bankBranchId',
    },
    {
      name: 'bankBranchCode',
      type: 'string',
      bind: 'bankFirmObj.bankBranchCode',
    },
    {
      name: 'bankBranchName',
      required: true,
      disabled: true,
      type: 'string',
      bind: 'bankFirmObj.bankBranchName',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.bankBranchName`).d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      required: true,
      type: 'string',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.bankAccountName`).d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      required: true,
      type: 'secret',
      pattern: /^[0-9A-Za-z-@._,/]*$/,
      label: intl.get(`sslm.supplierEntryDetail.model.bank.bankAccountNum`).d('银行账号'),
      defaultValidationMessages: {
        patternMismatch: intl
          .get('sslm.supplierEntryDetail.view.validatioin.bankAccountNum')
          .d('银行账号应为数字，字母或"-@._,/"'),
      },
    },
    {
      name: 'accountNature',
      lookupCode: 'SPFM.NATURE_OF_ACCOUNT',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.accountNature`).d('账户性质'),
    },
    {
      name: 'accountPurpose',
      lookupCode: 'SPFM.PURPOSE_OF_ACCOUNT',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.accountPurpose`).d('账户用途'),
    },
    {
      name: 'currencyLov',
      lovCode: 'SMDM.CURRENCY_SQL',
      type: 'object',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.currencyName`).d('币种'),
      lovPara: { tenantId: organizationId },
      noCache: true,
    },
    {
      name: 'currencyId',
      type: 'string',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyCode',
      type: 'string',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'currencyName',
      type: 'string',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'currencyIdMeaning',
      type: 'string',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'bankIdentifyCodeType',
      lookupCode: 'SPFM.BANK_IDENTIFY_CODE_TYPE',
      label: intl.get('sslm.common.model.bank.bankIdentifyCodeType').d('银行识别码类型'),
    },
    {
      name: 'bankIdentifyCode',
      label: intl.get('sslm.common.model.bank.bankIdentifyCode').d('银行识别码'),
      dynamicProps: {
        required: ({ record }) => Boolean(record.get('bankIdentifyCodeType')),
      },
    },
    {
      name: 'paymentTypeLov',
      lovCode: 'SMDM.PAYMENT_TYPE',
      type: 'object',
      label: intl.get(`sslm.supplierEntryDetail.model.bank.paymentType`).d('付款方式'),
      lovPara: { tenantId: organizationId },
      noCache: true,
    },
    {
      name: 'paymentType',
      type: 'string',
      bind: 'paymentTypeLov.typeCode',
    },
    {
      name: 'paymentTypeId',
      type: 'string',
      bind: 'paymentTypeLov.typeId',
    },
    {
      name: 'paymentTypeIdMeaning',
      type: 'string',
      bind: 'paymentTypeLov.typeName',
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'masterFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`sslm.supplierEntryDetail.model.bank.masterFlag`).d('主账号'),
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          const hasDefaultFlag = isEmpty(dataSet.toData());
          if (hasDefaultFlag) {
            return 1;
          }
          return 0;
        },
      },
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'intlBankAccountNum',
      label: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs/no-basic`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.BANK_INFO',
          ...queryParams,
          ...other,
          changeReqId,
          dataSource: 3,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-bank-acc-reqs/delete`,
        method: 'DELETE',
        data,
        params: { ...params, customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.BANK_INFO' },
      };
    },
  },
});

// 开票DS
const getInvoiceDS = ({ changeReqId, domesticForeignRelation }) => {
  return {
    paging: false,
    fields: [
      {
        name: 'invoiceHeader',
        type: 'string',
        label: intl.get('sslm.supplierEntryDetail.model.invoice.invoiceHeader').d('发票头'),
        disabled: true,
        required: true,
      },
      {
        name: 'taxRegistrationNumber',
        type: 'string',
        required: Number(domesticForeignRelation) === 1,
        label: intl
          .get('sslm.supplierEntryDetail.model.invoice.taxRegistrationNumber')
          .d('税务登记号'),
      },
      {
        name: 'depositBank',
        type: 'string',
        label: intl.get('sslm.supplierEntryDetail.model.invoice.depositBank').d('开户行'),
      },
      {
        name: 'bankAccountNum',
        type: 'secret',
        pattern: /^[0-9A-Za-z-@._,/]*$/,
        label: intl.get('sslm.supplierEntryDetail.model.invoice.bankAccountNum').d('开户行账号'),
      },
      {
        name: 'taxRegistrationAddress',
        type: 'string',
        label: intl
          .get('sslm.supplierEntryDetail.model.invoice.taxRegistrationAddress')
          .d('税务登记地址'),
      },
      {
        name: 'taxRegistrationPhone',
        type: 'string',
        label: intl
          .get('sslm.supplierEntryDetail.model.invoice.taxRegistrationPhone')
          .d('税务登记电话'),
      },
      {
        name: 'receiveMail',
        type: 'string',
        pattern: EMAIL,
        label: intl.get('sslm.supplierEntryDetail.model.invoice.receiveMail').d('收票人邮箱'),
      },
      {
        name: 'internationalTelCode',
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
      },
      {
        name: 'receivePhone',
        type: 'tel',
        regionField: 'internationalTelCode',
        dynamicProps: {
          pattern: ({ record }) => {
            return (record.get('internationalTelCode') || '+86') === '+86'
              ? PHONE
              : NOT_CHINA_PHONE;
          },
        },
        label: intl.get('sslm.supplierEntryDetail.model.invoice.receivePhone').d('收票人手机号'),
      },
      {
        name: 'receiver',
        type: 'string',
        label: intl.get('sslm.common.model.invoice.taker').d('收票人'),
      },
      {
        name: 'receiveAddress',
        type: 'string',
        label: intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams, ...other } = data;
        return {
          url: `${SRM_PLATFORM}/v1/${organizationId}/com-invoice-reqs/all`,
          method: 'GET',
          data: {
            customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.INVOICE_FORM',
            ...queryParams,
            ...other,
            changeReqId,
            dataSource: 3,
            companyId: -1,
          },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (dataSet) {
          dataSet.forEach(record => {
            Object.assign(record, { status: 'update' });
          });
        }
      },
    },
  };
};

// 财务DS
const getFinanceDS = ({ changeReqId }) => ({
  paging: false,
  fields: [
    {
      name: 'year',
      type: 'string',
      required: true,
      pattern: /([1-9])([0-9]{3})/,
      label: intl.get('sslm.supplierEntryDetail.model.financeInfo.year').d('年份'),
      maxLength: 4,
    },
    {
      name: 'currencyLov',
      label: intl.get('sslm.supplierEntryDetail.model.financeInfo.currency').d('币种'),
      type: 'object',
      required: true,
      lovCode: 'HPFM.CURRENCY',
      textField: 'currencyName',
      ignore: 'always',
    },
    {
      name: 'currencyCode',
      bind: 'currencyObj.currencyCode',
      type: 'string',
      defaultValue: 'CNY',
    },
    {
      name: 'currencyId',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyName',
      label: intl.get('sslm.supplierEntryDetail.model.financeInfo.currency').d('币种'),
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'totalAssets',
      required: true,
      type: 'number',
      label: intl.get('sslm.supplierEntryDetail.model.financeInfo.totalAssets').d('企业总资产(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'totalLiabilities',
      required: true,
      type: 'number',
      label: intl
        .get('sslm.supplierEntryDetail.model.financeInfo.totalLiabilities')
        .d('总负债(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'currentAssets',
      required: true,
      type: 'number',
      label: intl.get('sslm.supplierEntryDetail.model.financeInfo.currentAssets').d('流动资产(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'currentLiabilities',
      required: true,
      type: 'number',
      label: intl
        .get('sslm.supplierEntryDetail.model.financeInfo.currentLiabilities')
        .d('流动负债(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'revenue',
      required: true,
      type: 'number',
      label: intl.get('sslm.supplierEntryDetail.model.financeInfo.revenue').d('营业收入(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'netProfit',
      required: true,
      type: 'number',
      label: intl.get('sslm.supplierEntryDetail.model.financeInfo.netProfit').d('净利润(万)'),
      transformResponse: value => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'assetLiabilityRatio',
      type: 'string',
      label: intl
        .get('sslm.supplierEntryDetail.model.financeInfo.assetLiabilityRatio')
        .d('资产负债率'),
    },
    {
      name: 'currentRatio',
      type: 'string',
      label: intl.get('sslm.supplierEntryDetail.model.financeInfo.currentRatio').d('流动比率'),
    },
    {
      name: 'totalAssetsEarningsRatio',
      type: 'string',
      label: intl
        .get('sslm.supplierEntryDetail.model.financeInfo.totalAssetsEarningsRatio')
        .d('总资产收益率'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs/all`,
        method: 'GET',
        data: {
          ...data,
          changeReqId,
          companyId: -1,
          dataSource: 3,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs/delete`,
        method: 'DELETE',
        data,
        params,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

// 附件DS
const getAttachmentDS = ({ changeReqId }) => ({
  paging: false,
  fields: [
    {
      name: 'attachmentTypeMerge',
      type: 'string',
      required: true,
      label: intl.get('sslm.supplierEntryDetail.model.attachment.type').d('附件类型'),
      textField: 'meaning',
      valueField: 'value',
      transformResponse: (value, record) => {
        const { attachmentType, subAttachment } = record;
        if (attachmentType && subAttachment) {
          return [attachmentType, subAttachment];
        } else {
          return value;
        }
      },
      options: optionDs,
      ignore: 'always',
    },
    {
      name: 'attachmentType',
      type: 'string',
    },
    {
      name: 'subAttachment',
      type: 'string',
    },
    // {
    //   name: 'attachmentType',
    //   type: 'string',
    //   label: intl.get('sslm.supplierEntryDetail.model.attachment.type').d('附件类型'),
    // },
    {
      name: 'description',
      type: 'string',
      label: intl.get('sslm.supplierEntryDetail.model.attachment.description').d('附件描述'),
    },
    {
      name: 'longEffectiveFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.supplierEntryDetail.model.attachment.longEffective').d('长期有效'),
    },
    {
      name: 'endDate',
      type: 'date',
      label: intl.get('spfm.attachment.model.attachment.endDate').d('文件到期日'),
      transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      dynamicProps: {
        disabled: ({ record }) => record.get('longEffectiveFlag'),
        required: ({ record }) => !record.get('longEffectiveFlag'),
      },
    },
    {
      name: 'uploadDate',
      type: 'date',
      disabled: true,
      label: intl.get('sslm.supplierEntryDetail.model.attachment.uploadDate').d('最后更新时间'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('sslm.supplierEntryDetail.model.attachment.upload').d('附件上传'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/no-basic`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.ATTACHMENT_INFO',
          ...queryParams,
          ...other,
          ...data,
          changeReqId,
          dataSource: 3,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-attachment-reqs/delete`,
        method: 'DELETE',
        data,
        params: {
          ...params,
          customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL.ATTACHMENT_INFO',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
    update: ({ record, name, value }) => {
      if (name === 'longEffectiveFlag' && value === 1) {
        record.set('endDate', null);
      }
    },
  },
});

const optionDs = new DataSet({
  childrenField: 'children',
  autoQuery: true,
  fields: [{ name: 'value', type: 'string' }, { name: 'meaning', type: 'string' }],
  transport: {
    read: () => {
      return {
        url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/value/tree`,
        method: 'GET',
        params: {
          tenantId: organizationId,
          'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
          'SPFM.COMPANY.SUB_ATTACHMENT': 2,
        },
        data: {},
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          const { children, parentValue } = record.get(['children', 'parentValue']);
          if (!children && !parentValue) {
            record.set('disabled', true);
          }
        });
      }
    },
  },
  feedback: {
    loadSuccess: res => {
      if (getResponse(res)) {
        const childrenList = (res || []).filter(n => n.children);
        if (isEmpty(childrenList)) {
          notification.warning({
            message: intl
              .get('sslm.enterpriseInform.view.message.checkChild')
              .d('请检查【附件类型】值集是否关联子值集'),
          });
        }
      }
    },
  },
});

export { getAddressInfoDS, getBankInfoDS, getInvoiceDS, getFinanceDS, getAttachmentDS };
