import moment from 'moment';
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { getCurrentLanguage } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { HZERO_PLATFORM } from 'utils/config';

const language = getCurrentLanguage();

// 地址DS
const addressDS = () => ({
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
      label: intl.get(`spfm.address.model.address.countryId`).d('国家/地区'),
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
      label: intl.get(`spfm.address.model.address.regionId`).d('省/市/区'),
    },
    {
      name: 'regionPathName',
      readOnly: true,
      type: 'string',
      label: intl.get(`spfm.address.model.address.regionId`).d('省/市/区'),
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
      label: intl.get(`spfm.address.model.address.businessAddress`).d('经营地址'),
    },
    {
      name: 'quickIndex',
      bind: 'countryObj.quickIndex',
    },
    {
      name: 'postCode',
      type: 'string',
      label: intl.get(`spfm.address.model.address.postCode`).d('邮政编码'),
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
      label: intl.get(`spfm.address.model.address.description`).d('地址备注'),
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
  },
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/addresses/${companyId}`,
        method: 'GET',
        params: {},
        data: {},
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/addresses/${companyId}/batch-delete`,
        method: 'DELETE',
        data,
        params: {},
      };
    },
  },
});

// 银行DS
const bankInfoDS = () => ({
  dataToJSON: 'all',
  paging: false,
  fields: [
    {
      name: 'bankCountryObj',
      type: 'object',
      required: true,
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`spfm.bank.model.bank.bankCountry`).d('国家/地区'),
      noCache: true,
      ignore: 'always',
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
      lovCode: 'SMDM.BANK_BRANCH_FIRM',
      type: 'object',
      label: intl.get(`spfm.bank.model.bank.bankFirm`).d('联行行号'),
      ignore: 'always',
    },
    {
      name: 'bankFirm',
      required: true,
      type: 'string',
      bind: 'bankFirmObj.bankFirm',
    },
    {
      name: 'bankCode',
      required: true,
      disabled: true,
      type: 'string',
      bind: 'bankFirmObj.bankCode',
      label: intl.get(`spfm.bank.model.bank.bankInternalCode`).d('银行（国际）代码'),
    },
    {
      name: 'bankName',
      disabled: true,
      type: 'string',
      bind: 'bankFirmObj.bankName',
      label: intl.get(`spfm.bank.model.bank.bankName`).d('银行名称'),
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
      label: intl.get(`spfm.bank.model.bank.bankBranchName`).d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      required: true,
      type: 'string',
      label: intl.get(`spfm.bank.model.bank.bankAccountName`).d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      required: true,
      type: 'secret',
      pattern: /^[0-9A-Za-z-@._,/]*$/,
      label: intl.get(`spfm.bank.model.bank.bankAccountNum`).d('银行账号'),
      defaultValidationMessages: {
        patternMismatch: intl
          .get('spfm.bank.view.validatioin.bankAccountNum')
          .d('银行账号应为数字，字母或"-@._,/"'),
      },
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
      label: intl.get(`spfm.bank.model.bank.masterFlag`).d('主账号'),
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          const hasMasterFlag = isEmpty(dataSet.toData());
          if (hasMasterFlag) {
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
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/bank-accounts/${companyId}`,
        method: 'GET',
        params: {},
        data: {},
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/bank-accounts/${companyId}/batch-delete`,
        method: 'DELETE',
        data,
        params: {},
      };
    },
  },
});

