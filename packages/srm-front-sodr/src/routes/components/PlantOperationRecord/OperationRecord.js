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
import { createPagination } from 'utils/utils';
import moment from 'moment';
import { dateRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

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
      type: `planSheetCommon/operationRecord`,
      payload: {
        page,
        planHeaderId: id,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          pagination: createPagination(res),
          dataSource: res.content || [],
        });
      }
    });
  }

  render() {
    const { visible, hideModal } = this.props;
    const { pagination, dataSource } = this.state;
    const columns = [
      {
        title: intl.get(`hzero.common.action`).d('操作'),
        dataIndex: 'processOperationMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationDescription`).d('操作描述'),
        dataIndex: 'processOperationMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operator`).d('操作人'),
        dataIndex: 'creator',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationTime`).d('操作时间'),
        dataIndex: 'processDate',
        width: 150,
        render: (text) => {
          const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
          const formatDom = dateRender(dom) || null;
          return <>{formatDom}</>;
        },
      },
    ];
    const modalProps = {
      visible,
      width: 600,
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
    };
    return (
      <Modal {...modalProps}>
        <Table {...tableProps} bordered />
      </Modal>
    );
  }
}
