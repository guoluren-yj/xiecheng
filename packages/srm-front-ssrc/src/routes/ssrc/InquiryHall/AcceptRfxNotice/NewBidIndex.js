import { connect } from 'dva';
import { Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { AcceptRfxNotice } from './index';

const HOCComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_NOTICE.NOTICE_FORM_INFO', // 基础信息
        'SSRC.BID_HALL_NOTICE.NOTICE_FORM', // 中标公告表单
        'SSRC.BID_HALL_NOTICE.NOTICE_FORM_READ', // 中标公告表单(只读)
      ],
    })(
      connect(({ inquiryHallBid, loading }) => ({
        modelName: 'inquiryHallBid',
        inquiryHallBid,
        inquiryHall: inquiryHallBid,
        fetchWInnerBidNoticeLoading: loading.effects['inquiryHallBid/fetchWInnerBidNotice'],
        saveWInnerBidNoticeLoading: loading.effects['inquiryHallBid/saveWInnerBidNotice'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: [
            'ssrc.inquiryHall',
            'ssrc.bidHall',
            'ssrc.common',
            'ssrc.acceptBidNotice',
            'ssrc.scux',
          ],
        })(
          remote(
            {
              code: 'SSRC_ACCEPT_BID_NOTICE',
              name: 'remote',
            },
            {
              events: {
                onChange() {},
                cuxSaveAfter() {}, // 保存后置埋点
              },
            }
          )(Com)
        )
      )
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(AcceptRfxNotice));
