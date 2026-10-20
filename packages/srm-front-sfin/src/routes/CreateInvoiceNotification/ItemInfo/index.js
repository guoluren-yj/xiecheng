/**
 * LineCreation - 扣款单列表
 * @date: 2019-02-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

// import { filterNullValueObject } from 'utils/utils';

import List from './List';
import Search from './Search';

@connect(({ bill }) => ({
  bill,
}))
export default class Creation extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedListRows: [], // 选中的行
    };
  }

  /**
   * componentDidMount 生命周期函数
   * 获取数据
   */
  componentDidMount() {
    this.fetchDetailModalList();
  }

  /**
   * fetchDetailModalList - 查询列表行数据
   * @param {object} page - 查询条件
   */
  @Bind()
  fetchDetailModalList() {
    const { fetchDetailList = e => e } = this.props;
    fetchDetailList();
  }

  /**
   * 选中行改变回调
   * @param {Array} selectedListRows
   * @param {Object} selectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedListRows: selectedRows });
  }

  render() {
    const {
      modalling,
      flagCode = [],
      fetchDetailList = e => e,
      modalDataSource = [],
      modalPagination = {},
    } = this.props;
    const { selectedListRows = [] } = this.state;
    const formProps = {
      ref: node => {
        this.search = node;
      },
      fetchDetailList,
      flagCode,
    };
    const listProps = {
      loading: modalling,
      pagination: modalPagination,
      dataSource: modalDataSource,
      ref: node => {
        this.list = node;
      },
      // selectedListRows,
      fetchDetailList,
      onChange: this.fetchDetailModalList,
      // handleRowSelectedChange:this.handleRowSelectedChange,
      rowSelection: {
        selectedRowKeys: selectedListRows.map(n => n.supplierDeductionsId),
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
