import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const AdjustPriceDS = () => {
  return {
    autoQuery: true,
    cacheSelection: true,
    pageSize: 20,
    primaryKey: 'recordId',
    fields: [
      {
        name: 'callResult',
        label: intl
          .get('spc.advancedPricingRecord.model.callResult')
          .d('调⽤结果'),
      },
      {
        name: 'action',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'recordNum',
        label: intl
          .get('spc.advancedPricingRecord.model.recordNum')
          .d('调⽤记录编码'),
      },
      {
        name: 'triggerMode',
        label: intl.get('spc.advancedPricingRecord.model.triggerMode').d('触发⽅式'),
        lookupCode: 'SPC.PRICE.ADJUST_TRIGGER_MODE',
      },
      {
        name: 'callDetail',
        label: intl.get('spc.advancedPricingRecord.model.callDetail').d('调⽤详情'),
      },
      {
        name: 'errorMsg',
        label: intl.get('spc.advancedPricingRecord.model.errorMsg').d('错误信息'),
      },
      {
        name: 'executionResDoc',
        label: intl.get('spc.advancedPricingRecord.model.executionResDoc').d('执⾏结果单据'),
      },
      {
        name: 'callTime',
        label: intl.get('spc.advancedPricingRecord.model.callTime').d('调⽤时间'),
        type: 'date',
      },
      {
        name: 'callByName',
        label: intl.get('spc.advancedPricingRecord.model.callByName').d('调⽤⼈'),
      },
      {
        name: 'callRecord',
        label: intl.get('spc.advancedPricingRecord.model.callRecord').d('调⽤记录'),
      },
    ],
    transport: {
      read: ({ params }) => {
        const url = `${SRM_SPC}/v1/${organizationId}/price-adjust-records`;
        return {
          url,
          params: {
            ...params,
            customizeUnitCode: 'SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.FILTER',
          },
          method: 'GET',
        };
      },
    },
  };
};
const AdvancedPriceDS = () => {
  return {
    autoQuery: true,
    selection: false,
    cacheSelection: false,
    pageSize: 20,
    primaryKey: 'recordId',
    fields: [
      {
        name: 'callResult',
        label: intl
          .get('spc.advancedPricingRecord.model.recordResult')
          .d('取价结果'),
      },
      {
        name: 'action',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'recordNum',
        label: intl
          .get('spc.advancedPricingRecord.model.recordNum')
          .d('取价记录编码'),
      },
      {
        name: 'sourceFrom',
        label: intl.get('spc.advancedPricingRecord.model.sourceFrom').d('调用来源'),
        lookupCode: 'SSRC.PRICE_LIB_SOURCE_FROM',
      },
      {
        name: 'advancedDetail',
        label: intl.get('spc.advancedPricingRecord.model.advancedDetail').d('取价详情'),
      },
      {
        name: 'pricingServiceCode',
        label: intl.get('spc.advancedPricingRecord.model.pricingServiceCode').d('取价服务编码'),
      },
      {
        name: 'sourceNum',
        label: intl
          .get('spc.advancedPricingRecord.model.sourceNum')
          .d('来源单据编码'),
      },
      {
        name: 'priceSourceType',
        label: intl
          .get('spc.advancedPricingRecord.model.priceSourceType')
          .d('价格来源方式'),
        lookupCode: 'SPC.PRICE_SOURCE_TYPE',
      },
      {
        name: 'discountRuleFlag',
        label: intl.get('spc.advancedPricingRecord.model.discountRuleFlag').d('是否匹配折扣'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'errorMsg',
        label: intl.get('spc.advancedPricingRecord.model.errorMsg').d('错误信息'),
      },
      {
        name: 'callTime',
        label: intl.get('spc.advancedPricingRecord.model.callTime').d('调用时间'),
        type: 'date',
      },
    ],
    transport: {
      read: ({ params }) => {
        const url = `${SRM_SPC}/v1/${organizationId}/price-pricing-records`;
        return {
          url,
          params,
          method: 'GET',
        };
      },
    },
  };
};


export { AdjustPriceDS, AdvancedPriceDS };
