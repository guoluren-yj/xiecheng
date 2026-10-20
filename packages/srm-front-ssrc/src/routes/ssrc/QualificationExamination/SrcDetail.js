import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import Detail from '../InquiryHall/Detail';

@connect(({ qualificationExamination, inquiryHall, loading }) => ({
  qualificationExamination,
  inquiryHall,
  modelName: 'qualificationExamination',
  fetchInquiryHallUpdateLoading:
    loading.effects['qualificationExamination/fetchInquiryHeaderDetail'],
  fetchItemLineLoading: loading.effects['qualificationExamination/fetchInquiryItemLine'],
  fetchSupplierLineLoading: loading.effects['qualificationExamination/fetchInquirySupplierLine'],
  fetchAddSupplierLineLoading: loading.effects['qualificationExamination/fetchAddSupplierLine'],
  fetchLadderLevelLoading: loading.effects['qualificationExamination/fetchLadderLevelyTable'],
  getStageLoading: loading.effects['qualificationExamination/getStage'],
  pauseLoading: loading.effects['qualificationExamination/pause'],
  closeLoading: loading.effects['qualificationExamination/close'],
  resumeLoading: loading.effects['qualificationExamination/resume'],
  fetchScoringElementLoading: loading.effects['qualificationExamination/fetchScoringElementData'],
  fetchEvaluateIndicAssignLoading:
    loading.effects['qualificationExamination/fetchEvaluateIndicAssign'],
  fetchPretrialPanelLoading: loading.effects['inquiryHall/fetchPretrialPanel'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Main extends Detail {}
