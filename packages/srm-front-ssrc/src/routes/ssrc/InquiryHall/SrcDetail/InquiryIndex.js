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
  return connect(({ inquiryHallNew, loading }) => ({
    inquiryHallNew,
    inquiryHall: inquiryHallNew,
    modelName: 'inquiryHallNew',
    fetchInquiryHallUpdateLoading: loading.effects['inquiryHallNew/fetchInquiryHeaderDetail'],
    fetchItemLineLoading: loading.effects['inquiryHallNew/fetchInquiryItemLine'],
    fetchSupplierLineLoading: loading.effects['inquiryHallNew/fetchInquirySupplierLine'],
    fetchAddSupplierLineLoading: loading.effects['inquiryHallNew/fetchAddSupplierLine'],
    fetchLadderLevelLoading: loading.effects['inquiryHallNew/fetchLadderLevelyTable'],
    getStageLoading: loading.effects['inquiryHallNew/getStage'],
    pauseLoading: loading.effects['inquiryHallNew/pause'],
    closeLoading: loading.effects['inquiryHallNew/close'],
    resumeLoading: loading.effects['inquiryHallNew/resume'],
    fetchScoringElementLoading: loading.effects['inquiryHallNew/fetchScoringElementData'],
    fetchEvaluateIndicAssignLoading: loading.effects['inquiryHallNew/fetchEvaluateIndicAssign'],
    fetchItemLineQuotationDetailLoading:
      loading.effects['inquiryHallNew/fetchItemLineQuotationDetail'],
    fetchQuotationDetailLoading: loading.effects['inquiryHallNew/fetchQuotationDetail'],
    fetchPretrialPanelLoading: loading.effects['inquiryHallNew/fetchPretrialPanel'],
    prequalDetailInInquiryDetail: loading.effects['inquiryHallNew/prequalDetailInInquiryDetail'],
    quotationDetailInInquiryDetailLoading:
      loading.effects['inquiryHallNew/quotationDetailInInquiryDetail'],
    openBidDetailInInquiryDetailLoading:
      loading.effects['inquiryHallNew/openBidDetailInInquiryDetail'],
    fetchLadderLevelTableLoading: loading.effects['inquiryHallNew/fetchLadderLevelTable'],
    fetchHeaderInfoLoading: loading.effects['inquiryHallNew/fetchHeaderInfo'],
    changeRfxDetailLayoutLoading: loading.effects['inquiryHallNew/changeRfxDetailLayout'],
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
