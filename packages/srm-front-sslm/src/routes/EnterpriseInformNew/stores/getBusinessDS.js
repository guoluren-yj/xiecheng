/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isArray, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { getReadTransport, serviceTypeMap, businessTypeMap } from '../utils';

const organizationId = getCurrentOrganizationId();
const PURCHASE = 'purchase';
const SALE = 'sale';
const BUSINESSAGENT = 'agent';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

// 处理禁用
const getDisabled = ({ dataSet, isAllPlatform } = {}) => {
  const { reqStatus } = dataSet.getState('dsState') || {};
  return !['NEW', 'REJECTED', 'CONFIRM_REJECTED'].includes(reqStatus) || !isAllPlatform;
};

export const getBusinessDS = ({
  isAllPlatform = false,
  partnerTenantId,
  readOnlyFlag = false,
  code,
  ...rest
} = {}) => ({
  forceValidate: true,
  paging: false,
  dataKey: readOnlyFlag && isAllPlatform ? 'newBusiness' : null,
  fields: [
    {
      name: 'businessType',
      multiple: !readOnlyFlag, // 只读页面不多选
      lookupCode: 'SPFM.MASTER.STATUS',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.enterpriseInform.view.model.business.businessType').d('主要身份'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet, isAllPlatform }),
        required: ({ dataSet }) => !getDisabled({ dataSet, isAllPlatform }),
      },
      // transformRequest: value => value && value.map(n => ({ serviceAreaCode: n })),
      transformResponse: (_, data) => {
        const businessTypeValue = [];
        const { saleFlag, purchaseFlag } = data;
        if (saleFlag === 1) businessTypeValue.push(SALE);
        if (purchaseFlag === 1) businessTypeValue.push(PURCHASE);
        return !isEmpty(businessTypeValue) ? businessTypeValue : null;
      },
    },
    // 变更后
    {
      name: 'businessTypeMeaning',
      transformResponse: (_, data) => {
        const businessTypeValue = [];
        const { saleFlag, purchaseFlag } = data;
        if (saleFlag === 1) businessTypeValue.push(SALE);
        if (purchaseFlag === 1) businessTypeValue.push(PURCHASE);
        const businessTypeList = businessTypeValue.map(i => {
          const object = businessTypeMap().find(n => n.value === i);
          return object.text;
        });
        return businessTypeList || [];
      },
    },
    // 变更前
    {
      name: 'businessTypeOldMeaning',
      transformResponse: (_, data) => {
        const businessTypeValue = [];
        const { businessCheckTypeOld } = data;
        if (businessCheckTypeOld) {
          const [saleFlagOld = '0', purchaseFlagOld = '0'] = businessCheckTypeOld.split('');
          if (saleFlagOld === '1') businessTypeValue.push(SALE);
          if (purchaseFlagOld === '1') businessTypeValue.push(PURCHASE);
        }
        const businessTypeList = businessTypeValue.map(i => {
          const object = businessTypeMap().find(n => n.value === i);
          return object.text;
        });
        return businessTypeList || [];
      },
    },
    {
      name: 'serviceType',
      multiple: !readOnlyFlag, // 只读页面不多选
      lookupCode: 'SPFM.BUSINESS.NATURE',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl.get('sslm.enterpriseInform.view.model.business.serviceType').d('经营性质'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet, isAllPlatform }),
        required: ({ dataSet }) => !getDisabled({ dataSet, isAllPlatform }),
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
    // 经营性质变更后值
    {
      name: 'serviceTypeMeaning',
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
        const serviceTypeList = serviceTypeValue.map(i => {
          const object = serviceTypeMap().find(n => n.value === i);
          return object.text;
        });
        return serviceTypeList || [];
      },
    },
    // 变更前值
    {
      name: 'serviceTypeOldMeaning',
      transformResponse: (_, data) => {
        const serviceTypeValue = [];
        const { serviceCheckTypeOld } = data;
        if (serviceCheckTypeOld) {
          const [
            manufacturerFlagOld = '0',
            traderFlagOld = '0',
            servicerFlagOld = '0',
            agentFlagOld = '0',
            integrationFlagOld = '0',
            contractorFlagOld = '0',
            dealerFlagOld = '0',
          ] = serviceCheckTypeOld.split('');
          if (manufacturerFlagOld === '1') serviceTypeValue.push(MANUFACTURER);
          if (traderFlagOld === '1') serviceTypeValue.push(TRADER);
          if (servicerFlagOld === '1') serviceTypeValue.push(SERVICER);
          if (agentFlagOld === '1') serviceTypeValue.push(BUSINESSAGENT);
          if (integrationFlagOld === '1') serviceTypeValue.push(INTEGRATION);
          if (contractorFlagOld === '1') serviceTypeValue.push(CONTRACTOR);
          if (dealerFlagOld === '1') serviceTypeValue.push(DEALER);
        }
        const serviceTypeList = serviceTypeValue.map(i => {
          const object = serviceTypeMap().find(n => n.value === i);
          return object.text;
        });
        return serviceTypeList || [];
      },
    },
    {
      name: 'interBusinessShield',
      label: intl
        .get('spfm.enterprise.model.message.interBusinessShield')
        .d('不允许其他企业找到我'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet, isAllPlatform }),
      },
      help: intl
        .get('hptl.portalAssign.model.portalAssign.interBusinessShieldInfo')
        .d('若勾选，其他用户将无法在【发现供应商】和【发现采购方】查询到当前企业'),
    },
    {
      name: 'industryReqList',
      label: intl.get('sslm.enterpriseInform.view.model.business.industryReqList').d('行业类型'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet, isAllPlatform }),
        required: ({ dataSet }) => !getDisabled({ dataSet, isAllPlatform }),
      },
      transformRequest: value => value && value.map(n => ({ industryId: n })),
      transformResponse: value => value && isArray(value) && value.map(n => n.industryId),
    },
    {
      name: 'industryReqListMeaning',
      transformResponse: (_, data) => (data.industryReqList || []).map(n => n.industryName),
    },
    // 变更前
    {
      name: 'industryReqListOldMeaning',
      transformResponse: (_, data) => (data.industryReqListOld || []).map(n => n.industryName),
    },
    {
      name: 'industryCategoryReqList',
      label: intl.get('sslm.enterpriseInform.view.model.business.industryList').d('主营品类'),
      dynamicProps: {
        disabled: ({ dataSet, record }) => {
          const disabledFlag = isEmpty(record.get('industryReqList'));
          return disabledFlag || getDisabled({ dataSet, isAllPlatform });
        },
        required: ({ dataSet }) => !getDisabled({ dataSet, isAllPlatform }),
      },
      transformRequest: value => value && value.map(n => ({ industryCategoryId: n })),
      transformResponse: value => value && isArray(value) && value.map(n => n.industryCategoryId),
    },
    {
      name: 'industryCategoryReqListMeaning',
      transformResponse: (_, data) => (data.industryCategoryReqList || []).map(n => n.categoryName),
    },
    // 变更前
    {
      name: 'industryCategoryReqListOldMeaning',
      transformResponse: (_, data) =>
        (data.industryCategoryReqListOld || []).map(n => n.categoryName),
    },
    {
      name: 'serviceAreaReqList',
      multiple: !readOnlyFlag, // 只读页面不多选
      lookupCode: 'SPFM.COMPANY.SERVICE_AREA',
      lovPara: { tenantId: isAllPlatform ? 0 : partnerTenantId },
      label: intl
        .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
        .d('送货服务范围'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet, isAllPlatform }),
        required: ({ dataSet }) => !getDisabled({ dataSet, isAllPlatform }),
      },
      transformRequest: value => value && value.map(n => ({ serviceAreaCode: n })),
      transformResponse: value => value && isArray(value) && value.map(n => n.serviceAreaCode),
    },
    {
      name: 'serviceAreaReqListMeaning',
      transformResponse: (_, data) =>
        (data.serviceAreaReqList || []).map(n => n.serviceAreaMeaning),
    },
    // 变更前
    {
      name: 'serviceAreaReqListOldMeaning',
      transformResponse: (_, data) =>
        (data.serviceAreaReqListOld || []).map(n => n.serviceAreaMeaning),
    },
    {
      name: 'website',
      label: intl.get('sslm.enterpriseInform.view.model.business.website').d('公司官网'),
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet, isAllPlatform }),
      },
    },
    {
      name: 'logoUrl',
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet, isAllPlatform }),
      },
      label: intl.get('sslm.enterpriseInform.view.model.business.logoUrl').d('公司 Logo'),
    },
    {
      name: 'description',
      dynamicProps: {
        disabled: ({ dataSet }) => getDisabled({ dataSet, isAllPlatform }),
      },
      label: intl.get('sslm.enterpriseInform.view.model.business.description').d('公司简介'),
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      if (name === 'businessType') {
        record.set({
          saleFlag: value && value.includes(SALE) ? 1 : 0,
          purchaseFlag: value && value.includes(PURCHASE) ? 1 : 0,
        });
      }
      if (name === 'serviceType') {
        record.set({
          manufacturerFlag: value && value.includes(MANUFACTURER) ? 1 : 0,
          traderFlag: value && value.includes(TRADER) ? 1 : 0,
          servicerFlag: value && value.includes(SERVICER) ? 1 : 0,
          agentFlag: value && value.includes(BUSINESSAGENT) ? 1 : 0,
          integrationFlag: value && value.includes(INTEGRATION) ? 1 : 0,
          contractorFlag: value && value.includes(CONTRACTOR) ? 1 : 0,
          dealerFlag: value && value.includes(DEALER) ? 1 : 0,
        });
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { changeReqId, companyId, supplierCompanyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-business-req/after/${changeReqId}`
        : `${SRM_SSLM}/v1/${organizationId}/sup-business-req/after/${changeReqId}`;
      return !readOnlyFlag
        ? {
            url,
            method: 'GET',
            params: {},
            data: {
              dataSource: 1,
              companyId,
              supplierCompanyId,
              supplierFlag: isAllPlatform ? 0 : 1,
              customizeTenantId: isAllPlatform ? null : partnerTenantId,
              customizeUnitCode: isAllPlatform ? null : code,
            },
          }
        : readUrlProps;
    },
  },
});
