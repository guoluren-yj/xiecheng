/**
 * 竞价大厅 供应商方
 * 2023-05-06
 *
 * /ssrc/supplier-reply/bidding-hall/:rfxLineSupplierId/:biddingTarget
 * - biddingTarget @requires string UNIT_PRICE | TOTAL_PRICE
 *
 * 日/荷兰 只有总价必输
 */

import React, { Component } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Tag, Layout, message, Icon, Spin, Popover, Badge, Tabs, Tooltip } from 'choerodon-ui';
import {
  isEmpty,
  compose,
  isArray,
  // isEqual,
  isNil,
  // debounce,
  isFunction,
  noop,
} from 'lodash';
import { runInAction, action } from 'mobx';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Throttle, Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import querystring from 'querystring';

import remote from 'hzero-front/lib/utils/remote';
import webSocketManagener from 'utils/webSoket';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import {
  getResponse,
  getCurrentOrganizationId,
  getCurrentRole,
  getCurrentUser,
  filterNullValueObject,
} from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
// import { openTab, getTabFromKey } from 'utils/menuTab';
import { queryMapIdpValue } from 'services/api';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';

import { idValidation, idValidations } from '@/routes/components/Widget/dataVerification';
import { handleValidationResult } from '@/routes/components/Widget/handleValidationResult';
import {
  fetchSupplierBiddingHeader,
  fetchSupplierBiddingRules,
  supplierCollection,
  quotationPriceSave,
  quotationUnitPriceSubmit,
  quotationRefreshLine,
  totalQuotationRefreshLine,
  japanDutchTotalQuotationRefreshLine,
  totalPriceHeaderLinesSave,
  totalPriceHeaderLinesSubmit,
  fetchSupplierUnitBiddingDetailViewForm,
  fetchSupplierTotalBiddingDetailViewForm,
  supplierProcessBar,
  fetchSupplierBiddingCurrentHeader,
  fetchChatRoomUnreadMessage,
  biddingHallChatRoomAddMembers,
} from '@/services/biddingHallService';
import {
  isText,
  amountCalcType,
  batchQueryBusinessRules,
  calculateBasicQty,
  getJumpRoutePrefixUrl,
} from '@/utils/utils';
import { queryEnableDoubleUnit } from '@/services/commonService';

import { Section } from '@/routes/ssrc/BiddingHall/components/';
import { getErrors } from '@/routes/ssrc/RFSupplierQuotation/Quotation/utils/getDSError';
import {
  calcQuotationRangeValue,
  reCalculatePriceValue,
  calcLowestMinusQuotationRange,
  formatLowestMinusQuotationRange,
} from '@/routes/ssrc/BiddingHall/utils/calculatorPrice';
import { getChatRoomConfigs } from '@/routes/ssrc/BiddingHall/utils/chatRoomConfigs';
import { getQuotationName } from '@/utils/globalVariable';
import { getLineStatusColor } from '../utils/statusColor';

import Style from './index.less';

import BaseInfo from './Page/BaseInfo';
import BiddingHallContent from './Page/BiddingHallContent';
import NetSignal from '../components/NetSignal';
import BiddingProcessNode from '../components/BiddingProcessNode';
import { WarningMessageTime } from '../components';
import UnitPriceWholeBatchWarningPrice from './Page/UnitPriceWholeBatchWarningPrice';

import {
  detailViewFormDataSet,
  headerDataSet,
  headerBaseInfoDataSet,
  ruleDataSet,
  detailViewItemInfoFormDataSet,
} from './Stores/formDS';
import {
  quotationLineDataSet,
  quotationItemDataSet,
  totalPriceTableDataSet,
} from './Stores/quotationLineDataSet';
import { biddingHistoryTableDS } from './Stores/rankTableDS';
import { SupplierHeaderBaseInfoOpenModal } from './Page/SupplierHeaderBaseInfoOpenModal';

const OpenModalTimer = 1_000;
const SectionOpenModalTimer = 2_500;
// const CHATROOMADDMEMBERTIMER = 2_500;
const TimeoutTime = 2_000;
const RefreshInterval = 2_000; // refresh interval 2_000 ms
const DelayRefreshPageTime = 5_000;
const CHAT_ROOM_REFRESH_INTERVAL = 5_000; // 聊天室未读消息轮询间隔
const BRITISH_POLLING_REFRESH_TIME = 20_000; // 轮询更新行排名时间
const JAPAN_DUTCH_TOTAL_REFRESH_SECONDS = 10_000; // 日/荷兰 刷新轮询兜底

const { Header: LayoutHeader, Sider, Content: LayoutContent, Footer: LayoutFooter } = Layout;
const { TabPane } = Tabs;

class BiddingHallComponent extends Component {
  constructor(props) {
    super(props);

    const { biddingSupRemote } = props || {};

    this.pageLoadingLock = false;
    this.pageOperationLoadingLock = false; // 页面操作loading

    this.chatRoomAddedFlag = 0; // 聊天室是否加过供应商

    this.organizationId = getCurrentOrganizationId();

    this.headerDS = new DataSet(headerDataSet());
    this.ruleDS = new DataSet(ruleDataSet());

    const quotationLineDSObj = quotationLineDataSet({
      getBiddingRemainingQuotationCount: this.getBiddingRemainingQuotationCount,
      biddingUnitWholeBatchPriceFlag: this.biddingUnitWholeBatchPriceFlag,
      getTaxOrUntax: this.getTaxOrUntax,
      readonlyOrPaused: this.readonlyOrPaused,
    });

    this.quotationLineDS = new DataSet(
      biddingSupRemote
        ? biddingSupRemote.process(
            'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_QUOTATION_LINE_DATASET',
            quotationLineDSObj,
            { that: this }
          )
        : quotationLineDSObj
    );
    this.quotationDetailViewListDS = new DataSet(
      quotationItemDataSet({
        getBiddingRemainingQuotationCount: this.getBiddingRemainingQuotationCount,
        getTaxOrUntax: this.getTaxOrUntax,
      })
    );
    // 2023-10-19：标准精度埋点 捷泰科技
    this.detailViewFormDS = new DataSet(
      props?.biddingSupRemote
        ? props.biddingSupRemote.process(
            'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_DETAIL_VIEW_FORM_DATASET',
            detailViewFormDataSet({
              japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
            }),
            { state: this.state }
          )
        : detailViewFormDataSet({
            japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
          })
    );
    this.detailViewItemInfoFormDS = new DataSet(
      detailViewItemInfoFormDataSet({
        getBiddingRemainingQuotationCount: this.getBiddingRemainingQuotationCount,
      })
    );
    this.biddingHistoryDS = new DataSet(
      biddingHistoryTableDS({
        getBiddingRemainingQuotationCount: this.getBiddingRemainingQuotationCount,
        japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      })
    );
    this.totalPriceTableDS = new DataSet(totalPriceTableDataSet());

    this.headerBasicInfoDS = new DataSet(headerBaseInfoDataSet());
    this.headerBasicInfoDetailDS = new DataSet(headerBaseInfoDataSet());

    this.cuxObject = {}; // 专门给二开去存储一些字段状态，进行一些自定义操作
    this.unitPriceRef = null;
    this.totalAmountRef = null;
    this.biddingHallContentRef = null;
    this.chatRoomRef = null;
    this.warningRef = null; // 警示消息
    this.unitPriceWholeTalbeSearchBarRef = null;

    this.lastTimeSocketMessageTimerRecordMap = new Map(); // socket to get flag operate page
    this.timeoutTimer = null; // 延迟刷新报价页面定时器
    this.biddingRecordFirstSetLastFlag = 0; // 页面已初步加载标识
    this.disabledQueryBiddingRecord = false; // 禁止查询竞价记录标识
    this.pausedModalKey = Modal.key(); // 暂停单据提示弹窗modal key
    this.startBiddingModalKey = Modal.key(); // 开始竞价确认弹窗modal key
    this.supplierHeaderBaseInfoModal = null;
    this.chatRoomMessageRef = null;
    this.pollingRefreshLineTimer = null;

    this.supplierUrl = '';
    this.supplierHeadLineUrl = '';

    this.watchListDataChangeTimer = null; // 单价-详情试图列表实时变化定时器
    this.openBaseInfoModalTimer = null;
    this.pageLeaveTime = null;

    this.changePageTabLeaveRefreshInterval = 15; // 切换tab时间间隔秒，查询更新

    this.state = {
      pageLoading: false,
      pageOperationLoading: false, // 页面操作loading
      pageReadOnlyFlag: false, // 页面只读标识
      headerInfo: {}, // header
      headerRule: {}, // 竞价规则
      offerPriceViewFlag: 0, // 出价详情标识,单价竞价是否打开的是详情视图
      biddingSupLineCurId: null, // 出价详情list id
      lovs: {},
      doubleUnitFlag: 0, // 双单位
      caclRule: null, // 业务规则定义-金额计算方式
      supplementUnitPriceFlag: 0, // 补充单价 节点
      chatRoomVisible: false, // 聊天室显示
      // chatRoomShowType: 'SHOW', // 聊天室展开 SHOW/HIDE
      chatRoomMessage: {}, // 未读消息对象
      processNodeData: {}, // 流程节点
      unitPriceLineFloatType: null,
      countDownShowAllZeroFlag: 0, // 倒计时显示 00:00:00
      quotationInputAutoCalculateFlag: 1, // 出价输入框输入值后自动计算
      tabKey: 'message',
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevParams) {
      return false;
    }

    const { match: { params: prevParams = {} } = {} } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams?.rfxLineSupplierId || null;
    const id = params?.rfxLineSupplierId || null;
    return id && prevId !== id;
  }

  componentDidUpdate(...rest) {
    if (rest[2]) {
      this.startInitBiddingPage();
    }
  }

  componentDidMount() {
    this.remoteMounted();
    this.startInitBiddingPage();
  }

  @Bind()
  remoteMounted = async () => {
    const { biddingSupRemote } = this.props;
    if (biddingSupRemote?.event) {
      await biddingSupRemote.event.fireEvent('remoteMounted', {
        that: this,
        supplierProcessBar,
        initPage: this.initPage,
        cuxObject: this.cuxObject,
        fetchSupplierBiddingHeader,
      });
    }
  };

  startInitBiddingPage = () => {
    const { projectLineSectionId, sectionFlag } = this.getLocationSearchObj() || {};

    this.initPageQuery();

    // 浏览器切换事件
    document.addEventListener('visibilitychange', this.chromeTabVisibilityChange);

    // 频繁切换标段
    const openTimer =
      projectLineSectionId && sectionFlag === '1' ? SectionOpenModalTimer : OpenModalTimer;
    this.openBaseInfoModalTimer = setTimeout(this.openBaseInfoEditorModal, openTimer);
  };

  componentWillUnmount() {
    this.unmount();
  }

  unmount = () => {
    this.lastTimeSocketMessageTimerRecordMap.clear();

    // this.closeFullScreen();
    this.clearTimeoutTimer();
    this.clearSockerCreateLinkTimer();
    this.closeSocket();
    document.removeEventListener('visibilitychange', this.chromeTabVisibilityChange);
    message.destroy();
    this.closeBiddingPausedSaveAndRefreshPausedModal();
    this.closeStartBiddingModal();
    this.clearBaseInfoEditorModalWatchTimer();
    this.clearChatRoomUnreadWatcher();
    this.closeLoadingTimer();
    this.clearPollingRefreshLineTimer();
  };

  initPageQuery = async () => {
    await this.batchQueryAndOperateBusinessRules();
    await this.initPage();

    // this.fullScreen(); // 打开全屏
    this.queryLovs();
    this.queryDoubleUnit();
    // this.chatRoomExpandQuery();
    this.initCalcType(); // 查询金额计算方式

    this.initWebSoketConnect(); // init socket

    await this.registerSocketConnect(); // connect socket
  };

  openFullscreen = () => {
    // 在FireFox或Opera中，隐藏的变量e是存在的，那么e||event返回e，如果在IE中，隐藏变量e是不存在，则返回event
    // IE中，只有keyCode属性，而FireFox中有which和charCode属性，Opera中有keyCode和which属性
    // const currKey = e.keyCode || e.which || e.charCode;
    // if (currKey === 112 || currKey === 70) {
    //   this.fullScreen();
    // }
  };

  // 批量查询业务规则定义
  batchQueryAndOperateBusinessRules = async () => {
    const param = {
      data: [
        {
          fullPathCode: 'SITF.SSRC.QUOTATION_BIDDING_REFRESH_PRICE',
          cnfParamDTOs: [{}],
        },
      ],
      currentOrganizationId: this.organizationId,
    };

    const result = (await batchQueryBusinessRules(param)) || [];
    if (isEmpty(result)) {
      return;
    }

    const caclRule = result['SITF.SSRC.QUOTATION_BIDDING_REFRESH_PRICE']?.[0];
    const quotationInputAutoCalculateFlag = caclRule === '1' || caclRule === 1 ? 1 : 0;

    this.setState({
      caclRule,
      quotationInputAutoCalculateFlag,
    });
  };

  // 规则定义计算方式
  initCalcType = async () => {
    const result = (await amountCalcType()) || [];
    this.setState({
      caclRule: result?.[0],
    });
  };

  // chrome change tab event handle
  chromeTabVisibilityChange = async () => {
    const { offerPriceViewFlag, biddingSupLineCurId, headerInfo } = this.state;
    const HiddenChromeTabFlag = document?.hidden;

    if (!HiddenChromeTabFlag) {
      const { displayBiddingSupHeaderStatus, supplierStatus } = headerInfo || {};

      // 单据完成切入页面不做查询
      const DisabledFetchFlag =
        displayBiddingSupHeaderStatus === 'CLOSED' ||
        displayBiddingSupHeaderStatus === 'FINISHED' ||
        supplierStatus === 'PROHIBIT_QUOTATION';

      if (DisabledFetchFlag) {
        return;
      }

      await this.fetchHeaderInfo({ showStatusMessage: 0, reEntryFlag: 1 });
      await this.rollingFetchChatRoomMessage();

      if (this.getUnitPriceFlag()) {
        if (offerPriceViewFlag && biddingSupLineCurId) {
          this.queryUnitPriceDetailViewList();
          this.queryPriceDetailViewFormInfoAndUpdatePartialFields();
        }

        if (this.biddingUnitWholeBatchPriceFlag()) {
          const currentTimer = this.getCurrentDateTimeSecond();
          const greatThanInterval = math.gte(
            math.minus(currentTimer, this.pageLeaveTime),
            this.changePageTabLeaveRefreshInterval
          );
          const lessTheOneMinute =
            currentTimer &&
            this.pageLeaveTime &&
            currentTimer > this.pageLeaveTime &&
            greatThanInterval;

          if (lessTheOneMinute) {
            this.queryRefreshLineData();
          }
        }
      }

      if (this.getTotalPriceFlag()) {
        this.queryPriceDetailViewFormInfoAndUpdatePartialFields();
      }

      this.pageLeaveTime = null;
      this.startPollingRefreshLine();
    } else {
      // 离开
      this.clearTimeoutTimer();
      this.pageLeaveTime = this.getCurrentDateTimeSecond(); // 记录离开时间
    }
  };

  // 当前时间-转为秒
  getCurrentDateTimeSecond() {
    return moment().second();
  }

  // clear timeout
  clearTimeoutTimer = () => {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
    if (this.chatRoomAddMemebersTimer) {
      clearTimeout(this.chatRoomAddMemebersTimer);
    }
    this.clearWatchListDataChangeTimer();
  };

  clearWatchListDataChangeTimer = () => {
    if (this.watchListDataChangeTimer) {
      clearInterval(this.watchListDataChangeTimer);
    }
  };

  clearBaseInfoEditorModalWatchTimer = () => {
    if (this.openBaseInfoModalTimer) {
      clearTimeout(this.openBaseInfoModalTimer);
    }
  };

  clearChatRoomUnreadWatcher = () => {
    if (this.chatRoomMessageRef) {
      clearInterval(this.chatRoomMessageRef);
    }
  };

  closeLoadingTimer = () => {
    if (this.pageOperationLockTime) {
      clearTimeout(this.pageOperationLockTime);
    }
  };

  clearPollingRefreshLineTimer = () => {
    if (this.pollingRefreshLineTimer) {
      clearInterval(this.pollingRefreshLineTimer);
    }
  };

  // close full screen
  closeFullScreen = () => {
    if (!document) {
      return;
    }

    const node = document.querySelector(`.ssrc-bidding-hall-fullscreen`);
    if (node) {
      // node.classList.remove('hzero-fullscreen');
      node.classList.remove('ssrc-bidding-hall-fullscreen');
    }
  };

  // page back
  onBack = async () => {
    if (this.getTotalPriceFlag()) {
      await this.totalPriceSaveHeaderLines();
    }
    this.closeFullScreen();
    this.unmount();
  };

  // open full screen
  fullScreen = () => {
    const node = document.querySelector(`#root`).firstElementChild;
    if (node) {
      // node.classList.add('hzero-fullscreen');
      node.classList.add('ssrc-bidding-hall-fullscreen');
    }
  };

  // fetch page data
  initPage = async (options) => {
    await this.fetchHeaderInfo();
    await this.refreshContent(options);
    this.fetchBiddingRules();
    this.queryProcessNodeData();
    this.fetchWarningMessageAndCount();

    this.startPollingRefreshLine();

    await this.cuxHandleInitPage(options);
  };

  cuxHandleInitPage = (options) => {
    const { biddingSupRemote } = this.props;

    if (biddingSupRemote?.event) {
      biddingSupRemote.event.fireEvent('initPageLastHandle', {
        options,
        that: this,
      });
    }
  };

  // 轮询 更新页面部分字段逻辑
  startPollingRefreshLine = () => {
    const { srmSsrcBiddingHallSupplierRefreshPollingCancelled = 0 } = window || {};
    this.clearPollingRefreshLineTimer();

    // refresh 接口， 支持控制台暂时取消功能， 在紧急阶段可以操作.
    if (srmSsrcBiddingHallSupplierRefreshPollingCancelled === 1) {
      return;
    }

    let refreshTimeInterval = BRITISH_POLLING_REFRESH_TIME;

    // 日/荷兰 保底轮询-更新加快
    if (this.japOrDutchBiddingTotalPrice()) {
      refreshTimeInterval = JAPAN_DUTCH_TOTAL_REFRESH_SECONDS;
    }

    this.pollingRefreshLineTimer = setInterval(this.queryRefreshLineData, refreshTimeInterval);
  };

  // QUOTATION HEADER CUSTOMIZE CODE
  getHeaderCustomizeCode = () => {
    let customizeUnitCode = '';

    if (this.getUnitPriceFlag()) {
      customizeUnitCode = this.getCustomizeUnitCode(['headerTag']);
    }

    if (this.getTotalPriceFlag()) {
      customizeUnitCode = this.getCustomizeUnitCode(['headerTag']);
    }

    return customizeUnitCode;
  };

  // update headerInfo state add values
  updateStateOfHeaderInfo(others) {
    const { headerInfo } = this.state;
    const { current } = this.headerDS || {};

    const otherHeaders = filterNullValueObject(others || {});

    const newHeaderData = { ...headerInfo, ...otherHeaders };

    this.setState({
      headerInfo: newHeaderData,
    });

    if (current) {
      current.set(newHeaderData);
    }
  }

  // FETCH HEADER
  fetchHeaderInfo = async (otherData = {}) => {
    const { match: { params } = {} } = this.props;
    const { showStatusMessage, reEntryFlag = 0, ...others } = otherData || {};
    const { current } = this.headerDS || {};

    const { rfxLineSupplierId } = params || {};
    idValidation(rfxLineSupplierId);

    if (!reEntryFlag && current) {
      current.set({
        currentQuotationTotalCountValue: null,
        quotationCurrentTotalAmountValue: null,
        quotationCurrentNetAmountValue: null,
      });
    }

    const customizeUnitCode = this.getHeaderCustomizeCode();
    const data = {
      organizationId: this.organizationId,
      querys: {
        customizeUnitCode,
      },
      rfxLineSupplierId,
      ...(others || {}),
    };

    let result = null;
    this.toggleLoading(true);
    try {
      result = await fetchSupplierBiddingHeader(data);
      result = getResponse(result);
      if (!result || isEmpty(result)) {
        this.toggleLoading(false);
        this.setState({ pageReadOnlyFlag: true });
        return;
      }

      runInAction(() => {
        let header = result;

        if (reEntryFlag && current) {
          const {
            currentQuotationTotalCount,
            currentQuotationTotalCountValue,
            qtnTotalAmount,
            qtnNetAmount,
            quotationCurrentTotalAmountValue,
            quotationCurrentNetAmountValue,
          } = current.get([
            'currentQuotationTotalCount',
            'currentQuotationTotalCountValue',
            'qtnTotalAmount',
            'qtnNetAmount',
            'quotationCurrentTotalAmountValue',
            'quotationCurrentNetAmountValue',
          ]);
          header = Object.assign({}, header, {
            currentQuotationTotalCount,
            currentQuotationTotalCountValue,
            qtnTotalAmount,
            qtnNetAmount,
            quotationCurrentTotalAmountValue,
            quotationCurrentNetAmountValue,
          });
        }

        this.headerDS.loadData([header]);
        this.setState({
          headerInfo: header,
          countDownShowAllZeroFlag: 0,
        });

        if (!reEntryFlag) {
          this.fetchBasicInfoHeader(header);
        }

        this.afterFetchHeaderRecordLogic(header, { showStatusMessage });

        if (this.chatRoomAddedFlag === 0) {
          this.chatRoomAddMembers(header);
        }
      });

      return result;
    } catch (e) {
      throw e;
    } finally {
      this.toggleLoading(false);
    }
  };

