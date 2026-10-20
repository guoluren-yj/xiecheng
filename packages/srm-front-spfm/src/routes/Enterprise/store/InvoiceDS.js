/**
 * InvoiceDS.js - 开票信息DS
 * @date: 2020-09-09
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { EMAIL, NOT_CHINA_PHONE } from 'utils/regExp';

function InvoiceDS(companyName, unifiedSocialCode) {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'invoiceHeader',
        defaultValue: companyName,
        readOnly: true,
        type: 'string',
        label: intl.get('spfm.enterprise.model.invoice.invoiceHeader').d('发票头'),
      },
      {
        name: 'taxRegistrationNumber',
        defaultValue: unifiedSocialCode,
        type: 'string',
        readOnly: true,
        label: intl.get('spfm.enterprise.model.invoice.taxRegistrationNumber').d('税务登记号'),
      },
      {
        name: 'depositBank',
        type: 'string',
        label: intl.get('spfm.enterprise.model.invoice.depositBank').d('开户行'),
      },
      {
        name: 'bankAccountNum',
        type: 'string',
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
        name: 'receiver',
        label: intl.get('spfm.enterprise.model.invoice.receiver').d('收票人'),
      },
      {
        name: 'receiveMail',
        type: 'string',
        pattern: EMAIL,
        label: intl.get('spfm.enterprise.model.invoice.receiveMail').d('收票人邮箱'),
      },
      {
        name: 'objectVersionNumber',
        type: 'string',
      },
      {
        name: 'receivePhone',
        type: 'string',
        pattern: NOT_CHINA_PHONE,
        label: intl.get('spfm.enterprise.model.invoice.receivePhone').d('收票人手机号'),
      },
      {
        name: 'receiveAddress',
        label: intl.get('spfm.enterprise.model.invoice.receiveAddress').d('收票地址'),
      },
    ],
  };
}

export default InvoiceDS;
