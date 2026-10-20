/**
 * 竞价大厅-采购方
 * @date: 2023-5-09
 */
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Spin, Layout, Icon, Badge, Tabs, Tooltip } from 'choerodon-ui';
import { Header } from 'components/Page';
import classNames from 'classnames';
import { noop, debounce, isEmpty, compose, isNil, isFunction } from 'lodash';
import querystring from 'querystring';

import intl from 'utils/intl';
import webSocketManagener from 'utils/webSoket';
import {
  getResponse,
  getCurrentOrganizationId,
  getCurrentRole,
  getCurrentUser,
  filterNullValueObject,
} from 'utils/utils';

import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';
import { observer } from 'mobx-react';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';
// import { openTab, getTabFromKey } from 'utils/menuTab';
import { runInAction } from 'mobx';
import moment from 'moment';

import { Section } from '@/routes/ssrc/BiddingHall/components/';
import { getJumpRoutePrefixUrl, isText } from '@/utils/utils';
import {
  queryEnableDoubleUnit,
  // fetchUserConfig,
  // updateUserConfig,
  queryConfigurationOldRate,
} from '@/services/commonService';
import { idValidations } from '@/routes/components/Widget/dataVerification';
import { getChatRoomConfigs } from '@/routes/ssrc/BiddingHall/utils/chatRoomConfigs';

import {
  fetchChatRoomUnreadMessage,
  biddingHallChatRoomAddMembers,
} from '@/services/biddingHallService';
import {
  getPurCustomizeUnitCode,
  japanDutchAggregrationTableDataProcessing,
} from '@/routes/ssrc/BiddingHall/utils/utils';
import TopHeader from './page/Header';
import LeftSider from './page/LeftSider';
import MainContent from './page/MainContent';
import { NetSignal, BiddingProcessNode, WarningMessageTime } from '../components';

import { BiddingRuleDS, BiddingSiteDS, BidCountDS } from './stores/biddingRuleDS';
import { supplierListDS, unitPriceListDS } from './stores/unitPriceDS';
import {
  totalPriceItemListDS,
  totalPriceSupplierListDS,
  japanDutchRoundListDS,
  japanDutchAggregationTableDS,
} from './stores/totalPriceDS';
import { headerDS } from './stores/headerDs.js';
import {
  // fetchPurchaseBiddingHeader,
  getCurrentServiceTime,
} from './api';

import style from './index.less';

const { Header: LayoutHeader, Sider, Content: LayoutContent } = Layout;
const { TabPane } = Tabs;

const organizationId = getCurrentOrganizationId();
const TimeoutTime = 2_000;
const CHAT_ROOM_REFRESH_INTERVAL = 5_000; // 聊天室未读消息轮询间隔
const POLLING_REFRESH_TIME = 20_000; // 轮询更新行主页面

const AGGREGRATION_CONFIG = {
  loadLength: 15, // 每次加载固定轮次
};
const REFRESH_CONTENT_INTERVAL = 15_000; // 日/荷，总价 聚合表格 表格询查询

// const CHART_ROOM_USER_CONFIG_DESC = 'BIDDING_HALL_PURCHASE_CHAT_ROOM_EXPAND';

let socketUrl = '';

