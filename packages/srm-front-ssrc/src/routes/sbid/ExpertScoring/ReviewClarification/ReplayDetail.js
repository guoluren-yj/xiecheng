import { connect } from 'dva';

import ReplayDetail from './../../components/ReplayDetail';

@connect(({ expertScoring, loading }) => ({
  expertScoring,
  modelName: 'expertScoring',
  loading: loading.effects,
}))
export default class extends ReplayDetail {}
