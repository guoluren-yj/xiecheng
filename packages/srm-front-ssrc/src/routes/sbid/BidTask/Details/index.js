import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import BidTaskDetail from '../../components/Detail/BidDetail';
@connect(({ bidTask, bidHall, loading }) => ({
  bidTask,
  bidHall,
  modelName: 'bidTask',
  fetchbidHallUpdateLoading: loading.effects['bidTask/fetchBidHeaderDetail'],
  fetchItemLineLoading: loading.effects['bidTask/fetchItemLine'],
  fetchSupplierLineloading: loading.effects['bidTask/fetchSupplierLine'],
  fetchBidMembersLoading: loading.effects['bidTask/fetchBidMembers'],
  supplierRecordLoading: loading.effects['bidTask/supplierRecord'],
  fetchTempelateDetailDataLoading: loading.effects['bidTask/fetchTempelateDetailData'],
  fetchExpertAllocationDataLoading: loading.effects['bidTask/fetchExpertAllocationData'],
  fetchScoringElementLoading: loading.effects['bidTask/fetchScoringElementData'],
  fetchEvaluateIndicAssignLoading: loading.effects['bidTask/fetchEvaluateIndicAssign'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class Main extends BidTaskDetail {}
