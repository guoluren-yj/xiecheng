/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2023-08-25 13:45:21
 * @LastEditors: yiping.liu
 */
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
  return connect(({ inquiryHallQuery, loading }) => ({
    inquiryHallQuery,
    inquiryHall: inquiryHallQuery,
    modelName: 'inquiryHallQuery',
    fetchInquiryHallUpdateLoading: loading.effects['inquiryHallQuery/fetchInquiryHeaderDetail'],
    fetchItemLineLoading: loading.effects['inquiryHallQuery/fetchInquiryItemLine'],
    fetchSupplierLineLoading: loading.effects['inquiryHallQuery/fetchInquirySupplierLine'],
    fetchAddSupplierLineLoading: loading.effects['inquiryHallQuery/fetchAddSupplierLine'],
    fetchLadderLevelLoading: loading.effects['inquiryHallQuery/fetchLadderLevelyTable'],
    getStageLoading: loading.effects['inquiryHallQuery/getStage'],
    pauseLoading: loading.effects['inquiryHallQuery/pause'],
    closeLoading: loading.effects['inquiryHallQuery/close'],
    resumeLoading: loading.effects['inquiryHallQuery/resume'],
    fetchScoringElementLoading: loading.effects['inquiryHallQuery/fetchScoringElementData'],
    fetchEvaluateIndicAssignLoading: loading.effects['inquiryHallQuery/fetchEvaluateIndicAssign'],
    fetchItemLineQuotationDetailLoading:
      loading.effects['inquiryHallQuery/fetchItemLineQuotationDetail'],
    fetchQuotationDetailLoading: loading.effects['inquiryHallQuery/fetchQuotationDetail'],
    fetchPretrialPanelLoading: loading.effects['inquiryHallQuery/fetchPretrialPanel'],
    prequalDetailInInquiryDetail: loading.effects['inquiryHallQuery/prequalDetailInInquiryDetail'],
    quotationDetailInInquiryDetailLoading:
      loading.effects['inquiryHallQuery/quotationDetailInInquiryDetail'],
    openBidDetailInInquiryDetailLoading:
      loading.effects['inquiryHallQuery/openBidDetailInInquiryDetail'],
    fetchLadderLevelTableLoading: loading.effects['inquiryHallQuery/fetchLadderLevelTable'],
    fetchHeaderInfoLoading: loading.effects['inquiryHallQuery/fetchHeaderInfo'],
    changeRfxDetailLayoutLoading: loading.effects['inquiryHallQuery/changeRfxDetailLayout'],
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
