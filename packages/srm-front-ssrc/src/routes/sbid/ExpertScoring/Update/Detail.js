import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import BidScoringDetail from '../../components/Detail/BidDetail';
@connect(({ expertScoring, loading }) => ({
  expertScoring,
  modelName: 'expertScoring',
  fetchbidHallUpdateLoading: loading.effects['expertScoring/fetchBidHeaderDetail'],
  fetchItemLineLoading: loading.effects['expertScoring/fetchItemLine'],
  fetchSupplierLineloading: loading.effects['expertScoring/fetchSupplierLine'],
  fetchBidMembersLoading: loading.effects['expertScoring/fetchBidMembers'],
  supplierRecordLoading: loading.effects['expertScoring/supplierRecord'],
  fetchTempelateDetailDataLoading: loading.effects['expertScoring/fetchTempelateDetailData'],
  fetchExpertAllocationDataLoading: loading.effects['expertScoring/fetchExpertAllocationData'],
  fetchScoringElementLoading: loading.effects['expertScoring/fetchScoringElementData'],
  fetchEvaluateIndicAssignLoading: loading.effects['expertScoring/fetchEvaluateIndicAssign'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class Main extends BidScoringDetail {}
