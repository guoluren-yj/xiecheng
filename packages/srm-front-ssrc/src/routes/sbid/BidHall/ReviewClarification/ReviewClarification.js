import { connect } from 'dva';

import ReviewClarification from './../../components/ReviewClarification';

@connect(({ bidHall, loading }) => ({
  bidHall,
  modelName: 'bidHall',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
