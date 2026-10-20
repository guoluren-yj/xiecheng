/*
 * ReceiveTransactionASNDetails.js - 查看送货单事务明细
 * @date: 2019-01-04
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isInteger } from 'lodash';
import intl from 'utils/intl';
import { showBigNumber } from '../components/utils';

const commonModelPrompt = 'sinv.common.model.common';

/**
 * 查看送货单事务明细
 * @extends {Component} - React.Component
 * @reactProps {Function} handleFetchList - 查询列表信息
 * @reactProps {Function} handleClose - 关闭弹窗
 * @reactProps {Function} setTableDataSource - 设置表单数据
 * @reactProps {Function} onSourceTableChange - 分页改变回调
 * @return React.element
 */
export default class ReceiveTransactionASNDetails extends Component {
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
      this.handleFetchList();
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
   * 查询后设置表格数据和分页信息
   * @param {Object} { dataSource, pagination }
   */
  @Bind()
  setTableDataSource({ dataSource, pagination }) {
    this.setState({
      dataSource,
      pagination,
    });
  }

  /**
   * 分页查询插件
   * @param {Object} page
   */
  onSourceTableChange(page) {
    this.handleFetchList(page);
  }

  defaultTableRowKey = 'rcvTrxAsnDetailId';

  render() {
    const { visible, loading } = this.props;
    const { dataSource, pagination } = this.state;
    const tableProps = {
      pagination,
      columns: [
        {
          title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
          align: 'left',
          dataIndex: 'asnNum',
        },
        {
          title: intl.get(`sinv.common.model.common.displayDeliveryAsnLineNum`).d('送货单行号'),
          align: 'left',
          dataIndex: 'displayAsnLineNum',
        },
        {
          title: intl.get(`${commonModelPrompt}.trxQuantity`).d('事务数量'),
          dataIndex: 'quantity',
          align: 'left',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.remark`).d('备注'),
          align: 'left',
          dataIndex: 'remark',
        },
      ],
      dataSource,
      loading,
      bordered: true,
      rowKey: this.defaultTableRowKey,
      onChange: this.onSourceTableChange.bind(this),
    };

    return (
      <Modal
        title={intl.get(`sinv.common.view.title.receiveTransactionASNDetails`).d('事务送货单明细')}
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
