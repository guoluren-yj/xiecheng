import { connect } from 'dva';

import ReviewClarification from '@/routes/sbid/components/ReviewClarification';

@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  modelName: 'inquiryHall',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
