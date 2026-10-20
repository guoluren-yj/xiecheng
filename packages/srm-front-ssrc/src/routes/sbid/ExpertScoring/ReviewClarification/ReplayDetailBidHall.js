import { connect } from 'dva';

import ReplayDetail from './../../components/ReplayDetail';

@connect(({ expertScoringBidHall, loading }) => ({
  expertScoringBidHall,
  modelName: 'expertScoringBidHall',
  loading: loading.effects,
}))
export default class extends ReplayDetail {}
