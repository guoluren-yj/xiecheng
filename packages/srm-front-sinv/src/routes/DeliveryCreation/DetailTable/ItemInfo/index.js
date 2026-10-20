/**
 * index - 送货单创建 - 物料信息查询弹窗
 * @date: 2018-12-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { uniqBy, pullAll } from 'lodash';
import Search from './Search';
import List from './List';

export default class Creation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 数据源
      pagination: {}, // 分页
      selectedRows: [], // 选中的行
      loading: false, // 加载中
    };
    // 方法注册
    ['onListRowSelect', 'onListRowSelectAll', 'handleFetchList'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentDidMount 生命周期函数
   * 获取数据
   */
  componentDidMount() {
    const { onRef = (e) => e } = this.props;
    onRef(this);
    this.handleFetchList();
  }

  /**
   * handleFetchList - 查询列表行数据
   * @param {object} params - 查询条件
   */
  handleFetchList(params = {}) {
    const { fetchList = (e) => e } = this.props;
    this.setState({
      loading: true,
    });
    fetchList(params, ({ dataSource, pagination }) => {
      this.setState({
        dataSource,
        pagination,
        loading: false,
      });
    });
  }

  /**
   * onTableChange - 列表分页切换函数
   * @param {object} page - 分页数据
   */
  onTableChange(page = {}) {
    const { getFieldsValue = (e) => e } = this.search;
    this.handleFetchList({ page, ...getFieldsValue() });
  }

  /**
   * onListRowSelect - 列表单行选择函数
   * @param {object} record - 选中行数据
   * @param {object} selected - 行数据是否选中
   */
  onListRowSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    this.setState({
      selectedRows: selected
        ? uniqBy(selectedRows.concat(record), 'index')
        : selectedRows.filter((o) => o.index !== record.index),
    });
  }

  /**
   * onListRowSelect - 列表单全行选择函数
   * @param {object} changeRows - 变化的行数据
   * @param {object} selected - 行数据是否选中
   */
  onListRowSelectAll(selected, defaultSelectedRows, changeRows) {
    const { selectedRows = [] } = this.state;
    this.setState({
      selectedRows: selected
        ? uniqBy(selectedRows.concat(changeRows), 'index')
        : pullAll([...selectedRows], changeRows),
    });
  }

  render() {
    const { flagCode = [] } = this.props;
    const { dataSource = [], pagination = {}, selectedRows = [], loading } = this.state;
    const formProps = {
      ref: (node) => {
        this.search = node;
      },
      fetchList: this.handleFetchList,
      flagCode,
    };
    const listProps = {
      ref: (node) => {
        this.list = node;
      },
      loading,
      onChange: this.onTableChange.bind(this),
      pagination,
      dataSource,
      rowSelection: {
        selectedRowKeys: selectedRows.map((n) => n.index),
        onSelect: this.onListRowSelect,
        onSelectAll: this.onListRowSelectAll,
        onChange: this.handleOnListRowSelectChange,
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
