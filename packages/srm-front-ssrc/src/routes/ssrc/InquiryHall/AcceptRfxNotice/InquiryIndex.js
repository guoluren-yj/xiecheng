import { connect } from 'dva';
import { Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';

import { AcceptRfxNotice } from './index';

const HOCComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM_INFO', // 基础信息
        'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM', // 中标公告表单
        'SSRC.INQUIRY_HALL_NOTICE.NOTICE_FORM_READ', // 中标公告表单(只读)
      ],
    })(
      connect(({ inquiryHallNew, loading }) => ({
        modelName: 'inquiryHallNew',
        inquiryHallNew,
        inquiryHall: inquiryHallNew,
        fetchWInnerBidNoticeLoading: loading.effects['inquiryHallNew/fetchWInnerBidNotice'],
        saveWInnerBidNoticeLoading: loading.effects['inquiryHallNew/saveWInnerBidNotice'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: ['ssrc.inquiryHall', 'ssrc.bidHall', 'ssrc.common', 'ssrc.acceptBidNotice', 'ssrc.scux'],
        })(
          remote({
            code: 'SSRC_ACCEPT_RFX_NOTICE',
            name: 'remote',
          }, {
            events: {
              onChange(){},
            },
          })(Com)
        )
      )
    )
  );
};

export default HOCComponent(AcceptRfxNotice);
