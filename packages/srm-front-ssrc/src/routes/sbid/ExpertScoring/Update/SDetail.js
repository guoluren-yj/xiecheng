import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import SrcScoringDetail from '../../../ssrc/InquiryHall/Detail';
@connect(({ expertScoring, loading }) => ({
  expertScoring,
  modelName: 'expertScoring',
  fetchInquiryHallUpdateLoading: loading.effects['expertScoring/fetchInquiryHeaderDetail'],
  fetchItemLineLoading: loading.effects['expertScoring/fetchInquiryItemLine'],
  fetchSupplierLineLoading: loading.effects['expertScoring/fetchInquirySupplierLine'],
  fetchAddSupplierLineLoading: loading.effects['expertScoring/fetchAddSupplierLine'],
  fetchLadderLevelLoading: loading.effects['expertScoring/fetchLadderLevelyTable'],
  getStageLoading: loading.effects['expertScoring/getStage'],
  pauseLoading: loading.effects['expertScoring/pause'],
  closeLoading: loading.effects['expertScoring/close'],
  resumeLoading: loading.effects['expertScoring/resume'],
  fetchScoringElementLoading: loading.effects['expertScoring/fetchScoringElementData'],
  fetchEvaluateIndicAssignLoading: loading.effects['expertScoring/fetchEvaluateIndicAssign'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Main extends SrcScoringDetail {}