  // 设置单价-批量进行中表格可勾选
  setUnitPriceSelectedFlag = (header = {}) => {
    const { pageReadOnlyFlag } = this.state;
    const { match: { params } = {} } = this.props;
    const { biddingTarget } = params || {};
    const { displayBiddingSupHeaderStatus, biddingUnitPriceRule, quotationOrderType } =
      header || {};
    const flag =
      biddingUnitPriceRule === 'WHOLE_BATCH' &&
      quotationOrderType === 'PARALLEL' &&
      !pageReadOnlyFlag &&
      displayBiddingSupHeaderStatus !== 'PAUSED';
    if (biddingTarget === 'UNIT_PRICE' && flag) {
      this.quotationLineDS.selection = 'multiple';
    } else {
      this.quotationLineDS.selection = false;
    }
  };

  // 设置总价-批量进行中表格可勾选
  setTotalPriceSelectedFlag = () => {
    const { headerInfo } = this.state;
    const { displayBiddingSupHeaderStatus, biddingTotalPricePrinciple } = headerInfo || {};
    const { current: formCurrent } = this.detailViewFormDS || {};
    const { match: { params } = {} } = this.props;
    const { pageReadOnlyFlag } = this.state;
    const { biddingTarget } = params || {};
    const {
      biddingSupplierPriceSubmitFlag, // 补充单价已提交
      biddingSupplementPriceRunningFlag,
      displayQuotationPrice,
    } = formCurrent
      ? formCurrent.get([
          'biddingSupplierPriceSubmitFlag',
          'biddingSupplementPriceRunningFlag',
          'displayQuotationPrice',
        ])
      : {};

    const flag =
      displayBiddingSupHeaderStatus === 'IN_PROGRESS' &&
      !pageReadOnlyFlag &&
      (biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' ||
        (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' &&
          !biddingSupplierPriceSubmitFlag &&
          biddingSupplementPriceRunningFlag &&
          !isNil(displayQuotationPrice)));
    if (biddingTarget === 'TOTAL_PRICE' && flag) {
      this.totalPriceTableDS.selection = 'multiple';
    } else {
      this.totalPriceTableDS.selection = false;
    }
  };

  // 基础信息-弹窗
  fetchBasicInfoHeader = async (header) => {
    const { headerInfo } = this.state;
    const { biddingSupHeaderCurId: headerCurrentId } = headerInfo || {};
    const { biddingSupHeaderCurId } = header || {};

    const id = biddingSupHeaderCurId || headerCurrentId;

    if (!id) {
      return;
    }

    const disabledAllFieldsFlag = this.getHeaderBasicInfoModalReadOnlyFlag();

    const params = {
      organizationId: this.organizationId,
      biddingSupHeaderCurId: id,
      disabledAllFieldsFlag,
      querys: {
        customizeUnitCode: this.getBasicInfoCustomizeCode(),
      },
    };

    let result = null;
    try {
      result = await fetchSupplierBiddingCurrentHeader(params);
      result = getResponse(result);
      if (!result) {
        return;
      }

      this.headerBasicInfoDS.loadData([result]);
      this.headerBasicInfoDetailDS.loadData([result]);
    } catch (e) {
      throw e;
    }
  };

  // 基础信息-弹窗-个性化编码
  getBasicInfoCustomizeCode = () => {
    let codeName = 'headerModalBaseInfoForm';
    const disabledAllFields = this.getHeaderBasicInfoModalReadOnlyFlag();
    if (disabledAllFields) {
      codeName = 'headerModalBaseInfoFormDetail';
    }

    const code = this.getCustomizeUnitCode(codeName);
    return code;
  };

  // 查询流程节点
  queryProcessNodeData = async () => {
    const { headerInfo } = this.state;
    const { rfxHeaderId } = headerInfo || {};

    if (!rfxHeaderId || !this.organizationId) {
      return;
    }

    const data = {
      organizationId: this.organizationId,
      rfxHeaderId,
    };
    try {
      let result = await supplierProcessBar(data);
      result = getResponse(result);
      if (!result) {
        return;
      }

      this.judgeCurrentNode(result);

      this.setState({
        processNodeData: result || [],
      });
    } catch (e) {
      throw e;
    }
  };

  /**
   * 判断两次查询节点是否相同
   */
  @Debounce(1000)
  judgeCurrentNode = (result) => {
    const { processNodeData } = this.state;

    const { biddingNodeDTOS } = result || {};
    const { biddingNodeDTOS: preBiddingNodeDTOS } = processNodeData || {};

    if (isEmpty(biddingNodeDTOS) || isEmpty(preBiddingNodeDTOS)) {
      return;
    }

    const currentNode = biddingNodeDTOS.filter((node) => node?.currentFlag === 1);
    const previousNode = biddingNodeDTOS.filter((node) => node?.currentFlag === 1);

    const { nodeName } = currentNode[0] || {};
    const { nodeName: previousNodeName } = previousNode[0] || {};

    const differrencNode = previousNodeName && nodeName && previousNodeName !== nodeName;

    if (differrencNode) {
      this.refreshPage();
    }
  };

  // 获取当前进度条dto
  getCurrentProcessNode = () => {
    const { processNodeData } = this.state;

    const { biddingNodeDTOS } = processNodeData || {};
    let currentNode = null;

    if (isEmpty(biddingNodeDTOS)) {
      return;
    }

    currentNode = biddingNodeDTOS.filter((node) => node?.currentFlag === 1);
    currentNode = currentNode[0] || null;

    return currentNode;
  };

  /**
   * message component config
   * 部分状态，每次进入页面需要中心提示
   * */
  messageConfig = () => {
    message.destroy();
    message.config({
      top: 100,
      duration: 3,
    });
  };

  // 竞价状态提示
  biddingNotificationMessage = (data) => {
    const {
      displayBiddingSupHeaderStatusMeaning,
      displayBiddingSupHeaderStatus,
      options: { showStatusMessage = 1 } = {},
    } = data || {};
    if (!showStatusMessage) {
      return;
    }

    const currentStatusMessage = (
      <span className={Style['ssrc-bidding-hall-status-warning-top-text']}>
        {intl
          .get('ssrc.biddingHall.view.title.biddingHallHeaderStatus', {
            status: displayBiddingSupHeaderStatusMeaning || '',
          })
          .d('竞价单{status}')}
      </span>
    );

    const needWarningStatusSetFlag =
      displayBiddingSupHeaderStatus === 'PAUSED' ||
      displayBiddingSupHeaderStatus === 'CLOSED' ||
      displayBiddingSupHeaderStatus === 'FINISHED';

    if (needWarningStatusSetFlag) {
      this.messageConfig();
      if (displayBiddingSupHeaderStatus === 'PAUSED') {
        message.warning(currentStatusMessage, undefined, undefined, 'top');
      } else {
        message.success(currentStatusMessage, undefined, undefined, 'top');
      }
    }
  };

  // after fetch header
  afterFetchHeaderRecordLogic = (header = {}, options) => {
    const { biddingSupRemote } = this.props;

    if (isEmpty(header)) {
      return;
    }

    const {
      displayBiddingSupHeaderStatus = null,
      displayBiddingSupHeaderStatusMeaning = '',
      biddingStrategy = null,
      supplierStatus = null,
      biddingSupHeaderCurId = null,
      biddingMode,
      biddingQuotationMethod,
      // biddingRoundSupplierStatus,
    } = header || {};

    const lessThanTwoItemLines = this.biddingUnitSiglePriceFlag(header);

    this.biddingNotificationMessage({
      displayBiddingSupHeaderStatus,
      displayBiddingSupHeaderStatusMeaning,
      options,
    });

    // 竞价单不可编辑状态集
    const ReadOnlyFlag =
      !displayBiddingSupHeaderStatus ||
      displayBiddingSupHeaderStatus === 'SIGN_IN' ||
      displayBiddingSupHeaderStatus === 'NOT_START' ||
      displayBiddingSupHeaderStatus === 'CLOSED' ||
      displayBiddingSupHeaderStatus === 'FINISHED' ||
      // displayBiddingSupHeaderStatus === 'PAUSED' ||
      displayBiddingSupHeaderStatus === 'BIDDING_END' ||
      displayBiddingSupHeaderStatus === 'SUGGESTED' ||
      supplierStatus === 'PROHIBIT_QUOTATION';

    this.quotationLineDS.setState('header', header);
    this.quotationLineDS.setState('pageReadOnlyFlag', ReadOnlyFlag);

    runInAction(() => {
      this.detailViewFormDS.setState('header', header);
      this.detailViewFormDS.setState('pageReadOnlyFlag', ReadOnlyFlag);
      this.detailViewFormDS.setState('headerFormRecord', this.headerDS?.current || {});

      this.handleRefreshHeaderEvents({ data: header });

      if (this.getUnitPriceFlag()) {
        // 单价竞价-一行物料，直接打开详情试图
        if (lessThanTwoItemLines) {
          this.setState({
            // offerPriceViewFlag: 1,
          });
        }
        this.quotationDetailViewListDS.setState('header', header);
      }

      if (this.getTotalPriceFlag()) {
        if (biddingSupHeaderCurId) {
          this.totalPriceTableDS.setQueryParameter('biddingSupHeaderCurId', biddingSupHeaderCurId);
        }
        this.totalPriceTableDS.setState('pageReadOnlyFlag', ReadOnlyFlag);
        this.totalPriceTableDS.setState('header', header);
      }

      // 页面未加载，竞价记录才需要初始化查询，和浏览器切换后的逻辑区分开
      if (!this.biddingRecordFirstSetLastFlag) {
        this.biddingRecordFirstSetLastFlag = 1;

        // 默认值：竞价模式是英式竞价，出价策略低于最低价时，默认【全部】
        // 竞价模式是英式竞价，【竞价-出价策略是低于上次出价时、拍卖-出价策略高于最高价】，默认【最新】。
        this.biddingHistoryDS.setQueryParameter('queryLatestBiddingFlag', 0);
        if (biddingMode === 'BRITISH_BIDDING') {
          if (
            (biddingQuotationMethod === 'AUCTION' && biddingStrategy === 'ABOVE_THAN_LAST_QUOTE') ||
            (biddingQuotationMethod === 'BIDDING' && biddingStrategy === 'LOWER_THAN_LAST_QUOTE')
          ) {
            this.biddingHistoryDS.setQueryParameter('queryLatestBiddingFlag', 1);
          }
        }
      }

      this.setState({ pageReadOnlyFlag: ReadOnlyFlag }, () => {
        this.setUnitPriceSelectedFlag(header);
      });
    });

    if (biddingSupRemote?.event) {
      biddingSupRemote.event.fireEvent('afterFetchHeaderOperateEvents', {
        headerInfo: header,
        initPage: this.initPage,
        cuxObject: this.cuxObject,
      });
    }
  };

  /**
   * 基础信息按钮组- 个性化配置
   */
  getBaseInfoBtnGroupInfoVisible = () => {
    const { custConfig } = this.props;
    const baseInBtnGroupfoConfig =
      custConfig[this.getCustomizeUnitCode('headerBaseInfoBtns')] || {};
    const { fields = [] } = baseInBtnGroupfoConfig;
    const config = [fields || []].find((field) => field?.name === 'info') || {};
    const { visible = -1 } = config;

    return visible;
  };

  /**
   * 基础信息编辑弹窗
   */
  openBaseInfoEditorModal = () => {
    const { customizeForm, biddingSupRemote } = this.props;
    const { headerInfo } = this.state;
    const { fieldsRequiredFlag = 0 } = headerInfo || {};

    const disabledAllFields = this.getHeaderBasicInfoModalReadOnlyFlag();
    const baseInfoBtnGroupInfoVisible = this.getBaseInfoBtnGroupInfoVisible();

    const openModal =
      !!fieldsRequiredFlag && !disabledAllFields && baseInfoBtnGroupInfoVisible !== 0;

    if (!openModal) {
      this.clearBaseInfoEditorModalWatchTimer();
      return;
    }

    const data = {
      headerInfo,
      disabledAllFields,
      headerBasicInfoDS: this.headerBasicInfoDS,
      headerBasicInfoDetailDS: this.headerBasicInfoDetailDS,
      afterSaveBaseInfoFetchHeader: this.afterSaveBaseInfoFetchHeader,
      customizeForm,
      getBasicInfoCustomizeCode: this.getBasicInfoCustomizeCode,
      beforeOpenHeaderBaseInfoModal: this.beforeOpenHeaderBaseInfoModal,
      afterCloseHeaderBaseInfoModal: this.afterCloseHeaderBaseInfoModal,
      remote: biddingSupRemote,
    };
    this.supplierHeaderBaseInfoModal = SupplierHeaderBaseInfoOpenModal(data);
    this.clearBaseInfoEditorModalWatchTimer();
  };

  // 基础信息modal打开标志
  baseInfoModalOpenFlag = 0;

  // 基本信息弹窗- open
  beforeOpenHeaderBaseInfoModal = () => {
    this.updatebaseInfoModalOpenFlag(1);
  };

  // 基本信息弹窗- close
  afterCloseHeaderBaseInfoModal = () => {
    this.updatebaseInfoModalOpenFlag(0);
    this.updateSocketCacheData();
    this.refreshPage();
  };

  updatebaseInfoModalOpenFlag = (flag = 0) => {
    this.baseInfoModalOpenFlag = flag;
  };

  afterSaveBaseInfoFetchHeader = () => {
    this.fetchHeaderInfo();

    if (this.getTotalPriceAndUnitPriceRequired()) {
      this.queryUnitPriceDetailViewFormInfo();
    }
  };

  /**
   * 单据只读状态标识
   * @return int 1 | 0
   */
  getHeaderBasicInfoModalReadOnlyFlag = () => {
    const { headerInfo } = this.state;
    const { displayBiddingSupHeaderStatus, supplierStatus } = headerInfo || {};

    const disabledAllFieldsFlag =
      displayBiddingSupHeaderStatus === 'PAUSED' ||
      displayBiddingSupHeaderStatus === 'CLOSED' ||
      displayBiddingSupHeaderStatus === 'FINISHED' ||
      displayBiddingSupHeaderStatus === '' ||
      supplierStatus === 'PROHIBIT_QUOTATION'
        ? 1
        : 0;
    return disabledAllFieldsFlag;
  };

  // validate params of bidding target
  validatePageBiddingTarget = () => {
    const { match: { params } = {} } = this.props;

    const { biddingTarget } = params || {};
    if (biddingTarget !== 'UNIT_PRICE' && biddingTarget !== 'TOTAL_PRICE') {
      throw ReferenceError('biddingTarget value is not UNIT_PRICE or TOTAL_PRICE !');
    }
  };

  // REFRESH PAGE CONTENT
  refreshContent = async (options) => {
    this.validatePageBiddingTarget();
    if (this.getUnitPriceFlag()) {
      this.queryUntiPriceDetail(options); // 单价竞价
    }

    if (this.getTotalPriceFlag()) {
      await this.queryTotalPriceContent(options); // 总价竞价
      this.setTotalPriceSelectedFlag();
    }
  };

  // total price content query
  queryTotalPriceContent = async (options) => {
    const { match: { params } = {} } = this.props;
    const { rfxLineSupplierId } = params || {};
    idValidation(rfxLineSupplierId);

    const { skipQueryTotalPriceTableFlag = 0 } = options || {};

    const otherParams = {
      otherData: {
        customizeUnitCode: this.getCustomizeUnitCode('totalPriceDetailViewForm'),
      },
      disableQueryBiddingFlag: 1,
    };
    this.detailViewFormDS.setQueryParameter('totalPriceFlag', 1);
    await this.queryUnitPriceDetailViewFormInfo(otherParams);

    const { current: formCurrent } = this.detailViewFormDS || {};
    if (formCurrent) {
      await this.totalPriceTableDS.setState('headerFormRecord', formCurrent);
      const { biddingSupplementPriceNotStartFlag, biddingSupplementPriceRunningFlag } =
        formCurrent?.get([
          'biddingSupplementPriceNotStartFlag',
          'biddingSupplementPriceRunningFlag',
        ]) || {};

      const supplementaryUnitPriceFlag =
        biddingSupplementPriceNotStartFlag || biddingSupplementPriceRunningFlag; // 补充单价
      this.setState({
        supplementUnitPriceFlag: supplementaryUnitPriceFlag,
      });
    }

    this.totalPriceTableDS.setQueryParameter('commonProps', {
      organizationId: this.organizationId,
      rfxLineSupplierId,
      customizeUnitCode: this.getCustomizeUnitCode(['totalPriceTable', 'totalPriceTableSearch']),
    });

    this.biddingHistoryDS.setQueryParameter('totalPriceFlag', 1);

    if (!skipQueryTotalPriceTableFlag) {
      this.totalPriceTableDS.query(this.totalPriceTableDS?.currentPage || 0);
    }
    this.queryBiddingHistory();
  };

  /**
   * 单价-竞价详情
   * 单价竞价分列表视图/详情试图
   * 特殊处理单一物料下不展示列表视图
   * */
  queryUntiPriceDetail = async (options) => {
    const { offerPriceViewFlag } = this.state;

    const lessThanTwoItemLines = this.biddingUnitSiglePriceFlag();

    if (offerPriceViewFlag || lessThanTwoItemLines) {
      await this.queryUnitPriceDetailViewList();
      if (lessThanTwoItemLines) {
        const firstLineRecord = this.quotationDetailViewListDS.get(0);
        if (!firstLineRecord) {
          return;
        }
        const firstId = firstLineRecord.get('biddingSupLineCurId');
        if (firstId) {
          this.setState({
            offerPriceViewFlag: 1,
            biddingSupLineCurId: firstId,
          });
          this.setCurrentRecordDataIntoDetailViewFormDS(firstLineRecord);
        }
      }
      await this.queryUnitPriceDetailViewFormInfo();
    } else {
      await this.queryUnitPriceSummaryTable(options);
    }
  };

  // 单价竞价 列表视图 - list查询
  queryUnitPriceSummaryTable = async (data = {}) => {
    const { match: { params } = {} } = this.props;
    // const { headerInfo } = this.state;
    const { rfxLineSupplierId } = params || {};
    idValidation(rfxLineSupplierId);
    const { otherData = {}, queryParams = {}, unitPriceListViewTableAutoCalcFlag = 1 } = data || {};
    const { page } = queryParams || {};

    this.quotationLineDS.setQueryParameter('commonProps', {
      ...(otherData || {}),
      organizationId: this.organizationId,
      rfxLineSupplierId,
      customizeUnitCode: this.getCustomizeUnitCode(['unitPriceTable', 'unitPriceTableSearch']),
    });

    const currentPage = page ?? this.quotationLineDS.currentPage;

    await this.quotationLineDS.query(currentPage);

    // 计算单价
    if (unitPriceListViewTableAutoCalcFlag) {
      await this.unitPriceWholeBatchPriceRecalculateTablePrice();
      this.unitPriceWholeBatchPriceRecalculateTablePriceAmount();

      this.getUnitPriceLineFloatType();
    }

    // 处理单一物料下不展示列表视图，直接打开详情
    if (this.biddingUnitSiglePriceFlag() && this.quotationLineDS?.length) {
      const currentRecord = this.quotationLineDS.get(0);
      if (!currentRecord) {
        return;
      }

      this.offerPrice(currentRecord);
    }
  };

  // 整单批量出价-列表视图重新计算单价
  @action
  unitPriceWholeBatchPriceRecalculateTablePrice = () => {
    if (this.biddingUnitWholeBatchPriceFlag()) {
      this.quotationLineDS.forEach(() => {
        // this.afterFetchRecalculate({ record }); // 产品要求单价批量不做自动计算，11-28
        // this.unitPriceWholeBatchPriceRecalculateTableLineAmount({ record });
      });
    }
  };

  // 整单批量出价-列表视图重新计算每行行金额
  unitPriceWholeBatchPriceRecalculateTableLineAmount = (data) => {
    const { dynamicChangePrice } = this.biddingHallContentRef || {};

    if (dynamicChangePrice) {
      dynamicChangePrice(data);
    }
  };

  // 整单批量出价-列表视图重新计算总金额
  unitPriceWholeBatchPriceRecalculateTablePriceAmount = () => {
    const { calcQuotationTableSummaryQuotationAmount } = this.biddingHallContentRef || {};

    if (calcQuotationTableSummaryQuotationAmount) {
      calcQuotationTableSummaryQuotationAmount();
    }
  };

  // 单价-整单-记录行数据的浮动方式
  getUnitPriceLineFloatType = () => {
    const { unitPriceLineFloatType } = this.state;
    if (unitPriceLineFloatType) {
      return;
    }

    let newFloatTypeValue = null;

    this.quotationLineDS.forEach((record) => {
      const floatType = record.get('floatType');
      if (!newFloatTypeValue) {
        newFloatTypeValue = floatType;
      }
    });

    newFloatTypeValue = newFloatTypeValue || 'money';
    this.setState({
      unitPriceLineFloatType: newFloatTypeValue,
    });
  };

