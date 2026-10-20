/*
 * @Date: 2023-08-24 15:43:20
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 发现采购方
const findPurchaserDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    { name: 'companyId' },
    {
      name: 'companyName',
      label: intl.get('sslm.supplierInvite.model.invite.enterpriseName').d('企业名称'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'industries',
      label: intl.get('spfm.companySearch.model.company.industry').d('行业'),
    },
    {
      name: 'serviceAreaCodeNames',
      label: intl.get('spfm.companySearch.model.company.serviceArea').d('送货或服务范围'),
    },
    {
      name: 'childrenIndustryNames',
      label: intl.get('spfm.companySearch.model.company.childrenIndustry').d('产品服务分类'),
    },
    {
      name: 'registeredCapital',
      type: 'number',
      label: intl.get('sslm.common.view.companyInfo.registeredCapital').d('注册资本(万元)'),
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.enterprise.view.message.currencyCode').d('注册资本币种'),
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/companies/search/purchaser/new`,
        method: 'POST',
        params: {
          ...params,
          customizeUnitCode:
            'SSLM.SEARCH_PURCHASER.LIST.TABLE,SSLM.SEARCH_PURCHASER.LIST.SEARCH_BAR',
        },
      };
    },
  },
});

export { findPurchaserDS };