const BiddingHallComponent = (props = {}) => {
  const {
    location,
    location: { pathname, search } = {},
    match: { params, url } = {},
    history,
    customizeBtnGroup,
    customizeCollapseForm,
    customizeCommon,
    biddingRemote,
  } = props || {};
  const { rfxHeaderId } = params || {};
  const searchObj = querystring.parse(search.substr(1)) || {};
  const { projectLineSectionId, sectionFlag } = searchObj;

  /**
   * 初始化ds
   */
  // 头DS // TODO: 头信息使用ds优化
  const headerInfoDS = useMemo(() => new DataSet(headerDS({ rfxHeaderId, organizationId })), [
    params,
  ]);
  // 竞价现场DS
  const biddingSiteInfoDataSet = useMemo(() => new DataSet(BiddingSiteDS()), []);
  // 竞价现场-出价次数DS
  const bidCountDataSet = useMemo(
    () => new DataSet(BidCountDS({ headerInfoDS, rfxHeaderId, organizationId })),
    []
  );
  // 竞价规则DS
  const biddingRuleDataSet = useMemo(() => new DataSet(BiddingRuleDS()), []);
  // 单价竞价-供应商列表DS
  const supplierListDataSet = useMemo(() => new DataSet(supplierListDS()), []);
  // 单价竞价-物料列表DS
  const itemLineListDS = useMemo(() => new DataSet(unitPriceListDS()), []);
  // 总价竞价-左侧标的物列表DS
  const totalPriceItemListDataSet = useMemo(() => new DataSet(totalPriceItemListDS()), []);
  // 总价竞价-供应商列表DS
  const totalPriceSupplierListDataSet = useMemo(() => new DataSet(totalPriceSupplierListDS()), []);

  const japanDutchRoundListDs = useMemo(() => new DataSet(japanDutchRoundListDS()), []);

  const japanDutchAggregationTableDs = useMemo(
    () => new DataSet(japanDutchAggregationTableDS()),
    []
  );

  // 查询竞价现场
  const biddingSiteTimerRef = useRef(null);
  // socket 如果链接失败，需要再次链接
  const sockerCreateLinkTimer = useRef(null);
  // soket 连接次数
  const socketCreateLinkCountRef = useRef(0);

  const japanDutchAggregationTableQueryPollingRef = useRef(null);

  // 未读消息定时器
  const chatRoomMessageRef = useRef(null);

  // 每隔一段时间刷新页面
  const pollingRefreshLineTimer = useRef(null);

  // chat room ref
  const chatRoomRef = useRef(null);

  const warningRef = useRef(null);

  // 头数据
  const [headerInfo, setHeaderInfo] = useState({});

  const headerInfoRef = useRef({});

  // list ref
  const japanDutchListRef = useRef({});

  // aggregration ref
  const aggregrationTableRef = useRef({});

  // 全页面loading
  const [pageLoading, setPageLoading] = useState(false);

  // 聊天室展开 SHOW/HIDE
  const [chatRoomShowType] = useState('SHOW');

  // 聊天室展开 // 未读消息对象
  const [chatRoomMessage, setChatRoomMessage] = useState({});

  // chart room visible
  const [chatRoomVisible, setChatRoomVisible] = useState(false);

  const [useNewRateFlag, setUseNewRateFlag] = useState(0); // 是否使用老重合率标识

  // tab message chat
  const [tabKey, setTabKey] = useState('message');

  // 竞价视图
  const biddingViewRef = useRef({ currentBiddingView: 0 });

  const [biddingView, setBiddingView] = useState(0);

  // 为了确保同步处理，需要对值做处理
  const leftTabKeyRef = useRef({
    tabKey: 'message',
  });

  const activeTabKey = getJumpRoutePrefixUrl(pathname);

  useEffect(() => {
    initComponent();
    return () => {
      clearDestroyComponent();
    };
  }, [search, rfxHeaderId]);

  useEffect(() => {
    // 浏览器切换事件
    document.addEventListener('visibilitychange', chromeTabVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', chromeTabVisibilityChange);
    };
  }, [chatRoomShowType, chromeTabVisibilityChange]);

  // 竞价已截止判断
  const biddingEndFlag = () => {
    const { biddingStatus } = headerInfoDS?.current?.get(['biddingStatus']) || {};

    const flag = ['BIDDING_CLOSED', 'BIDDING_END', 'BIDDING_PAUSED'].includes(biddingStatus);

    return flag;
  };

  // 初进入页面的一些初始化操作
  const initComponent = useCallback(async () => {
    fullScreen();
    initWebSoketConnect();
    queryDoubleUnit();
    fetchUseOldRate();
    await initPageData();
    registerWebSocketConnect();
    rollingFetchChatRoomMessage();
  }, [search, rfxHeaderId, chatRoomShowType, useNewRateFlag]);

  // 查询重合率配置表
  const fetchUseOldRate = async () => {
    const res = await queryConfigurationOldRate();
    if (getResponse(res)) {
      if (!isEmpty(res) && res[0]?.whiteFlag === '0') {
        setUseNewRateFlag(0);
      } else {
        setUseNewRateFlag(1);
      }
    }
  };

  // 页面卸载时执行的一些操作
  const clearDestroyComponent = () => {
    clearBiddingSiteTimer();
    closeSocket();
    clearSockerCreateLinkTimer();
    closeFullScreen();
    document.removeEventListener('visibilitychange', chromeTabVisibilityChange);
    clearChatRoomUnreadWatcher();
    clearPollingRefreshLineTimer();
    clearjapanDutchAggregationTableQueryPollingTimer();
  };

  const clearChatRoomUnreadWatcher = () => {
    if (chatRoomMessageRef.current) {
      clearInterval(chatRoomMessageRef.current);
    }
  };

  const clearjapanDutchAggregationTableQueryPollingTimer = () => {
    const { current: currentTimerRef } = japanDutchAggregationTableQueryPollingRef || {};
    if (currentTimerRef) {
      clearInterval(currentTimerRef);
    }
  };

  // chat room add members
  // useEffect(() => {
  //   chatRoomAddMembers();
  // }, [headerInfo, chatRoomRef?.current]);

  // open full screen
  const fullScreen = useCallback(() => {
    const node = document.querySelector(`#root`).firstElementChild;
    if (node) {
      node.classList.add('ssrc-bidding-hall-fullscreen');
    }
  }, []);

  // chrome change tab event handle
  const chromeTabVisibilityChange = useCallback(() => {
    const HiddenChromeTabFlag = document?.hidden;

    if (!HiddenChromeTabFlag) {
      getCurrentDateToCountDown();

      rollingFetchChatRoomMessage();

      startPollingRefreshLine();
    }
  }, [document?.hidden, chatRoomShowType]);

  // 切换浏览器 请求服务器当前时间 防止倒计时出现误差
  const getCurrentDateToCountDown = useCallback(() => {
    const { biddingStatus, quotationOrderType } =
      headerInfoDS?.current?.get(['biddingStatus', 'quotationOrderType']) || {};
    // 单据状态为【已关闭、已完成、已暂停】，则切屏无需处理
    if (['BIDDING_CLOSED', 'BIDDING_END', 'BIDDING_PAUSED'].includes(biddingStatus)) return;
    if (getUnitPriceFlag() && quotationOrderType === 'SEQUENCE') {
      // 【单价竞价 & 报价次序为序列】时物料行上有倒计时
      runInAction(() => {
        getCurrentServiceTime().then((res) => {
          if (res && !res.failed) {
            const { currentTime } = res;
            itemLineListDS.forEach((record) => {
              // 若长时间息屏或者不在当前浏览器tab，则会出现物料可能已完成但是却卡在了进行中不动 也没有任何时间显示情况
              const { biddingLineRule = {}, biddingItemStatus } =
                record.get(['biddingLineRule', 'biddingItemStatus']) || {};
              const { quotationStartDate, quotationEndDate } = biddingLineRule || {};
              // 【未开始】& 【 开始时间 <= 当前时间 < 截止时间】则手动赋值进行中
              if (
                biddingItemStatus === 'BIDDING_NOT_START' &&
                quotationStartDate &&
                quotationEndDate &&
                moment(currentTime).isSameOrAfter(quotationStartDate) &&
                moment(currentTime).isBefore(quotationEndDate)
              ) {
                record.set({
                  currentTime,
                  biddingItemStatus: 'BIDDING_IN_PROGRESS',
                  biddingItemStatusMeaning: intl
                    .get('ssrc.biddingHall.view.title.onGoing')
                    .d('进行中'),
                });
                return;
              }
              // 【进行中】& 【 当前时间 >= 截止时间 】则手动赋值已完成
              if (
                biddingItemStatus === 'BIDDING_IN_PROGRESS' &&
                quotationEndDate &&
                moment(currentTime).isSameOrAfter(quotationEndDate)
              ) {
                record.set({
                  currentTime,
                  biddingItemStatus: 'BIDDING_END',
                  biddingItemStatusMeaning: intl
                    .get('ssrc.biddingHall.view.title.completed')
                    .d('已完成'),
                });
                return;
              }
              record.set('currentTime', currentTime);
            });
          }
        });
      });
    } else if (getTotalPriceFlag() || (getUnitPriceFlag() && quotationOrderType === 'PARALLEL')) {
      // 总价竞价 & 【单价竞价且报价次序为并行】 头上有倒计时
      getCurrentServiceTime().then((res) => {
        if (res && !res.failed) {
          const { currentTime } = res;
          // eslint-disable-next-line no-unused-expressions
          headerInfoDS?.current?.set('currentTime', currentTime);
        }
      });
    }
  }, [headerInfoDS, itemLineListDS, getUnitPriceFlag, getTotalPriceFlag]);

  const clearSockerCreateLinkTimer = () => {
    if (sockerCreateLinkTimer.current) {
      clearTimeout(sockerCreateLinkTimer.current);
    }
  };

  // 页面loading
  const toggleLoading = (loading = false) => {
    setPageLoading(loading);
  };

  /**
   * 查询头信息
   */
  const fetchHeaderInfo = async () => {
    // 校验id是否合法
    idValidations([rfxHeaderId, organizationId]);

    // 查询头信息
    let headerData = await headerInfoDS.query();
    headerData = headerData || {};

    setHeaderInfo(headerData);
    headerInfoRef.current.headerInfoData = headerData;

    return headerData;
  };

  /**
   * 初始化页面数据
   *
   * 头查询完起一个轮询，每隔一段时间更新头接口
   * */
  const initPageData = useCallback(async () => {
    const headerData = await fetchHeaderInfo();

    startPollingRefreshLine();

    initQueryDS(headerData);
  }, [headerInfoDS]);

  /**
   * 刷新页面核心接口，类似头信息
   */
  const refreshPageCoreFunction = () => {
    if (biddingEndFlag()) {
      clearPollingRefreshLineTimer();
      return;
    }

    fetchHeaderInfo();
  };

  /**
   * 轮询查询页面信息
   */
  const startPollingRefreshLine = () => {
    clearPollingRefreshLineTimer();

    pollingRefreshLineTimer.current = setInterval(refreshPageCoreFunction, POLLING_REFRESH_TIME);
  };

  const clearPollingRefreshLineTimer = () => {
    if (pollingRefreshLineTimer?.current) {
      clearTimeout(pollingRefreshLineTimer?.current);
    }
  };

  // 开启竞价现场定时器
  const openBiddingSiteTimer = useCallback(() => {
    const biddingStatus = headerInfoDS?.current?.get('biddingStatus');
    // 如果是完成、关闭的单子，不开启轮询
    if (['BIDDING_CLOSED', 'BIDDING_END'].includes(biddingStatus)) {
      clearBiddingSiteTimer();
      return;
    }
    // 没有开启竞价现场轮询，则开启轮循
    if (!biddingSiteTimerRef.current) {
      biddingSiteTimerRef.current = setInterval(() => {
        fetchBiddingSiteInfo();
      }, 5000);
    }
  }, [biddingSiteTimerRef?.current, fetchBiddingSiteInfo, headerInfoDS]);

  // 清除竞价现场定时器
  const clearBiddingSiteTimer = () => {
    if (biddingSiteTimerRef?.current) {
      clearTimeout(biddingSiteTimerRef.current);
      biddingSiteTimerRef.current = null;
    }
  };

  // 竞价开始之前
  const beforeBiddingOnGoingFlag = () => {
    const { biddingStatus, originalStatus } = headerInfo || {};
    const flag = !(
      ['SIGN_NOT_START', 'SIGNING', 'TRIAL_BIDDING_NOT_START', 'BIDDING_NOT_START'].includes(
        biddingStatus
      ) ||
      (['BIDDING_PAUSED', 'BIDDING_CLOSED'].includes(biddingStatus) &&
        ['SIGN_NOT_START', 'SIGNING', 'TRIAL_BIDDING_NOT_START', 'BIDDING_NOT_START'].includes(
          originalStatus
        ))
    );
    return flag;
  };

  // 查询竞价现场
  const fetchBiddingSiteInfo = useCallback(() => {
    biddingSiteInfoDataSet.query();
  }, [biddingSiteInfoDataSet]);

  // 查询竞价现场-出价次数
  const fetchBidCountDataSet = useCallback(() => {
    bidCountDataSet.query();
  }, [bidCountDataSet]);

  // 处理ds参数
  const initQueryDS = async (header) => {
    const {
      biddingStatus,
      quotationOrderType,
      roundNumber,
      sealedQuotationFlag,
      currentBiddingRoundNumber,
      trialBiddingFlag,
      biddingEndFlag: headerBiddingEndFlag, // 试竞价截止/正式竞价截止标识
      biddingNotStartFlag, // 试竞价/正式竞价未开始标识
    } = header || {};

    const payload = {
      rfxHeaderId,
      roundNumber,
      organizationId,
      biddingStatus,
      tenantId: organizationId,
      biddingQuotationOrder: quotationOrderType,
      sealedQuotationFlag,
      currentBiddingRoundNumber,
      trialBiddingFlag,
      biddingNotStartFlag,
      biddingEndFlag: headerBiddingEndFlag,
    };
    supplierListDataSet.setQueryParameter('commonProps', payload);
    supplierListDataSet.setQueryParameter('header', header);
    totalPriceItemListDataSet.setQueryParameter('commonProps', payload);
    totalPriceSupplierListDataSet.setQueryParameter('commonProps', payload);
    totalPriceSupplierListDataSet.setQueryParameter('header', header);
    biddingSiteInfoDataSet.setQueryParameter('commonProps', payload);
    biddingSiteInfoDataSet.setQueryParameter('header', header);
    biddingRuleDataSet.setQueryParameter('commonProps', {
      ...payload,
      customizeUnitCode: getPurCustomizeUnitCode('biddingRule'),
    });
    biddingRuleDataSet.setQueryParameter('header', header);
    itemLineListDS.setQueryParameter('commonProps', {
      ...payload,
      customizeUnitCode: `${getPurCustomizeUnitCode(
        'unitPriceItemTableSearch'
      )},${getPurCustomizeUnitCode('unitPriceHeaderItemView')}`,
    });
    itemLineListDS.setQueryParameter('header', header);
    japanDutchRoundListDs.setQueryParameter('commonProps', payload);
    japanDutchRoundListDs.setQueryParameter('commonProps', {
      ...payload,
      customizeUnitCode: getPurCustomizeUnitCode('japanDutchRoundListHeaderForm'),
    });
    japanDutchAggregationTableDs.setQueryParameter('commonProps', payload);
    japanDutchAggregationTableDs.setQueryParameter('header', header);

    await fetchDataAfterInitQuery(header);
  };

  // 需要在头查询之后并且设置查询参数之后查询的数据
  const fetchDataAfterInitQuery = async (header) => {
    await fetchBiddingRule(header);

    refreshMainContent();

    fetchBiddingSiteInfo();
    await chatRoomAddMembers(header);
    openBiddingSiteTimer();
    fetchBidCountDataSet();
    fetchWarningMessageAndCount();
  };

  const refreshMainContent = () => {
    const japanOrDutchBidding = japOrDutchBidding();
    if (japanOrDutchBidding) {
      fetchJapanOrDutchContent();
      fetchItemList();
    }

    if (britishBidding()) {
      fetchSupplierList();
      fetchItemList();
    }
  };

  // double unit
  const queryDoubleUnit = useCallback(async () => {
    try {
      const res = await queryEnableDoubleUnit({
        businessModule: 'RFX',
        tenantId: organizationId,
      });
      if (isText(res)) {
        const currentDoubleFlag = !!Number(res);
        itemLineListDS.setQueryParameter('doubleUnitFlag', currentDoubleFlag);
        totalPriceItemListDataSet.setQueryParameter('doubleUnitFlag', currentDoubleFlag);
      }
    } catch (e) {
      throw e;
    }
  }, [itemLineListDS, totalPriceItemListDataSet]);

  // 查询竞价规则
  const fetchBiddingRule = useCallback(async () => {
    const rules = await biddingRuleDataSet.query();
    if (isEmpty(rules)) {
      return;
    }

    itemLineListDS.setQueryParameter('rules', rules);
    totalPriceSupplierListDataSet.setQueryParameter('biddingRules', rules);
  }, [biddingRuleDataSet, itemLineListDS, totalPriceSupplierListDataSet]);

  // 查询供应商列表
  const fetchSupplierList = useCallback(() => {
    if (getUnitPriceFlag()) {
      supplierListDataSet.query();
    } else if (getTotalPriceFlag()) {
      totalPriceSupplierListDataSet.query();
    }
  }, [supplierListDataSet, totalPriceSupplierListDataSet, getUnitPriceFlag, getTotalPriceFlag]);

  // 查询物料列表
  const fetchItemList = useCallback(() => {
    if (getUnitPriceFlag()) {
      itemLineListDS.query(itemLineListDS.currentPage || 1);
    } else if (getTotalPriceFlag()) {
      totalPriceItemListDataSet.query();
    }
    // 查询出价次数
    fetchBidCountDataSet();
  }, [
    itemLineListDS,
    totalPriceItemListDataSet,
    getUnitPriceFlag,
    getTotalPriceFlag,
    fetchBidCountDataSet,
  ]);

  const fetchJapanOrDutchContent = async () => {
    const { currentBiddingView } = biddingViewRef.current || {};
    const { handleDefaultOpenRoundItem } = japanDutchListRef.current || {};

    if (currentBiddingView === 0) {
      await japanDutchRoundListDs.query();
      clearjapanDutchAggregationTableQueryPollingTimer();

      if (handleDefaultOpenRoundItem) {
        await handleDefaultOpenRoundItem();
      }
    }

    if (currentBiddingView === 1) {
      queryAndPollingQueryJapanDutchAggregration();
    }
  };

  /**
   * 日式/荷兰 聚合表格
   * 数据处理
   * 详细逻辑可以参考japanDutchAggregationTableDS上边的数据注释
   * */
  const handleRebuileAggregrationTableDataForDS = (param = {}) => {
    const { start, end, leftScrollAppendFlag = 0 } = param || {};
    const { data } = japanDutchAggregationTableDs?.getState('currentTableCacheObj') || {};
    const { biddingRoundInfoDTOList = [] } = data || {};

    const { length } = biddingRoundInfoDTOList || [];

    if (!length) {
      return;
    }

    runInAction(() => {
      const { newData } = japanDutchAggregrationTableDataProcessing(data, { start, end });

      if (leftScrollAppendFlag) {
        japanDutchAggregationTableDs.appendData(newData);
      } else {
        japanDutchAggregationTableDs.loadData(newData);
      }
    });
  };

  /**
   * 日式/荷兰 聚合表格 query
   */
  const queryJapanDutchAggregration = async () => {
    const result = await japanDutchAggregationTableDs.query();

    const { biddingRoundInfoDTOList = [] } = result || {};

    japanDutchAggregationTableDs.setState(
      'acceptedSupplierCount',
      result?.acceptedSupplierCount || 0
    );

    japanDutchAggregationTableDs.setState('currentTableCacheObj', {
      data: result || {},
      currentEndRound: AGGREGRATION_CONFIG.loadLength,
      allRound: biddingRoundInfoDTOList?.length,
    });

    handleRebuileAggregrationTableDataForDS({
      start: 0,
      end: AGGREGRATION_CONFIG.loadLength,
    });
  };

  // 日式/荷兰 总价-聚合表格查询 并且启动轮询查询
  const queryAndPollingQueryJapanDutchAggregration = async () => {
    queryJapanDutchAggregration();

    clearjapanDutchAggregationTableQueryPollingTimer();

    if (biddingFinished()) {
      return;
    }

    // 聚合表 需要定时更新
    japanDutchAggregationTableQueryPollingRef.current = setInterval(() => {
      queryJapanDutchAggregration();
    }, REFRESH_CONTENT_INTERVAL);
  };

  // 单价竞价标识
  const getUnitPriceFlag = useCallback(() => {
    const { biddingTarget } = headerInfoDS?.current?.get(['biddingTarget']) || {};
    return biddingTarget === 'UNIT_PRICE';
  }, [headerInfoDS]);

  // 总价竞价标识
  const getTotalPriceFlag = useCallback(() => {
    const { biddingTarget } = headerInfoDS?.current?.get(['biddingTarget']) || {};
    return biddingTarget === 'TOTAL_PRICE';
  }, [headerInfoDS]);

  /**
   * 初始化webSoket连接
   */
  const initWebSoketConnect = useCallback(() => {
    if (webSocketManagener?.socketStatus !== 32) {
      webSocketManagener.initWebSocket();
    }
  }, []);

  /**
   * 注册发布列表连接
   */
  const registerWebSocketConnect = useCallback(() => {
    const { roundNumber } = headerInfoDS?.current?.get(['roundNumber']) || {};
    if (socketCreateLinkCountRef?.current > 5) {
      throw ReferenceError('socket is tried multile times, please check fields is empty ?');
    }
    const mainFieldLackFlag = !rfxHeaderId || !roundNumber || !organizationId;
    if (mainFieldLackFlag) {
      socketCreateLinkCountRef.current += 1;
      if (sockerCreateLinkTimer.current) {
        clearSockerCreateLinkTimer();
        sockerCreateLinkTimer.current = setTimeout(registerWebSocketConnect, TimeoutTime);
      }
      return;
    }

    clearSockerCreateLinkTimer();

    socketUrl = `/topic/monitor/bidding-hall-pur/${organizationId}/${rfxHeaderId}/${roundNumber}`;

    webSocketManagener.addListener(socketUrl, socketEventListener);
  }, [contentNeedRefreshByFlag, headerInfoDS]);

  // socket event listener
  const socketEventListener = (messageData) => {
    const data = JSON.parse(messageData?.message);
    console.log(messageData, data, 'messageData');
    if (data) {
      contentNeedRefreshByFlag(data);
      // handleNeedRefreshContent();
    }
  };

  /**
   * 关闭webSocket链接
   */
  const closeSocket = () => {
    if (socketUrl && webSocketManagener.removeListener) {
      webSocketManagener.removeListener(socketUrl, socketEventListener);
    }

    if (webSocketManagener?.destroyWebSocket) {
      webSocketManagener.destroyWebSocket();
    }
  };

  /**
   * {
      "refreshAllFlag":1,
      "refreshBiddingRuleFlag":0,
      "refreshTimeFlag":0,
      "refreshSuspendFlag":0,
      "refreshFiringFlag":0,
      "refreshBiddingCloseFlag":0,
      "refreshLineSupplierInfoFlag":0,
      "refreshQuotationInfoFlag":0
    }
   */
  // 接收到刷新标识，2s内收到多次，只刷新1次，并且如果同时收到全部刷新标识和其他刷新标识，则全部刷新标识优先；
  const contentNeedRefreshByFlag = useCallback(
    (messageData) => {
      if (isEmpty(messageData)) return;

      const refreshMaps = new Map();

      Object.keys(messageData).forEach((key) => {
        if (!key) return;
        const value = messageData[key];
        if (!value) return; // value 为0或者null、undefined时不处理

        let handle = () => {};
        let refreshEffect = '';
        // 目前暂停、启动、关闭都先刷新全页面，后续需求有变更再修改；并且产品说中心提示（竞价单已暂停或关闭）只在页面进来或者大刷新的时候显示3s
        switch (key) {
          case 'refreshAllFlag': // 全部刷新标识
          case 'refreshFiringFlag': // 启动刷新标识
          case 'refreshTimeFlag': // 时间刷新标识
          case 'refreshSuspendFlag': // 暂停刷新标识
          case 'refreshBiddingCloseFlag': // 竞价单关闭标识
            handle = initPageData;
            refreshEffect = 'all';
            break;
          case 'refreshBiddingRuleFlag': // 竞价规则刷新标识
            handle = () => {
              fetchBiddingRule();
              fetchWarningMessageAndCount();
            };
            refreshEffect = 'rule';
            break;
          case 'refreshLineSupplierInfoFlag': // 供应商列表刷新标识
            handle = () => {
              refreshMainContent();
              fetchWarningMessageAndCount();
            };
            refreshEffect = 'unitPriceSupplier';
            break;
          case 'refreshQuotationInfoFlag': // 在供应商报价提交时或删除报价推送此表示 和供应商有关的排名以及报价等相关的都要刷新
            handle = () => {
              refreshMainContent();
              fetchWarningMessageAndCount();
            };
            refreshEffect = 'unitPriceItem';
            break;
          default:
            break;
        }
        if (refreshEffect) {
          refreshMaps.set(refreshEffect, {
            value,
            handle,
          });
        }
      });
      // setRefreshMap(refreshMaps);
      handleNeedRefreshContent(refreshMaps);
    },
    [
      headerInfo,
      initPageData,
      fetchBiddingRule,
      fetchItemList,
      fetchSupplierList,
      handleNeedRefreshContent,
    ]
  );

  /**
   * socket message manager
   * 依据 lastTimeSocketMessageTimerRecordMap 中的refreshEffect做key，
   * 刷新页面,并在执行完对应刷新效果后清空对应的map->key
   */

  const handleNeedRefreshContent = useCallback(
    debounce((refreshMaps) => {
      if (!refreshMaps?.size) {
        return;
      }
      for (const [key, value] of refreshMaps) {
        const { handle = noop } = value || {};
        switch (key) {
          case 'all':
            handle();
            refreshMaps.clear();
            break;
          default:
            handle();
            refreshMaps.delete(key);
            break;
        }
      }
    }, 2000),
    []
  );

  // 定位到当前页面
  const locatedCurrentUrl = (data = {}) => {
    const { projectLineSectionId: currentProjectLineSectionId = null, sourceHeaderId } = data || {};
    if (!sourceHeaderId) {
      return;
    }

    const previewSearchObj = searchObj || {};

    const newSearch = querystring.stringify({
      ...previewSearchObj,
      projectLineSectionId: currentProjectLineSectionId,
    });

    history.push({
      pathname: `/pub${activeTabKey}/bidding-hall/${sourceHeaderId}`,
      search: newSearch,
    });
  };

  // refresh all page
  const refreshCurrentPage = debounce(async () => {
    toggleLoading(true);
    await initComponent();
    toggleLoading(false);
  }, 500);

  // 自定义头部标题内容
  const renderPageTitle = useCallback(() => {
    const { roundNumber, biddingStatus } =
      headerInfoDS?.current?.get(['roundNumber', 'biddingStatus']) || {};
    let requestPrams = {};
    if (rfxHeaderId && !isNil(organizationId) && !isNil(roundNumber)) {
      requestPrams = filterNullValueObject({
        ...requestPrams,
        tenantId: organizationId,
        roundNumber,
        rfxHeaderId,
      });
    }
    const netSignalProps = {
      requestUrl: `/ssrc/v1/${organizationId}/bidding/user-info/monitor`,
      requestPrams,
    };

    // 是否显示网络信号 参数不为空并且单据状态不为【关闭、】
    const showNetSignalFlag = !isEmpty(requestPrams) && !['BIDDING_CLOSED'].includes(biddingStatus);

    const currentPageSection = sectionFlag === '1' && projectLineSectionId;

    const sectionProps = {
      name: 'BIDDING_PURCHASE',
      queryParam: {
        rfxHeaderId,
      },
      sectionFlag,
      projectLineSectionId,
      // queryMain: sectionQueryMain,
      locatedCurrentUrl,
      beforeChangeSection: clearDestroyComponent,
    };

    // cdp-104981协鑫埋点
    const { handleBidHallTitle = undefined } = biddingRemote?.props?.process || {};

    return (
      <div className={classNames(style['ssrc-page-head-title-wrapper'])}>
        <span className={classNames(style['go-back'])} onClick={getBackPath}>
          <Icon type="navigate_before" />
          <span>{intl.get(`ssrc.common.model.common.return`).d('返回')}</span>
        </span>
        {isFunction(handleBidHallTitle) ? handleBidHallTitle(headerInfoDS, { ...props }) : null}
        {showNetSignalFlag && (
          <>
            <span className={classNames(style['split-line'])} />
            <NetSignal {...netSignalProps} />
          </>
        )}

        <div style={{ marginLeft: '8px' }}>
          <Tooltip title={intl.get('hzero.common.button.refresh').d('刷新')}>
            <Icon type="refresh" onClick={refreshCurrentPage} />
          </Tooltip>
        </div>

        {currentPageSection ? (
          <div className={style['ssrc-purchase-bidding-hall-header-section-wrap']}>
            <Section {...sectionProps} />
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }, [organizationId, headerInfoDS, rfxHeaderId, getBackPath, initPageData, search, biddingRemote]);

  /**
   * add members
   */
  const chatRoomAddMembers = useCallback(
    async (header) => {
      // const { addChatRoomMember } = chatRoomRef?.current || {};
      const { tenantId, companyId, companyName, rfxNum, chatEnableFlag = 1 } =
        header || headerInfo || {};

      const { name } = getCurrentRole() || {};
      const { id, realName } = getCurrentUser() || {};

      const emptyRequiredFlag = !tenantId || !companyId;

      const chatRoomEnabledTemplate = chatEnableFlag === 1;
      if (!chatRoomEnabledTemplate) {
        return;
      }

      if (emptyRequiredFlag) {
        return;
      }

      const data = {
        businessNo: rfxNum,
        businessTitle: intl.get('ssrc.common.view.chatRoom').d('聊天室'),
        businessCode: 'source-bidding',
        purchaseTenantId: tenantId,
        tenants: [
          {
            tenantId,
            companyId,
            companyName,
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

      try {
        let result = await biddingHallChatRoomAddMembers(data);
        result = getResponse(result);
        if (!result) {
          return;
        }

        setChatRoomVisible(chatRoomEnabledTemplate);
      } catch (e) {
        throw e;
      }
    },
    [headerInfo, chatRoomRef?.current, chatRoomVisible]
  );

  /**
   * chat room
   */
  const getRoomParams = () => {
    const { tenantId, companyId, companyName, rfxNum } = headerInfo || {};

    const { name } = getCurrentRole() || {};
    const { id, realName } = getCurrentUser() || {};

    const emptyRequiredFlag = !tenantId || !companyId || !id || !name;
    if (emptyRequiredFlag) {
      return;
    }

    const commonConfigs = getChatRoomConfigs(headerInfo) || {};

    const data = {
      businessNo: rfxNum,
      businessTitle: intl.get('ssrc.common.view.chatRoom').d('聊天室'),
      businessCode: 'source-bidding',
      businessURL: url,
      purchaseTenantId: tenantId,
      ...commonConfigs,
      currentUser: {
        tenantId,
        companyId,
        userId: id,
      },
      purchase: {
        tenantId,
        companyId,
        companyName,
        members: [
          {
            userId: id,
            userName: realName,
            roleName: name,
          },
        ],
      },
    };

    return data;
  };

  // const setChatRoomExpand = (result = {}) => {
  //   const { configKey, configValue = '' } = result || {};

  //   if (configKey !== CHART_ROOM_USER_CONFIG_DESC || !configValue) {
  //     return;
  //   }

  //   setChatRoomShowType(configValue);

  //   if (configValue === 'HIDE') {
  //     rollingFetchChatRoomMessage();
  //   } else {
  //     clearChatRoomUnreadWatcher();
  //   }
  // };

  // const chatRoomExpandQuery = async (otherData = {}) => {
  //   const data = {
  //     organizationId,
  //     configKey: CHART_ROOM_USER_CONFIG_DESC,
  //     ...otherData,
  //   };

  //   let result = null;
  //   try {
  //     result = await fetchUserConfig(data);
  //     setChatRoomExpand(result);
  //   } catch (e) {
  //     throw e;
  //   }
  // };

  // const changeChatRoomExpand = throttle(async (showType = 'SHOW') => {
  //   const { id } = getCurrentUser() || {};
  //   const data = {
  //     organizationId,
  //     userId: id,
  //     enabledFlag: 1,
  //     configDesc: CHART_ROOM_USER_CONFIG_DESC,
  //     // ...rfxDetailLayouts,
  //     configKey: CHART_ROOM_USER_CONFIG_DESC,
  //     configValue: showType === 'SHOW' ? 'SHOW' : 'HIDE',
  //   };

  //   let result = null;
  //   try {
  //     result = await updateUserConfig(data);
  //     if (!result) {
  //       return;
  //     }

  //     setChatRoomExpand(result);
  //   } catch (e) {
  //     throw e;
  //   }
  // }, 1500);

  // 聊天室 展开/收起
  // const toggleChatRoomExpand = throttle(() => {
  //   const newState = chatRoomShowType === 'SHOW' ? 'HIDE' : 'SHOW';
  //   setChatRoomMessage({});
  //   changeChatRoomExpand(newState);
  //   // setChatRoomShowType(newState);

  //   if (newState === 'HIDE') {
  //     rollingFetchChatRoomMessage();
  //   } else {
  //     clearChatRoomUnreadWatcher();
  //   }
  // }, 1500);

  // 完成 【关闭、完成】
  const biddingFinished = () => {
    const { biddingStatus } = headerInfoDS?.current?.get(['biddingStatus']) || {};
    const flag = biddingStatus === 'BIDDING_CLOSED' || biddingStatus === 'BIDDING_END';

    return flag;
  };

  // 轮询 查询未读消息
  const rollingFetchChatRoomMessage = () => {
    clearChatRoomUnreadWatcher();

    fetchCharRoomUnRead();

    chatRoomMessageRef.current = setInterval(fetchCharRoomUnRead, CHAT_ROOM_REFRESH_INTERVAL);
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
  const fetchCharRoomUnRead = async () => {
    const { tenantId, companyId, rfxNum, chatEnableFlag } =
      headerInfoDS?.current?.get(['tenantId', 'companyId', 'rfxNum', 'chatEnableFlag']) || {};
    const { id } = getCurrentUser() || {};

    // 聊天室隐藏
    if (chatEnableFlag !== 1 || leftTabKeyRef.current?.tabKey === 'chat') {
      clearChatRoomUnreadWatcher();
      return;
    }

    if (biddingFinished()) {
      return;
    }

    const emptyRequiredFlag = !tenantId || !companyId || !id;
    if (emptyRequiredFlag) {
      return;
    }

    const param = {
      data: [
        {
          userId: id,
          tenantId,
          companyId,
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

      const newMessageObj = {
        ...chatRoomMessage,
        unreadMsgNum: nums,
      };
      setChatRoomMessage(newMessageObj);
    } catch (e) {
      throw e;
    }
  };

  const closeFullScreen = () => {
    if (!document) {
      return;
    }
    const node = document.querySelector(`.ssrc-bidding-hall-fullscreen`);
    if (node) {
      node.classList.remove('ssrc-bidding-hall-fullscreen');
    }
  };

  const fetchWarningMessageAndCount = () => {
    fetchWarningMessage();
  };

  // 警示消息查询
  const getWarningMessageCount = () => {
    const { getWarningCount } = warningRef?.current || {};

    let count = 0;
    if (getWarningCount) {
      count = getWarningCount();
    }

    return count;
  };

  // 警示消息查询
  const fetchWarningMessage = () => {
    const { fetchMessage } = warningRef?.current || {};

    if (fetchMessage) {
      fetchMessage();
    }
  };

  const getJapanOrDutchListDs = () => {
    const { currentBiddingView } = biddingViewRef.current || {};
    let ds = japanDutchRoundListDs;

    if (currentBiddingView === 1) {
      ds = japanDutchAggregationTableDs;
    }

    return ds;
  };

  const setWarningRef = (ref) => {
    warningRef.current = ref || {};
  };

  const getCurrentHeadInfoData = () => {
    const { headerInfoData } = headerInfoRef.current || {};

    const header = !isEmpty(headerInfoData) ? headerInfoData : headerInfo;

    return header || {};
  };

  // 日式
  const japanBidding = () => {
    const { biddingMode } = getCurrentHeadInfoData() || {};
    const flag = biddingMode === 'JAPANESE_BIDDING' && getTotalPriceFlag();

    return flag;
  };

  // 荷兰式
  const dutchBidding = () => {
    const { biddingMode } = getCurrentHeadInfoData() || {};
    const flag = biddingMode === 'DUTCH_BIDDING';

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  const japOrDutchBidding = () => {
    const flag = japanBidding() || dutchBidding();
    return flag;
  };

  // 日式
  const japanBiddingTotalPrice = () => {
    const flag = japanBidding() && getTotalPriceFlag();

    return flag;
  };

  // 荷兰式
  const dutchBiddingTotalPrice = () => {
    const flag = dutchBidding() && getTotalPriceFlag();

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  const japOrDutchBiddingTotalPrice = () => {
    const flag = dutchBiddingTotalPrice() || japanBiddingTotalPrice();
    return flag;
  };

  // BRITISH_BIDDING
  const britishBidding = () => {
    const { biddingMode } = getCurrentHeadInfoData() || {};

    const flag = biddingMode === 'BRITISH_BIDDING';
    return flag;
  };

  // 返回操作
  const getBackPath = useCallback(() => {
    history.push({
      pathname: `${activeTabKey}/list`,
    });
    closeFullScreen();
  }, []);

  const changeTab = (key) => {
    setTabKey(key);
    setChatRoomMessage({});
    leftTabKeyRef.current.tabKey = key;

    rollingFetchChatRoomMessage();
  };

  // update view
  const updateBiddingView = (flag = 0) => {
    setBiddingView(flag);
    biddingViewRef.current.currentBiddingView = flag;

    fetchJapanOrDutchContent();
  };

  // 公共参数
  const commonProps = {
    header: headerInfo,
    headerInfoDS,
    pageLoading,
    toggleLoading,
    initPage: initPageData,
    customizeBtnGroup,
    customizeCollapseForm,
    customizeCommon,
    remote: biddingRemote,
    search,
    rfxHeaderId,
    organizationId,
    useNewRateFlag,
    beforeBiddingOnGoingFlag,
    britishBidding,
    japanBiddingTotalPrice,
    dutchBiddingTotalPrice,
    japOrDutchBiddingTotalPrice,
    japOrDutchBidding,
    japanBidding,
    dutchBidding,
    japanDutchRoundListDs,
    japanDutchAggregationTableDs,
    biddingView,
    updateBiddingView,
    biddingViewRef,
    getJapanOrDutchListDs,
  };

  // 头参数
  const topHeaderProps = {
    ...commonProps,
    history,
    location,
    activeTabKey,
    submitParams: {
      rfxHeaderId,
      organizationId,
      tenantId: organizationId,
    },
    closeFullScreen,
  };

  // 左侧列表参数
  const leftSiderProps = {
    ...commonProps,
    biddingRuleDataSet,
    supplierListDataSet,
    itemLineListDS,
    totalPriceItemListDataSet,
    getUnitPriceFlag,
    getTotalPriceFlag,
  };

  // 主界面参数
  const mainContentProps = {
    ...commonProps,
    commonProps,
    // biddingSiteInfo,
    biddingSiteInfoDataSet,
    bidCountDataSet,
    itemLineListDS,
    totalPriceSupplierListDataSet,
    biddingRuleDataSet,
    getUnitPriceFlag,
    getTotalPriceFlag,
    remote: biddingRemote,
    getWarningMessageCount,
    japanDutchListRef,
    handleRebuileAggregrationTableDataForDS,
    aggregrationTableRef,
  };

  const warningMessageProps = {
    header: headerInfo,
    headerInfoDS,
    biddingSiteInfoDataSet,
    onRef: setWarningRef,
  };

  const roomParams = getRoomParams();
  // const chatRoomExpand = chatRoomShowType === 'SHOW';
  const { unreadMsgNum = 0 } = chatRoomMessage || {};

  let siderDom = (
    <Sider
      className={classNames(style['bidding-hall-layout-right-sider'], {
        // [style['sidebar-hide-all']]: !chatRoomVisible || !chatRoomExpand,
      })}
    >
      <Tabs
        activeKey={tabKey}
        defaultActiveKey="message"
        onChange={changeTab}
        style={{
          height: '100%',
        }}
      >
        <TabPane
          tab={intl.get('ssrc.common.view.warningMessage').d('警示消息')}
          key="message"
          className={style['tabs-message-wrap']}
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
          // forceRender
          style={{
            height: '100%',
          }}
        >
          {roomParams && tabKey === 'chat' ? (
            <ChatRoom
              contentClass="ssrc-bidding-hall-chat-room-content"
              contentStyle={{ width: '100%', height: 'calc(100% - 60px)' }}
              pageStyle="cover"
              roomParams={chatRoomVisible ? roomParams : null}
              onRef={(ref) => {
                chatRoomRef.current = ref;
              }}
              businessCode="source-bidding"
            />
          ) : (
            ''
          )}
        </TabPane>
      </Tabs>
    </Sider>
  );

  siderDom = biddingRemote
    ? biddingRemote.process('SSRC_PURCHASE_BIDDING_HALL_PROCESS_SIDER', siderDom, {
        pageProps: props,
        tabKey,
        chatRoomMessage,
        fetchCharRoomUnRead,
        rollingFetchChatRoomMessage,
        changeTab,
        leftTabKeyRef,
        setTabKey,
      })
    : siderDom;

  return (
    <React.Fragment>
      <Header
        backPath={null}
        title={renderPageTitle()}
        className={classNames(style['bidding-hall-header-wrap'])}
      />
      <div className={classNames(style['bidding-hall-content-wrapper'])}>
        <Spin spinning={pageLoading}>
          <Layout className={classNames(style['bidding-hall-layout'])}>
            <LayoutHeader className={classNames(style['bidding-hall-layout-header'])}>
              <TopHeader {...topHeaderProps} />
            </LayoutHeader>
            <Layout className={classNames(style['bidding-hall-layout-main-content-wrapper'])}>
              {headerInfoDS?.current?.get('biddingNodeDTOS')?.length >= 2 && (
                <LayoutHeader
                  className={classNames(style['bidding-hall-layout-bidding-step-time'])}
                >
                  <BiddingProcessNode processNodeData={headerInfoDS?.current} />
                </LayoutHeader>
              )}
              <Layout className={classNames(style['bidding-hall-layout-detail-content-wrapper'])}>
                <Sider className={classNames(style['bidding-hall-layout-left-sider'])}>
                  <LeftSider {...leftSiderProps} />
                </Sider>
                <LayoutContent
                  className={classNames(style['bidding-hall-layout-content'], {
                    // [style['bidding-hall-layout-content-no-right']]:
                    // !chatRoomExpand || !chatRoomVisible,
                  })}
                >
                  <MainContent {...mainContentProps} />
                </LayoutContent>

                {siderDom}
              </Layout>
            </Layout>
          </Layout>
        </Spin>
      </div>
    </React.Fragment>
  );
};

const hocComponent = (NewComponent) => {
  return compose(
    formatterCollections({
      code: [
        'ssrc.biddingHall',
        'hzero.common',
        'ssrc.common',
        'ssrc.inquiryHall',
        'hzero.c7nUI',
        'ssrc.scux',
        'ssrc.sourceTemplate',
        'sscux.ssrc',
      ],
    }),
    withCustomize({
      unitCode: [
        getPurCustomizeUnitCode('headerButtons'), // 头部按钮
        getPurCustomizeUnitCode('biddingRule'), // 竞价规则
        getPurCustomizeUnitCode('headerTag'), // header tag
        getPurCustomizeUnitCode('unitPriceHeaderItemView'),
        // getPurCustomizeUnitCode('unitPriceModalItemLineTable'),
        // getPurCustomizeUnitCode('unitPriceModalItemLineTableSearch'),
      ],
    }),
    remote({
      code: 'SSRC_PURCHASE_BIDDING_HALL',
      name: 'biddingRemote',
    })
  )(observer(NewComponent));
};

export { hocComponent, BiddingHallComponent };
export default hocComponent(BiddingHallComponent);