  // 单价竞价 详情列表
  @action
  queryUnitPriceDetailViewList = async (data = {}) => {
    const { match: { params } = {} } = this.props;

    const { rfxLineSupplierId } = params || {};
    idValidation(rfxLineSupplierId);
    const { otherData = {} } = data || {};

    this.quotationDetailViewListDS.setQueryParameter('commonProps', {
      ...(otherData || {}),
      organizationId: this.organizationId,
      rfxLineSupplierId,
      customizeUnitCode: this.getCustomizeUnitCode(['unitPricePlaceCard']),
    });

    await this.quotationDetailViewListDS.query();
    await this.unitPriceGetCurrentRecord(this.quotationDetailViewListDS);

    this.watchListDataChangeTimer = setInterval(
      () => this.watchListDataTime(this.quotationDetailViewListDS),
      RefreshInterval
    );
  };

  // unit price query params
  getUnitPriceDetailViewFormQueryParams = (data) => {
    const { match: { params } = {} } = this.props;
    const { otherData = {} } = data || {};
    const { biddingSupLineCurId } = this.state;
    const { rfxLineSupplierId } = params || {};

    let customizeUnitCode = this.getCustomizeUnitCode([
      'unitPriceDetailViewForm',
      'unitPriceDetailItemViewForm',
    ]);
    if (this.getTotalPriceFlag()) {
      customizeUnitCode = this.getCustomizeUnitCode(['totalPriceDetailViewForm']);
    }

    const commonParams = {
      ...(otherData || {}),
      organizationId: this.organizationId,
      rfxLineSupplierId,
      biddingSupLineCurId,
      customizeUnitCode,
      querys: {
        customizeUnitCode,
      },
    };

    return commonParams;
  };

  // 单价/总价竞价 详情表单和报价历史
  queryUnitPriceDetailViewFormInfo = async (data = {}) => {
    const { otherData = {}, record, disableQueryBiddingFlag = 0, disabledQueryDetailForm = 0 } =
      data || {};

    const commonParams = this.getUnitPriceDetailViewFormQueryParams({
      otherData,
    });

    this.detailViewFormDS.setQueryParameter('commonProps', {
      customizeUnitCode: this.getCustomizeUnitCode([
        'unitPriceDetailViewForm',
        'unitPriceDetailItemViewForm',
      ]),
      ...commonParams,
    });

    if (!disabledQueryDetailForm) {
      const detailViewFormData = await this.detailViewFormDS.query();

      const formData = detailViewFormData || {};
      this.detailViewItemInfoFormDS.loadData([formData]);
    }

    if (!disableQueryBiddingFlag) {
      await this.queryBiddingHistory({ record });
    }

    await this.afterFetchRecalculate({
      record: this.detailViewFormDS?.current,
    });
  };

  // 浏览器切回后，查询出价信息表单后，只更新部分字段
  queryPriceDetailViewFormInfoAndUpdatePartialFields = async () => {
    const { current } = this.detailViewFormDS || {};
    if (!current) {
      return;
    }
    const commonParams = this.getUnitPriceDetailViewFormQueryParams();

    let result = null;
    let newData = null;
    try {
      if (this.getUnitPriceFlag()) {
        result = await fetchSupplierUnitBiddingDetailViewForm(commonParams);
      }
      if (this.getTotalPriceFlag()) {
        result = await fetchSupplierTotalBiddingDetailViewForm(commonParams);
      }
      result = getResponse(result);
      if (!result) {
        return;
      }

      const {
        currentDateTime,
        headerQuotationEndDate,
        headerQuotationStartDate,
        startingTrialBiddingEndDate,
        startingTrialBiddingStartDate,
        displayBiddingSupHeaderStatus,
        trialBiddingQueryFlag,
        trialBiddingFlag,
        biddingSupplementPriceStartDate,
        biddingSupplementPriceEndDate,
        biddingSupplementPriceRunningFlag,
        biddingSupplementPriceNotStartFlag,
        signInEndDate,
        lineQuotationEndDate,
        lineQuotationStartDate,
        lineTrialQuotationEndDate,
        lineTrialQuotationStartDate,
        biddingAutoDeferStartDate,
      } = result || {};

      newData = {
        // common
        currentDateTime,
        trialBiddingQueryFlag,
        trialBiddingFlag,
        headerQuotationEndDate,
        headerQuotationStartDate,
        startingTrialBiddingEndDate,
        startingTrialBiddingStartDate,
        signInEndDate,
        biddingAutoDeferStartDate,

        // unit price
        lineQuotationEndDate,
        lineQuotationStartDate,
        lineTrialQuotationEndDate,
        lineTrialQuotationStartDate,

        // total price
        displayBiddingSupHeaderStatus,
        biddingSupplementPriceStartDate,
        biddingSupplementPriceEndDate,
        biddingSupplementPriceRunningFlag,
        biddingSupplementPriceNotStartFlag,
      };

      const UpdateFieldObject = filterNullValueObject(newData || {});
      current.set(UpdateFieldObject || {});
    } catch (e) {
      throw e;
    }
  };

  // 前端实时计算页面状态
  watchListDataTime = (ds) => {
    const { length } = ds || {};
    if (!length) {
      this.clearWatchListDataChangeTimer();
      return;
    }

    ds.forEach((record) => {
      if (!record) {
        return;
      }

      const {
        // currentDateTime,
        // lineTrialQuotationStartDate,
        // lineTrialQuotationEndDate,
        // lineQuotationStartDate,
        // lineQuotationEndDate,
        // trialBiddingQueryFlag,
        displayBiddingSupLineStatus,
      } = record.get([
        'currentDateTime',
        // 'lineTrialQuotationStartDate',
        // 'lineTrialQuotationEndDate',
        // 'lineQuotationStartDate',
        // 'lineQuotationEndDate',
        // 'trialBiddingQueryFlag',
        'displayBiddingSupLineStatus',
      ]);

      const status = displayBiddingSupLineStatus;

      if (status === 'NOT_START' || status === 'IN_PROGRESS') {
        this.calculateLineStatusAndEstimatedStartDate(record);
      }
    });
  };

  // 竞价记录
  queryBiddingHistory = (data = {}) => {
    const { otherData = {}, record } = data || {};
    const currentRecord = record || this.getUnitPriceOfferPriceViewCurrentRecordFromList();
    if (isEmpty(currentRecord)) {
      return;
    }

    const { match: { params } = {} } = this.props;
    const { biddingSupLineCurId, headerInfo = {} } = this.state;
    const { rfxLineSupplierId } = params || {};

    const {
      biddingQuotationMethod,
      benchmarkPriceType,
      openRule,
      rfxHeaderId,
      headerQuotationEndDate,
      trialBiddingFlag,
      tenantId,
      trialBiddingQueryFlag,
      biddingRoundNumber,
    } = headerInfo || {};

    const { roundNumber, rfxLineItemId } = currentRecord?.get([
      'trialBiddingFlag',
      'roundNumber',
      'rfxLineItemId',
    ]);

    const imporanttFieldEmptyFlag =
      !biddingQuotationMethod || !benchmarkPriceType || !openRule || !roundNumber;
    if (imporanttFieldEmptyFlag) {
      return;
    }

    idValidations([this.organizationId, rfxLineSupplierId, rfxHeaderId, rfxLineItemId]);

    const commonParams = {
      ...(otherData || {}),
      organizationId: this.organizationId,
      rfxLineSupplierId,
      biddingSupLineCurId,
      trialBiddingFlag,
      biddingQuotationMethod,
      benchmarkPriceType,
      openRule,
      rfxHeaderId,
      roundNumber,
      rfxLineItemId,
      headerQuotationEndDate,
      trialBiddingQueryFlag, // 单据status 处于试竞价中
      tenantId,
      biddingRoundNumber,
    };

    this.judgeBiddingRecordFetchFlag(); // 竞价记录查询前校验
    this.biddingHistoryDS.setQueryParameter('commonProps', {
      ...commonParams,
    });
    if (this.disabledQueryBiddingRecord) {
      return;
    }

    this.biddingHistoryDS.query();
  };

  // 排名刷新接口查询-组装参数
  getRefreshQueryParamData = (data) => {
    const { srmSsrcBiddingHallSupplierRefreshPollingCancelled = 1 } = window || {};
    const { match: { params } = {} } = this.props;
    const { otherData = {} } = data || {};
    const { headerInfo = {}, offerPriceViewFlag } = this.state;
    const { rfxLineSupplierId } = params || {};

    const { biddingUnitPriceRule, biddingTarget } =
      this.ruleDS?.current?.get(['biddingUnitPriceRule', 'biddingTarget']) || {};

    const {
      trialBiddingFlag,
      biddingQuotationMethod,
      benchmarkPriceType,
      openRule,
      rfxHeaderId,
      tenantId,
      roundNumber,
      biddingSupHeaderId,
      biddingHeaderRuleId,
      biddingSupHeaderCurId,
      biddingRoundNumber,
    } = headerInfo || {};

    const anyEmptyFlag =
      isNil(trialBiddingFlag) ||
      !biddingQuotationMethod ||
      !benchmarkPriceType ||
      !openRule ||
      !rfxHeaderId ||
      !rfxLineSupplierId;
    if (anyEmptyFlag) {
      return;
    }

    const headerData = {
      trialBiddingFlag,
      biddingQuotationMethod,
      benchmarkPriceType,
      openRule,
      rfxHeaderId,
      rfxLineSupplierId,
      tenantId,
      organizationId: this.organizationId,
      roundNumber,
      biddingSupHeaderId,
      biddingHeaderRuleId,
      biddingSupHeaderCurId,
      biddingRoundNumber,
    };

    const rfxLineItemIds = [];
    if (this.getUnitPriceFlag()) {
      let currentListDS = [];

      if (offerPriceViewFlag) {
        currentListDS = this.quotationDetailViewListDS;
      } else {
        currentListDS = this.quotationLineDS;
      }

      // 从对应的列表中取每行的数据组装
      currentListDS.forEach((lineRecord) => {
        if (!lineRecord) {
          return;
        }

        const { rfxLineItemId } = lineRecord.get(['rfxLineItemId']);
        const validateId = !rfxLineItemId;
        if (validateId) {
          return;
        }

        rfxLineItemIds.push(rfxLineItemId);
      });

      if (isEmpty(rfxLineItemIds)) {
        return;
      }
    }

    return {
      ...otherData,
      ...headerData,
      rfxLineItemIds,
      biddingUnitPriceRule,
      biddingTarget,
      srmSsrcBiddingHallSupplierRefreshPollingCancelled,
    };
  };

  // 任何供应商提交后，socket 推送flag，单价竞价-需要部分刷新前端字段
  @Debounce(DelayRefreshPageTime)
  queryRefreshLineData = async () => {
    const { offerPriceViewFlag } = this.state;

    // bidding end
    if (this.biddingFinished()) {
      return;
    }

    const queryData = this.getRefreshQueryParamData();
    let queryBiddingHistoryFlag = true;

    const currentBritish = this.britishBidding(); // 英
    const currentJapanOrDutch = this.japOrDutchBidding(); // 日/荷兰
    const currentTotalBidding = this.getTotalPriceFlag(); // 总价
    const currentUnitBidding = this.getUnitPriceFlag(); // 单价

    if (isEmpty(queryData)) {
      return;
    }

    let result = null;
    let api = null;
    try {
      if (currentBritish) {
        if (currentUnitBidding) {
          api = quotationRefreshLine;
        }
        if (currentTotalBidding) {
          api = totalQuotationRefreshLine;
        }
      }

      // 日/荷兰
      if (currentJapanOrDutch) {
        if (currentTotalBidding) {
          api = japanDutchTotalQuotationRefreshLine;
        }
      }

      if (!api) {
        return;
      }

      result = await api(queryData);
      result = getResponse(result);
      if (!result) {
        return;
      }

      if (currentBritish) {
        if (currentUnitBidding) {
          if (offerPriceViewFlag) {
            this.refreshLineDataAfterQuery(result, this.detailViewFormDS);
            this.refreshLineDataAfterQuery(result, this.quotationDetailViewListDS);
            await this.afterFetchRecalculate({ record: this.detailViewFormDS?.current });
          } else {
            queryBiddingHistoryFlag = false; // 单价-列表视图-不需要查询竞价历史
            this.refreshLineDataAfterQuery(result, this.quotationLineDS);
            await this.unitPriceWholeBatchPriceRecalculateTablePrice();
          }
        }

        if (currentTotalBidding) {
          this.refreshHeaderDataAfterQuery(result, this.detailViewFormDS);
          await this.afterFetchRecalculate({ record: this.detailViewFormDS?.current });
        }
      }

      // 日/荷兰
      if (currentJapanOrDutch) {
        if (currentTotalBidding) {
          this.refreshJapanDutchHeaderPartialLogicData({
            result,
            currentDS: this.detailViewFormDS,
            queryData,
          });
        }
      }

      if (queryBiddingHistoryFlag && !this.japOrDutchBiddingTotalPrice()) {
        this.queryBiddingHistory();
      }

      this.queryProcessNodeData();
    } catch (e) {
      throw e;
    }
  };

  /**
   * 日式，荷兰 更新 部分字段
   *
   */
  refreshJapanDutchHeaderPartialLogicData = (params = {}) => {
    const { result, currentDS } = params || {};
    const { current: detailViewFormCurrent } = currentDS || {};
    const emptyFlag = !result || !detailViewFormCurrent;
    if (emptyFlag) {
      return;
    }

    const {
      biddingRoundSupplierStatus,
      biddingRoundSupplierStatusMeaning,
      supplierStatus,
      currentBiddingRoundPrice,
      qtnTotalAmount,
      qtnNetAmount,
      nextBiddingRoundPrice,
      validQtnTotalAmount,
      validQtnNetAmount,
      currentBiddingRoundNumber,
      displayBiddingSupHeaderStatus,
      displayBiddingSupHeaderStatusMeaning,
      signInEndDate,
      startingTrialBiddingEndDate,
      headerQuotationEndDate,
      headerQuotationStartDate,
      currentDateTime,
      roundAdvanceEndFlag,
      trialBiddingFlag,
      currentBiddingRoundAcceptCount,
      quotationStatus,
      quotationStatusMeaning,
      biddingEstimatedRoundNumber,
      biddingTrialBiddingFlag,
      currentBiddingRoundEndDate,
    } = result || {};

    let newData = {};

    newData = {
      biddingRoundSupplierStatus,
      biddingRoundSupplierStatusMeaning,
      currentDateTime,
      headerQuotationEndDate,
      headerQuotationStartDate,
      supplierStatus,
      currentBiddingRoundPrice,
      qtnTotalAmount,
      qtnNetAmount,
      nextBiddingRoundPrice,
      validQtnTotalAmount,
      validQtnNetAmount,
      currentBiddingRoundNumber,
      displayBiddingSupHeaderStatus,
      displayBiddingSupHeaderStatusMeaning,
      signInEndDate,
      startingTrialBiddingEndDate, // 多轮提前截止标识
      roundAdvanceEndFlag,
      trialBiddingFlag,
      currentBiddingRoundAcceptCount,
      quotationStatus,
      quotationStatusMeaning,
      biddingEstimatedRoundNumber,
      biddingTrialBiddingFlag,
      currentBiddingRoundEndDate,
    };

    runInAction(() => {
      this.updateStateOfHeaderInfo(newData);

      this.updateRecordValuesWithObject(detailViewFormCurrent, newData);

      this.handleRefreshHeaderEvents({ data: newData });
    });
  };

  // 日/荷兰 refresh 后处理逻辑
  handleRefreshHeaderEvents = (param) => {
    this.formalBiddingEliminateWraning(param);
  };

  /**
   * 日/荷兰 正式竞价中，如果淘汰，弹窗提示返回列表
   * 后端处理
   */
  @Debounce(1500)
  formalBiddingEliminateWraning = (param) => {
    const { headerInfo } = this.state;
    const { biddingEliminateRoundNumber } = headerInfo || {};
    const { data } = param || {};
    const { retListPageFlag = 0 } = data || {};

    if (retListPageFlag && biddingEliminateRoundNumber) {
      Modal.info({
        keyboardClosable: false, // 按 esc 键是否允许关闭
        key: 'ssrc-bidding-hall-supplier-eliminate-modal',
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('ssrc.biddingHall.view.title.formalEliminateAndBackToList', {
            biddingEliminateRoundNumber,
          })
          .d(
            '由于您连续{biddingEliminateRoundNumber}轮未接受，您无法参与后续的竞价过程，因此无法查看竞价大厅。'
          ),
        onOk: this.directToList,
      });
    }
  };

  // 总价页面 缓存接口-刷新页面数据
  refreshHeaderDataAfterQuery = (result, currentDS) => {
    const { biddingSupRemote } = this.props;
    const {
      biddingSupHeaderDTO,
      biddingHeaderRule,
      currentDateTime,
      minOrMaxBiddingSupHeaderDTO,
      allSupplierQuotedCount = null,
    } = result || {};

    const emptyFlag = !result || !currentDS?.length;
    if (emptyFlag) {
      return;
    }

    const { quotationStartDate, quotationEndDate } = biddingHeaderRule || {};
    const { supplierDeferCount } = biddingSupHeaderDTO || {};

    runInAction(() => {
      [biddingSupHeaderDTO || {}].forEach((data = {}) => {
        const {
          // rfxLineItemId,
          biddingQuotationRank,
          trendFlag,
          trafficLight,
        } = data || {};

        const currentRecord = currentDS.current;
        if (isEmpty(currentRecord)) {
          return;
        }

        const { lowestQuotationPrice, lowestDisplaySupplierName } =
          minOrMaxBiddingSupHeaderDTO || {};

        // displayQuotationPrice
        const {
          prequalEndDate,
          // lineTrialQuotationStartDate,
          // lineTrialQuotationEndDate,
          // lineQuotationStartDate,
          // lineQuotationEndDate,
          startingTrialBiddingEndDate,
          startingTrialBiddingStartDate,
          signInEndDate,

          // TODO TOTAL PRICE FIELDS
          headerQuotationEndDate,
          headerQuotationStartDate,
          // headerTrialQuotationEndDate,
          // headerTrialQuotationStartDate,
          checkFinishedDate,
        } =
          currentRecord?.get([
            'prequalEndDate',
            'lineTrialQuotationStartDate',
            'lineTrialQuotationEndDate',
            'lineQuotationStartDate',
            'lineQuotationEndDate',
            'startingTrialBiddingEndDate',
            'startingTrialBiddingStartDate',
            'signInEndDate',

            'headerQuotationEndDate',
            'headerQuotationStartDate',
            // 'headerTrialQuotationEndDate',
            // 'headerTrialQuotationStartDate',
            'checkFinishedDate',
          ]) || {};

        const currentEndDate = quotationEndDate || headerQuotationEndDate;
        const currentStartDate = quotationStartDate || headerQuotationStartDate;

        let fields = [];

        fields = [
          ['lowestQuotationPrice', lowestQuotationPrice],
          ['lowestDisplaySupplierName', lowestDisplaySupplierName],
          ['biddingQuotationRank', biddingQuotationRank],
          ['trendFlag', trendFlag],
          ['trafficLight', trafficLight],
          ['prequalEndDate', prequalEndDate],
          ['signInEndDate', signInEndDate],
          ['currentDateTime', currentDateTime],
          ['lineQuotationStartDate', currentStartDate], // 适配calculateLineStatusAndEstimatedStartDate行状态计算增加的字段
          ['lineQuotationEndDate', currentEndDate], // 适配calculateLineStatusAndEstimatedStartDate行状态计算增加的字段
          ['headerQuotationEndDate', currentEndDate],
          ['headerQuotationStartDate', currentStartDate],
          ['startingTrialBiddingEndDate', startingTrialBiddingEndDate],
          ['startingTrialBiddingStartDate', startingTrialBiddingStartDate],
          ['checkFinishedDate', checkFinishedDate],
          ['allSupplierQuotedCount', allSupplierQuotedCount],
          ['supplierDeferCount', supplierDeferCount],
        ];

        if (currentEndDate) {
          this.updateStateOfHeaderInfo({
            headerQuotationEndDate: currentEndDate,
            currentDateTime,
          });
        }

        fields = biddingSupRemote
          ? biddingSupRemote.process(
              'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_REFRESH_HEADER_DATA',
              fields,
              {
                that: this,
                currentRecord,
                data,
                result,
                currentDS,
              }
            )
          : fields;

        this.updateRecordValidValue(currentRecord, fields);
        this.calculateLineStatusAndEstimatedStartDate(currentRecord);
      });
    });
  };

