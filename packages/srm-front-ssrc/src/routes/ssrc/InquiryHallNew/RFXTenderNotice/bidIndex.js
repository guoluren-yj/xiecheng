import { compose } from 'lodash';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import Page from './Page';

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.BID_HALL_RFX_NOTICE.HEADER_RFX`, // 基础信息
      `SSRC.BID_HALL_RFX_NOTICE.LINE_ITEM_RFX`, // 采购需求-table
      `SSRC.BID_HALL_RFX_NOTICE.MEMBER_RFX`, // 联系人,联系方式
      `SSRC.BID_HALL_RFX_NOTICE.ATTACH_RFX`, // 附件
      `SSRC.BID_HALL_RFX_NOTICE.HEADER_CARD_RFX`, // 基础信息-card
      `SSRC.BID_HALL_RFX_NOTICE.LINE_ITEM_CARD_RFX`, // 采购需求-card
      `SSRC.BID_HALL_RFX_NOTICE.MEMBER_CARD_RFX`, // 联系人,联系方式-card
      `SSRC.BID_HALL_RFX_NOTICE.ATTACH_CARD_RFX`, // 附件-card
      `SSRC.BID_HALL_RFX_NOTICE.QUOTATION_CARD_RFX`, // 对供应商要求-card
      `SSRC.BID_HALL_RFX_NOTICE.QUOTATION_RFX`, // 对供应商要求
    ],
    manualQuery: true,
  }),
  formatterCollections({
    code: [['ssrc.rfxNotice', 'ssrc.inquiryHall', 'hzero.c7nProUI', 'ssrc.common']],
  })
)(Page);
