import { connect } from 'dva';

import ReviewClarification from './../../components/ReviewClarification';

@connect(({ expertScoring, loading }) => ({
  expertScoring,
  modelName: 'expertScoring',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
