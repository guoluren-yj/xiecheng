import { compose } from 'lodash';
import { observer } from 'mobx-react';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { AllQuoteLine } from './AllQuoteLine';

export default compose(
  WithCustomizeC7N({
    unitCode: [
      `SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL`, // 基础信息
      `SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`, // 阶梯报价-表格信息
    ],
  }),
  observer
)(AllQuoteLine);
