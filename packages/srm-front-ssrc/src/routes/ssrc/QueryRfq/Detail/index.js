// XXX 改造后和寻源维护公用
import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import Detail from '@/routes/ssrc/InquiryHall/Detail';

@connect(({ inquiryHall, bidHall, priceComparison, quotationController }) => ({
  inquiryHall,
  bidHall,
  priceComparison,
  quotationController,
  modelName: 'inquiryHall',
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class QueryRfqDetail extends Detail {}
