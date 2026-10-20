import React from 'react';
import { compose } from 'lodash';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import Page from './Page';
import { StoreProvider } from './store/index';

// 所有功能组件都是StoreProvider的子组件 所以context能传递到任何子组件
const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: [
      'SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.BASE_HEADER_RFP',
      'SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.SUPPLIER_LIST_RFP',
      'SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_HEADER_RFP',
      'SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_RFP',
      'SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.HEADER_BUTTONS_RFP',
    ],
  }),
  formatterCollections({ code: ['ssrc.rf', 'ssrc.rfCheck', 'ssrc.inquiryHall', 'ssrc.common'] })
)(Index);
