import { noop } from 'lodash';
import { INQUIRY_HALL } from '@/utils/globalVariable';
import { connect } from 'dva';
import remote from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

import { hocUpdateDetail, Detail } from '../Detail';

class MainDetailComponent extends Detail {}

const ConfDetail = hocUpdateDetail(MainDetailComponent, INQUIRY_HALL);

class MainBidComponent extends ConfDetail {}

const hocUpdate = (Com, pageSymbol = INQUIRY_HALL) => {
  return connect(({ inquiryHallProject, loading }) => ({
    inquiryHallProject,
    inquiryHall: inquiryHallProject,
    modelName: 'inquiryHallProject',
    fetchInquiryHallUpdateLoading: loading.effects['inquiryHallProject/fetchInquiryHeaderDetail'],
    fetchItemLineLoading: loading.effects['inquiryHallProject/fetchInquiryItemLine'],
    fetchSupplierLineLoading: loading.effects['inquiryHallProject/fetchInquirySupplierLine'],
    fetchAddSupplierLineLoading: loading.effects['inquiryHallProject/fetchAddSupplierLine'],
    fetchLadderLevelLoading: loading.effects['inquiryHallProject/fetchLadderLevelyTable'],
    getStageLoading: loading.effects['inquiryHallProject/getStage'],
    pauseLoading: loading.effects['inquiryHallProject/pause'],
    closeLoading: loading.effects['inquiryHallProject/close'],
    resumeLoading: loading.effects['inquiryHallProject/resume'],
    fetchScoringElementLoading: loading.effects['inquiryHallProject/fetchScoringElementData'],
    fetchEvaluateIndicAssignLoading: loading.effects['inquiryHallProject/fetchEvaluateIndicAssign'],
    fetchItemLineQuotationDetailLoading:
      loading.effects['inquiryHallProject/fetchItemLineQuotationDetail'],
    fetchQuotationDetailLoading: loading.effects['inquiryHallProject/fetchQuotationDetail'],
    fetchPretrialPanelLoading: loading.effects['inquiryHallProject/fetchPretrialPanel'],
    prequalDetailInInquiryDetail:
      loading.effects['inquiryHallProject/prequalDetailInInquiryDetail'],
    quotationDetailInInquiryDetailLoading:
      loading.effects['inquiryHallProject/quotationDetailInInquiryDetail'],
    openBidDetailInInquiryDetailLoading:
      loading.effects['inquiryHallProject/openBidDetailInInquiryDetail'],
    fetchLadderLevelTableLoading: loading.effects['inquiryHallProject/fetchLadderLevelTable'],
    fetchHeaderInfoLoading: loading.effects['inquiryHallProject/fetchHeaderInfo'],
    changeRfxDetailLayoutLoading: loading.effects['inquiryHallProject/changeRfxDetailLayout'],
    organizationId: getCurrentOrganizationId(),
    userId: getCurrentUserId(),
    pageSymbol,
  }))(
    remote(
      {
        code: 'SSRC_INQUIRY_HALL_DETAIL',
        name: 'remote',
      },
      {
        events: {
          handleGetProcessBar(props = {}) {
            const { getProcessBar = noop, ...otherParams } = props || {};
            getProcessBar(otherParams);
          },
          handleGetNotification(props = {}) {
            const { getNotification = noop, ...otherParams } = props || {};
            getNotification(otherParams);
          },
          handleGetQuotationDetailFieldVisible(props = {}) {
            const { getQuotationDetailFieldVisible = noop, ...otherParams } = props || {};
            getQuotationDetailFieldVisible(otherParams);
          },
          // 初始化ds Event
          remotePrepareInitDsEvent() {},
          // 组件卸载清空埋点事件
          remotePrepareComponentWillUnmountEvent() {},
          // 设置ds参数埋点事件
          remotePrepareSetQueryParameterDSEvent() {},
          // load businessData
          remotePrepareLoadDataBusinessData(props = {}) {
            const { loadBusinessData = noop } = props || {};
            loadBusinessData(props);
          },
          remotePreClickProcessAttachment() {},
          remotePreChangeStep() {},
          remotePreDirectorQuotation() {},
          // 发布准备查看适用范围埋点方法
          remoteViewApplicationModalEvent(props = {}) {
            const { handleViewApplicationModal = noop } = props || {};
            handleViewApplicationModal(props);
          },
          // 核价节点查看适用范围埋点方法
          remoteCheckPriceViewApplicationModalEvent(props = {}) {
            const { handleViewApplicationModal = noop } = props || {};
            handleViewApplicationModal(props);
          },
        },
      }
    )(Com)
  );
};

export default hocUpdate(MainBidComponent, INQUIRY_HALL);
export { hocUpdate, MainBidComponent };
