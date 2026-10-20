/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getBankDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sslm.supplierDetail.view.message.bankCountryName').d('国家'),
      name: 'bankCountryId',
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.bankCode').d('银行编码'),
      name: 'bankCode',
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.bankName').d('银行名称'),
      name: 'bankName',
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.bankFirm').d('联行行号'),
      name: 'bankFirm',
    },
    {
      label: intl.get('sslm.supplierDetail.model.bankAccountData.bankBranchName').d('开户行名称'),
      name: 'bankBranchName',
    },
    {
      label: intl.get('sslm.supplierDetail.model.bankAccountData.bankAccountName').d('账户名称'),
      name: 'bankAccountName',
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.bankAccount').d('银行账户'),
      name: 'bankAccountNum',
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.accountNature').d('账户性质'),
      name: 'accountNatureMeaning',
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.accountPurpose').d('账户用途'),
      name: 'accountPurposeMeaning',
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.currencyName').d('币种'),
      name: 'currencyIdMeaning',
    },
    {
      name: 'bankIdentifyCodeType',
      lookupCode: 'SPFM.BANK_IDENTIFY_CODE_TYPE',
      label: intl.get('sslm.common.model.bank.bankIdentifyCodeType').d('银行识别码类型'),
    },
    {
      name: 'bankIdentifyCode',
      label: intl.get('sslm.common.model.bank.bankIdentifyCode').d('银行识别码'),
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.paymentType').d('付款方式'),
      name: 'paymentTypeIdMeaning',
    },
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'enabledFlag',
    },
    {
      label: intl.get('sslm.supplierDetail.view.message.primaryAccount').d('主账号'),
      name: 'masterFlag',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
    {
      name: 'intlBankAccountNum',
      label: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
    },
  ],
});
