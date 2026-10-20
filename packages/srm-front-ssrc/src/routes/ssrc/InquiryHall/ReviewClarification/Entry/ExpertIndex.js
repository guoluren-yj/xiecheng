import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import { ReviewClarification } from '../index';

@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
@connect(({ inquiryHallExpert, loading }) => ({
  inquiryHallExpert,
  inquiryHall: inquiryHallExpert,
  modelName: 'inquiryHallExpert',
  isLoading: loading.effects['inquiryHallExpert/fetchClarifyNotifyDataList'],
}))
@remote({
  code: 'SSRC_REVIEW_CLARIFICATION',
})
export default class extends ReviewClarification {}
