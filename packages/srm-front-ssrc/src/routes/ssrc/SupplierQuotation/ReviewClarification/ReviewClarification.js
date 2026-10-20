import { connect } from 'dva';

import ReviewClarification from '@/routes/sbid/components/ReviewClarification';

@connect(({ supplierQuotation, loading }) => ({
  supplierQuotation,
  modelName: 'supplierQuotation',
  loading: loading.effects,
}))
export default class extends ReviewClarification {}
