/**
 * PriceComparison - 比价助手页面
 * @date: 2020 3/23
 * @author: cj <juan.chen01@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Button, Spin, Icon } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, noop, isArray, isNil } from 'lodash';
import { withRouter } from 'dva/router';
import { DataSet } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';

import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { math } from 'choerodon-ui/dataset';
import remoteHoc from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { queryEnableDoubleUnit, querySslmLifeCycleConfig } from '@/services/commonService';
import { isText } from '@/utils/utils';

import { idValidation } from '@/routes/components/Widget/dataVerification';
import {
  fetchHistoryAnalysisUserConfig,
  fetchSubRelationConfig,
  fetchHistoryPriceUrl,
  getPrintConfig,
} from '@/services/priceComparisonService';
import { INQUIRY, BID } from '@/utils/globalVariable';
import { urlReg } from '@/utils/SsrcRegx';
import { japanDutchAggregationTableDS } from '@/routes/ssrc/BiddingHall/Purchase/stores/totalPriceDS';
import { japanDutchAggregrationTableDataProcessing } from '@/routes/ssrc/BiddingHall/utils/utils';
import PriceComparisonTab from './PriceComparisonTab';
import QuotationDetailTab from './QuotationDetailTab';
import LatestQuotationTab from './LatestQuotationTab';
import { ThisQuoteProcessTab } from './ThisQuoteProcessTab';
import { ThisBiddingProcessTab } from './ThisBiddingProcessTab';
import HistoryPriceAnalysisTab from './HistoryPriceAnalysisTab';
import NewHistoryPriceAnalysisTab from './NewHistoryAnalysisTab';
import LadderQuotationTab from './LadderQuotationTab';
import { baseInfoDS } from './store/baseInfoDS';

import style from './index.less';

class PriceComparison extends PureComponent {
  constructor(props) {
    super(props);
    const { showPriceComparison = true } = this.props;

    this.baseInfoDs = new DataSet(baseInfoDS());

    this.japanDutchAggregationTableDs = new DataSet(japanDutchAggregationTableDS());

    this.organizationId = getCurrentOrganizationId();

    this.currentPageSymbol = 'PRICE_COMPARISON';

    this.rfxHeaderData = {};

    this.state = {
      allDataLoading: true, // 模态框整体loading
      activityTab: showPriceComparison ? 'priceComparison' : 'quotationDetail', // (比价助手priceComparison/最新报价latestQuotation/本次报价过程thisQuoteProcess/历史价格分析historyPriceAnalysis/报价明细对比quotationDetail)当前按钮标志
      quotationActiveItemId: undefined, // 报价明细activeItemId
      activeItemName: undefined, // 侧边栏物品名称
      activeItemId: undefined, // 侧边栏物品id
      activeRfxLineItemId: undefined, // 侧边栏RfxLineItemId
      latestQuotationType: 'table', // 最新报价(表格版table/柱形图版chart)
      latestQuotationChartList: [], // 最新报价柱形图数据源
      latestQuotationChartXList: [], // 最新报价柱形图横坐标
      thisQuoteProcessChartList: [], // 本次报价过程柱形图数据源
      thisQuoteProcessChartXList: [], // 本次报价过程柱形图横坐标
      thisQuoteTotalChartList: [], // 本次报价总价柱形图数据源
      thisQuoteTotalChartXList: [], // 本次报价总价柱形图横坐标
      dateFlag: 'allTime', // 历史价格分析(全部时间allTime/近一年almostYear/近三个月nearThMonth)活跃标志
      firstFlag: 1, // 第一次查询
      taxPriceFlag: 0, // 默认未税价
      doubleUnitFlag: false,
      historyAnalysisUrl: '', // 历史价格分析tab链接
      isNewHistoryAnalysisTab: false, // 查询配置表 在 使用老的价格分析；不在 使用新的价格分析
      subRelationDisplayFlag: false, // 历史价格分析是否展示替代料标识
      IsShowPrintButton: false,
      sslmLifeCycleFlag: true, // 是否开启新360，true不开启，false开启；
    };
  }

  sourceKey = this.props.sourceKey || INQUIRY;

  async componentDidMount() {
    const { item = {}, showPriceComparison = true, remote, rfxId } = this.props;

    if (remote?.event) {
      remote.event.fireEvent('remoteOpenPriceComparison', {
        rfxHeaderId: rfxId,
        that: this,
      });
    }

    await this.fetchRfxHeader();

    this.queryDoubleUnit();
    this.fetchPriceComparisonHeader();
    this.fetchIsShowHistoryTabConfig();
    this.fetchIsShowPrintButton();
    this.handeleSearchSslmLifeCycleConfig();

    if (isEmpty(item)) {
      if (!showPriceComparison) {
        this.fetchQuotationDetail();
      }
      // 通过比价助手弹开
      await this.fetchComparePriceData();
    } else {
      // 通过历史最低价打开弹框
      await this.fetchLineData();
    }
    await this.priceComparisonAddEvent();
  }

  componentWillUnmount() {
    this.setState({
      activityTab: 'priceComparison',
      dateFlag: 'allTime',
      quotationActiveItemId: undefined,
      activeItemName: undefined,
      activeItemId: undefined,
      activeRfxLineItemId: undefined,
      latestQuotationType: 'table',
      latestQuotationChartList: [],
      latestQuotationChartXList: [],
      thisQuoteProcessChartList: [],
      thisQuoteProcessChartXList: [], // 本次报价过程柱形图横坐标
      firstFlag: 1,
    });
    this.props.dispatch({
      type: 'priceComparison/updateState',
      payload: {
        latestQuotationList: [],
        sideBarMenuList: [],
        priceComparisonHeader: {},
        priceComparisonItemList: [],
        priceComparisonSupplierList: [],
        quotationDetailSideMenu: [],
        quotationDetailData: [],
        thisQuoteProcessTableList: [],
        thisQuoteProcessTablePagination: {},
        historyPriceAnalysisChartList: [],
        historyPriceAnalysisTableList: [],
        historyPriceAnalysisPagination: {},
      },
    });
  }

  fetchRfxHeader = async () => {
    const { rfxId, pubRouterAddParams = () => {} } = this.props;

    idValidation(rfxId);

    this.baseInfoDs.setQueryParameter('commonProps', {
      rfxHeaderId: rfxId,
      organizationId: this.organizationId,
      currentPageSymbol: this.currentPageSymbol,
      ...pubRouterAddParams(),
    });

    const data = await this.baseInfoDs.query();
    this.setState({ allDataLoading: false });

    // 日式/荷兰 进来判断，不需要查询比价助手其它数据，优化性能，所以同步拿到结果判断
    this.rfxHeaderData = data || {};

    await this.changeAfterQueryHeader();
  };

  changeAfterQueryHeader = () => {
    // japan, dutch total
    if (this.japOrDutchBiddingTotalPrice()) {
      this.japanDutchAggregrationQueryAndLoad();
      this.setState({ activityTab: 'thisBiddingProcess' });
      this.fetchThisQuoteProcess();
    }
  };

  /**
   * 加载通过比价助手点击的弹窗数据
   */
  @Bind()
  fetchComparePriceData() {
    if (this.japOrDutchBiddingTotalPrice()) {
      return;
    }

    this.fetchPriceComparison();
    this.fetchSideBarMenu();
    this.fetchBatchCode();
  }

  async fetchIsShowPrintButton() {
    if (this.japOrDutchBiddingTotalPrice()) {
      return;
    }

    const response = getResponse(await getPrintConfig({ tenantNum: getCurrentTenant().tenantNum }));
    if (response) {
      const { content = [] } = response;
      if (Array.isArray(content) && content.length === 0) {
        this.setState({
          IsShowPrintButton: true,
        });
      }
    }
  }

  /**
   * 加载通过历史最低价弹窗数据
   * @protect gipt
   */
  @Bind()
  fetchLineData() {
    const { item = {} } = this.props;
    const { dateFlag = 'allTime' } = this.state;

    if (this.japOrDutchBiddingTotalPrice()) {
      return;
    }

    this.fetchSideBarMenu();
    this.fetchBatchCode();
    // 通过物品最低价弹开
    this.setState({
      activityTab: 'historyPriceAnalysis',
      activeItemId: item.priceLibHistoryDTO.itemId,
      activeItemName: `${item.priceLibHistoryDTO.itemCode}${item.priceLibHistoryDTO.itemName}`,
      activeRfxLineItemId: item.rfxLineItemId,
    });
    // 查询历史价格分析图表
    this.fetchHistoryPriceAnalysisChart({
      dateFlag,
      itemId: item.itemId,
      rfxLineItemId: item.rfxLineItemId,
    });
    // 查询历史价格分析相似物品最低价一览
    this.fetchHistoryPriceAnalysisTable(item.itemId);
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  /**
   * 查询开启新360页面的租户
   */
  async handeleSearchSslmLifeCycleConfig() {
    if (this.japOrDutchBiddingTotalPrice()) {
      return;
    }

    const result = getResponse(await querySslmLifeCycleConfig());
    if (result) {
      this.setState({
        sslmLifeCycleFlag: !!result?.length,
      });
    }
  }

  /**
   * 设置setFirstFlag
   */
  @Bind()
  setFirstFlag() {
    if (this.state.firstFlag) {
      this.setState({
        firstFlag: 0,
      });
    }
  }

  /**
   * 下拉菜单，绑定全局监听事件
   */
  @Bind()
  priceComparisonAddEvent() {
    if (this.japOrDutchBiddingTotalPrice()) {
      return;
    }

    // 点击其他区域时, 隐藏指定区域(cDom)
    document.addEventListener('click', (event) => {
      if (this.priceComparisonRef) {
        const {
          state: {
            itemVisible = false,
            itemSelected = [],
            supplierVisible = false,
            supplierSelected = [],
          },
        } = this.priceComparisonRef;
        const { remote } = this.props;
        const itemDom = document.querySelector('.priceAssistant-filter-item');
        const supplierDom = document.querySelector('.priceAssistant-filter-supplier');
        const itemBtnDom = document.querySelector('.dropdown-item');
        const supplierBtnDom = document.querySelector('.dropdown-supplier');
        const currentDom = event.target;
        // 点击除弹框和本身按钮外其他地方，调api
        if (
          itemDom &&
          !itemBtnDom.contains(currentDom) &&
          itemVisible &&
          !itemDom.contains(currentDom)
        ) {
          this.priceComparisonRef.hideModal('item');
          const itemParams = {
            rfxLineItemIdList: itemSelected,
            quotationHeaderIdList: supplierSelected,
            firstFlag: 0,
          };
          const fetchItemParams = remote
            ? remote.process('PRICE_COMPARISON_PROCESS_PRICE_COMPARISION_ITEM_PARAMS', itemParams, {
                priceComparisonRef: this.priceComparisonRef,
              })
            : itemParams;
          this.fetchPriceComparisonItem(fetchItemParams);
          this.fetchPriceComparisonSupplier({
            rfxLineItemIdList: itemSelected,
            quotationHeaderIdList: supplierSelected,
            firstFlag: 0,
          });
          this.setFirstFlag();
        } else if (
          supplierDom &&
          !supplierBtnDom.contains(currentDom) &&
          supplierVisible &&
          !supplierDom.contains(currentDom)
        ) {
          this.priceComparisonRef.hideModal('supplier');
          const itemParams = {
            rfxLineItemIdList: itemSelected,
            quotationHeaderIdList: supplierSelected,
            firstFlag: 0,
          };
          const fetchItemParams = remote
            ? remote.process('PRICE_COMPARISON_PROCESS_PRICE_COMPARISION_ITEM_PARAMS', itemParams, {
                priceComparisonRef: this.priceComparisonRef,
              })
            : itemParams;
          this.fetchPriceComparisonItem(fetchItemParams);
          this.fetchPriceComparisonSupplier({
            rfxLineItemIdList: itemSelected,
            quotationHeaderIdList: supplierSelected,
            firstFlag: 0,
          });
          this.setFirstFlag();
        } else {
          /* eslint-disable */
          if (remote?.event) {
            const eventProps = {
              priceComparisonRef: this.priceComparisonRef,
              fetchPriceComparisonItem: this.fetchPriceComparisonItem,
              fetchPriceComparisonSupplier: this.fetchPriceComparisonSupplier,
              setFirstFlag: this.setFirstFlag,
              event,
              document,
            };
            remote.event.fireEvent('addEventListenerRemote', eventProps);
          }
          /* eslint-disable */
        }
      }
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchBatchCode() {
    const { dispatch, remote } = this.props;
    const lovCodes = {
      quoteData: 'SSRC.PRICE_COMPARE_ASSISTANT.QUO_CFG', // 报价信息
      supplierData: 'SSRC.PRICE_COMPARE_ASSISTANT.SUPPLIER_CFG', // 供应商信息
      quotationCountData: 'SSRC.PRICE_COMPARE_ASSISTANT.COUNT_CFG', // 报价小计集合
    };
    dispatch({
      type: 'priceComparison/batchCode',
      payload: {
        lovCodes: remote
          ? remote.process('srm-front-ssrc/priceComparison_PROCESS_LOV_CODES', lovCodes, {
              bidFlag: this.sourceKey === BID,
            })
          : lovCodes,
      },
    });
  }

  /**
   * 查询比价助手头
   */
  @Bind()
  fetchPriceComparisonHeader() {
    const { dispatch, rfxId, pubRouterAddParams = () => {}, remote } = this.props;

    dispatch({
      type: 'priceComparison/fetchPriceComparisonHeader',
      payload: {
        rfxHeaderId: rfxId,
        ...pubRouterAddParams(),
      },
    }).then(() => {
      if (remote?.event) {
        const eventProps = {
          current: this,
          fetchData: this.fetchData,
          props: this.props,
        };
        remote.event.fireEvent('afterQuerySet', eventProps);
      }
    });
  }

  /**
   * 查询比价助手物品
   */
  @Bind()
  fetchPriceComparisonItem(params = {}) {
    const { dispatch, rfxId, pubRouterAddParams = () => {}, remote } = this.props;
    const { firstFlag = 1 } = this.state;
    const { firstFlag: paramsFirstFlag } = params;
    dispatch({
      type: 'priceComparison/fetchPriceComparisonItem',
      payload: {
        rfxHeaderId: rfxId,
        firstFlag,
        ...params,
        ...pubRouterAddParams(),
      },
    }).then((res) => {
      if (!isEmpty(res) && this.priceComparisonRef) {
        // 取最大长度的supplierInfoList,不同物料，不同供应商报价不同 下面if里面的内容兼容之前后端二开返回字段名发生变化导致取不到值问题（已知项目贝泰妮）
        const supplierInfoList = [];
        let summarySupplierList = [];
        if (
          (!res[0].summarySupplierList || isEmpty(res[0].summarySupplierList)) &&
          !isEmpty(res[0].quotationInfoList) &&
          !isEmpty(res[0].quotationInfoList[0].supplierInfoList)
        ) {
          let max = [];
          res.forEach((item) =>
            supplierInfoList.push(item.quotationInfoList[0].supplierInfoList.length)
          );
          max = math.max(...supplierInfoList);
          const indexOfMax = supplierInfoList.indexOf(max);
          summarySupplierList = [...(res[indexOfMax].quotationInfoList[0].supplierInfoList ?? [])];
        } else {
          // eslint-disable-next-line prefer-destructuring
          summarySupplierList = res[0].summarySupplierList;
        }
        const supplierInfoListIds = summarySupplierList.map((item) => item.quotationHeaderId);
        if (isNil(paramsFirstFlag) ? firstFlag : paramsFirstFlag) {
          this.priceComparisonRef.setState({
            itemSelected: res.map((item) => item.rfxLineItemId),
            supplierSelected: remote
              ? remote.process(
                  'srm-front-ssrc/priceComparison_PROCESS_SUPPLIER_SELECTED',
                  supplierInfoListIds
                )
              : supplierInfoListIds,
            maxLengthSupplierList: summarySupplierList,
          });
        } else {
          this.priceComparisonRef.setState({
            maxLengthSupplierList: summarySupplierList,
          });
        }
      }
    });
  }

  /**
   * 查询比价助手供应商
   */
  @Bind()
  fetchPriceComparisonSupplier(params = {}) {
    const { dispatch, rfxId, pubRouterAddParams = () => {} } = this.props;
    const { firstFlag = 1 } = this.state;
    dispatch({
      type: 'priceComparison/fetchPriceComparisonSupplier',
      payload: {
        rfxHeaderId: rfxId,
        firstFlag,
        ...params,
        ...pubRouterAddParams(),
      },
    });
  }

  /**
   * 查询比价助手数据
   */
  @Bind()
  fetchPriceComparison() {
    // this.fetchPriceComparisonHeader();
    this.fetchPriceComparisonItem({ firstFlag: 1 });
    this.fetchPriceComparisonSupplier({ firstFlag: 1 });
  }

  /**
   * 查询报价明细侧边物料
   * sourceFrom 默认传RFX，若BID页面，需要从外面传参
   */
  @Bind()
  fetchQuotationDetailSideMenu() {
    const { dispatch, rfxId, sourceFrom = 'RFX', pubRouterAddParams = () => {} } = this.props;

    if (this.japOrDutchBiddingTotalPrice()) {
      return;
    }

    dispatch({
      type: 'priceComparison/fetchQuotationDetailSideMenu',
      payload: {
        sourceHeaderId: rfxId,
        sourceFrom,
        ...pubRouterAddParams(),
      },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.setState({
          quotationActiveItemId: res[0].sourceLineItemId,
        });
        // 默认查第一个
        this.fetchQuotationDetailData({ activeKey: res[0].sourceLineItemId });
        // 查询报价明细筛选框数据
        this.fetchQuotationDetailFilter({ activeKey: res[0].sourceLineItemId });
      }
      this.setState({ allDataLoading: false });
    });
  }

  /**
   * 查询报价明细筛选框数据
   */
  @Bind()
  fetchQuotationDetailFilter(params) {
    const { dispatch, rfxId, sourceFrom = 'RFX', pubRouterAddParams = () => {} } = this.props;
    dispatch({
      type: 'priceComparison/fetchQuotationDetailFilter',
      payload: {
        sourceFrom,
        sourceHeaderId: rfxId,
        sourceLineItemId: params.activeKey,
        ...pubRouterAddParams(),
      },
    });
  }

  /**
   * 查询报价明细右边表格数据
   * sourceFrom 默认传RFX，若BID页面，需要从外面传参
   */
  @Bind()
  fetchQuotationDetailData(params = {}) {
    const {
      dispatch,
      rfxId,
      sourceFrom = 'RFX',
      pubRouterAddParams = () => {},
      remote,
    } = this.props;
    const { activeKey = undefined, ...otherParams } = params;
    const { quotationActiveItemId = undefined } = this.state;
    if (activeKey) {
      this.setState({
        quotationActiveItemId: activeKey,
      });
    }
    const extraParams = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_PROCESS_EXTRA_PARAMS',
          {
            sourceFrom,
            sourceHeaderId: rfxId,
            sourceLineItemId: activeKey || quotationActiveItemId,
            ...otherParams,
            ...pubRouterAddParams(),
          },
          {
            bidFlag: this.sourceKey === BID,
            that: this,
          }
        )
      : {
          sourceFrom,
          sourceHeaderId: rfxId,
          sourceLineItemId: activeKey || quotationActiveItemId,
          ...otherParams,
          ...pubRouterAddParams(),
        };
    dispatch({
      type: 'priceComparison/fetchQuotationDetailData',
      payload: {
        ...extraParams,
      },
    }).then((res) => {
      if (res && !res.failed) {
        if (remote?.event) {
          remote.event.fireEvent('setColumnSelected', {
            that: this,
            quotationDetailRef: this.quotationDetailRef,
            params,
          });
        }
        this.quotationDetailRef.setState({
          // columnSelected: res[0]?.supQuotationDetails?.[0]?.quotationColumns?.map(
          //   (item) => item.quotationColumnId
          // ),
          supplierSelected: res?.[0]?.children?.[0]?.supQuotationDetails?.[0]?.quotationColumns?.[0]?.supQuoColumnAttrs?.map(
            (item) => item.quotationHeaderId
          ),
        });
      }
    });
  }

  /**
   * 点击tab，查询表格数据以及筛选框数据
   */
  @Bind()
  fetchQuotationDetailTable(params) {
    // 查询筛选框数据
    this.fetchQuotationDetailFilter(params);
    // 查询右侧表格数据
    this.fetchQuotationDetailData(params);
  }

  /**
   * 查询报价明细数据
   */
  @Bind()
  fetchQuotationDetail() {
    const { remote, rfxId } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('fetchQuotationDetailContrast', {
        rfxHeaderId: rfxId,
        fetchQuotationDetailSideMenu: this.fetchQuotationDetailSideMenu,
        current: this,
      });
    } else {
      // 查询报价明细侧边物料
      this.fetchQuotationDetailSideMenu();
    }
  }

  /**
   * 查询本次报价过程、历史价格分析侧边导航栏
   */
  @Bind()
  fetchSideBarMenu() {
    const { dispatch, rfxId, pubRouterAddParams = () => {} } = this.props;
    dispatch({
      type: 'priceComparison/fetchSideBarMenu',
      payload: {
        rfxHeaderId: rfxId,
        ...pubRouterAddParams(),
      },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.setState({
          activeItemName: `${res[0].concatName}`,
          activeRfxLineItemId: res[0] && res[0].rfxLineItemId,
          activeItemId: res[0] && res[0].itemId,
        });
      }
      this.setState({ allDataLoading: false });
    });
  }

  /**
   * 查询最新报价数据
   */
  @Bind()
  async fetchLatestQuotation() {
    const { dispatch, rfxId, organizationId, pubRouterAddParams = () => {}, remote } = this.props;
    await dispatch({
      type: 'priceComparison/fetchLatestQuotation',
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
        queryModel: 'latestOffer',
        ...pubRouterAddParams(),
      },
    });

    if (remote?.event) {
      await remote.event.fireEvent('fetchLatestQuotationRemoteAfter', {
        that: this,
      });
    }
  }

  /**
   * 设置最新报价-柱状图版数据
   */
  @Bind()
  setLatestQuotationChartData() {
    const {
      priceComparison: { latestQuotationList = [] },
      remote,
    } = this.props;
    const { doubleUnitFlag } = this.state;

    const setChartData = [];
    if (latestQuotationList && latestQuotationList.length > 0) {
      latestQuotationList.forEach((item, index) => {
        if (latestQuotationList.length !== index + 1) {
          setChartData.push(item);
        }
      });
    }
    let info = [];
    if (setChartData && setChartData.length > 0) {
      setChartData.forEach((item) => {
        const { itemCode, itemName, rfxLineItemNum, supplierQuotationPriceList } = item;
        const supplierInfo = {};
        supplierInfo.itemName = remote
          ? remote.process(
              'srm-front-ssrc/priceComparison_PROCESS_ITEM_NAME',
              itemCode
                ? `${itemCode} ${itemName}(${rfxLineItemNum})`
                : `${itemName}(${rfxLineItemNum})`,
              {
                bidFlag: this.sourceKey === BID,
                item,
                that: this,
              }
            )
          : itemCode
          ? `${itemCode} ${itemName}(${rfxLineItemNum})`
          : `${itemName}(${rfxLineItemNum})`;
        if (supplierQuotationPriceList && supplierQuotationPriceList.length > 0) {
          supplierQuotationPriceList.forEach((sItem) => {
            supplierInfo.name = sItem.supplierCompanyName;
            supplierInfo.price = doubleUnitFlag
              ? sItem.validQuotationSecPrice
              : sItem.validQuotationPrice;
            info = [...info, { ...supplierInfo }];
          });
        }
      });
    }
    const filterInfo =
      info &&
      info.filter((val) => {
        return val.price !== null;
      });
    const supplierName = filterInfo && filterInfo.map((item) => item.name);
    const itemNameArr = info && info.map((item) => item.itemName);

    const temp = Array.from(new Set(supplierName));
    const scoendData = [];
    let itemPrice = [];

    if (temp && temp.length > 0) {
      temp.forEach((item) => {
        const obj = {};
        obj.name = item;
        info.forEach((scoendItem) => {
          if (item === scoendItem.name) {
            obj[`${scoendItem.itemName}`] = scoendItem.price;
            itemPrice = [...itemPrice, { [item.itemName]: item.price }];
          }
        });
        scoendData.push(obj);
      });
    }
    this.setState({
      latestQuotationChartList: scoendData,
      latestQuotationChartXList: itemNameArr,
    });
  }

  getCurrentHeaderData = () => {
    return this.rfxHeaderData || {};
  };

  getBiddingHall = () => {
    const { biddingFlag, sourceCategory } = this.getCurrentHeaderData();

    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    return newBiddingFlag;
  };

  // 日式
  japanBiddingTotalPrice = () => {
    const { biddingMode } = this.getCurrentHeaderData();
    const flag =
      biddingMode === 'JAPANESE_BIDDING' && this.getTotalPriceFlag() && this.getBiddingHall();

    return flag;
  };

  // 荷兰式
  dutchBiddingTotalPrice = () => {
    const { biddingMode } = this.getCurrentHeaderData();
    const flag =
      biddingMode === 'DUTCH_BIDDING' && this.getTotalPriceFlag() && this.getBiddingHall();

    return flag;
  };

  getTotalPriceFlag = () => {
    const { biddingTarget } = this.getCurrentHeaderData();

    const flag = biddingTarget === 'TOTAL_PRICE';

    return flag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  japOrDutchBiddingTotalPrice = () => {
    const flag = this.japanBiddingTotalPrice() || this.dutchBiddingTotalPrice();

    return flag;
  };

  /**
   * 改变最新报价-柱形版、表格版
   */
  @Bind()
  changeLatestQuotationType(type) {
    this.setState({ latestQuotationType: type });
    if (type === 'chart') this.setLatestQuotationChartData();
  }

  /**
   * 获取比价助手ref
   */
  @Bind()
  handlePriceComparisonRef(ref = {}) {
    this.priceComparisonRef = ref;
  }

  /**
   * 获取报价明细ref
   */
  @Bind()
  handleQuotationDetailRef(ref = {}) {
    this.quotationDetailRef = ref;
  }

  /**
   * 获取本次报价过程ref
   */
  @Bind()
  handleThisQuoteProcessRef(ref = {}) {
    this.thisQuoteProcessRef = ref;
  }

  /**
   * 获取历史价格分析ref
   */
  @Bind()
  handleHistoryPriceAnalysisRef(ref = {}) {
    this.historyPriceAnalysisRef = ref;
  }

  /**
   * 查询本次报价过程物料表格
   */
  @Bind()
  fetchThisQuoteProcessTable(rfxLineItemId = undefined, page = {}, filters, sorter) {
    const { dispatch, pubRouterAddParams = () => {} } = this.props;
    dispatch({
      type: 'priceComparison/fetchThisQuoteProcessTable',
      payload: {
        page,
        rfxLineItemId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.PRICE_COMPARISON.THIS_QUOTATION`,
        orderType: sorter && sorter.field,
        orderFlag: sorter && sorter.order === 'descend' ? 1 : null,
        ...pubRouterAddParams(),
      },
    });
  }

  /**
   * 本次报价过程图表数据数据源处理
   */
  @Bind()
  setThisQuoteProcessChart(data = []) {
    const { doubleUnitFlag } = this.state;
    const quotationDateList = [];
    const allQuotationLine = [];
    const dataSource =
      data &&
      data.map((item) => {
        const { supplierItemDTOList = [], ...others } = item;
        let dataSourceItem = {};
        supplierItemDTOList.forEach((ele) => {
          const {
            quotationDate,
            quotationPrice = null,
            quotationSecondaryPrice = null,
            ...otherElement
          } = ele;
          dataSourceItem = {
            ...dataSourceItem,
            ...otherElement,
            [quotationDate]: doubleUnitFlag ? quotationSecondaryPrice : quotationPrice,
            quotationSecondaryPrice,
          };
          allQuotationLine.push({ ...others, ...ele });
          quotationDateList.push(quotationDate);
        });
        return {
          ...dataSourceItem,
          name: item.supplierCompanyName,
        };
      });
    this.setState({
      thisQuoteProcessChartList: dataSource,
      allQuotationLine,
      thisQuoteProcessChartXList: [...new Set(quotationDateList)],
    });
  }

  /**
   * 本次报价过程总价图表数据数据源处理
   */
  @Bind()
  setThisQuoteTotalChart(data = []) {
    const { remote } = this.props;
    if (isEmpty(data)) return;
    const thisQuoteTotalChartXList = [];
    const thisQuoteTotalChartList = []; // 传给图标的数据
    const thisQuoteTotalChartListMap = {}; // 先把遍历数据放到这个map中

    // 先找出次数最多的
    const sortData = data?.sort(
      (a, b) => b.supplierItemDTOList?.length - a.supplierItemDTOList?.length
    );
    const maxLength = sortData[0].supplierItemDTOList?.length;

    sortData.forEach((item) => {
      thisQuoteTotalChartXList.push(item.supplierCompanyName);
      if (maxLength > 0) {
        const sortSupplierItemDTOList = item.supplierItemDTOList.sort((a, b) =>
          a?.quotationDate > b?.quotationDate ? 1 : -1
        );
        for (let index = 0; index < maxLength; index++) {
          const element = sortSupplierItemDTOList[index];
          const name = `${intl.get('ssrc.priceComparison.view.message.first').d('第')}${
            Number(index) + 1
          }${intl.get('ssrc.priceComparison.view.message.times').d('次报价')}`;
          if (thisQuoteTotalChartListMap[name]) {
            thisQuoteTotalChartListMap[name] = [
              ...(thisQuoteTotalChartListMap[name] || []),
              element?.totalQuotationAmount || null,
            ];
          } else {
            thisQuoteTotalChartListMap[name] = [element?.totalQuotationAmount];
          }
        }
      }
    });
    // 得到的map数据重组
    for (const key in thisQuoteTotalChartListMap) {
      if (Object.hasOwnProperty.call(thisQuoteTotalChartListMap, key)) {
        thisQuoteTotalChartList.push({ name: key, data: thisQuoteTotalChartListMap[key] });
      }
    }

    const chartObj = {
      thisQuoteTotalChartList,
      thisQuoteTotalChartXList,
    };

    const remoteObj = remote
      ? remote.process('ssrc/priceComparison_PROCESS_THIS_QUOTE_PROCESS_CHART_DATA', chartObj, {
          data,
          bidFlag: this.sourceKey === BID,
        })
      : chartObj;

    this.setState({
      ...remoteObj,
    });
  }

  /**
   * 本次报价过程物料图表
   * @param {Object} fields 查询字段
   */
  @Bind()
  fetchThisQuoteProcessChart(rfxLineItemId = undefined) {
    const { dispatch, pubRouterAddParams = () => {} } = this.props;
    dispatch({
      type: 'priceComparison/fetchThisQuoteProcessChart',
      payload: {
        rfxLineItemId,
        ...pubRouterAddParams(),
      },
    }).then((result) => {
      if (result) {
        // 执行本次报价过程数据转换
        this.setThisQuoteProcessChart(result);
      }
    });
  }

  /**
   * 查询本次报价过程总价图表
   */
  @Bind()
  fetchThisQuoteTotalChart() {
    const { dispatch, rfxId, pubRouterAddParams = () => {}, remote } = this.props;
    dispatch({
      type: 'priceComparison/fetchThisQuoteTotalChart',
      payload: {
        rfxHeaderId: rfxId,
        ...pubRouterAddParams(),
      },
    }).then((result) => {
      if (result && !result.failed) {
        // 执行本次报价过程数据转换
        this.setThisQuoteTotalChart(result);
        if (remote?.event) {
          remote.event.fireEvent('setThisQuoteTotalChart', {
            data: result,
            that: this,
          });
        }
      }
    });
  }

  /**
   * 查询本次报价过程总价表格
   */
  @Bind()
  fetchThisQuoteTotalTable(page) {
    const { dispatch, rfxId, pubRouterAddParams = () => {} } = this.props;
    dispatch({
      type: 'priceComparison/fetchThisQuoteTotalTable',
      payload: {
        page,
        rfxHeaderId: rfxId,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.PRICE_COMPARISON.THIS_QUOTATION_TOTAL`,
        ...pubRouterAddParams(),
      },
    });
  }

  /**
   * 查询本次报价过程数据
   */
  @Bind()
  fetchThisQuoteProcess() {
    const { activeRfxLineItemId = '-1' } = this.state;

    // 查询本次报价过程物料表
    this.fetchThisQuoteProcessTable(activeRfxLineItemId);
    // 查询本次报价过程物料图表
    this.fetchThisQuoteProcessChart(activeRfxLineItemId);
    // 查询本次报价过程总价图表
    this.fetchThisQuoteTotalChart();
    // 查询本次报价过程总价表格
    this.fetchThisQuoteTotalTable();
  }

  /**
   * 选择物品回调-物品搜索框
   */
  @Bind()
  handleSelectItemOk(value) {
    const { rfxLineItemId, concatName, itemId } = value;
    const { activityTab, dateFlag } = this.state;
    if (activityTab === 'thisQuoteProcess') {
      // 本次报价过程
      this.fetchThisQuoteProcessTable(rfxLineItemId);
      this.fetchThisQuoteProcessChart(rfxLineItemId);
    } else if (activityTab === 'historyPriceAnalysis') {
      // 查询历史价格分析图表
      this.fetchHistoryPriceAnalysisChart({ dateFlag, itemId, rfxLineItemId });
      // 查询历史价格分析相似物品最低价一览
      this.fetchHistoryPriceAnalysisTable(itemId);
    }
    this.setState({
      activeItemName: concatName,
      activeRfxLineItemId: rfxLineItemId,
      activeItemId: itemId,
    });
  }

  /**
   * 选择物品回调-侧边栏
   */
  @Throttle(1200)
  @Bind()
  handleClickItemBar(rfxLineItemId, itemId, item) {
    const { activityTab, dateFlag } = this.state;
    if (activityTab === 'thisQuoteProcess') {
      const { itemValue = undefined } = this.thisQuoteProcessRef.state;
      if (itemValue || itemValue === 0) {
        this.thisQuoteProcessRef.setState({
          itemValue: undefined,
          itemList: [],
        });
      }
      // 本次报价过程
      this.fetchThisQuoteProcessTable(rfxLineItemId);
      this.fetchThisQuoteProcessChart(rfxLineItemId);
    } else if (activityTab === 'historyPriceAnalysis') {
      const { itemValue = undefined } = this.historyPriceAnalysisRef.state;
      if (itemValue || itemValue === 0) {
        this.historyPriceAnalysisRef.setState({
          itemValue: undefined,
          itemList: [],
        });
      }
      // 查询历史价格分析图表
      this.fetchHistoryPriceAnalysisChart({ dateFlag, itemId, rfxLineItemId });
      // 查询历史价格分析相似物品最低价一览
      this.fetchHistoryPriceAnalysisTable(itemId);
    }
    this.setState({
      activeItemName: item.concatName,
      activeRfxLineItemId: rfxLineItemId,
      activeItemId: itemId,
    });
  }

  /**
   * 查询历史价格分析图表
   */
  @Bind()
  fetchHistoryPriceAnalysisChart(params = {}) {
    const { taxPriceFlag } = this.state;
    const { dispatch, pubRouterAddParams = () => {}, remote } = this.props;
    const { dateFlag, itemId = undefined, rfxLineItemId = undefined } = params;
    dispatch({
      type: 'priceComparison/fetchHistoryPriceAnalysisChart',
      payload: {
        itemId,
        dateFlag,
        taxPriceFlag,
        sourceLineItemId: rfxLineItemId,
        ...pubRouterAddParams(),
      },
    }).then((res) => {
      if (res) {
        if (remote?.event) {
          remote.event.fireEvent('setHisPriceChart', {
            data: res,
            that: this,
          });
        }
      }
    });
  }

  /**
   * 查询历史价格分析-相似物品最低一览表
   */
  @Bind()
  fetchHistoryPriceAnalysisTable(itemId = undefined, page = {}) {
    const { dispatch, pubRouterAddParams = () => {} } = this.props;
    dispatch({
      type: 'priceComparison/fetchHistoryPriceAnalysisTable',
      payload: {
        page,
        itemId,
        ...pubRouterAddParams(),
      },
    });
  }

  /**
   * 查询历史价格分析数据
   */
  @Bind()
  async fetchHistoryPriceAnalysis() {
    const { dateFlag, activeItemId, activeRfxLineItemId } = this.state;
    const {
      priceComparison: {
        priceComparisonHeader: { benchmarkPriceType },
      },
      remote,
    } = this.props;

    const historyPriceType = await fetchHistoryAnalysisUserConfig({
      configKey: 'historyPriceType',
    });
    this.setState(
      {
        taxPriceFlag: remote
          ? remote.process(
              'srm-front-ssrc/priceComparison_PROCESS_HIS_PRICE_SWITCH',
              (historyPriceType?.configValue || benchmarkPriceType) === 'TAX_INCLUDED_PRICE'
                ? 1
                : 0,
              {
                bidFlag: this.sourceKey === BID,
              }
            )
          : (historyPriceType?.configValue || benchmarkPriceType) === 'TAX_INCLUDED_PRICE'
          ? 1
          : 0,
      },
      () => {
        // 查询历史价格分析图表
        this.fetchHistoryPriceAnalysisChart({
          dateFlag,
          itemId: activeItemId,
          rfxLineItemId: activeRfxLineItemId,
        });
      }
    );
    // 查询历史价格分析相似物品最低价一览
    this.fetchHistoryPriceAnalysisTable(activeItemId);
  }

  /**
   * 历史价格分析列表-time
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleClickTimeBtn(dateFlag) {
    const { activeItemId, activeRfxLineItemId } = this.state;
    this.fetchHistoryPriceAnalysisChart({
      dateFlag,
      itemId: activeItemId,
      rfxLineItemId: activeRfxLineItemId,
    });
    this.setState({
      dateFlag,
    });
  }

  /**
   * 点击按钮组，查询数据
   */
  @Bind()
  fetchData(type) {
    this.setState({ activityTab: type });
    switch (type) {
      case 'priceComparison':
        this.fetchPriceComparison();
        break;
      case 'quotationDetail':
        this.fetchQuotationDetail();
        break;
      case 'latestQuotation':
        this.fetchLatestQuotation();
        break;
      case 'thisQuoteProcess':
        this.fetchThisQuoteProcess();
        break;
      case 'historyPriceAnalysis':
        this.fetchHistoryPriceAnalysis();
        break;
      default:
        break;
    }
  }

  /**
   * 比价助手-报价明细-导出
   */
  @Bind()
  exportQuotationDetail(type) {
    const { dispatch, rfxId, sourceFrom = 'RFX', remote } = this.props;
    const { quotationActiveItemId } = this.state;
    const {
      state: { supplierSelected = [] },
    } = this.quotationDetailRef;

    const download = (params) => {
      if (!urlReg.test(params)) {
        const result = JSON.parse(params);
        return getResponse(result);
      }
      if (params) {
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = params;
        tempLink.setAttribute(
          'download',
          decodeURIComponent(
            `${intl
              .get('ssrc.priceComparison.model.comparison.quotaDetailExport')
              .d('报价明细导出')}.xls`
          )
        );
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    };

    const getExport = () => {
      const params = {
        sourceFrom,
        sourceHeaderId: rfxId,
        sourceLineItemId: quotationActiveItemId,
        // quotationColumnIds: columnSelected,
        quotationHeaderIds: supplierSelected,
        type,
      };
      dispatch({
        type: 'priceComparison/exportQuotationDetail',
        payload: remote
          ? remote.process(
              'srm-front-ssrc/priceComparison_PROCESS_QUOTATION_DETAIL_EXPORT_PARAMS',
              params,
              {
                quotationDetailRef: this.quotationDetailRef,
                bidFlag: this.sourceKey === BID,
              }
            )
          : params,
      }).then((res) => {
        download(res);
      });
    };

    if (remote?.event) {
      remote.event.fireEvent('getRemoteExport', {
        getExport,
        download,
        rfxId,
        quotationActiveItemId,
        supplierSelected,
        type,
        sourceFrom,
        current: this,
      });
    } else {
      getExport();
    }
  }

  /*
   * 比价助手-最新报价-导出
   */
  @Bind()
  exportLatestOffer() {
    const { dispatch, rfxId } = this.props;
    dispatch({
      type: 'priceComparison/exportLatestOffer',
      payload: { rfxHeaderId: rfxId },
    }).then((res) => {
      if (res) {
        const errReg = /(error)+|(failed)+/g; // 错误字符
        const matchError = typeof res === 'string' && errReg.test(res);
        if (matchError) {
          let newRes = JSON.parse(res);
          newRes = getResponse(newRes);
          if (!newRes) {
            return;
          }
        }

        const name =
          res?.indexOf('pdf') !== -1
            ? `${intl
                .get('ssrc.priceComparison.model.comparison.latestQuoExport')
                .d('最新报价导出')}.pdf`
            : `${intl
                .get('ssrc.priceComparison.model.comparison.latestQuoExport')
                .d('最新报价导出')}.xls`;
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = res;
        tempLink.setAttribute('download', decodeURIComponent(name));
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    });
  }

  /**
   * 比价助手-导出
   */
  @Bind()
  exportPriceComparison(e) {
    const { dispatch, rfxId } = this.props;
    const { firstFlag = 1 } = this.state;
    const {
      state: { itemSelected = [], supplierSelected = [] },
    } = this.priceComparisonRef;
    const { key } = e;
    const downloadName =
      key === 'pdf' || key === 'pdfAll'
        ? `${intl.get('ssrc.inquiryHall.view.message.exportPriceComparison').d('比价助手')}.pdf`
        : `${intl.get('ssrc.inquiryHall.view.message.exportPriceComparison').d('比价助手')}.xls`;
    const payload =
      key === 'pdf' || key === 'excel'
        ? {
            key,
            rfxHeaderId: rfxId,
            quotationHeaderIdList: supplierSelected,
            rfxLineItemIdList: itemSelected,
            firstFlag,
          }
        : {
            key,
            rfxHeaderId: rfxId,
            firstFlag: 0,
          };
    dispatch({
      type: 'priceComparison/exportPriceComparison',
      payload,
    }).then((url) => {
      if (url) {
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = url;
        tempLink.setAttribute('download', decodeURIComponent(downloadName));
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    });
  }

  /**
   * 比价助手-查询配置项
   */
  @Bind()
  fetchPriceComparisonConfigs(params = {}) {
    const { dispatch, rfxId } = this.props;
    return dispatch({
      type: 'priceComparison/fetchPriceComparisonConfigs',
      payload: {
        ...params,
        rfxHeaderId: rfxId,
      },
    });
  }

  /**
   * 比价助手-保存配置项
   */
  @Bind()
  savePriceComparisonConfig(params = {}) {
    const {
      dispatch,
      rfxId,
      priceComparison: { priceComparisonConfigs = {} },
    } = this.props;
    const {
      hideModal,
      state: { itemSelected = [], supplierSelected = [] },
    } = this.priceComparisonRef;
    // 动态配置项对应的需要关闭弹框的值
    const dynamicConfigTypes = {
      QUOTATION: 'itemConfig', // 报价信息
      ITEM: 'materialConfig', // 物料信息
      SUPPLIER: 'supplierConfig', // 供应商信息
    };
    dispatch({
      type: 'priceComparison/savePriceComparisonConfig',
      payload: {
        ...params,
        rfxHeaderId: rfxId,
        configId: priceComparisonConfigs.configId,
        objectVersionNumber: priceComparisonConfigs.objectVersionNumber,
      },
    }).then((res) => {
      if (res) {
        if (params.configType === 'QUOTATION' || params.configType === 'ITEM') {
          this.fetchPriceComparisonItem({
            quotationHeaderIdList: supplierSelected,
            rfxLineItemIdList: itemSelected,
            firstFlag: 0,
          });
          hideModal(dynamicConfigTypes[params.configType]);
          this.setFirstFlag();
        } else {
          this.fetchPriceComparisonSupplier({
            rfxLineItemIdList: itemSelected,
            quotationHeaderIdList: supplierSelected,
            firstFlag: 0,
          });
          hideModal(dynamicConfigTypes[params.configType]);
          this.setFirstFlag();
        }
      }
    });
  }

  /**
   * Switch是否含税价
   */
  @Bind()
  changeTaxFlag(taxPriceFlag) {
    const { activeItemId, dateFlag, activeRfxLineItemId } = this.state;
    this.setState({ taxPriceFlag }, () => {
      this.fetchHistoryPriceAnalysisChart({
        dateFlag,
        itemId: activeItemId,
        taxPriceFlag,
        flag: true,
        rfxLineItemId: activeRfxLineItemId,
      });
    });
  }

  /**
   * 本次报价过程导出
   * @param {String} type 类型
   */
  @Bind()
  exportThisQuoteProcess(type) {
    const { activeRfxLineItemId = undefined } = this.state;
    const { dispatch, rfxId } = this.props;
    dispatch({
      type: 'priceComparison/exportThisQuoteProcess',
      payload: {
        rfxHeaderId: rfxId,
        rfxLineItemId: activeRfxLineItemId,
        type,
        customizeUnitCode: `SSRC.${this.sourceKey}_HALL.PRICE_COMPARISON.THIS_QUOTATION_TOTAL`,
      },
    }).then((res) => {
      if (res) {
        const name = `${intl
          .get('ssrc.priceComparison.model.comparison.latestQuoExport')
          .d('本次报价过程导出')}.xls`;
        // 创建a标签，用于跳转至下载链接
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = res;
        tempLink.setAttribute('download', decodeURIComponent(name));
        // 兼容：某些浏览器不支持HTML5的download属性
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }
        // 挂载a标签
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    });
  }

  // 获取按钮
  getButtons() {
    const {
      // eslint-disable-next-line no-shadow
      remote,
      rfxId,
      exportPriceComparisonLoading = false,
      priceComparison: { priceComparisonItemList = [], priceComparisonSupplierList = [] },
    } = this.props;
    const { IsShowPrintButton = false } = this.state;
    return remote.process(
      'priceCompareButtons',
      [
        !IsShowPrintButton && {
          name: 'dropdownBtnList',
          group: true,
          // 按钮组显示内容
          child: (
            <Button
              type="primary"
              // style={{ float: 'right' }}
              loading={exportPriceComparisonLoading}
              disabled={
                (!isEmpty(priceComparisonSupplierList) &&
                  isEmpty(priceComparisonSupplierList[0]?.supplierList)) ||
                isEmpty(priceComparisonItemList) ||
                (!isEmpty(priceComparisonItemList) &&
                  isEmpty(priceComparisonItemList[0]?.quotationInfoList))
              }
            >
              <Icon type="down" />
              {intl.get('hzero.common.button.export').d('导出')}
            </Button>
          ),
          children:
            (!isEmpty(priceComparisonSupplierList) &&
              isEmpty(priceComparisonSupplierList[0]?.supplierList)) ||
            isEmpty(priceComparisonItemList) ||
            (!isEmpty(priceComparisonItemList) &&
              isEmpty(priceComparisonItemList[0]?.quotationInfoList))
              ? []
              : [
                  // 按钮组下拉列表内容
                  {
                    name: 'pdf',
                    child: intl
                      .get('ssrc.priceComparison.view.button.exportPdfCurrent')
                      .d('PDF(当前页)'),
                    btnProps: {
                      onClick: () => this.exportPriceComparison({ key: 'pdf' }),
                    },
                  },
                  {
                    name: 'pdfAll',
                    child: intl.get('ssrc.priceComparison.view.button.exportPdfAll').d('PDF(所有)'),
                    btnProps: {
                      onClick: () => this.exportPriceComparison({ key: 'pdfAll' }),
                    },
                  },
                  {
                    name: 'excel',
                    child: intl
                      .get('ssrc.priceComparison.view.button.exportExcelCurrent')
                      .d('EXCEL(当前页)'),
                    btnProps: {
                      onClick: () => this.exportPriceComparison({ key: 'excel' }),
                    },
                  },
                  {
                    name: 'excelAll',
                    child: intl
                      .get('ssrc.priceComparison.view.button.exportExcelAll')
                      .d('EXCEL(所有)'),
                    btnProps: {
                      onClick: () => this.exportPriceComparison({ key: 'excelAll' }),
                    },
                  },
                ],
        },
        IsShowPrintButton && {
          name: 'excelExport',
          btnComp: PrintProButton,
          btnProps: {
            buttonProps: {},
            buttonText: intl
              .get('ssrc.priceComparison.view.button.exportExcelNew')
              .d('导出excel(新)'),
            requestUrl: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/quotation/price-compare-assistant/print-excel/token`,
            method: 'GET',
            outType: 'EXCEL',
            params: {
              rfxHeaderId: rfxId,
            },
          },
        },
      ].filter(Boolean),
      {
        rfxId,
        IsShowPrintButton,
        disabledFlag:
          (!isEmpty(priceComparisonSupplierList) &&
            isEmpty(priceComparisonSupplierList[0]?.supplierList)) ||
          isEmpty(priceComparisonItemList) ||
          (!isEmpty(priceComparisonItemList) &&
            isEmpty(priceComparisonItemList[0]?.quotationInfoList)),
        sourceKey: this.sourceKey,
        priceComparisonRef: this.priceComparisonRef,
        state: this.state,
      }
    );
  }

  // 获取
  getQuotationDetailButtons() {
    const {
      exportQuotationDetailLoading = false,
      remote,
      rfxId,
      priceComparison: { quotationDetailSideMenu = [], quotationDetailData = [] },
    } = this.props;
    const disabledFlag = remote
      ? remote.process(
          'srm-front-ssrc/priceComparison_PROCESS_EXPORT_BTN_DISABLED',
          isEmpty(quotationDetailData) || quotationDetailData.every((i) => !i.childrenExist),
          {
            current: this,
          }
        )
      : isEmpty(quotationDetailData) || quotationDetailData.every((i) => !i.childrenExist);
    const buttons = [
      {
        name: 'dropdownBtnList',
        group: true,
        // 按钮组显示内容
        child: (
          <Button type="primary" loading={exportQuotationDetailLoading} disabled={disabledFlag}>
            <Icon type="down" />
            {intl.get('hzero.common.button.export').d('导出')}
          </Button>
        ),
        children: disabledFlag
          ? []
          : [
              // 按钮组下拉列表内容
              {
                name: 'excel',
                child: 'EXCEL',
                btnProps: {
                  onClick: () => this.exportQuotationDetail('excel'),
                },
              },
              {
                name: 'pdf',
                child: 'PDF',
                btnProps: {
                  onClick: () => this.exportQuotationDetail('pdf'),
                },
              },
            ],
      },
    ];
    const buttonProps = {
      rfxId,
      that: this,
      sideMenu: quotationDetailSideMenu,
    };
    return remote
      ? remote.process('PRICE_COMPARISON_PROCESS_QUOTATION_DETAIL_BUTTONS', buttons, buttonProps)
      : buttons;
  }

  renderPriceComparisonTab(priceComparisonProps = {}) {
    // eslint-disable-next-line no-shadow
    const { remote } = this.props;
    const { activityTab } = this.state;
    return (
      activityTab === 'priceComparison' &&
      remote.render(
        'renderPriceComparisonTab',
        <PriceComparisonTab {...priceComparisonProps} />,
        priceComparisonProps
      )
    );
  }

  renderThisQuoteProcessTab = (thisQuoteProcessProps = {}) => {
    const { activityTab = null } = this.state;
    return activityTab === 'thisQuoteProcess' ? (
      <ThisQuoteProcessTab {...thisQuoteProcessProps} />
    ) : null;
  };

  renderThisBiddingProcessTab = (props) => {
    const { activityTab = null } = this.state;

    return activityTab === 'thisBiddingProcess' ? <ThisBiddingProcessTab {...props} /> : null;
  };

  // @override 追觅
  renderQuotationDetailTab(quotationDetailProps) {
    // eslint-disable-next-line no-shadow
    const { remote } = this.props;
    return remote.render(
      'renderQuotationDetailTab',
      <QuotationDetailTab {...quotationDetailProps} />,
      quotationDetailProps
    );
  }

  // 查询配置表 确定显示新的还是老的历史价格分析
  async fetchIsShowHistoryTabConfig() {
    const { rfxId, remote } = this.props;

    if (this.japOrDutchBiddingTotalPrice()) {
      return;
    }

    if (!rfxId) return;
    const configRes = getResponse(await fetchSubRelationConfig({ rfxHeaderId: rfxId }));
    if (configRes) {
      // subRelationDisplayFlag === 1; 展示替代料 0 不展示
      const subRelationDisplayFlag = configRes.subRelationDisplayFlag === 1;
      // 第一步：先判断显示新、老历史价格分析 subRelationNewFlag -0 老的 1-新的
      if (configRes.subRelationNewFlag === 0) {
        this.setState({
          subRelationDisplayFlag, // 是否展示替代料标识
        });
        return;
      }
      // 第二步：如果显示新的，则判断显示展示、不展示替代料
      // dataCode：data-931 展示替代料 data-931-all 不展示替代料
      const dataCode = subRelationDisplayFlag ? 'data-931' : 'data-931-all';
      fetchHistoryPriceUrl({ dataCode })
        .then((res) => {
          const result = getResponse(res);
          if (result && isArray(result) && result.length > 0) {
            this.setState({
              isNewHistoryAnalysisTab: true,
              historyAnalysisUrl: result[0].reportApi,
            });
          }
        })
        .catch((err) => err);
    }

    if (remote?.event) {
      remote.event.fireEvent('cuxHandleAfterFetchIsShowHistoryTabConfig', {
        that: this,
      });
    }
  }

  /**
   * 日式/荷兰 聚合表格
   * 数据处理
   * 详细逻辑可以参考japanDutchAggregationTableDS上边的数据注释
   * */
  handleRebuileAggregrationTableDataForDS = (param) => {
    const { start, end, leftScrollAppendFlag = 0 } = param || {};
    const { data } = this.japanDutchAggregationTableDs?.getState('currentTableCacheObj') || {};
    const { biddingRoundInfoDTOList = [] } = data || {};

    const { length } = biddingRoundInfoDTOList || [];

    if (!length) {
      return;
    }

    runInAction(() => {
      const { newData } = japanDutchAggregrationTableDataProcessing(data, { start, end });

      if (leftScrollAppendFlag) {
        this.japanDutchAggregationTableDs.appendData(newData);
      } else {
        this.japanDutchAggregationTableDs.loadData(newData);
      }
    });
  };

  /**
   * 日式/荷兰 聚合表格 query
   */
  japanDutchAggregrationQueryAndLoad = async () => {
    const { rfxId, pubRouterAddParams = () => {} } = this.props;

    idValidation(rfxId);

    this.japanDutchAggregationTableDs.setQueryParameter('commonProps', {
      rfxHeaderId: rfxId,
      organizationId: this.organizationId,
      currentPageSymbol: this.currentPageSymbol,
      biddingEndFlag: 1,
      biddingNotStartFlag: 0,
      biddingRoundEndQueryFlag: 1, // 竞价截止后查询日/荷兰数据
      ...pubRouterAddParams(),
    });

    const result = await this.japanDutchAggregationTableDs.query();

    const { biddingRoundInfoDTOList = [] } = result || {};

    const loadLength = 15; // 每次加载固定轮次

    this.japanDutchAggregationTableDs.setState(
      'acceptedSupplierCount',
      result?.acceptedSupplierCount || 0
    );

    this.japanDutchAggregationTableDs.setState('currentTableCacheObj', {
      data: result || {},
      currentEndRound: loadLength,
      allRound: biddingRoundInfoDTOList?.length,
    });

    this.handleRebuileAggregrationTableDataForDS({
      start: 0,
      end: loadLength,
    });
  };

  // @protect 知味轩
  @Bind()
  renderHistoryPriceAnalysisTab(historyPriceAnalysisProps) {
    const { historyAnalysisUrl, isNewHistoryAnalysisTab } = this.state;
    const {
      rfxId,
      remote,
      priceComparison: { sideBarMenuList = [] },
    } = this.props;
    const NewHistoryPriceAnalysisProps = {
      historyAnalysisUrl,
      rfxId,
    };
    const renderProps = {
      sourceKey: this.sourceKey,
      sideBarMenuList,
      rfxHeaderId: rfxId,
      bidFlag: this.sourceKey === BID,
      that: this,
    };
    return (
      remote &&
      remote.render(
        'PRICE_COMPARISON_RENDER_HISTORY_PRICEANALYSIS_TAB',
        isNewHistoryAnalysisTab ? (
          <NewHistoryPriceAnalysisTab {...NewHistoryPriceAnalysisProps} />
        ) : (
          <HistoryPriceAnalysisTab {...historyPriceAnalysisProps} />
        ),
        renderProps
      )
    );
  }

  // 最新报价tab页--华丽科技二开
  renderLatestQuotationTab(latestQuotationProps) {
    const { remote } = this.props;
    return remote.render(
      'PRICE_COMPARISON_RENDER_LATEST_QUOTATION_TAB',
      <LatestQuotationTab {...latestQuotationProps} />,
      latestQuotationProps
    );
  }

  // 最新报价导出按钮--华丽科技二开
  renderLatestQuotationExport({ exportLatestOfferLoading, latestQuotationList }) {
    const { remote, rfxId } = this.props;
    const exportButtonProps = {
      rfxId,
    };
    const buttons = [
      <Button
        loading={exportLatestOfferLoading}
        onClick={
          remote
            ? remote.process(
                'PRICE_COMPARISON_PROCESS_LATEST_QUOTATION_EXPORT_LATEST',
                this.exportLatestOffer,
                exportButtonProps
              )
            : this.exportLatestOffer
        }
        style={{ float: 'right' }}
        type="primary"
        disabled={isEmpty(latestQuotationList)}
      >
        {intl.get('hzero.common.button.export').d('导出')}
      </Button>,
    ];
    const buttonProps = {
      rfxId,
      exportLatestOfferLoading,
      latestQuotationList,
      that: this,
    };
    return remote
      ? remote.process('PRICE_COMPARISON_PROCESS_LATEST_QUOTATION_BUTTONS', buttons, buttonProps)
      : buttons;
  }

  // 比价助手tab页--久立二开，gipt
  getButtonTabs({ diyLadderQuotationFlag }) {
    const { showPriceComparison = true, remote } = this.props;
    const japanDutchTotalBidding = this.japOrDutchBiddingTotalPrice();

    let buttonTabs = [
      showPriceComparison
        ? {
            value: 'priceComparison',
            meaning: intl.get(`ssrc.priceComparison.view.button.priceComparison`).d('比价助手'),
          }
        : null,
      {
        value: 'quotationDetail',
        meaning: intl.get(`ssrc.priceComparison.view.button.quotationDetail`).d('报价明细对比'),
      },
      {
        value: 'latestQuotation',
        meaning: intl.get(`ssrc.priceComparison.view.button.latestQuotation`).d('最新报价'),
      },
      {
        value: 'thisQuoteProcess',
        meaning: intl.get(`ssrc.priceComparison.view.button.thisQuoteProcess`).d('本次报价过程'),
      },
      {
        value: 'historyPriceAnalysis',
        meaning: intl
          .get(`ssrc.priceComparison.view.button.historyPriceAnalysis`)
          .d('历史价格分析'),
      },
      !diyLadderQuotationFlag && {
        value: 'ladderQuotation',
        meaning: intl
          .get(`ssrc.priceComparison.view.button.ladderQuotationComparison`)
          .d('阶梯报价对比'),
      },
    ].filter(Boolean);

    // 针对竞价模式=日式/荷兰式，比价助手只展示本次竞价过程，展示的内容如下：
    if (japanDutchTotalBidding) {
      buttonTabs = [
        {
          value: 'thisBiddingProcess',
          meaning: intl
            .get(`ssrc.common.priceComparison.view.button.thisBiddingHallQuoteProcess`)
            .d('本次竞价过程'),
        },
        {
          value: 'thisQuoteProcess',
          meaning: intl.get(`ssrc.priceComparison.view.button.thisQuoteProcess`).d('本次报价过程'),
        },
      ];
    }

    return remote
      ? remote.process('srm-front-ssrc/priceComparison_PROCESS_MAIN_TAB_BUTTONS', buttonTabs, {
          bidFlag: this.sourceKey === BID,
          that: this,
        })
      : buttonTabs;
  }

  // 核价审批tab页-久立二开
  renderCheckPriceApprovalTab() {
    return null;
  }

  render() {
    const {
      history,
      location,
      visible = false,
      fetchPriceItemLoading,
      savingConfigLoading,
      fetchQuotationDetailLoading,
      fetchQuotationDetailDataLoading,
      fetchLatestLoading,
      customizeTable,
      fetchThisQuoteLoading,
      fetchThisQuoteTableLoading,
      fetchThisQuoteTotalLoading,
      fetchHistoryAnalysisLoading,
      fetchHistoryAnalysisTableLoading,
      exportLatestOfferLoading,
      exportThisQuoteProcessLoading,
      onHideModal,
      dispatch,
      remote,
      priceComparison,
      priceComparison: {
        latestQuotationList = [],
        sideBarMenuList = [],
        priceComparisonHeader = {},
        priceComparisonItemList = [],
        priceComparisonSupplierList = [],
        quotationDetailSideMenu = [],
        quotationDetailFilter = {},
        quotationDetailData = [],
        thisQuoteProcessTableList = [],
        thisQuoteProcessTablePagination = {},
        thisQuoteTotalTableList = [],
        thisQuoteTotalTablePagination = {},
        historyPriceAnalysisChartList = [],
        historyPriceAnalysisTableList = [],
        historyPriceAnalysisPagination = {},
        priceComparisonConfigs = {},
      },
      modal,
      sourceCategory,
      rfxId = '',
      customizeBtnGroup = noop,
      diyLadderQuotationFlag = 1,
      disabledAllLinkFlag = false,
      ...others
    } = this.props;

    const { code } = priceComparison || {};
    const { quoteData = [], supplierData = [], quotationCountData = [] } = code || {};

    const {
      activityTab = 'priceComparison',
      latestQuotationType = 'table',
      latestQuotationChartList = [],
      latestQuotationChartXList = [],
      activeItemName = undefined,
      activeRfxLineItemId = undefined,
      thisQuoteProcessChartList = [],
      thisQuoteTotalChartList = [],
      thisQuoteTotalChartXList = [],
      dateFlag = 'allTime',
      allDataLoading = true,
      taxPriceFlag,
      doubleUnitFlag = false,
      activeItemId,
      allQuotationLine = [],
      subRelationDisplayFlag,
      thisQuoteProcessChartXList = [],
      sslmLifeCycleFlag = true,
    } = this.state;
    const commonProps = {
      bidFlag: this.sourceKey === BID,
      baseInfoDs: this.baseInfoDs,
      japOrDutchBiddingTotalPrice: this.japOrDutchBiddingTotalPrice,
      japanDutchAggregationTableDs: this.japanDutchAggregationTableDs,
      currentPageSymbol: this.currentPageSymbol,
      rfxHeader: this.rfxHeaderData,
    };
    const priceComparisonProps = {
      ...commonProps,
      history,
      location,
      quoteData,
      onHideModal: onHideModal || (() => modal?.close()),
      supplierData,
      allDataLoading,
      quotationCountData,
      priceComparisonConfigs,
      doubleUnitFlag,
      remoteFunc: remote,
      loading: fetchPriceItemLoading,
      savingLoading: savingConfigLoading,
      header: priceComparisonHeader,
      itemList: priceComparisonItemList,
      supplierList: priceComparisonSupplierList,
      onRef: this.handlePriceComparisonRef,
      onFetchConfigs: this.fetchPriceComparisonConfigs,
      onSelectConfigOk: this.savePriceComparisonConfig,
      dispatch,
      disabledAllLinkFlag,
      sslmLifeCycleFlag,
    };
    const quotationDetailProps = {
      loading: fetchQuotationDetailLoading,
      tableLoading: fetchQuotationDetailDataLoading,
      filterData: quotationDetailFilter,
      sideMenu: quotationDetailSideMenu,
      dataSource: quotationDetailData,
      onRef: this.handleQuotationDetailRef,
      onChangeTab: this.fetchQuotationDetailTable,
      fetchQuotationDetailData: this.fetchQuotationDetailData.bind(this),
      remote,
      dispatch,
      rfxId,
      current: this,
      bidFlag: this.sourceKey === BID,
    };
    const latestQuotationProps = {
      rfxId,
      type: latestQuotationType,
      loading: fetchLatestLoading,
      dataSource: latestQuotationList,
      chartXList: latestQuotationChartXList,
      chartDataSource: latestQuotationChartList,
      onChangeType: this.changeLatestQuotationType,
      doubleUnitFlag,
      remote,
      sourceKey: this.sourceKey,
      state: this.state,
    };
    const thisQuoteProcessProps = {
      ...commonProps,
      activeItemName,
      sideBarMenuList,
      customizeTable,
      activeRfxLineItemId,
      sourceCategory,
      rfxId,
      sourceKey: this.sourceKey,
      loading: fetchThisQuoteLoading,
      tableLoading: fetchThisQuoteTableLoading,
      totalTableLoading: fetchThisQuoteTotalLoading,
      exportLoading: exportThisQuoteProcessLoading,
      tableList: thisQuoteProcessTableList,
      pagination: thisQuoteProcessTablePagination,
      allQuotationLine,
      chartDataSource: thisQuoteProcessChartList,
      totalTableList: thisQuoteTotalTableList,
      totalPagination: thisQuoteTotalTablePagination,
      totalChartDataSource: thisQuoteTotalChartList,
      totalChartXList: thisQuoteTotalChartXList,
      onRef: this.handleThisQuoteProcessRef,
      onSelectItemOk: this.handleSelectItemOk,
      onClickItemBar: this.handleClickItemBar,
      onChangeTable: this.fetchThisQuoteProcessTable,
      onChangeTotalTable: this.fetchThisQuoteTotalTable,
      onExportThisQuoteProcess: this.exportThisQuoteProcess,
      doubleUnitFlag,
      priceComparisonHeader,
      chartXList: thisQuoteProcessChartXList,
      remote,
      state: this.state,
      handleRebuileAggregrationTableDataForDS: this.handleRebuileAggregrationTableDataForDS,
    };
    const historyPriceAnalysisProps = {
      rfxHeaderId: rfxId,
      dateFlag,
      activeItemName,
      sideBarMenuList,
      activeItemId,
      activeRfxLineItemId,
      loading: fetchHistoryAnalysisLoading,
      tableLoading: fetchHistoryAnalysisTableLoading,
      tableList: historyPriceAnalysisTableList,
      pagination: historyPriceAnalysisPagination,
      chartDataSource: historyPriceAnalysisChartList,
      onRef: this.handleHistoryPriceAnalysisRef,
      onClickTimeBtn: this.handleClickTimeBtn,
      onClickItemBar: this.handleClickItemBar,
      onSelectItemOk: this.handleSelectItemOk,
      onChangePagination: this.fetchHistoryPriceAnalysisTable,
      onChangeTaxFlag: this.changeTaxFlag,
      taxPriceFlag,
      doubleUnitFlag,
      remote,
      sourceKey: this.sourceKey,
      subRelationDisplayFlag,
      state: this.state,
    };
    const ladderQuotationProps = {
      sideBarMenuList,
      rfxLineItemId: sideBarMenuList?.[0]?.rfxLineItemId,
      doubleUnitFlag,
      rfxId,
      priceComparisonHeader,
      remote,
    };
    const tabList = [
      this.renderPriceComparisonTab(priceComparisonProps),
      activityTab === 'quotationDetail' && this.renderQuotationDetailTab(quotationDetailProps),
      activityTab === 'latestQuotation' && this.renderLatestQuotationTab(latestQuotationProps),
      this.renderThisQuoteProcessTab(thisQuoteProcessProps),
      this.renderThisBiddingProcessTab(thisQuoteProcessProps),
      activityTab === 'historyPriceAnalysis' &&
        this.renderHistoryPriceAnalysisTab(historyPriceAnalysisProps),
      !diyLadderQuotationFlag &&
        activityTab === 'ladderQuotation' &&
        (remote ? (
          remote.render(
            'srm-front-ssrc/priceComparison_RENDER_LADDER_QUOTATION',
            <LadderQuotationTab {...ladderQuotationProps} />,
            {
              bidFlag: this.sourceKey === BID,
              ...ladderQuotationProps,
            }
          )
        ) : (
          <LadderQuotationTab {...ladderQuotationProps} />
        )),
      this.renderCheckPriceApprovalTab(),
    ];

    const renderContent = () => {
      const { current } = this.baseInfoDs || {};

      // 头查询，判断完逻辑再渲染
      if (!current) {
        return '';
      }

      return (
        <Spin spinning={allDataLoading}>
          <Button.Group style={{ marginBottom: '16px', width: '100%' }}>
            {this.getButtonTabs({ diyLadderQuotationFlag }).map((item) => (
              <Button
                onClick={() => this.fetchData(item.value)}
                type={item.value === activityTab ? 'primary' : 'default'}
              >
                {item.meaning}
              </Button>
            ))}
            <div style={{ display: 'inline-block', float: 'right' }}>
              {activityTab === 'quotationDetail' && (
                // <Button
                //   loading={exportQuotationDetailLoading}
                //   disabled={
                //     isEmpty(quotationDetailData) ||
                //     quotationDetailData.every((i) => !i.childrenExist)
                //   }
                //   onClick={this.exportQuotationDetail}
                //   style={{ float: 'right' }}
                //   type="primary"
                // >
                //   {intl.get('hzero.common.button.export').d('导出')}
                // </Button>
                <DynamicButtons buttons={this.getQuotationDetailButtons()} />
              )}
            </div>
            {activityTab === 'latestQuotation' &&
              latestQuotationType === 'table' &&
              this.renderLatestQuotationExport({ exportLatestOfferLoading, latestQuotationList })}
            <div style={{ display: 'inline-block', float: 'right' }}>
              {activityTab === 'priceComparison' &&
                customizeBtnGroup(
                  {
                    code: `SSRC.${this.sourceKey}_HALL.PRICE_COMPARISON.TAB_COMPARISON.HEADER_BUTTONS`,
                    pro: true,
                  },
                  <DynamicButtons buttons={this.getButtons()} />
                )}
            </div>
            {remote
              ? remote.render('srm-front-ssrc/priceComparison_RENDER_TAB_BUTTONS', null, {
                  rfxId,
                  activityTab,
                  priceComparisonHeader,
                  bidFlag: this.sourceKey === BID,
                  thisQuoteProcessRef: this.thisQuoteProcessRef,
                  that: this,
                })
              : null}
          </Button.Group>
          {remote
            ? remote.process('srm-front-ssrc/priceComparison_PROCESS_MAIN_TAB_LIST', tabList, {
                rfxId,
                activityTab,
                location,
                priceComparisonHeader,
                bidFlag: this.sourceKey === BID,
                that: this,
              })
            : tabList}
        </Spin>
      );
    };

    return (
      <React.Fragment>
        {visible ? (
          <Modal
            destroyOnClose
            width="80%"
            zIndex={1000}
            footer={null}
            visible={visible}
            transitionName="move-right"
            wrapClassName="ant-modal-sidebar-right"
            title={intl.get(`ssrc.priceComparison.view.title.priceAssistant`).d('比价助手')}
            className={style['modal-body-wrapper']}
            onCancel={onHideModal}
            {...others}
          >
            {renderContent()}
          </Modal>
        ) : (
          renderContent()
        )}
      </React.Fragment>
    );
  }
}
const HOCComponent = withCustomize({
  unitCode: [
    'SSRC.INQUIRY_HALL.PRICE_COMPARISON.THIS_QUOTATION',
    'SSRC.INQUIRY_HALL.PRICE_COMPARISON.TAB_COMPARISON.HEADER_BUTTONS',
    'SSRC.INQUIRY_HALL.PRICE_COMPARISON.THIS_QUOTATION_TOTAL',
  ],
})(
  formatterCollections({
    code: ['ssrc.priceComparison', 'ssrc.common', 'ssrc.inquiryHall', 'scux.ssrc', 'sscux.ssrc'],
  })(
    connect(({ priceComparison, loading }) => ({
      priceComparison,
      fetchPriceItemLoading:
        loading.effects['priceComparison/fetchPriceComparisonItem'] ||
        loading.effects['priceComparison/fetchPriceComparisonSupplier'],
      savingConfigLoading: loading.effects['priceComparison/savePriceComparisonConfig'],
      fetchQuotationDetailLoading: loading.effects['priceComparison/fetchQuotationDetailSideMenu'],
      fetchQuotationDetailDataLoading: loading.effects['priceComparison/fetchQuotationDetailData'],
      exportQuotationDetailLoading: loading.effects['priceComparison/exportQuotationDetail'],
      fetchLatestLoading: loading.effects['priceComparison/fetchLatestQuotation'],
      fetchThisQuoteLoading: loading.effects['priceComparison/fetchThisQuoteProcessChart'],
      fetchThisQuoteTableLoading: loading.effects['priceComparison/fetchThisQuoteProcessTable'],
      fetchThisQuoteTotalLoading: loading.effects['priceComparison/fetchThisQuoteTotalTable'],
      fetchHistoryAnalysisLoading:
        loading.effects['priceComparison/fetchHistoryPriceAnalysisChart'],
      fetchHistoryAnalysisTableLoading:
        loading.effects['priceComparison/fetchHistoryPriceAnalysisTable'],
      exportLatestOfferLoading: loading.effects['priceComparison/exportLatestOffer'],
      exportPriceComparisonLoading: loading.effects['priceComparison/exportPriceComparison'],
      exportThisQuoteProcessLoading: loading.effects['priceComparison/exportThisQuoteProcess'],
    }))(
      withRouter(
        remoteHoc(
          {
            code: 'srm-front-ssrc/priceComparison', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
          },
          {
            events: {
              afterQuerySet() {},
              addEventListenerRemote() {},
              remoteOpenPriceComparison() {},
              fetchQuotationDetailContrast(props) {
                const { fetchQuotationDetailSideMenu = noop } = props;
                fetchQuotationDetailSideMenu();
              },
              getRemoteExport(props) {
                const { getExport = noop } = props || {};
                getExport();
              },
              setColumnSelected() {},
              setHisPriceChart() {},
              remoteInitLatestQuotationTab() {},
              fetchLatestQuotationRemoteAfter() {},
            },
          }
          // 默认Expose属性，当没有二开Expose时会走此逻辑
        )(PriceComparison)
      )
    )
  )
);

const hocPriceComparison = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.INQUIRY_HALL.PRICE_COMPARISON.THIS_QUOTATION',
      'SSRC.INQUIRY_HALL.PRICE_COMPARISON.TAB_COMPARISON.HEADER_BUTTONS',
      'SSRC.INQUIRY_HALL.PRICE_COMPARISON.THIS_QUOTATION_TOTAL',
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.priceComparison',
        'ssrc.common',
        'ssrc.inquiryHall',
        'scux.ssrc',
        'ssrc.biddingHall',
      ],
    })(
      connect(({ priceComparison, loading }) => ({
        priceComparison,
        fetchPriceItemLoading:
          loading.effects['priceComparison/fetchPriceComparisonItem'] ||
          loading.effects['priceComparison/fetchPriceComparisonSupplier'],
        savingConfigLoading: loading.effects['priceComparison/savePriceComparisonConfig'],
        fetchQuotationDetailLoading:
          loading.effects['priceComparison/fetchQuotationDetailSideMenu'],
        fetchQuotationDetailDataLoading:
          loading.effects['priceComparison/fetchQuotationDetailData'],
        exportQuotationDetailLoading: loading.effects['priceComparison/exportQuotationDetail'],
        fetchLatestLoading: loading.effects['priceComparison/fetchLatestQuotation'],
        fetchThisQuoteLoading: loading.effects['priceComparison/fetchThisQuoteProcessChart'],
        fetchThisQuoteTableLoading: loading.effects['priceComparison/fetchThisQuoteProcessTable'],
        fetchThisQuoteTotalLoading: loading.effects['priceComparison/fetchThisQuoteTotalTable'],
        fetchHistoryAnalysisLoading:
          loading.effects['priceComparison/fetchHistoryPriceAnalysisChart'],
        fetchHistoryAnalysisTableLoading:
          loading.effects['priceComparison/fetchHistoryPriceAnalysisTable'],
        exportLatestOfferLoading: loading.effects['priceComparison/exportLatestOffer'],
        exportPriceComparisonLoading: loading.effects['priceComparison/exportPriceComparison'],
      }))(
        withRouter(
          remoteHoc(
            {
              code: 'srm-front-ssrc/priceComparison', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
            },
            {
              events: {
                afterQuerySet() {},
                addEventListenerRemote() {},
                remoteOpenPriceComparison() {},
                fetchQuotationDetailContrast(props) {
                  const { fetchQuotationDetailSideMenu = noop } = props;
                  fetchQuotationDetailSideMenu();
                },
                getRemoteExport(props) {
                  const { getExport = noop } = props || {};
                  getExport();
                },
                setColumnSelected() {},
                setHisPriceChart() {},
                cuxHandleAfterFetchIsShowHistoryTabConfig() {},
                remoteInitLatestQuotationTab() {},
                fetchLatestQuotationRemoteAfter() {},
              },
            }
            // 默认Expose属性，当没有二开Expose时会走此逻辑
          )(NewComponent)
        )
      )
    )
  );
};

export default HOCComponent;
export { PriceComparison, HOCComponent as HOCPriceComparison, hocPriceComparison };
