/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getAddressDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sslm.supplierDetail.model.suDe.addressData.countryName').d('国家'),
      name: 'countryName',
    },
    {
      label: intl.get('sslm.enterpriseInform.view.model.address.regionPathName').d('省/市/区'),
      name: 'regionName',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.addressData.businessAddress').d('经营地址'),
      name: 'addressDetail',
    },
    {
      label: intl.get('sslm.supplierDetail.model.suDe.addressData.postCode').d('邮政编码'),
      name: 'postCode',
    },
    {
      label: intl.get('sslm.enterpriseInform.view.model.address.description').d('地址备注'),
      name: 'description',
    },
    {
      label: intl.get('hzero.common.status.enable').d('启用'),
      name: 'enabledFlag',
    },
  ],
});
