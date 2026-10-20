/**
 * OperationRecord - 操作记录页面
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Form, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

import intl from 'utils/intl';

@formatterCollections({ code: ['ssrc.bidTask', 'ssrc.bidHall'] })
@Form.create({ fieldNameProp: null })
export default class OperationRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId, bidHeaderId } = this.props;
    // 操作记录数据
    dispatch({
      type: 'commonModel/operationRecord',
      payload: {
        page,
        organizationId,
        bidHeaderId,
      },
    });
  }

  render() {
    const { visible, hideModal, loading, pagination, dataSource } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'processOperationMeaning',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidHall.operationDescription`).d('操作描述'),
        dataIndex: 'processRemark',
        width: 80,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidHall.operator`).d('操作人'),
        dataIndex: 'processUserName',
        width: 80,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidHall.operationTime`).d('操作时间'),
        dataIndex: 'processDate',
        width: 120,
      },
    ];
    const modalProps = {
      visible,
      width: '60%',
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    };
    const tableProps = {
      rowKey: (record, index) => index,
      columns,
      dataSource,
      pagination,
      loading,
      onChange: page => this.handleSearch(page),
    };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} bordered />
      </Modal>
    );
  }
}
