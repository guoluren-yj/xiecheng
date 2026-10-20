/**
 * OperationRecord - 操作记录页面
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import CPopover from './CPopover';

@Form.create({ fieldNameProp: null })
export default class OperationRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      match = {},
      organizationId,
      modelName = 'inquiryHall',
      rfxHeaderId,
    } = this.props;
    const rfxId = match?.params?.rfxId;
    // 操作记录数据
    dispatch({
      type: `${modelName}/operationRecord`,
      payload: {
        page,
        organizationId,
        rfxHeaderId: rfxId || rfxHeaderId,
      },
    });
  }

  render() {
    const { visible, hideModal, pagination, dataSource } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.action`).d('操作'),
        dataIndex: 'processOperationMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationDescription`).d('操作描述'),
        dataIndex: 'processRemark',
        width: 120,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operator`).d('操作人'),
        dataIndex: 'realName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationTime`).d('操作时间'),
        dataIndex: 'processDate',
        width: 150,
      },
    ];
    const modalProps = {
      visible,
      width: 600,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: intl.get(`ssrc.inquiryHall.view.message.title.record`).d('操作记录'),
    };
    const tableProps = {
      rowKey: (record, index) => index,
      columns,
      dataSource,
      pagination,
      onChange: (page) => this.handleSearch(page),
    };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} bordered />
      </Modal>
    );
  }
}
