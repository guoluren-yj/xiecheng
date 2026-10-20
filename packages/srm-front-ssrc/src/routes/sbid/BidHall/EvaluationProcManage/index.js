import { connect } from 'dva';

import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import BidEvaluationProcManage from '../BidEvaluationProcManage';

@connect(({ bidHall, loading, inquiryHall }) => ({
  bidHall,
  modelName: 'bidHall',
  inquiryHall,
  fetchBidEvaluateExpertScoringLoading: loading.effects['bidHall/fetchBidEvaluateExpertScoring'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class Main extends BidEvaluationProcManage {}
