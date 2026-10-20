/*
 * OperationRecord  - 操作记录通用组件
 * @date: 2019-05-13
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';
import { Modal, Table } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableScrollWidth, createPagination } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * ContractMaintainDetail - 操作记录通用组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [visible] - 显隐状态
 * @reactProps {Object} [pcHeaderId] - 头ID
 * @reactProps {Object} [onHandleCancel] - 弹窗取消回调
 *
 */
@connect(({ contractCommon = {}, loading = {} }) => ({
  contractCommon,
  loading: loading.effects['contractCommon/fetchOperationRecord'],
}))
@formatterCollections({
  code: ['sprm.purchaseRequisitionApproval', 'spfm.certificationApproval', 'spfm.notice'],
})
export default class OperationRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
    };
  }

  getSnapshotBeforeUpdate(preProps) {
    const { visible } = preProps;
    if (!visible && visible !== this.props.visible) {
      return true;
    }
    return false;
  }

  componentDidUpdate(props, state, snap) {
    if (snap) {
      this.fetchList();
    }
  }

  @Bind()
  fetchList(page = {}) {
    const { dispatch, pcHeaderId = '' } = this.props;
    dispatch({
      type: 'contractCommon/fetchOperationRecord',
      payload: {
        page,
        pcHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content || [],
          pagination: createPagination(res),
        });
      }
    });
  }

  render() {
    const { loading, visible, onHandleCancel, otherModalProps } = this.props;
    const { pagination, dataSource } = this.state;
    const columns = [
      {
        title: intl
          .get(`spfm.certificationApproval.model.operationRecord.processUserName`)
          .d('操作人'),
        dataIndex: 'processUserName',
        width: 140,
      },
      {
        title: intl
          .get(`spfm.certificationApproval.model.operationRecord.processDate`)
          .d('操作时间'),
        width: 150,
        dataIndex: 'processedDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`spfm.notice.model.actionDetail.processStatusMeaning`).d('动作'),
        dataIndex: 'processTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sprm.purchaseRequisitionApproval.model.common.handleRemark`).d('操作说明'),
        dataIndex: 'processRemark',
      },
    ];
    const modalProps = {
      visible,
      width: 650,
      footer: null,
      onCancel: onHandleCancel,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      ...otherModalProps,
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      scroll: { x: tableScrollWidth(columns) },
      rowKey: (record, index) => index,
      onChange: this.fetchList,
    };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} />
      </Modal>
    );
  }
}
