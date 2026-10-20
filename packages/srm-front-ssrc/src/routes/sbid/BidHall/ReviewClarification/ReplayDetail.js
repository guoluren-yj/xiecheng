import { connect } from 'dva';

import ReplayDetail from './../../components/ReplayDetail';

@connect(({ bidHall, loading }) => ({
  bidHall,
  modelName: 'bidHall',
  loading: loading.effects,
}))
export default class extends ReplayDetail {}
