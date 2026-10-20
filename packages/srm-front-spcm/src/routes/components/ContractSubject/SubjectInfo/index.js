/**
 * index - 新增标的
 * @date: 2020-2-05
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { uniqBy, pullAll } from 'lodash';
import { connect } from 'dva';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { filterNullValueObject } from 'utils/utils';

import List from './List';
import Search from './Search';
import LadderOfferModal from './ladderOfferModal';

@withCustomize({
  unitCode: [
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.SOURCE',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.DEMAND',
  ],
})
@connect(({ loading = {}, contractMaintain = {} }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  contractMaintain,
}))
export default class SubjectInfo extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      dataSource: [], // 数据源
      pagination: {}, // 分页
      selectedListRows: [], // 选中的行
      loading: false, // 加载中
      ladderOfferList: [],
      ladderOfferVisible: false,
      LadderLevelHeaderData: {
        itemCode: '',
        itemName: '',
        quotationLineId: '',
        supplierCompanyName: '',
        quotationLineStatus: '',
      },
    };
    // 方法注册
    ['onListRowSelect', 'onListRowSelectAll', 'handleFetchList', 'handleRowSelectedChange'].forEach(
      (method) => {
        this[method] = this[method].bind(this);
      }
    );
  }

  /**
   * componentDidMount 生命周期函数
   * 获取数据
   */
  componentDidMount() {
    const { quoteSourceFlag = false } = this.props;
    if (quoteSourceFlag) {
      this.handleFetchQuateSourceList();
    } else {
      this.handleFetchList();
    }
  }

  handleFetchQuateSourceList = (page = {}, otherParams = {}) => {
    const { fetchCreateList = (e) => e, lineList, supplierCompanyId, quoteSourceFlag } = this.props;
    const { resultId = '' } = lineList[0] || {};
    this.setState({
      loading: true,
    });
    const obj = {};
    if (quoteSourceFlag && supplierCompanyId) {
      obj.supplierCompanyId = supplierCompanyId;
    }
    const filterValues = this.search ? filterNullValueObject(this.search.getFieldsValue()) : {};
    fetchCreateList(
      {
        page,
        resultId,
        ...obj,
        ...otherParams,
        ...filterValues,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.SOURCE',
      },
      ({ dataSource, pagination }) => {
        this.setState({
          pagination,
          dataSource,
          loading: false,
        });
      }
    );
  };

  /**
   * handleFetchList - 查询列表行数据
   * @param {object} page - 查询条件
   */
  handleFetchList(page = {}, otherParams = {}) {
    const { fetchCreateList = (e) => e, lineList, supplierCompanyId, quoteSourceFlag } = this.props;
    const { resultId = '' } = lineList[0] || {};
    const prLineIds = [];
    lineList.forEach((item) => {
      if (!item.uuidFlag && item.prLineId) {
        prLineIds.push(item.prLineId);
      }
    });
    this.setState({
      loading: true,
    });
    const obj = {};
    if (quoteSourceFlag && supplierCompanyId) {
      obj.supplierCompanyId = supplierCompanyId;
    }
    const filterValues = this.search ? filterNullValueObject(this.search.getFieldsValue()) : {};
    const customizeUnitCode = quoteSourceFlag
      ? 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.SOURCE'
      : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.DEMAND';
    fetchCreateList(
      {
        page,
        resultId,
        prLineIds,
        ...obj,
        ...otherParams,
        ...filterValues,
        customizeUnitCode,
      },
      ({ dataSource, pagination }) => {
        this.setState({
          pagination,
          dataSource,
          loading: false,
        });
      }
    );
  }

  /**
   * onListRowSelect - 列表单行选择函数
   * @param {object} record - 选中行数据
   * @param {object} selected - 行数据是否选中
   */
  onListRowSelect(record, selected) {
    const { selectedListRows = [] } = this.state;
    this.setState({
      selectedListRows: selected
        ? uniqBy(selectedListRows.concat(record), 'poLineLocationId')
        : selectedListRows.filter((o) => o.poLineLocationId !== record.poLineLocationId),
    });
  }

  /**
   * onListRowSelect - 列表单全行选择函数
   * @param {object} changeRows - 变化的行数据
   * @param {object} selected - 行数据是否选中
   */
  onListRowSelectAll(selected, defaultSelectedRows, changeRows) {
    const { selectedListRows = [] } = this.state;
    this.setState({
      selectedListRows: selected
        ? uniqBy(selectedListRows.concat(changeRows), 'poLineLocationId')
        : pullAll([...selectedListRows], changeRows),
    });
  }

  /**
   * 选中行改变回调
   * @param {Array} selectedListRows
   * @param {Object} selectedRows
   */
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedListRows: selectedRows });
  }

  /**
   * 阶梯报价可见
   */
  ladderOfferVisible = (record) => {
    const {
      itemCode,
      itemName,
      supplierCompanyName,
      quotationLineId,
      quotationLineStatus,
    } = record;
    this.setState({
      ladderOfferVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        quotationLineId,
        supplierCompanyName,
        quotationLineStatus,
      },
    });
  };

  /**
   * 阶梯报价可见
   */
  hideLadderOfferVisible = () => {
    this.setState({ ladderOfferVisible: false });
  };

  /**
   * 查询阶梯报价
   */
  fetchLadderOffer = () => {
    const { dispatch } = this.props;
    const {
      LadderLevelHeaderData: { quotationLineId = '' },
    } = this.state;
    dispatch({
      type: 'contractMaintain/fetchLadderOffer',
      payload: quotationLineId,
    }).then((res) => {
      if (res) {
        this.setState({ ladderOfferList: res.content });
      }
    });
  };

  render() {
    const {
      quoteSourceFlag = false,
      remote,
      loadingLadderOffer,
      doubleUnitEnabled,
      customizeTable,
    } = this.props;
    const {
      dataSource = [],
      pagination = {},
      selectedListRows = [],
      loading,
      ladderOfferVisible,
      ladderOfferList,
      LadderLevelHeaderData,
    } = this.state;
    const formProps = {
      ref: (node) => {
        this.search = node;
      },
      fetchDetailList: this.handleFetchList,
      quoteSourceFlag,
    };
    const selectedRowKeys = quoteSourceFlag
      ? selectedListRows.map((n) => n.resultId)
      : selectedListRows.map((n) => n.prLineId);
    const listProps = {
      loading,
      customizeTable,
      remote,
      quoteSourceFlag,
      pagination,
      dataSource,
      doubleUnitEnabled,
      ref: (node) => {
        this.list = node;
      },
      fetchDetailList: this.handleFetchList,
      onChange: this.handleFetchList,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowSelectedChange,
      },
      showModal: this.ladderOfferVisible,
    };

    const ladderOfferProps = {
      location,
      LadderLevelHeaderData,
      ladderOfferList,
      loadingLadderOffer,
      doubleUnitEnabled,
      visible: ladderOfferVisible,
      hideModal: this.hideLadderOfferVisible,
      fetchLadderOffer: this.fetchLadderOffer,
      ladderOfferVisible: this.ladderOfferVisible,
    };

    return (
      <Fragment>
        <Search {...formProps} />
        <br />
        <List {...listProps} />
        {ladderOfferVisible && <LadderOfferModal {...ladderOfferProps} />}
      </Fragment>
    );
  }
}