  /**
   * 任何供应商提交后，socket 推送flag，总价竞价-需要部分刷新前端字段
   * */
  refreshLineDataAfterQuery = (result, currentDS) => {
    const { biddingSupRemote } = this.props;
    const {
      biddingSupLineCurDTOS,
      minOrMaxBiddingSupLineMap,
      biddingSupHeaderDTO,
      biddingHeaderRule,
      currentDateTime,
      allSupplierQuotedCount = null,
      allSupplierQuotedCountMap = null,
    } = result || {};

    const emptyFlag = !result || !currentDS?.length;
    if (emptyFlag) {
      return;
    }

    let currentDTOS = biddingSupLineCurDTOS || biddingSupHeaderDTO;
    if (!Array.isArray(currentDTOS)) {
      currentDTOS = [currentDTOS || {}];
    }

    const { quotationStartDate, quotationEndDate } = biddingHeaderRule || {};
    let currentQuotationCount = allSupplierQuotedCount;

    runInAction(() => {
      if (quotationEndDate) {
        // 延时竞价-每次延时需要更新头时间
        this.updateStateOfHeaderInfo({
          headerQuotationEndDate: quotationEndDate,
          currentDateTime,
        });
      }

      currentDS.forEach((record) => {
        const { rfxLineItemId } = record.get(['rfxLineItemId']) || {};

        if (!rfxLineItemId) {
          return;
        }

        const { lowestQuotationPrice = null, lowestDisplaySupplierName = null } =
          minOrMaxBiddingSupLineMap?.[rfxLineItemId] || {};

        let currentHeaderDto = null;
        if (!isEmpty(currentDTOS)) {
          currentHeaderDto = currentDTOS.find((item) => item.rfxLineItemId === rfxLineItemId);
        }

        if (allSupplierQuotedCountMap) {
          currentQuotationCount = allSupplierQuotedCountMap[rfxLineItemId];
        }

        const { biddingQuotationRank, supplierDeferCount, trendFlag = null, trafficLight } =
          currentHeaderDto || {};

        const {
          prequalEndDate,
          lineTrialQuotationStartDate,
          lineTrialQuotationEndDate,
          lineQuotationStartDate,
          lineQuotationEndDate,
          startingTrialBiddingEndDate,
          startingTrialBiddingStartDate,
          signInEndDate,
          checkFinishedDate,
        } =
          record?.get([
            'prequalEndDate',
            'lineTrialQuotationStartDate',
            'lineTrialQuotationEndDate',
            'lineQuotationStartDate',
            'lineQuotationEndDate',
            'startingTrialBiddingEndDate',
            'startingTrialBiddingStartDate',
            'signInEndDate',
            'checkFinishedDate',
          ]) || {};

        // 竞价目前只有并行，所以line/header保持一致
        const currentLineQuotationEndDate = quotationEndDate || lineQuotationEndDate;
        const currentLineQuotationStartDate = quotationStartDate || lineQuotationStartDate;

        let fields = [];

        if (this.getUnitPriceFlag()) {
          fields = [
            ['lowestQuotationPrice', lowestQuotationPrice],
            ['lowestDisplaySupplierName', lowestDisplaySupplierName],
            ['biddingQuotationRank', biddingQuotationRank],
            ['trendFlag', trendFlag],
            ['trafficLight', trafficLight],
            ['prequalEndDate', prequalEndDate],
            ['signInEndDate', signInEndDate],
            ['currentDateTime', currentDateTime],
            ['lineTrialQuotationStartDate', lineTrialQuotationStartDate],
            ['lineTrialQuotationEndDate', lineTrialQuotationEndDate],
            ['lineQuotationStartDate', currentLineQuotationStartDate],
            ['lineQuotationEndDate', currentLineQuotationEndDate],
            ['startingTrialBiddingEndDate', startingTrialBiddingEndDate],
            ['startingTrialBiddingStartDate', startingTrialBiddingStartDate],
            ['headerQuotationEndDate', currentLineQuotationEndDate],
            ['latestQuotationEndDate', currentLineQuotationEndDate],
            ['headerQuotationStartDate', currentLineQuotationStartDate],
            ['checkFinishedDate', checkFinishedDate],
            ['allSupplierQuotedCount', currentQuotationCount],
            ['supplierDeferCount', supplierDeferCount],
          ];
        }

        fields = biddingSupRemote
          ? biddingSupRemote.process(
              'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_REFRESH_LINE_DATA',
              fields,
              {
                that: this,
                record,
                result,
                currentDS,
                currentDTOS,
                currentHeaderDto,
              }
            )
          : fields;

        this.updateRecordValidValue(record, fields);
        this.calculateLineStatusAndEstimatedStartDate(record);
      });
    });
  };

  /**
   * 计算行状态以及预计字段显示
   */
  calculateLineStatusAndEstimatedStartDate = (record = {}) => {
    // 总价-补充单价阶段 无法拿到时间吗计算状态，导致错误，所以先去掉
    if (this.getTotalPriceFlag()) {
      return;
    }

    const { lovs } = this.state;
    const { lineStatus } = lovs || {};
    if (!record || isEmpty(lineStatus)) {
      return;
    }

    let status = '';
    let statusMeaning = '';
    const {
      prequalEndDate = null,
      currentDateTime = null,
      lineTrialQuotationStartDate = null,
      lineTrialQuotationEndDate = null,
      lineQuotationStartDate = null,
      lineQuotationEndDate = null,
      estimatedStartDate = null,
      startingTrialBiddingEndDate = null,
      checkFinishedDate = null,
    } =
      record?.get?.([
        'prequalEndDate',
        'currentDateTime',
        'lineTrialQuotationStartDate',
        'lineTrialQuotationEndDate',
        'lineQuotationStartDate',
        'lineQuotationEndDate',
        'estimatedStartDate',
        'startingTrialBiddingEndDate',
        'checkFinishedDate',
      ]) || {};

    let currentEstimatedStartDate = estimatedStartDate;

    /**
     * 资格预审截止时间<当前时间<试竞价开始时间
     * 资格预审截止时间<试竞价结束时间<当前时间<竞价开始时间
     *
     * 没有资格预审、试竞价时:
     * 比如没有资格预审，判断条件变为：1.当前时间<试竞价开始时间；2.试竞价结束时间<当前时间<竞价开始时间
     *
     */
    const notStartTrialWithPrequalFlag =
      prequalEndDate < currentDateTime && currentDateTime < lineTrialQuotationStartDate;
    const notStartBiddingWithPrequalFlag =
      prequalEndDate < lineTrialQuotationEndDate &&
      lineTrialQuotationEndDate < currentDateTime &&
      currentDateTime < lineQuotationStartDate;
    const notStartTrialNotPrequalFlag = currentDateTime < lineTrialQuotationStartDate;
    const notStartBiddingNotPrequalFlag =
      lineTrialQuotationEndDate < currentDateTime && currentDateTime < lineQuotationStartDate;

    const notStartFlag =
      (prequalEndDate && (notStartTrialWithPrequalFlag || notStartBiddingWithPrequalFlag)) ||
      (!prequalEndDate && (notStartTrialNotPrequalFlag || notStartBiddingNotPrequalFlag));

    if (notStartFlag) {
      status = 'NOT_START';
      if (notStartTrialWithPrequalFlag) {
        currentEstimatedStartDate = lineTrialQuotationStartDate;
      }
      if (notStartBiddingWithPrequalFlag) {
        currentEstimatedStartDate = lineQuotationStartDate;
      }
    }

    /**
     * 1.试竞价开始时间<当前时间<试竞价结束时间
     * 2.竞价开始时间<当前时间<竞价结束时间
     */
    const processTrialFlag =
      lineTrialQuotationStartDate < currentDateTime && currentDateTime < lineTrialQuotationEndDate;
    const processBiddingFlag =
      lineQuotationStartDate < currentDateTime && currentDateTime < lineQuotationEndDate;

    const progressFlag = processTrialFlag || processBiddingFlag;
    if (progressFlag) {
      status = 'IN_PROGRESS';
      if (processTrialFlag) {
        currentEstimatedStartDate = lineTrialQuotationEndDate;
      }
      if (processBiddingFlag) {
        currentEstimatedStartDate = lineQuotationEndDate;
      }
    }

    /**
     * 竞价单中的【试竞价截止时间】未到，物料行的试竞价结束时间<当前时间。

      物料行的竞价结束时间<当前时间<完成时间，完成时间指的是核价完成时间。
    */
    let biddingEndHeaderAndLineFlag = false;
    let biddingEndLineEndWithFinishFlag = false;
    if (currentDateTime && startingTrialBiddingEndDate && lineTrialQuotationEndDate) {
      biddingEndHeaderAndLineFlag =
        currentDateTime < startingTrialBiddingEndDate &&
        startingTrialBiddingEndDate < lineTrialQuotationEndDate &&
        lineTrialQuotationEndDate < currentDateTime;
    }

    if (lineQuotationEndDate && currentDateTime) {
      biddingEndLineEndWithFinishFlag = lineQuotationEndDate < currentDateTime;

      if (checkFinishedDate) {
        biddingEndLineEndWithFinishFlag =
          lineQuotationEndDate < currentDateTime && currentDateTime < checkFinishedDate;
      }
    }

    const biddingEndFlag = biddingEndHeaderAndLineFlag || biddingEndLineEndWithFinishFlag;
    if (biddingEndFlag) {
      status = 'BIDDING_END';
      if (biddingEndHeaderAndLineFlag) {
        currentEstimatedStartDate = lineTrialQuotationEndDate;
      }
      if (biddingEndLineEndWithFinishFlag) {
        currentEstimatedStartDate = lineQuotationEndDate;
      }
    }

    if (status) {
      const statusObj = lineStatus.find((current) => current?.value === status);
      if (statusObj) {
        statusMeaning = statusObj?.meaning || null;
      }
    }

    status = status || null;
    statusMeaning = statusMeaning || null;
    currentEstimatedStartDate = currentEstimatedStartDate || null;

    let StatusAndEstimatedField = [];

    if (this.getUnitPriceFlag()) {
      StatusAndEstimatedField = [
        ['displayBiddingSupLineStatus', status],
        ['displayBiddingSupLineStatusMeaning', statusMeaning],
        ['estimatedStartDate', currentEstimatedStartDate],
      ];
    }
    if (this.getTotalPriceFlag()) {
      StatusAndEstimatedField = [
        ['displayBiddingSupHeaderStatus', status || null],
        ['displayBiddingSupHeaderStatusMeaning', statusMeaning],
        ['estimatedStartDate', currentEstimatedStartDate],
      ];
    }

    this.updateRecordValidValue(record, StatusAndEstimatedField);
  };

  @action
  updateRecordValuesWithObject = (record, obj = {}) => {
    if (!record || isEmpty(obj)) {
      return;
    }

    const newData = filterNullValueObject(obj);

    record.set(newData);
    record.set('status', 'update');
  };

  // update field by name
  @action
  updateRecordValidValue = (record, list = []) => {
    if (!record || isEmpty(list)) {
      return;
    }

    list.forEach((item = []) => {
      const [name, value] = item || [];
      if (isNil(value) || !name) {
        return;
      }

      record.set(name, value);
    });
    record.set('status', 'update');
  };

  // 单价-详情视图-从左侧数据中当前record记录赋值给中间的表单逻辑
  unitPriceGetCurrentRecord = (ds) => {
    const { biddingSupLineCurId } = this.state;
    const currentQuotationDetailViewListDS = ds || this.quotationDetailViewListDS;
    let currentRecord = null;
    if (!ds || !ds.length || !biddingSupLineCurId) {
      return;
    }

    currentRecord = currentQuotationDetailViewListDS.find(
      (record) => record.get('biddingSupLineCurId') === biddingSupLineCurId
    );

    // 试竞价，正式竞价两套数据
    if (!currentRecord) {
      if (this.detailViewFormDS) {
        this.detailViewFormDS.setState('unitPriceUpdatedFlag', 0);
      }
      currentRecord = currentQuotationDetailViewListDS.get(0);
      this.offerPrice(currentRecord);
      return;
    }

    this.setCurrentRecordDataIntoDetailViewFormDS(currentRecord);
  };

  // 单价-详情view-从左侧获取当前记录行
  getUnitPriceOfferPriceViewCurrentRecordFromList = () => {
    const { biddingSupLineCurId } = this.state;
    let currentRecord = null;

    if (
      !biddingSupLineCurId ||
      !this.quotationDetailViewListDS?.length ||
      this.getTotalPriceFlag()
    ) {
      currentRecord = this.detailViewFormDS?.current;
      return currentRecord;
    }

    currentRecord = this.quotationDetailViewListDS.find(
      (record) => record.get('biddingSupLineCurId') === biddingSupLineCurId
    );
    return currentRecord;
  };

  // 竞价规则
  fetchBiddingRules = async (otherData = {}) => {
    const { match: { params } = {} } = this.props;

    const { rfxLineSupplierId } = params || {};

    idValidation(rfxLineSupplierId);

    const data = {
      organizationId: this.organizationId,
      querys: {
        customizeUnitCode: this.getCustomizeUnitCode(['headerRule']),
      },
      rfxLineSupplierId,
      ...(otherData || {}),
    };

    let result = null;
    try {
      result = await fetchSupplierBiddingRules(data);
      result = getResponse(result);
      if (!result || isEmpty(result)) {
        return;
      }

      this.ruleDS.loadData([result]);
      this.setState({ headerRule: result }); // 后期改为使用ds
      return result;
    } catch (e) {
      throw e;
    }
  };

  // 中心提示
  messageOnCenterTop = (data) => {
    const { text = '', type = 'info' } = data || {};
    message.config({
      top: 100,
      bottom: 80,
    });

    const msg = (
      <span style={{ fontSize: '14px', fontWeight: '500', color: '1D2129' }}>{text}</span>
    );

    const destory = () => {
      // message.destroy();
    };

    if (type === 'error') {
      message.error(msg, undefined, destory, msg);
    }

    if (type === 'warning') {
      message.warning(msg, undefined, destory, msg);
    }
  };

  // close socket
  @Bind()
  closeSocket() {
    if (webSocketManagener.removeListener) {
      webSocketManagener.removeListener(this.supplierUrl, this.socketMessageSupplierEvent);
      webSocketManagener.removeListener(
        this.supplierHeadLineUrl,
        this.socketMessageSupplierHeadLineEvent
      );
    }

    if (webSocketManagener?.destroyWebSocket) {
      webSocketManagener.destroyWebSocket();
    }
  }

  /**
   * 初始化webSoket连接
   */
  @Bind()
  initWebSoketConnect() {
    if (webSocketManagener.socketStatus !== 32) {
      webSocketManagener.initWebSocket();
    }
  }

  sockerCreateLinkTimer = null; // socket 如果链接失败，需要再次链接

  socketCreateLinkCount = 0; // socket 连接-心跳

  // 定时器连接socket - 清除
  clearSockerCreateLinkTimer = () => {
    if (this.sockerCreateLinkTimer) {
      clearTimeout(this.sockerCreateLinkTimer);
    }
  };

  /**
   * 查询后重新计算逻辑
   * 输入框金额需要在每次查询后重新计算
   * 英式计算，目前日/荷不需要
   *
   *
   * options {
   *  record - current line record
   * }
   */
  afterFetchRecalculate = async (options) => {
    const { biddingSupRemote } = this.props;
    const { headerInfo, pageReadOnlyFlag, quotationInputAutoCalculateFlag = 1 } = this.state;
    const { benchmarkPriceType, defaultPrecision, financialPrecision, biddingTotalPricePrinciple } =
      headerInfo || {};
    const { record } = options || {};

    const currentRecord = record;
    if (!currentRecord || this.japOrDutchBiddingTotalPrice()) {
      return;
    }

    let autoCalculateHandle = null; // 表单视图 自动计算完价格，需要调用amountCalculation计算公式
    let name = '';
    let currentValidField = '';
    const unTaxFlag = benchmarkPriceType !== 'TAX_INCLUDED_PRICE';
    if (pageReadOnlyFlag) {
      return;
    }

    let currentPrecision = null;
    if (this.getUnitPriceFlag()) {
      name = 'currentQuotationSecPrice';
      currentValidField = 'validQuotationSecPrice';

      // 2023-10-19：标准精度埋点 捷泰科技
      const remoteDefaultPrecision = biddingSupRemote
        ? biddingSupRemote.process(
            'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_DEFAULT_PRECISION',
            defaultPrecision,
            {
              detailViewFormDS: this.detailViewFormDS,
              headerInfo,
            }
          )
        : defaultPrecision;

      currentPrecision = remoteDefaultPrecision;

      if (unTaxFlag) {
        name = 'netSecondaryPrice';
        currentValidField = 'validNetSecondaryPrice';
      }

      // amountCalculation
      autoCalculateHandle = () => {
        this.unitPriceWholeBatchPriceRecalculateTableLineAmount({ record });
      };
    }

    // 总价必输
    if (this.getTotalPriceFlag() && biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED') {
      name = 'qtnTotalAmount';
      currentValidField = 'validQtnTotalAmount';
      currentPrecision = financialPrecision;

      if (unTaxFlag) {
        name = 'qtnNetAmount';
        currentValidField = 'validQtnNetAmount';
      }
    }

    const {
      // floatType,
      startingBiddingPrice,
      biddingStrategy,
      lowestQuotationPrice,
      biddingQuotationMethod,
      openRule,
      [name]: currentQuotationPrice = null,
      [currentValidField]: validQuotaitonPrice,
    } =
      currentRecord?.get([
        // 'floatType',
        'startingBiddingPrice',
        'biddingStrategy',
        'lowestQuotationPrice',
        'biddingQuotationMethod',
        'openRule',
        name,
        currentValidField,
      ]) || {};

    const disabledAutoCalcCurrentPrice =
      quotationInputAutoCalculateFlag !== 1 ||
      (isNil(validQuotaitonPrice) && isNil(lowestQuotationPrice));

    if (disabledAutoCalcCurrentPrice) {
      return;
    }

    const pristineCurrentPriceValue = currentRecord.getPristineValue(name); // 原始值
    const calcQuotationRange = calcQuotationRangeValue(currentRecord, {
      validField: currentValidField,
    });

    // 最低价计算
    const lowestMinusQuotationRange = calcLowestMinusQuotationRange(currentRecord, {
      calcQuotationRange,
      currentValidField,
    });

    // 依据对应精度计算最低价，并格式化数字
    const formatByPrecisonLowestRange = formatLowestMinusQuotationRange({
      biddingQuotationMethod,
      lowestMinusQuotationRange,
      currentPrecision,
    });

    const data = {
      name,
      record: currentRecord,
      calcQuotationRange,
      lowestQuotationPrice,
      lowestMinusQuotationRange: formatByPrecisonLowestRange,
      pristineCurrentPriceValue,
      startingBiddingPrice,
      biddingStrategy,
      biddingQuotationMethod,
      openRule,
      currentQuotationPrice,
      currentPrecision,
      validQuotaitonPrice,
    };

    await reCalculatePriceValue(data, { needInitValue: 1 });

    if (autoCalculateHandle) {
      autoCalculateHandle();
    }
  };

  socketData = {};

  // socket data reorganization
  updateSocketData = (data) => {
    this.socketData = {
      ...(this.socketData || {}),
      ...(data || {}),
    };
  };

  /**
   * 注册发布列表连接
   */
  registerSocketConnect = (result) => {
    const { headerInfo } = this.state;
    const { organizationId } = this || {};

    if (this.socketCreateLinkCount > 15) {
      throw ReferenceError('Socket is tried multile times, please check fields is empty ?');
    }

    const { rfxNum = null, roundNumber = null, rfxHeaderId, rfxLineSupplierId } =
      result || headerInfo || {};
    const mainFieldLackFlag =
      !rfxNum || !rfxHeaderId || !rfxLineSupplierId || !roundNumber || !organizationId;
    if (mainFieldLackFlag) {
      this.socketCreateLinkCount += 1;
      this.sockerCreateLinkTimer = setTimeout(this.registerSocketConnect, TimeoutTime);
      return;
    }

    this.supplierUrl = `/topic/monitor/bidding-hall-sup/${organizationId}/${rfxHeaderId}/${roundNumber}`;

    this.supplierHeadLineUrl = `/topic/monitor/bidding-hall-sup/${organizationId}/${rfxHeaderId}/${roundNumber}/${rfxLineSupplierId}`;

    // 采购方对供应商的操作
    webSocketManagener.addListener(this.supplierUrl, this.socketMessageSupplierEvent);

    // 供应商当前单据头/行的操作
    webSocketManagener.addListener(
      this.supplierHeadLineUrl,
      this.socketMessageSupplierHeadLineEvent
    );

    this.socketCreateLinkCount = 0;
    this.clearSockerCreateLinkTimer();
  };

  socketMessageSupplierHeadLineEvent = (messageData) => {
    const data = JSON.parse(messageData?.message);
    console.log(`/topic/monitor/bidding-hall-sup/`, '2', messageData, data);
    this.updateSocketData(data);
    this.handleWebsocketMessageReceive();
  };

  @Bind()
  socketMessageSupplierEvent(messageData) {
    if (!messageData) {
      return;
    }
    const data = JSON.parse(messageData?.message);
    console.log(`/topic/monitor/bidding-hall-sup/`, '1', messageData, data);
    this.updateSocketData(data);
    this.handleWebsocketMessageReceive();
  }

  // socket 每次接受后缓存的标识和处理程序清空逻辑
  updateSocketCacheData = () => {
    this.socketData = {};
    this.lastTimeSocketMessageTimerRecordMap.clear();
  };

