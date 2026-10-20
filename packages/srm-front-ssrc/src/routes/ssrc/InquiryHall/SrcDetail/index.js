/*
 * @Descripttion: xxxx管理信息--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2023-08-25 13:45:21
 * @LastEditors: yiping.liu
 */
/*
 * @Description:
 * @Autor: hongzhu.chen@going-link.com
 * @Date: 2021-05-20 20:58:31
 * @LastEditTime: 2021-06-22 14:40:50
 */
import { noop } from 'lodash';
import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import { INQUIRY_HALL } from '@/utils/globalVariable';
import remote from 'hzero-front/lib/utils/remote';
import Detail from '../Detail';

class Main extends Detail {}

const hocUpdate = (Com, pageSymbol = INQUIRY_HALL) => {
  return connect(({ inquiryHall, loading }) => ({
    inquiryHall,
    modelName: 'inquiryHall',
    fetchInquiryHallUpdateLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
    fetchItemLineLoading: loading.effects['inquiryHall/fetchInquiryItemLine'],
    fetchSupplierLineLoading: loading.effects['inquiryHall/fetchInquirySupplierLine'],
    fetchAddSupplierLineLoading: loading.effects['inquiryHall/fetchAddSupplierLine'],
    fetchLadderLevelLoading: loading.effects['inquiryHall/fetchLadderLevelyTable'],
    getStageLoading: loading.effects['inquiryHall/getStage'],
    pauseLoading: loading.effects['inquiryHall/pause'],
    closeLoading: loading.effects['inquiryHall/close'],
    resumeLoading: loading.effects['inquiryHall/resume'],
    fetchScoringElementLoading: loading.effects['inquiryHall/fetchScoringElementData'],
    fetchEvaluateIndicAssignLoading: loading.effects['inquiryHall/fetchEvaluateIndicAssign'],
    fetchItemLineQuotationDetailLoading:
      loading.effects['inquiryHall/fetchItemLineQuotationDetail'],
    fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
    fetchPretrialPanelLoading: loading.effects['inquiryHall/fetchPretrialPanel'],
    prequalDetailInInquiryDetail: loading.effects['inquiryHall/prequalDetailInInquiryDetail'],
    quotationDetailInInquiryDetailLoading:
      loading.effects['inquiryHall/quotationDetailInInquiryDetail'],
    openBidDetailInInquiryDetailLoading:
      loading.effects['inquiryHall/openBidDetailInInquiryDetail'],
    fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
    fetchHeaderInfoLoading: loading.effects['inquiryHall/fetchHeaderInfo'],
    changeRfxDetailLayoutLoading: loading.effects['inquiryHall/changeRfxDetailLayout'],
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

export default hocUpdate(Main);

export { hocUpdate, Main };
