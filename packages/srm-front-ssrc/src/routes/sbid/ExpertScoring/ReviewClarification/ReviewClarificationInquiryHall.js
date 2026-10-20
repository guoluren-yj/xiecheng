import { connect } from 'dva';

import ReviewClarification from './../../components/ReviewClarification';

@connect(({ expertScoringInquiryHall, loading }) => ({
  expertScoringInquiryHall,
  modelName: 'expertScoringInquiryHall',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
