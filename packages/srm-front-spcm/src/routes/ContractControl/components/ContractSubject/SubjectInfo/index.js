/**
 * index - 新增标的
 * @date: 2020-2-05
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { uniqBy, pullAll } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { DataSet, Table } from 'choerodon-ui/pro';
import { filterNullValueObject } from 'utils/utils';

// import List from './List';
// import Search from './Search';
import LadderOfferModal from './ladderOfferModal';
import { QuotePurchaseDS, QuoteSourceDS } from './stores';

@connect(({ loading = {}, contractMaintain = {} }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  contractMaintain,
}))
export default class SubjectInfo extends Component {
  // 采购申请单据
  quotePurchaseDS = new DataSet({
    ...QuotePurchaseDS(),
    queryParameter: {
      pcHeaderId: this.props.pcHeaderId,
    },
  });

  // 寻源单据
  quoteSourceDS = new DataSet({
    ...QuoteSourceDS(),
  });

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
      this.quoteSourceDS.query();
    } else {
      this.quoteSourceDS.query();
    }
  }

  handleFetchQuateSourceList = (page = {}, otherParams = {}) => {
    const { fetchCreateList = (e) => e, lineList, supplierCompanyId, quoteSourceFlag } = this.props;
    const { resultId = '' } = lineList[0] || {};
    this.setState({
      loading: true,
    });
    const supplierCompanyIdN = quoteSourceFlag ? supplierCompanyId : null;
    const filterValues = this.search ? filterNullValueObject(this.search.getFieldsValue()) : {};
    fetchCreateList(
      {
        page,
        resultId,
        supplierCompanyId: supplierCompanyIdN,
        ...otherParams,
        ...filterValues,
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
    const { fetchCreateList = (e) => e, lineList, quoteSourceFlag, supplierCompanyId } = this.props;
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
    fetchCreateList(
      {
        page,
        resultId,
        prLineIds,
        ...obj,
        ...otherParams,
        ...filterValues,
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

  // 采购申请单据
  @Bind()
  createColumns() {
    const columns = [
      {
        width: 120,
        name: 'itemCode',
        lock: 'left',
      },
      {
        width: 120,
        name: 'itemName',
        fixed: 'left',
      },
      {
        name: 'prNum',
        width: 120,
      },
      {
        name: 'lineNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 120,
        renderer: ({ record }) => record.get('supplierCompanyName') || record.get('supplierName'),
      },
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'availableQuantity',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'taxIncludedUnitPrice',
        width: 180,
      },
      {
        name: 'neededDate',
        width: 120,
        // render: dateRender,
      },
      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'ouName',
        width: 120,
      },
      {
        name: 'purchaseOrgName',
        width: 120,
      },
      {
        name: 'invOrganizationName',
        width: 120,
      },
      {
        name: 'productNum',
        width: 120,
      },
      {
        name: 'productName',
        width: 120,
      },
      {
        name: 'catalogName',
        width: 120,
      },
    ];
    return columns;
  }

  render() {
    const {
      // quoteSourceFlag = false,
      loadingLadderOffer,
    } = this.props;
    const {
      // dataSource = [],
      // pagination = {},
      // selectedListRows = [],
      // loading,
      ladderOfferVisible,
      ladderOfferList,
      LadderLevelHeaderData,
    } = this.state;
    // const formProps = {
    //   ref: (node) => {
    //     this.search = node;
    //   },
    //   fetchDetailList: this.handleFetchList,
    // };
    // const selectedRowKeys = quoteSourceFlag
    //   ? selectedListRows.map((n) => n.resultId)
    //   : selectedListRows.map((n) => n.prLineId);
    // const listProps = {
    //   loading,
    //   quoteSourceFlag,
    //   pagination,
    //   dataSource,
    //   ref: (node) => {
    //     this.list = node;
    //   },
    //   fetchDetailList: this.handleFetchList,
    //   onChange: this.handleFetchList,
    //   rowSelection: {
    //     selectedRowKeys,
    //     onChange: this.handleRowSelectedChange,
    //   },
    //   showModal: this.ladderOfferVisible,
    // };

    const ladderOfferProps = {
      location,
      LadderLevelHeaderData,
      ladderOfferList,
      loadingLadderOffer,
      visible: ladderOfferVisible,
      hideModal: this.hideLadderOfferVisible,
      fetchLadderOffer: this.fetchLadderOffer,
      ladderOfferVisible: this.ladderOfferVisible,
    };

    return (
      <Fragment>
        {/* <Search {...formProps} />
        <br />
        <List {...listProps} /> */}
        <Table dataSet={this.quotePurchaseDS} columns={this.createColumns()} />
        {ladderOfferVisible && <LadderOfferModal {...ladderOfferProps} />}
      </Fragment>
    );
  }
}
