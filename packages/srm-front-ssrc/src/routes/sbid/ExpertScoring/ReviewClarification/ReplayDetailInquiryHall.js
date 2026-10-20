import { connect } from 'dva';

import ReplayDetail from './../../components/ReplayDetail';

@connect(({ expertScoringInquiryHall, loading }) => ({
  expertScoringInquiryHall,
  modelName: 'expertScoringInquiryHall',
  loading: loading.effects,
}))
export default class extends ReplayDetail {}
