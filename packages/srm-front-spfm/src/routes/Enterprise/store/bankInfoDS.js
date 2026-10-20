/**
 * bankInfoDS.js - 银行信息DS
 * @date: 2020-09-09
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

function bankInfoDS() {
  return {
    paging: false,
    autoQuery: false,
    fields: [
      {
        name: 'bankCountryObj',
        type: 'object',
        required: true,
        lovCode: 'HPFM.COUNTRY',
        lovPara: { enabledFlag: 1 },
        label: intl.get(`spfm.bank.model.bank.bankCountry`).d('国家'),
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
        lovCode: 'SMDM.BANK_BRANCH_FIRM',
        type: 'object',
        label: intl.get(`spfm.bank.model.bank.bankFirm`).d('联行行号'),
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
        type: 'string',
        label: intl.get(`spfm.bank.model.bank.bankAccountNum`).d('银行账号'),
        pattern: /^[0-9A-Za-z-@._,/]*$/,
        defaultValidationMessages: {
          patternMismatch: intl
            .get('spfm.bank.view.validatioin.bankAccountNum')
            .d('银行账号应为数字，字母或"-@._,/"'),
        },
      },
      {
        name: 'accountNature',
        lookupCode: 'SPFM.NATURE_OF_ACCOUNT',
        label: intl.get(`spfm.bank.model.bank.accountNature`).d('账户性质'),
      },
      {
        name: 'accountPurpose',
        lookupCode: 'SPFM.PURPOSE_OF_ACCOUNT',
        label: intl.get(`spfm.bank.model.bank.accountPurpose`).d('账户用途'),
      },
      {
        name: 'currencyLov',
        lovCode: 'SMDM.CURRENCY_SQL',
        type: 'object',
        lovPara: { tenantId: 0 },
        label: intl.get(`spfm.bank.model.bank.currencyName`).d('币种'),
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
        name: "bankIdentifyCodeType",
        lookupCode: "SPFM.BANK_IDENTIFY_CODE_TYPE",
        label: intl.get("sslm.common.model.bank.bankIdentifyCodeType").d("银行识别码类型"),
      },
      {
        name: "bankIdentifyCode",
        label: intl.get("sslm.common.model.bank.bankIdentifyCode").d("银行识别码"),
        dynamicProps: {
          required: ({ record }) => Boolean(record.get("bankIdentifyCodeType")),
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
            const hasDefaultFlag = isEmpty(dataSet.toData());
            if (hasDefaultFlag) {
              return 1;
            }
            return 0;
          },
        },
      },
      {
        name: 'option',
        label: intl.get('hzero.common.button.action').d('操作'),
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
  };
}

export default bankInfoDS;
