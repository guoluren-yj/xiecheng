import { connect } from 'dva';
import { uniqWith, isNil, } from 'lodash';
import React, { Component } from 'react';
import { Bind, Throttle } from 'lodash-decorators';
import { Tabs, Button, Form, Drawer } from 'hzero-ui';
import { TextArea, Form as C7nForm, DataSet } from 'choerodon-ui/pro';

import remoteHoc from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUserId, getEditTableData } from 'utils/utils';

import ItemLineList from './ItemLineList';
import QuoteLineTable from './QuoteLineTable';
import SupplierLineList from './SupplierLineList';

import style from './index.less';

const { TabPane } = Tabs;

@Form.create({ fieldNameProp: null })
@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  allLoading: loading.global,
  fetchItemLineLoading: loading.effects['inquiryHall/fetchEliItemDetail'],
  fetchSupplierLineLoading: loading.effects['inquiryHall/fetchElSupplierDetail'],
  fetchQuoteLineLoading: loading.effects['inquiryHall/fetchEliQuoteLine'],
  saveCheckPriceLoading: loading.effects['inquiryHall/saveCheckPrice'],
  eliminateLoading: loading.effects['inquiryHall/eliminateRfx'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
@remoteHoc(
  {
    code: 'SSRC_ELIMINATEINQUIRY',
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    events: {
      afterFetchItemTabLineTableCux() {}, // 查询物料tab下表格后二开埋点
      afterFetchSupplierTabLineTableCux() {},
      afterFetchQuotedTabLineTableCux() {},
      beforeFetchListCuxHandle() {},
      beforeChangeTabHandleRemote() {},
      remoteItemListPaginationChange(eventProps) {
        const { commonHandlePageinationChange = () => {} } = eventProps || {};
        commonHandlePageinationChange();
      },
      remoteSupplierListPaginationChange(eventProps) {
        const { commonHandlePageinationChange = () => {} } = eventProps || {};
        commonHandlePageinationChange();
      },
      remoteAllListPaginationChange(eventProps) {
        const { commonHandlePageinationChange = () => {} } = eventProps || {};
        commonHandlePageinationChange();
      },
      remoteItemTableListPaginationChange(eventProps) {
        const { commonHandlePageinationChange = () => {} } = eventProps || {};
        commonHandlePageinationChange();
      },
      remoteSupplierTableListPaginationChange(eventProps) {
        const { commonHandlePageinationChange = () => {} } = eventProps || {};
        commonHandlePageinationChange();
      },
    },
  },
)
@formatterCollections({
  code: [
    'ssrc.inquiryHall',
    'ssrc.common',
    'ssrc.expertScoring',
    'ssrc.bidHall',
    'ssrc.queryRfq',
    'ssrc.priceLibraryNew',
    'sscux.ssrc',
  ],
})
export default class historyOrderModal extends Component {
  constructor(props) {
    super(props);

    const { onRef = null } = this.props;
    if (onRef) {
      onRef(this);
    }

    this.state = {
      activeKey: 'itemLine',
      currentPaneActiveSelected: {}, // 当前页签下打开列表的表格选择行
      itemLineTableSelectedRows: [], // 物料行表格选择rows
      itemLineTableSelectedKeys: [], // 物料行表格选择kes
      collapseItemLineActiveKeys: [], // 当前选中key
      loadingItemObj: {},
      expandItem: {}, // 展开数据
      isShowItem: {}, // 数据是否查询显示
      supplierLineTableSelectedRows: [], // 供应商行表格选择rows
      supplierLineTableSelectedKeys: [], // 供应商行表格选择kes
      collapseSupplierActiveKeys: [], // 供应商keys
      loadingSupplierObj: {}, //
      expandSupplier: {},
      isShowSupplier: {}, // 数据是否查询显示
      allQuotationLineTableSelectedRows: [], // 全部报价行表格选择rows
      allQuotationLineTableSelectedKeys: [], // 全部报价行表格选择kes
      batchEditFlag: false, // 供应商批量编辑弹窗
    };

    this.cacheItemLineTableMap = new Map(); // 物品维度表格缓存选中数据
    this.cacheSupplierLineTableMap = new Map(); // 供应商行表格缓存选中数据
    this.cachedAllQuotationTableMap = new Map(); // 全部报价行数据表格缓存选中数据
  }

  componentDidMount() {
    this.initPage();
  }

  initPage = async () => {
    const { remote, bidFlag, header, } = this.props;

    let fetchListFlag = true;

    if (remote?.event) {
      const eventProps = {
        that: this,
        bidFlag,
        header,
      };

      fetchListFlag = await remote.event.fireEvent('beforeFetchListCuxHandle', eventProps);
    }

    if (fetchListFlag) {
      this.fetchList();
    }
  };

  fetchList = () => {
    this.fetchItemLine();
    this.fetchSupplierLine();
    this.fetchQuoteLine();
  }

  /**
   * 组件销毁，清空状态树中得值
   */
  componentWillUnmount() {
    this.clearDataCache();
  }

  clearDataCache = () => {
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        itemLineChange: false,
        supplierLineChange: false,
        allLineChange: false,
        eliItemDetail: [],
        eliItemDetailPagination: {},
        eliSupplierDetail: [],
        eliSupplierDetailPagination: {},
        eliItemLine: [], // 淘汰物料行
        eliItemLinePagination: {},
        collapseItemLineActiveKeys: [], // 当前激活的tab页
        collapseSupplierActiveKeys: [],
        eliSupplierLine: [], // 淘汰供应商行
        eliSupplierLinePagination: {},
        eliQuoteLine: [], // 淘汰全部报价行
        eliQuoteLinePagination: {},
      },
    });
  };

  /**
   * 物品明细 - 查询
   */
  @Bind()
  fetchItemLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      remote,
      bidFlag,
      header,
    } = this.props;
    const { expandItem = {}, isShowItem = {} } = this.state;

    dispatch({
      type: 'inquiryHall/fetchEliItemDetail',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId || params.sourceHeaderId,
        eliminateSelectFlag: 1,
      },
    }).then((res) => {
      if (res && res.content) {
        dispatch({
          type: 'inquiryHall/updateState',
          payload: {
            eliItemLine: [], // 淘汰物料行
            eliItemLinePagination: {},
          },
        });

        let openAllItem = true;

        openAllItem = remote ? remote.process(
          'SSRC_ELIMINATEINQUIRY_PROCESS_ITEM_OPEN_ALL_LINE',
          openAllItem,
          { bidFlag, header, }
        )
        : openAllItem;

        if (!openAllItem) {
          return;
        }

        const ActiveKeys = [];
        const dataSource = res.content || [];
        // 展开所有数据并查询
        dataSource.forEach((item) => {
          if (item) {
            ActiveKeys.push(item.rfxLineItemId.toString());
            this.fetchItemLineTableList({}, item.rfxLineItemId);
          }
        });
        this.setState({ collapseItemLineActiveKeys: ActiveKeys });
        const tempArr = [];
        const afterData = [];
        for (let i = 0; i < dataSource.length; i++) {
          afterData.push({
            [`${dataSource[i].rfxLineItemId}`]: true,
          });
          tempArr.push({
            [`${dataSource[i].rfxLineItemId}`]: !dataSource[i].rfxLineItemId,
          });
        }
        let newIsShowObj = {}; // 新建一个显示对象
        let newExpandObj = {}; // 新建一个展开对象
        afterData.forEach((item) => {
          newIsShowObj = { ...newIsShowObj, ...item }; // 先把自己扔进去
        });
        tempArr.forEach((item) => {
          newExpandObj = { ...newExpandObj, ...item }; // 先把自己扔进去
        });
        this.setState({
          expandItem: {
            ...expandItem,
            ...newExpandObj,
          },
          isShowItem: {
            ...isShowItem,
            ...newIsShowObj,
          },
        });
      }
    });
  }


