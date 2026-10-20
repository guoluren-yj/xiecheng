/*
 * getCuxEnterpriseVerifyDS - 企业验证方式 DS（二开）
 * 对公账户打款（REMIT）改为供应商填写打款信息
 */
import intl from 'utils/intl';
import { getEnterpriseVerifyDS } from 'srm-front-sslm/lib/routes/EnterpriseCertification/stores/getAffiliatedEnterprisesDS';

// 供应商打款信息
const getRemitVerifyFields = () => [
  {
    name: 'accountName',
    required: true,
    disabled: true,
    label: intl.get('sslm.enterpriseCertification.model.remit.accountName').d('账户名称'),
  },
  {
    name: 'bankName',
    required: true,
    label: intl.get('spfm.bank.model.bank.bankName').d('银行名称'),
  },
  {
    name: 'bankBranchName',
    required: true,
    label: intl.get('spfm.bank.model.bank.bankBranchName').d('开户行名称'),
  },
  {
    name: 'bankAccountNum',
    required: true,
    pattern: /^[0-9A-Za-z-@._,/]*$/,
    label: intl.get('spfm.bank.model.bank.bankAccountNum').d('银行账号'),
  },
  {
    name: 'payAmount',
    required: true,
    type: 'number',
    min: 0,
    max: 1,
    precision: 2,
    label: intl
      .get('sslm.enterpriseCertification.model.remit.payAmount')
      .d('打款金额（0-1元）'),
  },
];

const getCuxEnterpriseVerifyDS = key => {
  if (key !== 'REMIT') {
    return getEnterpriseVerifyDS(key);
  }
  return {
    autoCreate: true,
    fields: getRemitVerifyFields(),
  };
};

export { getCuxEnterpriseVerifyDS };
