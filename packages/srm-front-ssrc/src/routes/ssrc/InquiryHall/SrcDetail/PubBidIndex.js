import { noop } from 'lodash';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID, BID_LOWERCASE, INQUIRY_BID } from '@/utils/globalVariable';
import { connect } from 'dva';
import remote from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

import { hocUpdateDetail, Detail } from '../Detail';

class MainDetailComponent extends Detail {}

const ConfDetail = hocUpdateDetail(MainDetailComponent, INQUIRY_BID);

class MainBidComponent extends ConfDetail {}

const hocUpdate = (Com, pageSymbol = INQUIRY_BID) => {
  return connect(({ inquiryHallNewPub, loading }) => ({
    inquiryHallNewPub,
    inquiryHall: inquiryHallNewPub,
    modelName: 'inquiryHallNewPub',
    fetchInquiryHallUpdateLoading: loading.effects['inquiryHallNewPub/fetchInquiryHeaderDetail'],
    fetchItemLineLoading: loading.effects['inquiryHallNewPub/fetchInquiryItemLine'],
    fetchSupplierLineLoading: loading.effects['inquiryHallNewPub/fetchInquirySupplierLine'],
    fetchAddSupplierLineLoading: loading.effects['inquiryHallNewPub/fetchAddSupplierLine'],
    fetchLadderLevelLoading: loading.effects['inquiryHallNewPub/fetchLadderLevelyTable'],
    getStageLoading: loading.effects['inquiryHallNewPub/getStage'],
    pauseLoading: loading.effects['inquiryHallNewPub/pause'],
    closeLoading: loading.effects['inquiryHallNewPub/close'],
    resumeLoading: loading.effects['inquiryHallNewPub/resume'],
    fetchScoringElementLoading: loading.effects['inquiryHallNewPub/fetchScoringElementData'],
    fetchEvaluateIndicAssignLoading: loading.effects['inquiryHallNewPub/fetchEvaluateIndicAssign'],
    fetchItemLineQuotationDetailLoading:
      loading.effects['inquiryHallNewPub/fetchItemLineQuotationDetail'],
    fetchQuotationDetailLoading: loading.effects['inquiryHallNewPub/fetchQuotationDetail'],
    fetchPretrialPanelLoading: loading.effects['inquiryHallNewPub/fetchPretrialPanel'],
    prequalDetailInInquiryDetail: loading.effects['inquiryHallNewPub/prequalDetailInInquiryDetail'],
    quotationDetailInInquiryDetailLoading:
      loading.effects['inquiryHallNewPub/quotationDetailInInquiryDetail'],
    openBidDetailInInquiryDetailLoading:
      loading.effects['inquiryHallNewPub/openBidDetailInInquiryDetail'],
    fetchLadderLevelTableLoading: loading.effects['inquiryHallNewPub/fetchLadderLevelTable'],
    fetchHeaderInfoLoading: loading.effects['inquiryHallNewPub/fetchHeaderInfo'],
    changeRfxDetailLayoutLoading: loading.effects['inquiryHallNewPub/changeRfxDetailLayout'],
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
