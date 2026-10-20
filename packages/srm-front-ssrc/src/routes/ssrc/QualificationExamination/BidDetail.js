import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import BidQuexDetail from '@/routes/sbid/components/Detail/BidDetail';
@connect(({ qualificationExamination, bidHall, resultsQuery, loading }) => ({
  qualificationExamination,
  bidHall,
  resultsQuery,
  modelName: 'qualificationExamination',
  fetchbidHallUpdateLoading: loading.effects['qualificationExamination/fetchBidHeaderDetail'],
  fetchItemLineLoading: loading.effects['qualificationExamination/fetchItemLine'],
  fetchSupplierLineloading: loading.effects['qualificationExamination/fetchSupplierLine'],
  fetchBidMembersLoading: loading.effects['qualificationExamination/fetchBidMembers'],
  supplierRecordLoading: loading.effects['qualificationExamination/supplierRecord'],
  fetchTempelateDetailDataLoading:
    loading.effects['qualificationExamination/fetchTempelateDetailData'],
  fetchExpertAllocationDataLoading:
    loading.effects['qualificationExamination/fetchExpertAllocationData'],
  fetchScoringElementLoading: loading.effects['qualificationExamination/fetchScoringElementData'],
  fetchEvaluateIndicAssignLoading:
    loading.effects['qualificationExamination/fetchEvaluateIndicAssign'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class Main extends BidQuexDetail {}
