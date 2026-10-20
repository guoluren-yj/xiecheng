import { connect } from 'dva';
import { noop } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import { BID, BID_LOWERCASE, INQUIRY_BID } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

import { hocUpdateDetail, Detail } from '../Detail';

class MainDetailComponent extends Detail {}

const ConfDetail = hocUpdateDetail(MainDetailComponent, INQUIRY_BID);

class MainBidComponent extends ConfDetail {}

const hocUpdate = (Com, pageSymbol = INQUIRY_BID) => {
  return connect(({ inquiryHallExpert, loading }) => ({
    inquiryHallExpert,
    inquiryHall: inquiryHallExpert,
    modelName: 'inquiryHallExpert',
    fetchInquiryHallUpdateLoading: loading.effects['inquiryHallExpert/fetchInquiryHeaderDetail'],
    fetchItemLineLoading: loading.effects['inquiryHallExpert/fetchInquiryItemLine'],
    fetchSupplierLineLoading: loading.effects['inquiryHallExpert/fetchInquirySupplierLine'],
    fetchAddSupplierLineLoading: loading.effects['inquiryHallExpert/fetchAddSupplierLine'],
    fetchLadderLevelLoading: loading.effects['inquiryHallExpert/fetchLadderLevelyTable'],
    getStageLoading: loading.effects['inquiryHallExpert/getStage'],
    pauseLoading: loading.effects['inquiryHallExpert/pause'],
    closeLoading: loading.effects['inquiryHallExpert/close'],
    resumeLoading: loading.effects['inquiryHallExpert/resume'],
    fetchScoringElementLoading: loading.effects['inquiryHallExpert/fetchScoringElementData'],
    fetchEvaluateIndicAssignLoading: loading.effects['inquiryHallExpert/fetchEvaluateIndicAssign'],
    fetchItemLineQuotationDetailLoading:
      loading.effects['inquiryHallExpert/fetchItemLineQuotationDetail'],
    fetchQuotationDetailLoading: loading.effects['inquiryHallExpert/fetchQuotationDetail'],
    fetchPretrialPanelLoading: loading.effects['inquiryHallExpert/fetchPretrialPanel'],
    prequalDetailInInquiryDetail: loading.effects['inquiryHallExpert/prequalDetailInInquiryDetail'],
    quotationDetailInInquiryDetailLoading:
      loading.effects['inquiryHallExpert/quotationDetailInInquiryDetail'],
    openBidDetailInInquiryDetailLoading:
      loading.effects['inquiryHallExpert/openBidDetailInInquiryDetail'],
    fetchLadderLevelTableLoading: loading.effects['inquiryHallExpert/fetchLadderLevelTable'],
    fetchHeaderInfoLoading: loading.effects['inquiryHallExpert/fetchHeaderInfo'],
    changeRfxDetailLayoutLoading: loading.effects['inquiryHallExpert/changeRfxDetailLayout'],
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

export default CombineComponent({
  sourceKeyLowerCase: BID_LOWERCASE,
  sourceKey: BID,
})(hocUpdate(MainBidComponent, INQUIRY_BID));

export { hocUpdate, MainBidComponent };
