import { connect } from 'dva';
import remotes from 'hzero-front/lib/utils/remote';

import ReviewClarification from '@/routes/sbid/components/ReviewClarification';

@remotes(
  {
    code: 'SSRC_REVIEWCLARIFICATION_COMPONENT',
    name: 'componentRemote',
  },
  {
    events: {},
  }
)
@connect(({ inquiryHallBid, loading }) => ({
  inquiryHallBid,
  inquiryHall: inquiryHallBid,
  modelName: 'inquiryHallBid',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
