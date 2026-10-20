/*
 * 详情页面修改记录模态框
 * @date: 2018/08/08 14:07:49
 * @author: liu zhaohui <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
/**
 * index - 订单签署明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Header } from 'components/Page';
import intl from 'utils/intl';

export default class ChangedHistory extends PureComponent {
  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(fields) {
    const { dispatch, match = {} } = this.props;
    const { params } = match;
    dispatch({
      type: 'orderRelease/fetchChangedHistoryList',
      payload: { ...fields, poHeaderId: params.id },
    });
  }

  @Bind()
  handleChangedHistoryTableChange(pagination) {
    const { match = {} } = this.props;
    const { params } = match;
    this.handleSearch({
      page: pagination.current - 1,
      size: pagination.pageSize,
      poHeaderId: params.id,
    });
  }

  render() {
    const { loading = {}, hideModal, pagination, dataSource, visible } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.orderRelease.model.orderRelease.revisionNum`).d('版本号'),
        dataIndex: 'revisionNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.orderRelease.model.orderRelease.poLineNum`).d('行号'),
        dataIndex: 'poLineNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.orderRelease.model.orderRelease.poShipNum`).d('发运号'),
        dataIndex: 'poShipNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.orderRelease.model.orderRelease.operationCodeMeaning`).d('动作'),
        dataIndex: 'operationCodeMeaning',
        width: 80,
      },
      {
        title: intl.get(`sodr.orderRelease.model.orderRelease.changeContent`).d('修改内容'),
        dataIndex: 'changeContent',
        width: 80,
      },
      {
        title: intl.get(`sodr.orderRelease.model.orderRelease.oldValue`).d('修改前'),
        dataIndex: 'oldValue',
        width: 80,
      },
      {
        title: intl.get(`sodr.orderRelease.model.orderRelease.newValue`).d('修改后'),
        dataIndex: 'newValue',
        width: 80,
      },
    ];
    const modalProps = {
      visible,
      width: 820,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get('sodr.sendOrder.view.message.title.changeHistory').d('修改记录'),
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      rowKey: 'poChangeRecordId',
      onChange: this.handleChangedHistoryTableChange,
    };
    return (
      <Modal {...modalProps}>
        <Header>
          <Button type="primary" onClick={hideModal}>
            {intl.get('hzero.common.button.back').d('返回')}
          </Button>
        </Header>
        <Table {...tableProps} bordered />
      </Modal>
    );
  }
}
