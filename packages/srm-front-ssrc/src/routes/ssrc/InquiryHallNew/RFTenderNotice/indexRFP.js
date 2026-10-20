import { compose } from 'lodash';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import Page from './Page';

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.INQUIRY_HALL_RF_NOTICE.HEADER_RFP`, // 基础信息
      `SSRC.INQUIRY_HALL_RF_NOTICE.LINE_ITEM_RFP`, // 采购需求
      `SSRC.INQUIRY_HALL_RF_NOTICE.FORM_RFP`, // 方案要求
      `SSRC.INQUIRY_HALL_RF_NOTICE.MEMBER_RFP`, // 采购联系人
      `SSRC.INQUIRY_HALL_RF_NOTICE.ATTACH_RFP`, // 附件
    ],
    manualQuery: true,
  }),
  formatterCollections({
    code: [['ssrc.rfNotice', 'hzero.c7nProUI', 'ssrc.common']],
  })
)(Page);
