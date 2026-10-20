import { connect } from 'dva';

import ReplayDetail from '@/routes/sbid/components/ReplayDetail';

@connect(({ supplierQuotation, loading }) => ({
  supplierQuotation,
  modelName: 'supplierQuotation',
  loading: loading.effects,
}))
export default class extends ReplayDetail {}
