/*
 * getCuxEnterpriseVerifyDS - 企业验证方式 DS（二开）
 * 对公账户打款（REMIT）改为供应商填写打款信息
 */
import intl from 'utils/intl';
import { getEnterpriseVerifyDS } from 'srm-front-sslm/lib/routes/EnterpriseCertification/stores/getAffiliatedEnterprisesDS';

// 供应商打款信息
// 后端使用扩展字段存储：attributeVarchar1-状态、attributeVarchar2-银行名称、
// attributeVarchar3-开户行名称、attributeVarchar4-银行账号、attributeDecimal1-打款金额
const getRemitVerifyFields = () => [
  {
    name: 'accountName',
    required: true,
    disabled: true,
    label: intl.get('sslm.enterpriseCertification.model.remit.accountName').d('账户名称'),
  },
  {
    name: 'attributeVarchar2',
    required: true,
    label: intl.get('spfm.bank.model.bank.bankName').d('银行名称'),
  },
  {
    name: 'attributeVarchar3',
    required: true,
    label: intl.get('spfm.bank.model.bank.bankBranchName').d('开户行名称'),
  },
  {
    name: 'attributeVarchar4',
    required: true,
    pattern: /^[0-9A-Za-z-@._,/]*$/,
    label: intl.get('spfm.bank.model.bank.bankAccountNum').d('银行账号'),
  },
  {
    name: 'attributeDecimal1',
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
