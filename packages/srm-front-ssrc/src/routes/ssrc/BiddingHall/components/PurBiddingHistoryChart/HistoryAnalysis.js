/**
 * 竞价记录，
 *
 * 竞价趋势
 *  日/荷兰 供应商没有图
 *
 * onlyShowChartFlag 1 | 0 表示外部直接引用渲染趋势图
 *
 * expandViewFlagFlag 1 | 0    // 在宽屏展示，一般宽度大于800， 高度大于500，可以特殊处理一些场景
 *
 *
 * 比价助手组件在引用，请谨慎修改 src/routes/ssrc/components/PriceComparison/ThisQuoteProcessTab.js
 */

import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import { Tabs, Icon, Spin } from 'choerodon-ui';
import { DataSet, Table, Select } from 'choerodon-ui/pro';
import moment from 'moment';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react';
import * as echarts from 'echarts';
import { isEmpty, throttle, isNil, isFunction } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import classnames from 'classnames';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';
import { formatDateTime } from '@/routes/ssrc/BiddingHall/utils/formatDate';

import {
  fetchSupplierLineBiddingChart,
  fetchPurchaseLineBiddingChart,
  fetchSupplierLineTotalBiddingChart,
  fetchPurchaseTotalLineBiddingChart,
  fetchPurchaseJapanDutchTotalLineBiddingChart,
} from '@/services/biddingHallService';
import { transDateTimeToLocal } from '@/utils/utils';
import {
  biddingDisclosePriceTitle,
  trialBiddingDisclosePriceTitle,
  startingBiddingPriceTitle,
  trialStartingBiddingPriceTitle,
  getTopOrBottomPriceCategory,
} from '@/routes/ssrc/InquiryHallNew/Update/utils/renderer';
import {
  // calcTimerInterval,
  calcNumberUnit,
  getLineColors,
  getAUniqueColor,
  commonDisabledColor,
  JapanDutchLineColors,
} from './tools';

import EmptyDataIllustrate from '../EmptyDataIllustrate.js';
import { unitPriceAnalysisDetailTableDS } from './AnalysisDetailTableDS';

import Styles from '../index.less';

const noResult = require('@/assets/no_result.svg');
const upArrow = require('@/assets/biddingHall/upArrow.svg');

const Minutes = 15_000; // todo
const LEGEND_CHANGED_TIMER = 300;

const { Option } = Select;
const { TabPane } = Tabs;