// 数据 关联行id
relatedSupplierLineId(data, lineId) {
  let config = [];
  if (data) {
    config = data.map((item) => {
      return {
        ...item,
        rfxLineSupplierId: lineId,
      };
    });
  }
  return config;
}


  // 数据 关联行id
relatedLineId(data = [], lineId = null) {
  let config = [];
  if (data) {
    config = data.map((item) => {
      return {
        ...item,
        rfxLineItemId: lineId,
      };
    });
  }
  return config;
}

  dealDataState(data = []) {
    // 处理行 处理字段为update
    let config = [];
    if (Array.isArray(data) && data.length > 0) {
      config = data.map((item) => {
        return {
          ...item,
          _status: 'update',
        };
      });
    }
    return config;
  }

  /**
   * 获取表格数据
   * @param {*} page 分页信息
   * @param {*} rfxLineItemId 头id
   * @param {*} flag 是否是第一次点击头
   */
  @Bind()
  fetchItemLineTableList(page = {}, rfxLineItemId) {
    const {
      match: { params },
      dispatch,
      organizationId,
      inquiryHall: {
        eliItemLinePagination,
      },
      remote,
      bidFlag,
      header,
    } = this.props;
    const { itemLineTableSelectedKeys } = this.state;
    this.setState({
      loadingItemObj: {
        ...this.state?.loadingItemObj,
        [rfxLineItemId]: { fetchItemQuoteLineLoading: true },
      },
    });

    let defaultItemLineTableSelectedKeys = itemLineTableSelectedKeys || [];

    dispatch({
      type: 'inquiryHall/fetchEliminateItem',
      payload: {
        page,
        organizationId,
        rfxLineItemId,
        rfxHeaderId: params.rfxId || params.sourceHeaderId,
        eliminateSelectFlag: 1,
      },
    }).then((res) => {
      if (res) {
        const cacheItemLineData = this.cacheItemLineTableMap.get(rfxLineItemId) || [];
        defaultItemLineTableSelectedKeys = remote ? remote.process(
          'SSRC_ELIMINATEINQUIRY_PROCESS_ITEM_LINE_TABLE_DEFAULT_SELECTED_ROWKEYS',
          defaultItemLineTableSelectedKeys,
          { bidFlag, res, that: this, header, }
        ) : defaultItemLineTableSelectedKeys;


        if (res?.content?.length > 0 && defaultItemLineTableSelectedKeys.length > 0 && cacheItemLineData.length > 0) {
          const newLines = res.content.map(item => {
            if (itemLineTableSelectedKeys.includes(item.quotationLineId)) {
              return cacheItemLineData?.filter(selItem => selItem.quotationLineId === item.quotationLineId)?.[0];
            } else {
              return { ...item, _status: 'update' };
            }
          });
          dispatch({
            type: `inquiryHall/updateEliItemData`,
            payload: {
              eliItemLine: this.relatedLineId(this.dealDataState(newLines), rfxLineItemId),
              eliItemLinePagination,
            },
          });
        }

        this.setState({
          itemLineTableSelectedKeys: defaultItemLineTableSelectedKeys,
          loadingItemObj: {
            ...this.state?.loadingItemObj,
            [rfxLineItemId]: { fetchItemQuoteLineLoading: false },
          },
        });
      }
    });
  }

  /**
   * 供应商列表 - 查询
   */
  @Bind()
  fetchSupplierLine(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
      remote,
      bidFlag,
      header,
    } = this.props;
    const { expandSupplier = {}, isShowSupplier = {} } = this.state;
    dispatch({
      type: 'inquiryHall/fetchElSupplierDetail',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId || params.sourceHeaderId,
        eliminateSelectFlag: 1,
      },
    }).then((res) => {
      if (res && res.content) {
        let openAllSupplier = true;

        openAllSupplier = remote ? remote.process(
          'SSRC_ELIMINATEINQUIRY_PROCESS_SUPPLIER_OPEN_ALL_LINE',
          openAllSupplier,
          { bidFlag, header, }
        )
        : openAllSupplier;

        if (!openAllSupplier) {
          return;
        }

        const ActiveKeys = [];
        const dataSource = res.content || [];
        dataSource.forEach((item) => {
          if (item) {
            ActiveKeys.push(item.rfxLineSupplierId.toString());
            this.fetchSupplierLineTableList({}, item.rfxLineSupplierId);
          }
        });
        this.setState({ collapseSupplierActiveKeys: ActiveKeys });
        const tempArr = [];
        const afterData = [];
        for (let i = 0; i < dataSource.length; i++) {
          afterData.push({
            [`${dataSource[i].rfxLineSupplierId}`]: true,
          });
          tempArr.push({
            [`${dataSource[i].rfxLineSupplierId}`]: !dataSource[i].rfxLineSupplierId,
          });
        }
        let newIsShowObj = {}; // 新建一个显示对象
        let newExpandObj = {}; // 新建一个展开对象
        afterData.forEach((item) => {
          newIsShowObj = { ...newIsShowObj, ...item }; // 先把自己扔进去
        });
        tempArr.forEach((item) => {
          newExpandObj = { ...newExpandObj, ...item }; // 先把自己扔进去
        });
        this.setState({
          expandSupplier: {
            ...expandSupplier,
            ...newExpandObj,
          },
          isShowSupplier: {
            ...isShowSupplier,
            ...newIsShowObj,
          },
        });
      }
    });
  }

  /**
   * 获取表格数据
   */
  @Bind()
  fetchSupplierLineTableList(page = {}, rfxLineSupplierId) {
    const {
      match: { params },
      dispatch,
      organizationId,
      remote,
      bidFlag,
      header,
    } = this.props;
    const { supplierLineTableSelectedKeys, supplierLineTableSelectedRows } = this.state;

    let tableSelectedKeys = supplierLineTableSelectedKeys;
    const tableSelectedRows = supplierLineTableSelectedRows;

    this.setState({
      loadingSupplierObj: {
        ...this.state?.loadingSupplierObj,
        [rfxLineSupplierId]: { fetchItemQuoteLineLoading: true },
      },
    });
    dispatch({
      type: 'inquiryHall/fetchElSupplier',
      payload: {
        page,
        organizationId,
        rfxLineSupplierId,
        rfxHeaderId: params.rfxId || params.sourceHeaderId,
        eliminateSelectFlag: 1,
      },
    }).then((res) => {
      if (res) {

        tableSelectedKeys = remote ? remote.process(
          'SSRC_ELIMINATEINQUIRY_PROCESS_SUPPLIER_TAB_LINE_TABLE_DEFAULT_SELECTED_ROWKEYS',
          tableSelectedKeys,
          { bidFlag, res, that: this, header, }
        ) : tableSelectedKeys;

        const cacheSupplierLineData = this.cacheSupplierLineTableMap.get(rfxLineSupplierId) || [];

        if (res?.length > 0 && tableSelectedKeys.length > 0 && cacheSupplierLineData.length > 0) {
          const newLines = res.map(item => {
            if (tableSelectedKeys.includes(item.quotationLineId)) {
              tableSelectedKeys.splice(tableSelectedKeys.indexOf(item.quotationLineId), 1);
              tableSelectedKeys.push(item.quotationLineId);
              let sourceIndex;
              supplierLineTableSelectedRows.map((row, index) => {
                if(row.quotationLineId === item.quotationLineId){
                  sourceIndex = index;
                }
              });
              tableSelectedRows.splice(sourceIndex, 1);
              tableSelectedRows.push(item);
              return cacheSupplierLineData?.filter(selItem => selItem.quotationLineId === item.quotationLineId)?.[0];
            } else {
              return { ...item, _status: 'update' };
            }
          });
          dispatch({
            type: `inquiryHall/updateElSupplierData`,
            payload: {
              eliSupplierLine: this.relatedSupplierLineId(this.dealDataState(newLines), rfxLineSupplierId),
            },
          });
        }

        this.setState({
          loadingSupplierObj: {
            ...this.state?.loadingSupplierObj,
            [rfxLineSupplierId]: { fetchItemQuoteLineLoading: false },
          },
          supplierLineTableSelectedKeys: tableSelectedKeys,
          supplierLineTableSelectedRows: tableSelectedRows,
        });
      }
    });
  }

  /**
   * 获取表格数据
   */
  @Bind()
  clickCollapseSupplierChange(e, item) {
    const { expandSupplier, isShowSupplier } = this.state;
    if (!isShowSupplier[item.rfxLineSupplierId]) {
      // 打开新的 Pane
      this.fetchSupplierLineTableList({}, item.rfxLineSupplierId);
      this.setState({ rfxLineSupplierId: item.rfxLineSupplierId });
    }
    this.setState({
      expandSupplier: {
        ...expandSupplier,
        [item.rfxLineSupplierId]: !expandSupplier[item.rfxLineSupplierId],
      },
      isShowSupplier: {
        ...isShowSupplier,
        [item.rfxLineSupplierId]: true,
      },
    });
    this.changeCurrentPaneActiveSelected([], item.rfxLineSupplierId);
  }

  /**
   * 全部报价明细 - 查询
   */
  @Bind()
  fetchQuoteLine(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
      remote,
      bidFlag,
      header,
    } = this.props;
    const { allQuotationLineTableSelectedKeys } = this.state;

    let tableSelectedKeys = allQuotationLineTableSelectedKeys || [];

    dispatch({
      type: 'inquiryHall/fetchEliQuoteLine',
      payload: {
        page,
        organizationId,
        rfxHeaderId: params.rfxId || params.sourceHeaderId,
        eliminateSelectFlag: 1,
      },
    }).then(res => {

      tableSelectedKeys = remote ? remote.process(
        'SSRC_ELIMINATEINQUIRY_PROCESS_ALLQUOTED_TAB_LINE_TABLE_DEFAULT_SELECTED_ROWKEYS',
        tableSelectedKeys,
        { bidFlag, res, that: this, header, }
      ) : tableSelectedKeys;
      
      if (res?.content?.length > 0 && tableSelectedKeys?.length > 0 && this.cachedAllQuotationTableMap.size > 0) {
        const newLines = res.content.map(item => {
          if (tableSelectedKeys.includes(item.quotationLineId) && this.cachedAllQuotationTableMap.has(item.quotationLineId)) {
            return this.cachedAllQuotationTableMap.get(item.quotationLineId);
          } else {
            return { ...item, _status: 'update' };
          }
        });
        dispatch({
          type: `inquiryHall/updateState`,
          payload: {
            eliQuoteLine: newLines,
          },
        });
      }

      this.setState({
        allQuotationLineTableSelectedKeys: tableSelectedKeys,
      });
    });
  }

  // 打开行记录
  @Bind()
  changeCurrentPaneActiveSelected(rows = {}, id = null) {
    const { currentPaneActiveSelected = {} } = this.state;

    const data = {
      ...currentPaneActiveSelected,
      [id]: rows,
    };

    this.setState({
      currentPaneActiveSelected: data,
    });
  }

  /**
   * 供应商行表格行选择
   * */
  @Bind()
  changeSupplierLineTableSelection(keys = [], rows = []) {
    this.setState({
      supplierLineTableSelectedRows: rows,
      supplierLineTableSelectedKeys: keys,
    });
  }

  /**
   * 物料行表格行选择
   * */
  @Bind()
  changeItemLineTableSelection(keys = [], rows = []) {
    this.setState({
      itemLineTableSelectedRows: rows,
      itemLineTableSelectedKeys: keys,
    });
  }

  /**
   * 获取表格数据rfxLineItemId
   */
  @Bind()
  clickCollapseItemChange(e, item) {
    const { expandItem = {}, isShowItem = {} } = this.state;
    if (!isShowItem[item.rfxLineItemId]) {
      this.fetchItemLineTableList({}, item.rfxLineItemId);
      this.setState({ rfxLineItemId: item.rfxLineItemId });
    }

    this.setState({
      expandItem: {
        ...expandItem,
        [item.rfxLineItemId]: !expandItem[item.rfxLineItemId],
      },
      isShowItem: {
        ...isShowItem,
        [item.rfxLineItemId]: true,
      },
    });
    this.changeCurrentPaneActiveSelected([], item.rfxLineItemId);
  }

  /**
   * 当前激活的tab
   */
  @Bind()
  changeItemCollapse(activeKey = []) {
    this.setState({ collapseItemLineActiveKeys: activeKey });
  }

  /**
   * 当前激活的tab
   */
  @Bind()
  changeSupplierCollapse(activeKey = []) {
    this.setState({ collapseSupplierActiveKeys: activeKey });
  }

  /**
   * 物料行表格行选择
   * */
  @Bind()
  changeAllQuotationLineTableSelection(keys = [], rows = []) {
    this.setState({
      allQuotationLineTableSelectedRows: rows,
      allQuotationLineTableSelectedKeys: keys,
    });
  }

  /**
   *切换tab页
   */
  @Bind()
  changeTabs(key) {
    const {
      remote,
      bidFlag,
      header,
    } = this.props;

    if (remote?.event) {
      const eventProps = {
        that: this,
        bidFlag,
        header,
      };

      remote.event.fireEvent('beforeChangeTabHandleRemote', eventProps);
    }

    this.setSelectedCacheData();
    this.setState({ activeKey: key });
    if (key === 'itemLine') {
      this.fetchItemLine();
    }
    if (key === 'supplierLine') {
      this.fetchSupplierLine();
    }
    if (key === 'quoteLine') {
      this.fetchQuoteLine();
    }
  }

  // 切换tab前先缓存当前数据
  @Bind()
  setSelectedCacheData() {
    const {
      inquiryHall: {
        eliItemLine,
        eliSupplierLine,
      },
    } = this.props;
    const {
      itemLineTableSelectedKeys,
      supplierLineTableSelectedKeys,
      activeKey,
    } = this.state;
    if (activeKey === 'itemLine') {
      const rfxLineItemLineDataObj = {};
      (eliItemLine || []).forEach(item => {
        rfxLineItemLineDataObj[item.rfxLineItemId] = [
          item,
          ...(rfxLineItemLineDataObj[item.rfxLineItemId] || []),
        ];
      });
      Object.keys(rfxLineItemLineDataObj).forEach(key => {
        const currentItemData = rfxLineItemLineDataObj[key];
        this.setCacheDetailLineTableData({ key, pageData: currentItemData, selectKeys: itemLineTableSelectedKeys, cacheLineTableMap: this.cacheItemLineTableMap });
      });
    } else if (activeKey === 'supplierLine') {
      const rfxLineSupplierDataObj = {};
      (eliSupplierLine || []).forEach(item => {
        rfxLineSupplierDataObj[item.rfxLineSupplierId] = [
          item,
          ...(rfxLineSupplierDataObj[item.rfxLineSupplierId] || []),
        ];
      });
      Object.keys(rfxLineSupplierDataObj).forEach(key => {
        const currentSupplierData = rfxLineSupplierDataObj[key];
        this.setCacheDetailLineTableData({ key, pageData: currentSupplierData, selectKeys: supplierLineTableSelectedKeys, cacheLineTableMap: this.cacheSupplierLineTableMap });
      });
    } else if (activeKey === 'quoteLine') {
      this.setCacheAllQuoteLineTableData();
    }
  }

  // 缓存物品明细、供应商tab下详情数据
  @Bind()
  setCacheDetailLineTableData(payload={}) {
    const { key, pageData, selectKeys, cacheLineTableMap } = payload || {};
    const cacheDetailLineData = cacheLineTableMap.get(key) || [];

    const currentSelectLine = []; // 选中的变更数据
    const noModifiedSelectLine = []; // 选中的无变更数据
    (pageData || []).forEach(item => {
      if (selectKeys?.includes(item.quotationLineId)) {
        if (item?.$form?.isModifiedField('eliminateRemark')) { // 只有变更的时候才重新获取，否则不处理
          currentSelectLine.push(item);
        } else {
          noModifiedSelectLine.push(item);
        }
      } else if (cacheDetailLineData.some(cacheItem => cacheItem.quotationLineId === item.quotationLineId)) { // 若勾选又勾掉，则删除缓存
        cacheDetailLineData.splice(cacheDetailLineData.indexOf(item.quotationLineId), 1);
      }
    });


    let currentSelectLinesFormTable = [];
    if (currentSelectLine.length >0 ) {
      // 获取表格缓存数据
      currentSelectLinesFormTable = getEditTableData(currentSelectLine, ['_status']);
    }
    // 去重
    const uniqueCacheLines = uniqWith([...(currentSelectLinesFormTable || []), ...(cacheDetailLineData || []), ...(noModifiedSelectLine || [])], (arrVal, othVal) => arrVal.quotationLineId === othVal.quotationLineId);
    // 重新设置缓存数据
    cacheLineTableMap.set(key, uniqueCacheLines);
  }

  // 缓存全部报价明细tab数据
  @Bind()
  setCacheAllQuoteLineTableData() {
    const {
      inquiryHall: {
        eliQuoteLine,
      } = {},
    } = this.props;
    const { allQuotationLineTableSelectedKeys } = this.state;
    // 当前选中行
    const currentSelectLine = [];
    (eliQuoteLine || []).forEach(item => {
      if (allQuotationLineTableSelectedKeys?.includes(item.quotationLineId)) {
        currentSelectLine.push(item);
      } else if (this.cachedAllQuotationTableMap.has(item.quotationLineId)) { // 若勾选又勾掉，则删除缓存
        this.cachedAllQuotationTableMap.delete(item.quotationLineId);
      }
    });

    // 获取表格缓存数据
    const currentSelectLines = getEditTableData(currentSelectLine, ['_status']);
    // 将当前数据缓存
    (currentSelectLines || []).forEach(curLine => {
      this.cachedAllQuotationTableMap.set(curLine.quotationLineId, curLine);
    });
  }

  /**
   * 确认淘汰单据
   */
  @Bind()
  @Throttle(1000)
  eliminateRfx() {
    const {
      dispatch,
      match: { params = {} },
      organizationId,
      onUpdateData,
      remote,
      bidFlag,
      header,
    } = this.props;
    // const { currentPaneActiveSelected = [] } = this.state;
    // if (isEmpty(currentPaneActiveSelected)) {
    //   return {};
    // }

    this.setSelectedCacheData(); // 先缓存当前页面数据

    let newRows = [];
    // Object.keys(currentPaneActiveSelected).forEach((key) => {
    //   const currentRow = currentPaneActiveSelected[key] || [];
    //   newRows = [].concat(newRows, currentRow);
    // });
    this.cacheItemLineTableMap.forEach((item) => {
      newRows = [].concat(newRows, item);
    });
    this.cacheSupplierLineTableMap.forEach((item) => {
      newRows = [].concat(newRows, item);
    });
    this.cachedAllQuotationTableMap.forEach(item => {
      newRows = [].concat(newRows, item);
    });

    let data = {
      organizationId,
      rfxHeaderId: params.rfxId || params.sourceHeaderId,
      rfxQuotationLines: newRows,
    };

    data = remote ? remote.process(
      'SSRC_ELIMINATEINQUIRY_PROCESS_ELIMINATESUBMITDATA',
      data,
      { bidFlag, that: this, header, }
    )
    : data;

    if (data?.rfxQuotationLines?.length > 0) {
      dispatch({
        type: 'inquiryHall/eliminateRfx',
        payload: data,
      }).then((res) => {
        if (res) {
          onUpdateData();
        }
      });
    } else {
      notification.warning({
        message: intl
          .get('ssrc.priceLibraryNew.view.notification.chooseOne')
          .d('请至少勾选一条数据'),
      });
    }
  }

  /**
   * 根据核价方式获取当前的表格数据
   * @param {*} data 校验行数据
   * @param {*} checkWay 核价方式
   */
  @Bind()
  getCurrentEditTableData(data = []) {
    const editData = data && getEditTableData(data, [], { force: true });
    return editData;
  }

  /**
   * 全部报价明细 - 改变分页
   * @param {*} page 分页参数
   */
  @Bind()
  changeQuoteLinePagination(page) {
    const { remote, bidFlag, header } = this.props;

    const commonHandlePageinationChange = () => {
      this.setCacheAllQuoteLineTableData(); // 大翻页之前先缓存数据
      this.fetchQuoteLine(page);
    };

    const eventProps = {
      page,
      that: this,
      bidFlag,
      commonHandlePageinationChange,
      tabFlag: 1,
      tab: "quotateAll",
      fetchQuoteLine: this.fetchQuoteLine,
      header,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteAllListPaginationChange', eventProps);
    } else {
      commonHandlePageinationChange();
    }

    // this.setCacheAllQuoteLineTableData();
    // this.fetchQuoteLine(page);
  }

  itemListPaginationChange = (current, pageSize) => {
    const { remote, bidFlag, header, } = this.props;

    const commonHandlePageinationChange = () => {
      this.setSelectedCacheData(); // 大翻页之前先缓存数据
      this.fetchItemLine({ current, pageSize });
    };

    const eventProps = {
      current,
      pageSize,
      that: this,
      bidFlag,
      commonHandlePageinationChange,
      tabFlag: 1,
      tab: "item",
      fetchItemLine: this.fetchItemLine,
      header,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteItemListPaginationChange', eventProps);
    } else {
      commonHandlePageinationChange();
    }
    // this.setSelectedCacheData(); // 大翻页之前先缓存数据
    // this.fetchItemLine({ current, pageSize });
  }

  supplierListPaginationChange = (current, pageSize) => {
    const { remote, bidFlag, header } = this.props;

    const commonHandlePageinationChange = () => {
      this.setSelectedCacheData(); // 大翻页之前先缓存数据
      this.fetchSupplierLine({ current, pageSize });
    };

    const eventProps = {
      current,
      pageSize,
      that: this,
      bidFlag,
      commonHandlePageinationChange,
      fetchSupplierLine: this.fetchSupplierLine,
      tabFlag: 1,
      tab: "supplier",
      header,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteSupplierListPaginationChange', eventProps);
    } else {
      commonHandlePageinationChange();
    }

    // this.setSelectedCacheData(); // 大翻页之前先缓存数据
    // this.fetchSupplierLine({ current, pageSize });
  }

  @Bind()
  getSupplierOperations(){
    return <Button onClick={this.batchEditCheckData}>{intl.get('ssrc.inquiryHall.model.inquiryHall.batchCheckData').d('勾选批量编辑')}</Button>;
  }

  @Bind()
  batchEditCheckData(){
    const { supplierLineTableSelectedKeys = [] } = this.state;
    if(supplierLineTableSelectedKeys?.length){
      this.setState({
        batchEditFlag: true,
      });
    }else{
      notification.warning({
        message: intl
          .get('ssrc.inquiryHall.view.notification.batchCheckError')
          .d('请勾选要批量编辑的行'),
      });
    }
  }

  @Bind()
  cancelBatchEditCheckData(){
    this.setState({
      batchEditFlag: false,
    });
  }

  @Bind()
  async okBatchEditCheckData(formDs){
    const { supplierLineTableSelectedRows = [] } = this.state;
    if(await formDs.validate()){
      const eliminateRemark = formDs?.current?.get('eliminateRemark');

      if (!isNil(eliminateRemark)) {
        supplierLineTableSelectedRows.map(item=>{
          item.$form.setFieldsValue({ eliminateRemark });
        });
        this.cacheSupplierLineTableMap.forEach((value, key) => {
          const sourceEliSupplierLine = value.map(item => {
            item.eliminateRemark = eliminateRemark;
            return item;
          });
          this.cacheSupplierLineTableMap.set(key, sourceEliSupplierLine);
        });
      }
      this.setState({
        batchEditFlag: false,
      });
    }
  }

  @Bind()
  renderBatchEditBox(){
    const { batchEditFlag = false } = this.state;
    const formDS = ()=>({
      autoCreate: true,
      fields: [
        {
          name: 'eliminateRemark',
          // required: true,
          label: intl.get('ssrc.inquiryHall.model.inquiryHall.eliminateRemark').d('淘汰原因'),
        },
      ],
    });
    const formDs = new DataSet(formDS());
    return (
      <Drawer
        width="380"
        closable
        destroyOnClose
        onClose={this.cancelBatchEditCheckData}
        visible={batchEditFlag}
        style={{
          paddingBottom: '60px',
        }}
        title={intl.get('ssrc.inquiryHall.view.title.batchEdit').d('批量编辑')}
      >
        <C7nForm labelLayout='float' dataSet={formDs}>
          <TextArea name='eliminateRemark' resize="vertical" />
        </C7nForm>
        <div className={style['modal-footer-button-group-check-data']}>
          <Button
            key="submit"
            type="primary"
            onClick={() => this.okBatchEditCheckData(formDs)}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button key="back" onClick={this.cancelBatchEditCheckData} className={style['button-m-l-sm']}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </Drawer>
    );
  }

  render() {
    const {
      eliminateVisible = false,
      cancelEliminate,
      match: { params = {} },
      inquiryHall: {
        eliItemDetail = [],
        eliSupplierDetail = [],
        eliQuoteLine = [], // 淘汰全部报价行
        eliQuoteLinePagination = {},
      },
      fetchItemLineLoading = false,
      eliminateLoading = false,
      fetchQuoteLineLoading = false,
      priceTypeCode,
      doubleUnitFlag = false,
      remote,
      bidFlag,
      header,
    } = this.props;
    const {
      currentPaneActiveSelected = {},
      itemLineTableSelectedRows = [], // 物料行表格选择rows
      itemLineTableSelectedKeys = [], // 物料行表格选择kes
      supplierLineTableSelectedRows = [], // 供应商行表格选择rows
      supplierLineTableSelectedKeys = [], // 供应商行表格选择kes
      allQuotationLineTableSelectedRows = [], // 全部报价行表格选择rows
      allQuotationLineTableSelectedKeys = [], // 全部报价行表格选择kes
      collapseItemLineActiveKeys = [], // 物料tab页
      loadingItemObj,
      expandItem = {},
      isShowItem = {},
      collapseSupplierActiveKeys = [], // 供应商
      loadingSupplierObj,
      expandSupplier = {},
      isShowSupplier = {},
    } = this.state;

    const itemLineListProps = {
      remote,
      bidFlag,
      header,
      headerList: eliItemDetail,
      currentPaneActiveSelected,
      itemLineTableSelectedRows,
      itemLineTableSelectedKeys,
      collapseItemLineActiveKeys,
      expandItem,
      isShowItem,
      rfxHeaderId: params.rfxId || params.sourceHeaderId,
      onRef: (node) => {
        this.itemLineList = node;
      },
      loadingItemObj,
      loading: fetchItemLineLoading,
      onChangePagination: this.itemListPaginationChange,
      changeCurrentPaneActiveSelected: this.changeCurrentPaneActiveSelected,
      changeItemLineTableSelection: this.changeItemLineTableSelection,
      fetchItemLineTableList: this.fetchItemLineTableList,
      changeItemCollapse: this.changeItemCollapse,
      clickCollapseItemChange: this.clickCollapseItemChange,
      priceTypeCode,
      doubleUnitFlag,
      cacheItemLineTableMap: this.cacheItemLineTableMap,
      setCacheDetailLineTableData: this.setCacheDetailLineTableData,
    };
    const supplierLineListProps = {
      remote,
      header,
      bidFlag,
      headerList: eliSupplierDetail,
      currentPaneActiveSelected,
      supplierLineTableSelectedKeys,
      supplierLineTableSelectedRows,
      collapseSupplierActiveKeys,
      loadingSupplierObj,
      expandSupplier,
      isShowSupplier,
      rfxHeaderId: params.rfxId || params.sourceHeaderId,
      onChangePagination: this.supplierListPaginationChange,
      changeCurrentPaneActiveSelected: this.changeCurrentPaneActiveSelected,
      changeSupplierLineTableSelection: this.changeSupplierLineTableSelection,
      fetchSupplierLineTableList: this.fetchSupplierLineTableList,
      changeSupplierCollapse: this.changeSupplierCollapse,
      clickCollapseSupplierChange: this.clickCollapseSupplierChange,
      priceTypeCode,
      doubleUnitFlag,
      cacheSupplierLineTableMap: this.cacheSupplierLineTableMap,
      setCacheDetailLineTableData: this.setCacheDetailLineTableData,
    };
    const quoteLineTableProps = {
      loading: fetchQuoteLineLoading,
      dataSource: eliQuoteLine,
      pagination: eliQuoteLinePagination,
      changeQuoteLinePagination: this.changeQuoteLinePagination,
      allQuotationLineTableSelectedRows,
      allQuotationLineTableSelectedKeys,
      changeCurrentPaneActiveSelected: this.changeCurrentPaneActiveSelected,
      changeAllQuotationLineTableSelection: this.changeAllQuotationLineTableSelection,
      priceTypeCode,
      doubleUnitFlag,
      remote,
      bidFlag,
      header,
    };

    return (
      <Drawer
        width="68%"
        closable
        destroyOnClose
        onClose={cancelEliminate}
        visible={eliminateVisible}
        style={{
          paddingBottom: '60px',
        }}
        title={intl.get(`ssrc.bidHall.view.button.eliminate`).d('淘汰')}
      >
        <Tabs
          defaultActiveKey={this.state.activeKey}
          onChange={this.changeTabs}
          animated={false}
          className={style.tabStyle}
          tabBarExtraContent={this.state.activeKey === 'supplierLine' && this.getSupplierOperations()}
        >
          <TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.itemLineDimension`).d('物品维度')}
            key="itemLine"
          >
            <ItemLineList {...itemLineListProps} />
          </TabPane>
          <TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.supplierVendorList`).d('供应商维度')}
            key="supplierLine"
          >
            <SupplierLineList {...supplierLineListProps} />
          </TabPane>
          <TabPane
            tab={intl.get(`ssrc.inquiryHall.view.message.tab.allQuoteLine`).d('全部')}
            key="quoteLine"
          >
            <QuoteLineTable {...quoteLineTableProps} />
          </TabPane>
        </Tabs>
        <div className={style['modal-footer-button-group']}>
          <Button key="back" onClick={() => cancelEliminate()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            className={style['button-m-l-sm']}
            key="submit"
            type="primary"
            onClick={this.eliminateRfx}
            loading={eliminateLoading}
          >
            {intl.get('ssrc.bidHall.view.button.eliminate').d('淘汰')}
          </Button>
        </div>
        {this.renderBatchEditBox()}
      </Drawer>
    );
  }
}