  @Bind()
  handleWebsocketMessageReceive() {
    // 基础信息打开弹窗，外边的副作用暂不执行，关闭弹窗
    if (this.baseInfoModalOpenFlag === 1) {
      this.updateSocketCacheData();
      return;
    }

    this.recordNeedRefreshFlagCurrentTime();
    this.handleSocketMessage();
  }

  biddingPausedSaveAndRefresh = null; // 竞价暂停并需要保存弹窗引用

  confirmOrDelayModalRef = null; // 正式 or 延时 竞价弹窗

  // start formal / delay bidding and notification - 优先级最高
  _startFormalBiddingAndNotificationList = ['biddingStartFlag', 'biddingDeferStartFlag'];

  startFormalBiddingAndNotificationList = this.props.biddingSupRemote
    ? this.props.biddingSupRemote.process(
        'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_START_NOTIFICATIONLIST',
        this._startFormalBiddingAndNotificationList,
        ''
      )
    : this._startFormalBiddingAndNotificationList;

  // refresh all page key
  allFlagLists = [
    'refreshAllFlag',
    'refreshProhibitFlag',
    'refreshFiringFlag',
    'refreshBiddingCloseFlag',
    'refreshTimeFlag',
    'refreshAllAndWarningFlag',
  ];

  // refresh content page key
  contentFlagLists = ['refreshBiddingHeaderFlag', 'refreshBiddingLineFlag'];

  // refresh rule page key
  ruleFlagList = ['refreshBiddingRuleFlag'];

  // refresh form page key (only unit price collected)
  formFlagList = ['refreshCollectionFlag'];

  // refresh all Page and modal warning
  refreshAllPageAndWarningList = ['refreshSuspendFlag', 'adjustTimeSuspendFlag'];

  // only refresh partial fields
  refreshPartialFieldsList = ['refreshQuotationInfoFlag'];

  recordEffectKeyAtMap = (key, value, handle) => {
    this.lastTimeSocketMessageTimerRecordMap.set(key, {
      flag: value,
      handle,
    });
  };

  /**
   * 记录返回标识为1的，并归纳为刷新效果存储在map中
   * lastTimeSocketMessageTimerRecordMap中的key标识的刷新效果【refreshEffect】
   * 每个key 对应返回值的多个flag中的一个
   *
   * map
   *  key -> refreshEffect: all rule content form,
   *  value -> value int message flag 1
   *        -> dynamicProps int delay invoke handle flag
   *        -> handle refreshEffect handle event
   * */
  // @Debounce(RefreshInterval)
  @Bind()
  recordNeedRefreshFlagCurrentTime() {
    const { biddingSupRemote } = this.props || {};
    const { offerPriceViewFlag, pageReadOnlyFlag, headerInfo } = this.state;
    const { displayBiddingSupHeaderStatus } = headerInfo || {};
    const data = this.socketData;
    const japanDutchTotal = this.japOrDutchBiddingTotalPrice();

    if (isEmpty(data)) {
      return;
    }

    this.closeAllModalWithOpenBySocket();

    Object.keys(data).forEach((key) => {
      if (!key) {
        return;
      }

      const value = data[key];
      if (!value) {
        return;
      }

      let refreshEffect = '';
      let handle = null;

      if (this.startFormalBiddingAndNotificationList.includes(key)) {
        refreshEffect = 'startFormalAndDelayBidding';

        let modalTitle = intl
          .get('ssrc.biddingHall.view.message.formalBiddingStartPleaseQuotate')
          .d('正式竞价已开始，请抓紧时间出价');

        if (japanDutchTotal) {
          modalTitle = intl
            .get('ssrc.biddingHall.view.message.formalBiddingStartPleaseQuotateResponse')
            .d('正式竞价已开始，请抓紧时间响应');
        }

        if (key === 'biddingDeferStartFlag' && value === 1) {
          modalTitle = intl
            .get('ssrc.biddingHall.view.message.delayBiddingStartPleaseQuotate')
            .d('延时竞价已开始，请抓紧时间出价');

          // 暂时没有延迟
          // if (japanDutchTotal) {
          //   modalTitle = intl
          //     .get('ssrc.biddingHall.view.message.delayBiddingStartPleaseQuotateResponse')
          //     .d('延时竞价已开始，请抓紧时间响应');
          // }
        }

        handle = async () => {
          await Modal.destroyAll(); // 趋势图需要关闭
          this.clearBiddingRecordCache();
          this.setState({ countDownShowAllZeroFlag: 1 });
          const _confirmModalProps = {
            key: this.startBiddingModalKey,
            title: intl.get('ssrc.common.message.tip').d('提示'),
            // cancelButton: false,
            // closable: true,
            children: <div style={{ fontSize: '14px', color: '#4E5769' }}>{modalTitle}</div>,
            onClose: () => {
              this.setState({ countDownShowAllZeroFlag: 0 });
              this.closeAllModalWithOpenBySocket();
              this.initPage();
            },
            onOk: async () => {
              this.setState({ countDownShowAllZeroFlag: 0 });
              await this.saveCurrentPageAndInitPage({ afterSaveApiRefreshPageFlag: 0 });
              await this.closeAllModalWithOpenBySocket();
            },
          };
          const confirmModalProps = biddingSupRemote
            ? biddingSupRemote.process(
                'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_START_NOTIFICATIONLIST_MODAL_PROPS',
                _confirmModalProps,
                { key, value, headerInfo, data, modalTitle, that: this }
              )
            : _confirmModalProps;
          this.confirmOrDelayModalRef = Modal.confirm(confirmModalProps);
        };
        this.lastTimeSocketMessageTimerRecordMap.clear();
        this.recordEffectKeyAtMap(refreshEffect, value, handle);
      }

      if (this.allFlagLists.includes(key)) {
        refreshEffect = 'all';
        handle = this.initPage;

        if (key === 'refreshBiddingCloseFlag') {
          handle = () => {
            this.initPage();
            this.closeAllModalWithOpenBySocket(); // 下阶段后，关闭弹窗

            const text = intl
              .get('ssrc.biddingHall.view.message.biddingIsClosed')
              .d('竞价单已关闭');
            this.messageOnCenterTop({
              text,
              type: 'error',
            });
          };
        }

        // 总价必填-补充单价-响应不足-修改时间，后端有数据变更，不能执行adjustTimeSuspendFlag中的事项
        if (key === 'refreshAllAndWarningFlag') {
          handle = () => {
            const text = intl
              .get('ssrc.biddingHall.view.message.biddingHasdjustedTime')
              .d('竞价单已调整时间');
            this.messageOnCenterTop({
              text,
              type: 'error',
            });

            this.initPage();
            this.closeAllModalWithOpenBySocket(); // 下阶段后，关闭弹窗
          };
        }
      }

      if (this.ruleFlagList.includes(key)) {
        refreshEffect = 'rule';
        handle = () => {
          this.fetchBiddingRules();
          this.fetchWarningMessageAndCount();
        };
      }

      // refresh content
      if (this.contentFlagLists.includes(key)) {
        refreshEffect = 'content';
        handle = () => {
          this.refreshContent();
          this.fetchWarningMessageAndCount();
        };
      }

      if (this.formFlagList.includes(key)) {
        refreshEffect = 'form';

        handle = () => {
          this.refreshContent();
          this.fetchWarningMessageAndCount();
        };
      }

      // 暂停/调整时间 需要提示保存页面
      if (this.refreshAllPageAndWarningList.includes(key)) {
        refreshEffect = 'biddingPausedSaveAndRefresh';

        handle = async () => {
          // 弹窗 显示
          const modalVisibleFlag =
            displayBiddingSupHeaderStatus !== 'SIGN_IN' &&
            displayBiddingSupHeaderStatus !== 'NOT_START';
          // 弹窗 允许打开
          const pausedModalOpenFlag =
            (this.getUnitPriceFlag() && offerPriceViewFlag) ||
            this.biddingUnitWholeBatchPriceFlag() ||
            this.getTotalPriceFlag(); // 单价竞价-外边列表页不需要提示

          // 弹窗
          if (key === 'refreshSuspendFlag' && pausedModalOpenFlag && modalVisibleFlag) {
            // 暂停刷新标识

            this.biddingPausedSaveAndRefresh = Modal.confirm({
              key: this.pausedModalKey,
              title: intl.get('ssrc.common.message.tip').d('提示'),
              children: (
                <div style={{ fontSize: '14px', color: '#4E5769' }}>
                  {intl
                    .get('ssrc.biddingHall.view.warning.biddingHasPausedWarningSave')
                    .d('您的竞价单已暂停，是否需要保存页面')}
                </div>
              ),
              onClose: () => {
                this.closeAllModalWithOpenBySocket();
                this.initPage();
              },
              onOk: async () => {
                await this.saveCurrentPageAndInitPage({
                  afterSaveApiRefreshPageFlag: 0,
                });
                await this.closeAllModalWithOpenBySocket();
              },
            });
          } else if (key === 'adjustTimeSuspendFlag' && pausedModalOpenFlag && modalVisibleFlag) {
            refreshEffect = 'biddingAdjustTimeToSaveAndRefresh';
            this.biddingPausedSaveAndRefresh = Modal.confirm({
              key: this.pausedModalKey,
              title: intl.get('ssrc.common.message.tip').d('提示'),
              children: (
                <div style={{ fontSize: '14px', color: '#4E5769' }}>
                  {intl
                    .get('ssrc.biddingHall.view.warning.biddingHasAdjusttedTimedWarningSave')
                    .d('您的竞价单已调整时间，是否需要保存页面')}
                </div>
              ),
              onClose: () => {
                this.closeAllModalWithOpenBySocket();
                this.initPage();
              },
              onOk: async () => {
                await this.saveCurrentPageAndInitPage({
                  afterSaveApiRefreshPageFlag: 0,
                });
                await this.closeAllModalWithOpenBySocket();
              },
            });
          } else {
            const onlyReadPageFlag = pageReadOnlyFlag || displayBiddingSupHeaderStatus === 'PAUSED';
            if (onlyReadPageFlag) {
              this.initPage();
            }

            // 只读视图下需要刷新页面，倒计时才会更新
            if (key && !pausedModalOpenFlag) {
              this.initPage();
            }
          }
        };
        this.recordEffectKeyAtMap(refreshEffect, value, handle);
      }

      if (this.refreshPartialFieldsList.includes(key)) {
        refreshEffect = 'refreshPartialFields';
        this.judgeBiddingRecordFetchFlag();
        handle = () => {
          if (biddingSupRemote?.event) {
            biddingSupRemote.event.fireEvent('handleCuxRefreshPartialFieldsFlag', {
              that: this,
              fetchSupplierBiddingHeader,
            });
          }
          this.queryRefreshLineData();
          this.fetchWarningMessageAndCount();
        };
      }

      if (refreshEffect) {
        this.lastTimeSocketMessageTimerRecordMap.set(refreshEffect, {
          flag: value,
          handle,
        });
      }
    });
  }

  // 保存当前页
  saveCurrentPageAndInitPage = async (data) => {
    const { afterSaveApiRefreshPageFlag = 1 } = data || {};

    const { offerPriceViewFlag } = this.state;
    if (this.getUnitPriceFlag()) {
      if (this.biddingUnitWholeBatchPriceFlag()) {
        // 整单批量出价
        await this.unitPriceListViewTableSave({
          afterSaveApiRefreshPageFlag,
        });
      }
      // 单价-详情视图
      if (offerPriceViewFlag) {
        await this.unitPriceDetailViewFormSave();
      }
    }
    if (this.getTotalPriceFlag()) {
      await this.totalPriceSaveHeaderLines();
    }

    await this.initPage();
  };

  // 竞价记录弹窗 记录的打开数
  clearBiddingRecordCache = () => {
    if (this.quotationDetailViewListDS) {
      this.quotationDetailViewListDS.setState('historyModalKey', null);
    }
  };

  /**
   * 关闭所有socket推送打开的modal
   * todo 趋势图先不处理，内部层级过多，没有统一存储
   * */
  closeAllModalWithOpenBySocket = () => {
    this.closeBiddingPausedSaveAndRefreshPausedModal();
    this.closeStartBiddingModal();
  };

  // 暂停提示弹窗关闭
  closeBiddingPausedSaveAndRefreshPausedModal = () => {
    const { close } = this.biddingPausedSaveAndRefresh || {}; // 防止打开多个
    if (isFunction(close)) {
      close(true);
    }
    this.biddingPausedSaveAndRefresh = null;
  };

  // 竞价开始确认弹窗-关闭
  closeStartBiddingModal = () => {
    const { close } = this.confirmOrDelayModalRef || {}; // 防止打开多个
    if (isFunction(close)) {
      close(true);
    }
    this.confirmOrDelayModalRef = null;
  };

  /**
   * socket message manager
   * 依据 lastTimeSocketMessageTimerRecordMap 中的refreshEffect做key，
   * 刷新页面,并在执行完对应刷新效果后清空对应的map->key
   * */
  @Debounce(RefreshInterval)
  @Bind()
  handleSocketMessage() {
    if (!this.lastTimeSocketMessageTimerRecordMap?.size) {
      return;
    }

    this.socketData = {};

    this.lastTimeSocketMessageTimerRecordMap.forEach((value, key, map) => {
      const { flag, handle } = value || {};
      if (!flag || !key || !handle || !map.size) {
        return;
      }

      if (key === 'startFormalAndDelayBidding') {
        handle();
        map.clear();
        return;
      }

      // refresh all Page must clear map
      if (key === 'all') {
        handle();
        map.clear();
        return;
      }

      if (key === 'rule') {
        handle();
        map.delete(key);
      }

      if (key === 'content') {
        handle();
        map.delete(key);
        map.delete('form');
      }

      if (key === 'form') {
        handle();
        map.delete(key);
      }

      // refresh all Page must clear map
      if (key === 'biddingPausedSaveAndRefresh') {
        handle();
        map.clear();
      }

      if (key === 'biddingAdjustTimeToSaveAndRefresh') {
        handle();
        map.clear();
      }

      // 刷新部分字段值
      if (key === 'refreshPartialFields') {
        handle();
        map.delete(key);
      }
    });
  }

  // chatRoomExpandQuery = async (otherData = {}) => {
  //   const data = {
  //     organizationId: this.organizationId,
  //     configKey: 'BIDDING_HALL_SUPPLIER_CHAT_ROOM_EXPAND',
  //     ...otherData,
  //   };

  //   let result = null;
  //   try {
  //     result = await fetchUserConfig(data);
  //     // this.setChatRoomExpand(result);
  //   } catch (e) {
  //     throw e;
  //   }
  // };

  // double unit
  queryDoubleUnit = async () => {
    try {
      const res = await queryEnableDoubleUnit({
        businessModule: 'RFX',
        tenantId: this.organizationId,
      });
      if (isText(res)) {
        const currentDoubleFlag = !!Number(res);
        this.setState({ doubleUnitFlag: currentDoubleFlag });
        this.totalPriceTableDS.setState('doubleUnitFlag', currentDoubleFlag);
      }
    } catch (e) {
      throw e;
    }
  };

  /**
   * 判断竞价记录不需要刷新
   * 全部，且不在分页器的第一页，禁止刷新
   */
  judgeBiddingRecordFetchFlag = () => {
    if (!this.biddingHistoryDS) {
      return;
    }

    const { currentPage } = this.biddingHistoryDS;
    const queryLatestBiddingFlag = this.biddingHistoryDS.getQueryParameter(
      'queryLatestBiddingFlag'
    );
    this.disabledQueryBiddingRecord = false;

    if (queryLatestBiddingFlag === 0 && currentPage > 1) {
      this.disabledQueryBiddingRecord = true;
    }
  };

