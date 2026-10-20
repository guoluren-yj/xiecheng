import intl from 'utils/intl';

import { SRM_SSRC } from '_utils/config';

const biddingHistoryTableDS = (options = {}) => {
  const { japOrDutchBiddingTotalPrice } = options || {};

  return {
    autoQuery: false,
    selection: false,
    primaryKey: 'uniqueValueKey',
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.ranking`).d('排名'),
        name: 'biddingQuotationRank',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.supplierName`).d('供应商名称'),
        name: 'displaySupplierName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.gridQuotationPrice`).d('报价'),
        name: 'displayQuotationPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
        name: 'quotedDate',
      },
    ],
    transport: {
      read: ({ data, params = {} }) => {
        const { commonProps = {}, advanced = {}, totalPriceFlag, ...others } = data;
        const { organizationId, customizeUnitCode, ...otherCommonProps } = commonProps;

        if (!organizationId) {
          return;
        }

        let currentUrl = '';
        if (totalPriceFlag === 1) {
          currentUrl = `${SRM_SSRC}/v1/${organizationId}/bidding/sup/header/cur/record`;
        }

        // japan, dutch total
        if (japOrDutchBiddingTotalPrice && japOrDutchBiddingTotalPrice()) {
          currentUrl = `${SRM_SSRC}/v1/${organizationId}/bidding/sup/header/cur/round/record`;
        }

        return {
          url: currentUrl || `${SRM_SSRC}/v1/${organizationId}/bidding/sup/line/cur/record`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode,
          },
          data: { ...otherCommonProps, ...advanced, ...others },
        };
      },
    },
  };
};

export { biddingHistoryTableDS };
