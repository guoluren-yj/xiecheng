/**
 * 公用页面组件-多轮报价 全部报价明细，供应商报价，物品明细 tabs
 * @date: 2019-11-21
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Tabs, Button } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isFunction, compose, noop, isEmpty } from 'lodash';
import moment from 'moment';
import { connect } from 'dva';
import { runInAction, observable, toJS, isObservableObject } from 'mobx';
import { observer } from 'mobx-react';

import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { BID, getQuotationName } from '@/utils/globalVariable';
import { isText, filterCustomizeCodes, getPriceName, getNetPriceName } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { fetchNewQuotationConfigSheet } from '@/services/supplierQutationService';
import AllQuotation from './AllQuotation';
import SupplierQuotation from './SupplierQuotation';
import ItemLineList from './ItemLineList';
import ScoreDetailModal from './ScoreDetailModal';

import './index.less';

class RoundQuotationAllTable extends Component {
  constructor(props) {
    super(props);
    if (props.onRef && isFunction(props.onRef)) {
      props.onRef(this);
    }

    /**
     * allQuotation
     * ObservableMap<'allQuotation', { quotationAllList = [], quotationAllListPagination = {}, }>
     */
    this.allQuotationMap = observable.map({});

    /**
     * supplier
     * ObservableMap<'supplier', { quotationSupplierList = [], quotationSupplierListPagination = {}, quotationSupplierDetailPagination = {}, }>
     */
    this.supplierListMap = observable.map({});
    // this.supplierTableMap = observable.map();

    /**
     * item
     * ObservableMap<'item', { quotationItemList =[], quotationItemListPagination = {}, quotationItemDetailPagination = {}, }>
     */
    this.itemListMap = observable.map({});
    // this.itemTableMap = observable.map({});

    this.state = {
      tabActiveKey: 'all',
      allTabPriceType: 'AMOUNT', // AMOUNT | PRICE 全部报价tab价格显示类型
      collapseSupplierActiveKeys: [], // 供应商keys
      collapseItemLineActiveKeys: [], // 物品keys
      fetchItemRoundQuotationDetailLoading: {}, // 物料TAb的loading的集合
      fetchSupplierRoundQuotationDetailLoading: {}, // 供应商TAb的loading集合
      scoreDetailModalVisible: false, // 评分明细Modal
      doubleUnitFlag: false, // 判断是否开启双单位
      newQuotationFlag: false, // 新报价
    };

    this.bidFlag = props?.sourceKey === BID; // 招标标识
    this.quotationName = getQuotationName(this.bidFlag);

    this.fetchTimer = null;
  }

  pageCommonApiParams = {
    returnCompleteFlag: 1, // model层返回完整数据, 独立数据,但是为了减少影响
  };

  componentDidMount() {
    this.queryDoubleUnit();
    this.initData();
    this.newQuotationConfigSheet();
  }

  componentWillUnmount() {
    this.clearTimeoutTimer();
  }

  clearTimeoutTimer = () => {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }
  };

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  @Bind()
  initData() {
    this.fetchAll();
    this.fetchSupplier();
    this.fetchItemLine();
    this.setState({
      collapseSupplierActiveKeys: [], // 供应商keys
      collapseItemLineActiveKeys: [], // 物品keys
    });
  }

  @Bind()
  async fetchAll(page) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    const result = await dispatch({
      type: `${modelName}/fetchAllRoundQuotationList`,
      payload: {
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId || params.sourceHeaderId,
        organizationId,
        page,
        customizeUnitCode: this.getCustomizeUnitCode('allQuotationDetail'),
        ...(this.pageCommonApiParams || {}),
      },
    });

    const { quotationAllList = [], quotationAllListPagination = {} } = result || {};

    this.allQuotationMap.set('allQuotation', { quotationAllList, quotationAllListPagination });
  }

  @Bind()
  async fetchSupplier(page) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    const result = await dispatch({
      type: `${modelName}/fetchSupplierRoundQuotationList`,
      payload: {
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId || params.sourceHeaderId,
        organizationId,
        page,
        ...(this.pageCommonApiParams || {}),
      },
    });

    const { quotationSupplierList = [], quotationSupplierListPagination = {} } = result || {};
    this.supplierListMap.set('supplier', {
      quotationSupplierList,
      quotationSupplierListPagination,
    });
  }

  @Bind()
  async fetchItemLine(page) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    const result = await dispatch({
      type: `${modelName}/fetchItemLineRoundQuotationList`,
      payload: {
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId || params.sourceHeaderId,
        organizationId,
        page,
        ...(this.pageCommonApiParams || {}),
      },
    });

    const { quotationItemList = [], quotationItemListPagination = {} } = result || {};
    this.itemListMap.set('item', { quotationItemList, quotationItemListPagination });
  }

  @Bind()
  fetchItemRoundQuotationDetail(props) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    const { rfxLineItemId } = props;

    const { fetchItemRoundQuotationDetailLoading } = this.state;
    fetchItemRoundQuotationDetailLoading[rfxLineItemId] = true;
    this.setState({
      fetchItemRoundQuotationDetailLoading,
    });
    dispatch({
      type: `${modelName}/fetchItemRoundQuotationDetail`,
      payload: {
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId || params.sourceHeaderId,
        organizationId,
        customizeUnitCode: this.getCustomizeUnitCode('itemDetail'),
        ...(this.pageCommonApiParams || {}),
        ...props,
      },
    }).then((result) => {
      const newItemMap = this.getNewItemMap(result, { id: rfxLineItemId });
      this.itemListMap.set('item', newItemMap);
      fetchItemRoundQuotationDetailLoading[rfxLineItemId] = false;
      this.setState({
        fetchItemRoundQuotationDetailLoading,
      });
    });
  }

  // 重新整理itemMap数据结构
  getNewItemMap = (result, options = {}) => {
    const {
      roundQuotationItemList = [], // 多轮报价物料Tab物料信息
      roundQuotationItemListPagination = {},
    } = result || {};
    const { id } = options;
    const itemMap = this.itemListMap.get('item') || {};
    const { quotationItemList, quotationItemDetailPagination } = itemMap || {};

    if (isEmpty(quotationItemList) || !id) {
      return itemMap;
    }

    const newQuotationItemDetailPagination = quotationItemDetailPagination || {};

    const newList = quotationItemList.map((line) => {
      const { rfxLineItemId } = line || {};

      if (rfxLineItemId === id) {
        newQuotationItemDetailPagination[id] = roundQuotationItemListPagination;
        return {
          ...line,
          rfxQuotationLineDTO: roundQuotationItemList,
        };
      }

      return line;
    });

    return {
      ...itemMap,
      quotationItemList: newList,
      quotationItemDetailPagination: newQuotationItemDetailPagination,
    };
  };

  // 重新整理supplierMap数据结构
  getNewSupplierMap = (result, options = {}) => {
    const {
      roundQuotationSupplierList = [], // 多轮报价物料Tab物料信息
      roundQuotationSupplierListPagination = {},
    } = result || {};
    const { id } = options;
    const preSupplierMap = this.supplierListMap.get('supplier') || {};
    const { quotationSupplierList, quotationSupplierDetailPagination } = preSupplierMap || {};

    if (isEmpty(quotationSupplierList) || !id) {
      return preSupplierMap;
    }

    const newQuotationSupplierDetailPagination = quotationSupplierDetailPagination || {};

    const newList = quotationSupplierList.map((line) => {
      const { quotationHeaderId } = line || {};

      if (quotationHeaderId === id) {
        newQuotationSupplierDetailPagination[id] = roundQuotationSupplierListPagination;
        return {
          ...line,
          rfxQuotationLineDTO: roundQuotationSupplierList,
        };
      }

      return line;
    });

    return {
      ...preSupplierMap,
      quotationSupplierList: newList,
      quotationSupplierDetailPagination: newQuotationSupplierDetailPagination,
    };
  };

  @Bind()
  fetchSupplierRoundQuotationDetail(props = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'inquiryHall',
    } = this.props;
    const { quotationHeaderId } = props || {};
    const { fetchSupplierRoundQuotationDetailLoading } = this.state;

    if (!quotationHeaderId) {
      return;
    }

    fetchSupplierRoundQuotationDetailLoading[quotationHeaderId] = true;
    this.setState({
      fetchSupplierRoundQuotationDetailLoading,
    });

    dispatch({
      type: `${modelName}/fetchSupplierRoundQuotationDetail`,
      payload: {
        sourceFrom: 'RFX',
        sourceHeaderId: params.rfxId || params.sourceHeaderId,
        organizationId,
        customizeUnitCode: this.getCustomizeUnitCode('supplierDetail'),
        ...(this.pageCommonApiParams || {}),
        ...props,
      },
    }).then((result) => {
      const newSupplierMap = this.getNewSupplierMap(result, { id: quotationHeaderId });
      this.supplierListMap.set('supplier', newSupplierMap);
      fetchSupplierRoundQuotationDetailLoading[quotationHeaderId] = false;
      this.setState({
        fetchSupplierRoundQuotationDetailLoading,
      });
    });
  }

  // 查询当前单据 配置表 是否使用新报价
  async newQuotationConfigSheet() {
    const { organizationId, match } = this.props;
    const { rfxId: rfxHeaderId, sourceHeaderId } = match?.params || {};
    let newQuotationFlag = false;

    const param = {
      organizationId,
      rfxHeaderId: rfxHeaderId || sourceHeaderId,
    };

    let result = null;
    try {
      result = await fetchNewQuotationConfigSheet(param);
      result = getResponse(result);

      if (result === 1) {
        newQuotationFlag = true;
      }

      this.setState({ newQuotationFlag });
    } catch (e) {
      throw e;
    }

    return newQuotationFlag;
  }

  /**
   * 多轮报价个性化
   * @param {null | string | string[]} codeName - 个性化对应存储的name
   * @return null | string
   */
  @Bind()
  getCustomizeUnitCode(codeName) {
    if (!codeName || isEmpty(codeName)) return null;
    // 询价
    const roundQuotationCodeMap = new Map([
      ['headerTabs', 'SSRC.INQUIRY_HALL_ROUND_QUOTATION.TABS'],
      ['allQuotationDetail', 'SSRC.INQUIRY_HALL_ROUND_QUOTATION.ALL_QUOTATION_DETAIL'],
      ['supplierDetail', 'SSRC.INQUIRY_HALL_ROUND_QUOTATION.SUPPLIER_QUOTATION_DETAIL'],
      ['itemDetail', 'SSRC.INQUIRY_HALL_ROUND_QUOTATION.ITEMS_DETAIL'],
    ]);

    // 招标
    const bidRoundQuotationCodeMap = new Map([
      ['headerTabs', 'SSRC.BID_HALL_ROUND_QUOTATION.TABS'],
      ['allQuotationDetail', 'SSRC.BID_HALL_ROUND_QUOTATION.ALL_QUOTATION_DETAIL'],
      ['supplierDetail', 'SSRC.BID_HALL_ROUND_QUOTATION.SUPPLIER_QUOTATION_DETAIL'],
      ['itemDetail', 'SSRC.BID_HALL_ROUND_QUOTATION.ITEMS_DETAIL'],
    ]);
    return this.bidFlag
      ? filterCustomizeCodes(bidRoundQuotationCodeMap, codeName)
      : filterCustomizeCodes(roundQuotationCodeMap, codeName);
  }

  /**
   * 切换tabs
   *
   * @param {string} [key='']
   * @memberof RoundQuotationAllTable
   */
  @Bind()
  switchActiveTab(key = '') {
    this.setState({
      tabActiveKey: key,
    });
  }

  // /**
  //  * tabs 下打开所有折叠面板
  //  *
  //  * @param {string} [key='']
  //  * @memberof RoundQuotationAllTable
  //  */
  // @Bind()
  // allOpen(key = '') {
  //   const {
  //     inquiryHall: {
  //       quotationSupplierList = [], // 多轮报价供应商Tab列表信息
  //       quotationItemList = [], // 多轮报价物料Tab物料信息
  //     },
  //   } = this.props;

  //   if (key === 'supplier') {
  //     const ActiveKeys = [];
  //     quotationSupplierList.forEach((item) => {
  //       if (item) {
  //         ActiveKeys.push(item.rfxLineSupplierId.toString());
  //       }
  //     });

  //     this.setState({ collapseSupplierActiveKeys: ActiveKeys });
  //   }
  //   if (key === 'itemLine') {
  //     const ActiveKeys = [];
  //     quotationItemList.forEach((item) => {
  //       if (item) {
  //         ActiveKeys.push(item.rfxLineItemId.toString());
  //       }
  //     });

  //     this.setState({ collapseItemLineActiveKeys: ActiveKeys });
  //   }
  // }

  /**
   * tabs 下关闭所有折叠面板
   *
   * @param {string} [key='']
   * @memberof RoundQuotationAllTable
   */
  @Bind()
  allClose(key = '') {
    if (key === 'supplier') {
      this.setState({ collapseSupplierActiveKeys: [] });
    }
    if (key === 'itemLine') {
      this.setState({ collapseItemLineActiveKeys: [] });
    }
  }

  /**
   * 设置供应商下折叠面板keys
   *
   * @param {*} [key=[]]
   * @memberof RoundQuotationAllTable
   */
  @Bind()
  changeSupplierPanel(key = []) {
    this.setState({ collapseSupplierActiveKeys: key });
  }

  /**
   * 设置供物品下折叠面板keys
   *
   * @param {*} [key=[]]
   * @memberof RoundQuotationAllTable
   */
  @Bind()
  changeItemLinePanel(key = []) {
    this.setState({ collapseItemLineActiveKeys: key });
  }

  @Debounce(600)
  @Bind()
  changeAllTabPriceType() {
    const { allTabPriceType } = this.state;

    this.setState({
      allTabPriceType: allTabPriceType === 'AMOUNT' ? 'PRICE' : 'AMOUNT',
    });
  }

  /**
   * 额外的tabBar
   *
   * @returns
   * @memberof RoundQuotationAllTable
   */
  renderExtraTabBar() {
    const {
      tabActiveKey = '',
      allTabPriceType,
      collapseSupplierActiveKeys = [],
      collapseItemLineActiveKeys = [],
    } = this.state;

    if (tabActiveKey && tabActiveKey === 'all') {
      return (
        <Button onClick={this.changeAllTabPriceType}>
          {allTabPriceType === 'AMOUNT'
            ? intl.get('ssrc.inquiryHall.view.priceUnitToShow').d('按单价显示')
            : intl.get('ssrc.inquiryHall.view.quotationAmountToShow').d('按报价金额显示')}
        </Button>
      );
    }

    let keys = [];
    if (tabActiveKey === 'supplier') {
      keys = collapseSupplierActiveKeys;
    }
    if (tabActiveKey === 'itemLine') {
      keys = collapseItemLineActiveKeys;
    }

    return (
      <span>
        {!keys.length ? (
          ''
        ) : (
          <a onClick={() => this.allClose(tabActiveKey)}>
            {intl.get('ssrc.bidHall.view.tab.button.unAllCollapse').d('全部收起')}
          </a>
        )}
      </span>
    );
  }

  /**
   * 渲染未展示动态列
   *
   * @param {*} [columns=[]]
   * @returns
   * @memberof RoundQuotationAllTable
   */
  renderNewestRoundQuotationColumn(columns = []) {
    const { round = 1 } = this.props;
    const { allTabPriceType = 'AMOUNT' } = this.state;
    const columnsLen = columns.length || 1;
    if (round === columnsLen) {
      return columns;
    }

    const priceTypeMeaningTitle = this.getPriceTypeCodeMeaningTitle();
    const currentTitle =
      allTabPriceType === 'AMOUNT' ? (
        <span>
          {`${round} ${intl.get('ssrc.bidHall.model.bidHall.quotationAmntRound').d('轮报价金额')}`}
        </span>
      ) : (
        <span>
          {`${intl
            .get('ssrc.inquiryHall.view.theCurrentRoundPriceUnit', { num: round })
            .d('第{num}轮单价')} (${priceTypeMeaningTitle})`}
        </span>
      );

    const newestColumn = {
      title: (
        <span>
          {currentTitle}
          {/* {currencyCodeMeaning ? `(${currencyCodeMeaning})` : ''} */}
        </span>
      ),
      width: 200,
      align: 'right',
      dataIndex: 'action',
      render: (val) => (val !== null ? val : '-'),
    };

    columns.push(newestColumn);
    return columns;
  }

  /**
   *渲染动态列表头
   * @param {number} [num=1]
   * @returns
   * @memberof RoundQuotationAllTable
   */
  renderDynamicColumnsTitle(num = 1) {
    // const { currencyCodeMeaning = '' } = this.props;
    if (num === 1) {
      return (
        <span>
          {intl.get('ssrc.bidHall.model.bidHall.quotationAmntFirstRound').d('首轮报价金额')}
          {/* {currencyCodeMeaning ? `(${currencyCodeMeaning})` : ''} */}
        </span>
      );
    } else {
      return (
        <span>
          {num} {intl.get('ssrc.bidHall.model.bidHall.quotationAmntRound').d('轮报价金额')}
          {/* {currencyCodeMeaning ? `(${currencyCodeMeaning})` : ''} */}
        </span>
      );
    }
  }

  // 获取报价类型标题
  getPriceTypeCodeMeaningTitle() {
    const { header = {} } = this.props;
    const { priceTypeCode } = header || {};

    const priceTypeMeaningTitle =
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
        : intl.get('ssrc.bidHall.model.bidHall.excludingTax').d('不含税');
    return priceTypeMeaningTitle;
  }

  /**
   * 全部报价明细渲染动态列表头
   * @param {number} [num=1]
   */
  renderAllQuotationDynamicColumnsTitle(num = 1, item = {}) {
    const { header = {} } = this.props;
    const { allTabPriceType = 'AMOUNT' } = this.state;
    // const { currencyCodeMeaning } = header || {};
    let currentTitle = '';
    const priceTypeMeaningTitle = this.getPriceTypeCodeMeaningTitle();
    const quotationTaxFirstRoundStr = intl
      .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationTaxFirstRound`, {
        quotationName: this.quotationName,
      })
      .d('首轮{quotationName}含税金额');
    const quotationUnitFirstRoundStr = intl
      .get('ssrc.inquiryHall.model.inquiryHall.commonQuotationUnitFirstRound', {
        quotationName: this.quotationName,
      })
      .d('首轮{quotationName}未税金额');
    const quotationTaxRoundStr = intl
      .get('ssrc.inquiryHall.model.inquiryHall.commonQuotationTaxRound', {
        quotationName: this.quotationName,
      })
      .d('轮{quotationName}含税金额');
    const quotationUnitRoundStr = intl
      .get('ssrc.inquiryHall.model.inquiryHall.commonQuotationUnitRound', {
        quotationName: this.quotationName,
      })
      .d('轮{quotationName}未税金额');

    if (num === 1) {
      if (allTabPriceType === 'AMOUNT') {
        // currentTitle = intl
        //   .get('ssrc.bidHall.model.bidHall.quotationAmntFirstRound')
        //   .d('首轮报价金额');
        currentTitle =
          item.roundQuotationRankRule === 'TAX_PRICE'
            ? quotationTaxFirstRoundStr
            : item.roundQuotationRankRule === 'UNIT_PRICE'
            ? quotationUnitFirstRoundStr
            : header.priceTypeCode === 'NET_PRICE'
            ? quotationUnitFirstRoundStr
            : quotationTaxFirstRoundStr;
      }

      if (allTabPriceType === 'PRICE') {
        currentTitle = `${intl
          .get('ssrc.inquiryHall.view.firstRoundUnitPrice')
          .d('首轮单价')} (${priceTypeMeaningTitle})`;
      }
    }

    if (num > 1) {
      if (allTabPriceType === 'AMOUNT') {
        // currentTitle = intl
        //   .get('ssrc.inquiryHall.view.title.theQuotationAmntRound', { num })
        //   .d('第{num}轮报价金额');
        const allRoundTitle =
          item.roundQuotationRankRule === 'TAX_PRICE'
            ? quotationTaxRoundStr
            : item.roundQuotationRankRule === 'UNIT_PRICE'
            ? quotationUnitRoundStr
            : header.priceTypeCode === 'NET_PRICE'
            ? quotationUnitRoundStr
            : quotationTaxRoundStr;
        currentTitle = `${num} ${allRoundTitle}`;
      }
      if (allTabPriceType === 'PRICE') {
        currentTitle = `${intl
          .get('ssrc.inquiryHall.view.theCurrentRoundPriceUnit', { num })
          .d('第{num}轮单价')} (${priceTypeMeaningTitle})`;
      }
    }

    return (
      <span>
        {currentTitle}
        {/* {currencyCodeMeaning ? `(${currencyCodeMeaning})` : ''} */}
      </span>
    );
  }

  /**
   * 组装报价轮次数组
   *
   * @returns
   * @memberof RoundQuotationAllTable
   */
  buildRoundArray() {
    const { round = 1 } = this.props;
    const rounds = [];
    for (let r = 1; r <= round; r++) {
      rounds.push(r);
    }
    return rounds;
  }

  /**
   * 重新组装每条记录的报价数据
   *
   * @param {*} [roundQuotations=[]]
   * @returns
   * @memberof RoundQuotationAllTable
   */
  builtRoundQuotation = (roundQuotations = []) => {
    const rounds = this.buildRoundArray();

    if (!roundQuotations.length) {
      const roundsQuotationData = [];
      rounds.forEach((num) => {
        const obj = {
          quotationRoundNumber: num,
          isQuotation: false,
          totalRoundQuotationPrice: null,
        };
        roundsQuotationData.push(obj);
      });

      return roundsQuotationData;
    }

    if (roundQuotations.length === rounds.length) {
      return roundQuotations;
    }

    rounds.forEach((num) => {
      const filterRoundQuotation = roundQuotations.filter(
        (item) => item && item.quotationRoundNumber === num
      );
      if (filterRoundQuotation.length) {
        return;
      }

      const obj = {
        quotationRoundNumber: num,
        isQuotation: false,
        totalRoundQuotationPrice: null,
        totalRoundNetPrice: null,
      };
      roundQuotations.push(obj);
    });

    roundQuotations.sort((a, b) => a.quotationRoundNumber - b.quotationRoundNumber);

    return roundQuotations;
  };

  /**
   * 渲染所有供应商动态表格列
   *
   * @param {*} [data=[]]
   */
  renderAllSupplierColumns(data = []) {
    const { header = {} } = this.props;
    const { allTabPriceType, doubleUnitFlag = false } = this.state;
    const { priceTypeCode } = header || {};

    const allRoundColumns = [];
    if (!Array.isArray(data) || !data.length) {
      return {
        allRoundColumns: [],
        allDataSource: [],
      };
    }

    const allDataSource = data.map((item) => {
      const obj = {};
      if (!item || !Array.isArray(item.roundQuotation) || !item.roundQuotation?.length) {
        return item;
      }

      const builtRoundQuotation = this.builtRoundQuotation(item.roundQuotation);

      builtRoundQuotation.forEach((quotationLine = {}) => {
        const {
          quotationRoundNumber,
          totalRoundPrice,
          quotationPrice,
          quotationSecondaryPrice,
          validNetPrice,
          validNetSecondaryPrice,
          totalRoundNetPrice,
        } = quotationLine || {};
        const currentRoundNumDataIndex = `all.quotationRoundNumber${quotationRoundNumber}`;

        let currentQuotationPriceValue = totalRoundPrice; // 后续看是否有话，取的含税金额

        if (allTabPriceType === 'PRICE') {
          if (doubleUnitFlag) {
            if (priceTypeCode === 'TAX_INCLUDED_PRICE') {
              currentQuotationPriceValue = quotationSecondaryPrice;
            }
            if (priceTypeCode === 'NET_PRICE') {
              currentQuotationPriceValue = validNetSecondaryPrice;
            }
          } else {
            if (priceTypeCode === 'TAX_INCLUDED_PRICE') {
              currentQuotationPriceValue = quotationPrice;
            }
            if (priceTypeCode === 'NET_PRICE') {
              currentQuotationPriceValue = validNetPrice;
            }
          }
        } else {
          currentQuotationPriceValue =
            item.roundQuotationRankRule === 'TAX_PRICE'
              ? totalRoundPrice
              : item.roundQuotationRankRule === 'UNIT_PRICE'
              ? totalRoundNetPrice
              : priceTypeCode === 'NET_PRICE'
              ? totalRoundNetPrice
              : totalRoundPrice;
        }

        const currentQuotationRoundNumber = quotationRoundNumber;
        obj[currentRoundNumDataIndex] = currentQuotationPriceValue;

        const allObj = {
          width: 200,
          align: 'right',
        };

        const isExisted = allRoundColumns.filter(
          (columnsItem) => columnsItem.dataIndex === currentRoundNumDataIndex
        );
        if (!isExisted.length) {
          allObj.curRoundNumber = currentQuotationRoundNumber;
          allObj.title = this.renderAllQuotationDynamicColumnsTitle(
            currentQuotationRoundNumber,
            item
          );
          allObj.dataIndex = currentRoundNumDataIndex;
          allObj.render = (val) => (val || val === 0 ? numberSeparatorRender(val) : '-');
          allRoundColumns.push(allObj);
        }
      });

      return {
        ...item,
        ...obj,
      };
    });

    return {
      allRoundColumns: this.renderNewestRoundQuotationColumn(allRoundColumns),
      allDataSource,
    };
  }

  /**
   *渲染供应商动态列表头
   * @param {number} [num=1]
   * @returns
   * @memberof RoundQuotationAllTable
   */
  renderSupplierDynamicColumnsTitle(num = 1, item) {
    const { header = {} } = this.props;
    const quotationTaxFirstRoundStr = intl
      .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationTaxFirstRound`, {
        quotationName: this.quotationName,
      })
      .d('首轮{quotationName}含税金额');
    const quotationUnitFirstRoundStr = intl
      .get('ssrc.inquiryHall.model.inquiryHall.commonQuotationUnitFirstRound', {
        quotationName: this.quotationName,
      })
      .d('首轮{quotationName}未税金额');
    const quotationTaxRoundStr = intl
      .get('ssrc.inquiryHall.model.inquiryHall.commonQuotationTaxRound', {
        quotationName: this.quotationName,
      })
      .d('轮{quotationName}含税金额');
    const quotationUnitRoundStr = intl
      .get('ssrc.inquiryHall.model.inquiryHall.commonQuotationUnitRound', {
        quotationName: this.quotationName,
      })
      .d('轮{quotationName}未税金额');
    if (num === 1) {
      return (
        <span>
          {item.roundQuotationRankRule === 'TAX_PRICE'
            ? quotationTaxFirstRoundStr
            : item.roundQuotationRankRule === 'UNIT_PRICE'
            ? quotationUnitFirstRoundStr
            : header.priceTypeCode === 'NET_PRICE'
            ? quotationUnitFirstRoundStr
            : quotationTaxFirstRoundStr}
          {/* {currencyCodeMeaning ? `(${currencyCodeMeaning})` : ''} */}
        </span>
      );
    } else {
      return (
        <span>
          {num}{' '}
          {item.roundQuotationRankRule === 'TAX_PRICE'
            ? quotationTaxRoundStr
            : item.roundQuotationRankRule === 'UNIT_PRICE'
            ? quotationUnitRoundStr
            : header.priceTypeCode === 'NET_PRICE'
            ? quotationUnitRoundStr
            : quotationTaxRoundStr}
          {/* {currencyCodeMeaning ? `(${currencyCodeMeaning})` : ''} */}
        </span>
      );
    }
  }

  /**
   * 供应商表格列
   *
   * @param {*} [data=[]]
   * @returns
   * @memberof RoundQuotationAllTable
   */
  renderSupplierColumns(data = []) {
    const supplierRoundColumns = [];
    const { header = {} } = this.props;
    if (!Array.isArray(data) || !data.length) {
      return {
        supplierRoundColumns: [],
        supplierDataSource: [],
      };
    }

    const supplierDataSource = data.map((item) => {
      const { rfxQuotationLineDTO } = item || {};
      const supplierDto =
        rfxQuotationLineDTO &&
        rfxQuotationLineDTO.map((supplier) => {
          const { roundQuotation = [] } = supplier || {};

          const obj = {};
          const builtRoundQuotation = this.builtRoundQuotation(roundQuotation);
          builtRoundQuotation.forEach((rq) => {
            obj[`supplier.quotationRoundNumber${rq.quotationRoundNumber}`] =
              item.roundQuotationRankRule === 'TAX_PRICE'
                ? rq.totalRoundPrice
                : item.roundQuotationRankRule === 'UNIT_PRICE'
                ? rq.totalRoundNetPrice
                : header.priceTypeCode === 'NET_PRICE'
                ? rq.totalRoundNetPrice
                : rq.totalRoundPrice;

            const supplierObj = {
              width: 150,
              align: 'right',
            };

            const isExisted = supplierRoundColumns.filter(
              (columnsItem) =>
                columnsItem.dataIndex === `supplier.quotationRoundNumber${rq.quotationRoundNumber}`
            );
            if (!isExisted.length) {
              supplierObj.title = this.renderSupplierDynamicColumnsTitle(
                rq.quotationRoundNumber,
                item
              );
              supplierObj.dataIndex = `supplier.quotationRoundNumber${rq.quotationRoundNumber}`;
              supplierObj.render = (val) => (val || val === 0 ? numberSeparatorRender(val) : '-');
              supplierRoundColumns.push(supplierObj);
            }
          });

          return {
            ...supplier,
            ...obj,
          };
        });

      return {
        ...item,
        rfxQuotationLineDTO: supplierDto,
      };
    });

    return {
      supplierRoundColumns: this.renderNewestRoundQuotationColumn(supplierRoundColumns),
      supplierDataSource,
    };
  }

  /**
   * 物品数据表格列
   *
   * @param {*} [data=[]]
   * @returns
   * @memberof RoundQuotationAllTable
   */
  renderItemLineColumns(data = []) {
    const itemLineRoundColumns = [];
    const { header = {} } = this.props;
    if (!Array.isArray(data) || !data.length) {
      return {
        itemLineRoundColumns: [],
        itemLineDataSource: [],
      };
    }

    const itemLineDataSource = data.map((item) => {
      const itemLineDto =
        item.rfxQuotationLineDTO &&
        item.rfxQuotationLineDTO.map((itemLine) => {
          const { roundQuotation = [] } = itemLine || {};

          const obj = {};
          const builtRoundQuotation = this.builtRoundQuotation(roundQuotation);
          builtRoundQuotation.forEach((rq) => {
            obj[`itemLine.quotationRoundNumber${rq.quotationRoundNumber}`] =
              item.roundQuotationRankRule === 'TAX_PRICE'
                ? rq.totalRoundPrice
                : item.roundQuotationRankRule === 'UNIT_PRICE'
                ? rq.totalRoundNetPrice
                : header.priceTypeCode === 'NET_PRICE'
                ? rq.totalRoundNetPrice
                : rq.totalRoundPrice;

            const supplierObj = {
              width: 150,
              align: 'right',
            };

            const isExisted = itemLineRoundColumns.filter(
              (columnsItem) =>
                columnsItem.dataIndex === `itemLine.quotationRoundNumber${rq.quotationRoundNumber}`
            );
            if (!isExisted.length) {
              supplierObj.title = this.renderSupplierDynamicColumnsTitle(
                rq.quotationRoundNumber,
                item
              );
              supplierObj.dataIndex = `itemLine.quotationRoundNumber${rq.quotationRoundNumber}`;
              supplierObj.render = (val) => (val || val === 0 ? numberSeparatorRender(val) : '-');
              itemLineRoundColumns.push(supplierObj);
            }
          });

          return {
            ...itemLine,
            ...obj,
          };
        });

      return {
        ...item,
        rfxQuotationLineDTO: itemLineDto,
      };
    });

    return {
      itemLineRoundColumns: this.renderNewestRoundQuotationColumn(itemLineRoundColumns),
      itemLineDataSource,
    };
  }

  /**
   * 查询标段行评分明细
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  @Bind()
  fetchScoreDetil(record = {}) {
    const { dispatch, organizationId, modelName = 'inquiryHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchScoreDetail`,
      payload: {
        organizationId,
        evaluateSummaryId: record.evaluateSummaryId,
      },
    });
  }

  /**
   * 比较报价截止时间和当前时间
   */
  enableRoundQuotationOperate = (date = '') => {
    let result = true;
    if (!date) {
      return result;
    }

    const formatRoundQuotation = moment(date).format(DEFAULT_DATETIME_FORMAT);
    const now = moment().format(DEFAULT_DATETIME_FORMAT);
    result = formatRoundQuotation < now;
    return result;
  };

  /**
   * 物品明细 - 改变分页
   */
  @Bind()
  async changeItemLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    await this.fetchItemLine(changedPagination);

    this.fetchTimer = setTimeout(this.fetchItemCollapseOpendTable, 200);
  }

  // collapse open item fetch
  fetchItemCollapseOpendTable = () => {
    const {
      inquiryHall: { quotationItemList },
    } = this.props;
    const { collapseItemLineActiveKeys } = this.state;

    if (isEmpty(quotationItemList)) {
      return;
    }

    quotationItemList.forEach((line) => {
      const { rfxLineItemId } = line || {};
      const unQueryTableFlag =
        !rfxLineItemId ||
        !collapseItemLineActiveKeys?.length ||
        !collapseItemLineActiveKeys.includes(rfxLineItemId);

      if (unQueryTableFlag) {
        return;
      }
      this.fetchItemRoundQuotationDetail({ rfxLineItemId });
    });
  };

  // collapse open supplier fetch
  fetchSupplierCollapseOpendTable = () => {
    const {
      inquiryHall: { quotationSupplierList },
    } = this.props;

    if (isEmpty(quotationSupplierList)) {
      return;
    }

    const { collapseSupplierActiveKeys } = this.state;

    runInAction(() => {
      quotationSupplierList.forEach((line) => {
        const { quotationHeaderId } = line || {};
        const unQueryTableFlag =
          !quotationHeaderId ||
          !collapseSupplierActiveKeys?.length ||
          !collapseSupplierActiveKeys.includes(quotationHeaderId);

        if (unQueryTableFlag) {
          return;
        }

        this.fetchSupplierRoundQuotationDetail({ quotationHeaderId });
      });
    });
  };

  /**
   * 供应商列表 - 改变分页
   */
  @Bind()
  async changeSupplierLinePagination(current = undefined, pageSize = undefined) {
    const changedPagination = {};
    changedPagination.current = current;
    changedPagination.pageSize = pageSize;
    await this.fetchSupplier(changedPagination);

    this.fetchTimer = setTimeout(this.fetchSupplierCollapseOpendTable, 200);
  }

  @Bind()
  viewScoreDetail(e, data) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
    this.setState({
      scoreDetailModalVisible: true,
    });

    this.fetchScoreDetil(data);
  }

  /**
   * 取消查看评分明细 close modal
   *
   * @memberof ConfirmCandidate
   */
  @Bind()
  cancelScoreDetailModal() {
    this.setState({
      scoreDetailModalVisible: false,
    });
  }

  // 物料明细组件 合众能源二开
  renderItemLineList(itemLineListProps) {
    return <ItemLineList {...itemLineListProps} />;
  }

  // 合众能源二开
  renderSupplierQuotation(supplierProps) {
    return <SupplierQuotation {...supplierProps} />;
  }

  // 合众能源二开
  renderAllQuotation(allProps) {
    return <AllQuotation {...allProps} />;
  }

  /**
   * 获取单价字段title
   * @param {*}  doubleUnitFlag - 双单位 header - 头信息
   */
  getUnitPriceTitle({ doubleUnitFlag, header = {} } = {}) {
    return header.roundQuotationRankRule === 'TAX_PRICE'
      ? getPriceName(doubleUnitFlag)
      : header.roundQuotationRankRule === 'UNIT_PRICE'
      ? getNetPriceName(doubleUnitFlag)
      : header.priceTypeCode === 'NET_PRICE'
      ? getNetPriceName(doubleUnitFlag)
      : getPriceName(doubleUnitFlag);
  }

  getSecPriceTitle = () => {
    const { header = {} } = this.props;
    const { priceTypeCode } = header || {};

    const secPriceTitle =
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? intl.get(`ssrc.common.model.common.taxPrice`).d('单价(含税)')
        : intl.get(`ssrc.common.model.common.netPrice`).d('单价(不含税)');
    return secPriceTitle;
  };

  /**
   * map to object
   * map ObservableMap<string, any>
   * tabName string
   * */
  transObservableMapToObject = ({ map, tabName = '' }) => {
    if (!isObservableObject || !tabName) {
      return {};
    }

    const obj = toJS(map.get(tabName));
    return obj || {};
  };

  render() {
    const {
      round = 1,
      currencyCodeMeaning = '',
      roundQuotationEndDate = '',
      inquiryHall: {
        // quotationAllList = [], // 多轮报价全部Tab报价明细
        // quotationAllListPagination = {},
        // quotationSupplierList = [], // 多轮报价供应商Tab列表信息
        // quotationSupplierListPagination = {},
        // quotationSupplierDetailPagination = {}, // 展开详情的分页
        // quotationItemList = [], // 多轮报价物料Tab物料信息
        // quotationItemListPagination = {},
        // quotationItemDetailPagination = {}, // 展开详情的分页
        scoreDetailList = {},
      },
      fetchAllLoading,
      fetchSupplierLoading,
      fetchItemLineLoading,
      fetchScoreDetailLoading,
      header = {},
      customizeTabPane = noop,
      customizeTable = noop,
      remoteFunc = null,
    } = this.props;
    const {
      doubleUnitFlag,
      collapseItemLineActiveKeys = [],
      collapseSupplierActiveKeys = [],
      scoreDetailModalVisible,
      fetchItemRoundQuotationDetailLoading,
      fetchSupplierRoundQuotationDetailLoading,
      newQuotationFlag,
    } = this.state;
    const enableRoundQuotationOperate = this.enableRoundQuotationOperate(roundQuotationEndDate);
    const currentRound = enableRoundQuotationOperate ? round : round === 1 ? round : round - 1;

    const {
      quotationAllList = [],
      quotationAllListPagination = {},
    } = this.transObservableMapToObject({ map: this.allQuotationMap, tabName: 'allQuotation' });
    const {
      quotationSupplierList = [],
      quotationSupplierListPagination = {},
      quotationSupplierDetailPagination = {},
    } = this.transObservableMapToObject({ map: this.supplierListMap, tabName: 'supplier' });
    const {
      quotationItemList = [],
      quotationItemListPagination = {},
      quotationItemDetailPagination = {},
    } = this.transObservableMapToObject({ map: this.itemListMap, tabName: 'item' });

    // all
    const { allRoundColumns = [], allDataSource = [] } = this.renderAllSupplierColumns(
      quotationAllList
    );
    const allProps = {
      round,
      doubleUnitFlag,
      currencyCodeMeaning,
      roundColumns: allRoundColumns,
      dataSource: allDataSource,
      quotationAllListPagination,
      fetchAllLoading,
      fetchAll: this.fetchAll,
      customizeTable,
      getCustomizeUnitCode: this.getCustomizeUnitCode,
    };

    // supplier
    const { supplierRoundColumns = [], supplierDataSource = [] } = this.renderSupplierColumns(
      quotationSupplierList
    );
    const supplierProps = {
      round,
      doubleUnitFlag,
      currencyCodeMeaning,
      currentRound,
      header,
      bidFlag: header.secondarySourceCategory === 'NEW_BID',
      enableRoundQuotationOperate,
      builtRoundQuotation: this.builtRoundQuotation,
      roundColumns: supplierRoundColumns,
      dataSource: supplierDataSource,
      collapseSupplierActiveKeys,
      changeSupplierPanel: this.changeSupplierPanel,
      quotationSupplierListPagination,
      quotationSupplierDetailPagination,
      onChangePagination: this.changeSupplierLinePagination,
      fetchSupplierRoundQuotationDetail: this.fetchSupplierRoundQuotationDetail,
      fetchSupplierRoundQuotationDetailLoading,
      fetchSupplierLoading,
      viewScoreDetail: this.viewScoreDetail,
      customizeTable,
      getCustomizeUnitCode: this.getCustomizeUnitCode,
      newQuotationFlag,
      getUnitPriceTitle: this.getUnitPriceTitle,
      getSecPriceTitle: this.getSecPriceTitle,
      remoteFunc,
    };

    // 评分明细Modal props
    const scoreDetailProps = {
      scoreDetailList,
      scoreDetailModalVisible,
      cancelScoreDetailModal: this.cancelScoreDetailModal,
      loading: fetchScoreDetailLoading,
    };

    // itemLine
    const { itemLineRoundColumns = [], itemLineDataSource } = this.renderItemLineColumns(
      quotationItemList || []
    );
    const itemLineListProps = {
      header,
      round,
      doubleUnitFlag,
      bidFlag: header.secondarySourceCategory === 'NEW_BID',
      currencyCodeMeaning,
      currentRound,
      enableRoundQuotationOperate,
      builtRoundQuotation: this.builtRoundQuotation,
      roundColumns: itemLineRoundColumns,
      dataSource: itemLineDataSource,
      collapseItemLineActiveKeys,
      changeItemLinePanel: this.changeItemLinePanel,
      quotationItemListPagination,
      quotationItemDetailPagination,
      onChangePagination: this.changeItemLinePagination,
      fetchItemRoundQuotationDetail: this.fetchItemRoundQuotationDetail,
      fetchItemRoundQuotationDetailLoading,
      fetchItemLineLoading,
      customizeTable,
      getCustomizeUnitCode: this.getCustomizeUnitCode,
      newQuotationFlag,
      getUnitPriceTitle: this.getUnitPriceTitle,
      getSecPriceTitle: this.getSecPriceTitle,
    };

    return (
      <div className="ssrc-tab-panels">
        {customizeTabPane(
          { code: this.getCustomizeUnitCode('headerTabs') },
          <Tabs
            defaultActiveKey="all"
            animated={false}
            onChange={(key) => this.switchActiveTab(key)}
            tabBarExtraContent={this.renderExtraTabBar()}
          >
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidHall.view.message.tab.allSupplierQuot`).d('全部报价明细')}
              key="all"
            >
              {this.renderAllQuotation(allProps)}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidHall.view.message.tab.supplierQuotation`).d('供应商报价')}
              key="supplier"
            >
              {this.renderSupplierQuotation(supplierProps)}
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemLine`).d('物品明细')}
              key="itemLine"
            >
              {this.renderItemLineList(itemLineListProps)}
            </Tabs.TabPane>
          </Tabs>
        )}

        {scoreDetailModalVisible && <ScoreDetailModal {...scoreDetailProps} />}
      </div>
    );
  }
}

const HOCComponent = (Comp) =>
  compose(
    withCustomize({
      unitCode: ['SSRC.INQUIRY_HALL_ROUND_QUOTATION.TABS'],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'],
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      organizationId: getCurrentOrganizationId(),
      fetchAllLoading: loading.effects['inquiryHall/fetchAllRoundQuotationList'],
      fetchSupplierLoading: loading.effects['inquiryHall/fetchSupplierRoundQuotationList'],
      fetchItemLineLoading: loading.effects['inquiryHall/fetchItemLineRoundQuotationList'],
      fetchScoreDetailLoading: loading.effects['inquiryHall/fetchScoreDetail'],
    }))
  )(observer(Comp));

const HOCComponentDefault = (Comp) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.TABS',
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.ALL_QUOTATION_DETAIL',
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.SUPPLIER_QUOTATION_DETAIL',
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.ITEMS_DETAIL',
      ],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'],
    })
  )(observer(Comp));

export default HOCComponentDefault(RoundQuotationAllTable);

export { RoundQuotationAllTable, HOCComponent };