// 竞价分析
const HistoryAnalysis = (props = {}) => {
  const {
    itemRecord,
    commonProps,
    biddingRuleDataSet,
    header,
    type = 'PURCHASE',
    japanDutchFlag = 0,
    onlyShowChartFlag = 0,
    expandViewFlag = 0,
    otherPageRenderChartStyle = {},
    outterChartRef,
    chartOtherParams = {},
    biddingFinished = false, // 竞价结束
  } = props || {};
  const { current } = biddingRuleDataSet || {};

  let myChart = null;

  const {
    openRule, // 数据公开规则
    biddingHeaderRuleId: currentBiddingHeaderRuleId = null,
  } = current ? current?.get(['openRule', 'biddingHeaderRuleId']) : {};

  const {
    sealedQuotationFlag: outSealedQuotationFlag,
    // currencySymbol,
    openRule: headerOpenRuler = '',
    biddingAnonymousQuotesFlag,
    benchmarkPriceType,
    biddingTarget,
    biddingStatus,
    quotationEndDate,
    biddingType,
    biddingHeaderRuleId,
    tenantId,
    biddingQuotationMethod,
    rfxLineSupplierId,
    isBritishBidTrafficLight = 0, // 启用红绿灯
    rfxHeaderId,
    currentBiddingRoundNumber,
    trialBiddingFlag: headerTrialBiddingFlag,
    biddingNotStartFlag,
    biddingEndFlag,
  } = header || {};

  const {
    rfxLineItemId,
    biddingItemStatus,
    roundNumber,
    trialBiddingFlag,
    biddingLineRuleId,
  } = itemRecord
    ? itemRecord?.get([
        'rfxLineItemId',
        'biddingItemStatus',
        'roundNumber',
        'trialBiddingFlag',
        'biddingLineRuleId',
      ])
    : {};

  const currentOpenRuler = useMemo(() => openRule || headerOpenRuler, [openRule, headerOpenRuler]);

  const DSProps = {
    biddingTarget,
    biddingItemStatus,
    commonProps: {
      ...commonProps,
      rfxLineItemId,
      rfxLineSupplierId,
      biddingStatus,
      headerQuotationEndDate: quotationEndDate,
      openRule: currentOpenRuler,
      biddingType,
      biddingTarget,
      roundNumber,
      trialBiddingFlag,
      type,
      tenantId,
      organizationId: tenantId,
      biddingLineRuleId,
      biddingHeaderRuleId: currentBiddingHeaderRuleId || biddingHeaderRuleId,
      rfxHeaderId,
      currentBiddingRoundNumber,
      japanDutchFlag,
      biddingNotStartFlag,
      biddingEndFlag,
    },
    japanDutchFlag,
  };

  const supplier = useMemo(() => type === 'SUPPLIER', [type]);

  // // 供应商隐藏报价
  const supplierHiddenQuote =
    type === 'SUPPLIER' &&
    (currentOpenRuler === 'HIDE_IDENTITY_HIDE_QUOTE' ||
      currentOpenRuler === 'OPEN_IDENTITY_HIDE_QUOTE');
  // 采购方隐藏趋势图tab
  let purchaseChartTabHidden = type === 'PURCHASE' && !!outSealedQuotationFlag; // 采购方匿名报价
  const HiddenPriceMenaing = '***';

  // bidding flag
  const biddingFlag = useMemo(() => biddingQuotationMethod === 'BIDDING', [biddingQuotationMethod]);

  // 竞价记录tab 隐藏
  const biddingRecordTabHidden = useMemo(() => type === 'SUPPLIER', [type]);

  // 竞价趋势图 tab 隐藏
  let biddingChartTabHidden = useMemo(() => purchaseChartTabHidden, [
    type,
    currentOpenRuler,
    outSealedQuotationFlag,
    purchaseChartTabHidden,
  ]);

  // 日式/荷兰 结束后 密封展示
  if (biddingStatus === 'BIDDING_END' && japanDutchFlag === 1) {
    biddingChartTabHidden = 0;
    purchaseChartTabHidden = false;
  }

  const chartRef = useRef(null);
  const chartSelectObj = useRef({}); // chart query bar data
  const chartSelectSuppliers = useRef({}); // chart legend selected data
  const chartOldOptions = useRef({});
  const chartDataObj = useRef({});

  const originColorList = ['#FF6000', '#0083FF', '#AE00FF'];
  const defaultColor = type === 'PURCHASE' ? originColorList : ['#FF6000'];
  const usedColorSet = useMemo(() => new Set(defaultColor), []);

  const updateChartTimer = useRef(null); // CHART TIMER
  const updatedRecordTimer = useRef(null); // RECORD TIMER

  const legendSelectChangeTimer = useRef(null);

  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(!biddingChartTabHidden ? 'trend' : 'record');
  const [emptyFlag, setEmptyFlag] = useState(false);
  const [minMaxPrice, setMinMaxPrice] = useState({});

  // 记录刷新时间
  const [refreshTime, setRefreshTime] = useState(moment());
  const [lastTime, setLastTime] = useState(null);
  const [count, setCount] = useState(null);

  const historyTableDS = useMemo(() => new DataSet(unitPriceAnalysisDetailTableDS(DSProps)), [
    biddingTarget,
    japanDutchFlag,
  ]);

  // lengend common
  const getLegendCommonConfig = useCallback(() => {
    const { biddingSupHeaderRecDTOList, allBiddingSupLineRecDTOList } = chartDataObj.current || {};
    const currentChartListData = allBiddingSupLineRecDTOList || biddingSupHeaderRecDTOList;
    const chartDataLength = currentChartListData?.length;

    const lengendCommon = {
      show: true,
      bottom: 5,
      left: 10,
      type: 'scroll',
      borderCap: 'square',
      icon: 'rect',
      itemGap: 14,
      itemHeight: 14,
      itemWidth: 14,
      textStyle: {
        // padding: [0, 0, 0, -2], // 文字块的内边距
        rich: {
          a:
            chartDataLength > 3
              ? {
                  width: 123,
                }
              : {},
        },
      },
      formatter: (name) => {
        if (chartDataLength <= 3) {
          return name;
        }

        const currentName = echarts.format.truncateText(name, 124, '14px Microsoft Yahei', '…');
        const arr = [`{a|${currentName}}`];

        return arr.join('\n');
      },
      animation: false,
      tooltip: {
        show: true,
        triggerOn: 'none',
      },
    };
    return lengendCommon;
  }, [chartDataObj?.current]);

  useEffect(() => {
    initChart();

    return () => {
      if (isFunction(myChart?.restore)) {
        myChart.restore();
      }
      clearTimer();
    };
  }, [currentOpenRuler, biddingChartTabHidden]);

  const initChartConfig = () => {
    myChart = echarts.init(chartRef.current);
  };

  const getMyChart = () => {
    return myChart;
  };

  // 暴露子组件的api给父组件使用
  if (outterChartRef) {
    useImperativeHandle(
      outterChartRef,
      () => ({
        getMyChart,
      }),
      [myChart]
    );
  }

  const initChart = async () => {
    if (purchaseChartTabHidden) {
      fetchBiddingRecord();
      setIntervalFetchRecord();
      return;
    }

    initChartConfig();
    fetchChartData();
    setIntervalFetchChart();
    fetchBiddingRecord();
  };

  const setIntervalFetchChart = () => {
    clearChartIntervalTimer();

    if (biddingFinished) {
      return;
    }

    updateChartTimer.current = setInterval(intervalFetchRecordAndChart, Minutes);
  };

  const intervalFetchRecordAndChart = () => {
    fetchChartData();
    fetchBiddingRecord();
  };

  const setIntervalFetchRecord = () => {
    clearRecordIntervalTimer();

    if (biddingFinished) {
      return;
    }

    updatedRecordTimer.current = setInterval(fetchBiddingRecord, Minutes);
  };

  // 清除定时器
  const clearTimer = useCallback(() => {
    // clearInterval(timeRef.current);
    // timeRef.current = null;
    clearChartIntervalTimer();
    chartRef.current = null;
    clearRecordIntervalTimer();
    clearLegendIntervalTimer();
  }, []);

  const clearLegendIntervalTimer = () => {
    clearInterval(legendSelectChangeTimer?.current);
  };

  const clearChartIntervalTimer = () => {
    clearInterval(updateChartTimer?.current);
  };

  const clearRecordIntervalTimer = () => {
    clearInterval(updatedRecordTimer?.current);
  };

  // 价格渲染处理
  const rendererPrice = (value, record) => {
    const lineCurrencySymbol = record.get('currencySymbol');

    return (
      <>
        <span dir="ltr">{lineCurrencySymbol ?? ''}</span>
        <span style={{ paddingLeft: '4px' }}>{numberSeparatorRender(value)}</span>
      </>
    );
  };

  // const mockData = {
  //   biddingRoundInfoDTOS: [
  //     {
  //       biddingRoundDateId: 1,
  //       quotationEndDate: '2025-04-05 10:10:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 1999,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 10:08:00',
  //           biddingSupHeaderRecId: '1-1',
  //           supplierCompanyName: 's-1',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 2,
  //       quotationEndDate: '2025-04-05 10:20:00',
  //       biddingRoundQuotedCount: 2,
  //       biddingRoundPrice: 1800,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 10:11:00',
  //           biddingSupHeaderRecId: '2-1',
  //           supplierCompanyName: 's-2-1',
  //         },
  //         {
  //           quotedDate: '2025-04-05 10:12:00',
  //           biddingSupHeaderRecId: '2-2',
  //           supplierCompanyName: 's-2-2',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 3,
  //       quotationEndDate: '2025-04-05 11:20:00',
  //       biddingRoundQuotedCount: 3,
  //       biddingRoundPrice: 1600,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 11:20:08',
  //           biddingSupHeaderRecId: '3-1',
  //           supplierCompanyName: 's-3-1 asdfdsafddsds',
  //         },
  //         {
  //           quotedDate: '2025-04-05 11:20:18',
  //           biddingSupHeaderRecId: '3-2',
  //           supplierCompanyName: 's-3-2bbbbbb',
  //         },
  //         {
  //           quotedDate: '2025-04-05 11:20:28',
  //           biddingSupHeaderRecId: '3-3',
  //           supplierCompanyName: 's-3-3ccccc',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 4,
  //       quotationEndDate: '2025-04-05 11:50:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 1400,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 11:50:08',
  //           biddingSupHeaderRecId: '4-1',
  //           supplierCompanyName: 's-4-1',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 5,
  //       quotationEndDate: '2025-04-05 12:00:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 1200,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 12:00:10',
  //           biddingSupHeaderRecId: '5-1',
  //           supplierCompanyName: 's-5-1',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 6,
  //       quotationEndDate: '2025-04-05 12:10:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 1000,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 12:10:10',
  //           biddingSupHeaderRecId: '6-1',
  //           supplierCompanyName: 's-6-1',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 7,
  //       quotationEndDate: '2025-04-05 12:20:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 800,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 12:20:10',
  //           biddingSupHeaderRecId: '7-1',
  //           supplierCompanyName: 's-7-1',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 8,
  //       quotationEndDate: '2025-04-05 12:30:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 600,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 12:30:10',
  //           biddingSupHeaderRecId: '8-1',
  //           supplierCompanyName: 's-8-1',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 9,
  //       quotationEndDate: '2025-04-05 12:40:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 500,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 12:40:10',
  //           biddingSupHeaderRecId: '9-1',
  //           supplierCompanyName: 's-9-1',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 10,
  //       quotationEndDate: '2025-04-05 12:50:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 400,
  //       biddingSupHeaderRecDTOS: [
  //         {
  //           quotedDate: '2025-04-05 12:50:10',
  //           biddingSupHeaderRecId: '10-1',
  //           supplierCompanyName: 's-10-1',
  //         },
  //       ],
  //     },
  //     {
  //       biddingRoundDateId: 11,
  //       quotationEndDate: '2025-04-05 13:00:00',
  //       biddingRoundQuotedCount: 1,
  //       biddingRoundPrice: 300,
  //       // biddingSupHeaderRecDTOS: [
  //       //   {
  //       //     quotedDate: '2025-04-05 13:00:10',
  //       //     biddingSupHeaderRecId: '11-1',
  //       //     supplierCompanyName: 's-11-1',
  //       //   },
  //       // ],
  //     },
  //   ],
  // };

  // QUERY PARAMS
  const chartQueryData = useCallback(() => {
    return {
      biddingTarget,
      roundNumber,
      // trialBiddingFlag,
      type,
      organizationId: tenantId,
      rfxLineItemId,
      tenantId,
      recentDatePeriod: lastTime,
      recentCount: count,
      biddingLineRuleId,
      biddingHeaderRuleId: currentBiddingHeaderRuleId || biddingHeaderRuleId,
      rfxLineSupplierId,
      rfxHeaderId,
      trialBiddingFlag: trialBiddingFlag ?? headerTrialBiddingFlag,
      currentBiddingRoundNumber,
      biddingNotStartFlag,
      biddingEndFlag,
      ...(chartOtherParams || {}),
      ...(chartSelectObj?.current || {}),
    };
  }, [
    biddingTarget,
    roundNumber,
    trialBiddingFlag,
    type,
    tenantId,
    rfxLineItemId,
    tenantId,
    lastTime,
    count,
    biddingLineRuleId,
    currentBiddingHeaderRuleId,
    biddingHeaderRuleId,
    rfxLineSupplierId,
    chartSelectObj?.current,
    rfxHeaderId,
    chartOtherParams,
  ]);

  const fetchChartData = async () => {
    if (biddingChartTabHidden) {
      return;
    }
    const data = chartQueryData();

    const newData = {
      ...data,
      // ...outData,
    };

    let result = null;
    setLoading(true);
    try {
      if (japanDutchFlag) {
        if (type === 'PURCHASE') {
          if (biddingTarget === 'TOTAL_PRICE') {
            result = await fetchPurchaseJapanDutchTotalLineBiddingChart(newData);
          }
        }
      } else {
        if (type === 'SUPPLIER') {
          if (biddingTarget === 'UNIT_PRICE') {
            result = await fetchSupplierLineBiddingChart(newData);
          }
          if (biddingTarget === 'TOTAL_PRICE') {
            result = await fetchSupplierLineTotalBiddingChart(newData);
          }
        }
        if (type === 'PURCHASE') {
          if (biddingTarget === 'UNIT_PRICE') {
            result = await fetchPurchaseLineBiddingChart(newData);
          }
          if (biddingTarget === 'TOTAL_PRICE') {
            result = await fetchPurchaseTotalLineBiddingChart(newData);
          }
        }
      }

      result = getResponse(result);
      setLoading(false);

      if (!result) {
        chartDataObj.current = {};
        setMinMaxPrice({});
        setEmptyFlag(true);
        myChart.clear();
        return;
      }

      let currentDateTime = refreshTime;
      if (result) {
        currentDateTime = moment().format(DEFAULT_DATETIME_FORMAT);
        setRefreshTime(currentDateTime);
      }

      chartDataObj.current = result;

      // const { recentDatePeriod } = newData;
      // let calcXData = null;
      // if (recentDatePeriod) {
      //   calcXData = calcTimerInterval(currentDateTime, { intervalTime: recentDatePeriod });
      // }

      handleChartData(result);
    } catch (e) {
      throw e;
    }
  };

  // 获取最低最高限价
  const getUpperAndLowerPrice = (dto = {}) => {
    const { trialBiddingFlag: currentTrialBiddingFlag } = header || {};
    const {
      targetPriceLowerLimit,
      targetPriceUpperLimit,
      trialTargetPriceLowerLimit,
      trialTargetPriceUpperLimit,
    } = dto || {};

    let lowerLabel = intl
      .get('ssrc.inquiryHall.model.inquiryHall.targetPriceLowerLimit')
      .d('目标价下限');
    let lowerName = 'targetPriceLowerLimit';
    let lowerPrice = targetPriceLowerLimit;
    let upperLabel = intl
      .get('ssrc.inquiryHall.model.inquiryHall.targetPriceUpperLimit')
      .d('目标价上限');
    let upperName = 'targetPriceUpperLimit';
    let upperPrice = targetPriceUpperLimit;

    if (currentTrialBiddingFlag === 1) {
      lowerLabel = intl
        .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceLowerLimit')
        .d('试竞价目标价下限');
      lowerName = 'trialTargetPriceLowerLimit';
      lowerPrice = trialTargetPriceLowerLimit;
      upperLabel = intl
        .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceUpperLimit')
        .d('试竞价目标价上限');
      upperName = 'trialTargetPriceUpperLimit';
      upperPrice = trialTargetPriceUpperLimit;
    }

    const values = {
      lowerLabel,
      lowerName,
      lowerPrice,
      upperLabel,
      upperName,
      upperPrice,
    };

    return values;
  };

  // 日式/荷兰 总价趋势
  const renderJapanDutchTotalChat = async (result) => {
    const { trialBiddingFlag: currentTrialBiddingFlag } = header || {};
    setEmptyFlag(false);

    const {
      biddingRoundInfoDTOS = [],
      startingBiddingPrice = null,
      trialStartingBiddingPrice = null,
      biddingDisclosePrice = null,
      biddingTrialDisclosePrice = null,
      currencySymbol = '',
      biddingMode,
    } = result || {};

    const { length: roundDataLength = 0 } = biddingRoundInfoDTOS || [];

    if (isEmpty(result) || !roundDataLength) {
      setEmptyFlag(true);
      myChart.clear();
      return;
    }

    // x数据
    const timeData = [];
    let startPrice = null;
    const priceList = [];
    let disclosePrice = null;

    // 试竞价
    if (currentTrialBiddingFlag) {
      startPrice = trialStartingBiddingPrice;
      disclosePrice = biddingTrialDisclosePrice;
      priceList.push(biddingDisclosePrice);
      priceList.push(trialStartingBiddingPrice);
    } else {
      startPrice = startingBiddingPrice;
      disclosePrice = biddingDisclosePrice;
      priceList.push(biddingDisclosePrice);
      priceList.push(startingBiddingPrice);
    }

    // 供应商接受数据: [价格, 开始时间索引, 结束时间索引, 供应商数量]
    const roundLineData = [];

    biddingRoundInfoDTOS.forEach((roundInfo, index) => {
      const {
        biddingRoundPrice,
        // biddingRoundQuotedCount,
        biddingRoundDateId,
        quotationEndDate: currentRoundEndDate,
        // biddingSupHeaderRecDTOS,
      } = roundInfo || {};

      if (!biddingRoundDateId) {
        return;
      }

      const newRoundInfo = {
        ...roundInfo,
        start: index,
        end: index + 1,
        // biddingRoundQuotedCount,
      };

      priceList.push(biddingRoundPrice);
      roundLineData.push(newRoundInfo);
      timeData.push(currentRoundEndDate);
    });

    // 时间轴最后需要再补充一个时间，确保渲染正常,最后一个时间延长
    const lastTimeValue = timeData[timeData?.length - 1 || 0];
    const formatLastTime = moment(lastTimeValue).add(3, 'm').format(DEFAULT_DATETIME_FORMAT);
    timeData.push(formatLastTime);

    const {
      // topFlag, // 封顶
      bottomFlag, // 封底
    } = getTopOrBottomPriceCategory({ biddingMode, biddingQuotationMethod });

    const markLineColor = bottomFlag ? '#179454' : '#F06200';

    const correctPriceList = priceList.filter(Boolean);

    // y axis max price
    const yMaxValue = math.max(...correctPriceList);
    let yMminValue = math.min(...correctPriceList);

    yMminValue = yMminValue ? yMminValue + 100 : null;
    yMminValue = yMminValue && yMminValue > 100 ? yMminValue - 100 : 0;

    // 准备系列数据
    const series = [];

    // 修改后的supplierData数据处理
    const processedData = roundLineData.map((item) => {
      return {
        ...item,
      };
    });

    // 添加供应商接受横线
    processedData.forEach(function (item, index) {
      const {
        biddingRoundDateId,
        biddingRoundPrice,
        start,
        end,
        displayBiddingRoundQuotedCount,
        biddingRoundNumber,
      } = item || {};
      const color = JapanDutchLineColors[index % 7];

      const currentBiddingRoundQuotedCount = displayBiddingRoundQuotedCount || 0;

      const markLineData = [];

      if (!isNil(startPrice)) {
        const startPriceOption = {
          name: 'startingBiddingPrice',
          yAxis: startPrice,
          label: {
            padding: [-13, -20, 15, -40], // 定位
            position: 'end',
            formatter: (params) => {
              const { value, name } = params || {};

              let prefix = '';
              if (name === 'startingBiddingPrice') {
                prefix = startingBiddingPriceTitle({ biddingQuotationMethod, biddingMode });
                if (currentTrialBiddingFlag) {
                  prefix = trialStartingBiddingPriceTitle({ biddingQuotationMethod, biddingMode });
                }
              }

              // 过小的数字导致渲染为0
              const newPriceValue = value;

              const priceText = `${prefix}\n${currencySymbol || ''} ${numberSeparatorRender(
                newPriceValue
              )}`;

              return priceText;
            },
            color: '#868d9c', // #179454 rgb(134, 141, 156)
          },
          lineStyle: {
            width: 1,
            color: '#0161D5',
          },
        };

        markLineData.push(startPriceOption);
      }

      if (!isNil(disclosePrice)) {
        const bottomPriceOption = {
          name: 'disclosePrice',
          yAxis: disclosePrice,
          label: {
            padding: [-13, -20, 15, -55], // 定位
            position: 'end',
            formatter: (params) => {
              const { name } = params || {};

              let prefix = '';

              if (name === 'disclosePrice') {
                prefix = biddingDisclosePriceTitle({ biddingQuotationMethod, biddingMode });
                if (currentTrialBiddingFlag) {
                  prefix = trialBiddingDisclosePriceTitle({ biddingQuotationMethod, biddingMode });
                }
              }

              // 过小的数字导致渲染为0
              const newPriceValue = disclosePrice;

              return `${prefix}\n${currencySymbol} ${numberSeparatorRender(newPriceValue)}`;
            },
            color: markLineColor,
          },
          lineStyle: {
            width: 1,
            color: markLineColor,
            type: 'solid',
          },
        };

        markLineData.push(bottomPriceOption);
      }

      const seriesDataList = timeData.map(function (time, i) {
        const seriesData = i >= start && i <= end ? biddingRoundPrice : null;

        return {
          name: `${biddingRoundDateId}SeriesData`,
          value: seriesData,
          allItemData: item,
        };
      });

      series.push({
        name: `${biddingRoundDateId}Series`,
        value: biddingRoundPrice,
        type: 'line',
        data: seriesDataList,
        symbol: 'none',
        lineStyle: {
          color,
          width: 3 + currentBiddingRoundQuotedCount * 0.3, // 接受越多线越粗
          opacity: 0.3 + currentBiddingRoundQuotedCount * 0.14, // 接受越多越不透明
          type: 'solid',
        },
        markLine: {
          silent: true,
          symbol: 'none',
          data: markLineData,
          lineStyle: {
            type: 'dashed',
          },
          align: 'right',
          animation: true,
          animationDuration: 1000,
          animationEasing: 'elasticOut',
        },
        markPoint: {
          symbol: 'circle',
          symbolSize: 1, // 隐藏标记点
          symbolOffset: [6, -20],
          label: {
            show: true,
            position: 'left',
            align: 'left',
            formatter: () => {
              const newPrice = numberSeparatorRender(biddingRoundPrice);
              const round = biddingRoundNumber
                ? `${intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.commonRoundNumAttach`, {
                      key: biddingRoundNumber,
                    })
                    .d('{key}轮')}-`
                : '';

              const markPointLabel = `${newPrice}\n${round}${intl
                .get('ssrc.common.biddingHall.view.acceptSupplierCount', {
                  count: currentBiddingRoundQuotedCount,
                })
                .d('{count}家接受')}`;

              return markPointLabel;
            },
            fontSize: 10,
          },
          data: [
            {
              coord: [timeData[start], biddingRoundPrice], // markpoint 位置点
              label: {
                show: true,
              },
            },
          ],
        },
      });
    });

    let xAxisLableIntervalNum = 0; // x 轴 是否需要隔一个显示。数量过大会比较好看

    if (timeData?.length > 10 && !expandViewFlag) {
      xAxisLableIntervalNum = 1;
    }

    if (timeData?.length > 22 && expandViewFlag) {
      xAxisLableIntervalNum = 1;
    }

    // 图表配置
    const currentOptions = {
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: false,
          snap: true,
          axis: 'y', // 这行是重点，series是个list，如果改为其他类型，没发精确到某个点的数据集，且mousemove合成事件有问题，无法自行改写
          lineStyle: {
            type: 'dashed', // 虚线样式
          },
          label: {
            show: false, // 十字准星（crosshair）不显示坐标值
          },
        },
        smoothMonotone: 'x',
        position(pos, params, dom, rect, size) {
          // 鼠标在右侧时向左偏移，在底部时向上偏移
          return [pos[0] - size.contentSize[0] / 2, pos[1] - size.contentSize[1] + 60];
        },
        formatter: (params) => {
          let currentRecordData = params || {};
          if (Array.isArray(params) && params.length > 0) {
            currentRecordData = params?.[0] || {};
          }

          const { componentType, data } = currentRecordData;

          if (componentType === 'series') {
            const { allItemData } = data || {};
            const { biddingSupHeaderRecDTOS } = allItemData || {};

            if (isEmpty(biddingSupHeaderRecDTOS)) {
              return '';
            }

            let str = '';

            biddingSupHeaderRecDTOS.forEach((currentRoundsSupplier) => {
              const { supplierCompanyName, quotedDate } = currentRoundsSupplier || {};

              if (!supplierCompanyName) {
                return;
              }

              str += `<div style="display: flex; justify-content: space-between; font-size: 10px;">
                <div style="margin-right: 8px;">${supplierCompanyName || '-'}</div>
                <div>${quotedDate || '-'}</div>
              </div>`;
            });

            const tooltipContent = `<div>${str}</div>`;
            return tooltipContent;
          }

          return '';
        },
      },
      grid: {
        left: 'left',
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'inside', // 添加横向滚动条
          xAxisIndex: 0,
        },
      ],
      xAxis: {
        type: 'category',
        data: timeData,
        axisLine: {
          lineStyle: {
            color: '#333',
          },
        },
        splitNumber: 6,
        // boundaryGap: false,
        axisLabel: {
          interval: xAxisLableIntervalNum, // 过多横坐标，label改为间隔显示
          formatter(value) {
            let formatTimeValue = '';

            if (value) {
              formatTimeValue = moment(value).format('HH:mm');
            }

            return formatTimeValue;
          },
        },
        axisTick: {
          alignWithLabel: true, // 关键配置：刻度与标签对齐
          // inside: true,
        },
      },
      yAxis: {
        type: 'value',
        min: yMminValue || undefined,
        max: yMaxValue || undefined,
        nameTextStyle: {
          // align: 'center',
          padding: [8, 20, 20, 0],
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
          lineStyle: {
            color: '#333',
          },
        },
        axisLabel: {
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e8e9ed',
          },
        },
      },
      series,
    };

    await myChart.setOption(currentOptions, true);

    resizeChartRender({ roundDataLength });
  };

  const resizeChartRender = ({ roundDataLength }) => {
    const chartDom = document.getElementById('eChartsDom');
    if (!roundDataLength || !chartDom) {
      return;
    }

    const dynamicWidth = roundDataLength * 50;

    // 轮次信息多，加滚动条
    if (roundDataLength > 11 && !expandViewFlag) {
      chartDom.style.width = `${dynamicWidth}px`;
      myChart.resize(); // 必须调用！
    }

    // 外部数据过大也需要重新绘制
    if (roundDataLength > 22 && expandViewFlag) {
      chartDom.style.width = `${dynamicWidth}px`;
      myChart.resize(); // 必须调用！
    }
  };

  // after fetch, reconstrt
  const handleChartData = async (result) => {
    if (!myChart) {
      await initChartConfig();
    }

    myChart.off('legendselectchanged');
    setEmptyFlag(false);

    if (isEmpty(result)) {
      // myChart.showLoading({
      //   text: '暂无数据',
      //   showSpinner: false, // 隐藏加载中的转圈动图
      //   textColor: '#9d9d9d',
      //   maskColor: 'rgba(255, 255, 255, 0.8)',
      //   fontSize: '25px',
      //   fontWeight: 'bold',
      //   fontFamily: 'Microsoft YaHei',
      // });
      setEmptyFlag(true);
      setMinMaxPrice({});
      myChart.clear();
      return;
    }

    if (japanDutchFlag) {
      renderJapanDutchTotalChat(result);
      return;
    }

    let oneQuotationFlag = 0;

    const {
      allBiddingSupLineRecDTOList = 0,
      biddingLineRuleDTO = 0,
      biddingHeaderRuleDTO = 0,
      biddingSupHeaderRecDTOList = 0,
    } = result || {};
    // const { calcXData = null } = options || {};

    let startingBiddingPrice = null;
    // let lowestQuotationPrice = null;
    let safePrice = null;
    let minBiddingPrice = null;
    let maxBiddingPrice = null;
    let minPriceId = null;
    let maxPriceId = null;
    let lowerUpperPrice = null;

    let CurrentCurrencySymbol = '';
    let sealedQuotationFlag = 0;

    if (biddingTarget === 'UNIT_PRICE') {
      const {
        // lowestQuotationPrice: lqp,
        safePrice: sf,
        currencySymbol: cs,
        startingBiddingPrice: sbp,
        sealedQuotationFlag: sqf,
        minBiddingPrice: min,
        maxBiddingPrice: max,
        minBiddingPriceRfxSupplierId: minId,
        maxBiddingPriceRfxSupplierId: maxId,
      } = biddingLineRuleDTO || {};
      // lowestQuotationPrice = lqp;
      safePrice = sf;
      CurrentCurrencySymbol = cs;
      startingBiddingPrice = sbp;
      sealedQuotationFlag = sqf;
      minBiddingPrice = min;
      maxBiddingPrice = max;
      minPriceId = minId;
      maxPriceId = maxId;
      lowerUpperPrice = getUpperAndLowerPrice(biddingLineRuleDTO);
    }
    if (biddingTarget === 'TOTAL_PRICE') {
      const {
        // lowestQuotationPrice: lqp,
        safePrice: sf,
        currencySymbol: cs,
        startingBiddingPrice: sbp,
        sealedQuotationFlag: hsqf,
        minBiddingPrice: min,
        maxBiddingPrice: max,
        minBiddingPriceRfxSupplierId: minId,
        maxBiddingPriceRfxSupplierId: maxId,
      } = biddingHeaderRuleDTO || {};
      // lowestQuotationPrice = lqp;
      safePrice = sf;
      CurrentCurrencySymbol = cs;
      startingBiddingPrice = sbp;
      sealedQuotationFlag = hsqf;
      minBiddingPrice = min;
      maxBiddingPrice = max;
      minPriceId = minId;
      maxPriceId = maxId;
      lowerUpperPrice = getUpperAndLowerPrice(biddingHeaderRuleDTO);
    }

    const {
      lowerLabel,
      // lowerName,
      lowerPrice,
      upperLabel,
      // upperName,
      upperPrice,
    } = lowerUpperPrice || {};

    // 不显示价格
    const hiddenPriceFlag = type === 'PURCHASE' && !!sealedQuotationFlag;

    const quotationDtos = allBiddingSupLineRecDTOList || biddingSupHeaderRecDTOList; // 单价的数据是二维数组，总价是一维，需要构造成二维
    if (isEmpty(quotationDtos)) {
      myChart.clear();
      return;
    }

    if (quotationDtos.length === 1 && quotationDtos[0]?.length === 1) {
      oneQuotationFlag = 1;
    }

    let maxPrice = maxBiddingPrice || 0;
    let minPrice = minBiddingPrice || 0;

    if (math.eq(minPrice, maxPrice)) {
      if (biddingFlag) {
        maxPrice = 0;
      } else {
        minPrice = 0;
      }
    }

    // 计算纵坐标单位
    const everyYPrice = math.div(math.minus(maxPrice || 0, minPrice || 0), 6);
    const relativeEveryPrice = math.isNegative(everyYPrice)
      ? math.multipliedBy(everyYPrice, -1)
      : everyYPrice;
    const yUnit = calcNumberUnit(relativeEveryPrice);
    const { label, base } = yUnit || {};

    const maxPriceByBase = maxBiddingPrice ? math.div(maxBiddingPrice, base) : null; // max / base
    const minPriceByBase = minBiddingPrice ? math.div(minBiddingPrice, base) : null; // min / base

    const y = [];
    let firstQuotedTime = null;
    let lastQuotedTime = null;

    const legendSelected = {};
    const timeSet = new Set(); // 报价时间

    quotationDtos.forEach((items = []) => {
      const currentSupplier = {
        type: 'line',
      };
      const currentSupplierPrice = [];

      items.forEach((item) => {
        const { quotedDate, displayQuotationPriceValue, displaySupplierName } = item || {};
        if (!currentSupplier.name) {
          currentSupplier.name = displaySupplierName;
        }

        cacheSupplierSelectedData({
          data: item,
        });

        if (quotedDate) {
          timeSet.add(quotedDate);
        }

        if (!firstQuotedTime || quotedDate < firstQuotedTime) {
          firstQuotedTime = quotedDate;
        }
        if (!lastQuotedTime || quotedDate >= lastQuotedTime) {
          lastQuotedTime = quotedDate;
        }

        const newPriceValue = getPriceDividedByBase({
          price: displayQuotationPriceValue,
          base,
        });

        // echarts对于大数字支持需要处理
        const newPriceValueString = `${newPriceValue}`;

        const newData = {
          ...item,
          displayQuotationPriceValue: newPriceValueString,
        };

        legendSelected[displaySupplierName] = true;

        currentSupplierPrice.push([quotedDate, newPriceValueString, { allData: newData }]);
      });

      currentSupplier.data = currentSupplierPrice;
      y.push(currentSupplier);
    });

    let baseSafePrice = null;
    // let baseLowestPrice = null;
    let startingBiddingPriceBase = null;
    let seriesData = y;
    const quotationSupplierDataLength = y?.length || 0;

    if (quotationSupplierDataLength && base) {
      baseSafePrice = getPriceDividedByBase({ base, price: safePrice });
      // baseLowestPrice = getPriceDividedByBase({ base, price: minOrMaxPrice });
      startingBiddingPriceBase = getPriceDividedByBase({ base, price: startingBiddingPrice });

      // 供应商的趋势图页面隐藏【安全价】字段，无需显示
      const marklineData = [
        baseSafePrice && type !== 'SUPPLIER'
          ? {
              name: 'SafePrice',
              yAxis: baseSafePrice,
              label: {
                padding: [-13, -20, 15, -45], // 定位
                position: 'end',
                formatter: (params) => {
                  const { value, name } = params || {};
                  let prefix = '';
                  if (name === 'SafePrice') {
                    prefix = intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价');
                  }

                  if (hiddenPriceFlag) {
                    return prefix;
                  }

                  // 过小的数字导致渲染为0
                  const newPriceValue = value === 0 && baseSafePrice !== 0 ? baseSafePrice : value;

                  return `${prefix}\n${CurrentCurrencySymbol} ${numberSeparatorRender(
                    newPriceValue
                  )}`;
                },
                color: '#333', // #E64322
              },
              lineStyle: {
                width: 1,
                color: '#E64322',
              },
            }
          : null,
        // 最低限价
        isBritishBidTrafficLight === 1 && type !== 'SUPPLIER'
          ? {
              name: 'LowerPrice',
              yAxis: lowerPrice,
              label: {
                padding: [-13, -20, 15, -55], // 定位
                position: 'end',
                formatter: (params) => {
                  const { name } = params || {};
                  let prefix = '';
                  if (name === 'LowerPrice') {
                    prefix = lowerLabel;
                  }

                  if (hiddenPriceFlag) {
                    return prefix;
                  }

                  // 过小的数字导致渲染为0
                  const newPriceValue = lowerPrice;

                  return `${prefix}\n${CurrentCurrencySymbol} ${numberSeparatorRender(
                    newPriceValue
                  )}`;
                },
                color: '#179454',
              },
              lineStyle: {
                width: 1,
                color: '#179454',
                type: 'solid',
              },
            }
          : null,
        // 最高价限价
        isBritishBidTrafficLight === 1 && type !== 'SUPPLIER'
          ? {
              name: 'UpperPrice',
              yAxis: upperPrice,
              label: {
                padding: [-13, -20, 15, -55], // 定位
                position: 'end',
                // align: 'right',
                formatter: (params) => {
                  const { name } = params || {};
                  let prefix = '';
                  if (name === 'UpperPrice') {
                    prefix = upperLabel;
                  }

                  if (hiddenPriceFlag) {
                    return prefix;
                  }

                  // 过小的数字导致渲染为0
                  const newPriceValue = upperPrice;

                  return `${prefix}\n${CurrentCurrencySymbol} ${numberSeparatorRender(
                    newPriceValue
                  )}`;
                },
                color: '#F06200',
              },
              lineStyle: {
                width: 1,
                color: '#F06200',
                type: 'solid',
              },
            }
          : null,
        // baseLowestPrice
        //   ? {
        //       name: 'Lowest Quotation Price',
        //       yAxis: baseLowestPrice,
        //       label: {
        //         padding: [-13, -20, 15, -10], // 重点在这里，这个地方就是定位
        //         position: 'end',
        //         formatter: (params) => {
        //           const { value, name } = params;
        //           let prefix = '';
        //           if (name === 'Lowest Quotation Price') {
        //             prefix =
        //               biddingQuotationMethod === 'AUCTION'
        //                 ? intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价')
        //                 : intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价');
        //           }

        //           if (hiddenPriceFlag) {
        //             return prefix;
        //           }

        //           return `${prefix}\n${CurrentCurrencySymbol} ${numberSeparatorRender(value)}`;
        //         },
        //       },
        //       color: '#333',
        //       lineStyle: {
        //         color: biddingQuotationMethod === 'AUCTION' ? 'red' : 'green',
        //         width: 1,
        //       },
        //     }
        //   : null,

        // 需要处理为启用红绿灯模式，在【趋势图】里隐藏起竞价的那条线；
        startingBiddingPriceBase && !isBritishBidTrafficLight
          ? {
              name: 'startingBiddingPriceBase',
              yAxis: startingBiddingPriceBase,
              label: {
                padding: [-13, -20, 15, -40], // 定位
                position: 'end',
                formatter: (params) => {
                  const { value, name } = params || {};
                  let prefix = '';
                  if (name === 'startingBiddingPriceBase') {
                    prefix =
                      biddingQuotationMethod === 'BIDDING'
                        ? intl.get('ssrc.biddingHall.model.startingBiddingPrice').d('起竞价')
                        : intl
                            .get('ssrc.biddingHall.model.startingAuctionBiddingPrice')
                            .d('起拍价');
                  }

                  if (hiddenPriceFlag) {
                    return prefix;
                  }

                  // const newPriceValue = getPriceDividedByBase({
                  //   price: value,
                  //   base,
                  // });
                  // 过小的数字导致渲染为0
                  const newPriceValue = value === 0 && baseSafePrice !== 0 ? baseSafePrice : value;

                  return `${prefix}\n${CurrentCurrencySymbol} ${numberSeparatorRender(
                    newPriceValue
                  )}`;
                },
                color: '#868d9c', // #179454 rgb(134, 141, 156)
              },
              lineStyle: {
                width: 1,
                color: '#0161D5',
              },
            }
          : null,
      ].filter(Boolean);

      let markPointData = []; // mark point

      // 一家供应商
      if (oneQuotationFlag) {
        const { data } = y[0] || {};
        let currentData = null;
        // const dataOneFlag = data?.length === 1;

        data.forEach((itemData) => {
          if (!itemData) {
            return;
          }

          const [time, price, currentItemDataOfData] = itemData || [];
          const { displaySupplierName, rfxLineSupplierId: currentRfxLineSupplierId } =
            currentItemDataOfData?.allData || {};

          const maxFlag =
            math.eq(price, maxPriceByBase || 0) && maxPriceId === currentRfxLineSupplierId;
          const minFlag =
            math.eq(price, minPriceByBase || 0) && minPriceId === currentRfxLineSupplierId;

          let name = 'maxBidding';
          if (minFlag) {
            name = 'minBidding';
          }

          const maxOrMinPrice = maxFlag || minFlag;
          // 只有一家供应商并且只有一次报价
          // 一家供应商报过一次价格的场景，就按竞价/拍卖判断
          // if (dataOneFlag) {
          //   if (biddingFlag) {
          //     maxOrMinPrice = minFlag;
          //     name = 'minBidding';
          //   } else {
          //     maxOrMinPrice = maxFlag;
          //     name = 'maxBidding';
          //   }
          // }

          if (maxOrMinPrice) {
            currentData = getMarkpointCommonData({
              name,
              time,
              price,
              displaySupplierName,
              rfxLineSupplierId: currentRfxLineSupplierId,
            });
            markPointData.push(currentData);
          }
        });
      }

      if (!oneQuotationFlag) {
        const maxData = [];
        const minData = []; // 首次报价的最低价
        y.forEach((item) => {
          const { data: currentItemData = [] } = item || {};

          currentItemData.forEach((itemData) => {
            if (!itemData) {
              return;
            }

            const [time, price, data] = itemData || [];

            const { displaySupplierName, rfxLineSupplierId: currentRfxLineSupplierId } =
              data?.allData || {};

            const maxFlag =
              math.eq(price, maxPriceByBase || 0) && maxPriceId === currentRfxLineSupplierId;
            const minFlag =
              math.eq(price, minPriceByBase || 0) && minPriceId === currentRfxLineSupplierId;

            let name = 'maxBidding';
            if (minFlag) {
              name = 'minBidding';
            }

            if (minFlag) {
              const newData = getMarkpointCommonData({
                name,
                time,
                price,
                displaySupplierName,
                rfxLineSupplierId: minPriceId,
              });
              minData.push(newData);
            }

            if (maxFlag) {
              name = 'maxBidding';
              const newData = getMarkpointCommonData({
                name,
                time,
                price,
                displaySupplierName,
                rfxLineSupplierId: maxPriceId,
              });
              maxData.push(newData);
            }
          });
        });

        // minData[0] 首次报价的最低价
        if (biddingFlag) {
          markPointData = [minData[0], maxData[maxData.length - 1]];
        } else {
          markPointData = [maxData[0], minData[minData.length - 1]];
        }
      }

      const markPointDataList = markPointData.filter(Boolean);
      markPointData = markPointDataList;

      if (!supplier && hiddenPriceFlag) {
        markPointData = null;
      }
      if (supplier && supplierHiddenQuote) {
        markPointData = null;
      }

      setMinMaxPrice(markPointData);

      const markPoints = {
        silent: true,
        data: markPointData,
        // symbolKeepAspect: true,
        // symbolOffset: [-5, -20],
        // itemStyle: {
        //   color: 'rgba(255, 255, 255, 0.01)',
        // },
        symbol: 'arrow',
        symbolSize: 10,
        // label: {
        //   show: !hiddenPriceFlag,
        //   formatter: (params) => {
        //     let currentRecordData = params || {};
        //     if (Array.isArray(params) && params.length > 0) {
        //       currentRecordData = params?.[0] || {};
        //     }

        //     const { seriesName, value, name } = currentRecordData;

        //     if (!seriesName && isNil(value)) {
        //       return '';
        //     }

        //     const currentTitle = getMaxMinPriceTitle(name);
        //     const newPrice = !hiddenPriceFlag
        //       ? `${CurrentCurrencySymbol || ''} ${numberSeparatorRender(value)}`
        //       : '***';

        //     return `${currentTitle}: ${newPrice}`;
        //   },
        //   lineHeight: 20,
        // },
        // tooltip: {
        //   show: true, // mark point tooltip
        // },
        // symbolSize: [80, 20],
      };

      const markLine = {
        silent: true,
        symbol: 'none',
        data: !hiddenPriceFlag ? marklineData : null, // // 密封，隐藏报价 不显示markline
        lineStyle: {
          type: 'dashed',
        },
        align: 'right',
      };

      seriesData = y.map((item) => {
        const { data, name } = item || {};
        if (isEmpty(data)) {
          return item;
        }

        let currentLineMarkPointData = null;

        const newData = data.map((s) => {
          const [time, price, ...others] = s || [];
          const { allData } = others?.[0] || {};
          const { rfxLineSupplierId: currentRfxLineSupplierId } = allData || {};

          if (!isEmpty(markPoints.data)) {
            const maxOrMinData = markPoints.data.filter(
              (markData) => markData.rfxLineSupplierId === currentRfxLineSupplierId
            );

            if (!isEmpty(maxOrMinData)) {
              currentLineMarkPointData = {
                ...markPoints,
                data: maxOrMinData,
              };
            }
          }

          return [time, price, ...others];
        });

        const lineColor = getCurrentLineColorFromCacheDefault({ name });

        return {
          ...item,
          symbol: 'circle',
          symbolSize: 6,
          markLine,
          markPoint: currentLineMarkPointData,
          data: newData,
          lineStyle: {
            color: lineColor,
          },
          itemStyle: {
            color: lineColor,
          },
        };
      });
    }

    // const xData = calcXData || [firstQuotedTime, lastQuotedTime].filter(Boolean);
    const timeSetArray = [...timeSet];
    const sortTime = timeSetArray.sort(
      (pre, next) => new Date(pre?.replace(/-/g, '/')) - new Date(next?.replace(/-/g, '/'))
    );

    [firstQuotedTime] = sortTime;
    lastQuotedTime = sortTime[sortTime.length - 1];

    const xData = sortTime;
    let skipOneDay = false; // 时间跨度超过一天标识
    let oneMinuteRange = false; // 时间间隔一分钟

    if (firstQuotedTime && lastQuotedTime) {
      skipOneDay = moment(firstQuotedTime).add(1, 'day').isSameOrBefore(lastQuotedTime, 'day');
      oneMinuteRange = moment(firstQuotedTime).add(2, 's').isSame(lastQuotedTime, 'm');
    }

    let yAxisUnitLabel = CurrentCurrencySymbol;
    if (label) {
      // const currencyRender = CurrentCurrencySymbol ? `(${CurrentCurrencySymbol})` : ''; // 币种
      yAxisUnitLabel = `${intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位')}: ${
        label || ''
      }`;
    }

    const currentOptions = {
      grid: {
        // left: '6%',
        containLabel: true,
      },
      legend: {
        ...getLegendCommonConfig(),
        selected: legendSelected,
      },
      yAxis: {
        type: 'value',
        name: yAxisUnitLabel,
        nameTextStyle: {
          // align: 'center',
          padding: [8, 20, 20, 0],
        },
        axisLabel: {
          // y 轴 左侧显示刻度数字
          formatter: (value) => {
            if (hiddenPriceFlag) {
              return HiddenPriceMenaing;
            }

            return numberSeparatorRender(value);
          },
          fontSize: 10,
        },
        splitLine: {
          show: !hiddenPriceFlag, // 密封，隐藏报价 不显示纵线
        },
      },
      xAxis: [
        {
          type: 'time',
          data: xData,
          // boundaryGap: ['2%', '2%'],
          // max: null,
          // min: null,
          axisPointer: {
            show: true,
            // type: 'line',
            // axis: 'x',
            // animation: false,
            // snap: true,
            lineStyle: {
              type: 'dashed',
              color: '#c3c3c3',
            },
          },
          axisLabel: {
            formatter(value, index) {
              if (index === 0) {
                return '';
              }

              let formatTimeValue = '';

              if (value) {
                formatTimeValue = moment(value).format('HH:mm');

                if (oneMinuteRange && oneQuotationFlag !== 1) {
                  formatTimeValue = moment(value).format('HH:mm:ss');
                }
              }

              if (skipOneDay || oneQuotationFlag === 1) {
                const monthDay = moment(value).format('MM-DD');
                return `${monthDay}\n${formatTimeValue}`;
              }

              return formatTimeValue;
            },
            showMinLabel: false,
          },
          splitLine: {
            show: false,
          },
          splitNumber: 6,
        },
      ],
      series: seriesData,
      tooltip: {
        show: true,
        // alwaysShowContent: false,
        axisPointer: {
          // type: 'line',
          // axis: 'y',
          type: 'cross',
          animation: false,
          snap: true,
        },
        smoothMonotone: 'x',
        formatter: (params) => {
          let currentRecordData = params || {};
          if (Array.isArray(params) && params.length > 0) {
            currentRecordData = params?.[0] || {};
          }

          const { seriesName, value, name, componentType } = currentRecordData;

          if (componentType === 'markPoint') {
            const currentTitle = getMaxMinPriceTitle(name);
            const newPrice = getTooltipPriceRender({
              price: value,
              hiddenPriceFlag,
              CurrentCurrencySymbol,
            });

            return `${currentTitle}: ${newPrice}`;
          }

          const [time, price] = Array.isArray(value) ? value || [] : [];

          if (!seriesName && !name) {
            return '';
          }

          const formatTime = formatDateTime({ dateTime: time, onlyMonthDayHourMinuteSecond: 1 });
          const newPrice = getTooltipPriceRender({ price, hiddenPriceFlag, CurrentCurrencySymbol });

          return `${formatTime} \n <br /> ${seriesName}:${newPrice}`;
        },
        backgroundColor: '#fff',
        borderColor: '#fff',
        textStyle: {
          color: '#333',
          fontSize: 13,
        },
        extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
      },
    };

    chartOldOptions.current.options = currentOptions; // 缓存option

    await myChart.setOption(currentOptions, true);
    await mychartAddListerner();
  };

  // 监听 lengend 改变
  const mychartAddListerner = () => {
    if (japanDutchFlag) {
      return;
    }

    // override legend-select
    myChart.on('legendselectchanged', (params) => {
      const { name } = params || {};
      const myChartOptions = myChart.getOption();
      const cacheSelectedSupplier = chartSelectSuppliers.current || {};
      const cachedSelectedSupplierData = cacheSelectedSupplier[name] || {};

      const { series, legend: currentOptionsLegend } = myChartOptions || {};
      const { selected: cachedSelectedData } = currentOptionsLegend?.[0] || {};
      let currentSelfFlag = false;

      const newSeries = [];
      if (!isEmpty(series)) {
        for (const item of series) {
          const { name: currentName, data, markPoint } = item || {};
          let currentData = null;
          if (!isEmpty(data?.[0])) {
            currentData = data[0][2]?.allData || {};
          }

          const prevSelected = cachedSelectedSupplierData.selected; // 上次是否选择
          const currentSelected = !prevSelected; // 当前选择

          if (currentName === name) {
            const { trendChartRank, selfFlag } = currentData || {};
            const color = getCurrentLineColorFromCache({ name, currentData }) || '#ccc';

            let newCacheData = {
              disabledColor: color || commonDisabledColor,
            };

            if (!isNil(trendChartRank) && trendChartRank < 4) {
              newCacheData = {};
            }

            const currentSupplierCacheData = {
              [name]: {
                ...(cachedSelectedSupplierData || {}),
                selected: currentSelected,
                ...newCacheData,
              },
            };

            chartSelectSuppliers.current = {
              ...(cacheSelectedSupplier || {}),
              ...currentSupplierCacheData,
            };

            currentSelfFlag = selfFlag === 1 || (!isNil(trendChartRank) && trendChartRank < 4);
            if (currentSelfFlag) {
              break;
            }

            let newMarkPointData = null;
            if (!isEmpty(markPoint?.data)) {
              newMarkPointData = markPoint?.data.map((mp) => {
                const { displaySupplierName } = mp || {};

                if (displaySupplierName === currentName) {
                  return {
                    ...mp,
                    itemStyle: {
                      color,
                    },
                  };
                } else {
                  return mp;
                }
              });
            }

            newSeries.push({
              ...item,
              markPoint: {
                ...markPoint,
                data: newMarkPointData,
              },
              lineStyle: {
                color,
              },
              itemStyle: {
                color,
              },
            });
          } else {
            newSeries.push(item);
          }
        }
      }

      myChart.dispatchAction({
        type: 'hideTip',
      });

      // 点击自己不做处理
      if (currentSelfFlag) {
        myChart.setOption({
          legend: {
            ...getLegendCommonConfig(),
            selected: {
              [name]: true,
            },
          },
        });
        return;
      }

      // myChart.clear(); // clear 会导致mark point itemStyle.color 再切换时不更新为线条颜色
      const oldOptions = chartOldOptions.current?.options || {};
      const newOptions = {
        ...oldOptions,
        series: newSeries,
        legend: {
          ...getLegendCommonConfig(),
          ...(currentOptionsLegend?.[0] || {}),
          selected: {
            ...(cachedSelectedData || {}),
            [name]: true,
          },
        },
      };

      chartOldOptions.current.options = newOptions;

      legendSelectChangeTimer.current = setTimeout(() => {
        myChart.setOption(newOptions, true);
      }, LEGEND_CHANGED_TIMER);
    });
  };

  const getCurrentLineColorFromCache = (data) => {
    const { name, currentData } = data || {};
    const { trendChartRank, selfFlag } = currentData || {};
    if (!name) {
      return;
    }

    let newColor = '';

    const cacheSelectedSupplier = chartSelectSuppliers.current || {};
    const cachedSelectedSupplierData = cacheSelectedSupplier[name] || {};
    const { disabledColor, color, selected: prevSelected } = cachedSelectedSupplierData;

    // 自己或者前三名用定好的颜色，否则就随机用一个新颜色
    if (selfFlag === 1 || (!isNil(trendChartRank) && trendChartRank < 4)) {
      newColor = prevSelected ? disabledColor : color;
    } else {
      const newGenerateColor = getAUniqueColor(usedColorSet);
      newColor = prevSelected ? newGenerateColor : color;
      if (prevSelected) {
        if (usedColorSet.size > 10) {
          newColor = '';
        } else {
          newColor = newGenerateColor;
          usedColorSet.add(newGenerateColor);
        }
      } else {
        usedColorSet.delete(disabledColor);
        newColor = color;
      }
    }

    return newColor;
  };

  // 查询后，获取颜色
  const getCurrentLineColorFromCacheDefault = (data) => {
    const { name } = data || {};
    if (!name) {
      return;
    }

    const cacheSelectedSupplier = chartSelectSuppliers.current || {};
    const cachedSelectedSupplierData = cacheSelectedSupplier[name] || {};
    const prevSelected = cachedSelectedSupplierData.selected; // 上次是否选择
    const currentColor = prevSelected
      ? cachedSelectedSupplierData.color
      : cachedSelectedSupplierData.disabledColor;
    return currentColor;
  };

  // 缓存勾选数据
  const cacheSupplierSelectedData = (params = {}) => {
    const { data } = params || {};
    const { trendChartRank, selfFlag, displaySupplierName } = data || {};
    const cacheSelectedSupplier = chartSelectSuppliers.current || {};
    const currentSupplierData = cacheSelectedSupplier[displaySupplierName]; // prev cache data

    if (!displaySupplierName) {
      return;
    }

    let colorKey = 'LAST';

    if (selfFlag === 1) {
      colorKey = 1;
    }

    if (!isNil(trendChartRank)) {
      if (trendChartRank < 4) {
        colorKey = trendChartRank;
      }
    }

    if (usedColorSet.size > 10) {
      colorKey = 'LAST';
    }

    const currentSelfFlag = selfFlag === 1 || (!isNil(trendChartRank) && trendChartRank < 4);

    const colorValues = getLineColors(colorKey) || {};
    const { color, disabledColor } = colorValues;

    usedColorSet.add(color);
    let newDisabledColor = disabledColor;
    if (currentSelfFlag) {
      newDisabledColor = color;
    }

    if (!currentSupplierData) {
      chartSelectSuppliers.current = {
        ...(cacheSelectedSupplier || {}),
        [displaySupplierName]: {
          color,
          disabledColor: newDisabledColor,
          selected: true,
          trendChartRank,
          selfFlag,
        },
      };
    } else {
      const { trendChartRank: cacheTrendChartRank } = currentSupplierData || {};

      let newData = {};
      if (trendChartRank !== cacheTrendChartRank) {
        newData = {
          color,
          disabledColor: newDisabledColor,
        };
      }

      chartSelectSuppliers.current = {
        ...(cacheSelectedSupplier || {}),
        [displaySupplierName]: {
          ...(currentSupplierData || {}),
          ...newData,
          // color,
          // disabledColor: newDisabledColor,
          trendChartRank,
          selfFlag,
        },
      };
    }
  };

  // tooltip price and currency
  const getTooltipPriceRender = (data) => {
    const { price, hiddenPriceFlag, CurrentCurrencySymbol } = data || {};

    const newPrice = !hiddenPriceFlag
      ? `${CurrentCurrencySymbol || ''} ${numberSeparatorRender(price)}`
      : '***';
    return newPrice;
  };

  // 最高最低价标题
  const getMaxMinPriceTitle = (name) => {
    if (!name) {
      return '';
    }

    let currentTitle = intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价');
    if (name === 'minBidding') {
      currentTitle = intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价');
    }
    return currentTitle;
  };

  // markpoint data common
  const getMarkpointCommonData = (param = {}, optionData = {}) => {
    const { name, time, price, displaySupplierName, rfxLineSupplierId: currentRfxLineSupplierId } =
      param || {};
    if (!name || !time) {
      return;
    }

    const currentColor =
      (biddingFlag && name === 'maxBidding') || (!biddingFlag && name === 'minBidding')
        ? '#E64322'
        : '#179454';
    const lineColor = getCurrentLineColorFromCacheDefault({ name: displaySupplierName });

    return {
      coord: [time, price], // 最高，最低价的横/纵坐标
      value: price,
      name,
      itemStyle: {
        color: lineColor || currentColor,
      },
      symbolRotate: name === 'maxBidding' ? 0 : 180,
      label: {
        show: false,
        // color: currentColor,
        // padding: [-13, -20, 15, -25], // 定位
      },
      displaySupplierName,
      rfxLineSupplierId: currentRfxLineSupplierId,
      ...(optionData || {}),
    };
  };

  // 将价格按照基准单位处理
  const getPriceDividedByBase = (data) => {
    const { price, base = 1 } = data || {};

    if (math.isNaN(price)) {
      return null;
    }

    const newPrice = math.div(price, base || 1);
    return newPrice;
  };

  const getColumns = useCallback(() => {
    let columns = [
      {
        name: 'displaySupplierName',
      },
      {
        width: 200,
        name: 'displayQuotationPrice',
        renderer: ({ value, record }) => rendererPrice(value, record),
      },
      {
        width: 180,
        name: 'quotedDate',
        renderer: ({ value }) => transDateTimeToLocal(value),
      },
    ];

    // 日式/荷兰 总价
    if (japanDutchFlag === 1) {
      columns = [
        {
          width: 60,
          name: 'biddingRoundNumber',
        },
        {
          width: 100,
          name: 'displayQuotationPrice',
          renderer: ({ value, record }) => rendererPrice(value, record),
        },
        {
          name: 'displaySupplierName',
        },
        {
          width: 180,
          name: 'quotedDate',
          renderer: ({ value }) => transDateTimeToLocal(value),
        },
      ];
    }

    return columns.filter(Boolean);
  }, [biddingAnonymousQuotesFlag, benchmarkPriceType, header, japanDutchFlag]);

  // 记录查询时间
  const recordQueryDateTime = () => {
    setRefreshTime(moment().format(DEFAULT_DATETIME_FORMAT));
  };

  // 刷新历史竞价记录页面
  const fetchBiddingRecord = useCallback(
    throttle(() => {
      if (biddingRecordTabHidden || onlyShowChartFlag === 1) {
        return;
      }

      try {
        const res = historyTableDS.query(historyTableDS?.currentPage || 1);
        if (getResponse(res)) {
          recordQueryDateTime();
        }
      } catch (e) {
        throw e;
      }
    }, 1200),
    [historyTableDS, usedColorSet]
  );

  // 自定义右侧内容
  const renderRightContent = () => {
    return (
      <div className={Styles['purchase-item-history-chart-time']}>
        <span className={Styles['purchase-item-history-chart-time-text']}>
          {intl.get('ssrc.biddingHall.view.title.refreshTime').d('更新时间')}
        </span>
        <span>{refreshTime ? moment(refreshTime).format('HH:mm') : ''}</span>
        <Icon type="refresh" onClick={() => refreshCurrent()} />
      </div>
    );
  };

  const changeLastTime = (key) => {
    let newValue = null;
    let newKey = key;

    if (key === '0') {
      newKey = '1';
    }

    if (newKey && !isNaN(newKey)) {
      newValue = Math.floor(newKey);
    }

    if (!isNil(newKey)) {
      newValue = Number(newValue);
    }

    const optionStrValue = !isNil(newValue) ? String(newValue) : null;
    setLastTime(optionStrValue);
    setCount(null);

    if (myChart) {
      // chartSelectSuppliers.current = {};
      myChart.clear();
    }

    chartSelectObj.current.recentDatePeriod = newValue;
    chartSelectObj.current.recentCount = null;
    fetchChartData();
  };

  // chat count number
  const selectCount = async (key) => {
    let newValue = null;
    let newKey = key;

    if (!math.isNaN(key) && math.eq(key, 0)) {
      newKey = '5';
    }

    if (newKey && !isNaN(newKey)) {
      newValue = Math.floor(newKey);
    }

    if (!isNil(newKey)) {
      newValue = Number(newValue);
    }

    const optionStrValue = !isNil(newValue) ? String(newValue) : null;
    setCount(optionStrValue);
    setLastTime(null);

    if (myChart) {
      // chartSelectSuppliers.current = {};
      myChart.clear();
    }

    chartSelectObj.current.recentDatePeriod = null;
    chartSelectObj.current.recentCount = newValue;

    fetchChartData();
  };

  // refrech current tab data
  const refreshCurrent = throttle((currentTab) => {
    const currentKey = currentTab || activeKey;

    if (currentKey === 'record') {
      chartSelectObj.current = {};
      setCount(null);
      setLastTime(null);
      clearChartIntervalTimer();
      fetchBiddingRecord();
      setIntervalFetchRecord();
    }

    if (currentKey === 'trend') {
      fetchChartData();
      fetchBiddingRecord();
    }
  }, 1200);

  // 切换tab进行的操作
  const handleChangeTab = useCallback(
    throttle((newActiveKey) => {
      if (newActiveKey === activeKey) {
        return;
      }

      setActiveKey(newActiveKey);

      refreshCurrent(newActiveKey);
    }, 1200),
    [fetchBiddingRecord, activeKey, myChart, usedColorSet, lastTime, count]
  );

  /**
   * 上-最高，下-最低
   */
  const renderChartMinMaxLegend = () => {
    if (isEmpty(minMaxPrice) || japanDutchFlag) {
      return '';
    }

    return (
      <div className={Styles['ssrc-bidding-hall-chart-max-min-legend']}>
        {minMaxPrice.map((item, index) => {
          const { name, value } = item || {};
          if (!name) {
            return '';
          }

          const maxPriceFlag = name === 'maxBidding';

          let imgStyleObje = {};
          if (!maxPriceFlag) {
            imgStyleObje = {
              transform: 'rotate(180deg)',
            };
          }
          const formatterValuePrice = numberSeparatorRender(value);

          return (
            <div
              key={name}
              className={classnames(Styles['ssrc-bidding-hall-chart-max-min-item'], {
                [Styles['ssrc-bidding-hall-chart-max-min-item-not-first-item']]: index !== 0,
              })}
            >
              <img
                src={upArrow}
                alt="up-arrow"
                style={{ color: '#868D9C', width: '14px', ...imgStyleObje }}
              />
              <span className={Styles['ssrc-bidding-hall-chart-max-min-item-label']}>
                {maxPriceFlag
                  ? intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价')
                  : intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价')}
              </span>
              <span>{formatterValuePrice}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const recordDataLengthRender = historyTableDS?.totalCount
    ? `(${historyTableDS?.totalCount})`
    : '';

  if (onlyShowChartFlag) {
    return (
      <div style={otherPageRenderChartStyle?.wrapperStyle || {}}>
        {!emptyFlag ? (
          <div
            id="eChartsDom"
            style={{
              height: '400px',
              width: '550px',
              overflow: 'auto',
              ...(otherPageRenderChartStyle?.chartStyle || {}),
            }}
            ref={chartRef}
          />
        ) : (
          <EmptyDataIllustrate />
        )}
      </div>
    );
  }

  return (
    <>
      <Tabs
        activeKey={activeKey}
        tabBarExtraContent={renderRightContent()}
        onChange={handleChangeTab}
        style={{ heigh: '100%' }}
        className={Styles['purchase-item-history-chart-tabs-wrapper']}
      >
        {!biddingRecordTabHidden ? (
          <TabPane
            tab={`${intl
              .get('ssrc.biddingHall.view.tab.biddingRecord')
              .d('竞价记录')} ${recordDataLengthRender}`}
            key="record"
          >
            <Table
              dataSet={historyTableDS}
              columns={getColumns()}
              // style={{ maxHeight: 'calc(100% - 40px)' }}
            />
          </TabPane>
        ) : (
          ''
        )}
        {biddingChartTabHidden ? (
          ''
        ) : (
          <TabPane
            tab={intl.get('ssrc.biddingHall.view.tab.biddingTrendChart').d('趋势图')}
            key="trend"
          >
            {!japanDutchFlag ? (
              <div
                className={Styles['ssrc-bidding-hall-componnets-item-history-chart-select-wrap']}
              >
                <div
                  className={Styles['ssrc-bidding-hall-select-item']}
                  style={{ marginRight: '16px' }}
                >
                  <span>{intl.get('ssrc.biddingHall.view.tab.lastedTimes').d('最近时间')}</span>
                  <div className={Styles['ssrc-bidding-hall-select-item-wrapper']}>
                    <Select
                      name="time"
                      mode="combobox"
                      onChange={changeLastTime}
                      combo
                      noCache
                      value={lastTime}
                      style={{ width: '100px', marginLeft: '8px', height: '22px' }}
                      addonAfter={intl.get('hzero.common.date.unit.minutes').d('分钟')}
                    >
                      <Option value="1">1</Option>
                      <Option value="5">5</Option>
                      <Option value="10">10</Option>
                      <Option value="20">20</Option>
                      <Option value="30">30</Option>
                    </Select>
                  </div>
                </div>

                <div className={Styles['ssrc-bidding-hall-select-item']}>
                  <span>
                    {intl.get('ssrc.biddingHall.view.tab.lastedCountNumbers').d('最近次数')}
                  </span>
                  <div className={Styles['ssrc-bidding-hall-select-item-wrapper']}>
                    <Select
                      name="count"
                      onChange={selectCount}
                      combo
                      noCache
                      value={count}
                      style={{ width: '100px', marginLeft: '8px', height: '22px' }}
                      addonAfter={intl.get('ssrc.common.view.common.timers').d('次')}
                    >
                      <Option value="5">5</Option>
                      <Option value="10">10</Option>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}

            {renderChartMinMaxLegend()}

            <Spin spinning={loading}>
              <div style={{ width: 'auto', overflowX: 'auto' }}>
                <div
                  id="eChartsDom"
                  style={{
                    height: '400px',
                    width: '550px',
                    overflow: 'auto',
                    display: !emptyFlag ? '' : 'none',
                  }}
                  ref={chartRef}
                />
              </div>

              {emptyFlag ? (
                <div className={Styles['ssrc-bidding-hall-componnets-charts-empty-wrapper']}>
                  <div className={Styles['quotation-bidding-chart-content-not-start-image']}>
                    <img src={noResult} alt="no result" />
                  </div>
                  <div className={Styles['quotation-bidding-chart-content-not-start-warning-text']}>
                    {intl.get('hzero.common.message.data.none').d('暂无数据')}
                  </div>
                </div>
              ) : (
                ''
              )}
            </Spin>
          </TabPane>
        )}
      </Tabs>
    </>
  );
};

export default observer(HistoryAnalysis);
