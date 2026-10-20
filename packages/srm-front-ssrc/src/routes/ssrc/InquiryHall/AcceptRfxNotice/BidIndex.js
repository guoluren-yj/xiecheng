import { connect } from 'dva';
import { Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
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
      connect(({ inquiryHall, loading }) => ({
        inquiryHall,
        fetchWInnerBidNoticeLoading: loading.effects['inquiryHall/fetchWInnerBidNotice'],
        saveWInnerBidNoticeLoading: loading.effects['inquiryHall/saveWInnerBidNotice'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: ['ssrc.inquiryHall', 'ssrc.bidHall', 'ssrc.common', 'ssrc.acceptBidNotice', 'ssrc.scux'],
        })(Com)
      )
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(AcceptRfxNotice));
