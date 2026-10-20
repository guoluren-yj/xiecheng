import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

// 竞价规则
const BiddingRuleDS = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.biddingHall.model.biddingTarget`).d('竞价对象'),
        name: 'biddingTargetMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.biddingRules.openRuleOfData`).d('数据公开规则'),
        name: 'openRuleMeaning',
      },
      {
        label: intl.get('ssrc.biddingHall.view.biddingStrategy').d('出价策略'),
        name: 'biddingStrategyMeaning',
      },
      {
        label: intl.get('ssrc.biddingHall.model.rankRuleMeaning').d('排名规则'),
        name: 'rankRuleMeaning',
      },
      {
        name: 'biddingEliminateRoundNumber',
        label: intl.get(`ssrc.common.model.template.biddingEliminateRoundNumber`).d('供方淘汰规则'),
        type: 'string',
      },
      {
        name: 'biddingMinShortlistedSupplierNumber',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingMinShortlistedSupplierNumber`)
          .d('最少入围供应商数'),
      },
      {
        name: 'biddingEndType',
        label: intl.get('ssrc.common.model.template.biddingEndType').d('竞价结束方式'),
        type: 'string',
        multiple: true,
        disabled: true,
        transformResponse: (value) => {
          if (!value) {
            return '';
          }
          return value ? value.split(',') : null;
        },
        dynamicProps: {
          lookupCode({ record }) {
            const biddingMode = record.get('biddingMode');

            let code = 'SSRC_BIDDING_JAPANESE_END_TYPE';

            if (biddingMode === 'DUTCH_BIDDING') {
              code = 'SSRC_BIDDING_DUTCH_END_TYPE';
            }

            return code;
          },
        },
      },
    ],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, advanced = {}, header = {} } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;
        const { biddingType, trialBiddingFlag } = header || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/rule`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, ...advanced, biddingType, trialBiddingFlag },
        };
      },
    },
  };
};

// 竞价现场
const BiddingSiteDS = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps, advanced = {} } = data || {};
        const { organizationId, ...otherCommonProps } = commonProps || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/site-info/query`,
          method: 'POST',
          params: {
            ...(params || {}),
          },
          data: { ...otherCommonProps, ...advanced },
        };
      },
    },
  };
};

// 竞价现场-出价次数
const BidCountDS = (payload = {}) => {
  return {
    autoQuery: false,
    paging: false,
    fields: [],
    transport: {
      read: ({ params = {} }) => {
        const { organizationId, rfxHeaderId, headerInfoDS } = payload || {};

        if (!organizationId) {
          return;
        }

        const {
          biddingStatus, // 竞价单状态
          roundNumber,
          quotationOrderType, // 报价次序
          biddingTarget, // 竞价对象
          biddingUnitPriceRule, // 出价规则-整单批量或者单个
        } = headerInfoDS?.current?.get([
          'biddingStatus',
          'roundNumber',
          'quotationOrderType',
          'biddingTarget',
          'biddingUnitPriceRule',
        ]);

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/overview`,
          method: 'POST',
          params: {
            ...(params || {}),
          },
          data: {
            tenantId: organizationId,
            rfxHeaderId,
            roundNumber,
            biddingStatus,
            quotationOrderType,
            biddingTarget,
            biddingUnitPriceRule,
          },
        };
      },
    },
  };
};

export { BiddingRuleDS, BiddingSiteDS, BidCountDS };
