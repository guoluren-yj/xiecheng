/*
 * @Date: 2023-08-16 19:16:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getBusinessInfoDS = () => ({
  fields: [
    {
      name: 'businessNature',
      label: intl.get('sslm.supplierDetail.model.companyInfo.businessNature').d('经营性质'),
    },
    {
      name: 'industryName',
      label: intl.get('sslm.supplierDetail.model.companyInfo.industryName').d('行业类型'),
    },
    {
      name: 'categoryName',
      label: intl.get('sslm.supplierDetail.model.companyInfo.categoryName').d('主营品类'),
    },
    {
      name: 'serviceArea',
      label: intl
        .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
        .d('送货服务范围'),
    },
    {
      name: 'website',
      label: intl.get('sslm.common.view.company.site').d('公司官网'),
    },
    {
      name: 'description',
      label: intl.get('sslm.common.view.company.introduction').d('公司简介'),
    },
  ],
});
