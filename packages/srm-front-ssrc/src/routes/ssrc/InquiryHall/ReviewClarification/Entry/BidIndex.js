import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import { ReviewClarification } from '../index';

@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
@connect(({ inquiryHallBid, loading }) => ({
  inquiryHallBid,
  inquiryHall: inquiryHallBid,
  modelName: 'inquiryHallBid',
  isLoading: loading.effects['inquiryHallBid/fetchClarifyNotifyDataList'],
}))
@remote({
  code: 'SSRC_REVIEW_CLARIFICATION',
})
export default class extends ReviewClarification {}
