import { SRM_SSRC } from '_utils/config';

import { getPurCustomizeUnitCode } from '@/routes/ssrc/BiddingHall/utils/utils.js';

// 头查询
const headerDS = ({ rfxHeaderId, organizationId }) => {
  return {
    autoQuery: false,
    paging: false,
    fields: [],
    transport: {
      read: () => {
        if (!organizationId || !rfxHeaderId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/bidding/header-info/query`,
          method: 'POST',
          params: {
            customizeUnitCode: getPurCustomizeUnitCode('headerTag'),
          },
          data: { rfxHeaderId },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        const curRecord = dataSet?.current;
        const biddingNodeDTOS = curRecord.get('biddingNodeDTOS') || [];
        let allHeaderDate = {};
        biddingNodeDTOS.forEach((item) => {
          // 签到
          if (item.nodeName === 'SIGN') {
            allHeaderDate = {
              ...allHeaderDate,
              headerSignInStartDate: item.startDate,
              headerSignInEndDate: item.endDate,
            };
          } else if (item.nodeName === 'TRIAL_BIDDING') {
            allHeaderDate = {
              ...allHeaderDate,
              headerTrialBiddingStartDate: item.startDate,
              headerTrialBiddingEndDate: item.endDate,
            };
          } else if (item.nodeName === 'BIDDING') {
            allHeaderDate = {
              ...allHeaderDate,
              headerQuotationStartDate: item.startDate,
              headerQuotationEndDate: item.endDate,
            };
          } else if (item.nodeName === 'SUPPLEMENT_PRICE') {
            // 补充单价
            allHeaderDate = {
              ...allHeaderDate,
              headerSupplementPriceStartDate: item.startDate,
              headerSupplementPriceEndDate: item.endDate,
            };
          } else if (item.nodeName === 'DEFER_BIDDING') {
            // 延时竞价
            allHeaderDate = {
              ...allHeaderDate,
              headerQuotationEndDate: item.endDate,
              deferBiddingFlag: item.currentFlag,
            };
          }
        });
        // eslint-disable-next-line no-unused-expressions
        curRecord?.set('allHeaderDateTime', allHeaderDate);
      },
    },
  };
};

export { headerDS };
