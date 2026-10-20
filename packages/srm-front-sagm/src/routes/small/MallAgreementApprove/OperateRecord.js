/**
 * OperateRecord -操作记录
 * @date: 2020-2-24
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { createPagination } from 'utils/utils';

@connect(({ mallAgreementApprove, loading }) => ({
  mallAgreementApprove,
  fetchOperateLoading: loading.effects['mallAgreementApprove/fetchOperate'],
}))
/**
 * 使用操作记录
 * @extends {Component} - React.Component
 * @return React.element
 */
export default class OperateRecord extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      operateVisible: false,
      operateRecord: [],
      operatePagination: {},
    };
  }

  /**
   * 操作记录modal
   */
  @Bind()
  handleOperatedModal() {
    this.setState(
      {
        operateVisible: true,
      },
      () => {
        this.fetchOperateRecord();
      }
    );
  }

  /**
   * 关闭操作记录
   */
  @Bind()
  handleCloseOperate() {
    this.setState({
      operateVisible: false,
    });
  }

  /**
   * 查询操作记录
   */
  @Bind()
  fetchOperateRecord(page = {}) {
    const { dispatch, agreementId } = this.props;
    dispatch({
      type: 'mallAgreementApprove/fetchOperate',
      payload: {
        page,
        agreementId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          operateRecord: res.content,
          operatePagination: createPagination(res),
        });
      }
    });
  }

  render() {
    const { operateVisible, operateRecord = [], operatePagination = {} } = this.state;
    const { fetchOperateLoading = false } = this.props;
    const columns = [
      {
        title: intl.get('entity.roles.operator').d('操作人'),
        dataIndex: 'realName',
        width: 150,
      },
      {
        title: intl.get('spfm.businessOrder.model.businessOrder.processDate').d('操作日期'),
        dataIndex: 'operatedTime',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.action`).d('操作'),
        dataIndex: 'operatedRemark',
        width: 100,
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get(`hzero.common.button.operating`).d('操作记录')}
        visible={operateVisible}
        footer={null}
        width={800}
        onCancel={this.handleCloseOperate}
      >
        <Table
          bordered
          loading={fetchOperateLoading}
          rowKey="productHistoryId"
          dataSource={operateRecord}
          columns={columns}
          pagination={operatePagination}
          onChange={(page) => this.fetchOperateRecord(page)}
        />
      </Modal>
    );
  }
}
