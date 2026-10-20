import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';

import ReplayDetail from '@/routes/sbid/components/ReplayDetail';

@formatterCollections({
  code: ['ssrc.bidHall', 'hzero.common', 'ssrc.expertScoring'],
})
@connect(({ inquiryHallExpert, loading }) => ({
  inquiryHallExpert,
  inquiryHall: inquiryHallExpert,
  modelName: 'inquiryHallExpert',
  loading: loading.effects,
}))
export default class extends ReplayDetail {}
