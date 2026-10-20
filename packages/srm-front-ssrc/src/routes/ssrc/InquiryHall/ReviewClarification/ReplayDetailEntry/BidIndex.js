import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';

import ReplayDetail from '@/routes/sbid/components/ReplayDetail';

@formatterCollections({
  code: ['ssrc.bidHall', 'hzero.common', 'ssrc.expertScoring'],
})
@connect(({ inquiryHallBid, loading }) => ({
  inquiryHallBid,
  inquiryHall: inquiryHallBid,
  modelName: 'inquiryHallBid',
  loading: loading.effects,
}))
export default class extends ReplayDetail {}