// 开票DS
const invoiceDS = () => ({
  paging: false,
  fields: [
    {
      name: 'invoiceHeader',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.invoiceHeader').d('发票头'),
      disabled: true,
    },
    {
      name: 'taxRegistrationNumber',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationNumber').d('税务登记号'),
      computedProps: {
        required: ({ dataSet }) => dataSet.getState('domesticFlag'),
      },
    },
    {
      name: 'depositBank',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.depositBank').d('开户行'),
    },
    {
      name: 'bankAccountNum',
      type: 'secret',
      label: intl.get('spfm.enterprise.model.invoice.bankAccountNum').d('开户行账号'),
    },
    {
      name: 'taxRegistrationAddress',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationAddress').d('税务登记地址'),
    },
    {
      name: 'taxRegistrationPhone',
      type: 'string',
      label: intl.get('spfm.enterprise.model.invoice.taxRegistrationPhone').d('税务登记电话'),
    },
    {
      name: 'receiveMail',
      type: 'string',
      pattern: EMAIL,
      label: intl.get('spfm.enterprise.model.invoice.receiveMail').d('收票人邮箱'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'receivePhone',
      type: 'string',
      dynamicProps: ({ record }) => {
        return {
          pattern:
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
        };
      },
      label: intl.get('spfm.enterprise.model.invoice.receivePhone').d('收票人手机号'),
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
});

// 财务DS
const financeDS = () => ({
  paging: false,
  fields: [
    {
      name: 'year',
      type: 'string',
      required: true,
      pattern: /([1-9])([0-9]{3})/,
      label: intl.get('spfm.finance.model.financeInfo.year').d('年份'),
      maxLength: 4,
    },
    {
      name: 'currencyLov',
      label: intl.get('spfm.common.model.currency').d('币种'),
      type: 'object',
      required: true,
      lovCode: 'HPFM.CURRENCY',
      textField: 'currencyName',
      ignore: 'always',
    },
    {
      name: 'currencyId',
      required: true,
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.common.model.currency').d('币种'),
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'totalAssets',
      required: true,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.totalAssets').d('企业总资产(万)'),
      transformResponse: (value) => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'totalLiabilities',
      required: true,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.totalLiabilities').d('总负债(万)'),
      transformResponse: (value) => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'currentAssets',
      required: true,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.currentAssets').d('流动资产(万)'),
      transformResponse: (value) => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'currentLiabilities',
      required: true,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.currentLiabilities').d('流动负债(万)'),
      transformResponse: (value) => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'revenue',
      required: true,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.revenue').d('营业收入(万)'),
      transformResponse: (value) => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'netProfit',
      required: true,
      type: 'number',
      label: intl.get('spfm.finance.model.financeInfo.netProfit').d('净利润(万)'),
      transformResponse: (value) => {
        return language === 'en_US' ? value / 100 : value;
      },
    },
    {
      name: 'assetLiabilityRatio',
      type: 'string',
      label: intl.get('spfm.finance.model.financeInfo.assetLiabilityRatio').d('资产负债率'),
    },
    {
      name: 'currentRatio',
      type: 'string',
      label: intl.get('spfm.finance.model.financeInfo.currentRatio').d('流动比率'),
    },
    {
      name: 'totalAssetsEarningsRatio',
      type: 'string',
      label: intl.get('spfm.finance.model.financeInfo.totalAssetsEarningsRatio').d('总资产收益率'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/finance/${companyId}`,
        method: 'GET',
        params: {},
        data: {},
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/finance/${companyId}`,
        method: 'DELETE',
        data,
        params: {},
      };
    },
  },
});

// 附件DS
const attachmentDS = () => ({
  paging: false,
  fields: [
    {
      name: 'attachmentTypeMerge',
      type: 'string',
      required: true,
      label: intl.get('entity.attachment.type').d('附件类型'),
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
    {
      name: 'description',
      type: 'string',
      label: intl.get('entity.attachment.description').d('附件描述'),
    },
    {
      name: 'endDate',
      type: 'date',
      label: intl.get('spfm.attachment.model.attachment.endDate').d('文件到期日'),
      transformRequest: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      transformResponse: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      computedProps: {
        required: ({ record }) => !record.get('longEffectiveFlag'),
        disabled: ({ record }) => record.get('longEffectiveFlag'),
      },
    },
    {
      name: 'longEffectiveFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('spfm.attachment.model.attachment.longEffective').d('是否长期有效'),
    },
    {
      name: 'uploadDate',
      type: 'date',
      disabled: true,
      label: intl.get('spfm.attachment.model.attachment.uploadDate').d('最后更新时间'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('entity.attachment.upload').d('附件上传'),
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/attachments/${companyId}`,
        method: 'GET',
        params: {},
        data: {},
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { companyId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/companies/attachments/${companyId}`,
        method: 'DELETE',
        data,
        params: {},
      };
    },
  },
  events: {
    update: ({ value, name, record }) => {
      if (value && name === 'longEffectiveFlag') {
        record.set('endDate', null);
      }
    },
  },
});

const optionDs = new DataSet({
  childrenField: 'children',
  autoQuery: true,
  fields: [
    { name: 'value', type: 'string' },
    { name: 'meaning', type: 'string' },
  ],
  transport: {
    read: () => {
      return {
        url: `${HZERO_PLATFORM}/v1/lovs/value/tree`,
        method: 'GET',
        params: {
          'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
          'SPFM.COMPANY.SUB_ATTACHMENT': 2,
        },
        data: {},
      };
    },
  },
});
export { addressDS, bankInfoDS, invoiceDS, financeDS, attachmentDS };
