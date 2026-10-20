import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

const getQueryUrl = (data) => {
  const { type, biddingTarget, organizationId, japanDutchFlag } = data;
  let url = '';

  if (!organizationId) {
    return;
  }

  if (japanDutchFlag === 1) {
    if (type === 'PURCHASE') {
      url = `${SRM_SSRC}/v1/${organizationId}/bidding/total-price/bidding-record`;
    }

    // if (type === 'SUPPLIER') {
    //   url = `${SRM_SSRC}/v1/${organizationId}/bidding-sup-header-recs/total-price/table`;
    // }
  } else {
    if (type === 'SUPPLIER') {
      if (biddingTarget === 'UNIT_PRICE') {
        url = `${SRM_SSRC}/v1/${organizationId}/bidding-sup-line-recs/unit/item/table`;
      }
      if (biddingTarget === 'TOTAL_PRICE') {
        url = `${SRM_SSRC}/v1/${organizationId}/bidding-sup-header-recs/total-price/table`;
      }
    }

    if (type === 'PURCHASE') {
      if (biddingTarget === 'UNIT_PRICE') {
        url = `${SRM_SSRC}/v1/${organizationId}/bidding/unit/item/bidding-record`;
      }
      if (biddingTarget === 'TOTAL_PRICE') {
        url = `${SRM_SSRC}/v1/${organizationId}/bidding/total-price/bidding-record`;
      }
    }
  }

  return url;
};

// 单价竞价-竞价分析明细表格
const unitPriceAnalysisDetailTableDS = (payload = {}) => {
  const { biddingTarget, japanDutchFlag } = payload || {};

  return {
    autoQuery: false,
    primaryKey: 'uniqueValueKey',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.common.supplier`).d('供应商'),
        name: 'displaySupplierName',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidPrice').d('出价'),
        name: 'displayQuotationPrice',
      },
      {
        name: 'validQuotationSecPrice',
        dynamicProps: {
          label() {
            return biddingTarget === 'UNIT_PRICE'
              ? intl.get('ssrc.biddingHall.model.biddingRecord.unitPrice').d('单价')
              : intl.get('ssrc.biddingHall.model.biddingRecord.totalPrice').d('总价');
          },
        },
      },
      {
        name: 'validNetSecondaryPrice',
        dynamicProps: {
          label() {
            return biddingTarget === 'UNIT_PRICE'
              ? intl.get('ssrc.biddingHall.model.biddingRecord.unitPrice').d('单价')
              : intl.get('ssrc.biddingHall.model.biddingRecord.totalPrice').d('总价');
          },
        },
      },
      {
        name: 'quotedDate',
        dynamicProps: {
          label() {
            let label = intl.get('ssrc.biddingHall.model.analysisBidTime').d('出价时间');
            if (japanDutchFlag === 1) {
              label = intl.get('ssrc.biddingHall.model.acceptanceTime').d('接受时间');
            }

            return label;
          },
        },
      },

      // japan dutch
      {
        label: intl.get(`ssrc.common.supplier`).d('供应商'),
        name: 'disSupplierCompanyName',
      },
      {
        name: 'biddingRoundNumber',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRoundPrice`).d('叫价'),
        name: 'biddingRoundPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRoundQuotedCount`).d('接受数'),
        name: 'biddingRoundQuotedCount',
      },
    ],
    transport: {
      read: ({ params = {} }) => {
        const { commonProps = {} } = payload || {};
        const { ...otherCommonProps } = commonProps;

        const url = getQueryUrl(commonProps);
        if (!url) {
          return;
        }

        return {
          url,
          method: 'POST',
          params: {
            ...(params || {}),
          },
          data: {
            ...otherCommonProps,
          },
        };
      },
    },
  };
};

export { unitPriceAnalysisDetailTableDS };
