/*
 * @Date: 2023-08-16 20:01:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getContactDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.name').d('姓名'),
      name: 'name',
      type: 'secret',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.gender').d('性别'),
      name: 'gender',
      lookupCode: 'HPFM.GENDER',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.mail').d('邮箱'),
      name: 'mail',
      type: 'secret',
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.mobilephone').d('手机号码'),
      name: 'mobilephone',
      type: 'tel',
      regionField: 'internationalTelCode',
    },
    {
      name: 'idTypeMeaning',
      label: intl.get('sslm.enterpriseInform.model.personal.certificateType').d('证件类型'),
    },
    {
      name: 'idNum',
      type: 'secret',
      label: intl.get('sslm.enterpriseInform.view.model.contactPerson.idNum').d('证件号码'),
    },
    {
      label: intl.get('sslm.supplierDetail.view.model.contactPerson.contactType').d('联系人类型'),
      name: 'contactTypeMeaning',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.department').d('部门'),
      name: 'department',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.position').d('职位'),
      name: 'position',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.telephone').d('固定电话'),
      name: 'telephone',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'description',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.contactsData.defaultFlag').d('默认联系人'),
      name: 'defaultFlag',
    },
    {
      label: intl.get('hzero.common.status.enable').d('启用'),
      name: 'enabledFlag',
    },
  ],
});
