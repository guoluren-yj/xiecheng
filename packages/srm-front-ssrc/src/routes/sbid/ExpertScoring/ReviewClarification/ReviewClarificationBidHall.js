import { connect } from 'dva';

import ReviewClarification from './../../components/ReviewClarification';

@connect(({ expertScoringBidHall, loading }) => ({
  expertScoringBidHall,
  modelName: 'expertScoringBidHall',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
