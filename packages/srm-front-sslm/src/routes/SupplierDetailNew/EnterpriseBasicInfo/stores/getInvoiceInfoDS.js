/*
 * @Date: 2023-08-17 09:31:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getInvoiceInfoDS = () => ({
  fields: [
    {
      name: 'invoiceHeader',
      label: intl.get('sslm.supplierDetail.model.companyInfo.invoiceHeader').d('发票头'),
    },
    {
      name: 'taxRegistrationNumber',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.taxNumber').d('税务登记号'),
    },
    {
      name: 'depositBank',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.depositBank').d('开户行'),
    },
    {
      name: 'bankAccountNum',
      type: 'secret',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.bankAccountNum').d('开户行账号'),
    },
    {
      name: 'taxRegistrationAddress',
      label: intl.get('sslm.supplierDetail.model.companyInfo.taxAddress').d('税务登记地址'),
    },
    {
      name: 'taxRegistrationPhone',
      label: intl.get('sslm.supplierDetail.model.companyInfo.taxPhone').d('税务登记电话'),
    },
    {
      name: 'receiver',
      label: intl.get('sslm.common.model.invoice.taker').d('收票人'),
    },
    {
      name: 'receiveMail',
      label: intl.get('sslm.enterpriseInform.view.model.invoice.receiveMail').d('收票人邮箱'),
    },
    {
      name: 'receivePhone',
      label: intl.get('sslm.supplierDetail.model.companyInfo.receivePhone').d('收票人手机号'),
    },
    {
      name: 'receiveAddress',
      label: intl.get('sslm.common.model.invoice.ticketAddress').d('收票地址'),
    },
  ],
});
