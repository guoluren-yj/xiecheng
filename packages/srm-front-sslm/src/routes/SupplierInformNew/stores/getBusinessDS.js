/*
 * @Date: 2023-04-10 17:08:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isArray, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const BUSINESSAGENT = 'agent';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

// 处理禁用
const getDisabled = ({ dataSet }) => {
  const { reqStatus, isSubdomainsRegister } = dataSet.getState('dsState') || {};
  return !isSubdomainsRegister || !['NEW', 'REJECTED'].includes(reqStatus);
};

export const getBusinessDS = ({ compareFlag = false } = {}) => ({
  forceValidate: true,
  fields: [
    {
      name: 'serviceType',
      multiple: true,
      lookupCode: 'SPFM.BUSINESS.NATURE',
      label: intl.get('sslm.enterpriseInform.view.model.business.serviceType').d('经营性质'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
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
      label: intl.get('sslm.enterpriseInform.view.model.business.industryReqList').d('行业类型'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
      transformRequest: value => value && value.map(n => ({ industryId: n })),
      transformResponse: value => value && isArray(value) && value.map(n => n.industryId),
    },
    {
      name: 'industryReqListMeaning',
      label: intl.get('sslm.enterpriseInform.view.model.business.industryReqList').d('行业类型'),
      transformResponse: (_, data) => (data.industryReqList || []).map(n => n.industryName),
    },
    {
      name: 'industryCategoryReqList',
      label: intl.get('sslm.enterpriseInform.view.model.business.industryList').d('主营品类'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
      transformRequest: value => value && value.map(n => ({ industryCategoryId: n })),
      transformResponse: value => value && isArray(value) && value.map(n => n.industryCategoryId),
    },
    {
      name: 'industryCategoryReqListMeaning',
      label: intl.get('sslm.enterpriseInform.view.model.business.industryList').d('主营品类'),
      transformResponse: (_, data) => (data.industryCategoryReqList || []).map(n => n.categoryName),
    },
    {
      name: 'serviceAreaReqList',
      multiple: !compareFlag, // 对比关闭多选属性，不然对比渲染会有问题
      lookupCode: 'SPFM.COMPANY.SERVICE_AREA',
      label: intl
        .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
        .d('送货服务范围'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
      transformRequest: value => value && value.map(n => ({ serviceAreaCode: n })),
      transformResponse: value => value && isArray(value) && value.map(n => n.serviceAreaCode),
    },
    {
      name: 'serviceAreaReqListMeaning',
      label: intl
        .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
        .d('送货服务范围'),
      transformResponse: (_, data) =>
        (data.serviceAreaReqList || []).map(n => n.serviceAreaMeaning),
    },
    {
      name: 'website',
      label: intl.get('sslm.enterpriseInform.view.model.business.website').d('公司官网'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
    },
    {
      name: 'logoUrl',
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
      label: intl.get('sslm.enterpriseInform.view.model.business.logoUrl').d('公司 Logo'),
    },
    {
      name: 'description',
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet }),
      },
      label: intl.get('sslm.enterpriseInform.view.model.business.description').d('公司简介'),
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      if (name === 'serviceType') {
        record.set({
          manufacturerFlag: value && value.includes('manufacturer') ? 1 : 0,
          traderFlag: value && value.includes('trader') ? 1 : 0,
          servicerFlag: value && value.includes('servicer') ? 1 : 0,
          agentFlag: value && value.includes('agent') ? 1 : 0,
          integrationFlag: value && value.includes('integration') ? 1 : 0,
          contractorFlag: value && value.includes('contractor') ? 1 : 0,
          dealerFlag: value && value.includes('dealer') ? 1 : 0,
        });
      }
      if (name === 'industryReqList') {
        record.set({ industryCategoryReqList: null });
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { changeReqId, companyId, supplierCompanyId } = dataSet.getState('dsState') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-business-req/after/${changeReqId}`,
        method: 'GET',
        params: {},
        data: {
          companyId,
          dataSource: 2,
          supplierFlag: 1,
          supplierCompanyId,
          customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BUSINESS',
        },
      };
    },
  },
});