  // front-end query lov
  queryLovs = async () => {
    const lovCodes = {
      // headerStatus: 'SSRC.REVIEW_METHOD', // 审查方式
      lineStatus: 'SSRC.DISPLAY_BIDDING_SUP_LINE_STATUS',
    };

    let data = null;
    try {
      data = await queryMapIdpValue(lovCodes);
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        lovs: data,
      });
    } catch (e) {
      throw e;
    }
  };

  // page loading
  toggleLoading = (pageLoading = false) => {
    this.pageLoadingLock = pageLoading;
    this.setState({ pageLoading });
  };

  pageOperationLockTime = null;

  // page operation loading
  togglePageOperationLoading = (loading = false, options = {}) => {
    const { delay = false, timer = 200 } = options || {};

    const updateLoading = () => {
      this.pageOperationLoadingLock = loading;
      this.setState({ pageOperationLoading: loading });
    };

    if (!delay) {
      updateLoading();
    } else {
      this.pageOperationLockTime = setTimeout(updateLoading, timer); // 复杂场景下需要延迟页面
    }
  };

  // 单价竞价-列表视图点击出价切换到详情
  @Throttle(1200)
  @Bind()
  offerPrice(record) {
    const unitPriceFlag = this.getUnitPriceFlag();
    if (!unitPriceFlag || !record) {
      return;
    }

    const biddingSupLineCurId = record.get('biddingSupLineCurId');
    if (!biddingSupLineCurId) {
      return;
    }

    this.setState(
      {
        offerPriceViewFlag: 1, // 出价详情标识
        biddingSupLineCurId,
      },
      () => {
        this.queryUnitPriceDetailViewList();
        this.queryUnitPriceDetailViewFormInfo({ record });
      }
    );
  }

  // clear unit price detail view ds
  clearUnitPriceDetailAllDS = () => {
    this.biddingHistoryDS.loadData();
    this.detailViewFormDS.loadData();
  };

  // 单价竞价-表单保存
  @Throttle(2500)
  @Bind()
  async unitPriceDetailViewFormSave(options = {}) {
    const { afterApiCancelLoading = true } = options || {};
    const { headerInfo = {} } = this.state;
    const { rfxHeaderId = null } = headerInfo || {};
    const { current } = this.detailViewFormDS;

    let flag = false;
    if (!current || !rfxHeaderId) {
      return flag;
    }

    const { formData } = await this.validateAndReorganizeDetailViewFormDSData();
    if (isEmpty(formData)) {
      return flag;
    }

    const data = {
      organizationId: this.organizationId,
      querys: {
        customizeUnitCode: this.getCustomizeUnitCode(['unitPriceDetailViewForm']),
      },
      biddingSupLineCurDTOList: [formData],
      rfxHeaderId,
    };

    let result = null;
    this.toggleLoading(true);
    try {
      result = await quotationPriceSave(data);
      result = getResponse(result);
      if (afterApiCancelLoading) {
        this.toggleLoading(false);
      }
      if (!result) {
        return flag;
      }

      notification.success();
      flag = true;
    } catch (e) {
      throw e;
    }

    return flag;
  }

  // unit price updated price fields flag
  getUnitPriceUpdatedPriceFlag = () => {
    const unitPriceUpdatedFlag = this.detailViewFormDS.getState('unitPriceUpdatedFlag');
    return unitPriceUpdatedFlag;
  };

  // unit price detail view list selected
  @Throttle(2500)
  @Bind()
  async unitPriceDetailViewListDataSelected(record) {
    const {
      headerInfo,
      biddingSupLineCurId: preBiddingSupLineCurId = null,
      pageOperationLoading,
      pageLoading,
    } = this.state;
    const { quotationOrderType, displayBiddingSupHeaderStatus } = headerInfo || {};
    const unitPriceFlag = this.getUnitPriceFlag();
    let preLineStatus = null;
    const { status } = this.quotationDetailViewListDS || {};

    const currentPageLoading =
      this.pageLoadingLock ||
      pageLoading ||
      pageOperationLoading ||
      status === 'loading' ||
      this.pageOperationLoadingLock;
    if (currentPageLoading) {
      // notification.warning({
      //   message: intl.get('hzero.common.notification.typeError.description').d('请稍后重试'),
      // });
      return;
    }

    if (!unitPriceFlag || !record) {
      return;
    }

    this.quotationDetailViewListDS.forEach((currentRecord) => {
      const { biddingSupLineCurId, displayBiddingSupLineStatus } = currentRecord.get([
        'biddingSupLineCurId',
        'displayBiddingSupLineStatus',
      ]);
      if (biddingSupLineCurId === preBiddingSupLineCurId) {
        preLineStatus = displayBiddingSupLineStatus;
      }
    });

    const { biddingSupLineCurId } = record.get(['biddingSupLineCurId']);
    if (!biddingSupLineCurId) {
      return;
    }

    this.togglePageOperationLoading(true);
    const unitPriceUpdatedFlag = this.getUnitPriceUpdatedPriceFlag();
    const needSaveFlag = unitPriceUpdatedFlag && preLineStatus === 'IN_PROGRESS'; // 单价，表单，单价字段有更新，进行中，执行保存
    if (needSaveFlag) {
      const saveFlag = await this.unitPriceDetailViewFormSave();
      if (!saveFlag) {
        this.togglePageOperationLoading(false);
        return;
      }
    }

    this.setState(
      {
        biddingSupLineCurId,
        // pageLoading: false,
      },
      () => {
        this.queryUnitPriceDetailViewFormInfo();
        this.setCurrentRecordDataIntoDetailViewFormDS(record);
      }
    );

    // 单价竞价-详情视图-序列-切换物料-重新查询
    const unitPriceSequenceDetailListRefreshFlag =
      this.getUnitPriceFlag() &&
      quotationOrderType === 'SEQUENCE' &&
      displayBiddingSupHeaderStatus === 'IN_PROGRESS';

    if (unitPriceSequenceDetailListRefreshFlag) {
      await this.quotationDetailViewListDS.query();
      await this.unitPriceGetCurrentRecord(this.quotationDetailViewListDS);
    }

    this.togglePageOperationLoading(false);
  }

  // 单价-详情视图，左侧视图记录当前行
  setCurrentRecordDataIntoDetailViewFormDS = (record) => {
    if (isEmpty(record)) {
      return;
    }

    const data = record?.toData();

    this.detailViewFormDS.setState('headerRecordData', data);
  };

  // 单价 从出价详情返回
  closeOfferPriceDetail = () => {
    this.setState(
      {
        offerPriceViewFlag: 0, // 出价详情标识
        biddingSupLineCurId: null,
      },
      () => {
        this.initPage();
      }
    );

    this.clearUnitPriceDetailAllDS();
    this.quotationDetailViewListDS.query();
  };

  // 单价 收藏
  @Throttle(1200)
  @Bind()
  async supplierCollection(record = {}, otherOption = {}) {
    if (this.getTotalPriceFlag()) {
      return;
    }
    const { headerInfo } = this.state;
    const { querys = {} } = otherOption || {};

    const { tenantId } = headerInfo || {};
    const { biddingSupLineCurId, collectionFlag = 0 } = record.get([
      'biddingSupLineCurId',
      'collectionFlag',
    ]);

    if (!biddingSupLineCurId || !tenantId) {
      return;
    }

    const param = {
      organizationId: this.organizationId,
      querys,
      biddingSupLineCurId,
      collectionFlag: collectionFlag ? 0 : 1,
      tenantId,
    };

    if (this.pageLoadingLock) {
      notification.warning({
        message: intl.get('hzero.common.notification.typeError.description').d('请稍后重试'),
      });
      return;
    }
    this.toggleLoading(true);
    try {
      let result = await supplierCollection(param);
      result = getResponse(result);
      this.toggleLoading(false);
      if (!result) {
        return;
      }

      notification.success();
      this.refreshContent();
    } catch (e) {
      throw e;
    }
  }

  /**
   * 获取对应的个性化编码
   * @param type null | string | string[]
   * @return null | string
   *  */
  getCustomizeUnitCode = (type = null) => {
    if (!type || isEmpty(type)) {
      return null;
    }

    const RfxCodeMap = new Map([
      // ['unitPriceHeader', 'SSRC.BIDDING_HALL_SUPPLIER.LINE_PRICE.HEADER_FORM'],
      ['unitPriceTable', 'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE.LINE'], // 单价-行表格
      ['unitPriceTableSearch', 'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE.LINE_SEARCH'],
      // ['unitPriceDetailViewListSearch', 'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_DETAIL.LIST'],
      [
        'unitPriceDetailItemViewForm',
        'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_DETAIL.ITEM_INFO_FORM',
      ],
      ['unitPriceBatchEdit', 'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_BATCH_EDIT'],
      ['totalPriceTable', 'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL.ITEM_LINE'],
      ['totalPriceTableBtnGroup', 'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL_BTN_GROUP'],
      ['totalPriceTableSearch', 'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL.ITEM_LINE_SEARCH'],
      ['totalPriceBatchEdit', 'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_BATCH_EDIT'],
      ['headerTag', 'SSRC.BIDDING_HALL_SUPPLIER.HEADER_TAG'],
      ['headerModalBaseInfoForm', 'SSRC.BIDDING_HALL_SUPPLIER.HEADER_BASE_INFO_MODAL_FORM'],
      [
        'headerModalBaseInfoFormDetail',
        'SSRC.BIDDING_HALL_SUPPLIER.HEADER_BASE_INFO_MODAL_FORM_DETAIL',
      ],
      ['headerBaseInfoBtns', 'SSRC.BIDDING_HALL_SUPPLIER.HEADER_BASE_INFO_MODAL_FORM_LINK_BUTTONS'],
      ['headerRule', 'SSRC.BIDDING_HALL_SUPPLIER.HEADER_RULE_FIELDS'],
      ['unitPricePlaceCard', 'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_CARD'],
      ['unitPriceTableBtns', ''],
      ['unitPriceTableBtns', 'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_TABLE_BTNS'],
      ['unitPriceDetailViewForm', 'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_DETAIL_FORM'],
      ['totalPriceDetailViewForm', 'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL_FORM'],
    ]);

    const CodeDataMap = RfxCodeMap;
    let currentUnitCode = null;

    if (typeof type === 'string') {
      currentUnitCode = CodeDataMap.get(type);
    }

    if (isArray(type)) {
      const codeSet = new Set();
      type.forEach((unitCode) => {
        codeSet.add(CodeDataMap.get(unitCode));
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  // 日/荷兰 总价必输 补充单价,并且未提交
  japanDutchTotalPriceSupplement = () => {
    const {
      biddingTotalPricePrinciple,
      biddingSupplementPriceRunningFlag,
      biddingSupplierPriceSubmitFlag, // 补充单价已提交
    } = this.getHeaderInfoFromState() || {};

    // 日/荷兰 总价必输，表单不能编辑
    const flag =
      this.japOrDutchBiddingTotalPrice() &&
      biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' &&
      biddingSupplementPriceRunningFlag &&
      !biddingSupplierPriceSubmitFlag; // 日/荷兰 只有总价必输-补充单价阶段-需要校验

    return flag;
  };

  // 单价-整单-检验变更行
  getUnitPriceTableValidateResult = async (updatedLines = []) => {
    const recordValidate = updatedLines.map((record) => record.validate(true));
    let validateResult = await Promise.all(recordValidate);
    validateResult = validateResult.every((flag) => !!flag);

    let firstLineValidateResult = '';

    if (!validateResult) {
      updatedLines.forEach((line) => {
        const currentLineValidate = line.getValidationErrors();

        if (!firstLineValidateResult) {
          firstLineValidateResult = getErrors({
            data: [
              {
                errors: currentLineValidate,
              },
            ],
            groupCategory: intl.get('ssrc.biddingHall.view.title.biddingSite').d('竞价现场'),
            groupFieldName: 'itemName',
            primaryKey: 'biddingSupLineCurId',
            consoleTitle: 'Bidding Hall Unit Whole Table',
          });
        }
      });
    }

    return firstLineValidateResult;
  };

  // 单价-列表视图-表格-整单批量出价 数据整理
  validateAndReorganizeUnitPriceListViewTableDs = async (options = {}) => {
    const { submitValidateFlag = 0 } = options || {};
    const { headerInfo } = this.state;
    let validateFlag = true;
    let validateErrResult = '';
    let lineDate = null;

    const ds = this.quotationLineDS;
    if (!ds) {
      return;
    }

    const updatedLines = []; // 更新

    ds.forEach((record = {}) => {
      if (!record) {
        return;
      }

      const { updatedFlag, currentQuotationSecPrice, netSecondaryPrice } = record.get([
        'updatedFlag',
        'currentQuotationSecPrice',
        'netSecondaryPrice',
      ]);

      /**
       * 提交策略
       * record updatedFlag === 1, 基准价有值
       * */
      const basePriceValue = this.getTaxOrUntax() ? currentQuotationSecPrice : netSecondaryPrice;
      const updatedAndHasPrice =
        updatedFlag === 1 && !isNil(basePriceValue) && submitValidateFlag === 1;
      if (updatedAndHasPrice) {
        updatedLines.push(record);
        record.set('status', 'update');
      }
    });

    await ds.validate(); // 整单保存，需要滚动到校验字段，还是要依赖ds validate

    if (!isEmpty(updatedLines)) {
      validateErrResult = await this.getUnitPriceTableValidateResult(updatedLines);

      if (validateErrResult) {
        validateFlag = false;

        notification.warning({
          // eslint-disable-next-line react/no-danger
          message: <div dangerouslySetInnerHTML={{ __html: validateErrResult || '' }} />,
        });
        return {
          validateFlag,
        };
      }
    }
    lineDate = ds.toData();

    return {
      validateFlag, // 单价整单-允许校验未通过提交
      querys: {
        customizeUnitCode: this.getCustomizeUnitCode(['unitPriceTable']),
      },
      organizationId: this.organizationId,
      biddingSupLineCurDTOList: lineDate,
      ...(headerInfo || {}),
    };
  };

  /**
   * 单价-列表视图-表格-整单批量出价-save
   * @params
   *  options
   *    afterSaveApiRefreshPageFlag - 保存后刷新全页面标识 int 1 | 0  1
   * */
  unitPriceListViewTableSave = async (options) => {
    const { afterSaveApiRefreshPageFlag = 1, lineDataEmptySkipSaveAndReturnTrueFlag = 0 } =
      options || {};
    const { ...data } = (await this.validateAndReorganizeUnitPriceListViewTableDs()) || {};
    let saveFlag = true;

    if (isEmpty(data) || this.pageLoadingLock) {
      return;
    }

    if (lineDataEmptySkipSaveAndReturnTrueFlag === 1) {
      const { biddingSupLineCurDTOList } = data || {};
      if (isEmpty(biddingSupLineCurDTOList)) {
        return true;
      }
    }

    let result = null;
    this.toggleLoading(true);
    try {
      result = await quotationPriceSave(data);
      result = getResponse(result);
      this.toggleLoading(false);
      if (!result) {
        saveFlag = false;
        return saveFlag;
      }

      if (afterSaveApiRefreshPageFlag === 1) {
        this.initPage(options);
      }
    } catch (e) {
      throw e;
    }

    return saveFlag;
  };

  // 单价-列表视图-表格分页改变
  // @params page = 1, pageSize = 20
  unitPriceListViewTableOnPagination = () => {
    const { pageReadOnlyFlag } = this.state;

    // 整单批量出价
    if (this.biddingUnitWholeBatchPriceFlag() && !pageReadOnlyFlag) {
      const tableEditorFlag = (this.quotationLineDS?.records || []).some(
        (item) => item?.status === 'update'
      );
      const { selected } = this.quotationLineDS;
      if (tableEditorFlag && isEmpty(selected)) {
        this.unitPriceListViewTableSave({
          queryParams: {
            // page,
            // pageSize,
          },
        });
      }
    }
  };

  // 竞价现场表单数据校验/获取
  validateAndReorganizeDetailViewFormDSData = async () => {
    const { current } = this.detailViewFormDS || {};
    let validateFormFlag = false;
    let data = null;

    if (!current) {
      return {};
    }

    current.set('status', 'update');
    validateFormFlag = await this.detailViewFormDS.validate();
    data = current?.toData();

    // 英式竞价 - 出价表单才可编辑
    validateFormFlag = this.britishBidding() ? validateFormFlag : true;

    return {
      formData: data,
      validateFormFlag,
    };
  };

  // unit price validate and data
  validateAndReorganizeUnitPriceRequestData = async (options = {}) => {
    const { headerInfo = {} } = this.state;

    // 整单批量出价
    if (this.biddingUnitWholeBatchPriceFlag()) {
      const data = (await this.validateAndReorganizeUnitPriceListViewTableDs(options)) || {};

      return data;
    }

    const { formData, validateFormFlag } = await this.validateAndReorganizeDetailViewFormDSData();

    return {
      validateFlag: validateFormFlag,
      ...(headerInfo || {}),
      biddingSupLineCurDTOList: [formData],
      organizationId: this.organizationId,
      querys: {
        customizeUnitCode: this.getCustomizeUnitCode([
          'unitPriceDetailViewForm',
          'unitPriceDetailItemViewForm',
        ]),
      },
    };
  };

  // 字段组织
  getValidateFieldsFromApi = (operationCode = '') => {
    const fields = {};
    if (!operationCode) {
      return fields;
    }

    let biddingSubmitBeforePassFlag = 0;
    let biddingSubmitAfterPassFlag = 0;

    if (operationCode === 'BIDDING_QUOTATION_SUBMIT_BEFORE') {
      biddingSubmitBeforePassFlag = 1;
    }
    if (operationCode === 'BIDDING_QUOTATION_SUBMIT_AFTER') {
      biddingSubmitAfterPassFlag = 1;
    }

    return {
      operationCode,
      biddingSubmitBeforePassFlag,
      biddingSubmitAfterPassFlag,
    };
  };

  // 提交弱校验弹窗提示标题
  getSubmitWarningModalTitle = () => {
    const title = intl
      .get('ssrc.common.view.title.quotationSubmitWarningText', {
        quotationName: getQuotationName(false),
      })
      .d('本次{quotationName}需确认');
    return title;
  };

  // unit price submit
  @Throttle(3000)
  @Bind()
  async unitPriceSubmitQuotationPrice() {
    const { biddingSupRemote } = this.props;
    const { pageOperationLoading, pageLoading } = this.state;
    const { validateFlag = false, ...data } =
      (await this.validateAndReorganizeUnitPriceRequestData({ submitValidateFlag: 1 })) || {};
    const currentPageLoading =
      this.pageLoadingLock || pageLoading || pageOperationLoading || this.pageOperationLoadingLock;
    if (!validateFlag || isEmpty(data) || currentPageLoading) {
      return;
    }

    this.togglePageOperationLoading(false);
    const SubmitNewData = data || {};

    // 二次提交确认
    const confirmSubmit = async (submitOptionData = {}) => {
      const { operationCode } = submitOptionData || {};
      const SubmitSymbolData = { passFlag: 1 }; // 通过passFlag确定是校验还是提交
      const apiData = this.getValidateFieldsFromApi(operationCode);
      const result = await quotationUnitPriceSubmit({
        ...SubmitNewData,
        ...SubmitSymbolData,
        ...apiData,
      });
      if (result && result.failed) {
        notification.warning({
          message: result?.message,
        });
        this.togglePageOperationLoading(false);
        return;
      }

      await handleValidationResult({
        validationResult: result,
        confirmSubmit: () => confirmSubmit(result),
        afterSuccessSubmit: async () => {
          notification.success();
          await this.initPage();
          await this.togglePageOperationLoading(false, { delay: true, timer: 800 });
        },
        warningModalCancel: () => {
          this.togglePageOperationLoading(false);
        },
        handleError: (error) => {
          notification.warning({
            message: error?.message,
          });
          this.togglePageOperationLoading(false);
        },
        weakValidationTip: this.getSubmitWarningModalTitle(),
      });
    };

    try {
      this.togglePageOperationLoading(true);
      const result = await quotationUnitPriceSubmit(SubmitNewData);

      // 标准埋点，额外的modal配置
      const modalProps = biddingSupRemote
        ? biddingSupRemote.process(
            'SSRC_SUPPLIER_BIDDINGHALL_PROCESS_VALIDATE_MODAL_PROPS',
            {},
            {
              validationResult: result,
            }
          )
        : {};

      await handleValidationResult({
        validationResult: result,
        confirmSubmit: () => confirmSubmit(result),
        afterSuccessSubmit: async () => {
          notification.success();
          await this.initPage();
          await this.togglePageOperationLoading(false, { delay: true, timer: 800 });
        },
        handleError: (error) => {
          notification.warning({
            message: error?.message,
          });
          this.togglePageOperationLoading(false);
        },
        warningModalCancel: () => {
          this.togglePageOperationLoading(false);
        },
        weakValidationTip: this.getSubmitWarningModalTitle(),
        modalProps,
      });
    } catch (e) {
      this.togglePageOperationLoading(false);
      throw e;
    }
  }

  // total price submit
  @Throttle(2000)
  @Bind()
  async totalPriceSubmitQuotationPrice() {
    const { headerInfo } = this.state;
    const { biddingTotalPricePrinciple, biddingSupplementPriceRunningFlag } = headerInfo || {};

    let currentValidateFlag = false;
    const submitBodyData = {};
    let submitQueryData = null;

    if (biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED') {
      const { lineValidateFlag, lineDate } = (await this.totalPriceTableLineReorganizeDS()) || {};
      currentValidateFlag = lineValidateFlag;
      submitBodyData.biddingSupLineCurDTOList = lineDate;
      submitQueryData = {
        querys: {
          customizeUnitCode: this.getCustomizeUnitCode(['totalPriceTable']),
        },
      };
    }

    if (biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED') {
      const { formData, validateFormFlag } =
        (await this.validateAndReorganizeDetailViewFormDSData()) || {};
      currentValidateFlag = validateFormFlag;
      submitBodyData.biddingSupHeaderDTO = formData;
      submitQueryData = {
        querys: {
          customizeUnitCode: this.getCustomizeUnitCode(['totalPriceDetailViewForm']),
        },
      };

      // 补充单价 和总价的单价必输共用逻辑
      if (biddingSupplementPriceRunningFlag) {
        const { lineValidateFlag, lineDate } = (await this.totalPriceTableLineReorganizeDS()) || {};
        currentValidateFlag = lineValidateFlag;
        submitBodyData.biddingSupLineCurDTOList = lineDate;
        submitBodyData.biddingSupHeaderDTO = null;
        submitQueryData = {
          querys: {
            customizeUnitCode: this.getCustomizeUnitCode(['totalPriceTable']),
          },
        };
      }
    }

    if (
      !currentValidateFlag ||
      isEmpty(submitBodyData) ||
      isEmpty(headerInfo) ||
      this.pageLoadingLock
    ) {
      return;
    }

    const SubmitNewData = {
      ...headerInfo,
      ...submitBodyData,
      ...(submitQueryData || {}),
      organizationId: this.organizationId,
    };

    // 二次提交确认
    const confirmSubmit = async (SubmitOptionData = {}) => {
      const { operationCode } = SubmitOptionData || {};
      const SubmitSymbolData = { passFlag: 1 }; // 通过passFlag确定是校验还是提交
      const apiData = this.getValidateFieldsFromApi(operationCode);
      const result = await totalPriceHeaderLinesSubmit({
        ...SubmitNewData,
        ...SubmitSymbolData,
        // ...SubmitOptionData,
        ...apiData,
      });
      this.toggleLoading(false);
      if (result && result.failed) {
        notification.warning({
          message: result?.message,
        });
        return;
      }

      await handleValidationResult({
        validationResult: result,
        afterSuccessSubmit: () => {
          this.toggleLoading(false);
          notification.success();
          this.initPage();
        },
        confirmSubmit: () => confirmSubmit(result),
        warningModalCancel: () => {
          this.toggleLoading(false);
        },
        handleError: (error) => {
          notification.warning({
            message: error?.message,
          });
          this.toggleLoading(false);
        },
        weakValidationTip: this.getSubmitWarningModalTitle(),
      });
    };

    try {
      this.toggleLoading(true);
      const result = await totalPriceHeaderLinesSubmit(SubmitNewData);
      if (result && result.failed) {
        notification.warning({
          message: result?.message,
        });
        this.toggleLoading(false);
        return;
      }

      await handleValidationResult({
        validationResult: result,
        warningModalCancel: () => {
          this.toggleLoading(false);
        },
        handleError: (error) => {
          notification.warning({
            message: error?.message,
          });
          this.toggleLoading(false);
        },
        confirmSubmit: () => confirmSubmit(result),
        afterSuccessSubmit: () => {
          this.toggleLoading(false);
          notification.success();
          this.initPage();
        },
        weakValidationTip: this.getSubmitWarningModalTitle(),
      });
    } catch (e) {
      this.toggleLoading(false);
      throw e;
    }
  }

  // 出价
  @Throttle(2000)
  @Bind()
  async submitQuotationPrice() {
    if (this.getUnitPriceFlag()) {
      this.unitPriceSubmitQuotationPrice();
    }

    if (this.getTotalPriceFlag()) {
      this.totalPriceSubmitQuotationPrice();
    }
  }

  // page backpath
  handleOnBack = () => {
    this.unmount();
    // this.closeFullScreen();
    this.directToList();
  };

  // 单价-出价视图-行倒计时暂停后,需要刷新当前行，下一行，以及当前表单的时间和状态
  countDownTimerOver = async () => {
    const { offerPriceViewFlag, biddingSupLineCurId } = this.state;
    const currentQuotationDetailViewListDS = this.quotationDetailViewListDS || {};
    if (
      this.getTotalPriceFlag() ||
      !offerPriceViewFlag ||
      !biddingSupLineCurId ||
      !currentQuotationDetailViewListDS?.length
    ) {
      return;
    }

    await this.refreshContent();

    let currentRecordIndex = -1;
    let currentRecordLineStatus = null;

    currentQuotationDetailViewListDS.forEach((lineRecord, index) => {
      if (!lineRecord) {
        return;
      }

      const { biddingSupLineCurId: currentLineId, displayBiddingSupLineStatus } = lineRecord.get([
        'biddingSupLineCurId',
        'displayBiddingSupLineStatus',
      ]);

      if (currentLineId === biddingSupLineCurId) {
        currentRecordIndex = index;
        currentRecordLineStatus = displayBiddingSupLineStatus;
      }
    });

    if (currentRecordLineStatus === 'NOT_START') {
      this.refreshContent();
      return;
    }

    if (currentRecordIndex === -1) {
      return;
    }

    const nextRecord = currentQuotationDetailViewListDS.get(currentRecordIndex + 1);
    if (!nextRecord) {
      return;
    }

    this.unitPriceDetailViewListDataSelected(nextRecord);
  };

  sectionQueryMain = () => {
    this.initPage();
  };

  // back list
  directToList = () => {
    const { history } = this.props;
    // const activeTabKey = this.getBackPath();
    history.push({
      pathname: `/ssrc/supplier-reply/list`,
      // search: listSearch,
    });
  };

  // status
  quotationStatusColor = (data = {}) => {
    const { status, statusMeaning, currentStyles = {}, afterRender, popoverFlag = 1 } = data || {};
    if (!statusMeaning) {
      return '';
    }

    const { bgColor: backgroundColor, color } = getLineStatusColor(status) || {};
    const colorStyles = {
      color,
      backgroundColor,
    };

    const tagStyles = {
      textAlign: 'center',
      ...colorStyles,
      border: 0,
      borderRadius: '2px',
      overflow: 'hidden',
      maxWidth: '80px',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      marginRight: '4px',
      ...(currentStyles || {}),
    };

    const contentOfTag =
      statusMeaning && afterRender
        ? `${statusMeaning} ${afterRender || ''}`
        : statusMeaning || afterRender || '';

    return (
      <div className={Style['supplier-bidding-hall-header-status']}>
        <Tag style={tagStyles}>
          {popoverFlag ? (
            <Popover content={contentOfTag}>{contentOfTag}</Popover>
          ) : (
            <span>{contentOfTag}</span>
          )}
        </Tag>
      </div>
    );
  };

  getLocationSearchObj = () => {
    const {
      location: { search = {} },
    } = this.props;

    const obj = querystring.parse(search.substr(1)) || {};
    return obj;
  };

  getCurrentPathActiveKey = () => {
    const {
      location: { pathname },
    } = this.props;
    const activeTabKey = getJumpRoutePrefixUrl(pathname);

    return activeTabKey;
  };

  // 定位到当前页面 切标段，变更路有
  locatedCurrentUrl = (data = {}) => {
    const {
      match: { params = {} },
      history,
    } = this.props;
    const { biddingTarget } = params || {};
    const { rfxLineSupplierId, projectLineSectionId: currentProjectLineSectionId = null } =
      data || {};

    if (!rfxLineSupplierId) {
      return;
    }

    const previewSearchObj = this.getLocationSearchObj() || {};

    const newSearch = querystring.stringify({
      ...previewSearchObj,
      projectLineSectionId: currentProjectLineSectionId,
    });

    const activeTabKey = this.getCurrentPathActiveKey();

    history.push({
      pathname: `/pub${activeTabKey}/bidding-hall/${rfxLineSupplierId}/${biddingTarget}`,
      search: newSearch,
    });
  };

  renderPageTitle = () => {
    const {
      match: { params = {} },
      biddingSupRemote,
    } = this.props;
    const { rfxLineSupplierId } = params || {};
    const { headerInfo } = this.state;
    const {
      supplierNumberPlate = '',
      tenantId,
      rfxHeaderId,
      roundNumber,
      displayBiddingSupHeaderStatus,
    } = headerInfo || {};

    const { projectLineSectionId, sectionFlag } = this.getLocationSearchObj() || {};

    const orgId = this.organizationId;
    if (!orgId) {
      return;
    }

    let requestPrams = null;
    if (tenantId && rfxHeaderId && roundNumber && rfxLineSupplierId) {
      requestPrams = { tenantId, rfxHeaderId, roundNumber, rfxLineSupplierId };
    }

    const netSignalProps = {
      requestUrl: `/ssrc/v1/${orgId}/bidding/sup/user-info/monitor`,
      requestPrams,
    };

    // 是否显示网络信号 参数不为空并且单据状态不为【关闭、】
    const showNetSignalFlag = requestPrams && !['CLOSED'].includes(displayBiddingSupHeaderStatus);

    const currentPageSection = sectionFlag === '1' && projectLineSectionId;

    const sectionProps = {
      name: 'BIDDING_SUPPLIER',
      queryParam: {
        rfxLineSupplierId,
      },
      rfxLineSupplierId,
      sectionFlag,
      projectLineSectionId,
      // queryMain: this.sectionQueryMain,
      locatedCurrentUrl: this.locatedCurrentUrl,
      beforeChangeSection: this.unmount,
    };

    // cdp-104981协鑫埋点
    const { handleBidHallTitle = undefined } = biddingSupRemote?.props?.process || {};

    return (
      <div className={Style['supplier-bidding-hall-header']}>
        <div
          onClick={this.handleOnBack}
          className={Style['supplier-bidding-hall-header-back-wrap']}
        >
          <Icon type="navigate_before" />
          <span>{intl.get(`ssrc.common.model.common.return`).d('返回')}</span>
        </div>
        {showNetSignalFlag || supplierNumberPlate ? (
          <div className={Style['supplier-bidding-hall-header-back-right-divide']} />
        ) : (
          ''
        )}
        {isFunction(handleBidHallTitle) ? handleBidHallTitle(headerInfo, { ...this.props }) : null}
        {/* <div onClick={this.fullScreen}>
          {intl.get('ssrc.biddingHall.view.title.biddingHall').d('竞价大厅')}
        </div> */}

        <div className={Style['supplier-bidding-hall-header-signal']}>
          {showNetSignalFlag ? <NetSignal {...netSignalProps} /> : ''}
        </div>
        {supplierNumberPlate ? (
          <div className={Style['supplier-bidding-hall-header-number-wrap']}>
            <span>{intl.get('ssrc.biddingHall.view.title.myNumberPlate').d('我的牌号')}</span>
            <span className={Style['supplier-bidding-hall-header-number']}>
              {supplierNumberPlate ?? ''}
            </span>
          </div>
        ) : (
          ''
        )}

        <div style={{ marginLeft: '8px' }}>
          <Tooltip title={intl.get('hzero.common.button.refresh').d('刷新')}>
            <Icon type="refresh" onClick={this.refreshPage} />
          </Tooltip>
        </div>

        {/* 多标段 */}
        {currentPageSection ? (
          <div className={Style['ssrc-supplier-bidding-hall-header-section-wrap']}>
            <Section {...sectionProps} />
          </div>
        ) : (
          ''
        )}
      </div>
    );
  };

  /**
   * refresh page
   * 刷新全页面
   * */
  @Throttle(2000)
  refreshPage = () => {
    this.initPage();
    // const states = window.dvaApp._store.getState() || {};
    // const { activeTabKey, tabs } = states.global || {};
    // refreshTab(activeTabKey);
  };

  setBiddingHallContent = (node = {}) => {
    this.biddingHallContentRef = node;
  };

  setUnitPriceRef = (node = {}) => {
    this.unitPriceRef = node;
  };

  setTotalAmountRef = (node = {}) => {
    this.totalAmountRef = node;
  };

  // 单价-整单 表格筛选器ref
  @Bind()
  setUnitPriceWholeTableSearchBarRef(node = {}) {
    this.unitPriceWholeTalbeSearchBarRef = node;
  }

  getTotalPriceAndUnitPriceRequired = () => {
    const { biddingTotalPricePrinciple } = this.getHeaderInfoFromState() || {};

    const flag = this.getTotalPriceFlag() && biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';
    return flag;
  };

  // 判断含税或者不函数逻辑 1=含税，否则未税
  getTaxOrUntax = () => {
    const { benchmarkPriceType } = this.getHeaderInfoFromState() || {};
    const taxFlag = benchmarkPriceType === 'TAX_INCLUDED_PRICE';

    return taxFlag;
  };

  // 竞价
  getBiddingFlag = () => {
    const { biddingQuotationMethod } = this.getHeaderInfoFromState() || {};

    const flag = biddingQuotationMethod === 'BIDDING';

    return flag;
  };

  // 拍卖
  getAuctionFlag = () => {
    const { biddingQuotationMethod } = this.getHeaderInfoFromState() || {};

    const flag = biddingQuotationMethod === 'AUCTION';

    return flag;
  };

  // 单价竞价标识
  getUnitPriceFlag = () => {
    const {
      match: { params = {} },
    } = this.props;
    const { biddingTarget } = params || {};

    this.validatePageBiddingTarget();

    return biddingTarget === 'UNIT_PRICE';
  };

  // 总价竞价标识
  getTotalPriceFlag = () => {
    const {
      match: { params = {} },
    } = this.props;
    const { biddingTarget } = params || {};

    this.validatePageBiddingTarget();

    return biddingTarget === 'TOTAL_PRICE';
  };

  /**
   *HIDE_IDENTITY_HIDE_QUOTE	隐藏身份隐藏报价 1
    HIDE_IDENTITY_OPEN_QUOTE	隐藏身份公开报价
    OPEN_IDENTITY_HIDE_QUOTE	公开身份隐藏报价
    OPEN_IDENTITY_OPEN_QUOTE  公开身份公开报价
   */
  hideIdentityAndQuote = () => {
    const { openRule } = this.getHeaderInfoFromState() || {};

    const flag = openRule === 'HIDE_IDENTITY_HIDE_QUOTE';
    return flag;
  };

  /**
   * total price table line validate and get date
   *
   * 英
   * // 日/荷兰 总价必输 补充单价 可以编辑
   * */
  totalPriceTableLineReorganizeDS = async () => {
    let lineValidateFlag = false;
    let lineDate = null;

    const ds = this.totalPriceTableDS;
    if (!ds || !ds.length) {
      return;
    }

    ds.forEach((record = {}) => {
      if (!record) {
        return;
      }
      record.set('status', 'update');
    });

    lineValidateFlag = await ds.validate();
    lineDate = ds.toData();

    // 日/荷兰 总价必输 补充单价
    const needValidateTotalPriceTable =
      this.britishBidding() || this.japanDutchTotalPriceSupplement();

    lineValidateFlag = needValidateTotalPriceTable ? lineValidateFlag : true;

    return {
      lineValidateFlag,
      lineDate,
    };
  };

  // total price detail form and line validate and get data
  totalPriceReorganizeDSAndGetRequestData = async () => {
    const { headerInfo } = this.state;
    const { biddingTotalPricePrinciple } = headerInfo || {};
    const { formData } = (await this.validateAndReorganizeDetailViewFormDSData()) || {};
    const { lineDate } = (await this.totalPriceTableLineReorganizeDS()) || {};

    const lines = biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' ? null : lineDate; // 总价不传行

    return {
      // validateFlag: lineValidateFlag && validateFormFlag,
      biddingSupLineCurDTOList: lines,
      biddingSupHeaderDTO: formData,
      organizationId: this.organizationId,
      querys: {
        customizeUnitCode: this.getCustomizeUnitCode([
          'totalPriceDetailViewForm',
          'totalPriceTable',
        ]),
      },
    };
  };

  // total price table save
  @Throttle(2000)
  @Bind()
  async saveTotalPriceTable(saveOptions = {}) {
    const { headerInfo, pageReadOnlyFlag } = this.state;
    const { omitSuccessFlag = 0 } = saveOptions || {};
    const tableEditorFlag = (this.totalPriceTableDS?.records || []).some(
      (item) => item?.status === 'update'
    );
    const { selected } = this.totalPriceTableDS;
    if ((!tableEditorFlag || !isEmpty(selected)) && !omitSuccessFlag) {
      return true;
    }
    const { lineDate } = (await this.totalPriceTableLineReorganizeDS()) || {};
    if (isEmpty(lineDate) && !pageReadOnlyFlag) {
      return;
    }

    const {
      biddingSupplementPriceRunningFlag,
      biddingTotalPricePrinciple,
      displayBiddingSupHeaderStatus,
    } = headerInfo;
    // 单价必输或者补充单价 的进行中
    const unSaveFlag =
      (biddingTotalPricePrinciple === 'UNIT_PRICE_REQUIRED' || biddingSupplementPriceRunningFlag) &&
      displayBiddingSupHeaderStatus === 'IN_PROGRESS';
    if (!unSaveFlag) {
      return;
    }

    const data = {
      ...(headerInfo || {}),
      organizationId: this.organizationId,
      biddingSupLineCurDTOList: lineDate,
      querys: {
        customizeUnitCode: this.getCustomizeUnitCode('totalPriceTable'),
      },
    };
    let saveSuccessFlag = false;
    this.toggleLoading(true);
    try {
      let result = await totalPriceHeaderLinesSave(data);
      result = getResponse(result);
      this.toggleLoading(false);
      if (!result) {
        return saveSuccessFlag;
      }

      saveSuccessFlag = true;
      if (!omitSuccessFlag) {
        notification.success();
      }
      this.refreshContent();
    } catch (e) {
      throw e;
    }

    return saveSuccessFlag;
  }

  // total price save header detail form and line
  totalPriceSaveHeaderLines = async () => {
    let totalPriceSaveFlag = 0;

    const data = await this.totalPriceReorganizeDSAndGetRequestData();
    try {
      let result = await totalPriceHeaderLinesSave(data);
      result = getResponse(result);
      if (!result) {
        return;
      }

      notification.success();
      totalPriceSaveFlag = 1;
    } catch (e) {
      throw e;
    }

    return totalPriceSaveFlag;
  };

  /**
   * add members
   * add members and render chat room
   */
  chatRoomAddMembers = async (header = null) => {
    // const { addChatRoomMember } = this.chatRoomRef || {};
    const {
      rfxNum,
      tenantId,
      supplierTenantId,
      supplierCompanyId,
      supplierCompanyName,
      supplierNumberPlate,
      anonymousQuotesPlate,
      biddingAnonymousQuotesFlag,
      chatEnableFlag = 1,
    } = header || this.getHeaderInfoFromState() || {};

    const { name } = getCurrentRole() || {};
    const { id, realName } = getCurrentUser() || {};

    const emptyRequiredFlag = !tenantId || !supplierTenantId;
    if (emptyRequiredFlag) {
      return;
    }

    const chatRoomEnabledTemplate = chatEnableFlag === 1;
    if (!chatRoomEnabledTemplate) {
      return;
    }

    // const commonConfigs = getChatRoomConfigs(headerInfo) || {};
    let currentUserName = realName;
    if (biddingAnonymousQuotesFlag) {
      currentUserName = '';
    }

    const data = {
      businessNo: rfxNum,
      businessTitle: intl.get('ssrc.common.view.chatRoom').d('聊天室'),
      businessCode: 'source-bidding',
      purchaseTenantId: tenantId,
      // ...commonConfigs,
      tenants: [
        {
          tenantId: supplierTenantId,
          companyId: supplierCompanyId,
          companyName: supplierNumberPlate || anonymousQuotesPlate || supplierCompanyName,
          members: [
            {
              userId: id,
              userName: currentUserName,
              roleName: name,
            },
          ],
        },
      ],
    };

    try {
      let result = await biddingHallChatRoomAddMembers(data);
      result = getResponse(result);
      if (!result) {
        this.chatRoomAddedFlag = 0;
        return;
      }

      this.setState({
        chatRoomVisible: chatRoomEnabledTemplate,
      });

      this.chatRoomAddedFlag = 1;

      // 聊天室不显示后，需要调整页面布局，内容
      // if (chatEnableFlag !== 1) {
      //   this.setState({
      //     chatRoomShowType: 'HIDE',
      //   });
      // }

      this.rollingFetchChatRoomMessage();
    } catch (e) {
      throw e;
    }
  };

  /**
   * 获取当前允许可出价次数和剩余可出价次数
   * record  - current line record
   *
   * @return values = {}
   *  values.biddingRemainingCount 剩余可出价次数
   *  values.biddingAllowCount 允许可出价次数
   * */
  getBiddingRemainingQuotationCount = (options) => {
    const { record } = options || {};
    const { headerInfo } = this.state;
    const {
      biddingAllowedQuotationCount: headBiddingAllowedQuotationCount,
      deferBiddingAllowedQuotationCount: headDeferBiddingAllowedQuotationCount,
      deferBiddingFlag: headDeferBiddingFlag,
      biddingRemainingQuotationCount: headBiddingRemainingQuotationCount,
      deferBiddingRemainingQuotationCount: headDeferBiddingRemainingQuotationCount,
    } = headerInfo || {};

    // 单价的整单维护/总价 - 使用头字段
    const headerLogicFlag = this.biddingUnitWholeBatchPriceFlag() || this.getTotalPriceFlag();
    const values = {};

    if (headerLogicFlag) {
      values.biddingAllowCount = headBiddingAllowedQuotationCount; // 延时次数
      values.biddingRemainingCount = headBiddingRemainingQuotationCount; // 剩余可出价次数

      if (headDeferBiddingFlag) {
        values.biddingAllowCount = headDeferBiddingAllowedQuotationCount;
        values.biddingRemainingCount = headDeferBiddingRemainingQuotationCount;
      }
      return values;
    }

    const {
      deferBiddingFlag,
      biddingAllowedQuotationCount,
      deferBiddingAllowedQuotationCount,
      biddingRemainingQuotationCount,
      deferBiddingRemainingQuotationCount,
    } = record
      ? record.get([
          'deferBiddingFlag',
          'biddingAllowedQuotationCount',
          'deferBiddingAllowedQuotationCount',
          'biddingRemainingQuotationCount',
          'deferBiddingRemainingQuotationCount',
        ])
      : {};

    // !headerLogicFlag 单价的物料维护用行字段
    values.biddingAllowCount = biddingAllowedQuotationCount; // 延时次数
    values.biddingRemainingCount = biddingRemainingQuotationCount; // 剩余可出价次数

    if (deferBiddingFlag) {
      values.biddingAllowCount = deferBiddingAllowedQuotationCount;
      values.biddingRemainingCount = deferBiddingRemainingQuotationCount;
    }

    return values;
  };

  // 可供数量-secondary
  handleChangeQuotationQuantity = async ({ record }) => {
    const { doubleUnitFlag } = this.state;
    const { tenantId } = this.getHeaderInfoFromState() || {};
    const {
      // netSecondaryPrice,
      // currentSecondaryQuotationPrice,
      itemId,
      secondaryUomId,
      currentQuotationSecQuantity,
      uomId,
      rfxLineItemId,
    } = record?.get([
      // 'netSecondaryPrice',
      // 'currentSecondaryQuotationPrice',
      'itemId',
      'secondaryUomId',
      'currentQuotationSecQuantity',
      'uomId',
      'rfxLineItemId',
    ]);
    // const isExist =
    //   netSecondaryPrice !== '' && netSecondaryPrice !== undefined && netSecondaryPrice !== null;
    // const netAmount = math.multipliedBy(netSecondaryPrice, val); // 行金额未税

    // record.set('totalAmount', isExist ? currentSecondaryQuotationPrice : null);
    // record.set('netAmount', isExist ? netAmount : null);
    if (itemId && doubleUnitFlag) {
      if (secondaryUomId && currentQuotationSecQuantity) {
        const res = await calculateBasicQty({
          secondaryQuantity: currentQuotationSecQuantity,
          itemId,
          businessKey: rfxLineItemId,
          doublePrimaryUomId: uomId,
          secondaryUomId,
          tenantId,
        });
        record.set('currentQuotationQuantity', res ?? null);
      } else if (currentQuotationSecQuantity === 0) {
        record.set('currentQuotationQuantity', 0);
      }
    } else {
      record.set('currentQuotationQuantity', currentQuotationSecQuantity);
    }
  };

  // setChatRoomExpand(result = {}) {
  //   const { configKey, configValue = '' } = result || {};

  //   if (configKey !== 'BIDDING_HALL_SUPPLIER_CHAT_ROOM_EXPAND' || !configValue) {
  //     return;
  //   }

  //   this.setState({
  //     chatRoomShowType: configValue,
  //   });
  // }

  // @Debounce(1500)
  // changeChatRoomExpand = async (showType = 'SHOW') => {
  //   const { id } = getCurrentUser() || {};
  //   const data = {
  //     organizationId: this.organizationId,
  //     userId: id,
  //     enabledFlag: 1,
  //     configDesc: 'BIDDING_HALL_SUPPLIER_CHAT_ROOM_EXPAND',
  //     // ...rfxDetailLayouts,
  //     configKey: 'BIDDING_HALL_SUPPLIER_CHAT_ROOM_EXPAND',
  //     configValue: showType === 'SHOW' ? 'SHOW' : 'HIDE',
  //   };

  //   let result = null;
  //   try {
  //     result = await updateUserConfig(data);
  //     if (!result) {
  //       return;
  //     }

  //     this.setChatRoomExpand(result);
  //   } catch (e) {
  //     throw e;
  //   }
  // };

  // 完成下不需要查询未读消息
  cancelQueryUnread = () => {
    const flag =
      this.biddingFinished() ||
      this.biddingProhibitSupplierQuotation() ||
      this.biddingSupplierEliminate();

    return flag;
  };

  // get headerInfo state value
  getHeaderInfoFromState = () => {
    const { headerInfo } = this.state;

    return headerInfo || {};
  };

  // 竞价已经结束
  biddingFinished = () => {
    const { displayBiddingSupHeaderStatus } = this.getHeaderInfoFromState() || {};

    const flag =
      displayBiddingSupHeaderStatus === 'CLOSED' ||
      displayBiddingSupHeaderStatus === 'FINISHED' ||
      displayBiddingSupHeaderStatus === 'BIDDING_END';

    return flag;
  };

  /**
   * 供应商 禁止报价
   */
  biddingProhibitSupplierQuotation = () => {
    const { supplierStatus } = this.getHeaderInfoFromState() || {};

    const flag = supplierStatus === 'PROHIBIT_QUOTATION';

    return flag;
  };

  /**
   * 供应商 淘汰
   */
  biddingSupplierEliminate = () => {
    const { biddingRoundSupplierStatus } = this.getHeaderInfoFromState() || {};

    const flag = biddingRoundSupplierStatus === 'ELIMINATE';

    return flag;
  };

  // 竞价已经结束 | 禁止
  biddingFinishedOrProhibitOrEliminate = () => {
    const flag = this.biddingFinishedOrProhibit() || this.biddingSupplierEliminate();

    return flag;
  };

  // 竞价已经结束 | 禁止 ｜ 淘汰
  biddingFinishedOrProhibit = () => {
    const flag = this.biddingFinished() || this.biddingProhibitSupplierQuotation();

    return flag;
  };

  // 聊天室 展开/收起
  // @Throttle(1500)
  // toggleChatRoomExpand = () => {
  //   const { chatRoomShowType } = this.state;
  //   const newState = chatRoomShowType === 'SHOW' ? 'HIDE' : 'SHOW';
  //   this.changeChatRoomExpand(newState);
  //   this.setState({
  //     chatRoomShowType: newState,
  //     chatRoomMessage: {},
  //   });
  //   this.rollingFetchChatRoomMessage();
  // };

  // 轮询 查询 chat room 未读消息
  rollingFetchChatRoomMessage = () => {
    clearInterval(this.chatRoomMessageRef);

    if (this.cancelQueryUnread()) {
      return;
    }

    this.fetchCharRoomUnRead();

    this.chatRoomMessageRef = setInterval(this.fetchCharRoomUnRead, CHAT_ROOM_REFRESH_INTERVAL);
  };

  /**
   * 未读消息
   * userId	用户id,非必须， 如果传值，那么只返回该用户的未读信息，如果没有传值，返回该租户下指定company所有用户的未读数量
      tenantId	用户所属的租户id 必须，初始化房间 所传入的用户信息中的租户id
      companyId	要查询的公司id 必须 初始化房间 所传入的用户信息中的租户id
      rooms	数组：要查询的单据列表
      purchaseTenantId	单据的采购方租户id 必须
      businessCode	单据的业务编码 必须
      businessNo
  */
  fetchCharRoomUnRead = async () => {
    const { headerInfo, chatRoomMessage = {}, tabKey } = this.state;
    const { rfxNum, tenantId, supplierTenantId, supplierCompanyId, chatEnableFlag = 1 } =
      headerInfo || {};
    const { id } = getCurrentUser() || {};

    // 聊天室隐藏
    if (chatEnableFlag !== 1 || tabKey === 'chat') {
      this.clearChatRoomUnreadWatcher();
      return;
    }

    const emptyRequiredFlag = !supplierTenantId || !supplierCompanyId || !id || !tenantId;
    if (emptyRequiredFlag) {
      return;
    }

    const param = {
      data: [
        {
          userId: id,
          tenantId: supplierTenantId,
          companyId: supplierCompanyId,
          rooms: [
            {
              businessNo: rfxNum,
              businessCode: 'source-bidding',
              purchaseTenantId: tenantId,
            },
          ],
        },
      ],
    };

    let result = null;
    try {
      result = await fetchChatRoomUnreadMessage(param);
      result = getResponse(result);
      if (!result || isEmpty(result)) {
        return;
      }

      const { rooms = [] } = result[0] || {};
      const { unreadNums } = (rooms || [])[0] || {};

      if (isEmpty(unreadNums)) {
        return;
      }

      let nums = 0;
      unreadNums.forEach((msg) => {
        const { msgNum = 0, announcementNum = 0 } = msg || {};

        const allMessage = msgNum || 0 + announcementNum || 0;
        nums += allMessage;
      });

      this.setState({
        chatRoomMessage: {
          ...chatRoomMessage,
          unreadMsgNum: nums,
        },
      });
    } catch (e) {
      throw e;
    }
  };

  // chat room params
  getRoomParams = () => {
    const { match } = this.props;
    const { headerInfo } = this.state;
    const {
      rfxNum,
      tenantId,
      supplierTenantId,
      supplierCompanyId,
      supplierCompanyName,
      supplierNumberPlate,
      anonymousQuotesPlate,
    } = headerInfo || {};
    const { url } = match || {};

    const { name } = getCurrentRole() || {};
    const { id, realName } = getCurrentUser() || {};

    const emptyRequiredFlag = !tenantId || !supplierTenantId || !supplierCompanyId || !id || !name;
    if (emptyRequiredFlag) {
      return;
    }

    const commonConfigs = getChatRoomConfigs(headerInfo) || {};

    const data = {
      businessNo: rfxNum,
      businessTitle: intl.get('ssrc.common.view.chatRoom').d('聊天室'),
      businessCode: 'source-bidding',
      purchaseTenantId: tenantId,
      businessURL: url,
      ...commonConfigs,
      currentUser: {
        tenantId: supplierTenantId,
        companyId: supplierCompanyId,
        userId: id,
      },
      suppliers: [
        {
          tenantId: supplierTenantId,
          companyId: supplierCompanyId,
          companyName: supplierNumberPlate || anonymousQuotesPlate || supplierCompanyName,
          members: [
            {
              userId: id,
              userName: realName,
              roleName: name,
            },
          ],
        },
      ],
    };

    return data;
  };

  // 单价-整单标识
  biddingUnitWholeBatchPriceFlag = () => {
    const { biddingUnitPriceRule, quotationOrderType } = this.getHeaderInfoFromState() || {};
    // 单价+并行+整单批量出价
    const unitWholeBatchPriceFlag =
      biddingUnitPriceRule === 'WHOLE_BATCH' &&
      quotationOrderType === 'PARALLEL' &&
      this.getUnitPriceFlag();
    return unitWholeBatchPriceFlag;
  };

  // 单价-单物料出价标识
  biddingUnitSiglePriceFlag = (header = null) => {
    const { biddingUnitPriceRule, rfxLineItemCount } =
      header || this.getHeaderInfoFromState() || {};
    // 单价+并行+整单批量出价
    const signleUnitPriceFlag =
      biddingUnitPriceRule === 'SINGLE_ITEM' && this.getUnitPriceFlag() && rfxLineItemCount === 1;
    return signleUnitPriceFlag;
  };

  // 页面只读 + 暂停标识
  readonlyOrPaused = () => {
    const { pageReadOnlyFlag } = this.state;
    const { displayBiddingSupHeaderStatus } = this.getHeaderInfoFromState() || {};

    const flag = pageReadOnlyFlag || displayBiddingSupHeaderStatus === 'PAUSED';
    return flag;
  };

  setWarningRef = (ref) => {
    this.warningRef = ref || {};
  };

  fetchWarningMessageAndCount = () => {
    this.fetchWarningMessage();
  };

  // 警示消息查询
  // getWarningMessageCount = () => {
  //   const { warningCount } = this.warningRef || {};

  //   let count = 0;
  //   if (warningCount) {
  //     count = warningCount();
  //   }

  //   return count;
  // }

  // 警示消息查询
  fetchWarningMessage = () => {
    const { fetchMessage } = this.warningRef || {};

    if (fetchMessage) {
      fetchMessage();
    }
  };

  changeTabLeftAtSider = (key) => {
    this.setState(
      {
        tabKey: key,
        chatRoomMessage: {},
      },
      () => {
        this.rollingFetchChatRoomMessage();
      }
    );
  };

  getHeaderBiddingMode = () => {
    const { current } = this.headerDS || {};

    const biddingMode = current ? current.get('biddingMode') : null;

    return biddingMode;
  };

  // 日式
  japanBidding = () => {
    const biddingMode = this.getHeaderBiddingMode();
    const flag = biddingMode === 'JAPANESE_BIDDING' && this.getTotalPriceFlag();

    return flag;
  };

  // 荷兰式
  dutchBidding = () => {
    const biddingMode = this.getHeaderBiddingMode();
    const flag = biddingMode === 'DUTCH_BIDDING';

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  japOrDutchBidding = () => {
    const flag = this.japanBidding() || this.dutchBidding();
    return flag;
  };

  // 日式
  japanBiddingTotalPrice = () => {
    const biddingMode = this.getHeaderBiddingMode();
    const flag = biddingMode === 'JAPANESE_BIDDING' && this.getTotalPriceFlag();

    return flag;
  };

  // 荷兰式
  dutchBiddingTotalPrice = () => {
    const biddingMode = this.getHeaderBiddingMode();
    const flag = biddingMode === 'DUTCH_BIDDING' && this.getTotalPriceFlag();

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  japOrDutchBiddingTotalPrice = () => {
    const flag = this.dutchBiddingTotalPrice() || this.japanBiddingTotalPrice();
    return flag;
  };

  // BRITISH_BIDDING
  britishBidding = () => {
    const biddingMode = this.getHeaderBiddingMode();

    const flag = biddingMode === 'BRITISH_BIDDING';
    return flag;
  };

  render() {
    const {
      match,
      customizeForm,
      customizeTable,
      match: { params } = {},
      biddingSupRemote,
      customizeCommon,
      customizeBtnGroup,
    } = this.props;
    const {
      pageLoading,
      pageOperationLoading,
      pageReadOnlyFlag,
      headerInfo,
      headerRule,
      offerPriceViewFlag = 0, // 出价详情标识
      lovs = {},
      doubleUnitFlag,
      biddingSupLineCurId,
      caclRule,
      supplementUnitPriceFlag,
      chatRoomVisible = false,
      processNodeData,
      unitPriceLineFloatType,
      countDownShowAllZeroFlag = 0,
      quotationInputAutoCalculateFlag,
      // chatRoomShowType = 'SHOW',
      chatRoomMessage,
      tabKey,
    } = this.state;
    const { rfxLineSupplierId } = params || {};
    const unitPriceFlag = this.getUnitPriceFlag();
    const totalPriceFlag = this.getTotalPriceFlag();
    // const chatRoomExpand = chatRoomShowType === 'SHOW';
    const { unreadMsgNum = 0 } = chatRoomMessage || {};

    // 单价+并行+整单批量出价
    const unitWholeBatchPriceFlag = this.biddingUnitWholeBatchPriceFlag();

    const readonlyOrPausedFlag = this.readonlyOrPaused();

    const commonProps = {
      pageLoading,
      pageOperationLoading,
      pageReadOnlyFlag,
      unitWholeBatchPriceFlag,
      readonlyOrPausedFlag,
      headerInfo,
      headerRule,
      countDownShowAllZeroFlag,
      lovs,
      doubleUnitFlag,
      caclRule,
      quotationInputAutoCalculateFlag,
      supplementUnitPriceFlag,
      biddingSupLineCurId,
      rfxLineSupplierId,
      match,
      unitPriceFlag,
      totalPriceFlag,
      // chatRoomExpand,
      unitPriceLineFloatType,
      organizationId: this.organizationId,
      headerDS: this.headerDS,
      headerBasicInfoDS: this.headerBasicInfoDS,
      headerBasicInfoDetailDS: this.headerBasicInfoDetailDS,
      fetchBasicInfoHeader: this.fetchBasicInfoHeader,
      ruleDS: this.ruleDS,
      quotationLineDS: this.quotationLineDS,
      quotationDetailViewListDS: this.quotationDetailViewListDS,
      detailViewFormDS: this.detailViewFormDS,
      biddingHistoryDS: this.biddingHistoryDS,
      offerPriceViewFlag,
      getCustomizeUnitCode: this.getCustomizeUnitCode,
      getBasicInfoCustomizeCode: this.getBasicInfoCustomizeCode,
      customizeForm,
      customizeTable,
      customizeCommon,
      customizeBtnGroup,
      quotationHeaderStatusTableColor: this.quotationHeaderStatusTableColor,
      remote: biddingSupRemote,
      quotationStatusColor: this.quotationStatusColor,
      refreshContent: this.refreshContent,
      supplierCollection: this.supplierCollection,
      initPage: this.initPage,
      fetchHeaderInfo: this.fetchHeaderInfo,
      afterSaveBaseInfoFetchHeader: this.afterSaveBaseInfoFetchHeader,
      getTaxOrUntax: this.getTaxOrUntax,
      getBiddingFlag: this.getBiddingFlag,
      getAuctionFlag: this.getAuctionFlag,
      detailViewItemInfoFormDS: this.detailViewItemInfoFormDS,
      getBiddingRemainingQuotationCount: this.getBiddingRemainingQuotationCount,
      unitPriceListViewTableOnPagination: this.unitPriceListViewTableOnPagination,
      unitPriceWholeBatchPriceRecalculateTablePrice: this
        .unitPriceWholeBatchPriceRecalculateTablePrice,
      getHeaderBasicInfoModalReadOnlyFlag: this.getHeaderBasicInfoModalReadOnlyFlag,
      cuxObject: this.cuxObject,
      handleChangeQuotationQuantity: this.handleChangeQuotationQuantity,
      hideIdentityAndQuote: this.hideIdentityAndQuote,
      beforeOpenHeaderBaseInfoModal: this.beforeOpenHeaderBaseInfoModal,
      afterCloseHeaderBaseInfoModal: this.afterCloseHeaderBaseInfoModal,
      britishBidding: this.britishBidding,
      japanBiddingTotalPrice: this.japanBiddingTotalPrice,
      dutchBiddingTotalPrice: this.dutchBiddingTotalPrice,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      japOrDutchBidding: this.japOrDutchBidding,
      japanBidding: this.japanBidding,
      dutchBidding: this.dutchBidding,
      biddingFinishedOrProhibit: this.biddingFinishedOrProhibit,
      biddingSupplierEliminate: this.biddingSupplierEliminate,
      getCurrentProcessNode: this.getCurrentProcessNode,
    };

    const baseInfoProps = {
      ...commonProps,
    };

    const PriceContentProps = {
      ...commonProps,
      onRef: this.setUnitPriceRef,
      biddingHallContentRef: this.setBiddingHallContent,
      offerPrice: this.offerPrice,
      queryUnitPriceSummaryTable: this.queryUnitPriceSummaryTable,
      unitPriceDetailViewListDataSelected: this.unitPriceDetailViewListDataSelected,
      closeOfferPriceDetail: this.closeOfferPriceDetail,
      totalPriceTableDS: this.totalPriceTableDS,
      submitQuotationPrice: this.submitQuotationPrice,
      saveTotalPriceTable: this.saveTotalPriceTable,
      countDownTimerOver: this.countDownTimerOver,
      unitPriceListViewTableSave: this.unitPriceListViewTableSave,
      unitPriceWholeTalbeSearchBarRef: this.unitPriceWholeTalbeSearchBarRef,
      setUnitPriceWholeTableSearchBarRef: this.setUnitPriceWholeTableSearchBarRef,
    };

    const warningMessageProps = {
      header: headerInfo,
      headerInfoDS: this.headerDS,
      onRef: this.setWarningRef,
      supplierFlag: 1,
      remote: biddingSupRemote,
    };

    const roomParams = chatRoomVisible ? this.getRoomParams() : null;

    let siderDom = (
      <Sider
        className={classnames(Style['supplier-bidding-hall-body-sidebar'], {
          // [style['sidebar-hide-all']]: !chatRoomVisible || !chatRoomExpand,
        })}
      >
        <Tabs
          activeKey={tabKey}
          defaultActiveKey="message"
          onChange={this.changeTabLeftAtSider}
          style={{
            height: '100%',
          }}
        >
          <TabPane
            tab={intl.get('ssrc.common.view.warningMessage').d('警示消息')}
            key="message"
            className={Style['tabs-message-wrap']}
          >
            <WarningMessageTime {...warningMessageProps} />
          </TabPane>
          <TabPane
            tab={() => {
              const title = intl.get('ssrc.common.view.chat').d('聊天');
              const showCount = tabKey !== 'chat' && unreadMsgNum;

              return (
                <span>
                  {title}
                  {showCount ? (
                    <Badge count={unreadMsgNum} size="small" style={{ marginLeft: '4px' }} />
                  ) : (
                    ''
                  )}
                </span>
              );
            }}
            key="chat"
            hidden={!chatRoomVisible}
            forceRender
            style={{
              height: '100%',
            }}
          >
            {chatRoomVisible && tabKey === 'chat' ? (
              <ChatRoom
                contentStyle={{ width: '100%', height: 'calc(100% - 60px)' }}
                contentClass="ssrc-bidding-hall-chat-room-content"
                pageStyle="cover"
                businessCode="source-bidding"
                roomParams={roomParams}
                // groupMemberEnable={false}
                onRef={(ref) => {
                  this.chatRoomRef = ref;
                }}
              />
            ) : (
              ''
            )}
          </TabPane>
        </Tabs>
      </Sider>
    );

    siderDom = biddingSupRemote
      ? biddingSupRemote.process('SSRC_SUPPLIER_BIDDINGHALL_PROCESS_SIDER', siderDom, {
          that: this,
        })
      : siderDom;

    return (
      <Spin
        spinning={pageLoading || pageOperationLoading}
        wrapperClassName="ssrc-bidding-page-wrap-spin-wrap"
      >
        <Header
          // backPath={this.getBackPath()}
          title={this.renderPageTitle()}
          onBack={this.onBack}
          className={Style['ssrc-header-wrap']}
        />

        <div
          className={`${Style['supplier-bidding-hall']} ${
            biddingSupRemote
              ? biddingSupRemote.process('SSRC_SUPPLIER_BIDDINGHALL_CLASSNAME', '', {})
              : ''
          }`}
        >
          <Layout style={{ height: '100%' }}>
            <LayoutHeader className={Style['supplier-bidding-hall-body-header']}>
              <BaseInfo {...baseInfoProps} />
            </LayoutHeader>

            <Layout className={Style['supplier-bidding-hall-body']}>
              <LayoutContent className={Style['supplier-bidding-hall-body-main-content-wrapper']}>
                {!isEmpty(processNodeData) && processNodeData?.biddingNodeDTOS?.length >= 2 ? (
                  <LayoutHeader className={Style['supplier-bidding-hall-body-process-node']}>
                    <BiddingProcessNode
                      processNodeData={processNodeData}
                      japOrDutchBiddingTotalPrice={this.japOrDutchBiddingTotalPrice}
                    />
                  </LayoutHeader>
                ) : (
                  ''
                )}
                <LayoutContent
                  className={classnames(Style['supplier-bidding-hall-body-content'], {
                    [Style['supplier-bidding-hall-body-content-total-amount']]: !!totalPriceFlag,
                  })}
                >
                  <BiddingHallContent {...PriceContentProps} />
                </LayoutContent>
                {unitWholeBatchPriceFlag ? (
                  <LayoutFooter className={Style['supplier-bidding-hall-body-whole-batch-wrap']}>
                    <UnitPriceWholeBatchWarningPrice {...PriceContentProps} />
                  </LayoutFooter>
                ) : (
                  ''
                )}
              </LayoutContent>

              {siderDom}
            </Layout>
          </Layout>
        </div>
      </Spin>
    );
  }
}

const hocComponent = (NewComponent) => {
  // const { bidFlag = false } = options || {};

  const unitCodes = [
    'SSRC.BIDDING_HALL_SUPPLIER.HEADER_TAG', // 头信息标签
    'SSRC.BIDDING_HALL_SUPPLIER.HEADER_BASE_INFO_MODAL_FORM',
    'SSRC.BIDDING_HALL_SUPPLIER.HEADER_RULE_FIELDS', // 头信息-RULE_规则
    'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_CARD', // unitPricePlaceCard
    'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_TABLE_BTNS',
    'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_DETAIL_FORM',
    'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL_FORM',
    'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL_BTN_GROUP',
    'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE.LINE', // 报价行信息
    'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE.LINE_SEARCH',
    'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_DETAIL.ITEM_INFO_FORM',
    // 'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_DETAIL.LIST',
    // 'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE.FORM',
    'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE_BATCH_EDIT', // 批量编辑
    'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL.ITEM_LINE',
    'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL.ITEM_LINE_SEARCH',
    'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_BATCH_EDIT', // 批量编辑
    'SSRC.BIDDING_HALL_SUPPLIER.HEADER_BASE_INFO_MODAL_FORM_DETAIL',
    'SSRC.BIDDING_HALL_SUPPLIER.HEADER_BASE_INFO_MODAL_FORM_LINK_BUTTONS',
  ];

  return compose(
    withCustomize({
      unitCode: unitCodes,
    }),
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.biddingHall',
        'ssrc.sourceTemplate',
        'sscux.common', // cux
        'scux.ssrcCommon', // cux
        'sscux.ssrc', // cux
      ],
    }),
    remote(
      {
        code: 'SSRC_SUPPLIER_BIDDINGHALL',
        name: 'biddingSupRemote',
      },
      {
        events: {
          remoteMounted() {},
          afterFetchHeaderOperateEvents() {},
          baseInfoModalHandleOk(props) {
            const { baseInfoModalSave = noop } = props;
            return baseInfoModalSave();
          },
          handleCuxRefreshPartialFieldsFlag() {},
          initPageLastHandle() {},
        },
      }
    )
  )(observer(NewComponent));
};

export default hocComponent(BiddingHallComponent);
export { hocComponent, BiddingHallComponent };
