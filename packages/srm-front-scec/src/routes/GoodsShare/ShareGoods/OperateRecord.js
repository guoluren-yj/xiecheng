/**
 * OperateRecord -操作记录
 * @date: 2019-11-16
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { dateTimeRender } from 'utils/renderer';

const promptKey = 'scec.operateRecord.model.operateRecord';
/**
 * 使用操作记录
 * @extends {Component} - React.Component
 * @reactProps {?Object} productId - 产品ID
 * @reactProps {?boolean} modalVisible - 是否显影
 * @reactProps {?Function} onHandleOk - 点击确定按钮后的回调
 * @return React.element
 */
@formatterCollections({
  code: ['scec.operateRecord', 'scec.goodsApprove'],
})
@connect(({ operateRecord, loading }) => ({
  operateRecord,
  loading: loading.effects['operateRecord/fetchShareOperateRecord'],
}))
export default class index extends Component {
  componentDidMount() {
    const { productId } = this.props;
    if (!isUndefined(productId)) {
      this.fetchShareOperateRecord(productId);
    }
  }

  @Bind()
  fetchShareOperateRecord(params = {}) {
    const { dispatch, productId } = this.props;
    dispatch({
      type: 'operateRecord/fetchShareOperateRecord',
      payload: {
        page: isEmpty(params) ? {} : params,
        productId,
      },
    });
  }

  render() {
    const {
      operateRecord: { shareList = {}, pagination = {} },
      modalVisible,
      loading,
      onHandleOk,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptKey}.operator`).d('操作人'),
        dataIndex: 'userName',
        width: 150,
      },
      {
        title: intl.get(`${promptKey}.operateDate`).d('操作日期'),
        dataIndex: 'operatedDate',
        align: 'center',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptKey}.operate`).d('操作'),
        dataIndex: 'operationalMotion',
        width: 100,
      },
      {
        title: intl.get(`${promptKey}.remark`).d('备注'),
        dataIndex: 'operatedRemark',
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get(`${promptKey}.operatedRemark`).d('操作记录')}
        visible={modalVisible}
        onOk={onHandleOk}
        onCancel={onHandleOk}
        width={800}
      >
        <Table
          bordered
          loading={loading}
          rowKey="productHistoryId"
          dataSource={shareList.content}
          columns={columns}
          pagination={pagination}
          onChange={page => this.fetchShareOperateRecord(page)}
        />
      </Modal>
    );
  }
}
