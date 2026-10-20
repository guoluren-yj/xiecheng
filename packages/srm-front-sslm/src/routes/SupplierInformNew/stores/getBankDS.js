/*
 * @Date: 2023-04-11 09:12:34
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

export const getBankDS = () => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'bankCountryId',
      type: 'object',
      required: true,
      lovCode: 'HPFM.COUNTRY',
      lovPara: { enabledFlag: 1 },
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankCountry`).d('国家'),
      transformRequest: value => value && value.countryId,
      transformResponse: (value, data) => {
        const { bankCountryId, bankCountryCode, bankCountryName } = data;
        return value
          ? {
              countryId: bankCountryId,
              countryCode: bankCountryCode,
              countryName: bankCountryName,
            }
          : null;
      },
    },
    {
      name: 'bankCountryCode',
      bind: 'bankCountryId.countryCode',
    },
    {
      name: 'bankCountryName',
      bind: 'bankCountryId.countryName',
    },
    {
      name: 'bankCode',
      required: true,
      bind: 'bankFirm.bankCode',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankCode`).d('银行代码'),
    },
    {
      name: 'bankId',
      bind: 'bankFirm.bankId',
    },
    {
      name: 'bankName',
      bind: 'bankFirm.bankName',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankName`).d('银行名称'),
    },
    {
      name: 'bankFirm',
      type: 'object',
      required: true,
      lovCode: 'SMDM.BANK_BRANCK_FIRM_TENANT',
      lovPara: { tenantId: organizationId },
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankFirm`).d('联行行号'),
      transformRequest: value => value && value.bankFirm,
      transformResponse: (value, data) => {
        const {
          bankCode,
          bankId,
          bankName,
          bankFirm,
          bankBranchId,
          bankBranchCode,
          bankBranchName,
        } = data;
        return value
          ? {
              bankCode,
              bankId,
              bankName,
              bankFirm,
              bankBranchId,
              bankBranchCode,
              bankBranchName,
            }
          : null;
      },
    },
    {
      name: 'bankBranchId',
      bind: 'bankFirm.bankBranchId',
    },
    {
      name: 'bankBranchCode',
      bind: 'bankFirm.bankBranchCode',
    },
    {
      name: 'bankBranchName',
      required: true,
      bind: 'bankFirm.bankBranchName',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankBranchName`).d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      required: true,
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankAccountName`).d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      required: true,
      type: 'secret',
      label: intl.get(`sslm.enterpriseInform.view.model.bank.bankAccountNum`).d('银行账号'),
      pattern: /^[0-9A-Za-z-@._,/]*$/,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('sslm.enterpriseInform.view.validatioin.bankAccountNum')
          .d('银行账号应为数字，字母或"-@._,/"'),
      },
    },
    {
      name: 'accountNature',
      lookupCode: 'SPFM.NATURE_OF_ACCOUNT',
      label: intl.get('sslm.enterpriseInform.view.model.bank.accountNature').d('账户性质'),
    },
    {
      name: 'accountPurpose',
      lookupCode: 'SPFM.PURPOSE_OF_ACCOUNT',
      label: intl.get('sslm.enterpriseInform.view.model.bank.accountPurpose').d('账户用途'),
    },
    {
      name: 'currencyId',
      type: 'object',
      lovCode: 'SMDM.CURRENCY_SQL',
      lovPara: { tenantId: organizationId },
      label: intl.get(`sslm.enterpriseInform.view.model.bank.currencyName`).d('币种'),
      transformRequest: value => value && value.currencyId,
      transformResponse: (value, data) => {
        const { currencyId, currencyCode, currencyIdMeaning } = data;
        return value ? { currencyId, currencyCode, currencyName: currencyIdMeaning } : null;
      },
    },
    {
      name: 'currencyCode',
      bind: 'currencyId.currencyCode',
    },
    {
      name: 'currencyName',
      bind: 'currencyId.currencyName',
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
      name: 'paymentType',
      type: 'object',
      lovCode: 'SMDM.PAYMENT_TYPE',
      lovPara: { tenantId: organizationId },
      label: intl.get(`sslm.enterpriseInform.view.model.bank.paymentType`).d('付款方式'),
      transformRequest: value => value && value.typeCode,
      transformResponse: (value, data) => {
        const { paymentTypeId, paymentType, paymentTypeIdMeaning } = data;
        return value
          ? { typeId: paymentTypeId, typeCode: paymentType, typeName: paymentTypeIdMeaning }
          : null;
      },
    },
    {
      name: 'paymentTypeId',
      bind: 'paymentType.typeId',
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
      label: intl.get(`sslm.enterpriseInform.view.model.bank.masterFlag`).d('主账号'),
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
      dataSet.forEach(record => {
        if (record.get('supplierBankAccountId') || record.get('extSourceAccountFlag')) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { companyId, changeReqId, supplierCompanyId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-bank-acc-reqs/no-basic`,
        method: 'GET',
        params: {},
        data: {
          companyId,
          changeReqId,
          dataSource: 2,
          supplierFlag: 1,
          supplierCompanyId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BANK',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-bank-acc-reqs/delete`,
        method: 'DELETE',
        params: {
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BANK',
        },
        data,
      };
    },
  },
});
