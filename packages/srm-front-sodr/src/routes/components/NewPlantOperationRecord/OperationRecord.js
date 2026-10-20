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
import { createPagination, getResponse } from 'utils/utils';

import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class OperationRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pagination: {},
      dataSource: [],
    };
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
    const { dispatch, id } = this.props;
    dispatch({
      type: `scheduleSheetCommon/operationRecord`,
      payload: {
        page,
        planId: id,
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          pagination: createPagination(res),
          dataSource: res.content || [],
        });
      }
    });
  }

  render() {
    const { visible, hideModal, operationRecordLoading } = this.props;
    const { pagination, dataSource } = this.state;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.statusChangeRecord`).d('状态变更记录'),
        children: [
          {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operator`).d('操作人'),
            dataIndex: 'processUser',
            width: 150,
          },
          {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationTime`).d('操作时间'),
            dataIndex: 'processDate',
            width: 150,
          },
          {
            title: intl.get(`hzero.common.actions`).d('动作'),
            dataIndex: 'processStatusMeaning',
            width: 100,
          },
          {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.description`).d('说明'),
            dataIndex: 'processRemark',
            width: 120,
          },
        ],
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.dataChangeRecord`).d('数据变更记录'),
        children: [
          {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.changeFieldName`).d('修改内容'),
            dataIndex: 'changeFieldNameMeaning',
            width: 150,
          },
          {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.oldValue`).d('修改前'),
            dataIndex: 'oldValue',
            width: 150,
          },
          {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newValue`).d('修改后'),
            dataIndex: 'newValue',
            width: 100,
          },
        ],
      },
    ];
    const modalProps = {
      visible,
      width: 1000,
      footer: null,
      onCancel: () => hideModal(false),
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      title: intl.get(`ssrc.inquiryHall.view.message.title.record`).d('操作记录'),
    };
    const tableProps = {
      rowKey: (record, index) => index,
      columns,
      dataSource,
      pagination,
      onChange: (page) => this.handleSearch(page),
      loading: operationRecordLoading,
    };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} bordered />
      </Modal>
    );
  }
}
