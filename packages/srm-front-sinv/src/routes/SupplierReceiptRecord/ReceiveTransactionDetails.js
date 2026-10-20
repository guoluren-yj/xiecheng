/*
 * ReceiveTransactionDetails - 查看事务明细
 * @date: 2019-01-04
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { isInteger } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { showBigNumber } from '../components/utils';

const commonModelPrompt = 'sinv.common.model.common';

/**
 * 查看事务明细
 * @extends {Component} - React.Component
 * @reactProps {Function} handleFetchList - 查询列表信息
 * @reactProps {Function} handleClose - 关闭弹窗
 * @reactProps {Function} setTableDataSource - 设置表单数据
 * @reactProps {Function} onSourceTableChange - 分页改变回调
 * @return React.element
 */
export default class ReceiveTransactionDetails extends Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }

  state = {
    dataSource: [],
    pagination: {},
  };

  componentDidMount() {
    this.handleFetchList();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, rcvTrxLineId } = this.props;
    return visible && isInteger(Number(rcvTrxLineId)) && rcvTrxLineId !== prevProps.rcvTrxLineId;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleFetchList({ rcvTrxLineId: this.props.rcvTrxLineId });
    }
  }

  /**
   * 查询列表
   * @param {*} [page={}]
   */
  @Bind()
  handleFetchList(page = {}) {
    const { rcvTrxLineId } = this.props;
    const { fetchDataSource = (e) => e } = this.props;
    fetchDataSource({ page, rcvTrxLineId }).then((res) => {
      if (res) {
        this.setTableDataSource(res);
      }
    });
  }

  /**
   * 关闭弹窗
   */
  handleClose() {
    const { close = (e) => e } = this.props;
    this.setState({
      dataSource: [],
      pagination: {},
    });
    close();
  }

  /**
   * 设置表格数据
   * @param {Object} { dataSource, pagination }
   */
  setTableDataSource({ dataSource, pagination }) {
    this.setState({
      dataSource,
      pagination,
    });
  }

  /**
   * 分页改变回调
   * @param {Object} page
   */
  onSourceTableChange(page) {
    this.handleFetchList(page);
  }

  defaultTableRowKey = 'rcvTrxDetailId';

  render() {
    const { visible, loading } = this.props;
    const { dataSource, pagination } = this.state;
    const tableProps = {
      rowKey: this.defaultTableRowKey,
      columns: [
        {
          title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
          align: 'left',
          dataIndex: 'lotNum',
        },
        {
          title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
          align: 'left',
          dataIndex: 'serialNum',
        },
        {
          title: intl.get(`${commonModelPrompt}.amount`).d('数量'),
          dataIndex: 'srtdQuantity',
          align: 'left',
          render: (value) => showBigNumber(value),
        },
      ],
      pagination,
      dataSource,
      loading,
      bordered: true,
      onChange: this.onSourceTableChange.bind(this),
    };

    return (
      <Modal
        title={intl.get(`sinv.common.view.title.receiveTransactionDetails`).d('事务明细')}
        visible={visible}
        destroyOnClose
        onCancel={this.handleClose.bind(this)}
        width={700}
        footer={null}
      >
        <Table {...tableProps} />
      </Modal>
    );
  }
}
