/*
 * @Date: 2024-08-09 10:26:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import intl from 'utils/intl';

const BUSINESSAGENT = 'agent';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

export const businessDS = () => ({
  fields: [
    {
      name: 'businessType',
      lookupCode: 'SPFM.MASTER.STATUS',
      label: intl.get('spfm.enterprise.model.business.businessType').d('主要身份'),
      transformResponse: (value, data) => {
        const { saleFlag, purchaseFlag } = data;
        const businessTypeList = [];
        if (saleFlag) {
          businessTypeList.push('sale');
        }
        if (purchaseFlag) {
          businessTypeList.push('purchase');
        }
        return isEmpty(businessTypeList) ? null : businessTypeList;
      },
    },
    {
      name: 'interBusinessShield',
      label: intl
        .get(`spfm.enterprise.model.message.interBusinessShield`)
        .d('不允许其他企业找到我'),
    },
    {
      name: 'serviceType',
      label: intl.get('spfm.enterprise.model.business.serviceType').d('经营性质'),
      lookupCode: 'SPFM.BUSINESS.NATURE',
      transformResponse: (_, data) => {
        const serviceTypeValue = [];
        const {
          manufacturerFlag,
          traderFlag,
          servicerFlag,
          agentFlag,
          integrationFlag,
          contractorFlag,
          dealerFlag,
        } = data;
        if (manufacturerFlag === 1) serviceTypeValue.push(MANUFACTURER);
        if (traderFlag === 1) serviceTypeValue.push(TRADER);
        if (servicerFlag === 1) serviceTypeValue.push(SERVICER);
        if (agentFlag === 1) serviceTypeValue.push(BUSINESSAGENT);
        if (integrationFlag === 1) serviceTypeValue.push(INTEGRATION);
        if (contractorFlag === 1) serviceTypeValue.push(CONTRACTOR);
        if (dealerFlag === 1) serviceTypeValue.push(DEALER);
        return !isEmpty(serviceTypeValue) ? serviceTypeValue : null;
      },
    },
    {
      name: 'industryReqList',
      label: intl.get('spfm.enterprise.model.business.industryList').d('行业类型'),
      transformResponse: (_, data) => (data.industryList || []).map(n => n.industryName),
    },
    {
      name: 'industryCategoryReqList',
      label: intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类'),
      transformResponse: (_, data) => (data.industryCategoryList || []).map(n => n.categoryName),
    },
    {
      name: 'serviceAreaReqList',
      label: intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围'),
      transformResponse: (_, data) => (data.serviceAreaList || []).map(n => n.serviceAreaMeaning),
    },
    {
      name: 'website',
      label: intl.get('spfm.enterprise.model.business.website').d('公司官网'),
    },
    {
      name: 'logoUrl',
      label: intl.get('spfm.enterprise.view.message.logo').d('公司 Logo'),
    },
    {
      name: 'description',
      label: intl.get('spfm.enterprise.model.business.description').d('公司简介'),
    },
  ],
});
