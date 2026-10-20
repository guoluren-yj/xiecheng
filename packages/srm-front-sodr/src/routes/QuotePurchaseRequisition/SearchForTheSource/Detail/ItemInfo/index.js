/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { uniqBy, pullAll } from 'lodash';

import { filterNullValueObject } from 'utils/utils';

import List from './List';
import Search from './Search';

export default class Creation extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      dataSource: [], // 数据源
      pagination: {}, // 分页
      selectedListRows: [], // 选中的行
      loading: false, // 加载中
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
    this.handleFetchList();
  }

  /**
   * handleFetchList - 查询列表行数据
   * @param {object} page - 查询条件
   */
  handleFetchList(page = {}, otherParams = {}) {
    const { fetchDetailList = (e) => e, lineList } = this.props;
    const prLineIds = [];
    lineList.forEach((item) => {
      if (!item.uuidFlag && item.prLineId) {
        prLineIds.push(item.prLineId);
      }
    });
    this.setState({
      loading: true,
    });
    const filterValues = this.search ? filterNullValueObject(this.search.getFieldsValue()) : {};
    fetchDetailList(
      {
        page,
        prLineIds,
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

  render() {
    const { flagCode = [] } = this.props;
    const { dataSource = [], pagination = {}, selectedListRows = [], loading } = this.state;
    const formProps = {
      ref: (node) => {
        this.search = node;
      },
      fetchDetailList: this.handleFetchList,
      flagCode,
    };
    const listProps = {
      loading,
      pagination,
      dataSource,
      ref: (node) => {
        this.list = node;
      },
      fetchDetailList: this.handleFetchList,
      onChange: this.handleFetchList,
      rowSelection: {
        selectedRowKeys: selectedListRows.map((n) => n.prLineId),
        // onSelect: this.onListRowSelect,
        // onSelectAll: this.onListRowSelectAll,
        onChange: this.handleRowSelectedChange,
      },
    };

    return (
      <Fragment>
        <Search {...formProps} />
        <br />
        <List {...listProps} />
      </Fragment>
    );
  }
}
