import React from 'react';
import { compose } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

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
      `SSRC.INQUIRY_HALL.RF_CHECK.HEADER_BUTTONS_RFP`, // 头部按钮组
      `SSRC.INQUIRY_HALL.RF_CHECK.HEADER_INFO_RFP`, // 基础信息
      `SSRC.INQUIRY_HALL.RF_CHECK.SUPPLIER_QUO_RFP`, // 供应商
      'SSRC.INQUIRY_HALL.RF_CHECK.ITEM_LINE', // 报价明细
      'SSRC.INQUIRY_HALL.RF_CHECK.ATTACHMENT_RFP', // 附件
    ],
  }),
  formatterCollections({
    code: [
      'ssrc.rfCheck',
      'ssrc.rf',
      'ssrc.bidHall',
      'ssrc.rfDetail',
      'ssrc.inquiryHall',
      'ssrc.priceLibraryNew',
      'ssrc.supplierQuotation',
      'ssrc.common',
    ],
  })
)(
  remote(
    {
      code: 'SSRC_RF_CHECK',
      name: 'remote',
    },
    {
      events: {
        // 确定供应商保存后的回调事件
        remoteSaveUpdateCallBackEvent() {},
      },
    }
  )(Index)
);
