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
  return connect(({ inquiryHallBid, loading }) => ({
    inquiryHallBid,
    inquiryHall: inquiryHallBid,
    modelName: 'inquiryHallBid',
    fetchInquiryHallUpdateLoading: loading.effects['inquiryHallBid/fetchInquiryHeaderDetail'],
    fetchItemLineLoading: loading.effects['inquiryHallBid/fetchInquiryItemLine'],
    fetchSupplierLineLoading: loading.effects['inquiryHallBid/fetchInquirySupplierLine'],
    fetchAddSupplierLineLoading: loading.effects['inquiryHallBid/fetchAddSupplierLine'],
    fetchLadderLevelLoading: loading.effects['inquiryHallBid/fetchLadderLevelyTable'],
    getStageLoading: loading.effects['inquiryHallBid/getStage'],
    pauseLoading: loading.effects['inquiryHallBid/pause'],
    closeLoading: loading.effects['inquiryHallBid/close'],
    resumeLoading: loading.effects['inquiryHallBid/resume'],
    fetchScoringElementLoading: loading.effects['inquiryHallBid/fetchScoringElementData'],
    fetchEvaluateIndicAssignLoading: loading.effects['inquiryHallBid/fetchEvaluateIndicAssign'],
    fetchItemLineQuotationDetailLoading:
      loading.effects['inquiryHallBid/fetchItemLineQuotationDetail'],
    fetchQuotationDetailLoading: loading.effects['inquiryHallBid/fetchQuotationDetail'],
    fetchPretrialPanelLoading: loading.effects['inquiryHallBid/fetchPretrialPanel'],
    prequalDetailInInquiryDetail: loading.effects['inquiryHallBid/prequalDetailInInquiryDetail'],
    quotationDetailInInquiryDetailLoading:
      loading.effects['inquiryHallBid/quotationDetailInInquiryDetail'],
    openBidDetailInInquiryDetailLoading:
      loading.effects['inquiryHallBid/openBidDetailInInquiryDetail'],
    fetchLadderLevelTableLoading: loading.effects['inquiryHallBid/fetchLadderLevelTable'],
    fetchHeaderInfoLoading: loading.effects['inquiryHallBid/fetchHeaderInfo'],
    changeRfxDetailLayoutLoading: loading.effects['inquiryHallBid/changeRfxDetailLayout'],
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
