/**
 * 对于标准组件的高阶进行再一次封装 - 适用于二开高阶
 * 返回高阶修饰后的标准组件
 */
import { connect } from 'dva';
import { DataSet } from 'choerodon-ui/pro';
import remote from 'hzero-front/lib/utils/remote';
import { noop } from 'lodash';

// import CacheComponentC7n from '@/routes/components/CacheComponentC7n';
import withProps from 'utils/withProps';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import { INQUIRY, BID } from '@/utils/globalVariable';

import { allTableDS } from './indexDS';
import { ItemLineTableDS } from './DetailAllDS';

export function withStandardCompEnhancer(Comp, pageName = INQUIRY) {
  const HOCComponent = WithCustomizeC7N({
    unitCode: [
      `SSRC.${pageName}_HALL.NEW_LIST.WAIT_RELEASED`,
      `SSRC.${pageName}_HALL.NEW_LIST.ONGOING`,
      `SSRC.${pageName}_HALL.NEW_LIST.APPROVAL`,
      `SSRC.${pageName}_HALL.NEW_LIST.NEEDATTENTION`,
      `SSRC.${pageName}_HALL.NEW_LIST.FINISHED`,
      `SSRC.${pageName}_HALL.NEW_LIST.OTHERS`,
      `SSRC.${pageName}_HALL.NEW_LIST.ALL`,
      `SSRC.${pageName}_HALL.NEW_LIST.HEADER_BUTTONS`,
      `SSRC.${pageName}_HALL.NEW_LIST.EXECUTE_TABLE`,
      `SSRC.${pageName}_HALL.NEW_LIST.NEW_BID_OPEN_MODAL_BUTTONS`, // 新开标弹框-按钮
      `SSRC.${pageName}_HALL.NEW_LIST.NEW_BID_OPEN_MODAL_ALL_LIST`, // // 新开标 - 一览表
      `SSRC.${pageName}_HALL.NEW_LIST.NEW_BID_OPEN_MODAL_EXECUTION_LIST`, // 新开标-执行情况
      `SSRC.${pageName}_HALL.NEW_LIST.WORKBENCH_TABS`, // 标签页
      // `SSRC.${pageName}_HALL.LACK_QUOTED.SUPPLIER_QUOTATION`,
      `SSRC.${pageName}_HALL.NEW_LIST.QUOTATION_FEEDBACK_TABLE`, // 进行中-报价响应表格
      `SSRC.${pageName}_HALL.NEW_EDIT.PURCHASEREQUEST_TABLE`, // 申请转寻源-表格
      `SSRC.${pageName}_HALL.NEW_LIST.DETAIL_ALL`, // detail - all
      // `SSRC.${pageName}_HALL.NEW_LIST.DETAIL_ALL_FILTER`, // detail - all
      'SSRC.EXPERT_SCORE_MANAGE.ROUND_MODAL_BUTTON', // 是否开启多轮报价按钮组
      'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE', // 多轮报价行
      `SSRC.${pageName}_HALL.NEW_LIST.BIDDING_TABLE`, // 中标情况
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.queryRfq',
        'ssrc.qualiExam',
        'scux.inquiryHall',
        'ssrc.inquiryhall',
        'ssrc.supplierQuotation',
        'ssrc.expertScoring',
        'ssrc.depositManage',
        'ssrc.scux',
        'sscux.ssrc', // cux
        'scux.ssrc',
        'ssrc.expert',
        'ssrc.bidHall',
        'ssrc.rf',
      ],
    })(
      withProps(
        () => {
          const commonConfig = {
            bidFlag: pageName === BID,
          };

          const onGoingDealConfig = {
            currentStatus: 'processing',
            ...commonConfig,
          };

          const toBeReleasedConfig = {
            pageSize: 20,
            currentStatus: 'toBeReleased',
            ...commonConfig,
          };

          const approvalConfig = {
            currentStatus: 'approving',
            ...commonConfig,
          };

          const attentionConfig = {
            currentStatus: 'attention',
            ...commonConfig,
          };

          const finishInquirySuccessConfig = {
            currentStatus: 'finished',
            ...commonConfig,
          };

          const finishOthersConfig = {
            currentStatus: 'finishOthers',
            ...commonConfig,
          };

          const allConfig = {
            pageSize: 20,
            currentStatus: 'all',
            ...commonConfig,
          };

          const detailAllConfig = {
            pageSize: 20,
            currentStatus: 'detailAll',
            ...commonConfig,
          };

          const onGoingDealDS = new DataSet(allTableDS(onGoingDealConfig));

          // const onGoingDealFlatDS = new DataSet(allTableDS(onGoingDealConfig));

          const approvalDS = new DataSet(allTableDS(approvalConfig));

          // const approvalFlatDS = new DataSet(allTableDS(approvalConfig));

          const toBeReleasedDS = new DataSet(allTableDS(toBeReleasedConfig));

          // const toBeReleasedFlatDS = new DataSet(allTableDS(toBeReleasedConfig));

          const attentionDS = new DataSet(allTableDS(attentionConfig));

          // const attentionFlatDS = new DataSet(allTableDS(attentionConfig));

          const allDS = new DataSet(allTableDS(allConfig));

          // const allFlatDS = new DataSet(allTableDS(allConfig));

          const finishInquirySuccessDS = new DataSet(allTableDS(finishInquirySuccessConfig));

          // const finishInquirySuccessFlatDS = new DataSet(allTableDS(finishInquirySuccessConfig));

          const finishOthersDS = new DataSet(allTableDS(finishOthersConfig));

          // const finishOthersFlatDS = new DataSet(allTableDS(finishOthersConfig));

          const detailAllDS = new DataSet(ItemLineTableDS(detailAllConfig));

          const shareDS = new DataSet();

          return {
            onGoingDealDS,
            approvalDS,
            toBeReleasedDS,
            attentionDS,
            allDS,
            finishInquirySuccessDS,
            finishOthersDS,
            detailAllDS,
            shareDS,
          };
        },
        { cacheState: true }
      )(
        connect(({ inquiryHall, commonModel, expertScoring, loading }) => ({
          inquiryHall,
          commonModel,
          expertScoring,
          organizationId: getCurrentOrganizationId(),
          createLoading: loading.effects['inquiryHall/createApplyToInquiry'],
        }))(
          remote(
            {
              code: 'SSRC_INQUIRY_HALL_NEW_LIST',
              name: 'remote',
            },
            {
              events: {
                getCheckPrice(eventProps) {
                  const { getCheckPrice, isNeedCall = true, isNeedPop = false } = eventProps;
                  // 是否需要定标按钮
                  if (isNeedCall) {
                    getCheckPrice(isNeedPop);
                  }
                },
                // 开标弹框
                openBidModal(eventProps) {
                  const { onOperateBidModel = noop, record = {}, rfxStatus } = eventProps || {};
                  onOperateBidModel({
                    ...record,
                    rfxStatus,
                  });
                },
                sectionOpenBidValidate() {
                  return true;
                },
                // 开标多标段确定按钮
                async handleOk(eventProps) {
                  const { onOk = noop } = eventProps || {};
                  return onOk();
                },
                // 单标段开标校验
                singleOpenBidValidate() {
                  return true;
                },
                inquiryCreateManually(eventProps) {
                  const { inquiryCreate } = eventProps;
                  return inquiryCreate();
                },
                copyHistoryOrderModal(eventProps) {
                  const { copyHistoryOrderModal, record } = eventProps;
                  return copyHistoryOrderModal(record);
                },
                beforeJump() {},
                handleInquiryCreateCancel() {},
                beforeJumpPreValidate() {},
                pushOtherNodeRemote() {},
                closeRfxOnOk(eventProps) {
                  const { handleClose } = eventProps || {};
                  if (handleClose) {
                    return handleClose();
                  }
                },
                openBidFunc(eventProps) {
                  const { openBidFunc } = eventProps || {};
                  if (openBidFunc) {
                    openBidFunc();
                  }
                },
                projectToInquiryOpenOkEvent(eventProps) {
                  const { openModal = noop, selectData = [] } = eventProps || {};
                  openModal(selectData);
                },
                // 开始评分事件
                remoteStartScore(eventProps) {
                  const { handleStartScoreJump } = eventProps || {};
                  if (handleStartScoreJump) {
                    handleStartScoreJump();
                  }
                },
                handleCuxFunctionCreateModal() {},
                // 路由跳转
                routerSkip(eventProps) {
                  const { routerSkip } = eventProps || {};
                  if (routerSkip) {
                    routerSkip();
                  }
                },
                // 申请转寻源单据创建方法 前置埋点
                handleInquiryCreateBefore() {
                  return true;
                },
                skipPage(eventProps) {
                  const { skipPage = noop } = eventProps || {};
                  skipPage();
                },
                // 申请转寻源单据校验通过之后
                handleRemotePurchaseValidateOk(eventProps) {
                  const { openCreateModal = noop } = eventProps || {};
                  openCreateModal();
                },
                pushFixNodeRemote() {},
                handleRemotePurOfflineValidateOk(eventProps) {
                  const { openOfflineModal = noop } = eventProps || {};
                  openOfflineModal();
                },
                remotePageInit() {}, // remote cux event
                // h0 立项转 modal cux event
                handleCuxFunctionProjectCreateModal() {},
                // 新开标 打开弹窗前 // cux
                remoteBeforeHandleNewBidOpening() {},
                handleCuxComponentDidUpdate() {}, // cux event
                handleRemoteBeforePurchaseRequestModalOpen() {}, // 申请转寻源-打开弹框前置事件 // cux
              },
            }
          )(Comp)
        )
      )
    )
  );
  return HOCComponent;
}
