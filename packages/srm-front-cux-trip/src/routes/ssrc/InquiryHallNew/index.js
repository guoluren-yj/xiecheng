/* eslint-disable no-lonely-if */
/**
 * new-InquiryHall - 询价监控台
 * @date: 2020-10-10
 * @author: lzj<zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 * */

import React, { Fragment } from 'react';
import {
  Modal,
  DataSet,
  Button,
  // Select,
  // TextField,
  Table,
  Form,
  Lov,
  Spin,
  ModalProvider,
  Tabs,
  message,
  Menu,
  Dropdown,
  Tooltip,
} from 'choerodon-ui/pro';
import { Popover, Icon, Badge, Tag } from 'choerodon-ui';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import { isEmpty, isNil, isFunction, noop, throttle, isArray } from 'lodash';
import querystring from 'querystring';
import moment from 'moment';
import uuid from 'uuid/v4';
import { getActiveTabKey } from 'utils/menuTab';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import { routerRedux } from 'dva/router';

import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import {
  getCurrentUserId,
  filterNullValueObject,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import ExcelExportNew from 'hzero-front/lib/components/ExcelExportPro';
import { openServiceChargeManageModal } from 'srm-front-ssta/lib/routes/SourcingCostPurchaser/ServiceChargeManage';
import { listLineDS } from 'srm-front-ssrc/lib/routes/ssrc/InquiryHall/store/historyModalDataSet';
import {
  createRF,
  createRFQ,
  createRFP,
  searchInquiryHallNumber,
  checkPermission,
  fetchInquiryHallUserMemory,
  fetchSctionList,
  batchTransfer,
  batchSendMessage,
  batchOpenBindding,
  historyCopy,
  createBeforeDirectController,
  validateBeforeDirectController,
  validateBeforeDirectControllerRF,
  createBeforeDirectControllerRF,
  toScoreRF,
  fetchConfigSheet,
  countDetailLength,
  fetchNewBidEnable,
  offlineWholeService,
  // fetchBidOpenExecution,
  // updateFeedBackReadedFlag,
} from 'srm-front-ssrc/lib/services/inquiryHallNewService';
import {
  transfer,
  sourcingCreate,
  projectToWholeCreate,
  openingBid,
  copyHistoryOrderModal,
  changeRfxDetailLayout,
  fetchRfxDetailLayout,
  resendPassword,
  fetchRFContentConfig,
  fetchOldControllerConfig,
  newBatchValidatePurchase,
} from 'srm-front-ssrc/lib/services/inquiryHallService';
import { queryEnableDoubleUnit, beforeScoreValidate, queryH0OrC7N } from 'srm-front-ssrc/lib/services/commonService';
import { beginRoundQuotation, roundBeginScore } from 'srm-front-ssrc/lib/services/expertScoringService';
import { releaseCreateRFP } from 'srm-front-ssrc/lib/services/rfService';
import SubAccount from 'srm-front-ssrc/lib/routes/components/SubAccount';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';

import RoundQuotationDrawer from 'srm-front-ssrc/lib/routes/components/RoundQuotationDrawer';
import SourcingResultDrawer from 'srm-front-ssrc/lib/routes/components/SourcingResultDrawer';
import BidSourcingResultDrawer from 'srm-front-ssrc/lib/routes/components/SourcingResultDrawer/BidIndex';
import {
  INQUIRY,
  getSourceCategoryName,
  INQUIRY_LOWERCASE,
  BID,
  getCategoryCode,
  getSourceName,
  getCheckPriceName,
  getDocumentTypeName,
  getQuotationName,
} from 'srm-front-ssrc/lib/utils/globalVariable';
import {
  isJSON,
  applyToNotification,
  getTableFixSelfAdaptStyle,
  handleRevokeApproval,
  fetchBiddingHallConfigResult,
  getJumpRoutePrefixUrl,
} from 'srm-front-ssrc/lib/utils/utils';
import {
  abandonRemarkRender,
  numberSeparatorRender,
  supplierQuotaitonAbandanRenderStatus,
} from 'srm-front-ssrc/lib/utils/renderer';

import OperationRecord from 'srm-front-ssrc/lib/routes/components/OperationRecord';
import CreateRFXModal from 'srm-front-ssrc/lib/routes/ssrc/InquiryHall/ApplyToInquiry/CreateModal.js';
import { validatorConfirmModal, validateQRModal } from 'srm-front-ssrc/lib/routes/components/ConfirmModal';

import { openNewBidModal } from 'srm-front-ssrc/lib/routes/components/BidOpenningNewModal';
import {
  quotationInfoDS,
  scoreInfoDS,
  bidInfoDS,
  submitInfoDS,
  rfTemplateDS,
  SourcingTemplateDS,
  offlineWholeDS,
  allTableDS,
} from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/indexDS';
import Style from './index.less';
import FinishedContainer from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/FinishedContainer';
import OnGoingContainer from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/OnGoingContainer';
import AllContainer from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/AllContainer';
import RFIContainer from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/RFIContainer';
import RFPContainer from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/RFPContainer';
import DetailAll from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/DetailAll';
import ToBeReleasedContainere from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/ToBeReleasedContainere';
import {
  customPermissionButton,
  workFlowStepRender,
  approveExecutiveRender,
  approveExecutiveRFRender,
  scoreStepRender,
  rfFeedBackStatusRender,
} from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/utils';
import QuoFeedBackLackModal from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/QuoFeedBackLackModal';
import QuoFeedBackLackModalBid from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/QuoFeedBackLackModalBid';
import OpeningBid from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/OpeningBid';
import OperationBid from './OperationBid';
import BidOperationBidModal from './BidOperationBid';
import ProjectToInquiry from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/ProjectApprovalToInquiry';
import ProjectToRFI from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/ProjectApprovalToRFI';
import CreateModal from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/CreateModal';
import RoundQuotationModal from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/RoundQuotationModal';
import SectionBidding from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/SectionBidding';
import QuotationChangeRecords from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/QuotationChangeRecords';
import ShowQuotationFeedbackTable from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/ShowQuotationFeedbackTable';
import { openingDS } from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/OpeningBidDS';
import closeRfxDrawer from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/CloseRfxDrawer';
import RFLackQuotedModal from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/RFLackQuotedModal';

import { withStandardCompEnhancer } from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/standardCompEnhancerCreator';
import Search from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/Search';
import RFChangeDetail from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/RFChangeDetail';
import CloseInquiry from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/RFClose';
import { closeRfDS } from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/RFClose/indexDS';
import PurchaseRequestContent from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/Update/PurchaseRequestContent.js';
import PurchaseRequestDS from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/Update/PurchaseRequestDS.js';
import OfflineWholeModal from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/OfflineWholeModal';
import { replySupplierDS, scoreRfDS } from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/RFIDS';
import RoundQuotationModals from 'srm-front-ssrc/lib/routes/ssrc/InquiryHallNew/components/RoundQuotation';

const { TabPane, TabGroup } = Tabs;

let changeModal;

const RenderButtons = observer((props) => {
  const {
    customizeBtnGroup,
    getButtons,
    sourceKey = 'INQUIRY',
    useRF,
    tabStatus,
    currentType,
    CheckPermissionObject = {},
  } = props;
  return customizeBtnGroup(
    {
      code: `SSRC.${sourceKey}_HALL.NEW_LIST.HEADER_BUTTONS`,
      pro: true,
    },
    <DynamicButtons buttons={getButtons(useRF, tabStatus, currentType, CheckPermissionObject)} />
  );
});

// const scoreStatusMap = {
//   SCORING_RFX: 'orange',
//   PRE_EVALUATION_PENDING_RFX: 'green',
//   BUSINESS_SCORING_RFX: 'orange',
//   BUSINESS_SUMMARY_RFX: 'green',
//   TECHNOLOGY_SCORING_RFX: 'orange',
//   TECHNOLOGY_SUMMARY_RFX: 'green',
// };

/**
 * 路径上?后边 multiSourceNumOrTitle , 可以实现具体单据,配合tabStatus
 */

@observer
class InquiryHall extends React.Component {
  constructor(props) {
    super(props);
    const queryParams = querystring.parse(props.location.search.substr(1));

    this.onGoingKeys = ['going', 'attention', 'approval'];

    this.finishKeys = ['finished', 'others'];

    this.state = {
      record: {}, // 当前行
      sourceProjectId: queryParams.sourceProjectId,
      tableDisplay: '', // 表格展开方式,用户记忆
      tableDisplayObj: {},
      tabChangeVersionObj: {
        toBeReleasedVersion: 1,
        onGoingContainerVersion: 1,
        finishedContainerVersion: 1,
        allContainerVersion: 1,
        rfiContainerVersion: 1,
        rfpContainerVersion: 1,
        detailAllContainerVersion: 1,
      },
      changeTableDisplayFlag: false, // 是否改变过方式
      changeTypeAggregation: undefined, // 如果是从不同的邀请书切换的，则以这个为准
      tabStatus: queryParams.tabStatus || queryParams.defaultTabIndex, // 当前选择的Tab
      tabStatusObj: {},
      initTabFlag: true, // 是否是初始化tab
      // allLoading: true, // 表格loading
      tabsNumber: {}, // 各个页签的count
      subAccountVisible: false, // 转发按钮是否可见，可优化为c7n的modal
      roundQuotationModalVisible: false, // 是否开启多轮报价弹窗
      resendPasswordLoading: false,
      quoFeedBackLackSubmitLoading: false,
      currentType: '', // 当前询价类型
      currentTypeObj: {},
      useRF: false, // 是否展示RF
      createModalVisible: false,
      doubleUnitFlag: false, // 判断是否开启双单位
      detailCount: {}, // 明细count
      offlineWholeFlag: false, // 整单线下寻源标识
      useRFContent: 'ALL', // 展示RFI/RFP
      controllerLoading: false, // 过程控制loading
      currentRfxHeaderId: '', // 当前rfxHeaderId
      serviceChargeFlag: false,
      biddingHallFlag: 0, // 规则是否开启竞价大厅
      feedBackFlag: false, // 使用还比价C7N版flag，默认走h0
      bargainNewFlag: false, // 议价
      projectOldUIFlag: true, // 是否寻源立项老ui
      bidExcutionStatusMap: {}, // 查询新开标状态
      bidOpeningNewFlag: false, // 专家评分开标是否开启新功能
      expertTwoStageOpenBid: false, // 二阶段开标
      roundQuotationExecuteFlag: 0, // ssrc_round_quotation_feedback
      winningBidAnnouncementC7N: false, // 中标公告C7N白名单
      onGoingCollapseKey: this.onGoingKeys,
      onGoingCollapseKeyUserConfigObj: {},
      finishCollapseKey: this.finishKeys,
      finishCollapseKeyUserConfigObj: {},
    };
    this.rFLackQuotedModalRef = React.createRef();
  }

  bidFlag = this.props.sourceKey === BID;

  sourceCategoryName = getSourceCategoryName(this.bidFlag);

  documentTypeName = getDocumentTypeName(this.bidFlag);

  quotationName = getQuotationName(this.bidFlag);

  checkPriceName = getCheckPriceName(this.bidFlag);

  sourceName = getSourceName(this.bidFlag);

  sourceKey = this.props.sourceKey || INQUIRY;

  sourceKeyLowerCase = this.props.sourceKeyLowerCase || INQUIRY_LOWERCASE;

  activeTabKey = getActiveTabKey();

  sourcingResultDrawerRef = null;

  toBeReleasedRef = React.createRef();

  onGoingContainerRef = React.createRef();

  allContainerRef = React.createRef();

  rfContainerRef = React.createRef();

  finishedContainerRef = React.createRef();

  detailAllContainerRef = React.createRef();

  bidListRef = React.createRef();

  bidExcutionRef = React.createRef();

  tableDs = new DataSet(listLineDS(this.documentTypeName, this.bidFlag));

  quotationInfo = new DataSet(
    this.props.remote
      ? this.props.remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_QUOTATIONINFO_DS',
          quotationInfoDS()
        )
      : quotationInfoDS()
  );

  submitInfo = new DataSet(
    this.props.remote
      ? this.props.remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SUBMITINFO_DS',
          submitInfoDS()
        )
      : submitInfoDS()
  );

  cuxTabTableDS = new DataSet(
    this.props.remote
      ? this.props.remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_CUX_TAB_TABLE_DS',
          {},
          {
            that: this,
            allTableDS,
          }
        )
      : {}
  );

  bidInfo = new DataSet(bidInfoDS());

  scoreInfo = new DataSet(scoreInfoDS());

  openingBidDS = new DataSet(openingDS());

  replySupplierDs = new DataSet(replySupplierDS());

  scoreRfDs = new DataSet(scoreRfDS());

  openBidClick = false;

  purchaseRequestDS = new DataSet(
    this.props?.remote
      ? this.props.remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_PURCHASEREQUEST_DS',
          PurchaseRequestDS(this.props.sourceKey || 'INQUIRY'),
          {
            sourceKey: this.props.sourceKey || 'INQUIRY',
          }
        )
      : PurchaseRequestDS(this.props.sourceKey || 'INQUIRY')
  );

  rfiTemplateDs = new DataSet(rfTemplateDS({ sourceCategory: 'RFI' }));

  rfpTemplateDs = new DataSet(rfTemplateDS({ sourceCategory: 'RFP' }));

  offlineWholeDs = new DataSet(offlineWholeDS());

  C7nModalKey = Modal.key();

  componentDidMount() {
    this.initDS();
    this.addInquiryHallListRefreshToWindow(); // 挂载全局方法，方便二开调用
    this.handleRemoteEventInit(); // 给二开埋点处理函数
  }

  // 组件卸载清空数据
  componentWillUnmount() {
    window.SsrcInquiryHallListRefresh = null;
  }

  initDS() {
    this.fetchInquiryHallUserMemory();
    this.fetchLineCheckPermission();
    this.fetchBidOpeningBlackConfig();
    this.queryDoubleUnit();
    this.fetchOfflineWhole();
    this.fetchServiceChargeConfig();
    this.fetchBiddingHallConfig();
    this.fetchH0OrC7N();
    this.fetchProjectOldUIConfig();
    this.fetchExpertTwoStageOpenBid();
    this.fetchRoundQuotationAllInfoConfig();
    // this.fetchShowRF();
  }

  // 是否是新竞价大厅
  isNewBiddingFlag = (payload = {}) => {
    // const { biddingHallFlag } = this.state;
    const { sourceCategory, biddingFlag } = payload || {};
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    return newBiddingFlag;
  };

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const { detailAllDS = {} } = this.props;

    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    const result = !!Number(res);

    this.purchaseRequestDS.setState('doubleUnitFlag', result);
    this.setState({
      doubleUnitFlag: result,
    });
    // eslint-disable-next-line
    isFunction(detailAllDS?.setState) && detailAllDS?.setState('doubleUnitFlag', result);
  };

  // 查询整单线下寻源是否开启
  async fetchOfflineWhole() {
    const { organizationId } = this.props;
    let data = null;
    try {
      if (!this.bidFlag) {
        data = getResponse(
          await fetchConfigSheet({
            configCode: 'ssrc_rfx_offline_whole_config',
            organizationId,
            data: {
              tenantNum: getCurrentTenant().tenantNum,
            },
          })
        );
        if (data && !data.failed) {
          // 现在判断配置表查出来的是开启的，以后要改成没有查出来的是开启的
          if (!isEmpty(data)) {
            this.setState({ offlineWholeFlag: true });
          } else {
            this.setState({ offlineWholeFlag: false });
          }
        }
      }
    } catch (e) {
      throw e;
    }
  }

  // // 查询新专家评分开标状态状态
  // async fetchBidOpenExecutionStatus(record) {
  //   const { rfxHeaderId } = record || {};
  //   if (!rfxHeaderId) return;
  //   try {
  //     const { organizationId } = this.props;

  //     const data = await fetchBidOpenExecution({rfxHeaderId, organizationId});
  //     if (getResponse(data)) {
  //       this.setState({ bidExcutionStatusMap: data });
  //     }
  //   } catch (e) {
  //     throw e;
  //   }
  // };

  // 查询专家评分开标是否开启新功能, 不在在该配置表中的租户默认走新功能
  async fetchBidOpeningBlackConfig() {
    try {
      const { organizationId } = this.props;
      const data = await fetchNewBidEnable({ organizationId });
      if (getResponse(data)) {
        this.setState({ bidOpeningNewFlag: !!data });
      }
    } catch (e) {
      throw e;
    }
  }

  // 启用多轮所有轮次执行情况 白名单
  async fetchRoundQuotationAllInfoConfig() {
    const { organizationId } = this.props;
    let data = null;

    try {
      data = await fetchConfigSheet({
        organizationId,
        configCode: 'ssrc_round_quotation_feedback',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data || isEmpty(data)) {
        return;
      }

      this.setState({
        roundQuotationExecuteFlag: 1,
      });
    } catch (e) {
      throw e;
    }
  }

  // 查询配置表--是否展示标书下载节点
  fetchServiceChargeConfig = async () => {
    const { organizationId } = this.props;
    let data = null;

    try {
      data = await fetchConfigSheet({
        organizationId,
        configCode: 'ssrc_expenses_online_payment_blacklist',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!(!isEmpty(data) && isArray(data) && data[0].id)) {
        this.setState({
          // 即接口返回空就展示标书下载节点，有值则不显示
          serviceChargeFlag: true,
        });
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询配置表--是否启用竞价大厅
  fetchBiddingHallConfig = async () => {
    const { organizationId } = this.props;
    let biddingHallFlag = null;
    try {
      if (!this.bidFlag) {
        biddingHallFlag = await fetchBiddingHallConfigResult({
          organizationId,
          groupCamp: 'PURCHASER', // 阵营。供应商方：SUPPLIER 采购方：PURCHASER
        });
        if (biddingHallFlag === null) {
          return;
        }
        this.setState({ biddingHallFlag: !!biddingHallFlag });
      }
    } catch (e) {
      throw e;
    }
  };

  // 查询是否启用c7n版功能
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();
    if (!isEmpty(res)) {
      let winningBidNew = false;

      const feedBackObj = res.find((item) => item.function === 'COUNTER-BID_SWITCH_C7N') || {}; // 还比价
      const bargainObj =
        res.find((item) => item.function === 'Bargaining_switch_C7N' && item.whiteFlag === '1') ||
        {}; // 议价

      res.forEach((r) => {
        const { function: code } = r || {};

        if (code === 'ACCEPT_RFX_NOTICE_C7N') {
          winningBidNew = true;
        }
      });

      this.setState({
        feedBackFlag: !isEmpty(feedBackObj) && feedBackObj?.whiteFlag === '1',
        bargainNewFlag: !isEmpty(bargainObj),
        winningBidAnnouncementC7N: winningBidNew,
      });
    }
  };

  // 查询新老ui配置
  async fetchProjectOldUIConfig() {
    const { organizationId } = this.props;
    try {
      const data = getResponse(
        await fetchConfigSheet({
          organizationId,
          configCode: 'srm_source_project_old_ui_black_list',
          data: {
            tenantNum: getCurrentTenant().tenantNum,
          },
        })
      );
      if (data && !data.failed) {
        if (data && !isEmpty(data)) {
          this.setState({
            projectOldUIFlag: true,
          });
        } else {
          this.setState({
            projectOldUIFlag: false,
          });
        }
      }
    } catch (e) {
      throw e;
    }
  }

  // 启用二阶段开标租户黑名单
  fetchExpertTwoStageOpenBid = async () => {
    const { organizationId } = this.props;
    try {
      const data = getResponse(
        await fetchConfigSheet({
          organizationId,
          configCode: 'ssrc_expert_two_stage_bid_open',
          data: {
            tenantNum: getCurrentTenant().tenantNum,
          },
        })
      );
      if (data && !data.failed) {
        if (data && !isEmpty(data)) {
          this.setState({
            expertTwoStageOpenBid: false,
          });
        } else {
          this.setState({
            expertTwoStageOpenBid: true,
          });
        }
      }
    } catch (e) {
      throw e;
    }
  };

  // 页面跳转时监测id是否变化
  getSnapshotBeforeUpdate(preProps) {
    const { remote } = this.props;
    const prevParams = querystring.parse(preProps.location.search.substr(1));
    const params = querystring.parse(this.props.location.search.substr(1));
    const {
      sourceProjectId: preId,
      sourceCategory: preSourceCategory,
      tabStatus: preTabStatus,
      rfxStatus: preRfxStatus,
      clarifyAnswer: preClarifyAnswer,
      defaultTabIndex: preDefaultTabIndex = null,
      multiSourceNumOrTitle: preMultiSourceNumOrTitle = '',
    } = prevParams;
    const {
      sourceProjectId,
      sourceCategory,
      tabStatus,
      rfxStatus,
      clarifyAnswer,
      defaultTabIndex = null,
      multiSourceNumOrTitle = '',
    } = params;
    const tabKeyUpdateFlag = !!defaultTabIndex && preDefaultTabIndex !== defaultTabIndex;
    const numTitleChangeFlag =
      !!multiSourceNumOrTitle && multiSourceNumOrTitle !== preMultiSourceNumOrTitle;

    let flag =
      (preId !== sourceProjectId ||
        preSourceCategory !== sourceCategory ||
        preTabStatus !== tabStatus ||
        preRfxStatus !== rfxStatus ||
        preClarifyAnswer !== clarifyAnswer ||
        tabKeyUpdateFlag ||
        numTitleChangeFlag) ??
      null;

    flag = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SNAPSHOTBEFOREUPDATE_RETURN_VALUE',
          flag,
          {
            preProps,
            that: this,
            prevParams,
            params,
          }
        )
      : flag;

    return flag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      const { location = {}, remote } = this.props;
      const { tabStatus: preTabStatus } = params[1] || {};

      const queryParams = querystring.parse(location.search?.substr(1));
      const { clarifyAnswer = '', tabStatus, multiSourceNumOrTitle = '' } = queryParams || {};

      if (remote?.event) {
        remote.event.fireEvent('handleCuxComponentDidUpdate', {
          that: this,
          params,
          queryParams,
        });
      }

      if (clarifyAnswer) {
        if (
          this.SearchComponent?.state?.displayFields.filter((ele) => ele.name === 'clarifyAnswer')
            .length === 0
        ) {
          notification.warning({
            message: intl
              .get(`ssrc.common.view.message.filterMsg`)
              .d('需联系采购方将澄清未读配置为筛选条件后才能进行正常筛选'),
          });
        }
        this.SearchComponent.setField('clarifyAnswer', clarifyAnswer);
      }

      if (multiSourceNumOrTitle) {
        this.setMultiSourceNumOrTitleFromUrlIntoPage();
      }

      // 路径 tabStatus 和之前打开时候不同，需要先变更，后查询
      const changedTabStatus = tabStatus && preTabStatus !== tabStatus;
      const changeStateFirst = changedTabStatus;

      if (changeStateFirst) {
        this.changeTabAnduUpdate(tabStatus);
      } else {
        this.initDS();
      }
    }
  }

  /**
   * 支持路径上带参数 multiSourceNumOrTitle, 就带值到筛选器的组合字段,并更新页面
   * */
  setMultiSourceNumOrTitleFromUrlIntoPage = () => {
    const { location = {} } = this.props;
    const queryParams = querystring.parse(location.search?.substr(1));
    const { multiSourceNumOrTitle = '' } = queryParams || {};
    const { customizeDs } = this.SearchComponent || {};

    const currentMultiSourceNumOrTitle = this.formatSearchNum(multiSourceNumOrTitle);

    if (!customizeDs?.current) {
      customizeDs.create({
        multiRfxNumOrTitle: currentMultiSourceNumOrTitle,
      });
    } else {
      customizeDs.current.set({
        multiRfxNumOrTitle: currentMultiSourceNumOrTitle,
      });
    }
  };

  changeTabAnduUpdate = (currentTabStatus) => {
    if (!currentTabStatus) {
      return;
    }
    this.setState({ tabStatus: currentTabStatus }, () => {
      this.initDS();
    });
  };

  CheckPermissionObject = {};

  /**
   * 获取行上面的权限集的返回数据
   */
  async fetchLineCheckPermission() {
    const { remote } = this.props;
    const prefix =
      this.sourceKeyLowerCase !== 'bid'
        ? 'ssrc.new-inquiry-hall.list.button.'
        : 'ssrc.new-bid-hall.button.';
    const permissionButtonList = [
      `${prefix}control`,
      `${prefix}create`,
      `${prefix}copy`,
      `${prefix}applytoinquiry`,
      `${prefix}projectapprovaltoinquiry`,
      `${prefix}closed`, // 关闭询价单按钮
      `${prefix}inquiry.clarifyquestion`, // 澄清答疑按钮
      `${prefix}edit`, // 维护按钮
      `${prefix}operation`, // 操作按钮
      'inquiry.rf.close.button',
      `${prefix}change`, // 变更记录按钮
      `${prefix}monitoringplatform`, // 询价监控台按钮
      `ssrc.new-inquiry-hall.check-price.-rfxId.button.priceclarification`, // 价格澄清
      `${prefix}bidnotice`, // 中标通知/公告按钮
      `${prefix}twostageopenbid`, // 二阶段开标
    ];
    const permissionList = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_PERMISSION_LIST', permissionButtonList)
      : permissionButtonList;
    const result = getResponse(await checkPermission(permissionList));
    if (result && !result.failed) {
      result.forEach((item = {}) => {
        const { code = null } = item;
        if (!code) {
          return;
        }

        let newCode = code;
        newCode = newCode.substr(code.lastIndexOf('.') + 1);
        this.CheckPermissionObject[newCode] = item;
      });
      this.setState({
        CheckPermissionObject: this.CheckPermissionObject,
      });
      this.forceUpdate();
    }
  }

  // 获取用户上次记忆
  @Bind()
  async fetchInquiryHallUserMemory() {
    const { organizationId, userId, location } = this.props;
    const { pathname } = location || {};
    const queryParams = querystring.parse(location.search.substr(1));
    const { sourceProjectId, sourceProjectName, rfxStatus, sourceCategory } = queryParams;
    if (sourceProjectId) {
      this.setState({
        sourceProjectId,
      });
    }
    const response = getResponse(
      await fetchInquiryHallUserMemory({
        organizationId,
        configKeys: [
          'tableDisplay',
          'inquiryHallStage',
          'currentType',
          'onGoingCollapseKeyRFQ',
          'finishCollapseKeyRFQ',
        ],
      })
    );
    // 用户记忆
    if (response && !response.failed) {
      const { onGoingCollapseKeyRFQ, finishCollapseKeyRFQ } = response || {};
      const { configValue: onGoingConfigValue } = onGoingCollapseKeyRFQ || {};
      const { configValue: finishConfigValue } = finishCollapseKeyRFQ || {};

      const newStateObj = {};
      if (!isNil(onGoingConfigValue)) {
        newStateObj.onGoingCollapseKey = onGoingConfigValue ? onGoingConfigValue.split(',') : [];
        newStateObj.onGoingCollapseKeyUserConfigObj = onGoingCollapseKeyRFQ;
      }

      if (!isNil(finishConfigValue)) {
        newStateObj.finishCollapseKey = finishConfigValue ? finishConfigValue.split(',') : [];
        newStateObj.finishCollapseKeyUserConfigObj = finishCollapseKeyRFQ;
      }

      this.setState({
        ...newStateObj,
        tableDisplay: (response.tableDisplay && response.tableDisplay?.configValue) || 'wide',
        tableDisplayObj: response.tableDisplay || {},
        tabStatusObj: response.inquiryHallStage || {},
        currentType:
          (['RFX', 'RFA', 'RFQ'].includes(queryParams?.sourceCategory)
            ? 'RFQ'
            : queryParams?.sourceCategory) ||
          response?.currentType?.configValue ||
          'RFQ',
        currentTypeObj: response.currentType || {},
      });
    } else {
      this.setState({
        tableDisplay: 'wide',
        currentType:
          (['RFX', 'RFA', 'RFQ'].includes(queryParams?.sourceCategory)
            ? 'RFQ'
            : queryParams?.sourceCategory) || 'RFQ',
      });
    }

    // 页面已经打开，只是更新路由，并没有重新查询，所以要setField,并重新查
    if (this.SearchComponent) {
      this.SearchComponent.setField('sourceProjectId', {
        sourceProjectId,
        sourceProjectName,
      });
      if (rfxStatus) {
        this.SearchComponent.setField('rfxStatus', rfxStatus);
      }
    } else if (sourceCategory) {
      const currentType = ['RFX', 'RFA', 'RFQ'].includes(sourceCategory) ? 'RFQ' : sourceCategory;
      getResponse(
        await changeRfxDetailLayout({
          ...(this.state.currentTypeObj || {}),
          organizationId,
          userId,
          enabledFlag: 1,
          configDesc: 'currentType',
          configKey: 'currentType',
          configValue: currentType,
        })
      );
      this.setState({
        currentType,
      });
    }

    const RFXPageUrl = '/ssrc/new-inquiry-hall/list';
    const RFXPageFlag = (pathname && pathname === RFXPageUrl) || getActiveTabKey() === RFXPageUrl;
    if (RFXPageFlag) {
      const res = await fetchRFContentConfig();
      if (!isJSON(res)) {
        if (res) {
          this.setState({
            useRF: true,
          });
          if (res === 'RFI') {
            this.setState({
              currentType: this.state.currentType === 'RFI' ? 'RFI' : 'RFQ',
              useRFContent: 'RFI',
            });
          } else if (res === 'RFP') {
            this.setState({
              currentType: this.state.currentType === 'RFP' ? 'RFP' : 'RFQ',
              useRFContent: 'RFP',
            });
          } else {
            this.setState({
              useRFContent: 'ALL',
            });
          }
        } else {
          this.setState({
            currentType: 'RFQ',
            useRF: false,
          });
        }
      } else {
        getResponse(JSON.parse(res));
      }
    } else {
      this.setState({
        useRF: false,
      });
    }
  }

  // save user config
  saveUserMemory = async (saveType, saveData) => {
    const { organizationId, userId } = this.props;
    const params = Object.assign(
      { organizationId, userId, enabledFlag: 1 },
      this.state[saveType],
      saveData
    );

    const result = getResponse(await changeRfxDetailLayout(params));
    if (!result) {
      return;
    }

    this.setState({
      [saveType]: result,
    });
  };

  /**
   * 全局页面刷新，个性化弹窗二开使用
   * 【伊品生物】切换到待发布tab，如果处于待发布tab则刷新页面
   * 【58同城】刷新列表
   * @protected
   */
  addInquiryHallListRefreshToWindow = () => {
    const SsrcInquiryHallListRefresh = (type = null) => {
      const { tabStatus } = this.props;
      if (!type) {
        // 如果type为null，则是伊品生物 特殊处理
        if (tabStatus === 'toBeReleased') {
          this.allSearch('', 'toBeReleased');
        } else {
          this.changeTab('toBeReleased');
        }
      } else {
        this.allSearch();
      }
    };
    window.SsrcInquiryHallListRefresh = SsrcInquiryHallListRefresh;
  };

  handleRemoteEventInit = () => {
    const { remote } = this.props;

    if (remote?.event) {
      remote.event.fireEvent('remotePageInit', {
        that: this,
      });
    }
  };

  /**
   * 切换表格布局
   * @param {*} currentTableDisplay 当前的排序表格风格
   */
  @Bind()
  async changeTableDisplay(currentTableDisplay) {
    const { organizationId, userId } = this.props;
    if (currentTableDisplay === this.state.tableDisplay) {
      return;
    }

    //  const { currentType } = this.state;

    this.setState({
      tableDisplay: currentTableDisplay,
      tabChangeVersionObj: {
        toBeReleasedVersion: 0,
        onGoingContainerVersion: 0,
        finishedContainerVersion: 0,
        allContainerVersion: 0,
        rfiContainerVersion: 0,
        rfpContainerVersion: 0,
        detailAllContainerVersion: 0,
      },
      changeTableDisplayFlag: true,
      changeTypeAggregation: undefined,
    });

    const newInquiryHallUI = this.state.tableDisplayObj;

    const response = getResponse(
      await changeRfxDetailLayout({
        ...newInquiryHallUI,
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'tableDisplay',
        configKey: 'tableDisplay',
        configValue: currentTableDisplay,
      })
    );
    if (response && !response.failed) {
      this.changeTableToAggregationOrCommon();
    }
  }

  /**
   * 切换表格风格
   * 初进入页面给四个tab标识为1，切换外侧表格风格，则全都置为1，若为0-改变外侧之后第一次进入需要切换，为1再次进入不需要切换
   * @param {String} changeType - 是从一个不同的邀请书切换还是一个邀请书下的tab切换
   */
  changeTableToAggregationOrCommon(changeType) {
    const { tableDisplay, tabStatus, tabChangeVersionObj, currentType } = this.state;
    const {
      toBeReleasedVersion,
      onGoingContainerVersion,
      finishedContainerVersion,
      allContainerVersion,
      rfiContainerVersion,
      rfpContainerVersion,
      detailAllContainerVersion,
    } = tabChangeVersionObj;
    const aggregation = tableDisplay === 'wide';
    const changeTypeAggregation = changeType === 'diffInvite' ? aggregation : undefined;
    if (changeType === 'diffInvite') {
      this.setState({
        changeTypeAggregation, // 如果是从不同的邀请书切换的，则以这个为准
      });
      return;
    }
    if (currentType === 'RFI' && !this.bidFlag) {
      if (rfiContainerVersion === 0) {
        this.setState({
          tabChangeVersionObj: { ...tabChangeVersionObj, rfiContainerVersion: 1 },
        });
        if (this.rfContainerRef?.current?.handleAggregationChange) {
          this.rfContainerRef.current.handleAggregationChange(aggregation);
        }
      }
    } else if (currentType === 'RFP' && !this.bidFlag) {
      if (rfpContainerVersion === 0) {
        this.setState({
          tabChangeVersionObj: { ...tabChangeVersionObj, rfpContainerVersion: 1 },
        });
        if (this.rfContainerRef?.current?.handleAggregationChange) {
          this.rfContainerRef.current.handleAggregationChange(aggregation);
        }
      }
    } else {
      switch (tabStatus) {
        case 'toBeReleased':
          if (toBeReleasedVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, toBeReleasedVersion: 1 },
            });
            if (this.toBeReleasedRef?.current?.handleAggregationChange) {
              this.toBeReleasedRef.current.handleAggregationChange(aggregation);
            }
          }
          break;
        case 'onGoing':
          if (onGoingContainerVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, onGoingContainerVersion: 1 },
            });
            if (this.onGoingContainerRef?.current?.handleAllAggregationChange) {
              this.onGoingContainerRef.current.handleAllAggregationChange(aggregation);
            }
          }
          break;
        case 'finished':
          if (finishedContainerVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, finishedContainerVersion: 1 },
            });
            if (this.finishedContainerRef?.current?.handleAllAggregationChange) {
              this.finishedContainerRef.current.handleAllAggregationChange(aggregation);
            }
          }
          break;
        case 'all':
          if (allContainerVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, allContainerVersion: 1 },
            });
            if (this.allContainerRef?.current?.handleAggregationChange) {
              this.allContainerRef.current.handleAggregationChange(aggregation);
            }
          }
          break;
        case 'detailAll':
          if (detailAllContainerVersion === 0) {
            this.setState({
              tabChangeVersionObj: { ...tabChangeVersionObj, detailAllContainerVersion: 1 },
            });
            const { current: detailAllContainerCurrent = {} } = this.detailAllContainerRef || {};
            if (detailAllContainerCurrent.handleAllAggregationChange) {
              detailAllContainerCurrent.handleAllAggregationChange(aggregation);
            }
          }
          break;
        default:
          break;
      }
    }
  }

  /**
   * 取消选择切换
   *
   * Tab下如果有多个表格，坑的调用了多次，先用防抖处理
   */
  @Debounce(1500)
  @Bind()
  async cancelAggregationChange() {
    const newInquiryHallUI = this.state.tableDisplayObj;
    const { organizationId, userId } = this.props;
    if (this.state.tableDisplay === 'mid') {
      return;
    }
    getResponse(
      await changeRfxDetailLayout({
        ...newInquiryHallUI,
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'tableDisplay',
        configKey: 'tableDisplay',
        configValue: 'mid',
      })
    );
    this.setState({
      tableDisplay: 'mid',
    });
  }

  @observable RFIContainerCurrentTab = 'all';

  @observable RFParams = {};

  @Bind()
  changeRFIContainerCurrentTab(current) {
    runInAction(() => {
      this.RFIContainerCurrentTab = current;
    });
  }

  @Bind()
  changeRFParams(parmas) {
    runInAction(() => {
      this.RFParams = parmas;
    });
  }

  // 这下面都是渲染的节点 和对应的方法 ************************************************************************************************ //

  // 监控台Node
  RFQNode = (record) => {
    const { remote } = this.props;
    const { sourceCategory, biddingFlag } = record.get(['sourceCategory', 'biddingFlag']);
    const newBiddingFlag = this.isNewBiddingFlag({ sourceCategory, biddingFlag });
    // 竞价大厅的单子不显示询价监控台;
    if (newBiddingFlag) return null;
    const node = customPermissionButton({
      display: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.CommonMonitoringPlatform`, {
          sourceCategoryName: this.sourceCategoryName,
        })
        .d(`{sourceCategoryName}监控台`),
      onClick: () => this.goMonitor(record.toData()),
      ...this.CheckPermissionObject?.monitoringplatform,
    });
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_RFQ_MONITOR_NODE', node, {
          record,
          newBiddingFlag,
          sourceCategory,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  // 寻源过程控制Node
  controllerNode = (record) => {
    const { remote } = this.props;
    const node = customPermissionButton({
      display: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonSourcingProcessControl`, {
          sourceName: this.sourceName,
        })
        .d('{sourceName}过程控制'),
      onClick: () => this.directControllerDetail(record.toData()),
      ...this.CheckPermissionObject?.control,
    });
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_CONTROLLER_NODE', node, {
          record,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  // 变更记录Node
  changeRecord = (record) => {
    const { remote } = this.props;
    const node = customPermissionButton({
      display: intl.get(`ssrc.inquiryHall.model.inquiryHall.changeReords`).d('变更记录'),
      onClick: () => this.showChangeRecords(record.toData()),
      ...this.CheckPermissionObject?.change,
    });
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_CHANGE_RECORD_NODE', node, {
          record,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  // 维护Node
  updateNode = (record, offlineWholeFlag = 0) => {
    const { remote } = this.props;
    const node = (
      <div>
        <a
          onClick={() =>
            offlineWholeFlag === 1
              ? this.offlineWholeUpdate(record?.toData(), 'edit')
              : this.inquiryUpdate(record.toData())
          }
        >
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.update`).d('编辑')}
        </a>
      </div>
    );
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_EDIT_NODE', node, {
          record,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  // 录入供应商
  inputSupplierNode = (record) => (
    <div>
      <a onClick={() => this.offlineWholeUpdate(record.toData(), 'edit')}>
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.update`).d('编辑')}
        {/* {intl.get(`ssrc.inquiryHall.model.inquiryHall.inputSupplierNode`).d('录入供应商')} */}
      </a>
    </div>
  );

  // 维护RFNode
  updateRFNode = (record) => (
    <div>
      <a onClick={() => this.inquiryRFUpdate(record)}>
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.update`).d('维护')}
      </a>
    </div>
  );

  playHistoryNode = (record) => {
    const { remote } = this.props;
    const offlineWholeFlag = record?.get('offlineWholeFlag');
    const otherProps = offlineWholeFlag
      ? {
          funcType: 'link',
          icon: null,
        }
      : {};

    const node = (
      <OperationRecord
        displayType={!offlineWholeFlag ? 'text' : ''}
        rfxHeaderId={record.get('rfxHeaderId')}
        rfx={{
          sourceKey: this.sourceKey,
          documentTypeName: this.documentTypeName,
          quotationName: this.quotationName,
          checkPriceName: this.checkPriceName,
          sourceCategoryName: this.sourceCategoryName,
        }}
        {...otherProps}
      />
    );
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_PLAY_HISTORY_NODE', node, {
          record,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  // 询价监控台
  rfxMonitorNode = (record = {}) => {
    const data = record.toData() || {};
    const { supervisorFlag = 0, rfxStatus = null } = data;
    let node = null;

    if (!rfxStatus) {
      return node;
    }

    const visibleFlag =
      (rfxStatus === 'NOT_START' || rfxStatus === 'IN_QUOTATION') && supervisorFlag;
    if (visibleFlag) {
      node = this.RFQNode(record);
    }
    return node;
  };

  // 澄清答疑
  // [4, 4]为主按钮参数，[14, -12]为展示在更多里时的参数
  questionAnswerNode = (record, list = []) => {
    const { remote } = this.props;
    const { tabStatus } = this.state;
    const isTabAllFlag = tabStatus === 'all' || tabStatus === 'finished';
    const offsetFlag = isTabAllFlag ? list?.length < 2 : list?.length < 1;
    const node = (
      <div>
        <Badge
          count={record.get('unreadIssueCount')}
          offset={offsetFlag ? [] : [14, -12]}
          className={Style['expand-more-badge']}
        >
          <a onClick={() => this.directQuestionAnswer(record.toData())}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.questionAnswer`).d('澄清答疑')}
          </a>
        </Badge>
      </div>
    );
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_QUESTION_ANSWER_NODE', node, {
          record,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  questionAnswerRFNode = (record) => (
    <div>
      <Badge
        count={record.get('unreadIssueCount') || 0}
        offset={[4, 4]}
        className={Style.inquityHallBadge}
      >
        <a onClick={() => this.directQuestionAnswerRF(record)}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.questionAnswer`).d('澄清答疑')}
        </a>
      </Badge>
    </div>
  );

  /**
   * @description: 寻源问题
   * @param {*}
   */
  sourcingProblemRFNode = (record) => (
    <div>
      <a onClick={() => this.directSourcingProblem(record)}>
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingProblem`).d('寻源问题')}
      </a>
    </div>
  );

  /**
   * @description: 寻源过程控制
   * @param {*}
   */
  sourcingProcessControlRFNode = (record) => (
    <div>
      <a onClick={() => this.directSourcingProcessControl(record.toData())}>
        {intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonSourcingProcessControl`, {
            sourceName: this.sourceName,
          })
          .d('{sourceName}过程控制')}
      </a>
    </div>
  );

  /**
   * @description: 寻源过程控制链接
   * @param {*}
   */
  directSourcingProcessControl = async (record) => {
    const { history } = this.props;
    const params = {
      rfHeaderId: record.rfHeaderId,
      sourceCategory: record.sourceCategory,
    };
    this.setState({
      allLoading: true,
    });
    try {
      // 校验逻辑
      const res = await validateBeforeDirectControllerRF(params);
      if (res) {
        // 创建时间副本
        const onOk = async () => {
          const result = await createBeforeDirectControllerRF(params);
          if (result && !result.failed) {
            history.push({
              pathname: `${getActiveTabKey()}/rf-detail-controller/${record.rfHeaderId}/${
                record.sourceCategory
              }/${result.adjustRecordId}`,
            });
          } else {
            message.warning(result.message);
          }
        };
        if (res.validateResult === 'createAdjustAgain') {
          Modal.confirm({
            key: Modal.key(),
            title: intl
              .get(`ssrc.inquiryHall.view.message.title.adjustAgain`)
              .d(`征询单中的部分信息已变更，是否重新发起寻源过程控制？`),
            onOk: () => onOk(),
          });
        } else if (res.validateResult === 'createAdjust') {
          onOk();
        } else if (res.validateResult === 'openAdjust') {
          history.push({
            pathname: `${getActiveTabKey()}/rf-detail-controller/${record.rfHeaderId}/${
              record.sourceCategory
            }/${res.adjustRecordId}`,
          });
        }
      }
    } catch (e) {
      throw e;
    } finally {
      this.setState({
        allLoading: false,
      });
    }
  };

  /**
   * @description: 变更详情
   * @param {*}
   */
  changeDetailRFNode = (record) => (
    <div>
      <a onClick={() => this.changeDetail(record.toData())}>
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.changeDetail`).d('变更详情')}
      </a>
    </div>
  );

  /**
   * @description: 关闭变更详情按钮
   * @param {*}
   */
  handleChangeClose = () => {
    changeModal.close();
  };

  /**
   * @description: 变更详情按钮
   * @param {*}
   */
  changeDetail = () => {
    // const { rfHeaderId } = record;
    // const { history } = this.props;
    changeModal = Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.changeDetail`).d('变更详情'),
      children: <RFChangeDetail />,
      closable: false,
      style: { width: '742px' },
      onCancel: () => {},
      footer: (
        <Button color="primary" onClick={this.handleChangeClose}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.close`).d('关闭')}
        </Button>
      ),
      drawer: true,
    });
  };

  // 查看评分node
  viewScoreNode = (record) => (
    <Badge
      count={
        ((record.get('priceClarifyShowFlag') && record.get('priceRepliedCount')) || 0) +
        (record.get('reviewUnreadCount') || 0)
      }
      className={Style['expand-more-badge']}
      offset={record.getState('includeViewScore') ? [14, -12] : []}
    >
      <a onClick={() => this.rfxEvaluation(record.toData())} style={{ 'margin-right': '4px' }}>
        {intl.get('ssrc.inquiryHall.model.inquiryHall.viewScored').d('查看评分')}
      </a>
    </Badge>
  );

  // 评分node
  scoreNode = (record) => {
    const { remote } = this.props;
    const button = (
      <Badge
        count={
          ((record.get('priceClarifyShowFlag') && record.get('priceRepliedCount')) || 0) +
          (record.get('reviewUnreadCount') || 0)
        }
        className={Style['expand-more-badge']}
      >
        <a onClick={() => this.rfxScoreNode(record.toData())} style={{ 'margin-right': '4px' }}>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.scored').d('评分')}
        </a>
      </Badge>
    );
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_SCORE_NODE', button, {
          record,
          bidFlag: this.bidFlag,
        })
      : button;
  };

  // 符合性检查
  Check = (record) => {
    const { remote } = this.props;

    const button = (
      <Badge count={record.get('reviewUnreadCount') || 0} className={Style['expand-more-badge']}>
        <a onClick={() => this.rfxEvaluation(record.toData(), 'check')}>
          {intl.get(`ssrc.inquiryHall.view.message.button.complianceCheck`).d('符合性检查')}
        </a>
      </Badge>
    );

    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_SCORE_CHECK', button, {
          record,
        })
      : button;
  };

  // 评分node
  viewCheck = (record) => (
    <Badge count={record.get('reviewUnreadCount') || 0} className={Style['expand-more-badge']}>
      <a onClick={() => this.rfxEvaluation(record.toData(), 'check')}>
        {intl.get(`ssrc.inquiryHall.view.message.button.complianceCheckView`).d('符合性检查查看')}
      </a>
    </Badge>
  );

  // 查看详情单据node
  viewDetailNode = (record, offlineWholeFlag = 0) => (
    <div>
      <a
        onClick={() =>
          offlineWholeFlag === 1
            ? this.offlineWholeUpdate(record?.toData(), 'detail')
            : this.inquiryDetail(record)
        }
      >
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
      </a>
    </div>
  );

  // 进入核价
  checkPriceNode = (record) => {
    const { remote } = this.props;

    const checkPriceButton = (
      <Badge
        count={
          (this.CheckPermissionObject?.priceclarification?.approve &&
            record.get('priceRepliedCount')) ||
          0
        }
        className={Style['expand-more-badge']}
        offset={record.getState('includeCheckPrice') ? [14, -12] : []}
      >
        <a
          onClick={() => this.inquiryCheckPrice(record.toData())}
          style={{ 'margin-right': '4px' }}
        >
          {intl
            .get(`ssrc.inquiryHall.view.message.button.commonCheckPrice`, {
              checkPriceName: this.checkPriceName,
            })
            .d('{checkPriceName}')}
        </a>
      </Badge>
    );

    const processButtons = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_CHECK_PRICE_BUTTONS', checkPriceButton, {
          record,
        })
      : checkPriceButton;

    return processButtons;
  };

  // 资格预审
  prequalificationNode = (record) => (
    <div onClick={() => this.directPrequalification(record.toData())}>
      <a>{intl.get(`ssrc.inquiryHall.view.message.button.preQualification`).d('资格预审')}</a>
    </div>
  );

  // 预审查看
  quotationViewNode = (record) => (
    <div onClick={() => this.directPrequalification(record.toData())}>
      <a>{intl.get(`ssrc.inquiryHall.view.message.button.quotationView`).d('预审查看')}</a>
    </div>
  );

  // 评分管理
  scoreManagerNode = (record) => {
    const { remote } = this.props;
    const button = (
      <Badge
        count={
          ((record.get('priceClarifyShowFlagManager') && record.get('priceRepliedCount')) || 0) +
          (record.get('reviewUnreadCount') || 0)
        }
        className={Style['expand-more-badge']}
        offset={record.getState('includeScoreManager') ? [14, -12] : []}
      >
        <a
          onClick={() => this.directScoreManager(record.toData())}
          style={record.getState('includeScoreManager') ? {} : { 'margin-right': '4px' }}
        >
          {intl.get('ssrc.inquiryHall.model.inquiryHall.scoreManager').d('评分管理')}
        </a>
      </Badge>
    );

    const scoreManagerButton = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SCORE_MANAGER_NODE', button, {
          record,
        })
      : button;

    return scoreManagerButton;
  };

  // 还比价
  FeedbackBargainNode = (record) => {
    const { supplierBargainUnReadFlag = 0 } = record?.get(['supplierBargainUnReadFlag']) || {};

    const { remote } = this.props;
    const node = (
      <div>
        <a onClick={() => this.inquiryFeedbackBargain(record.toData())}>
          {intl.get(`ssrc.inquiryHall.view.message.button.stillCompare`).d('还比价')}
        </a>
        {supplierBargainUnReadFlag === 1 ? (
          <Badge status="error" style={{ marginLeft: '4px', paddingBottom: '2px' }} />
        ) : (
          ''
        )}
      </div>
    );
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_FEEDBACK_BARGAIN_NODE', node, {
          record,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  ShowQuoFeedBackLackModal = (record) => {
    const { remote } = this.props;
    const button = (
      <div>
        <a onClick={() => this.handleShowQuoFeedBackLackModal(record.toData())}>
          {intl
            .get(`ssrc.inquiryHall.view.message.button.commonOperatingQuoLack`, {
              quotationName: this.quotationName,
            })
            .d('查看{quotationName}响应')}
        </a>
      </div>
    );

    return remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_SHOWQUOFEEDBACKLACKMODAL_BUTTON',
          button,
          {
            record,
            bidFlag: this.bidFlag,
          }
        )
      : button;
  };

  onOperateBidNode = (record) => {
    const { CheckPermissionObject = {}, expertTwoStageOpenBid = false } = this.state;
    const { approve } = CheckPermissionObject?.twostageopenbid || {};

    // 开启二阶段后，按钮需要走权限
    const hiddenOpenBid = expertTwoStageOpenBid && !approve;

    if (hiddenOpenBid) {
      return;
    }

    return (
      <div>
        <a onClick={() => this.onOperateBidModel(record.toData())}>
          {intl.get(`ssrc.inquiryHall.view.message.button.operating`).d('操作')}
        </a>
      </div>
    );
  };

  openingBidNode = (record) => {
    const { remote } = this.props;
    const button = (
      <div>
        <a onClick={() => this.openingBidModel(record.toData())}>
          {intl.get(`ssrc.inquiryHall.view.message.button.openingBid`).d('开标')}
        </a>
      </div>
    );

    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_OPENING_BID_NODE', button, {
          record,
          bidFlag: this.bidFlag,
        })
      : button;
  };

  openPreliminaryNode = (record) => (
    <div>
      <a onClick={() => this.openPreliminary(record.toData())}>
        {intl.get(`ssrc.inquiryHall.view.message.button.preliminary`).d('初审')}
      </a>
    </div>
  );

  BidWinnerNoticeNode = (record) => {
    const { remote } = this.props;
    const { CheckPermissionObject = {} } = this.state;
    if (CheckPermissionObject?.bidnotice?.controllerType === 'hidden') return null;

    const node = (
      <div>
        <a onClick={() => this.directBidWinnerNotice(record.toData())}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.bidNotices`).d('中标通知/公告')}
        </a>
      </div>
    );
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_BIDWINNERNOTICE_NODE', node, {
          record,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  // 服务费管理
  serviceChargeManage = (record) => (
    <div>
      <a onClick={() => this.openServiceChargeManage(record)}>
        {intl.get(`ssrc.inquiryHall.view.message.button.refundChargeButton`).d('服务费管理')}
      </a>
    </div>
  );

  // 服务费管理弹框
  openServiceChargeManage = (record) => {
    openServiceChargeManageModal({ record, bidFlag: this.bidFlag });
  };

  directRoundQuotationNode = (record) => (
    <div>
      <a onClick={() => this.directRoundQuotation(record.toData())}>
        {intl.get(`ssrc.inquiryHall.view.message.button.roundQuotation`).d('多轮报价')}
      </a>
    </div>
  );

  // 关闭询价单按钮
  closeInquiryListNode = (record, onGoingStatus) => {
    const { remote } = this.props;
    const node = (
      <div className={Style.closeInquiryWrapper}>
        {record.get('closeRecordFlag') && record.get('closeRecordFlag') === 1 ? (
          <Tooltip
            placement="right"
            title={intl
              .get('ssrc.inquiryHall.view.message.button.closeInquiryList.commonPlaceholder', {
                documentTypeName: this.documentTypeName,
              })
              .d(`{documentTypeName}正在进行关闭审批,请勿重复操作`)}
          >
            <Button disabled>
              {this.bidFlag
                ? intl.get('ssrc.inquiryHall.view.message.button.closeBid').d('关闭招标书')
                : intl.get('ssrc.inquiryHall.view.message.button.closeRfx').d('关闭询价单')}
            </Button>
          </Tooltip>
        ) : (
          <a onClick={() => this.closeInquiryListDrawer(record.toData(), onGoingStatus)}>
            {this.bidFlag
              ? intl.get('ssrc.inquiryHall.view.message.button.closeBid').d('关闭招标书')
              : intl.get('ssrc.inquiryHall.view.message.button.closeRfx').d('关闭询价单')}
          </a>
        )}
      </div>
    );
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_CLOSE_INQUIRY_NODE', node, {
          record,
          bidFlag: this.bidFlag,
        })
      : node;
  };

  // 复制历史单据
  @Bind()
  copyHistoryRFQNode = (record) => {
    const { remote } = this.props;
    return (
      <div>
        <a
          onClick={() =>
            remote?.event
              ? remote?.event?.fireEvent('copyHistoryOrderModal', {
                  copyHistoryOrderModal: this.copyHistoryOrderModal,
                  record,
                  bidFlag: this.bidFlag,
                })
              : this.copyHistoryOrderModal(record)
          }
        >
          {intl.get(`ssrc.inquiryHall.view.message.button.copyHistoryRFQ`).d('复制')}
        </a>
      </div>
    );
  };

  // 核价阶段发起议价
  @Bind()
  bargainingS = (record) => {
    const { remote } = this.props;
    const bargainingComp = (
      <div>
        <a onClick={() => this.directBargainingS(record.toData())}>
          {intl.get(`ssrc.inquiryHall.view.message.button.bargaining`).d('议价')}
        </a>
      </div>
    );
    const renderProps = {
      directBargainingS: this.directBargainingS,
      record,
    };
    return remote
      ? remote.render(
          'SSRC_INQUIRY_HALL_NEW_LIST_RENDER_LINE_BARGAIN_NODE',
          bargainingComp,
          renderProps
        )
      : bargainingComp;
  };

  confirmSupplier = (record) => (
    <div>
      <a onClick={() => this.directConfirmSupplier(record)}>
        {intl.get(`ssrc.inquiryHall.view.message.button.confirmSupplier`).d('确认供应商')}
      </a>
    </div>
  );

  refundChargeNode = (record) => (
    <div>
      <a onClick={() => this.directConfirmRefund(record)}>
        {intl.get(`ssrc.inquiryHall.view.message.button.refundChargeButton`).d('服务费管理')}
      </a>
    </div>
  );

  // 竞价大厅
  @Bind()
  biddingHallNode(record) {
    const { remote } = this.props;
    const rfxByFlag = record.get('rfxByFlag');
    const showButtonFlag = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_LINE_BIDDING_HALL_NODE_SHOW_FLAG',
          rfxByFlag,
          {
            record,
            bidFlag: this.bidFlag,
          }
        )
      : rfxByFlag;
    const node = showButtonFlag ? (
      <div>
        <a onClick={() => this.directBiddingHall(record)}>
          {intl.get('ssrc.inquiryHall.view.message.button.biddingHall').d('竞价大厅')}
        </a>
      </div>
    ) : null;
    return node;
  }

  // ***************************************************************这下面是操作渲染********************************//

  /**
   * 更多操作
   * @param {*} moreList 更多操作的list
   */
  @Bind()
  renderMoreAction(moreList = []) {
    const menu = (
      <Menu className={Style.dropdownMoreList}>
        {moreList.map((item) => (
          <Menu.Item className={Style.dropdownMoreOperate} key={uuid()}>
            {item}
          </Menu.Item>
        ))}
      </Menu>
    );
    return menu;
  }

  /**
   * 给操作means推入操作
   * @param {*} list 初始数组
   * @param {*} record 行数据
   * @param {*} controllerdisabled 是否不需要推入 寻源控制
   */
  @Bind()
  pushOtherNode(list = [], record, onGoingStatus) {
    const { history, remote } = this.props;
    const { tabStatus } = this.state;
    const {
      rfxStatus,
      offlineWholeFlag = 0,
      quotationStartDate,
      sourceCategory,
      biddingFlag,
      biddingStatus, // biddingStatus 状态(竞价大厅专用字段-未开始时区分签到、试竞价，竞价开始后与其他一样)
    } = record.get([
      'rfxStatus',
      'offlineWholeFlag',
      'quotationStartDate',
      'sourceCategory',
      'biddingFlag',
      'biddingStatus',
    ]);
    // 竞价大厅标识
    const newBiddingFlag = this.isNewBiddingFlag({ sourceCategory, biddingFlag });
    // 暂停的新竞价单据不显示过程控制
    const newBiddingPausedFlag = newBiddingFlag && rfxStatus === 'PAUSED';
    // 整单录入、新竞价暂停单据不显示过程控制
    if (remote?.event) {
      remote.event.fireEvent('pushFixNodeRemote', {
        that: this,
        list,
        record,
        bidFlag: this.bidFlag,
      });
    }
    if (
      this.CheckPermissionObject?.control?.controllerType !== 'hidden' &&
      !offlineWholeFlag &&
      !newBiddingPausedFlag
    ) {
      // 1、新竞价单未开始 签到开始流程之前，需要关注页签：主推操作为寻源过程控制;
      // 2、签到开始时间之后的 签到中、试竞价未开始、试竞价中、竞价未开始、正式竞价中 流程，需要处理页签：主推操作为竞价大厅;
      // 3、全部页签根据（1、2）主推操作放到复制后面;
      if (
        rfxStatus === 'NOT_START' &&
        (!quotationStartDate || (!!newBiddingFlag && biddingStatus === 'SIGN_NOT_START'))
      ) {
        if (tabStatus !== 'all') {
          list.unshift(this.controllerNode(record)); // 当询价单状态为【未开始】且询价单上投标开始时间为空时，主推操作为招标过程控制
        } else {
          list.splice(1, 0, this.controllerNode(record));
        }
      } else {
        list.push(this.controllerNode(record));
      }
    }

    if (
      this.CheckPermissionObject?.clarifyquestion?.controllerType !== 'hidden' &&
      !offlineWholeFlag
    ) {
      list.push(this.questionAnswerNode(record, list));
    }
    // 是否推入关闭询价单 如果分配了权限并且状态不为【新建】【发布审批中】【发布审批拒绝】【完成】状态
    if (
      this.CheckPermissionObject?.closed?.controllerType !== 'hidden' &&
      rfxStatus !== 'NEW' &&
      rfxStatus !== 'RELEASE_APPROVING' &&
      rfxStatus !== 'RELEASE_REJECTED' &&
      rfxStatus !== 'FINISHED' &&
      !offlineWholeFlag
    ) {
      list.push(this.closeInquiryListNode(record, onGoingStatus));
    }
    if (record.get('adjustRecordFlag') && !offlineWholeFlag) {
      list.push(this.changeRecord(record));
    }
    list.push(this.playHistoryNode(record));

    if (newBiddingFlag) {
      if (['NOT_START', 'IN_QUOTATION', 'PAUSED'].includes(rfxStatus)) {
        // 1、新竞价单未开始 签到开始流程之前，需要关注页签：主推操作为寻源过程控制;
        // 2、签到开始时间之后的 签到中、试竞价未开始、试竞价中、竞价未开始、正式竞价中 流程，需要处理页签：主推操作为竞价大厅;
        // 3、全部页签根据（1、2）主推操作放到复制后面;
        if (biddingStatus !== 'SIGN_NOT_START' && tabStatus !== 'all') {
          list.unshift(this.biddingHallNode(record));
        } else {
          if (tabStatus === 'all') {
            // 全部的话 放到寻源过程后面
            list.splice(2, 0, this.biddingHallNode(record));
          } else {
            // 非全部页签 放到复制后面
            list.splice(1, 0, this.biddingHallNode(record));
          }
        }
      } else if (
        ![
          'PRETRIAL_PENDING', // 待初审
          'ROUND_QUOTATION', // 多轮报价
          'PRE_EVALUATION_APPROVING', // 中标候选人审批中
          'CHECK_APPROVING', // 核价审批
          'FINISHED', // 完成
          'ROUNDED', // 再次询价
          'CANCELED', // 取消
          'IN_PREQUAL', // 资格预审中
          'PENDING_PREQUAL', // 待预审审批
          'RELEASE_REJECTED', // 发布审批拒绝
          'RELEASE_APPROVING', // 发布审批中
        ].includes(rfxStatus)
      ) {
        // 不是上面这些状态时 保持原有顺序推入竞价大厅按钮
        list.push(this.biddingHallNode(record));
      }
    }
    if (remote?.event) {
      remote.event.fireEvent('pushOtherNodeRemote', {
        that: this,
        list,
        record,
        bidFlag: this.bidFlag,
        history,
      });
    }
    // list.push(this.rfxMonitorNode(record));
    return list.filter(Boolean);
  }

  renderMoreLink(record) {
    return this.CheckPermissionObject?.clarifyquestion?.controllerType !== 'hidden' ? (
      <Badge
        count={
          (record.get('unreadIssueCount') || 0) +
          ((record.getState('includeScoreManager') && // 此处注意undefind+数字为NAN
            ((record.get('priceClarifyShowFlagManager') && record.get('priceRepliedCount')) || 0) +
              (record.get('reviewUnreadCount') || 0)) ||
            0) +
          ((this.CheckPermissionObject?.priceclarification?.approve &&
            record.getState('includeCheckPrice') &&
            record.get('priceRepliedCount')) ||
            0) +
          ((record.getState('includeViewScore') &&
            ((record.get('priceClarifyShowFlag') && record.get('priceRepliedCount')) || 0) +
              (record.get('reviewUnreadCount') || 0)) ||
            0)
        }
        className={Style['expand-more-badge']}
      >
        <a>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
          <Icon type="expand_more" />
        </a>
      </Badge>
    ) : (
      <Badge
        className={Style['expand-more-badge']}
        count={
          ((record.getState('includeScoreManager') && // 此处注意undefind+数字为NAN
            ((record.get('priceClarifyShowFlagManager') && record.get('priceRepliedCount')) || 0) +
              (record.get('reviewUnreadCount') || 0)) ||
            0) +
          ((this.CheckPermissionObject?.priceclarification?.approve &&
            record.getState('includeCheckPrice') &&
            record.get('priceRepliedCount')) ||
            0) +
          ((record.getState('includeViewScore') &&
            ((record.get('priceClarifyShowFlag') && record.get('priceRepliedCount')) || 0) +
              (record.get('reviewUnreadCount') || 0)) ||
            0)
        }
      >
        <a>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
          <Icon type="expand_more" />
        </a>
      </Badge>
    );
  }

  /**
   * 最终需要展示的操作
   * @param {*} meanButtons 操作List
   */
  @Bind
  returnOperate(meanButtons = [], aggregation, record) {
    const { remote } = this.props;
    // 二开埋点
    const processButtons = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_RECORD_BUTTONS', meanButtons, {
          record,
          bidFlag: this.bidFlag,
          refreshList: this.allSearch,
          quotationName: this.quotationName,
          checkPriceName: this.checkPriceName,
          listComponentThis: this,
        })
      : meanButtons;
    const mean = processButtons.filter(Boolean);

    if (mean && mean.length > 1) {
      const { tabStatus } = this.state;
      const isTabAllFlag = tabStatus === 'all' || tabStatus === 'finished';
      // 全部页签按钮数量
      const allTabBtnCount = remote
        ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ALLTABBTNCOUNT', 2, {
            bidFlag: this.bidFlag,
          })
        : 2;
      // 其他页签按钮数量
      const otherTabBtnCount = remote
        ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_OTHERTABBTNCOUNT', 1, {
            bidFlag: this.bidFlag,
          })
        : 1;
      if (aggregation) {
        return (
          <Fragment>
            {mean.slice(0, isTabAllFlag ? allTabBtnCount : otherTabBtnCount).map((btn) => (
              <div className={Style.flatBtn}>{btn}</div>
            ))}
            {isTabAllFlag ? (
              mean.length > allTabBtnCount ? (
                <Dropdown
                  overlay={this.renderMoreAction(mean.slice(allTabBtnCount))}
                  trigger={['click', 'hover']}
                  placement="bottomLeft"
                >
                  {this.renderMoreLink(record)}
                </Dropdown>
              ) : (
                ''
              )
            ) : (
              <Dropdown
                overlay={this.renderMoreAction(mean.slice(otherTabBtnCount))}
                trigger={['click', 'hover']}
                placement="bottomLeft"
              >
                {this.renderMoreLink(record)}
              </Dropdown>
            )}
          </Fragment>
        );
      } else {
        return (
          <div className={Style.more}>
            <div className="main">
              {mean.slice(0, isTabAllFlag ? allTabBtnCount : otherTabBtnCount).map((btn, index) => {
                if (index !== 0) {
                  return (
                    <span className="main-btn" style={{ marginLeft: '16px' }}>
                      {btn}
                    </span>
                  );
                }
                return <span className="main-btn">{btn}</span>;
              })}
            </div>
            {isTabAllFlag ? (
              mean.length > allTabBtnCount ? (
                <Dropdown
                  overlay={this.renderMoreAction(mean.slice(allTabBtnCount))}
                  trigger={['click', 'hover']}
                  placement="bottomLeft"
                >
                  {this.renderMoreLink(record)}
                </Dropdown>
              ) : (
                ''
              )
            ) : (
              <Dropdown
                overlay={this.renderMoreAction(mean.slice(otherTabBtnCount))}
                trigger={['click', 'hover']}
                placement="bottomLeft"
              >
                {this.renderMoreLink(record)}
              </Dropdown>
            )}
          </div>
        );
      }
    } else {
      return mean;
    }
  }

  // 判断该node是否在更多里面
  adjustMoreLinkIncludeNode(record, mean, nodeName) {
    const { tabStatus } = this.state;
    const isTabAllFlag = tabStatus === 'all';
    if (isTabAllFlag) {
      if (mean.length >= 2) {
        record.setState(nodeName, true);
      } else {
        record.setState(nodeName, false);
      }
    } else {
      if (mean.length >= 1) {
        record.setState(nodeName, true);
      } else {
        record.setState(nodeName, false);
      }
    }
  }

  /**
   *  操作 全部
   * @param {*} record 行信息
   * @protected 此方法被【玛格家具】二开，请勿删除、修改此方法名！！！
   * @protected 此方法调用的方法名也请勿删除、修改！！！
   */
  @Bind()
  renderOperate({ record }, aggregation, finishTabKey) {
    let mean = [];
    const { remote, history } = this.props;
    const { tabStatus, serviceChargeFlag } = this.state;
    const {
      sealedQuotationFlag,
      sourceCategory,
      prequalMemberFlag,
      rfxStatus,
      openExecutionStatus,
      expertScoreType,
      openEnabledFlag,
      scoreStatus,
      evaluateExpertFlag,
      rescoreFlag,
      evaluateLeaderFlag,
      pretrailUserFlag,
      headerWorkFlows = [],
      roundQuotationRule,
      roundHeaderStatus,
      bargainClosedFlag,
      checkUserFlag,
      prequalSubmitFlag,
      scoredFlag,
      scoreRoundStatus,
      openBidOrder,
      expertSequenceNum,
      reviewScoredStatus,
      initialReview,
      indicAssignCount,
      currentSequenceNum,
      bargainingStage = null,
      observerFlag,
      rfxHeaderId = '',
      projectLineSectionId,
      offlineWholeFlag = 0,
      prequalViewFlag = 0,
      serviceExpenseChargeFlag = 0,
      biddingFlag,
      // biddingStatus, // biddingStatus 状态(竞价大厅专用字段-未开始时区分签到、试竞价，竞价开始后与其他一样)
      expertScoredStatus,
    } =
      record.get([
        'sealedQuotationFlag',
        'sourceCategory',
        'prequalMemberFlag',
        'rfxStatus',
        'openExecutionStatus',
        'expertScoreType',
        'openEnabledFlag',
        'scoreStatus',
        'evaluateExpertFlag',
        'rescoreFlag',
        'evaluateLeaderFlag',
        'pretrailUserFlag',
        'headerWorkFlows',
        'roundQuotationRule',
        'roundHeaderStatus',
        'bargainClosedFlag',
        'checkUserFlag',
        'prequalSubmitFlag',
        'scoredFlag',
        'scoreRoundStatus',
        'openBidOrder',
        'expertSequenceNum',
        'reviewScoredStatus',
        'initialReview',
        'indicAssignCount',
        'currentSequenceNum',
        'bargainingStage',
        'observerFlag',
        'rfxHeaderId',
        'projectLineSectionId',
        'offlineWholeFlag',
        'prequalViewFlag',
        'serviceExpenseChargeFlag',
        'biddingFlag',
        // 'biddingStatus',
        'expertScoredStatus',
      ]) || {};
    // 是否是竞价大厅标识
    const newBiddingFlag = this.isNewBiddingFlag({ sourceCategory, biddingFlag });
    const getCheckPrice = (flag = false) => {
      if (flag) {
        mean.push(
          headerWorkFlows?.length ? (
            <Popover content={workFlowStepRender(headerWorkFlows)} placement="right">
              {this.checkPriceNode(record)}
            </Popover>
          ) : (
            this.checkPriceNode(record)
          )
        );
        return;
      }
      mean.push(this.checkPriceNode(record));
    };

    const CommonScoreRoundQuotationFlag =
      roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE'; // 评分多轮报价
    const CommonCheckRoundQuotationFlag =
      roundQuotationRule === 'CHECK' || roundQuotationRule === 'AUTO_CHECK'; // 核价多轮报价
    const RoundQuotationCuxProps = { record, bidFlag: this.bidFlag };
    const ScoreRoundQuotationFlag = !remote
      ? CommonScoreRoundQuotationFlag
      : remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_RENDEROPERATE_SCOREROUND_VIEW',
          CommonScoreRoundQuotationFlag,
          RoundQuotationCuxProps
        ); // 评分多轮报价
    const CheckRoundQuotationFlag = !remote
      ? CommonCheckRoundQuotationFlag
      : remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_RENDEROPERATE_CHECKROUND_VIEW',
          CommonCheckRoundQuotationFlag,
          RoundQuotationCuxProps
        );
    const onOperateBidNode = this.onOperateBidNode(record);

    if (
      tabStatus === 'all' &&
      this.CheckPermissionObject?.copy?.controllerType !== 'hidden' &&
      !offlineWholeFlag
    ) {
      mean.push(this.copyHistoryRFQNode(record));
    }
    switch (rfxStatus) {
      case 'RELEASE_REJECTED': // 发布审批拒绝
        if (offlineWholeFlag === 1) {
          mean.push(this.inputSupplierNode(record));
        } else if (this.CheckPermissionObject?.edit?.controllerType !== 'hidden') {
          mean.push(this.updateNode(record, offlineWholeFlag));
        }
        break;
      case 'PENDING_PREQUAL': // 待预审审批
      case 'IN_PREQUAL': // 资格预审中
        if (Number(prequalMemberFlag) === 1 && !offlineWholeFlag) {
          mean.push(
            prequalSubmitFlag ? this.prequalificationNode(record) : this.quotationViewNode(record)
          );
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'IN_QUOTATION':
        if (!Number(sealedQuotationFlag) && !offlineWholeFlag) {
          if (sourceCategory === 'RFQ') {
            mean.push(this.FeedbackBargainNode(record));
          }
        }
        if (record.get('supervisorFlag') && !offlineWholeFlag) {
          mean.push(this.RFQNode(record));
        }
        if (prequalViewFlag === 1 && !offlineWholeFlag) {
          // 处于报价中状态 但是待预审审批还没有完全审批完
          mean.unshift(this.quotationViewNode(record));
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'LACK_QUOTED': // 报价响应不足
        if (
          this.CheckPermissionObject?.operation?.controllerType !== 'hidden' &&
          !offlineWholeFlag
        ) {
          mean.push(this.ShowQuoFeedBackLackModal(record));
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'OPEN_BID_PENDING': // 待开标
        if (Number(openEnabledFlag) === 1) {
          if (!offlineWholeFlag) {
            mean.push(this.openingBidNode(record));
          }
        }
        if (
          expertScoreType === 'ONLINE' &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateExpertFlag) === 1 &&
          scoredFlag &&
          !offlineWholeFlag
        ) {
          mean.push(this.viewScoreNode(record));
        }
        if (
          !offlineWholeFlag &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateLeaderFlag) === 1 &&
          openExecutionStatus?.firstAllOpened === 1 &&
          ['TECH_FIRST', 'BUSINESS_FIRST'].includes(openBidOrder)
        ) {
          this.adjustMoreLinkIncludeNode(record, mean, 'includeScoreManager');
          mean.push(this.scoreManagerNode(record));
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'OPENED': // 已开标
        if (
          this.CheckPermissionObject?.operation?.controllerType !== 'hidden' &&
          !offlineWholeFlag
        ) {
          mean.push(onOperateBidNode);
        }
        if (
          expertScoreType === 'ONLINE' &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateExpertFlag) === 1 &&
          scoredFlag &&
          !offlineWholeFlag
        ) {
          mean.push(this.viewScoreNode(record));
        }
        // 有下发时间评分标识开始进入评分阶段
        if (
          !offlineWholeFlag &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateLeaderFlag) === 1 &&
          openExecutionStatus?.secondAllOpened === 1 &&
          ['TECH_FIRST', 'BUSINESS_FIRST'].includes(openBidOrder)
        ) {
          this.adjustMoreLinkIncludeNode(record, mean, 'includeScoreManager');
          mean.push(this.scoreManagerNode(record));
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'SCORING': // 评分中
        if (Number(evaluateExpertFlag) === 1 && !offlineWholeFlag) {
          if (
            (scoreStatus === 'SCORING' &&
              scoreRoundStatus !== 'NOT_START' &&
              currentSequenceNum === expertSequenceNum &&
              !scoredFlag) ||
            Number(rescoreFlag) === 1
          ) {
            mean.push(this.scoreNode(record));
          }
        }
        if (Number(evaluateLeaderFlag) === 1 && !offlineWholeFlag) {
          this.adjustMoreLinkIncludeNode(record, mean, 'includeScoreManager');
          mean.push(this.scoreManagerNode(record));
        }
        if (Number(evaluateExpertFlag) === 1 && scoredFlag && !offlineWholeFlag) {
          this.adjustMoreLinkIncludeNode(record, mean, 'includeViewScore');
          mean.push(this.viewScoreNode(record));
        }
        if (
          reviewScoredStatus === 'NEW' &&
          initialReview === 'NEED' &&
          scoreStatus === 'INITIAL_REVIEW_SCORING' &&
          Number(indicAssignCount) > 0 &&
          !offlineWholeFlag
        ) {
          // 符合性检查
          mean.push(this.Check(record));
        } else if (
          reviewScoredStatus === 'SCORED' &&
          initialReview === 'NEED' &&
          ['INITIAL_REVIEW_SCORING', 'RFX_INITIAL_REVIEW_PENDING'].includes(scoreStatus) &&
          !offlineWholeFlag
        ) {
          // 符合性检查查看
          mean.push(this.viewCheck(record));
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'ROUND_QUOTATION': // 多轮报价
        if (ScoreRoundQuotationFlag) {
          // 新开标 发起多轮逻辑：新开标配置开启 && 当前为开标员 && 单据状态为多轮报价 显示操作
          if (this.state.bidOpeningNewFlag) {
            if (record.get('currentUserIsRfxFlag') === 1) {
              mean.push(this.directRoundQuotationNode(record));
            }
          } else if (Number(evaluateLeaderFlag) === 1 && !offlineWholeFlag) {
            mean.push(this.directRoundQuotationNode(record));
          }
          if (
            openBidOrder === 'TECH_FIRST' &&
            expertSequenceNum === 1 &&
            expertScoredStatus === 'SCORED' &&
            !offlineWholeFlag
          ) {
            mean.push(this.viewScoreNode(record));
          }
        } else if (CheckRoundQuotationFlag) {
          if (checkUserFlag && !offlineWholeFlag) {
            if (!(roundHeaderStatus === 'CLOSED' || bargainClosedFlag === 0)) {
              mean.push(this.directRoundQuotationNode(record));
            }
            this.adjustMoreLinkIncludeNode(record, mean, 'includeCheckPrice');
            mean.push(this.checkPriceNode(record));
          }
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'PRE_EVALUATION_PENDING_REJECT': // 中标候选人审批拒绝
        if (Number(evaluateLeaderFlag) === 1 && !offlineWholeFlag) {
          mean.push(
            <div>
              <Popover content={workFlowStepRender(headerWorkFlows)} placement="bottom">
                {Number(evaluateLeaderFlag) === 1 && this.scoreManagerNode(record)}
              </Popover>
            </div>
          );
        } else if (Number(evaluateExpertFlag) === 1 && !offlineWholeFlag) {
          mean.push(
            <div>
              <Popover content={workFlowStepRender(headerWorkFlows)} placement="bottom">
                {this.viewScoreNode(record)}
              </Popover>
            </div>
          );
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'PRETRIAL_PENDING': // 待初审
        if (Number(pretrailUserFlag) === 1 && !offlineWholeFlag) {
          mean.push(this.openPreliminaryNode(record));
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'CHECK_PENDING': // 待核价
        if (!offlineWholeFlag) {
          if (Number(checkUserFlag) === 1) {
            if (remote?.event) {
              remote.event.fireEvent('getCheckPrice', {
                getCheckPrice,
                record,
                status: 'CHECK_PENDING',
                bidFlag: this.bidFlag,
                mean,
                rfxHeaderId,
                history,
                projectLineSectionId,
              });
            } else {
              getCheckPrice();
            }
            // mean.push(this.checkPriceNode(record));
          } else {
            if (remote?.event) {
              remote.event.fireEvent('getCheckPrice', {
                getCheckPrice,
                record,
                status: 'CHECK_PENDING',
                bidFlag: this.bidFlag,
                mean,
                rfxHeaderId,
                history,
                isNeedCall: false,
                projectLineSectionId,
              });
            }
          }
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'CHECK_REJECTED': // 核价审批拒绝
        if (!offlineWholeFlag) {
          if (Number(checkUserFlag) === 1) {
            // mean.push(
            //   <Popover content={workFlowStepRender(headerWorkFlows)} placement="right">
            //     {this.checkPriceNode(record)}
            //   </Popover>
            // );
            if (remote?.event) {
              remote.event.fireEvent('getCheckPrice', {
                getCheckPrice,
                record,
                status: 'CHECK_REJECTED',
                bidFlag: this.bidFlag,
                mean,
                rfxHeaderId,
                history,
                isNeedPop: true,
                projectLineSectionId,
              });
            } else {
              getCheckPrice(true);
            }
          } else {
            if (remote?.event) {
              remote.event.fireEvent('getCheckPrice', {
                getCheckPrice,
                record,
                status: 'CHECK_REJECTED',
                bidFlag: this.bidFlag,
                mean,
                rfxHeaderId,
                history,
                isNeedCall: false,
                projectLineSectionId,
              });
            }
          }
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'NOT_START': // 未开始
        if (record.get('supervisorFlag') && !offlineWholeFlag) {
          mean.push(this.RFQNode(record));
        }
        mean = this.pushOtherNode(mean, record);
        break;
      case 'PAUSED': // 暂停
        mean = this.pushOtherNode(mean, record);
        break;
      case 'RELEASE_APPROVING': // 发布审批中
        mean.push(this.renderApprovalNode(record));
        mean.push(this.renderRevokeApprovalNode(record));
        break;
      case 'PRE_EVALUATION_APPROVING': // 中标候选人审批中
      case 'CHECK_APPROVING': // 	核价审批中
        if (!offlineWholeFlag) {
          mean.push(this.renderApprovalNode(record));
          mean.push(this.renderRevokeApprovalNode(record));
        }
        break;
      case 'NEW': // 新建
        if (this.CheckPermissionObject?.edit?.controllerType !== 'hidden') {
          mean.push(this.updateNode(record, offlineWholeFlag));
        }
        break;
      case 'ROUNDED': // 再次询价
        if (this.CheckPermissionObject?.edit?.controllerType !== 'hidden' && !offlineWholeFlag) {
          mean.push(this.updateNode(record, offlineWholeFlag));
        }
        break;
      case 'CANCELED':
        mean.push(this.viewDetailNode(record, offlineWholeFlag));
        break;
      case 'CLOSED': // 关闭
        if (!offlineWholeFlag) {
          mean.push(this.viewDetailNode(record, offlineWholeFlag));
        }
        if (newBiddingFlag) {
          // 1、新竞价单未开始 签到开始流程之前，需要关注页签：主推操作为寻源过程控制;
          // 2、签到开始时间之后的 签到中、试竞价未开始、试竞价中、竞价未开始、正式竞价中 流程，需要处理页签：主推操作为竞价大厅;
          // 3、全部页签根据（1、2）主推操作放到复制后面;
          if (tabStatus === 'all') {
            mean.splice(1, 0, this.biddingHallNode(record));
          } else {
            mean.unshift(this.biddingHallNode(record));
          }
        }
        break;
      case 'FINISHED': // 完成
        if (!offlineWholeFlag) {
          mean.push(this.BidWinnerNoticeNode(record));
          // 服务费管理入口
          if (serviceChargeFlag && serviceExpenseChargeFlag) {
            mean.push(this.serviceChargeManage(record));
          }
        }
        break;
      case 'BARGAINING': // 议价中 bargainingStage    CHECK 核价阶段议价  SCORE 评分过程中议价
        if (
          !offlineWholeFlag &&
          ((bargainingStage === 'CHECK' && Number(checkUserFlag) === 1) ||
            (bargainingStage === 'SCORE' && Number(evaluateExpertFlag) === 1))
        ) {
          mean.push(
            // <Popover content={workFlowStepRender(headerWorkFlows)} placement="bottomLeft">
            this.bargainingS(record)
            // </Popover>
          );
          if (bargainingStage === 'CHECK' && Number(checkUserFlag) === 1) {
            mean.push(this.checkPriceNode(record));
          }
        }
        mean = this.pushOtherNode(mean, record);
        break;
      default:
        break;
    }

    mean = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ALL_ACTION_MORE', mean, {
          onOperateBidNode,
          finishTabKey,
          rfxStatus,
          record,
          history,
          bidFlag: this.bidFlag,
          that: this,
        })
      : null;
    return !observerFlag ? this.returnOperate(mean, aggregation, record) : '-';
  }

  @Bind()
  getWorkFlowBtn(record = {}, buttons = []) {
    const { dataSet } = record;
    const businessKey = record.get('businessKey');
    const approvaFlags = dataSet?.getState('approvaFlags');
    const approvaFlag = approvaFlags?.[businessKey];
    const operationFlags = dataSet?.getState('operationFlags');
    const operationFlag = operationFlags?.[businessKey]?.REVOKE;
    const approveIdx = buttons.findIndex((i) => i.operation === 'APPROVE');
    const cloneButtons = [...buttons];
    if (approveIdx > -1) {
      if (!approvaFlags || !approvaFlag) {
        cloneButtons.splice(approveIdx, 1);
      }
    }
    const cancelIdx = cloneButtons.findIndex((i) => i.operation === 'CANCEL_APPROVE');
    if (cancelIdx > -1) {
      if (!operationFlags || !operationFlag) {
        cloneButtons.splice(cancelIdx, 1);
      }
    }
    return cloneButtons;
  }

  /**
   * 最终需要展示的操作
   * @param {*} main 主操作
   * @param {*} more 更多操作
   * @returns VNode
   */
  @Bind()
  renderRFOperate({ record }, aggregation) {
    const { remote } = this.props;
    const { mainOperations: main, moreOperations: more } = record.get([
      'mainOperations',
      'moreOperations',
    ]);
    // 前端二次处理 审批和撤销审批 的显示逻辑
    let mainOperations = this.getWorkFlowBtn(record, main || []);
    const moreOperations = this.getWorkFlowBtn(record, more || []);

    mainOperations = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_RENDERRFOPERATE_MAINOPERATIONS',
          mainOperations,
          {
            record,
            bidFlag: this.bidFlag,
            that: this,
            aggregation,
          }
        )
      : mainOperations;

    if (aggregation) {
      return (
        <Fragment>
          <div>{this.displayMainAction(record, mainOperations)}</div>
          {moreOperations?.length ? (
            <Dropdown
              overlay={this.displayMoreAction(record, moreOperations)}
              trigger={['click', 'hover']}
              placement="bottomLeft"
            >
              {this.renderMoreLink(record)}
            </Dropdown>
          ) : null}
        </Fragment>
      );
    } else {
      return (
        <div className={Style.action}>
          <div> {this.displayMainAction(record, mainOperations)} </div>
          {moreOperations?.length ? (
            <Dropdown
              overlay={this.displayMoreAction(record, moreOperations)}
              trigger={['click', 'hover']}
              placement="bottomLeft"
            >
              {this.renderMoreLink(record)}
            </Dropdown>
          ) : null}
        </div>
      );
    }
  }

  @Bind()
  displayMoreAction(record, list) {
    return (
      <Menu>
        {list?.length &&
          list.map((item) => {
            return item.operation === 'CLARIFY' ? (
              <Menu.Item
                className={Style.dropdownMoreOperate}
                onClick={() => this.handleOperation(record, item.operation)}
              >
                <Badge
                  count={record.get('unreadIssueCount')}
                  offset={[14, -12]}
                  className={Style['expand-more-badge']}
                >
                  {<a disabled={item.controllerType === 'disabled'}>{item.operationMeaning}</a>}
                </Badge>
              </Menu.Item>
            ) : (
              <Menu.Item
                className={Style.dropdownMoreOperate}
                onClick={() => this.handleOperation(record, item.operation)}
                disabled={item.controllerType === 'disabled'}
              >
                {<a>{item.operationMeaning}</a>}
              </Menu.Item>
            );
          })}
      </Menu>
    );
  }

  @Bind()
  displayMainAction(record, list) {
    const { remote } = this.props;

    return (
      <div className={Style.mainAction}>
        {list?.length
          ? list.map((item) => {
              if (!item) {
                return '';
              }
              let nonClarifyLink = (
                <a
                  disabled={item.controllerType === 'disabled'}
                  onClick={() => this.handleOperation(record, item.operation)}
                >
                  {item.operationMeaning}
                </a>
              );

              nonClarifyLink = remote
                ? remote.process(
                    'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_DISPLAY_MAIN_ACTION_NON_CLARIFY_LINK',
                    nonClarifyLink,
                    {
                      record,
                      bidFlag: this.bidFlag,
                      that: this,
                      item,
                    }
                  )
                : nonClarifyLink;

              return item.operation === 'CLARIFY' ? (
                <div>
                  <Badge
                    count={record.get('unreadIssueCount')}
                    offset={[14, -12]}
                    className={Style['expand-more-badge']}
                  >
                    <a
                      onClick={() => this.handleOperation(record, item.operation)}
                      disabled={item.controllerType === 'disabled'}
                    >
                      {item.operationMeaning}
                    </a>
                  </Badge>
                </div>
              ) : (
                <div
                  style={{
                    overflow: 'hidden',
                    'white-space': 'nowrap',
                    'text-overflow': 'ellipsis',
                    marginRight: '8px',
                  }}
                >
                  {nonClarifyLink}
                </div>
              );
            })
          : '-'}
      </div>
    );
  }

  @Bind()
  handlePopover(record) {
    const headerWorkFlows = record.get('headerWorkFlows');
    const { employeeName, approvalMessageMeaning } = headerWorkFlows?.[headerWorkFlows?.length - 1];
    return (
      <Popover content={workFlowStepRender(headerWorkFlows)} placement="bottom">
        {`${employeeName}${approvalMessageMeaning}`}
      </Popover>
    );
  }

  @Debounce(500)
  async createRFQ(record) {
    // 寻源模板
    const subjectMatterRule = record.get('subjectMatterRule');
    this.sourcingTemplateDS = new DataSet(SourcingTemplateDS(record));
    this.sourcingTemplateDS.setQueryParameter('subjectMatterRule', subjectMatterRule);
    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.title.chooseRfxTemplate`).d('选择寻源模板'),
      closable: true,
      drawer: true,
      style: { width: '380px' },
      onOk: () => this.handleOkChooseTemplate(record),
      children: (
        <Form dataSet={this.sourcingTemplateDS} columns={1} labelLayout="float">
          <Lov name="templateIdLov" />
        </Form>
      ),
      onCancel: () => this.sourcingTemplateDS.reset(),
    });
  }

  @Bind()
  async handleOkChooseTemplate(record) {
    const { organizationId, history } = this.props;
    const sourceProjectId = record.get('sourceProjectId');
    const validateFlag = await this.sourcingTemplateDS.validate();
    if (validateFlag) {
      // 创建寻源
      const templateId = this.sourcingTemplateDS?.current.get('templateId');
      const params = Object.assign(
        {},
        {
          organizationId,
          ...record.toData(),
          rfxTemplateId: templateId,
          sourceProjectId,
        }
      );

      // 第一步
      const res = await createRFQ(params);
      const result = getResponse(res);

      if (result) {
        // 校验成功回调
        const successCallBack = () => {
          notification.success();
          const url = this.distinguishUpdatePageUrl(result);
          history.push({
            pathname: url,
          });
          this.sourcingTemplateDS.reset();
          Modal.destroyAll();
        };

        const warningOk = () => {
          const param = {
            ...(params || {}),
            skipCheckFlag: 1,
          };
          return createRFQ(param).then((_res) => {
            const _result = getResponse(_res);
            if (_result && !_result.failed) {
              notification.success();
              const url = this.distinguishUpdatePageUrl(_result);
              history.push({
                pathname: url,
              });
              this.sourcingTemplateDS.reset();
              Modal.destroyAll();
            }
          });
        };

        validateQRModal({
          response: result,
          successCallBack,
          warningOk,
        });
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // RFP维护跳转
  directRFPUpdatePage = (header = {}) => {
    const { history } = this.props;
    const { rfHeaderId = null } = header || {};
    if (!rfHeaderId) {
      return;
    }
    history.push({
      pathname: `${getActiveTabKey()}/rf-update/RFP/${rfHeaderId}`,
    });
  };

  // RFP-发布并创建-RFP
  @Debounce(500)
  handleReleaseCreateRFP = async (record = {}) => {
    const rfHeaderId = record.get('rfHeaderId');

    const createRFPParams = {
      rfHeader: {
        rfHeaderId,
      },
    };

    // 第一步
    const res = await releaseCreateRFP(createRFPParams);
    const result = getResponse(res);

    if (result) {
      // 校验成功回调
      const successCallBack = () => {
        notification.success();
        this.directRFPUpdatePage(result);
      };

      const warningOk = () => {
        const param = {
          rfHeader: {
            rfHeaderId,
          },
          skipCheckFlag: 1,
        };
        return releaseCreateRFP(param).then((_res) => {
          const _result = getResponse(_res);
          if (_result && !_result.failed) {
            notification.success();
            this.directRFPUpdatePage(_result);
          }
        });
      };

      validateQRModal({
        response: result,
        successCallBack,
        warningOk,
      });
    }
  };

  async createRFP(record) {
    const res = getResponse(await createRFP(record.toData()));
    if (res) {
      this.directRFPUpdatePage(res);
    }
  }

  @Bind()
  handleOperation(record, operation) {
    switch (operation) {
      case 'EDIT': // 编辑
        this.inquiryRFUpdate(record);
        break;
      case 'APPROVE': // 审批
        this.handleApprove(record);
        break;
      case 'CANCEL_APPROVE': // 撤销审批
        this.handleRevokeApproval(record);
        break;
      case 'SCORE':
        this.goScoreRF(record);
        break; // 评分
      case 'SCORED': // 查看评分
        this.directScoreRF(record);
        break;
      case 'SCORE_MANAGE': // 管理评分
        this.directScoreManageRF(record);
        break;
      case 'PROCESS_CONTROL': // 寻源过程控制
        this.directSourcingProcessControl(record.toData());
        break;
      case 'CLARIFY': // 澄清答疑
        this.directQuestionAnswerRF(record);
        break;
      case 'ACTION': // 操作记录
        // this.playView(record);
        // todo
        break;
      case 'CHECK_SUPPLIER': // 确定供应商
        this.directConfirmSupplier(record);
        break;
      case 'SOURCE_PROBLEM': // 问询供应商
        this.directSourcingProblem(record);
        break;
      case 'QUOTED_VIEW': // 报价响应不足
        this.openLackQuotedModal(record);
        break;
      case 'CLOSE':
        this.handleClose(record);
        break;
      case 'CREATE_RFQ': // 创建RFQ
        this.createRFQ(record);
        break;
      case 'CREATE_RFP': // 创建RFP
        this.createRFP(record);
        break;
      case 'VIEW':
        this.inquiryDetail(record);
        break;
      case 'RFP_CREATE_RFP':
        this.handleReleaseCreateRFP(record);
        break;
      case 'COPY':
        if (this.CheckPermissionObject?.copy?.controllerType !== 'hidden') {
          this.handleCopyOk(record);
        }
        break;
      case 'INSERT_REPLY': // 线下回复录入
        this.directOfflineReply(record);
        break;
      default:
        break;
    }
  }

  // 关闭弹框确定
  @Bind()
  async handleCloseOk(closeRfDs) {
    const validateValue = await closeRfDs.validate();
    if (!validateValue) {
      return false;
    }
    const { state: { currentTab } = {} } = this.rfContainerRef?.current || {};
    const { allDS, waitPublishDS, onGoingDS } = this.rfContainerRef.current?.props || {};
    const res = await closeRfDs.submit();
    if (res && !res.failed) {
      switch (currentTab) {
        case 'all':
          allDS.query();
          break;
        case 'toBeReleased':
          waitPublishDS.query();
          break;
        case 'onGoing':
          onGoingDS.query();
          break;
        default:
          allDS.query();
      }
      return true;
    }
    notification.error({
      message: res.message || '',
    });
    return false;
  }

  // 关闭征询书
  @Bind()
  handleClose(record) {
    const closeRfDs = new DataSet(closeRfDS({ rfHeaderId: record.get('rfHeaderId') }));

    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: {
        width: '380px',
      },
      title: intl.get('ssrc.inquiryHall.model.close.rf').d('关闭征询书'),
      children: <CloseInquiry closeRfDs={closeRfDs} />,
      onOk: () => this.handleCloseOk(closeRfDs),
    });
  }

  /**
   * 操作 需要处理
   * @param {*} param0 行信息
   * @protected 此方法被【玛格家具】二开，请勿删除、修改此方法名！！！
   * @protected 此方法调用的方法名也请勿删除、修改！！！
   */
  @Bind()
  renderProcessOperate({ record }, onGoingStatus = '', aggregation) {
    let mean = [];
    const { remote, history } = this.props;
    const {
      sourceCategory,
      rfxStatus,
      scoreStatus,
      openExecutionStatus,
      expertScoreType,
      headerWorkFlows = [],
      evaluateLeaderFlag,
      rescoreFlag,
      roundQuotationRule,
      prequalSubmitFlag,
      roundHeaderStatus,
      bargainClosedFlag,
      evaluateExpertFlag,
      scoredFlag,
      scoreRoundStatus,
      openBidOrder,
      expertSequenceNum,
      reviewScoredStatus,
      initialReview,
      indicAssignCount,
      currentSequenceNum,
      checkUserFlag = 0,
      bargainingStage = null,
      sealedQuotationFlag,
      observerFlag,
      openEnabledFlag = 0,
      rfxHeaderId = '',
      projectLineSectionId,
      offlineWholeFlag = 0,
      prequalViewFlag = 0,
      expertScoredStatus,
    } =
      record.get([
        'sourceCategory',
        'rfxStatus',
        'scoreStatus',
        'openExecutionStatus',
        'expertScoreType',
        'headerWorkFlows',
        'evaluateLeaderFlag',
        'rescoreFlag',
        'roundQuotationRule',
        'prequalSubmitFlag',
        'roundHeaderStatus',
        'bargainClosedFlag',
        'evaluateExpertFlag',
        'scoredFlag',
        'scoreRoundStatus',
        'openBidOrder',
        'expertSequenceNum',
        'reviewScoredStatus',
        'initialReview',
        'indicAssignCount',
        'currentSequenceNum',
        'checkUserFlag',
        'bargainingStage',
        'sealedQuotationFlag',
        'observerFlag',
        'openEnabledFlag',
        'rfxHeaderId',
        'projectLineSectionId',
        'offlineWholeFlag',
        'prequalViewFlag',
        'expertScoredStatus',
      ]) || {};
    const getCheckPrice = () => {
      mean.push(this.checkPriceNode(record));
    };

    const CommonScoreRoundQuotationFlag =
      (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') && !offlineWholeFlag; // 评分多轮报价
    const CommonCheckRoundQuotationFlag =
      (roundQuotationRule === 'CHECK' || roundQuotationRule === 'AUTO_CHECK') && !offlineWholeFlag; // 核价多轮报价
    const RoundQuotationCuxProps = { record, bidFlag: this.bidFlag };
    const ScoreRoundQuotationFlag = !remote
      ? CommonScoreRoundQuotationFlag
      : remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_RENDERPROCESSOPERATE_SCOREROUND_VIEW',
          CommonScoreRoundQuotationFlag,
          RoundQuotationCuxProps
        ); // 评分多轮报价
    const CheckRoundQuotationFlag = !remote
      ? CommonCheckRoundQuotationFlag
      : remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_RENDERPROCESSOPERATE_CHECKROUND_VIEW',
          CommonCheckRoundQuotationFlag,
          RoundQuotationCuxProps
        );
    const onOperateBidNode = this.onOperateBidNode(record);

    switch (rfxStatus) {
      case 'RELEASE_REJECTED': // 发布审批拒绝
        if (offlineWholeFlag === 1) {
          mean.push(this.inputSupplierNode(record));
        } else if (this.CheckPermissionObject?.edit?.controllerType !== 'hidden') {
          mean.push(this.updateNode(record, offlineWholeFlag));
        }
        break;
      case 'PENDING_PREQUAL': // 待预审审批
      case 'IN_PREQUAL': // 资格预审中
        if (!offlineWholeFlag) {
          mean.push(
            prequalSubmitFlag ? this.prequalificationNode(record) : this.quotationViewNode(record)
          );
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'IN_QUOTATION': // 报价中
        if (sourceCategory === 'RFQ' && !offlineWholeFlag) {
          if (!Number(sealedQuotationFlag)) {
            mean.push(this.FeedbackBargainNode(record));
          }
          mean.push(this.RFQNode(record));
        } else if (sourceCategory === 'RFA' && !offlineWholeFlag) {
          if (record.get('supervisorFlag')) {
            mean.push(this.RFQNode(record));
          }
        }
        if (prequalViewFlag === 1 && !offlineWholeFlag) {
          mean.unshift(this.quotationViewNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'LACK_QUOTED': // 报价响应不足
        if (
          this.CheckPermissionObject?.operation?.controllerType !== 'hidden' &&
          !offlineWholeFlag
        ) {
          mean.push(this.ShowQuoFeedBackLackModal(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'OPEN_BID_PENDING': // 待开标
        if (openEnabledFlag === 1 && !offlineWholeFlag) {
          mean.push(this.openingBidNode(record));
        }
        if (
          expertScoreType === 'ONLINE' &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateExpertFlag) === 1 &&
          scoredFlag &&
          !offlineWholeFlag
        ) {
          mean.push(this.viewScoreNode(record));
        }
        if (
          !offlineWholeFlag &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateLeaderFlag) === 1 &&
          openExecutionStatus?.firstAllOpened === 1 &&
          ['TECH_FIRST', 'BUSINESS_FIRST'].includes(openBidOrder)
        ) {
          this.adjustMoreLinkIncludeNode(record, mean, 'includeScoreManager');
          mean.push(this.scoreManagerNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'OPENED': // 已开标
        if (
          this.CheckPermissionObject?.operation?.controllerType !== 'hidden' &&
          !offlineWholeFlag
        ) {
          mean.push(onOperateBidNode);
        }
        if (
          expertScoreType === 'ONLINE' &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateExpertFlag) === 1 &&
          scoredFlag &&
          !offlineWholeFlag
        ) {
          mean.push(this.viewScoreNode(record));
        }
        if (
          !offlineWholeFlag &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateLeaderFlag) === 1 &&
          openExecutionStatus?.secondAllOpened === 1 &&
          ['TECH_FIRST', 'BUSINESS_FIRST'].includes(openBidOrder)
        ) {
          this.adjustMoreLinkIncludeNode(record, mean, 'includeScoreManager');
          mean.push(this.scoreManagerNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'SCORING': // 评分中
        if (
          ((Number(evaluateExpertFlag) === 1 &&
            scoreStatus === 'SCORING' &&
            scoreRoundStatus !== 'NOT_START' &&
            currentSequenceNum === expertSequenceNum &&
            !scoredFlag) ||
            (Number(evaluateExpertFlag) === 1 && Number(rescoreFlag) === 1)) &&
          !offlineWholeFlag
        ) {
          mean.push(this.scoreNode(record));
        }
        if (Number(evaluateLeaderFlag) === 1 && !offlineWholeFlag) {
          if (mean.length >= 1) {
            record.setState('includeScoreManager', true);
          }
          mean.push(this.scoreManagerNode(record));
        }
        if (Number(evaluateExpertFlag) === 1 && scoredFlag && !offlineWholeFlag) {
          if (mean.length >= 1) {
            record.setState('includeViewScore', true);
          }
          mean.push(this.viewScoreNode(record));
        }
        if (
          reviewScoredStatus === 'NEW' &&
          initialReview === 'NEED' &&
          scoreStatus === 'INITIAL_REVIEW_SCORING' &&
          Number(indicAssignCount) > 0 &&
          !offlineWholeFlag
        ) {
          // 符合性检查
          mean.push(this.Check(record));
        } else if (
          reviewScoredStatus === 'SCORED' &&
          initialReview === 'NEED' &&
          ['INITIAL_REVIEW_SCORING', 'RFX_INITIAL_REVIEW_PENDING'].includes(scoreStatus) &&
          !offlineWholeFlag
        ) {
          // 符合性检查查看
          mean.push(this.viewCheck(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'ROUND_QUOTATION': // 多轮报价
        if (ScoreRoundQuotationFlag) {
          // 新开标 发起多轮逻辑：新开标配置开启 && 当前为询价员工 && 单据状态为多轮报价 显示操作
          if (this.state.bidOpeningNewFlag) {
            if (record.get('currentUserIsRfxFlag') === 1) {
              mean.push(this.directRoundQuotationNode(record));
            }
          } else if (Number(evaluateLeaderFlag) === 1 && !offlineWholeFlag) {
            mean.push(this.directRoundQuotationNode(record));
          }
          if (
            openBidOrder === 'TECH_FIRST' &&
            expertSequenceNum === 1 &&
            expertScoredStatus === 'SCORED'
          ) {
            mean.push(this.viewScoreNode(record));
          }
        } else if (CheckRoundQuotationFlag) {
          if (!(roundHeaderStatus === 'CLOSED' || bargainClosedFlag === 0)) {
            mean.push(this.directRoundQuotationNode(record));
          }
          if (mean.length >= 1) {
            record.setState('includeCheckPrice', true);
          }
          if (remote?.event) {
            remote.event.fireEvent('getCheckPrice', {
              getCheckPrice,
              record,
              status: 'ROUND_QUOTATION',
              bidFlag: this.bidFlag,
              mean,
              history,
              rfxHeaderId,
              projectLineSectionId,
            });
          } else {
            getCheckPrice();
          }
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'PRE_EVALUATION_PENDING_REJECT': // 中标候选人审批拒绝
        if (!offlineWholeFlag) {
          mean.push(
            <div>
              <Popover content={workFlowStepRender(headerWorkFlows)} placement="right">
                {Number(evaluateLeaderFlag) === 1 && this.scoreManagerNode(record)}
              </Popover>
            </div>
          );
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'PRETRIAL_PENDING': // 待初审
        if (!offlineWholeFlag) {
          mean.push(this.openPreliminaryNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'CHECK_PENDING': // 待核价
        if (!offlineWholeFlag) {
          if (remote?.event) {
            remote.event.fireEvent('getCheckPrice', {
              getCheckPrice,
              record,
              status: 'CHECK_PENDING',
              bidFlag: this.bidFlag,
              mean,
              history,
              rfxHeaderId,
              projectLineSectionId,
            });
          } else {
            getCheckPrice();
          }
        }
        // mean.push(this.checkPriceNode(record));
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'CHECK_REJECTED': // 核价审批拒绝
        if (!offlineWholeFlag) {
          if (remote?.event) {
            remote.event.fireEvent('getCheckPrice', {
              getCheckPrice,
              record,
              status: 'CHECK_REJECTED',
              bidFlag: this.bidFlag,
              mean,
              history,
              rfxHeaderId,
              projectLineSectionId,
            });
          } else {
            getCheckPrice();
          }
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'BARGAINING': // 议价中 bargainingStage    CHECK 核价阶段议价  SCORE 评分过程中议价
        if (!offlineWholeFlag) {
          mean.push(
            // <Popover content={workFlowStepRender(headerWorkFlows)} placement="bottomLeft">
            this.bargainingS(record)
            // </Popover>
          );
          if (bargainingStage === 'CHECK' && Number(checkUserFlag) === 1) {
            mean.push(this.checkPriceNode(record));
          }
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'NOT_START': // 未开始
        if (record.get('supervisorFlag') && !offlineWholeFlag) {
          mean.push(this.RFQNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      default:
        break;
    }

    mean = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_PROCESS_ACTION_MORE', mean, {
          onOperateBidNode,
          rfxStatus,
          record,
          history,
          bidFlag: this.bidFlag,
        })
      : null;
    return !observerFlag ? this.returnOperate(mean, aggregation, record) : '-';
  }

  /**
   * 操作 需要关注
   * @param {*} param0 行信息
   * @protected 此方法被【玛格家具】二开，请勿删除、修改此方法名！！！
   * @protected 此方法调用的方法名也请勿删除、修改！！！
   */
  @Bind()
  renderAttentionOperate({ record }, onGoingStatus = '', aggregation) {
    const { remote, history } = this.props;
    let mean = [];
    const {
      rfxStatus,
      scoredFlag,
      openBidOrder,
      openExecutionStatus,
      evaluateLeaderFlag,
      headerWorkFlows = [],
      evaluateExpertFlag,
      supervisorFlag = 0,
      sourceCategory,
      sealedQuotationFlag,
      observerFlag,
      expertScoreType,
      offlineWholeFlag = 0,
      prequalViewFlag = 0,
    } =
      record.get([
        'rfxStatus',
        'scoredFlag',
        'openBidOrder',
        'openExecutionStatus',
        'evaluateLeaderFlag',
        'headerWorkFlows',
        'evaluateExpertFlag',
        'supervisorFlag',
        'sourceCategory',
        'sealedQuotationFlag',
        'observerFlag',
        'expertScoreType',
        'offlineWholeFlag',
        'prequalViewFlag',
      ]) || {};
    switch (rfxStatus) {
      case 'PENDING_PREQUAL': // 待预审审批
      case 'IN_PREQUAL': // 资格预审中
      case 'SCORING': // 评分中
      case 'PRETRIAL_PENDING': // 待初审
      case 'CHECK_PENDING': // 待核价
      case 'CHECK_REJECTED': // 核价审批拒绝
      case 'BARGAINING': // 议价中
      case 'PAUSED': // 暂停
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'ROUND_QUOTATION': // 多轮报价
        // 新开标 发起多轮逻辑：新开标配置开启 && 当前为询价员工 && 单据状态为多轮报价 显示操作
        if (this.state.bidOpeningNewFlag && record.get('currentUserIsRfxFlag') === 1) {
          mean.push(this.directRoundQuotationNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'OPEN_BID_PENDING': // 待开标
        if (
          expertScoreType === 'ONLINE' &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateExpertFlag) === 1 &&
          scoredFlag &&
          !offlineWholeFlag
        ) {
          mean.push(this.viewScoreNode(record));
        }
        if (
          !offlineWholeFlag &&
          this.state.bidOpeningNewFlag &&
          Number(evaluateLeaderFlag) === 1 &&
          openExecutionStatus?.firstAllOpened === 1 &&
          ['TECH_FIRST', 'BUSINESS_FIRST'].includes(openBidOrder)
        ) {
          this.adjustMoreLinkIncludeNode(record, mean, 'includeScoreManager');
          mean.push(this.scoreManagerNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'IN_QUOTATION': // 报价中
        if (sourceCategory === 'RFQ' && !Number(sealedQuotationFlag) && !offlineWholeFlag) {
          mean.push(this.FeedbackBargainNode(record));
        }
        if (supervisorFlag && !offlineWholeFlag) {
          mean.push(this.RFQNode(record));
        }
        if (prequalViewFlag === 1 && !offlineWholeFlag) {
          // 处于报价中状态 但是待预审审批还没有完全审批完
          mean.unshift(this.quotationViewNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'PRE_EVALUATION_PENDING_REJECT': // 中标候选人审批拒绝
        if (Number(evaluateExpertFlag) && !offlineWholeFlag) {
          mean.push(
            <div>
              <Popover content={workFlowStepRender(headerWorkFlows)} placement="right">
                {this.viewScoreNode(record)}
              </Popover>
            </div>
          );
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      case 'NOT_START': // 未开始
        if (record.get('supervisorFlag') && !offlineWholeFlag) {
          mean.push(this.RFQNode(record));
        }
        mean = this.pushOtherNode(mean, record, onGoingStatus);
        break;
      default:
        break;
    }

    const onOperateBidNode = this.onOperateBidNode(record);
    mean = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ATTENTION_ACTION_MORE', mean, {
          onOperateBidNode,
          rfxStatus,
          record,
          history,
          bidFlag: this.bidFlag,
        })
      : null;
    return !observerFlag ? this.returnOperate(mean, aggregation, record) : '-';
  }

  //  操作-待审批-审批
  @Bind()
  renderApprovalOperate(record, _, aggregation) {
    const { remote } = this.props;
    const approval = this.renderApprovalNode(record);
    const revokeApproval = this.renderRevokeApprovalNode(record);
    const { headerWorkFlows = [], observerFlag } = record.toData();
    const currentWorkFlow = headerWorkFlows && headerWorkFlows[headerWorkFlows.length - 1];

    let btns =
      !observerFlag && currentWorkFlow && (approval || revokeApproval)
        ? [approval, revokeApproval].filter(Boolean)
        : [];

    btns = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_APPROVALOPERATIONS_BTNS', btns, {
          record,
          aggregation,
          that: this,
          approval,
          revokeApproval,
        })
      : btns;

    return btns && btns.length > 0 ? (
      <div className={aggregation ? Style['approval-node-aggregate'] : Style['approval-node-flat']}>
        {btns}
      </div>
    ) : (
      '-'
    );
  }

  /**
   * 操作-待审批-撤销审批
   * @param {*} param0 行信息
   */
  @Bind()
  renderRevokeApprovalNode(record) {
    const { dataSet } = record;
    const operationFlags = dataSet?.getState('operationFlags');
    const businessKey = record.get('businessKey');
    const operationFlag = operationFlags?.[businessKey]?.REVOKE;
    return operationFlags && operationFlag ? (
      <a onClick={() => this.handleRevokeApproval(record)}>
        {intl.get(`ssrc.common.view.button.revokeApproval`).d('撤销审批')}
      </a>
    ) : null;
  }

  /**
   * 操作 待审批
   * @param {*} param0 行信息
   */
  @Bind()
  renderApprovalNode(record) {
    const { headerWorkFlows = [], observerFlag } = record.toData();
    const currentWorkFlow = headerWorkFlows && headerWorkFlows[headerWorkFlows.length - 1];
    const { dataSet } = record;
    const approvaFlags = dataSet?.getState('approvaFlags');
    const businessKey = record.get('businessKey');
    const approvaFlag = approvaFlags?.[businessKey];
    return !observerFlag && currentWorkFlow && currentWorkFlow.userId === getCurrentUserId()
      ? approvaFlags && approvaFlag && (
          <a onClick={() => this.handleApprove(record)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.approve`).d('审批')}
          </a>
        )
      : null;
  }
  // 这下面都是跳转**********************************************************************************************************************

  /**
   * 跳转到维护页面
   */
  @Bind()
  inquiryUpdate(record) {
    const { history } = this.props;

    const url = this.distinguishUpdatePageUrl(record);
    history.push({
      pathname: url,
    });
  }

  /**
   * 跳转到线下整单录入页面
   */
  @Bind()
  offlineWholeUpdate(record = {}, type = 'edit') {
    const { history } = this.props;
    const { rfxHeaderId = null, offlineWholeFlag = 0 } = record;
    if (!offlineWholeFlag || !rfxHeaderId) {
      return;
    }
    let url;
    if (type === 'edit') {
      url = `/ssrc/new-inquiry-hall/whole-update/${rfxHeaderId}`;
    } else {
      url = `/ssrc/new-inquiry-hall/whole-detail/${rfxHeaderId}`;
    }
    history.push({
      pathname: url,
    });
  }

  @Bind()
  inquiryRFUpdate(record) {
    const { history } = this.props;
    history.push({
      pathname: `${getActiveTabKey()}/rf-update/${record.get('sourceCategory')}/${record.get(
        'rfHeaderId'
      )}`,
    });
  }

  /**
   * RF跳转到评分页面
   */
  @Bind()
  directScoreRF(record) {
    const { history } = this.props;
    const {
      rfHeaderId,
      scoreStatus,
      expertUserId, // to do
      // subjectMatterRule, // to do
      scoredStatus, // to do
      expertSequenceNum, // to do
      sourceCategory,
      reviewScoredStatus,
      evaluateLeaderFlag = 0, // 是否是专家评分负责人
      evaluateExpertId = null, // to do
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } =
      record.get([
        'rfHeaderId',
        'scoreStatus',
        'expertUserId',
        'subjectMatterRule',
        'scoredStatus',
        'expertSequenceNum',
        'sourceCategory',
        'reviewScoredStatus',
        'evaluateLeaderFlag',
        'evaluateExpertId',
        'multiSectionFlag',
        'sourceProjectId',
        'projectLineSectionId',
      ]) || {};
    const search = querystring.stringify({
      sourceFrom: sourceCategory,
      sourceHeaderId: rfHeaderId,
      sourceStatus: scoreStatus,
      scoredStatus,
      evaluateLeaderFlag,
      backRecommend: 'recommend', // 跳转评标管理页面，backpath标识
      evaluateExpertId,
      reviewScoredStatus,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      cachTabKey: 'scoreing',
    });

    history.push({
      pathname: `${getActiveTabKey()}/${rfHeaderId}/${expertUserId}/NONE/${expertSequenceNum}/${sourceCategory}/update`,
      search,
    });
  }

  @Bind()
  async goScoreRF(record) {
    const {
      rfHeaderId,
      evaluateScoreId,
      quotationHeaderId,
      roundNumber,
      tenantId,
      evaluateExpertId,
    } = record.get([
      'rfHeaderId',
      'evaluateScoreId',
      'roundNumber',
      'tenantId',
      'evaluateExpertId',
    ]);
    const sourceFrom = 'RF'; // 固定传RFX
    const params = {
      tenantId,
      evaluateScoreId,
      quotationHeaderId,
      roundNumber,
      evaluateExpertId,
      sourceFrom,
      sourceHeaderId: rfHeaderId,
    };
    const res = await beforeScoreValidate(params);
    if (getResponse(res)) {
      this.directScoreRF(record);
    }
  }

  /**
   * RF跳转到评分时带参
   *
   * @param {*} [record={}]
   * @returns
   * @memberof InquiryHall
   */
  getDirectScoreSearch(record = {}) {
    const {
      rfHeaderId = '',
      sourceCategory = '',
      scoreStatus = '',
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } =
      record.get([
        'rfHeaderId',
        'sourceCategory',
        'scoreStatus',
        'evaluateLeaderFlag',
        'multiSectionFlag',
        'sourceProjectId',
        'projectLineSectionId',
      ]) || {};
    const search = querystring.stringify({
      sourceFrom: sourceCategory,
      sourceHeaderId: rfHeaderId,
      sourceStatus: scoreStatus,
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });

    return search;
  }

  /**
   * RF跳转到评分管理页面-评分中
   */
  @Bind()
  directScoringRF(record) {
    const { history } = this.props;
    const search = this.getDirectScoreSearch(record);

    history.push({
      pathname: `${getActiveTabKey()}/rfx-evaluation-proc-manage/${record.get('rfHeaderId')}`,
      search,
    });
  }

  /**
   * RF跳转到评分管理页面
   */
  @Bind()
  directScoreSummaryRF(record) {
    const { history } = this.props;
    const search = this.getDirectScoreSearch(record);
    history.push({
      pathname: `${getActiveTabKey()}/rfx-evaluation/${record.get('rfHeaderId')}`,
      search,
    });
  }

  /**
   * RF跳转到确定候选人页面
   */
  @Bind()
  directScoreConfirmRF(record) {
    const { history } = this.props;
    const search = this.getDirectScoreSearch(record);
    history.push({
      pathname: `${getActiveTabKey()}/confirm-candidate/${record.get('rfHeaderId')}`,
      search,
    });
  }

  /**
   * RF评分管理
   */
  @Bind()
  directScoreManageRF(record) {
    switch (record.get('scoreStatus')) {
      case 'SCORING': // 管理评分
        this.directScoringRF(record);
        break;
      case 'SCORE_SUMMARY_PENDING': // 评分管理
        this.directScoreSummaryRF(record);
        break;
      case 'CONFIRM_CANDIDATES_PENDING': // 确定候选人
        this.directScoreConfirmRF(record);
        break;
      default:
        break;
    }
  }

  // 打开报价响应不足弹框
  @Bind()
  openLackQuotedModal = (record) => {
    const { rfHeaderId, quotedSupplierCount, expertScoreType } = record.get([
      'rfHeaderId',
      'quotedSupplierCount',
      'expertScoreType',
    ]);
    const props = {
      rfHeaderId,
      quotedSupplierCount,
      expertScoreType,
      rFLackQuotedModalRef: this.rFLackQuotedModalRef,
    };
    Modal.open({
      key: Modal.key(),
      title: intl
        .get(`ssrc.inquiryHall.view.message.title.feedBackDetail`, {
          quotationName: this.quotationName,
        })
        .d('响应详情'),
      drawer: true,
      style: {
        width: '742px',
      },
      children: <RFLackQuotedModal {...props} />,
      onOk: () => this.handleLackQuotedModalOk(record),
      onCancel: () => {},
    });
  };

  /**
   * 报价响应不足弹框-确定回调
   */
  @Bind()
  handleLackQuotedModalOk = (record) => {
    const { rfHeaderId, sourceCategory } = record.get(['rfHeaderId', 'sourceCategory']);
    const { result } = this.rFLackQuotedModalRef.current || {};
    const { history } = this.props;
    if (result === 'closeRF') {
      this.handleClose(record);
    } else if (result === 'checkSupplier') {
      history.push({
        pathname: `${getActiveTabKey()}/rf-check/${sourceCategory}/${rfHeaderId}`,
      });
    } else if (result === 'timeAdjust') {
      this.directSourcingProcessControl(record.toData());
    } else if (result === 'expertScore') {
      return toScoreRF({ rfHeaderId }).then((res) => {
        const value = getResponse(res);
        if (value && !value.failed) {
          notification.success();
          this.allRFSearch();
        } else {
          return false;
        }
      });
    }
  };

  /**
   * 跳转到初审页面
   */
  @Bind()
  openPreliminary(record) {
    const { history } = this.props;
    history.push({
      pathname: `${getActiveTabKey()}/Pretrial/${record.rfxHeaderId}`,
    });
  }

  /**
   * 跳转到多轮报价页面
   * */
  @Bind()
  directRoundQuotation(record = {}) {
    const { history, remote } = this.props;
    const { bidOpeningNewFlag } = this.state;
    const {
      rfxHeaderId = null,
      rfxStatus,
      roundQuotationRule,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      currentUserIsOpenFlag,
      currentUserIsRfxFlag,
    } = record || {};
    const search = querystring.stringify({
      cachTabKey: 'scoreing',
      sourceFrom: 'RFX',
      sourceHeaderId: rfxHeaderId,
      sourceStatus: rfxStatus,
      sourcePage: 'RFXList',
      roundQuotationRule,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      directForm: 'RFX',
      currentUserIsOpenFlag,
      currentUserIsRfxFlag,
      menuTitle:
        bidOpeningNewFlag && currentUserIsRfxFlag === 1
          ? intl.get(`ssrc.common.model.common.roundQuotation`).d('多轮报价')
          : '',
    });

    let pathname = '';
    const ScoreRoundUrl = `${getActiveTabKey()}/rfx-evaluation-proc-manage/${record.rfxHeaderId}`;
    const CheckRoundUrl = `${getActiveTabKey()}/round-quotation/${record.rfxHeaderId}`;

    // 评审发起的多轮报价和核价发起的多轮报价
    if (roundQuotationRule === 'SCORE' || roundQuotationRule === 'AUTO_SCORE') {
      pathname = ScoreRoundUrl;
    } else {
      pathname = CheckRoundUrl;
    }

    const PageHistoryData = {
      pathname,
      search,
    };
    const CUXPROPS = {
      ScoreRoundUrl,
      CheckRoundUrl,
      record,
      bidFlag: this.bidFlag,
    };

    // 二开埋点 eppen
    const NewPageHistoryData = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_DIRECTROUNDQUOTATION_HISTORY_DATA',
          PageHistoryData,
          CUXPROPS
        )
      : PageHistoryData;

    history.push(NewPageHistoryData);
  }

  /**
   * 跳转到议价界面
   */
  @Bind()
  directBargainingS(record = {}) {
    const { projectLineSectionId = null } = record || {};
    const { history } = this.props;
    const { bargainNewFlag } = this.state;
    const search = querystring.stringify({
      cachTabKey: 'scoreing',
      sourceFrom: 'RFX',
      sourceHeaderId: record.rfxHeaderId,
      sourceStatus: 'newInquiryHallToBargain',
      sourcePage: 'RFXList',
      bargainingStage: record.bargainingStage,
      projectLineSectionId,
    });
    history.push({
      pathname: `${getActiveTabKey()}/${bargainNewFlag ? 'new-' : ''}rfx-bargain/${
        record.rfxHeaderId
      }`,
      search,
    });
  }

  @Bind()
  directConfirmSupplier(record) {
    this.props.history.push({
      pathname: `${getActiveTabKey()}/rf-check/${record.get('sourceCategory')}/${record.get(
        'rfHeaderId'
      )}`,
    });
  }

  @Bind()
  directConfirmRefund(record) {
    const search = querystring.stringify({
      sourceFrom: record.get('sourceFrom'),
      tenantId: record.get('tenantId'),
    });
    this.props.history.push({
      pathname: `/ssrc/deposit-manage/detail/${record.get('rfxHeaderId')}`,
      search,
    });
  }

  @Bind()
  directBiddingHall(record) {
    const { rfxHeaderId, projectLineSectionId } = record?.get([
      'rfxHeaderId',
      'projectLineSectionId',
    ]);

    const search = {};
    if (projectLineSectionId) {
      search.sectionFlag = projectLineSectionId ? 1 : null; // 采购方的subjectMatterRule写死，所以判断标段特殊处理
      search.projectLineSectionId = projectLineSectionId;
    }
    const strSearch = querystring.stringify(filterNullValueObject(search));

    // 跳转到竞价大厅
    this.props.history.push({
      pathname: `/pub${getActiveTabKey()}/bidding-hall/${rfxHeaderId}`,
      search: strSearch,
    });
  }

  // 跳入线下回复录入
  @Bind()
  directOfflineReply(record) {
    this.props.history.push({
      pathname: `${getActiveTabKey()}/offline-reply/${record.get('sourceCategory')}/${record.get(
        'rfHeaderId'
      )}`,
    });
  }

  /**
   * 关闭询价单抽屉
   * @param {Object} record 行数据
   */
  @Throttle(500)
  @Bind()
  closeInquiryListDrawer(record = {}, onGoingStatus) {
    const { remote } = this.props;
    const { rfxHeaderId } = record;
    closeRfxDrawer(
      rfxHeaderId,
      () => {
        this.afterCloseConditionQuery(onGoingStatus);
      },
      this.documentTypeName,
      this.sourceKey,
      this.state.serviceChargeFlag,
      remote
    );
  }

  /**
   * 关闭询价单后刷新询价单表格
   * @param {*} onGoingStatus - 进行中的状态
   */
  afterCloseConditionQuery(onGoingStatus = '') {
    const { allDS, onGoingDealDS, attentionDS } = this.props;
    const { tabStatus } = this.state;
    if (tabStatus === 'all') {
      allDS.query(allDS.currentPage);
      return;
    }
    switch (onGoingStatus) {
      case 'processing':
        onGoingDealDS.query(this.props.onGoingDealDS.currentPage);
        break;
      case 'attention':
        attentionDS.query(this.props.attentionDS.currentPage);
        break;
      default:
        break;
    }
  }

  /**
   * 跳转到明细页面
   */
  @Bind()
  inquiryDetail(record = {}, type = '') {
    const { history } = this.props;
    const {
      rfHeaderId,
      rfxHeaderId,
      projectLineSectionId = null,
      sourceCategory,
      offlineWholeFlag,
    } =
      record.get([
        'rfHeaderId',
        'rfxHeaderId',
        'projectLineSectionId',
        'sourceCategory',
        'offlineWholeFlag',
      ]) || {};

    if (sourceCategory === 'RFQ' || sourceCategory === 'RFA') {
      if (offlineWholeFlag === 1) {
        this.offlineWholeUpdate(record.toData(), 'detail');
        return;
      }
      const search = querystring.stringify({
        projectLineSectionId,
        rfxHeaderId,
        sourceCategory,
        tabStatus: type,
      });
      if (rfxHeaderId) {
        const DetailUrl = this.distinguishDetailPageUrl(rfxHeaderId);
        history.push({
          pathname: DetailUrl,
          search,
        });
      }
    } else if (rfHeaderId) {
      history.push({
        pathname: `${getActiveTabKey()}/rf-detail/${sourceCategory}/${rfHeaderId}`,
      });
    }
  }

  /**
   * 跳转到创建页面
   */
  @Throttle(500)
  @Bind()
  inquiryCreate() {
    const { history } = this.props;
    const url = this.distinguishUpdatePageUrl({});
    history.push({
      pathname: url,
    });
  }

  /**
   * 跳转到申请转询价
   */
  @Throttle(1000)
  @Bind()
  async jumpApplyToInquiry(payload) {
    const {
      sourceRequest, //  来源于创建RFQ【ONLINE_SOURCING】还是整单线下【OFFLINE_ENTER】
    } = payload || {};
    const { remote, history, organizationId, customizeTable } = this.props;
    const { doubleUnitFlag } = this.state;
    let data = null;
    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_execution_link_old_tenant',
        organizationId,
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      if (isEmpty(data)) {
        this.purchaseRequestDS.clearCachedSelected();
        this.purchaseRequestDS.unSelectAll();
        this.purchaseRequestDS.loadData();
        const modalKey = Modal.key();
        const Props = {
          organizationId,
          PurchaseRequestDS: this.purchaseRequestDS,
          customizeTable,
          doubleUnitFlag,
          executionLinkFlag: 1,
          sourceKey: this.props.sourceKey || 'INQUIRY',
        };

        if (remote?.event) {
          const cuxResult = await remote.event.fireEvent(
            'handleRemoteBeforePurchaseRequestModalOpen',
            {
              payload,
              that: this,
              purchaseRequestDS: this.purchaseRequestDS,
              data,
            }
          );

          if (cuxResult === false) {
            return;
          }
        }

        Modal.open({
          destroyOnClose: true,
          key: modalKey,
          drawer: true,
          title:
            sourceRequest === 'ONLINE_SOURCING'
              ? intl
                  .get(`ssrc.inquiryHall.view.message.button.commonApplyToInquiry`, {
                    sourceCategoryName: this.sourceCategoryName,
                  })
                  .d(`申请转{sourceCategoryName}`)
              : intl.get('ssrc.inquiryHall.view.button.applyToWholeEntry').d('申请转整单线下'),
          children: <PurchaseRequestContent {...Props} />,
          style: { width: 1090 },
          onOk: () => this.purchaseRequestOk({ sourceRequest }),
          // onClose: this.purchaseRequestCancel,
          // onCancel: this.purchaseRequestCancel,
          okText: intl.get('hzero.common.button.create').d('新建'),
          footer: (okBtn, cancelBtn, modal) => {
            const standandBtns = [okBtn, cancelBtn];
            return remote
              ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_APPLY_TO_INQUIRY_FOOTER', standandBtns, {
                  modal,
                  okBtn,
                  cancelBtn,
                  sourceRequest,
                  that: this,
                  bidFlag: this.bidFlag,
                  purchaseRequestOk: this.purchaseRequestOk,
                  purchaseRequestDS: this.purchaseRequestDS,
                })
              : standandBtns;
          },
        });
      } else if (sourceRequest === 'OFFLINE_ENTER') {
        // 申请转整单线下
        history.push({
          pathname: `${getActiveTabKey()}/apply-to-offline/${sourceRequest}`,
        });
      } else {
        history.push({
          pathname: `${getActiveTabKey()}/apply-to-inquiry`,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  openOfflineModal(sourceFrom = 'inquiryRFQCreate') {
    const OfflineWholeProps = {
      sourceFrom,
      offlineWholeDs: this.offlineWholeDs,
    };
    Modal.open({
      key: this.C7nModalKey,
      drawer: true,
      destroyOnClose: true,
      title: intl.get('ssrc.inquiryHall.view.message.title.selectedSourceMethod').d('选择寻源方式'),
      children: <OfflineWholeModal {...OfflineWholeProps} />,
      style: { width: '380px' },
      onOk: async () => {
        if (sourceFrom === 'applyToInquiry' && !(await this.offlineWholeDs.validate())) {
          // 防止弹框关闭
          return false;
        }
        this.offlineModalOk(sourceFrom);
      },
      onCancel: () => this.offlineWholeDs.reset(),
      onClose: () => this.offlineWholeDs.reset(),
    });
  }

  @Bind()
  async offlineModalOk(sourcePageFrom = 'inquiryRFQCreate') {
    const { history } = this.props;
    const offlineData = this.offlineWholeDs.current.toData();
    const { sourceType, templateLov = {} } = offlineData;
    if (sourceType === 'rfx') {
      if (sourcePageFrom === 'inquiryRFQCreate') {
        const url = this.distinguishUpdatePageUrl({});
        history.push({
          pathname: url,
        });
      } else if (sourcePageFrom === 'applyToInquiry') {
        this.createModalInquiry({ templateId: templateLov?.templateId });
      }
    } else {
      // 走整单线下录入
      this.goOffline(sourcePageFrom);
    }
  }

  @Bind()
  async goOffline(sourcePageFrom = 'inquiryRFQCreate') {
    const { organizationId, history } = this.props;
    let data = null;
    try {
      let params = {
        sourcePageFrom,
        organizationId,
      };
      if (sourcePageFrom === 'applyToInquiry') {
        const { selected = [] } = this.purchaseRequestDS;
        const selectedRowKeys = [];
        const selectedRows = [];
        selected.map((item) => {
          selectedRowKeys.push(item.toData().prLineId);
          selectedRows.push(item.toData());
          return '';
        });
        const otherParams = {
          prLineIdList: selectedRowKeys,
          prLineList: selectedRows,
          sourceFrom: 'DEMAND_POOL',
          sourceDocumentType: 'RFX',
          configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
        };
        params = { ...params, ...otherParams };
      }
      this.setState({ controllerLoading: true });
      data = getResponse(await offlineWholeService(params));
      this.setState({ controllerLoading: false });
      if (data && !data.failed) {
        notification.success();
        let rfxHeaderId = null;
        if (sourcePageFrom === 'inquiryRFQCreate') {
          rfxHeaderId = data?.rfxHeaderId;
        } else if (sourcePageFrom === 'applyToInquiry') {
          rfxHeaderId = data?.rfxHeader?.rfxHeaderId;
        }
        if (rfxHeaderId) {
          history.push({
            pathname: `/ssrc/new-inquiry-hall/whole-update/${rfxHeaderId}`,
          });
        }
      }
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  async purchaseRequestOk(payload) {
    const {
      sourceRequest, // 来源于创建RFQ【ONLINE_SOURCING】还是整单线下【OFFLINE_ENTER】
    } = payload || {};
    const { selected } = this.purchaseRequestDS;
    const { organizationId, remote } = this.props;
    const { offlineWholeFlag = false } = this.state;
    const selectedRowKeys = [];
    const selectedRows = [];
    selected.map((item) => {
      selectedRowKeys.push(item.toData().prLineId);
      selectedRows.push(item.toData());
      return '';
    });
    if (selected && selected.length > 0) {
      let res = null;
      try {
        const standardBatchParams = {
          organizationId,
          prLineIdList: selectedRowKeys,
          sourceFrom: 'DEMAND_POOL',
          sourceDocumentType: this.sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
          configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
        };
        const remoteBatchParams = remote
          ? remote.process(
              'SSRC_INQUIRY_HALL_NEW_LIST_APPLY_TO_INQUIRY_BATCH_VALIDATE_PARAMS',
              standardBatchParams,
              {
                bidFlag: this.bidFlag,
                ...(payload || {}),
              }
            )
          : standardBatchParams;
        res = await newBatchValidatePurchase(remoteBatchParams);
        res = getResponse(res);
        if (res) {
          // 打开模板选择弹框
          const openCreateModal = () => {
            this.setState({ createModalVisible: true });
          };
          // 校验通过之后的处理
          const handleRemotePurchaseValidateOk = () => {
            if (remote?.event) {
              return remote.event.fireEvent('handleRemotePurchaseValidateOk', {
                validateRes: res,
                bidFlag: this.bidFlag,
                openCreateModal,
                createModalInquiry: this.createModalInquiry,
              });
            } else {
              openCreateModal();
            }
          };

          // 开启线下整单-校验通过之后的处理
          const handleRemotePurOfflineValidateOk = () => {
            if (sourceRequest === 'OFFLINE_ENTER') {
              // 走整单线下录入
              return this.goOffline('applyToInquiry');
            }
            // 以下的代码走的其实是申请转询价内容，为了兼容二开这里不动
            if (remote?.event) {
              return remote.event.fireEvent('handleRemotePurOfflineValidateOk', {
                validateRes: res,
                bidFlag: this.bidFlag,
                offlineWholeDs: this.offlineWholeDs,
                openOfflineModal: () => this.openOfflineModal('applyToInquiry'),
              });
            } else {
              this.openOfflineModal('applyToInquiry');
            }
          };

          const validateCallBackRes = validatorConfirmModal({
            response: res,
            validatorType: 'highestValidatorType',
            validatorArrName: 'validateResults',
            onOk: throttle(async () => {
              // 校验不通过， 后端返回returnDetail对象
              if (res?.returnDetail?.secondaryUomInconsistentFlag === 1) {
                applyToNotification(res?.returnDetail?.secondaryUomInconsistentMes);
              }
              if (offlineWholeFlag) {
                await handleRemotePurOfflineValidateOk();
              } else {
                await handleRemotePurchaseValidateOk();
              }
            }, 1200),
          });
          // 代表有错误内容，阻断弹窗关闭
          if (validateCallBackRes?.returnDetail) {
            return false;
          }
          if (!validateCallBackRes?.returnDetail) {
            // 校验不通过， 后端返回returnDetail对象
            if (res.secondaryUomInconsistentFlag === 1) {
              applyToNotification(res.secondaryUomInconsistentMes);
            }
            if (offlineWholeFlag) {
              await handleRemotePurOfflineValidateOk();
            } else {
              await handleRemotePurchaseValidateOk();
            }
          }
        }
      } catch (e) {
        throw e;
      }
    } else {
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.message.pleaseSelectAtleastOneData')
          .d('请至少选择一条数据'),
      });
      return false;
    }
  }

  @Bind()
  purchaseRequestCancel() {
    // this.purchaseRequestDS.clearCachedSelected();
    // this.purchaseRequestDS.loadData();
  }

  // 申请转RF
  @Bind()
  jumpApplyToInquiryRF(type) {
    const { history } = this.props;
    const search = querystring.stringify({
      type,
    });
    history.push({
      pathname: `${getActiveTabKey()}/rf-apply-to-inquiry`,
      search,
    });
  }

  /**
   * 中标公告
   * */
  @Bind()
  directBidWinnerNotice(record = {}) {
    const { history, remote } = this.props;
    const { winningBidAnnouncementC7N = false } = this.state;
    const { rfxHeaderId } = record || {};

    if (!rfxHeaderId) {
      return;
    }

    // 中标公告c7n 白名单
    const urlSymbol = winningBidAnnouncementC7N ? '-new' : '';

    // 路由跳转
    const routerSkip = () => {
      history.push({
        pathname: `${getActiveTabKey()}/accept-rfx-notice${urlSymbol}/${rfxHeaderId}`,
      });
    };

    if (remote?.event) {
      const eventProps = {
        routerSkip,
        that: this,
        rfxHeaderId: record.rfxHeaderId,
      };
      remote.event.fireEvent('routerSkip', eventProps);
    } else {
      routerSkip();
    }
  }

  /**
   * 跳转到核价页面
   */
  @Bind()
  inquiryCheckPrice(record) {
    const { history, remote } = this.props;
    const skipPage = () => {
      const search = querystring.stringify({
        projectLineSectionId: record.projectLineSectionId,
      });
      history.push({
        pathname: `${getActiveTabKey()}/check-price/${record.rfxHeaderId}`,
        search,
      });
    };

    if (remote?.event) {
      const eventProps = {
        rfxHeaderId: record.rfxHeaderId,
        record,
      };
      remote.event.fireEvent('beforeJumpPreValidate', eventProps);
    }

    if (remote?.event) {
      const eventProps = {
        skipPage,
        bidFlag: this.bidFlag,
        rfxHeaderId: record.rfxHeaderId,
        that: this,
        record,
      };
      remote.event.fireEvent('skipPage', eventProps);
    } else {
      skipPage();
    }
  }

  // // 还比价更新已读
  // handleUpdateFeedBackReadedFlag = async ({ record }) => {
  //   const { organizationId } = this.props;
  //   const { rfxHeaderId } = record || {};

  //   let result = null;
  //   const data = {
  //     organizationId,
  //     rfxHeaderId,
  //   };
  //   try {
  //     result = await updateFeedBackReadedFlag(data);
  //     result = getResponse(result);
  //   } catch(e) {
  //     throw e;
  //   }
  //   return result;
  // }

  /**
   *跳转到还比价页面
   *
   * @param {*} record
   * @memberof InquiryHall
   */
  @Bind()
  async inquiryFeedbackBargain(record) {
    const { history } = this.props;
    const { feedBackFlag = false } = this.state;

    // await this.handleUpdateFeedBackReadedFlag({ record });

    history.push({
      pathname: `${getActiveTabKey()}/feedback-bargain${feedBackFlag ? '-new' : ''}/${
        record.rfxHeaderId
      }`,
    });
  }

  /**
   * 跳转到评标管理评分结果确认页面
   * @param {Object} record
   */
  @Bind()
  rfxEvaluation(record = {}, isCheck) {
    const { history } = this.props;
    const userId = getCurrentUserId() || null;

    const {
      rfxHeaderId = null,
      subjectMatterRule = null,
      // currentSequenceNum = null,
      scoreStatus,
      rfxStatus,
      evaluateLeaderFlag = 0,
      evaluateExpertId = null,
      expertUserId,
      initialReview,
      reviewScoredStatus,
      expertSequenceNum,
      expertScoredStatus,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    } = record;
    const search = querystring.stringify({
      scoredStatus: expertScoredStatus,
      sourceStatus: isCheck ? scoreStatus : rfxStatus,
      evaluateLeaderFlag,
      sourcePage: 'RFXLIST',
      sourceFrom: 'RFX',
      cachTabKey: 'scoreing',
      evaluateExpertId,
      reviewScoredStatus,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });

    if (
      ['NEW', 'SCORED'].includes(reviewScoredStatus) &&
      initialReview === 'NEED' &&
      ['INITIAL_REVIEW_SCORING', 'RFX_INITIAL_REVIEW_PENDING'].includes(scoreStatus)
    ) {
      // 符合性检查
      history.push({
        pathname: `${getActiveTabKey()}/${rfxHeaderId}/${expertUserId}/${subjectMatterRule}/${expertSequenceNum}/RFX/initial-review`,
        search,
      });
    } else {
      history.push({
        pathname: `${getActiveTabKey()}/${rfxHeaderId}/${userId}/${subjectMatterRule}/${expertSequenceNum}/RFX/update`,
        search,
      });
    }
  }

  /**
   * 跳转到评标管理评分结果确认页面
   * @param {Object} record
   */
  @Bind()
  async rfxScoreNode(record = {}) {
    const {
      rfxHeaderId,
      evaluateScoreId,
      quotationHeaderId,
      roundNumber,
      tenantId,
      evaluateExpertId,
    } = record;
    const sourceFrom = 'RFX'; // 固定传RFX
    const params = {
      tenantId,
      evaluateScoreId,
      quotationHeaderId,
      roundNumber,
      evaluateExpertId,
      sourceFrom,
      sourceHeaderId: rfxHeaderId,
    };
    const res = await beforeScoreValidate(params);
    if (getResponse(res)) {
      this.rfxEvaluation(record);
    }
  }

  /**
   *物品弹窗－发起多轮报价
   *
   * @memberof ExpertScoring
   * @param {!Object} roundQuotationData - 多轮报价数据, 来源record或弹窗回调返回的数据
   */
  @Bind
  @Throttle(1000)
  async startRoundQuotation(roundQuotationData = {}, filterRoundQuoKeys, filterScoreKeys) {
    const { organizationId, history, remote } = this.props;
    const { curRecord } = roundQuotationData;
    const {
      rfxHeaderId,
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      sourceHeaderId,
      projectLineSectionId,
    } = curRecord || roundQuotationData;
    const search = querystring.stringify({
      evaluateLeaderFlag,
      cachTabKey: 'scoreing',
      sourceFrom: 'RFX',
      sourceHeaderId: sourceHeaderId || rfxHeaderId,
      sourceStatus: 'ROUND_QUOTATION',
      sourcePage: 'RFXList',
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });

    if (remote?.event) {
      const eventProps = {
        rfxHeaderId: sourceHeaderId || rfxHeaderId,
      };
      const res = await remote.event.fireEvent('beforeJump', eventProps);
      if (!res) {
        return;
      }
    }

    const result = getResponse(
      await beginRoundQuotation({
        sourceHeaderId: projectLineSectionId ? filterRoundQuoKeys?.join(',') : rfxHeaderId,
        organizationId,
      })
    );

    if (!result) {
      return false;
    }
    // 存在开始评分才调用接口, 否则直接跳转页面关闭弹窗
    if (filterScoreKeys?.length) {
      this.startScore(roundQuotationData, filterRoundQuoKeys, filterScoreKeys);
      return true;
    }
    this.candelRoundQuotationModal();
    history.push({
      pathname: `${getActiveTabKey()}/rfx-evaluation-proc-manage/${sourceHeaderId || rfxHeaderId}`,
      search,
    });
  }

  /**
   * 供应商物品弹窗－开始评分
   *
   * @memberof ExpertScoring
   * @param {!Object} roundQuotationData - 多轮报价数据, 来源record或弹窗回调返回的数据
   * @param {!Object} filterRoundQuoKeys - 多轮报价勾选行数组 - 针对分标段
   * @param {?Array} filterScoreKeys - 开始评分勾选行数组 - 针对分标段
   */
  @Bind
  @Throttle(1000)
  async startScore(roundQuotationData = {}, filterRoundQuoKeys, filterScoreKeys) {
    const { organizationId, history, remote } = this.props;
    const handleStartScoreJump = async () => {
      const { curRecord } = roundQuotationData;
      const {
        rfxHeaderId,
        multiSectionFlag,
        sourceProjectId,
        sourceHeaderId,
        projectLineSectionId,
        evaluateLeaderFlag,
      } = curRecord || roundQuotationData;
      try {
        const result = getResponse(
          await roundBeginScore({
            sourceHeaderId: projectLineSectionId ? filterScoreKeys?.join(',') : rfxHeaderId,
            organizationId,
          })
        );
        if (!result) {
          return false;
        }
      } catch (e) {
        throw e;
      }
      if (filterRoundQuoKeys?.length) {
        // 多轮报价
        const search = querystring.stringify({
          evaluateLeaderFlag,
          cachTabKey: 'scoreing',
          sourceFrom: 'RFX',
          sourceHeaderId: sourceHeaderId || rfxHeaderId,
          sourceStatus: 'ROUND_QUOTATION',
          sourcePage: 'RFXList',
          multiSectionFlag,
          sourceProjectId,
          projectLineSectionId,
        });
        history.push({
          pathname: `${getActiveTabKey()}/rfx-evaluation-proc-manage/${
            sourceHeaderId || rfxHeaderId
          }`,
          search,
        });
        this.candelRoundQuotationModal();
        return true;
      }
      this.candelRoundQuotationModal();
      const search = querystring.stringify({
        cachTabKey: 'scoreing',
        sourceFrom: 'RFX',
        sourceHeaderId: sourceHeaderId || rfxHeaderId,
        sourceStatus: 'SCORING',
        sourcePage: 'RFXList',
        multiSectionFlag,
        sourceProjectId,
        projectLineSectionId,
      });
      history.push({
        pathname: `${getActiveTabKey()}/rfx-evaluation-proc-manage/${
          sourceHeaderId || rfxHeaderId
        }`,
        search,
      });
    };

    if (remote?.event) {
      // remoteStartScore 二开埋点方法名
      remote.event.fireEvent('remoteStartScore', {
        handleStartScoreJump: (...params) => handleStartScoreJump(...params),
        startRoundQuotation: () => {
          // 如果多轮报价数据大于0就取多轮报价，否则将专家评分数据传过去
          const roundQuoKeys =
            filterRoundQuoKeys?.length > 0 ? filterRoundQuoKeys : filterScoreKeys;
          const coreKeys = filterRoundQuoKeys?.length > 0 ? filterScoreKeys : [];
          return this.startRoundQuotation(roundQuotationData, roundQuoKeys, coreKeys);
        },
      });
    } else {
      handleStartScoreJump();
    }
  }

  /**
   * 关闭供应商物品弹窗
   *
   * @memberof ExpertScoring
   */
  @Bind
  candelRoundQuotationModal() {
    const { dispatch } = this.props;

    this.setState({
      roundQuotationModalVisible: false,
      record: {},
    });

    dispatch({
      type: 'expertScoring/updateState',
      payload: {
        expertScoreItemLineList: [],
        expertScoreItemPagination: {},
      },
    });
    return true;
  }

  /**
   * 二阶段判断
   */
  getSecondOpenBidFlag = (record) => {
    const { bidOpeningNewFlag } = this.state;
    const { sealedQuotationFlag, openerFlag, openBidOrder } = record || {};

    const flag =
      bidOpeningNewFlag && sealedQuotationFlag === 1 && openerFlag === 1 && openBidOrder !== 'SYNC';
    return flag;
  };

  /**
   * 跳转到评分管理页面
   *
   * @param {*} record
   * @memberof inquiryHall
   */
  @Bind()
  async directScoreManager(record = {}) {
    const { history, customizeTable, customizeBtnGroup, remote } = this.props;
    // const { bidOpeningNewFlag } = this.state;
    const {
      rfxHeaderId = null,
      scoreStatus,
      rfxStatus,
      openBidOrder, // 评标步制
      scoreRoundStatus,
      roundQuotationRule,
      evaluateLeaderFlag,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
      // sealedQuotationFlag,
      // openerFlag,
    } = record || {};
    const search = querystring.stringify({
      evaluateLeaderFlag,
      cachTabKey: 'scoreing',
      sourceFrom: 'RFX',
      sourceHeaderId: rfxHeaderId,
      sourceStatus: rfxStatus,
      sourcePage: 'RFXList',
      backRecommend: 'recommend',
      roundQuotationRule,
      multiSectionFlag,
      sourceProjectId,
      projectLineSectionId,
    });

    const DirectEvaluationProcManageFlag =
      scoreRoundStatus === 'NOT_START' &&
      roundQuotationRule !== 'SCORE' &&
      roundQuotationRule !== 'AUTO_SCORE';

    const FiniallyDirectEvaluationProcManageFlag = !remote
      ? DirectEvaluationProcManageFlag
      : remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_DIRECTROUNDQUOTATION_DIRECTSCOREMANAGER_FLAG',
          DirectEvaluationProcManageFlag,
          { record, bidFlag: this.bidFlag }
        );

    if (FiniallyDirectEvaluationProcManageFlag) {
      history.push({
        pathname: `${getActiveTabKey()}/rfx-evaluation-proc-manage/${rfxHeaderId}`,
        search,
      });
    } else {
      // 加是否启用多轮报价逻辑
      if (
        (openBidOrder === 'BUSINESS_FIRST' || openBidOrder === 'SYNC') &&
        scoreRoundStatus === 'NOT_START'
      ) {
        // 新开标功能开启此处无需启用多轮，新开标暂不考虑多标段单据
        // 二阶段租户+密封+开标+先商务后技术/先技术后商务
        const newOpenBidFlag = this.getSecondOpenBidFlag(record);

        if (newOpenBidFlag) {
          return this.startScore(record);
        }
        // 多轮报价弹窗
        // 多轮报价modal
        // ------------------分标段---------------
        if (projectLineSectionId) {
          // 分标段, 直接返回
          this.setState({
            record,
            roundQuotationModalVisible: true,
          });
          return;
        }

        // 未分标段
        const roundQuotationModalProps = {
          rfxHeaderId,
          customizeTable,
          quotationName: this.quotationName,
        };

        // 修复点击close时触发onCancel事件, 因此重写footer
        Modal.open({
          key: Modal.key(),
          title: intl.get(`ssrc.expertScoring.view.modal.title.isRoundQuo`).d('是否开启多轮报价'),
          children: <RoundQuotationModal {...roundQuotationModalProps} />,
          closable: true,
          style: { width: '80%' },
          footer: () => (
            <div>
              {customizeBtnGroup(
                {
                  code: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_MODAL_BUTTON',
                  pro: true,
                },
                <DynamicButtons buttons={this.getRoundQuotationButtons(record)} />
              )}
              {/* <Button onClick={() => this.startRoundQuotation(record)}>
                {intl.get(`ssrc.expertScoring.view.modal.button.starRoundQuo`).d('发起多轮报价')}
              </Button>
              <Button color='primary' onClick={() => this.startScore(record)}>
                {intl.get(`ssrc.expertScoring.view.modal.button.startScore`).d('开始评分')}
              </Button> */}
            </div>
          ),
        });

        return;
      }
      if (['INITIAL_REVIEW_SCORING', 'SCORING', 'ROUND_QUOTATION'].includes(scoreStatus)) {
        // record.roundHeaderStatus === 'ROUND_SCORE'
        history.push({
          pathname: `${getActiveTabKey()}/rfx-evaluation-proc-manage/${rfxHeaderId}`,
          search,
        });
      }

      if (scoreStatus === 'RFX_EVALUATION_PENDING') {
        history.push({
          pathname: `${getActiveTabKey()}/rfx-evaluation/${rfxHeaderId}`,
          search: querystring.stringify({
            ...querystring.parse(search),
            sourceStatus: scoreStatus,
          }),
        });
      }

      if (scoreStatus === 'RFX_INITIAL_REVIEW_PENDING') {
        history.push({
          pathname: `${getActiveTabKey()}/new-expert-scoring/rfx-evaluation/${rfxHeaderId}`,
          search: querystring.stringify({
            ...querystring.parse(search),
            sourceStatus: scoreStatus,
          }),
        });
      }

      if (
        scoreStatus === 'PRE_EVALUATION_PENDING_REJECT' ||
        scoreStatus === 'PRE_EVALUATION_PENDING'
      ) {
        history.push({
          pathname: `${getActiveTabKey()}/confirm-candidate/${rfxHeaderId}`,
          search,
        });
      }
    }
  }

  // 多轮报价弹框按钮--路斯特二开
  getRoundQuotationButtons(record) {
    const buttons = [
      {
        name: 'startRoundQuotation',
        btnType: 'c7n-pro',
        btnProps: { onClick: () => this.startRoundQuotation(record) },
        child: intl.get(`ssrc.expertScoring.view.modal.button.starRoundQuo`).d('发起多轮报价'),
      },
      {
        name: 'startScore',
        btnType: 'c7n-pro',
        btnProps: { color: 'primary', onClick: () => this.startScore(record) },
        child: intl.get(`ssrc.expertScoring.view.modal.button.startScore`).d('开始评分'),
      },
    ];
    return buttons;
  }

  /**
   * 跳转到资格预审
   * */
  @Bind()
  directPrequalification(record = {}) {
    const { history } = this.props;
    const { prequalHeaderId, sourceProjectId, prequalGroupHeaderId } = record;
    const search = this.getDirectSearch(record);
    if (isNil(prequalGroupHeaderId)) {
      // 非立项标段合并
      return history.push({
        pathname: `${getActiveTabKey()}/new-qualification-examination/detail/${prequalHeaderId}`,
        search,
      });
    }
    history.push({
      pathname: `${getActiveTabKey()}/new-qualification-examination/section-detail/${prequalGroupHeaderId}`,
      search: `${search}&sourceProjectId=${sourceProjectId}`,
    });
  }

  /**
   * 跳转到澄清答疑详情
   */
  @Bind()
  directQuestionAnswer(record) {
    const { history } = this.props;
    const { rfxHeaderId, rfxNum, companyId, sourceCategory } = record;
    const url = `${getActiveTabKey()}/inter-question/${rfxHeaderId}/${rfxNum}/sourceTitle/${companyId}/1`;
    const search = querystring.stringify({
      createFlag: record.createFlag,
      sourceCategory,
    });

    history.push({
      pathname: url,
      search,
    });
  }

  @Bind()
  directQuestionAnswerRF(record) {
    const { history } = this.props;
    const { rfHeaderId, rfNum, companyId, sourceCategory, createFlag } =
      record.get(['rfHeaderId', 'rfNum', 'companyId', 'sourceCategory', 'createFlag']) || {};
    const url = `${getActiveTabKey()}/inter-question/${rfHeaderId}/${rfNum}/sourceTitle/${companyId}/1`;
    const search = querystring.stringify({
      createFlag,
      sourceCategory,
    });
    history.push({
      pathname: url,
      search,
    });
  }

  // 寻源过程控制 若要改动这里 请看下角色工作台开标后的操作弹框以及寻源过程控制 可能需要同样的处理
  // TODO 过程控制会跳用用三个接口，其中最后一个时间最长(几秒到几十秒)，且存在交互，防抖等手段页无法处理多次掉用，故采用同步判断
  controlApiSyncFlag = 0;

  @Throttle(500)
  @Bind()
  async directControllerDetail(record) {
    const { history, organizationId } = this.props;
    const { rfxHeaderId, projectLineSectionId } = record || {};

    const searchObj = {};
    if (projectLineSectionId) {
      searchObj.projectLineSectionId = projectLineSectionId;
    }
    const search = querystring.stringify(searchObj);

    this.setState({
      controllerLoading: true,
    });

    try {
      const res = getResponse(
        await fetchOldControllerConfig({
          organizationId,
          tenant: getCurrentTenant().tenantNum,
        })
      );
      if (!res) {
        return;
      }
      if (!res.length) {
        const result = getResponse(
          await validateBeforeDirectController({
            organizationId,
            sourceHeaderId: rfxHeaderId,
            sourceFrom: 'RFX',
          })
        );
        if (result) {
          const onOk = async () => {
            if (this.controlApiSyncFlag === 1) {
              return;
            }

            this.controlApiSyncFlag = 1;
            const createRes = await createBeforeDirectController({
              organizationId,
              sourceHeaderId: rfxHeaderId,
              sourceFrom: 'RFX',
            });
            this.controlApiSyncFlag = 0;

            if (createRes) {
              if (!createRes.failed) {
                const url = `${getActiveTabKey()}/new-rfx-detail-controller/${
                  createRes.adjustRecordId
                }`;
                history.push({
                  pathname: url,
                  search,
                });
              } else {
                message.warning(createRes.message);
              }
            }
          };
          if (result.validateResult === 'createAdjustAgain') {
            Modal.confirm({
              key: Modal.key(),
              title: intl
                .get(`ssrc.inquiryHall.view.message.title.commonAdjustagain`, {
                  documentTypeName: this.documentTypeName,
                  sourceName: this.sourceName,
                })
                .d(`{documentTypeName}中的部分信息已变更，是否重新发起{sourceName}过程控制？`),
              onOk: () => onOk(),
            });
          } else if (result.validateResult === 'createAdjust') {
            await onOk();
          } else if (result.validateResult === 'openAdjust') {
            const url = `${getActiveTabKey()}/new-rfx-detail-controller/${result.adjustRecordId}`;
            history.push({
              pathname: url,
              search,
            });
          }
        }
      } else {
        history.push({
          pathname: `${getActiveTabKey()}/rfx-detail-controller/${rfxHeaderId}`,
        });
      }
    } catch (error) {
      throw error;
    } finally {
      this.setState({
        controllerLoading: false,
      });
      this.controlApiSyncFlag = 0;
    }
  }

  /**
   * 跳转到监控台
   */
  @Bind()
  goMonitor(record) {
    const { history } = this.props;
    const search = querystring.stringify({
      rfxHeaderId: record.rfxHeaderId, // 针对于伊戈尔二开增加参数
    });
    history.push({
      pathname: `${getActiveTabKey()}/quotation-monitor/${record.rfxHeaderId}`,
      search,
      state: record.rfxHeaderId,
    });
  }

  // 处理 BID | RFQ | RFI | RFQ - 审批
  @Bind()
  handleApprove(record = {}) {
    const { dataSet } = record;
    const { currentType } = this.state;
    if (!dataSet) return;
    const approvaFlags = dataSet.getState('approvaFlags');
    const workFlowBusinessKey = record.get('businessKey');
    const approvaFlag = approvaFlags?.[workFlowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      taskId,
      processInstanceId,
      closable: true,
      onSuccess: () => {
        dataSet.query();
        if (currentType === 'RFQ') {
          this.allSearch();
        } else {
          this.allRFSearch();
        }
      },
    });
  }

  // 处理 RF 的刷新查询
  async allRFSearch() {
    const { state: { currentTab } = {}, getRFSearchRef } = this.rfContainerRef?.current || {};
    const { queryCount } = getRFSearchRef || {};
    const { getTabsNum } = getRFSearchRef?.props || {};
    const { allDS, waitPublishDS, onGoingDS, finishDS } = this.rfContainerRef.current?.props || {};
    if (!allDS || !waitPublishDS || !onGoingDS || !finishDS) return false;
    switch (currentTab) {
      case 'toBeReleased':
      case 'onGoing':
        waitPublishDS.query();
        onGoingDS.query();
        break;
      case 'finished':
        finishDS.query();
        break;
      case 'all':
        allDS.query();
        break;
      default:
        break;
    }
    if (queryCount && getTabsNum && isFunction(queryCount) && isFunction(getTabsNum)) {
      queryCount({ allDS, finishDS, onGoingDS, waitPublishDS, getTabsNum, mountFlag: true });
    }
  }

  // 处理 BID | RFQ | RFI | RFQ - 撤销审批
  async handleRevokeApproval(record) {
    const { currentType } = this.state;
    const businessKey = record.get('businessKey');
    if (businessKey) {
      const res = await handleRevokeApproval(businessKey);
      if (res && record.dataSet) {
        if (currentType === 'RFQ') {
          this.allSearch();
        } else {
          this.allRFSearch();
        }
      }
    }
  }

  // 这下面都是按钮操作 *********************************************************************************************************************

  /**
   * 跳转到招投标时带参
   *
   * @param {*} [record={}]
   * @returns
   * @memberof InquiryHall
   */
  getDirectSearch(record = {}) {
    const { rfxHeaderId = '' } = record;
    const search = querystring.stringify({
      sourceFrom: 'RFX',
      sourceHeaderId: rfxHeaderId,
      sourcePage: 'RFXList',
    });

    return search;
  }

  /**
   * 打开操作记录模态框
   */
  @Bind()
  playView(record) {
    const operationRecordProps = {
      rfxHeaderId: record.get('rfxHeaderId'),
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.title.record`).d('操作记录'),
      children: <OperationRecord {...operationRecordProps} />,
      closable: true,
      style: { width: '742px' },
      onCancel: () => {},
      footer: null,
      drawer: true,
    });
  }

  @Bind()
  showChangeRecords(record) {
    const { rfxHeaderId, projectLineSectionId } = record;
    const { history } = this.props;
    const QuotationChangeRecordsProps = {
      sourceHeaderId: rfxHeaderId,
      history,
      projectLineSectionId,
      documentTypeName: this.documentTypeName,
      sourceKeyLowerCase: this.sourceKeyLowerCase,
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.changeReords`).d('变更记录'),
      children: this.renderQuotationChangeRecords(QuotationChangeRecordsProps),
      closable: true,
      style: { width: '1090px' },
      onCancel: () => {},
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      footer: (_, cancelBtn) => <div>{cancelBtn}</div>,
      drawer: true,
    });
  }

  /**
   * 变更记录弹窗
   * cux
   * */
  @Bind()
  renderQuotationChangeRecords(QuotationChangeRecordsProps = {}) {
    return <QuotationChangeRecords {...QuotationChangeRecordsProps} />;
  }

  // 批量开标，关闭弹窗时候清楚数据
  clearBatchOpenBiddingModalData = () => {
    const { clearSectionBiddingModalState = () => {} } = this.sectionBidding || {};
    clearSectionBiddingModalState();
  };

  @Bind()
  openNoPasswordBidding(record = {}, isBatchSection = false) {
    const { remote } = this.props;
    const { rfxHeaderId = null } = record;
    const { checkedList = [], switchValue = false } = this.sectionBidding.state || {};

    // 判断如果有其他开标可选，则加入本身
    if (checkedList.length && switchValue) {
      checkedList.push(record);
    }
    const { organizationId } = this.props;
    // this.setState({
    //   currentRfxHeaderId: rfxHeaderId,
    // });
    const otherProps = {
      that: this,
      record,
    };
    const modalRemoteProps = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_OPEN_NO_PASSWORD_MODEL_PROPS',
          {},
          otherProps
        )
      : {};
    Modal.confirm({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
      children: (
        <div>
          {checkedList.length && switchValue > 0
            ? intl
                .get(`ssrc.inquiryHall.view.message.confirm.sureSectionOpeningBid`, {
                  list: checkedList.map((item) => item.sectionName).join(','),
                  length: checkedList.length,
                })
                .d(
                  `已选择${checkedList.map((item) => item.sectionName).join(',')}等${
                    checkedList.length
                  }个标段，是否确认开标`
                )
            : intl.get(`ssrc.inquiryHall.view.message.confirm.sureOpeningBid`).d('是否确认开标')}
        </div>
      ),
      footer: (okBtn, cancelBtn) => (
        <div>
          <PermissionButton
            onClick={this.showExpertModal}
            type="c7n-pro"
            icon="call_missed_outgoing"
            permissionList={[
              {
                code: `${this.props?.match?.path}.button.transfer`,
                type: 'button',
                meaning:
                  intl.get(`ssrc.inquiryHall.view.message.button.confirmOpeningBid`).d('确认开标') -
                  intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交'),
              },
            ]}
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交')}
          </PermissionButton>
          {cancelBtn}
          {okBtn}
        </div>
      ),
      onOk: async () => {
        const openingBidFlag = remote
          ? await remote.process(
              'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_OPEN_NO_PASSWORD_MODEL_VALIDATE_FLAG',
              true,
              { that: this }
            )
          : true;
        if (!openingBidFlag) {
          return false;
        }
        const openingBidParams = remote
          ? remote.process(
              'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_OPEN_NO_PASSWORD_MODEL_VALIDATE_PARAMS',
              {},
              { that: this }
            )
          : {};
        let response;
        if (isBatchSection && switchValue) {
          response = getResponse(
            await batchOpenBindding({
              projectLineSectionList: checkedList,
              rfxHeaderId,
              organizationId,
            })
          );
        } else {
          response = getResponse(
            await openingBid({
              rfxHeaderId,
              ...openingBidParams,
            })
          );
        }

        if (remote?.event) {
          const eventProps = {
            rfxHeaderId,
          };
          remote.event.fireEvent('beforeJumpPreValidate', eventProps);
        }
        if (response === 0) {
          notification.warning({
            message: `${intl
              .get('ssrc.inquiryHall.view.batchOpenButNotLastOne')
              .d('您已完成开标,请等候其他开标员开标')}!`,
          });

          this.props.onGoingDealDS.query(this.props.onGoingDealDS.currentPage);
          this.props.allDS.query(this.props.allDS.currentPage);
        }
        if (response === 1) {
          this.allQuery();
          if (remote?.event) {
            remote.event.fireEvent('openBidModal', {
              onOperateBidModel: this.onOperateBidModel,
              record,
              rfxStatus: 'OPENED',
            });
          } else {
            this.onOperateBidModel({
              ...record,
              rfxStatus: 'OPENED',
            });
          }
        }

        this.clearBatchOpenBiddingModalData();
        this.forceUpdate();
      },
      onCancel: () => {
        // this.props.onGoingDealDS.query(this.props.onGoingDealDS.currentPage);
        // this.props.allDS.query(this.props.allDS.currentPage);
        this.clearBatchOpenBiddingModalData();
      },
      afterClose: () => {
        this.sectionBidding = {};
      },
      ...modalRemoteProps,
    });
  }

  @Throttle(500)
  @Bind()
  async resendPasswordFuc(record) {
    const { rfxHeaderId } = record;
    const { organizationId } = this.props;
    const { checkedList = [], switchValue = false } = this.sectionBidding.state || {};
    this.setState({
      resendPasswordLoading: true,
    });
    let result;
    if (checkedList.length && switchValue) {
      result = getResponse(
        await batchSendMessage({
          organizationId,
          rfxHeaderId: record.rfxHeaderId,
          projectLineSectionList: checkedList,
        })
      );
    } else {
      result = getResponse(
        await resendPassword({
          rfxHeaderId,
        })
      );
    }
    if (result && !result.failed) {
      this.setState({
        resendPasswordLoading: false,
      });
      notification.success();
    } else {
      this.setState({
        resendPasswordLoading: false,
      });
    }
  }

  @Bind()
  openPasswordBidding(record = {}) {
    const { organizationId, remote } = this.props;
    const { checkedList = [], switchValue = false } = this.sectionBidding.state || {};
    const confirmOpeningBid = async () => {
      const validate = await this.openingBidDS.validate();
      const { rfxHeaderId } = record;
      if (validate) {
        const openPassword = this.openingBidDS.current.get('openPassword');
        let result;
        if (checkedList && checkedList.length && switchValue) {
          result = getResponse(
            await batchOpenBindding({
              openPassword,
              rfxHeaderId: record.rfxHeaderId,
              projectLineSectionList: checkedList,
              organizationId,
            })
          );
        } else {
          result = getResponse(
            await openingBid({
              rfxHeaderId,
              openPassword,
            })
          );
        }

        this.clearBatchOpenBiddingModalData();
        if (remote?.event) {
          const eventProps = {
            rfxHeaderId,
          };
          remote.event.fireEvent('beforeJumpPreValidate', eventProps);
        }
        if (result === 1) {
          notification.success();
          Modal.destroyAll();
          this.allQuery();
          if (remote?.event) {
            remote.event.fireEvent('openBidModal', {
              onOperateBidModel: this.onOperateBidModel,
              record,
              rfxStatus: 'OPENED',
            });
          } else {
            this.onOperateBidModel({
              ...record,
              rfxStatus: 'OPENED',
            });
          }
        } else if (result === 0) {
          notification.warning({
            message: `${intl
              .get('ssrc.inquiryHall.view.batchOpenButNotLastOne')
              .d('您已完成开标,请等候其他开标员开标')}!`,
          });
          this.props.onGoingDealDS.query(this.props.onGoingDealDS.currentPage);
          this.props.allDS.query(this.props.allDS.currentPage);
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    const OpeningBidProps = {
      openingBidDS: this.openingBidDS,
    };
    Modal.confirm({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.title.openingBidInter`).d('开标界面'),
      children: <OpeningBid {...OpeningBidProps} />,
      style: { width: '380px' },
      drawer: true,
      onCancel: () => {
        this.clearBatchOpenBiddingModalData();
      },
      destroyOnClose: true,
      onOk: confirmOpeningBid,
      okText: intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
      footer: (okBtn, cancelBtn) => {
        let modalButtons = [
          cancelBtn,
          <PermissionButton
            onClick={this.showExpertModal}
            type="c7n-pro"
            icon="call_missed_outgoing"
            name="transfer"
            permissionList={[
              {
                code: `${this.props?.match?.path}.button.transfer`,
                type: 'button',
                meaning:
                  intl.get(`ssrc.inquiryHall.view.message.button.confirmOpeningBid`).d('确认开标') -
                  intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交'),
              },
            ]}
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交')}
          </PermissionButton>,
          <Button
            loading={this.state.resendPasswordLoading}
            onClick={() => this.resendPasswordFuc(record)}
            name="resend"
          >
            {intl.get(`ssrc.inquiryHall.view.message.button.resendPassword`).d('重发密码')}
          </Button>,
          okBtn,
        ];

        modalButtons = remote
          ? remote.process(
              'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_OPEN_PASSWORD_BIDDING_MODEL_FOOTER_BUTTONS',
              modalButtons,
              {
                record,
                that: this,
              }
            )
          : modalButtons;

        return <div>{modalButtons}</div>;
      },
      afterClose: () => {
        this.sectionBidding = {};
      },
    });
  }

  sectionBidding = {};

  async handleNewBidOpening(record) {
    const { remote, history, customizeTable, customizeBtnGroup } = this.props;
    // const bidExcutionStatusMap = getResponse(
    //   await fetchBidOpenExecution({
    //     rfxHeaderId: record.rfxHeaderId,
    //     organizationId: this.props.organizationId,
    //   })
    // );

    let cuxResult = null;
    if (remote?.event) {
      cuxResult = await remote.event.fireEvent('remoteBeforeHandleNewBidOpening', {
        record,
        that: this,
      });

      if (cuxResult === false) {
        return;
      }
    }

    return openNewBidModal({
      history,
      remote,
      data: record,
      // bidExcutionStatusMap,
      bidListRef: this.bidListRef,
      bidExcutionRef: this.bidExcutionRef,
      bidFlag: this.bidFlag,
      openingBidDS: this.openingBidDS,
      customizeTable,
      customizeBtnGroup,
      allQuery: this.allQuery,
      sourceKey: this.sourceKey,
      documentTypeName: this.documentTypeName,
      serviceChargeFlag: this.state.serviceChargeFlag,
      showExpertModal: this.showExpertModal,
      resendPasswordFuc: this.resendPasswordFuc,
    });
  }

  /**
   * 点击开标校验
   */
  @Throttle(1000, { trailing: false })
  @Bind()
  async openingBidModel(record = {}) {
    // const { bidOpeningNewFlag } = this.state;
    const { remote } = this.props;
    // 新开标功能开启
    if (this.getSecondOpenBidFlag(record)) {
      this.setState({
        currentRfxHeaderId: record.rfxHeaderId,
      });
      return this.handleNewBidOpening(record);
    }
    // 开标方法提取
    const openBidFunc = async () => {
      if (this.openBidClick) {
        return;
      }
      this.openBidClick = true;
      const { organizationId } = this.props;
      const {
        openedFlag = 0,
        passwordFlag = 0,
        rfxHeaderId = null,
        sectionName = null,
        projectLineSectionId = null,
      } = record;
      this.setState({
        currentRfxHeaderId: rfxHeaderId,
      });

      let sectionList = [];
      let res = {};
      if (projectLineSectionId) {
        res = getResponse(
          await fetchSctionList({
            rfxStatus: 'OPEN_BID_PENDING',
            organizationId,
            rfxHeaderId,
          })
        );
      }
      if (!res || res.failed || isEmpty(record)) {
        this.openBidClick = false;
        return;
      }
      sectionList = res.projectLineSectionList;

      if (openedFlag === 1) {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.view.message.confirm.notOpenAgain`)
            .d('已开标,不允许再次开标!'),
        });
      } else if (passwordFlag === null) {
        notification.warning({
          message: intl
            .get(`ssrc.inquiryHall.view.message.confirm.notAllowedOpen`)
            .d('当前用户不在开标人列表中,不允许开标!'),
        });
      } else if (sectionList && sectionList.length) {
        const hasPasswordFlag = sectionList.some((item) => item.passwordFlag) || passwordFlag;
        const sectionBiddingProps = {
          onRef: (ref) => {
            this.sectionBidding = ref;
          },
          sectionList,
          rfxHeaderId,
          sectionName,
          remote,
          bidFlag: this.bidFlag,
        };
        Modal.open({
          key: Modal.key(),
          title: intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
          children: <SectionBidding {...sectionBiddingProps} />,
          closable: true,
          drawer: true,
          destroyOnClose: true,
          okText: intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
          onOk: async () => {
            const isPassValidate = await (remote?.event
              ? remote.event.fireEvent('sectionOpenBidValidate', {
                  sectionList: (this.sectionBidding.state || {}).checkedList || [],
                  rfxHeaderId,
                  record,
                })
              : true);
            if (!isPassValidate) return false;
            return !hasPasswordFlag
              ? this.openNoPasswordBidding(record, true)
              : this.openPasswordBidding(record, true);
          },
          onCancel: () => {
            this.sectionBidding = {};
          },
        });
      } else if (passwordFlag === 0) {
        this.openNoPasswordBidding(record);
      } else {
        this.openPasswordBidding(record);
      }
      this.openBidClick = false;
    };
    if (remote?.event) {
      remote.event.fireEvent('openBidFunc', {
        openBidFunc,
        bidFlag: this.bidFlag,
        rfxHeaderId: record.rfxHeaderId,
        record,
      });
    } else {
      openBidFunc();
    }
  }

  @Bind()
  showExpertModal() {
    this.setState({
      subAccountVisible: true,
    });
    this.clearBatchOpenBiddingModalData();
  }

  @Bind()
  async transfer(selectRow, otherParams = {}) {
    if (isEmpty(selectRow)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return;
    }
    const { currentRfxHeaderId } = this.state;
    const { organizationId } = this.props;
    const { checkedList = [] } = this.sectionBidding.state || {};
    const { id } = selectRow;
    let result;

    if (checkedList.length) {
      result = getResponse(
        await batchTransfer({
          organizationId,
          openUserId: id,
          rfxHeaderId: currentRfxHeaderId,
          projectLineSectionList: checkedList,
          ...otherParams,
        })
      );
    } else {
      result = getResponse(
        await transfer({ rfxHeaderId: currentRfxHeaderId, openDeliverUserId: id, ...otherParams })
      );
    }

    if (result && !result.failed) {
      this.setState({
        subAccountVisible: false,
      });
      this.allQuery();
      Modal.destroyAll();
    }
  }

  @Bind()
  closeTransferModal() {
    this.setState({
      subAccountVisible: false,
    });
  }

  /**
   * 点击操作
   */
  @Throttle(500)
  @Bind()
  async onOperateBidModel(record) {
    // 查询操作入口list数据
    const { organizationId, match, history, remote } = this.props;
    const { quoFeedBackLackSubmitLoading, serviceChargeFlag } = this.state;
    const {
      rfxStatus,
      rfxHeaderId,
      pretrialFlag,
      expertScoreType,
      projectLineSectionId,
      sourceCategory = 'RFQ',
    } = record;

    // 新开标功能开启
    if (this.getSecondOpenBidFlag(record)) {
      return this.handleNewBidOpening(record);
    }
    // 二开埋点 单标段 eppen 重写header
    const otherSingleModalProps = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_OPERATE_SINGLE_BID_MODEL',
          {},
          {
            record,
            bidFlag: this.bidFlag,
          }
        )
      : {};

    // ------------- add 分标段, 开标 ----------------
    if (projectLineSectionId) {
      const sourcingResDrawerProps = {
        rfxStatus,
        rfxHeaderId,
        pretrialFlag,
        expertScoreType,
        projectLineSectionId,
        onRef: (ref) => {
          this.sourcingResultDrawerRef = ref;
        },
      };
      return Modal.open({
        key: Modal.key(),
        drawer: true,
        title: remote
          ? remote.process(
              'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SOURCEING_RESULT_TITLE',
              intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
              { rfxStatus, documentTypeName: this.documentTypeName }
            )
          : intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
        children: this.bidFlag ? (
          <BidSourcingResultDrawer {...sourcingResDrawerProps} />
        ) : (
          <SourcingResultDrawer {...sourcingResDrawerProps} />
        ),
        closable: true,
        bodyStyle: { padding: 0 },
        style: { width: '1090px' },
        onOk: async () => {
          const onOk = async () => {
            // TODO 二开调试：打印确定按钮执行链路，调试完可删除
            /* eslint-disable no-console */
            console.log('[cux-开标] 点击确定(分标段)', {
              hasRef: !!this.sourcingResultDrawerRef,
              hasHandleSubmit: isFunction(this.sourcingResultDrawerRef?.handleSubmit),
              currentSelStatus: this.sourcingResultDrawerRef?.state?.currentSelStatus,
              rfxHeaderId,
              projectLineSectionId,
            });
            /* eslint-enable no-console */
            if (
              this.sourcingResultDrawerRef?.handleSubmit &&
              isFunction(this.sourcingResultDrawerRef.handleSubmit)
            ) {
              this.setState({
                quoFeedBackLackSubmitLoading: true,
              });
              try {
                await this.sourcingResultDrawerRef.handleSubmit();
                notification.success();
                Modal.destroyAll();
                this.allSearch();
              } catch {
                return false;
              } finally {
                this.setState({
                  quoFeedBackLackSubmitLoading: false,
                });
              }
            }
          };
          if (remote?.event) {
            return remote.event.fireEvent('handleOk', {
              onOk,
              sectionTagMap: this.sourcingResultDrawerRef?.state?.sectionTagMap,
              projectLineSectionList:
                this.sourcingResultDrawerRef?.state?.projectLineSectionList || [],
            });
          } else {
            return onOk();
          }
        },
        okProps: {
          loading: quoFeedBackLackSubmitLoading,
        },
        afterClose: () => {
          this.setState({
            quoFeedBackLackSubmitLoading: false,
          });
        },
        onCancel: () => this.allQuery(),
      });
    }

    // -------------------------------- 不分标段 ------------------
    const operationBidProps = {
      match,
      record,
      history,
      rfxStatus,
      organizationId,
      allQuery: this.allQuery,
      documentTypeName: this.documentTypeName,
      checkPriceName: this.checkPriceName,
      // sourceKey: this.sourceKey,
      onRef: (ref) => {
        this.sourcingResultDrawerRef = ref;
      },
      serviceChargeFlag,
      remote,
      inquiryCheckPrice: this.inquiryCheckPrice,
    };

    Modal.open({
      key: Modal.key(),
      title: remote
        ? remote.process(
            'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SOURCEING_RESULT_TITLE',
            intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
            { rfxStatus, documentTypeName: this.documentTypeName }
          )
        : intl.get(`ssrc.inquiryHall.view.message.title.openingBid`).d('开标'),
      children: this.renderOperateBid(operationBidProps),
      closable: true,
      drawer: true,
      style: { width: '1090px' },
      // onCancel: () => this.allQuery(),
      onOk: async () => {
        // TODO 二开调试：打印确定按钮执行链路，调试完可删除
        /* eslint-disable no-console */
        console.log('[cux-开标] 点击确定(不分标段)', {
          hasRef: !!this.sourcingResultDrawerRef,
          hasHandleSubmit: isFunction(this.sourcingResultDrawerRef?.handleSubmit),
          currentSelStatus: this.sourcingResultDrawerRef?.state?.currentSelStatus,
          sourceResultList: this.sourcingResultDrawerRef?.state?.sourceResultList,
          rfxHeaderId,
          projectLineSectionId: record.projectLineSectionId,
        });
        /* eslint-enable no-console */
        const isPassValidate = await (remote?.event
          ? remote.event.fireEvent('singleOpenBidValidate', {
              rfxHeaderId,
              currentSelStatus: this.sourcingResultDrawerRef?.state?.currentSelStatus || '',
              sourceCategory,
              sourcingResultDrawerRef: this.sourcingResultDrawerRef,
              bidFlag: this.bidFlag,
            })
          : true);
        if (!isPassValidate) return false;
        if (
          this.sourcingResultDrawerRef?.handleSubmit &&
          isFunction(this.sourcingResultDrawerRef.handleSubmit)
        ) {
          this.setState({
            quoFeedBackLackSubmitLoading: true,
          });
          try {
            await this.sourcingResultDrawerRef.handleSubmit();
          } catch {
            return false;
          } finally {
            this.setState({
              quoFeedBackLackSubmitLoading: false,
            });
          }
        } else {
          // 二开：拿不到弹框实例时不再静默关闭，提示后中断
          // eslint-disable-next-line no-console
          console.warn('[cux-开标] 未获取到开标弹框实例，未调用任何接口');
          notification.warning({
            message: intl
              .get('ssrc.inquiryHall.view.message.openBidNotReady')
              .d('开标弹框未准备完成，请重新打开后再操作'),
          });
          return false;
        }
      },
      okProps: {
        loading: quoFeedBackLackSubmitLoading,
      },
      ...(otherSingleModalProps || {}),
    });
  }

  /**
   * 渲染开标弹窗
   * @returns ReactDm
   * @protected 郑州地铁、永祥二开 禁止修改方法名
   */
  renderOperateBid = (operationBidProps = {}) => {
    return this.bidFlag ? (
      <BidOperationBidModal {...operationBidProps} />
    ) : (
      <OperationBid {...operationBidProps} />
    );
  };

  /**
   * 展示报价响应不足modal
   * @param {!Object} record - 行记录
   */
  @Throttle(500)
  @Bind()
  handleShowQuoFeedBackLackModal(record = {}) {
    const { organizationId, history, remote } = this.props;
    const { quoFeedBackLackSubmitLoading = false, serviceChargeFlag } = this.state;
    const {
      rfxStatus,
      rfxHeaderId,
      nextRfxStatus,
      projectLineSectionId,
      sourceCategory = 'RFQ',
      biddingFlag,
    } = record;
    const newBiddingFlag = this.isNewBiddingFlag({ sourceCategory, biddingFlag });

    // ------------- add 分标段, 报价相应不足 ----------------
    if (projectLineSectionId) {
      const sourcingResDrawerProps = {
        rfxStatus,
        rfxHeaderId,
        nextRfxStatus,
        bidFlag: this.bidFlag,
        projectLineSectionId,
        onRef: (ref) => {
          this.sourcingResultDrawerRef = ref;
        },
        sourceCategory,
        newBiddingFlag,
        record,
      };
      return Modal.open({
        key: Modal.key(),
        drawer: true,
        title: intl
          .get(`ssrc.inquiryHall.view.message.title.commonQuoFeedBackLack`, {
            quotationName: this.quotationName,
          })
          .d('{quotationName}响应不足'),
        bodyStyle: { padding: 0 },
        children: this.bidFlag ? (
          <BidSourcingResultDrawer {...sourcingResDrawerProps} />
        ) : (
          <SourcingResultDrawer {...sourcingResDrawerProps} />
        ),
        closable: true,
        style: { width: '1090px' },
        onOk: async () => {
          if (
            this.sourcingResultDrawerRef?.handleSubmit &&
            isFunction(this.sourcingResultDrawerRef.handleSubmit)
          ) {
            this.setState({
              quoFeedBackLackSubmitLoading: true,
            });
            try {
              const adjustTimeMappingRfxHeaderId = await this.sourcingResultDrawerRef.handleSubmit();
              if (!isNil(adjustTimeMappingRfxHeaderId)) {
                // 时间调整
                // 跳转页面 ---- 当存在“时间调整”优先跳转
                this.directControllerDetail({
                  rfxHeaderId: adjustTimeMappingRfxHeaderId,
                  projectLineSectionId,
                });
              } else {
                // 关闭弹窗刷新页面
                notification.success();
                Modal.destroyAll();
                this.allQuery();
              }
            } catch {
              return false;
            } finally {
              this.setState({
                quoFeedBackLackSubmitLoading: false,
              });
            }
          }
        },
        okProps: {
          loading: quoFeedBackLackSubmitLoading,
        },
        afterClose: () => {
          this.setState({
            quoFeedBackLackSubmitLoading: false,
          });
        },
        onCancel: () => {},
      });
    }

    // --------- 不分标段 ------------------
    const quoLackModalProps = {
      // match,
      record,
      history,
      organizationId,
      bidFlag: this.bidFlag,
      projectLineSectionId, // 多轮报价响应不足标识
      // customizeTableAlias: customizeTable,
      allQuery: this.allQuery,
      sourceName: this.sourceName,
      documentTypeName: this.documentTypeName,
      onRef: (ref) => {
        this.sourcingResultDrawerRef = ref;
      },
      remote,
      serviceChargeFlag,
      newBiddingFlag,
    };
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl
        .get(`ssrc.inquiryHall.view.message.title.commonQuoFeedBackLack`, {
          quotationName: this.quotationName,
        })
        .d('{quotationName}响应不足'),
      children: this.renderQuoFeedBackLackModal(quoLackModalProps),
      closable: true,
      style: { width: '742px' },
      onOk: () => {
        if (
          this.sourcingResultDrawerRef?.handleSubmit &&
          isFunction(this.sourcingResultDrawerRef.handleSubmit)
        ) {
          this.sourcingResultDrawerRef.handleSubmit();
        }
      },
      okProps: {
        loading: quoFeedBackLackSubmitLoading,
      },
      onCancel: () => {},
    });
  }

  /**
   * 报价响应不足modal
   * 单标段
   * cux
   */
  renderQuoFeedBackLackModal = (quoLackModalProps = {}) => {
    return this.bidFlag ? (
      <QuoFeedBackLackModalBid {...quoLackModalProps} />
    ) : (
      <QuoFeedBackLackModal {...quoLackModalProps} />
    );
  };

  /**
   * 展示报价响应情况
   * @param {*} record 行数据
   */
  @Bind()
  async showQuotationFeedback(record) {
    // const res = getResponse(await quotationFeedBack({organizationId, rfxHeaderId: record.get('rfxHeaderId')}));

    const showQuotationFeedbackTableProps = {
      rfxHeaderId: record.get('rfxHeaderId'),
    };

    Modal.open({
      key: Modal.key(),
      title: intl
        .get(`ssrc.inquiryHall.view.message.title.commonQuotationResponse`, {
          quotationName: this.quotationName,
        })
        .d('{quotationName}响应'),
      children: <ShowQuotationFeedbackTable {...showQuotationFeedbackTableProps} />,
      closable: true,
      style: { width: '850px' },
      onCancel: () => {},
      footer: (okBtn) => <div>{okBtn}</div>,
    });
  }

  // ***********************************************查询****************************************************

  @Bind()
  async queryCount() {
    const { organizationId, remote } = this.props;
    const { sourceProjectId } = this.props.allDS.getQueryParameter('advancedData') || {};
    const searchParams = this.SearchComponent?.getQueryParameter() || {};
    const multiRfxNumOrTitle = this.SearchComponent?.customizeDs?.current
      ?.get('multiRfxNumOrTitle')
      ?.join(',');
    const data = {
      organizationId,
      ...searchParams,
      sourceProjectId,
      multiRfxNumOrTitle,
      secondarySourceCategory: this.bidFlag ? 'NEW_BID' : null,
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`,
    };
    const tabsNumber = getResponse(await searchInquiryHallNumber(data));
    if (tabsNumber && !tabsNumber.failed) {
      const currentTabsNumber = remote
        ? await remote.process(
            'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_QUERYCOUNT_TABS_NUMBER',
            tabsNumber,
            {
              that: this,
              data,
            }
          )
        : tabsNumber;

      this.setState({
        tabsNumber: currentTabsNumber || {},
      });
    }
  }

  // 明细 获取筛选器数据
  getCurrentSearchBarParam = () => {
    const { organizationId } = this.props;

    const searchParams = this.SearchComponent?.getQueryParameter() || {};
    const multiRfxNumOrTitle = this.SearchComponent?.customizeDs?.current
      ?.get('multiRfxNumOrTitle')
      ?.join(',');

    const data = {
      organizationId,
      ...searchParams,
      multiRfxNumOrTitle,
      // secondarySourceCategory: this.bidFlag ? 'NEW_BID' : '',
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL.NEW_LIST.DETAIL_ALL_FILTER`,
    };

    return data;
  };

  // 查询明细下全部页数量
  @Bind()
  async countDetailLength() {
    const { organizationId, remote } = this.props;
    const searchParams = this.SearchComponent?.getQueryParameter() || {};
    const multiRfxNumOrTitle = this.SearchComponent?.customizeDs?.current
      ?.get('multiRfxNumOrTitle')
      ?.join(',');
    const data = {
      organizationId,
      ...searchParams,
      multiRfxNumOrTitle,
      secondarySourceCategory: this.bidFlag ? 'NEW_BID' : null,
      customizeUnitCode: `SSRC.${this.sourceKey}_HALL.NEW_LIST.DETAIL_ALL_FILTER`,
    };

    try {
      const detailCount = getResponse(
        await countDetailLength(
          remote
            ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_DETAIL_ALL_COUNT', data, {
                bidFlag: this.bidFlag,
              })
            : data
        )
      );
      if (detailCount) {
        this.setState({
          detailCount,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  async allSearch(mount, currentTabStatus) {
    const {
      onGoingDealDS = {},
      approvalDS = {},
      toBeReleasedDS = {},
      attentionDS = {},
      allDS = {},
      finishInquirySuccessDS = {},
      finishOthersDS = {},
      detailAllDS,
    } = this.props;
    const { tabStatus } = this.state;
    const isMount = mount === 'mount';

    switch (tabStatus || currentTabStatus) {
      case 'toBeReleased':
        this.changeTableToAggregationOrCommon();
        if (isMount) {
          toBeReleasedDS.query(toBeReleasedDS.currentPage || 0);
        } else {
          toBeReleasedDS.query();
        }
        break;
      case 'onGoing':
        this.changeTableToAggregationOrCommon();
        if (isMount) {
          approvalDS.query(approvalDS.currentPage || 0);
          onGoingDealDS.query(onGoingDealDS.currentPage || 0);
          attentionDS.query(attentionDS.currentPage || 0);
        } else {
          approvalDS.query();
          onGoingDealDS.query();
          attentionDS.query();
        }
        break;
      case 'finished':
        this.changeTableToAggregationOrCommon();
        if (isMount) {
          finishInquirySuccessDS.query(finishInquirySuccessDS.currentPage || 0);
          finishOthersDS.query(finishOthersDS.currentPage || 0);
        } else {
          finishInquirySuccessDS.query();
          finishOthersDS.query();
        }
        break;
      case 'all':
        this.changeTableToAggregationOrCommon();
        if (isMount) {
          allDS.query(allDS.currentPage || 0);
        } else {
          allDS.query();
        }
        break;
      case 'detailAll':
        this.changeTableToAggregationOrCommon();
        if (isMount) {
          detailAllDS.query(detailAllDS.currentPage || 0);
        } else {
          detailAllDS.query();
        }
        break;
      default:
        break;
    }

    if (tabStatus !== 'detailAll' && currentTabStatus !== 'detailAll') {
      this.queryCount();
    } else {
      this.countDetailLength();
    }
  }

  allSetQueryParameter(key, value) {
    const {
      onGoingDealDS,
      approvalDS,
      toBeReleasedDS,
      attentionDS,
      allDS,
      finishInquirySuccessDS,
      finishOthersDS,
      detailAllDS,
      remote,
    } = this.props;
    onGoingDealDS.setQueryParameter(key, value);
    approvalDS.setQueryParameter(key, value);
    toBeReleasedDS.setQueryParameter(key, value);
    attentionDS.setQueryParameter(key, value);
    allDS.setQueryParameter(key, value);
    finishInquirySuccessDS.setQueryParameter(key, value);
    finishOthersDS.setQueryParameter(key, value);
    detailAllDS.setQueryParameter(
      key,
      remote
        ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_QUERY_PARAMS', value, {
            bidFlag: this.bidFlag,
          })
        : value
    );
  }

  setCustomeCode() {
    const {
      onGoingDealDS,
      approvalDS,
      toBeReleasedDS,
      attentionDS,
      allDS,
      finishInquirySuccessDS,
      finishOthersDS,
      detailAllDS,
    } = this.props;
    const currentSourcekey = this.sourceKey;

    onGoingDealDS.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${this.sourceKey}_HALL.NEW_LIST.ONGOING,SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`
    );
    approvalDS.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${this.sourceKey}_HALL.NEW_LIST.APPROVAL,SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`
    );
    toBeReleasedDS.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${this.sourceKey}_HALL.NEW_LIST.WAIT_RELEASED,SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`
    );
    attentionDS.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${this.sourceKey}_HALL.NEW_LIST.NEEDATTENTION,SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`
    );
    allDS.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${this.sourceKey}_HALL.NEW_LIST.ALL,SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`
    );
    finishInquirySuccessDS.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${this.sourceKey}_HALL.NEW_LIST.FINISHED,SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`
    );
    finishOthersDS.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${this.sourceKey}_HALL.NEW_LIST.OTHERS,SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`
    );
    detailAllDS.setQueryParameter(
      'customizeUnitCode',
      `SSRC.${currentSourcekey}_HALL.NEW_LIST.DETAIL_ALL,SSRC.${currentSourcekey}_HALL.NEW_LIST.DETAIL_ALL_FILTER`
    );
  }

  /**
   * 格式化单号为数组
   */
  formatSearchNum = (val = '') => {
    let newNum = null;

    if (!val) {
      return newNum;
    }

    if (val.search(/,/g) !== -1) {
      newNum = val.split(',');
    } else {
      return [val];
    }

    newNum = newNum.filter(Boolean);
    return newNum;
  };

  /**
   * 查询
   * @param {*} param0 查询参数
   * @param {*} updateFlag 是否是第一次挂载
   */
  @Bind()
  async advancedSearch({ params }, mountFlag) {
    const { remote } = this.props;
    const queryParams = querystring.parse(this.props.location.search.substr(1));
    const {
      sourceProjectId,
      sourceProjectName,
      rfxStatus,
      clarifyAnswer,
      multiSourceNumOrTitle = '',
    } = queryParams;

    let newParams = params || {};

    newParams = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ADVANCEDSEARCH_ARGUMENT_PARAMS',
          newParams,
          {
            queryParams,
            that: this,
            mountFlag,
          }
        )
      : newParams;

    const { multiRfxNumOrTitle, ...others } = newParams || {};

    let currentMultiSourceNumOrTitle = multiRfxNumOrTitle;
    if (multiSourceNumOrTitle && mountFlag) {
      currentMultiSourceNumOrTitle = this.formatSearchNum(multiSourceNumOrTitle);
      await this.setMultiSourceNumOrTitleFromUrlIntoPage();
    }

    const sourceProjectIdExist =
      sourceProjectId && sourceProjectId !== 'null' && sourceProjectId !== 'undefined';
    if ((sourceProjectIdExist || rfxStatus || clarifyAnswer) && mountFlag) {
      this.SearchComponent.setField('sourceProjectId', {
        sourceProjectId,
        sourceProjectName,
      });
      this.SearchComponent.setField('rfxStatus', rfxStatus);
      if (clarifyAnswer) {
        if (
          this.SearchComponent?.state?.displayFields.filter((ele) => ele.name === 'clarifyAnswer')
            .length === 0
        ) {
          notification.warning({
            message: intl
              .get(`ssrc.common.view.message.filterMsg`)
              .d('需联系采购方将澄清未读配置为筛选条件后才能进行正常筛选'),
          });
        } else {
          this.SearchComponent.setField('clarifyAnswer', clarifyAnswer);
        }
      }
      this.allSetQueryParameter(
        'advancedData',
        filterNullValueObject({
          ...this.SearchComponent?.getQueryParameter(),
          multiRfxNumOrTitle: currentMultiSourceNumOrTitle?.length
            ? currentMultiSourceNumOrTitle.join(',')
            : null,
          secondarySourceCategory: this.bidFlag ? 'NEW_BID' : null,
          sourceProjectId,
          rfxStatus,
        })
      );
    } else {
      this.allSetQueryParameter('advancedData', {
        ...others,
        multiRfxNumOrTitle: currentMultiSourceNumOrTitle?.length
          ? currentMultiSourceNumOrTitle.join(',')
          : null,
        secondarySourceCategory: this.bidFlag ? 'NEW_BID' : null,
      });
    }
    this.setCustomeCode();
    this.allSearch(mountFlag && 'mount');
    // this.queryCount();
  }

  searchModal;

  /**
   * 点击弹框以后列表页重新查询
   */
  @Bind()
  allQuery() {
    const { allDS, onGoingDealDS } = this.props;
    allDS.query(this.props.allDS.currentPage);
    onGoingDealDS.query(this.props.onGoingDealDS.currentPage);
    this.forceUpdate();
  }

  // ***其他***

  projectApprovalModal;

  @Bind()
  async changeTab(current) {
    const { organizationId, userId, shareDS } = this.props;
    this.setState(
      {
        tabStatus: current,
        initTabFlag: false, // tab 已非初始化
      },
      () => {
        if (current !== 'detailAll' && this.SearchComponent) {
          this.allSearch('mount', current);
        }
      }
    );

    if (shareDS) {
      shareDS.setState('currentTabs', current);
    }

    if (current === 'detailAll') {
      // this.SearchComponent?.customizeDs
      const { customizeDs } = this.SearchComponent || {};
      // if (queryDs) {
      //   // queryDs.loadData();
      // }
      if (customizeDs) {
        customizeDs.loadData();
      }

      // 每次切回明细，都展示聚合表
      const { current: detailAllContainerCurrent = {} } = this.detailAllContainerRef || {};
      if (detailAllContainerCurrent?.handleAllAggregationChange) {
        detailAllContainerCurrent.handleAllAggregationChange(false);
      }

      await changeRfxDetailLayout({
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'tableDisplay',
        configKey: 'tableDisplay',
        configValue: 'flat',
      });
      this.setState({ tableDisplay: 'flat', changeTypeAggregation: false });
    }
  }

  @Throttle(500)
  @Bind()
  projectToInquiryOpen(payload = {}) {
    const {
      sourceRequest, // 来源于创建RFQ【ONLINE_SOURCING】还是整单线下【OFFLINE_ENTER】ps: 兼容二开，保留此方法弹框
    } = payload || {};
    const { remote } = this.props;
    const ProjectToInquiryProps = {
      history: this.props.history,
      bidFlag: this.bidFlag,
      onRef: (ref) => {
        this.projectApprovalModal = ref;
      },
      remote,
      location: this.props.location,
      sourceRequest,
      projectToWholeCreate: this.projectToWholeCreate,
    };
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title:
        sourceRequest === 'ONLINE_SOURCING'
          ? intl
              .get(`ssrc.inquiryHall.view.message.button.cpmmonProjAppInquiry`, {
                sourceCategoryName: this.sourceCategoryName,
              })
              .d(`立项转{sourceCategoryName}`)
          : intl.get('ssrc.inquiryHall.view.button.projectSetupToWholeEntry').d('立项转整单线下'),
      children: <ProjectToInquiry {...ProjectToInquiryProps} />,
      style: { width: '1090px' },
      bodyStyle: {
        maxHeight: 'calc(100vh - 1.12rem)',
      },
      onCancel: () => {},
      closable: true,
      okText: intl.get(`hzero.common.create`).d('创建'),
      onOk: () => this.createModalShow(payload),
    });
  }

  // projectApprovalToRFI;

  // 渲染立项转RFI/RFP，footer
  footer = observer(({ tableDs, templateDs, cancelBtn, type }) => {
    return (
      <div>
        {cancelBtn}
        <Lov
          noCache
          color="primary"
          mode="button"
          disabled={!tableDs?.selected?.length}
          clearButton={false}
          name="rfTemplateLov"
          dataSet={templateDs}
          modalProps={{
            onOk: () => this.handleToRF(type),
            onDoubleClick: () => this.handleToRF(type),
          }}
        >
          {intl.get(`hzero.common.create`).d('创建')}
        </Lov>
      </div>
    );
  });

  @Bind()
  projectToRFIOpen(type) {
    const { location } = this.props;
    const ProjectToRFIProps = {
      type,
      history: this.props.history,
      sourceKey: this.bidFlag ? 'NEW_BID' : null,
      location,
    };

    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get(`ssrc.common.view.message.title.projectTo${type}`).d(`立项转${type}`),
      children: <ProjectToRFI {...ProjectToRFIProps} />,
      style: { width: '742px', maxHeight: '585' },
      bodyStyle: {
        maxHeight: '585',
      },
      onCancel: () => {},
      closable: true,
      footer: null,
    });
  }

  createModal;

  @Throttle(500)
  @Bind()
  async createModalShow(payload = {}) {
    const {
      tableDS = {},
      state: { bidSectionDS = {} },
    } = this.projectApprovalModal;
    const { remote, organizationId, history } = this.props;
    const expandTableList = Object.values(bidSectionDS); // 所有子表标段的DS
    let allSeletedLength = 0; // 一共勾选的行列数
    const selectSectionLine = []; // 标段上的勾选行
    const selectProjectLine = []; // 父级无标段的勾选行
    if (expandTableList.length > 0) {
      expandTableList.forEach((expandDS) => {
        if (expandDS.selected.length > 0) {
          allSeletedLength += 1;
          expandDS.selected.forEach((select) => {
            selectSectionLine.push(select.toJSONData());
          });
        }
      });
    }
    if (tableDS.selected.length > 0) {
      tableDS.selected.forEach((select) => {
        allSeletedLength += 1;
        selectProjectLine.push(select.toJSONData());
      });
    }

    if (allSeletedLength < 1) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const allSelectLine = [...selectSectionLine, ...selectProjectLine]; // 全部勾选行
    const selectOneParentFlag = allSelectLine.every(
      (item) => item.sourceProjectId === allSelectLine[0].sourceProjectId
    );
    if (!selectOneParentFlag) {
      notification.warning({
        message: intl.get('ssrc.inquiryHall.model.inquiryHall.onlySelectOne').d('请只选择一行数据'),
      });
      return false;
    }

    let selectData = {};

    if (tableDS.selected.length > 0) {
      [selectData] = allSelectLine;
    } else {
      const selectParentData = tableDS.filter(
        (reocrd) => reocrd.get('sourceProjectId') === allSelectLine[0].sourceProjectId
      );
      selectData = {
        ...selectParentData[0].toJSONData(),
        projectLineSections: allSelectLine,
      };
    }

    const projectApprovalDataIds = this.projectApprovalModal?.tableDS?.toData();
    const curentSelectProject = projectApprovalDataIds.filter(
      (item) => item.sourceProjectId === allSelectLine[0].sourceProjectId
    )[0];

    if (curentSelectProject?.rfxHeaderId && payload?.sourceRequest !== 'OFFLINE_ENTER') {
      // 多标段立项转， 选择的询价单为资格预审,mergeType=SECTION
      const { preQualificationFlag = 0 } = curentSelectProject?.parentRfxHeaderLov || {};
      if (preQualificationFlag && allSelectLine?.length > 1) {
        selectData.mergeType = 'SECTION';
      }
      selectData.rfxHeaderId = curentSelectProject.rfxHeaderId;
      await this.fetchCreateInquiryReference(selectData);
      return false;
    } else {
      // Modal.open({
      //   key: Modal.key(),
      //   closable: true,
      //   title: intl
      //     .get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`)
      //     .d('选择寻源模板'),
      //   children: <CreateModal {...CreateModalProps} />,
      //   style: { width: '350px' },
      //   onCancel: () => {},
      //   onOk: () => this.createInquiry(selectData),
      //   footer: (okBtn) => okBtn,
      // });
      if (payload?.sourceRequest === 'OFFLINE_ENTER') {
        // 来源于立项转整单线下，兼容二开直接在此拦截
        await this.projectToWholeCreate(selectData);
        return false;
      }
      if (remote?.event) {
        const eventProps = {
          organizationId,
          history,
          selectData,
          distinguishUpdatePageUrl: this.distinguishUpdatePageUrl,
          openModal: this.openModal,
          bidFlag: this.bidFlag,
        };
        await remote.event.fireEvent('projectToInquiryOpenOkEvent', eventProps);
        // 参考fetchCreateInquiry方法进行二开
      } else {
        this.openModal(selectData);
      }
      return false;
    }
  }

  /**
   * 打开modal
   * @param {*} selectData - 勾选数据
   * @memberof 此方法被二开重写!!!
   * @protected 此方法被【永祥、还有啥之前的不清楚】二开！！！
   */
  @Bind
  openModal(selectData) {
    const { remote } = this.props;
    const CreateModalProps = {
      selectData,
      bidFlag: this.bidFlag,
      onRef: (ref) => {
        this.createModal = ref;
      },
      remote,
    };
    Modal.open({
      key: Modal.key(),
      drawer: true,
      closable: true,
      title: intl.get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`).d('选择寻源模板'),
      children: <CreateModal {...CreateModalProps} />,
      style: { width: '380px' },
      onCancel: () => {},
      onOk: () => this.createInquiry(selectData),
    });
  }

  /**
   * 选择寻源模板,申请转询价
   * @param params
   */
  @Bind()
  async createInquiry(selectData) {
    const validate = await this.createModal.templateDS.validate();
    if (!validate) return false;
    this.fetchCreateInquiry(selectData);
  }

  /**
   * @protected 二开埋点有调用
   */
  @Bind()
  async createModalInquiry(params = {}) {
    const {
      remote,
      dispatch,
      organizationId,
      location: { search = {} },
    } = this.props;
    const { current } = querystring.parse(search.substr(1));
    const { selected } = this.purchaseRequestDS;
    const selectedRowKeys = [];
    const selectedRows = [];

    if (!params || !params?.templateId) {
      return;
    }
    selected.map((item) => {
      selectedRowKeys.push(item.toData().prLineId);
      selectedRows.push(item.toData());
      return '';
    });
    let pathname;
    const standardPayload = {
      organizationId,
      prLineIdList: selectedRowKeys,
      prLineList: selectedRows,
      ...params,
      sourceFrom: 'DEMAND_POOL',
      sourceDocumentType: this.sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
      configCenterCode: 'SITE.SSRC.RFX_PURCHASE_MERGE_RULE',
    };
    const payload = remote
      ? remote.process('SSRC_INQUIRY_CREATE_APPLY_TO_INQUIRY_PROCESS_PARAMS', standardPayload, {
          that: this,
          standardPayload,
          bidFlag: this.bidFlag,
        })
      : standardPayload;
    const res = await dispatch({
      type: 'inquiryHall/createApplyToInquiry',
      payload,
    });
    if (res) {
      notification.success();
      this.setState({ createModalVisible: false });
      // 前置校验
      if (remote?.event) {
        const remoteRes = await remote.event.fireEvent('handleInquiryCreateBefore', {
          that: this,
          saveRes: res,
          bidFlag: this.bidFlag,
        });
        if (!remoteRes) return false;
      }
      const { rfxHeader } = res;
      const { rfxHeaderId, expertScoreType, sourceCategory, preQualificationFlag } = rfxHeader;
      const searchParam = {
        expertScoreType,
        sourceCategory,
        preQualificationFlag,
        current,
      };
      pathname = this.distinguishUpdatePageUrl({ rfxHeaderId });
      const searchProps = querystring.stringify(searchParam);
      dispatch(
        routerRedux.push({
          pathname,
          search: searchProps,
        })
      );
    }
  }

  @Bind()
  closCreateInquiryModal() {
    const { remote } = this.props;
    this.setState({ createModalVisible: false });
    if (remote?.event) {
      remote.event.fireEvent('handleInquiryCreateCancel', {
        that: this,
        bidFlag: this.bidFlag,
      });
    }
  }

  /**
   *
   * @param {*} selectData 立项转勾选数据
   * @returns
   * 立项转整单线下跳转
   */
  @Bind()
  async projectToWholeCreate(selectData) {
    const { organizationId, history } = this.props;
    if (isEmpty(selectData)) {
      return;
    }

    const response = getResponse(
      await projectToWholeCreate({
        organizationId,
        ...selectData,
      })
    );
    if (response && !response.failed) {
      notification.success();
      const { rfxHeaderId } = response;
      Modal.destroyAll();
      history.push({
        pathname: `/ssrc/new-inquiry-hall/whole-update/${rfxHeaderId}`,
      });
    }
  }

  @Bind()
  async fetchCreateInquiry(selectData) {
    const { organizationId, history } = this.props;
    const TemplateData = this.createModal?.templateDS?.current
      ? this.createModal?.templateDS?.current?.toJSONData()
      : null;
    if (isEmpty(TemplateData)) {
      return;
    }

    const response = getResponse(
      await sourcingCreate({
        organizationId,
        ...selectData,
        ...TemplateData,
      })
    );
    if (response && !response.failed) {
      notification.success();
      const { rfxHeaderId } = response;
      Modal.destroyAll();
      const url = this.distinguishUpdatePageUrl({ rfxHeaderId });
      history.push({
        pathname: url,
      });
    }
  }

  @Throttle(500)
  @Bind()
  async fetchCreateInquiryReference(selectData) {
    const { organizationId, history } = this.props;
    this.setState({
      controllerLoading: true,
    });
    const TemplateData = this.createModal?.templateDS?.current
      ? this.createModal?.templateDS?.current?.toJSONData()
      : null;

    const response = getResponse(
      await sourcingCreate({
        organizationId,
        ...selectData,
        ...TemplateData,
      })
    );
    if (response && !response.failed) {
      notification.success();
      const { rfxHeaderId } = response;
      Modal.destroyAll();
      const url = this.distinguishUpdatePageUrl({ rfxHeaderId });
      history.push({
        pathname: url,
      });
    } else {
      this.setState({
        controllerLoading: false,
      });
    }
  }

  @Bind()
  async handleCopyOk(record) {
    const { currentType } = this.state;
    const { history } = this.props;
    this.setState({
      controllerLoading: true,
    });
    const res = await historyCopy(record.toJSONData());
    this.setState({
      controllerLoading: false,
    });
    if (res && !res.failed) {
      history.push({
        pathname: `${getActiveTabKey()}/rf-update/${currentType}/${res.rfHeaderId}`,
      });
      return;
    }
    notification.error({
      message: res.message || '',
    });
    return false;
  }

  /**
   * 复制历史单据确定的回调
   * params 不要删，二开在用【大全】
   */
  @Bind()
  @Throttle(500)
  async copyHistoryOrderModal(record, params) {
    const { organizationId, history } = this.props;
    this.setState({
      controllerLoading: true,
    });
    const response = getResponse(
      await copyHistoryOrderModal({
        rfxHeaderId: record.get('rfxHeaderId'),
        organizationId,
        ...params,
      })
    );
    if (response) {
      const url = this.distinguishUpdatePageUrl(response);
      history.push({
        pathname: url,
      });
    } else {
      this.setState({
        controllerLoading: false,
      });
    }
  }

  @Bind()
  viewDetail({ record }, otherProps) {
    const { customizeTable } = this.props;
    const { rfxStatus, evaluateLeaderFlag, evaluateExperts, progresses, expertScoreType } =
      record?.get([
        'rfxStatus',
        'evaluateLeaderFlag',
        'evaluateExperts',
        'progresses',
        'expertScoreType',
      ]) || {};
    let mean;
    const detail = () => (
      <a onClick={() => this.renderFlatQutationInfo(record, customizeTable, otherProps)}>
        {intl.get('ssrc.inquiryHall.model.inquiryHall.view').d('查看')}
      </a>
    );
    switch (rfxStatus) {
      case 'OPENED':
      case 'OPEN_BID_PENDING':
        if (this.state.bidOpeningNewFlag && expertScoreType === 'ONLINE') {
          mean = scoreStepRender(progresses);
        } else {
          mean = detail();
        }
        break;
      case 'SCORING':
        if (Number(evaluateLeaderFlag) === 1 && evaluateExperts) {
          mean = detail();
        } else {
          mean = scoreStepRender(progresses);
        }
        break;
      case 'PAUSED':
        mean = (
          <Tag color="yellow">
            {intl.get('ssrc.inquiryHall.model.inquiryHall.pause').d('暂停中')}
          </Tag>
        );
        break;
      case 'RELEASE_APPROVING': // 发布审批中
      case 'PRE_EVALUATION_APPROVING': // 中标候选人审批中
      case 'CHECK_APPROVING': // 	核价审批中
      case 'RELEASE_REJECTED': // 	发布审批拒绝
      case 'CHECK_REJECTED': // 核价审批拒绝
      case 'PRE_EVALUATION_PENDING_REJECT': // 中标候选人拒绝
        mean = approveExecutiveRender({ record });
        break;
      case 'NEW': // 新建
      case 'ROUNDED': // 再次询价
      case 'CLOSED': // 关闭
      case 'CANCELED': // 取消
        mean = '';
        break;
      default:
        mean = detail();
        break;
    }
    return mean;
  }

  @Bind()
  viewDetailRF({ record }) {
    const { displayRfStatus, evaluateExperts, scoreProgresses } =
      record.get(['displayRfStatus', 'evaluateExperts', 'scoreProgresses']) || {};

    let mean;
    const detail = () => (
      <a onClick={() => this.renderFlatReplyInfo(record)}>
        {intl.get('ssrc.inquiryHall.model.inquiryHall.view').d('查看')}
      </a>
    );

    const descriptionRender = () => {
      return (
        <div className={Style.descriptionRender}>
          <div>
            <span className="multiLineLabel">
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.closeReason`).d('关闭理由')}
            </span>
            {record.get('closeRemark')}
          </div>
        </div>
      );
    };
    switch (displayRfStatus) {
      case 'SCORING':
      case 'SCORE_SUMMARY_PENDING': // 待评分汇总
      case 'CONFIRM_CANDIDATES_PENDING': // 待定候选人
        if (evaluateExperts) {
          mean = detail();
        } else {
          mean = scoreStepRender(scoreProgresses);
        }
        break;
      case 'RELEASE_REJECTED': // 发布审批拒绝
      case 'CHECK_REJECTED': // 结果审批拒绝
      case 'RELEASE_APPROVING': // 发布审批中
      case 'CHECK_APPROVING': // 	结果审批中
        mean = approveExecutiveRFRender(record);
        break;
      case 'NEW': // 新建
      case 'CANCELED': // 取消
        mean = '-';
        break;
      case 'CLOSED':
        mean = descriptionRender({ record });
        break;
      default:
        mean = detail();
        break;
    }
    return mean;
  }

  @Bind()
  renderFlatReplyInfo(record) {
    const {
      displayRfStatus,
      headerQuotationDetails,
      evaluateLeaderFlag, // 评分负责人
      evaluateExperts, // 评分情况
    } =
      record.get([
        'displayRfStatus',
        'headerQuotationDetails',
        'evaluateLeaderFlag', // 评分负责人
        'evaluateExperts', // 评分情况
      ]) || {};
    const renderSubmitInfo = () => {
      const submitInfoColumns = [
        {
          name: 'feedbackStatusMeaning',
          width: 130,
          renderer: ({ record: rfRecord, value }) => {
            return rfFeedBackStatusRender(rfRecord.get('feedbackStatus'), value);
          },
        },
        {
          name: 'supplierCompanyNum',
          width: 130,
        },
        {
          name: 'supplierCompanyName',
          width: 200,
          renderer: (item) => <Popover content={item.value}> {item.value} </Popover>,
        },

        // todo 暂时不做有空处理
        // {
        //   name: 'attachmentFlag',
        //   width: 90,
        //   align: 'left',
        //   renderer: (item) =>
        //     item.record.get('attachmentFlag') ? (
        //       <img src={require('@/assets/attachment.svg')} alt="" />
        //     ) : (
        //       ''
        //     ),
        // },
      ];
      this.replySupplierDs.loadData([...headerQuotationDetails]);
      return (
        <Table
          dataSet={this.replySupplierDs}
          columns={submitInfoColumns}
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          customizedCode="SSRC.NEW_INQUIRY_HALL.LIST.RF_SUBMIT_INFO"
        />
      );
    };
    const renderScoredInfo = () => {
      const scoreInfoColumns = [
        {
          name: 'scoredStatusMeaning',
          width: 200,
        },
        {
          name: 'loginName',
          width: 120,
        },
        {
          name: 'expertName',
          width: 180,
        },
      ];
      this.scoreRfDs.loadData([...evaluateExperts]);
      return (
        <Table
          dataSet={this.scoreRfDs}
          columns={scoreInfoColumns}
          customizedCode="SSRC.NEW_INQUIRY_HALL.LIST.RF_LINE_SCORED_INFO"
        />
      );
    };

    let mean = '';
    switch (displayRfStatus) {
      case 'NOT_START': // 未开始
        mean = renderSubmitInfo();
        break;
      case 'IN_QUOTATION':
      case 'LACK_QUOTED':
      case 'CHECK_PENDING':
      case 'FINISHED':
        mean = renderSubmitInfo();
        break;
      case 'SCORING': // 评分中
      case 'SCORE_SUMMARY_PENDING': // 待评分汇总
      case 'CONFIRM_CANDIDATES_PENDING': // 待定候选人
        if (Number(evaluateLeaderFlag) === 1 && evaluateExperts) {
          mean = renderScoredInfo(evaluateExperts);
        }
        break;
      default:
        break;
    }

    Modal.open({
      destroyOnClose: true,
      key: 1,
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
      children: mean,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      footer: (_, cancelBtn) => <div>{cancelBtn}</div>,
    });
  }

  /**
   * 展开状态下的执行情况渲染
   * @param {*} record 行信息
   */
  @Bind()
  renderFlatQutationInfo(record, customizeTable, otherProps) {
    const { remote } = this.props;
    const { roundQuotationExecuteFlag } = this.state;
    const {
      rfxStatus,
      approvalMessage,
      evaluateLeaderFlag, // 评分负责人
      evaluateExperts, // 评分情况
      bargainStatus, // 议价状态
      bargainEndDate, // 议价结束时间
      sourceMethod,
      prequalMemberFlag,
      currentSequenceNum,
      rfxHeaderId,
      quotationRoundNumber,
    } =
      record?.get([
        'rfxStatus',
        'approvalMessage',
        'evaluateLeaderFlag', // 评分负责人
        'evaluateExperts', // 评分情况
        'bargainStatus', // 议价状态
        'bargainEndDate', // 议价结束时间
        'sourceMethod',
        'prequalMemberFlag',
        'currentSequenceNum',
        'rfxHeaderId',
        'quotationRoundNumber',
      ]) || {};

    const barginFlag =
      (bargainStatus === 'BARGAINING_ONLINE' || bargainStatus === 'BARGAINING_OFFLINE') &&
      moment().isBefore(bargainEndDate);
    const params = {
      prequalMemberFlag,
      bargainStatus,
      bargainEndDate,
      rfxStatus,
      evaluateLeaderFlag,
      currentSequenceNum,
      rfxHeaderId,
      customizeUnitCode:
        rfxStatus === 'FINISHED'
          ? `SSRC.${this.sourceKey}_HALL.NEW_LIST.BIDDING_TABLE`
          : `SSRC.${this.sourceKey}_HALL.NEW_LIST.EXECUTE_TABLE`,
    };
    const quotationInfoProps = {
      barginFlag,
      sourceMethod,
      customizeTable,
      params,
      remote,
      record,
      ...(otherProps || {}),
    };
    const renderRefuseReson = () => {
      return (
        <div>
          {approveExecutiveRender({ record })}
          <span className="multiLineLabel">
            {intl.get('ssrc.inquiryHall.model.inquiryHall.approvalMessage').d('拒绝理由')}：
          </span>
          <Popover content={approvalMessage}>{approvalMessage}</Popover>
        </div>
      );
    };
    const renderSubmitInfo = () => {
      // 标准columns
      const submitInfoColumns = [
        {
          name: 'supplierCompanyNum',
          width: 130,
        },
        {
          name: 'supplierCompanyName',
          width: 200,
          renderer: (item) => <Popover content={item.value}> {item.value} </Popover>,
        },
        {
          name: 'displayPreSupplerStatusMeaning',
          width: 130,
        },
        {
          name: 'attachmentFlag',
          width: 90,
          align: 'left',
          renderer: (item) =>
            item.record.get('attachmentFlag') ? (
              <img src={require('@/assets/attachment.svg')} alt="" />
            ) : (
              ''
            ),
        },
      ];

      this.submitInfo.setQueryParameter('params', params);
      this.submitInfo.query();
      return (
        <Table
          dataSet={this.submitInfo}
          columns={submitInfoColumns}
          style={{ maxHeight: 'calc(100vh - 160px)' }}
        />
      );
    };
    const renderScoredInfo = () => {
      const scoreInfoColumns = [
        {
          name: 'loginName',
          width: 120,
        },
        {
          name: 'expertName',
          width: 180,
        },
        {
          name: 'scoredStatusMeaning',
          width: 200,
        },
      ];
      this.scoreInfo.setQueryParameter('params', params);
      this.scoreInfo.query();
      return (
        <Table
          dataSet={this.scoreInfo}
          columns={scoreInfoColumns}
          style={{ maxHeight: 'calc(100vh - 160px)' }}
        />
      );
    };

    const renderBidInfo = () => {
      const bidInfoColumns = [
        {
          name: 'supplierCompanyNum',
          width: 130,
        },
        {
          name: 'supplierCompanyName',
          width: 200,
          renderer: (item) => <Popover content={item.value}> {item.value} </Popover>,
        },
        {
          name: 'biddingAmount',
          width: 130,
          align: 'right',
          renderer: ({ value }) => numberSeparatorRender(value),
        },
        {
          name: 'currencyCode',
          width: 100,
        },
      ];
      this.bidInfo.setQueryParameter('params', params);
      this.bidInfo.query();
      return customizeTable(
        { code: `SSRC.${this.sourceKey}_HALL.NEW_LIST.BIDDING_TABLE` },
        <Table
          dataSet={this.bidInfo}
          columns={bidInfoColumns}
          style={{ maxHeight: 'calc(100vh - 160px)' }}
        />
      );
    };

    let mean = '';
    switch (rfxStatus) {
      case 'RELEASE_REJECTED':
      case 'PRE_EVALUATION_PENDING_REJECT':
        mean = renderRefuseReson();
        break;
      case 'PENDING_PREQUAL': // 待预审审批
      case 'IN_PREQUAL': // 资格预审中
        mean = renderSubmitInfo();
        break;
      case 'NOT_START': // 未开始
        mean = this.renderQuotationInfo({ status: 'NOT_START', ...quotationInfoProps });
        break;
      case 'IN_QUOTATION':
      case 'LACK_QUOTED':
      case 'OPEN_BID_PENDING':
      case 'OPENED':
      case 'PRETRIAL_PENDING':
      case 'CHECK_PENDING':
      case 'ROUND_QUOTATION': // 多轮报价
        mean = this.renderQuotationInfo(quotationInfoProps);

        // 多轮报价，配置表白名单了再使用新的
        if (rfxStatus === 'ROUND_QUOTATION' && roundQuotationExecuteFlag === 1) {
          mean = (
            <RoundQuotationModals
              lineRecord={record}
              barginFlag={barginFlag}
              sourceKey={this.sourceKey}
              rfxHeaderId={rfxHeaderId}
              customizeTable={customizeTable}
              quotationRoundNumber={quotationRoundNumber}
              customizedCode={`SSRC.${this.sourceKey}_HALL.NEW_LIST.EXECUTE_TABLE`}
            />
          );
        }
        break;
      case 'SCORING': // 评分中
        if (Number(evaluateLeaderFlag) === 1 && evaluateExperts) {
          mean = renderScoredInfo(evaluateExperts);
        }
        break;
      case 'PAUSED':
        mean = intl.get('ssrc.inquiryHall.model.inquiryHall.pause').d('暂停中');
        break;
      case 'FINISHED':
        mean = renderBidInfo();
        break;
      default:
        break;
    }

    if (barginFlag) {
      mean = this.renderQuotationInfo(quotationInfoProps);
    }

    Modal.open({
      destroyOnClose: true,
      key: Modal.key(),
      title:
        rfxStatus === 'FINISHED'
          ? intl.get('ssrc.inquiryHall.model.inquiryHall.winBidSituation').d('中标情况')
          : intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
      children: mean,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      footer: (_, cancelBtn) => <div>{cancelBtn}</div>,
    });
  }

  /**
   * 提取执行情况中报价信息情况方法
   * @protected 永祥二开，禁止随意修改方法名
   */
  renderQuotationInfo = (info = {}) => {
    const {
      params,
      customizeTable = noop,
      status = '',
      barginFlag,
      sourceMethod,
      remote,
      record: lineRecord,
    } = info;
    const {
      sourceCategory,
      biddingFlag, // 竞价大厅-竞价标识
      biddingTarget, // 竞价对象
      rfxStatus,
    } = lineRecord?.get(['sourceCategory', 'biddingFlag', 'biddingTarget', 'rfxStatus']);
    // 竞价大厅-竞价单标识
    const newBiddingFlag = this.isNewBiddingFlag({ sourceCategory, biddingFlag });
    // 竞价大厅供应商状态显示 【新竞价单 & 未开始状态】 ｜ 【新竞价单 & (报价中 | 报价响应不足) & 总价竞价】
    const supBiddingStatusFlag =
      newBiddingFlag &&
      (rfxStatus === 'NOT_START' ||
        ((rfxStatus === 'IN_QUOTATION' || rfxStatus === 'LACK_QUOTED') &&
          biddingTarget === 'TOTAL_PRICE'));
    const preQuotationInfoColumns = [
      {
        name: 'supplierCompanyNum',
        width: 130,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
        renderer: (item) => <Popover content={item.value}> {item.value} </Popover>,
      },
      {
        name: 'status',
        width: 130,
        renderer: (item) => {
          const curRecord = item.record;
          const {
            quotedCount,
            feedbackStatusMeaning,
            feedbackStatus,
            supplierStatus,
            supplierStatusMeaning,
            supBiddingStatusMeaning, // 供应商竞价状态(竞价大厅专用字段-未开始时区分签到、试竞价，竞价开始后与其他状态一样
            assignItemCountConcatQuotedCount,
          } = curRecord.get([
            'quotedCount',
            'feedbackStatusMeaning',
            'feedbackStatus',
            'supplierStatus',
            'supplierStatusMeaning',
            'supBiddingStatusMeaning',
            'assignItemCountConcatQuotedCount',
          ]);
          if (supBiddingStatusFlag) {
            return supBiddingStatusMeaning;
          }

          let countNum = assignItemCountConcatQuotedCount ?? quotedCount;
          countNum = countNum ?? '-';

          return status !== 'NOT_START' ? (
            barginFlag ? (
              <div className="qutationLine">
                {`${intl
                  .get('ssrc.inquiryHall.model.inquiryHall.reply')
                  .d('回复')} ${countNum} ${intl
                  .get('ssrc.inquiryHall.model.inquiryHall.line')
                  .d('行')}`}
              </div>
            ) : feedbackStatus === 'ABANDONED' ? (
              abandonRemarkRender({ val: feedbackStatusMeaning, record: curRecord })
            ) : (
              <div className="qutationLine">
                {supplierStatus === 'ABANDONED' || supplierStatus === 'QUOTATION_ABANDONED'
                  ? supplierQuotaitonAbandanRenderStatus({
                      val: supplierStatusMeaning,
                      record: curRecord,
                    })
                  : `${this.quotationName} ${countNum} ${intl
                      .get('ssrc.inquiryHall.model.inquiryHall.line')
                      .d('行')}`}
              </div>
            )
          ) : (
            <div className="qutationLine">{sourceMethod === 'INVITE' && feedbackStatusMeaning}</div>
          );
        },
      },
      {
        name: 'attachmentFlag',
        width: 120,
        align: 'left',
        renderer: ({ value = 0 }) => yesOrNoRender(value),
      },
      {
        name: 'attachmentLineFlag',
        width: 120,
        align: 'left',
        renderer: ({ value = 0 }) => yesOrNoRender(value),
      },
    ];
    this.quotationInfo.setQueryParameter('params', params);
    this.quotationInfo.query();
    // 埋点后的
    const quotationInfoColumns = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_QUOTATION_COLUMNS',
          preQuotationInfoColumns,
          { ...info }
        )
      : preQuotationInfoColumns;
    return customizeTable(
      { code: `SSRC.${this.sourceKey}_HALL.NEW_LIST.EXECUTE_TABLE` },
      <Table
        dataSet={this.quotationInfo}
        columns={quotationInfoColumns}
        style={{
          maxHeight: 'calc(100vh - 2.5rem)',
        }}
      />
    );
  };

  /**
   * @description: 跳转寻源问题链接
   * @param {*}
   */
  directSourcingProblem = (record) => {
    const {
      history,
      location: { pathname },
    } = this.props;
    const search = querystring.stringify({
      quotationHeaderId: record.get('quotationHeaderId'),
      sourceFrom: record.get('sourceCategory'),
      fromFlag: 1,
      sourceHeaderId: record.get('rfHeaderId'),
      // title: `${record.get('rfNum')}-${record.get('rfTitle')}`,
      backPath: `${pathname}?sourceCategory=${record.get('sourceCategory')}`,
      sourceStatus: record.get('dbStatus'),
      clarifyNotifyType: 'SOURCE',
      issueFrom: 'SOURCE',
    });
    const routerPrefix = pathname.split('/')[2];
    const url = `/ssrc/${routerPrefix}/source-review-clarification`;
    history.push({
      pathname: url,
      search,
    });
  };

  statusMap = {
    RFI: intl.get('ssrc.inquiryHall.model.inquiryHall.RFI').d('信息征询书(RFI)'),
    RFP: intl.get('ssrc.inquiryHall.model.inquiryHall.rfp').d('方案征询书(RFP)'),
    RFQ: intl.get('ssrc.inquiryHall.model.inquiryHall.RFQ').d('报价邀请书(RFQ)'),
  };

  @Bind()
  async changeInquiryType(currentType) {
    const { organizationId, userId, location, dispatch } = this.props;
    getResponse(
      await changeRfxDetailLayout({
        ...(this.state.currentTypeObj || {}),
        organizationId,
        userId,
        enabledFlag: 1,
        configDesc: 'currentType',
        configKey: 'currentType',
        configValue: currentType,
      })
    );
    this.setState({
      currentType,
    });
    const queryParams = querystring.parse(location.search.substr(1));
    if (queryParams.rfxStatus) {
      delete queryParams.rfxStatus;
      dispatch(
        routerRedux.replace({
          pathname: location.pathname,
          search: querystring.stringify(queryParams),
        })
      );
    }
    this.changeTableToAggregationOrCommon();

    // 切回寻源，需要在整单下
    if (currentType === 'RFQ') {
      const memory = getResponse(
        await fetchRfxDetailLayout({
          organizationId,
          userId,
          enabledFlag: 1,
          configDesc: 'inquiryHallStage',
          configKey: 'inquiryHallStage',
        })
      );
      if (memory && memory.configValue) {
        this.setState({ tabStatus: memory.configValue });
      }
    }
  }

  @Bind()
  getSearch(ref) {
    this.SearchComponent = ref;
  }

  /**
   * 获取当前tab的active key
   * 主要处理采购员工作台
   */
  getCurrentTabActiveKey = () => {
    const { location } = this.props;
    const tabKey = getJumpRoutePrefixUrl(location.pathname) || getActiveTabKey();

    return tabKey;
  };

  /**
   * 创建 RFI/RFP
   * @param {*} type 类型
   */
  @Bind()
  @Debounce(500)
  async createRF(type) {
    const { organizationId, history } = this.props;
    let templateId;
    if (type === 'RFI') {
      // 单选 和 双击
      templateId =
        this.rfiTemplateDs.current
          ?.getField('rfTemplateLov')
          ?.options?.current?.get('templateId') || this.rfiTemplateDs.get(0).get('templateId');
    } else if (type === 'RFP') {
      templateId =
        this.rfpTemplateDs.current
          ?.getField('rfTemplateLov')
          ?.options?.current?.get('templateId') || this.rfpTemplateDs.get(0).get('templateId');
    }

    if (templateId) {
      return createRF({ sourceCategory: type, organizationId, templateId }).then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          history.push({
            pathname: `${this.getCurrentTabActiveKey()}/rf-update/${type}/${res.rfHeaderId}`,
          });
        }
      });
    } else {
      // 没有模板，点弹框确定，不关闭弹框
      return false;
    }
  }

  SearchComponent = null;

  distinguishDetailPageUrl = (rfxHeaderId = null) => {
    const { sourceKey } = this.props;
    let url = `/ssrc/new-inquiry-hall/rfx-detail/${rfxHeaderId}`;
    if (sourceKey === 'BID') {
      url = `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`;
    }
    return url;
  };

  // 区分 寻源维护 | 招标维护
  distinguishUpdatePageUrl = (record = {}) => {
    const { sourceKey } = this.props;
    const { rfxHeaderId = null } = record;
    if (record?.sourceRequest === 'OFFLINE_ENTER') {
      // 整单线下
      return `/ssrc/new-inquiry-hall/whole-update/${rfxHeaderId}`;
    }
    let url = `/ssrc/new-inquiry-hall/rfx-update-new/${rfxHeaderId}`;
    if (sourceKey === 'BID') {
      url = `/ssrc/new-bid-hall/bid-update/${rfxHeaderId}`;
    }

    return url;
  };

  /**
   * 进行中 折叠面板
   */
  @Debounce(500)
  changeOnGoingCollapseKey = (key) => {
    this.setState({
      onGoingCollapseKey: key,
    });

    // 同时保存用户记忆
    const params = {
      configKey: 'onGoingCollapseKeyRFQ',
      configDesc: 'onGoingCollapseKeyRFQ',
      configValue: key.join() || '',
      onGoingCollapseKey: null,
    };
    this.saveUserMemory('onGoingCollapseKeyUserConfigObj', params);
  };

  /**
   * 全部下 折叠面板
   */
  @Debounce(500)
  changeFinishCollapseKey = (key) => {
    this.setState({
      finishCollapseKey: key,
    });

    // 同时保存用户记忆
    const params = {
      configKey: 'finishCollapseKeyRFQ',
      configDesc: 'finishCollapseKeyRFQ',
      configValue: key.join() || '',
      finishCollapseKey: null,
    };
    this.saveUserMemory('finishCollapseKeyUserConfigObj', params);
  };

  @Bind()
  renderSourceCategoryMeaning({ record }) {
    return this.bidFlag
      ? record.get('secondarySourceCategoryMeaning')
      : record.get('sourceCategoryMeaning');
  }

  @Bind()
  getButtons(useRF, tabStatus, currentType, CheckPermissionObject) {
    const { useRFContent = 'ALL', projectOldUIFlag, offlineWholeFlag } = this.state;
    const {
      organizationId,
      match: { path },
      remote,
      finishOthersDS,
      detailAllDS,
      allDS,
    } = this.props;
    const CommonParamObj = {};
    if (this.bidFlag) {
      CommonParamObj.secondarySourceCategory = 'NEW_BID'; // RFX不传该参数
    }
    const excelExportQueryParams = filterNullValueObject({
      ...this.SearchComponent?.getQueryParameter(),
      ...CommonParamObj,
      multiRfxNumOrTitle: this.SearchComponent?.customizeDs?.current
        ?.get('multiRfxNumOrTitle')
        ?.join(','),
    });
    const iconStyle = {
      marginTop: '-2px',
      marginLeft: '4px',
      fontSize: '16px',
    };

    // 全部页签下显示的导出按钮
    const getExportButtons = ({
      isShowBtnFlag,
      oldName,
      newName,
      requestUrl,
      queryParams,
      templateCode,
      permissionCode,
    }) => {
      return isShowBtnFlag
        ? [
            {
              // 老导出
              name: oldName,
              btnComp: ExcelExport,
              // templateCode: "SSRC_PROJECT_EXPORT",
              btnProps: {
                requestUrl,
                queryParams,
                otherButtonProps: {
                  type: 'c7n-pro',
                  funcType: 'flat',
                  icon: 'unarchive',
                },
              },
            },
            {
              // 新导出
              name: newName,
              btnComp: ExcelExportNew,
              btnProps: {
                requestUrl,
                queryParams,
                templateCode,
                buttonText: `${intl.get('hzero.common.export.new').d('(新)导出')}`,
                otherButtonProps: {
                  permissionList: [
                    {
                      code: permissionCode,
                      type: 'button',
                      meaning: `${
                        intl
                          .get(`ssrc.inquiryHall.view.message.title.commonInquiryHall`, {
                            sourceCategoryName: this.sourceCategoryName,
                          })
                          .d('{sourceCategoryName}工作台') -
                        intl.get(`ssrc.common.button.batchExport`).d('导出')
                      }${intl.get('ssrc.common.view.new').d('新')}`,
                    },
                  ],
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  funcType: 'flat',
                },
              },
            },
          ]
        : [];
    };

    const isBidPath = path === '/ssrc/new-bid-hall/list'; // 根据路由去判断，如果根据useRF去判断可能在用户在询价工作台和招标工作台来回切情况下有问题

    const getDetailAllSearchBar = () => {
      const detailAllSearchBar = this.getCurrentSearchBarParam();

      return {
        ...detailAllSearchBar,
        ...CommonParamObj,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.NEW_LIST.DETAIL_ALL,SSRC.${this.sourceKey}_HALL.NEW_LIST.DETAIL_ALL_FILTER`,
      };
    };

    const buttons = [
      tabStatus === 'detailAll' && currentType === 'RFQ'
        ? {
            name: 'detailAllExport',
            btnComp: ExcelExportNew,
            btnProps: {
              requestUrl: !this.bidFlag
                ? `/ssrc/v2/${organizationId}/rfx/all/item/excel-rfq`
                : `/ssrc/v2/${organizationId}/rfx/all/item/excel-new-bid`,
              queryParams: getDetailAllSearchBar,
              templateCode: 'SRM_C_SRM_SSRC_RFX_HEADER_ITEM_EXPORT',
              buttonText: `${intl.get('hzero.common.export.new').d('(新)导出')}`,
              otherButtonProps: {
                permissionList: [
                  {
                    code: `${path}.button.rfq-item-all-export`.toLowerCase(),
                    type: 'button',
                    meaning: `${
                      intl
                        .get(`ssrc.inquiryHall.view.message.title.commonInquiryHall`, {
                          sourceCategoryName: this.sourceCategoryName,
                        })
                        .d('{sourceCategoryName}工作台') -
                      intl.get(`ssrc.common.button.batchExport`).d('导出')
                    }${intl.get('ssrc.common.view.new').d('新')}`,
                  },
                ],
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
              },
            },
          }
        : null,
      ...getExportButtons({
        isShowBtnFlag:
          (tabStatus === 'all' && currentType === 'RFQ') || (tabStatus === 'all' && isBidPath),
        oldName: 'excelExport',
        newName: 'newExcelExport',
        requestUrl: `/ssrc/v2/${organizationId}/rfx/all/excel-${isBidPath ? 'new-bid' : 'rfq'}`,
        queryParams: {
          ...excelExportQueryParams,
          customizeUnitCode: `SSRC.${this.sourceKey}_HALL.NEW_LIST.ALL,SSRC.${this.sourceKey}_HALL.NEW_LIST.FILTER_BAR`,
        },
        templateCode: 'SRM_C_SRM_SSRC_RFX_HEADER_EXPORT',
        permissionCode: isBidPath
          ? `${path}.button.bid-new-export`.toLowerCase()
          : `${path}.button.rfq-new-export`.toLowerCase(),
      }),
      ...getExportButtons({
        isShowBtnFlag: this.RFIContainerCurrentTab === 'all' && currentType === 'RFI' && !isBidPath,
        oldName: 'excelExportRFI',
        newName: 'newExcelExportRFI',
        requestUrl: `/ssrc/v1/${organizationId}/rf/list/all/export-rfi`,
        queryParams: {
          ...this.RFParams,
          sourceCategory: 'RFI',
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_LIST.${currentType},SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FILTER_BAR`,
        },
        templateCode: 'SSRC_RF_LIST_EXPORT',
        permissionCode: `${path}.button.rfi-new-export`.toLowerCase(),
      }),
      ...getExportButtons({
        isShowBtnFlag: this.RFIContainerCurrentTab === 'all' && currentType === 'RFP' && !isBidPath,
        oldName: 'excelExportRFP',
        newName: 'newExcelExportRFP',
        requestUrl: `/ssrc/v1/${organizationId}/rf/list/all/export-rfp`,
        queryParams: {
          ...this.RFParams,
          sourceCategory: 'RFP',
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_LIST.${currentType},SSRC.INQUIRY_HALL.RF_LIST.${currentType}_FILTER_BAR`,
        },
        templateCode: 'SSRC_RF_LIST_EXPORT',
        permissionCode: `${path}.button.rfp-new-export`.toLowerCase(),
      }),
      {
        name: 'creatRFXManually',
        group: true,
        children: [
          {
            name: 'inquiryRFQCreate',
            btnType: 'c7n-pro',
            child: (fieldName = '') =>
              customPermissionButton({
                display:
                  fieldName ||
                  `${
                    this.bidFlag
                      ? intl
                          .get(`ssrc.inquiryHall.view.message.button.bidCreatManually`)
                          .d(`手工新建BID`)
                      : intl
                          .get(`ssrc.inquiryHall.view.message.button.rfqCreatManually`)
                          .d(`手工新建RFQ`)
                  }`,
                onClick: () => {
                  if (remote?.event) {
                    remote.event.fireEvent('inquiryCreateManually', {
                      inquiryCreate: this.inquiryCreate,
                      goOffline: this.goOffline,
                      bidFlag: this.bidFlag,
                    });
                  }
                },
                ...CheckPermissionObject?.create,
              }),
          },
          {
            name: 'applyToInquiry',
            btnType: 'c7n-pro',
            child: (fieldName = '') =>
              customPermissionButton({
                display:
                  fieldName ||
                  intl
                    .get(`ssrc.inquiryHall.view.message.button.commonApplyToInquiry`, {
                      sourceCategoryName: this.sourceCategoryName,
                    })
                    .d(`申请转{sourceCategoryName}`),
                onClick: () => this.jumpApplyToInquiry({ sourceRequest: 'ONLINE_SOURCING' }),
                ...CheckPermissionObject?.applytoinquiry,
              }),
          },
          {
            name: 'projAppInquiry',
            btnType: 'c7n-pro',
            child: (fieldName = '') =>
              customPermissionButton({
                display:
                  fieldName ||
                  intl
                    .get(`ssrc.inquiryHall.view.message.button.cpmmonProjAppInquiry`, {
                      sourceCategoryName: this.sourceCategoryName,
                    })
                    .d(`立项转{sourceCategoryName}`),
                onClick: () => this.projectToInquiryOpen({ sourceRequest: 'ONLINE_SOURCING' }),
                ...CheckPermissionObject?.projectapprovaltoinquiry,
              }),
          },
          {
            name: 'inquiryWholeEntryCreate',
            btnType: 'c7n-pro',
            hidden: !offlineWholeFlag,
            child: intl
              .get('ssrc.inquiryHall.view.button.inquiryWholeEntryCreate')
              .d('整单线下录入'),
            btnProps: {
              onClick: () => this.goOffline('inquiryRFQCreate'),
            },
          },
          {
            name: 'applyToWholeEntry',
            btnType: 'c7n-pro',
            hidden: !offlineWholeFlag,
            child: intl.get('ssrc.inquiryHall.view.button.applyToWholeEntry').d('申请转整单线下'),
            btnProps: {
              onClick: () => this.jumpApplyToInquiry({ sourceRequest: 'OFFLINE_ENTER' }),
            },
          },
          {
            name: 'projectSetupToWholeEntry',
            btnType: 'c7n-pro',
            hidden: !offlineWholeFlag || projectOldUIFlag,
            child: intl
              .get('ssrc.inquiryHall.view.button.projectSetupToWholeEntry')
              .d('立项转整单线下'),
            btnProps: {
              onClick: () => this.projectToInquiryOpen({ sourceRequest: 'OFFLINE_ENTER' }),
            },
          },
        ],
        child: (fieldName = '') => (
          <Button color="primary" icon="add">
            {fieldName ||
              intl
                .get('ssrc.inquiryHall.model.inquiryHall.commonNewRFQ', {
                  sourceCategoryName: this.sourceKey === 'BID' ? 'BID' : 'RFQ',
                })
                .d('新建{sourceCategoryName}')}
            <Icon type="expand_more" style={iconStyle} />
          </Button>
        ),
      },
      useRF &&
        ['ALL', 'RFP'].includes(useRFContent) && {
          name: 'creatRFPManually',
          group: true,
          children: [
            {
              name: 'inquiryRFPCreate',
              btnType: 'c7n-pro',
              child: (fieldName = '') =>
                customPermissionButton({
                  display:
                    fieldName ||
                    intl
                      .get(`ssrc.inquiryHall.view.message.button.creatRFPManually`)
                      .d('手工创建RFP'),
                  type: 'lov',
                  name: 'rfTemplateLov',
                  dataSet: this.rfpTemplateDs,
                  modalProps: {
                    onOk: () => this.createRF('RFP'),
                    onDoubleClick: () => this.createRF('RFP'),
                    title: intl.get('ssrc.rf.model.rf.template').d('征询模板'),
                  },
                  ...CheckPermissionObject?.create,
                }),
            },
            {
              name: 'projectToRFP',
              btnType: 'c7n-pro',
              child: (fieldName = '') =>
                customPermissionButton({
                  display:
                    fieldName ||
                    intl.get(`ssrc.inquiryHall.view.message.button.projectToRFP`).d('立项转RFP'),
                  onClick: () => this.projectToRFIOpen('RFP'),
                  ...CheckPermissionObject?.projectapprovaltoinquiry,
                }),
            },
          ],
          child: (fieldName = '') => (
            <Button name="creatRFPManually" className={Style.newRfButtons} icon="add">
              {fieldName || intl.get('ssrc.inquiryHall.model.inquiryHall.newRFP').d('新建RFP')}
              <Icon type="expand_more" style={iconStyle} />
            </Button>
          ),
        },
      useRF &&
        ['ALL', 'RFI'].includes(useRFContent) && {
          name: 'creatRFIManually',
          group: true,
          children: [
            {
              name: 'inquiryRFICreate',
              btnType: 'c7n-pro',

              child: (fieldName = '') =>
                customPermissionButton({
                  display:
                    fieldName ||
                    intl
                      .get(`ssrc.inquiryHall.view.message.button.creatRFIManually`)
                      .d('手工创建RFI'),
                  type: 'lov',
                  name: 'rfTemplateLov',
                  dataSet: this.rfiTemplateDs,
                  modalProps: {
                    onOk: () => this.createRF('RFI'),
                    onDoubleClick: () => this.createRF('RFI'),
                    title: intl.get(`ssrc.bidHall.model.bidHall.rfxModal`).d('寻源模板'),
                  },
                  ...CheckPermissionObject?.create,
                }),
            },
            {
              name: 'projectToRFI',
              btnType: 'c7n-pro',
              child: (fieldName = '') =>
                customPermissionButton({
                  display:
                    fieldName ||
                    intl.get(`ssrc.inquiryHall.view.message.button.projectToRFI`).d('立项转RFI'),
                  onClick: () => this.projectToRFIOpen('RFI'),
                  ...CheckPermissionObject?.projectapprovaltoinquiry,
                }),
            },
          ],
          child: (fieldName = '') => (
            <Button name="creatRFIManually" className={Style.newRfButtons} icon="add">
              {fieldName || intl.get('ssrc.inquiryHall.model.inquiryHall.newRFI').d('新建RFI')}
              <Icon type="expand_more" style={iconStyle} />
            </Button>
          ),
        },
    ].filter(Boolean);
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_HEADER_BUTTON', buttons, {
          bidFlag: this.bidFlag,
          finishOthersDS,
          detailAllDS,
          allDS,
          tabStatus,
          currentType,
          that: this,
        })
      : buttons;
  }

  /**
   * 打开申请转询价弹框
   * @protected 此方法被【玛格、泸州老窖】二开，禁止修改、删除此方法名！！！
   */
  renderCreateRFXModal(createModalProps) {
    return <CreateRFXModal {...createModalProps} />;
  }

  renderCuxTabs = () => {
    const { remote } = this.props;

    let dom = '';
    dom = remote
      ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_ALL_TABGROUP_CUX_TABS', dom, {
          that: this,
          cuxTabTableDS: this.cuxTabTableDS,
        })
      : dom;
    return dom;
  };

  render() {
    const {
      useRF,
      tabsNumber,
      tabStatus,
      subAccountVisible,
      roundQuotationModalVisible,
      record: curRecord,
      currentType,
      tableDisplay,
      changeTypeAggregation,
      changeTableDisplayFlag,
      createModalVisible,
      CheckPermissionObject,
      doubleUnitFlag = false,
      detailCount = {},
      bidOpeningNewFlag,
      useRFContent = 'ALL',
      controllerLoading,
      biddingHallFlag,
      roundQuotationExecuteFlag = 0,
      onGoingCollapseKey,
      finishCollapseKey,
    } = this.state;
    const {
      userId,
      location,
      customizeBtnGroup = () => {},
      customizeTable,
      customizeTabPane,
      organizationId,
      custLoading,
      allDS,
      approvalDS,
      onGoingDealDS,
      toBeReleasedDS,
      attentionDS,
      finishOthersDS,
      finishInquirySuccessDS,
      detailAllDS,
      createLoading,
      remote,
      history,
      shareDS,
    } = this.props;

    const commonProps = {
      custLoading,
      customizeTable,
      bidOpeningNewFlag,
      changeTypeAggregation,
      sourceKey: this.sourceKey,
      viewDetail: this.viewDetail,
      inquiryDetail: this.inquiryDetail,
      getCommonColumns: this.getCommonColumns,
      documentTypeName: this.documentTypeName,
      quotationName: this.quotationName,
      cancelAggregationChange: this.cancelAggregationChange,
      renderSourceCategoryMeaning: this.renderSourceCategoryMeaning,
      doubleUnitFlag,
      remote,
      biddingHallFlag,
      checkPermissionObject: this.CheckPermissionObject,
      roundQuotationExecuteFlag,
      history,
      onGoingCollapseKey,
      finishCollapseKey,
      changeOnGoingCollapseKey: this.changeOnGoingCollapseKey,
      changeFinishCollapseKey: this.changeFinishCollapseKey,
    };

    // 进行中
    const onGoingContainerProps = {
      ...commonProps,
      approvalDS,
      attentionDS,
      onGoingDealDS,
      renderProcessOperate: this.renderProcessOperate,
      renderApprovalOperate: this.renderApprovalOperate,
      renderAttentionOperate: this.renderAttentionOperate,
      ref: this.onGoingContainerRef,
      bidFlag: this.bidFlag,
    };

    // 全部
    const AllContainerProps = {
      ...commonProps,
      allDS,
      renderOperate: this.renderOperate,
      sourceCategoryName: this.sourceCategoryName,
      ref: this.allContainerRef,
    };
    // RFI
    const RFIContainerProps = {
      userId,
      currentType,
      custLoading,
      customizeTable,
      tableDisplay,
      changeTableDisplayFlag,
      organizationId,
      location,
      useRF,
      useRFContent,
      viewDetail: this.viewDetail,
      inquiryDetail: this.inquiryDetail,
      renderRFOperate: this.renderRFOperate,
      viewDetailRF: this.viewDetailRF,
      getCommonColumns: this.getCommonColumns,
      changeInquiryType: this.changeInquiryType,
      changeTableDisplay: this.changeTableDisplay,
      // onRef: (node) => {
      //   this.rfContainerRef.current = node;
      // },
      rfContainerRef: this.rfContainerRef,
      changeTypeAggregation,
      cancelAggregationChange: this.cancelAggregationChange,
      changeRFParams: this.changeRFParams,
      changeRFIContainerCurrentTab: this.changeRFIContainerCurrentTab,
      advancedSearch: this.advancedSearch,
    };

    // finished status
    const FinishedContainerProps = {
      ...commonProps,
      renderOperate: this.renderOperate,
      finishOthersDS,
      finishInquirySuccessDS,
      sourceCategoryName: this.sourceCategoryName,
      ref: this.finishedContainerRef,
    };

    const DetailAllProps = {
      ...commonProps,
      renderOperate: this.renderOperate,
      detailAllDS,
      sourceCategoryName: this.sourceCategoryName,
      ref: this.detailAllContainerRef,
    };

    const toBeReleasedProps = {
      ...commonProps,
      toBeReleasedDS,
      renderOperate: this.renderOperate,
      ref: this.toBeReleasedRef,
    };

    const expertModalProps = {
      visible: subAccountVisible,
      onOk: this.transfer,
      onCancel: this.closeTransferModal,
      bidFlag: this.bidFlag,
    };

    const {
      total = undefined,
      finished = undefined,
      ongoing = undefined,
      unrelease = undefined,
      processing = undefined,
    } = tabsNumber || {};
    const { totalItemCount = null } = detailCount || {};

    const {
      scoreRoundStatus,
      rfxHeaderId: sourceHeaderId,
      sourceProjectId,
      multiSectionFlag,
      projectLineSectionId,
    } = curRecord;

    // 多轮报价modal
    const roundQuotationProps = {
      quotationName: this.quotationName,
      sourceStatus: scoreRoundStatus,
      sourceHeaderId,
      sourceProjectId,
      multiSectionFlag,
      projectLineSectionId,
      record: {
        ...curRecord,
        sourceHeaderId,
      },
      startRoundQuotation: this.startRoundQuotation,
      startScore: this.startScore,
      candelRoundQuotationModal: this.candelRoundQuotationModal,
      onChange: this.fetchExpertScoreItemLines,
      visible: roundQuotationModalVisible,
    };

    const searchProps = {
      useRF,
      useRFContent,
      bidFlag: this.bidFlag,
      onGoingDealDS,
      approvalDS,
      toBeReleasedDS,
      attentionDS,
      allDS,
      detailAllDS,
      clarifyAnswer: querystring.parse(location.search.substr(1))?.clarifyAnswer,
      finishInquirySuccessDS,
      finishOthersDS,
      organizationId,
      onRef: this.getSearch,
      advancedSearch: this.advancedSearch,
      rightRender: this.rightRender,
      currentType,
      changeInquiryType: this.changeInquiryType,
      tableDisplay,
      changeTableDisplay: this.changeTableDisplay,
      sourceKey: this.sourceKey,
      getCategoryCode,
      tabStatus,
      remote,
    };

    const createModalProps = {
      remote,
      visible: createModalVisible,
      createLoading,
      createInquiry: this.createModalInquiry,
      onCancel: this.closCreateInquiryModal,
      onClose: this.closCreateInquiryModal,
      bidFlag: this.sourceKey === BID,
      purchaseRequestDS: this.purchaseRequestDS,
    };

    // tabStatus === 'toBeReleased' || tabStatus === 'all' 当前激活的tab是否是待发布或者全部页签这样的单表页签
    const tableFixSelfAdaptStyle =
      getTableFixSelfAdaptStyle(
        tabStatus === 'toBeReleased' || tabStatus === 'all' || tabStatus === 'detailAll'
      ) || {};

    return (
      <ModalProvider>
        <Header
          title={intl
            .get(`ssrc.inquiryHall.view.message.title.commonInquiryHall`, {
              sourceCategoryName: this.sourceCategoryName,
            })
            .d('{sourceCategoryName}工作台')}
        >
          <RenderButtons
            customizeBtnGroup={customizeBtnGroup}
            getButtons={this.getButtons}
            sourceKey={this.sourceKey}
            useRF={useRF}
            tabStatus={tabStatus}
            currentType={currentType}
            CheckPermissionObject={CheckPermissionObject}
          />
        </Header>
        <Content>
          <Spin spinning={controllerLoading}>
            <div className={Style.inquiryHall} style={tableFixSelfAdaptStyle.wrapperStyle}>
              {(currentType === 'RFQ' || this.bidFlag) && (
                <Fragment>
                  <Search {...searchProps} />
                  {customizeTabPane(
                    {
                      code: `SSRC.${this.sourceKey}_HALL.NEW_LIST.WORKBENCH_TABS`,
                      cascade: true,
                      custDefaultActive: (activeKey) => {
                        if (this.state.initTabFlag) {
                          // 保证在初始化时执行一次
                          const queryParams = querystring.parse(
                            this.props?.location?.search?.substr(1)
                          );
                          // 可能有用户二开，因此这里跟以前查用户记忆时一样，若个性化都保留原有逻辑则取路径上的，若路径上不存在再给默认进行中
                          const defaultActiveKey =
                            activeKey ||
                            queryParams?.tabStatus ||
                            queryParams?.defaultTabIndex ||
                            (queryParams?.releaseFinishFlag ? 'all' : '') ||
                            (shareDS ? shareDS.getState('currentTabs') : '') ||
                            'onGoing';
                          // 默认激活tab；ps：若设置了用户个性化默认，则此处不会生效，会被用户个性化覆盖掉
                          this.changeTab(defaultActiveKey);
                        }
                      },
                    },
                    <Tabs
                      activeKey={tabStatus}
                      // size="large"
                      // animated={false}
                      onChange={this.changeTab}
                      customizable
                      customizedCode={`SSRC.${this.sourceKey}_HALL.NEW_LIST.WORKBENCH_TABS`}
                      {...tableFixSelfAdaptStyle.tabsProps}
                    >
                      <TabGroup
                        key="all"
                        tab={intl.get('ssrc.inquiryHall.view.wholeBid').d('整单')}
                      >
                        <TabPane
                          tab={intl.get('ssrc.inquiryHall.button.toBeReleased').d('待发布')}
                          count={unrelease}
                          overflowCount={99}
                          key="toBeReleased"
                        >
                          <div
                            className="tableContainer"
                            style={tableFixSelfAdaptStyle.tableContainerHeight}
                          >
                            <ToBeReleasedContainere {...toBeReleasedProps} />
                          </div>
                        </TabPane>
                        <TabPane
                          title={intl.get('ssrc.inquiryHall.button.onGoing').d('进行中')}
                          tab={(title) => (
                            <span className={Style.onGoingTab}>
                              {title}
                              <Badge
                                count={processing > 99 ? '99+' : processing}
                                className="inquiry-hall-badge"
                              />
                            </span>
                          )}
                          count={ongoing}
                          overflowCount={99}
                          key="onGoing"
                        >
                          <div className="tableContainer">
                            <OnGoingContainer {...onGoingContainerProps} />
                          </div>
                        </TabPane>
                        <TabPane
                          tab={intl.get('ssrc.inquiryHall.button.finished').d('完成')}
                          count={finished}
                          overflowCount={99}
                          key="finished"
                        >
                          <div className="tableContainer">
                            <FinishedContainer {...FinishedContainerProps} />
                          </div>
                        </TabPane>
                        <TabPane
                          tab={() => intl.get('ssrc.inquiryHall.button.all').d('全部')}
                          count={total}
                          overflowCount={99}
                          key="all"
                        >
                          <div
                            className="tableContainer"
                            style={tableFixSelfAdaptStyle.tableContainerHeight}
                          >
                            <AllContainer {...AllContainerProps} />
                          </div>
                        </TabPane>
                        {this.renderCuxTabs()}
                      </TabGroup>
                      <TabGroup
                        key="detail"
                        tab={intl.get('ssrc.inquiryHall.view.detailMessage').d('明细')}
                      >
                        <TabPane
                          tab={() => intl.get('ssrc.inquiryHall.button.all').d('全部')}
                          key="detailAll"
                          count={totalItemCount || 0}
                          overflowCount={99}
                        >
                          <div
                            className="tableContainer"
                            style={tableFixSelfAdaptStyle.tableContainerHeight}
                          >
                            <DetailAll {...DetailAllProps} />
                          </div>
                        </TabPane>
                      </TabGroup>
                    </Tabs>
                  )}
                </Fragment>
              )}
              {currentType === 'RFI' && !this.bidFlag && (
                <RFIContainer key="RFI" {...RFIContainerProps} />
              )}
              {currentType === 'RFP' && !this.bidFlag && (
                <RFPContainer key="RFP" {...RFIContainerProps} />
              )}
            </div>
          </Spin>
          {subAccountVisible && <SubAccount {...expertModalProps} />}
        </Content>
        {roundQuotationModalVisible && <RoundQuotationDrawer {...roundQuotationProps} />}
        {createModalVisible && this.renderCreateRFXModal(createModalProps)}
      </ModalProvider>
    );
  }
}

const HOCComponent = withStandardCompEnhancer(InquiryHall);

export default HOCComponent;
export { InquiryHall };
