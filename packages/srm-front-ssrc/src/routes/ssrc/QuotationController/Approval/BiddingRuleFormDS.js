import intl from 'utils/intl';
// import moment from 'moment';
// import { isEmpty, isNil } from 'lodash';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
// import { getDateTimeFormat } from 'utils/utils';

// import { dayHourMinuteToTimestamp } from '@/utils/utils';

// 竞价规则DS
const biddingRuleDS = () => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingStrategy').d('出价策略'),
        name: 'biddingStrategyMeaning',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
        name: 'floatTypeMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        name: 'quotationRange',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
      },
      {
        label: intl
          .get('ssrc.biddingHall.view.message.biddingSpreadPrice')
          .d('价差'),
        name: 'biddingSpreadPrice',
        type: 'number',
      },
    ],
  };
};

export { biddingRuleDS };
