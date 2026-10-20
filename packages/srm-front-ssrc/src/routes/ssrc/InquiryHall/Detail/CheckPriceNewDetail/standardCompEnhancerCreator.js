import { observer } from 'mobx-react';
import { compose } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

const HocComponent = (NewComponent) => {
  return compose(
    withCustomize({
      unitCode: [
        // rfx
        'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_HEADER_COLLAPSE',
        'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_DETAIL_TABS',
        'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_HEADER',
        'SSRC.INQUIRY_HALL_DETAIL.ITEM_DETAIL',
        'SSRC.INQUIRY_HALL_DETAIL.COST.REMARK',
        'SSRC.INQUIRY_HALL_DETAIL.SUPPLIER_DETAIL',
        'SSRC.INQUIRY_HALL_DETAIL.ALL_QUOTATION',
        'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE.ATTACHMENT',
        'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE', // 老核价明细-附件表格 checkPriceDetail
        'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE_COLUMNS',
        'SSRC.INQUIRY_HALL_DETAIL.CHECK_PRICE.WIN_BID_DETAIL',

        // bid
        'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_HEADER_COLLAPSE',
        'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_DETAIL_TABS',
        'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_HEADER',
        'SSRC.INQUIRY_BID_DETAIL.ITEM_DETAIL',
        'SSRC.INQUIRY_BID_DETAIL.COST.REMARK',
        'SSRC.INQUIRY_BID_DETAIL.SUPPLIER_DETAIL',
        'SSRC.INQUIRY_BID_DETAIL.ALL_QUOTATION',
        'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE.ATTACHMENT',
        'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE',
        'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE_ATTACHMENT_TABLE_COLUMNS',
        'SSRC.INQUIRY_BID_DETAIL.CHECK_PRICE.WIN_BID_DETAIL',
      ],
    }),
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.supplierQuotation',
        'ssrc.common',
        'ssrc.priceLibraryNew',
        'ssrc.queryRfq',
        'scux.ssrc',
        'sscux.ssrc',
      ],
    }),
    remote(
      {
        code: 'SSRC_DETAIL_CHECK_PRICE_NEW', // CheckPriceNewDetail
        name: 'remote',
      },
      {
        events: {},
      }
    )
  )(observer(NewComponent));
};

export { HocComponent };
